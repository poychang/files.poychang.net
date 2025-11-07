/**
 * UI 管理模組
 * 處理使用者介面相關操作
 */

import {
    listFiles,
    listSubFolders,
    createSubFolder,
    deleteFile,
    getFileIcon,
    formatFileSize,
    getCurrentSubFolder,
    setCurrentSubFolder,
} from './repo.js';

let messageToast, toastInstance;
let toastIcon, toastMessage;
let navbarUserInfo, navbarUserAvatar, navbarUserName, navbarUserLogin, navbarLogoutBtn;
let themeToggleBtn, themeIcon;
let foldersGrid, refreshFoldersBtn;
let newFolderInput, createFolderBtn;
let dropZone, fileInput, selectFilesBtn;
let uploadProgress, progressBar, uploadStatus;
let fileListContainer, fileCountBadge, refreshFilesBtn;
let deleteFolderModal, deleteFolderModalInstance;
let folderToDeleteName, confirmDeleteFolderBtn;

/**
 * 初始化 UI 模組
 */
export function initUI() {
    messageToast = document.getElementById('message-toast');
    toastIcon = document.getElementById('toast-icon');
    toastMessage = document.getElementById('toast-message');

    // 初始化 Bootstrap Toast
    if (messageToast) {
        toastInstance = new bootstrap.Toast(messageToast, {
            autohide: true,
            delay: 4000,
        });
    }

    navbarUserInfo = document.getElementById('navbar-user-info');
    navbarUserAvatar = document.getElementById('navbar-user-avatar');
    navbarUserName = document.getElementById('navbar-user-name');
    navbarUserLogin = document.getElementById('navbar-user-login');
    navbarLogoutBtn = document.getElementById('navbar-logout-btn');

    themeToggleBtn = document.getElementById('theme-toggle-btn');
    themeIcon = document.getElementById('theme-icon');

    foldersGrid = document.getElementById('folders-grid');
    refreshFoldersBtn = document.getElementById('refresh-folders-btn');

    newFolderInput = document.getElementById('new-folder-input');
    createFolderBtn = document.getElementById('create-folder-btn');
    dropZone = document.getElementById('drop-zone');
    fileInput = document.getElementById('file-input');
    selectFilesBtn = document.getElementById('select-files-btn');
    uploadProgress = document.getElementById('upload-progress');
    progressBar = document.getElementById('progress-bar');
    uploadStatus = document.getElementById('upload-status');
    fileListContainer = document.getElementById('file-list');
    fileCountBadge = document.getElementById('file-count-badge');
    refreshFilesBtn = document.getElementById('refresh-files-btn');

    // 初始化刪除分類 Modal
    deleteFolderModal = document.getElementById('deleteFolderModal');
    folderToDeleteName = document.getElementById('folder-to-delete-name');
    confirmDeleteFolderBtn = document.getElementById('confirm-delete-folder-btn');
    if (deleteFolderModal) {
        deleteFolderModalInstance = new bootstrap.Modal(deleteFolderModal);
    }

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

    // 設定拖曳上傳
    if (dropZone && fileInput && selectFilesBtn) {
        setupDragAndDrop();
        selectFilesBtn.addEventListener('click', () => fileInput.click());
    }

    // 重新整理按鈕
    if (refreshFilesBtn) {
        refreshFilesBtn.addEventListener('click', refreshFileList);
    }

    // 重新整理資料夾按鈕
    if (refreshFoldersBtn) {
        refreshFoldersBtn.addEventListener('click', refreshFoldersList);
    }

    // 初始化主題切換
    initThemeToggle();
}

/**
 * 初始化主題切換功能
 */
function initThemeToggle() {
    // 從 localStorage 讀取主題設定
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // 綁定主題切換按鈕
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
}

/**
 * 切換主題
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

/**
 * 設定主題
 */
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // 更新圖示
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.className = 'bi bi-moon-fill';
        } else {
            themeIcon.className = 'bi bi-sun-fill';
        }
    }
}

/**
 * 設定拖曳上傳功能
 */
