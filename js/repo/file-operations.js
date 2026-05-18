/**
 * 檔案操作模組
 * 處理檔案的上傳、列表、刪除等操作
 */

import {
    putRepoFile,
    deleteRepoFile,
    getRepoContents,
    checkFileExists,
    translateGitHubError,
    getGitHubErrorDetails,
    isGitHubErrorStatus,
} from './github-api.js';
import { fileToBase64, getFileType, validateRenameFilename } from './utils.js';
import { buildUploadPreflightSummary, validateUploadSelection } from './upload-validation.js';
import { API_ERROR_CODES, CONFIG, ERROR_MESSAGES, createLogger } from '../core/index.js';

const logger = createLogger('FileOperations');

// 當前子資料夾
let currentSubFolder = CONFIG.defaultSubFolder;

/**
 * 設定當前子資料夾
 * @param {string} folderName - 資料夾名稱
 */
export function setCurrentSubFolder(folderName) {
    currentSubFolder = folderName || CONFIG.defaultSubFolder;
}

/**
 * 取得當前子資料夾
 * @returns {string} 當前資料夾名稱
 */
export function getCurrentSubFolder() {
    return currentSubFolder;
}

/**
 * 取得完整的檔案路徑
 * @param {string} filename - 檔案名稱
 * @returns {string} 完整路徑
 */
function getFilePath(filename) {
    return `${CONFIG.fileBasePath}/${currentSubFolder}/${filename}`;
}

/**
 * 取得當前資料夾中既有檔案的 SHA 對照表
 * @param {string} [subFolder] - 子資料夾名稱，不指定則使用當前資料夾
 * @returns {Promise<Map<string, string>>} 檔名到 SHA 的對照表
 */
export async function getExistingFilesIndex(subFolder) {
    const folder = subFolder || currentSubFolder;
    const path = `${CONFIG.fileBasePath}/${folder}`;

    try {
        const contents = await getRepoContents(path);
        const fileEntries = contents.filter((item) => item.type === 'file' && item.name !== '.gitkeep');

        return new Map(fileEntries.map((file) => [file.name, file.sha]));
    } catch (error) {
        if (isGitHubErrorStatus(error, API_ERROR_CODES.NOT_FOUND)) {
            return new Map();
        }

        throw translateGitHubError(error, `讀取分類「${folder}」的既有檔案資訊`);
    }
}

/**
 * 建立本次上傳的批次資訊
 * @param {FileList|Array<File>} files - 要上傳的檔案列表
 * @returns {Promise<{existingFilesIndex: Map<string, string>, overwriteFiles: string[], preflight: Object}>} 批次資訊
 */
export async function prepareUploadBatch(files, options = {}) {
    const selectionResult = options.selectionResult || validateUploadSelection(files);
    const validFiles = selectionResult.validFiles;
    const existingFilesIndex = await getExistingFilesIndex();
    const overwriteFiles = [...new Set(Array.from(validFiles)
        .map((file) => file.name)
        .filter((filename) => existingFilesIndex.has(filename)))];

    return {
        existingFilesIndex,
        overwriteFiles,
        preflight: buildUploadPreflightSummary(selectionResult, overwriteFiles),
    };
}

/**
 * 取得 GitHub Pages 的檔案 URL
 * @param {string} filename - 檔案名稱
 * @returns {string} GitHub Pages URL
 */
export function getFileUrl(filename) {
    return `${CONFIG.githubPagesBaseUrl}/${CONFIG.fileBasePath}/${currentSubFolder}/${filename}`;
}

/**
 * 上傳單個檔案到 GitHub
 * @param {File} file - 要上傳的檔案
 * @param {Object} [options] - 上傳選項
 * @param {string|null} [options.existingSha] - 已存在檔案的 SHA
 * @returns {Promise<Object>} 上傳結果
 */
export async function uploadFile(file, options = {}) {
    if (!file) {
        throw new Error(ERROR_MESSAGES.FILE_NOT_SELECTED);
    }

    try {
        // 轉換檔案為 Base64
        const content = await fileToBase64(file);
        const path = getFilePath(file.name);
        let sha = options.existingSha ?? null;

        if (sha === null && Object.prototype.hasOwnProperty.call(options, 'existingSha') === false) {
            // 保留單檔上傳時的向後相容行為
            const existingFile = await checkFileExists(path);
            sha = existingFile ? existingFile.sha : null;
        }

        // 上傳或更新檔案
        const data = await putRepoFile(
            path,
            content,
            `Upload ${file.name}`,
            sha
        );

        return {
            name: file.name,
            sha: data.content.sha,
        };
    } catch (error) {
        const translatedError = translateGitHubError(error, `上傳檔案「${file.name}」`);
        logger.error('Upload error', getGitHubErrorDetails(translatedError));
        throw translatedError;
    }
}

/**
 * 批次上傳多個檔案
 * @param {FileList|Array} files - 要上傳的檔案列表
 * @param {Function} progressCallback - 進度回調函數
 * @param {Object} [options] - 批次上傳選項
 * @param {Map<string, string>} [options.existingFilesIndex] - 同批次共享的檔名 SHA 對照表
 * @returns {Promise<Array>} 上傳結果列表
 */
