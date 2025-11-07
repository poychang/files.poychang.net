/**
 * Repository 管理模組
 * 處理 GitHub Repo 檔案上傳、瀏覽、刪除等操作
 */

import { getOctokit } from './auth.js';

let currentSubFolder = CONFIG.defaultSubFolder;
let onFileOperationSuccess = null;
let onFileOperationFail = null;

// 檔案副檔名常數集中化
const EXTENSIONS = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'],
    video: ['mp4', 'webm', 'ogg', 'mov', 'avi'],
    audio: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
    document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md'],
    code: ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'yml', 'yaml'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz'],
};

/**
 * 初始化 Repo 模組
 */
export function initRepo(config) {
    // 設定回調
    if (config.onFileOperationSuccess) onFileOperationSuccess = config.onFileOperationSuccess;
    if (config.onFileOperationFail) onFileOperationFail = config.onFileOperationFail;

    // 監聽登出事件
    window.addEventListener('auth:logout', handleLogout);
}

/**
 * 處理登出事件
 */
function handleLogout() {
    currentSubFolder = CONFIG.defaultSubFolder;
}

/**
 * 設定當前子資料夾
 */
export function setCurrentSubFolder(folderName) {
    currentSubFolder = folderName || CONFIG.defaultSubFolder;
}

/**
 * 取得當前子資料夾
 */
export function getCurrentSubFolder() {
    return currentSubFolder;
}

/**
 * 取得完整的檔案路徑
 */
function getFilePath(filename) {
    return `${CONFIG.fileBasePath}/${currentSubFolder}/${filename}`;
}

/**
 * 取得 GitHub Pages 的檔案 URL
 */
export function getFileUrl(filename) {
    return `${CONFIG.githubPagesBaseUrl}/${CONFIG.fileBasePath}/${currentSubFolder}/${filename}`;
}

/**
 * 將檔案轉換為 Base64
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // 移除 data URL 的前綴，只保留 base64 內容
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * 上傳單個檔案到 GitHub
 */
export async function uploadFile(file) {
    const octokit = getOctokit();

    if (!octokit) {
        throw new Error('請先登入 GitHub');
    }

    if (!file) {
        throw new Error('請選擇檔案');
    }

    try {
        // 轉換檔案為 Base64
        const content = await fileToBase64(file);
        const path = getFilePath(file.name);

        // 檢查檔案是否已存在
        let sha = null;
        try {
            const { data: existingFile } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: CONFIG.defaultRepo.owner,
                repo: CONFIG.defaultRepo.repo,
                path: path,
                ref: CONFIG.defaultRepo.branch,
            });
            sha = existingFile.sha; // 如果存在，取得 SHA 以便更新
        } catch (error) {
            // 檔案不存在，這是正常的
        }

        // 上傳或更新檔案
        const { data } = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: CONFIG.defaultRepo.owner,
            repo: CONFIG.defaultRepo.repo,
            path: path,
            message: `Upload ${file.name}`,
            content: content,
            branch: CONFIG.defaultRepo.branch,
            sha: sha, // 如果是更新，需要提供 SHA
        });

        return {
            name: file.name,
            path: path,
            url: getFileUrl(file.name),
            sha: data.content.sha,
        };
    } catch (error) {
        console.error('Upload error:', error);
        throw new Error(`上傳失敗：${error.message}`);
    }
}

/**
 * 批次上傳多個檔案
 */
export async function uploadFiles(files, progressCallback) {
    const results = [];
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            const result = await uploadFile(file);
            results.push({ success: true, file: file.name, result });

            if (progressCallback) {
                progressCallback({
                    current: i + 1,
                    total: total,
                    percentage: Math.round(((i + 1) / total) * 100),
                    currentFile: file.name,
                });
            }
        } catch (error) {
            results.push({ success: false, file: file.name, error: error.message });
        }
    }

    return results;
}

/**
 * 建立新的子資料夾（通過建立 .gitkeep 檔案）
 */
