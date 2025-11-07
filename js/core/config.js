/**
 * Core - 應用程式配置模組
 * 集中管理應用程式的所有配置項目
 */

/**
 * 應用程式設定（使用 Personal Access Token 驗證）
 */
export const CONFIG = {
    // 預設的儲存庫設定（用於文件上傳）
    defaultRepo: {
        owner: 'poychang',
        repo: 'files.poychang.net',
        branch: 'main'
    },
    
    // 檔案儲存路徑設定
    fileBasePath: 'storage',
    
    // 預設子資料夾（可在 UI 中修改）
    defaultSubFolder: 'default',
    
    // GitHub Pages URL 基礎路徑
    githubPagesBaseUrl: 'https://files.poychang.net'
};

/**
 * 取得儲存庫資訊
 */
export function getRepoInfo() {
    return { ...CONFIG.defaultRepo };
}

/**
 * 取得檔案基礎路徑
 */
export function getFileBasePath() {
    return CONFIG.fileBasePath;
}

/**
 * 取得預設子資料夾
 */
export function getDefaultSubFolder() {
    return CONFIG.defaultSubFolder;
}

/**
 * 取得 GitHub Pages 基礎 URL
 */
export function getGithubPagesBaseUrl() {
    return CONFIG.githubPagesBaseUrl;
}

/**
 * 取得完整配置（唯讀）
 */
export function getConfig() {
    return { ...CONFIG };
}
