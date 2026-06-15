/* systems/research.js — tech selection & completion. Research points accumulate from
 * researchers; a focused tech auto-completes when affordable, or buy instantly. */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const E = () => CG.Economy;

  function done(s, id) { return !!s.tech.researched[id]; }
  function prereqsMet(s, t) { return (t.req || []).every((r) => done(s, r)); }

  function isVisible(s, t) {
    if (done(s, t.id)) return false;
    // visible if all prereqs are met, OR at least one prereq is met (so the tree previews)
    if (prereqsMet(s, t)) return true;
    return (t.req || []).some((r) => done(s, r));
  }
  function canResearch(s, t) { return !done(s, t.id) && prereqsMet(s, t); }

  function available(s) { return CG.TECH.filter((t) => canResearch(s, t)); }
  function visible(s) { return CG.TECH.filter((t) => isVisible(s, t)); }

  function setFocus(s, id) {
    const t = CG.TECHById[id]; if (!t || !canResearch(s, t)) return { ok: false };
    if (s.research >= t.cost) { return complete(s, id); }
    s.tech.current = id; CG.emit('research_changed');
    return { ok: true, focused: true };
  }

  function buyNow(s, id) {
    const t = CG.TECHById[id]; if (!t || !canResearch(s, t)) return { ok: false };
    if (s.research < t.cost) return { ok: false, why: 'Need more research' };
    return complete(s, id);
  }

  function complete(s, id) {
    const t = CG.TECHById[id];
    s.research -= t.cost;
    s.tech.researched[id] = true;
    if (s.tech.current === id) s.tech.current = null;
    s.stats.techResearched++;
    s.stats.techByCat[t.cat] = (s.stats.techByCat[t.cat] || 0) + 1;
    s.stats.researchSpent += t.cost;
    CG.State.log(s, 'Researched ' + t.name + '!', 'good');
    CG.emit('toast', { text: 'Researched: ' + t.name, type: 'tech', icon: t.icon });
    E().recompute(s);
    CG.emit('research_changed'); CG.emit('buildings_changed');
    return { ok: true };
  }

  function tick(s) {
    if (s.tech.current) {
      const t = CG.TECHById[s.tech.current];
      if (!t || done(s, t.id) || !prereqsMet(s, t)) { s.tech.current = null; return; }
      if (s.research >= t.cost) complete(s, s.tech.current);
    }
  }

  CG.Research = { available, visible, isVisible, canResearch, setFocus, buyNow, tick, done, prereqsMet };
})(typeof window !== 'undefined' ? window : globalThis);
