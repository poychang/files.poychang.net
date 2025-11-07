/**
 * GitHub API 基礎模組
 * 提供 GitHub API 的基礎操作和配置
 */

import { getOctokit } from '../auth.js';
import { CONFIG, ERROR_MESSAGES } from '../core/index.js';

/**
 * 檢查 Octokit 是否已初始化
 * @throws {Error} 如果未登入則拋出錯誤
 */
export function ensureOctokit() {
    const octokit = getOctokit();
    if (!octokit) {
        throw new Error(ERROR_MESSAGES.AUTH_REQUIRED);
    }
    return octokit;
}

/**
 * 取得 GitHub 倉庫內容
 * @param {string} path - 檔案路徑
 * @returns {Promise<Object>} GitHub API 回應
 */
export async function getRepoContents(path) {
    const octokit = ensureOctokit();
    
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: CONFIG.defaultRepo.owner,
        repo: CONFIG.defaultRepo.repo,
        path: path,
        ref: CONFIG.defaultRepo.branch,
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        },
        // 添加時間戳參數避免瀏覽器快取
        timestamp: Date.now()
    });
    
    return data;
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
    const octokit = ensureOctokit();
    
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
    
    const { data } = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', params);
    
    return data;
}

/**
 * 刪除 GitHub 倉庫檔案
 * @param {string} path - 檔案路徑
 * @param {string} sha - 檔案 SHA
 * @param {string} message - 提交訊息
 * @returns {Promise<void>}
 */
export async function deleteRepoFile(path, sha, message) {
    const octokit = ensureOctokit();
    
    await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
        owner: CONFIG.defaultRepo.owner,
        repo: CONFIG.defaultRepo.repo,
        path: path,
        message: message,
        sha: sha,
        branch: CONFIG.defaultRepo.branch,
    });
}

/**
 * 檢查檔案是否存在
 * @param {string} path - 檔案路徑
 * @returns {Promise<Object|null>} 檔案資訊或 null
 */
export async function checkFileExists(path) {
    const octokit = ensureOctokit();
    
    try {
        
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: CONFIG.defaultRepo.owner,
            repo: CONFIG.defaultRepo.repo,
            path: path,
            ref: CONFIG.defaultRepo.branch,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            // 添加時間戳參數避免瀏覽器快取
            timestamp: Date.now()
        });
        return data;
    } catch (error) {
        if (error.status === 404) {
            return null;
        }
        throw error;
    }
}
