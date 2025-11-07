/**
 * UI 模組統一入口
 * 整合所有 UI 子模組並提供統一的初始化與導出
 */

import { initTheme, getCurrentTheme } from './theme.js';
import { 
    initToast, 
    showMessage, 
    showSuccess, 
    showError, 
    showInfo,
    showWarning 
} from './toast.js';
import { 
    initModal,
    showDeleteFolderModal,
    hideDeleteFolderModal,
    showUploadConfirmModal,
    hideUploadConfirmModal,
    getDeleteFolderModalInstance,
    getUploadConfirmModalInstance
} from './modal.js';
import {
    initNavbar,
    displayUserInfo,
    clearUserInfo,
    setLogoutHandler,
    getNavbarUserInfo
} from './navbar.js';
import {
    initViews,
    showFolderManagementView,
    showFileManagementView,
    getCurrentView,
    setCurrentFolderName,
    clearCurrentFolderName
} from './views.js';
import {
    showLoading,
    hideLoading,
    showEmptyState,
    showErrorState,
    showButtonLoading,
    hideButtonLoading,
    updateProgressBar,
    resetProgressBar
} from './loading.js';
import {
    initFolderFilter,
    clearFilter,
    getFilterKeyword,
    setFilterKeyword,
    reapplyFilter
} from './folder-filter.js';
import {
    initFolders,
    refreshFoldersList,
    displayFoldersList,
    getFoldersListContainer,
    getNewFolderInput,
    getCreateFolderBtn
} from './folders.js';
import {
    initFiles,
    refreshFileList,
    displayFileList,
    getFileListContainer,
    getFileCountBadge
} from './files.js';
import {
    initUpload,
    showUploadProgress,
    hideUploadProgress,
    clearFileInput,
    getFileInput,
    getDropZone,
    getUploadProgress,
    getProgressBar,
    getUploadStatus,
    setFileSelectHandler
} from './upload.js';

/**
 * 初始化所有 UI 模組
 * 
 * 此函數會按順序初始化：
 * 1. 主題系統
 * 2. Toast 通知系統
 * 3. Modal 對話框
 * 4. 導航列
 * 5. 視圖管理
 * 6. 資料夾過濾
 * 7. 分類管理
 * 8. 檔案管理
 * 9. 上傳功能
 */
export function initUI() {
    // 核心 UI 組件
    initTheme();
    initToast();
    initModal();
    initNavbar();
    initViews();
    initFolderFilter();
    initFolders();
    initFiles();
    initUpload();
}

// ============================================
// 重新導出所有子模組的公開 API
// 確保向後相容性
// ============================================

// 主題相關
export { getCurrentTheme };

// Toast 通知相關
export { 
    showMessage, 
    showSuccess, 
    showError, 
    showInfo,
    showWarning 
};

// Modal 相關
export { 
    showDeleteFolderModal,
    hideDeleteFolderModal,
    showUploadConfirmModal,
    hideUploadConfirmModal,
    getDeleteFolderModalInstance,
    getUploadConfirmModalInstance
};

// 導航列相關
export {
    displayUserInfo,
    clearUserInfo,
    setLogoutHandler,
    getNavbarUserInfo
};

// 視圖相關
export {
    showFolderManagementView,
    showFileManagementView,
    getCurrentView,
    setCurrentFolderName,
    clearCurrentFolderName
};

// 載入狀態相關
export {
    showLoading,
    hideLoading,
    showEmptyState,
    showErrorState,
    showButtonLoading,
    hideButtonLoading,
    updateProgressBar,
    resetProgressBar
};

// 資料夾過濾相關
export {
    clearFilter,
    getFilterKeyword,
    setFilterKeyword,
    reapplyFilter
};

// 資料夾管理相關
export {
    refreshFoldersList,
    displayFoldersList,
    getFoldersListContainer,
    getNewFolderInput,
    getCreateFolderBtn
};

// 檔案管理相關
export {
    refreshFileList,
    displayFileList,
    getFileListContainer,
    getFileCountBadge
};

// 上傳相關
export {
    showUploadProgress,
    hideUploadProgress,
    clearFileInput,
    getFileInput,
    getDropZone,
    getUploadProgress,
    getProgressBar,
    getUploadStatus,
    setFileSelectHandler
};

// export { showFolderManagementView, showFileManagementView } from './views.js';
