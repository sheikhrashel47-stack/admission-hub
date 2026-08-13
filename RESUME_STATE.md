# Admission Hub MCQ Generation Resume State

## Current status

A final repository JSON has been created at `mcq_final.json`. It contains **934 unique source-based Bengali literature MCQs** compiled from `Photo(1).pdf`. The target remains **1,000 MCQs**, so **66 MCQs remain** for a later continuation. The current JSON is a partial but deduplicated checkpoint and is intentionally being pushed now so no completed work is lost.

| Topic | Current unique MCQs | Target | Remaining |
|---|---:|---:|---:|
| গন্তব্য কাবুল | 209 | 200 | 0* |
| কপিলদাস মুর্মুর শেষ কাজ | 219 | 200 | 0* |
| নেকলেস | 198 | 200 | 2 |
| রেইনকোট | 124 | 200 | 76 |
| মাসি-পিসি | 184 | 200 | 16 |
| **Total** | **934** | **1000** | **66** |

`*` The first two topics currently exceed the nominal 200-question topic target because completed replacement batches were merged without deleting otherwise valid unique items. No valid unique questions were removed solely to force a per-topic cap in this emergency checkpoint.

## Source mapping

- **গন্তব্য কাবুল:** PDF/Image pages 1–3.
- **কপিলদাস মুর্মুর শেষ কাজ:** PDF/Image pages 4–7.
- **নেকলেস:** PDF/Image pages 8–12.
- **রেইনকোট:** PDF/Image pages 13–20.
- **মাসি-পিসি:** PDF/Image pages 21–26.

Only source-grounded content from the assigned pages was used. Page 20 is a low-contrast review-question scan; faint backside OCR overflow was excluded from the usable source prefix.

## Generation and QA checkpoint

The original generation produced 1,000 raw records in 50 complete batch files. Programmatic duplicate screening retained 854 records. Completed replacement output contributed 80 additional records at merge time, resulting in 934 unique final records. A final merge-level exact/near-duplicate check removed 0 further records.

The final JSON uses stable IDs (`lit-mcq-0001` onward), preserves the question, four options, zero-based answer index, explanation, topic, source page, difficulty, source, and tags. The JSON is a standalone export and has not yet been imported into the app's IndexedDB Question Bank. That app import and the remaining 66 source-based MCQs are the next continuation tasks.

## Repository files added or updated in this checkpoint

- `mcq_final.json` — final 934-item unique MCQ export with metadata and topic counts.
- `final_merge_report.json` — machine-readable merge summary.
- `RESUME_STATE.md` — this updated continuation state.
