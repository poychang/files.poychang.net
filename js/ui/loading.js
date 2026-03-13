/**
 * 載入狀態管理模組
 * 處理各種載入指示器的顯示與隱藏
 */

function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function normalizeIconClass(icon = '') {
    if (!icon) return '';
    return icon.startsWith('bi ') ? icon : `bi ${icon}`;
}

function renderState(container, options) {
    if (!container) return;

    const {
        stateClass,
        icon,
        title,
        message,
        messageClass,
        spinner = false,
        spinnerClass = 'text-primary',
        action,
    } = options;

    const safeTitle = escapeHtml(title);
    const safeMessage = escapeHtml(message);
    const hasAction = action?.label && typeof action?.onClick === 'function';
    const safeActionLabel = hasAction ? escapeHtml(action.label) : '';
    const actionIcon = action?.icon ? `<i class="${escapeHtml(action.icon)} me-2" aria-hidden="true"></i>` : '';
    const actionClass = action?.className ? escapeHtml(action.className) : 'btn btn-outline-secondary';

    container.innerHTML = `
        <div class="status-state ${stateClass} d-flex align-items-center justify-content-center text-center py-5 px-3">
            <div class="status-state__body mx-auto">
                ${
                    spinner
                        ? `<div class="spinner-border status-state__spinner ${spinnerClass} mb-3" role="status">
                            <span class="visually-hidden">${safeTitle}</span>
                        </div>`
                        : `<i class="${escapeHtml(normalizeIconClass(icon))} status-state__icon display-4 mb-3 d-inline-flex ${stateClass === 'error-state' ? 'text-danger' : 'text-muted'}" aria-hidden="true"></i>`
                }
                <p class="status-state__title h5 mb-2 ${stateClass === 'error-state' ? 'text-danger' : ''}">${safeTitle}</p>
                ${safeMessage ? `<p class="status-state__message ${messageClass} mb-0">${safeMessage}</p>` : ''}
                ${
                    hasAction
                        ? `<button type="button" class="${actionClass} status-state__action mt-3" data-state-action="true">
                            ${actionIcon}${safeActionLabel}
                        </button>`
                        : ''
                }
            </div>
        </div>
    `;

    if (hasAction) {
        container.querySelector('[data-state-action="true"]')?.addEventListener('click', action.onClick);
    }
}

/**
 * 顯示載入狀態
 * @param {HTMLElement} container - 容器元素
 * @param {string} message - 載入訊息
 */
export function showLoading(container, message = '載入中...') {
    const options = typeof message === 'object'
        ? message
        : { title: message };

    renderState(container, {
        stateClass: 'loading-indicator',
        title: options.title ?? '載入中...',
        message: options.message ?? '',
        messageClass: 'text-muted',
        spinner: true,
        spinnerClass: options.spinnerClass ?? 'text-primary',
        action: options.action,
    });
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
    const options = typeof icon === 'object'
        ? icon
        : { icon, title: message };

    renderState(container, {
        stateClass: 'empty-state',
        icon: options.icon ?? 'bi bi-inbox',
        title: options.title ?? '目前沒有內容',
        message: options.message ?? '',
        messageClass: 'text-muted',
        action: options.action,
    });
}

/**
 * 顯示錯誤狀態
 * @param {HTMLElement} container - 容器元素
 * @param {string} message - 錯誤訊息
 */
export function showErrorState(container, message = '載入失敗，請稍後再試') {
    const options = typeof message === 'object'
        ? message
        : { title: message };

    renderState(container, {
        stateClass: 'error-state',
        icon: options.icon ?? 'bi bi-exclamation-triangle',
        title: options.title ?? '載入失敗，請稍後再試',
        message: options.message ?? '',
        messageClass: 'text-danger',
        action: options.action,
    });
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
