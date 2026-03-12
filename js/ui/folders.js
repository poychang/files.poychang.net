/**
 * 資料夾列表管理模組
 * 只負責資料夾列表的渲染與互動收集。
 */

import { DOM_IDS } from '../core/index.js';
import { showError } from './toast.js';
import {
    showLoading,
    showEmptyState,
    showErrorState,
} from './loading.js';
import { showDeleteFolderModal } from './modal.js';
import { reapplyFilter } from './folder-filter.js';

// DOM 元素
let foldersList, refreshFoldersBtn;
let newFolderInput, createFolderBtn;
let onRefreshFolders = null;
let onSelectFolder = null;
let onCreateFolder = null;
let onDeleteFolder = null;

/**
 * 初始化資料夾管理
 */
export function initFolders() {
    foldersList = document.getElementById(DOM_IDS.FOLDERS_GRID);
    refreshFoldersBtn = document.getElementById(DOM_IDS.REFRESH_FOLDERS_BTN);
    newFolderInput = document.getElementById(DOM_IDS.NEW_FOLDER_INPUT);
    createFolderBtn = document.getElementById(DOM_IDS.CREATE_FOLDER_BTN);

    // 綁定建立資料夾按鈕
    if (createFolderBtn) {
        createFolderBtn.addEventListener('click', () => {
            void handleCreateFolder();
        });
    }

    // 支援 Enter 鍵建立資料夾
    if (newFolderInput) {
        newFolderInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && createFolderBtn) {
                createFolderBtn.click();
            }
        });
    }

    // 重新整理資料夾按鈕
    if (refreshFoldersBtn) {
        refreshFoldersBtn.addEventListener('click', () => {
            void onRefreshFolders?.();
        });
    }
}

/**
 * 設定資料夾互動處理器
 */
export function setFolderHandlers(handlers = {}) {
    onRefreshFolders = handlers.onRefresh ?? onRefreshFolders;
    onSelectFolder = handlers.onSelect ?? onSelectFolder;
    onCreateFolder = handlers.onCreate ?? onCreateFolder;
    onDeleteFolder = handlers.onDelete ?? onDeleteFolder;
}

/**
 * 顯示資料夾載入狀態
 */
export function showFoldersLoading() {
    if (!foldersList) return;

    showLoading(foldersList, {
        title: '載入分類列表...',
        message: '正在同步 GitHub repository 內的分類。',
    });
}

/**
 * 顯示資料夾列表錯誤狀態
 * @param {Error} error - 錯誤物件
 */
export function showFoldersError(error) {
    if (!foldersList) return;

    showError(error.message);
    showErrorState(foldersList, {
        title: '載入分類失敗',
        message: error.message,
        action: {
            label: '重新整理',
            icon: 'bi bi-arrow-clockwise',
            className: 'btn btn-outline-danger',
            onClick: () => {
                void onRefreshFolders?.();
            },
        },
    });
}

/**
 * 顯示資料夾列表
 * @param {Array} folders - 資料夾列表
 */
export function displayFoldersList(folders) {
    if (!foldersList) return;

    if (folders.length === 0) {
        showEmptyState(foldersList, {
            icon: 'bi bi-folder-x',
            title: '目前沒有任何分類',
            message: '建立一個新分類來開始使用。',
        });
        return;
    }

    // 已於資料層排序，這裡直接渲染
    foldersList.innerHTML = folders.map((folder) => createFolderListItem(folder)).join('');

    // 綁定點擊事件
    foldersList.querySelectorAll('.folder-list-item').forEach((item) => {
        item.addEventListener('click', () => {
            const folderName = item.dataset.folderName;
            void onSelectFolder?.(folderName);
        });
    });

    // 綁定刪除按鈕事件
    foldersList.querySelectorAll('.folder-delete-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止觸發列表項點擊
            const folderName = btn.dataset.folderName;
            handleDeleteFolderClick(folderName);
        });
    });

    // 重新套用過濾器（如果有的話）
    reapplyFilter();
}

/**
 * 建立資料夾列表項目 HTML
 * @param {Object} folder - 資料夾物件
 * @returns {string} HTML 字串
 */
function createFolderListItem(folder) {
    return `
        <div class="list-group-item folder-list-item" data-folder-name="${folder.name}">
            <i class="bi bi-folder folder-icon"></i>
            <span class="folder-name">${folder.name}</span>
            <div class="folder-actions">
                <button class="btn btn-sm btn-danger folder-delete-btn" 
                        data-folder-name="${folder.name}"
                        title="刪除分類">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;
}

/**
 * 處理建立資料夾
 */
async function handleCreateFolder() {
    const folderName = newFolderInput.value.trim();

    if (!folderName) {
        showError('請輸入分類名稱');
        return;
    }

    // 驗證分類名稱格式（只允許英數字、底線、連字號）
    if (!/^[a-zA-Z0-9_-]+$/.test(folderName)) {
        showError('分類名稱只能包含英數字、底線(_)和連字號(-)');
        return;
    }

    await onCreateFolder?.(folderName);
}

/**
 * 處理刪除分類按鈕點擊
 * @param {string} folderName - 要刪除的分類名稱
 */
function handleDeleteFolderClick(folderName) {
    showDeleteFolderModal(folderName, async () => {
        await onDeleteFolder?.(folderName);
    });
}

/**
 * 取得資料夾列表容器
 * @returns {HTMLElement} 資料夾列表容器
 */
export function getFoldersListContainer() {
    return foldersList;
}

/**
 * 取得新資料夾輸入框
 * @returns {HTMLElement} 輸入框元素
 */
export function getNewFolderInput() {
    return newFolderInput;
}

/**
 * 取得建立資料夾按鈕
 * @returns {HTMLElement} 按鈕元素
 */
export function getCreateFolderBtn() {
    return createFolderBtn;
}
