# 檔案託管服務

這是一個使用 GitHub Pages 來託管檔案的單頁應用程式（SPA），提供簡潔美觀的介面來管理和分享你的檔案。

## 🌟 功能特色

- 📤 **檔案上傳**：支援拖曳上傳或點擊選擇檔案，並使用 Modal 確認上傳
- 📁 **分類管理**：可建立、瀏覽、過濾和刪除分類資料夾來組織檔案
- 🔍 **分類過濾**：在「現有分類」區塊可即時輸入關鍵字過濾分類列表
- �️ **自動選取**：登入後自動載入預設分類及其檔案列表
- �👀 **檔案瀏覽**：查看特定分類下的所有檔案（自動過濾 `.gitkeep`）
- 🖼️ **圖片預覽**：直接在列表中預覽圖片檔案
- 📋 **複製連結**：一鍵複製檔案的 GitHub Pages URL
- 🗑️ **刪除操作**：可刪除檔案或整個分類（含所有檔案），並使用 Modal 確認
- 🎨 **主題切換**：支援亮色/暗色主題，自動儲存使用者偏好
- 📱 **響應式設計**：適配桌面和行動裝置，分類卡片採用 5 欄佈局
- 🔄 **即時更新**：建立或刪除分類後自動刷新列表（含延遲機制確保 API 更新）

## 🚀 快速開始

### 1. 設定 GitHub Personal Access Token

