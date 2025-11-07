/**
 * 主題管理模組
 * 處理深色/淺色主題切換
 */

import { DOM_IDS, STORAGE_KEYS, THEMES } from '../core/index.js';

let themeToggleBtn, themeIcon;

/**
 * 初始化主題切換功能
 */
export function initTheme() {
    themeToggleBtn = document.getElementById(DOM_IDS.THEME_TOGGLE_BTN);
    themeIcon = document.getElementById(DOM_IDS.THEME_ICON);

    // 從 localStorage 讀取主題設定
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || THEMES.DARK;
    setTheme(savedTheme);

    // 綁定主題切換按鈕
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
}

/**
 * 切換主題
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    setTheme(newTheme);
}

/**
 * 設定主題
 * @param {string} theme - 'dark' 或 'light'
 */
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);

    // 更新圖示
    if (themeIcon) {
        if (theme === THEMES.DARK) {
            themeIcon.className = 'bi bi-moon-fill';
        } else {
            themeIcon.className = 'bi bi-sun-fill';
        }
    }
}

/**
 * 取得當前主題
 * @returns {string} 'dark' 或 'light'
 */
export function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || THEMES.DARK;
}
