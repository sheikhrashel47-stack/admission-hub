import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const index = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const sync = await readFile(new URL('./admission-sync.js', import.meta.url), 'utf8');
const sw = await readFile(new URL('./sw.js', import.meta.url), 'utf8');
const studyAi = await readFile(new URL('./study-ai-tool.js', import.meta.url), 'utf8');

assert.match(index, /read\('vocabulary'\)/, 'Vocabulary must be read from IndexedDB during cache loading.');
assert.match(index, /CACHE\.vocabulary=vocabulary/, 'Vocabulary must populate the UI cache.');
assert.match(index, /read\('examResults'\)/, 'Exam history must be read from IndexedDB.');
assert.match(index, /read\('ADMISSION_PLANS'\)/, 'Admission plans must be read from IndexedDB.');
assert.match(index, /read\('PLAN_DAYS'\)/, 'Plan days must be read from IndexedDB.');
assert.match(sync, /INITIAL_AUTHORITATIVE_STORES/, 'Initial reconciliation must define protected authoritative stores.');
assert.match(sync, /if \(!isStandalone\(\)\)/, 'Initial reconciliation must not replace standalone PWA data.');
assert.match(sync, /initialReconciliationVersion !== 3/, 'The new reconciliation version must be active.');
const buildId = sw.match(/const BUILD_ID = '([^']+)'/)?.[1];
assert.equal(buildId, 'v190-settings-sync-timeout-20260905', 'Service-worker cache must be invalidated for the patch.');
assert.match(index, new RegExp(`expectedSwVersion = '${buildId}'`), 'Index and service worker must use the same build id.');
assert.match(index, new RegExp(`sw\\.js\\?v=${buildId}`), 'Registration query must use the current build id.');
assert.equal((index.match(/id=\"cloudSyncPanel\"/g) || []).length, 1, 'Settings must contain one stable sync mount.');
assert.match(sync, /Private online backup \/ Sync/, 'Settings must expose the private backup section.');
assert.match(sync, /Could not read local backup status/, 'Manual Sync must surface local status failures.');
assert.match(sync, /Could not read recovery code/, 'Recovery code must surface local status failures.');
assert.match(studyAi, /studyAiAutoSync/, 'Study AI automatic sync must have a user control.');
assert.match(studyAi, /studyAiDataConsent/, 'Automatic AI upload must require explicit consent.');
assert.match(studyAi, /studyAiSharePrompted/, 'Choosing Later must not grant sync consent.');
console.log('sync content regression checks passed');

// This test only inspects source invariants. It never opens IndexedDB, calls
// Supabase, deletes user data, or writes to the live site.
