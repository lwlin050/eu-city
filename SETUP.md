# 部署指南：GitHub Pages ＋ Google 登入 ＋ Google 雲端硬碟

## 0. 架構

```
使用者手機／電腦
   │  ① 開網頁（HTML/CSS/JS）            ┌──────────────────────┐
   ├────────────────────────────────────▶│ GitHub Pages（公開）  │
   │                                     └──────────────────────┘
   │  ② Google 登入 → 取得 ID Token
   │  ③ 評論／照片／行程（帶 Token）      ┌──────────────────────┐   ┌──────────────────────────┐
   └────────────────────────────────────▶│ Apps Script 後端      │──▶│ 管理員的 Google 雲端硬碟  │
                                         │ 驗證 Token＋白名單    │   │ ‧ Users 工作表（白名單）  │
                                         └──────────────────────┘   │ ‧ u_xxxx/ state.json、照片│
                                                                    └──────────────────────────┘
```

* 網頁在 GitHub 上是公開的，**資料不在 GitHub**，只在你（管理員）的 Google 雲端硬碟。
* 使用者從頭到尾不會碰到雲端硬碟檔案，只能透過後端讀寫「自己的」資料夾。
* 白名單在 Google 試算表 `Users`：Email、顯示名稱、身分、權限、狀態。**只有 role = admin 能新增、修改、停用、刪除帳號**。
* 一個帳號只綁一個身分（例如 Olivia）；同一個身分同時只能給一個啟用中的帳號。
* 沒填 `config.js`（`AUTH:false`）時，網頁維持原本的單機模式。Claude artifact 版也是這樣，不能用 Google 登入。

預估時間：第一次約 40–60 分鐘。

---

## 1. GitHub：放網頁

1. 登入 github.com → 右上角 **＋ → New repository**。Repository name 例如 `eu-island`，選 **Public**（免費帳號的 GitHub Pages 需要公開儲存庫），按 **Create repository**。
2. 在儲存庫頁面按 **Add file → Upload files**，把下列檔案**放在最上層**（不要放進子資料夾）：
   `austria-czech-hungary-island.html`、`style.css`、`data.js`、`assets.js`、`app.js`、`auth.js`、`config.js`、`three.min.js`
   另外上傳 `backend` 資料夾（Code.gs、appsscript.json，裡面沒有任何密鑰，公開也沒關係）和 `build.py`、`SETUP.md`。
   按 **Commit changes**。
3. 儲存庫 **Settings → Pages**：Source 選 **Deploy from a branch**，Branch 選 `main`、資料夾 `/ (root)`，按 **Save**。
4. 等 1–2 分鐘，頁面上方會出現網址：`https://你的帳號.github.io/eu-island/`。
   你的網頁網址就是：`https://你的帳號.github.io/eu-island/austria-czech-hungary-island.html`
   （想要短網址可以把這個檔名改成 `index.html`；`build.py` 讀的是原檔名，要改的話改 `build.py` 第 14 行的檔名。）

> 記下 **來源（Origin）**：`https://你的帳號.github.io`，只到網域，不含 `/eu-island/`，後面第 2 步要用。

---

## 2. Google Cloud：建立「用 Google 登入」的 Client ID

1. 開 console.cloud.google.com，用**管理員帳號**登入 → 上方專案選單 **New Project**，名稱 `eu-island`，建立後切換到這個專案。
2. 左側選單 **APIs & Services → OAuth consent screen**（新版介面叫 **Google Auth Platform**）：
   * User Type／Audience 選 **External**。
   * App name：`奧捷斯匈旅遊城`；User support email 與 Developer contact 填你的 Email。
   * Scopes 不用加（預設的 `openid`、`email`、`profile` 就夠，也不需要 Google 審核）。
   * **Publishing status（發布狀態）要按 Publish app，改成 In production。**
     停在 Testing 的話，只有你一個個加進「Test users」的帳號能登入，其他人會看到「存取被封鎖」。
