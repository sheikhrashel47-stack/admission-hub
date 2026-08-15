from pathlib import Path

root = Path(__file__).parent
index = (root / "index.html").read_text(encoding="utf-8")
module = (root / "question-bank-performance.js").read_text(encoding="utf-8")

assert 'question-bank-performance.js?v=2' in index
for marker in (
    'data-question-id',
    'sessionStorage',
    'questionNumber',
    'performance.now()',
    'window.qPerfSelect',
    'window.qPerfReveal',
    'window.qPerfFilter',
    'window.__qbankPerformance',
    'perf.displayIds = perf.filteredIds.slice();',
):
    assert marker in module, marker

select_start = module.index('window.qPerfSelect')
reveal_start = module.index('window.qPerfReveal')
filter_start = module.index('window.qPerfFilter')
assert 'renderQuestionBankV2' not in module[select_start:reveal_start]
assert 'renderQuestionBankV2' not in module[reveal_start:filter_start]
assert "location.hash='question-bank/topic/'" not in module
print('Question Bank performance static QA passed')
