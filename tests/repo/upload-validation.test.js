import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildUploadPreflightSummary,
    buildUploadSelectionFeedback,
    getSupportedUploadExtensions,
    UPLOAD_VALIDATION_CODES,
    validateUploadSelection,
} from '../../js/repo/upload-validation.js';

function createFile(name, size) {
    return { name, size };
}

test('validateUploadSelection accepts valid files and keeps warnings empty', () => {
    const files = [
        createFile('photo.png', 1024),
        createFile('notes.md', 512),
    ];

    const result = validateUploadSelection(files);

    assert.equal(result.hasBlockingIssues, false);
    assert.deepEqual(result.validFiles, files);
    assert.deepEqual(result.blockedFiles, []);
    assert.deepEqual(result.blockingIssues, []);
    assert.equal(result.skippedFileCount, 0);
});

test('validateUploadSelection blocks duplicate, unsupported, invalid, empty, and oversized files', () => {
    const files = [
        createFile('cover.png', 1),
        createFile('cover.png', 2),
        createFile('bad/name.png', 50),
        createFile('empty.txt', 0),
        createFile('huge.mp4', 100 * 1024 * 1024 + 1),
        createFile('script.exe', 10),
    ];

    const result = validateUploadSelection(files);
    const codes = result.blockingIssues.map((issue) => issue.code);

    assert.equal(result.validFiles.length, 0);
    assert.equal(result.blockedFiles.length, files.length);
    assert.equal(result.hasBlockingIssues, true);
    assert.ok(codes.includes(UPLOAD_VALIDATION_CODES.DUPLICATE_FILENAME));
    assert.ok(codes.includes(UPLOAD_VALIDATION_CODES.INVALID_FILENAME));
    assert.ok(codes.includes(UPLOAD_VALIDATION_CODES.EMPTY_FILE));
    assert.ok(codes.includes(UPLOAD_VALIDATION_CODES.FILE_TOO_LARGE));
    assert.ok(codes.includes(UPLOAD_VALIDATION_CODES.UNSUPPORTED_EXTENSION));
});

test('validateUploadSelection blocks batches that exceed the max file count', () => {
    const files = Array.from({ length: 51 }, (_, index) => createFile(`file-${index}.txt`, 1));

    const result = validateUploadSelection(files);

    assert.equal(result.validFiles.length, 0);
    assert.equal(result.blockedFiles.length, 51);
    assert.equal(result.blockingIssues.length, 1);
    assert.equal(result.blockingIssues[0].code, UPLOAD_VALIDATION_CODES.TOO_MANY_FILES);
});

test('buildUploadPreflightSummary merges overwrite warnings into the selection result', () => {
    const selectionResult = validateUploadSelection([
        createFile('photo.png', 10),
        createFile('notes.md', 20),
    ]);

    const summary = buildUploadPreflightSummary(selectionResult, ['photo.png']);

    assert.equal(summary.hasBlockingIssues, false);
    assert.equal(summary.hasWarnings, true);
    assert.equal(summary.warningIssues.length, 1);
    assert.equal(summary.warningIssues[0].code, UPLOAD_VALIDATION_CODES.OVERWRITE_WARNING);
    assert.equal(summary.warningIssues[0].fileName, 'photo.png');
});

test('buildUploadSelectionFeedback reflects blocking outcomes', () => {
    const allBlocked = validateUploadSelection([
        createFile('virus.exe', 10),
    ]);
    const partial = validateUploadSelection([
        createFile('notes.md', 20),
        createFile('virus.exe', 10),
    ]);

    assert.match(buildUploadSelectionFeedback(allBlocked), /未送出任何上傳請求/);
    assert.match(buildUploadSelectionFeedback(partial), /其餘 1 個檔案可繼續上傳/);
    assert.equal(buildUploadSelectionFeedback(validateUploadSelection([createFile('ok.txt', 10)])), null);
});

test('getSupportedUploadExtensions returns a sorted extension whitelist', () => {
    const extensions = getSupportedUploadExtensions();

    assert.deepEqual([...extensions].sort(), extensions);
    assert.ok(extensions.includes('png'));
    assert.ok(extensions.includes('md'));
});
