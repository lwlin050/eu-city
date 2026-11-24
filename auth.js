/* 登入（Google）＋ 雲端同步（Apps Script → 管理員的 Google 雲端硬碟）
 * config.js 沒設定時整支不執行，app 維持單機模式。
 * 與 app.js 的接點：AUTH.ready / AUTH.pull() / AUTH.onPut(k,v) / AUTH.ns / AUTH.roles() / AUTH.admin
 */
(function () {
  'use strict';
  const C = window.CFG || {};
  if (!(C.AUTH && C.CLIENT_ID && C.API)) return;

  const A = window.AUTH = { on: true, me: null, admin: false, guest: false, ns: '', tok: null, ready: null, state: 'idle', last: 0 };
  const SK = 'eu_sess';
  const $ = s => document.querySelector(s);
  const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const jl = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const js = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  /* ---------- API ---------- */
  async function api(a, body, ms) {
    if (A.guest) return { ok: false, err: 'guest' };                 // 訪客不碰後端
    if (a !== 'login' && !A.tok) return { ok: false, err: 'auth' };   // 沒有憑證就不送出，也不觸發登出
    const tok0 = A.tok;
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const t = ctl && setTimeout(() => ctl.abort(), ms || 60000);
    try {
      // 不加自訂標頭 → 屬於「簡單請求」，不會觸發 CORS 預檢（Apps Script 不支援預檢）
      const r = await fetch(C.API, { method: 'POST', body: JSON.stringify(Object.assign({ a: a, tok: A.tok }, body || {})), signal: ctl ? ctl.signal : undefined });
      const x = await r.json();
      if (x && x.err === 'auth' && a !== 'login' && tok0 && A.tok === tok0) {
        A.why = a + (x.why ? '：' + x.why : '');
        try { console.warn('[auth] 伺服器拒絕憑證', a, x.why || ''); } catch (e) {}
        signOut(true, '登入已失效，請重新登入。（' + A.why + '）');
      }
      return x;
    } catch (e) { return { ok: false, err: 'net' }; } finally { if (t) clearTimeout(t); }
  }
  A.api = api;

  /* ---------- 登入閘門 ---------- */
  const gate = document.createElement('div');
  gate.className = 'ckm open'; gate.id = 'authgate'; gate.style.zIndex = 99;
  gate.innerHTML = '<div class="ckcard gcard" style="text-align:center"><h2 style="margin:4px 0 8px">奧・捷・斯・匈旅遊城</h2><p id="ag-m" style="margin:6px 0 12px">請用 Google 帳號登入</p><div id="ag-b" style="display:flex;justify-content:center;min-height:44px"></div><div id="ag-gw"><button class="gh" id="ag-g" style="margin-top:14px;flex:none">以訪客身分使用（不登入）</button><div class="ckm2" style="margin-top:6px">訪客的內容只存在這台裝置，不會同步，也看不到成員資料。</div></div></div>';
  document.body.appendChild(gate);
  const gw = $('#ag-gw');
  if (C.GUEST === false && gw) gw.style.display = 'none';
  else if ($('#ag-g')) $('#ag-g').onclick = () => enterGuest();
  const say = m => { $('#ag-m').textContent = m; };

  function loadGsi() {
    return new Promise((res, rej) => {
      if (window.google && google.accounts && google.accounts.id) return res();
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  function showGate(msg) {
    gate.classList.add('open');
    say(msg || '請用 Google 帳號登入');
    $('#ag-b').innerHTML = '';
    loadGsi().then(() => {
      google.accounts.id.initialize({ client_id: C.CLIENT_ID, callback: onCred, auto_select: false });
      google.accounts.id.renderButton($('#ag-b'), { theme: 'outline', size: 'large', shape: 'pill', locale: 'zh-TW', text: 'signin_with', width: 260 });
    }).catch(() => say('無法載入 Google 登入，請檢查網路，或關閉會擋 accounts.google.com 的外掛後重新整理'));
  }
  const ERR = {
    not_allowed: x => '這個 Google 帳號（' + (x.email || '') + '）尚未被管理員授權。請把這個 Email 提供給管理員，或換一個帳號。',
    sub_mismatch: x => '這個 Email（' + (x.email || '') + '）已綁定另一個 Google 帳號，請聯絡管理員。',
    bad_token: () => '登入憑證無效或已過期，請重新登入。',
    net: () => '連線失敗，請稍後再試。',
    server: x => '伺服器錯誤：' + (x.msg || '')
  };
  async function onCred(r) {
    say('驗證中…');
    const x = await api('login', { idToken: r.credential });
    if (!x.ok) { showGate((ERR[x.err] || ERR.server)(x)); return; }
    A.tok = x.tok; A.guest = false;
    try { localStorage.removeItem('eu_guest'); } catch (e) {}
    js(SK, { tok: x.tok, exp: x.exp, me: x.me });
    finish(x.me);
  }
  function signOut(silent, msg) {
    clearTimeout(timer);
    try { localStorage.removeItem(SK); if (!silent) localStorage.removeItem('eu_guest'); } catch (e) {}
    try { if (window.google && google.accounts) google.accounts.id.disableAutoSelect(); } catch (e) {}
    if (silent) { A.tok = null; showGate(msg || '登入已失效，請重新登入。'); } else location.reload();
  }
  A.signOut = () => signOut(false);

  const guestMe = () => ({ email: '', name: '訪客', identity: '訪客', role: 'guest', uid: 'guest' });
  function enterGuest() {
    if (C.GUEST === false) return;
    js('eu_guest', 1); A.guest = true; finish(guestMe());
  }
  A.enterGuest = enterGuest;

  let resolveReady;
  A.ready = new Promise(r => { resolveReady = r; });
  function finish(me) {
    A.me = me; A.admin = me.role === 'admin'; A.ns = '@' + me.uid;
    if (A.guest) {                                   // 訪客：完全在本機運作，不呼叫後端
      clearTimeout(timer); A.tok = null;
      gate.classList.remove('open'); installUI(); setSt('guest'); resolveReady(); return;
    }
    meta = jl('eu_meta' + A.ns, {}); dirty = new Set(jl('eu_dirty' + A.ns, [])); upl = new Set(jl('eu_upl' + A.ns, []));
    gate.classList.remove('open'); installUI(); setSt(dirty.size ? 'wait' : 'idle');
    resolveReady();
    window.addEventListener('online', () => sched(500));
    if (dirty.size) sched(3000);
  }
  (async () => {
    await null;                                      // 等整個檔案跑完（下方的徽章、介面函式都已建立）再開始
    const s = jl(SK, null);
    if (s && s.tok && s.exp > Date.now()) {
      A.tok = s.tok;
      const x = await api('me');
      if (x.ok) { js(SK, Object.assign(s, { me: x.me })); return finish(x.me); }
      if (x.err === 'net' && s.me) return finish(s.me);        // 離線：用上次登入的身分與本機資料
    }
    if (C.GUEST !== false && jl('eu_guest', 0)) { A.guest = true; return finish(guestMe()); }
    showGate();
  })();

  /* ---------- 同步 ---------- */
  let meta = {}, dirty = new Set(), upl = new Set(), quiet = false, busy = false, timer = 0, retry = 0;
  const isCk = k => !/^(roles|game|rto|trip)$/.test(k);        // 其餘都是 <城市>:<景點> 的打卡清單
  const sig = e => [e.d, e.t, e.who, e.s, e.gps && e.gps.lat, e.gps && e.gps.lng].join('|');
  const saveMeta = () => { js('eu_meta' + A.ns, meta); js('eu_dirty' + A.ns, [...dirty]); };

  function union(local, remote) {            // 打卡只增不減：以「內容簽章」做多重集合合併
    const pool = {}, out = local.slice();
    local.forEach(e => { const s = sig(e); pool[s] = (pool[s] || 0) + 1; });
    remote.forEach(e => { const s = sig(e); if (pool[s] > 0) pool[s]--; else out.push(e); });
    return { out: out, add: out.length - local.length };
  }
  A._union = union;

  const phCache = new Map();
  async function getPhoto(id) {
    if (phCache.has(id)) return phCache.get(id);
    const r = await api('photoGet', { id: id });
    if (r.ok) { phCache.set(id, r.data); return r.data; }
    return '';
  }
  async function hydrate(list) {              // 遠端存「@照片代號」，本機存完整圖片
    let ch = false;
    await Promise.all(list.map(async e => {
      if (!e || !Array.isArray(e.ph)) return;
      for (let i = 0; i < e.ph.length; i++) {
        const u = e.ph[i];
        if (typeof u === 'string' && u[0] === '@') { const d = await getPhoto(u.slice(1)); if (d) { e.ph[i] = d; ch = true; } }
      }
    }));
    return ch;
  }
  async function sha(s) {
    if (window.crypto && crypto.subtle) {
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
      return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 32);
    }
    let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return ('00000000' + (h >>> 0).toString(16)).slice(-8) + s.length.toString(16).padStart(8, '0') + '00000000000000';
  }
  async function ensurePhoto(dataUrl) {
    const id = await sha(dataUrl);
    if (!upl.has(id)) {
      const r = await api('photoPut', { id: id, data: dataUrl });
      if (!r.ok) throw new Error(r.err || 'photo');
      upl.add(id); js('eu_upl' + A.ns, [...upl]);
    }
    return '@' + id;
  }
  async function toRemote(list) {
    const out = [];
    for (const e of list) {
      const c = Object.assign({}, e);
      if (Array.isArray(e.ph)) {
        c.ph = [];
        for (const u of e.ph) {
          if (typeof u !== 'string' || !u) continue;
          c.ph.push(u[0] === '@' ? u : await ensurePhoto(u));
        }
      }
      out.push(c);
    }
    return out;
  }

  async function mergeRemote(k, r) {          // 回傳 true 代表本機有遠端沒有的內容，需要再推
    const rv = r.v;
    if (isCk(k)) {
      const loc = await dbGet(k), lst = Array.isArray(loc) ? loc : [];
      const m = union(lst, Array.isArray(rv) ? rv : []);
      const ch = await hydrate(m.out);
      if (m.add || ch) { quiet = true; try { await dbPut(k, m.out); } finally { quiet = false; } }
      meta[k] = Math.max(meta[k] || 0, r.ts || 0);
      return m.out.length > (Array.isArray(rv) ? rv.length : 0);
    }
    if (k === 'roles') {                         // 角色以伺服器為準：本機有不同內容一律換成伺服器版
      const loc = await dbGet(k);
      if (JSON.stringify(loc) !== JSON.stringify(rv)) { quiet = true; try { await dbPut(k, rv); } finally { quiet = false; } }
      meta[k] = r.ts || 0;
      return false;
    }
    const lts = meta[k] || 0;
    if ((r.ts || 0) > lts) { quiet = true; try { await dbPut(k, rv); } finally { quiet = false; } meta[k] = r.ts; return false; }
    return lts > (r.ts || 0);
  }

  A.pull = async function () {
    if (A.guest) return;
    setSt('sync');
    const r = await api('pull');
    if (!r.ok) { setSt(r.err === 'net' ? 'off' : 'err'); return; }
    const all = Object.assign({}, r.kv || {}, r.shared || {});
    for (const k of Object.keys(all)) { if (await mergeRemote(k, all[k])) dirty.add(k); }
    saveMeta(); A.last = Date.now();
    if (dirty.size) sched(300); else setSt('idle');
  };

  A.onPut = function (k, v) {
    if (quiet || A.guest) return;
    if (k === 'roles') return;                 // 角色只能透過成員管理（伺服器）修改，不由用戶端寫入
    meta[k] = Date.now(); dirty.add(k); saveMeta(); setSt('wait'); sched(1500);
  };

  function sched(ms) { clearTimeout(timer); if (A.guest || !A.tok) return; timer = setTimeout(flush, ms); }
  async function flush() {
    if (A.guest || !A.tok) return;
    if (busy) return sched(1500);
    if (!dirty.size) return setSt('idle');
    busy = true; setSt('sync');
    try {
      const keys = [...dirty].filter(k => k !== 'roles' || A.admin), snap = {}, items = [];
      for (const k of keys) {
        snap[k] = meta[k]; let v = await dbGet(k);
        if (isCk(k)) v = await toRemote(Array.isArray(v) ? v : []);
        items.push({ k: k, v: v, ts: meta[k] || Date.now() });
      }
      const r = items.length ? await api('push', { items: items }) : { ok: true, newer: {} };
      if (!r.ok) throw new Error(r.err || 'push');
      keys.forEach(k => { if (meta[k] === snap[k]) dirty.delete(k); });
      if (!A.admin) dirty.delete('roles');
      for (const k of Object.keys(r.newer || {})) { if (await mergeRemote(k, r.newer[k])) dirty.add(k); else dirty.delete(k); }
      A.last = Date.now(); retry = 0; saveMeta();
      setSt(dirty.size ? 'wait' : 'idle');
      if (dirty.size) sched(800);
    } catch (e) {
      saveMeta(); setSt(navigator.onLine === false ? 'off' : 'err');
      retry = Math.min(retry + 1, 5); sched(15000 * retry);
    } finally { busy = false; }
  }
  A.syncNow = async () => { if (A.guest) return; await A.pull(); await flush(); };

  /* ---------- app.js 要用的小工具 ---------- */
  A.roles = list => {                          // 每個登入者只能用「自己的那一個身分」打卡；訪客固定是「訪客」
    if (A.guest) return [{ n: '訪客' }];
    const mine = (list || []).filter(r => r.n === A.me.identity);
    return mine.length ? mine : [{ n: A.me.identity }];
  };

  /* ---------- 介面 ---------- */
  const badge = document.createElement('div');
  badge.id = 'syncb';
  document.body.appendChild(badge);
  const ST = { guest: '👤 訪客・僅存本機', idle: '☁️ 已同步', wait: '☁️ 待同步', sync: '🔄 同步中…', off: '📴 離線，稍後重試', err: '⚠️ 同步失敗，稍後重試' };
  function setSt(s) { A.state = s; badge.textContent = ST[s] || ''; badge.className = s; }
  badge.onclick = () => openAcct();

  function modal(id, title, body) {
    let m = document.getElementById(id);
    if (!m) {
      m = document.createElement('div'); m.id = id; m.className = 'ckm';
      m.innerHTML = '<div class="ckcard gcard"><div class="ghd"><b></b><button class="gh" data-x>✕</button></div><div class="mb"></div></div>';
      document.body.appendChild(m); m.querySelector('[data-x]').onclick = () => m.classList.remove('open');
    }
    m.querySelector('b').textContent = title; m.querySelector('.mb').innerHTML = body; m.classList.add('open');
    return m;
  }
  function installUI() {                         // 可重複呼叫：已經有的按鈕不會再加
    const anchor = $('#m-role'), sec = anchor && anchor.parentNode;
    if (!sec) return;
    let b1 = document.getElementById('m-acct');
    if (!b1) {
      b1 = document.createElement('button'); b1.className = 'sb'; b1.id = 'm-acct'; b1.textContent = '👤 帳號與同步';
      b1.onclick = () => { openAcct(); if (window.subm) subm(); };
      sec.insertBefore(b1, anchor);
    }
    if (A.admin) { anchor.style.display = ''; anchor.textContent = '👥 成員管理'; }
    else anchor.style.display = 'none';
  }
  function openAcct() {
    if (!A.me) return;
    if (A.guest) {
      const g = modal('acctm', '👤 訪客模式',
        '<p><b>訪客</b></p><p>訪客模式：內容只存在這台裝置的瀏覽器，不會同步到雲端；打卡的身分固定是「訪客」，也看不到成員資料。</p>' +
        '<p><small>想跨裝置同步、使用自己的角色，請改用管理員加入的 Google 帳號登入。</small></p>' +
        '<div class="row2"><button class="ckb" id="acct-gl">改用 Google 登入</button></div>');
      g.querySelector('#acct-gl').onclick = () => A.signOut();
      return;
    }
    const m = modal('acctm', '👤 帳號與同步',
      '<p><b>' + E(A.me.name || A.me.email) + '</b><br><small>' + E(A.me.email) + '</small></p>' +
      '<p>身分：<b>' + E(A.me.identity) + '</b>　權限：' + (A.admin ? '管理員' : '一般使用者') + '</p>' +
      '<p id="acct-st"></p>' +
      '<p><small>評論、照片與行程會同步到管理員的 Google 雲端硬碟（每人獨立資料夾，其他使用者看不到）。此裝置也會留一份快取，離線時仍可使用，連線後自動補同步。</small></p>' +
      '<div class="row2"><button class="ckb" id="acct-sync">立即同步</button><button class="gh" id="acct-out">登出</button></div>');
    const up = () => { m.querySelector('#acct-st').textContent = '狀態：' + (ST[A.state] || '') + (A.last ? '，上次同步 ' + new Date(A.last).toLocaleTimeString('zh-TW') : ''); };
    up();
    m.querySelector('#acct-sync').onclick = async () => { await A.syncNow(); up(); };
    m.querySelector('#acct-out').onclick = () => { if (confirm('登出後需重新登入才能使用。確定登出？')) A.signOut(); };
  }

})();
