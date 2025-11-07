/**
 * 導航欄管理模組
 * 處理導航欄使用者資訊的顯示與清除
 */

import { DOM_IDS } from '../core/index.js';

// DOM 元素
let navbarUserInfo, navbarUserAvatar, navbarUserName, navbarUserLogin, navbarLogoutBtn;

/**
 * 初始化導航欄
 */
export function initNavbar() {
    navbarUserInfo = document.getElementById(DOM_IDS.USER_INFO);
    navbarUserAvatar = document.getElementById(DOM_IDS.USER_AVATAR);
    navbarUserName = document.getElementById(DOM_IDS.USER_NAME);
    navbarUserLogin = document.getElementById(DOM_IDS.USER_LOGIN);
    navbarLogoutBtn = document.getElementById(DOM_IDS.NAVBAR_LOGOUT_BTN);
}

/**
 * 顯示使用者資訊
 * @param {Object} user - 使用者資訊物件
 * @param {string} user.avatar_url - 使用者頭像 URL
 * @param {string} user.name - 使用者名稱
 * @param {string} user.login - 使用者登入名稱
 */
export function displayUserInfo(user) {
    if (!user) return;

    if (navbarUserInfo) {
        navbarUserInfo.classList.remove('d-none');
    }

    if (navbarUserAvatar && user.avatar_url) {
        navbarUserAvatar.src = user.avatar_url;
        navbarUserAvatar.alt = user.login || 'User';
    }

    if (navbarUserName && user.name) {
        navbarUserName.textContent = user.name;
    }

    if (navbarUserLogin && user.login) {
        navbarUserLogin.textContent = `@${user.login}`;
    }
}

/**
 * 清除使用者資訊
 */
export function clearUserInfo() {
    if (navbarUserInfo) {
        navbarUserInfo.classList.add('d-none');
    }

    if (navbarUserAvatar) {
        navbarUserAvatar.src = '';
        navbarUserAvatar.alt = '';
    }

    if (navbarUserName) {
        navbarUserName.textContent = '';
    }

    if (navbarUserLogin) {
        navbarUserLogin.textContent = '';
    }
}

/**
 * 設定登出按鈕點擊事件
 * @param {Function} callback - 登出回調函數
 */
export function setLogoutHandler(callback) {
    if (navbarLogoutBtn && callback) {
        navbarLogoutBtn.addEventListener('click', callback);
    }
}

/**
 * 取得導航欄使用者資訊元素
 * @returns {HTMLElement} 使用者資訊元素
 */
export function getNavbarUserInfo() {
    return navbarUserInfo;
}
