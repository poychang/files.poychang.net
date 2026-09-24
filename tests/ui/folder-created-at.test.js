import test from 'node:test';
import assert from 'node:assert/strict';

import { formatFolderCreatedAt } from '../../js/ui/folder-created-at.js';

test('formatFolderCreatedAt formats ISO time in Asia/Taipei timezone', () => {
    const text = formatFolderCreatedAt('2026-09-24T12:34:56.000Z');

    assert.equal(text, '建立時間：2026/09/24 20:34');
});

test('formatFolderCreatedAt degrades gracefully when value is missing', () => {
    assert.equal(formatFolderCreatedAt(null), '建立時間：--');
});

test('formatFolderCreatedAt supports Date inputs', () => {
    const text = formatFolderCreatedAt(new Date('2026-09-24T12:34:56.000Z'));

    assert.equal(text, '建立時間：2026/09/24 20:34');
});

test('formatFolderCreatedAt degrades gracefully when parsing fails', () => {
    assert.equal(formatFolderCreatedAt('not-a-date'), '建立時間：--');
});
