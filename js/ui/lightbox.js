/**
 * 圖像預覽 Lightbox 模組
 * 點選檔案列表中的圖像後，使用 Bootstrap Modal 以較大尺寸呈現該圖像。
 */

import { DOM_IDS } from '../core/index.js';

let lightboxModal;
let lightboxModalInstance;
let lightboxTitle;
let lightboxImage;
let lightboxOpenBtn;

/**
 * 初始化 Lightbox
 */
export function initLightbox() {
    lightboxModal = document.getElementById(DOM_IDS.IMAGE_LIGHTBOX_MODAL);
    lightboxTitle = document.getElementById(DOM_IDS.IMAGE_LIGHTBOX_TITLE);
    lightboxImage = document.getElementById(DOM_IDS.IMAGE_LIGHTBOX_IMAGE);
    lightboxOpenBtn = document.getElementById(DOM_IDS.IMAGE_LIGHTBOX_OPEN_BTN);

    if (!lightboxModal) {
        console.warn('[Lightbox] Modal element not found. Ensure the modal HTML is present in the page.');
        return;
    }

    if (typeof bootstrap === 'undefined') {
        console.warn('[Lightbox] Bootstrap is not available. The lightbox will not function.');
        return;
    }

    lightboxModalInstance = new bootstrap.Modal(lightboxModal);

    // 關閉時清除圖像來源，避免下一次開啟時短暫顯示上一張圖。
    lightboxModal.addEventListener('hidden.bs.modal', () => {
        if (lightboxImage) {
            lightboxImage.src = '';
            lightboxImage.alt = '';
        }
        if (lightboxOpenBtn) {
            lightboxOpenBtn.href = '#';
        }
    });
}

/**
 * 顯示圖像 Lightbox
 * @param {Object} options
 * @param {string} options.src - 圖像來源 URL
 * @param {string} options.filename - 檔案名稱（顯示於標題）
 * @param {string} [options.openUrl] - 「在新分頁開啟」按鈕使用的 URL，未提供時使用 src
 */
export function showImageLightbox({ src, filename, openUrl }) {
    if (!lightboxModalInstance || !lightboxImage) return;

    lightboxImage.src = src;
    lightboxImage.alt = filename || '圖像預覽';

    if (lightboxTitle) {
        lightboxTitle.textContent = filename || '圖像預覽';
    }

    if (lightboxOpenBtn) {
        const targetUrl = openUrl || src;
        try {
            const parsed = new URL(targetUrl, window.location.href);
            lightboxOpenBtn.href =
                parsed.protocol === 'http:' || parsed.protocol === 'https:' ? targetUrl : '#';
        } catch {
            lightboxOpenBtn.href = '#';
        }
    }

    lightboxModalInstance.show();
}

/**
 * 隱藏 Lightbox
 */
export function hideImageLightbox() {
    if (lightboxModalInstance) {
        lightboxModalInstance.hide();
    }
}
