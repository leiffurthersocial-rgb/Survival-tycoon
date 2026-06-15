/* systems/exploration.js — expeditions: unlock regions, haul resources, find rares & discoveries. */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const C = CG.C, E = () => CG.Economy;

  const TOOL_TECH = ['toolmaking', 'blacksmithing', 'metallurgy', 'machining'];
  function toolsLevel(s) { let n = 0; TOOL_TECH.forEach((t) => { if (s.tech.researched[t]) n++; }); return n; }

  function explored(s, id) { return !!s.regions.explored[id]; }
  function activeOn(s, id) { return s.regions.expeditions.some((ex) => ex.region === id); }

  function prereqsMet(s, R) {
    const req = R.requires || {};
    if (req.region) for (const r of req.region) if (!explored(s, r)) return false;
    if (req.tools && toolsLevel(s) < req.tools) return false;
    return true;
  }
  function canExplore(s, id) {
    const R = CG.REGION[id]; if (!R) return false;
    if (activeOn(s, id)) return false;
    return prereqsMet(s, R);
  }

  function expeditionTime(s, R) {
    const c = E().cache(s);
    return Math.max(8, R.baseTime / c.mult.explore_speed);
  }

  function start(s, regionId, explorerIds) {
    const R = CG.REGION[regionId]; if (!R) return { ok: false };
    if (!canExplore(s, regionId)) return { ok: false, why: 'Cannot reach yet' };
    explorerIds = (explorerIds || []).filter((id) => {
      const sv = CG.State.survivorById(s, id);
      return sv && !CG.Colony.onExp(s, id);
    });
    if (!explorerIds.length) return { ok: false, why: 'Select at least one explorer' };
    // unassign explorers from jobs while away
    explorerIds.forEach((id) => { const sv = CG.State.survivorById(s, id); if (sv) sv.job = null; });
    const ex = { eid: CG.uid('ex'), region: regionId, explorers: explorerIds.slice(), progress: 0, total: expeditionTime(s, R), first: !explored(s, regionId) };
    s.regions.expeditions.push(ex);
    s.stats.expeditionsRun++;
    CG.State.log(s, 'Expedition set out for ' + R.name + ' (' + explorerIds.length + ' explorer' + (explorerIds.length > 1 ? 's' : '') + ').', 'info');
    E().recompute(s); CG.emit('explore_changed'); CG.emit('assign_changed');
    return { ok: true };
  }

  function recall(s, eid) {
    const i = s.regions.expeditions.findIndex((ex) => ex.eid === eid); if (i < 0) return;
    const ex = s.regions.expeditions[i];
    s.regions.expeditions.splice(i, 1);
    CG.State.log(s, 'Expedition to ' + CG.REGION[ex.region].name + ' was recalled early.', 'info');
    E().recompute(s); CG.emit('explore_changed'); CG.emit('assign_changed');
  }

  function tick(s, dt) {
    if (!s.regions.expeditions.length) return;
    const c = E().cache(s);
    for (let i = s.regions.expeditions.length - 1; i >= 0; i--) {
      const ex = s.regions.expeditions[i];
      const R = CG.REGION[ex.region];
      // supplies consumed from stores
      const n = ex.explorers.length;
      const f = dt / C.DAY_SECONDS;
      E().addRes(s, 'fish', -C.EXPLORE.baseFoodCostPerDay * n * c.mult.expedition_cost * f * 0.5);
      E().addRes(s, 'fruit', -C.EXPLORE.baseFoodCostPerDay * n * c.mult.expedition_cost * f * 0.5);
      E().addRes(s, 'water', -C.EXPLORE.baseWaterCostPerDay * n * c.mult.expedition_cost * f);

      ex.progress += dt;
      if (ex.progress >= ex.total) finish(s, ex, i);
    }
  }

  function finish(s, ex, idx) {
    s.regions.expeditions.splice(idx, 1);
    const R = CG.REGION[ex.region];
    const c = E().cache(s);
    const n = ex.explorers.length;
    const firstTime = !explored(s, ex.region);

    // resource haul
    const totalUnits = n * (3 + R.distance) * (firstTime ? 1.6 : 1.0);
    const haul = {};
    const pool = R.resources.slice();
    for (let i = 0; i < Math.ceil(totalUnits); i++) {
      const r = CG.RNG.pick(pool);
      const amt = CG.RNG.range(0.6, 1.4);
      const added = E().addRes(s, r, amt);
      if (added > 0) { haul[r] = (haul[r] || 0) + added; s.stats.totalGathered[r] = (s.stats.totalGathered[r] || 0) + added; }
    }
    // rare finds
    const rareChance = C.EXPLORE.rareBaseChance + c.add.rare_chance;
    (R.rare || []).forEach((r) => {
      if (CG.RNG.chance(rareChance)) {
        const amt = CG.RNG.int(1, 3);
        const added = E().addRes(s, r, amt);
        if (added > 0) { haul[r] = (haul[r] || 0) + added; s.stats.raresFound++; CG.emit('toast', { text: 'Rare find: ' + CG.fmt(added) + ' ' + CG.resName(r) + '!', type: 'good', icon: CG.resIcon(r) }); }
      }
    });

    // risk: a mild, non-lethal setback
    const mitig = Math.min(0.6, c.add.rare_chance * 0.5);
    if (CG.RNG.chance(Math.max(0, R.risk - mitig))) {
      const victim = CG.State.survivorById(s, CG.RNG.pick(ex.explorers));
      if (victim) { victim.health = CG.clamp(victim.health - CG.RNG.int(10, 22), 1, 100); CG.State.log(s, victim.name + ' was hurt during the expedition to ' + R.name + '.', 'bad'); }
    }

    // unlock on first exploration
    if (firstTime) {
      s.regions.explored[ex.region] = true;
      s.stats.regionsExplored = Object.keys(s.regions.explored).length;
      CG.State.log(s, 'Discovered ' + R.name + '! ' + R.flavor, 'good');
      CG.emit('toast', { text: 'New region discovered: ' + R.name + '!', type: 'good', icon: R.icon });
      CG.emit('region_explored', { id: ex.region });
    } else {
      CG.State.log(s, 'Expedition returned from ' + R.name + '.', 'info');
    }

    const haulStr = Object.keys(haul).map((r) => CG.resIcon(r) + CG.fmt(haul[r])).join('  ');
    if (haulStr) CG.State.log(s, 'Brought back: ' + haulStr, 'info');
    CG.emit('explore_changed'); CG.emit('assign_changed'); CG.emit('population_changed');
  }

  function list(s) {
    return CG.REGIONS.map((R) => ({
      def: R, explored: explored(s, R.id), active: s.regions.expeditions.find((e) => e.region === R.id) || null,
      can: canExplore(s, R.id), prereq: prereqsMet(s, R), time: expeditionTime(s, R),
    }));
  }

  CG.Exploration = { toolsLevel, explored, canExplore, start, recall, tick, list, expeditionTime };
})(typeof window !== 'undefined' ? window : globalThis);