3. **Credentials（憑證）→ Create credentials → OAuth client ID**：
   * Application type：**Web application**，名稱 `eu-island-web`。
   * **Authorized JavaScript origins** 新增：`https://你的帳號.github.io`。
     要在自己電腦測試的話再加 `http://localhost:8000`。
   * **Authorized redirect URIs 不用填。**
   * 按 Create，複製 **Client ID**（長得像 `1234567890-abcdefg.apps.googleusercontent.com`）。Client Secret 用不到。

---

## 3. Apps Script：後端

> 請用**管理員帳號**做這一步。資料會存在執行這個後端的人的雲端硬碟，那個人就是管理員。

1. 開 script.google.com → **New project**，專案名稱 `eu-island-backend`。
2. 左側 **Project Settings（齒輪）** → 勾選 **Show "appsscript.json" manifest file in editor**。
3. 回到 **Editor**：
   * 把 `Code.gs` 的內容整份貼進去，取代預設的 `myFunction`。
   * 開啟 `appsscript.json`，把整份換成本專案的 `backend/appsscript.json`（裡面指定時區、權限範圍、Web App 設定）。
4. **Project Settings → Script properties → Add script property**：
   名稱 `CLIENT_ID`，值貼上第 2 步的 Client ID。按 **Save script properties**。
5. 編輯器上方的函式下拉選單選 **`setup`** → **Run**。
   * 第一次會要求授權。出現「Google hasn't verified this app」是正常的（這是你自己的腳本）：按 **Advanced → Go to eu-island-backend (unsafe) → Allow**。
   * 執行完到 **Execution log**，會看到「設定完成。管理員：你的 Email；白名單：https://docs.google.com/…」。
   * 這時雲端硬碟會出現 `EuIslandData（請勿手動分享）` 資料夾和 `EuIsland Users（帳號白名單）` 試算表。**這兩個都不要分享給任何人。**
6. **Deploy → New deployment**：
   * 齒輪選 **Web app**。
   * Execute as：**Me（你的帳號）**。
   * Who has access：**Anyone（任何人）**。
     （真正的存取控制在程式裡，靠 Google 登入＋白名單，不靠這個選項。這裡不能選「Anyone with Google account」，否則瀏覽器跨網域呼叫會失敗。）
   * 按 **Deploy**，複製 **Web app URL**（結尾是 `/exec`）。
7. 用瀏覽器直接開那個 `/exec` 網址，應該看到：`{"ok":true,"v":1,"svc":"euisland"}`。看到這個就代表後端活著。

---

## 4. 把設定填進網頁

編輯 GitHub 上的 `config.js`（點檔案 → 鉛筆圖示）：

```js
window.CFG = {
  AUTH: true,
  CLIENT_ID: '1234567890-abcdefg.apps.googleusercontent.com',
  API: 'https://script.google.com/macros/s/AKfy.../exec'
};
```

按 **Commit changes**，等 1–2 分鐘 Pages 更新，用**無痕視窗**開網頁（避免舊快取）。

---

## 5. 第一次登入與建立使用者

1. 開網頁 → 出現「請用 Google 帳號登入」→ 用管理員帳號登入。
2. 右上選單（⚙）→ **👤 帳號與同步** 可看目前身分、同步狀態、登出；**🔐 帳號管理**（只有管理員看得到）：
   * 下方「＋ 新增使用者」：填 Google Email、顯示名稱、選**身分**（下拉選單來自角色設定）、權限（一般使用者／管理員）、狀態，按**儲存**。
   * 已建立的帳號可修改身分、停用、改成管理員，或刪除（刪除時可連同他的雲端資料夾一起丟進垃圾桶）。
   * 保護規則：同一個身分不能同時給兩個啟用中的帳號；至少要留一位啟用中的管理員；不能刪除自己。
