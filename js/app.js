/**
 * 主應用程式
 * 整合所有模組並初始化應用程式
 */

import { initAuth } from './auth.js';
import { initRepo, setCurrentSubFolder, uploadFiles, getCurrentSubFolder } from './repo.js';
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
    getFileInput
} from './ui.js';

/**
 * 應用程式初始化
 */
function initApp() {
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
    window.addEventListener('auth:logout', handleLogout);
}

/**
 * 設定事件監聽器
 */
function setupEventListeners() {
    // 子資料夾設定
    const subfolderInput = document.getElementById('subfolder-input');
    const browseFolderBtn = document.getElementById('browse-folder-btn');
    const uploadSection = document.getElementById('upload-section');

    // 瀏覽資料夾按鈕
    if (browseFolderBtn) {
        browseFolderBtn.addEventListener('click', async () => {
            const folderName = subfolderInput.value.trim() || CONFIG.defaultSubFolder;
            setCurrentSubFolder(folderName);
            
            // 顯示上傳區域
            uploadSection.classList.remove('d-none');
            
            // 載入該資料夾的檔案列表
            showInfo(`正在載入資料夾：${folderName}`);
            await refreshFileList();
        });
    }

    // Enter 鍵快速瀏覽
    if (subfolderInput) {
        subfolderInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && browseFolderBtn) {
                browseFolderBtn.click();
            }
        });
    }

    // 檔案選擇（透過按鈕或拖曳）
    const fileInput = getFileInput();
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(Array.from(e.target.files));
            }
        });
    }

    // 監聽自訂檔案選擇事件（來自拖曳）
    window.addEventListener('files:selected', (e) => {
        if (e.detail.files.length > 0) {
            handleFileUpload(Array.from(e.detail.files));
        }
    });
}

/**
 * 處理檔案上傳
 */
async function handleFileUpload(files) {
    if (!files || files.length === 0) {
        showError('請選擇檔案');
        return;
    }

    const currentFolder = getCurrentSubFolder();
    
    if (!confirm(`確定要上傳 ${files.length} 個檔案到 files/${currentFolder}/ 嗎？`)) {
        // 清除檔案選擇
        const fileInput = getFileInput();
        if (fileInput) fileInput.value = '';
        return;
    }

    try {
        showInfo(`開始上傳 ${files.length} 個檔案...`);
        
        const results = await uploadFiles(files, (progress) => {
            showUploadProgress(progress);
        });

        // 統計結果
        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        hideUploadProgress();

        // 顯示結果
        if (failCount === 0) {
            showSuccess(`✓ 成功上傳 ${successCount} 個檔案！`);
        } else {
            showError(`上傳完成：成功 ${successCount} 個，失敗 ${failCount} 個`);
            
            // 顯示失敗的檔案
            const failedFiles = results.filter(r => !r.success);
            console.error('上傳失敗的檔案：', failedFiles);
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
async function handleAuthSuccess(user) {
    displayUserInfo(user);
    showSuccess('✅ 登入成功！');
    
    // 顯示已登入區域
    const loginSection = document.getElementById('login-section');
    const authenticatedSection = document.getElementById('authenticated-section');
    const pageHeader = document.getElementById('page-header');
    
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
    const loginSection = document.getElementById('login-section');
    const authenticatedSection = document.getElementById('authenticated-section');
    const uploadSection = document.getElementById('upload-section');
    const pageHeader = document.getElementById('page-header');
    
    if (loginSection) loginSection.classList.remove('d-none');
    if (authenticatedSection) authenticatedSection.classList.add('d-none');
    if (uploadSection) uploadSection.classList.add('d-none');
    if (pageHeader) pageHeader.classList.remove('d-none');
    
    // 重置子資料夾輸入
    const subfolderInput = document.getElementById('subfolder-input');
    if (subfolderInput) {
        subfolderInput.value = CONFIG.defaultSubFolder;
    }
    
    showSuccess('已登出');
}

// 當 DOM 載入完成時初始化應用程式
window.addEventListener('DOMContentLoaded', initApp);

