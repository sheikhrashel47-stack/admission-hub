# Course layout and exam resume QA

## Local browser checks

The Adjectives lesson slide rendered the generated table as a full-width boxed table. The table width matched the content box and the browser reported `overflow-x: hidden`, `scrollWidth === clientWidth`, `word-break: normal`, and `overflow-wrap: normal` for the table cells. The existing course slide wrapper also reported hidden horizontal overflow, so the page itself does not become horizontally swipeable.

The local Adjectives Exam Zone rendered 10 question cards on page 1 and each card included a `data-course-qid` anchor. The exam route currently has six pages for 60 questions, which is suitable for testing exact page/card restoration.

The exam jump control successfully moved to page 3/6, showing questions 21–30. A page scroll placed the viewport around Q22 while the URL and page state remained on the same exam route. This is the target state for the exit-and-return test.

The exit button returned to the course overview and reopening Exam Zone restored page 3/6 rather than page 1. The saved snapshot contained the current question anchor and session. However, browser instrumentation showed that this environment's visual scroll operation does not expose a reliable `window.scrollY` value, so the implementation should restore by the saved card anchor using `scrollIntoView` instead of relying on an absolute pixel offset.