3. 管理員預設身分是 `MK`，可以在帳號管理裡改。
4. 把網址傳給朋友，他們用已被你加入的 Google 帳號登入即可。沒被加入的帳號會看到「尚未被管理員授權」。
5. 也可以直接在 `EuIsland Users` 試算表編輯（欄位：email、name、identity、role、status…），效果相同，且不需要重新部署。

一般使用者登入後：打卡的「身分」只能選自己那一個；看不到角色管理與帳號管理。

---

## 6. 搬移你現有的資料

資料目前在 Claude artifact 的瀏覽器儲存空間，和 GitHub Pages 是不同網站，不會自動帶過去：

1. 在舊的 artifact：⚙ → 備份 → 複製備份文字（JSON）。
2. 在新網站用管理員帳號登入 → ⚙ → 還原 → 貼上 → 匯入。
3. 角色設定（roles）只有管理員匯入時才會套用；打卡、行程、遊戲進度會同步到管理員自己的雲端資料夾。

其他人的舊資料也是同樣方式，各自在自己的帳號下還原。

---

## 7. 之後怎麼更新

| 要改什麼 | 做法 |
|---|---|
| 網頁（景點資料、介面、3D） | 改 `data.js`／`app.js`／`style.css` → 在 GitHub 取代檔案 → Commit。等 1–2 分鐘，使用者重新整理。 |
| 後端（Code.gs） | 改程式 → **Deploy → Manage deployments → 鉛筆 → Version: New version → Deploy**。網址不變。只按「儲存」不會更新線上版本。 |
| 發布 Claude artifact 試玩版 | `python3 build.py`，會產生 `austria-czech-hungary-island-cdn.html`（內嵌所有檔案、auth 關閉）。 |
| 緊急讓所有人登出 | 在 Apps Script 編輯器執行 `revokeAllSessions`。 |

---

## 8. 安全設計與加密：實際保護了什麼

**有做到的**
* 使用者必須用 Google 登入，後端驗證 ID Token（簽發對象 aud 必須等於你的 Client ID、未過期、Email 已驗證），再比對白名單，才簽發自己的工作階段 Token（HMAC-SHA256，7 天）。
* 每一次請求都會重新檢查白名單：停用或刪除帳號後，對方下一個動作就被登出。
* 每位使用者有獨立資料夾，後端只會讀寫 Token 對應那個人的資料夾；其他人的評論、照片、行程互相看不到。
* 帳號管理與角色設定的寫入只有管理員可以做，伺服器端檢查，前端只是隱藏按鈕。
* 第一次登入會把 Google 帳號的 `sub` 綁到這個 Email，之後同 Email 換另一個 Google 帳號會被拒絕。
* 照片只接受 jpeg／png／webp，限制大小；資料 Key 有格式與長度檢查。

**關於「加密的 Google 雲端硬碟」，請先知道這幾點**
* Google 雲端硬碟會自動做**靜態加密**（儲存時），傳輸也走 TLS。這是預設，不能關，也不用設定。
* 這是 Google 管理金鑰的加密，不是端對端加密：身為管理員（檔案擁有者），你和 Google 在技術上都能讀到檔案內容。
* Google 的「用戶端加密（Client-side encryption）」是 Workspace 企業版功能，個人帳號用不到，Apps Script 也無法使用。
* 如果你要「連管理員也看不到內容」，要改成在瀏覽器用 Web Crypto（AES-GCM）加密再上傳，金鑰來自使用者自己的通關密語。代價是忘記密語資料就找不回來，管理員也救不了。這個可以之後再加，現在先不做。
* 建議管理員：開啟 Google 帳號兩步驟驗證；不要分享 `EuIslandData` 資料夾、`Users` 試算表與 Apps Script 專案；不要把 Script properties 的內容貼到任何地方。

---

## 9. 限制與注意事項

