# নতুন Lossless PDF-to-Visual Course Tool Blueprint

## মূল সিদ্ধান্ত

নতুন Course tool-এ PDF-এর তথ্যকে শুধু OCR করে নতুন HTML text হিসেবে দেখানো যাবে না। এতে বাংলা অক্ষর বদলে যাওয়া, spacing হারানো, table ভেঙে যাওয়া এবং diagram বাদ পড়ার ঝুঁকি থাকে। তাই tool-টি **dual-layer, lossless architecture**-এ বানাতে হবে।

> **Exact View**-তে PDF page pixel-perfect অবস্থায় থাকবে। **Visual Study View**-তে একই source page-এর verified block-গুলো সুন্দর card/box-এ সাজানো হবে। Visual block-এর পাশে source page reference এবং “Original page দেখুন” action থাকবে। কোনো block source-এর সঙ্গে মেলেনি হলে সেটি publish হবে না।

## ১. দুটি viewing mode

| Mode | কী দেখাবে | Exactness rule |
|---|---|---|
| Exact PDF View | প্রতিটি PDF page high-resolution image/PDF canvas হিসেবে | কোনো অক্ষর, table, arrow, icon, footer, page number বা diagram বদলানো যাবে না |
| Visual Study View | source page-এর verified text block, table, diagram ও example আলাদা সুন্দর box-এ | প্রতিটি block-এর `sourcePage`, `sourceBlockId` ও original crop থাকবে |
| Compare View | বাম/উপরে original page, ডান/নিচে visual reconstruction | missing বা mismatch block সঙ্গে সঙ্গে highlight হবে |

**Exact View হবে authoritative source।** Visual Study View কখনো source-এর বিকল্প নয়; এটি পড়ার সুবিধার জন্য recomposed presentation মাত্র।

## ২. PDF import pipeline

প্রতিটি PDF আলাদা namespace-এ process হবে। Pipeline হবে: **PDF intake → page render → layout segmentation → text extraction → visual asset extraction → source mapping → coverage validation → review → publish**।

প্রথমে ১০০% page image render করা হবে। Text extraction এবং OCR কেবল search, indexing ও block detection-এর জন্য ব্যবহৃত হবে; page display-এর জন্য OCR text ব্যবহার করা হবে না। Embedded image, table, arrow, diagram, color panel, bullet, footer এবং page number আলাদা asset বা original-page crop হিসেবে সংরক্ষণ করা হবে।

প্রতিটি extracted block-এ নিচের metadata থাকবে:

```json
{
  "sourceId": "somas-visual-admission-master-guide",
  "sourcePage": 23,
  "sourceBlockId": "p23-b07",
  "type": "rule|table|diagram|example|mcq|answer|note",
  "rawText": "exact extracted text",
  "normalizedText": "search-only normalized text",
  "bbox": [x, y, width, height],
  "originalCrop": "assets/somas/p23/p23-b07.webp",
  "verified": true
}
```

`rawText` source extraction-এর exact representation হবে। `normalizedText` শুধু search-এর জন্য থাকবে। Display text এবং original crop সবসময় একই source block-এর সঙ্গে যুক্ত থাকবে।

## ৩. Visual Study View-এর layout rules

Mobile-এ পুরো PDF page ছোট করে fit করানো হবে না, কারণ তাতে বাংলা অক্ষর ছোট হয় এবং table unusable হয়। Visual Study View হবে **এক column, পর্যাপ্ত padding, বড় readable text এবং sequential box layout**।

প্রস্তাবিত typography হলো body text **১৭–১৯px**, line-height **১.৬–১.৮**, lesson heading **২৪–৩০px**, table header **১৪–১৬px** এবং note/trap label **১৩–১৫px**। Bengali font হিসেবে Noto Sans Bengali বা সমমানের Unicode Bengali font ব্যবহার হবে। `word-break: break-all`, `overflow-wrap: anywhere` এবং অক্ষর ভাঙা CSS একেবারে নিষিদ্ধ থাকবে।

| Content type | Mobile treatment |
|---|---|
| Rule | full-width rule box, বড় heading, source page badge |
| Example | আলাদা worked-example box; প্রতিটি arrow/step আলাদা row |
| Table | boxed table; column না ধরলে stacked row বা শুধু table-এর ভেতরে controlled horizontal scroll |
| Diagram | original high-resolution crop বা SVG/image; text retype করে diagram বানানো যাবে না |
| Comparison | দুইটি full-width comparison card; narrow 2-column squeeze নয় |
| MCQ | original question, four options, answer ও explanation আলাদা card layer |
| Footnote | মূল block-এর পরে ছোট কিন্তু readable source-note box |
| Page footer | Exact View-তে অবশ্যই থাকবে; Visual View-তে source page reference হিসেবে থাকবে |

## ৪. কোনো তথ্য বাদ না যাওয়ার coverage system

প্রতিটি Course publish হওয়ার আগে page coverage manifest তৈরি হবে। Manifest-এ প্রতিটি PDF page, detected block, table, image, heading, MCQ, answer এবং note-এর status থাকবে। নিচের শর্ত পূরণ না হলে Course publish হবে না:

