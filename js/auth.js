/**
 * 認證管理模組
 * 使用 Personal Access Token 進行認證（純前端方案）
 */

import { Octokit } from "https://esm.sh/@octokit/core";
import {
    DOM_IDS,
    STORAGE_KEYS,
    TOKEN_STORAGE_MODES,
    ERROR_MESSAGES,
    emitAuthLogout,
    createLogger
} from './core/index.js';
import { translateGitHubError } from './repo/github-api.js';

const logger = createLogger('Auth');

let octokit = null;

// DOM 元素
let loginSection, authenticatedSection;
let loginBtn, tokenInput, tokenLoginBtn;
let tokenRememberCheckbox, tokenStorageHelp;
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
    tokenRememberCheckbox = document.getElementById(DOM_IDS.TOKEN_REMEMBER_CHECKBOX);
    tokenStorageHelp = document.getElementById(DOM_IDS.TOKEN_STORAGE_HELP);
    navbarLogoutBtn = document.getElementById(DOM_IDS.NAVBAR_LOGOUT_BTN);

    if (config.onAuthSuccess) onAuthSuccess = config.onAuthSuccess;
    if (config.onAuthFail) onAuthFail = config.onAuthFail;

    loginBtn.addEventListener('click', showTokenInput);
    tokenLoginBtn.addEventListener('click', loginWithToken);

    if (navbarLogoutBtn) {
        navbarLogoutBtn.addEventListener('click', logout);
    }

    tokenInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginWithToken();
        }
    });

    if (tokenRememberCheckbox) {
        tokenRememberCheckbox.addEventListener('change', () => {
            saveStorageModePreference(getSelectedStorageMode());
            updateStoragePreferenceHint();
        });
    }

    restoreStoragePreferenceUi();
    checkExistingAuth();

    logger.info('Auth module initialized');
}

/**
 * 檢查現有的認證狀態
 */
async function checkExistingAuth() {
    const { token, mode } = loadToken();
    if (!token) {
        showLoginState();
        return;
    }

    try {
        octokit = new Octokit({ auth: token });
        const user = await getUserInfo();

        logger.info('Token validated successfully', { mode });
        showAuthenticatedState();

        if (onAuthSuccess) {
            onAuthSuccess(user, { auto: true, mode });
        }
    } catch (error) {
        logger.warn('Token invalid, clearing authentication', { message: error.message });
        clearToken();
        octokit = null;
        showLoginState();
    }
}

/**
 * 顯示 Token 輸入框
 */
function showTokenInput() {
    const tokenSection = document.getElementById(DOM_IDS.TOKEN_INPUT_SECTION);
    tokenSection.classList.remove('d-none');
    loginBtn.classList.add('d-none');
    restoreStoragePreferenceUi();
    tokenInput.focus();
}

/**
 * 使用 Personal Access Token 登入
 */
async function loginWithToken() {
    const token = tokenInput.value.trim();
    const mode = getSelectedStorageMode();

    if (!token) {
        if (onAuthFail) {
            onAuthFail('請輸入 GitHub Personal Access Token');
        }
        return;
    }

    try {
        tokenLoginBtn.disabled = true;
        logger.info('Attempting to authenticate with token', { mode });

        octokit = new Octokit({ auth: token });
        const user = await getUserInfo();

        logger.info('Authentication successful', { user: user.login, mode });

        saveToken(token, mode);
        showAuthenticatedState();

        if (onAuthSuccess) {
            onAuthSuccess(user, { auto: false, mode });
        }
    } catch (error) {
        logger.error('Authentication failed', error);
        clearToken();
        octokit = null;
        if (onAuthFail) {
            const translatedError = translateGitHubError(error, '登入 GitHub');
            onAuthFail(`${ERROR_MESSAGES.INVALID_TOKEN}。${translatedError.message}`);
        }
    } finally {
        tokenLoginBtn.disabled = false;
    }
}

/**
 * 登出
 */
function logout() {
    logger.info('User logging out');
    clearToken();
    octokit = null;
    tokenInput.value = '';
    showLoginState();

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
        throw translateGitHubError(error, '取得 GitHub 使用者資訊');
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
    restoreStoragePreferenceUi();

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

    if (navbarLogoutBtn) {
        navbarLogoutBtn.classList.remove('d-none');
    }
}

function loadToken() {
    const sessionToken = sessionStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN);
    if (sessionToken) {
        return { token: sessionToken, mode: TOKEN_STORAGE_MODES.SESSION };
    }

    const localToken = localStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN);
    if (localToken) {
        if (!localStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN_STORAGE_MODE)) {
            localStorage.setItem(STORAGE_KEYS.GITHUB_TOKEN_STORAGE_MODE, TOKEN_STORAGE_MODES.LOCAL);
        }
        return { token: localToken, mode: TOKEN_STORAGE_MODES.LOCAL };
    }

    return {
        token: null,
        mode: loadPreferredStorageMode(),
    };
}

function saveToken(token, mode) {
    clearToken();
    getStorage(mode).setItem(STORAGE_KEYS.GITHUB_TOKEN, token);
    saveStorageModePreference(mode);
}

function clearToken() {
    sessionStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN_STORAGE_MODE);
    localStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN_STORAGE_MODE);
}

function getSelectedStorageMode() {
    return tokenRememberCheckbox?.checked
        ? TOKEN_STORAGE_MODES.LOCAL
        : TOKEN_STORAGE_MODES.SESSION;
}

function restoreStoragePreferenceUi() {
    if (!tokenRememberCheckbox) {
        return;
    }

    tokenRememberCheckbox.checked = loadPreferredStorageMode() === TOKEN_STORAGE_MODES.LOCAL;
    updateStoragePreferenceHint();
}

function updateStoragePreferenceHint() {
    if (!tokenStorageHelp) {
        return;
    }

    tokenStorageHelp.textContent = getSelectedStorageMode() === TOKEN_STORAGE_MODES.LOCAL
        ? '已選擇記住我：Token 會保存於 localStorage，重新開啟瀏覽器後仍可能自動登入。'
        : '預設僅在本次瀏覽器工作階段保存 Token；關閉分頁或瀏覽器後需重新登入。建議使用只授權單一 repository 的專用 Token。';
}

function loadPreferredStorageMode() {
    return sessionStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN_STORAGE_MODE)
        || localStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN_STORAGE_MODE)
        || TOKEN_STORAGE_MODES.SESSION;
}

function saveStorageModePreference(mode) {
    sessionStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN_STORAGE_MODE);
    localStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN_STORAGE_MODE);
    getStorage(mode).setItem(STORAGE_KEYS.GITHUB_TOKEN_STORAGE_MODE, mode);
}

function getStorage(mode) {
    return mode === TOKEN_STORAGE_MODES.LOCAL ? localStorage : sessionStorage;
}
