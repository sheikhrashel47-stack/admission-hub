(function () {
  'use strict';
  const LS = { tg: 'admission_tg_v1', mem: 'admission_memorizing_v1', calc: 'admission_calc_v1', search: 'admission_search_v1', dict: 'admission_dict_v1' };
  const safeJson = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch (_) { return fallback; } };
  const saveJson = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };
  const escX = (v) => typeof esc === 'function' ? esc(String(v ?? '')) : String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const go = (p) => { if (typeof navigate === 'function') navigate(p); else location.hash = p; };
  const notify = (m) => typeof toast === 'function' ? toast(m) : window.alert(m);
  const now = () => Date.now();

  /* ================= TELEGRAM SYSTEM ================= */
  const TG_CATEGORIES = [
    ['study','Study reminder','পড়াশোনার রিমাইন্ডার'], ['important','Important notification','গুরুত্বপূর্ণ নোটিফিকেশন'],
    ['exam','Exam/result','পরীক্ষা ও ফলাফল'], ['revision','Revision reminder','রিভিশন রিমাইন্ডার'],
    ['progress','Progress/achievement','অগ্রগতি ও অর্জন'], ['system','System','সিস্টেম']
  ];
  const tgDefault = () => ({ 
    botToken:'8763547052:AAFrSKqUfLslaLCA_eYnE8PYeTmbOt6eMBY', 
    chatId:'8160600900', 
    connected:false, 
    categories:Object.fromEntries(TG_CATEGORIES.map(x => [x[0], true])), 
    sent:{} 
  });
  const tgLoad = () => { 
    const x = {...tgDefault(), ...safeJson(LS.tg, {})}; 
    x.categories = {...tgDefault().categories, ...(x.categories || {})}; 
    x.sent = x.sent || {}; 
    return x; 
  };
  let TG = tgLoad();
  function tgSave(){ saveJson(LS.tg, TG); }

  async function tgSend(category, title, body, dedupeKey, force = false){ 
    if (!force && (!TG.connected || TG.categories[category] === false)) return false; 
    if (!TG.botToken || !TG.chatId) return false;
    
    const key = `${category}:${dedupeKey}`; 
    if (!force && TG.sent[key]) return false; 

    try { 
      const text = `<b>${escX(title)}</b>\n\n${escX(body)}\n\n#${category}`; 
      const url = `https://api.telegram.org/bot${TG.botToken}/sendMessage`; 
      const r = await fetch(url, {
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body:JSON.stringify({chat_id:TG.chatId, text: text, parse_mode:'HTML'})
      }); 
      const d = await r.json().catch(()=>({})); 
      if (!r.ok || d.ok===false) throw Error(d.description || 'telegram'); 
      
      if (!force) {
        TG.sent[key] = now(); 
        const keys = Object.keys(TG.sent); 
        if (keys.length > 300) delete TG.sent[keys.sort((a,b)=>TG.sent[a]-TG.sent[b])[0]]; 
        tgSave();
      }
      return true; 
    } catch (e) { 
      console.warn('Telegram send failed:', e); 
      return false; 
    } 
  }
  window.admissionNotify = tgSend;

  window.connectTelegram = async function(){ 
    const token=document.getElementById('tgToken')?.value.trim(), chat=document.getElementById('tgChat')?.value.trim(); 
    if(!token||!chat){notify('Bot Token এবং Chat ID প্রয়োজন');return;} 
    TG.botToken=token; TG.chatId=chat; 
    tgSave();
    notify('Testing connection...'); 
    const ok = await tgSend('system', 'Admission Hub Connected', 'আপনার Telegram Notification System সফলভাবে চালু হয়েছে।', 'connect-' + Date.now(), true); 
    if(ok){ 
      TG.connected=true; 
      tgSave(); 
      notify('✓ Connected successfully!'); 
    } else { 
      notify('✖ Connection failed! Check Bot Token/Chat ID.'); 
    } 
    renderTelegram(); 
  };

  window.testTelegram = async function(){
    if(!TG.connected){notify('আগে Connect করুন');return;}
    notify('Sending test message...');
    const ok = await tgSend('system','Test Notification','This is a test notification from Admission Hub.', 'test-'+Date.now(), true);
    if(ok) notify('✓ Message sent!');
    else notify('✖ Failed to send message.');
  };

  window.disconnectTelegram = function(){
    if(confirm('Disconnect Telegram?')){
      TG.connected=false;
      tgSave();
      renderTelegram();
      notify('Disconnected');
    }
  };

  /* ================= DICTIONARY SYSTEM ================= */
  let DictState = { word: '', result: null, loading: false, suggestions: [] };

  async function translateText(text, target = 'bn') {
    try {
      const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`);
      const d = await r.json();
      return d?.[0]?.[0]?.[0] || text;
    } catch (_) { return text; }
  }

  async function fetchDictionary(word) {
    DictState.loading = true;
    DictState.word = word;
    renderDictionary();
    try {
      const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!r.ok) throw Error('Not found');
      const data = await r.json();
      const entry = data[0];
      
      const result = {
        word: entry.word,
        phonetic: entry.phonetic || entry.phonetics?.[0]?.text || '',
        pos: entry.meanings?.[0]?.partOfSpeech || '',
        definition: entry.meanings?.[0]?.definitions?.[0]?.definition || '',
        example: entry.meanings?.[0]?.definitions?.[0]?.example || '',
        synonyms: entry.meanings?.[0]?.synonyms?.slice(0, 5) || [],
        antonyms: entry.meanings?.[0]?.antonyms?.slice(0, 5) || []
      };

      // Get Bengali translations
      result.bnMeaning = await translateText(result.word, 'bn');
      result.bnDefinition = await translateText(result.definition, 'bn');
      if (result.example) result.bnExample = await translateText(result.example, 'bn');

      DictState.result = result;
    } catch (e) {
      DictState.result = { error: 'শব্দটি পাওয়া যায়নি।' };
    } finally {
      DictState.loading = false;
      renderDictionary();
    }
  }

  /* ================= WEB CHAT SYSTEM ================= */
  let WebState = { messages: [], loading: false };

  async function fetchGoogleSearch(query) {
    // Simulate Google Search via DuckDuckGo + Translation for reliability
    const isBn = /[\u0980-\u09FF]/.test(query);
    const searchQ = isBn ? await translateText(query, 'en') : query;
    
    try {
      const r = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(searchQ)}&format=json&no_html=1&skip_disambig=1`);
      const d = await r.json();
      
      let answer = d.AbstractText;
      let sources = [];
      
      if (d.AbstractURL) sources.push({ title: d.AbstractSource || 'Source', url: d.AbstractURL });
      
      if (!answer && d.RelatedTopics?.length) {
        answer = d.RelatedTopics[0].Text;
        if (d.RelatedTopics[0].FirstURL) sources.push({ title: 'Related Source', url: d.RelatedTopics[0].FirstURL });
      }

      if (answer && isBn) {
        answer = await translateText(answer, 'bn');
      }

      return { answer: answer || 'Google Search-এ নির্ভরযোগ্য পর্যাপ্ত তথ্য পাওয়া যায়নি।', sources };
    } catch (e) {
      return { answer: 'Search failed. Please try again.', sources: [] };
    }
  }

  window.askWebChat = async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const input = document.getElementById('webChatInput'), q = (input?.value || '').trim();
    if (!q || WebState.loading) return;
    
    WebState.messages.push({ role: 'user', text: q });
    WebState.loading = 'তথ্য সংগ্রহ করছি…';
    renderWebChat();
    
    const result = await fetchGoogleSearch(q);
    
    let html = `
      <div class="web-answer-v2">
        <div class="web-main-answer">${escX(result.answer)}</div>
        ${result.sources.length ? `
          <div class="web-sources-v2">
            <strong>Sources:</strong>
            ${result.sources.map(s => `<a href="${s.url}" target="_blank">${escX(s.title)} ↗</a>`).join('')}
          </div>
        ` : ''}
      </div>`;
      
    WebState.messages.push({ role: 'assistant', html: html });
    WebState.loading = false;
    renderWebChat();
    if (input) input.value = '';
  };

  /* ================= RENDERING ================= */
  function addStyles(){ 
    if (document.getElementById('admission-upgrade-styles')) return; 
    const s=document.createElement('style'); 
    s.id='admission-upgrade-styles'; 
    s.textContent=`
      .upgrade-hero{background:linear-gradient(135deg,#0f6b4f,#084b38);color:#fff;border:0;padding:20px;border-radius:18px;margin-bottom:16px}
      .tg-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 0;border-bottom:1px solid var(--line)}
      .tg-row:last-child{border-bottom:0}
      
      .dict-result-v2{margin-top:16px;animation:fadeUp 0.3s ease;}
      .dict-card-v2{background:#fff;border-radius:20px;padding:20px;border:1px solid var(--line);box-shadow:var(--shadow);}
      .dict-word{font-size:32px;font-weight:800;margin:0;color:var(--emerald-d);}
      .dict-phonetic{color:var(--sub);font-size:14px;margin-top:4px;}
      .dict-bn-meaning{font-size:20px;font-weight:700;color:var(--text);margin:16px 0 8px;}
      .dict-en-meaning{font-size:15px;color:var(--sub);line-height:1.5;margin-bottom:16px;}
      .dict-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;}
      .dict-item{background:var(--mint);padding:12px;border-radius:12px;}
      .dict-item strong{display:block;font-size:11px;text-transform:uppercase;color:var(--emerald-d);margin-bottom:4px;}
      .dict-item p{margin:0;font-size:14px;font-weight:600;}
      .dict-example{margin-top:16px;padding:14px;background:#f8fafc;border-radius:12px;border-left:4px solid var(--emerald);}
      
      .web-chat-v2{display:flex;flex-direction:column;gap:16px;}
      .web-message{padding:14px 18px;border-radius:18px;max-width:90%;line-height:1.6;}
      .web-message.user{align-self:flex-end;background:var(--emerald);color:#fff;border-bottom-right-radius:4px;}
      .web-message.assistant{align-self:flex-start;background:#fff;border:1px solid var(--line);border-bottom-left-radius:4px;box-shadow:var(--shadow);}
      .web-main-answer{font-size:16px;font-weight:500;color:var(--text);}
      .web-sources-v2{margin-top:12px;padding-top:10px;border-top:1px solid var(--line);font-size:12px;}
      .web-sources-v2 a{color:var(--emerald);margin-left:8px;text-decoration:none;font-weight:600;}
      
      .web-search-box-v2{position:sticky;bottom:0;background:var(--bg);padding:12px 0;display:flex;gap:8px;}
      .web-search-box-v2 textarea{flex:1;padding:12px 16px;border-radius:14px;border:1px solid var(--line);resize:none;height:48px;font-family:inherit;}
      .web-search-box-v2 button{width:48px;height:48px;border-radius:14px;background:var(--emerald);color:#fff;border:0;cursor:pointer;display:grid;place-items:center;}
    `; 
    document.head.appendChild(s); 
  }

  function renderTelegram(){ 
    const rows=TG_CATEGORIES.map(([id,en,bn])=>`<div class="tg-row"><div><b>${bn}</b><div class="upgrade-muted">${en}</div></div><button class="chip ${TG.categories[id]!==false?'active':''}" onclick="toggleTelegramCategory('${id}')">${TG.categories[id]!==false?'ON':'OFF'}</button></div>`).join(''); 
    shell(`
      <div class="explorer-head">
        <div class="explorer-title">Telegram Notifications</div>
        <p class="explorer-subtitle">সরাসরি Telegram Bot API ব্যবহার করে নোটিফিকেশন।</p>
      </div>
      <section class="upgrade-hero">
        <div class="row between">
          <div>
            <b>${TG.connected?'✓ Connected':'Not connected'}</b>
            <div style="opacity:.82;font-size:12px;margin-top:4px">${TG.chatId?'Chat ID: '+escX(TG.chatId):'Bot তথ্য দিয়ে Connect করুন'}</div>
          </div>
          <span style="font-size:28px">✈</span>
        </div>
      </section>
      <div class="card">
        ${input('tgToken','Bot Token','text',TG.botToken)}
        ${input('tgChat','Telegram Chat ID','text',TG.chatId)}
        <div class="row wrap" style="gap:8px;margin-top:16px">
          <button class="btn" onclick="connectTelegram()">Save & Connect</button>
          <button class="btn secondary sm" onclick="testTelegram()">Test Notification</button>
          <button class="btn danger sm" onclick="disconnectTelegram()">Disconnect</button>
        </div>
      </div>
      <div class="card">
        <h3 style="margin:0 0 12px">Notification categories</h3>
        ${rows}
      </div>`,{title:'Telegram',back:"navigate('settings')"}); 
  }

  function renderDictionary(){
    shell(`
      <div class="explorer-head">
        <div class="explorer-title">Smart Dictionary</div>
        <p class="explorer-subtitle">Google ও Oxford Dictionary থেকে নির্ভরযোগ্য তথ্য।</p>
      </div>
      <div class="card">
        <div class="row" style="gap:8px">
          <input type="text" id="dictInput" placeholder="Enter English word..." value="${escX(DictState.word)}" style="flex:1">
          <button class="btn sm" onclick="fetchDictionary(document.getElementById('dictInput').value)" ${DictState.loading?'disabled':''}>
            ${DictState.loading?'...':'Search'}
          </button>
        </div>
      </div>
      ${DictState.result ? `
        <div class="dict-result-v2">
          ${DictState.result.error ? `<div class="card" style="color:var(--red)">${DictState.result.error}</div>` : `
            <div class="dict-card-v2">
              <h2 class="dict-word">${escX(DictState.result.word)}</h2>
              <div class="dict-phonetic">${escX(DictState.result.phonetic)} • ${escX(DictState.result.pos)}</div>
              
              <div class="dict-bn-meaning">${escX(DictState.result.bnMeaning)}</div>
              <div class="dict-en-meaning">${escX(DictState.result.definition)}</div>
              
              <div class="dict-grid">
                <div class="dict-item"><strong>Synonyms</strong><p>${DictState.result.synonyms.join(', ') || '—'}</p></div>
                <div class="dict-item"><strong>Antonyms</strong><p>${DictState.result.antonyms.join(', ') || '—'}</p></div>
              </div>
              
              ${DictState.result.example ? `
                <div class="dict-example">
                  <strong>Example</strong>
                  <p>"${escX(DictState.result.example)}"</p>
                  <small style="display:block;margin-top:4px;color:var(--sub)">${escX(DictState.result.bnExample)}</small>
                </div>
              ` : ''}
            </div>
          `}
        </div>
      ` : ''}
    `, { title: 'Dictionary', back: "navigate('dashboard')" });
  }

  function renderWebChat(){
    const msgs = WebState.messages.map(m => `
      <div class="web-message ${m.role}">
        ${m.role === 'user' ? escX(m.text) : m.html}
      </div>
    `).join('');
    
    shell(`
      <div class="explorer-head">
        <div class="explorer-title">Web Chat</div>
        <p class="explorer-subtitle">Google Search থেকে সরাসরি তথ্য সংগ্রহ।</p>
      </div>
      <div class="web-chat-v2" id="webChatLog">
        ${msgs}
        ${WebState.loading ? `<div class="web-message assistant"><em>${escX(WebState.loading)}</em></div>` : ''}
      </div>
      <form class="web-search-box-v2" onsubmit="askWebChat(event)">
        <textarea id="webChatInput" placeholder="Ask anything..."></textarea>
        <button type="submit">${ICONS.arrow || '→'}</button>
      </form>
    `, { title: 'Web Chat', back: "navigate('dashboard')" });
    
    const log = document.getElementById('webChatLog');
    if (log) log.scrollTop = log.scrollHeight;
  }

  function shell(html, opts){ addStyles(); if (typeof renderShell === 'function') renderShell(html, opts || {}); else document.getElementById('app').innerHTML=html; }
  function input(id,label,type='text',value=''){ return `<label class="flabel">${label}</label><input id="${id}" type="${type}" value="${escX(value)}">`; }

  window.renderTelegram = renderTelegram;
  window.renderDictionary = renderDictionary;
  window.renderWebChat = renderWebChat;
  window.toggleTelegramCategory = function(id){ TG.categories[id]=!TG.categories[id]; tgSave(); renderTelegram(); };

  const oldRender=window.render; 
  window.render=function(){
    const p=(typeof Router!=='undefined'?Router.path:location.hash.slice(1))||'dashboard';
    if(p==='telegram') return renderTelegram();
    if(p==='web-chat') return renderWebChat();
    if(p==='dictionary') return renderDictionary();
    return oldRender();
  };
})();
