/* core/state.js — the central game state + new-game construction. Pure data; systems mutate it. */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const C = CG.C;

  function makeStats() {
    return {
      playtime: 0, days: 0, population: 6, peakPopulation: 6, settlersArrived: 0, deaths: 0,
      buildingsBuilt: 0, buildingsByType: {}, buildingUpgrades: 0, demolitions: 0,
      techResearched: 0, techByCat: {}, researchSpent: 0,
      regionsExplored: 1, expeditionsRun: 0, raresFound: 0,
      totalGathered: {}, totalProduced: {}, totalConsumed: {}, totalTraded: 0, coinEarned: 0, coinSpent: 0,
      resPeak: {},
      eventsSeen: 0, eventsByCat: {}, choicesMade: 0,
      questsCompleted: 0, achievementsUnlocked: 0,
      stage: 1, maxStage: 1, charLevel: { robin: 1, lenni: 1, leif: 1, erim: 1 },
      starvationEvents: 0, droughtSurvived: 0, stormsSurvived: 0, diseasesCured: 0,
      morale: C.MORALE.base, maxMorale: C.MORALE.base,
      fishCaught: 0, animalsHunted: 0, mealsCooked: 0, treesChopped: 0, pearlsFound: 0,
      manualGathers: 0, buffsTriggered: 0, demolishedMonument: 0,
      flags: {},
    };
  }

  function makeNamedSurvivor(charId) {
    const ch = CG.CHAR[charId];
    return {
      sid: CG.uid('s'), name: ch.name, isNamed: true, charId: charId,
      job: null, hunger: 90, thirst: 90, energy: 90, health: 100,
      level: 1, xp: 0, xpNext: C.XP.levelBase, skillPoints: 0, skills: {},
      mood: 'ok',
    };
  }

  function defaultSettings() {
    return { sound: true, music: true, volume: 0.6, showRates: true, confirmDemolish: true, reduceMotion: false, theme: 'tropical' };
  }

  CG.State = {
    makeStats, defaultSettings, makeNamedSurvivor,

    newGame() {
      const s = {
        version: 1, createdAt: Date.now(), name: 'Castaway Colony',
        time: { totalSec: C.DAY_SECONDS * 0.25, day: 1, phaseIndex: 1 }, // start mid-morning Day 1
        speed: 1, paused: false,
        resources: {}, research: C.START.research, coin: C.START.coin,
        survivors: [], nextSettlerName: 0,
        buildings: [], queue: [],
        tech: { researched: {}, current: null, progress: 0 },
        regions: { explored: { beach: true }, expeditions: [] },
        buffs: [],
        quests: { active: [], completed: {}, progress: {}, offered: {} },
        achievements: { unlocked: {} },
        events: { lastEventDay: 1, seen: {}, cooldowns: {}, oneShot: {}, pending: null, history: [] },
        trade: { offers: [], refreshDay: 0 },
        stats: makeStats(),
        settings: defaultSettings(),
        log: [],
        flags: {},
        victory: false, victorySeenAt: null, sandbox: false,
        tutorialStep: 0, tutorialDone: false,
        automation: { autoAssign: false, autoExplore: false, autoResearch: false },
        taxRate: 0, faction: null,
        market: { mod: {}, stock: {}, day: 1 },
        _cache: null,
      };

      // starting resources
      CG.RESOURCES.forEach((r) => { if (!r.nocap) s.resources[r.id] = 0; });
      Object.keys(C.START.resources).forEach((k) => (s.resources[k] = C.START.resources[k]));

      // the four named survivors
      C.START.survivors.forEach((cid) => s.survivors.push(makeNamedSurvivor(cid)));
      // sensible starting assignments so the player sees production immediately
      const assign = { robin: 'forage', lenni: 'research', leif: 'fish', erim: 'fish', jovan: 'water', leonidas: 'mine_stone', till: 'forage', tusya: 'mine_stone' };
      s.survivors.forEach((sv) => { if (sv.charId && assign[sv.charId]) sv.job = assign[sv.charId]; });

      return s;
    },

    makeSettler() {
      const first = ['Mira', 'Tomas', 'Ada', 'Kofi', 'Suki', 'Bram', 'Nila', 'Owen', 'Pia', 'Yusuf',
        'Greta', 'Hana', 'Ivo', 'Lara', 'Milo', 'Nora', 'Otis', 'Rosa', 'Theo', 'Vera',
        'Dario', 'Esme', 'Finn', 'Gwen', 'Hugo', 'Indra', 'Jonah', 'Kira', 'Liam', 'Maya'];
      const name = CG.RNG.pick(first);
      return {
        sid: CG.uid('s'), name: name, isNamed: false, charId: null,
        job: null, hunger: 80, thirst: 80, energy: 85, health: 100,
        level: 1, xp: 0, xpNext: CG.C.XP.levelBase, skillPoints: 0, skills: {}, mood: 'ok',
      };
    },

    survivorById(s, sid) { return s.survivors.find((x) => x.sid === sid); },
    namedSurvivor(s, charId) { return s.survivors.find((x) => x.charId === charId); },
    buildingById(s, uid) { return s.buildings.find((b) => b.uid === uid); },

    log(s, text, type) {
      s.log.unshift({ day: s.time.day, text: text, type: type || 'info', t: Date.now() });
      if (s.log.length > 200) s.log.length = 200;
      CG.emit('log', s.log[0]);
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
