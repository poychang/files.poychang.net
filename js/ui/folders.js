/**
 * 資料夾列表管理模組
 * 處理資料夾列表的顯示、建立、刪除等操作
 */

import {
    listSubFolders,
    createSubFolder,
    deleteSubFolder,
    setCurrentSubFolder,
} from '../repo/index.js';
import { DOM_IDS, emitFolderChanged, emitFolderCreated, emitFolderDeleted } from '../core/index.js';
import { showSuccess, showError, showInfo } from './toast.js';
import { showLoading, showEmptyState, showErrorState, showButtonLoading, hideButtonLoading } from './loading.js';
import { showDeleteFolderModal } from './modal.js';
import { showFileManagementView } from './views.js';
import { reapplyFilter } from './folder-filter.js';

// DOM 元素
let foldersList, refreshFoldersBtn;
let newFolderInput, createFolderBtn;

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
        createFolderBtn.addEventListener('click', handleCreateFolder);
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
        refreshFoldersBtn.addEventListener('click', refreshFoldersList);
    }
}

/**
 * 重新整理資料夾列表
 */
export async function refreshFoldersList() {
    try {
        if (!foldersList) return;

        foldersList.innerHTML = `
            <div class="list-group-item text-center text-muted py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">載入中...</span>
                </div>
                <p class="mt-2">載入分類列表...</p>
            </div>
        `;

        const folders = await listSubFolders();
        displayFoldersList(folders);
    } catch (error) {
        showError(error.message);
        foldersList.innerHTML = `
            <div class="list-group-item text-center text-danger py-4">
                <i class="bi bi-exclamation-triangle display-4"></i>
                <p class="mt-2">${error.message}</p>
            </div>
        `;
    }
}

/**
 * 顯示資料夾列表
 * @param {Array} folders - 資料夾列表
 */
export function displayFoldersList(folders) {
    if (!foldersList) return;

    if (folders.length === 0) {
        foldersList.innerHTML = `
            <div class="list-group-item text-center text-muted py-4">
                <i class="bi bi-folder-x display-4"></i>
                <p class="mt-3">目前沒有任何分類</p>
                <p class="small">建立一個新分類來開始使用</p>
            </div>
        `;
        return;
    }

    // 已於資料層排序，這裡直接渲染
    foldersList.innerHTML = folders.map((folder) => createFolderListItem(folder)).join('');

    // 綁定點擊事件
    foldersList.querySelectorAll('.folder-list-item').forEach((item) => {
        item.addEventListener('click', () => {
            const folderName = item.dataset.folderName;
            selectFolder(folderName);
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
 * 選擇資料夾
 * @param {string} folderName - 資料夾名稱
 */
async function selectFolder(folderName) {
    // 設定當前資料夾
    setCurrentSubFolder(folderName);

    // 切換到檔案管理視圖
    showFileManagementView(folderName);

    // 觸發檔案列表重新整理事件
    const event = new CustomEvent('folder:selected', { detail: { folderName } });
    window.dispatchEvent(event);
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

    try {
        // 顯示載入狀態
        showButtonLoading(createFolderBtn, '建立中...');

        await createSubFolder(folderName);
        showSuccess(`✓ 已建立分類：${folderName}`);

        // 清空輸入框
        newFolderInput.value = '';

        // 稍微延遲後重新載入資料夾列表，讓 GitHub API 有時間更新
        await new Promise(resolve => setTimeout(resolve, 1000));
        await refreshFoldersList();
    } catch (error) {
        showError(error.message);
    } finally {
        // 恢復按鈕狀態
        hideButtonLoading(createFolderBtn);
    }
}

/**
 * 處理刪除分類按鈕點擊
 * @param {string} folderName - 要刪除的分類名稱
 */
function handleDeleteFolderClick(folderName) {
    showDeleteFolderModal(folderName, async () => {
        await handleDeleteFolder(folderName);
    });
}

/**
 * 處理刪除分類
 * @param {string} folderName - 要刪除的分類名稱
 */
async function handleDeleteFolder(folderName) {
    try {
        await deleteSubFolder(folderName);
        showSuccess(`✓ 已刪除分類：${folderName}`);

        // 稍微延遲後重新載入資料夾列表，讓 GitHub API 有時間更新
        await new Promise(resolve => setTimeout(resolve, 1000));
        await refreshFoldersList();
    } catch (error) {
        showError(error.message);
        throw error; // 讓 modal 知道發生錯誤
    }
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
