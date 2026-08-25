const fs=require('fs'); const vm=require('vm');
const code=fs.readFileSync(__dirname+'/four-grammar-courses-data.js','utf8');
const ctx={window:{}}; vm.createContext(ctx); vm.runInContext(code,ctx);
const courses=ctx.window.__admissionGrammarCourses;
if(!Array.isArray(courses)||courses.length!==4) throw new Error('Expected 4 grammar courses');
const expected={
 'degree-comparison-mastery':[8,40,70],
 'subject-verb-agreement-mastery':[8,40,76],
 'same-word-parts-of-speech-mastery':[8,40,50],
 'right-form-of-verb-mastery':[8,40,60]
};
const allowed=['grammar-ladder','grammar-flow','grammar-table','grammar-compare','grammar-trap','grammar-formula','grammar-cards','grammar-radar','grammar-steps','grammar-map','grammar-score'];
for(const c of courses){
 if(!expected[c.id]) throw new Error('Unexpected id '+c.id);
 const [ls,ss,qs]=expected[c.id];
 if(c.lessons.length!==ls) throw new Error(`${c.id}: lessons ${c.lessons.length}`);
 if(c.lessons.reduce((n,l)=>n+l.slides.length,0)!==ss) throw new Error(`${c.id}: slides mismatch`);
 if(c.mcqs.length!==qs) throw new Error(`${c.id}: mcqs ${c.mcqs.length}`);
 const lessonIds=new Set(); const slideIds=new Set();
 for(const l of c.lessons){if(lessonIds.has(l.id))throw new Error('duplicate lesson '+l.id);lessonIds.add(l.id);for(const s of l.slides){if(!allowed.includes(s.visual))throw new Error('bad visual '+s.visual);if(slideIds.has(s.id))throw new Error('duplicate slide '+s.id);slideIds.add(s.id);}}
 for(const q of c.mcqs){if(!q.q||q.o.length!==4||q.a<0||q.a>3)throw new Error('bad mcq '+q.id);}
 console.log(`${c.id}: ${c.lessons.length} lessons / ${ss} visuals / ${qs} MCQs OK`);
}
console.log('TOTAL:',courses.reduce((n,c)=>n+c.mcqs.length,0),'MCQs');
