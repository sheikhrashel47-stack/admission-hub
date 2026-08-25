# Bangla Course Integration QA

Local route tested: `http://127.0.0.1:8000/index.html#courses`

The Course library rendered **40 active courses**, **441 visual lessons**, and **3008 MCQ cards**. Category tabs rendered **All 40**, **বাংলা 18**, and **English 22**. After selecting the বাংলা tab, the library showed **18 shown**, displayed the `বাংলা Courses` section, and hid the English section. The 18 Bangla cards were visible with their own title, source topic, lesson count, and MCQ count.

The target Bangla course IDs are:

- bangla-jotichinno
- bangla-bachan
- bangla-samas
- bangla-sahitya
- bangla-ukti
- bangla-podashrito-nirdeshok
- bangla-dhoni-poriborton
- bangla-pod-prokaron
- bangla-uposorgo
- bangla-purush-stree-bachok
- bangla-jukto-borno
- bangla-onusorgo
- bangla-prottoy
- bangla-dhoni-borno
- bangla-kal
- bangla-second-paper-master
- bangla-nontob-sontob
- bangla-sandhi

No user-attached PDF was reused as a different course source in the generated pack; each course carries its own source filename and SHA-256 hash.


The first Bangla card's Open handler was also tested through the DOM and successfully changed the route to `#courses/bangla-jotichinno`, confirming that category rendering did not break navigation.


The first Bangla course opened successfully. Its overview showed 14 lessons, 70 visual slides, 33 source-backed MCQs, and the source PDF note. The first lesson route rendered 5 slides with a slide map, a concept card, rule content, steps, example and navigation controls. The active route was `#courses/bangla-jotichinno/lesson/bangla-jotichinno-lesson-01/slide/0`.


The Bangla Jotichinno Exam Zone rendered `33/33` matching questions across 4 pages. On page 1, 10 question cards were visible with 10 unique IDs, 10 question texts, source lesson family labels, and zero captured runtime errors. Each card exposed four options and the existing interactive controls.
