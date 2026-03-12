/**
 * Core - 事件匯流排模組
 * 提供應用程式級別的事件發布/訂閱機制
 */

/**
 * 發布自訂事件
 * @param {string} eventName - 事件名稱
 * @param {*} detail - 事件詳細資料
 */
export function emit(eventName, detail = null) {
    const event = new CustomEvent(eventName, {
        detail,
        bubbles: true,
        cancelable: true
    });
    window.dispatchEvent(event);
}

/**
 * 訂閱自訂事件
 * @param {string} eventName - 事件名稱
 * @param {Function} handler - 事件處理函數
 * @returns {Function} 取消訂閱的函數
 */
export function on(eventName, handler) {
    window.addEventListener(eventName, handler);

    return () => {
        window.removeEventListener(eventName, handler);
    };
}
