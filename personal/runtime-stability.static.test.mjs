import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const vocabulary = readFileSync(new URL('./vocabulary-master-tool.js', import.meta.url), 'utf8');
const resume = readFileSync(new URL('./nav-resume-fix.js', import.meta.url), 'utf8');
const phase23 = readFileSync(new URL('./phase23-ui.js', import.meta.url), 'utf8');

assert.match(vocabulary, /data-vm-practice-timer/, 'Vocabulary practice must expose a dedicated timer node.');
assert.match(vocabulary, /function updatePracticeTimer/, 'Vocabulary practice must update the timer in place.');
assert.match(vocabulary, /if \(!practiceRouteActive\(\) \|\| document\.visibilityState !== 'visible'\) return pausePracticeTimer\(session\);/, 'Vocabulary timer must pause off-route or while hidden.');
assert.doesNotMatch(vocabulary, /session\.remainingSeconds[\s\S]{0,500}if \(!session\.remainingSeconds\)[\s\S]{0,200}api\.render\(\);[\s\S]{0,100}api\.render\(\);/, 'A vocabulary timer tick must not render the full app repeatedly.');
assert.doesNotMatch(resume, /setInterval\(/, 'Resume safety net must not install a perpetual interval.');
assert.doesNotMatch(resume, /window\.scrollTo\(0, 0\)/, 'Resume safety net must not force-scroll the user.');
assert.match(phase23, /let lastAuditKey='';/, 'Mutation-driven question-bank audit must have a stable state key.');
assert.match(phase23, /if\(key===lastAuditKey\)return;/, 'Mutation-driven question-bank audit must be idempotent.');
console.log('runtime-stability.static.test: passed');
