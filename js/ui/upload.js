/**
 * 檔案上傳管理模組
 * 處理檔案選擇、拖放上傳、上傳進度等操作
 */

import { DOM_IDS, emitFilesSelected } from '../core/index.js';
import { showUploadConfirmModal } from './modal.js';
import { updateProgressBar, resetProgressBar } from './loading.js';

// DOM 元素
let dropZone, fileInput, selectFilesBtn;
let uploadProgress, progressBar, uploadStatus;

/**
 * 初始化上傳功能
 */
export function initUpload() {
    dropZone = document.getElementById(DOM_IDS.UPLOAD_AREA);
    fileInput = document.getElementById(DOM_IDS.FILE_INPUT);
    selectFilesBtn = document.getElementById(DOM_IDS.SELECT_FILES_BTN);
    uploadProgress = document.getElementById(DOM_IDS.UPLOAD_PROGRESS);
    progressBar = document.getElementById(DOM_IDS.UPLOAD_PROGRESS_BAR);
    uploadStatus = document.getElementById(DOM_IDS.UPLOAD_STATUS);

    // 設定拖曳上傳
    if (dropZone && fileInput && selectFilesBtn) {
        setupDragAndDrop();
        selectFilesBtn.addEventListener('click', () => fileInput.click());
    }

    // 監聽檔案選擇事件
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                handleFilesSelected(files);
            }
        });
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

/**
 * 防止預設行為
 * @param {Event} e - 事件物件
 */
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * 處理拖放事件
 * @param {DragEvent} e - 拖放事件
 */
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files && files.length > 0) {
        handleFilesSelected(files);
    }
}

/**
 * 處理檔案選擇
 * @param {FileList} files - 檔案列表
 */
function handleFilesSelected(files) {
    // 使用 Core 層事件系統觸發檔案選擇事件
    emitFilesSelected(Array.from(files));
}

/**
 * 顯示上傳進度
 * @param {Object} progress - 進度資訊
 * @param {number} progress.percentage - 進度百分比
 * @param {number} progress.current - 當前檔案索引
 * @param {number} progress.total - 總檔案數
 * @param {string} progress.currentFile - 當前檔案名稱
 */
export function showUploadProgress(progress) {
    if (!uploadProgress || !progressBar || !uploadStatus) return;

    uploadProgress.classList.remove('d-none');
    updateProgressBar(progressBar, progress.percentage);
    uploadStatus.textContent = `正在上傳 ${progress.current} / ${progress.total}: ${progress.currentFile}`;
}

/**
 * 隱藏上傳進度
 */
export function hideUploadProgress() {
    if (!uploadProgress) return;

    setTimeout(() => {
        uploadProgress.classList.add('d-none');
        resetProgressBar(progressBar);
        if (uploadStatus) {
            uploadStatus.textContent = '';
        }
    }, 1000);
}

/**
 * 清空檔案輸入與上傳狀態
 */
export function clearFileInput() {
    if (fileInput) {
        fileInput.value = '';
    }
    if (uploadProgress && progressBar && uploadStatus) {
        uploadProgress.classList.add('d-none');
        resetProgressBar(progressBar);
        uploadStatus.textContent = '';
    }
}

/**
 * 取得檔案輸入元素
 * @returns {HTMLElement} 檔案輸入元素
 */
export function getFileInput() {
    return fileInput;
}

/**
 * 取得拖放區域元素
 * @returns {HTMLElement} 拖放區域元素
 */
export function getDropZone() {
    return dropZone;
}

/**
 * 取得上傳進度容器
 * @returns {HTMLElement} 上傳進度容器
 */
export function getUploadProgress() {
    return uploadProgress;
}

/**
 * 取得進度條元素
 * @returns {HTMLElement} 進度條元素
 */
export function getProgressBar() {
    return progressBar;
}

/**
 * 取得上傳狀態文字元素
 * @returns {HTMLElement} 狀態文字元素
 */
export function getUploadStatus() {
    return uploadStatus;
}

/**
 * 設定檔案選擇處理器（用於外部自訂處理邏輯）
 * @param {Function} handler - 處理函數
 */
export function setFileSelectHandler(handler) {
    window.addEventListener('files:selected', (e) => {
        if (handler) {
            handler(e.detail.files);
        }
    });
}
