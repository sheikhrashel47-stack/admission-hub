/* Admission Hub · Reward Atelier · 101–150 · generated from user specification */
(() => {
  'use strict'
  const BATCH = 3
  const PREFIX = "rb3"
  const route = () => decodeURIComponent(`${location.hash || ''} ${document.body.className || ''}`).toLowerCase()
  const activeIds = () => new Set((document.body.dataset.bp200Active || '').split(',').filter(Boolean))
  const has = id => activeIds().has(id)
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector))
  const CLASS_MAP = {"reward-101":"rb3-101","reward-102":"rb3-102","reward-103":"rb3-103","reward-104":"rb3-104","reward-105":"rb3-105","reward-106":"rb3-106","reward-107":"rb3-107","reward-108":"rb3-108","reward-109":"rb3-109","reward-110":"rb3-110","reward-111":"rb3-111","reward-112":"rb3-112","reward-113":"rb3-113","reward-114":"rb3-114","reward-115":"rb3-115","reward-116":"rb3-116","reward-117":"rb3-117","reward-118":"rb3-118","reward-119":"rb3-119","reward-120":"rb3-120","reward-121":"rb3-121","reward-122":"rb3-122","reward-123":"rb3-123","reward-124":"rb3-124","reward-125":"rb3-125","reward-126":"rb3-126","reward-127":"rb3-127","reward-128":"rb3-128","reward-129":"rb3-129","reward-130":"rb3-130","reward-131":"rb3-131","reward-132":"rb3-132","reward-133":"rb3-133","reward-134":"rb3-134","reward-135":"rb3-135","reward-136":"rb3-136","reward-137":"rb3-137","reward-138":"rb3-138","reward-139":"rb3-139","reward-140":"rb3-140","reward-141":"rb3-141","reward-142":"rb3-142","reward-143":"rb3-143","reward-144":"rb3-144","reward-145":"rb3-145","reward-146":"rb3-146","reward-147":"rb3-147","reward-148":"rb3-148","reward-149":"rb3-149","reward-150":"rb3-150"}
  const SELECTORS = {"reward-101":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-102":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-103":".mistake-card,.mistake-item,[class*=\"mistake\"]","reward-104":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-105":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-106":".mistake-card,.mistake-item,[class*=\"mistake\"]","reward-107":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-108":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-109":".mistake-card,.mistake-item,[class*=\"mistake\"]","reward-110":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-111":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-112":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-113":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-114":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-115":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-116":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-117":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-118":".mistake-card,.mistake-item,[class*=\"mistake\"]","reward-119":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-120":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-121":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-122":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-123":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-124":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-125":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-126":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-127":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-128":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-129":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-130":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-131":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-132":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-133":".mistake-card,.mistake-item,[class*=\"mistake\"]","reward-134":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-135":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-136":".page,.topbar,.page-header,main","reward-137":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-138":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-139":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-140":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-141":".notes-tool,.notes-page,.note-card,[class*=\"note\"]","reward-142":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-143":".mistake-card,.mistake-item,[class*=\"mistake\"]","reward-144":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-145":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-146":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-147":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]","reward-148":".dashboard-v2,.p3-dashboard-v3,.chapter-card,.topic-card,.profile-card,.stat-card,[class*=\"dashboard\"]","reward-149":".mistake-card,.mistake-item,[class*=\"mistake\"]","reward-150":".question-card,.flash-card,.p3-qb-question-card,.review-card,.result-card,[class*=\"question\"]"}
  const NAMES = {"reward-101":"Signature Flash Deck","reward-102":"Elite Study Background","reward-103":"Priority Mistake Ladder","reward-104":"Elite Study Lift","reward-105":"High Value Topic Frame","reward-106":"Elite Review Modal","reward-107":"Prestige Completion Stamp","reward-108":"Elite Scoreboard Strip","reward-109":"Premium Mistake Search","reward-110":"Crowned Study Theme","reward-111":"Ultra Focus Timer","reward-112":"Elite Note Header","reward-113":"Recall Champion Ribbon","reward-114":"Elite Review Tabs","reward-115":"Prestige Progress Seal","reward-116":"Elite Question Spotlight","reward-117":"Elite Session Summary","reward-118":"Crowned Mistake Tag","reward-119":"Elite Profile Crest","reward-120":"Legendary Revision Pulse","reward-121":"Memory Anchor Tags","reward-122":"Vocabulary Quick Tap","reward-123":"Grammar Rule Cards","reward-124":"Word Pair Drill","reward-125":"Grammar Error Highlighter","reward-126":"Vocabulary Memory Ladder","reward-127":"Synonym Spotlight","reward-128":"Grammar Drill Timer","reward-129":"Micro Grammar Cards","reward-130":"Exam Word Bank","reward-131":"Grammar Pattern Map","reward-132":"Vocabulary Review Spiral","reward-133":"Grammar Fix Trail","reward-134":"Vocab Master Badge","reward-135":"Grammar Recall Cards","reward-136":"Word Pair Shuffle Pro","reward-137":"Grammar Rule Index","reward-138":"Vocabulary Heat Mark","reward-139":"Grammar Checklist Mode","reward-140":"Elite Vocab Frame","reward-141":"Study Notes Split View","reward-142":"Answer Mode Strip","reward-143":"Replay Mistake Card","reward-144":"Premium Topic Chips","reward-145":"Focus Streak Ladder","reward-146":"Elite Revision Filter","reward-147":"Elite Card Stack","reward-148":"Study Checklist Pro","reward-149":"Mistake Session Notes","reward-150":"Elite Revision Hub"}
  const IDS = ["reward-101","reward-102","reward-103","reward-104","reward-105","reward-106","reward-107","reward-108","reward-109","reward-110","reward-111","reward-112","reward-113","reward-114","reward-115","reward-116","reward-117","reward-118","reward-119","reward-120","reward-121","reward-122","reward-123","reward-124","reward-125","reward-126","reward-127","reward-128","reward-129","reward-130","reward-131","reward-132","reward-133","reward-134","reward-135","reward-136","reward-137","reward-138","reward-139","reward-140","reward-141","reward-142","reward-143","reward-144","reward-145","reward-146","reward-147","reward-148","reward-149","reward-150"]
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
