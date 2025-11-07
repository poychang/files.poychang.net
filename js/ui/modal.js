/**
 * Modal 對話框管理模組
 * 處理所有 Modal 對話框的初始化與操作
 */

import { DOM_IDS } from '../core/index.js';

// Modal 實例
let deleteFolderModalInstance;
let uploadConfirmModalInstance;

// DOM 元素
let deleteFolderModal, folderToDeleteName, confirmDeleteFolderBtn;
let uploadConfirmModal, uploadFileCount, uploadTargetPath, confirmUploadBtn;

/**
 * 初始化 Modal 系統
 */
export function initModal() {
    // 初始化刪除分類 Modal
    deleteFolderModal = document.getElementById(DOM_IDS.DELETE_FOLDER_MODAL);
    folderToDeleteName = document.getElementById(DOM_IDS.FOLDER_TO_DELETE_NAME);
    confirmDeleteFolderBtn = document.getElementById(DOM_IDS.CONFIRM_DELETE_FOLDER_BTN);
    
    if (deleteFolderModal) {
        deleteFolderModalInstance = new bootstrap.Modal(deleteFolderModal);
    }

    // 初始化上傳確認 Modal
    uploadConfirmModal = document.getElementById(DOM_IDS.UPLOAD_CONFIRM_MODAL);
    uploadFileCount = document.getElementById(DOM_IDS.UPLOAD_FILE_COUNT);
    uploadTargetPath = document.getElementById(DOM_IDS.UPLOAD_TARGET_PATH);
    confirmUploadBtn = document.getElementById(DOM_IDS.CONFIRM_UPLOAD_BTN);
    
    if (uploadConfirmModal) {
        uploadConfirmModalInstance = new bootstrap.Modal(uploadConfirmModal);
    }
}

/**
 * 顯示刪除分類確認對話框
 * @param {string} folderName - 要刪除的分類名稱
 * @param {Function} onConfirm - 確認刪除的回調函數
 */
export function showDeleteFolderModal(folderName, onConfirm) {
    if (!deleteFolderModalInstance) return;

    // 設定分類名稱
    if (folderToDeleteName) {
        folderToDeleteName.textContent = folderName;
    }

    // 綁定確認按鈕事件
    if (confirmDeleteFolderBtn) {
        // 移除舊的事件監聽器（避免重複綁定）
        const newBtn = confirmDeleteFolderBtn.cloneNode(true);
        confirmDeleteFolderBtn.parentNode.replaceChild(newBtn, confirmDeleteFolderBtn);
        confirmDeleteFolderBtn = newBtn;

        confirmDeleteFolderBtn.addEventListener('click', () => {
            // 先隱藏 Modal
            deleteFolderModalInstance.hide();
            
            // 等待 Modal 完全隱藏後再執行回調 (使用 once: true 確保只執行一次)
            deleteFolderModal.addEventListener('hidden.bs.modal', async () => {
                if (onConfirm) {
                    await onConfirm();
                }
            }, { once: true });
        });
    }

    // 顯示 Modal
    deleteFolderModalInstance.show();
}

/**
 * 隱藏刪除分類對話框
 */
export function hideDeleteFolderModal() {
    if (deleteFolderModalInstance) {
        deleteFolderModalInstance.hide();
    }
}

/**
 * 顯示上傳確認對話框
 * @param {number} fileCount - 要上傳的檔案數量
 * @param {string} targetPath - 目標路徑
 * @param {Function} onConfirm - 確認上傳的回調函數
 */
export function showUploadConfirmModal(fileCount, targetPath, onConfirm) {
    if (!uploadConfirmModalInstance) return;

    // 設定檔案數量和目標路徑
    if (uploadFileCount) {
        uploadFileCount.textContent = fileCount;
    }
    if (uploadTargetPath) {
        uploadTargetPath.textContent = targetPath || '根目錄';
    }

    // 綁定確認按鈕事件
    if (confirmUploadBtn) {
        // 移除舊的事件監聽器（避免重複綁定）
        const newBtn = confirmUploadBtn.cloneNode(true);
        confirmUploadBtn.parentNode.replaceChild(newBtn, confirmUploadBtn);
        confirmUploadBtn = newBtn;

        confirmUploadBtn.addEventListener('click', () => {
            // 先隱藏 Modal
            uploadConfirmModalInstance.hide();
            
            // 等待 Modal 完全隱藏後再執行回調 (使用 once: true 確保只執行一次)
            uploadConfirmModal.addEventListener('hidden.bs.modal', async () => {
                if (onConfirm) {
                    await onConfirm();
                }
            }, { once: true });
        });
    }

    // 顯示 Modal
    uploadConfirmModalInstance.show();
}

/**
 * 隱藏上傳確認對話框
 */
export function hideUploadConfirmModal() {
    if (uploadConfirmModalInstance) {
        uploadConfirmModalInstance.hide();
    }
}

/**
 * 取得刪除分類 Modal 實例
 * @returns {bootstrap.Modal} Modal 實例
 */
export function getDeleteFolderModalInstance() {
    return deleteFolderModalInstance;
}

/**
 * 取得上傳確認 Modal 實例
 * @returns {bootstrap.Modal} Modal 實例
 */
export function getUploadConfirmModalInstance() {
    return uploadConfirmModalInstance;
}
