/**
 * Modal 對話框管理模組
 * 處理所有 Modal 對話框的初始化與操作
 */

import { DOM_IDS, PLATFORM_LIMITS } from '../core/index.js';

// Modal 實例
let deleteFolderModalInstance;
let uploadConfirmModalInstance;

// DOM 元素
let deleteFolderModal, folderToDeleteName, confirmDeleteFolderBtn;
let uploadConfirmModal, uploadFileCount, uploadTargetPath, uploadConfirmNotice, confirmUploadBtn;

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
    uploadConfirmNotice = document.getElementById(DOM_IDS.UPLOAD_CONFIRM_NOTICE);
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
 * @param {Object} [options] - 額外顯示選項
 * @param {string[]} [options.overwriteFiles] - 將會覆蓋的檔案名稱
 */
export function showUploadConfirmModal(fileCount, targetPath, onConfirm, options = {}) {
    if (!uploadConfirmModalInstance) return;

    // 設定檔案數量和目標路徑
    if (uploadFileCount) {
        uploadFileCount.textContent = fileCount;
    }
    if (uploadTargetPath) {
        uploadTargetPath.textContent = targetPath || '根目錄';
    }
    if (uploadConfirmNotice) {
        uploadConfirmNotice.innerHTML = buildUploadConfirmNotice(options.overwriteFiles || []);
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

function buildUploadConfirmNotice(overwriteFiles) {
    const defaultItems = [
        `單一檔案上限為 ${PLATFORM_LIMITS.MAX_FILE_SIZE_LABEL}。`,
        PLATFORM_LIMITS.API_RATE_LIMIT_GUIDANCE,
        PLATFORM_LIMITS.PAGES_CACHE_GUIDANCE,
    ];

    const overwriteNotice = overwriteFiles.length === 0
        ? `
            <div class="alert alert-success small mb-3">
                <i class="bi bi-check-circle me-2"></i>這批檔案都會新增，不會覆蓋既有內容。
            </div>
        `
        : `
            <div class="alert alert-warning small mb-3">
                <div class="fw-semibold mb-2">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    這次會覆蓋 ${overwriteFiles.length} 個既有檔案
                </div>
                <div>${overwriteFiles.map((filename) => `<code>${escapeHtml(filename)}</code>`).join('、')}</div>
            </div>
        `;

    return `
        ${overwriteNotice}
        <ul class="small text-muted mb-0 ps-3">
            ${defaultItems.map((item) => `<li>${item}</li>`).join('')}
        </ul>
    `;
}

function escapeHtml(value) {
    const escapedChars = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };

    return String(value).replace(/[&<>"']/g, (char) => escapedChars[char]);
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
