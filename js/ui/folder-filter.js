/**
 * 資料夾過濾功能模組
 * 處理分類列表的過濾與搜尋
 */

import { DOM_IDS } from '../core/index.js';

// DOM 元素
let filterInput, clearBtn, foldersList;

/**
 * 初始化分類過濾功能
 */
export function initFolderFilter() {
    filterInput = document.getElementById(DOM_IDS.FILTER_FOLDER_INPUT);
    clearBtn = document.getElementById(DOM_IDS.CLEAR_FILTER_BTN);
    foldersList = document.getElementById(DOM_IDS.FOLDERS_GRID);

    if (!filterInput || !foldersList) return;

    // 綁定輸入事件
    filterInput.addEventListener('input', filterFolders);

    // 綁定清除按鈕
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            filterInput.value = '';
            filterFolders();
            filterInput.focus();
        });
    }
}

/**
 * 過濾資料夾列表
 */
function filterFolders() {
    if (!filterInput || !foldersList) return;

    const keyword = filterInput.value.trim().toLowerCase();
    const items = foldersList.querySelectorAll('.folder-list-item');
    let hasVisible = false;

    // 過濾項目
    items.forEach(item => {
        const text = item.textContent.trim().toLowerCase();
        const match = keyword === '' || text.includes(keyword);
        item.style.display = match ? '' : 'none';
        if (match) hasVisible = true;
    });

    // 顯示或隱藏「無符合結果」訊息
    updateEmptyMessage(hasVisible);
}

/**
 * 更新空結果訊息
 * @param {boolean} hasVisible - 是否有可見項目
 */
function updateEmptyMessage(hasVisible) {
    if (!foldersList) return;

    let emptyMsg = foldersList.querySelector('.no-folder-match');

    if (!hasVisible) {
        // 沒有符合的項目，顯示訊息
        if (!emptyMsg) {
            emptyMsg = document.createElement('div');
            emptyMsg.className = 'text-center text-muted py-4 no-folder-match';
            emptyMsg.innerHTML = `
                <i class="bi bi-folder-x display-6"></i>
                <p class="mt-2">無符合的分類</p>
            `;
            foldersList.appendChild(emptyMsg);
        }
    } else {
        // 有符合的項目，移除訊息
        if (emptyMsg) {
            emptyMsg.remove();
        }
    }
}

/**
 * 清除過濾器
 */
export function clearFilter() {
    if (filterInput) {
        filterInput.value = '';
        filterFolders();
    }
}

/**
 * 取得當前過濾關鍵字
 * @returns {string} 過濾關鍵字
 */
export function getFilterKeyword() {
    return filterInput ? filterInput.value.trim().toLowerCase() : '';
}

/**
 * 設定過濾關鍵字
 * @param {string} keyword - 過濾關鍵字
 */
export function setFilterKeyword(keyword) {
    if (filterInput) {
        filterInput.value = keyword;
        filterFolders();
    }
}

/**
 * 重新套用過濾（當列表內容更新後使用）
 */
export function reapplyFilter() {
    filterFolders();
}
