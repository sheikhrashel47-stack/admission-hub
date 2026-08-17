from pathlib import Path

ROOT = Path(__file__).parent
files = {name: (ROOT / name).read_text() for name in [
    'index.html',
    'admission-hub-feature-suite.js',
    'phase2-dictionary-parser.js',
    'phase3-intelligence.js',
    'phase3-question-bank-route.js',
    'phase23-ui.js',
    'master-update.js',
    'study-hub.js',
    'study-tools-restore.js',
    'urgent-fix.js',
    'urgent-topic-fix.js',
    'phase12-ui.js',
]}

checks = {
    'loading gate exists': 'window.__admissionFinalModulesReady=false' in files['index.html'] and 'class="app-loading"' in files['index.html'],
    'reference Dashboard renderer exists': 'dashboard-reference' in files.get('phase12-ui.js', '') if 'phase12-ui.js' in files else True,
    'reference Study Hub banner exists': 'reference-study-banner' in files.get('phase12-ui.js', '') if 'phase12-ui.js' in files else True,
    'reference command center exists': 'reference-command-card' in files.get('phase12-ui.js', '') if 'phase12-ui.js' in files else True,
    'reference recommended action exists': 'reference-action-card' in files.get('phase12-ui.js', '') if 'phase12-ui.js' in files else True,
    'hashchange is final coordinator': 'window.__admissionRenderRoute' in files['index.html'] and 'if(typeof window.__admissionRenderRoute===\'function\') window.__admissionRenderRoute();' in files['index.html'],
    'single render lock exists': 'window.__admissionFinalRenderLock' in files['index.html'],
    'parser final renderer exposed': 'window.renderQuestionParser' in files['admission-hub-feature-suite.js'],
    'parser legacy timeout removed': "else if ((Router.path || '') === 'question-parser') renderParserHome()" not in files['phase2-dictionary-parser.js'],
    'qbank helper does not manually render': "location.hash='#question-bank/subject/'+encodeURIComponent(id);renderAuthoritative" not in files['phase3-question-bank-route.js'],
    'special navigation does not manually render': 'return window.render()' not in files['master-update.js'] and 'renderWebChatV2(); else renderDictionaryV2();' not in files['phase23-ui.js'],
    'dashboard duplicate card injection removed': 'page.insertBefore(section, page.firstChild || null)' not in files['study-hub.js'],
    'legacy urgent boot repaint removed': 'renderAfterBoot' not in files['urgent-fix.js'],
    'legacy topic route delegates to final qbank': 'window.renderQuestionBankV2' in files['urgent-topic-fix.js'],
    'progress extras are synchronous': 'window.__phase3ProgressExtras' in files['phase3-intelligence.js'] and "setTimeout(()=>{if(p==='dashboard')injectDashboard" not in files['phase3-intelligence.js'],
    'no destructive startup cleanup restored': 'purgeDuplicateGeneralTopics' in files['index.html'] and 'changed:false' in files['index.html'],
}

for label, passed in checks.items():
    print(f'{label}: {"PASS" if passed else "FAIL"}')

if not all(checks.values()):
    raise SystemExit(1)
print('duplicate-ui QA: PASS')
