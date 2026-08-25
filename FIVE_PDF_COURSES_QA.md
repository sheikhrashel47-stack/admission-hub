# Five PDF Grammar Courses — QA Report

## Scope

Five supplied PDF guides were added as built-in Admission Hub courses. The release uses a dedicated static data pack loaded before `course-tool.js`; existing course data and user progress stores were not rewritten.

## Imported courses

| Course | Lessons | Visual slides | Source MCQs |
|---|---:|---:|---:|
| Adjectives Visual Mastery | 12 | 60 | 60 |
| Determiners Visual Mastery | 12 | 60 | 100 |
| Narration Visual Mastery | 10 | 50 | 80 |
| Verb Visual Mastery | 13 | 65 | 80 |
| Finite vs Non-Finite Visual Mastery | 12 | 60 | 60 |
| **Total** | **59** | **295** | **380** |

## Content treatment

Each course follows the existing Admission Hub sequence: visual lesson, rule/formula, source-derived example, responsive rule matrix, right-versus-trap comparison, quick recall checklist, and a course-specific Question Bank. The real MCQ blocks and answer/explanation text were extracted from the supplied PDFs, normalized into the existing `{q, o, a, e}` schema, and tagged by source course and difficulty family.

## Runtime QA

The local browser Course Library showed 22 active courses, 245 visual lessons and 2,510 MCQ cards. All five new courses appeared in the library. Adjectives and Determiners overview routes opened successfully with the expected lesson maps and source MCQ counts. Rule-matrix slides rendered as responsive tables without mid-word breaking, and the existing lesson rail/back/next navigation remained available.

The standalone `test_pdf_grammar_courses.js` passed: five course registrations, unique IDs, 59 lessons, 295 slides, 380 MCQs, four unique options per MCQ and valid answer indices. Existing validators also passed: 17 original course IDs, 186 original lessons, 2,130 original MCQs; four-grammar and mass-pack checks; Vocabulary Card Flash contract; and `git diff --check`.

## Files

- `pdf-grammar-courses-data.js` — generated built-in course pack.
- `test_pdf_grammar_courses.js` — standalone integrity validator.
- `index.html` — loads the new pack before `course-tool.js` and bumps the course runtime cache-buster.

The source PDFs and temporary extraction/debug files were not committed into the web app repository.
