from pathlib import Path
import json
import re

ROOT = Path('/home/ubuntu/admission-hub')
TEXT = ROOT / 'somas_pdf_audit' / 'somas_layout.txt'
OUT = ROOT / 'course-somas-data.js'
raw = TEXT.read_text(encoding='utf-8', errors='replace')
pages = raw.split('\f')
page_text = {i: p for i, p in enumerate(pages, 1) if p.strip()}

# Source section markers are detected from the PDF's own extracted headings.
marker_defs = [
    ('Topic Overview & Chapter Map', ['CHAPTER MAP', 'TOPIC OVERVIEW']),
    ('Foundation: What is Samas?', ['PREREQUISITES', 'LESSON 01']),
    ('Six Types of Samas', ['PART 2 —', 'LESSON 04']),
    ('Master Skills & Confusion Clinic', ['PART 3 —', 'MASTER SKILL']),
    ('Admission MCQ Question Bank', ['ADMISSION MCQ QUESTION BANK']),
    ('Final Answer Key & Master Map', ['FINAL ANSWER KEY']),
]

def page_has(page, terms):
    text = page_text.get(page, '')
    return any(term.lower() in text.lower() for term in terms)

markers = []
for title, terms in marker_defs:
    hits = [p for p in page_text if page_has(p, terms)]
    if hits:
        markers.append((min(hits), title))
markers.sort()
lessons = []
lesson_hits = []
for p, text in page_text.items():
    m = re.search(r'(?im)^\s*LESSON\s+(\d{1,2})\b', text)
    if m:
        lesson_hits.append((p, int(m.group(1))))
lesson_hits.sort()
# The PDF repeats LESSON headings on part-divider pages. Keep the actual/latest
# heading for each numbered lesson, then add the topic overview as Lesson 00.
unique_lesson_pages = {}
for page, number in lesson_hits:
    unique_lesson_pages[number] = max(page, unique_lesson_pages.get(number, 0))
lesson_starts = sorted(unique_lesson_pages.items(), key=lambda x: x[1])
lessons.append({
    'id': 'somas-lesson-00',
    'number': 0,
    'title': 'Topic Overview & Chapter Map',
    'startPage': 1,
    'endPage': max(1, (lesson_starts[0][1] - 1) if lesson_starts else 102),
    'sourceSection': 'Topic Overview & Chapter Map'
})
for idx, (number, start) in enumerate(lesson_starts):
    end = (lesson_starts[idx + 1][1] - 1) if idx + 1 < len(lesson_starts) else 102
    lessons.append({
        'id': f'somas-lesson-{number:02d}',
        'number': number,
        'title': f'Lesson {number:02d}',
        'startPage': start,
        'endPage': max(start, end),
        'sourceSection': next((title for page, title in reversed(markers) if page <= start), 'Somas source')
    })
lessons.sort(key=lambda x: x['number'])

# Fallback lesson map keeps every source page reachable if a heading is imperfectly extracted.
if not lessons:
    lessons = [{'id': 'somas-source-pages', 'number': 0, 'title': 'Somas Source Pages', 'startPage': 1, 'endPage': 102, 'sourceSection': 'Complete source'}]

mcq_start = raw.find('ADMISSION MCQ QUESTION BANK')
mcq_end = raw.find('FINAL ANSWER KEY', mcq_start)
mcq_text = raw[mcq_start:mcq_end if mcq_end >= 0 else None]
q_matches = list(re.finditer(r'(?ms)^\s*Q(\d{1,3})\.\s*(.*?)(?=^\s*Q\d{1,3}\.\s|\Z)', mcq_text))
correct_map = {'ক': 0, 'খ': 1, 'গ': 2, 'ঘ': 3}
questions = []
for match in q_matches:
    number = int(match.group(1))
    block = match.group(2).strip()
    correct = re.search(r'(?ms)^\s*Correct:\s*([কখগঘ])\s*[—-]\s*(.*?)(?=\n\s*—|\n\s*Q\d|\Z)', block)
    if not correct:
        raise RuntimeError(f'Missing correct answer for Q{number}')
    before_correct = block[:correct.start()]
    option_matches = list(re.finditer(r'(?<!\S)([কখগঘ])\.\s*', before_correct))
    if len(option_matches) != 4:
        raise RuntimeError(f'Q{number}: expected 4 options, found {len(option_matches)}')
    question = before_correct[:option_matches[0].start()].strip()
    options = []
    for i, opt in enumerate(option_matches):
        end = option_matches[i + 1].start() if i + 1 < len(option_matches) else len(before_correct)
        value = before_correct[opt.end():end].strip()
        options.append(value)
    if not question or any(not x for x in options):
        raise RuntimeError(f'Q{number}: empty question or option')
    answer_letter = correct.group(1)
    explanation = correct.group(2).strip()
    source_page = next((p for p, text in page_text.items() if re.search(rf'(?m)^\s*Q{number:02d}\.\s', text)), None)
    questions.append({
        'id': f'somas-mcq-{number:03d}',
        'number': number,
        'question': question,
        'options': options,
        'answer': correct_map[answer_letter],
        'correctLetter': answer_letter,
        'explanation': explanation,
        'sourcePage': source_page or 0,
        'sourceBlockId': f'somas-p{source_page or 0:03d}-mcq-{number:03d}',
        'family': 'Somas PDF · Admission MCQ Question Bank'
    })
questions.sort(key=lambda x: x['number'])
if len(questions) != 100:
    raise RuntimeError(f'Expected 100 source MCQs, got {len(questions)}')

course = {
    'id': 'somas-visual-admission',
    'category': 'bangla',
    'language': 'বাংলা',
    'title': 'সমাস — Visual Admission Master Guide',
    'subtitle': 'বাংলা ২য় পত্র · সম্পূর্ণ অধ্যায়',
    'description': 'Source-locked visual study course. Every original PDF page remains available in Exact View.',
    'icon': 'বাংলা',
    'level': 'Admission · Advanced',
    'source': {
        'filename': 'Somas-Visual-Admission-Master-Guide(1).pdf',
        'pages': 102,
        'pageSize': 'A4',
        'pdfPath': './course-assets/somas/somas-master-guide.pdf',
        'pagePath': './course-assets/somas/pages/p{page:03d}.webp',
        'authority': 'Original supplied PDF'
    },
    'stats': {'lessons': len(lessons), 'pages': 102, 'mcqs': 100},
    'sections': [{'title': title, 'startPage': start, 'endPage': (markers[i + 1][0] - 1 if i + 1 < len(markers) else 102)} for i, (start, title) in enumerate(markers)],
    'lessons': lessons,
    'mcqs': questions,
    'integrity': {
        'sourceLocked': True,
        'generatedText': False,
        'originalPageFallback': True,
        'crossCourseMerge': False,
        'coverage': '102/102 source pages mapped'
    }
}
js = "(function(){\n  const course = " + json.dumps(course, ensure_ascii=False, indent=2) + ";\n  window.__admissionCoursePacks = Array.isArray(window.__admissionCoursePacks) ? window.__admissionCoursePacks : [];\n  window.__admissionCoursePacks = window.__admissionCoursePacks.filter(c => c.id !== course.id).concat(course);\n})();\n"
OUT.write_text(js, encoding='utf-8')
print(json.dumps({'courseId': course['id'], 'pages': 102, 'lessons': len(lessons), 'mcqs': len(questions), 'markers': markers}, ensure_ascii=False))
