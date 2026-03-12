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

1. 前往 [GitHub Token 設定頁面](https://github.com/settings/tokens/new)
2. 建立一組可存取目標 repository 的 token
3. 至少勾選 `repo` 權限

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
2. 建立或選取分類
3. 上傳檔案
4. 在檔案列表中複製連結或刪除檔案

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

## 技術現況

- 前端：原生 JavaScript ES Modules
- UI：Bootstrap 5、Bootstrap Icons
- API：Octokit
- 託管：GitHub Pages
- 認證：GitHub Personal Access Token
- 事件策略：以 `CUSTOM_EVENTS` 與 `event-bus` 為跨模組事件入口

## 已知限制與取捨

- 這是直接操作 GitHub repository 的前端工具，不是一般雲端儲存服務
- Token 目前保存在瀏覽器 `localStorage`
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