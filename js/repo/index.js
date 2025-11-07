/**
 * Repo 模組統一入口
 * 整合所有 Repo 子模組並提供統一的初始化與導出
 */

import { CONFIG, CUSTOM_EVENTS } from '../core/index.js';

// GitHub API 基礎
import {
    ensureOctokit,
    getRepoContents,
    putRepoFile,
    deleteRepoFile,
    checkFileExists
} from './github-api.js';

// 工具函數
import {
    fileToBase64,
    getFileType,
    getFileIcon,
    formatFileSize,
    sanitizeFolderName,
    isValidFilename,
    getFileExtension,
    getSupportedExtensions
} from './utils.js';

// 檔案操作
import {
    setCurrentSubFolder,
    getCurrentSubFolder,
    getFileUrl,
    uploadFile,
    uploadFiles,
    listFiles,
    deleteFile,
    resetCurrentFolder
} from './file-operations.js';

// 資料夾操作
import {
    createSubFolder,
    listSubFolders,
    deleteSubFolder,
    folderExists,
    getFolderFileCount
} from './folder-operations.js';

// 回調函數
let onFileOperationSuccess = null;
let onFileOperationFail = null;

/**
 * 初始化 Repo 模組
 * @param {Object} config - 設定物件
 * @param {Function} [config.onFileOperationSuccess] - 操作成功回調
 * @param {Function} [config.onFileOperationFail] - 操作失敗回調
 */
export function initRepo(config) {
    // 設定回調
    if (config && config.onFileOperationSuccess) {
        onFileOperationSuccess = config.onFileOperationSuccess;
    }
    if (config && config.onFileOperationFail) {
        onFileOperationFail = config.onFileOperationFail;
    }

    // 監聽登出事件
    window.addEventListener(CUSTOM_EVENTS.AUTH_LOGOUT, handleLogout);
}

/**
 * 處理登出事件
 */
function handleLogout() {
    resetCurrentFolder();
}

/**
 * 取得操作成功回調
 * @returns {Function|null} 回調函數
 */
export function getSuccessCallback() {
    return onFileOperationSuccess;
}

/**
 * 取得操作失敗回調
 * @returns {Function|null} 回調函數
 */
export function getFailCallback() {
    return onFileOperationFail;
}

// ============================================
// 重新導出所有子模組的公開 API
// 確保向後相容性
// ============================================

// GitHub API 相關
export {
    ensureOctokit,
    getRepoContents,
    putRepoFile,
    deleteRepoFile,
    checkFileExists
};

// 工具函數相關
export {
    fileToBase64,
    getFileType,
    getFileIcon,
    formatFileSize,
    sanitizeFolderName,
    isValidFilename,
    getFileExtension,
    getSupportedExtensions
};

// 檔案操作相關
export {
    setCurrentSubFolder,
    getCurrentSubFolder,
    getFileUrl,
    uploadFile,
    uploadFiles,
    listFiles,
    deleteFile
};

// 資料夾操作相關
export {
    createSubFolder,
    listSubFolders,
    deleteSubFolder,
    folderExists,
    getFolderFileCount
};
