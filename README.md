# GitHub Pages 文件託管服務

這是一個使用 GitHub Pages 來託管文件的單頁應用程式（SPA），主要用於圖片和其他類型文件的上傳和管理。

## 🌟 功能特色

- 📤 **檔案上傳**：支援拖曳上傳或點擊選擇檔案
- 📁 **資料夾管理**：可自訂子資料夾名稱來組織檔案
- 👀 **檔案瀏覽**：查看特定資料夾下的所有檔案
- 🖼️ **圖片預覽**：直接在列表中預覽圖片檔案
- 📋 **複製連結**：一鍵複製檔案的 GitHub Pages URL
- 🗑️ **刪除檔案**：可直接刪除不需要的檔案
- 🎨 **美觀介面**：使用 Bootstrap 5 打造的現代化介面

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
    // GitHub OAuth 應用程式設定
    clientId: 'your-client-id',
    scopes: ['public_repo', 'repo'],
    
    // 預設的儲存庫設定（用於文件上傳）
    defaultRepo: {
        owner: 'your-username',        // 你的 GitHub 使用者名稱
        repo: 'files.your-domain.net', // 你的儲存庫名稱
        branch: 'main'                 // 分支名稱
    },
    
    // 檔案儲存路徑設定
    fileBasePath: 'files',
    
    // 預設子資料夾
    defaultSubFolder: 'images',
    
    // GitHub Pages URL 基礎路徑
    githubPagesBaseUrl: 'https://your-username.github.io/files.your-domain.net'
};
```

### 3. 啟用 GitHub Pages

1. 在你的儲存庫中，前往 Settings → Pages
2. 選擇 Source：Deploy from a branch
3. 選擇 Branch：main（或你設定的分支）
4. 點擊 Save

### 4. 使用應用程式

1. 開啟網站並使用 Personal Access Token 登入
2. 在「資料夾設定」區域輸入子資料夾名稱（例如：photos, documents）
3. 點擊「瀏覽資料夾」來查看該資料夾的檔案
4. 使用拖曳或點擊「選擇檔案」來上傳檔案
5. 上傳後，可以：
   - 點擊「複製連結」來取得檔案的 GitHub Pages URL
   - 點擊「刪除」來移除檔案

## 📂 檔案結構

```
files.poychang.net/
├── index.html          # 主頁面
├── config.js           # 設定檔
├── README.md           # 說明文件
├── css/
│   └── styles.css      # 自訂樣式
├── js/
│   ├── app.js          # 主應用程式邏輯
│   ├── auth.js         # 認證管理
│   ├── repo.js         # 檔案操作（上傳、刪除、列表）
│   └── ui.js           # UI 管理
└── files/              # 上傳的檔案會儲存在這裡
    ├── images/         # 圖片資料夾（範例）
    ├── documents/      # 文件資料夾（範例）
    └── ...             # 其他自訂資料夾
```

## 🔧 技術架構

- **前端框架**：原生 JavaScript (ES6 Modules)
- **UI 框架**：Bootstrap 5
- **圖示**：Bootstrap Icons
- **GitHub API**：[@octokit/core](https://github.com/octokit/core.js)
- **託管**：GitHub Pages

## 📝 使用說明

### 上傳檔案

1. 選擇或輸入子資料夾名稱
2. 點擊「瀏覽資料夾」
3. 將檔案拖曳到上傳區域，或點擊「選擇檔案」
4. 確認上傳
5. 等待上傳完成

### 取得檔案連結

上傳的檔案會產生以下格式的 URL：

```
https://your-username.github.io/files.your-domain.net/files/{sub-folder-name}/{filename}
```

例如：
```
https://poychang.github.io/files.poychang.net/files/images/photo.jpg
```

### 管理檔案

- **瀏覽**：在「資料夾設定」區域輸入資料夾名稱後點擊「瀏覽資料夾」
- **重新整理**：點擊檔案列表右上角的「重新整理」按鈕
- **複製連結**：點擊檔案右側的「複製連結」按鈕
- **刪除檔案**：點擊檔案右側的「刪除」按鈕（需確認）

## ⚠️ 注意事項

1. **Token 安全**：請妥善保管你的 Personal Access Token，不要分享給他人
2. **儲存庫限制**：GitHub 有儲存庫大小限制（建議單個儲存庫不超過 1GB）
3. **檔案大小**：GitHub 單一檔案大小限制為 100MB
4. **快取**：GitHub Pages 有 CDN 快取，檔案更新後可能需要一些時間才能看到變更
5. **權限**：確保 Token 具有對目標儲存庫的 `repo` 權限

## 🤝 貢獻

歡迎提交 Issues 和 Pull Requests！

## 📄 授權

MIT License

---

Made with ❤️ by PoyChang
