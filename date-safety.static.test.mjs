import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const externalGreeting = fs.readFileSync(new URL('./dashboard-greeting-fix.js', import.meta.url), 'utf8');
assert.match(source, /function todayKey\(d\)\{const value=d instanceof Date\?d:new Date\(d\|\|Date\.now\(\)\);/);
assert.match(source, /Number\.isNaN\(value\.getTime\(\)\)\?new Date\(\):value/);
assert.match(source, /function clockText\(input = new Date\(\)\)/, 'Inline dashboard clock must normalize its input');
assert.match(externalGreeting, /function clockText\(input = new Date\(\)\)/, 'External dashboard clock must normalize its input');

const todayKey = d => {
  const value = d instanceof Date ? d : new Date(d || Date.now());
  const safe = Number.isNaN(value.getTime()) ? new Date() : value;
  return safe.getFullYear() + '-' + String(safe.getMonth() + 1).padStart(2, '0') + '-' + String(safe.getDate()).padStart(2, '0');
};
assert.doesNotThrow(() => todayKey('2026-08-25'));
assert.doesNotThrow(() => todayKey(Date.now()));
assert.doesNotThrow(() => todayKey({ invalid: true }));
assert.match(todayKey('2026-08-25'), /^2026-\d{2}-\d{2}$/);
console.log('date-safety.static.test: passed');
