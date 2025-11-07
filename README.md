# GitHub Pages 檔案託管服務

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

在 `config.js` 中設定你的 GitHub 儲存庫資訊：

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
├── config.js           # 設定檔（儲存庫、路徑、預設分類）
├── README.md           # 說明文件
├── css/
│   └── styles.css      # 自訂樣式（含主題切換、Modal、Footer 等）
├── js/
│   ├── app.js          # 主應用程式邏輯（檔案上傳流程）
│   ├── auth.js         # 認證管理（Personal Access Token）
│   ├── repo.js         # GitHub API 操作（上傳、刪除、列表、分類管理）
│   └── ui.js           # UI 管理（Modal、Toast、主題切換、分類卡片、分類過濾）
└── storage/            # 上傳的檔案會儲存在這裡（可在 config.js 設定）
    ├── default/        # 預設分類資料夾
    ├── images/         # 圖片分類（範例）
    └── ...             # 其他自訂分類
```

## 🔧 技術架構

- **前端框架**：原生 JavaScript (ES6 Modules)
- **UI 框架**：Bootstrap 5.3（含 Modal、Toast、響應式網格）
- **圖示**：Bootstrap Icons
- **GitHub API**：Octokit (透過 CDN 引入)
- **主題系統**：CSS 變數 + localStorage 持久化
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

## 🤝 貢獻

歡迎提交 Issues 和 Pull Requests！

## 📄 授權

MIT License

---

Made with ❤️ by PoyChang
