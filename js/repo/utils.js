/**
 * 工具函數模組
 * 提供檔案處理相關的工具函數
 */

import { FILE_EXTENSIONS, FILE_ICON_MAP } from '../core/index.js';

/**
 * 將檔案轉換為 Base64
 * @param {File} file - 要轉換的檔案
 * @returns {Promise<string>} Base64 編碼的字串
 */
export function fileToBase64(file) {
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
 * 取得檔案類型
 * @param {string} filename - 檔案名稱
 * @returns {string} 檔案類型
 */
export function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    for (const [type, list] of Object.entries(FILE_EXTENSIONS)) {
        if (list.includes(ext)) return type;
    }
    return 'file';
}

/**
 * 取得檔案圖示
 * @param {string} type - 檔案類型
 * @returns {string} Bootstrap Icon 類別名稱
 */
export function getFileIcon(type) {
    return FILE_ICON_MAP[type] || FILE_ICON_MAP.file;
}

/**
 * 格式化檔案大小
 * @param {number} bytes - 位元組大小
 * @returns {string} 格式化後的檔案大小
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 清理資料夾名稱
 * @param {string} folderName - 原始資料夾名稱
 * @returns {string} 清理後的資料夾名稱
 */
export function sanitizeFolderName(folderName) {
    return folderName.trim().replace(/[^a-zA-Z0-9_-]/g, '-');
}

/**
 * 驗證檔案名稱
 * @param {string} filename - 檔案名稱
 * @returns {boolean} 是否有效
 */
export function isValidFilename(filename) {
    if (!filename || filename.trim() === '') return false;
    // 檢查是否包含非法字元
    const illegalChars = /[<>:"|?*\x00-\x1F]/;
    return !illegalChars.test(filename);
}

/**
 * 取得檔案副檔名
 * @param {string} filename - 檔案名稱
 * @returns {string} 副檔名 (小寫)
 */
export function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

/**
 * 取得支援的檔案類型清單
 * @returns {Object} 檔案類型對應表
 */
export function getSupportedExtensions() {
    return { ...EXTENSIONS };
}
