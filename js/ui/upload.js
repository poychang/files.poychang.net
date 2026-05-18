/**
 * 檔案上傳管理模組
 * 只負責拖放、選檔與上傳進度 UI。
 */

import { DOM_IDS } from '../core/index.js';
import { updateProgressBar, resetProgressBar } from './loading.js';

// DOM 元素
let dropZone, fileInput, selectFilesBtn;
let uploadProgress, progressBar, uploadStatus;
let onFilesSelected = null;

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
        setupClipboardPaste();
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
 * 設定剪貼簿貼上上傳功能
 * 允許使用者直接在上傳區可見時按 Ctrl+V 貼上檔案或截圖
 */
function setupClipboardPaste() {
    document.addEventListener('paste', handlePaste);
}

/**
 * 判斷目前焦點是否在可輸入文字的元素
 * 若是，則略過貼上檔案以免干擾使用者輸入
 * @returns {boolean}
 */
function isEditableTarget(target) {
    if (!target) return false;
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (target.isContentEditable) return true;
    return false;
}

/**
 * 處理剪貼簿貼上事件
 * @param {ClipboardEvent} e - 貼上事件
 */
function handlePaste(e) {
    // 若上傳區不在畫面上（例如使用者在其他分頁/檢視），則不處理
    if (!dropZone || !dropZone.offsetParent) return;

    // 若使用者正在輸入欄位中，避免攔截一般文字貼上
    if (isEditableTarget(e.target)) return;

    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const files = extractFilesFromClipboard(clipboardData);
    if (files.length === 0) return;

    e.preventDefault();
    handleFilesSelected(files);
}

/**
 * 從剪貼簿資料中萃取檔案（包含複製的檔案與截圖）
 * @param {DataTransfer} clipboardData
 * @returns {File[]}
 */
function extractFilesFromClipboard(clipboardData) {
    const collected = [];
    const seen = new Set();

    const pushFile = (file) => {
        if (!file) return;
        const key = `${file.name}|${file.size}|${file.lastModified}|${file.type}`;
        if (seen.has(key)) return;
        seen.add(key);
        collected.push(file);
    };

    if (clipboardData.files && clipboardData.files.length > 0) {
        for (const file of clipboardData.files) {
            pushFile(file);
        }
    }

    if (clipboardData.items && clipboardData.items.length > 0) {
        for (const item of clipboardData.items) {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) {
                    pushFile(ensureFileName(file));
                }
            }
        }
    }

    return collected;
}

/**
 * 對於沒有檔名的剪貼簿項目（如直接複製的截圖），補上有意義的檔名
 * @param {File} file
 * @returns {File}
 */
function ensureFileName(file) {
    if (file.name && file.name !== 'image.png' && file.name.trim() !== '') {
        return file;
    }

    const ext = (file.type && file.type.split('/')[1]) || 'png';
    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .replace('Z', '');
    const newName = `clipboard-${timestamp}.${ext}`;

    try {
        return new File([file], newName, {
            type: file.type,
            lastModified: file.lastModified,
        });
    } catch {
        return file;
    }
}

/**
 * 處理檔案選擇
 * @param {FileList} files - 檔案列表
 */
function handleFilesSelected(files) {
    onFilesSelected?.(Array.from(files || []));
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
 * 設定上傳區域接受的副檔名
 * @param {string[]} extensions - 支援副檔名
 */
export function configureUploadInput(extensions = []) {
    if (!fileInput) return;

    fileInput.accept = extensions
        .map((extension) => `.${extension}`)
        .join(',');
}

/**
 * 設定檔案選擇處理器
 * @param {Function} handler - 處理函數
 */
export function setUploadHandlers(handlers = {}) {
    if (handlers.onFilesSelected) {
        onFilesSelected = handlers.onFilesSelected;
    }
}


