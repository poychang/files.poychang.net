/**
 * 主應用程式
 * 整合所有模組並初始化應用程式
 */

import { initCore, CONFIG, CUSTOM_EVENTS, DOM_IDS, TOKEN_STORAGE_MODES, createLogger, on } from './core/index.js';
import { initAuth } from './auth.js';
import {
    initRepo,
    prepareUploadBatch,
    uploadFiles,
    getCurrentSubFolder,
    validateUploadSelection,
    buildUploadSelectionFeedback,
    getSupportedUploadExtensions,
    getFileIcon,
    formatFileSize,
    listSubFolders,
    createSubFolder,
    waitForFolderState,
    deleteSubFolder,
    setCurrentSubFolder,
    listFiles,
    deleteFile,
} from './repo/index.js';
import {
    initUI,
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
    configureUploadInput(getSupportedUploadExtensions());
    setupUiHandlers();

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
    on(CUSTOM_EVENTS.AUTH_LOGOUT, handleLogout);

    logger.info('Application initialized successfully');
}

function setupUiHandlers() {
    setFolderHandlers({
        onRefresh: refreshFoldersList,
        onSelect: handleFolderSelected,
        onCreate: handleCreateFolder,
        onDelete: handleDeleteFolder,
    });

    setFileHandlers({
        onRefresh: refreshFileList,
        onDelete: handleDeleteFile,
    });

    setUploadHandlers({
        onFilesSelected: handleFilesSelection,
    });
}

/**
 * 設定事件監聽器
 */
function setupEventListeners() {
    // 保留 app 層事件掛點供後續擴充，目前主要流程由注入 handler 協調。
}

/**
 * 處理檔案選擇
 */
async function handleFilesSelection(files) {
    if (!files || files.length === 0) {
        showError('請選擇檔案');
        return;
    }

    try {
        const normalizedSelection = validateUploadSelection(files);
        const feedbackMessage = buildUploadSelectionFeedback(normalizedSelection);

        if (feedbackMessage) {
            if (normalizedSelection.validFiles.length === 0) {
                showError(feedbackMessage);
                clearFileInputSelection();
                return;
            }

            showWarning(feedbackMessage);
        }

        await handleFileUpload(normalizedSelection.validFiles, normalizedSelection);
    } catch (error) {
        showError(error.userMessage || `無法確認上傳內容：${error.message}`);
        clearFileInputSelection();
    }
}

/**
 * 處理檔案上傳
 */
async function handleFileUpload(files, selectionValidation) {
    try {
        const currentFolder = getCurrentSubFolder();
        const targetPath = `${CONFIG.fileBasePath}/${currentFolder}/`;
        const uploadBatch = await prepareUploadBatch(files, { selectionResult: selectionValidation });

        // 使用 Modal 確認上傳
        showUploadConfirmModal(files.length, targetPath, async () => {
            await performUpload(files, uploadBatch.existingFilesIndex);
        }, {
            preflight: uploadBatch.preflight,
        });
    } catch (error) {
        showError(error.userMessage || `無法確認上傳內容：${error.message}`);
        clearFileInputSelection();
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
        clearFileInputSelection();

    } catch (error) {
        hideUploadProgress();
        showError(`上傳失敗：${error.message}`);

        // 清除檔案選擇
        clearFileInputSelection();
    }
}

/**
 * 處理認證成功
 */
async function handleAuthSuccess(user, options = {}) {
    logger.info('Auth success handler triggered', { auto: options.auto });
    showAuthenticatedHome(user);

    // 僅在手動登入時顯示成功提示；自動登入不重複提示
    if (!options.auto) {
        const persistenceMessage = options.mode === TOKEN_STORAGE_MODES.LOCAL
            ? 'Token 已保存於此瀏覽器。'
            : 'Token 僅保存於本次瀏覽器工作階段。';
        showSuccess(`登入成功，${persistenceMessage}`);
    }

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
    showLoggedOutState();
    showSuccess('已登出');
}

async function refreshFoldersList() {
    showFoldersLoading();

    try {
        const folders = await listSubFolders();
        displayFoldersList(folders);
    } catch (error) {
        showFoldersError(error);
    }
}

async function handleFolderSelected(folderName) {
    setCurrentSubFolder(folderName);
    showFolderFiles(folderName);
    await refreshFileList();
}

async function handleCreateFolder(folderName) {
    try {
        await createSubFolder(folderName);
        clearNewFolderInput();

        const synced = await syncFoldersAfterMutation(folderName, 'exists');
        if (synced) {
            showSuccess(`✓ 已建立分類：${folderName}`);
        }
    } catch (error) {
        showError(error.message);
    }
}

async function handleDeleteFolder(folderName) {
    try {
        await deleteSubFolder(folderName);

        const synced = await syncFoldersAfterMutation(folderName, 'missing');
        if (synced) {
            showSuccess(`✓ 已刪除分類：${folderName}`);
        }
    } catch (error) {
        showError(error.message);
        throw error;
    }
}

async function syncFoldersAfterMutation(folderName, expectedState) {
    const { folders, synced } = await waitForFolderState({
        folderName,
        expectedState,
    });

    displayFoldersList(folders);

    if (!synced) {
        showError(`分類清單同步中，請稍後再重新整理確認「${folderName}」的最新狀態。`);
    }

    return synced;
}

async function refreshFileList() {
    showFilesLoading();

    try {
        const files = await listFiles();
        displayFileList(mapFilesForDisplay(files));
    } catch (error) {
        showFilesError(error);
    }
}

async function handleDeleteFile(filename, sha) {
    try {
        await deleteFile(filename, sha);
        removeDisplayedFile(filename);
        showSuccess(`✓ 已刪除檔案：${filename}`);

        void syncFileListAfterDeletion(filename);
    } catch (error) {
        showError(error.message);
        throw error;
    }
}

async function syncFileListAfterDeletion(filename) {
    try {
        const files = await listFiles();
        displayFileList(mapFilesForDisplay(files));
    } catch (error) {
        showError(`檔案已刪除，但重新整理列表失敗：${error.message}`);
        logger.error('File list resync after deletion failed', { filename, error });
    }
}

function clearFileInputSelection() {
    const fileInput = getFileInput();
    if (fileInput) {
        fileInput.value = '';
    }
}

function clearNewFolderInput() {
    const newFolderInput = document.getElementById(DOM_IDS.NEW_FOLDER_INPUT);
    if (newFolderInput) {
        newFolderInput.value = '';
    }
}

function mapFilesForDisplay(files) {
    return files.map((file) => ({
        ...file,
        iconClass: getFileIcon(file.type),
        sizeLabel: formatFileSize(file.size),
    }));
}

// 當 DOM 載入完成時初始化應用程式
window.addEventListener('DOMContentLoaded', initApp);
