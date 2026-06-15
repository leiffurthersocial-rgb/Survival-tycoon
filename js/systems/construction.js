/* systems/construction.js — building availability, build queue, upgrades, demolish, placement. */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const C = CG.C, E = () => CG.Economy;

  function techDone(s, id) { return !!s.tech.researched[id]; }
  function regionDone(s, id) { return !!s.regions.explored[id]; }
  function hasBuilding(s, id) { return s.buildings.some((b) => b.id === id); }
  function countBuilding(s, id) { return s.buildings.filter((b) => b.id === id).length; }

  // Is the building unlocked (requirements met), ignoring affordability?
  function unlocked(s, def) {
    const r = def.requires || {};
    if (r.startUnlocked) { /* always */ }
    if (r.tech) for (const t of r.tech) if (!techDone(s, t)) return false;
    if (r.region) for (const rg of r.region) if (!regionDone(s, rg)) return false;
    if (r.building) for (const b of r.building) if (!hasBuilding(s, b)) return false;
    if (r.stage && s.stats.stage < r.stage) return false;
    return true;
  }

  function isUnique(def) { return def.id === 'grand_monument'; }

  function canBuildNew(s, def) {
    if (!unlocked(s, def)) return false;
    if (isUnique(def) && (hasBuilding(s, def.id) || queued(s, def.id))) return false;
    return true;
  }

  function queued(s, id) { return s.queue.some((q) => q.bid === id && !q.isUpgrade); }

  function effCost(s, baseCost) {
    const c = E().cache(s);
    const m = c.mult.build_cost;
    const out = {};
    for (const k in baseCost) out[k] = Math.max(1, Math.ceil(baseCost[k] * m));
    return out;
  }

  function upgradeCost(s, b) {
    const D = CG.BLD[b.id];
    const factor = Math.pow(D.upCostMult, b.level);
    const base = {};
    for (const k in D.cost) base[k] = Math.ceil(D.cost[k] * factor);
    return effCost(s, base);
  }

  // ---- list for UI ----
  function buildMenu(s) {
    return CG.BUILDINGS.filter((d) => unlocked(s, d)).map((d) => ({
      def: d,
      cost: effCost(s, d.cost),
      built: countBuilding(s, d.id),
      canNew: canBuildNew(s, d),
      affordable: E().canAfford(s, effCost(s, d.cost)),
    }));
  }

  // ---- enqueue new ----
  function build(s, id) {
    const D = CG.BLD[id]; if (!D) return { ok: false, why: 'unknown' };
    if (!canBuildNew(s, D)) return { ok: false, why: 'locked' };
    if (s.queue.length >= C.BUILD.maxQueue) return { ok: false, why: 'Queue full' };
    const cost = effCost(s, D.cost);
    if (!E().canAfford(s, cost)) return { ok: false, why: 'Not enough resources', missing: E().missing(s, cost) };
    E().payCost(s, cost);
    const c = E().cache(s);
    s.queue.push({ qid: CG.uid('q'), bid: id, isUpgrade: false, uid: null, targetLevel: 1, progress: 0, total: D.buildTime, paid: cost });
    CG.State.log(s, 'Started building ' + D.name + '.', 'info');
    E().recompute(s); CG.emit('queue_changed');
    return { ok: true };
  }

  // ---- enqueue upgrade ----
  function upgrade(s, uid) {
    const b = CG.State.buildingById(s, uid); if (!b) return { ok: false };
    const D = CG.BLD[b.id];
    if (b.level >= D.maxLevel) return { ok: false, why: 'Max level' };
    if (s.queue.some((q) => q.uid === uid)) return { ok: false, why: 'Already upgrading' };
    if (s.queue.length >= C.BUILD.maxQueue) return { ok: false, why: 'Queue full' };
    const cost = upgradeCost(s, b);
    if (!E().canAfford(s, cost)) return { ok: false, why: 'Not enough resources', missing: E().missing(s, cost) };
    E().payCost(s, cost);
    const total = D.buildTime * Math.pow(D.upTimeMult, b.level);
    s.queue.push({ qid: CG.uid('q'), bid: b.id, isUpgrade: true, uid: uid, targetLevel: b.level + 1, progress: 0, total: total, paid: cost });
    CG.State.log(s, 'Started upgrading ' + D.name + ' to level ' + (b.level + 1) + '.', 'info');
    CG.emit('queue_changed');
    return { ok: true };
  }

  function cancel(s, qid) {
    const i = s.queue.findIndex((q) => q.qid === qid); if (i < 0) return;
    const q = s.queue[i];
    // refund the unspent portion fully (resources committed, work not done)
    if (q.paid) for (const k in q.paid) E().addRes(s, k, q.paid[k], false);
    s.queue.splice(i, 1);
    CG.State.log(s, 'Cancelled ' + CG.BLD[q.bid].name + ' and recovered materials.', 'info');
    E().recompute(s); CG.emit('queue_changed');
  }

  function moveQueue(s, qid, dir) {
    const i = s.queue.findIndex((q) => q.qid === qid); if (i < 0) return;
    const j = i + dir; if (j < 0 || j >= s.queue.length) return;
    const t = s.queue[i]; s.queue[i] = s.queue[j]; s.queue[j] = t; CG.emit('queue_changed');
  }

  function demolish(s, uid) {
    const i = s.buildings.findIndex((b) => b.uid === uid); if (i < 0) return;
    const b = s.buildings[i]; const D = CG.BLD[b.id];
    // refund a fraction of total invested
    let factor = 1; for (let l = 1; l < b.level; l++) factor += Math.pow(D.upCostMult, l);
    for (const k in D.cost) E().addRes(s, k, Math.floor(D.cost[k] * factor * C.BUILD.refundPct), false);
    s.buildings.splice(i, 1);
    s.stats.demolitions++;
    CG.State.log(s, 'Demolished ' + D.name + ' and salvaged some materials.', 'info');
    E().recompute(s); CG.emit('buildings_changed'); CG.emit('population_changed');
  }

  // ---- placement on the island map (deterministic zones by category) ----
  const ZONES = {
    survival: { cx: 50, cy: 78, rx: 26, ry: 9 },
    storage: { cx: 22, cy: 70, rx: 14, ry: 8 },
    production: { cx: 76, cy: 66, rx: 18, ry: 12 },
    housing: { cx: 32, cy: 50, rx: 20, ry: 12 },
    industry: { cx: 70, cy: 44, rx: 20, ry: 12 },
    civic: { cx: 50, cy: 36, rx: 22, ry: 9 },
    trade: { cx: 50, cy: 90, rx: 30, ry: 5 },
    special: { cx: 50, cy: 22, rx: 18, ry: 7 },
  };
  function place(s, b) {
    const D = CG.BLD[b.id]; const z = ZONES[D.cat] || ZONES.production;
    // spread within zone using index so buildings don't overlap
    const n = s.buildings.filter((x) => CG.BLD[x.id].cat === D.cat).length;
    const ang = n * 2.399963; // golden angle
    const rad = 0.35 + 0.6 * ((n % 7) / 7);
    b.x = CG.clamp(z.cx + Math.cos(ang) * z.rx * rad, 5, 95);
    b.y = CG.clamp(z.cy + Math.sin(ang) * z.ry * rad, 16, 94);
  }

  // ---- progress tick ----
  function tick(s, dt) {
    if (!s.queue.length) return;
    const c = E().cache(s);
    const builders = (c.workersByJob['build'] || []);
    if (!builders.length) return;
    let power = 0; builders.forEach((w) => (power += E().workerEff(w)));
    power *= C.BUILD.builderSpeed * c.mult.build_speed * c.moraleMult;
    let remaining = power * dt;

    // focus the front of the queue
    while (remaining > 0 && s.queue.length) {
      const q = s.queue[0];
      const need = q.total - q.progress;
      const apply = Math.min(need, remaining);
      q.progress += apply; remaining -= apply;
      if (q.progress >= q.total - 1e-6) complete(s, q); else break;
    }
  }

  function complete(s, q) {
    s.queue.shift();
    const D = CG.BLD[q.bid];
    if (q.isUpgrade) {
      const b = CG.State.buildingById(s, q.uid);
      if (b) { b.level = q.targetLevel; s.stats.buildingUpgrades++; CG.State.log(s, D.name + ' upgraded to level ' + b.level + '!', 'good'); CG.emit('toast', { text: D.name + ' → Level ' + b.level, type: 'good', icon: D.icon }); }
    } else {
      const b = { uid: CG.uid('b'), id: q.bid, level: 1, builtDay: s.time.day };
      place(s, b);
      s.buildings.push(b);
      s.stats.buildingsBuilt++;
      s.stats.buildingsByType[q.bid] = (s.stats.buildingsByType[q.bid] || 0) + 1;
      CG.State.log(s, D.name + ' is complete!', 'good');
      CG.emit('toast', { text: D.name + ' built!', type: 'good', icon: D.icon });
      if (D.effects.some((e) => e.type === 'victory')) CG.emit('victory_built');
    }
    E().recompute(s);
    CG.emit('buildings_changed'); CG.emit('population_changed'); CG.emit('queue_changed');
  }

  CG.Construction = { unlocked, canBuildNew, build, upgrade, cancel, moveQueue, demolish, tick, buildMenu, effCost, upgradeCost, countBuilding };
})(typeof window !== 'undefined' ? window : globalThis);
