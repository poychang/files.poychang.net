/**
 * 檔案列表管理模組
 * 處理檔案列表的顯示、刪除等操作
 */

import {
    listFiles,
    deleteFile,
} from '../repo/file-operations.js';
import { getFileIcon, formatFileSize } from '../repo/utils.js';
import { DOM_IDS, CUSTOM_EVENTS } from '../core/index.js';
import { showSuccess, showError } from './toast.js';
import { showLoading, showEmptyState, showErrorState } from './loading.js';
import { showDeleteFileModal } from './modal.js';
import { buildCopyLinkMessage } from './platform-notice.js';

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
    window.addEventListener(CUSTOM_EVENTS.FOLDER_SELECTED, () => {
        refreshFileList();
    });
}

/**
 * 重新整理檔案列表
 */
export async function refreshFileList() {
    try {
        showLoading(fileListContainer, {
            title: '載入檔案列表...',
            message: '正在讀取目前分類中的檔案。',
        });

        const files = await listFiles();
        displayFileList(files);
    } catch (error) {
        showError(error.message);
        showErrorState(fileListContainer, {
            title: '載入檔案失敗',
            message: error.message,
            action: {
                label: '重新整理',
                icon: 'bi bi-arrow-clockwise',
                className: 'btn btn-outline-danger',
                onClick: refreshFileList,
            },
        });
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
        showEmptyState(fileListContainer, {
            icon: 'bi bi-inbox',
            title: '此分類目前沒有檔案',
            message: '上傳一些檔案來開始使用。',
        });
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
        btn.addEventListener('click', () => {
            confirmDeleteFile(btn.dataset.filename, btn.dataset.sha);
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
        <div class="list-group-item file-item" data-filename="${file.name}">
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
        showSuccess(buildCopyLinkMessage(filename));
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
            showSuccess(buildCopyLinkMessage(filename));
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
 */
async function confirmDeleteFile(filename, sha) {
    showDeleteFileModal(filename, async () => {
        try {
            await deleteFile(filename, sha);
            removeFileListItem(filename);
            showSuccess(`✓ 已刪除檔案：${filename}`);

            void syncFileListAfterDeletion(filename);
        } catch (error) {
            showError(error.message);
            throw error;
        }
    });
}

async function syncFileListAfterDeletion(filename) {
    try {
        const files = await listFiles();
        displayFileList(files);
    } catch (error) {
        showError(`檔案已刪除，但重新整理列表失敗：${error.message}`);
    }
}

function removeFileListItem(filename) {
    if (!fileListContainer) return;

    const fileItem = Array.from(fileListContainer.querySelectorAll('.file-item')).find(
        (item) => item.dataset.filename === filename,
    );
    if (!fileItem) return;

    fileItem.remove();
    updateFileCountBadge(-1);

    if (fileListContainer.querySelector('.file-item')) {
        return;
    }

    showEmptyState(fileListContainer, {
        icon: 'bi bi-inbox',
        title: '此分類目前沒有檔案',
        message: '上傳一些檔案來開始使用。',
    });
}

function updateFileCountBadge(delta) {
    if (!fileCountBadge) return;

    const currentCount = Number.parseInt(fileCountBadge.textContent ?? '0', 10);
    const safeCount = Number.isNaN(currentCount) ? 0 : currentCount;
    fileCountBadge.textContent = Math.max(0, safeCount + delta);
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

