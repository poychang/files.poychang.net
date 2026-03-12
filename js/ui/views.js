/**
 * 視圖狀態協調模組
 * 將登入、登出、首頁與分類頁切換集中在單一入口。
 */

import { DOM_IDS, VIEW_TYPES } from '../core/index.js';
import { displayUserInfo, clearUserInfo, setLogoutButtonVisible } from './navbar.js';

// DOM 元素
let loginSection, authenticatedSection, pageHeader;
let folderManagementView, fileManagementView, backToFoldersBtn;
let currentFolderNameEl, currentFolderNameHeaderEl;

const uiState = {
    isAuthenticated: false,
    currentView: VIEW_TYPES.FOLDER_MANAGEMENT,
    currentFolderName: '',
};

/**
 * 初始化視圖管理
 */
export function initViews() {
    loginSection = document.getElementById(DOM_IDS.LOGIN_SECTION);
    authenticatedSection = document.getElementById(DOM_IDS.AUTHENTICATED_SECTION);
    pageHeader = document.getElementById(DOM_IDS.PAGE_HEADER);
    folderManagementView = document.getElementById(DOM_IDS.FOLDER_MANAGEMENT_VIEW);
    fileManagementView = document.getElementById(DOM_IDS.FILE_MANAGEMENT_VIEW);
    backToFoldersBtn = document.getElementById(DOM_IDS.BACK_TO_FOLDERS_BTN);
    currentFolderNameEl = document.getElementById(DOM_IDS.CURRENT_FOLDER_NAME);
    currentFolderNameHeaderEl = document.getElementById(DOM_IDS.CURRENT_FOLDER_NAME_HEADER);

    // 綁定返回按鈕
    if (backToFoldersBtn) {
        backToFoldersBtn.addEventListener('click', () => {
            showAuthenticatedHome(null, true);
        });
    }

    applyUiState();
}

/**
 * 顯示已登出狀態
 */
export function showLoggedOutState() {
    uiState.isAuthenticated = false;
    uiState.currentView = VIEW_TYPES.FOLDER_MANAGEMENT;
    uiState.currentFolderName = '';
    clearUserInfo();
    applyUiState();
}

/**
 * 顯示已登入首頁（分類管理）
 * @param {Object} user - 使用者資訊
 * @param {boolean} preserveUserInfo - 是否沿用現有 navbar 內容
 */
export function showAuthenticatedHome(user = null, preserveUserInfo = false) {
    uiState.isAuthenticated = true;
    uiState.currentView = VIEW_TYPES.FOLDER_MANAGEMENT;
    uiState.currentFolderName = '';

    if (user) {
        displayUserInfo(user);
    } else if (!preserveUserInfo) {
        clearUserInfo();
    }

    applyUiState();
}

/**
 * 顯示已登入分類頁
 * @param {string} folderName - 資料夾名稱
 * @param {Object} user - 使用者資訊
 * @param {boolean} preserveUserInfo - 是否沿用現有 navbar 內容
 */
export function showFolderFiles(folderName, user = null, preserveUserInfo = true) {
    uiState.isAuthenticated = true;
    uiState.currentView = VIEW_TYPES.FILE_MANAGEMENT;
    uiState.currentFolderName = folderName;

    if (user) {
        displayUserInfo(user);
    } else if (!preserveUserInfo) {
        clearUserInfo();
    }

    applyUiState();
}

/**
 * 取得當前視圖狀態
 * @returns {string} 'folder' 或 'file'
 */
export function getCurrentView() {
    if (uiState.currentView === VIEW_TYPES.FOLDER_MANAGEMENT) {
        return 'folder';
    }

    if (uiState.currentView === VIEW_TYPES.FILE_MANAGEMENT) {
        return 'file';
    }

    return 'unknown';
}

/**
 * 設定當前分類名稱顯示
 * @param {string} folderName - 資料夾名稱
 */
export function setCurrentFolderName(folderName) {
    uiState.currentFolderName = folderName;
    applyCurrentFolderName();
}

/**
 * 清除當前分類名稱顯示
 */
export function clearCurrentFolderName() {
    uiState.currentFolderName = '';
    applyCurrentFolderName();
}

function applyUiState() {
    loginSection?.classList.toggle('d-none', uiState.isAuthenticated);
    authenticatedSection?.classList.toggle('d-none', !uiState.isAuthenticated);
    pageHeader?.classList.toggle('d-none', uiState.isAuthenticated);

    const showingFiles = uiState.isAuthenticated && uiState.currentView === VIEW_TYPES.FILE_MANAGEMENT;
    folderManagementView?.classList.toggle('d-none', showingFiles);
    fileManagementView?.classList.toggle('d-none', !showingFiles);
    setLogoutButtonVisible(uiState.isAuthenticated);
    applyCurrentFolderName();
}

function applyCurrentFolderName() {
    const folderName = uiState.currentFolderName;

    if (currentFolderNameEl) {
        currentFolderNameEl.textContent = folderName;
    }

    if (currentFolderNameHeaderEl) {
        currentFolderNameHeaderEl.textContent = folderName;
    }
}
