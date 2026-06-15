/* data/characters.js — the four named survivors, their scaling bonuses & skill trees.
 * Named survivors are also workers (population). They level from relevant work and
 * earn 1 skill point per level to spend in their tree. CG.charEffects() expands a
 * character's current bonuses into a flat effects[] consumed by the economy.
 */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});

  const CHARS = [
    {
      id: 'robin', name: 'Robin', role: 'Master Builder', icon: '👷', color: '#d98a4e',
      img: 'assets/robin.jpeg',
      blurb: 'Steady hands and an eye for structure. Robin can raise a building from a pile of logs faster than anyone — and make it last.',
      // jobs that grant Robin XP faster (affinity), and the bonus job for assignment hint
      affinity: ['build', 'mine_stone', 'woodcut'], favJob: 'build',
      // base per-level bonuses (apply while Robin is in the colony)
      base: [
        { type: 'build_speed', perLevelMult: 0.04 },
        { type: 'build_cost', perLevelMult: -0.012, floor: 0.6 },
      ],
      skills: [
        { id: 'r_carpenter', name: 'Master Carpenter', icon: '🔨', cost: 1, req: [], desc: '+15% build speed.', effects: [{ type: 'build_speed', mult: 1.15 }] },
        { id: 'r_efficient', name: 'Efficient Builder', icon: '📐', cost: 1, req: [], desc: '-10% building costs.', effects: [{ type: 'build_cost', mult: 0.9 }] },
        { id: 'r_foreman', name: 'Foreman', icon: '👥', cost: 2, req: ['r_carpenter'], desc: '+1 builder slot; +10% build speed.', effects: [{ type: 'station_add', job: 'build', slots: 1 }, { type: 'build_speed', mult: 1.1 }] },
        { id: 'r_quarry', name: 'Quarrymaster', icon: '⛏️', cost: 2, req: ['r_efficient'], desc: '+20% stone gathering.', effects: [{ type: 'prod_mult', job: 'mine_stone', mult: 1.2 }] },
        { id: 'r_architect', name: "Architect's Eye", icon: '🏛️', cost: 3, req: ['r_foreman'], desc: '+5 settlement morale; +15% build speed.', effects: [{ type: 'morale', amt: 5 }, { type: 'build_speed', mult: 1.15 }] },
        { id: 'r_monument', name: 'Monument Builder', icon: '🗿', cost: 4, req: ['r_architect', 'r_quarry'], desc: '+25% build speed; +4% all production.', effects: [{ type: 'build_speed', mult: 1.25 }, { type: 'global_prod', mult: 1.04 }] },
      ],
    },
    {
      id: 'lenni', name: 'Lenni', role: 'Researcher & Crafter', icon: '🔬', color: '#5a9bd4',
      img: 'assets/lenni.jpeg',
      blurb: 'Endlessly curious, Lenni turns scraps into tools and questions into knowledge. Research and crafting go faster wherever she works.',
      affinity: ['research', 'sawmill', 'smelt', 'blacksmith'], favJob: 'research',
      base: [
        { type: 'research_mult', perLevelMult: 0.04 },
        { type: 'tool_quality', perLevelMult: 0.02 },
        { type: 'global_prod', perLevelMult: 0.008 },
      ],
      skills: [
        { id: 'l_study', name: 'Quick Study', icon: '📖', cost: 1, req: [], desc: '+15% research.', effects: [{ type: 'research_mult', mult: 1.15 }] },
        { id: 'l_crafter', name: 'Master Crafter', icon: '🛠️', cost: 1, req: [], desc: '+5% all production.', effects: [{ type: 'global_prod', mult: 1.05 }] },
        { id: 'l_tools', name: 'Toolsmith', icon: '🔧', cost: 2, req: ['l_crafter'], desc: '+15% tool quality.', effects: [{ type: 'tool_quality', mult: 1.15 }] },
        { id: 'l_inventor', name: 'Inventor', icon: '💡', cost: 2, req: ['l_study'], desc: '+15% research; +1 research slot.', effects: [{ type: 'research_mult', mult: 1.15 }, { type: 'station_add', job: 'research', slots: 1 }] },
        { id: 'l_efficiency', name: 'Efficiency Expert', icon: '⚙️', cost: 3, req: ['l_tools'], desc: '+12% refinery output.', effects: [{ type: 'refine_mult', mult: 1.12 }] },
        { id: 'l_polymath', name: 'Polymath', icon: '🎓', cost: 4, req: ['l_inventor', 'l_efficiency'], desc: '+25% research; +10% worker training.', effects: [{ type: 'research_mult', mult: 1.25 }, { type: 'xp_mult', mult: 1.1 }] },
      ],
    },
    {
      id: 'leif', name: 'Leif', role: 'Hunter & Explorer', icon: '🏹', color: '#6aa84f',
      img: 'assets/leif.jpeg',
      blurb: 'Quiet and tireless, Leif reads the land like a book. Game falls to his bow and the island gives up its secrets to his expeditions.',
      affinity: ['hunt', 'forage', 'fish'], favJob: 'hunt',
      base: [
        { type: 'hunt_success', perLevelMult: 0.03 },
        { type: 'explore_speed', perLevelMult: 0.04 },
        { type: 'rare_chance', perLevelAdd: 0.005 },
      ],
      skills: [
        { id: 'f_tracker', name: 'Tracker', icon: '👣', cost: 1, req: [], desc: '+20% hunting.', effects: [{ type: 'prod_mult', job: 'hunt', mult: 1.2 }] },
        { id: 'f_pathfinder', name: 'Pathfinder', icon: '🧭', cost: 1, req: [], desc: '+25% exploration speed.', effects: [{ type: 'explore_speed', mult: 1.25 }] },
        { id: 'f_treasure', name: 'Treasure Hunter', icon: '💰', cost: 2, req: ['f_pathfinder'], desc: '+8% rare find chance.', effects: [{ type: 'rare_chance', add: 0.08 }] },
        { id: 'f_sharpshooter', name: 'Sharpshooter', icon: '🎯', cost: 2, req: ['f_tracker'], desc: '+15% meat & hide.', effects: [{ type: 'res_mult', res: 'meat', mult: 1.15 }, { type: 'res_mult', res: 'hide', mult: 1.15 }] },
        { id: 'f_survivalist', name: 'Survivalist', icon: '🏕️', cost: 3, req: ['f_treasure'], desc: '-25% expedition supply cost; +10% explore speed.', effects: [{ type: 'expedition_cost', mult: 0.75 }, { type: 'explore_speed', mult: 1.1 }] },
        { id: 'f_master', name: 'Master Explorer', icon: '🗺️', cost: 4, req: ['f_survivalist', 'f_sharpshooter'], desc: '+25% explore speed; +6% rare finds.', effects: [{ type: 'explore_speed', mult: 1.25 }, { type: 'rare_chance', add: 0.06 }] },
      ],
    },
    {
      id: 'erim', name: 'Erim', role: 'Trader & Organizer', icon: '⚖️', color: '#b07cc6',
      img: 'assets/erim.jpeg',
      blurb: 'A born organizer with a silver tongue. Erim keeps the stores full, the trades favorable, and the settlement in good spirits.',
      affinity: ['trade', 'dock', 'teach'], favJob: 'trade',
      base: [
        { type: 'trade_price', perLevelMult: 0.03 },
        { type: 'storage_mult', perLevelMult: 0.02 },
        { type: 'morale', perLevelAdd: 0.4 },
      ],
      skills: [
        { id: 'e_haggler', name: 'Haggler', icon: '💬', cost: 1, req: [], desc: '+15% trade prices.', effects: [{ type: 'trade_price', mult: 1.15 }] },
        { id: 'e_quarter', name: 'Quartermaster', icon: '🗃️', cost: 1, req: [], desc: '+20% storage.', effects: [{ type: 'storage_mult', mult: 1.2 }] },
        { id: 'e_morale', name: 'Morale Officer', icon: '🎺', cost: 2, req: ['e_quarter'], desc: '+6 settlement morale.', effects: [{ type: 'morale', amt: 6 }] },
        { id: 'e_merchant', name: 'Merchant Prince', icon: '👑', cost: 2, req: ['e_haggler'], desc: '+15% trade prices; +3 trade volume.', effects: [{ type: 'trade_price', mult: 1.15 }, { type: 'trade_volume', amt: 3 }] },
        { id: 'e_organizer', name: 'Organizer', icon: '📋', cost: 3, req: ['e_morale'], desc: '+5% all production.', effects: [{ type: 'global_prod', mult: 1.05 }] },
        { id: 'e_diplomat', name: 'Diplomat', icon: '🕊️', cost: 4, req: ['e_organizer', 'e_merchant'], desc: '+10 attractiveness; +15% population growth.', effects: [{ type: 'attract', amt: 10 }, { type: 'pop_growth', mult: 1.15 }] },
      ],
    },
  ];

  const byId = {};
  CHARS.forEach((c) => (byId[c.id] = c));
  CG.CHARS = CHARS;
  CG.CHAR = byId;

  // Expand a character's current bonuses (base scaling + unlocked skills) to effects[].
  CG.charEffects = function (char, level, unlocked) {
    const out = [];
    (char.base || []).forEach((b) => {
      if (b.perLevelMult != null) {
        let m = 1 + b.perLevelMult * level;
        if (b.floor != null) m = Math.max(b.floor, m);
        out.push({ type: b.type, job: b.job, res: b.res, need: b.need, mult: m });
      } else if (b.perLevelAdd != null) {
        out.push({ type: b.type, job: b.job, res: b.res, amt: b.perLevelAdd * level });
      }
    });
    (char.skills || []).forEach((s) => {
      if (unlocked && unlocked[s.id]) s.effects.forEach((e) => out.push(Object.assign({}, e)));
    });
    return out;
  };
})(typeof window !== 'undefined' ? window : globalThis);
