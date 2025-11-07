/**
 * 檔案列表管理模組
 * 處理檔案列表的顯示、刪除等操作
 */

import {
    listFiles,
    deleteFile,
    getFileIcon,
    formatFileSize,
} from '../repo/index.js';
import { DOM_IDS, CUSTOM_EVENTS, emitFileDeleted } from '../core/index.js';
import { showSuccess, showError } from './toast.js';
import { showLoading, showEmptyState, showErrorState, showButtonLoading, hideButtonLoading } from './loading.js';

// DOM 元素
let fileListContainer, fileCountBadge, refreshFilesBtn;

/**
 * 初始化檔案管理
 */
export function initFiles() {
    fileListContainer = document.getElementById(DOM_IDS.FILE_LIST);
    fileCountBadge = document.getElementById(DOM_IDS.FILE_COUNT_BADGE);
    refreshFilesBtn = document.getElementById(DOM_IDS.REFRESH_FILES_BTN);

    // 重新整理按鈕
    if (refreshFilesBtn) {
        refreshFilesBtn.addEventListener('click', refreshFileList);
    }

    // 監聽資料夾選擇事件
    window.addEventListener('folder:selected', () => {
        refreshFileList();
    });
}

/**
 * 重新整理檔案列表
 */
export async function refreshFileList() {
    try {
        showLoading(fileListContainer, '載入檔案列表...');

        const files = await listFiles();
        displayFileList(files);
    } catch (error) {
        showError(error.message);
        fileListContainer.innerHTML = `
            <div class="text-center text-danger py-4">
                <i class="bi bi-exclamation-triangle display-4"></i>
                <p class="mt-2">${error.message}</p>
            </div>
        `;
    }
}

/**
 * 顯示檔案列表
 * @param {Array} files - 檔案列表
 */
export function displayFileList(files) {
    if (!fileListContainer) return;

    // 更新檔案數量徽章
    if (fileCountBadge) {
        fileCountBadge.textContent = files.length;
    }

    // 空列表處理
    if (files.length === 0) {
        fileListContainer.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-inbox display-1"></i>
                <p class="mt-3">此分類目前沒有檔案</p>
                <p class="small">上傳一些檔案來開始使用</p>
            </div>
        `;
        return;
    }

    // 渲染檔案列表
    fileListContainer.innerHTML = files.map((file) => createFileItem(file)).join('');

    // 綁定複製按鈕事件
    fileListContainer.querySelectorAll('.btn-copy-link').forEach((btn) => {
        btn.addEventListener('click', () => {
            copyFileLink(btn.dataset.url, btn.dataset.filename);
        });
    });

    // 綁定刪除按鈕事件
    fileListContainer.querySelectorAll('.btn-delete-file').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            confirmDeleteFile(btn.dataset.filename, btn.dataset.sha, e.currentTarget);
        });
    });
}

/**
 * 建立檔案項目 HTML
 * @param {Object} file - 檔案物件
 * @returns {string} HTML 字串
 */
function createFileItem(file) {
    const iconClass = getFileIcon(file.type);
    const isImage = file.type === 'image';

    return `
        <div class="list-group-item file-item">
            <div class="d-flex align-items-center gap-3">
                <div class="flex-shrink-0">
                    ${
                        isImage
                            ? `<img src="${file.downloadUrl}" class="file-preview-img" alt="${file.name}" loading="lazy">`
                            : `<i class="${iconClass} file-icon-large"></i>`
                    }
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
                <div class="file-actions ms-auto">
                    <button class="btn btn-sm btn-outline-primary btn-copy-link" 
                            data-url="${file.url}" 
                            data-filename="${file.name}"
                            title="複製連結">
                        <i class="bi bi-clipboard me-1"></i>複製連結
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-delete-file" 
                            data-filename="${file.name}" 
                            data-sha="${file.sha}"
                            title="刪除檔案">
                        <i class="bi bi-trash me-1"></i>刪除
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * 複製檔案連結
 * @param {string} url - 檔案 URL
 * @param {string} filename - 檔案名稱
 */
async function copyFileLink(url, filename) {
    try {
        await navigator.clipboard.writeText(url);
        showSuccess(`✓ 已複製連結：${filename}`);
    } catch (error) {
        // 降級方案：使用 textarea
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            showSuccess(`✓ 已複製連結：${filename}`);
        } catch (err) {
            showError('複製失敗，請手動複製');
        }

        document.body.removeChild(textarea);
    }
}

/**
 * 確認刪除檔案
 * @param {string} filename - 檔案名稱
 * @param {string} sha - 檔案 SHA
 * @param {HTMLElement} triggerBtn - 觸發按鈕
 */
async function confirmDeleteFile(filename, sha, triggerBtn) {
    if (!confirm(`確定要刪除檔案 "${filename}" 嗎？\n\n此操作無法復原。`)) {
        return;
    }

    try {
        // 顯示載入狀態
        showButtonLoading(triggerBtn, '刪除中...');

        await deleteFile(filename, sha);
        showSuccess(`✓ 已刪除檔案：${filename}`);

        // 重新載入檔案列表
        await refreshFileList();
    } catch (error) {
        showError(error.message);
        hideButtonLoading(triggerBtn);
    }
}

/**
 * 取得檔案列表容器
 * @returns {HTMLElement} 檔案列表容器
 */
export function getFileListContainer() {
    return fileListContainer;
}

/**
 * 取得檔案數量徽章
 * @returns {HTMLElement} 徽章元素
 */
export function getFileCountBadge() {
    return fileCountBadge;
}
