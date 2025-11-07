import { Octokit } from "https://esm.sh/@octokit/core";
import { 
    DOM_IDS, 
    STORAGE_KEYS, 
    ERROR_MESSAGES,
    CUSTOM_EVENTS,
    emitAuthLogout,
    createLogger 
} from './core/index.js';

/**
 * 認證管理模組
 * 使用 Personal Access Token 進行認證（純前端方案）
 */

const logger = createLogger('Auth');

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
    loginSection = document.getElementById(DOM_IDS.LOGIN_SECTION);
    authenticatedSection = document.getElementById(DOM_IDS.AUTHENTICATED_SECTION);
    loginBtn = document.getElementById(DOM_IDS.LOGIN_BTN);
    tokenInput = document.getElementById(DOM_IDS.TOKEN_INPUT);
    tokenLoginBtn = document.getElementById(DOM_IDS.TOKEN_LOGIN_BTN);
    navbarLogoutBtn = document.getElementById(DOM_IDS.NAVBAR_LOGOUT_BTN);

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
    
    logger.info('Auth module initialized');
}

/**
 * 檢查現有的認證狀態
 */
async function checkExistingAuth() {
    const token = localStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN);
    if (token) {
        try {
            octokit = new Octokit({ auth: token });
            
            // 驗證 token 是否有效
            await octokit.request('GET /user');
            
            logger.info('Token validated successfully');
            
            // Token 有效，顯示已登入狀態
            showAuthenticatedState();
            
            if (onAuthSuccess) {
                const user = await getUserInfo();
                onAuthSuccess(user, { auto: true });
            }
        } catch (error) {
            // Token 無效，清除並顯示登入按鈕
            logger.warn('Token invalid, clearing authentication');
            localStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN);
            octokit = null;
            showLoginState();
        }
    }
}

/**
 * 顯示 Token 輸入框
 */
function showTokenInput() {
    const tokenSection = document.getElementById(DOM_IDS.TOKEN_INPUT_SECTION);
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
        logger.info('Attempting to authenticate with token');
        
        // 初始化 Octokit
        octokit = new Octokit({ auth: token });
        
        // 驗證 token 是否有效
        const user = await getUserInfo();
        
        logger.info('Authentication successful', { user: user.login });
        
        // Token 有效，儲存並顯示已登入狀態
        localStorage.setItem(STORAGE_KEYS.GITHUB_TOKEN, token);
        showAuthenticatedState();
        
        if (onAuthSuccess) {
            onAuthSuccess(user, { auto: false });
        }
        
    } catch (error) {
        logger.error('Authentication failed', error);
        octokit = null;
        if (onAuthFail) {
            onAuthFail(`${ERROR_MESSAGES.INVALID_TOKEN}。請確認 Token 是否正確。`);
        }
        tokenLoginBtn.disabled = false;
    }
}

/**
 * 登出
 */
function logout() {
    logger.info('User logging out');
    localStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN);
    octokit = null;
    tokenInput.value = '';
    showLoginState();
    
    // 觸發登出事件 (使用 Core 層事件系統)
    emitAuthLogout();
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
    document.getElementById(DOM_IDS.TOKEN_INPUT_SECTION).classList.add('d-none');
    tokenLoginBtn.disabled = false;
    
    // 隱藏導航列登出按鈕
    if (navbarLogoutBtn) {
        navbarLogoutBtn.classList.add('d-none');
    }
}

/**
 * 顯示已認證狀態
 */
function showAuthenticatedState() {
    loginSection.classList.add('d-none');
    authenticatedSection.classList.remove('d-none');
    
    // 顯示導航列登出按鈕
    if (navbarLogoutBtn) {
        navbarLogoutBtn.classList.remove('d-none');
    }
}
