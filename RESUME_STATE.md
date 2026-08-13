# Admission Hub MCQ Generation Resume State

## Current status

This task is to create exactly **1000 source-based MCQs** from `/home/ubuntu/upload/Photo.pdf`, then run final QA and add only QA-passed questions to the app's existing Question Bank. No question should be saved before final QA.

At the time of this checkpoint, **80 complete generated MCQs** exist in the local batch workspace `/home/ubuntu/mcq_batches/`. All 8 complete batch files currently contain 10 items each; malformed or partial batch files are excluded.

| Topic | Current complete MCQs | Target | Source pages/images |
|---|---:|---:|---|
| গন্তব্য কাবুল | 30 | 200 | Image/Page 1–3 |
| কপিলদাস মুর্মুর শেষ কাজ | 10 | 200 | Image/Page 4–7 |
| নেকলেস | 10 | 200 | Image/Page 8–12 |
| রেইনকোট | 10 | 200 | Image/Page 13–20 |
| মাসি-পিসি | 20 | 200 | Image/Page 21–26 |
| **Total** | **80** | **1000** | **26 pages** |

The generation approach is being changed to **parallel 20-question batches**. Existing complete batches may be retained and counted only once; partial or malformed files must never be included.

## Source mapping

The supplied PDF is image-only and has 26 pages. `pdftotext` produced no usable text, so Bengali OCR and visual source inspection are required. The required source mapping is:

- **গন্তব্য কাবুল:** Image/Page 1–3; target 200 MCQs.
- **কপিলদাস মুর্মুর শেষ কাজ:** Image/Page 4–7; target 200 MCQs.
- **নেকলেস:** Image/Page 8–12; target 200 MCQs.
- **রেইনকোট:** Image/Page 13–20; target 200 MCQs.
- **মাসি-পিসি:** Image/Page 21–26; target 200 MCQs.

Only facts clearly supported by these assigned pages may be used. No outside facts, assumptions, contextual additions, or guesses are allowed. If an OCR segment is unclear, it must not be used without reliable visual confirmation.

## App Question Bank structure

The repository is a static single-page app implemented mainly in `index.html`. The Question Bank uses browser **IndexedDB**, not a server database. The database is named `admissionHubDB`, currently version 3, and includes stores such as `subjects`, `topics`, and `questions`.

The current live app has a subject named **বাংলা** with zero topics at the initial inspection. The user's requested label “Bangla 1st” does not currently exist as a separate subject. Existing subject names and questions must not be renamed, deleted, or overwritten. The safe destination is the existing বাংলা subject, with the five requested topics created only if they do not already exist.

A question record uses the following native fields:

```json
{
  "id": "unique-id",
  "subjectId": "existing বাংলা subject id",
  "topicId": "destination topic id",
  "question": "...",
  "options": ["A...", "B...", "C...", "D..."],
  "answer": 0,
  "explanation": "...",
  "tags": [],
  "difficulty": "medium",
  "source": "import",
  "createdAt": 0,
  "updatedAt": 0,
  "stats": {"attempts": 0, "correct": 0, "wrong": 0},
  "bookmarked": false
}
```

The native importer saves questions with `dbPut('questions', obj)` and assigns a fresh `id`. Additive saving must never use replacement mode, must not reuse an existing question ID, and must verify the final counts after reload.

## Required MCQ format and QA

Every final item must have one question, four plausible same-type options A–D, exactly one correct answer, a concise source-based explanation, and source page references used only for QA metadata. Correct options should be balanced across A–D and must not follow a predictable sequence.

Before save, run both programmatic and content QA. Check source support, no hints or clues, one correct option, plausible and balanced options, answer/explanation consistency, Bengali spelling and factual consistency, exact duplicates, near duplicates, page-range validity, subject/topic metadata, and missing fields. Repair source-supported issues; if repair is not possible, discard and generate a replacement from the assigned source.

## Remaining work

1. Complete the remaining 920 MCQs with exact 200-question totals per topic.
2. Aggregate only complete batch files and preserve the five-topic mapping.
3. Run final QA and deduplicate across all 1000 items; replace or remove invalid items and regenerate replacements until each topic has exactly 200 QA-passed items.
4. Create or locate the existing বাংলা subject and the five topics without changing existing data.
5. Add the 1000 QA-passed records through the app's native IndexedDB-compatible save path or a safe additive seed/import mechanism.
6. Reload and verify that exactly 1000 new records are present under the five correct topics and that existing records remain unchanged.
7. Update this file with final counts, QA statistics, save results, and any remaining limitations.
8. Commit and push `RESUME_STATE.md` and all required app/data changes to the GitHub repository.
