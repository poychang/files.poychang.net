/**
 * 認證管理模組
 * 使用 Personal Access Token 進行認證（純前端方案）
 */

import { Octokit } from "https://esm.sh/@octokit/core";
import {
    CUSTOM_EVENTS,
    DOM_IDS,
    STORAGE_KEYS,
    TOKEN_STORAGE_MODES,
    ERROR_MESSAGES,
    emit,
    createLogger
} from './core/index.js';
import { translateGitHubError, getGitHubErrorDetails } from './repo/github-error.js';

const logger = createLogger('Auth');

let octokit = null;

// DOM 元素
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
        resetLoginForm();
        return;
    }

    try {
        octokit = new Octokit({ auth: token });
        const user = await getUserInfo();

        logger.info('Token validated successfully', { mode });
        resetLoginForm();

        if (onAuthSuccess) {
            onAuthSuccess(user, { auto: true, mode });
        }
    } catch (error) {
        logger.warn('Token invalid, clearing authentication', getGitHubErrorDetails(error) || { message: error.message });
        clearToken();
        octokit = null;
        resetLoginForm();
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
        resetLoginForm();

        if (onAuthSuccess) {
            onAuthSuccess(user, { auto: false, mode });
        }
    } catch (error) {
        const translatedError = translateGitHubError(error, '登入 GitHub');
        logger.error('Authentication failed', getGitHubErrorDetails(translatedError));
        clearToken();
        octokit = null;
        if (onAuthFail) {
            onAuthFail(`${ERROR_MESSAGES.INVALID_TOKEN}。${translatedError.userMessage}`);
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
    resetLoginForm();

    emit(CUSTOM_EVENTS.AUTH_LOGOUT);
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
 * 重置登入表單狀態
 */
function resetLoginForm() {
    loginBtn.classList.remove('d-none');
    document.getElementById(DOM_IDS.TOKEN_INPUT_SECTION).classList.add('d-none');
    tokenLoginBtn.disabled = false;
    restoreStoragePreferenceUi();
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
