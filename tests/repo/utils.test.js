import test from 'node:test';
import assert from 'node:assert/strict';

import {
    formatFileSize,
    getFileExtension,
    getFileType,
    sanitizeFolderName,
    validateRenameFilename,
} from '../../js/repo/utils.js';

test('sanitizeFolderName trims whitespace and replaces unsupported characters', () => {
    assert.equal(sanitizeFolderName('  Team Files 2026/03  '), 'Team-Files-2026-03');
});

test('getFileType resolves known file categories case-insensitively', () => {
    assert.equal(getFileType('photo.JPG'), 'image');
    assert.equal(getFileType('archive.7Z'), 'archive');
    assert.equal(getFileType('README.unknownext'), 'file');
});

test('getFileExtension normalizes the extension to lowercase', () => {
    assert.equal(getFileExtension('Report.PDF'), 'pdf');
});

test('formatFileSize returns human-readable values', () => {
    assert.equal(formatFileSize(0), '0 Bytes');
    assert.equal(formatFileSize(1024), '1 KB');
    assert.equal(formatFileSize(1536), '1.5 KB');
    assert.equal(formatFileSize(5 * 1024 * 1024), '5 MB');
});


test('validateRenameFilename returns the trimmed new name for a valid rename', () => {
    assert.equal(validateRenameFilename('  notes-v2.md  ', 'notes.md'), 'notes-v2.md');
});

test('validateRenameFilename allows changing the supported extension', () => {
    assert.equal(validateRenameFilename('photo.png', 'photo.jpg'), 'photo.png');
});

test('validateRenameFilename rejects an empty value', () => {
    assert.throws(() => validateRenameFilename('   ', 'notes.md'), /請輸入新的檔案名稱/);
});

test('validateRenameFilename rejects a name identical to the original', () => {
    assert.throws(() => validateRenameFilename('notes.md', 'notes.md'), /新檔名與原檔名相同/);
});

test('validateRenameFilename rejects path separators and reserved names', () => {
    assert.throws(() => validateRenameFilename('sub/notes.md', 'notes.md'), /路徑分隔符號/);
    assert.throws(() => validateRenameFilename('..', 'notes.md'), /路徑分隔符號/);
});

test('validateRenameFilename rejects illegal characters', () => {
    assert.throws(() => validateRenameFilename('bad:name.md', 'notes.md'), /檔名格式不合法/);
});

test('validateRenameFilename requires a file extension', () => {
    assert.throws(() => validateRenameFilename('README', 'notes.md'), /必須包含副檔名/);
});

test('validateRenameFilename rejects unsupported extensions', () => {
    assert.throws(() => validateRenameFilename('archive.bin', 'notes.md'), /不在允許清單內/);
});
