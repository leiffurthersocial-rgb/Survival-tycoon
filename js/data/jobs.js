/* data/jobs.js — job/station definitions. Production jobs workers can be assigned to.
 * Raw gather jobs use BASE_PROD; refinery jobs use recipes (inputs->outputs) defined here or via tech.
 */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});

  // kind: 'gather' (uses BASE_PROD), 'refine' (recipe), 'service' (special effect), 'build', 'research', 'explore'
  const JOBS = [
    { id: 'forage',    name: 'Forager',       icon: '🧺', kind: 'gather', desc: 'Collect fiber, sticks and wild fruit by hand.', baseUnlocked: true, region: 'beach' },
    { id: 'water',     name: 'Water Carrier', icon: '🪣', kind: 'gather', desc: 'Carry fresh water from pools and rain catches.', baseUnlocked: true, region: 'beach' },
    { id: 'fish',      name: 'Fisher',        icon: '🎣', kind: 'gather', desc: 'Catch fish from the shallows.', baseUnlocked: true, region: 'beach' },
    { id: 'woodcut',   name: 'Woodcutter',    icon: '🪓', kind: 'gather', desc: 'Fell trees for wood.', baseUnlocked: false, region: 'palmforest' },
    { id: 'mine_stone',name: 'Stone Gatherer',icon: '⛏️', kind: 'gather', desc: 'Gather stone from outcrops.', baseUnlocked: true, region: 'beach' },
    { id: 'dig_clay',  name: 'Clay Digger',   icon: '🪏', kind: 'gather', desc: 'Dig clay from the riverbank.', baseUnlocked: false, region: 'river' },
    { id: 'dig_sand',  name: 'Sand Gatherer', icon: '🏖️', kind: 'gather', desc: 'Scoop sand from the beach.', baseUnlocked: true, region: 'beach' },
    { id: 'hunt',      name: 'Hunter',        icon: '🏹', kind: 'gather', desc: 'Hunt wild game for meat and hide.', baseUnlocked: false, region: 'palmforest' },
    { id: 'farm',      name: 'Farmer',        icon: '🌱', kind: 'gather', desc: 'Tend crops on cleared plots.', baseUnlocked: false },
    { id: 'pearl_dive',name: 'Pearl Diver',   icon: '🤿', kind: 'gather', desc: 'Dive the reef for pearls.', baseUnlocked: false, region: 'northcoast' },

    { id: 'build',     name: 'Builder',       icon: '🔨', kind: 'build', desc: 'Construct and upgrade buildings in the queue.', baseUnlocked: true },
    { id: 'research',  name: 'Researcher',    icon: '🔬', kind: 'research', desc: 'Generate research toward new knowledge.', baseUnlocked: false },
    { id: 'teach',     name: 'Teacher',       icon: '📚', kind: 'service', desc: 'Train workers faster (boosts XP gain).', baseUnlocked: false },
    { id: 'trade',     name: 'Merchant',      icon: '💰', kind: 'service', desc: 'Run the market for better trade flow.', baseUnlocked: false },
    { id: 'dock',      name: 'Dockworker',    icon: '⚓', kind: 'service', desc: 'Operate docks and shipping.', baseUnlocked: false },

    // Refineries (recipes provided by their buildings; listed for assignment UI)
    { id: 'sawmill',   name: 'Sawyer',        icon: '🪚', kind: 'refine', desc: 'Saw wood into lumber and planks.', baseUnlocked: false },
    { id: 'ropewalk',  name: 'Ropemaker',     icon: '🧶', kind: 'refine', desc: 'Twist fiber into rope.', baseUnlocked: false },
    { id: 'tannery',   name: 'Tanner',        icon: '🥾', kind: 'refine', desc: 'Tan hide into leather.', baseUnlocked: false },
    { id: 'charcoal',  name: 'Charcoal Burner',icon:'🔥', kind: 'refine', desc: 'Burn wood into charcoal.', baseUnlocked: false },
    { id: 'kiln',      name: 'Brickmaker',    icon: '🧱', kind: 'refine', desc: 'Fire clay into bricks.', baseUnlocked: false },
    { id: 'smelt',     name: 'Smelter',       icon: '🌋', kind: 'refine', desc: 'Smelt iron ore into bars.', baseUnlocked: false },
    { id: 'blacksmith',name: 'Blacksmith',    icon: '⚒️', kind: 'refine', desc: 'Forge iron into tools.', baseUnlocked: false },
    { id: 'glassworks',name: 'Glassblower',   icon: '🔥', kind: 'refine', desc: 'Melt sand into glass.', baseUnlocked: false },
    { id: 'steelworks',name: 'Steelworker',   icon: '🏭', kind: 'refine', desc: 'Combine iron and charcoal into steel.', baseUnlocked: false },
    { id: 'bakery',    name: 'Baker',         icon: '👨‍🍳', kind: 'refine', desc: 'Bake crops into bread.', baseUnlocked: false },
    { id: 'weaver',    name: 'Weaver',        icon: '🧷', kind: 'refine', desc: 'Weave fiber into cloth.', baseUnlocked: false },
    { id: 'apothecary',name: 'Apothecary',    icon: '⚗️', kind: 'refine', desc: 'Brew medicine from herbs and fruit.', baseUnlocked: false },
  ];

  const byId = {};
  JOBS.forEach((j) => (byId[j.id] = j));
  CG.JOBS = JOBS;
  CG.JOB = byId;
  CG.jobName = (id) => (byId[id] ? byId[id].name : id);
  CG.jobIcon = (id) => (byId[id] ? byId[id].icon : '👤');
})(typeof window !== 'undefined' ? window : globalThis);
