(() => {
  'use strict';
  const SOURCE_COURSES = [{
    id: 'sandhi-exact-source-v1',
    slug: 'sandhi',
    category: 'বাংলা Courses',
    title: 'সন্ধি — University Admission Master Guide',
    subtitle: 'Visual University Admission Master Guide · Bangla 2nd Paper',
    sourcePath: './courses/sandhi/index.html',
    sourceHash: 'bf1ecb9767937231a3dcf36250e62eda8645f996f06a3806edf51ed06e6bd0ff'
  }];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const path = () => String(location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard');
  const shell = (html, opts = {}) => typeof window.renderShell === 'function' ? window.renderShell(html, opts) : (document.getElementById('app').innerHTML = html);
  const library = () => shell(`<main class="source-course-page"><header class="source-course-hero"><div><span>ADMISSION HUB · SOURCE COURSE</span><h1>বাংলা Courses</h1><p>Source HTML অপরিবর্তিত রেখে সরাসরি Course হিসেবে চালানো হচ্ছে।</p></div><b>SC</b></header><section class="source-course-card"><div class="source-course-icon">সন্ধি</div><div><span>SOURCE-LOCKED · EXACT ORIGINAL</span><h2>${esc(SOURCE_COURSES[0].title)}</h2><p>${esc(SOURCE_COURSES[0].subtitle)}</p><small>Original source HTML · Interactive lessons · 60 MCQ · Theme · Sidebar · Quiz feedback</small></div><button class="btn" onclick="navigate('source-courses/sandhi')">Open Course →</button></section></main>`, {title:'বাংলা Courses', back:"navigate('dashboard')"});
  const open = () => shell(`<main class="source-course-frame"><iframe title="সন্ধি University Admission Master Guide" src="${esc(SOURCE_COURSES[0].sourcePath)}?sourceCourse=v1" loading="eager"></iframe></main>`, {title:'সন্ধি Course', back:"navigate('source-courses')", hideNav:true});
  const render = () => { const p = path(); if (p === 'source-courses') { library(); return true; } if (p === 'source-courses/sandhi') { open(); return true; } return false; };
  window.renderSourceCourseTool = render;
  const style = document.createElement('style'); style.textContent = `.source-course-page{max-width:980px;margin:0 auto;padding:18px 14px 92px;color:#173128}.source-course-hero{display:flex;justify-content:space-between;align-items:center;gap:15px;padding:25px 20px;border-radius:24px;background:linear-gradient(135deg,#eef1ff,#faf7ff);border:1px solid #ddd9ff}.source-course-hero span,.source-course-card span{font-size:10px;font-weight:900;letter-spacing:.12em;color:#5846c7}.source-course-hero h1{margin:7px 0 5px;color:#20205c;font-size:32px}.source-course-hero p{margin:0;color:#657080;font-size:13px}.source-course-hero>b{display:grid;place-items:center;width:68px;height:68px;border-radius:20px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:20px}.source-course-card{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:14px;margin-top:16px;padding:18px;border:1px solid #e0e4f0;border-radius:20px;background:#fff;box-shadow:0 10px 25px rgba(46,38,120,.07)}.source-course-icon{display:grid;place-items:center;width:58px;height:58px;border-radius:17px;background:#eeeaff;color:#5544c4;font-size:13px;font-weight:900}.source-course-card h2{margin:5px 0 4px;font-size:19px;color:#20283d}.source-course-card p{margin:0;color:#647085;font-size:12px}.source-course-card small{display:block;margin-top:9px;color:#7b8492;font-size:10px}.source-course-frame{width:100%;min-height:calc(100dvh - 58px);margin:0;padding:0;overflow:hidden;background:#f4f6fb}.source-course-frame iframe{display:block;width:100%;height:calc(100dvh - 58px);min-height:620px;border:0;background:#f4f6fb}@media(max-width:640px){.source-course-card{grid-template-columns:auto minmax(0,1fr)}.source-course-card .btn{grid-column:1/-1;width:100%}.source-course-hero h1{font-size:27px}}`; document.head.appendChild(style);
})();
