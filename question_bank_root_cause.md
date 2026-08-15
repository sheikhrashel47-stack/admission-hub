# Question Bank performance/correctness root-cause analysis

## Scope confirmation
The requested work is a pure engineering fix. No visual design, navigation, screen flow, user-facing copy, feature behavior, or data schema is to be changed unless a schema-compatible internal index is required for stable ordering.

## Confirmed findings from the active code path

The active Question Bank practice renderer is `qbank-redesign.js`, exposed as `window.renderQuestionBankV2` and selected by the feature-suite route hook. Topic practice state is held in the global `QuestionBankPracticeSession` object, while the list is rendered as an HTML string.

When an option is selected, `selectTopicAnswer()` mutates `practice.answers[qid]`, updates `practice.recent`, and immediately calls `window.renderQuestionBankV2()`. When an answer is revealed, `revealTopicAnswer()` mutates `practice.revealed[qid]` and calls the same full renderer. This means a single-item interaction rebuilds the complete topic feed, recreates every question card, and replaces the feed DOM. The same pattern is used for search, filters, bookmarks, CRUD actions, and load-more.

The base `renderShell()` implementation in `index.html` calls `window.scrollTo(0,0)` during rendering. Consequently, the answer-selection path has a confirmed scroll-reset cause: local answer state triggers a parent-level full render, and the shell render explicitly resets the document scroll position.

The current topic list is not virtualized. `renderFeed()` filters the entire topic array, slices the first 100 questions, and then `loadMoreTopicQuestions()` increases the slice by another 100. Each load-more action inserts every item from the beginning through the new limit into the DOM. This is progressive pagination, not viewport windowing, and it cannot satisfy the 30,000-question bounded-DOM requirement.

`qCard()` uses the array index only for the displayed label (`Q 01`, `Q 02`, etc.). The interaction lookup uses the stable `q.id`, which is good for answer state, but because the entire `.q-feed-body` is replaced on every interaction there is no retained item DOM identity or independent item update boundary. The active implementation is string-based HTML rather than independently memoized/recycled item components.

`currentTopicQuestions()` returns `CACHE.questions.filter(...)` without a numeric ordering comparator. The displayed order therefore follows IndexedDB retrieval/insertion order rather than an explicit stable numeric question order. Other parts of the application also use string/name or timestamp ordering in separate contexts, but the active topic practice feed does not derive and memoize a numeric order.

## Initial engineering direction

The fix should keep the existing markup and CSS classes unchanged while introducing an internal normalized topic index, a stable ordered ID list, per-question answer/reveal state, a viewport-windowed renderer with adaptive overscan, and topic-scoped session scroll anchoring. The answer interaction should update only the affected card DOM and its local state, not call the shell renderer or touch the scroll container. Existing question IDs, question content, and persistence behavior must remain compatible.

## Runtime dataset findings

The local runtime contains 1,046 questions across five Bengali topics. Each question has a stable immutable-looking `id`, `subjectId`, `topicId`, question content, options, answer, explanation, metadata, stats, bookmark state, and timestamps. The imported dataset does not currently expose a `number` or `questionNumber` field, so the stable ordering fix must derive numeric order from the existing question identity/source sequence without overwriting existing records. The first topic contains 219 questions, followed by topics with 218, 200, 200, and 209 questions.

The active practice session starts with an empty normalized answer/reveal map but a `visibleCount` of 100. This confirms the current renderer is designed around a growing slice rather than viewport-based windowing.

## Runtime practice-screen findings

The first topic practice screen reports 219 questions and initially renders 100 cards. The visible card markup is generated as one large `.q-feed-body` HTML string, with four option buttons plus footer actions for every rendered question. This confirms the current implementation is not viewport-windowed even on a 219-question topic and that each option interaction is routed through the global renderer.

## Scroll-container runtime findings

