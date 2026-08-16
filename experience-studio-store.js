(() => {
  'use strict';

  const STORAGE_KEY = 'admissionHub.experienceStudio.v1';
  const TYPES = ['themes', 'animations', 'cards'];
  const TYPE_ALIASES = { theme: 'themes', themes: 'themes', animation: 'animations', animations: 'animations', card: 'cards', cards: 'cards' };
  const state = load();
  const hooks = { themes: null, animations: null, cards: null };
  const clone = (value) => JSON.parse(JSON.stringify(value));

  function baseState() {
    return {
      version: 1,
      purchased: { themes: [], animations: [], cards: [] },
      active: { themes: null, animations: null, cards: null },
      updatedAt: 0
    };
  }

  function normalize(raw) {
    const next = baseState();
    if (!raw || typeof raw !== 'object') return next;
    TYPES.forEach((type) => {
      const purchased = Array.isArray(raw.purchased?.[type]) ? raw.purchased[type] : [];
      next.purchased[type] = [...new Set(purchased.map((id) => String(id)).filter(Boolean))];
      const active = raw.active?.[type];
      next.active[type] = active === null || active === undefined ? null : String(active);
      if (next.active[type] && !next.purchased[type].includes(next.active[type])) next.active[type] = null;
    });
    next.updatedAt = Number(raw.updatedAt || 0);
    return next;
  }

  function load() {
    try { return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')); } catch (_) { return baseState(); }
  }

  function save() {
    state.updatedAt = Date.now();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
    window.dispatchEvent(new CustomEvent('experience-studio-state-change', { detail: clone(state) }));
  }

  function typeKey(type) {
    const key = TYPE_ALIASES[String(type || '').toLowerCase()];
    return key || null;
  }

  function listFor(type) {
    const key = typeKey(type);
    return key ? state.purchased[key] : [];
  }

  function catalogFor(type) {
    const key = typeKey(type);
    if (key === 'themes') return Array.isArray(window.ExperienceStudioThemes) ? window.ExperienceStudioThemes : [];
    if (key === 'animations') return Array.isArray(window.ExperienceStudioAnimations) ? window.ExperienceStudioAnimations : [];
    if (key === 'cards') return Array.isArray(window.ExperienceStudioCards) ? window.ExperienceStudioCards : [];
    return [];
  }

  function findItem(type, id) {
    return catalogFor(type).find((item) => String(item.id) === String(id)) || null;
  }

  function currencyPath(currency) {
    const normalized = String(currency || 'XP').toUpperCase();
    if (normalized === 'XP') return { object: window.CACHE?.settings, key: 'xpBalance' };
    if (normalized === 'GOLD') {
      if (typeof window.CACHE?.game?.gold === 'number') return { object: window.CACHE.game, key: 'gold' };
      return { object: window.CACHE?.settings, key: 'gold' };
    }
    if (normalized === 'DIAMOND' || normalized === 'DIAMONDS') {
      if (typeof window.CACHE?.game?.diamonds === 'number') return { object: window.CACHE.game, key: 'diamonds' };
      return { object: window.CACHE?.settings, key: 'diamonds' };
    }
    return { object: window.CACHE?.settings, key: 'xpBalance' };
  }

  function balance(currency) {
    const path = currencyPath(currency);
    return Number(path.object?.[path.key] || 0);
  }

  async function persistCurrency(currency, object) {
    try {
      if (typeof window.dbPut === 'function' && object === window.CACHE?.settings) await window.dbPut('settings', object);
      if (typeof window.dbPut === 'function' && object === window.CACHE?.game) await window.dbPut('game', object);
      if (typeof window.persistSettings === 'function' && object === window.CACHE?.settings) await window.persistSettings(object);
    } catch (_) {}
  }

  function register(type, hook) {
    const key = typeKey(type);
    if (!key || !hook || typeof hook !== 'object') return;
    hooks[key] = hook;
  }

  async function purchase(type, id) {
    const key = typeKey(type);
    const item = findItem(key, id);
    if (!key || !item) return { ok: false, reason: 'missing-item' };
    if (state.purchased[key].includes(String(item.id))) return { ok: false, reason: 'already-owned', item };
    const price = Math.max(0, Number(item.price || 0));
    const currency = String(item.currency || 'XP').toUpperCase();
    const path = currencyPath(currency);
    if (price > 0 && (!path.object || balance(currency) < price)) return { ok: false, reason: 'insufficient-funds', item, balance: balance(currency), currency, price };
    if (price > 0) {
      path.object[path.key] = balance(currency) - price;
      await persistCurrency(currency, path.object);
    }
    state.purchased[key].push(String(item.id));
    save();
    return { ok: true, item, balance: balance(currency), currency, price };
  }

  function apply(type, id) {
    const key = typeKey(type);
    const stringId = String(id);
    if (!key || !state.purchased[key].includes(stringId)) return { ok: false, reason: 'not-owned' };
    state.active[key] = stringId;
    save();
    hooks[key]?.apply?.(findItem(key, stringId));
    return { ok: true, item: findItem(key, stringId) };
  }

  function remove(type) {
    const key = typeKey(type);
    if (!key) return { ok: false, reason: 'invalid-type' };
    const previous = state.active[key];
    state.active[key] = null;
    save();
    hooks[key]?.remove?.(previous);
    return { ok: true, previous };
  }

  function isPurchased(type, id) {
    const key = typeKey(type);
    return Boolean(key && state.purchased[key].includes(String(id)));
  }

  function isActive(type, id) {
    const key = typeKey(type);
    return Boolean(key && state.active[key] === String(id));
  }

  window.ExperienceStudioStore = {
    key: STORAGE_KEY,
    types: TYPES.slice(),
    snapshot: () => clone(state),
    catalog: catalogFor,
    findItem,
    balance,
    purchase,
    apply,
    remove,
    register,
    isPurchased,
    isActive,
    resetLocalState: () => { const fresh = baseState(); TYPES.forEach((type) => { state.purchased[type] = fresh.purchased[type]; state.active[type] = fresh.active[type]; }); save(); }
  };

  window.addEventListener('experience-studio-state-request', () => window.dispatchEvent(new CustomEvent('experience-studio-state-response', { detail: clone(state) })));
})();
