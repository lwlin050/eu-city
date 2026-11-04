/**
 * 奧・捷・斯・匈旅遊城：後端（Google Apps Script）
 *
 * 設計重點
 *  1. 前端放 GitHub Pages；資料只存在「管理員的 Google 雲端硬碟」，使用者不會直接碰到檔案。
 *  2. 登入：瀏覽器用 Google 登入取得 ID Token → login 驗證 → 檢查白名單（Users 工作表）
 *     → 簽發自己的工作階段 Token（HMAC-SHA256，預設 7 天）。之後每次請求都重新檢查白名單，
 *     管理員停用某帳號後，下一次請求就會被拒絕。
 *  3. 每位使用者一個資料夾：state.json（評論、行程、遊戲進度）＋ ph_*（照片）。只能讀寫自己的。
 *  4. 共用資料（角色設定 roles）放在 shared.json：所有人可讀，只有管理員可寫。
 *  5. 只有 role=admin 能新增、修改、停用、刪除使用者；每個帳號只綁定一個身分（identity），
 *     且同一個身分同時只能給一個啟用中的帳號。
 *
 * 部署：執行身分「我」、存取權「任何人」（真正的存取控制在程式裡，不靠 Google 的部署設定）。
 */

const VERSION = 1;
const SESSION_HOURS = 24 * 7;
const SHEET_USERS = 'Users';
const HEAD = ['email', 'name', 'identity', 'role', 'status', 'sub', 'folderId', 'createdAt', 'lastLogin'];
const SHARED_KEYS = ['roles'];          // 只有管理員能寫
const KEY_RE = /^[^\u0000-\u001f]{1,100}$/;
const PHOTO_ID_RE = /^[a-f0-9]{16,64}$/;
const PHOTO_RE = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+\/=]+)$/;
const MAX_PHOTO_CHARS = 900000;          // 約 650 KB 的圖片
const MAX_STATE_CHARS = 6000000;         // 單一使用者的 state.json 上限

/* ---------- 一次性設定：在編輯器手動執行 setup() ---------- */
function setup() {
  const p = PropertiesService.getScriptProperties();
  if (!p.getProperty('CLIENT_ID')) {
    throw new Error('請先到「專案設定 → 指令碼屬性」新增 CLIENT_ID（Google OAuth 用戶端 ID），再執行 setup()');
  }
  const admin = Session.getEffectiveUser().getEmail().toLowerCase();
  if (!admin) throw new Error('取不到你的 Email，請確認已授權 userinfo.email');
  if (!p.getProperty('SESSION_SECRET')) p.setProperty('SESSION_SECRET', Utilities.getUuid() + Utilities.getUuid());
  if (!p.getProperty('DATA_FOLDER_ID')) {
    const f = DriveApp.createFolder('EuIslandData（請勿手動分享）');
    p.setProperty('DATA_FOLDER_ID', f.getId());
  }
  if (!p.getProperty('USERS_SHEET_ID')) {
    const ss = SpreadsheetApp.create('EuIsland Users（帳號白名單，請勿分享）');
    const sh = ss.getSheets()[0];
    sh.setName(SHEET_USERS);
    sh.appendRow(HEAD);
    sh.appendRow([admin, '管理員', 'MK', 'admin', 'active', '', '', new Date(), '']);
    p.setProperty('USERS_SHEET_ID', ss.getId());
  }
  Logger.log('設定完成。管理員：' + admin + '；白名單：' +
    SpreadsheetApp.openById(p.getProperty('USERS_SHEET_ID')).getUrl());
}

/** 讓所有已登入的工作階段立刻失效（例如懷疑 Token 外洩） */
function revokeAllSessions() {
  PropertiesService.getScriptProperties().setProperty('SESSION_SECRET', Utilities.getUuid() + Utilities.getUuid());
}

/* ---------- Web App 入口 ---------- */
function doGet() { return json_({ ok: true, v: VERSION, svc: 'euisland' }); }

function doPost(e) {
  let out;
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    out = route_(req);
  } catch (err) {
    out = { ok: false, err: 'server', msg: String(err && err.message || err) };
  }
  return json_(out);
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function route_(r) {
  if (r.a === 'login') return login_(r.idToken);
  const u = authTok_(r.tok);
  if (!u) return { ok: false, err: 'auth' };
  switch (r.a) {
    case 'me':       return { ok: true, me: pub_(u) };
    case 'pull':     return pull_(u);
    case 'push':     return withLock_(() => push_(u, r.items));
    case 'photoPut': return photoPut_(u, r.id, r.data);
    case 'photoGet': return photoGet_(u, r.id);
    case 'uList':    return admin_(u, () => ({ ok: true, users: readUsers_().map(adminView_) }));
    case 'uSave':    return admin_(u, () => withLock_(() => uSave_(u, r)));
    case 'uDel':     return admin_(u, () => withLock_(() => uDel_(u, r)));
    default:         return { ok: false, err: 'bad_action' };
  }
}

