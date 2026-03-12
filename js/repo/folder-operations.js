/**
 * 資料夾操作模組
 * 處理資料夾的建立、列表、刪除等操作
 */

import { getRepoContents, putRepoFile, deleteRepoFile } from './github-api.js';
import { sanitizeFolderName } from './utils.js';
import { CONFIG, ERROR_MESSAGES } from '../core/index.js';

const FOLDER_SYNC_DELAY_MS = 400;
const FOLDER_SYNC_MAX_ATTEMPTS = 6;

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

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function deleteFolderPathRecursively(folderPath, rootFolderName) {
    const contents = await getRepoContents(folderPath);

    for (const item of contents) {
        if (item.type === 'dir') {
            await deleteFolderPathRecursively(item.path, rootFolderName);
            continue;
        }

        if (item.type === 'file') {
            await deleteRepoFile(
                item.path,
                item.sha,
                `Delete ${item.path} from folder ${rootFolderName}`
            );
            continue;
        }

        throw new Error(`刪除分類失敗：無法處理 ${item.path} 的項目類型 "${item.type}"。`);
    }
}

async function refreshUntil(predicate, options = {}) {
    const {
        attempts = FOLDER_SYNC_MAX_ATTEMPTS,
        delayMs = FOLDER_SYNC_DELAY_MS,
    } = options;

    let folders = [];

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        folders = await listSubFolders();
        if (predicate(folders)) {
            return folders;
        }

        if (attempt < attempts) {
            await wait(delayMs);
        }
    }

    return folders;
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
 * 等待資料夾列表同步到預期狀態
 * @param {Object} params - 同步參數
 * @param {string} params.folderName - 資料夾名稱
 * @param {'exists'|'missing'} params.expectedState - 預期狀態
 * @param {number} [params.attempts] - 最大重試次數
 * @param {number} [params.delayMs] - 每次重試間隔（毫秒）
 * @returns {Promise<{folders: Array, synced: boolean}>} 同步結果
 */
export async function waitForFolderState({
    folderName,
    expectedState,
    attempts,
    delayMs,
}) {
    if (!folderName || folderName.trim() === '') {
        throw new Error(ERROR_MESSAGES.FOLDER_NAME_REQUIRED);
    }

    if (!['exists', 'missing'].includes(expectedState)) {
        throw new Error('無效的資料夾同步狀態');
    }

    const normalizedFolderName = folderName.trim().toLowerCase();
    const targetExists = expectedState === 'exists';
    const folders = await refreshUntil((currentFolders) => {
        const exists = currentFolders.some(
            (folder) => folder.name.toLowerCase() === normalizedFolderName
        );
        return exists === targetExists;
    }, { attempts, delayMs });

    const synced = folders.some(
        (folder) => folder.name.toLowerCase() === normalizedFolderName
    ) === targetExists;

    return {
        folders,
        synced,
    };
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

    const normalizedFolderName = folderName.trim();
    const folderPath = `${CONFIG.fileBasePath}/${normalizedFolderName}`;

    try {
        await deleteFolderPathRecursively(folderPath, normalizedFolderName);
        return true;
    } catch (error) {
        throw new Error(
            `刪除分類「${normalizedFolderName}」失敗：${error.message || '發生未知錯誤'}`
        );
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

