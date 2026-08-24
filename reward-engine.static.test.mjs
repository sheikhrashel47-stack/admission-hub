import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./reward-engine.js', import.meta.url), 'utf8');
const definitions = [...source.matchAll(/make\((\d+),\s*'([^']+)'/g)].map(([, number, title]) => ({ number:Number(number), title }));

assert.equal(definitions.length, 50, 'Reward engine must expose exactly 50 static reward definitions.');
assert.deepEqual(definitions.map(row => row.number), Array.from({ length:50 }, (_, index) => index + 1), 'Reward numbers must be deterministic and sequential from 1 to 50.');
assert.equal(new Set(definitions.map(row => row.title)).size, 50, 'Reward titles must be unique.');
assert.match(source, /rewardEngineV2/, 'Reward state must use the current versioned rewardEngineV2 key.');
assert.match(source, /LEGACY_KEY = 'rewardEngineV1'/, 'Reward state must retain a legacy key for one-time migration.');
assert.match(source, /delete retired\.xpBalance/, 'Legacy multi-currency state must be retired during migration.');
assert.match(source, /processedEvents/, 'Reward events must be persisted for idempotency.');
assert.match(source, /recordQuestionAttempt/, 'Real question activity must reach the RewardEngine.');
assert.match(source, /recordTestCompleted/, 'Real test completion must reach the RewardEngine.');
assert.match(source, /recordDailyProgress/, 'Daily-goal completion must reach the RewardEngine.');
assert.match(source, /render:renderRewards/, 'Reward Center must be publicly renderable.');

console.log('reward-engine.static.test: passed');
