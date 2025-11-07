// 應用程式設定（使用 Personal Access Token 驗證）
const CONFIG = {
    // 預設的儲存庫設定（用於文件上傳）
    defaultRepo: {
        owner: 'poychang',
        repo: 'files.poychang.net',
        branch: 'main'
    },
    
    // 檔案儲存路徑設定
    fileBasePath: 'files',
    
    // 預設子資料夾（可在 UI 中修改）
    defaultSubFolder: 'default',
    
    // GitHub Pages URL 基礎路徑
    githubPagesBaseUrl: 'https://poychang.github.io/files.poychang.net'
};
