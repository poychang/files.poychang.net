/**
 * Toast 通知模組
 * 處理 Toast 訊息顯示
 */

import { DOM_IDS, TOAST_TYPES, TOAST_AUTO_HIDE_DELAY } from '../core/index.js';

let messageToast, toastInstance, toastIcon, toastMessage;

/**
 * 初始化 Toast 通知系統
 */
export function initToast() {
    messageToast = document.getElementById(DOM_IDS.TOAST_ELEMENT);
    toastIcon = document.getElementById(DOM_IDS.TOAST_ICON);
    toastMessage = document.getElementById(DOM_IDS.TOAST_MESSAGE);

    // 初始化 Bootstrap Toast
    if (messageToast) {
        toastInstance = new bootstrap.Toast(messageToast, {
            autohide: true,
            delay: TOAST_AUTO_HIDE_DELAY,
        });
    }
}

/**
 * 顯示訊息
 * @param {string} message - 訊息內容
 * @param {string} type - 訊息類型：'success', 'danger', 'info', 'warning'
 */
export function showMessage(message, type = TOAST_TYPES.ERROR) {
    if (!messageToast || !toastIcon || !toastMessage || !toastInstance) return;

    // 設定圖示和顏色
    const iconMap = {
        [TOAST_TYPES.SUCCESS]: 'bi-check-circle-fill',
        [TOAST_TYPES.ERROR]: 'bi-exclamation-triangle-fill',
        [TOAST_TYPES.INFO]: 'bi-info-circle-fill',
        [TOAST_TYPES.WARNING]: 'bi-exclamation-circle-fill',
    };

    const bgMap = {
        [TOAST_TYPES.SUCCESS]: 'bg-success',
        [TOAST_TYPES.ERROR]: 'bg-danger',
        [TOAST_TYPES.INFO]: 'bg-info',
        [TOAST_TYPES.WARNING]: 'bg-warning',
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
 * @param {string} message - 訊息內容
 */
export function showSuccess(message) {
    showMessage(message, TOAST_TYPES.SUCCESS);
}

/**
 * 顯示錯誤訊息
 * @param {string} message - 訊息內容
 */
export function showError(message) {
    showMessage(message, TOAST_TYPES.ERROR);
}

/**
 * 顯示資訊訊息
 * @param {string} message - 訊息內容
 */
export function showInfo(message) {
    showMessage(message, TOAST_TYPES.INFO);
}

/**
 * 顯示警告訊息
 * @param {string} message - 訊息內容
 */
export function showWarning(message) {
    showMessage(message, TOAST_TYPES.WARNING);
}
