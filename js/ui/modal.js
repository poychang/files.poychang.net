/**
 * Modal 對話框管理模組
 * 處理所有 Modal 對話框的初始化與操作
 */

import { DOM_IDS, PLATFORM_LIMITS } from '../core/index.js';
import { showButtonLoading, hideButtonLoading } from './loading.js';

// Modal 實例
let deleteFolderModalInstance;
let deleteFileModalInstance;
let uploadConfirmModalInstance;

// DOM 元素
let deleteFolderModal, folderToDeleteName, confirmDeleteFolderBtn;
let deleteFileModal, fileToDeleteName, confirmDeleteFileBtn;
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

    // 初始化刪除檔案 Modal
    deleteFileModal = document.getElementById(DOM_IDS.DELETE_FILE_MODAL);
    fileToDeleteName = document.getElementById(DOM_IDS.FILE_TO_DELETE_NAME);
    confirmDeleteFileBtn = document.getElementById(DOM_IDS.CONFIRM_DELETE_FILE_BTN);

    if (deleteFileModal) {
        deleteFileModalInstance = new bootstrap.Modal(deleteFileModal);
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
    showDangerActionModal({
        modalElement: deleteFolderModal,
        modalInstance: deleteFolderModalInstance,
        nameElement: folderToDeleteName,
        actionName: folderName,
        confirmButton: confirmDeleteFolderBtn,
        onConfirm,
    });
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
 * 顯示刪除檔案確認對話框
 * @param {string} fileName - 要刪除的檔案名稱
 * @param {Function} onConfirm - 確認刪除的回調函數
 */
export function showDeleteFileModal(fileName, onConfirm) {
    showDangerActionModal({
        modalElement: deleteFileModal,
        modalInstance: deleteFileModalInstance,
        nameElement: fileToDeleteName,
        actionName: fileName,
        confirmButton: confirmDeleteFileBtn,
        onConfirm,
        loadingText: '刪除中...',
    });
}

/**
 * 隱藏刪除檔案對話框
 */
export function hideDeleteFileModal() {
    if (deleteFileModalInstance) {
        deleteFileModalInstance.hide();
    }
}

/**
 * 顯示上傳確認對話框
 * @param {number} fileCount - 要上傳的檔案數量
 * @param {string} targetPath - 目標路徑
 * @param {Function} onConfirm - 確認上傳的回調函數
 * @param {Object} [options] - 額外顯示選項
 * @param {Object} [options.preflight] - 上傳前驗證摘要
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
        uploadConfirmNotice.innerHTML = buildUploadConfirmNotice(options.preflight || {});
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

function buildUploadConfirmNotice(preflight) {
    const defaultItems = [
        `單一檔案上限為 ${PLATFORM_LIMITS.MAX_FILE_SIZE_LABEL}。`,
        `單次最多上傳 ${PLATFORM_LIMITS.MAX_UPLOAD_FILE_COUNT} 個檔案。`,
        PLATFORM_LIMITS.API_RATE_LIMIT_GUIDANCE,
        PLATFORM_LIMITS.PAGES_CACHE_GUIDANCE,
    ];

    const skippedNotice = preflight.skippedFileCount > 0
        ? `
            <div class="alert alert-danger small mb-3">
                <div class="fw-semibold mb-2">
                    <i class="bi bi-x-octagon me-2"></i>
                    已略過 ${preflight.skippedFileCount} 個不符合規則的檔案
                </div>
                <ul class="mb-0 ps-3">
                    ${buildIssueList(preflight.blockingIssues || [])}
                </ul>
            </div>
        `
        : '';

    const overwriteFiles = preflight.overwriteFiles || [];
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
        ${skippedNotice}
        ${overwriteNotice}
        <ul class="small text-muted mb-0 ps-3">
            ${defaultItems.map((item) => `<li>${item}</li>`).join('')}
        </ul>
    `;
}

function buildIssueList(issues) {
    const maxVisibleIssues = 5;
    const visibleIssues = issues.slice(0, maxVisibleIssues);
    const remainingCount = issues.length - visibleIssues.length;
    const listItems = visibleIssues
        .map((issue) => `<li>${escapeHtml(issue.message)}</li>`)
        .join('');

    if (remainingCount <= 0) {
        return listItems;
    }

    return `${listItems}<li>另有 ${remainingCount} 個問題未展開。</li>`;
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
 * 取得刪除檔案 Modal 實例
 * @returns {bootstrap.Modal} Modal 實例
 */
export function getDeleteFileModalInstance() {
    return deleteFileModalInstance;
}

/**
 * 取得上傳確認 Modal 實例
 * @returns {bootstrap.Modal} Modal 實例
 */
export function getUploadConfirmModalInstance() {
    return uploadConfirmModalInstance;
}

function showDangerActionModal({
    modalElement,
    modalInstance,
    nameElement,
    actionName,
    confirmButton,
    onConfirm,
    loadingText = '處理中...',
}) {
    if (!modalElement || !modalInstance || !confirmButton) return;

    if (nameElement) {
        nameElement.textContent = actionName;
    }

    const newButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newButton, confirmButton);

    if (confirmButton === confirmDeleteFolderBtn) {
        confirmDeleteFolderBtn = newButton;
    } else if (confirmButton === confirmDeleteFileBtn) {
        confirmDeleteFileBtn = newButton;
    }

    newButton.addEventListener('click', async () => {
        showButtonLoading(newButton, loadingText);

        try {
            if (onConfirm) {
                await onConfirm();
            }

            modalInstance.hide();
        } catch {
            hideButtonLoading(newButton);
        }
    });

    modalElement.addEventListener(
        'hidden.bs.modal',
        () => {
            hideButtonLoading(newButton);
        },
        { once: true },
    );

    modalInstance.show();
}
