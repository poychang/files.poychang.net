/**
 * 檔案操作模組
 * 處理檔案的上傳、列表、刪除等操作
 */

import { putRepoFile, deleteRepoFile, getRepoContents, checkFileExists } from './github-api.js';
import { fileToBase64, getFileType } from './utils.js';
import { CONFIG, ERROR_MESSAGES, createLogger } from '../core/index.js';

const logger = createLogger('FileOperations');

// 當前子資料夾
let currentSubFolder = CONFIG.defaultSubFolder;

/**
 * 設定當前子資料夾
 * @param {string} folderName - 資料夾名稱
 */
export function setCurrentSubFolder(folderName) {
    currentSubFolder = folderName || CONFIG.defaultSubFolder;
}

/**
 * 取得當前子資料夾
 * @returns {string} 當前資料夾名稱
 */
export function getCurrentSubFolder() {
    return currentSubFolder;
}

/**
 * 取得完整的檔案路徑
 * @param {string} filename - 檔案名稱
 * @returns {string} 完整路徑
 */
function getFilePath(filename) {
    return `${CONFIG.fileBasePath}/${currentSubFolder}/${filename}`;
}

/**
 * 取得 GitHub Pages 的檔案 URL
 * @param {string} filename - 檔案名稱
 * @returns {string} GitHub Pages URL
 */
export function getFileUrl(filename) {
    return `${CONFIG.githubPagesBaseUrl}/${CONFIG.fileBasePath}/${currentSubFolder}/${filename}`;
}

/**
 * 上傳單個檔案到 GitHub
 * @param {File} file - 要上傳的檔案
 * @returns {Promise<Object>} 上傳結果
 */
export async function uploadFile(file) {
    if (!file) {
        throw new Error(ERROR_MESSAGES.FILE_NOT_SELECTED);
    }

    try {
        // 轉換檔案為 Base64
        const content = await fileToBase64(file);
        const path = getFilePath(file.name);

        // 檢查檔案是否已存在
        const existingFile = await checkFileExists(path);
        const sha = existingFile ? existingFile.sha : null;

        // 上傳或更新檔案
        const data = await putRepoFile(
            path,
            content,
            `Upload ${file.name}`,
            sha
        );

        return {
            name: file.name,
            sha: data.content.sha,
        };
    } catch (error) {
        logger.error('Upload error:', error);
        throw error;
    }
}

/**
 * 批次上傳多個檔案
 * @param {FileList|Array} files - 要上傳的檔案列表
 * @param {Function} progressCallback - 進度回調函數
 * @returns {Promise<Array>} 上傳結果列表
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
 * 取得指定分類下的檔案列表
 * @param {string} [subFolder] - 子資料夾名稱，不指定則使用當前資料夾
 * @returns {Promise<Array>} 檔案列表
 */
export async function listFiles(subFolder) {
    const folder = subFolder || currentSubFolder;
    const path = `${CONFIG.fileBasePath}/${folder}`;

    try {
        const data = await getRepoContents(path);

        // 過濾出檔案（排除資料夾與 .gitkeep）
        const files = data
            .filter((item) => item.type === 'file' && item.name !== '.gitkeep')
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
 * @param {string} filename - 檔案名稱
 * @param {string} sha - 檔案 SHA
 * @returns {Promise<boolean>} 是否成功
 */
export async function deleteFile(filename, sha) {
    const path = getFilePath(filename);

    try {
        await deleteRepoFile(path, sha, `Delete ${filename}`);
        return true;
    } catch (error) {
        throw new Error(`刪除檔案失敗：${error.message}`);
    }
}

/**
 * 重置當前資料夾（用於登出時）
 */
export function resetCurrentFolder() {
    currentSubFolder = CONFIG.defaultSubFolder;
}