The active layout exposes a long body/app content height (approximately 42,000 CSS pixels for the 100-card slice), while the document HTML scrolling element reports a fixed 1,100-pixel client/scroll height and `scrollTop: 0`. The page structure therefore has an unusual root scrolling context: the body/app holds the long content, but `renderShell()` calls `window.scrollTo(0,0)`, which is still enough to reset the user-visible document position during full replacement. The answer-selection test confirmed the selected state is written and the renderer is invoked; a follow-up container audit is required to preserve the actual scroll host precisely.

## First implementation verification

After loading the performance module locally, the existing topic practice screen remained visually the same but the rendered DOM contained only the viewport/overscan window (seven question cards in the initial viewport) plus a load-more control, rather than the previous 100-card DOM. The existing labels, option buttons, footer actions, tabs, and bottom navigation remained unchanged.

The clean reload and subject navigation preserved the previous Question Bank subject/topic presentation and navigation hierarchy. No user-facing styling or route structure was changed by the performance layer.

## Windowed renderer runtime metrics

The patched renderer exposes a `windowed-v1` diagnostic state. On a 219-question topic at a deep restored scroll position, it kept only 11 question card nodes mounted while retaining a 100-question display window and a 219-question filtered dataset. The stable order began with imported IDs ending in 0001, 0002, 0003, through 0012. The scroll host was the document body, and topic-scoped scroll state restored a deep position rather than forcing the user back to the first question.

- At a deep body scroll position of 40,031 pixels, selecting a visible option preserved the exact scroll position with 0-pixel drift and kept 11 mounted card nodes.
- A DOM identity check showed exactly one card (`mcq-lit-mcq-0302`) was replaced for its new answer state; every other visible card node was reused. This confirms the item-level re-render boundary.

The full-ID patch retained the original Question Bank subject screen and subject-to-topic navigation without changing visible cards or controls.

The full-ID renderer now reports `219 questions` without the previous `showing 100` progressive-slice label or load-more control. The visible question cards retain the previous headings, options, answer buttons, footer actions, typography classes, and bottom navigation; only the internal mounting strategy changed.

- A browser-only synthetic 30,000-question test produced 30,000 filtered/display IDs but mounted only 20 card nodes at the measured position. The first three and last three IDs followed strict numeric order from `perf-q-00001` through `perf-q-30000`.
- An endpoint scroll on the real 219-question topic mounted 10 cards near the end (`mcq-lit-mcq-0885` through `mcq-lit-mcq-0894`), every mounted card contained non-empty question text, and the window boundaries ended at the dataset length without blank placeholders.

- Latest clean reload loaded the `windowed-v1` module and exposed its diagnostics. A direct `navigate('question-bank/topic/...')` call from the initial Question Bank page did not initialize `ExplorerState.topicId` in that single console timing test (`questions: 0`), so subsequent QA should use the normal user click/hashchange route rather than relying on an immediate programmatic navigation call. This did not occur in the earlier normal subject→topic browser click flow.

- After adding route-parameter resolution, a direct `#question-bank/topic/mcq_final_import_v1_topic_1` hash loaded correctly with `Router.path` and `ExplorerState.topicId` set, 219 questions indexed, 13 cards mounted, and the summary `219 questions`. This restores normal deep-link/back-navigation compatibility.

## Final local QA snapshot

With `question-bank-performance.js?v=2` loaded, direct topic hash navigation produced the expected 219-question practice route. The renderer mounted only 15 card nodes at the restored position, kept the original `219 questions` summary, and a fresh option selection completed with 0-pixel body-scroll drift. The answer state was stored in the per-question session map.

The browser console showed no runtime errors during the final route and interaction checks.

## Production verification

GitHub Pages deployment run `31883465570` completed successfully for commit `ea87df2`. On the live site, the direct topic URL loaded `windowed-v1`, indexed 219 questions, mounted only seven cards at the initial viewport, preserved the `219 questions` summary, and resolved the topic route with the original question IDs and markup.
