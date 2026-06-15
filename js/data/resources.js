/* data/resources.js — all resource definitions. IDs are stable (see DESIGN.md). */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});

  // tier: rough progression tier. value: base trade value (coin). cat for grouping.
  const R = [
    // ---- Natural ----
    { id: 'wood',    name: 'Wood',         icon: '🪵', cat: 'natural', tier: 1, value: 1 },
    { id: 'stone',   name: 'Stone',        icon: '🪨', cat: 'natural', tier: 1, value: 1 },
    { id: 'fiber',   name: 'Fiber',        icon: '🌾', cat: 'natural', tier: 1, value: 1 },
    { id: 'sticks',  name: 'Sticks',       icon: '🥢', cat: 'natural', tier: 1, value: 1 },
    { id: 'water',   name: 'Fresh Water',  icon: '💧', cat: 'natural', tier: 1, value: 1, food: false },
    { id: 'fish',    name: 'Fish',         icon: '🐟', cat: 'natural', tier: 1, value: 2 },
    { id: 'fruit',   name: 'Wild Fruit',   icon: '🍍', cat: 'natural', tier: 1, value: 2 },
    { id: 'clay',    name: 'Clay',         icon: '🟤', cat: 'natural', tier: 2, value: 2 },
    { id: 'sand',    name: 'Sand',         icon: '⏳', cat: 'natural', tier: 2, value: 1 },
    { id: 'hide',    name: 'Animal Hide',  icon: '🟫', cat: 'natural', tier: 2, value: 3 },
    { id: 'meat',    name: 'Meat',         icon: '🍖', cat: 'natural', tier: 2, value: 3 },
    { id: 'crops',   name: 'Crops',        icon: '🌽', cat: 'natural', tier: 2, value: 2 },
    { id: 'ironore', name: 'Iron Ore',     icon: '⛏️', cat: 'natural', tier: 3, value: 4 },

    // ---- Advanced ----
    { id: 'lumber',   name: 'Lumber',      icon: '🟧', cat: 'advanced', tier: 2, value: 3 },
    { id: 'planks',   name: 'Planks',      icon: '🪟', cat: 'advanced', tier: 3, value: 5 },
    { id: 'rope',     name: 'Rope',        icon: '🪢', cat: 'advanced', tier: 2, value: 3 },
    { id: 'leather',  name: 'Leather',     icon: '🧳', cat: 'advanced', tier: 2, value: 4 },
    { id: 'cloth',    name: 'Cloth',       icon: '🧵', cat: 'advanced', tier: 3, value: 4 },
    { id: 'charcoal', name: 'Charcoal',    icon: '⚫', cat: 'advanced', tier: 2, value: 3 },
    { id: 'brick',    name: 'Bricks',      icon: '🧱', cat: 'advanced', tier: 3, value: 4 },
    { id: 'ironbar',  name: 'Iron Bars',   icon: '🔩', cat: 'advanced', tier: 3, value: 6 },
    { id: 'glass',    name: 'Glass',       icon: '🔷', cat: 'advanced', tier: 4, value: 7 },
    { id: 'steel',    name: 'Steel',       icon: '⚙️', cat: 'advanced', tier: 5, value: 12 },
    { id: 'tools',    name: 'Tools',       icon: '🛠️', cat: 'advanced', tier: 3, value: 6 },
    { id: 'bread',    name: 'Bread',       icon: '🍞', cat: 'advanced', tier: 3, value: 4 },
    { id: 'medicine', name: 'Medicine',    icon: '🧪', cat: 'advanced', tier: 4, value: 8 },

    // ---- Luxury ----
    { id: 'spice',    name: 'Spices',          icon: '🌶️', cat: 'luxury', tier: 4, value: 14 },
    { id: 'pearl',    name: 'Pearls',          icon: '🦪', cat: 'luxury', tier: 4, value: 18 },
    { id: 'rarewood', name: 'Rare Woods',      icon: '🌳', cat: 'luxury', tier: 5, value: 16 },
    { id: 'exoticpet',name: 'Exotic Animals',  icon: '🦜', cat: 'luxury', tier: 5, value: 22 },
    { id: 'gem',      name: 'Precious Minerals',icon: '💎', cat: 'luxury', tier: 6, value: 30 },

    // ---- Abstract currencies (not stored like normal resources for caps) ----
    { id: 'research', name: 'Research',     icon: '🔬', cat: 'abstract', tier: 1, value: 0, nocap: true },
    { id: 'coin',     name: 'Coin',         icon: '🪙', cat: 'abstract', tier: 1, value: 0, nocap: true },
  ];

  const byId = {};
  R.forEach((r) => { r.food = (CG.C.FOOD_RES.indexOf(r.id) >= 0); byId[r.id] = r; });

  CG.RESOURCES = R;
  CG.RES = byId;
  CG.resName = (id) => (byId[id] ? byId[id].name : id);
  CG.resIcon = (id) => (byId[id] ? byId[id].icon : '❓');
  CG.resValue = (id) => (byId[id] ? byId[id].value : 1);
})(typeof window !== 'undefined' ? window : globalThis);
