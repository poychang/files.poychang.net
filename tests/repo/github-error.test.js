import test from 'node:test';
import assert from 'node:assert/strict';

import {
    GITHUB_ERROR_CODES,
    createAuthRequiredError,
    getGitHubErrorDetails,
    isGitHubErrorStatus,
    isGitHubOperationError,
    translateGitHubError,
} from '../../js/repo/github-error.js';

test('createAuthRequiredError builds a translated auth error', () => {
    const error = createAuthRequiredError();

    assert.equal(error.name, 'GitHubOperationError');
    assert.equal(error.code, GITHUB_ERROR_CODES.AUTH_REQUIRED);
    assert.equal(error.userMessage, '請先登入 GitHub');
    assert.equal(isGitHubOperationError(error), true);
});

test('translateGitHubError passes through translated errors', () => {
    const translated = createAuthRequiredError();

    assert.equal(translateGitHubError(translated, 'ignored context'), translated);
});

test('translateGitHubError wraps plain runtime errors with context', () => {
    const rawError = new Error('boom');
    const translated = translateGitHubError(rawError, '上傳檔案');

    assert.equal(translated.userMessage, 'boom');
    assert.equal(translated.debugMessage, '上傳檔案失敗：boom');
    assert.equal(translated.cause, rawError);
});

test('translateGitHubError translates 403 rate limit responses', () => {
    const translated = translateGitHubError(
        {
            status: 403,
            message: 'API rate limit exceeded',
            response: {
                headers: {
                    'x-ratelimit-remaining': '0',
                    'x-ratelimit-reset': '1760000000',
                },
            },
        },
        '載入分類'
    );

    assert.equal(translated.code, GITHUB_ERROR_CODES.RATE_LIMITED);
    assert.match(translated.userMessage, /GitHub API 已達速率限制/);
    assert.match(translated.userMessage, /台北時間/);
});

test('translateGitHubError includes accepted permissions on forbidden responses', () => {
    const translated = translateGitHubError(
        {
            status: 403,
            message: 'Resource not accessible by personal access token',
            response: {
                headers: {
                    'x-accepted-github-permissions': 'contents=write',
                },
            },
        },
        '建立分類'
    );

    assert.equal(translated.code, GITHUB_ERROR_CODES.FORBIDDEN);
    assert.match(translated.userMessage, /contents=write/);
});

test('translateGitHubError maps standard GitHub API statuses', () => {
    const notFound = translateGitHubError({ status: 404, message: 'Not Found' }, '讀取檔案');
    const conflict = translateGitHubError({ status: 409, message: 'Conflict' }, '刪除檔案');
    const invalid = translateGitHubError({ status: 422, message: 'Validation Failed' }, '建立分類');
    const unknown = translateGitHubError(
        {
            status: 500,
            message: 'Server error',
            response: { headers: { 'x-github-request-id': 'REQ123' } },
        },
        '同步資料'
    );

    assert.equal(notFound.code, GITHUB_ERROR_CODES.NOT_FOUND);
    assert.equal(conflict.code, GITHUB_ERROR_CODES.CONFLICT);
    assert.equal(invalid.code, GITHUB_ERROR_CODES.UNPROCESSABLE_ENTITY);
    assert.equal(unknown.code, GITHUB_ERROR_CODES.UNKNOWN);
    assert.match(unknown.debugMessage, /REQ123/);
    assert.equal(isGitHubErrorStatus(notFound, 404), true);
});

test('getGitHubErrorDetails normalizes translated error fields', () => {
    const translated = translateGitHubError(
        { status: 401, message: 'Bad credentials' },
        '登入 GitHub'
    );
    const details = getGitHubErrorDetails(translated);

    assert.deepEqual(details, {
        name: 'GitHubOperationError',
        code: GITHUB_ERROR_CODES.UNAUTHORIZED,
        status: 401,
        context: '登入 GitHub',
        userMessage: 'GitHub 驗證失敗，Token 可能無效、已過期，或尚未完成必要授權。',
        debugMessage: '登入 GitHub失敗：HTTP 401 Unauthorized。Bad credentials',
    });
});
