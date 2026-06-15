/* systems/events.js — fires dynamic events on a fair cadence. Choice events pause for the
 * player via a modal (s.events.pending); passive events auto-resolve. Consumes CG.EVENTS. */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const C = CG.C;

  function eligible(s, ev) {
    const st = s.stats.stage;
    if (ev.minStage && st < ev.minStage) return false;
    if (ev.maxStage && st > ev.maxStage) return false;
    if (ev.oneShot && s.events.oneShot[ev.id]) return false;
    const cd = s.events.cooldowns[ev.id];
    if (cd && s.time.day < cd) return false;
    if (typeof ev.condition === 'function') { try { if (!ev.condition(s)) return false; } catch (e) { return false; } }
    return true;
  }

  function due(s) {
    if (s.events.pending) return false;
    const gap = s._nextEventGap || (s._nextEventGap = CG.RNG.range(C.EVENTS.minGapDays, C.EVENTS.maxGapDays));
    return s.time.day - s.events.lastEventDay >= gap;
  }

  function maybeFire(s) {
    if (!due(s)) return;
    const pool = (CG.EVENTS || []).filter((ev) => eligible(s, ev));
    if (!pool.length) { s.events.lastEventDay = s.time.day; s._nextEventGap = CG.RNG.range(C.EVENTS.minGapDays, C.EVENTS.maxGapDays); return; }
    const ev = CG.RNG.weighted(pool, (e) => e.weight || 1);
    fire(s, ev);
  }

  function fire(s, ev) {
    s.events.lastEventDay = s.time.day;
    s._nextEventGap = CG.RNG.range(C.EVENTS.minGapDays, C.EVENTS.maxGapDays);
    if (ev.oneShot) s.events.oneShot[ev.id] = true;
    if (ev.cooldownDays) s.events.cooldowns[ev.id] = s.time.day + ev.cooldownDays;
    if (!s.events.seen[ev.id]) s.stats.eventsSeen++;
    s.events.seen[ev.id] = (s.events.seen[ev.id] || 0) + 1;
    s.stats.eventsByCat[ev.category] = (s.stats.eventsByCat[ev.category] || 0) + 1;
    s.events.history.unshift({ id: ev.id, day: s.time.day }); if (s.events.history.length > 60) s.events.history.length = 60;

    if (ev.choices && ev.choices.length) {
      s.events.pending = { id: ev.id };
      CG.emit('event_modal', { event: ev });
    } else {
      CG.applyOutcomes(s, ev.effects || []);
      CG.State.log(s, '📜 ' + ev.name + ': ' + ev.desc, ev.category === 'danger' ? 'bad' : 'info');
      CG.emit('toast', { text: ev.icon + ' ' + ev.name, type: ev.category === 'danger' ? 'bad' : 'info' });
      bookkeep(s, ev);
    }
  }

  function chooseOption(s, idx) {
    const pend = s.events.pending; if (!pend) return;
    const ev = (CG.EVENTS || []).find((e) => e.id === pend.id); if (!ev) { s.events.pending = null; return; }
    const ch = ev.choices[idx]; if (!ch) return;
    if (ch.cost && !CG.Economy.canAfford(s, ch.cost)) { CG.emit('toast', { text: 'You cannot afford that choice.', type: 'bad' }); return { ok: false }; }
    if (ch.cost) CG.Economy.payCost(s, ch.cost);
    CG.applyOutcomes(s, ch.effects || []);
    s.stats.choicesMade++;
    s.events.pending = null;
    CG.State.log(s, '📜 ' + ev.name + ' — ' + (ch.result || ch.text), 'info');
    bookkeep(s, ev);
    CG.emit('event_resolved', { id: ev.id, choice: idx, result: ch.result });
    return { ok: true, result: ch.result };
  }

  function bookkeep(s, ev) {
    if (ev.category === 'weather' && /storm/i.test(ev.name)) s.stats.stormsSurvived++;
    if (/drought/i.test(ev.name)) s.stats.droughtSurvived++;
    if (/disease|outbreak|sick|fever|plague/i.test(ev.name)) s.stats.diseasesCured++;
    CG.emit('resources_changed'); CG.emit('population_changed');
  }

  CG.Events = { maybeFire, fire, chooseOption, eligible };
})(typeof window !== 'undefined' ? window : globalThis);
