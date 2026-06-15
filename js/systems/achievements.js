/* systems/achievements.js — checks CG.ACHIEVEMENTS against a rich stats snapshot. */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});

  // Build a stats snapshot enriched with a few live values content checks may want.
  function snapshot(s) {
    const st = s.stats;
    st.population = s.survivors.length;
    st.stage = st.stage;
    st.currentRes = s.resources;
    st.coin = s.coin;
    st.research = s.research;
    st.buildingsStanding = s.buildings.length;
    st.distinctBuildings = new Set(s.buildings.map((b) => b.id)).size;
    st.idle = s.survivors.filter((x) => !x.job).length;
    return st;
  }

  function tick(s) {
    const stats = snapshot(s);
    (CG.ACHIEVEMENTS || []).forEach((a) => {
      if (s.achievements.unlocked[a.id]) return;
      let ok = false;
      try { ok = a.check(stats, s); } catch (e) { ok = false; }
      if (ok) unlock(s, a);
    });
  }

  function unlock(s, a) {
    s.achievements.unlocked[a.id] = { day: s.time.day, t: Date.now() };
    s.stats.achievementsUnlocked++;
    CG.State.log(s, '🏆 Achievement unlocked: ' + a.name + ' — ' + a.desc, 'achv');
    CG.emit('achievement', { ach: a });
    CG.emit('toast', { text: '🏆 ' + a.name, type: 'achv', icon: a.icon || '🏆' });
  }

  function totalPoints(s) {
    let p = 0; (CG.ACHIEVEMENTS || []).forEach((a) => { if (s.achievements.unlocked[a.id]) p += (a.points || 10); }); return p;
  }
  function count(s) { return Object.keys(s.achievements.unlocked).length; }

  CG.Achievements = { tick, unlock, totalPoints, count, snapshot };
})(typeof window !== 'undefined' ? window : globalThis);
