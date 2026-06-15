/* systems/colony.js — worker assignment, population growth, character skill trees. */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const C = CG.C, E = () => CG.Economy;

  function workersIn(s, job) { return s.survivors.filter((sv) => sv.job === job).length; }
  function slots(s, job) { const c = E().cache(s); return c.slots[job] || 0; }
  function slotsFree(s, job) { return slots(s, job) - workersIn(s, job); }
  function isUnlocked(s, job) { const c = E().cache(s); return !!c.unlockedJobs[job]; }

  function assign(s, sid, job) {
    const sv = CG.State.survivorById(s, sid); if (!sv) return { ok: false };
    // can't reassign someone who is away on an expedition
    if (s.regions.expeditions.some((ex) => ex.explorers.indexOf(sid) >= 0)) return { ok: false, why: 'On expedition' };
    if (job == null) { sv.job = null; E().recompute(s); CG.emit('assign_changed'); return { ok: true }; }
    if (!isUnlocked(s, job)) return { ok: false, why: 'Job locked' };
    if (sv.job !== job && slotsFree(s, job) <= 0) return { ok: false, why: 'No free slots' };
    sv.job = job; E().recompute(s); CG.emit('assign_changed'); return { ok: true };
  }

  // quick helper: add N workers to a job from the idle pool (UI +/- controls)
  function addToJob(s, job, n) {
    n = n || 1; let done = 0;
    for (let i = 0; i < n; i++) {
      if (slotsFree(s, job) <= 0) break;
      const idle = s.survivors.find((sv) => !sv.job && !onExp(s, sv.sid));
      if (!idle) break;
      idle.job = job; done++;
    }
    if (done) { E().recompute(s); CG.emit('assign_changed'); }
    return done;
  }
  function removeFromJob(s, job, n) {
    n = n || 1; let done = 0;
    for (let i = 0; i < n; i++) {
      const w = s.survivors.find((sv) => sv.job === job && !onExp(s, sv.sid));
      if (!w) break; w.job = null; done++;
    }
    if (done) { E().recompute(s); CG.emit('assign_changed'); }
    return done;
  }
  function onExp(s, sid) { return s.regions.expeditions.some((ex) => ex.explorers.indexOf(sid) >= 0); }

  function idleCount(s) { return s.survivors.filter((sv) => !sv.job && !onExp(s, sv.sid)).length; }

  // ---- population growth ----
  function attractiveness(s) {
    const c = E().cache(s);
    return 4 + c.add.attract + Math.max(0, (s.stats.morale - 50) * 0.2);
  }

  function popTick(s, dt) {
    s._popTimer = (s._popTimer || 0) + (dt || 1) / C.DAY_SECONDS; // counts in-game days
    if (s._popTimer < C.POP.checkEveryDays) return;
    s._popTimer = 0;
    const c = E().cache(s);
    const pop = s.survivors.length;
    if (c.housing <= pop) return;                 // need a free bed
    if (E().foodStock(s) < pop * 6) return;       // need a food cushion
    if ((s.resources.water || 0) < pop * 4) return;
    if (s.stats.morale < C.POP.moraleForGrowth) return;

    let chance = (s.stats.morale - 50) / 120 + attractiveness(s) * 0.015 + (c.housing - pop) * 0.02;
    chance *= c.mult.pop_growth;
    chance = CG.clamp(chance, 0, C.POP.maxChancePerCheck);
    if (CG.RNG.chance(chance)) addSettler(s, 'A new settler was drawn to your growing colony.');
  }

  // status of population growth, for a clear UI indicator ("reproduction" / newcomers)
  function growthStatus(s) {
    const c = E().cache(s); const pop = s.survivors.length;
    const freeBeds = Math.floor(c.housing) - pop;
    const foodOk = E().foodStock(s) >= pop * 6;
    const waterOk = (s.resources.water || 0) >= pop * 4;
    const moraleOk = s.stats.morale >= C.POP.moraleForGrowth;
    return { freeBeds, housingOk: freeBeds > 0, foodOk, waterOk, moraleOk, canGrow: freeBeds > 0 && foodOk && waterOk && moraleOk };
  }

  // one-click: spread idle workers across useful jobs (never unassigns anyone)
  const AUTO_PRIO = ['fish', 'water', 'forage', 'mine_stone', 'woodcut', 'hunt', 'farm', 'dig_clay', 'dig_sand',
    'sawmill', 'charcoal', 'kiln', 'smelt', 'tannery', 'ropewalk', 'weaver', 'bakery', 'blacksmith', 'glassworks', 'steelworks', 'build', 'research'];
  function autoAssignIdle(s, silent) {
    let assigned = 0, pass = true;
    while (pass && idleCount(s) > 0) {
      pass = false;
      for (const j of AUTO_PRIO) { if (idleCount(s) <= 0) break; if (slotsFree(s, j) > 0 && addToJob(s, j, 1)) { assigned++; pass = true; } }
    }
    if (assigned && !silent) CG.emit('toast', { text: 'Assigned ' + assigned + ' idle worker' + (assigned > 1 ? 's' : '') + '.', type: 'good', icon: '🧰' });
    return assigned;
  }

  // ---- automation (unlocked by mid-game buildings; deliberately modest) ----
  const AUTO_UNLOCK = { autoAssign: 'town_hall', autoExplore: 'expedition_camp', autoResearch: 'school' };
  function autoUnlocked(s, key) { return s.buildings.some((b) => b.id === AUTO_UNLOCK[key]); }
  function automationTick(s, dt) {
    const a = s.automation; if (!a) return;
    s._autoTimer = (s._autoTimer || 0) + (dt || 0.5) / C.DAY_SECONDS;
    if (s._autoTimer < 0.5) return;  // act roughly twice a day
    s._autoTimer = 0;
    // auto-explore first so it can reserve idle workers before auto-assign grabs them
    if (a.autoExplore && autoUnlocked(s, 'autoExplore') && !s.regions.expeditions.length) {
      const regs = CG.REGIONS.filter((r) => s.regions.explored[r.id]);
      if (regs.length) {
        s._autoRegIdx = ((s._autoRegIdx || 0) + 1) % regs.length;
        const idle = s.survivors.filter((x) => !x.job && !onExp(s, x.sid)).slice(0, 2).map((x) => x.sid);
        if (idle.length) CG.Exploration.start(s, regs[s._autoRegIdx].id, idle);
      }
    }
    if (a.autoAssign && autoUnlocked(s, 'autoAssign')) autoAssignIdle(s, true);
    if (a.autoResearch && autoUnlocked(s, 'autoResearch') && !s.tech.current) {
      const t = CG.Research.available(s).sort((x, y) => x.cost - y.cost)[0];
      if (t) CG.Research.setFocus(s, t.id);
    }
  }

  function addSettler(s, reason) {
    const sv = CG.State.makeSettler();
    s.survivors.push(sv);
    s.stats.settlersArrived++;
    s.stats.population = s.survivors.length;
    if (s.survivors.length > s.stats.peakPopulation) s.stats.peakPopulation = s.survivors.length;
    CG.State.log(s, (reason || 'A new settler arrived.') + ' Welcome, ' + sv.name + '!', 'good');
    CG.emit('toast', { text: sv.name + ' joined the colony! Assign them a job.', type: 'good', icon: '🧑' });
    CG.emit('population_changed');
    return sv;
  }

  // ---- character skill trees ----
  function canSpend(s, charId, skillId) {
    const ch = CG.CHAR[charId]; const sv = CG.State.namedSurvivor(s, charId);
    if (!ch || !sv) return false;
    const node = ch.skills.find((n) => n.id === skillId); if (!node) return false;
    if (sv.skills[skillId]) return false;
    if (sv.skillPoints < node.cost) return false;
    return (node.req || []).every((r) => sv.skills[r]);
  }
  function spendSkill(s, charId, skillId) {
    if (!canSpend(s, charId, skillId)) return { ok: false };
    const ch = CG.CHAR[charId]; const sv = CG.State.namedSurvivor(s, charId);
    const node = ch.skills.find((n) => n.id === skillId);
    sv.skillPoints -= node.cost; sv.skills[skillId] = true;
    CG.State.log(s, sv.name + ' learned ' + node.name + '.', 'good');
    CG.emit('toast', { text: sv.name + ' learned ' + node.name + '!', type: 'good', icon: node.icon });
    E().recompute(s); CG.emit('char_changed');
    return { ok: true };
  }

  CG.Colony = { workersIn, slots, slotsFree, isUnlocked, assign, addToJob, removeFromJob, idleCount, popTick, addSettler, attractiveness, canSpend, spendSkill, onExp, growthStatus, autoAssignIdle, automationTick, autoUnlocked };
})(typeof window !== 'undefined' ? window : globalThis);