* **LINE、Facebook、Instagram 的內建瀏覽器常擋 Google 登入**（會出現 `disallowed_useragent`）。請使用者用 Safari 或 Chrome 開網址。
* Apps Script 有免費帳號的每日配額（URL Fetch 次數、同時執行數、執行時間等），幾位使用者綽綽有餘；實際數字以 Google 官方的 Quotas 頁面為準。
* 每次同步約 0.5–2 秒，閒置後的第一次呼叫可能更慢。App 是先存本機、再背景同步，所以操作不會卡住。
* 離線時資料先存在這台裝置，連線後自動補同步（畫面下方的小膠囊顯示狀態：已同步／待同步／同步中／離線／失敗）。
* 衝突處理：打卡評論用「內容簽章」合併，只增不減，兩台裝置各自新增的都會保留；遊戲進度、行程、評分偏好以較新的寫入為準。
* 照片在 App 內已縮成約 720 px，後端上限約 650 KB 一張。
* GitHub Pages 是 HTTPS，**GPS 打卡在這裡可以用**（Claude 預覽內被擋，不會有這個問題）。
* 這個專案的程式我用模擬的 Google 服務和模擬瀏覽器測過邏輯，**還沒有連真正的 Google 實測**。第一次部署若卡住，先看下面的疑難排解。

---

## 10. 疑難排解

| 症狀 | 原因與處理 |
|---|---|
| 登入按鈕不出現，或訊息說無法載入 Google 登入 | 網路或外掛擋了 accounts.google.com；或在 LINE 等內建瀏覽器。換 Safari／Chrome、關掉擋廣告外掛。 |
| `Error 400: origin_mismatch`／The given origin is not allowed | Client ID 的 Authorized JavaScript origins 沒有你的網站來源，只填 `https://帳號.github.io`，不含路徑、不含結尾斜線。改完等幾分鐘。 |
| 「存取被封鎖」「此應用程式未通過驗證」 | OAuth consent screen 還在 Testing。改成 In production，或把帳號加進 Test users。 |
| 登入後顯示「登入憑證無效」 | `config.js` 的 CLIENT_ID 與 Script properties 的 CLIENT_ID 不一致。 |
| 顯示「連線失敗」，主控台有 CORS 錯誤 | 部署的存取權不是 **Anyone**；或用了 `/dev` 網址；或改了程式沒有發新版本（見第 7 節）。 |
| 訊息含 `Authorization required` 或 `server` 錯誤 | 沒執行過 `setup()` 或授權沒完成；重新執行 `setup` 並允許權限。 |
| 「尚未被管理員授權」 | 把顯示的 Email 加進帳號管理（大小寫不分）；確認狀態是啟用。 |
| 「已綁定另一個 Google 帳號」 | 同 Email 換了 Google 帳號。管理員到 `Users` 試算表，把該列 `sub`（F 欄）清空，對方重新登入即可。 |
| 同步一直顯示失敗 | 點小膠囊 → 立即同步；看是否離線；管理員看 Apps Script 的 Executions（執行作業）有沒有錯誤。 |

---

## 11. 驗收清單

1. 開 `/exec` 網址看得到 `{"ok":true…}`。
2. 管理員登入成功，⚙ 選單出現 👤 帳號與同步、🔐 帳號管理。
3. 新增一位使用者（例如 Olivia）。
4. 用該使用者的 Google 帳號（無痕視窗）登入：沒有角色管理、沒有帳號管理，打卡身分只有 Olivia。
5. 用沒被加入的帳號登入：看到「尚未被管理員授權」。
6. 使用者打一則帶照片的卡 → 小膠囊變成「已同步」→ 雲端硬碟 `EuIslandData/u_xxxx/` 出現 `state.json` 和 `ph_…`。
7. 換一台裝置（或清除瀏覽器資料）再登入：評論與照片都還在。
8. 管理員把該帳號停用 → 該使用者下一個操作就被導回登入畫面。
9. 兩位不同使用者互相看不到對方的評論與行程。
