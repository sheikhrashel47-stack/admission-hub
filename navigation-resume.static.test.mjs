import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./navigation-tools-pronunciation.js', import.meta.url), 'utf8');
assert.match(source, /if \(tab === 'dashboard'\)/, 'Home must have an explicit navigation branch.');
assert.match(source, /return 'dashboard';/, 'Home must always resolve to the dashboard.');
assert.match(source, /delete resume\['dashboard-tool'\]/, 'Stale deep-tool resume state must be cleared when Home is selected.');
assert.doesNotMatch(source, /homeResume && homeResume\.path !== current/, 'Home must not restore a dashboard-tool deep route.');

console.log('navigation-resume.static.test: passed');
