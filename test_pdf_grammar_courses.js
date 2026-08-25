const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync(__dirname + '/pdf-grammar-courses-data.js', 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox, { filename: 'pdf-grammar-courses-data.js' });
const courses = sandbox.window.__admissionPdfGrammarCourses || [];
const expected = new Map([
  ['adjectives-visual-mastery', [12, 60, 60]],
  ['determiners-visual-mastery', [12, 60, 100]],
  ['narration-visual-mastery', [10, 50, 80]],
  ['verb-visual-mastery', [13, 65, 80]],
  ['finite-nonfinite-visual-mastery', [12, 60, 60]],
]);
if (courses.length !== expected.size) throw new Error(`Expected ${expected.size} courses, got ${courses.length}`);
const ids = new Set();
let lessons = 0, slides = 0, mcqs = 0;
for (const course of courses) {
  if (ids.has(course.id)) throw new Error(`Duplicate course id: ${course.id}`);
  ids.add(course.id);
  const wanted = expected.get(course.id);
  if (!wanted) throw new Error(`Unexpected course: ${course.id}`);
  const actual = [course.lessons?.length || 0, (course.lessons || []).reduce((n, lesson) => n + (lesson.slides?.length || 0), 0), course.mcqs?.length || 0];
  if (actual.some((value, index) => value !== wanted[index])) throw new Error(`${course.id}: expected ${wanted.join('/')} got ${actual.join('/')}`);
  for (const question of course.mcqs || []) {
    if (!question.q || !Array.isArray(question.o) || question.o.length !== 4 || new Set(question.o.map(String)).size !== 4 || !Number.isInteger(question.a) || question.a < 0 || question.a > 3 || !question.o[question.a]) {
      throw new Error(`Invalid MCQ: ${course.id}/${question.id}`);
    }
  }
  lessons += actual[0]; slides += actual[1]; mcqs += actual[2];
}
if ((sandbox.window.__admissionExtraCourses || []).length !== courses.length) throw new Error('Registration mismatch');
console.log(`PDF COURSES: ${courses.length} courses / ${lessons} lessons / ${slides} slides / ${mcqs} MCQs OK`);
