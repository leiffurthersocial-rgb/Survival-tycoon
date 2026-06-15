/* systems/survival.js — hunger, thirst, energy, health, morale. Designed to be fair:
 * good supply lines keep everyone happy; crises are visible and recoverable.
 */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const C = CG.C, E = () => CG.Economy;

  const HUNGER_PER_UNIT = 26;   // hunger restored per 1.0 food value
  const WATER_PER_UNIT = 30;
  const EAT_ORDER = ['fruit', 'crops', 'fish', 'bread', 'meat'];

  function consumeFood(s, hungerNeeded) {
    let restored = 0;
    for (let i = 0; i < EAT_ORDER.length && hungerNeeded > 0; i++) {
      const r = EAT_ORDER[i];
      const fv = C.FOOD_VALUE[r] || 1;
      const have = s.resources[r] || 0;
      if (have <= 0) continue;
      const perUnit = fv * HUNGER_PER_UNIT;
      const unitsWanted = hungerNeeded / perUnit;
      const units = Math.min(unitsWanted, have);
      s.resources[r] = have - units;
      s.stats.totalConsumed[r] = (s.stats.totalConsumed[r] || 0) + units;
      restored += units * perUnit;
      hungerNeeded -= units * perUnit;
    }
    return restored;
  }

  function consumeWater(s, need) {
    const have = s.resources.water || 0;
    if (have <= 0) return 0;
    const unitsWanted = need / WATER_PER_UNIT;
    const units = Math.min(unitsWanted, have);
    s.resources.water = have - units;
    s.stats.totalConsumed.water = (s.stats.totalConsumed.water || 0) + units;
    return units * WATER_PER_UNIT;
  }

  function tick(s, dt) {
    const c = E().cache(s);
    const f = dt / C.DAY_SECONDS;             // day-fraction this tick
    const N = C.NEEDS;
    const phase = C.PHASES[s.time.phaseIndex];
    const isNight = phase === 'Night';
    const sheltered = c.housing >= s.survivors.length;

    let anyStarving = false, anyThirsty = false, sumHealth = 0;
    const onExpedition = {};
    s.regions.expeditions.forEach((ex) => ex.explorers.forEach((id) => (onExpedition[id] = true)));

    for (let i = s.survivors.length - 1; i >= 0; i--) {
      const sv = s.survivors[i];

      // hunger / thirst drain
      sv.hunger = CG.clamp(sv.hunger - N.hungerPerDay * (c.needMult.hunger || 1) * f, 0, 100);
      sv.thirst = CG.clamp(sv.thirst - N.thirstPerDay * (c.needMult.thirst || 1) * f, 0, 100);

      // auto eat/drink from stores (expedition members carry their own supplies, fed by exploration costs)
      if (!onExpedition[sv.sid]) {
        if (sv.hunger < N.eatThreshold) { const r = consumeFood(s, 96 - sv.hunger); sv.hunger = CG.clamp(sv.hunger + r, 0, 100); }
        if (sv.thirst < N.drinkThreshold) { const r = consumeWater(s, 98 - sv.thirst); sv.thirst = CG.clamp(sv.thirst + r, 0, 100); }
      }

      // energy
      const working = !!sv.job && !onExpedition[sv.sid];
      if (working && !isNight) {
        sv.energy = CG.clamp(sv.energy - N.energyWorkPerDay * (c.needMult.energy || 1) * f, 0, 100);
      } else {
        let regen = isNight ? N.energyRestPerDay : N.energyRestPerDay * 0.45;
        if (sheltered) regen *= 1.25;
        sv.energy = CG.clamp(sv.energy + regen * f, 0, 100);
      }

      // health
      const critical = sv.hunger <= 0 || sv.thirst <= 0;
      if (critical) {
        sv.health = CG.clamp(sv.health - N.healthDrainPerDay * f, 0, 100);
      } else if (sv.hunger > 40 && sv.thirst > 40) {
        let regen = N.healthRegenPerDay * (c.needMult.health || 1) * c.mult.heal;
        if (sheltered) regen *= 1.15;
        if (sv.energy < 15) regen *= 0.5;
        sv.health = CG.clamp(sv.health + regen * f, 0, 100);
      }

      if (sv.hunger <= 0) anyStarving = true;
      if (sv.thirst <= 0) anyThirsty = true;
      sumHealth += sv.health;

      // mood label for UI
      sv.mood = moodOf(sv);

      // departure when health is gone (rare, well-telegraphed)
      if (sv.health <= 0) handleCollapse(s, sv, i);
    }

    if (anyStarving) s.stats.starvationEvents += dt / C.DAY_SECONDS; // accrue days starving
    s._avgHealth = s.survivors.length ? sumHealth / s.survivors.length : 100;

    // morale drift toward target
    moraleTick(s, c, f, anyStarving, anyThirsty);
  }

  function moodOf(sv) {
    if (sv.health <= 25) return 'sick';
    if (sv.hunger <= 15 || sv.thirst <= 15) return 'suffering';
    if (sv.energy <= 15) return 'exhausted';
    if (sv.hunger > 70 && sv.thirst > 70 && sv.energy > 50) return 'happy';
    return 'ok';
  }

  function moraleTarget(s, c, anyStarving, anyThirsty) {
    const M = C.MORALE;
    let t = M.base + c.moraleBonus;
    const variety = Math.min(M.varietyCap, E().foodVarietyCount(s) + c.add.food_variety);
    t += variety * M.varietyBonus;
    t += E().luxuryCount(s) * M.luxuryBonus;
    const over = Math.max(0, s.survivors.length - c.housing);
    t -= over * M.crowdingPenalty;
    if (anyStarving) t -= M.starvingPenalty;
    if (anyThirsty) t -= M.thirstyPenalty;
    if (s._avgHealth != null && s._avgHealth < 50) t -= (50 - s._avgHealth) * 0.4;
    return CG.clamp(t, M.min, M.max);
  }

  function moraleTick(s, c, f, anyStarving, anyThirsty) {
    const target = moraleTarget(s, c, anyStarving, anyThirsty);
    s._moraleTarget = target;
    const drift = C.MORALE.driftPerDay * f;
    if (s.stats.morale < target) s.stats.morale = Math.min(target, s.stats.morale + drift);
    else if (s.stats.morale > target) s.stats.morale = Math.max(target, s.stats.morale - drift);
    if (s.stats.morale > s.stats.maxMorale) s.stats.maxMorale = s.stats.morale;
  }

  function handleCollapse(s, sv, idx) {
    // Named survivors never permanently die — they fall ill and recover at low health (kept attached).
    if (sv.charId) {
      sv.health = 12; sv.hunger = Math.max(sv.hunger, 25); sv.thirst = Math.max(sv.thirst, 25);
      sv.job = null;
      CG.State.log(s, sv.name + ' has collapsed from exhaustion but clings on. Get them food and water!', 'bad');
      CG.emit('toast', { text: sv.name + ' collapsed — tend to them!', type: 'bad' });
      return;
    }
    // generic settlers may leave the colony if conditions are dire
    s.survivors.splice(idx, 1);
    s.stats.deaths++;
    CG.State.log(s, 'A settler, ' + sv.name + ', was lost to the hardships of the island.', 'bad');
    CG.emit('toast', { text: sv.name + ' was lost to hardship.', type: 'bad' });
    CG.emit('population_changed');
  }

  CG.Survival = { tick, moraleTarget, moodOf };
})(typeof window !== 'undefined' ? window : globalThis);