function setupDragAndDrop() {
    // 防止預設拖曳行為
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // 拖曳效果
    ['dragenter', 'dragover'].forEach((eventName) => {
        dropZone.addEventListener(
            eventName,
            () => {
                dropZone.classList.add('drag-over');
            },
            false
        );
    });

    ['dragleave', 'drop'].forEach((eventName) => {
        dropZone.addEventListener(
            eventName,
            () => {
                dropZone.classList.remove('drag-over');
            },
            false
        );
    });

    // 處理拖放
    dropZone.addEventListener('drop', handleDrop, false);

    // 點擊整個 drop zone 來選擇檔案
    dropZone.addEventListener('click', (e) => {
        if (e.target !== selectFilesBtn && !selectFilesBtn.contains(e.target)) {
            fileInput.click();
        }
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    // 觸發檔案上傳事件
    const event = new CustomEvent('files:selected', { detail: { files } });
    window.dispatchEvent(event);
}

/**
 * 顯示訊息
 */
export function showMessage(message, type = 'danger') {
    if (!messageToast || !toastIcon || !toastMessage || !toastInstance) return;

    // 設定圖示和顏色
    const iconMap = {
        success: 'bi-check-circle-fill',
        danger: 'bi-exclamation-triangle-fill',
        info: 'bi-info-circle-fill',
        warning: 'bi-exclamation-circle-fill',
    };

    const bgMap = {
        success: 'bg-success',
        danger: 'bg-danger',
        info: 'bg-info',
        warning: 'bg-warning',
    };

    // 移除舊的背景色
    messageToast.classList.remove('bg-success', 'bg-danger', 'bg-info', 'bg-warning');

    // 設定新的樣式
    messageToast.classList.add(bgMap[type] || 'bg-info');
    toastIcon.className = `bi ${iconMap[type] || 'bi-info-circle-fill'} me-2`;
    toastMessage.textContent = message;

    // 顯示 toast
    toastInstance.show();
}

/**
 * 顯示成功訊息
 */
export function showSuccess(message) {
    showMessage(message, 'success');
}

/**
 * 顯示錯誤訊息
 */
export function showError(message) {
    showMessage(message, 'danger');
}

/**
 * 顯示資訊訊息
 */
export function showInfo(message) {
    showMessage(message, 'info');
}

/**
 * 顯示使用者資訊
 */
export function displayUserInfo(user) {
    if (navbarUserAvatar && navbarUserName && navbarUserLogin && navbarUserInfo && navbarLogoutBtn) {
        navbarUserAvatar.src = user.avatar_url;
        navbarUserName.textContent = user.name || user.login;
        navbarUserLogin.textContent = `@${user.login}`;
        navbarUserInfo.classList.remove('d-none');
        navbarLogoutBtn.classList.remove('d-none');
    }
}

/**
 * 清除使用者資訊
 */
export function clearUserInfo() {
    if (navbarUserAvatar && navbarUserName && navbarUserLogin && navbarUserInfo && navbarLogoutBtn) {
        navbarUserAvatar.src = '';
        navbarUserName.textContent = '';
        navbarUserLogin.textContent = '';
        navbarUserInfo.classList.add('d-none');
        navbarLogoutBtn.classList.add('d-none');
    }
}

/**
 * 顯示上傳進度
 */
export function showUploadProgress(progress) {
    if (!uploadProgress || !progressBar || !uploadStatus) return;

    uploadProgress.classList.remove('d-none');
    progressBar.style.width = `${progress.percentage}%`;
    progressBar.textContent = `${progress.percentage}%`;
    uploadStatus.textContent = `正在上傳 ${progress.current} / ${progress.total}: ${progress.currentFile}`;
}

/**
 * 隱藏上傳進度
 */
export function hideUploadProgress() {
    if (!uploadProgress) return;

    setTimeout(() => {
        uploadProgress.classList.add('d-none');
        if (progressBar) {
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';
        }
        if (uploadStatus) {
            uploadStatus.textContent = '';
        }
    }, 1000);
}

/**
 * 顯示載入狀態
 */
export function showLoading(container, message = '載入中...') {
    container.innerHTML = `
        <div class="text-center text-muted py-5">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">載入中...</span>
            </div>
            <p>${message}</p>
        </div>
    `;
}

/**
 * 重新整理檔案列表
 */
export async function refreshFileList() {
    try {
        showLoading(fileListContainer, '載入檔案列表...');

        const files = await listFiles();
        displayFileList(files);
    } catch (error) {
        showError(error.message);
        fileListContainer.innerHTML = `
            <div class="text-center text-danger py-4">
                <i class="bi bi-exclamation-triangle display-4"></i>
                <p class="mt-2">${error.message}</p>
            </div>
        `;
    }
}

/**
 * 重新整理資料夾列表
 */
export async function refreshFoldersList() {
    try {
        if (!foldersGrid) return;

        foldersGrid.innerHTML = `
            <div class="col-12 text-center text-muted py-4">
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
        foldersGrid.innerHTML = `
            <div class="col-12 text-center text-danger py-4">
                <i class="bi bi-exclamation-triangle display-4"></i>
                <p class="mt-2">${error.message}</p>
            </div>
        `;
    }
}

/**
 * 顯示資料夾列表
 */
export function displayFoldersList(folders) {
    if (!foldersGrid) return;

    if (folders.length === 0) {
        foldersGrid.innerHTML = `
            <div class="col-12 text-center text-muted py-4">
                <i class="bi bi-folder-x display-4"></i>
                <p class="mt-3">目前沒有任何分類</p>
                <p class="small">建立一個新分類來開始使用</p>
            </div>
        `;
        return;
    }

    // 已於資料層排序，這裡直接渲染
    foldersGrid.innerHTML = folders.map((folder) => createFolderCard(folder)).join('');

    // 綁定點擊事件
    foldersGrid.querySelectorAll('.folder-card').forEach((card) => {
        card.addEventListener('click', () => {
            const folderName = card.dataset.folderName;
            selectFolder(folderName);
        });
    });

    // 綁定刪除按鈕事件
    foldersGrid.querySelectorAll('.folder-delete-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止觸發卡片點擊
            const folderName = btn.dataset.folderName;
            showDeleteFolderModal(folderName);
        });
    });

    // 依目前選擇高亮顯示
    const current = getCurrentSubFolder && getCurrentSubFolder();
    if (current) {
        updateSelectedFolderCard(current);
    }
}

/**
 * 建立資料夾卡片 HTML
 */
function createFolderCard(folder) {
    return `
        <div class="col-sm-6 col-md-4 col-lg-3">
            <div class="folder-card card h-100 shadow-sm" data-folder-name="${folder.name}" style="cursor: pointer; position: relative;">
                <button class="btn btn-sm btn-danger folder-delete-btn d-none" 
                        data-folder-name="${folder.name}"
                        style="position: absolute; top: 8px; right: 8px; z-index: 10; padding: 0.25rem 0.5rem;"
                        title="刪除分類">
                    <i class="bi bi-trash"></i>
                </button>
                <div class="card-body text-center d-flex flex-column align-items-center justify-content-center p-4">
                    <i class="folder-icon bi bi-folder text-primary display-4 mb-3"></i>
                    <h6 class="card-title mb-0 fw-bold">${folder.name}</h6>
                </div>
            </div>
        </div>
    `;
}

/**
 * 選擇資料夾
 */
async function selectFolder(folderName) {
    // 設定當前資料夾
    setCurrentSubFolder(folderName);

    // 高亮顯示被選取的分類卡片
    updateSelectedFolderCard(folderName);

    // 更新當前資料夾顯示
    const currentFolderName = document.getElementById('current-folder-name');
    if (currentFolderName) {
        currentFolderName.textContent = folderName;
    }

    // 顯示上傳區域
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) {
        uploadSection.classList.remove('d-none');
    }

    // 載入該分類的檔案列表
    showInfo(`載入分類：${folderName}`);
    await refreshFileList();

    // 滾動到檔案上傳區域
    uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * 更新分類卡片的選取狀態
 */
function updateSelectedFolderCard(folderName) {
    if (!foldersGrid) return;
    foldersGrid.querySelectorAll('.folder-card').forEach((card) => {
        const icon = card.querySelector('.folder-icon');
        const deleteBtn = card.querySelector('.folder-delete-btn');
        if (card.dataset.folderName === folderName) {
            card.classList.add('selected');
            // 改為實心圖示
            if (icon) {
                icon.classList.remove('bi-folder');
                icon.classList.add('bi-folder-fill');
            }
            // 顯示刪除按鈕
            if (deleteBtn) {
                deleteBtn.classList.remove('d-none');
            }
        } else {
            card.classList.remove('selected');
            // 改回空心圖示
            if (icon) {
                icon.classList.remove('bi-folder-fill');
                icon.classList.add('bi-folder');
            }
            // 隱藏刪除按鈕
            if (deleteBtn) {
                deleteBtn.classList.add('d-none');
            }
        }
    });
}

/**
 * 顯示檔案列表
 */
export function displayFileList(files) {
    if (!fileListContainer || !fileCountBadge) return;

    fileCountBadge.textContent = files.length;

    if (files.length === 0) {
        fileListContainer.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-inbox display-1"></i>
                <p class="mt-3">此分類目前沒有檔案</p>
                <p class="small">上傳一些檔案來開始使用</p>
            </div>
        `;
        return;
    }

    fileListContainer.innerHTML = files.map((file) => createFileItem(file)).join('');

    // 綁定複製和刪除按鈕事件
    fileListContainer.querySelectorAll('.btn-copy-link').forEach((btn) => {
        btn.addEventListener('click', () => copyFileLink(btn.dataset.url, btn.dataset.filename));
    });

    fileListContainer.querySelectorAll('.btn-delete-file').forEach((btn) => {
        btn.addEventListener('click', (e) => confirmDeleteFile(btn.dataset.filename, btn.dataset.sha, e.currentTarget));
    });
}

/**
 * 建立檔案項目 HTML
 */
function createFileItem(file) {
    const iconClass = getFileIcon(file.type);
    const isImage = file.type === 'image';

    return `
        <div class="list-group-item file-item">
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
 */
async function copyFileLink(url, filename) {
    try {
        await navigator.clipboard.writeText(url);
        showSuccess(`✓ 已複製連結：${filename}`);
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
            showSuccess(`✓ 已複製連結：${filename}`);
        } catch (err) {
            showError('複製失敗，請手動複製');
        }

        document.body.removeChild(textarea);
    }
}

/**
 * 確認刪除檔案
 */
async function confirmDeleteFile(filename, sha, triggerBtn) {
    if (!confirm(`確定要刪除檔案 "${filename}" 嗎？\n\n此操作無法復原。`)) {
        return;
    }

    try {
        // 顯示載入狀態
        const deleteBtn = triggerBtn;
        const originalHtml = deleteBtn.innerHTML;
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>刪除中...';

        await deleteFile(filename, sha);
        showSuccess(`✓ 已刪除檔案：${filename}`);

        // 重新載入檔案列表
        await refreshFileList();
    } catch (error) {
        showError(error.message);

        // 恢復按鈕狀態
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = originalHtml;
        }
    }
}

/**
 * 取得檔案輸入元素（供外部使用）
 */
export function getFileInput() {
    return fileInput;
}

/**
 * 取得導航列登出按鈕（供外部使用）
 */
export function getNavbarLogoutBtn() {
    return navbarLogoutBtn;
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
        const originalHtml = createFolderBtn.innerHTML;
        createFolderBtn.disabled = true;
        createFolderBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>建立中...';

        await createSubFolder(folderName);
        showSuccess(`✓ 已建立分類：${folderName}`);

        // 清空輸入框
        newFolderInput.value = '';

        // 重新載入資料夾列表
        await refreshFoldersList();

        // 恢復按鈕狀態
        createFolderBtn.disabled = false;
        createFolderBtn.innerHTML = '<i class="bi bi-plus-circle me-2"></i>建立分類';
    } catch (error) {
        showError(error.message);

        // 恢復按鈕狀態
        createFolderBtn.disabled = false;
        createFolderBtn.innerHTML = '<i class="bi bi-plus-circle me-2"></i>建立分類';
    }
}

/**
 * 顯示刪除分類確認 Modal
 */
function showDeleteFolderModal(folderName) {
    if (!deleteFolderModalInstance || !folderToDeleteName || !confirmDeleteFolderBtn) return;
    
    // 設定要刪除的資料夾名稱
    folderToDeleteName.textContent = folderName;
    
    // 移除舊的事件監聽器並綁定新的
    const newBtn = confirmDeleteFolderBtn.cloneNode(true);
    confirmDeleteFolderBtn.parentNode.replaceChild(newBtn, confirmDeleteFolderBtn);
    confirmDeleteFolderBtn = newBtn;
    
    confirmDeleteFolderBtn.addEventListener('click', () => handleDeleteFolder(folderName));
    
    // 顯示 Modal
    deleteFolderModalInstance.show();
}

/**
 * 處理刪除分類
 */
async function handleDeleteFolder(folderName) {
    try {
        // 顯示載入狀態
        const originalHtml = confirmDeleteFolderBtn.innerHTML;
        confirmDeleteFolderBtn.disabled = true;
        confirmDeleteFolderBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>刪除中...';

        // 動態匯入 deleteSubFolder
        const { deleteSubFolder } = await import('./repo.js');
        await deleteSubFolder(folderName);
        
        showSuccess(`✓ 已刪除分類：${folderName}`);

        // 隱藏 Modal
        deleteFolderModalInstance.hide();

        // 重新載入資料夾列表
        await refreshFoldersList();

        // 隱藏上傳區域
        const uploadSection = document.getElementById('upload-section');
        if (uploadSection) {
            uploadSection.classList.add('d-none');
        }

        // 恢復按鈕狀態
        confirmDeleteFolderBtn.disabled = false;
        confirmDeleteFolderBtn.innerHTML = '<i class="bi bi-trash me-1"></i>確認刪除';
    } catch (error) {
        showError(error.message);

        // 恢復按鈕狀態
        confirmDeleteFolderBtn.disabled = false;
        confirmDeleteFolderBtn.innerHTML = '<i class="bi bi-trash me-1"></i>確認刪除';
    }
}
