# Four-Course Local QA

## Checkpoint 1

- Local Course Library loaded successfully with 7 active courses: Parts, Noun, Voice, Degree, Subject–Verb Agreement, Same Word Parts of Speech, and Right Form of Verb.
- Library hero reported 80 visual lessons and 708 MCQ cards.
- Degree overview loaded with 8 lessons, 40 visual slides, and 70 MCQs.
- Degree Lesson 01 loaded successfully. The dedicated shared grammar renderer displayed the premium Degree Ladder visual with Positive, Comparative, Superlative, and Signal cards, plus Bengali rule/insight text.
- No blank visual, route error, or loading lock observed at this checkpoint.
## Checkpoint 2

Subject–Verb Agreement Lesson 01 loaded successfully with the shared premium Core Rule / Formula visual. Its Bengali guidance and core-noun workflow were readable. Same Word, Different Parts of Speech Lesson 01 also loaded successfully with the Function Lens visual, including position, function, context, and local-grammar guidance. Both routes displayed slide navigation and bottom navigation without a runtime or blank-render error.
## Checkpoint 3

Right Form of Verb Lesson 01 loaded successfully with the V1/V2/V3/V-ing formula visual and course-specific amber styling. Degree Exam Zone loaded with the complete 70/70 source-question bank, search field, filter, pagination, order controls, bookmark/note/edit/duplicate/delete controls, and answer buttons. The first ten questions rendered with clean option labels and no blank-card issue.
## Checkpoint 4

A coordinate/index answer click from the long Exam Zone viewport landed on the bottom Parser navigation rather than the intended option, so the click method was not treated as a product failure. Returning directly to the Degree Exam Zone restored the full 70-question page correctly. Answer interaction will be checked using DOM-targeted control selection instead of a stale visual index.
## Checkpoint 5

The Degree Q01 correct option was successfully activated with a DOM-targeted control. The answer state updated and the page body contained the expected correct-answer feedback. This confirms the shared Exam Zone interaction works for the new course; the earlier mis-click was only a stale viewport-index issue.
## Live Checkpoint

GitHub Pages fresh cache-buster URL loaded the Course Library successfully. The live Library reports 7 active courses, 80 visual lessons, and 708 MCQ cards. The four new course cards are present with the correct counts: Degree 8 lessons/70 MCQs, Subject–Verb Agreement 8/76, Same Word 8/50, and Right Form 8/60. Live Degree overview loaded with its 8-lesson roadmap, 40 visual slides, and 70-question Exam Zone.
