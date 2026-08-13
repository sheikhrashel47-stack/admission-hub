(() => {
  'use strict';
  const weekdays = ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];
  const months = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
  const digits = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
  function greeting(h) { if (h >= 4 && h < 6) return 'শুভ ভোর 🌅'; if (h < 12) return 'শুভ সকাল ☀️'; if (h < 15) return 'শুভ দুপুর 🌤️'; if (h < 17) return 'শুভ বিকাল 🌇'; if (h < 20) return 'শুভ সন্ধ্যা 🌆'; return 'শুভ রাত্রি 🌙'; }
  function clockText(d = new Date()) { let h=d.getHours(), m=d.getMinutes(); const period=h<4||h>=20?'রাত':h<6?'ভোর':h<12?'সকাল':h<15?'দুপুর':h<17?'বিকাল':'সন্ধ্যা'; const display=h%12||12; return `${weekdays[d.getDay()]}, ${digits(d.getDate())} ${months[d.getMonth()]} ${digits(d.getFullYear())} | ${period} ${digits(display)}:${digits(String(m).padStart(2,'0'))}`; }
  function update() { const root=document.querySelector('.dashboard-v2'); if (!root) return; const h1=root.querySelector('.dashboard-header h1'); const p=root.querySelector('.dashboard-header p'); const d=new Date(); if(h1)h1.textContent=greeting(d.getHours())+', Scholar'; if(p)p.textContent=clockText(d); }
  const previous = window.renderDashboard;
  if (typeof previous === 'function') { window.renderDashboard = function(){ const out=previous.apply(this,arguments); setTimeout(update,0); return out; }; }
  window.updateDashboardGreeting = update;
  setInterval(update, 60000);
  setTimeout(update, 0);
})();

(() => { let n=0; const reconcile=setInterval(() => { n++; if (document.querySelector('.dashboard-v2')) window.updateDashboardGreeting(); if (n >= 20) clearInterval(reconcile); }, 100); })();