function admin_(u, fn) { return u.role === 'admin' ? fn() : { ok: false, err: 'forbidden' }; }

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

/* ---------- 登入與工作階段 ---------- */
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k); }

function login_(idToken) {
  if (!idToken || typeof idToken !== 'string') return { ok: false, err: 'bad_token' };
  const res = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
    { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return { ok: false, err: 'bad_token' };
  const t = JSON.parse(res.getContentText());
  const okIss = t.iss === 'accounts.google.com' || t.iss === 'https://accounts.google.com';
  if (t.aud !== prop_('CLIENT_ID') || !okIss || Number(t.exp) * 1000 < Date.now() ||
      String(t.email_verified) !== 'true' || !t.email) return { ok: false, err: 'bad_token' };
  const email = String(t.email).toLowerCase();
  return withLock_(() => {
    const u = readUsers_().find(x => x.email === email);
    if (!u || u.status !== 'active') return { ok: false, err: 'not_allowed', email: email };
    if (u.sub && u.sub !== t.sub) return { ok: false, err: 'sub_mismatch', email: email };
    const sh = usersSheet_();
    if (!u.sub) sh.getRange(u.row, 6).setValue(t.sub);
    sh.getRange(u.row, 9).setValue(new Date());
    const exp = Date.now() + SESSION_HOURS * 3600 * 1000;
    return { ok: true, tok: mkTok_(email, exp), exp: exp, me: pub_(u) };
  });
}

function sign_(s) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(s, prop_('SESSION_SECRET')));
}
function mkTok_(email, exp) {
  const b = Utilities.base64EncodeWebSafe(JSON.stringify({ e: email, x: exp }), Utilities.Charset.UTF_8);
  return b + '.' + sign_(b);
}
function authTok_(tok) {
  if (!tok || typeof tok !== 'string' || tok.indexOf('.') < 0) return null;
  const i = tok.lastIndexOf('.'), b = tok.slice(0, i), s = tok.slice(i + 1);
  if (sign_(b) !== s) return null;
  let p;
  try { p = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(b)).getDataAsString()); } catch (e) { return null; }
  if (!p || !p.e || p.x < Date.now()) return null;
  const u = readUsers_().find(x => x.email === p.e);
  return u && u.status === 'active' ? u : null;          // 每次都重查白名單：停用立即生效
}

/* ---------- 白名單（Users 工作表） ---------- */
function usersSheet_() {
  return SpreadsheetApp.openById(prop_('USERS_SHEET_ID')).getSheetByName(SHEET_USERS);
}
function readUsers_() {
  const v = usersSheet_().getDataRange().getValues(), out = [];
  for (let i = 1; i < v.length; i++) {
    const r = v[i];
    if (!r[0]) continue;
    out.push({
      row: i + 1, email: String(r[0]).trim().toLowerCase(), name: String(r[1] || ''),
      identity: String(r[2] || ''), role: String(r[3] || 'user') === 'admin' ? 'admin' : 'user',
      status: String(r[4] || 'active') === 'disabled' ? 'disabled' : 'active',
      sub: String(r[5] || ''), folderId: String(r[6] || ''), lastLogin: r[8] || ''
    });
  }
  return out;
}
function uid_(email) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email)
    .map(b => ('0' + (b & 255).toString(16)).slice(-2)).join('').slice(0, 12);
}
function pub_(u) { return { email: u.email, name: u.name, identity: u.identity, role: u.role, uid: uid_(u.email) }; }
function adminView_(u) {
  return { email: u.email, name: u.name, identity: u.identity, role: u.role, status: u.status,
    lastLogin: u.lastLogin ? String(u.lastLogin) : '', loggedIn: !!u.sub };
}

