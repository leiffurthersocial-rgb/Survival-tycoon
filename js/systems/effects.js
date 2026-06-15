/* systems/effects.js — shared applier for event/quest/reward outcomes.
 * Every content effect routes through CG.applyOutcome(s, eff). Keep it total & safe. */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const C = CG.C, E = () => CG.Economy;

  function survivorsFor(s, who) {
    if (who === 'random') { const a = s.survivors.filter((x) => x.health > 0); return a.length ? [CG.RNG.pick(a)] : []; }
    if (who === 'named') return s.survivors.filter((x) => x.charId);
    return s.survivors.slice(); // 'all' default
  }

  function apply(s, eff) {
    if (!eff || !eff.type) return;
    switch (eff.type) {
      case 'resource': {
        let amt = eff.amt;
        if (eff.pct != null) amt = E().amountOf(s, eff.res) * eff.pct;
        E().addRes(s, eff.res, amt);
        break;
      }
      case 'coin': s.coin = Math.max(0, s.coin + eff.amt); if (eff.amt > 0) s.stats.coinEarned += eff.amt; break;
      case 'research': s.research = Math.max(0, s.research + eff.amt); break;
      case 'buff': {
        s.buffs.push({ id: CG.uid('buff'), label: eff.label || 'Effect', stat: eff.stat, mult: eff.mult != null ? eff.mult : 1, amt: eff.amt || 0, endsDay: s.time.day + (eff.days || 2) });
        s.stats.buffsTriggered++;
        E().recompute(s);
        break;
      }
      case 'morale': s.stats.morale = CG.clamp(s.stats.morale + eff.amt, 0, 100); break;
      case 'need': {
        survivorsFor(s, eff.who || 'all').forEach((sv) => { sv[eff.need] = CG.clamp((sv[eff.need] || 0) + eff.amt, 0, 100); });
        break;
      }
      case 'health': {
        survivorsFor(s, eff.who || 'all').forEach((sv) => { sv.health = CG.clamp(sv.health + eff.amt, eff.amt < 0 ? 1 : 0, 100); });
        break;
      }
      case 'settler': {
        const n = eff.count || 1;
        for (let i = 0; i < n; i++) CG.Colony.addSettler(s, 'New arrivals join the colony.');
        break;
      }
      case 'tech': {
        if (eff.id && CG.TECHById[eff.id] && !s.tech.researched[eff.id]) {
          s.tech.researched[eff.id] = true; s.stats.techResearched++;
          const t = CG.TECHById[eff.id]; s.stats.techByCat[t.cat] = (s.stats.techByCat[t.cat] || 0) + 1;
          E().recompute(s); CG.emit('research_changed'); CG.emit('buildings_changed');
        }
        break;
      }
      case 'reveal_region':
      case 'unlock': {
        const what = eff.what || (eff.type === 'reveal_region' ? 'region' : null);
        const id = eff.id;
        if (what === 'region' && id && !s.regions.explored[id]) {
          s.regions.explored[id] = true; s.stats.regionsExplored = Object.keys(s.regions.explored).length;
          CG.emit('region_explored', { id }); CG.emit('explore_changed');
        } else if (what === 'quest' && id) {
          s.quests.offered[id] = true;
        }
        break;
      }
      case 'flag': s.flags[eff.key] = (eff.value == null ? true : eff.value); s.stats.flags[eff.key] = s.flags[eff.key]; break;
      case 'xp': survivorsFor(s, eff.who || 'all').forEach((sv) => E().grantXP(s, sv, eff.amt || 0, sv.job || 'forage')); break;
      case 'stat': s.stats[eff.key] = (s.stats[eff.key] || 0) + (eff.amt || 0); break;
      default: break;
    }
  }

  function applyAll(s, effects) { (effects || []).forEach((e) => apply(s, e)); }

  CG.applyOutcome = apply;
  CG.applyOutcomes = applyAll;
})(typeof window !== 'undefined' ? window : globalThis);
