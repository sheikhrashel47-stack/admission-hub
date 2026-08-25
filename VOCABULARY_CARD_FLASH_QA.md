# Vocabulary Master — Card Flash Test QA

## Scope

This release adds a small **⚡ Card Flash** action to every Vocabulary Master card. The action opens the independent hash route `vocabulary-master/flash/<record-id>` and creates a card-specific, in-memory 20-question MCQ session.

## Implemented behavior

| Area | Result |
|---|---|
| Card action | Each vocabulary card renders a top-right ⚡ button beside pronunciation. |
| Question generation | Meaning, reverse word-meaning, synonym, synonym Bengali meaning, antonym, acronym/abbreviation and acronym Bengali meaning templates are supported. Rotated revision templates fill the remaining questions only when valid distractors exist. |
| Uniqueness | Prompt + answer signatures are deduplicated; options are case-insensitively unique and contain exactly four choices. |
| Data quality guard | A session is not fabricated when the bank cannot supply four distinct valid options; the user receives a clear Bengali notice to add more valid vocabulary records. |
| Feedback | Existing Flash Test-style question card, green correct state, red wrong state, explanation and Next action are used. |
| Persistence | Card Flash methods do not call `dbPut`, `dbDel`, `localStorage`, `saveResult`, `createExamQuestions`, `beginExam` or the global exam engine. The result is memory-only and is discarded on exit/page leave. |
| Navigation | The originating vocabulary category is remembered so Back/Exit returns to that category. Retake creates a fresh temporary session. |
| Acronyms | Parser normalization, edit modal, preview count and card relation section support `Acronym`, `Abbreviation`, plural variants and Bengali `সংক্ষিপ্তরূপ`. |
| Pronunciation | Natural English voices are ranked ahead of compact/espeak/festival/robot voices; rate is `.88`, pitch `1.02`, volume `1`, and selected voice language is respected. Actual voice quality remains browser/device dependent. |

## Runtime QA in isolated local origin

A sandbox-only IndexedDB seed of five sample records was used on `127.0.0.1`; the user's GitHub Pages data was not touched.

- Category A rendered five cards, each with the ⚡ action.
- Clicking abandon's ⚡ opened `#vocabulary-master/flash/qa-abandon`.
- The page displayed `Question 1 of 20`, card context and `TEMPORARY · NOT SAVED`.
- A correct answer produced instant green feedback and explanation.
- All 20 questions were answered in a temporary session; the summary showed `20 Questions`.
- Exit from the summary returned to `#vocabulary-master/category/A`.
- Before and after the full session: `vocabularyMaster = 5`, `questions = 1046`, `examResults = 0`.
- No new card-flash/local-result localStorage key appeared.

## Automated checks

The following checks passed:

```text
node test_vocabulary_card_flash.js
node --check vocabulary-master-tool.js
node --check vocabulary-pronunciation.js
git diff --check
node test_all_course_integrity.js
node test_four_grammar_courses.js
node test_mass_grammar_courses.js
node --test runtime-stability.static.test.mjs navigation-resume.static.test.mjs
```

Course regression totals remained unchanged: **17 courses, 186 lessons, 2,130 MCQs**. The static contract test verifies the 20-question cap, rotated templates, option uniqueness, acronym coverage, originating-route return and persistence-free Flash API.

## Release note

Cache-busters were updated in `index.html` to load `vm-native-v18-card-flash-temp` and `pronunciation-native-v2-natural-voice`.
