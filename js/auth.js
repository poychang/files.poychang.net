import { Octokit } from "https://esm.sh/@octokit/core";
import { getNavbarLogoutBtn } from './ui.js';

/**
 * 認證管理模組
 * 使用 Personal Access Token 進行認證（純前端方案）
 */

let octokit = null;

// DOM 元素
let loginSection, authenticatedSection;
let loginBtn, tokenInput, tokenLoginBtn;
let navbarLogoutBtn;

// 回調函數
let onAuthSuccess = null;
let onAuthFail = null;

/**
 * 初始化認證模組
 */
export function initAuth(config) {
    loginSection = document.getElementById('login-section');
    authenticatedSection = document.getElementById('authenticated-section');
    loginBtn = document.getElementById('login-btn');
    tokenInput = document.getElementById('token-input');
    tokenLoginBtn = document.getElementById('token-login-btn');
    navbarLogoutBtn = getNavbarLogoutBtn();

    // 設定回調
    if (config.onAuthSuccess) onAuthSuccess = config.onAuthSuccess;
    if (config.onAuthFail) onAuthFail = config.onAuthFail;

    // 綁定事件
    loginBtn.addEventListener('click', showTokenInput);
    tokenLoginBtn.addEventListener('click', loginWithToken);
    
    // 綁定導航列登出按鈕
    if (navbarLogoutBtn) {
        navbarLogoutBtn.addEventListener('click', logout);
    }
    
    // 支援 Enter 鍵登入
    tokenInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginWithToken();
        }
    });

    // 檢查是否已登入
    checkExistingAuth();
}

/**
 * 檢查現有的認證狀態
 */
async function checkExistingAuth() {
    const token = localStorage.getItem('github_token');
    if (token) {
        try {
            octokit = new Octokit({ auth: token });
            
            // 驗證 token 是否有效
            await octokit.request('GET /user');
            
            // Token 有效，顯示已登入狀態
            showAuthenticatedState();
            
            if (onAuthSuccess) {
                const user = await getUserInfo();
                onAuthSuccess(user, { auto: true });
            }
        } catch (error) {
            // Token 無效，清除並顯示登入按鈕
            localStorage.removeItem('github_token');
            octokit = null;
            showLoginState();
        }
    }
}

/**
 * 顯示 Token 輸入框
 */
function showTokenInput() {
    const tokenSection = document.getElementById('token-input-section');
    tokenSection.classList.remove('d-none');
    loginBtn.classList.add('d-none');
    tokenInput.focus();
}

/**
 * 使用 Personal Access Token 登入
 */
async function loginWithToken() {
    const token = tokenInput.value.trim();
    
    if (!token) {
        if (onAuthFail) {
            onAuthFail('請輸入 GitHub Personal Access Token');
        }
        return;
    }

    try {
        tokenLoginBtn.disabled = true;
        
        // 初始化 Octokit
        octokit = new Octokit({ auth: token });
        
        // 驗證 token 是否有效
        const user = await getUserInfo();
        
        // Token 有效，儲存並顯示已登入狀態
        localStorage.setItem('github_token', token);
        showAuthenticatedState();
        
        if (onAuthSuccess) {
            onAuthSuccess(user, { auto: false });
        }
        
    } catch (error) {
        octokit = null;
        if (onAuthFail) {
            onAuthFail('登入失敗：' + error.message + '。請確認 Token 是否正確。');
        }
        tokenLoginBtn.disabled = false;
    }
}

/**
 * 登出
 */
function logout() {
    localStorage.removeItem('github_token');
    octokit = null;
    tokenInput.value = '';
    showLoginState();
    
    // 觸發登出事件
    const event = new CustomEvent('auth:logout');
    window.dispatchEvent(event);
}

/**
 * 取得使用者資訊
 */
async function getUserInfo() {
    try {
        const { data: user } = await octokit.request('GET /user');
        return user;
    } catch (error) {
        throw new Error('無法取得使用者資訊：' + error.message);
    }
}

/**
 * 取得當前的 Octokit 實例
 */
export function getOctokit() {
    return octokit;
}

/**
 * 檢查是否已認證
 */
export function isAuthenticated() {
    return octokit !== null;
}

/**
 * 顯示登入狀態
 */
function showLoginState() {
    loginSection.classList.remove('d-none');
    authenticatedSection.classList.add('d-none');
    loginBtn.classList.remove('d-none');
    document.getElementById('token-input-section').classList.add('d-none');
    tokenLoginBtn.disabled = false;
}

/**
 * 顯示已認證狀態
 */
function showAuthenticatedState() {
    loginSection.classList.add('d-none');
    authenticatedSection.classList.remove('d-none');
}
