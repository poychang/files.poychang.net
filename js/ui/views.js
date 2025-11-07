/**
 * 視圖切換管理模組
 * 處理分類管理視圖與檔案管理視圖之間的切換
 */

import { DOM_IDS } from '../core/index.js';

// DOM 元素
let folderManagementView, fileManagementView, backToFoldersBtn;
let currentFolderNameEl, currentFolderNameHeaderEl;

/**
 * 初始化視圖管理
 */
export function initViews() {
    folderManagementView = document.getElementById(DOM_IDS.FOLDER_MANAGEMENT_VIEW);
    fileManagementView = document.getElementById(DOM_IDS.FILE_MANAGEMENT_VIEW);
    backToFoldersBtn = document.getElementById(DOM_IDS.BACK_TO_FOLDERS_BTN);
    currentFolderNameEl = document.getElementById(DOM_IDS.CURRENT_FOLDER_NAME);
    currentFolderNameHeaderEl = document.getElementById(DOM_IDS.CURRENT_FOLDER_NAME_HEADER);

    // 綁定返回按鈕
    if (backToFoldersBtn) {
        backToFoldersBtn.addEventListener('click', showFolderManagementView);
    }
}

/**
 * 顯示分類管理視圖
 */
export function showFolderManagementView() {
    if (folderManagementView && fileManagementView) {
        folderManagementView.classList.remove('d-none');
        fileManagementView.classList.add('d-none');
        
        // 清空目前分類顯示
        if (currentFolderNameEl) {
            currentFolderNameEl.textContent = '';
        }
        if (currentFolderNameHeaderEl) {
            currentFolderNameHeaderEl.textContent = '';
        }
    }
}

/**
 * 顯示檔案管理視圖
 * @param {string} folderName - 資料夾名稱
 */
export function showFileManagementView(folderName) {
    if (folderManagementView && fileManagementView) {
        folderManagementView.classList.add('d-none');
        fileManagementView.classList.remove('d-none');
    
        // 更新上傳區塊的目前分類顯示
        if (currentFolderNameEl) {
            currentFolderNameEl.textContent = folderName;
        }

        // 更新檔案列表標題旁的目前分類顯示
        if (currentFolderNameHeaderEl) {
            currentFolderNameHeaderEl.textContent = folderName;
        }
    }
}

/**
 * 取得當前視圖狀態
 * @returns {string} 'folder' 或 'file'
 */
export function getCurrentView() {
    if (folderManagementView && !folderManagementView.classList.contains('d-none')) {
        return 'folder';
    }
    if (fileManagementView && !fileManagementView.classList.contains('d-none')) {
        return 'file';
    }
    return 'unknown';
}

/**
 * 設定當前分類名稱顯示
 * @param {string} folderName - 資料夾名稱
 */
export function setCurrentFolderName(folderName) {
    if (currentFolderNameEl) {
        currentFolderNameEl.textContent = folderName;
    }
    if (currentFolderNameHeaderEl) {
        currentFolderNameHeaderEl.textContent = folderName;
    }
}

/**
 * 清除當前分類名稱顯示
 */
export function clearCurrentFolderName() {
    if (currentFolderNameEl) {
        currentFolderNameEl.textContent = '';
    }
    if (currentFolderNameHeaderEl) {
        currentFolderNameHeaderEl.textContent = '';
    }
}
