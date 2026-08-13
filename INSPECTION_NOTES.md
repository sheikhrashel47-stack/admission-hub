# Inspection notes

- Repository is a vanilla static GitHub Pages app: `index.html` plus many ordered JavaScript patches; no `package.json` or build system.
- Active scripts in `index.html` include `qbank-redesign.js`, `phase3-intelligence.js`, `phase3-question-bank-route.js`, `reward-quest-upgrade.js`, `mcq-qbank-import.js`, and others.
- Deployed app dashboard has bottom navigation: Home, Bank, Parser, Exam, History, Progress.
- Current deployed Question Parser route is `#smart-formatter`, titled “Smart Formatter 2.0”. It currently presents one textarea (`#p5Raw`) with a placeholder MCQ and one “Detect & format” button. Copy says it auto-detects JSON, plain text, or HTML-like input, but there is no visible format selector or file input in the inspected view.
- Current parser is implemented in `phase3-systems.js` (runtime UI) and `mcq-qbank-import.js` (automatic seed import of `mcq_final.json` into IndexedDB). Existing question records use `options: string[4]` and numeric `answer` index, with `subjectId` and `topicId`.
- Requirements additionally include Reward Shop/inventory/effects/XP integration and full Subject → Topic → Question management from the second attachment.
