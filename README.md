# 檔案託管服務

這是一個部署在 GitHub Pages 的純前端單頁應用程式，讓使用者透過 GitHub Personal Access Token 直接管理同一個 repository 內 `storage/` 目錄下的檔案。

目前專案沒有建置流程，也沒有後端服務；`index.html` 直接載入 ES Modules、Bootstrap CDN 與 Octokit。

## 目前功能

- 使用 GitHub Personal Access Token 登入，並在登入時驗證 `GET /user`
- 支援 `sessionStorage` 與「記住我」的 `localStorage` 儲存模式
- 建立、過濾、刪除分類資料夾
- 進入分類後拖放或選取多個檔案上傳
- 上傳前顯示確認 Modal，並在上傳過程顯示逐檔進度
- 自動略過超過 GitHub Contents API `100 MB` 限制的檔案
- 顯示檔案列表、檔案大小、圖片預覽與刪除操作
- 複製 GitHub Pages 公開連結，並提示 GitHub Pages 快取延遲
- 提供亮色 / 暗色主題切換
- 在登入後顯示平台限制與服務邊界提示

## 快速開始

### 1. 建立 GitHub Personal Access Token

建議優先使用 fine-grained PAT，並把權限縮到單一 repository。

1. 前往 [GitHub fine-grained token 設定頁面](https://github.com/settings/personal-access-tokens/new)
2. Token name 可設為 `files.poychang.net`，Expiration 建議使用較短期限
3. 在 `Repository access` 選擇 `Only select repositories`，只勾選要管理檔案的那一個 repository
4. 在 `Repository permissions` 將 `Contents` 設為 `Read and write`
5. 產生 token 後立即複製，並僅將它用於這個檔案管理站

若因 organisation 政策或舊工具限制，必須改用 classic PAT：

- 優先只在必要時使用 classic PAT，不要當成預設方案
- 若目標是 public repository，可先評估 `public_repo` 是否已足夠
- 若要操作 private repository，classic PAT 通常需要較大的 `repo` scope，風險明顯高於 fine-grained PAT

### 2. 設定專案

請直接修改 `js/core/config.js`：

```javascript
export const CONFIG = {
    defaultRepo: {
        owner: 'poychang',
        repo: 'files.poychang.net',
        branch: 'main',
    },
    fileBasePath: 'storage',
    defaultSubFolder: 'default',
    githubPagesBaseUrl: 'https://files.poychang.net',
};
```

### 3. 本機預覽

這個專案是靜態網站，開發時請用任一靜態伺服器提供目錄，不要直接以 `file://` 開啟 `index.html`。

本機確認重點：

1. `js/core/config.js` 指向正確的 repository、branch 與 GitHub Pages 網址
2. `storage/` 目錄已存在，且至少保留一個 `.gitkeep`
3. 瀏覽器可以連到 GitHub API、[jsDelivr](https://www.jsdelivr.com/) 與 [esm.sh](https://esm.sh/)

### 3.1 執行自動化測試

專案已提供最小測試基線，優先保護 `js/repo/` 內不依賴 DOM 與真實 GitHub API 的規則邏輯。

```bash
npm test
```

### 3.2 執行 lint / format 檢查

專案提供最小可持續維護的靜態檢查流程，優先攔截 correctness 與 dead code 類問題，並用 Prettier 維持一致格式。

```bash
npm run lint
npm run format:check
```

常用指令：

- `npm run lint:fix`：自動修正可安全處理的 lint 問題
- `npm run format`：直接套用 Prettier 格式

目前 formatter 先覆蓋設定檔、README 與自動化測試檔，避免一次重排整個既有前端碼庫，造成大範圍歷史 diff；等後續有獨立整理時，再把範圍擴大到全部前端原始碼。

目前 ESLint 規則刻意保持精簡，主要聚焦：

- 未宣告變數
- 未使用變數
- 重複 import
- 無法到達的程式碼

這樣可以先建立品質門檻，不會因一次導入過多風格規則而產生大量低訊號噪音。

目前測試涵蓋：

- `js/repo/utils.js` 的檔名/分類名稱清理、類型判斷與檔案大小格式化
- `js/repo/upload-validation.js` 的副檔名白名單、批次上傳限制、重複檔名與上傳前摘要
- `js/repo/github-error.js` 的 GitHub API 錯誤轉譯與錯誤細節整理

### 4. 啟用 GitHub Pages

1. 到 repository 的 `Settings -> Pages`
2. 選擇 `Deploy from a branch`
3. 指定要發佈的 branch
4. 若有自訂網域，確認 `CNAME` 內容與 `githubPagesBaseUrl` 一致

### 5. 使用流程

1. 開啟網站並以 Personal Access Token 登入
2. 預設只在本次瀏覽器工作階段使用 Token；只有在私人裝置上才建議勾選「記住我」
3. 建立或選取分類
4. 拖放或選取檔案，上傳前確認目標路徑
5. 在檔案列表中複製公開連結或刪除檔案

## 模組分工

### `js/core/`

- 放置設定、共用常數、事件匯流排與 logger
- `CUSTOM_EVENTS`、`DOM_IDS`、`PLATFORM_LIMITS` 都集中在 `js/core/constants.js`

### `js/repo/`

- 封裝 GitHub Contents API 操作與錯誤轉譯
- 處理檔案 / 分類 CRUD、路徑組裝、檔案型別與尺寸工具函式
- `js/repo/index.js` 只保留給 `js/app.js` 使用的高階資料操作；UI 子模組不直接呼叫 repo

### `js/ui/`

- 管理主題、Toast、Modal、分類列表、檔案列表、上傳互動與畫面切換
- `js/ui/platform-notice.js` 集中管理平台限制、上傳提醒與連結提示文案
- `js/ui/index.js` 只負責應用程式啟動初始化與高階 UI API；資料流程由 `js/app.js` 協調

### `js/app.js`

- 作為目前的薄協調層，串接 UI 與 repo
- 負責分類載入 / 建立 / 刪除、分類切換、檔案列表刷新、檔案刪除與上傳前驗證流程
- 若後續流程再增加，可在這一層持續收斂，而不是把 GitHub API 細節放回 UI

## 認證與憑證保存

- 這是純前端 PAT 模式，不是 GitHub OAuth 或後端代理流程
- 預設使用 `sessionStorage`，關閉分頁或瀏覽器後不再自動沿用 Token
- 只有在使用者勾選「記住我」時，才會把 Token 寫入 `localStorage`
- 登出或 Token 驗證失敗時，系統會清除 `sessionStorage` 與 `localStorage` 內殘留的憑證資料
- 若裝置可能被他人共用，請不要啟用「記住我」

## GitHub Token 最小權限

本專案目前實際使用的 GitHub API 主要是：

- `GET /user`：驗證 Token 是否有效，取得登入使用者資訊
- `GET /repos/{owner}/{repo}/contents/{path}`：列出資料夾與讀取檔案資訊
- `PUT /repos/{owner}/{repo}/contents/{path}`：建立資料夾用的 `.gitkeep`、上傳檔案、覆蓋既有檔案
- `DELETE /repos/{owner}/{repo}/contents/{path}`：刪除檔案或分類中的 `.gitkeep` / 檔案

對應的最小權限建議如下：

- fine-grained PAT：`Repository access` 限定單一 repository，`Contents` 設為 `Read and write`
- classic PAT：僅在無法使用 fine-grained PAT 時才考慮；private repository 常需 `repo` scope，風險較高

如果 Token 缺少寫入權限，登入可能成功，但上傳、建立分類、刪除檔案時會收到 GitHub 403。介面會依 GitHub 回應盡量提示你檢查 `Contents: Read and write`。

## 技術現況

- 前端：原生 JavaScript ES Modules
- UI：Bootstrap 5、Bootstrap Icons
- API Client：`@octokit/core`（由 `esm.sh` 載入）
- 測試：Node.js 內建測試器（`node --test`）
- 靜態檢查：ESLint 9（flat config）
- 格式化：Prettier 3
- 託管：GitHub Pages
- 認證：GitHub Personal Access Token
- 事件策略：只有真正跨模組且不適合 callback 注入的流程才使用 `CUSTOM_EVENTS` 與 `event-bus`
- 部署型態：純靜態檔案，無 bundler、無 transpile、無 server runtime

## 已知限制與取捨

- 這是 GitHub repository / GitHub Pages 的管理介面，不是一般雲端儲存服務，也不是即時同步的物件儲存服務
- 單一檔案受 GitHub Contents API 的 `100 MB` 限制；超過時 UI 會直接略過並提示
- 這個工具較適合少量靜態資產與分享檔案；長期累積大型二進位檔會讓 repository 歷史與同步成本快速增加
- GitHub Contents API 有速率限制；短時間大量上傳、刪除或重新整理時，請求可能被暫時限制
- GitHub Pages 與 CDN 快取更新通常需要數十秒，偶爾可能更久；剛上傳或覆蓋後不一定會立即對外可見
- 建立或刪除分類後，介面會以短輪詢等待 GitHub API 狀態一致；若同步逾時，會提示使用者稍後再確認
- 檔案列表會略過 `.gitkeep`
- 刪除分類與刪除單一檔案都使用 Bootstrap Modal 確認，並支援非同步處理中的 loading 狀態

## 常見 GitHub API 錯誤對照

| 情境                                       | HTTP 狀態 | UI 顯示訊息方向                                                               | 維護與除錯重點                                                                       |
| ------------------------------------------ | --------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Token 無效、過期、尚未完成授權             | 401       | GitHub 驗證失敗，Token 可能無效、已過期，或尚未完成必要授權。                 | 重新產生 PAT，確認 repository scope 與有效期限。                                     |
| Token 沒有足夠權限                         | 403       | 某操作被 GitHub 拒絕，並提示 GitHub 接受的權限或 `Contents: Read and write`。 | 檢查 fine-grained PAT 是否限定正確 repository，且 `Contents` 為 `Read and write`。   |
| API 速率限制                               | 403       | GitHub API 已達速率限制，請稍後再試。                                         | 查看 logger 的 `code/status/debugMessage`，確認是否為 rate limit，而非一般權限問題。 |
| 路徑或 repository 不存在，或無法讀取該資源 | 404       | 找不到指定的 repository 或路徑，或目前 Token 無法讀取該資源。                 | 檢查 `js/core/config.js` 的 owner / repo / branch / path，並確認 PAT 有讀取權限。    |
| 內容衝突，例如版本不同步                   | 409       | GitHub 偵測到內容衝突，請重新整理後再試。                                     | 重新整理列表後重試，必要時比對最新 SHA。                                             |
| 路徑、檔名或請求內容無效                   | 422       | 請求內容無效，請確認路徑、檔名與內容格式。                                    | 檢查分類名稱、檔名、Base64 內容與 GitHub Contents API 限制。                         |

目前 repo / auth 層會統一拋出帶有 `code`、`status`、`userMessage`、`debugMessage` 的錯誤物件。UI 預設顯示 `userMessage`，logger 則保留技術細節，方便後續追查。

## 維護指引

- 目前唯一保留的跨模組事件是 `auth:logout`，用來同步 app / repo 狀態重置
- 新增跨模組事件前，先確認是否能以 handler 注入解決；只有需要多個模組同步訂閱時才擴充 `js/core/constants.js` 的 `CUSTOM_EVENTS`
- 新增 DOM 節點識別碼時，先更新 `js/core/constants.js` 的 `DOM_IDS`
- 主要初始化流程在 `js/app.js`
- UI 子模組統一由 `js/ui/index.js` 串接
- 若調整平台限制或提醒文案，優先更新 `js/core/constants.js` 與 `js/ui/platform-notice.js`
- 若調整樣式模組，另可同步更新 `css/README.md`

## 除錯

1. 開啟瀏覽器開發者工具觀察 logger 輸出
2. 檢查 `js/core/config.js` 的 repository、branch 與 GitHub Pages 設定是否正確
3. 檢查 `js/core/event-bus.js`、`CUSTOM_EVENTS` 與實際使用點是否一致
4. 檢查 GitHub API 回應是否帶出權限或路徑錯誤

## 授權

MIT License
