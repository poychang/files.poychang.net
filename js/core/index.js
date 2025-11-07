/**
 * Core Layer - 核心層統一入口
 * 
 * 核心層負責：
 * - 應用程式配置管理
 * - 常量定義
 * - 事件匯流排
 * - 日誌記錄
 * 
 * @module core
 */

// ========== 配置模組 ==========
export { 
    CONFIG,
    getRepoInfo,
    getFileBasePath,
    getDefaultSubFolder,
    getGithubPagesBaseUrl,
    getConfig
} from './config.js';

// ========== 常量模組 ==========
export { 
    FILE_EXTENSIONS,
    FILE_ICON_MAP,
    FILE_SIZE_UNITS,
    FILE_SIZE_BASE,
    TOAST_TYPES,
    TOAST_AUTO_HIDE_DELAY,
    VIEW_TYPES,
    CUSTOM_EVENTS,
    DOM_IDS,
    STORAGE_KEYS,
    THEMES,
    API_ERROR_CODES,
    ERROR_MESSAGES
} from './constants.js';

// ========== 事件匯流排模組 ==========
export { 
    emit,
    on,
    once,
    off,
    emitAuthSuccess,
    emitAuthLogout,
    emitFilesSelected,
    emitFolderChanged,
    emitFolderCreated,
    emitFolderDeleted,
    emitFileUploaded,
    emitFileDeleted,
    emitFileListUpdated,
    emitFolderListUpdated
} from './event-bus.js';

// ========== 日誌模組 ==========
export { 
    LOG_LEVELS,
    setLogLevel,
    debug,
    info,
    warn,
    error,
    createLogger
} from './logger.js';

/**
 * 初始化核心層
 * @param {Object} options - 初始化選項
 * @param {string} options.logLevel - 日誌級別 ('debug', 'info', 'warn', 'error')
 */
export function initCore(options = {}) {
    // 設定日誌級別
    if (options.logLevel) {
        import('./logger.js').then(({ setLogLevel }) => {
            setLogLevel(options.logLevel);
        });
    }
    
    // 可在此處添加其他核心層初始化邏輯
}
