from pathlib import Path
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parent
subprocess.run(['python3', str(ROOT / 'build_somas_course.py')], cwd=ROOT, check=True)
text = (ROOT / 'course-somas-data.js').read_text(encoding='utf-8')
match = re.search(r'const course = (\{.*?\});\n', text, re.S)
assert match, 'course object missing'
data = json.loads(match.group(1))
assert data['id'] == 'somas-visual-admission'
assert data['source']['pages'] == 102
assert data['stats']['pages'] == 102
assert data['stats']['lessons'] == 14
assert data['integrity']['sourceLocked'] is True
assert data['integrity']['generatedText'] is False
assert data['integrity']['crossCourseMerge'] is False
assert data['source']['authority'] == 'Original supplied PDF'
assert data['source']['pagePath'].endswith('p{page:03d}.webp')
assert data['source']['pdfPath'].endswith('somas-master-guide.pdf')
lessons = data['lessons']
assert len(lessons) == 14
assert len({x['id'] for x in lessons}) == 14
covered = []
for lesson in lessons:
    assert 1 <= lesson['startPage'] <= lesson['endPage'] <= 102
    covered.extend(range(lesson['startPage'], lesson['endPage'] + 1))
assert sorted(set(covered)) == list(range(1, 103)), 'lesson map does not cover every source page'
questions = data['mcqs']
assert len(questions) == 100
assert [q['number'] for q in questions] == list(range(1, 101))
assert len({q['id'] for q in questions}) == 100
for q in questions:
    assert q['id'] == f"somas-mcq-{q['number']:03d}"
    assert len(q['options']) == 4
    assert len({x.strip() for x in q['options']}) == 4
    assert q['answer'] in range(4)
    assert q['correctLetter'] == 'কখগঘ'[q['answer']]
    assert 1 <= q['sourcePage'] <= 102
    assert q['sourceBlockId'].startswith(f"somas-p{q['sourcePage']:03d}-mcq-")
    assert q['family'] == 'Somas PDF · Admission MCQ Question Bank'
    assert q['question'] and q['explanation']
# The pack must not contain legacy generated-course namespaces or old source IDs.
for forbidden in ('admissionHubCourseProgressV1', 'admissionHubCourseResultsV1', 'courseDataV1', 'voice-course', 'parts-of-speech'):
    assert forbidden not in text, f'legacy/mixed marker found: {forbidden}'
print('SOMAS_SOURCE_VALIDATION_OK pages=102 lessons=14 mcqs=100 unique_options=400')
