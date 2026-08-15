import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).parent

for filename in ["mcq-qbank-import.js", "qbank-redesign.js", "phase1-upgrade.js", "sw.js"]:
    subprocess.run(["node", "--check", filename], cwd=ROOT, check=True)

html = (ROOT / "index.html").read_text(encoding="utf-8")
assert 'maximum-scale=1' in html
assert 'viewport-fit=cover' in html
assert 'font-size:16px!important' in html
assert 'app-fallback' in html
assert '__admissionBootPromise = boot()' in html
assert 'Local database is still starting' in html
assert 'visual-viewport-height' in html

qbank = (ROOT / "qbank-redesign.js").read_text(encoding="utf-8")
assert 'visibleCount: 40' in qbank
assert 'loadMoreTopicQuestions' in qbank
assert 'setTopicQuery' in qbank
assert 'visibleQs.map' in qbank

sw = (ROOT / "sw.js").read_text(encoding="utf-8")
assert re.search(r"const CACHE_PREFIX = ['\"]admission-hub-shell-", sw)
assert re.search(r"const BUILD_ID = ['\"]v\d+['\"]", sw)
assert sw.count("const CACHE_NAME") == 1
assert "cache: 'no-store'" in sw
assert "cache: 'reload'" in sw
assert "self.skipWaiting()" in sw
assert "self.clients.claim()" in sw
assert "caches.match('./index.html')" in sw
assert "navigator.serviceWorker.register" in html
assert html.count("navigator.serviceWorker.register") == 1
assert "scope:'./'" in html
assert "activateWaiting(registration)" in html
assert "const DB_NAME='admissionHubDB', DB_VERSION=3" in html
assert "const STORES=['appMeta','subjects','topics','questions','exams','examResults','mistakes','vocabulary','dailyStats','activityLogs','settings','ADMISSION_PLANS','PLAN_DAYS']" in html
assert "if(subs.length===0 && !meta)" in html
assert "indexedDB.deleteDatabase" not in sw
assert "localStorage.clear" not in sw

payload = json.loads((ROOT / "mcq_final.json").read_text(encoding="utf-8"))
questions = payload["questions"]
assert len(questions) == 1046
assert len({q["id"] for q in questions}) == len(questions)
assert all(isinstance(q.get("options"), list) and len(q["options"]) == 4 for q in questions)
assert all(isinstance(q.get("answer"), int) and 0 <= q["answer"] <= 3 for q in questions)

print("QA PASS")
print(f"MCQ records preserved: {len(questions)}")
print("Syntax checks: passed")
print("PWA/iOS stability assertions: passed")
print("Bounded question rendering/search assertions: passed")
