/**
 * UI 模組應用程式入口。
 * 只保留 app.js 啟動流程與跨功能協調需要的高階 UI API。
 */

import { initTheme } from './theme.js';
import { initToast, showSuccess, showError, showInfo, showWarning } from './toast.js';
import { initModal, showUploadConfirmModal } from './modal.js';
import { initNavbar } from './navbar.js';
import { initViews, showLoggedOutState, showAuthenticatedHome, showFolderFiles } from './views.js';
import { initFolderFilter } from './folder-filter.js';
import { initFolders, setFolderHandlers, showFoldersLoading, showFoldersError, displayFoldersList } from './folders.js';
import { initFiles, setFileHandlers, showFilesLoading, showFilesError, displayFileList, removeDisplayedFile } from './files.js';
import {
    initUpload,
    showUploadProgress,
    hideUploadProgress,
    getFileInput,
    configureUploadInput,
    setUploadHandlers,
} from './upload.js';
import {
    initPlatformNotice,
    buildUploadStartMessage,
    buildUploadCompletionMessage,
} from './platform-notice.js';

export function initUI() {
    initTheme();
    initToast();
    initModal();
    initNavbar();
    initViews();
    initFolderFilter();
    initFolders();
    initFiles();
    initUpload();
    initPlatformNotice();
}

export {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoggedOutState,
    showAuthenticatedHome,
    showFolderFiles,
    showUploadProgress,
    hideUploadProgress,
    setFolderHandlers,
    showFoldersLoading,
    showFoldersError,
    displayFoldersList,
    setFileHandlers,
    showFilesLoading,
    showFilesError,
    displayFileList,
    removeDisplayedFile,
    getFileInput,
    configureUploadInput,
    setUploadHandlers,
    showUploadConfirmModal,
    buildUploadStartMessage,
    buildUploadCompletionMessage,
};