1. 前往 [GitHub Token 設定頁面](https://github.com/settings/tokens/new)
2. 設定 Token 名稱（例如：File Hosting）
3. 選擇 Expiration（建議選擇適當的期限）
4. 勾選 `repo` 權限（完整存取權限）
5. 點擊「Generate token」並複製產生的 token

### 2. 設定專案

在 `js/core/config.js` 中設定你的 GitHub 儲存庫資訊：

```javascript
const CONFIG = {
    // 預設的儲存庫設定（用於檔案上傳）
    defaultRepo: {
        owner: 'poychang',              // 你的 GitHub 使用者名稱
        repo: 'files.poychang.net',     // 你的儲存庫名稱
        branch: 'main'                  // 分支名稱
    },
    
    // 檔案儲存路徑設定
    fileBasePath: 'storage',            // 儲存檔案的基礎路徑
    
    // 預設子資料夾（登入後自動選取）
    defaultSubFolder: 'default',
    
    // GitHub Pages URL 基礎路徑
    githubPagesBaseUrl: 'https://files.poychang.net'
};
```

> **注意**：根目錄的 `config.js` 已棄用，請改用 `js/core/config.js`。

### 3. 啟用 GitHub Pages

1. 在你的儲存庫中，前往 Settings → Pages
2. 選擇 Source：Deploy from a branch
3. 選擇 Branch：main（或你設定的分支）
4. 點擊 Save

### 4. 使用應用程式

1. 開啟網站並使用 Personal Access Token 登入
2. 系統會自動載入並選取預設分類（`defaultSubFolder`）
3. 在左側「建立分類」卡片輸入新分類名稱並建立
4. 在右側「現有分類」卡片上方可輸入關鍵字即時過濾分類列表，點擊分類卡片來選擇要上傳檔案的目標分類
5. 使用拖曳或點擊「選擇檔案」來上傳檔案
6. 在 Modal 確認視窗中確認上傳資訊
7. 上傳後，可以：
    - 點擊「複製連結」來取得檔案的 GitHub Pages URL
    - 點擊「刪除」來移除檔案（需 Modal 確認）
8. 點擊分類卡片上的垃圾桶圖示可刪除整個分類（需 Modal 確認）

## 📂 專案結構

```
files.poychang.net/
├── index.html          # 主頁面（含上傳確認和刪除分類 Modal）
├── config.js           # 全域設定檔（即將棄用，請使用 js/core/config.js）
├── README.md           # 專案說明文件
├── css/
│   └── styles.css      # 自訂樣式（含主題切換、Modal、Footer 等）
├── js/
│   ├── app.js          # 應用程式主入口（整合所有模組）
│   ├── auth.js         # 認證管理模組（Personal Access Token）
│   ├── core/           # 核心層（Core Layer）
│   │   ├── config.js       # 設定管理（儲存庫、路徑、預設分類）
│   │   ├── constants.js    # 常數定義（DOM ID、事件名稱、儲存鍵值）
│   │   ├── event-bus.js    # 事件匯流排（跨模組事件通訊）
│   │   ├── logger.js       # 日誌系統（分級記錄、模組化輸出）
│   │   └── index.js        # 核心層統一匯出
│   ├── repo/           # 儲存庫層（Repository Layer）
│   │   ├── github-api.js       # GitHub API 基礎操作
│   │   ├── file-operations.js  # 檔案操作（上傳、刪除、列表）
│   │   ├── folder-operations.js # 資料夾操作（建立、刪除、列表）
│   │   ├── utils.js            # 工具函數（路徑處理、內容編碼）
│   │   └── index.js            # 儲存庫層統一匯出
│   └── ui/             # UI 層（User Interface Layer）
│       ├── theme.js            # 主題管理（亮色/暗色切換）
│       ├── toast.js            # Toast 通知系統
│       ├── modal.js            # Modal 對話框管理
│       ├── navbar.js           # 導航列管理
│       ├── views.js            # 視圖切換（分類/檔案視圖）
│       ├── folders.js          # 資料夾列表管理
│       ├── folder-filter.js    # 資料夾過濾功能
│       ├── files.js            # 檔案列表管理
│       ├── upload.js           # 檔案上傳介面
│       ├── loading.js          # 載入狀態管理
│       ├── progress.js         # 進度條管理
│       └── index.js            # UI 層統一匯出
└── storage/            # 上傳的檔案會儲存在這裡（可在 config.js 設定）
    ├── default/        # 預設分類資料夾
    ├── images/         # 圖片分類（範例）
    └── ...             # 其他自訂分類
```

## 🏗️ 架構設計

本專案採用**三層模組化架構**，清晰分離職責，提升程式碼的可維護性與可擴展性。

### Core Layer（核心層）

提供所有模組共用的基礎功能：

- **config.js** - 集中管理應用程式設定（儲存庫資訊、路徑、預設值）
- **constants.js** - 定義所有常數（37 個 DOM ID 常數、事件名稱、儲存鍵值）
- **event-bus.js** - 發布/訂閱事件系統，實現跨模組解耦通訊
- **logger.js** - 四級日誌系統（DEBUG、INFO、WARN、ERROR），支援模組化輸出

### Repository Layer（儲存庫層）

封裝所有 GitHub API 操作邏輯：

- **github-api.js** - Octokit 實例管理、API 基礎操作、錯誤處理
- **file-operations.js** - 檔案 CRUD 操作（上傳、刪除、列表、取得內容）
- **folder-operations.js** - 資料夾管理（建立、刪除、列表、遞迴操作）
- **utils.js** - 工具函數（路徑處理、Base64 編碼、陣列分批）

### UI Layer（使用者介面層）

管理所有前端 UI 互動與顯示：

- **theme.js** - 主題切換功能（亮色/暗色模式）
- **toast.js** - Toast 通知（成功/錯誤/警告/資訊）
- **modal.js** - Modal 對話框（上傳確認、刪除確認）
- **navbar.js** - 導航列（使用者資訊顯示/清除）
- **views.js** - 視圖切換（分類管理/檔案管理視圖）
- **folders.js** - 資料夾列表（顯示、建立、刪除、選擇）
- **folder-filter.js** - 資料夾即時過濾與搜尋
- **files.js** - 檔案列表（顯示、刪除、複製連結）
- **upload.js** - 檔案上傳（拖放、選擇、進度顯示）
- **loading.js** - 按鈕載入狀態管理
- **progress.js** - 上傳進度條管理

### 架構優勢

✅ **職責分離** - 每個模組專注於單一職責  
✅ **解耦設計** - 使用事件匯流排實現跨模組通訊  
✅ **集中管理** - 所有 DOM ID、事件名稱、設定統一管理  
✅ **易於測試** - 模組化設計便於單元測試  
✅ **可擴展性** - 新增功能只需添加新模組，不影響現有程式碼  
✅ **可維護性** - 清晰的目錄結構與命名規範  

## 🔧 技術架構

- **前端框架**：原生 JavaScript (ES6 Modules)
- **UI 框架**：Bootstrap 5.3（含 Modal、Toast、響應式網格）
- **圖示**：Bootstrap Icons
- **GitHub API**：Octokit (透過 CDN 引入)
- **主題系統**：CSS 變數 + localStorage 持久化
- **事件系統**：自訂事件匯流排（發布/訂閱模式）
- **日誌系統**：四級分級日誌（DEBUG、INFO、WARN、ERROR）
- **託管**：GitHub Pages
- **認證方式**：GitHub Personal Access Token

## 📝 使用說明

### 建立分類

1. 在左側「建立分類」卡片輸入分類名稱（僅支援英數字、底線、連字號）
2. 點擊「建立分類」按鈕
3. 系統會在儲存庫建立資料夾（含 `.gitkeep` 檔案）
4. 分類列表會在 1 秒後自動更新

### 上傳檔案

1. 點擊分類卡片來選擇目標分類
2. 左側會顯示「上傳檔案」區域
3. 將檔案拖曳到上傳區域，或點擊「選擇檔案」
4. 在 Modal 確認視窗中檢查檔案數量和目標路徑
5. 點擊「確認上傳」開始上傳
6. 上傳進度會即時顯示
7. 完成後檔案列表會自動更新

### 取得檔案連結

上傳的檔案會產生以下格式的 URL：

```
{githubPagesBaseUrl}/{fileBasePath}/{分類名稱}/{檔案名稱}
```

例如（依據 config.js 設定）：
```
https://files.poychang.net/storage/default/photo.jpg
```

### 管理檔案與分類

- **選擇分類**：點擊分類卡片（會顯示為實心圖示並高亮）
- **過濾分類**：在「現有分類」卡片上方輸入關鍵字可即時過濾分類列表，點擊「清除」按鈕可重設
- **重新整理分類**：點擊「現有分類」右上角的「重新整理」按鈕
- **重新整理檔案**：點擊「檔案列表」右上角的「重新整理」按鈕
- **複製連結**：點擊檔案右側的「複製連結」按鈕
- **刪除檔案**：點擊檔案右側的「刪除」按鈕（需 Modal 確認）
- **刪除分類**：選取分類後，點擊卡片右上角的紅色垃圾桶圖示（需 Modal 確認，會遞迴刪除所有檔案）

### 主題切換

- 點擊右上角的太陽/月亮圖示切換亮色/暗色主題
- 使用者偏好會自動儲存到 localStorage

## ⚠️ 注意事項

1. **Token 安全**：請妥善保管你的 Personal Access Token，Token 會儲存在 localStorage 中
2. **儲存庫限制**：GitHub 有儲存庫大小限制（建議單個儲存庫不超過 1GB）
3. **檔案大小**：GitHub 單一檔案大小限制為 100MB
4. **快取處理**：建立或刪除分類後會延遲 1 秒刷新，以確保 GitHub API 更新完成
5. **權限要求**：Token 必須具有對目標儲存庫的 `repo` 完整權限
6. **檔案覆蓋**：上傳同名檔案會覆蓋原有檔案（上傳前會在 Modal 提示）
7. **刪除警告**：刪除分類會遞迴刪除該分類下的所有檔案，且無法復原
8. **自動過濾**：檔案列表會自動過濾 `.gitkeep` 檔案，不會顯示在介面上

## 🎨 介面特色

- **響應式佈局**：分類卡片在大螢幕（≥1200px）以 5 欄顯示
- **分類即時過濾**：現有分類區塊提供輸入框可即時過濾分類，支援清除按鈕
- **動態圖示**：未選取分類顯示空心資料夾，選取後顯示實心資料夾
- **刪除按鈕**：僅在選取分類時顯示紅色垃圾桶圖示
- **Modal 確認**：所有危險操作（上傳、刪除）皆使用 Bootstrap Modal 確認
- **Toast 通知**：操作成功/失敗會在右上角顯示 Toast 提示
- **固定導航列**：頂部導航列和底部 Footer 固定顯示
- **主題適配**：所有元件（包含 Modal、Toast、Footer）皆支援亮色/暗色主題

## 👨‍💻 開發指南

### 程式碼規範

1. **模組化原則**：每個功能獨立成模組，避免單一檔案過大
2. **常數管理**：所有 DOM ID 必須定義在 `core/constants.js` 的 `DOM_IDS` 物件中
3. **事件通訊**：跨模組通訊使用事件匯流排，避免直接相依
4. **日誌記錄**：使用 `logger` 模組記錄關鍵操作，不直接使用 `console.log`
5. **錯誤處理**：使用 try-catch 捕捉錯誤，並透過 `logger.error` 記錄

### 添加新功能

**範例：添加新的 UI 元件**

1. 在 `js/ui/` 建立新模組檔案（例如：`new-feature.js`）
2. 在 `core/constants.js` 添加所需的 DOM ID 常數
3. 實作模組功能，匯出公開 API
4. 在 `js/ui/index.js` 中匯入並重新匯出
5. 在 `js/app.js` 中初始化新模組

```javascript
// js/ui/new-feature.js
import { DOM_IDS } from '../core/index.js';
import { logger } from '../core/index.js';

export function init() {
    logger.info('NewFeature', '初始化新功能');
    // 實作邏輯
}

export function doSomething() {
    const element = document.getElementById(DOM_IDS.YOUR_NEW_ELEMENT);
    // 操作邏輯
}
```

### 程式碼品質

- ✅ **零硬編碼 DOM ID**：所有 DOM ID 皆透過 `DOM_IDS` 常數引用
- ✅ **零 console.log**：統一使用 `logger` 模組記錄日誌
- ✅ **完整 JSDoc 註解**：所有函數皆有清晰的文檔註解
- ✅ **錯誤處理完整**：關鍵操作皆有 try-catch 與錯誤日誌
- ✅ **事件解耦**：模組間透過事件匯流排通訊

### 除錯技巧

1. **啟用詳細日誌**：開啟瀏覽器開發者工具查看 logger 輸出
2. **事件追蹤**：在 `core/event-bus.js` 中查看事件流向
3. **DOM 檢查**：透過 `DOM_IDS` 常數確認元素 ID 是否正確
4. **API 測試**：使用 `repo/github-api.js` 的測試函數驗證 API 操作

## 🤝 貢獻

歡迎提交 Issues 和 Pull Requests！

## 📄 授權

MIT License

---

Made with ❤️ by PoyChang
