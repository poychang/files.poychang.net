/**
 * 載入狀態管理模組
 * 處理各種載入指示器的顯示與隱藏
 */

import { DOM_IDS } from '../core/index.js';

/**
 * 顯示載入狀態
 * @param {HTMLElement} container - 容器元素
 * @param {string} message - 載入訊息
 */
export function showLoading(container, message = '載入中...') {
    if (!container) return;

    const loadingHtml = `
        <div class="text-center py-5 loading-indicator">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">${message}</span>
            </div>
            <p class="text-muted">${message}</p>
        </div>
    `;

    container.innerHTML = loadingHtml;
}

/**
 * 隱藏載入狀態
 * @param {HTMLElement} container - 容器元素
 */
export function hideLoading(container) {
    if (!container) return;

    const loadingIndicator = container.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

/**
 * 顯示空狀態訊息
 * @param {HTMLElement} container - 容器元素
 * @param {string} icon - Bootstrap Icon 類別名稱
 * @param {string} message - 顯示訊息
 */
export function showEmptyState(container, icon = 'bi-inbox', message = '目前沒有內容') {
    if (!container) return;

    const emptyHtml = `
        <div class="text-center py-5 empty-state">
            <i class="${icon} display-1 text-muted"></i>
            <p class="text-muted mt-3">${message}</p>
        </div>
    `;

    container.innerHTML = emptyHtml;
}

/**
 * 顯示錯誤狀態
 * @param {HTMLElement} container - 容器元素
 * @param {string} message - 錯誤訊息
 */
export function showErrorState(container, message = '載入失敗，請稍後再試') {
    if (!container) return;

    const errorHtml = `
        <div class="text-center py-5 error-state">
            <i class="bi bi-exclamation-triangle display-1 text-danger"></i>
            <p class="text-danger mt-3">${message}</p>
        </div>
    `;

    container.innerHTML = errorHtml;
}

/**
 * 顯示按鈕載入狀態
 * @param {HTMLElement} button - 按鈕元素
 * @param {string} loadingText - 載入時顯示的文字
 */
export function showButtonLoading(button, loadingText = '處理中...') {
    if (!button) return;

    // 儲存原始內容
    button.dataset.originalContent = button.innerHTML;
    button.dataset.originalDisabled = button.disabled;

    // 設定載入狀態
    button.disabled = true;
    button.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        ${loadingText}
    `;
}

/**
 * 隱藏按鈕載入狀態
 * @param {HTMLElement} button - 按鈕元素
 */
export function hideButtonLoading(button) {
    if (!button || !button.dataset.originalContent) return;

    // 恢復原始內容
    button.innerHTML = button.dataset.originalContent;
    button.disabled = button.dataset.originalDisabled === 'true';

    // 清除儲存的資料
    delete button.dataset.originalContent;
    delete button.dataset.originalDisabled;
}

/**
 * 顯示進度條
 * @param {HTMLElement} progressBar - 進度條元素
 * @param {number} percentage - 進度百分比 (0-100)
 */
export function updateProgressBar(progressBar, percentage) {
    if (!progressBar) return;

    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    progressBar.style.width = `${clampedPercentage}%`;
    progressBar.setAttribute('aria-valuenow', clampedPercentage);
    progressBar.textContent = `${Math.round(clampedPercentage)}%`;
}

/**
 * 重置進度條
 * @param {HTMLElement} progressBar - 進度條元素
 */
export function resetProgressBar(progressBar) {
    if (!progressBar) return;

    progressBar.style.width = '0%';
    progressBar.setAttribute('aria-valuenow', 0);
    progressBar.textContent = '0%';
}
