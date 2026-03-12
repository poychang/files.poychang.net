import test from 'node:test';
import assert from 'node:assert/strict';

import {
    formatFileSize,
    getFileExtension,
    getFileType,
    sanitizeFolderName,
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
