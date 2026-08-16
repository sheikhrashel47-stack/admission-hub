/* Admission Hub · Reward Atelier · 151–200 · generated from user specification */
(() => {
  'use strict'
  const BATCH = 4
  const PREFIX = "rb4"
  const route = () => decodeURIComponent(`${location.hash || ''} ${document.body.className || ''}`).toLowerCase()
  const activeIds = () => new Set((document.body.dataset.bp200Active || '').split(',').filter(Boolean))
  const has = id => activeIds().has(id)
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector))
  const CLASS_MAP = {"reward-151":"rb4-151","reward-152":"rb4-152","reward-153":"rb4-153","reward-154":"rb4-154","reward-155":"rb4-155","reward-156":"rb4-156","reward-157":"rb4-157","reward-158":"rb4-158","reward-159":"rb4-159","reward-160":"rb4-160","reward-161":"rb4-161","reward-162":"rb4-162","reward-163":"rb4-163","reward-164":"rb4-164","reward-165":"rb4-165","reward-166":"rb4-166","reward-167":"rb4-167","reward-168":"rb4-168","reward-169":"rb4-169","reward-170":"rb4-170","reward-171":"rb4-171","reward-172":"rb4-172","reward-173":"rb4-173","reward-174":"rb4-174","reward-175":"rb4-175","reward-176":"rb4-176","reward-177":"rb4-177","reward-178":"rb4-178","reward-179":"rb4-179","reward-180":"rb4-180","reward-181":"rb4-181","reward-182":"rb4-182","reward-183":"rb4-183","reward-184":"rb4-184","reward-185":"rb4-185","reward-186":"rb4-186","reward-187":"rb4-187","reward-188":"rb4-188","reward-189":"rb4-189","reward-190":"rb4-190","reward-191":"rb4-191","reward-192":"rb4-192","reward-193":"rb4-193","reward-194":"rb4-194","reward-195":"rb4-195","reward-196":"rb4-196","reward-197":"rb4-197","reward-198":"rb4-198","reward-199":"rb4-199","reward-200":"rb4-200"}
  const SELECTORS = {"reward-151":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-152":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-153":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-154":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-155":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-156":".mistake-card,.mistake-item,[class*=\"mistake\"]","reward-157":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-158":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-159":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-160":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-161":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-162":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-163":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-164":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-165":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-166":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-167":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-168":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-169":".page,.topbar,.page-header,main","reward-170":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-171":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-172":".mistake-card,.mistake-item,[class*=\"mistake\"]","reward-173":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-174":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-175":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-176":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-177":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-178":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-179":".page,.topbar,.page-header,main","reward-180":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-181":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-182":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-183":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-184":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-185":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-186":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-187":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-188":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-189":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-190":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-191":".mistake-card,.mistake-item,[class*=\"mistake\"]","reward-192":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-193":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-194":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-195":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-196":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-197":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-198":".mistake-card,.mistake-item,[class*=\"mistake\"]","reward-199":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-200":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]"}
  const NAMES = {"reward-151":"Hidden Revision Spark","reward-152":"Secret Study Phrase","reward-153":"Hidden Bookmark Trail","reward-154":"Secret Streak Pulse","reward-155":"Secret Chapter Marker","reward-156":"Secret Review Echo","reward-157":"Secret Note Whisper","reward-158":"Secret Draft Glow","reward-159":"Secret Progress Seal","reward-160":"Secret Session Echo Card","reward-161":"Daily Reset Glow","reward-162":"Minor Milestone Pop","reward-163":"Quick Reload Session","reward-164":"Session Snapshot Card","reward-165":"Bookmark Quickbar","reward-166":"Tiny Success Spark","reward-167":"Clean Revision List","reward-168":"Quick Progress Chip","reward-169":"Study Mode Accent","reward-170":"Fast Recall Badge","reward-171":"Elite Study Aura Badge","reward-172":"Ultimate Review Highlight","reward-173":"Diamond Card Halo","reward-174":"Premium Recall Counter","reward-175":"Elite Notes Index","reward-176":"Prestige Study Counter","reward-177":"Elite Chapter Navigator","reward-178":"Crowned Result Banner","reward-179":"Elite Focus Border","reward-180":"Mastery Crown Chip","reward-181":"Focus Flow Cards","reward-182":"Revision Snapshot Strip","reward-183":"Answer Rhythm Mode","reward-184":"Study Badge Gallery","reward-185":"High Priority Reminder Chip","reward-186":"Smart Task Pin","reward-187":"Revision Priority Strip","reward-188":"Focus Session End Card","reward-189":"Advanced Weak Topic Filter","reward-190":"Elite Reminder Bell","reward-191":"Premium Mistake Sorter","reward-192":"Masterclass Summary Card","reward-193":"Elite Study Frame Pack","reward-194":"Victory Streak Banner","reward-195":"Elite Recall Planner","reward-196":"Prestige Study Deck","reward-197":"Elite Chapter Seal Set","reward-198":"Master Revision Glow","reward-199":"Crowned Study Archive","reward-200":"Ultimate Admission Crest"}
  const IDS = ["reward-151","reward-152","reward-153","reward-154","reward-155","reward-156","reward-157","reward-158","reward-159","reward-160","reward-161","reward-162","reward-163","reward-164","reward-165","reward-166","reward-167","reward-168","reward-169","reward-170","reward-171","reward-172","reward-173","reward-174","reward-175","reward-176","reward-177","reward-178","reward-179","reward-180","reward-181","reward-182","reward-183","reward-184","reward-185","reward-186","reward-187","reward-188","reward-189","reward-190","reward-191","reward-192","reward-193","reward-194","reward-195","reward-196","reward-197","reward-198","reward-199","reward-200"]
  const host = () => document.querySelector('.page-header,.topbar,.dashboard-v2,.p3-dashboard-v3,.page') || document.body

  const addMarker = (id, text, selector) => {
    if (!has(id)) return
    const nodes = $$(selector || SELECTORS[id]).slice(0, 12)
    nodes.forEach(node => {
      node.classList.add(CLASS_MAP[id])
      node.dataset.rewardEffect = id
      node.title = `${NAMES[id]} active`
    })
  }

  const addRail = () => {
    const current = IDS.filter(has)
    if (!current.length || document.querySelector(`[data-reward-rail="${PREFIX}"]`)) return
    if (!/dashboard|question|notes|mistake|profile|flash|exam|mock|revision|vocab|dictionary|parser|study/.test(route())) return
    const rail = document.createElement('div')
    rail.dataset.rewardRail = PREFIX
    rail.className = `${PREFIX}-active-rail`
    rail.innerHTML = `<strong>${BATCH === 3 ? 'Reward Batch 101–150' : 'Reward Batch 151–200'}</strong><span>${current.length} active effects</span><small>Active rewards are applied to this study view</small>`
    host().prepend(rail)
  }

  const addReviewLauncher = () => {
    if (!has('reward-106') || document.querySelector('[data-reward-feature="reward-106"]')) return
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.rewardFeature = 'reward-106'
    button.className = 'rb3-review-launcher'
    button.textContent = '✦ Elite Review'
    button.addEventListener('click', () => {
      if (typeof window.navigate === 'function') window.navigate('revision')
      else location.hash = '#revision'
    })
    host().prepend(button)
  }

  const addMistakeSearch = () => {
    if (!has('reward-109') || !/mistake|error/.test(route()) || document.querySelector('[data-reward-feature="reward-109"]')) return
    const input = document.createElement('input')
    input.type = 'search'
    input.placeholder = 'Premium mistake search…'
    input.className = 'rb3-mistake-search'
    input.dataset.rewardFeature = 'reward-109'
    input.addEventListener('input', () => {
      const query = input.value.toLowerCase().trim()
      $$('.mistake-card,.mistake-item,[class*="mistake"]').forEach(card => { card.hidden = !!query && !card.textContent.toLowerCase().includes(query) })
    })
    host().prepend(input)
  }

  const addRevisionFilters = () => {
    if (!has('reward-146') || !/revision|mistake|question/.test(route()) || document.querySelector('[data-reward-feature="reward-146"]')) return
    const wrap = document.createElement('div')
    wrap.className = 'rb3-revision-filters'
    wrap.dataset.rewardFeature = 'reward-146'
    wrap.innerHTML = '<strong>Elite Revision Filter</strong><button type="button" data-filter="all">All</button><button type="button" data-filter="mistake">Mistakes</button><button type="button" data-filter="question">Questions</button>'
    wrap.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      const filter = button.dataset.filter
      $$('.mistake-card,.mistake-item,.question-card,.p3-qb-question-card').forEach(card => { card.hidden = filter !== 'all' && !card.className.toLowerCase().includes(filter) })
    }))
    host().prepend(wrap)
  }

  const addVocabQuickTools = () => {
    if (!/vocab|dictionary|word|grammar/.test(route())) return
    if (has('reward-122') && !document.querySelector('[data-reward-feature="reward-122"]')) {
      const button = document.createElement('button')
      button.type = 'button'; button.dataset.rewardFeature = 'reward-122'; button.className = 'rb3-vocab-quick'; button.textContent = '⚡ Quick Tap'
      button.addEventListener('click', () => document.querySelector('input,textarea')?.focus())
      host().prepend(button)
    }
    if (has('reward-139') && !document.querySelector('[data-reward-feature="reward-139"]')) {
      const badge = document.createElement('span'); badge.dataset.rewardFeature = 'reward-139'; badge.className = 'rb3-grammar-check'; badge.textContent = 'Grammar Checklist active'; host().prepend(badge)
    }
  }

  const addSecretSignal = () => {
    if (BATCH !== 4 || !/dashboard|study|revision|profile/.test(route()) || document.querySelector('[data-reward-feature="secret-reward-signal"]')) return
    const active = IDS.filter(has)
    if (!active.length) return
    const signal = document.createElement('span')
    signal.dataset.rewardFeature = 'secret-reward-signal'
    signal.className = 'rb4-secret-signal'
    signal.textContent = `✦ Secret collection active · ${active.length}`
    host().appendChild(signal)
  }

  const enhance = () => {
    IDS.forEach(id => { if (has(id)) { document.body.classList.add(CLASS_MAP[id]); addMarker(id, NAMES[id]) } else document.body.classList.remove(CLASS_MAP[id]) })
    addRail(); addReviewLauncher(); addMistakeSearch(); addRevisionFilters(); addVocabQuickTools(); addSecretSignal()
    if (has('reward-141')) $$('.notes-tool,.notes-page,.notes-editor').forEach(node => node.classList.add('rb3-split-notes'))
    if (has('reward-189')) $$('.topic-card,.chapter-card,[class*="topic"]').forEach(node => node.classList.add('rb4-weak-topic-filter'))
  }

  const style = document.createElement('style')
  style.dataset.rewardStyle = PREFIX
  style.textContent = `
    .${PREFIX}-active-rail{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0;padding:9px 12px;border-radius:14px;background:linear-gradient(135deg,rgba(15,107,79,.1),rgba(112,76,193,.11));border:1px solid rgba(15,107,79,.16);font-size:11px}
    .${PREFIX}-active-rail strong{color:#0f6b4f;font-size:12px} .${PREFIX}-active-rail span{font-weight:900;color:#704cc1} .${PREFIX}-active-rail small{color:#71837b}
    .rb3-review-launcher,.rb3-vocab-quick,.rb3-grammar-check,.rb3-mistake-search,.rb3-revision-filters,.rb4-secret-signal{font:inherit}
    .rb3-review-launcher,.rb3-vocab-quick{border:0;border-radius:12px;padding:9px 12px;margin:4px 0 8px;background:linear-gradient(135deg,#0f6b4f,#704cc1);color:white;font-weight:900;cursor:pointer}
    .rb3-mistake-search{display:block;width:min(100%,360px);margin:5px 0 10px;padding:10px 12px;border:1px solid rgba(15,107,79,.25);border-radius:12px;background:#fff;color:#18332a}
    .rb3-revision-filters{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:6px 0 10px;padding:8px 10px;border-radius:12px;background:rgba(112,76,193,.08)}
    .rb3-revision-filters strong{margin-right:auto;color:#704cc1;font-size:11px} .rb3-revision-filters button{border:0;border-radius:999px;padding:6px 9px;background:#fff;color:#5f746b;font-size:10px;font-weight:900;cursor:pointer}
    .rb3-grammar-check{display:inline-block;margin:5px;padding:6px 9px;border-radius:999px;background:#e8e0ff;color:#5439a3;font-size:10px;font-weight:900}
    .rb4-secret-signal{display:inline-block;margin:7px;padding:6px 9px;border-radius:999px;background:#fff2ce;color:#92703a;font-size:10px;font-weight:900}
    .rb3-split-notes{display:grid!important;grid-template-columns:minmax(0,1.4fr) minmax(160px,.6fr);gap:12px}
    .rb4-weak-topic-filter{outline:2px dashed rgba(236,72,153,.24);outline-offset:2px}
    body[class*="rb3-"] .${PREFIX}-active-rail{box-shadow:0 8px 22px rgba(15,107,79,.08)}
    body.rb3-reward-102,body.rb3-reward-110{background-image:linear-gradient(135deg,rgba(112,76,193,.04),rgba(15,107,79,.04))}
    body.rb4-reward-152,body.rb4-reward-158{background-image:radial-gradient(circle at 85% 8%,rgba(236,72,153,.08),transparent 34%)}
    [class*="rb3-reward-"],[class*="rb4-reward-"]{transition:box-shadow .18s ease,transform .18s ease,outline-color .18s ease}
    [class*="rb3-reward-"]:hover,[class*="rb4-reward-"]:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(15,107,79,.1)}
  `
  if (!document.head.querySelector(`[data-reward-style="${PREFIX}"]`)) document.head.appendChild(style)
  const observer = new MutationObserver(() => { clearTimeout(window[`__${PREFIX}Timer`]); window[`__${PREFIX}Timer`] = setTimeout(enhance, 60) })
  observer.observe(document.body, {childList:true, subtree:true})
  window.addEventListener('hashchange', () => setTimeout(enhance, 0))
  setInterval(enhance, 1400)
  enhance()
})()
