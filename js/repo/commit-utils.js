/**
 * 從 commit 陣列中取得最早的提交時間
 * @param {Array} commits - GitHub commits API 回傳資料
 * @returns {string|null} ISO 時間字串
 */
export function pickOldestCommitDate(commits) {
    if (!Array.isArray(commits) || commits.length === 0) {
        return null;
    }

    const oldestCommit = commits[commits.length - 1];
    return oldestCommit?.commit?.committer?.date || oldestCommit?.commit?.author?.date || null;
}

