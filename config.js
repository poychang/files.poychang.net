// 應用程式設定
const CONFIG = {
    // GitHub OAuth 應用程式設定
    clientId: '4beff413792d5dfbd9bf',
    scopes: ['public_repo', 'repo'],
    
    // 預設的儲存庫設定（用於文件上傳）
    defaultRepo: {
        owner: 'poychang',
        repo: 'files.poychang.net',
        branch: 'main'
    },
    
    // 檔案儲存路徑設定
    fileBasePath: 'files',
    
    // 預設子資料夾（可在 UI 中修改）
    defaultSubFolder: 'images',
    
    // GitHub Pages URL 基礎路徑
    githubPagesBaseUrl: 'https://poychang.github.io/files.poychang.net'
};
