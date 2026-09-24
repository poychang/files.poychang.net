const FOLDER_CREATED_AT_FALLBACK = '建立時間：--';
const FOLDER_CREATED_AT_LABEL = '建立時間：';

function buildDateTimeString(date) {
    const formatter = new Intl.DateTimeFormat('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Taipei',
    });
    const parts = formatter.formatToParts(date);
    const valueByType = Object.fromEntries(
        parts
            .filter((part) => part.type !== 'literal')
            .map((part) => [part.type, part.value])
    );

    return `${valueByType.year}/${valueByType.month}/${valueByType.day} ${valueByType.hour}:${valueByType.minute}`;
}

/**
 * 格式化資料夾建立時間（固定以台北時區顯示）
 * @param {string|Date|null|undefined} createdAt - 建立時間
 * @returns {string} 顯示字串
 */
export function formatFolderCreatedAt(createdAt) {
    if (!createdAt) {
        return FOLDER_CREATED_AT_FALLBACK;
    }

    const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
    if (Number.isNaN(date.getTime())) {
        return FOLDER_CREATED_AT_FALLBACK;
    }

    return `${FOLDER_CREATED_AT_LABEL}${buildDateTimeString(date)}`;
}
