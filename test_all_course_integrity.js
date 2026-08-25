const fs=require('fs'),vm=require('vm');
const ctx={window:{__admissionExtraCourses:[]}};vm.createContext(ctx);
for(const file of ['parts-of-speech-course-data.js','noun-course-data.js','voice-course-data.js','four-grammar-courses-data.js','mass-grammar-courses-data.js']){vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),ctx,{filename:file});}
const all=ctx.window.__admissionExtraCourses;if(all.length!==17)throw new Error('Expected 17 courses, got '+all.length);
const ids=new Set();for(const c of all){if(ids.has(c.id))throw new Error('duplicate course '+c.id);ids.add(c.id);if(!Array.isArray(c.lessons)||!Array.isArray(c.mcqs))throw new Error('invalid schema '+c.id);}
const mass=all.filter(c=>['pronoun-mastery','numbers-gender-mastery','sentence-mastery','tense-mastery','adverb-mastery','figure-of-speech-mastery','pinpoint-error-mastery','gerund-participle-infinitive-mastery','prepositions-mastery','articles-mastery'].includes(c.id));
if(mass.length!==10)throw new Error('mass count');
console.log('ALL COURSES:',all.length,'unique IDs');console.log('TOTAL LESSONS:',all.reduce((n,c)=>n+c.lessons.length,0));console.log('TOTAL MCQs:',all.reduce((n,c)=>n+c.mcqs.length,0));console.log('MASS PACK:',mass.reduce((n,c)=>n+c.mcqs.length,0),'MCQs /',mass.reduce((n,c)=>n+c.lessons.length,0),'lessons');
