# Phase 1 QA Notes

Date: 2026-08-14.

The local app was tested in Chromium at a cache-busted URL. The updated HTML loads `phase1-reward-shop-2.js` after the existing modules, and `#rewards` renders the new `PHASE 1 · REWARD SHOP 2.0` view. The view shows XP, Gold, Diamond, and Owned wallet cards; Search rewards; rarity and category filters; rarity-styled cards; and a catalog count of 250 (150 existing rewards plus 100 new rewards). The six new category groups are represented by 17 Profile & Avatar, 17 UI & Theme, 17 Animation & Visual Effect, 16 Exam Effects, 17 Badges & Achievements, and 16 Sci-Fi / Legendary Special rewards.

Chromium initially displayed the legacy Reward Shop because the old `index.html` was cached. Opening `index.html?phase1=2#rewards` fetched the updated script order and confirmed the Phase 1 route. The browser console showed no Phase 1 runtime error; a pre-existing MCQ import IndexedDB timing warning appeared during boot and is unrelated to the Phase 1 files.

The Phase 1 extension currently keeps legacy catalog items, uses `CACHE.settings`/IndexedDB settings for backward-compatible persistence, and adds exactly-once event sources for exam and milestone rewards. The redundant per-click Flash Test reward branch was disabled so completed exams cannot double-award XP.

The cache-busted `#rewards` route renders Phase 1 correctly. The `#profile` route still showed the legacy Advanced Gamification profile after delayed reconciliation, so the profile route needs an explicit final route hook rather than relying only on the renderer wrapper. This is a routing-layer issue; no protected study modules were changed.

With the final cache-busted script and reconciliation hook, `#profile` renders `PROFILE · CURRENCY & ACHIEVEMENTS` with XP/Gold/Diamond current, earned, and spent totals, profile snapshot, badges, and equipped-reward sections. A browser-only QA seed through `window.__phase1Award` correctly produced 5,000 XP, 1,000 Gold, and 20 Diamonds using a unique source event; this did not modify repository files.

A filtered purchase of the new `Obsidian Dark Theme` successfully deducted 2,425 XP and recorded ownership in the persisted state (`xpBalance: 2575`, `totalXpSpent: 2425`, inventory contains `phase1-reward-018`). The success animation appeared, but a legacy route reconciliation could repaint stale wallet text afterward, so the buy/equip actions need a short final UI refresh safeguard. The underlying transaction state was correct and idempotent.
