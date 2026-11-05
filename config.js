// 部署設定。AUTH 設 false（或留空）＝單機模式：不登入、資料只存在這台裝置（原本的行為）。
window.CFG = {
  AUTH: false,
  CLIENT_ID: '832861534801-p4qh7lbcvrqfsngogiblnmpg19bjaru5.apps.googleusercontent.com',   // Google Cloud 的 OAuth 用戶端 ID，例如 123456-abcdef.apps.googleusercontent.com
  API: 'https://script.google.com/macros/s/AKfycbwlZYcbjlgryc8Mgs2suKGpIleKi-YwiijJXqAdvPoXaFqGbwBNRMn4fNMx9BWRtV3z/exec'          // Apps Script 部署後的網頁應用程式網址，結尾是 /exec
};
