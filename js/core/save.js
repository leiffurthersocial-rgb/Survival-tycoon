/* core/save.js — localStorage saves (auto + 3 slots), export/import, settings. */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const C = CG.C;
  const SLOTS = ['auto', 's1', 's2', 's3'];

  function keyFor(slot) { return C.SAVE_KEY + '_' + slot; }
  function ls() { try { return root.localStorage; } catch (e) { return null; } }

  function serialize(s) {
    const copy = {};
    for (const k in s) { if (k === '_cache') continue; copy[k] = s[k]; }
    return JSON.stringify(copy);
  }

  function save(s, slot) {
    slot = slot || 'auto';
    const store = ls(); if (!store) return { ok: false, why: 'No storage' };
    try {
      s._savedAt = Date.now();
      store.setItem(keyFor(slot), serialize(s));
      CG.emit('saved', { slot });
      return { ok: true };
    } catch (e) { return { ok: false, why: String(e) }; }
  }

  function rawLoad(slot) {
    const store = ls(); if (!store) return null;
    const txt = store.getItem(keyFor(slot)); if (!txt) return null;
    try { return JSON.parse(txt); } catch (e) { return null; }
  }

  function migrate(s) {
    // ensure forward-compat with new fields without crashing old saves
    const fresh = CG.State.newGame();
    const merged = Object.assign({}, fresh, s);
    merged.stats = Object.assign(CG.State.makeStats(), s.stats || {});
    merged.settings = Object.assign(CG.State.defaultSettings(), s.settings || {});
    merged.tech = s.tech || merged.tech;
    merged.regions = s.regions || merged.regions;
    merged.quests = Object.assign({ active: [], completed: {}, progress: {}, offered: {} }, s.quests || {});
    merged.achievements = Object.assign({ unlocked: {} }, s.achievements || {});
    merged.events = Object.assign({ lastEventDay: 1, seen: {}, cooldowns: {}, oneShot: {}, pending: null, history: [] }, s.events || {});
    // ensure every named hero exists (lets older saves gain heroes added later)
    CG.CHARS.forEach((ch) => {
      if (!merged.survivors.some((x) => x.charId === ch.id)) {
        const nv = CG.State.makeNamedSurvivor(ch.id);
        merged.survivors.push(nv);
        CG.State.log(merged, ch.name + ' has joined your colony!', 'good');
      }
    });
    merged._cache = null;
    return merged;
  }

  function load(slot) {
    const data = rawLoad(slot); if (!data) return null;
    const s = migrate(data);
    CG.Economy.recompute(s);
    return s;
  }

  function exists(slot) { return !!rawLoad(slot); }
  function remove(slot) { const store = ls(); if (store) store.removeItem(keyFor(slot)); CG.emit('saved', { slot }); }

  function meta(slot) {
    const d = rawLoad(slot); if (!d) return null;
    return {
      slot, day: (d.time && d.time.day) || 1, pop: (d.survivors || []).length,
      stage: (d.stats && d.stats.stage) || 1, stageName: C.STAGE_NAMES[(d.stats && d.stats.stage) || 1],
      playtime: (d.stats && d.stats.playtime) || 0, savedAt: d._savedAt || d.createdAt || 0,
      victory: !!d.victory, name: d.name || 'Colony',
    };
  }
  function allMeta() { return SLOTS.map(meta); }

  function exportSave(s) {
    try { return root.btoa(unescape(encodeURIComponent(serialize(s)))); } catch (e) { return serialize(s); }
  }
  function importSave(text) {
    let json = text;
    try { json = decodeURIComponent(escape(root.atob(text.trim()))); } catch (e) { /* maybe raw json */ }
    let data; try { data = JSON.parse(json); } catch (e) { return null; }
    const s = migrate(data); CG.Economy.recompute(s); return s;
  }

  // settings persisted independently so menu reflects them before a game loads
  function saveSettings(settings) { const store = ls(); if (store) try { store.setItem(C.SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {} }
  function loadSettings() { const store = ls(); if (!store) return CG.State.defaultSettings(); try { return Object.assign(CG.State.defaultSettings(), JSON.parse(store.getItem(C.SETTINGS_KEY) || '{}')); } catch (e) { return CG.State.defaultSettings(); } }

  CG.Save = { save, load, exists, remove, meta, allMeta, exportSave, importSave, saveSettings, loadSettings, SLOTS };
})(typeof window !== 'undefined' ? window : globalThis);
