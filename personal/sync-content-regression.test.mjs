import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const index = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const sync = await readFile(new URL('./admission-sync.js', import.meta.url), 'utf8');
const sw = await readFile(new URL('./sw.js', import.meta.url), 'utf8');

assert.match(index, /read\('vocabulary'\)/, 'Vocabulary must be read from IndexedDB during cache loading.');
assert.match(index, /CACHE\.vocabulary=vocabulary/, 'Vocabulary must populate the UI cache.');
assert.match(index, /read\('examResults'\)/, 'Exam history must be read from IndexedDB.');
assert.match(index, /read\('ADMISSION_PLANS'\)/, 'Admission plans must be read from IndexedDB.');
assert.match(index, /read\('PLAN_DAYS'\)/, 'Plan days must be read from IndexedDB.');
assert.match(sync, /INITIAL_AUTHORITATIVE_STORES/, 'Initial reconciliation must define protected authoritative stores.');
assert.match(sync, /if \(!isStandalone\(\)\)/, 'Initial reconciliation must not replace standalone PWA data.');
assert.match(sync, /initialReconciliationVersion !== 3/, 'The new reconciliation version must be active.');
assert.match(sw, /v2-personal-study-clone-20260827/, 'Service-worker cache must be invalidated for the patch.');
console.log('sync content regression checks passed');

// This test only inspects source invariants. It never opens IndexedDB, calls
// Supabase, deletes user data, or writes to the live site.
