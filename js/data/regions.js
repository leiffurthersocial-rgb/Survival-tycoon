/* data/regions.js — island regions for exploration. Unlock gradually. */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});

  const REGIONS = [
    { id: 'beach', name: 'The Beach', icon: '🏖️', order: 1, distance: 1,
      desc: 'Where the wreck washed you ashore. Sand, fish, and salvage.',
      resources: ['fish', 'sand', 'fiber', 'sticks', 'water', 'stone'], rare: ['pearl'],
      baseTime: 35, risk: 0.05, requires: {}, startUnlocked: true,
      flavor: 'Splintered crates from the ship still bob in the surf.' },

    { id: 'palmforest', name: 'Palm Forest', icon: '🌴', order: 2, distance: 2,
      desc: 'A belt of palms inland. Wood, fruit, and small game.',
      resources: ['wood', 'fruit', 'fiber', 'meat', 'hide'], rare: ['rarewood'],
      baseTime: 55, risk: 0.10, requires: { region: ['beach'] },
      flavor: 'The canopy hums with insects and the chatter of birds.' },

    { id: 'river', name: 'Freshwater River', icon: '🏞️', order: 3, distance: 3,
      desc: 'A clear river winding from the highlands. Clay and clean water.',
      resources: ['water', 'clay', 'fish', 'crops'], rare: ['spice'],
      baseTime: 70, risk: 0.10, requires: { region: ['palmforest'] },
      flavor: 'Dragonflies skim a current cold enough to numb your hands.' },

    { id: 'jungle', name: 'Dense Jungle', icon: '🌿', order: 4, distance: 4,
      desc: 'Thick, humid, and full of life. Rare woods and exotic creatures.',
      resources: ['wood', 'fruit', 'hide', 'meat', 'fiber'], rare: ['rarewood', 'exoticpet', 'spice'],
      baseTime: 95, risk: 0.20, requires: { region: ['river'], tools: 1 },
      flavor: 'Every step is a negotiation with the undergrowth.' },

    { id: 'highlands', name: 'The Highlands', icon: '⛰️', order: 5, distance: 5,
      desc: 'Windswept hills above the treeline. Stone and ore at the surface.',
      resources: ['stone', 'ironore', 'clay'], rare: ['gem'],
      baseTime: 110, risk: 0.18, requires: { region: ['jungle'] },
      flavor: 'The whole island lies below you like a green map.' },

    { id: 'mountainpass', name: 'Mountain Pass', icon: '🗻', order: 6, distance: 6,
      desc: 'A treacherous pass through the peaks. Rich iron veins.',
      resources: ['ironore', 'stone', 'gem'], rare: ['gem', 'precious'],
      baseTime: 130, risk: 0.30, requires: { region: ['highlands'], tools: 2 },
      flavor: 'Loose scree and a cold that bites through leather.' },

    { id: 'ruins', name: 'Ancient Ruins', icon: '🏛️', order: 7, distance: 7,
      desc: 'Stone ruins of those who came before. Secrets and treasure.',
      resources: ['stone', 'gem', 'brick'], rare: ['gem', 'pearl'],
      baseTime: 120, risk: 0.25, requires: { region: ['mountainpass'] },
      flavor: 'Worn carvings watch you from the moss.' },

    { id: 'caves', name: 'Hidden Cave System', icon: '🕳️', order: 8, distance: 7,
      desc: 'A dark labyrinth beneath the island. Minerals and danger.',
      resources: ['ironore', 'gem', 'stone', 'clay'], rare: ['gem'],
      baseTime: 140, risk: 0.35, requires: { region: ['ruins'], tools: 3 },
      flavor: 'Your torch reveals only the next few steps.' },

    { id: 'volcano', name: 'Volcanic Region', icon: '🌋', order: 9, distance: 8,
      desc: 'Black rock and sulfur near the island\'s fiery heart.',
      resources: ['ironore', 'stone', 'gem', 'charcoal'], rare: ['gem', 'precious'],
      baseTime: 160, risk: 0.40, requires: { region: ['caves'], tools: 4 },
      flavor: 'The ground is warm. Somewhere below, the island breathes fire.' },

    { id: 'northcoast', name: 'Northern Coast', icon: '🧭', order: 10, distance: 9,
      desc: 'The far shore. Reefs rich with pearls, and a view of open sea.',
      resources: ['fish', 'pearl', 'sand', 'water'], rare: ['pearl', 'exoticpet'],
      baseTime: 150, risk: 0.22, requires: { region: ['highlands'] },
      flavor: 'Beyond the reef, the horizon is unbroken blue.' },
  ];

  const byId = {};
  REGIONS.forEach((r) => (byId[r.id] = r));
  CG.REGIONS = REGIONS;
  CG.REGION = byId;
})(typeof window !== 'undefined' ? window : globalThis);
