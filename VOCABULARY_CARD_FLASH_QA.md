# Admission Hub — Vocabulary Card and Course Layout QA

## Release scope

This release keeps the temporary Card Flash Test behavior and adds a responsive course text-layout correction, a premium Vocabulary card presentation, a compact overflow action menu, offline memory thumbnails, and a copy-ready AI image prompt generated from the complete vocabulary record.

## Functional acceptance

| Area | Verified behavior |
|---|---|
| Course text layout | The previous global `overflow-wrap: anywhere` behavior was removed for course content. Words now break only at normal word boundaries. Standard course tables remain three-column tables and use horizontal scrolling on narrow screens rather than squeezing or splitting words. |
| Visual cards in courses | Parts of Speech, Noun, Voice, Grammar and related visual grids use safer minimum column widths so labels such as `Noun`, `Pronoun`, `Adjective` and `Conjunction` remain readable. |
| Vocabulary header | The card header keeps the pronunciation control and one compact `•••` control. Flash, image prompt and image management actions are no longer shown as multiple permanent icons. |
| Memory thumbnail | Each card has a 16:9 YouTube-thumbnail-sized image area. A missing image shows a neutral memory-image slot; an uploaded image is cropped to 1280×720, compressed as JPEG and rendered from a local data URL. |
| Offline behavior | The explicit image upload action stores the compressed data URL inside the vocabulary record in IndexedDB. The card does not depend on a remote image URL or network loading after upload. |
| AI image prompt | The menu creates one prompt containing the word, Bengali meaning, synonyms, acronym/abbreviation, tips and a precise 16:9 visual direction. The prompt is copied with one click using Clipboard API with a fallback copy path. |
| Card Flash | The existing card-specific temporary test still creates exactly 20 distinct MCQs with four unique options, instant feedback and no history saving. |
| Persistence boundary | Image upload/remove is an explicit vocabulary-card edit and is intentionally saved. Flash answers and results remain memory-only and do not write to Question Bank, exam history, progress, `examResults`, localStorage or IndexedDB. |

## Isolated browser QA

A five-record sample bank was used only on the local `127.0.0.1` origin. The production GitHub Pages IndexedDB was not touched. The Parts of Speech table slide loaded in a mobile viewport and showed intact labels and readable three-column rows. Vocabulary category A rendered five cards with the new image slot and only the sound plus `•••` header controls. The overflow menu exposed Temporary Flash Test, Copy AI image prompt and Add memory image. A synthetic 16:9 image was uploaded to `qa-abandon`; it was converted to an offline JPEG data URL, saved by the explicit upload action and rendered immediately. The menu then changed to Replace memory image and Remove image.

The Flash route rendered `Question 1 of 20`, the card context, four options, Exit and the explicit `TEMPORARY · NOT SAVED` notice. A direct route transition confirmed that the temporary engine remained available after the UI changes. A Clipboard API mock confirmed that the generated prompt contained the word `abandon`, Bengali meaning `পরিত্যাগ করা`, synonym information, context information and the 16:9 image instruction.

## Automated validation

| Check | Result |
|---|---|
| `node --check course-tool.js` | PASS |
| `node --check vocabulary-master-tool.js` | PASS |
| `node --check vocabulary-pronunciation.js` | PASS |
| `node test_vocabulary_card_flash.js` | PASS |
| `node test_all_course_integrity.js` | PASS |
| `git diff --check` | PASS |
| Course totals | 17 unique courses, 186 lessons, 2,130 MCQs |

The release cache-busters are `vm-native-v19-card-image-menu` and `pronunciation-native-v3-natural-voice`. The local QA note is retained separately in `VOCABULARY_COURSE_LAYOUT_QA_NOTES.md` for implementation evidence.
