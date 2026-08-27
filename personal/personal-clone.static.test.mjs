import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const index = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const mode = await readFile(new URL('./personal-clone-mode.js', import.meta.url), 'utf8');
const manifest = await readFile(new URL('./manifest.json', import.meta.url), 'utf8');
const sync = await readFile(new URL('./admission-sync.js', import.meta.url), 'utf8');

assert.match(index, /personal-clone-mode\.js\?v=personal-study-v1/);
assert.match(mode, /ADMISSION_HUB_PERSONAL_CLONE = true/);
assert.match(mode, /BLOCKED_ROUTES/);
assert.match(mode, /settings/);
assert.match(mode, /question-parser/);
assert.match(mode, /openConnectDialog/);
assert.match(mode, /never deletes or rewrites user data/i);
assert.match(index, /if \(!window\.ADMISSION_HUB_PERSONAL_CLONE\) purgeRemovedData\(\)/, 'Personal clone must skip destructive legacy cleanup.');
assert.match(index, /vocabulary-master-tool\.js/, 'Vocabulary Master feature must remain available.');
assert.match(manifest, /Admission Hub · Personal Study/);
assert.match(manifest, /My Study Hub/);
assert.match(sync, /2500/);
assert.match(sync, /INITIAL_AUTHORITATIVE_STORES/);
console.log('personal clone static checks passed');
