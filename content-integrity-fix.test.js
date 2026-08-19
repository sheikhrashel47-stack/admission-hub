const assert = require('node:assert/strict');
function topicIdsFor(topics, rootId) {
  const ids = new Set([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const topic of topics) {
      if (topic.parentTopicId && ids.has(topic.parentTopicId) && !ids.has(topic.id)) {
        ids.add(topic.id);
        changed = true;
      }
    }
  }
  return ids;
}
const topics = [
  { id: 'root', subjectId: 's1' },
  { id: 'child', subjectId: 's1', parentTopicId: 'root' },
  { id: 'leaf', subjectId: 's1', parentTopicId: 'child' },
  { id: 'other', subjectId: 's1' },
];
assert.deepEqual([...topicIdsFor(topics, 'root')].sort(), ['child', 'leaf', 'root']);
assert.deepEqual([...topicIdsFor(topics, 'other')], ['other']);
const stores = {
  questions: [{ id: 'q1' }],
  topics,
  exams: [{ id: 'e1' }],
  examResults: [{ id: 'r1' }],
  subjects: [{ id: 's1' }],
  settings: [{ id: 'main' }],
  vocabulary: [{ id: 'v1' }],
};
for (const key of ['questions', 'topics', 'exams', 'examResults']) stores[key] = [];
assert.equal(stores.subjects.length, 1);
assert.equal(stores.settings.length, 1);
assert.equal(stores.vocabulary.length, 1);
console.log('content-integrity tests passed');
