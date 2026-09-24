/**
 * 從 commit 陣列中取得最早的提交時間
 * @param {Array} commits - GitHub commits API 回傳資料
 * @description 優先使用 committer.date，若缺失則回退到 author.date，再比較最早時間
 * @returns {string|null} ISO 時間字串
 */
export function pickOldestCommitDate(commits) {
    if (!Array.isArray(commits) || commits.length === 0) {
        return null;
    }

    let oldestDate = null;
    let oldestTimestamp = Infinity;

    commits.forEach((item) => {
        const date = item?.commit?.committer?.date || item?.commit?.author?.date || null;
        if (!date) return;

        const timestamp = Date.parse(date);
        if (Number.isNaN(timestamp)) return;

        if (!oldestDate || timestamp < oldestTimestamp) {
            oldestDate = date;
            oldestTimestamp = timestamp;
        }
    });

    return oldestDate;
}
