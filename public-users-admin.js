/* Control panel: public-product user list. Token stays in sessionStorage only. */
(() => {
  'use strict';
  if (window.__ahPublicUsersAdmin) return;
  window.__ahPublicUsersAdmin = true;
  const WORKER = 'https://admission-gk.admissionhub.workers.dev';
  const tokenKey = 'ahAdminToken';
  const tok = () => { try { return sessionStorage.getItem(tokenKey) || ''; } catch (_) { return ''; } };
  const api = async (path, body) => {
    const res = await fetch(WORKER + '/api' + path, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok() },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || ('http-' + res.status));
    return data;
  };
  const mount = async () => {
    const app = document.getElementById('app');
    const path = String(location.hash.replace(/^#\/?/, '').split('?')[0] || '');
    if (path !== 'settings' || !app) return;
    if (app.querySelector('#ah-admin-users')) return;
    const page = app.querySelector('.page');
    if (!page) return;
    page.insertAdjacentHTML('beforeend', `<section class="card" id="ah-admin-users"><b>Public students</b>
      <p class="muted" style="margin:8px 0;font-size:12px">শুধু অ্যাডমিন। টোকেন এই ট্যাবেই থাকে।</p>
      <input id="ahAdminTok" class="input" type="password" placeholder="Admin token" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:12px;font-size:16px">
      <button class="btn sm" type="button" id="ahAdminLoad" style="margin-top:10px">ইউজার লিস্ট</button>
      <div id="ahAdminList" style="margin-top:12px"></div></section>`);
    document.getElementById('ahAdminTok').value = tok();
    document.getElementById('ahAdminLoad').onclick = async () => {
      try {
        sessionStorage.setItem(tokenKey, document.getElementById('ahAdminTok').value.trim());
        const data = await api('/admin/users');
        const users = data.users || [];
        document.getElementById('ahAdminList').innerHTML = `<div class="muted" style="font-size:12px;margin-bottom:8px">${users.length} users</div>` +
          users.map(u => `<div style="padding:8px 0;border-bottom:1px solid var(--line);font-size:13px"><b>${u.name || '—'}</b> · ${u.contact || u.id}<br><span class="muted">${u.status || 'active'} · exams ${u.exams || 0} · mistakes ${u.mistakes || 0}</span>
            <div class="row" style="gap:6px;margin-top:6px">
              <button class="btn ghost sm" data-st="active" data-id="${u.id}">Active</button>
              <button class="btn ghost sm" data-st="disabled" data-id="${u.id}">Disable</button>
              <button class="btn ghost sm" data-st="suspended" data-id="${u.id}">Suspend</button>
            </div></div>`).join('');
        document.getElementById('ahAdminList').onclick = async (ev) => {
          const btn = ev.target.closest('button[data-st]');
          if (!btn) return;
          try { await api('/admin/status', { id: btn.dataset.id, status: btn.dataset.st }); if (window.toast) toast('আপডেট হয়েছে'); } catch (e) { if (window.toast) toast(String(e.message || e)); }
        };
      } catch (e) { if (window.toast) toast(String(e.message || e)); }
    };
  };
  const orig = window.renderSettings;
  if (typeof orig === 'function') window.renderSettings = function () { const r = orig.apply(this, arguments); setTimeout(mount, 0); return r; };
  window.addEventListener('hashchange', () => setTimeout(mount, 80));
})();