1. PDF page count এবং imported page count সমান হতে হবে।
2. প্রতিটি page-এর অন্তত একটি source snapshot থাকতে হবে, এমনকি page-এ শুধু diagram বা whitespace থাকলেও।
3. প্রতিটি detected visual asset-এর original crop থাকতে হবে।
4. প্রতিটি lesson/slide block-এর source page reference থাকতে হবে।
5. MCQ count, option count, answer index এবং explanation source page দিয়ে যাচাই হবে।
6. Source text বনাম visual block-এর hash/diff report ১০০% pass না করলে item “Needs review” থাকবে।
7. সন্দেহজনক OCR বা অস্পষ্ট বাংলা অক্ষর visual reconstruction-এ যাবে না; সেখানে Original page দেখানো হবে।

## ৫. Somas PDF-এর জন্য সঠিক course structure

তোমার দেওয়া Somas guideটি **১০২ page-এর A4 PDF**। এটি ছোট কয়েকটি generic lesson-এ flatten করা যাবে না। এর নিজস্ব structure ধরে Course বানাতে হবে:

| Source section | Course treatment |
|---|---|
| Topic overview ও chapter map | Course overview + roadmap lesson |
| Foundation: সমাস, anatomy, সমাস-বিগ্রহ | ভিত্তি lessons |
| ছয় প্রকার সমাস | অব্যয়ীভাব, তৎপুরুষ, কর্মধারয়, দ্বিগু, দ্বন্দ্ব ও বহুব্রীহি আলাদা lesson group |
| Master skill ও decision algorithm | step-by-step visual algorithm lesson |
| ১৩০+ master বিগ্রহ তালিকা | searchable source table + exact-view fallback |
| ১৫টি admission trap | আলাদা trap clinic cards, প্রতিটির source page link |
| ৫০টি micro-rule | rapid revision rule deck |
| question-pattern guide ও ১০০ MCQ | source-backed Exam Zone |
| answer key ও final master map | answer/revision section |

PDF-এ থাকা “Concept → Rule → Visual → Example → Trap → Practice → MCQ → Revision” sequence অক্ষুণ্ণ থাকবে। AI কোনো নতুন example বা MCQ বানালে সেটি **Supplementary** label পাবে; PDF-এর মূল তথ্যের সঙ্গে মিশবে না।

## ৬. Course isolation

প্রতিটি PDF হবে আলাদা data pack এবং আলাদা `sourceId`। Course ID, lesson ID, slide ID, block ID, asset path ও MCQ ID-তে source prefix থাকবে। যেমন `somas-p23-b07`, `somas-lesson-04-slide-03`। কোনো shared mutable array-তে সব Course merge করা যাবে না। প্রত্যেক Course-এর source manifest, raw page assets, visual blocks এবং MCQ আলাদা folder/pack-এ থাকবে।

Import screen-এ “এই PDF-এর source boundary” lock করা থাকবে। অন্য PDF-এর block source mapping-এ ঢুকলে validator build বন্ধ করবে। একই শব্দ দুই PDF-এ থাকলেও source page আলাদা না হলে সেটিকে একই data হিসেবে merge করা যাবে না।

## ৭. PDF parser/admin review screen

Automatic parsing-এর পরে user-facing Course publish হবে না। Review screen-এ বাম পাশে original PDF page এবং ডান পাশে parsed blocks দেখা যাবে। প্রতিটি block-এর source page, bounding box, extracted text, detected type এবং verification state থাকবে। Reviewer চাইলে crop বদলাতে, text correction করতে, table row split করতে এবং block order ঠিক করতে পারবে।

**Publish button কেবল তখনই সক্রিয় হবে যখন:** page coverage ১০০%, visual asset coverage ১০০%, source mapping complete এবং MCQ validation pass। এতে “দেখতে সুন্দর” করার জন্য ভুল বা missing data publish হবে না।

## ৮. Offline ও performance architecture

App startup-এ কোনো Course data load হবে না। Course library খুললে শুধু metadata manifest load হবে। একটি Course open করলে প্রথমে lesson index এবং current lesson-এর assets load হবে; পরের lesson background-এ optional prefetch হবে। Original PDF page image current lesson অনুযায়ী lazy-load হবে।

Offline-এর জন্য source pack versioned cache-এ থাকবে। Visual block, original crop এবং PDF page আলাদা cache entry হবে। Cache miss হলে visual reconstruction ভেঙে যাবে না; app “Original page unavailable” না দেখিয়ে cached source page অথবা safe fallback দেখাবে। Course update হলে source hash বদলাবে এবং পুরোনো pack invalidate হবে।

## ৯. Final user experience

User Course খুলে প্রথমে **Course map** দেখবে। Lesson-এর ভেতরে progress rail থাকবে: Overview → Foundation → Rules → Visual examples → Traps → Practice → MCQ → Revision। প্রতিটি screen-এ বড় readable content থাকবে। যেকোনো card থেকে `Original PDF page` চাপলে সেই source page full-screen view-তে খুলবে। Table কখনো squeezed হবে না, বাংলা অক্ষর মাঝখান থেকে ভাঙবে না, এবং source-এর কোনো element silently বাদ যাবে না।

## শেষ সুপারিশ

নতুন tool-টি “PDF থেকে নতুন করে Course লিখে বানানো” tool হওয়া উচিত নয়; এটি হবে **PDF-preserving visual learning system**। Original page হবে সত্যের একমাত্র authority, আর visual card হবে তার verified presentation। এই architecture ব্যবহার করলে exactness, সুন্দর design, readable font, mobile usability, offline support এবং zero cross-course contamination—সব একসঙ্গে রাখা সম্ভব হবে।
