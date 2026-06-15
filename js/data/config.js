/* data/config.js — Balance constants. Tuned for a 2–4h playthrough.
 * All numbers gathered here so pacing can be tuned in one place.
 */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});

  const C = {
    DAY_SECONDS: 90,           // 1 in-game day at 1x
    PHASES: ['Dawn', 'Day', 'Dusk', 'Night'],
    SPEEDS: [0, 1, 2, 4],      // pause / 1x / 2x / 4x
    AUTOSAVE_EVERY: 30,        // seconds (real)
    SAVE_KEY: 'castaway_save_v1',
    SETTINGS_KEY: 'castaway_settings_v1',

    START: {
      survivors: ['robin', 'lenni', 'leif', 'erim'],
      resources: { fish: 12, fruit: 8, water: 14, sticks: 6, fiber: 4, wood: 0, stone: 0 },
      research: 0, coin: 8,
      baseStorage: 60,         // per-resource cap before storage buildings
    },

    // Survival need depletion per in-game day (then scaled to per-second by engine)
    NEEDS: {
      hungerPerDay: 34,        // a survivor "eats" to top up; consumes food units
      thirstPerDay: 40,
      energyWorkPerDay: 30,    // drains while actively working
      energyRestPerDay: 70,    // regen while resting / night
      healthRegenPerDay: 10,   // when needs satisfied + sheltered
      healthDrainPerDay: 16,   // when a critical need is at 0
      eatThreshold: 72,        // auto-eat below this if food available
      drinkThreshold: 72,
      foodPerEat: 1,           // food units consumed per "meal" top-up event
      waterPerDrink: 1,
      starveHealthGuard: 0.0,  // health can hit 0 -> survivor leaves/incapacitated
    },

    MORALE: {
      base: 60,
      shelterBonusPerHousing: 0.6,    // small
      crowdingPenalty: 1.2,           // per pop over housing
      varietyBonus: 4,                // per distinct food type stocked (cap applies)
      varietyCap: 5,
      luxuryBonus: 3,                 // per luxury resource stocked
      starvingPenalty: 25,
      thirstyPenalty: 25,
      driftPerDay: 8,                 // morale eases toward target by this much/day
      min: 0, max: 100,
      // production multiplier from morale: 0.6 at 0 morale, 1.0 at 60, up to 1.25 at 100
      prodAtZero: 0.6, prodAtFull: 1.25, prodPivot: 60,
    },

    // XP & worker efficiency
    XP: {
      perSecondWorking: 0.6,
      levelBase: 60,           // xp for level 2
      levelMult: 1.35,         // each level costs this much more
      maxLevel: 20,
      effPerLevel: 0.05,       // +5% output per worker level (generic settlers)
      charEffPerLevel: 0.04,   // named chars get their own trees too
    },

    // Production: base per-second outputs per worker for raw gather jobs.
    // (Refinery jobs use recipes from tech/buildings.)
    BASE_PROD: {
      forage: { fiber: 0.10, sticks: 0.08, fruit: 0.05 },
      woodcut: { wood: 0.12 },
      water: { water: 0.16 },
      fish: { fish: 0.11 },
      hunt: { meat: 0.05, hide: 0.03 },
      mine_stone: { stone: 0.10 },
      dig_clay: { clay: 0.10 },
      dig_sand: { sand: 0.12 },
      farm: { crops: 0.10 },
      research: { research: 0.07 },
      pearl_dive: { pearl: 0.01 },
    },

    // Construction
    BUILD: {
      builderSpeed: 1.0,       // build progress/sec per builder
      maxQueue: 12,
      refundPct: 0.5,          // demolish refund
    },

    // Population growth
    POP: {
      checkEveryDays: 1.5,
      baseChance: 0.0,         // computed from surplus/morale/attractiveness
      foodSurplusForGrowth: 4, // food/day surplus needed to consider growth
      moraleForGrowth: 55,
      maxChancePerCheck: 0.55,
      startCap: 4,             // housing-derived; named four are the start
    },

    // Exploration
    EXPLORE: {
      baseFoodCostPerDay: 1.2, // per explorer per day on expedition
      baseWaterCostPerDay: 1.4,
      rareBaseChance: 0.12,
    },

    // Research
    RESEARCH: { startRate: 0 },

    // Trade
    TRADE: { baseMargin: 0.6, sellTax: 1.0 },

    // Stage thresholds by progress score (see economy.computeProgress)
    STAGE_THRESHOLDS: [0, 8, 24, 55, 110, 200, 340, 520],
    STAGE_NAMES: [
      '', 'Shipwreck Survival', 'Permanent Camp', 'Village',
      'Growing Settlement', 'Colony', 'Island Town', 'Prosperous Island',
    ],

    // Event cadence
    EVENTS: { minGapDays: 1.1, maxGapDays: 2.6, dangerStageFloor: 1 },

    // Victory
    VICTORY: { monumentId: 'grand_monument' },
  };

  // food resources (used for hunger + morale variety + growth)
  C.FOOD_RES = ['fish', 'fruit', 'meat', 'bread', 'crops'];
  C.FOOD_VALUE = { fish: 1, fruit: 0.8, meat: 1.4, bread: 1.6, crops: 1.0 };
  C.LUXURY_RES = ['spice', 'pearl', 'rarewood', 'exoticpet', 'gem'];

  CG.C = C;
})(typeof window !== 'undefined' ? window : globalThis);
