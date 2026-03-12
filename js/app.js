/**
 * 主應用程式
 * 整合所有模組並初始化應用程式
 */

import { initCore, CONFIG, CUSTOM_EVENTS, DOM_IDS, TOKEN_STORAGE_MODES, createLogger } from './core/index.js';
import { initAuth } from './auth.js';
import { initRepo, prepareUploadBatch, uploadFiles, getCurrentSubFolder, validateUploadSelection } from './repo/index.js';
import {
    initUI,
    showMessage,
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
    buildUploadCompletionMessage
} from './ui/index.js';

const logger = createLogger('App');

/**
 * 應用程式初始化
 */
function initApp() {
    logger.info('Initializing application...');

    // 初始化核心層
    initCore({ logLevel: 'info' });

    // 初始化 UI 模組
    initUI();

    // 初始化認證模組
    initAuth({
        onAuthSuccess: handleAuthSuccess,
        onAuthFail: handleAuthFail
    });

    // 初始化 Repo 模組
    initRepo({
        onFileOperationSuccess: handleFileOperationSuccess,
        onFileOperationFail: handleFileOperationFail
    });

    // 設定事件監聽器
    setupEventListeners();

    // 監聽登出事件
    window.addEventListener(CUSTOM_EVENTS.AUTH_LOGOUT, handleLogout);

    logger.info('Application initialized successfully');
}

/**
 * 設定事件監聽器
 */
function setupEventListeners() {
    // 監聽自訂檔案選擇事件(來自 upload.js 的拖曳或按鈕選擇)
    window.addEventListener(CUSTOM_EVENTS.FILES_SELECTED, (e) => {
        if (e.detail.files.length > 0) {
            handleFileUpload(Array.from(e.detail.files), e.detail.validation || null);
        }
    });
}

/**
 * 處理檔案上傳
 */
async function handleFileUpload(files, selectionValidation = null) {
    if (!files || files.length === 0) {
        showError('請選擇檔案');
        return;
    }

    try {
        const currentFolder = getCurrentSubFolder();
        const targetPath = `${CONFIG.fileBasePath}/${currentFolder}/`;
        const normalizedSelection = selectionValidation || validateUploadSelection(files);
        const uploadBatch = await prepareUploadBatch(files, { selectionResult: normalizedSelection });

        // 使用 Modal 確認上傳
        showUploadConfirmModal(files.length, targetPath, async () => {
            await performUpload(files, uploadBatch.existingFilesIndex);
        }, {
            preflight: uploadBatch.preflight,
        });
    } catch (error) {
        showError(error.userMessage || `無法確認上傳內容：${error.message}`);
    }
}

/**
 * 執行檔案上傳
 */
async function performUpload(files, existingFilesIndex) {
    try {
        showInfo(buildUploadStartMessage(files.length));

        const results = await uploadFiles(files, (progress) => {
            showUploadProgress(progress);
        }, { existingFilesIndex });

        // 統計結果
        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        hideUploadProgress();

        // 顯示結果
        if (failCount === 0) {
            showSuccess(buildUploadCompletionMessage(successCount, failCount));
        } else {
            showError(buildUploadCompletionMessage(successCount, failCount));

            // 顯示失敗的檔案
            const failedFiles = results.filter(r => !r.success);
            logger.error('上傳失敗的檔案：', failedFiles);
        }

        // 重新載入檔案列表
        await refreshFileList();

        // 清除檔案選擇
        const fileInput = getFileInput();
        if (fileInput) fileInput.value = '';

    } catch (error) {
        hideUploadProgress();
        showError(`上傳失敗：${error.message}`);

        // 清除檔案選擇
        const fileInput = getFileInput();
        if (fileInput) fileInput.value = '';
    }
}

/**
 * 處理認證成功
 */
async function handleAuthSuccess(user, options = {}) {
    logger.info('Auth success handler triggered', { auto: options.auto });
    displayUserInfo(user);

    // 僅在手動登入時顯示成功提示；自動登入不重複提示
    if (!options.auto) {
        const persistenceMessage = options.mode === TOKEN_STORAGE_MODES.LOCAL
            ? 'Token 已保存於此瀏覽器。'
            : 'Token 僅保存於本次瀏覽器工作階段。';
        showSuccess(`登入成功，${persistenceMessage}`);
    }

    // 顯示已登入區域
    const loginSection = document.getElementById(DOM_IDS.LOGIN_SECTION);
    const authenticatedSection = document.getElementById(DOM_IDS.AUTHENTICATED_SECTION);
    const pageHeader = document.getElementById(DOM_IDS.PAGE_HEADER);

    if (loginSection) loginSection.classList.add('d-none');
    if (authenticatedSection) authenticatedSection.classList.remove('d-none');
    if (pageHeader) pageHeader.classList.add('d-none');

    // 載入資料夾列表
    await refreshFoldersList();
}

/**
 * 處理認證失敗
 */
function handleAuthFail(errorMessage) {
    showError(errorMessage);
}

/**
 * 處理檔案操作成功
 */
function handleFileOperationSuccess(message) {
    showSuccess(message);
}

/**
 * 處理檔案操作失敗
 */
function handleFileOperationFail(errorMessage) {
    showError(errorMessage);
}

/**
 * 處理登出
 */
function handleLogout() {
    clearUserInfo();

    // 隱藏已登入區域
    const loginSection = document.getElementById(DOM_IDS.LOGIN_SECTION);
    const authenticatedSection = document.getElementById(DOM_IDS.AUTHENTICATED_SECTION);
    const folderManagementView = document.getElementById(DOM_IDS.FOLDER_MANAGEMENT_VIEW);
    const fileManagementView = document.getElementById(DOM_IDS.FILE_MANAGEMENT_VIEW);
    const pageHeader = document.getElementById(DOM_IDS.PAGE_HEADER);

    if (loginSection) loginSection.classList.remove('d-none');
    if (authenticatedSection) authenticatedSection.classList.add('d-none');
    // 重置到分類管理視圖
    if (folderManagementView) folderManagementView.classList.remove('d-none');
    if (fileManagementView) fileManagementView.classList.add('d-none');
    if (pageHeader) pageHeader.classList.remove('d-none');

    // 清空目前分類顯示
    const currentFolderNameEl = document.getElementById(DOM_IDS.CURRENT_FOLDER_NAME);
    if (currentFolderNameEl) currentFolderNameEl.textContent = '';
    const currentFolderNameHeaderEl = document.getElementById(DOM_IDS.CURRENT_FOLDER_NAME_HEADER);
    if (currentFolderNameHeaderEl) currentFolderNameHeaderEl.textContent = '';

    showSuccess('已登出');
}

// 當 DOM 載入完成時初始化應用程式
window.addEventListener('DOMContentLoaded', initApp);
