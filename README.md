# 檔案託管服務

這是一個部署在 GitHub Pages 的單頁應用程式，讓使用者透過 GitHub Personal Access Token 直接管理儲存在同一個 repository 內的檔案。

## 功能特色

- 建立、過濾、刪除分類資料夾
- 選取分類後上傳多個檔案
- 顯示檔案列表、檔案大小與圖片預覽
- 複製 GitHub Pages 公開連結
- 亮色 / 暗色主題切換
- 使用 Bootstrap Modal / Toast 提供操作回饋

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
const CONFIG = {
    defaultRepo: {
        owner: 'poychang',
        repo: 'files.poychang.net',
        branch: 'main'
    },
    fileBasePath: 'storage',
    defaultSubFolder: 'default',
    githubPagesBaseUrl: 'https://files.poychang.net'
};
```

### 3. 啟用 GitHub Pages

1. 到 repository 的 `Settings -> Pages`
2. 選擇 `Deploy from a branch`
3. 指定要發佈的 branch

### 4. 使用流程

1. 開啟網站並以 Personal Access Token 登入
2. 預設只在本次瀏覽器工作階段使用 Token；只有在私人裝置上才建議勾選「記住我」
3. 建議使用只授權單一 repository 的專用 Token，不與其他用途共用
4. 建立或選取分類
5. 上傳檔案
6. 在檔案列表中複製連結或刪除檔案

## 專案結構

```text
files.poychang.net/
├── index.html
├── README.md
├── css/
│   ├── main.css
│   ├── variables.css
│   ├── base.css
│   ├── navbar.css
│   ├── forms.css
│   ├── cards.css
│   ├── folders.css
│   ├── files.css
│   ├── buttons.css
│   ├── modals.css
│   ├── notifications.css
│   ├── footer.css
│   ├── animations.css
│   ├── users.css
│   ├── utilities.css
│   └── README.md
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── core/
│   │   ├── config.js
│   │   ├── constants.js
│   │   ├── event-bus.js
│   │   ├── index.js
│   │   └── logger.js
│   ├── repo/
│   │   ├── file-operations.js
│   │   ├── folder-operations.js
│   │   ├── github-api.js
│   │   ├── index.js
│   │   └── utils.js
│   └── ui/
│       ├── files.js
│       ├── folder-filter.js
│       ├── folders.js
│       ├── index.js
│       ├── loading.js
│       ├── modal.js
│       ├── navbar.js
│       ├── theme.js
│       ├── toast.js
│       ├── upload.js
│       └── views.js
└── storage/
```

## 模組分工

### `js/core/`

- 放置設定、共用常數、事件匯流排與 logger
- `CUSTOM_EVENTS` 是跨模組事件名稱的單一來源

### `js/repo/`

- 封裝 GitHub API 存取
- 處理檔案 / 分類的 CRUD 與路徑、型別等工具函式

### `js/ui/`

- 管理主題、Toast、Modal、分類列表、檔案列表、上傳互動與視圖切換
- 透過 `js/ui/index.js` 統一初始化

## 登入與憑證保存

- 這是純前端 PAT 模式，不是 GitHub OAuth 或後端代理流程
- 預設使用 `sessionStorage`，關閉分頁或瀏覽器後不再自動沿用 Token
- 只有在使用者勾選「記住我」時，才會把 Token 寫入 `localStorage`
- 登出或 Token 驗證失敗時，系統會清除 `sessionStorage` 與 `localStorage` 內殘留的憑證資料
- 若裝置可能被他人共用，請不要啟用「記住我」
- 建議建立專用 fine-grained PAT，將權限限制在單一 repository，避免共用既有開發或維運 Token

## GitHub Token 最小權限

本專案目前實際使用的 GitHub API 主要是：

- `GET /user`：驗證 Token 是否有效，取得登入使用者資訊
- `GET /repos/{owner}/{repo}/contents/{path}`：列出資料夾與讀取檔案資訊
- `PUT /repos/{owner}/{repo}/contents/{path}`：建立資料夾用的 `.gitkeep`、上傳檔案、覆蓋既有檔案
- `DELETE /repos/{owner}/{repo}/contents/{path}`：刪除檔案或分類中的 `.gitkeep` / 檔案

對應的最小權限建議如下：

- fine-grained PAT：`Repository access` 限定單一 repository，`Contents` 設為 `Read and write`
- classic PAT：僅在無法使用 fine-grained PAT 時才考慮；private repository 常需 `repo` scope，風險較高

如果 Token 缺少寫入權限，登入可能成功，但上傳、建立分類、刪除檔案時會收到 GitHub 403。介面現在會明確提示你檢查 `Contents: Read and write`。

## 技術現況

- 前端：原生 JavaScript ES Modules
- UI：Bootstrap 5、Bootstrap Icons
- API：Octokit
- 託管：GitHub Pages
- 認證：GitHub Personal Access Token
- 事件策略：以 `CUSTOM_EVENTS` 與 `event-bus` 為跨模組事件入口

## 已知限制與取捨

- 這是直接操作 GitHub repository 的前端工具，不是一般雲端儲存服務
- Token 預設只保存在目前瀏覽器工作階段；只有勾選「記住我」才會持久保存到 `localStorage`
- 單一檔案仍受 GitHub 100 MB 限制
- 建立或刪除分類後，介面會延遲約 1 秒再刷新，以等待 GitHub API 狀態一致
- 檔案列表會略過 `.gitkeep`

## 維護指引

- 新增跨模組事件時，先更新 `js/core/constants.js` 的 `CUSTOM_EVENTS`
- 新增 DOM 節點識別碼時，先更新 `js/core/constants.js` 的 `DOM_IDS`
- 主要初始化流程在 `js/app.js`
- UI 子模組統一由 `js/ui/index.js` 串接

## 除錯

1. 開啟瀏覽器開發者工具觀察 logger 輸出
2. 檢查 `js/core/event-bus.js` 與 `CUSTOM_EVENTS` 是否一致
3. 檢查 `js/core/config.js` 的 repository 與 GitHub Pages 設定是否正確

## 授權

MIT License
