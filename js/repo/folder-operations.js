/**
 * 資料夾操作模組
 * 處理資料夾的建立、列表、刪除等操作
 */

import { getRepoContents, putRepoFile, deleteRepoFile } from './github-api.js';
import { sanitizeFolderName } from './utils.js';
import { CONFIG, ERROR_MESSAGES } from '../core/index.js';

/**
 * 建立新的子資料夾（通過建立 .gitkeep 檔案）
 * @param {string} folderName - 資料夾名稱
 * @returns {Promise<Object>} 建立結果
 */
export async function createSubFolder(folderName) {
    if (!folderName || folderName.trim() === '') {
        throw new Error(ERROR_MESSAGES.FOLDER_NAME_REQUIRED);
    }

    // 清理分類名稱（移除特殊字元）
    const cleanFolderName = sanitizeFolderName(folderName);
    const gitkeepPath = `${CONFIG.fileBasePath}/${cleanFolderName}/.gitkeep`;

    try {
        // 以列表查重，避免對單一路徑發出 404 的請求
        const existing = await listSubFolders();
        const exists = existing.some(f => f.name.toLowerCase() === cleanFolderName.toLowerCase());
        if (exists) {
            throw new Error(`${ERROR_MESSAGES.FOLDER_ALREADY_EXISTS.replace('分類', `分類 "${cleanFolderName}"`)}`);
        }

        // 建立 .gitkeep 檔案來建立分類（使用換行做為安全內容，避免空內容的相容性問題）
        await putRepoFile(
            gitkeepPath,
            btoa('\n'), // 簡單內容的 base64，避免空內容相容性問題
            `Create folder: ${cleanFolderName}`
        );

        return {
            name: cleanFolderName,
            path: `${CONFIG.fileBasePath}/${cleanFolderName}`,
        };
    } catch (error) {
        throw new Error(error.message || `建立分類失敗：${error.message}`);
    }
}

/**
 * 取得 files 下的所有分類
 * @returns {Promise<Array>} 資料夾列表
 */
export async function listSubFolders() {
    try {
        const data = await getRepoContents(CONFIG.fileBasePath);

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
 * 刪除分類（遞迴刪除資料夾內所有檔案）
 * @param {string} folderName - 資料夾名稱
 * @returns {Promise<boolean>} 是否成功
 */
export async function deleteSubFolder(folderName) {
    if (!folderName || folderName.trim() === '') {
        throw new Error(ERROR_MESSAGES.FOLDER_NAME_REQUIRED);
    }

    const folderPath = `${CONFIG.fileBasePath}/${folderName}`;

    try {
        // 先取得該資料夾下的所有檔案
        const contents = await getRepoContents(folderPath);

        // 遞迴刪除所有檔案
        for (const item of contents) {
            await deleteRepoFile(
                item.path,
                item.sha,
                `Delete ${item.name} from folder ${folderName}`
            );
        }

        return true;
    } catch (error) {
        throw new Error(error.message || `刪除分類失敗：${error.message}`);
    }
}

/**
 * 檢查資料夾是否存在
 * @param {string} folderName - 資料夾名稱
 * @returns {Promise<boolean>} 是否存在
 */
export async function folderExists(folderName) {
    try {
        const folders = await listSubFolders();
        return folders.some(f => f.name.toLowerCase() === folderName.toLowerCase());
    } catch (error) {
        return false;
    }
}

/**
 * 取得資料夾內容數量
 * @param {string} folderName - 資料夾名稱
 * @returns {Promise<number>} 檔案數量
 */
export async function getFolderFileCount(folderName) {
    try {
        const folderPath = `${CONFIG.fileBasePath}/${folderName}`;
        const contents = await getRepoContents(folderPath);
        
        // 排除 .gitkeep 檔案
        return contents.filter(item => item.type === 'file' && item.name !== '.gitkeep').length;
    } catch (error) {
        return 0;
    }
}