export async function uploadFiles(files, progressCallback, options = {}) {
    const results = [];
    const total = files.length;
    const existingFilesIndex = options.existingFilesIndex || await getExistingFilesIndex();

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            const existingSha = existingFilesIndex.get(file.name) || null;
            const result = await uploadFile(file, { existingSha });
            results.push({ success: true, file: file.name, result });
            existingFilesIndex.set(file.name, result.sha);

            if (progressCallback) {
                progressCallback({
                    current: i + 1,
                    total: total,
                    percentage: Math.round(((i + 1) / total) * 100),
                    currentFile: file.name,
                });
            }
        } catch (error) {
            const translatedError = translateGitHubError(error, `上傳檔案「${file.name}」`);
            results.push({ success: false, file: file.name, error: translatedError.userMessage });
        }
    }

    return results;
}

/**
 * 取得指定分類下的檔案列表
 * @param {string} [subFolder] - 子資料夾名稱，不指定則使用當前資料夾
 * @returns {Promise<Array>} 檔案列表
 */
export async function listFiles(subFolder) {
    const folder = subFolder || currentSubFolder;
    const path = `${CONFIG.fileBasePath}/${folder}`;

    try {
        const data = await getRepoContents(path);

        // 過濾出檔案（排除資料夾與 .gitkeep）
        const files = data
            .filter((item) => item.type === 'file' && item.name !== '.gitkeep')
            .map((file) => ({
                name: file.name,
                path: file.path,
                sha: file.sha,
                size: file.size,
                url: getFileUrl(file.name),
                downloadUrl: file.download_url,
                type: getFileType(file.name),
            }));

        return files;
    } catch (error) {
        if (isGitHubErrorStatus(error, API_ERROR_CODES.NOT_FOUND)) {
            // 分類不存在，返回空陣列
            return [];
        }
        throw translateGitHubError(error, `取得分類「${folder}」的檔案列表`);
    }
}

/**
 * 刪除檔案
 * @param {string} filename - 檔案名稱
 * @param {string} sha - 檔案 SHA
 * @returns {Promise<boolean>} 是否成功
 */
export async function deleteFile(filename, sha) {
    const path = getFilePath(filename);

    try {
        await deleteRepoFile(path, sha, `Delete ${filename}`);
        return true;
    } catch (error) {
        throw translateGitHubError(error, `刪除檔案「${filename}」`);
    }
}

/**
 * 重新命名檔案
 * 透過 Contents API 以「建立新檔 + 刪除舊檔」兩步完成
 * @param {string} oldName - 原始檔案名稱
 * @param {string} newName - 新檔案名稱
 * @param {string} oldSha - 原始檔案 SHA
 * @returns {Promise<Object>} 新檔案資訊 { name, sha, url }
 */
export async function renameFile(oldName, newName, oldSha) {
    const trimmedNewName = validateRenameFilename(newName, oldName);

    const oldPath = getFilePath(oldName);
    const newPath = getFilePath(trimmedNewName);

    // 大小寫敏感比對：若大小寫不同則同視為改名，跳過存在性檢查
    const isSameNameDifferentCase = oldName.toLowerCase() === trimmedNewName.toLowerCase();

    if (!isSameNameDifferentCase) {
        let existing;
        try {
            existing = await checkFileExists(newPath);
        } catch (error) {
            throw translateGitHubError(error, `檢查新檔名「${trimmedNewName}」是否存在`);
        }
        if (existing) {
            const conflictError = new Error(`目的檔名「${trimmedNewName}」已存在，請選擇其他名稱`);
            conflictError.userMessage = conflictError.message;
            throw conflictError;
        }
    }

    // 取得原始檔案內容（base64）
    let originalFile;
    try {
        originalFile = await checkFileExists(oldPath);
    } catch (error) {
        throw translateGitHubError(error, `讀取原始檔案「${oldName}」內容`);
    }
    if (!originalFile || !originalFile.content) {
        const missingError = new Error(`找不到原始檔案「${oldName}」`);
        missingError.userMessage = missingError.message;
        throw missingError;
    }

    const cleanedContent = String(originalFile.content).replace(/\s/g, '');
    const sourceSha = oldSha || originalFile.sha;

    // 建立新檔
    let putResult;
    try {
        putResult = await putRepoFile(
            newPath,
            cleanedContent,
            `Rename ${oldName} -> ${trimmedNewName}`,
            null,
        );
    } catch (error) {
        throw translateGitHubError(error, `建立新檔案「${trimmedNewName}」`);
    }

    // 刪除舊檔
    try {
        await deleteRepoFile(
            oldPath,
            sourceSha,
            `Remove ${oldName} after rename to ${trimmedNewName}`,
        );
    } catch (error) {
        const translated = translateGitHubError(
            error,
            `重新命名後刪除原始檔案「${oldName}」失敗，新檔案「${trimmedNewName}」已建立`,
        );
        logger.error('Rename cleanup failed', getGitHubErrorDetails(translated));
        throw translated;
    }

    return {
        name: trimmedNewName,
        sha: putResult.content.sha,
        url: getFileUrl(trimmedNewName),
    };
}

/**
 * 重置當前資料夾（用於登出時）
 */
export function resetCurrentFolder() {
    currentSubFolder = CONFIG.defaultSubFolder;
}