function uSave_(me, r) {
  const email = String(r.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return { ok: false, err: 'bad_email' };
  const identity = String(r.identity || '').trim();
  if (!identity || identity.length > 20 || /[\u0000-\u001f]/.test(identity)) return { ok: false, err: 'bad_identity' };
  const role = r.role === 'admin' ? 'admin' : 'user';
  const status = r.status === 'disabled' ? 'disabled' : 'active';
  const name = String(r.name || '').trim().slice(0, 40);
  const users = readUsers_(), cur = users.find(x => x.email === email);
  const next = users.filter(x => x.email !== email).concat([{ email: email, role: role, status: status, identity: identity }]);
  if (status === 'active' && next.some(x => x.email !== email && x.status === 'active' && x.identity === identity))
    return { ok: false, err: 'identity_taken' };
  if (!next.some(x => x.role === 'admin' && x.status === 'active')) return { ok: false, err: 'last_admin' };
  const sh = usersSheet_();
  if (cur) {
    sh.getRange(cur.row, 2, 1, 4).setValues([[name, identity, role, status]]);
  } else {
    sh.appendRow([email, name, identity, role, status, '', '', new Date(), '']);
  }
  return { ok: true, users: readUsers_().map(adminView_) };
}

function uDel_(me, r) {
  const email = String(r.email || '').trim().toLowerCase();
  if (email === me.email) return { ok: false, err: 'self' };
  const users = readUsers_(), cur = users.find(x => x.email === email);
  if (!cur) return { ok: false, err: 'not_found' };
  if (!users.some(x => x.email !== email && x.role === 'admin' && x.status === 'active')) return { ok: false, err: 'last_admin' };
  if (r.purge && cur.folderId) { try { DriveApp.getFolderById(cur.folderId).setTrashed(true); } catch (e) {} }
  usersSheet_().deleteRow(cur.row);
  return { ok: true, users: readUsers_().map(adminView_) };
}

/* ---------- 每位使用者的資料 ---------- */
function userFolder_(u) {
  if (u.folderId) { try { return DriveApp.getFolderById(u.folderId); } catch (e) {} }
  const f = DriveApp.getFolderById(prop_('DATA_FOLDER_ID')).createFolder('u_' + uid_(u.email));
  usersSheet_().getRange(u.row, 7).setValue(f.getId());
  u.folderId = f.getId();
  return f;
}
function readJson_(folder, name) {
  const it = folder.getFilesByName(name);
  if (!it.hasNext()) return {};
  try { return JSON.parse(it.next().getBlob().getDataAsString()) || {}; } catch (e) { return {}; }
}
function writeJson_(folder, name, obj) {
  const s = JSON.stringify(obj);
  if (s.length > MAX_STATE_CHARS) throw new Error('too_big');
  const it = folder.getFilesByName(name);
  if (it.hasNext()) it.next().setContent(s); else folder.createFile(name, s, 'application/json');
}
function sharedFolder_() { return DriveApp.getFolderById(prop_('DATA_FOLDER_ID')); }

function pull_(u) {
  return { ok: true, kv: readJson_(userFolder_(u), 'state.json'), shared: readJson_(sharedFolder_(), 'shared.json'), me: pub_(u) };
}

function push_(u, items) {
  if (!Array.isArray(items) || items.length > 300) return { ok: false, err: 'bad_items' };
  const folder = userFolder_(u);
  let st = null, sh = null, dirtySt = false, dirtySh = false, saved = 0;
  const newer = {};
  items.forEach(it => {
    if (!it || typeof it.k !== 'string' || !KEY_RE.test(it.k) || typeof it.ts !== 'number' || !('v' in it)) return;
    const shared = SHARED_KEYS.indexOf(it.k) >= 0;
    if (shared) {
      sh = sh || readJson_(sharedFolder_(), 'shared.json');
      if (u.role !== 'admin') { if (sh[it.k]) newer[it.k] = sh[it.k]; return; }
    } else { st = st || readJson_(folder, 'state.json'); }
    const target = shared ? sh : st, cur = target[it.k];
    if (cur && cur.ts > it.ts) { newer[it.k] = cur; return; }
    target[it.k] = { v: it.v, ts: it.ts };
    saved++;
    if (shared) dirtySh = true; else dirtySt = true;
  });
  try {
    if (dirtySt) writeJson_(folder, 'state.json', st);
    if (dirtySh) writeJson_(sharedFolder_(), 'shared.json', sh);
  } catch (e) { return { ok: false, err: String(e.message) === 'too_big' ? 'too_big' : 'server' }; }
  return { ok: true, saved: saved, newer: newer };
}

/* ---------- 照片 ---------- */
function photoPut_(u, id, data) {
  if (!PHOTO_ID_RE.test(String(id)) || typeof data !== 'string' || data.length > MAX_PHOTO_CHARS) return { ok: false, err: 'bad_photo' };
  const m = PHOTO_RE.exec(data);
  if (!m) return { ok: false, err: 'bad_photo' };
  const folder = userFolder_(u), name = 'ph_' + id;
  if (folder.getFilesByName(name).hasNext()) return { ok: true, dup: true };
  folder.createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], name));
  return { ok: true };
}
function photoGet_(u, id) {
  if (!PHOTO_ID_RE.test(String(id))) return { ok: false, err: 'bad_photo' };
  const it = userFolder_(u).getFilesByName('ph_' + id);
  if (!it.hasNext()) return { ok: false, err: 'not_found' };
  const b = it.next().getBlob();
  return { ok: true, data: 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes()) };
}