export async function createSubFolder(folderName) {
    const octokit = getOctokit();

    if (!octokit) {
        throw new Error('請先登入 GitHub');
    }

    if (!folderName || folderName.trim() === '') {
        throw new Error('請輸入分類名稱');
    }

    // 清理分類名稱（移除特殊字元）
    const cleanFolderName = folderName.trim().replace(/[^a-zA-Z0-9_-]/g, '-');
    const gitkeepPath = `${CONFIG.fileBasePath}/${cleanFolderName}/.gitkeep`;

    try {
        // 檢查分類是否已存在
        try {
            await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: CONFIG.defaultRepo.owner,
                repo: CONFIG.defaultRepo.repo,
                path: `${CONFIG.fileBasePath}/${cleanFolderName}`,
                ref: CONFIG.defaultRepo.branch,
            });
            // 如果沒有拋出錯誤，表示分類已存在
            throw new Error(`分類 "${cleanFolderName}" 已存在`);
        } catch (error) {
            if (error.status !== 404) {
                // 如果不是 404 錯誤，表示是其他問題
                throw error;
            }
            // 404 表示分類不存在，可以繼續建立
        }

        // 建立 .gitkeep 檔案來建立分類
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: CONFIG.defaultRepo.owner,
            repo: CONFIG.defaultRepo.repo,
            path: gitkeepPath,
            message: `Create folder: ${cleanFolderName}`,
            content: btoa(''), // 空內容的 base64
            branch: CONFIG.defaultRepo.branch,
        });

        if (onFileOperationSuccess) {
            onFileOperationSuccess(`✓ 成功建立分類：${cleanFolderName}`);
        }

        return {
            name: cleanFolderName,
            path: `${CONFIG.fileBasePath}/${cleanFolderName}`,
        };
    } catch (error) {
        const errorMsg = error.message || `建立分類失敗：${error.message}`;
        if (onFileOperationFail) {
            onFileOperationFail(errorMsg);
        }
        throw new Error(errorMsg);
    }
}

/**
 * 取得 files 下的所有分類
 */
export async function listSubFolders() {
    const octokit = getOctokit();

    if (!octokit) {
        throw new Error('請先登入 GitHub');
    }

    try {
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: CONFIG.defaultRepo.owner,
            repo: CONFIG.defaultRepo.repo,
            path: CONFIG.fileBasePath,
            ref: CONFIG.defaultRepo.branch,
        });

        // 過濾出分類並按字母順序排序
        const folders = data
            .filter((item) => item.type === 'dir')
            .map((folder) => ({
                name: folder.name,
                path: folder.path,
                sha: folder.sha,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        return folders;
    } catch (error) {
        if (error.status === 404) {
            // files 路徑不存在，返回空陣列
            return [];
        }
        throw new Error(`取得分類列表失敗：${error.message}`);
    }
}

/**
 * 取得指定分類下的檔案列表
 */
export async function listFiles(subFolder) {
    const octokit = getOctokit();

    if (!octokit) {
        throw new Error('請先登入 GitHub');
    }

    const folder = subFolder || currentSubFolder;
    const path = `${CONFIG.fileBasePath}/${folder}`;

    try {
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: CONFIG.defaultRepo.owner,
            repo: CONFIG.defaultRepo.repo,
            path: path,
            ref: CONFIG.defaultRepo.branch,
        });

        // 過濾出檔案（排除資料夾）
        const files = data
            .filter((item) => item.type === 'file')
            .map((file) => ({
                name: file.name,
                path: file.path,
                sha: file.sha,
                size: file.size,
                url: getFileUrl(file.name),
                downloadUrl: file.download_url,
                type: getFileType(file.name),
            }));

        return files;
    } catch (error) {
        if (error.status === 404) {
            // 分類不存在，返回空陣列
            return [];
        }
        throw new Error(`取得檔案列表失敗：${error.message}`);
    }
}

/**
 * 刪除檔案
 */
export async function deleteFile(filename, sha) {
    const octokit = getOctokit();

    if (!octokit) {
        throw new Error('請先登入 GitHub');
    }

    const path = getFilePath(filename);

    try {
        await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
            owner: CONFIG.defaultRepo.owner,
            repo: CONFIG.defaultRepo.repo,
            path: path,
            message: `Delete ${filename}`,
            sha: sha,
            branch: CONFIG.defaultRepo.branch,
        });

        if (onFileOperationSuccess) {
            onFileOperationSuccess(`已刪除檔案：${filename}`);
        }

        return true;
    } catch (error) {
        const errorMsg = `刪除檔案失敗：${error.message}`;
        if (onFileOperationFail) {
            onFileOperationFail(errorMsg);
        }
        throw new Error(errorMsg);
    }
}

/**
 * 取得檔案類型
 */
function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    for (const [type, list] of Object.entries(EXTENSIONS)) {
        if (list.includes(ext)) return type;
    }
    return 'file';
}

/**
 * 取得檔案圖示
 */
export function getFileIcon(type) {
    const iconMap = {
        image: 'bi-file-image',
        video: 'bi-file-play',
        audio: 'bi-file-music',
        document: 'bi-file-text',
        code: 'bi-file-code',
        archive: 'bi-file-zip',
        file: 'bi-file-earmark',
    };

    return iconMap[type] || 'bi-file-earmark';
}

/**
 * 格式化檔案大小
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
