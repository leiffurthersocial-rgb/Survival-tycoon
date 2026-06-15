/* data/buildings.js — 60 buildings across all stages.
 * Schema in DESIGN.md. Refineries carry a `recipe` {inputs,outputs,rate(batches/s/worker)}.
 * provides.stations add job slots. effects[] are passive. requires gate availability.
 */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});

  const B = [
    // ===================== SURVIVAL =====================
    { id: 'campfire', name: 'Campfire', cat: 'survival', tier: 1, icon: '🔥',
      desc: 'Warmth, light and cooked food. The heart of any camp.',
      cost: { sticks: 5 }, buildTime: 8, maxLevel: 3, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { morale: 4 }, effects: [{ type: 'need_rate', need: 'energy', mult: 0.92 }],
      requires: { startUnlocked: true } },

    { id: 'leanto', name: 'Lean-To Shelter', cat: 'survival', tier: 1, icon: '⛺',
      desc: 'A crude shelter of branches and palm fronds. Keeps the rain off two souls.',
      cost: { sticks: 8, fiber: 6 }, buildTime: 12, maxLevel: 3, upCostMult: 1.7, upTimeMult: 1.4,
      provides: { housing: 2, morale: 2 }, effects: [], requires: { startUnlocked: true } },

    { id: 'water_collector', name: 'Water Collector', cat: 'survival', tier: 1, icon: '🪣',
      desc: 'Broad leaves funnel rain into hollow logs. A trickle of fresh water.',
      cost: { sticks: 6, fiber: 4, stone: 2 }, buildTime: 10, maxLevel: 4, upCostMult: 1.7, upTimeMult: 1.4,
      provides: { stations: [{ job: 'water', slots: 2 }], storage: { water: 30 } }, effects: [{ type: 'passive_res', res: 'water', amt: 0.04 }],
      requires: { startUnlocked: true } },

    { id: 'rain_catcher', name: 'Rain Catcher', cat: 'survival', tier: 2, icon: '🌧️',
      desc: 'A stretched hide basin that gathers water far faster than leaves.',
      cost: { wood: 10, fiber: 8, hide: 3 }, buildTime: 28, maxLevel: 4, upCostMult: 1.7, upTimeMult: 1.5,
      provides: { storage: { water: 60 } }, effects: [{ type: 'passive_res', res: 'water', amt: 0.10 }],
      requires: { tech: ['water_mgmt'] } },

    { id: 'herb_garden', name: 'Herb Garden', cat: 'survival', tier: 2, icon: '🌿',
      desc: 'Cultivated herbs for food variety and simple remedies.',
      cost: { wood: 8, fiber: 10 }, buildTime: 26, maxLevel: 3, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { morale: 3, storage: { fruit: 20 } }, effects: [{ type: 'passive_res', res: 'fruit', amt: 0.03 }],
      requires: { tech: ['foraging'] } },

    { id: 'thatch_hut', name: 'Thatch Hut', cat: 'survival', tier: 2, icon: '🛖',
      desc: 'Woven walls and a dry floor. A real roof at last.',
      cost: { wood: 14, fiber: 12, rope: 2 }, buildTime: 35, maxLevel: 3, upCostMult: 1.7, upTimeMult: 1.5,
      provides: { housing: 3, morale: 3 }, effects: [{ type: 'need_rate', need: 'health', mult: 1.1 }],
      requires: { tech: ['shelter'] } },

    // ===================== STORAGE =====================
    { id: 'storage_tent', name: 'Storage Tent', cat: 'storage', tier: 1, icon: '🎪',
      desc: 'A sailcloth tent to keep supplies out of the weather.',
      cost: { sticks: 6, fiber: 8 }, buildTime: 12, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { storageAll: 50 }, effects: [], requires: { startUnlocked: true } },

    { id: 'drying_rack', name: 'Drying Rack', cat: 'storage', tier: 1, icon: '🐟',
      desc: 'Sun-dries fish and meat so it keeps. More food from every catch.',
      cost: { sticks: 8, fiber: 6 }, buildTime: 18, maxLevel: 4, upCostMult: 1.7, upTimeMult: 1.4,
      provides: { storage: { fish: 25, meat: 15 } }, effects: [{ type: 'res_mult', res: 'fish', mult: 1.15 }, { type: 'res_mult', res: 'meat', mult: 1.15 }],
      requires: { tech: ['preservation'] } },

    { id: 'granary', name: 'Granary', cat: 'storage', tier: 2, icon: '🏚️',
      desc: 'A raised, vermin-proof store for food.',
      cost: { wood: 18, fiber: 10, stone: 6 }, buildTime: 40, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { storage: { fish: 60, fruit: 60, meat: 50, crops: 60, bread: 50 } }, effects: [],
      requires: { tech: ['preservation'] } },

    { id: 'warehouse', name: 'Warehouse', cat: 'storage', tier: 3, icon: '🏬',
      desc: 'Stout timber walls and shelving for the whole settlement.',
      cost: { lumber: 20, stone: 16, rope: 6 }, buildTime: 70, maxLevel: 5, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { storageAll: 160 }, effects: [], requires: { tech: ['logistics'] } },

    { id: 'silo', name: 'Silo', cat: 'storage', tier: 4, icon: '🏯',
      desc: 'A tall brick silo for bulk goods and grain.',
      cost: { brick: 24, lumber: 16, ironbar: 6 }, buildTime: 110, maxLevel: 5, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { storageAll: 320 }, effects: [{ type: 'storage_mult', mult: 1.05 }], requires: { tech: ['masonry'] } },

    { id: 'cold_cellar', name: 'Cold Cellar', cat: 'storage', tier: 3, icon: '🧊',
      desc: 'A stone-lined cellar that keeps food fresh far longer.',
      cost: { stone: 22, lumber: 10, clay: 8 }, buildTime: 64, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { storage: { fish: 80, meat: 80, fruit: 60, bread: 60, crops: 60 }, morale: 2 },
      effects: [{ type: 'res_mult', res: 'meat', mult: 1.1 }], requires: { tech: ['masonry'] } },

    // ===================== GATHERING BUILDINGS =====================
    { id: 'fishing_hut', name: 'Fishing Hut', cat: 'production', tier: 1, icon: '🎣',
      desc: 'A jetty and racks. Lets more survivors fish at once.',
      cost: { sticks: 8, fiber: 6, wood: 4 }, buildTime: 16, maxLevel: 4, upCostMult: 1.7, upTimeMult: 1.4,
      provides: { stations: [{ job: 'fish', slots: 2 }], storage: { fish: 20 } },
      effects: [{ type: 'prod_mult', job: 'fish', mult: 1.1 }], requires: { startUnlocked: true } },

    { id: 'gathering_post', name: 'Gathering Post', cat: 'production', tier: 1, icon: '🧺',
      desc: 'Baskets and tools to organize foraging parties.',
      cost: { sticks: 6, fiber: 8 }, buildTime: 16, maxLevel: 4, upCostMult: 1.7, upTimeMult: 1.4,
      provides: { stations: [{ job: 'forage', slots: 2 }] },
      effects: [{ type: 'prod_mult', job: 'forage', mult: 1.1 }], requires: { startUnlocked: true } },

    { id: 'woodcutter_camp', name: "Woodcutter's Camp", cat: 'production', tier: 1, icon: '🪓',
      desc: 'A felling camp at the forest edge. Unlocks cutting wood.',
      cost: { sticks: 8, stone: 4, fiber: 4 }, buildTime: 20, maxLevel: 4, upCostMult: 1.7, upTimeMult: 1.4,
      provides: { stations: [{ job: 'woodcut', slots: 2 }] },
      effects: [{ type: 'unlock_job', job: 'woodcut' }, { type: 'prod_mult', job: 'woodcut', mult: 1.1 }],
      requires: { region: ['palmforest'] } },

    { id: 'quarry', name: 'Stone Quarry', cat: 'production', tier: 2, icon: '⛏️',
      desc: 'A worked rock face. Steady stone for building.',
      cost: { wood: 10, sticks: 6, tools: 1 }, buildTime: 38, maxLevel: 5, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { stations: [{ job: 'mine_stone', slots: 3 }] },
      effects: [{ type: 'prod_mult', job: 'mine_stone', mult: 1.2 }], requires: { tech: ['stoneworking'] } },

    { id: 'hunter_cabin', name: 'Hunter Cabin', cat: 'production', tier: 2, icon: '🏹',
      desc: 'A base for hunting parties. Meat and hide from the wilds.',
      cost: { wood: 14, rope: 4, fiber: 6 }, buildTime: 40, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { stations: [{ job: 'hunt', slots: 2 }] },
      effects: [{ type: 'unlock_job', job: 'hunt' }, { type: 'hunt_success', mult: 1.15 }],
      requires: { tech: ['hunting'], region: ['palmforest'] } },

    { id: 'clay_pit', name: 'Clay Pit', cat: 'production', tier: 2, icon: '🪏',
      desc: 'Dig clay from the riverbank for pottery and brick.',
      cost: { wood: 8, tools: 1, rope: 2 }, buildTime: 36, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { stations: [{ job: 'dig_clay', slots: 2 }] },
      effects: [{ type: 'unlock_job', job: 'dig_clay', }, { type: 'prod_mult', job: 'dig_clay', mult: 1.15 }],
      requires: { tech: ['pottery'], region: ['river'] } },

    { id: 'sand_pit', name: 'Sand Pit', cat: 'production', tier: 2, icon: '🏖️',
      desc: 'Organized sand gathering for glass and mortar.',
      cost: { wood: 8, sticks: 6 }, buildTime: 30, maxLevel: 4, upCostMult: 1.7, upTimeMult: 1.4,
      provides: { stations: [{ job: 'dig_sand', slots: 2 }] },
      effects: [{ type: 'prod_mult', job: 'dig_sand', mult: 1.2 }], requires: { tech: ['stoneworking'] } },

    { id: 'fishing_dock', name: 'Fishing Docks', cat: 'production', tier: 3, icon: '⚓',
      desc: 'Real boats and deep-water nets. A major source of food.',
      cost: { lumber: 18, rope: 10, planks: 6 }, buildTime: 80, maxLevel: 5, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { stations: [{ job: 'fish', slots: 4 }], storage: { fish: 60 } },
      effects: [{ type: 'prod_mult', job: 'fish', mult: 1.4 }], requires: { tech: ['boating'] } },

    { id: 'pearl_dock', name: 'Pearl Diving Dock', cat: 'production', tier: 5, icon: '🤿',
      desc: 'Divers work the northern reef for pearls.',
      cost: { planks: 16, rope: 12, glass: 6 }, buildTime: 130, maxLevel: 4, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { stations: [{ job: 'pearl_dive', slots: 3 }] },
      effects: [{ type: 'unlock_job', job: 'pearl_dive' }, { type: 'prod_mult', job: 'pearl_dive', mult: 1.3 }],
      requires: { tech: ['pearl_diving'], region: ['northcoast'] } },

    // ===================== FARMING =====================
    { id: 'farm_plot', name: 'Farm Plot', cat: 'production', tier: 2, icon: '🌱',
      desc: 'Cleared, tilled soil. The first true agriculture.',
      cost: { wood: 10, fiber: 8, tools: 1 }, buildTime: 40, maxLevel: 5, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { stations: [{ job: 'farm', slots: 2 }] },
      effects: [{ type: 'unlock_job', job: 'farm' }, { type: 'prod_mult', job: 'farm', mult: 1.1 }],
      requires: { tech: ['agriculture'] } },

    { id: 'orchard', name: 'Orchard', cat: 'production', tier: 3, icon: '🍎',
      desc: 'Rows of fruit trees. Sweet, reliable food.',
      cost: { lumber: 12, fiber: 10, rope: 4 }, buildTime: 62, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { storage: { fruit: 60 } }, effects: [{ type: 'passive_res', res: 'fruit', amt: 0.16 }, { type: 'morale', amt: 2 }],
      requires: { tech: ['horticulture'] } },

    { id: 'plantation', name: 'Plantation', cat: 'production', tier: 4, icon: '🌾',
      desc: 'Large-scale fields worked by many hands.',
      cost: { lumber: 22, brick: 10, tools: 6 }, buildTime: 120, maxLevel: 5, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { stations: [{ job: 'farm', slots: 5 }], storage: { crops: 80 } },
      effects: [{ type: 'prod_mult', job: 'farm', mult: 1.5 }], requires: { tech: ['crop_rotation'] } },

    { id: 'spice_garden', name: 'Spice Garden', cat: 'production', tier: 5, icon: '🌶️',
      desc: 'Carefully cultivated spices — valuable trade goods.',
      cost: { lumber: 16, brick: 10, glass: 6 }, buildTime: 130, maxLevel: 4, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { storage: { spice: 40 }, morale: 2 }, effects: [{ type: 'passive_res', res: 'spice', amt: 0.05 }],
      requires: { tech: ['botany'] } },

    { id: 'well', name: 'Well', cat: 'production', tier: 2, icon: '🕳️',
      desc: 'A dug well taps the water table. Reliable fresh water.',
      cost: { stone: 16, wood: 8, rope: 4 }, buildTime: 44, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { stations: [{ job: 'water', slots: 3 }], storage: { water: 80 } }, effects: [{ type: 'passive_res', res: 'water', amt: 0.18 }],
      requires: { tech: ['water_mgmt'] } },

    { id: 'windmill', name: 'Windmill', cat: 'industry', tier: 4, icon: '🌬️',
      desc: 'Wind-driven stones boost grinding and baking.',
      cost: { lumber: 20, planks: 8, ironbar: 6, cloth: 6 }, buildTime: 115, maxLevel: 4, upCostMult: 1.9, upTimeMult: 1.6,
      provides: {}, effects: [{ type: 'prod_mult', job: 'bakery', mult: 1.3 }, { type: 'prod_mult', job: 'farm', mult: 1.15 }],
      requires: { tech: ['milling'] } },

    // ===================== REFINERIES / INDUSTRY =====================
    { id: 'workshop', name: 'Workshop', cat: 'industry', tier: 2, icon: '🔧',
      desc: 'Workbenches for crafting and the first research.',
      cost: { wood: 14, stone: 8, fiber: 6 }, buildTime: 42, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { stations: [{ job: 'research', slots: 1 }, { job: 'sawmill', slots: 1 }] },
      effects: [{ type: 'unlock_job', job: 'research' }, { type: 'unlock_job', job: 'sawmill' }],
      recipe: { job: 'sawmill', inputs: { wood: 2 }, outputs: { lumber: 1 }, rate: 0.10 },
      requires: { tech: ['toolmaking'] } },

    { id: 'lumber_mill', name: 'Lumber Mill', cat: 'industry', tier: 3, icon: '🪚',
      desc: 'Saw pits and frames turn logs into lumber and planks.',
      cost: { wood: 20, stone: 10, tools: 3 }, buildTime: 66, maxLevel: 5, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { stations: [{ job: 'sawmill', slots: 3 }] },
      recipe: { job: 'sawmill', inputs: { wood: 2 }, outputs: { lumber: 1 }, rate: 0.16 },
      effects: [{ type: 'prod_mult', job: 'sawmill', mult: 1.3 }], requires: { tech: ['sawmilling'] } },

    { id: 'plank_mill', name: 'Plank Mill', cat: 'industry', tier: 4, icon: '🪟',
      desc: 'Precision sawing produces fine planks for advanced building.',
      cost: { lumber: 18, ironbar: 6, tools: 4 }, buildTime: 100, maxLevel: 4, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { stations: [{ job: 'sawmill', slots: 2 }] },
      recipe: { job: 'sawmill', inputs: { lumber: 2 }, outputs: { planks: 1 }, rate: 0.12 },
      effects: [], requires: { tech: ['joinery'] } },

    { id: 'ropewalk', name: 'Ropewalk', cat: 'industry', tier: 2, icon: '🧶',
      desc: 'A long shed where fiber is twisted into strong rope.',
      cost: { wood: 10, fiber: 14 }, buildTime: 40, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { stations: [{ job: 'ropewalk', slots: 2 }] },
      recipe: { job: 'ropewalk', inputs: { fiber: 3 }, outputs: { rope: 1 }, rate: 0.12 },
      effects: [{ type: 'unlock_job', job: 'ropewalk' }], requires: { tech: ['weaving'] } },

    { id: 'weavery', name: "Weaver's Loom", cat: 'industry', tier: 3, icon: '🧵',
      desc: 'Looms turn fiber into cloth for clothing and sails.',
      cost: { lumber: 12, rope: 6, tools: 2 }, buildTime: 64, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { stations: [{ job: 'weaver', slots: 2 }] },
      recipe: { job: 'weaver', inputs: { fiber: 4 }, outputs: { cloth: 1 }, rate: 0.10 },
      effects: [{ type: 'unlock_job', job: 'weaver' }], requires: { tech: ['textiles'] } },

    { id: 'tannery', name: 'Tannery', cat: 'industry', tier: 3, icon: '🥾',
      desc: 'Pits and racks cure hide into durable leather.',
      cost: { wood: 14, stone: 8, rope: 4 }, buildTime: 66, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { stations: [{ job: 'tannery', slots: 2 }] },
      recipe: { job: 'tannery', inputs: { hide: 2 }, outputs: { leather: 1 }, rate: 0.10 },
      effects: [{ type: 'unlock_job', job: 'tannery' }], requires: { tech: ['tanning'] } },

    { id: 'charcoal_kiln', name: 'Charcoal Kiln', cat: 'industry', tier: 3, icon: '🔥',
      desc: 'Smolders wood into charcoal — fuel for the forge.',
      cost: { stone: 16, clay: 8, wood: 10 }, buildTime: 60, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { stations: [{ job: 'charcoal', slots: 2 }] },
      recipe: { job: 'charcoal', inputs: { wood: 3 }, outputs: { charcoal: 1 }, rate: 0.12 },
      effects: [{ type: 'unlock_job', job: 'charcoal' }], requires: { tech: ['pyrotechnics'] } },

    { id: 'brick_kiln', name: 'Brick Kiln', cat: 'industry', tier: 3, icon: '🧱',
      desc: 'Fires clay into hard bricks for permanent buildings.',
      cost: { stone: 18, clay: 12, wood: 8 }, buildTime: 70, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { stations: [{ job: 'kiln', slots: 2 }] },
      recipe: { job: 'kiln', inputs: { clay: 2, sand: 1 }, outputs: { brick: 1 }, rate: 0.10 },
      effects: [{ type: 'unlock_job', job: 'kiln' }], requires: { tech: ['masonry'] } },

    { id: 'smelter', name: 'Smelter', cat: 'industry', tier: 4, icon: '🌋',
      desc: 'A clay furnace that smelts iron ore into bars.',
      cost: { brick: 16, stone: 12, charcoal: 8 }, buildTime: 100, maxLevel: 5, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { stations: [{ job: 'smelt', slots: 2 }] },
      recipe: { job: 'smelt', inputs: { ironore: 2, charcoal: 1 }, outputs: { ironbar: 1 }, rate: 0.09 },
      effects: [{ type: 'unlock_job', job: 'smelt' }], requires: { tech: ['smelting'] } },

    { id: 'blacksmith', name: 'Blacksmith', cat: 'industry', tier: 4, icon: '⚒️',
      desc: 'Anvil and forge produce the tools everything else depends on.',
      cost: { brick: 14, ironbar: 8, charcoal: 6 }, buildTime: 105, maxLevel: 5, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { stations: [{ job: 'blacksmith', slots: 2 }] },
      recipe: { job: 'blacksmith', inputs: { ironbar: 1, charcoal: 1 }, outputs: { tools: 1 }, rate: 0.07 },
      effects: [{ type: 'unlock_job', job: 'blacksmith' }, { type: 'tool_quality', mult: 1.15 }], requires: { tech: ['blacksmithing'] } },

    { id: 'toolsmith', name: 'Toolsmith', cat: 'industry', tier: 3, icon: '🛠️',
      desc: 'Early bench for shaping stone and bone into basic tools.',
      cost: { wood: 12, stone: 14, fiber: 6 }, buildTime: 58, maxLevel: 3, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { stations: [{ job: 'blacksmith', slots: 1 }] },
      recipe: { job: 'blacksmith', inputs: { wood: 2, stone: 2 }, outputs: { tools: 1 }, rate: 0.05 },
      effects: [{ type: 'unlock_job', job: 'blacksmith' }], requires: { tech: ['toolmaking'] } },

    { id: 'glassworks', name: 'Glassworks', cat: 'industry', tier: 4, icon: '🔷',
      desc: 'Melts sand into clear glass for windows and instruments.',
      cost: { brick: 16, charcoal: 8, ironbar: 4 }, buildTime: 110, maxLevel: 4, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { stations: [{ job: 'glassworks', slots: 2 }] },
      recipe: { job: 'glassworks', inputs: { sand: 3, charcoal: 1 }, outputs: { glass: 1 }, rate: 0.08 },
      effects: [{ type: 'unlock_job', job: 'glassworks' }], requires: { tech: ['glassmaking'] } },

    { id: 'steel_mill', name: 'Steel Mill', cat: 'industry', tier: 5, icon: '🏭',
      desc: 'High heat fuses iron and charcoal into strong steel.',
      cost: { brick: 24, ironbar: 16, glass: 6 }, buildTime: 160, maxLevel: 5, upCostMult: 2.0, upTimeMult: 1.7,
      provides: { stations: [{ job: 'steelworks', slots: 2 }] },
      recipe: { job: 'steelworks', inputs: { ironbar: 2, charcoal: 2 }, outputs: { steel: 1 }, rate: 0.06 },
      effects: [{ type: 'unlock_job', job: 'steelworks' }], requires: { tech: ['metallurgy'] } },

    { id: 'bakery', name: 'Bakery', cat: 'industry', tier: 3, icon: '🍞',
      desc: 'Ovens turn crops into bread — filling and morale-boosting.',
      cost: { brick: 12, stone: 8, lumber: 6 }, buildTime: 70, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { stations: [{ job: 'bakery', slots: 2 }], morale: 2 },
      recipe: { job: 'bakery', inputs: { crops: 2 }, outputs: { bread: 1 }, rate: 0.10 },
      effects: [{ type: 'unlock_job', job: 'bakery' }], requires: { tech: ['baking'] } },

    { id: 'apothecary', name: 'Apothecary', cat: 'industry', tier: 4, icon: '⚗️',
      desc: 'Distills medicine from herbs and fruit to keep settlers healthy.',
      cost: { lumber: 14, glass: 6, brick: 8 }, buildTime: 105, maxLevel: 4, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { stations: [{ job: 'apothecary', slots: 2 }] },
      recipe: { job: 'apothecary', inputs: { fruit: 3, water: 2 }, outputs: { medicine: 1 }, rate: 0.06 },
      effects: [{ type: 'unlock_job', job: 'apothecary' }], requires: { tech: ['medicine'] } },

    // ===================== HOUSING =====================
    { id: 'thatch_house', name: 'Thatch House', cat: 'housing', tier: 2, icon: '🏠',
      desc: 'A sturdy family home of timber and thatch.',
      cost: { wood: 16, fiber: 12, rope: 4 }, buildTime: 46, maxLevel: 3, upCostMult: 1.7, upTimeMult: 1.5,
      provides: { housing: 4, morale: 1 }, effects: [], requires: { tech: ['carpentry'] } },

    { id: 'log_cabin', name: 'Log Cabin', cat: 'housing', tier: 3, icon: '🛖',
      desc: 'Warm, solid log walls. Comfortable lodging.',
      cost: { lumber: 18, rope: 6, stone: 8 }, buildTime: 70, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { housing: 6, morale: 2 }, effects: [], requires: { tech: ['carpentry'] } },

    { id: 'cottage', name: 'Cottage', cat: 'housing', tier: 4, icon: '🏡',
      desc: 'A brick cottage with a garden. Settlers love it.',
      cost: { brick: 18, lumber: 12, glass: 4 }, buildTime: 110, maxLevel: 4, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { housing: 8, morale: 4 }, effects: [], requires: { tech: ['architecture'] } },

    { id: 'longhouse', name: 'Longhouse', cat: 'housing', tier: 3, icon: '🏘️',
      desc: 'Communal lodging that houses many at once.',
      cost: { lumber: 24, rope: 10, stone: 12 }, buildTime: 90, maxLevel: 4, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { housing: 10 }, effects: [], requires: { tech: ['carpentry'] } },

    { id: 'townhouse', name: 'Townhouse', cat: 'housing', tier: 5, icon: '🏢',
      desc: 'Multi-storey housing for a dense, thriving town.',
      cost: { brick: 28, planks: 14, glass: 8, steel: 4 }, buildTime: 150, maxLevel: 5, upCostMult: 2.0, upTimeMult: 1.7,
      provides: { housing: 16, morale: 3 }, effects: [], requires: { tech: ['urban_planning'] } },

    { id: 'manor', name: 'Island Manor', cat: 'housing', tier: 6, icon: '🏰',
      desc: 'A grand residence — proof of the colony\'s prosperity.',
      cost: { brick: 36, planks: 20, glass: 14, steel: 8 }, buildTime: 200, maxLevel: 3, upCostMult: 2.0, upTimeMult: 1.7,
      provides: { housing: 20, morale: 8 }, effects: [{ type: 'pop_growth', mult: 1.1 }], requires: { tech: ['grand_architecture'] } },

    // ===================== CIVIC =====================
    { id: 'town_hall', name: 'Town Hall', cat: 'civic', tier: 3, icon: '🏛️',
      desc: 'The seat of the settlement. Boosts morale and draws settlers.',
      cost: { lumber: 20, stone: 16, rope: 6 }, buildTime: 90, maxLevel: 4, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { morale: 8 }, effects: [{ type: 'attract', amt: 6 }, { type: 'pop_growth', mult: 1.1 }],
      requires: { tech: ['governance'] } },

    { id: 'school', name: 'School', cat: 'civic', tier: 4, icon: '🏫',
      desc: 'Teaches settlers, speeding research and worker training.',
      cost: { brick: 16, planks: 10, glass: 6 }, buildTime: 120, maxLevel: 4, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { stations: [{ job: 'teach', slots: 2 }, { job: 'research', slots: 2 }] },
      effects: [{ type: 'unlock_job', job: 'teach' }, { type: 'research_mult', mult: 1.15 }, { type: 'xp_mult', mult: 1.2 }],
      requires: { tech: ['education'] } },

    { id: 'library', name: 'Library', cat: 'civic', tier: 5, icon: '📚',
      desc: 'A repository of knowledge. Greatly accelerates research.',
      cost: { brick: 20, planks: 16, glass: 10 }, buildTime: 150, maxLevel: 4, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { stations: [{ job: 'research', slots: 3 }] },
      effects: [{ type: 'research_mult', mult: 1.3 }], requires: { tech: ['scholarship'] } },

    { id: 'clinic', name: 'Infirmary', cat: 'civic', tier: 4, icon: '🏥',
      desc: 'Treats the sick and injured. Cures disease faster.',
      cost: { lumber: 16, brick: 10, cloth: 6 }, buildTime: 110, maxLevel: 4, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { morale: 3 }, effects: [{ type: 'need_rate', need: 'health', mult: 1.4 }, { type: 'heal_rate', mult: 1.5 }],
      requires: { tech: ['medicine'] } },

    { id: 'tavern', name: 'Tavern', cat: 'civic', tier: 3, icon: '🍺',
      desc: 'Food, drink and company. A big lift to morale.',
      cost: { lumber: 16, stone: 10, fiber: 8 }, buildTime: 80, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { morale: 8 }, effects: [{ type: 'food_variety', amt: 1 }], requires: { tech: ['brewing'] } },

    { id: 'plaza', name: 'Village Plaza', cat: 'civic', tier: 3, icon: '⛲',
      desc: 'An open square where settlers gather. Lifts the whole community.',
      cost: { stone: 18, brick: 8, lumber: 6 }, buildTime: 76, maxLevel: 3, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { morale: 6 }, effects: [{ type: 'attract', amt: 4 }], requires: { tech: ['governance'] } },

    { id: 'shrine', name: 'Shrine', cat: 'civic', tier: 2, icon: '⛩️',
      desc: 'A quiet place for reflection and hope.',
      cost: { stone: 10, wood: 8, fiber: 4 }, buildTime: 40, maxLevel: 3, upCostMult: 1.7, upTimeMult: 1.5,
      provides: { morale: 5 }, effects: [], requires: { tech: ['governance'] } },

    { id: 'observatory', name: 'Observatory', cat: 'civic', tier: 6, icon: '🔭',
      desc: 'Charts stars and seasons — research and foresight of events.',
      cost: { brick: 24, glass: 16, steel: 8 }, buildTime: 180, maxLevel: 3, upCostMult: 2.0, upTimeMult: 1.7,
      provides: { stations: [{ job: 'research', slots: 2 }] },
      effects: [{ type: 'research_mult', mult: 1.25 }, { type: 'foresight', amt: 1 }], requires: { tech: ['astronomy'] } },

    { id: 'botanical_garden', name: 'Botanical Garden', cat: 'civic', tier: 6, icon: '🌺',
      desc: 'A curated garden of island flora. Beauty and rare specimens.',
      cost: { brick: 18, glass: 12, planks: 10 }, buildTime: 170, maxLevel: 3, upCostMult: 2.0, upTimeMult: 1.7,
      provides: { morale: 10, storage: { spice: 30, exoticpet: 10 } },
      effects: [{ type: 'attract', amt: 8 }, { type: 'passive_res', res: 'spice', amt: 0.04 }], requires: { tech: ['botany'] } },

    // ===================== TRADE =====================
    { id: 'market', name: 'Market', cat: 'trade', tier: 3, icon: '🏪',
      desc: 'Stalls for buying and selling. Coin begins to flow.',
      cost: { lumber: 14, fiber: 10, rope: 4 }, buildTime: 70, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: { stations: [{ job: 'trade', slots: 2 }] },
      effects: [{ type: 'unlock_job', job: 'trade' }, { type: 'trade_price', mult: 1.1 }], requires: { tech: ['trade'] } },

    { id: 'trade_depot', name: 'Trade Depot', cat: 'trade', tier: 4, icon: '📦',
      desc: 'Bulk storage and ledgers for serious commerce.',
      cost: { brick: 16, planks: 10, rope: 8 }, buildTime: 120, maxLevel: 4, upCostMult: 1.9, upTimeMult: 1.6,
      provides: { stations: [{ job: 'trade', slots: 2 }], storageAll: 80 },
      effects: [{ type: 'trade_price', mult: 1.15 }, { type: 'trade_volume', amt: 2 }], requires: { tech: ['commerce'] } },

    { id: 'harbor', name: 'Harbor', cat: 'trade', tier: 5, icon: '🚢',
      desc: 'Deep-water docks for trade ships. The colony joins the wider world.',
      cost: { planks: 24, stone: 20, ironbar: 10, rope: 12 }, buildTime: 180, maxLevel: 5, upCostMult: 2.0, upTimeMult: 1.7,
      provides: { stations: [{ job: 'dock', slots: 3 }, { job: 'trade', slots: 2 }], morale: 4 },
      effects: [{ type: 'unlock_job', job: 'dock' }, { type: 'trade_price', mult: 1.25 }, { type: 'attract', amt: 8 }, { type: 'trade_volume', amt: 4 }],
      requires: { tech: ['seafaring'] } },

    { id: 'shipyard', name: 'Shipyard', cat: 'trade', tier: 5, icon: '🛳️',
      desc: 'Builds and maintains ships — faster expeditions and export capacity.',
      cost: { planks: 26, ironbar: 12, rope: 14, cloth: 8 }, buildTime: 185, maxLevel: 4, upCostMult: 2.0, upTimeMult: 1.7,
      provides: {}, effects: [{ type: 'explore_speed', mult: 1.4 }, { type: 'trade_volume', amt: 3 }],
      requires: { tech: ['shipbuilding'] } },

    { id: 'lighthouse', name: 'Lighthouse', cat: 'trade', tier: 5, icon: '🗼',
      desc: 'Guides ships safely in — and draws castaways and traders alike.',
      cost: { stone: 28, brick: 16, glass: 10, steel: 4 }, buildTime: 170, maxLevel: 3, upCostMult: 2.0, upTimeMult: 1.7,
      provides: { morale: 4 }, effects: [{ type: 'attract', amt: 10 }, { type: 'explore_speed', mult: 1.2 }, { type: 'pop_growth', mult: 1.15 }],
      requires: { tech: ['navigation'] } },

    // ===================== SPECIAL / ENDGAME =====================
    { id: 'expedition_camp', name: 'Expedition Camp', cat: 'special', tier: 2, icon: '🧭',
      desc: 'Outfits explorers for longer, safer journeys.',
      cost: { wood: 12, rope: 6, fiber: 8 }, buildTime: 44, maxLevel: 4, upCostMult: 1.8, upTimeMult: 1.5,
      provides: {}, effects: [{ type: 'explore_speed', mult: 1.2 }, { type: 'rare_chance', add: 0.04 }],
      requires: { tech: ['exploration'] } },

    { id: 'grand_hall', name: 'Grand Hall', cat: 'special', tier: 6, icon: '🏟️',
      desc: 'A magnificent hall for festivals and assemblies.',
      cost: { brick: 30, planks: 20, steel: 8, glass: 10 }, buildTime: 210, maxLevel: 3, upCostMult: 2.0, upTimeMult: 1.7,
      provides: { morale: 14 }, effects: [{ type: 'attract', amt: 10 }, { type: 'global_prod', mult: 1.05 }],
      requires: { tech: ['civics'] } },

    { id: 'grand_monument', name: 'Grand Monument', cat: 'special', tier: 7, icon: '🗿',
      desc: 'The crowning achievement — a monument to all you have built. Completing it wins the game.',
      cost: { steel: 40, brick: 60, planks: 40, glass: 30, gem: 12, pearl: 10 }, buildTime: 400, maxLevel: 1, upCostMult: 1, upTimeMult: 1,
      provides: { morale: 25 }, effects: [{ type: 'global_prod', mult: 1.1 }, { type: 'victory' }],
      requires: { tech: ['monumental_works'] } },
  ];

  const byId = {};
  B.forEach((b) => {
    b.maxLevel = b.maxLevel || 1;
    if (b.id !== 'grand_monument') b.maxLevel = Math.max(b.maxLevel, 6); // build once, upgrade many times
    b.upCostMult = b.upCostMult || 1.8;
    b.upTimeMult = b.upTimeMult || 1.5;
    b.provides = b.provides || {};
    b.effects = b.effects || [];
    b.requires = b.requires || {};
    byId[b.id] = b;
  });

  CG.BUILDINGS = B;
  CG.BLD = byId;
})(typeof window !== 'undefined' ? window : globalThis);
