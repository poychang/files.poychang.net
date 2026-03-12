/**
 * UI 模組應用程式入口。
 * 只保留 app.js 啟動流程與跨功能協調需要的高階 UI API。
 */

import { initTheme } from './theme.js';
import { initToast, showSuccess, showError, showInfo } from './toast.js';
import { initModal, showUploadConfirmModal } from './modal.js';
import { initNavbar, displayUserInfo, clearUserInfo } from './navbar.js';
import { initViews } from './views.js';
import { initFolderFilter } from './folder-filter.js';
import { initFolders, refreshFoldersList } from './folders.js';
import { initFiles, refreshFileList } from './files.js';
import {
    initUpload,
    showUploadProgress,
    hideUploadProgress,
    getFileInput,
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
    displayUserInfo,
    clearUserInfo,
    showUploadProgress,
    hideUploadProgress,
    refreshFileList,
    refreshFoldersList,
    getFileInput,
    showUploadConfirmModal,
    buildUploadStartMessage,
    buildUploadCompletionMessage,
};
