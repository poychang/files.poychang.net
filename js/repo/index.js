/**
 * Repo 模組應用程式入口。
 * 只保留 app.js 啟動流程與上傳協調需要的高階資料層 API。
 */

import { CUSTOM_EVENTS } from '../core/index.js';
import {
    validateUploadSelection,
    buildUploadPreflightSummary,
    buildUploadSelectionFeedback,
    getSupportedUploadExtensions,
} from './upload-validation.js';
import {
    getCurrentSubFolder,
    prepareUploadBatch,
    uploadFiles,
    resetCurrentFolder,
} from './file-operations.js';

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

export {
    validateUploadSelection,
    buildUploadPreflightSummary,
    buildUploadSelectionFeedback,
    getSupportedUploadExtensions,
};

export {
    getCurrentSubFolder,
    prepareUploadBatch,
    uploadFiles,
};
