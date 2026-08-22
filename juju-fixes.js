/* Juju fixes: Inbox + focused Settings. Dashboard is intentionally untouched. */
(() => {
  'use strict';
  const inboxKey = 'admission_phase3_notifications';
  const prefKey = 'admission_phase3_notification_settings';
  const read = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return value == null ? fallback : value; } catch (_) { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };
  const escJ = value => typeof esc === 'function' ? esc(String(value ?? '')) : String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const categories = ['Study','Revision','Exam','Result','Streak','Progress','Achievement','System'];
  const inboxItems = () => Array.isArray(read(inboxKey, [])) ? read(inboxKey, []) : [];
  const saveInbox = items => write(inboxKey, items.slice(0, 100));
  const prefs = () => { const value = read(prefKey, {}); return Object.fromEntries(categories.map(c => [c, value[c] !== false])); };
  const renderInbox = () => {
    const items = inboxItems();
    const unread = items.filter(item => !item.read).length;
    const groups = ['All', ...categories];
    const html = `<div class="explorer-head"><div class="explorer-kicker">Juju Inbox</div><div class="explorer-title">Inbox</div><div class="explorer-subtitle">Exam, reward, progress এবং system-এর সব message এক জায়গায়।</div></div>
      <div class="card"><div class="row between"><b>${unread}টি unread message</b><button class="btn secondary sm" onclick="window.jujuMarkAllInboxRead()">সব read</button></div><div class="tabs" style="margin-top:12px">${groups.map((g,i)=>`<button class="tab ${i===0?'active':''}" onclick="window.jujuFilterInbox('${g}')">${g}</button>`).join('')}</div></div>
      <div id="jujuInboxList">${renderInboxList(items)}</div>`;
    renderShell(html, {title:'Inbox', back:"navigate('dashboard')"});
  };
  const renderInboxList = items => !items.length ? '<div class="card empty"><div class="ic">✉️</div><b>এখনও কোনো message নেই</b><div class="muted" style="margin-top:6px">Exam result বা reward event হলে এখানে দেখা যাবে।</div></div>' : items.map(item => `<article class="card ${item.read?'':'is-unread'}" style="border-left:4px solid ${item.read?'var(--line)':'var(--emerald)'}"><div class="row between"><span class="pill">${escJ(item.category || 'System')}</span><small class="muted">${item.createdAt ? new Date(item.createdAt).toLocaleString('bn-BD') : ''}</small></div><b style="display:block;margin-top:10px">${escJ(item.title || 'Message')}</b><p class="muted" style="line-height:1.55">${escJ(item.body || '')}</p><button class="btn ghost sm" onclick="window.jujuMarkInboxRead('${escJ(item.id)}')">${item.read?'Read':'Read now'}</button></article>`).join('');
  window.jujuFilterInbox = category => { const items = inboxItems(); const filtered = category === 'All' ? items : items.filter(x => x.category === category); const root = document.getElementById('jujuInboxList'); if (root) root.innerHTML = renderInboxList(filtered); };
  window.jujuMarkInboxRead = id => { saveInbox(inboxItems().map(item => item.id === id ? {...item, read:true} : item)); renderInbox(); };
  window.jujuMarkAllInboxRead = () => { saveInbox(inboxItems().map(item => ({...item, read:true}))); renderInbox(); };
  const renderJujuSettings = () => {
    const s = (window.CACHE && CACHE.settings) || {};
    const np = prefs();
    const save = async (key, value) => { if (!window.CACHE) return; CACHE.settings = {...CACHE.settings, [key]: value}; if (typeof dbPut === 'function') await dbPut('settings', CACHE.settings); };
    window.jujuSaveSetting = async (key, value) => { await save(key, value); if (typeof toast === 'function') toast('Setting saved'); };
    window.jujuToggleNotification = (key, value) => { const next = prefs(); next[key] = !!value; write(prefKey, next); renderJujuSettings(); };
    const toggle = (key, label, checked) => `<label class="listitem" style="cursor:pointer"><span>${label}</span><input type="checkbox" ${checked?'checked':''} onchange="window.jujuToggleNotification('${key}',this.checked)"></label>`;
    const html = `<div class="explorer-head"><div class="explorer-kicker">Juju Settings</div><div class="explorer-title">Settings</div><div class="explorer-subtitle">শুধু দরকারি setting এখানে রাখা হয়েছে।</div></div>
      <section class="card"><div class="row between"><b>Exam</b><button class="btn ghost sm" onclick="navigate('exam/setup')">Exam setup</button></div>${toggle('confirmSubmit','Submit করার আগে confirmation',s.confirmSubmit !== false)}${toggle('showExplanation','Result-এ explanation দেখাও',s.qPrefs?.showExplanation !== false)}${toggle('randomizeOpt','Option shuffle default',s.qPrefs?.randomizeOpt === true)}</section>
      <section class="card"><div class="row between"><b>Notifications</b><button class="btn ghost sm" onclick="navigate('notifications')">Inbox খুলুন</button></div>${categories.map(c=>toggle(c,c,np[c])).join('')}</section>
      <section class="card"><div class="row between"><div><b>Data safety</b><div class="muted" style="margin-top:5px">Answer local database-এ save হয়। Cache clear করলে answer মুছবে না।</div></div><span class="pill">Protected</span></div><button class="btn ghost" style="margin-top:12px" onclick="navigate('profile')">Profile & rewards</button></section>`;
    renderShell(html, {title:'Settings', back:"navigate('profile')"});
  };
  const oldRoute = window.__admissionRenderRoute;
  if (typeof oldRoute === 'function' && !oldRoute.__jujuRoute) {
    const route = function() { const path = String(window.Router?.path || location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard'); if (path === 'inbox' || path === 'notifications') return renderInbox(); if (path === 'settings') return renderJujuSettings(); return oldRoute.apply(this, arguments); };
    route.__jujuRoute = true; window.__admissionRenderRoute = route;
  }
  const oldRender = window.render;
  if (typeof oldRender === 'function' && !oldRender.__jujuRoute) {
    const render = function() { const path = String(window.Router?.path || location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard'); if (path === 'inbox' || path === 'notifications') return renderInbox(); if (path === 'settings') return renderJujuSettings(); return oldRender.apply(this, arguments); };
    render.__jujuRoute = true; window.render = render;
  }
  const bootRoute = () => {
    const path = String(location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard');
    if ((path === 'inbox' || path === 'notifications' || path === 'settings') && typeof window.__admissionRenderRoute === 'function') window.__admissionRenderRoute();
  };
  window.addEventListener('load', () => setTimeout(bootRoute, 0), { once: true });
  window.addEventListener('hashchange', () => setTimeout(bootRoute, 0));
  let bootAttempts = 0;
  const bootTimer = setInterval(() => {
    bootRoute();
    bootAttempts += 1;
    if (bootAttempts >= 40 || !/^(inbox|notifications|settings)$/.test(location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard')) clearInterval(bootTimer);
  }, 250);
  setTimeout(bootRoute, 0);
})();
