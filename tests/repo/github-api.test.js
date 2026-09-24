import test from 'node:test';
import assert from 'node:assert/strict';

import { pickOldestCommitDate } from '../../js/repo/commit-utils.js';

test('pickOldestCommitDate returns null for empty inputs', () => {
    assert.equal(pickOldestCommitDate([]), null);
    assert.equal(pickOldestCommitDate(null), null);
});

test('pickOldestCommitDate returns oldest committer date in a commit page', () => {
    const commits = [
        { commit: { committer: { date: '2026-09-24T12:00:00Z' } } },
        { commit: { committer: { date: '2026-09-22T12:00:00Z' } } },
    ];

    assert.equal(pickOldestCommitDate(commits), '2026-09-22T12:00:00Z');
});

test('pickOldestCommitDate falls back to author date when committer date is missing', () => {
    const commits = [
        { commit: { committer: { date: '2026-09-24T12:00:00Z' } } },
        { commit: { author: { date: '2026-09-20T05:00:00Z' } } },
    ];

    assert.equal(pickOldestCommitDate(commits), '2026-09-20T05:00:00Z');
});
