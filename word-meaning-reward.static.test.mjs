import assert from 'node:assert/strict';
import fs from 'node:fs';

const matchSource = fs.readFileSync(new URL('./memorizing-match-tool.js', import.meta.url), 'utf8');
const rewardSource = fs.readFileSync(new URL('./reward-engine.js', import.meta.url), 'utf8');
const indexSource = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

assert.match(matchSource, /typeId === 'word-meaning'/, 'Word Meaning must have a dedicated parser path');
assert.match(matchSource, /const structural=\/\^\(শব্দার্থ/, 'Structural Bengali section labels must be recognized');
assert.match(matchSource, /const vocabularyQuote=quotes\.find\(value => !structural\.test\(value\)\)/, 'The actual vocabulary quote must be selected instead of the section label');
assert.match(matchSource, /if \(vocabularyQuote\) return vocabularyQuote;/, 'The selected vocabulary term must be used as the left card');

const quotedTerms = value => [...String(value).matchAll(/[“"'‘]([^”"'’]{2,96})[”"'’]/g)].map(match => match[1]);
const prompt = "'শব্দার্থ ও টীকা' বিভাগে 'মিসক্রিয়ান্ট' শব্দটির কী ব্যাখ্যা দেওয়া আছে?";
const structural = /^(শব্দার্থ(?:\s+ও\s+টীকা)?|শব্দার্থ\s+তালিকা|শব্দতালিকা|টীকা|শব্দার্থ\s+সারণী|শব্দার্থ\s+ও\s+টীকা\s+বিভাগ)$/i;
assert.equal(quotedTerms(prompt).find(value => !structural.test(value)), 'মিসক্রিয়ান্ট', 'Word Meaning must not create a section-label pair');

assert.match(rewardSource, /location\.hash\.replace\(\/\^#\\\/?\//, 'Reward dashboard injection must work when Router.path is unavailable');
assert.match(rewardSource, /function queueDashboardCard\(\)/, 'Reward dashboard entry must retry after late dashboard rendering');
assert.match(rewardSource, /new MutationObserver\(\(\) => \{/, 'Late dashboard renders must be observed without a perpetual timer');
assert.match(indexSource, /reward-engine\.js\?v=reward-engine-v7-dashboard-entry-final/, 'The fixed Reward Engine bundle must be cache-busted');

console.log('word-meaning-reward.static.test: passed');
