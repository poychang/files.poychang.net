/**
 * Core - 事件匯流排模組
 * 提供應用程式級別的事件發布/訂閱機制
 */

import { CUSTOM_EVENTS } from './constants.js';

/**
 * 發布自訂事件
 * @param {string} eventName - 事件名稱
 * @param {*} detail - 事件詳細資料
 */
export function emit(eventName, detail = null) {
    const event = new CustomEvent(eventName, { 
        detail,
        bubbles: true,
        cancelable: true 
    });
    window.dispatchEvent(event);
}

/**
 * 訂閱自訂事件
 * @param {string} eventName - 事件名稱
 * @param {Function} handler - 事件處理函數
 * @returns {Function} 取消訂閱的函數
 */
export function on(eventName, handler) {
    window.addEventListener(eventName, handler);
    
    // 返回取消訂閱函數
    return () => {
        window.removeEventListener(eventName, handler);
    };
}

/**
 * 訂閱一次性事件（觸發後自動取消訂閱）
 * @param {string} eventName - 事件名稱
 * @param {Function} handler - 事件處理函數
 */
export function once(eventName, handler) {
    const wrappedHandler = (event) => {
        handler(event);
        window.removeEventListener(eventName, wrappedHandler);
    };
    
    window.addEventListener(eventName, wrappedHandler);
}

/**
 * 取消事件訂閱
 * @param {string} eventName - 事件名稱
 * @param {Function} handler - 事件處理函數
 */
export function off(eventName, handler) {
    window.removeEventListener(eventName, handler);
}

// ========== 預定義事件發射器 ==========

/**
 * 發布認證成功事件
 */
export function emitAuthSuccess(user) {
    emit(CUSTOM_EVENTS.AUTH_SUCCESS, { user });
}

/**
 * 發布登出事件
 */
export function emitAuthLogout() {
    emit(CUSTOM_EVENTS.AUTH_LOGOUT);
}

/**
 * 發布檔案選擇事件
 */
export function emitFilesSelected(files) {
    emit(CUSTOM_EVENTS.FILES_SELECTED, { files });
}

/**
 * 發布分類切換事件
 */
export function emitFolderChanged(folderName) {
    emit(CUSTOM_EVENTS.FOLDER_CHANGED, { folderName });
}

/**
 * 發布分類建立事件
 */
export function emitFolderCreated(folderName) {
    emit(CUSTOM_EVENTS.FOLDER_CREATED, { folderName });
}

/**
 * 發布分類刪除事件
 */
export function emitFolderDeleted(folderName) {
    emit(CUSTOM_EVENTS.FOLDER_DELETED, { folderName });
}

/**
 * 發布檔案上傳事件
 */
export function emitFileUploaded(fileName) {
    emit(CUSTOM_EVENTS.FILE_UPLOADED, { fileName });
}

/**
 * 發布檔案刪除事件
 */
export function emitFileDeleted(fileName) {
    emit(CUSTOM_EVENTS.FILE_DELETED, { fileName });
}

/**
 * 發布檔案列表更新事件
 */
export function emitFileListUpdated() {
    emit(CUSTOM_EVENTS.FILE_LIST_UPDATED);
}

/**
 * 發布分類列表更新事件
 */
export function emitFolderListUpdated() {
    emit(CUSTOM_EVENTS.FOLDER_LIST_UPDATED);
}
