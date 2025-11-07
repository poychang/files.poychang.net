/**
 * Core - 日誌記錄模組
 * 提供統一的日誌記錄介面
 */

/**
 * 日誌級別
 */
export const LOG_LEVELS = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
};

/**
 * 當前日誌級別（開發環境可設為 DEBUG，生產環境設為 INFO）
 */
let currentLogLevel = LOG_LEVELS.INFO;

/**
 * 日誌級別優先順序
 */
const LOG_LEVEL_PRIORITY = {
    [LOG_LEVELS.DEBUG]: 0,
    [LOG_LEVELS.INFO]: 1,
    [LOG_LEVELS.WARN]: 2,
    [LOG_LEVELS.ERROR]: 3,
};

/**
 * 設定日誌級別
 */
export function setLogLevel(level) {
    if (LOG_LEVEL_PRIORITY.hasOwnProperty(level)) {
        currentLogLevel = level;
    }
}

/**
 * 檢查是否應該記錄該級別的日誌
 */
function shouldLog(level) {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[currentLogLevel];
}

/**
 * 格式化日誌訊息
 */
function formatMessage(level, module, message, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${module}]`;
    return [prefix, message, ...args];
}

/**
 * Debug 日誌
 */
export function debug(module, message, ...args) {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
        console.debug(...formatMessage(LOG_LEVELS.DEBUG, module, message, ...args));
    }
}

/**
 * Info 日誌
 */
export function info(module, message, ...args) {
    if (shouldLog(LOG_LEVELS.INFO)) {
        console.info(...formatMessage(LOG_LEVELS.INFO, module, message, ...args));
    }
}

/**
 * Warning 日誌
 */
export function warn(module, message, ...args) {
    if (shouldLog(LOG_LEVELS.WARN)) {
        console.warn(...formatMessage(LOG_LEVELS.WARN, module, message, ...args));
    }
}

/**
 * Error 日誌
 */
export function error(module, message, ...args) {
    if (shouldLog(LOG_LEVELS.ERROR)) {
        console.error(...formatMessage(LOG_LEVELS.ERROR, module, message, ...args));
    }
}

/**
 * 建立模組專屬的 Logger
 */
export function createLogger(moduleName) {
    return {
        debug: (message, ...args) => debug(moduleName, message, ...args),
        info: (message, ...args) => info(moduleName, message, ...args),
        warn: (message, ...args) => warn(moduleName, message, ...args),
        error: (message, ...args) => error(moduleName, message, ...args),
    };
}
