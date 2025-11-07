/**
 * Core - 應用程式常量定義
 * 集中管理應用程式中使用的所有常量
 */

/**
 * 檔案副檔名分類
 */
export const FILE_EXTENSIONS = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'],
    video: ['mp4', 'webm', 'ogg', 'mov', 'avi'],
    audio: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
    document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md'],
    code: ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'yml', 'yaml'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz'],
};

/**
 * 檔案類型圖示對應
 */
export const FILE_ICON_MAP = {
    image: 'bi-file-image',
    video: 'bi-file-play',
    audio: 'bi-file-music',
    document: 'bi-file-text',
    code: 'bi-file-code',
    archive: 'bi-file-zip',
    file: 'bi-file-earmark',
};

/**
 * 檔案大小單位
 */
export const FILE_SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

/**
 * 檔案大小計算基數（1024）
 */
export const FILE_SIZE_BASE = 1024;

/**
 * Toast 訊息類型
 */
export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'danger',
    INFO: 'info',
    WARNING: 'warning',
};

/**
 * Toast 自動隱藏延遲時間（毫秒）
 */
export const TOAST_AUTO_HIDE_DELAY = 3000;

/**
 * 視圖類型
 */
export const VIEW_TYPES = {
    FOLDER_MANAGEMENT: 'folder-management',
    FILE_MANAGEMENT: 'file-management',
};

/**
 * 自訂事件名稱
 */
export const CUSTOM_EVENTS = {
    AUTH_SUCCESS: 'auth:success',
    AUTH_LOGOUT: 'auth:logout',
    FILES_SELECTED: 'files:selected',
    FOLDER_CHANGED: 'folder:changed',
    FOLDER_CREATED: 'folder:created',
    FOLDER_DELETED: 'folder:deleted',
    FILE_UPLOADED: 'file:uploaded',
    FILE_DELETED: 'file:deleted',
    FILE_LIST_UPDATED: 'file-list:updated',
    FOLDER_LIST_UPDATED: 'folder-list:updated',
};

/**
 * DOM 元素 ID
 */
export const DOM_IDS = {
    // 認證相關
    LOGIN_SECTION: 'login-section',
    AUTHENTICATED_SECTION: 'authenticated-section',
    TOKEN_INPUT_SECTION: 'token-input-section',
    LOGIN_BTN: 'login-btn',
    TOKEN_INPUT: 'token-input',
    TOKEN_LOGIN_BTN: 'token-login-btn',
    
    // 使用者資訊（導航列）
    USER_INFO: 'navbar-user-info',
    USER_AVATAR: 'navbar-user-avatar',
    USER_NAME: 'navbar-user-name',
    USER_LOGIN: 'navbar-user-login',
    
    // 導航列
    NAVBAR_LOGOUT_BTN: 'navbar-logout-btn',
    THEME_TOGGLE_BTN: 'theme-toggle-btn',
    THEME_ICON: 'theme-icon',
    
    // 視圖
    FOLDER_MANAGEMENT_VIEW: 'folder-management-view',
    FILE_MANAGEMENT_VIEW: 'file-management-view',
    PAGE_HEADER: 'page-header',
    
    // 分類管理
    FOLDERS_GRID: 'folders-list',
    CREATE_FOLDER_BTN: 'create-folder-btn',
    NEW_FOLDER_INPUT: 'new-folder-input',
    REFRESH_FOLDERS_BTN: 'refresh-folders-btn',
    FILTER_FOLDER_INPUT: 'filter-folder-input',
    CLEAR_FILTER_BTN: 'clear-filter-folder-btn',
    
    // 檔案管理
    FILE_LIST: 'file-list',
    FILE_COUNT_BADGE: 'file-count-badge',
    REFRESH_FILES_BTN: 'refresh-files-btn',
    UPLOAD_AREA: 'drop-zone',
    FILE_INPUT: 'file-input',
    SELECT_FILES_BTN: 'select-files-btn',
    BACK_TO_FOLDERS_BTN: 'back-to-folders-btn',
    CURRENT_FOLDER_NAME: 'current-folder-name',
    CURRENT_FOLDER_NAME_HEADER: 'current-folder-name-header',
    
    // Toast
    TOAST_CONTAINER: 'toast-container',
    TOAST_ELEMENT: 'message-toast',
    TOAST_ICON: 'toast-icon',
    TOAST_MESSAGE: 'toast-message',
    
    // Loading
    LOADING_OVERLAY: 'loading-overlay',
    
    // Modal - 上傳確認
    UPLOAD_CONFIRM_MODAL: 'uploadConfirmModal',
    UPLOAD_FILE_COUNT: 'upload-file-count',
    UPLOAD_TARGET_PATH: 'upload-target-path',
    CONFIRM_UPLOAD_BTN: 'confirm-upload-btn',
    
    // Modal - 刪除分類
    DELETE_FOLDER_MODAL: 'deleteFolderModal',
    FOLDER_TO_DELETE_NAME: 'folder-to-delete-name',
    CONFIRM_DELETE_FOLDER_BTN: 'confirm-delete-folder-btn',
    
    // Progress
    UPLOAD_PROGRESS: 'upload-progress',
    UPLOAD_PROGRESS_BAR: 'progress-bar',
    UPLOAD_STATUS: 'upload-status',
};

/**
 * Local Storage 鍵名
 */
export const STORAGE_KEYS = {
    GITHUB_TOKEN: 'github_token',
    THEME: 'github-file-hosting-theme',
};

/**
 * 主題類型
 */
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
};

/**
 * API 錯誤碼
 */
export const API_ERROR_CODES = {
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
};

/**
 * 錯誤訊息
 */
export const ERROR_MESSAGES = {
    AUTH_REQUIRED: '請先登入 GitHub',
    INVALID_TOKEN: 'Token 無效或已過期',
    FILE_NOT_SELECTED: '請選擇檔案',
    FOLDER_NAME_REQUIRED: '請輸入分類名稱',
    FOLDER_ALREADY_EXISTS: '分類已存在',
    FOLDER_NOT_FOUND: '分類不存在',
    FILE_NOT_FOUND: '檔案不存在',
    UPLOAD_FAILED: '上傳失敗',
    DELETE_FAILED: '刪除失敗',
    NETWORK_ERROR: '網路錯誤，請檢查連線',
};
