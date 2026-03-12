/**
 * GitHub API 基礎模組
 * 提供 GitHub API 的基礎操作和配置
 */

import { getOctokit } from '../auth.js';
import { API_ERROR_CODES, CONFIG } from '../core/index.js';
import {
    createAuthRequiredError,
    isGitHubErrorStatus,
    translateGitHubError,
} from './github-error.js';

/**
 * 檢查 Octokit 是否已初始化
 * @throws {Error} 如果未登入則拋出錯誤
 */
export function ensureOctokit() {
    const octokit = getOctokit();
    if (!octokit) {
        throw createAuthRequiredError();
    }
    return octokit;
}
export {
    getGitHubErrorDetails,
    isGitHubErrorStatus,
    isGitHubOperationError,
    translateGitHubError,
} from './github-error.js';

async function requestGitHub(route, params, context) {
    const octokit = ensureOctokit();

    try {
        const response = await octokit.request(route, params);
        return response.data;
    } catch (error) {
        throw translateGitHubError(error, context);
    }
}

/**
 * 取得 GitHub 倉庫內容
 * @param {string} path - 檔案路徑
 * @returns {Promise<Object>} GitHub API 回應
 */
export async function getRepoContents(path) {
    return requestGitHub('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: CONFIG.defaultRepo.owner,
        repo: CONFIG.defaultRepo.repo,
        path: path,
        ref: CONFIG.defaultRepo.branch,
        // 添加時間戳參數避免瀏覽器快取
        timestamp: Date.now()
    }, `讀取 repository 內容 (${path})`);
}

/**
 * 建立或更新檔案到 GitHub
 * @param {string} path - 檔案路徑
 * @param {string} content - 檔案內容 (Base64)
 * @param {string} message - 提交訊息
 * @param {string} [sha] - 檔案 SHA (更新時需要)
 * @returns {Promise<Object>} GitHub API 回應
 */
export async function putRepoFile(path, content, message, sha = null) {
    const params = {
        owner: CONFIG.defaultRepo.owner,
        repo: CONFIG.defaultRepo.repo,
        path: path,
        message: message,
        content: content,
        branch: CONFIG.defaultRepo.branch,
    };

    if (sha) {
        params.sha = sha;
    }

    return requestGitHub(
        'PUT /repos/{owner}/{repo}/contents/{path}',
        params,
        `寫入 repository 檔案 (${path})`
    );
}

/**
 * 刪除 GitHub 倉庫檔案
 * @param {string} path - 檔案路徑
 * @param {string} sha - 檔案 SHA
 * @param {string} message - 提交訊息
 * @returns {Promise<void>}
 */
export async function deleteRepoFile(path, sha, message) {
    await requestGitHub('DELETE /repos/{owner}/{repo}/contents/{path}', {
        owner: CONFIG.defaultRepo.owner,
        repo: CONFIG.defaultRepo.repo,
        path: path,
        message: message,
        sha: sha,
        branch: CONFIG.defaultRepo.branch,
    }, `刪除 repository 檔案 (${path})`);
}

/**
 * 檢查檔案是否存在
 * @param {string} path - 檔案路徑
 * @returns {Promise<Object|null>} 檔案資訊或 null
 */
export async function checkFileExists(path) {
    try {
        return await requestGitHub('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: CONFIG.defaultRepo.owner,
            repo: CONFIG.defaultRepo.repo,
            path: path,
            ref: CONFIG.defaultRepo.branch,
            // 添加時間戳參數避免瀏覽器快取
            timestamp: Date.now()
        }, `檢查 repository 檔案 (${path})`);
    } catch (error) {
        if (isGitHubErrorStatus(error, API_ERROR_CODES.NOT_FOUND)) {
            return null;
        }
        throw error;
    }
}
