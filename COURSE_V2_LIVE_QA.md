# Course V2 live QA

Deployment commit: `1a0be332`.

Verified locally and on GitHub Pages:

- `#pdf-courses` opens Visual Courses library.
- Somas card reports 14 lessons, 102 PDF pages, and 100 MCQs.
- `#courses` redirects to `#dashboard` through the legacy removal guard.
- `#pdf-courses/somas-visual-admission` opens the Course map with source page ranges covering page 1–102.
- Visual Study View renders original page previews from `course-assets/somas/pages/p001.webp` through `p102.webp` and exposes the original PDF link.
- Compare View renders the original preview and the exact PDF reference together.
- Exam Zone renders four options, instant red/green feedback, explanation, source page, bookmark, note, reveal, previous/next, exit, and result navigation.
- Course answer/bookmark/progress keys are isolated under `admission-course-v2-somas-visual-admission-*`; no legacy Course keys or main Question Bank keys were touched in the local browser test.
- Fresh dashboard performance check found only `course-tool-v2.js` among Course-related resources; no PDF, page preview, or Somas data pack was fetched at startup.

Source validator result: `SOMAS_SOURCE_VALIDATION_OK pages=102 lessons=14 mcqs=100 unique_options=400`.

Known scope: the first release uses original page previews as the authoritative Visual Study surface rather than reconstructing page text into inferred cards. This prevents omission or alteration of PDF characters, tables, diagrams, arrows, footers, and layout.
