/* systems/economy.js — derived-value engine + production/consumption tick.
 * recompute(s) folds every effect source (buildings*level, tech, characters, buffs)
 * into a cache. tick(s,dt) runs gather/refine/research production with worker efficiency,
 * morale and energy factored in. Also resource add/spend with storage caps.
 */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const C = CG.C;

  // base stations available with no buildings (so the colony can act & plan from day one)
  const BASE_SLOTS = { forage: 2, water: 2, fish: 2, mine_stone: 2, dig_sand: 2, build: 4, research: 1 };

  function freshCache() {
    return {
      mult: { global_prod: 1, tool_quality: 1, refine: 1, storage: 1, build_speed: 1, build_cost: 1,
        explore_speed: 1, hunt_success: 1, research: 1, xp: 1, trade_price: 1, heal: 1, pop_growth: 1, expedition_cost: 1 },
      jobMult: {}, resMult: {}, needMult: { hunger: 1, thirst: 1, energy: 1, health: 1 },
      add: { rare_chance: 0, trade_volume: 0, attract: 0, food_variety: 0, foresight: 0 },
      moraleBonus: 0, housing: 0, storageAll: 0, storageSpecific: {}, passiveRes: {},
      slots: {}, unlockedJobs: {}, workersByJob: {},
      stationAdds: {}, victoryBuilding: false,
    };
  }

  function mMul(c, key, m) { c.mult[key] = (c.mult[key] || 1) * m; }
  function jMul(c, job, m) { c.jobMult[job] = (c.jobMult[job] || 1) * m; }
  function rMul(c, res, m) { c.resMult[res] = (c.resMult[res] || 1) * m; }

  function applyEffect(c, e, lvlScale) {
    const L = lvlScale || 1;
    const scM = (m) => 1 + (m - 1) * L;     // multiplicative effect grows with building level
    const scA = (a) => a * L;
    switch (e.type) {
      case 'global_prod': mMul(c, 'global_prod', scM(e.mult)); break;
      case 'tool_quality': mMul(c, 'tool_quality', scM(e.mult)); break;
      case 'refine_mult': mMul(c, 'refine', scM(e.mult)); break;
      case 'storage_mult': mMul(c, 'storage', scM(e.mult)); break;
      case 'build_speed': mMul(c, 'build_speed', scM(e.mult)); break;
      case 'build_cost': mMul(c, 'build_cost', scM(e.mult)); break;
      case 'explore_speed': mMul(c, 'explore_speed', scM(e.mult)); break;
      case 'hunt_success': mMul(c, 'hunt_success', scM(e.mult)); break;
      case 'research_mult': mMul(c, 'research', scM(e.mult)); break;
      case 'xp_mult': mMul(c, 'xp', scM(e.mult)); break;
      case 'trade_price': mMul(c, 'trade_price', scM(e.mult)); break;
      case 'heal_rate': mMul(c, 'heal', scM(e.mult)); break;
      case 'pop_growth': mMul(c, 'pop_growth', scM(e.mult)); break;
      case 'expedition_cost': mMul(c, 'expedition_cost', e.mult); break;
      case 'prod_mult': jMul(c, e.job, scM(e.mult)); break;
      case 'res_mult': rMul(c, e.res, scM(e.mult)); break;
      case 'need_rate': c.needMult[e.need] = (c.needMult[e.need] || 1) * scM(e.mult); break;
      case 'rare_chance': c.add.rare_chance += scA(e.add); break;
      case 'trade_volume': c.add.trade_volume += scA(e.amt); break;
      case 'attract': c.add.attract += scA(e.amt); break;
      case 'food_variety': c.add.food_variety += scA(e.amt); break;
      case 'foresight': c.add.foresight += scA(e.amt); break;
      case 'morale': c.moraleBonus += scA(e.amt); break;
      case 'storage_add': c.storageSpecific[e.res] = (c.storageSpecific[e.res] || 0) + scA(e.amt); break;
      case 'passive_res': c.passiveRes[e.res] = (c.passiveRes[e.res] || 0) + e.amt * (1 + 0.8 * (L - 1)); break;
      case 'station_add': c.stationAdds[e.job] = (c.stationAdds[e.job] || 0) + (e.slots || 1); break;
      case 'unlock_job': c.unlockedJobs[e.job] = true; break;
      case 'victory': c.victoryBuilding = true; break;
      default: break;
    }
  }

  function recompute(s) {
    const c = freshCache();

    // base slots
    Object.keys(BASE_SLOTS).forEach((j) => (c.slots[j] = BASE_SLOTS[j]));

    // buildings (scaled by level)
    s.buildings.forEach((b) => {
      const D = CG.BLD[b.id]; if (!D) return;
      const L = b.level, lm = 1 + 0.8 * (L - 1), p = D.provides || {};
      if (p.housing) c.housing += p.housing * lm;
      if (p.morale) c.moraleBonus += p.morale * lm;
      if (p.storageAll) c.storageAll += p.storageAll * lm;
      if (p.storage) for (const k in p.storage) c.storageSpecific[k] = (c.storageSpecific[k] || 0) + p.storage[k] * lm;
      (p.stations || []).forEach((st) => {
        c.slots[st.job] = (c.slots[st.job] || 0) + st.slots + Math.max(0, L - 1);
      });
      (D.effects || []).forEach((e) => applyEffect(c, e, L));
    });

    // tech (no level scaling)
    for (const tid in s.tech.researched) {
      const t = CG.TECHById[tid]; if (t) t.effects.forEach((e) => applyEffect(c, e, 1));
    }

    // character bonuses (present, alive named survivors)
    s.survivors.forEach((sv) => {
      if (!sv.charId || sv.health <= 0) return;
      const ch = CG.CHAR[sv.charId];
      CG.charEffects(ch, sv.level, sv.skills).forEach((e) => applyEffect(c, e, 1));
    });

    // starting faction bonus
    if (s.faction && CG.FACTIONS && CG.FACTIONS[s.faction]) CG.FACTIONS[s.faction].effects.forEach((e) => applyEffect(c, e, 1));

    // active buffs (events)
    const today = s.time.day;
    s.buffs = s.buffs.filter((b) => b.endsDay > today || b.permanent);
    s.buffs.forEach((b) => {
      if (b.stat === 'global_prod') mMul(c, 'global_prod', b.mult);
      else if (b.stat === 'explore') mMul(c, 'explore_speed', b.mult);
      else if (b.stat === 'research') mMul(c, 'research', b.mult);
      else if (b.stat === 'trade_price') mMul(c, 'trade_price', b.mult);
      else if (b.stat === 'morale') c.moraleBonus += (b.amt || 0);
      else if (b.stat && b.stat.indexOf('job:') === 0) jMul(c, b.stat.slice(4), b.mult);
      else if (b.stat && b.stat.indexOf('res:') === 0) rMul(c, b.stat.slice(4), b.mult);
    });

    // station adds (from character skills etc.)
    for (const j in c.stationAdds) c.slots[j] = (c.slots[j] || 0) + c.stationAdds[j];

    // unlocked jobs = any job with slots, or base-unlocked
    CG.JOBS.forEach((j) => {
      if (j.baseUnlocked) c.unlockedJobs[j.id] = true;
      if ((c.slots[j.id] || 0) > 0) c.unlockedJobs[j.id] = true;
    });

    // group workers by job
    s.survivors.forEach((sv) => {
      if (sv.job) (c.workersByJob[sv.job] = c.workersByJob[sv.job] || []).push(sv);
    });

    // teachers boost xp
    const teachers = (c.workersByJob['teach'] || []).length;
    if (teachers) mMul(c, 'xp', 1 + 0.06 * teachers);

    // storage caps
    c.cap = {};
    CG.RESOURCES.forEach((r) => {
      if (r.nocap) return;
      const base = C.START.baseStorage + c.storageAll + (c.storageSpecific[r.id] || 0);
      c.cap[r.id] = Math.floor(base * c.mult.storage);
    });

    // morale multiplier on production (uses current morale)
    const mo = s.stats.morale;
    const M = C.MORALE;
    let mm;
    if (mo >= M.prodPivot) mm = CG.lerp(1, M.prodAtFull, (mo - M.prodPivot) / (100 - M.prodPivot));
    else mm = CG.lerp(M.prodAtZero, 1, mo / M.prodPivot);
    c.moraleMult = mm;

    c.prodGlobal = c.mult.global_prod * c.mult.tool_quality * mm;
    c.population = s.survivors.length;
    c.assignedCount = s.survivors.filter((x) => x.job).length;

    s._cache = c;
    return c;
  }

  function cache(s) { return s._cache || recompute(s); }

  // ---- resource helpers ----
  function capOf(s, res) { const c = cache(s); return c.cap && c.cap[res] != null ? c.cap[res] : Infinity; }
  function amountOf(s, res) {
    if (res === 'research') return s.research;
    if (res === 'coin') return s.coin;
    return s.resources[res] || 0;
  }
  function setAmount(s, res, v) {
    if (res === 'research') s.research = v; else if (res === 'coin') s.coin = v; else s.resources[res] = v;
  }
  function addRes(s, res, amt, track) {
    if (amt === 0) return 0;
    let cur = amountOf(s, res);
    if (amt > 0) {
      const cap = capOf(s, res);
      const room = cap - cur;
      const added = Math.min(amt, room < 0 ? 0 : room);
      setAmount(s, res, cur + added);
      if (track !== false) {
        s.stats.totalProduced[res] = (s.stats.totalProduced[res] || 0) + added;
        if ((s.resources[res] || 0) > (s.stats.resPeak[res] || 0)) s.stats.resPeak[res] = s.resources[res] || 0;
      }
      return added;
    } else {
      const removed = Math.min(-amt, cur);
      setAmount(s, res, cur - removed);
      if (track !== false) s.stats.totalConsumed[res] = (s.stats.totalConsumed[res] || 0) + removed;
      return -removed;
    }
  }
  function hasRes(s, res, amt) { return amountOf(s, res) >= amt - 1e-9; }
  function canAfford(s, cost) { for (const k in cost) if (!hasRes(s, k, cost[k])) return false; return true; }
  function payCost(s, cost) { if (!canAfford(s, cost)) return false; for (const k in cost) addRes(s, k, -cost[k], false); return true; }
  function missing(s, cost) { const m = {}; for (const k in cost) { const d = cost[k] - amountOf(s, k); if (d > 0) m[k] = d; } return m; }

  // food value currently stocked (for survival + morale + growth)
  function foodStock(s) { let f = 0; C.FOOD_RES.forEach((r) => (f += (s.resources[r] || 0) * (C.FOOD_VALUE[r] || 1))); return f; }
  function foodVarietyCount(s) { let n = 0; C.FOOD_RES.forEach((r) => { if ((s.resources[r] || 0) > 0.5) n++; }); return n; }
  function luxuryCount(s) { let n = 0; C.LUXURY_RES.forEach((r) => { if ((s.resources[r] || 0) > 0.5) n++; }); return n; }

  // worker efficiency: level + energy/health factor
  function workerEff(sv) {
    let eff = 1 + C.XP.effPerLevel * (sv.level - 1);
    if (sv.energy < 25) eff *= Math.max(0.35, sv.energy / 25);
    if (sv.health < 40) eff *= Math.max(0.4, sv.health / 40);
    return eff;
  }

  // ---- production tick ----
  function tick(s, dt) {
    const c = cache(s);
    const W = c.workersByJob;

    // passive resources from buildings
    for (const r in c.passiveRes) addRes(s, r, c.passiveRes[r] * dt);

    for (const job in W) {
      const workers = W[job];
      if (!workers.length) continue;
      const J = CG.JOB[job];
      const jm = (c.jobMult[job] || 1);

      if (J && J.kind === 'gather') {
        const recipe = C.BASE_PROD[job]; if (!recipe) continue;
        let effSum = 0; workers.forEach((w) => (effSum += workerEff(w)));
        let mult = c.prodGlobal * jm;
        if (job === 'hunt') mult *= c.mult.hunt_success;
        for (const r in recipe) {
          let amt = recipe[r] * effSum * mult * (c.resMult[r] || 1) * dt;
          const added = addRes(s, r, amt);
          trackGather(s, r, added, job);
        }
      } else if (J && J.kind === 'refine') {
        runRecipe(s, c, job, workers, dt);
      } else if (J && J.kind === 'research') {
        let effSum = 0; workers.forEach((w) => (effSum += workerEff(w)));
        const rate = C.BASE_PROD.research.research * effSum * c.mult.research * c.moraleMult * dt;
        s.research += rate;
        s.stats.totalProduced.research = (s.stats.totalProduced.research || 0) + rate;
      }
      // 'build','service','explore' handled by their own systems

      // XP for workers
      const xpGain = C.XP.perSecondWorking * c.mult.xp * dt;
      workers.forEach((w) => grantXP(s, w, xpGain, job));
    }
  }

  function trackGather(s, r, amt, job) {
    if (amt <= 0) return;
    s.stats.totalGathered[r] = (s.stats.totalGathered[r] || 0) + amt;
    if (job === 'fish') s.stats.fishCaught += amt;
    if (job === 'hunt' && r === 'meat') s.stats.animalsHunted += amt;
    if (job === 'woodcut') s.stats.treesChopped += amt;
    if (r === 'pearl') s.stats.pearlsFound += amt;
  }

  // refinery: find buildings of this job, sum recipe throughput, distribute workers
  function runRecipe(s, c, job, workers, dt) {
    // gather recipes from all buildings that host this job
    const hosts = [];
    s.buildings.forEach((b) => {
      const D = CG.BLD[b.id];
      if (D && D.recipe && D.recipe.job === job) hosts.push({ b: b, D: D });
    });
    if (!hosts.length) return;
    // use the best (highest-rate) recipe available; level scales rate
    let best = hosts[0];
    hosts.forEach((h) => { if (h.D.recipe.rate * h.b.level > best.D.recipe.rate * best.b.level) best = h; });
    const recipe = best.D.recipe;
    const lvlRateBoost = 1 + 0.5 * (best.b.level - 1);
    let effSum = 0; workers.forEach((w) => (effSum += workerEff(w)));
    const mult = c.prodGlobal * c.mult.refine * (c.jobMult[job] || 1) * lvlRateBoost;
    let batches = recipe.rate * effSum * mult * dt;
    if (batches <= 0) return;

    // limit by inputs available
    for (const inRes in recipe.inputs) {
      const have = amountOf(s, inRes);
      const maxB = have / recipe.inputs[inRes];
      if (maxB < batches) batches = maxB;
    }
    // limit by output storage room
    for (const outRes in recipe.outputs) {
      const room = capOf(s, outRes) - amountOf(s, outRes);
      const maxB = (room <= 0 ? 0 : room) / recipe.outputs[outRes];
      if (maxB < batches) batches = maxB;
    }
    if (batches <= 1e-9) return;
    for (const inRes in recipe.inputs) addRes(s, inRes, -recipe.inputs[inRes] * batches);
    for (const outRes in recipe.outputs) {
      const added = addRes(s, outRes, recipe.outputs[outRes] * batches * (c.resMult[outRes] || 1));
      if (outRes === 'bread') s.stats.mealsCooked += added;
    }
  }

  function grantXP(s, sv, amt, job) {
    // affinity bonus for named survivors doing their thing
    if (sv.charId) {
      const ch = CG.CHAR[sv.charId];
      if (ch.affinity && ch.affinity.indexOf(job) >= 0) amt *= 1.5;
    }
    sv.xp += amt;
    while (sv.xp >= sv.xpNext && sv.level < C.XP.maxLevel) {
      sv.xp -= sv.xpNext;
      sv.level++;
      sv.xpNext = Math.floor(C.XP.levelBase * Math.pow(C.XP.levelMult, sv.level - 1));
      if (sv.charId) {
        sv.skillPoints += 1;
        s.stats.charLevel[sv.charId] = sv.level;
        CG.State.log(s, sv.name + ' reached level ' + sv.level + '! A skill point is available.', 'good');
        CG.emit('char_levelup', { sid: sv.sid, charId: sv.charId, level: sv.level });
      }
      CG.emit('levelup', { sid: sv.sid });
    }
    if (sv.level >= C.XP.maxLevel) { sv.xp = 0; sv.xpNext = 1; }
  }

  // ---- progression score & stage ----
  // Progress rewards genuine, diverse development — distinct building types & upgrades, tech,
  // population and exploration. Spamming many copies of one cheap building barely helps.
  function computeProgress(s) {
    let score = 0;
    const seen = {};
    s.buildings.forEach((b) => {
      const D = CG.BLD[b.id]; if (!D) return;
      if (!seen[b.id]) { seen[b.id] = true; score += Math.pow(D.tier, 1.6); } // first of a kind: full value
      score += 0.12 * D.tier;                                                 // duplicates: minor
      score += 0.4 * (b.level - 1) * D.tier;                                  // upgrades matter
    });
    score += s.stats.techResearched * 1.3;
    score += Math.min(s.survivors.length, 60) * 1.2 + Math.max(0, s.survivors.length - 60) * 0.4;
    score += (s.stats.regionsExplored - 1) * 4;
    return Math.floor(score);
  }
  function stageFor(score) {
    let st = 1;
    for (let i = 1; i < C.STAGE_THRESHOLDS.length; i++) if (score >= C.STAGE_THRESHOLDS[i]) st = i;
    return st;
  }

  // Preview a job's per-second inputs/outputs for a given worker count (default: current).
  function jobPreview(s, job, workerCount) {
    const c = cache(s);
    const J = CG.JOB[job]; if (!J) return { outputs: {}, inputs: {} };
    const current = c.workersByJob[job] || [];
    let effSum;
    if (workerCount == null) { effSum = 0; current.forEach((w) => (effSum += workerEff(w))); if (!current.length) effSum = 0; }
    else { effSum = workerCount * 1; } // assume level-1 efficiency for hypothetical
    const out = {}, inp = {};
    const jm = (c.jobMult[job] || 1);
    if (J.kind === 'gather') {
      const recipe = C.BASE_PROD[job]; if (recipe) {
        let mult = c.prodGlobal * jm; if (job === 'hunt') mult *= c.mult.hunt_success;
        for (const r in recipe) out[r] = recipe[r] * effSum * mult * (c.resMult[r] || 1);
      }
    } else if (J.kind === 'refine') {
      let best = null;
      s.buildings.forEach((b) => { const D = CG.BLD[b.id]; if (D && D.recipe && D.recipe.job === job) { if (!best || D.recipe.rate * b.level > best.D.recipe.rate * best.b.level) best = { b, D }; } });
      if (best) {
        const recipe = best.D.recipe; const lvlBoost = 1 + 0.5 * (best.b.level - 1);
        const batches = recipe.rate * effSum * c.prodGlobal * c.mult.refine * jm * lvlBoost;
        for (const r in recipe.outputs) out[r] = recipe.outputs[r] * batches * (c.resMult[r] || 1);
        for (const r in recipe.inputs) inp[r] = recipe.inputs[r] * batches;
      }
    } else if (J.kind === 'research') {
      out.research = C.BASE_PROD.research.research * effSum * c.mult.research * c.moraleMult;
    }
    return { outputs: out, inputs: inp };
  }

  // research points generated per second right now
  function researchRate(s) { return jobPreview(s, 'research').outputs.research || 0; }

  CG.Economy = {
    recompute, cache, capOf, amountOf, addRes, hasRes, canAfford, payCost, missing,
    foodStock, foodVarietyCount, luxuryCount, workerEff, tick, grantXP,
    computeProgress, stageFor, BASE_SLOTS, jobPreview, researchRate,
  };
})(typeof window !== 'undefined' ? window : globalThis);
