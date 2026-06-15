/* systems/quests.js — auto-activates quests whose prerequisites are met, tracks objectives
 * against live state/stats, and grants rewards on completion. Consumes CG.QUESTS. */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const E = () => CG.Economy;

  function completed(s, id) { return !!s.quests.completed[id]; }
  function active(s, id) { return s.quests.active.indexOf(id) >= 0; }

  function requiresMet(s, q) {
    const r = q.requires || {};
    if (r.quest) for (const qq of r.quest) if (!completed(s, qq)) return false;
    if (r.stage && s.stats.stage < r.stage) return false;
    if (r.flag) for (const f of r.flag) if (!s.flags[f]) return false;
    if (r.region) for (const rg of r.region) if (!s.regions.explored[rg]) return false;
    return true;
  }

  function shouldOffer(s, q) {
    if (completed(s, q) || active(s, q.id)) return false;
    if (q.hidden && !s.quests.offered[q.id] && !(q.requires && q.requires.flag)) {
      // hidden quests only surface once their flag/offer is set
      return requiresMet(s, q) && (s.quests.offered[q.id] || (q.requires && q.requires.flag));
    }
    return requiresMet(s, q);
  }

  function refresh(s) {
    (CG.QUESTS || []).forEach((q) => { if (shouldOffer(s, q)) activate(s, q); });
  }
  function activate(s, q) {
    if (active(s, q.id) || completed(s, q.id)) return;
    s.quests.active.push(q.id);
    if (!q.hidden) { CG.State.log(s, '🎯 New objective: ' + q.name, 'quest'); CG.emit('toast', { text: 'New Quest: ' + q.name, type: 'quest', icon: q.icon || '🎯' }); }
    CG.emit('quests_changed');
  }

  // ---- objective evaluation ----
  function maxBuildingLevel(s, id) { let m = 0; s.buildings.forEach((b) => { if (b.id === id && b.level > m) m = b.level; }); return m; }
  function evalObj(s, o) {
    let cur = 0, target = o.amt != null ? o.amt : (o.level != null ? o.level : 1), done = false, label = o.label || '';
    switch (o.type) {
      case 'have_res': cur = Math.floor(E().amountOf(s, o.res)); target = o.amt; label = label || ('Have ' + o.amt + ' ' + CG.resName(o.res)); break;
      case 'total_res': cur = Math.floor((s.stats.totalProduced[o.res] || 0)); target = o.amt; label = label || ('Produce ' + o.amt + ' ' + CG.resName(o.res)); break;
      case 'coin': cur = Math.floor(s.coin); target = o.amt; label = label || ('Have ' + o.amt + ' coin'); break;
      case 'research_have': cur = Math.floor(s.research); target = o.amt; label = label || ('Bank ' + o.amt + ' research'); break;
      case 'build': cur = o.building ? CG.Construction.countBuilding(s, o.building) : s.stats.buildingsBuilt; target = o.amt || 1; label = label || ('Build ' + (o.amt || 1) + ' ' + (o.building ? CG.BLD[o.building].name : 'building')); break;
      case 'building_level': cur = maxBuildingLevel(s, o.building); target = o.level; label = label || ((CG.BLD[o.building] ? CG.BLD[o.building].name : o.building) + ' to level ' + o.level); break;
      case 'population': cur = s.survivors.length; target = o.amt; label = label || ('Reach ' + o.amt + ' population'); break;
      case 'tech': cur = s.stats.techResearched; target = o.amt; label = label || ('Research ' + o.amt + ' technologies'); break;
      case 'tech_id': cur = s.tech.researched[o.id] ? 1 : 0; target = 1; label = label || ('Research ' + (CG.TECHById[o.id] ? CG.TECHById[o.id].name : o.id)); break;
      case 'explore_region': cur = s.regions.explored[o.id] ? 1 : 0; target = 1; label = label || ('Explore ' + (CG.REGION[o.id] ? CG.REGION[o.id].name : o.id)); break;
      case 'explore_count': cur = s.stats.regionsExplored; target = o.amt; label = label || ('Explore ' + o.amt + ' regions'); break;
      case 'job_workers': cur = CG.Colony.workersIn(s, o.job); target = o.amt; label = label || ('Assign ' + o.amt + ' ' + CG.jobName(o.job)); break;
      case 'stage': cur = s.stats.stage; target = o.stage; label = label || ('Reach Stage ' + o.stage); break;
      case 'event_seen': cur = s.events.seen[o.id] ? 1 : 0; target = 1; label = label || 'Witness an event'; break;
      case 'flag': cur = s.flags[o.key] ? 1 : 0; target = 1; label = label || 'Complete a discovery'; break;
      case 'char_level': { const sv = CG.State.namedSurvivor(s, o.charId); cur = sv ? sv.level : 0; target = o.level; label = label || ((CG.CHAR[o.charId] ? CG.CHAR[o.charId].name : o.charId) + ' to level ' + o.level); break; }
      case 'settlers': cur = s.stats.settlersArrived; target = o.amt; label = label || ('Welcome ' + o.amt + ' settlers'); break;
      case 'expeditions': cur = s.stats.expeditionsRun; target = o.amt; label = label || ('Run ' + o.amt + ' expeditions'); break;
      case 'morale': cur = Math.floor(s.stats.morale); target = o.amt; label = label || ('Reach ' + o.amt + ' morale'); break;
      default: cur = 0; target = 1; break;
    }
    done = cur >= target;
    return { cur, target, done, label };
  }

  function progress(s, q) {
    const objs = q.objectives.map((o) => evalObj(s, o));
    return { objs, done: objs.every((o) => o.done) };
  }

  function tick(s) {
    refresh(s);
    for (let i = s.quests.active.length - 1; i >= 0; i--) {
      const id = s.quests.active[i];
      const q = (CG.QUESTS || []).find((x) => x.id === id); if (!q) { s.quests.active.splice(i, 1); continue; }
      if (progress(s, q).done) finish(s, q, i);
    }
  }

  function finish(s, q, idx) {
    s.quests.active.splice(idx, 1);
    s.quests.completed[q.id] = true;
    s.stats.questsCompleted++;
    CG.applyOutcomes(s, q.rewards || []);
    if (q.flag) { s.flags[q.flag] = true; s.stats.flags[q.flag] = true; }
    (q.next || []).forEach((n) => { s.quests.offered[n] = true; });
    CG.State.log(s, '✅ Quest complete: ' + q.name + (q.reward_text ? ' — ' + q.reward_text : ''), 'quest');
    CG.emit('toast', { text: 'Quest complete: ' + q.name, type: 'quest', icon: q.icon || '✅' });
    CG.emit('quests_changed');
  }

  CG.Quests = { tick, refresh, progress, evalObj, requiresMet, completed };
})(typeof window !== 'undefined' ? window : globalThis);
