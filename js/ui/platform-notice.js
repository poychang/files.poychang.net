/**
 * 平台限制提示模組
 * 統一管理 GitHub Pages / Contents API 的服務邊界文案
 */

import { DOM_IDS, PLATFORM_LIMITS } from '../core/index.js';

const AUTHENTICATED_NOTICE_ITEMS = [
    `單一檔案需小於 ${PLATFORM_LIMITS.MAX_FILE_SIZE_LABEL}，超過時 GitHub Contents API 不會接受。`,
    PLATFORM_LIMITS.REPOSITORY_GUIDANCE,
    PLATFORM_LIMITS.API_RATE_LIMIT_GUIDANCE,
    PLATFORM_LIMITS.PAGES_CACHE_GUIDANCE,
    PLATFORM_LIMITS.SERVICE_BOUNDARY_GUIDANCE,
];

const UPLOAD_NOTICE_ITEMS = [
    `上傳前請確認每個檔案都低於 ${PLATFORM_LIMITS.MAX_FILE_SIZE_LABEL}。`,
    '大量檔案會逐筆提交到 GitHub repository，速度與穩定性取決於 GitHub API 響應。',
    PLATFORM_LIMITS.PAGES_CACHE_GUIDANCE,
];

const FILE_NOTICE_ITEMS = [
    '這裡複製的是 GitHub Pages 公開連結。',
    PLATFORM_LIMITS.PAGES_CACHE_GUIDANCE,
];

function renderList(items, listClassName = 'mb-0 ps-3') {
    return `
        <ul class="${listClassName}">
            ${items.map((item) => `<li>${item}</li>`).join('')}
        </ul>
    `;
}

function setMarkup(id, markup) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = markup;
    }
}

function summarizeFiles(files) {
    return files.slice(0, 3).map((file) => file.name).join('、');
}

export function initPlatformNotice() {
    setMarkup(
        DOM_IDS.PLATFORM_BOUNDARY_NOTICE,
        `
            <div class="d-flex align-items-start gap-3">
                <i class="bi bi-exclamation-diamond-fill fs-4"></i>
                <div>
                    <h5 class="alert-heading mb-2">使用限制與服務邊界</h5>
                    <p class="mb-2">這個站點是 GitHub 靜態檔案託管管理介面，不是一般雲端儲存服務。</p>
                    ${renderList(AUTHENTICATED_NOTICE_ITEMS)}
                </div>
            </div>
        `
    );

    setMarkup(
        DOM_IDS.UPLOAD_LIMIT_NOTICE,
        `
            <h6 class="mb-2"><i class="bi bi-info-circle me-2"></i>上傳前請先確認</h6>
            ${renderList(UPLOAD_NOTICE_ITEMS, 'mb-0 ps-3 small')}
        `
    );

    setMarkup(
        DOM_IDS.FILE_LINK_NOTICE,
        `
            <div class="small px-3 py-3">
                <strong class="d-block mb-2">分享連結說明</strong>
                ${renderList(FILE_NOTICE_ITEMS, 'mb-0 ps-3')}
            </div>
        `
    );

    setMarkup(
        DOM_IDS.UPLOAD_CONFIRM_NOTICE,
        renderList(
            [
                `單一檔案上限為 ${PLATFORM_LIMITS.MAX_FILE_SIZE_LABEL}。`,
                PLATFORM_LIMITS.API_RATE_LIMIT_GUIDANCE,
                PLATFORM_LIMITS.PAGES_CACHE_GUIDANCE,
            ],
            'small text-muted mb-0 ps-3'
        )
    );
}

export function getOversizedFiles(files) {
    return Array.from(files).filter(
        (file) => file.size > PLATFORM_LIMITS.MAX_FILE_SIZE_BYTES
    );
}

export function buildOversizeErrorMessage(files) {
    if (files.length === 1) {
        return `無法上傳「${files[0].name}」，GitHub Contents API 單一檔案上限為 ${PLATFORM_LIMITS.MAX_FILE_SIZE_LABEL}。`;
    }

    return `已略過 ${files.length} 個超過 GitHub 單一檔案 ${PLATFORM_LIMITS.MAX_FILE_SIZE_LABEL} 限制的檔案：${summarizeFiles(files)}。`;
}

export function buildUploadStartMessage(fileCount) {
    return `開始透過 GitHub Contents API 逐筆提交 ${fileCount} 個檔案。`;
}

export function buildUploadCompletionMessage(successCount, failCount) {
    if (failCount === 0) {
        return `成功上傳 ${successCount} 個檔案。GitHub Pages 公開連結可能需要數十秒才會更新。`;
    }

    return `上傳完成：成功 ${successCount} 個，失敗 ${failCount} 個。若短時間高頻操作，請留意 GitHub API 速率限制。`;
}

export function buildCopyLinkMessage(filename) {
    return `已複製公開連結：${filename}。若剛上傳或覆蓋，GitHub Pages 可能需數十秒才會對外可見。`;
}
