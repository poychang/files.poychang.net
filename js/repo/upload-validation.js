/**
 * 檔案上傳前驗證模組
 * 集中管理檔案選擇階段的阻擋與警告規則
 */

import { PLATFORM_LIMITS } from '../core/index.js';
import { formatFileSize, getFileExtension, getSupportedExtensions, isValidFilename } from './utils.js';

const SUPPORTED_EXTENSIONS = new Set(
    Object.values(getSupportedExtensions())
        .flat()
        .map((extension) => extension.toLowerCase())
);

export const UPLOAD_VALIDATION_CODES = {
    EMPTY_FILE: 'empty-file',
    FILE_TOO_LARGE: 'file-too-large',
    INVALID_FILENAME: 'invalid-filename',
    DUPLICATE_FILENAME: 'duplicate-filename',
    UNSUPPORTED_EXTENSION: 'unsupported-extension',
    TOO_MANY_FILES: 'too-many-files',
    OVERWRITE_WARNING: 'overwrite-warning',
};

function createIssue({ code, severity, message, fileName = null }) {
    return { code, severity, message, fileName };
}

function getDuplicateNameKeys(files) {
    const counts = new Map();

    files.forEach((file) => {
        const key = file.name.toLowerCase();
        counts.set(key, (counts.get(key) || 0) + 1);
    });

    return new Set(
        [...counts.entries()]
            .filter(([, count]) => count > 1)
            .map(([key]) => key)
    );
}

function isFilenameValidForUpload(filename) {
    if (!isValidFilename(filename)) {
        return false;
    }

    if (filename !== filename.trim()) {
        return false;
    }

    if (filename === '.' || filename === '..') {
        return false;
    }

    return !/[\\/]/.test(filename);
}

function hasSupportedExtension(filename) {
    if (!filename.includes('.')) {
        return false;
    }

    const extension = getFileExtension(filename);
    return SUPPORTED_EXTENSIONS.has(extension);
}

/**
 * 驗證本次選取的檔案
 * @param {FileList|File[]} files - 使用者選取的檔案
 * @returns {Object} 驗證結果
 */
export function validateUploadSelection(files) {
    const selectedFiles = Array.from(files || []);
    const duplicateNameKeys = getDuplicateNameKeys(selectedFiles);
    const blockingIssues = [];
    const validFiles = [];
    const blockedFiles = [];

    if (selectedFiles.length > PLATFORM_LIMITS.MAX_UPLOAD_FILE_COUNT) {
        const batchIssue = createIssue({
            code: UPLOAD_VALIDATION_CODES.TOO_MANY_FILES,
            severity: 'blocking',
            message: `單次最多只能上傳 ${PLATFORM_LIMITS.MAX_UPLOAD_FILE_COUNT} 個檔案，這次選了 ${selectedFiles.length} 個。`,
        });

        return {
            selectedFiles,
            validFiles: [],
            blockedFiles: selectedFiles,
            blockingIssues: [batchIssue],
            warningIssues: [],
            skippedFileCount: selectedFiles.length,
            hasBlockingIssues: true,
        };
    }

    selectedFiles.forEach((file) => {
        const issues = [];

        if (file.size === 0) {
            issues.push(createIssue({
                code: UPLOAD_VALIDATION_CODES.EMPTY_FILE,
                severity: 'blocking',
                fileName: file.name,
                message: `「${file.name}」是空檔案，請確認內容後再上傳。`,
            }));
        }

        if (file.size > PLATFORM_LIMITS.MAX_FILE_SIZE_BYTES) {
            issues.push(createIssue({
                code: UPLOAD_VALIDATION_CODES.FILE_TOO_LARGE,
                severity: 'blocking',
                fileName: file.name,
                message: `「${file.name}」大小為 ${formatFileSize(file.size)}，超過單檔 ${PLATFORM_LIMITS.MAX_FILE_SIZE_LABEL} 上限。`,
            }));
        }

        if (!isFilenameValidForUpload(file.name)) {
            issues.push(createIssue({
                code: UPLOAD_VALIDATION_CODES.INVALID_FILENAME,
                severity: 'blocking',
                fileName: file.name,
                message: `「${file.name}」的檔名格式不合法，請避免保留字元、路徑分隔符號與前後空白。`,
            }));
        }

        if (!hasSupportedExtension(file.name)) {
            issues.push(createIssue({
                code: UPLOAD_VALIDATION_CODES.UNSUPPORTED_EXTENSION,
                severity: 'blocking',
                fileName: file.name,
                message: `「${file.name}」的副檔名不在允許清單內。`,
            }));
        }

        if (duplicateNameKeys.has(file.name.toLowerCase())) {
            issues.push(createIssue({
                code: UPLOAD_VALIDATION_CODES.DUPLICATE_FILENAME,
                severity: 'blocking',
                fileName: file.name,
                message: `「${file.name}」與本批次中的其他檔案重複，請先移除或重新命名。`,
            }));
        }

        if (issues.length > 0) {
            blockedFiles.push(file);
            blockingIssues.push(...issues);
            return;
        }

        validFiles.push(file);
    });

    return {
        selectedFiles,
        validFiles,
        blockedFiles,
        blockingIssues,
        warningIssues: [],
        skippedFileCount: blockedFiles.length,
        hasBlockingIssues: blockingIssues.length > 0,
    };
}

/**
 * 建立上傳確認前的完整摘要
 * @param {Object} selectionResult - validateUploadSelection() 的結果
 * @param {string[]} overwriteFiles - 會覆蓋既有檔案的檔名
 * @returns {Object} 上傳前摘要
 */
export function buildUploadPreflightSummary(selectionResult, overwriteFiles = []) {
    const warningIssues = overwriteFiles.map((fileName) => createIssue({
        code: UPLOAD_VALIDATION_CODES.OVERWRITE_WARNING,
        severity: 'warning',
        fileName,
        message: `「${fileName}」已存在，這次上傳會覆蓋原有內容。`,
    }));

    return {
        selectedFiles: selectionResult.selectedFiles,
        validFiles: selectionResult.validFiles,
        blockedFiles: selectionResult.blockedFiles,
        blockingIssues: selectionResult.blockingIssues,
        warningIssues,
        skippedFileCount: selectionResult.skippedFileCount,
        overwriteFiles,
        hasBlockingIssues: selectionResult.hasBlockingIssues,
        hasWarnings: warningIssues.length > 0,
    };
}

export function buildUploadSelectionFeedback(selectionResult) {
    if (!selectionResult.hasBlockingIssues) {
        return null;
    }

    const issueCount = selectionResult.blockingIssues.length;

    if (selectionResult.validFiles.length === 0) {
        return `這批檔案未通過上傳前驗證，共有 ${issueCount} 個問題，未送出任何上傳請求。`;
    }

    return `已略過 ${selectionResult.skippedFileCount} 個不符合規則的檔案，共發現 ${issueCount} 個問題；其餘 ${selectionResult.validFiles.length} 個檔案可繼續上傳。`;
}

export function getSupportedUploadExtensions() {
    return [...SUPPORTED_EXTENSIONS].sort();
}
