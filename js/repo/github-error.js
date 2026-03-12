import { API_ERROR_CODES, ERROR_MESSAGES } from '../core/index.js';

const GITHUB_ERROR_NAMES = {
    TRANSLATED: 'GitHubOperationError',
};

export const GITHUB_ERROR_CODES = {
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    UNAUTHORIZED: 'GITHUB_UNAUTHORIZED',
    FORBIDDEN: 'GITHUB_FORBIDDEN',
    NOT_FOUND: 'GITHUB_NOT_FOUND',
    CONFLICT: 'GITHUB_CONFLICT',
    UNPROCESSABLE_ENTITY: 'GITHUB_UNPROCESSABLE_ENTITY',
    RATE_LIMITED: 'GITHUB_RATE_LIMITED',
    UNKNOWN: 'GITHUB_UNKNOWN',
};

export function createGitHubOperationError({
    code = GITHUB_ERROR_CODES.UNKNOWN,
    status = null,
    context = '執行 GitHub API 操作',
    userMessage = `${context}失敗`,
    debugMessage = userMessage,
    cause = null,
}) {
    const translatedError = new Error(userMessage);
    translatedError.name = GITHUB_ERROR_NAMES.TRANSLATED;
    translatedError.code = code;
    translatedError.status = status;
    translatedError.context = context;
    translatedError.userMessage = userMessage;
    translatedError.debugMessage = debugMessage;
    if (cause) {
        translatedError.cause = cause;
    }
    translatedError.message = userMessage;

    return translatedError;
}

export function isGitHubOperationError(error) {
    return error?.name === GITHUB_ERROR_NAMES.TRANSLATED;
}

export function isGitHubErrorStatus(error, status) {
    return error?.status === status;
}

export function getGitHubErrorDetails(error) {
    if (!error) {
        return null;
    }

    return {
        name: error.name,
        code: error.code,
        status: error.status ?? null,
        context: error.context ?? null,
        userMessage: error.userMessage ?? error.message,
        debugMessage: error.debugMessage ?? error.message,
    };
}

function getGitHubAcceptedPermissions(error) {
    return error?.response?.headers?.['x-accepted-github-permissions'] || '';
}

function getRateLimitResetAt(error) {
    const resetAt = error?.response?.headers?.['x-ratelimit-reset'];
    if (!resetAt) {
        return '';
    }

    const timestamp = Number(resetAt) * 1000;
    if (Number.isNaN(timestamp)) {
        return '';
    }

    const formatter = new Intl.DateTimeFormat('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Taipei',
    });

    return formatter.format(new Date(timestamp));
}

function isRateLimitError(error) {
    return error?.response?.headers?.['x-ratelimit-remaining'] === '0'
        || error?.message?.toLowerCase?.().includes('rate limit');
}

export function translateGitHubError(error, context = '執行 GitHub API 操作') {
    if (!error) {
        return createGitHubOperationError({
            context,
            userMessage: `${context}失敗`,
            debugMessage: `${context}失敗：未收到任何例外資訊。`,
        });
    }

    if (isGitHubOperationError(error)) {
        return error;
    }

    if (error instanceof Error && !('status' in error)) {
        return createGitHubOperationError({
            context,
            userMessage: error.message || `${context}失敗`,
            debugMessage: `${context}失敗：${error.message || '未知錯誤'}`,
            cause: error,
        });
    }

    const status = error?.status ?? null;
    const acceptedPermissions = getGitHubAcceptedPermissions(error);
    const requestId = error?.response?.headers?.['x-github-request-id'];
    const permissionHint = acceptedPermissions
        ? `GitHub 接受的權限提示：${acceptedPermissions}。`
        : '請確認 Token 已授權目標 repository，且至少具備 Contents: Read and write。';
    const rawMessage = error?.message || '未知錯誤';
    const debugPrefix = `${context}失敗`;

    if (status === API_ERROR_CODES.UNAUTHORIZED) {
        return createGitHubOperationError({
            code: GITHUB_ERROR_CODES.UNAUTHORIZED,
            status,
            context,
            userMessage: 'GitHub 驗證失敗，Token 可能無效、已過期，或尚未完成必要授權。',
            debugMessage: `${debugPrefix}：HTTP 401 Unauthorized。${rawMessage}`,
            cause: error,
        });
    }

    if (status === API_ERROR_CODES.FORBIDDEN && isRateLimitError(error)) {
        const resetAt = getRateLimitResetAt(error);
        const resetHint = resetAt ? `可於台北時間 ${resetAt} 後再試。` : '請稍後再試。';

        return createGitHubOperationError({
            code: GITHUB_ERROR_CODES.RATE_LIMITED,
            status,
            context,
            userMessage: `GitHub API 已達速率限制。${resetHint}`,
            debugMessage: `${debugPrefix}：HTTP 403 Rate Limit。${rawMessage}`,
            cause: error,
        });
    }

    if (status === API_ERROR_CODES.FORBIDDEN) {
        return createGitHubOperationError({
            code: GITHUB_ERROR_CODES.FORBIDDEN,
            status,
            context,
            userMessage: `${context}被 GitHub 拒絕。${permissionHint}`,
            debugMessage: `${debugPrefix}：HTTP 403 Forbidden。${rawMessage}`,
            cause: error,
        });
    }

    if (status === API_ERROR_CODES.NOT_FOUND) {
        return createGitHubOperationError({
            code: GITHUB_ERROR_CODES.NOT_FOUND,
            status,
            context,
            userMessage: `${context}失敗：找不到指定的 repository 或路徑，或目前 Token 無法讀取該資源。`,
            debugMessage: `${debugPrefix}：HTTP 404 Not Found。${rawMessage}`,
            cause: error,
        });
    }

    if (status === API_ERROR_CODES.CONFLICT) {
        return createGitHubOperationError({
            code: GITHUB_ERROR_CODES.CONFLICT,
            status,
            context,
            userMessage: `${context}失敗：GitHub 偵測到內容衝突，請重新整理後再試。`,
            debugMessage: `${debugPrefix}：HTTP 409 Conflict。${rawMessage}`,
            cause: error,
        });
    }

    if (status === API_ERROR_CODES.UNPROCESSABLE_ENTITY) {
        return createGitHubOperationError({
            code: GITHUB_ERROR_CODES.UNPROCESSABLE_ENTITY,
            status,
            context,
            userMessage: `${context}失敗：請求內容無效，請確認路徑、檔名與內容格式。`,
            debugMessage: `${debugPrefix}：HTTP 422 Unprocessable Entity。${rawMessage}`,
            cause: error,
        });
    }

    return createGitHubOperationError({
        code: GITHUB_ERROR_CODES.UNKNOWN,
        status,
        context,
        userMessage: `${context}失敗：${rawMessage}`,
        debugMessage: `${debugPrefix}：HTTP ${status ?? 'unknown'}。${rawMessage}${requestId ? ` Request ID: ${requestId}` : ''}`,
        cause: error,
    });
}

export function createAuthRequiredError(context = '驗證 GitHub 登入狀態') {
    return createGitHubOperationError({
        code: GITHUB_ERROR_CODES.AUTH_REQUIRED,
        status: null,
        context,
        userMessage: ERROR_MESSAGES.AUTH_REQUIRED,
        debugMessage: 'Octokit 尚未初始化，使用者尚未登入或登入狀態已失效。',
    });
}
