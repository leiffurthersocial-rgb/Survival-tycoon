/* data/quests.js — quests */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const QUESTS = [
    // ============================================================
    // MAIN LINE — the narrative spine. Sequential: each requires the
    // previous via requires.quest, and gates by requires.stage.
    // Shipwreck survival -> permanent camp -> village -> growing
    // settlement -> colony -> island town -> Grand Monument (victory).
    // Sets flags consumed by character lines and hidden quests.
    // ============================================================
    { id:'m_first_fire', name:'First Flames', line:'main', icon:'🔥',
      desc:'The ship is gone and night is coming. Fire means warmth, safety and cooked food. Build a campfire before darkness falls on the wreck.',
      objectives:[ {type:'build', building:'campfire', amt:1} ],
      rewards:[ {type:'resource',res:'fish',amt:6}, {type:'morale',amt:5} ],
      reward_text:'+6 fish, +5 morale', next:['m_water'] },

    { id:'m_water', name:'Clean Water', line:'main', icon:'💧',
      desc:'Salt water will kill you slowly. Robin rigs broad leaves into a collector — set one up and gather your first fresh water.',
      requires:{ quest:['m_first_fire'] },
      objectives:[ {type:'build', building:'water_collector', amt:1}, {type:'have_res', res:'water', amt:20} ],
      rewards:[ {type:'research',amt:8}, {type:'morale',amt:3} ],
      reward_text:'+8 research, +3 morale', next:['m_shelter'] },

    { id:'m_shelter', name:'A Roof of Sorts', line:'main', icon:'⛺',
      desc:'Sleeping on bare sand drains the will to live. Throw together a lean-to and gather sticks and fiber to keep building.',
      requires:{ quest:['m_water'] },
      objectives:[ {type:'build', building:'leanto', amt:1}, {type:'have_res', res:'sticks', amt:10}, {type:'have_res', res:'fiber', amt:10} ],
      rewards:[ {type:'resource',res:'fruit',amt:8}, {type:'morale',amt:4} ],
      reward_text:'+8 fruit, +4 morale', next:['m_food_stores'] },

    { id:'m_food_stores', name:'Food and Foraging', line:'main', icon:'🧺',
      desc:'You cannot live hand to mouth forever. Set up gathering and fishing so the camp has a steady supply of food.',
      requires:{ quest:['m_shelter'] },
      objectives:[ {type:'build', building:'gathering_post', amt:1}, {type:'build', building:'fishing_hut', amt:1}, {type:'total_res', res:'fish', amt:25} ],
      rewards:[ {type:'research',amt:12}, {type:'coin',amt:10} ],
      reward_text:'+12 research, +10 coin', next:['m_first_research'] },

    { id:'m_first_research', name:'Learning to Survive', line:'main', icon:'🔬',
      desc:'Survival is knowledge as much as muscle. Bank some research and study Survival Basics — the foundation of everything to come.',
      requires:{ quest:['m_food_stores'] },
      objectives:[ {type:'research_have', amt:10}, {type:'tech_id', id:'survival_basics'} ],
      rewards:[ {type:'research',amt:15}, {type:'morale',amt:4} ],
      reward_text:'+15 research, +4 morale', flag:'unlocked_research', next:['m_woodcutting'] },

    { id:'m_woodcutting', name:'Into the Trees', line:'main', icon:'🪓',
      desc:'Reach Stage 2 and the wreck becomes a permanent camp. Open the palm forest, build a woodcutter\'s camp, and start a real timber supply.',
      requires:{ quest:['m_first_research'], stage:2 },
      objectives:[ {type:'build', building:'woodcutter_camp', amt:1}, {type:'total_res', res:'wood', amt:40} ],
      rewards:[ {type:'resource',res:'wood',amt:15}, {type:'research',amt:15} ],
      reward_text:'+15 wood, +15 research', flag:'unlocked_woodcutting', next:['m_tools'] },

    { id:'m_tools', name:'The First Tools', line:'main', icon:'🛠️',
      desc:'Bare hands only go so far. Research toolmaking, raise a toolsmith, and forge your first proper tools.',
      requires:{ quest:['m_woodcutting'], stage:2 },
      objectives:[ {type:'tech_id', id:'toolmaking'}, {type:'build', building:'toolsmith', amt:1}, {type:'total_res', res:'tools', amt:6} ],
      rewards:[ {type:'resource',res:'tools',amt:4}, {type:'research',amt:20} ],
      reward_text:'+4 tools, +20 research', flag:'unlocked_tools', next:['m_hunting'] },

    { id:'m_hunting', name:'Hunters of the Wild', line:'main', icon:'🏹',
      desc:'The forest is full of game. Learn to hunt and build a hunter cabin so Leif can bring back meat and hide for the camp.',
      requires:{ quest:['m_tools'], stage:2 },
      objectives:[ {type:'tech_id', id:'hunting'}, {type:'build', building:'hunter_cabin', amt:1}, {type:'total_res', res:'meat', amt:15} ],
      rewards:[ {type:'resource',res:'hide',amt:8}, {type:'morale',amt:6} ],
      reward_text:'+8 hide, +6 morale', flag:'unlocked_hunting', next:['m_explore_inland'] },

    { id:'m_explore_inland', name:'Mapping the Island', line:'main', icon:'🧭',
      desc:'You are not alone on this island, but you must learn its shape. Begin exploration and push inland past the palm forest to the river.',
      requires:{ quest:['m_hunting'], stage:2 },
      objectives:[ {type:'tech_id', id:'exploration'}, {type:'explore_region', id:'river'} ],
      rewards:[ {type:'research',amt:25}, {type:'resource',res:'clay',amt:10} ],
      reward_text:'+25 research, +10 clay', flag:'unlocked_exploration', next:['m_become_village'] },

    { id:'m_become_village', name:'More Than Castaways', line:'main', icon:'🏘️',
      desc:'Reach Stage 3 — the camp has become a Village. Build real shelter and welcome new survivors until your number reaches eight.',
      requires:{ quest:['m_explore_inland'], stage:3 },
      objectives:[ {type:'stage', stage:3}, {type:'build', building:'thatch_hut', amt:1}, {type:'population', amt:8} ],
      rewards:[ {type:'coin',amt:40}, {type:'morale',amt:8} ],
      reward_text:'+40 coin, +8 morale', flag:'reached_village', next:['m_industry'] },

    { id:'m_industry', name:'The First Industry', line:'main', icon:'🔧',
      desc:'A village needs more than gathered scraps. Build a workshop, learn to saw lumber, and stockpile planks for sturdier construction.',
      requires:{ quest:['m_become_village'], stage:3 },
      objectives:[ {type:'build', building:'workshop', amt:1}, {type:'tech_id', id:'sawmilling'}, {type:'total_res', res:'lumber', amt:30} ],
      rewards:[ {type:'resource',res:'lumber',amt:20}, {type:'research',amt:30} ],
      reward_text:'+20 lumber, +30 research', flag:'unlocked_industry', next:['m_agriculture'] },

    { id:'m_agriculture', name:'Roots in the Soil', line:'main', icon:'🌱',
      desc:'Hunting and foraging cannot feed a growing village. Learn agriculture, break ground on a farm plot, and harvest your first crops.',
      requires:{ quest:['m_industry'], stage:3 },
      objectives:[ {type:'tech_id', id:'agriculture'}, {type:'build', building:'farm_plot', amt:1}, {type:'total_res', res:'crops', amt:30} ],
      rewards:[ {type:'resource',res:'crops',amt:20}, {type:'morale',amt:6} ],
      reward_text:'+20 crops, +6 morale', flag:'unlocked_farming', next:['m_trade'] },

    { id:'m_trade', name:'Open for Business', line:'main', icon:'🤝',
      desc:'A passing trader has noticed your smoke. Learn trade, build a market, and earn your first real coin from the wider world.',
      requires:{ quest:['m_agriculture'], stage:3 },
      objectives:[ {type:'tech_id', id:'trade'}, {type:'build', building:'market', amt:1}, {type:'coin', amt:80} ],
      rewards:[ {type:'coin',amt:60}, {type:'research',amt:25} ],
      reward_text:'+60 coin, +25 research', flag:'unlocked_trade', next:['m_growing_settlement'] },

    { id:'m_growing_settlement', name:'A Growing Settlement', line:'main', icon:'🏡',
      desc:'Reach Stage 4. The village swells into a Growing Settlement. Raise proper housing and grow to fifteen souls.',
      requires:{ quest:['m_trade'], stage:4 },
      objectives:[ {type:'stage', stage:4}, {type:'build', building:'log_cabin', amt:1}, {type:'population', amt:15} ],
      rewards:[ {type:'coin',amt:80}, {type:'settler',count:1}, {type:'morale',amt:6} ],
      reward_text:'+80 coin, a new settler', flag:'reached_settlement', next:['m_metalworks'] },

    { id:'m_metalworks', name:'Fire and Iron', line:'main', icon:'🌋',
      desc:'Stone and wood will not build a town. Learn smelting, raise a smelter, and pour your first iron bars.',
      requires:{ quest:['m_growing_settlement'], stage:4 },
      objectives:[ {type:'tech_id', id:'smelting'}, {type:'build', building:'smelter', amt:1}, {type:'total_res', res:'ironbar', amt:30} ],
      rewards:[ {type:'resource',res:'ironbar',amt:15}, {type:'research',amt:40} ],
      reward_text:'+15 iron bars, +40 research', flag:'unlocked_metalworks', next:['m_governance'] },

    { id:'m_governance', name:'A Voice for the People', line:'main', icon:'⚖️',
      desc:'A settlement this size needs order. Learn governance, build a town hall, and lift the colony\'s spirits to keep everyone together.',
      requires:{ quest:['m_metalworks'], stage:4 },
      objectives:[ {type:'tech_id', id:'governance'}, {type:'build', building:'town_hall', amt:1}, {type:'morale', amt:70} ],
      rewards:[ {type:'coin',amt:100}, {type:'morale',amt:8} ],
      reward_text:'+100 coin, +8 morale', flag:'unlocked_governance', next:['m_become_colony'] },

    { id:'m_become_colony', name:'A True Colony', line:'main', icon:'🏛️',
      desc:'Reach Stage 5 — a self-sufficient Colony. Establish learning, found a school, and let your knowledge deepen.',
      requires:{ quest:['m_governance'], stage:5 },
      objectives:[ {type:'stage', stage:5}, {type:'tech_id', id:'education'}, {type:'build', building:'school', amt:1} ],
      rewards:[ {type:'research',amt:80}, {type:'coin',amt:120}, {type:'morale',amt:8} ],
      reward_text:'+80 research, +120 coin', flag:'reached_colony', next:['m_steel'] },

    { id:'m_steel', name:'The Age of Steel', line:'main', icon:'🏭',
      desc:'Steel is the backbone of great works. Master metallurgy, raise a steel mill, and produce a meaningful stockpile of steel.',
      requires:{ quest:['m_become_colony'], stage:5 },
      objectives:[ {type:'tech_id', id:'metallurgy'}, {type:'build', building:'steel_mill', amt:1}, {type:'total_res', res:'steel', amt:60} ],
      rewards:[ {type:'resource',res:'steel',amt:25}, {type:'research',amt:80} ],
      reward_text:'+25 steel, +80 research', flag:'unlocked_steel', next:['m_island_town'] },

    { id:'m_island_town', name:'An Island Town', line:'main', icon:'🏙️',
      desc:'Reach Stage 6 — your colony is now an Island Town. Connect to the sea with a harbor and house a population of thirty.',
      requires:{ quest:['m_steel'], stage:6 },
      objectives:[ {type:'tech_id', id:'seafaring'}, {type:'build', building:'harbor', amt:1}, {type:'population', amt:30} ],
      rewards:[ {type:'coin',amt:200}, {type:'settler',count:2}, {type:'morale',amt:10} ],
      reward_text:'+200 coin, 2 settlers', flag:'reached_town', next:['m_grand_works'] },

    { id:'m_grand_works', name:'Grand Ambitions', line:'main', icon:'🏟️',
      desc:'The town dreams of permanence. Master grand architecture, raise a Grand Hall, and produce the steel a monument will demand.',
      requires:{ quest:['m_island_town'], stage:6 },
      objectives:[ {type:'tech_id', id:'grand_architecture'}, {type:'build', building:'grand_hall', amt:1}, {type:'total_res', res:'steel', amt:200} ],
      rewards:[ {type:'research',amt:200}, {type:'coin',amt:250}, {type:'morale',amt:12} ],
      reward_text:'+200 research, +250 coin', flag:'unlocked_grand_works', next:['m_monumental'] },

    { id:'m_monumental', name:'The Final Knowledge', line:'main', icon:'🗿',
      desc:'One last secret remains. Research Monumental Works and gather the rare gems and pearls the great monument will consume.',
      requires:{ quest:['m_grand_works'], stage:6 },
      objectives:[ {type:'tech_id', id:'monumental_works'}, {type:'have_res', res:'gem', amt:12}, {type:'have_res', res:'pearl', amt:10} ],
      rewards:[ {type:'research',amt:300}, {type:'buff', stat:'global_prod', mult:1.2, days:6, label:'Monumental Resolve'} ],
      reward_text:'+300 research + production buff', flag:'unlocked_monument', next:['m_grand_monument'] },

    { id:'m_grand_monument', name:'The Grand Monument', line:'main', icon:'🏆',
      desc:'This is what it was all for. Build the Grand Monument — a wonder carved from everything you survived to make. Complete it and the island is truly yours.',
      requires:{ quest:['m_monumental'], stage:6 },
      objectives:[ {type:'build', building:'grand_monument', amt:1} ],
      rewards:[ {type:'morale',amt:25}, {type:'coin',amt:1000}, {type:'buff', stat:'global_prod', mult:1.25, days:10, label:'Legacy of the Castaways'} ],
      reward_text:'Victory! +1000 coin & a lasting legacy', flag:'won_game' },

    // ============================================================
    // MILESTONE LINE — keyed to population, buildings, tech counts,
    // stages, morale, coin, and regions. Auto-activate by stage.
    // ============================================================
    { id:'ms_pop6', name:'Six Survivors', line:'milestone', icon:'👥',
      desc:'Word of a safe camp spreads along the shore. Grow your population to six.',
      requires:{ stage:2 }, objectives:[ {type:'population', amt:6} ],
      rewards:[ {type:'coin',amt:20}, {type:'morale',amt:4} ], reward_text:'+20 coin, +4 morale' },

    { id:'ms_pop10', name:'A Real Village', line:'milestone', icon:'🏘️',
      desc:'Ten souls means a true community, not a knot of castaways. Reach a population of ten.',
      requires:{ stage:3 }, objectives:[ {type:'population', amt:10} ],
      rewards:[ {type:'coin',amt:40}, {type:'morale',amt:6} ], reward_text:'+40 coin, +6 morale' },

    { id:'ms_pop20', name:'A Crowd of Colonists', line:'milestone', icon:'👨‍👩‍👧‍👦',
      desc:'Twenty mouths to feed and twenty pairs of hands to work. Reach a population of twenty.',
      requires:{ stage:4 }, objectives:[ {type:'population', amt:20} ],
      rewards:[ {type:'coin',amt:90}, {type:'settler',count:1} ], reward_text:'+90 coin, a settler' },

    { id:'ms_pop35', name:'A Bustling Town', line:'milestone', icon:'🏙️',
      desc:'The lanes are busy from dawn to dusk. Reach a population of thirty-five.',
      requires:{ stage:6 }, objectives:[ {type:'population', amt:35} ],
      rewards:[ {type:'coin',amt:160}, {type:'morale',amt:8} ], reward_text:'+160 coin, +8 morale' },

    { id:'ms_pop50', name:'Fifty Strong', line:'milestone', icon:'🌆',
      desc:'Fifty people now call this island home. Reach a population of fifty.',
      requires:{ stage:7 }, objectives:[ {type:'population', amt:50} ],
      rewards:[ {type:'coin',amt:300}, {type:'buff', stat:'global_prod', mult:1.1, days:5, label:'Civic Pride'} ], reward_text:'+300 coin, production buff' },

    { id:'ms_build5', name:'Taking Shape', line:'milestone', icon:'🏗️',
      desc:'A camp is a collection of buildings. Construct five buildings of any kind.',
      requires:{ stage:2 }, objectives:[ {type:'build', building:null, amt:5} ],
      rewards:[ {type:'resource',res:'wood',amt:10}, {type:'research',amt:10} ], reward_text:'+10 wood, +10 research' },

    { id:'ms_build12', name:'A Built-Up Camp', line:'milestone', icon:'🏠',
      desc:'Your settlement sprawls across the clearing. Construct twelve buildings in total.',
      requires:{ stage:3 }, objectives:[ {type:'build', building:null, amt:12} ],
      rewards:[ {type:'coin',amt:50}, {type:'research',amt:20} ], reward_text:'+50 coin, +20 research' },

    { id:'ms_build25', name:'An Established Colony', line:'milestone', icon:'🏛️',
      desc:'Twenty-five structures and counting. Construct twenty-five buildings in total.',
      requires:{ stage:5 }, objectives:[ {type:'build', building:null, amt:25} ],
      rewards:[ {type:'coin',amt:120}, {type:'morale',amt:6} ], reward_text:'+120 coin, +6 morale' },

    { id:'ms_build40', name:'A Sprawling Town', line:'milestone', icon:'🌇',
      desc:'The skyline is unrecognizable from that first night on the beach. Construct forty buildings in total.',
      requires:{ stage:6 }, objectives:[ {type:'build', building:null, amt:40} ],
      rewards:[ {type:'coin',amt:250}, {type:'research',amt:60} ], reward_text:'+250 coin, +60 research' },

    { id:'ms_tech5', name:'First Discoveries', line:'milestone', icon:'📘',
      desc:'Knowledge is the only resource that never runs out. Research five technologies.',
      requires:{ stage:2 }, objectives:[ {type:'tech', amt:5} ],
      rewards:[ {type:'research',amt:15}, {type:'morale',amt:3} ], reward_text:'+15 research, +3 morale' },

    { id:'ms_tech12', name:'A Growing Library', line:'milestone', icon:'📗',
      desc:'Your people are clever and curious. Research twelve technologies.',
      requires:{ stage:3 }, objectives:[ {type:'tech', amt:12} ],
      rewards:[ {type:'research',amt:35}, {type:'coin',amt:30} ], reward_text:'+35 research, +30 coin' },

    { id:'ms_tech25', name:'Masters of Knowledge', line:'milestone', icon:'📙',
      desc:'Few survivors ever learn this much. Research twenty-five technologies.',
      requires:{ stage:5 }, objectives:[ {type:'tech', amt:25} ],
      rewards:[ {type:'research',amt:90}, {type:'buff', stat:'research', mult:1.2, days:5, label:'Eureka'} ], reward_text:'+90 research, research buff' },

    { id:'ms_tech40', name:'The Enlightened Isle', line:'milestone', icon:'📚',
      desc:'Your colony rivals the great academies of the mainland. Research forty technologies.',
      requires:{ stage:6 }, objectives:[ {type:'tech', amt:40} ],
      rewards:[ {type:'research',amt:200}, {type:'coin',amt:150} ], reward_text:'+200 research, +150 coin' },

    { id:'ms_research_bank', name:'Knowledge Reserves', line:'milestone', icon:'🔬',
      desc:'A wise colony keeps a reserve of research for the next great idea. Bank 150 research.',
      requires:{ stage:4 }, objectives:[ {type:'research_have', amt:150} ],
      rewards:[ {type:'coin',amt:60}, {type:'morale',amt:5} ], reward_text:'+60 coin, +5 morale' },

    { id:'ms_coin100', name:'Coin in the Coffers', line:'milestone', icon:'🪙',
      desc:'Trade is finally paying off. Accumulate 100 coin.',
      requires:{ stage:3 }, objectives:[ {type:'coin', amt:100} ],
      rewards:[ {type:'research',amt:25}, {type:'morale',amt:4} ], reward_text:'+25 research, +4 morale' },

    { id:'ms_coin300', name:'A Healthy Treasury', line:'milestone', icon:'💰',
      desc:'The market hums and the ledgers swell. Accumulate 300 coin.',
      requires:{ stage:4 }, objectives:[ {type:'coin', amt:300} ],
      rewards:[ {type:'buff', stat:'trade_price', mult:1.2, days:5, label:'Trade Winds'} ], reward_text:'Trade price buff' },

    { id:'ms_coin750', name:'Merchant Isle', line:'milestone', icon:'🏦',
      desc:'Your island is a name on the trade charts. Accumulate 750 coin.',
      requires:{ stage:6 }, objectives:[ {type:'coin', amt:750} ],
      rewards:[ {type:'research',amt:120}, {type:'morale',amt:8} ], reward_text:'+120 research, +8 morale' },

    { id:'ms_morale75', name:'Happy Settlers', line:'milestone', icon:'😊',
      desc:'Content people work harder and stay longer. Raise settlement morale to seventy-five.',
      requires:{ stage:3 }, objectives:[ {type:'morale', amt:75} ],
      rewards:[ {type:'coin',amt:40}, {type:'buff', stat:'global_prod', mult:1.1, days:4, label:'High Spirits'} ], reward_text:'+40 coin, production buff' },

    { id:'ms_morale90', name:'A Joyful Colony', line:'milestone', icon:'🥳',
      desc:'Laughter carries across the rooftops at night. Raise settlement morale to ninety.',
      requires:{ stage:5 }, objectives:[ {type:'morale', amt:90} ],
      rewards:[ {type:'coin',amt:100}, {type:'settler',count:1} ], reward_text:'+100 coin, a settler' },

    { id:'ms_stage3', name:'Permanence', line:'milestone', icon:'🏕️',
      desc:'The camp is no longer temporary. Advance the settlement to Stage 3, the Village.',
      requires:{ stage:3 }, objectives:[ {type:'stage', stage:3} ],
      rewards:[ {type:'coin',amt:30}, {type:'morale',amt:5} ], reward_text:'+30 coin, +5 morale' },

    { id:'ms_stage5', name:'Self-Sufficient', line:'milestone', icon:'🏛️',
      desc:'You no longer merely survive — you thrive. Advance the settlement to Stage 5, the Colony.',
      requires:{ stage:5 }, objectives:[ {type:'stage', stage:5} ],
      rewards:[ {type:'coin',amt:120}, {type:'research',amt:50} ], reward_text:'+120 coin, +50 research' },

    { id:'ms_stage7', name:'Prosperous Island', line:'milestone', icon:'🌟',
      desc:'The highest height — a prosperous island that wants for nothing. Reach Stage 7.',
      requires:{ stage:7 }, objectives:[ {type:'stage', stage:7} ],
      rewards:[ {type:'coin',amt:400}, {type:'buff', stat:'global_prod', mult:1.15, days:8, label:'Golden Age'} ], reward_text:'+400 coin, production buff' },

    { id:'ms_regions3', name:'Wider Horizons', line:'milestone', icon:'🗺️',
      desc:'The island is bigger than the beach. Explore three different regions.',
      requires:{ stage:2 }, objectives:[ {type:'explore_count', amt:3} ],
      rewards:[ {type:'research',amt:20}, {type:'resource',res:'fruit',amt:10} ], reward_text:'+20 research, +10 fruit' },

    { id:'ms_regions6', name:'Cartographer', line:'milestone', icon:'🧭',
      desc:'Half the island is mapped in your ledgers. Explore six different regions.',
      requires:{ stage:4 }, objectives:[ {type:'explore_count', amt:6} ],
      rewards:[ {type:'research',amt:50}, {type:'coin',amt:60} ], reward_text:'+50 research, +60 coin' },

    { id:'ms_regions10', name:'The Whole Island', line:'milestone', icon:'🏝️',
      desc:'Not one corner of this island remains unknown to you. Explore all ten regions.',
      requires:{ stage:6 }, objectives:[ {type:'explore_count', amt:10} ],
      rewards:[ {type:'research',amt:150}, {type:'resource',res:'gem',amt:5} ], reward_text:'+150 research, +5 gems' },

    { id:'ms_settlers5', name:'Newcomers Welcome', line:'milestone', icon:'🛶',
      desc:'Castaways and wanderers find their way to your fires. Welcome five settlers to the colony.',
      requires:{ stage:3 }, objectives:[ {type:'settlers', amt:5} ],
      rewards:[ {type:'coin',amt:40}, {type:'morale',amt:5} ], reward_text:'+40 coin, +5 morale' },

    { id:'ms_settlers15', name:'A Magnet for Migrants', line:'milestone', icon:'⚓',
      desc:'Your harbor and good name draw people from across the sea. Welcome fifteen settlers in total.',
      requires:{ stage:5 }, objectives:[ {type:'settlers', amt:15} ],
      rewards:[ {type:'coin',amt:120}, {type:'morale',amt:6} ], reward_text:'+120 coin, +6 morale' },

    { id:'ms_expeditions5', name:'Seasoned Explorers', line:'milestone', icon:'🥾',
      desc:'Your expedition parties have grown bold and skilled. Run five expeditions.',
      requires:{ stage:3 }, objectives:[ {type:'expeditions', amt:5} ],
      rewards:[ {type:'research',amt:30}, {type:'buff', stat:'explore', mult:1.2, days:4, label:'Trailblazers'} ], reward_text:'+30 research, explore buff' },

    { id:'ms_food_secure', name:'Full Larders', line:'milestone', icon:'🍞',
      desc:'No one on this island will ever go hungry again. Bake and stockpile bread.',
      requires:{ stage:4 }, objectives:[ {type:'total_res', res:'bread', amt:60} ],
      rewards:[ {type:'morale',amt:8}, {type:'coin',amt:50} ], reward_text:'+8 morale, +50 coin' },

    { id:'ms_planks_stock', name:'A Yard of Planks', line:'milestone', icon:'🪟',
      desc:'Fine planks are the mark of serious building. Produce 120 planks in total.',
      requires:{ stage:4 }, objectives:[ {type:'total_res', res:'planks', amt:120} ],
      rewards:[ {type:'resource',res:'planks',amt:30}, {type:'research',amt:40} ], reward_text:'+30 planks, +40 research' },

    { id:'ms_steel_industry', name:'Heart of Iron', line:'milestone', icon:'⚙️',
      desc:'Your foundries never go cold. Produce 500 steel in total — the measure of a true industrial town.',
      requires:{ stage:6 }, objectives:[ {type:'total_res', res:'steel', amt:500} ],
      rewards:[ {type:'coin',amt:300}, {type:'buff', stat:'job:steelworks', mult:1.3, days:6, label:'Forge Mastery'} ], reward_text:'+300 coin, steel buff' },

    { id:'ms_luxury', name:'A Taste of Luxury', line:'milestone', icon:'💎',
      desc:'The island offers riches beyond mere survival. Gather a stockpile of precious gems.',
      requires:{ stage:5 }, objectives:[ {type:'have_res', res:'gem', amt:8} ],
      rewards:[ {type:'coin',amt:200}, {type:'morale',amt:6} ], reward_text:'+200 coin, +6 morale' },

    // ============================================================
    // ROBIN — Master Builder. Building & construction themed.
    // Gated by main-line flags; uses char_level and build objectives.
    // ============================================================
    { id:'robin_first_build', name:"Robin's Steady Hands", line:'robin', icon:'👷',
      desc:'Robin grew up rebuilding storm-wrecked docks with her father. Putting up that first campfire felt like coming home. Help her find her rhythm.',
      requires:{ flag:['unlocked_research'] },
      objectives:[ {type:'build', building:null, amt:3}, {type:'char_level', charId:'robin', level:2} ],
      rewards:[ {type:'resource',res:'wood',amt:10}, {type:'morale',amt:3} ], reward_text:'+10 wood, +3 morale' },

    { id:'robin_quarry', name:'Stone From the Earth', line:'robin', icon:'⛏️',
      desc:'"Wood rots, fiber frays — but stone outlasts us all," Robin says. She wants a quarry to build things meant to endure.',
      requires:{ flag:['unlocked_tools'] },
      objectives:[ {type:'build', building:'quarry', amt:1}, {type:'total_res', res:'stone', amt:60} ],
      rewards:[ {type:'resource',res:'stone',amt:20}, {type:'research',amt:15} ], reward_text:'+20 stone, +15 research' },

    { id:'robin_lumber', name:'Robin\'s Lumber Yard', line:'robin', icon:'🪚',
      desc:'Hauling raw logs to every site is wasting hands. Robin proposes a lumber mill so the builders always have stock ready.',
      requires:{ flag:['unlocked_industry'] },
      objectives:[ {type:'build', building:'lumber_mill', amt:1}, {type:'char_level', charId:'robin', level:5} ],
      rewards:[ {type:'resource',res:'lumber',amt:25}, {type:'buff', stat:'job:build', mult:1.25, days:4, label:"Robin's Crew"} ], reward_text:'+25 lumber, build buff' },

    { id:'robin_brickworks', name:'Fired and Solid', line:'robin', icon:'🧱',
      desc:'Robin runs her hand along a clay wall and frowns: "Fire it and it becomes brick. Then we can build a town that laughs at storms." Build a brick kiln.',
      requires:{ flag:['unlocked_metalworks'] },
      objectives:[ {type:'build', building:'brick_kiln', amt:1}, {type:'total_res', res:'brick', amt:50} ],
      rewards:[ {type:'resource',res:'brick',amt:20}, {type:'research',amt:30} ], reward_text:'+20 brick, +30 research' },

    { id:'robin_upgrade', name:'Built to Last', line:'robin', icon:'📐',
      desc:'Robin is never satisfied with "good enough." She wants to take a storage tent and rebuild it bigger and stronger, level by level.',
      requires:{ flag:['unlocked_industry'] },
      objectives:[ {type:'building_level', building:'storage_tent', level:3} ],
      rewards:[ {type:'coin',amt:50}, {type:'morale',amt:4} ], reward_text:'+50 coin, +4 morale' },

    { id:'robin_builders', name:'A Builder\'s Crew', line:'robin', icon:'👥',
      desc:'One hand cannot raise a wall. Robin wants a proper crew of builders working the queue alongside her.',
      requires:{ flag:['reached_settlement'] },
      objectives:[ {type:'job_workers', job:'build', amt:4}, {type:'char_level', charId:'robin', level:8} ],
      rewards:[ {type:'buff', stat:'job:build', mult:1.35, days:5, label:"Robin's Foremen"}, {type:'morale',amt:5} ], reward_text:'Strong build buff, +5 morale' },

    { id:'robin_grand_hall', name:'Robin\'s Masterwork', line:'robin', icon:'🏟️',
      desc:'Robin has dreamed of building something truly great since the night of the wreck. The Grand Hall could be it. Help her raise it.',
      requires:{ flag:['unlocked_grand_works'] },
      objectives:[ {type:'build', building:'grand_hall', amt:1}, {type:'char_level', charId:'robin', level:12} ],
      rewards:[ {type:'coin',amt:200}, {type:'buff', stat:'global_prod', mult:1.12, days:6, label:"Robin's Pride"} ], reward_text:'+200 coin, production buff' },

    { id:'robin_legacy', name:'The Builder\'s Legacy', line:'robin', icon:'🗿',
      desc:'"When I came ashore I had nothing but two hands," Robin says, looking up at the rising monument. "Now look what those hands made." Help her see the Grand Monument finished.',
      requires:{ flag:['unlocked_monument'] },
      objectives:[ {type:'build', building:'grand_monument', amt:1}, {type:'char_level', charId:'robin', level:16} ],
      rewards:[ {type:'coin',amt:400}, {type:'morale',amt:15} ], reward_text:'+400 coin, +15 morale' },

    // ============================================================
    // LENNI — Researcher & Crafter. Research & crafting themed.
    // ============================================================
    { id:'lenni_first_study', name:"Lenni's Curiosity", line:'lenni', icon:'🔬',
      desc:'Lenni saved a waterlogged journal from the wreck and refuses to stop scribbling in it. Every observation is one step closer to understanding this island.',
      requires:{ flag:['unlocked_research'] },
      objectives:[ {type:'research_have', amt:20}, {type:'char_level', charId:'lenni', level:2} ],
      rewards:[ {type:'research',amt:15}, {type:'morale',amt:3} ], reward_text:'+15 research, +3 morale' },

    { id:'lenni_workshop', name:'A Place to Think', line:'lenni', icon:'🔧',
      desc:'"I can\'t invent anything balancing a coconut on my knee," Lenni complains. She wants a workshop with proper benches and her first research station.',
      requires:{ flag:['unlocked_woodcutting'] },
      objectives:[ {type:'build', building:'workshop', amt:1}, {type:'job_workers', job:'research', amt:1} ],
      rewards:[ {type:'research',amt:25}, {type:'resource',res:'tools',amt:3} ], reward_text:'+25 research, +3 tools' },

    { id:'lenni_textiles', name:'Threads and Cloth', line:'lenni', icon:'🧵',
      desc:'Lenni is fascinated by how fiber can become rope, then cloth, then sails. She wants a weaver\'s loom to chase the idea.',
      requires:{ flag:['unlocked_industry'] },
      objectives:[ {type:'tech_id', id:'textiles'}, {type:'build', building:'weavery', amt:1}, {type:'total_res', res:'cloth', amt:25} ],
      rewards:[ {type:'resource',res:'cloth',amt:12}, {type:'research',amt:25} ], reward_text:'+12 cloth, +25 research' },

    { id:'lenni_glass', name:'Sand Into Light', line:'lenni', icon:'🔷',
      desc:'"Watch — you melt plain sand and it turns to glass you can see through. Magic that is only chemistry." Lenni wants a glassworks to prove her point.',
      requires:{ flag:['unlocked_metalworks'] },
      objectives:[ {type:'tech_id', id:'glassmaking'}, {type:'build', building:'glassworks', amt:1}, {type:'total_res', res:'glass', amt:30} ],
      rewards:[ {type:'resource',res:'glass',amt:12}, {type:'research',amt:40} ], reward_text:'+12 glass, +40 research' },

    { id:'lenni_library', name:'Lenni\'s Library', line:'lenni', icon:'📚',
      desc:'Lenni\'s journal has become a shelf, then a chest of journals. She wants a true library to hold the colony\'s knowledge and let it grow.',
      requires:{ flag:['reached_colony'] },
      objectives:[ {type:'build', building:'library', amt:1}, {type:'char_level', charId:'lenni', level:10} ],
      rewards:[ {type:'research',amt:80}, {type:'buff', stat:'research', mult:1.25, days:5, label:"Lenni's Insight"} ], reward_text:'+80 research, research buff' },

    { id:'lenni_medicine', name:'Cures and Remedies', line:'lenni', icon:'⚗️',
      desc:'Too many friends have suffered fevers Lenni couldn\'t treat. She is determined to brew real medicine in an apothecary.',
      requires:{ flag:['reached_colony'] },
      objectives:[ {type:'tech_id', id:'medicine'}, {type:'build', building:'apothecary', amt:1}, {type:'total_res', res:'medicine', amt:20} ],
      rewards:[ {type:'resource',res:'medicine',amt:8}, {type:'morale',amt:8} ], reward_text:'+8 medicine, +8 morale' },

    { id:'lenni_scholar', name:'The Scholar of the Isle', line:'lenni', icon:'🎓',
      desc:'Lenni has read everything the colony knows twice over. Push the frontier of knowledge to its limits for her.',
      requires:{ flag:['reached_colony'] },
      objectives:[ {type:'tech', amt:35}, {type:'char_level', charId:'lenni', level:13} ],
      rewards:[ {type:'research',amt:150}, {type:'coin',amt:120} ], reward_text:'+150 research, +120 coin' },

    { id:'lenni_observatory', name:'Charting the Heavens', line:'lenni', icon:'🔭',
      desc:'"The same stars that guided our doomed ship can guide us still," Lenni says. She wants an observatory to read the sky and foresee the island\'s moods.',
      requires:{ flag:['unlocked_grand_works'] },
      objectives:[ {type:'tech_id', id:'astronomy'}, {type:'build', building:'observatory', amt:1} ],
      rewards:[ {type:'research',amt:200}, {type:'buff', stat:'research', mult:1.3, days:6, label:"Lenni's Vision"} ], reward_text:'+200 research, research buff' },

    // ============================================================
    // LEIF — Hunter & Explorer. Hunting & exploration themed.
    // ============================================================
    { id:'leif_first_hunt', name:"Leif's First Kill", line:'leif', icon:'🏹',
      desc:'Leif was quiet on the beach, but the moment the forest opened he came alive. He itches to test himself against the island\'s game.',
      requires:{ flag:['unlocked_hunting'] },
      objectives:[ {type:'total_res', res:'meat', amt:30}, {type:'char_level', charId:'leif', level:4} ],
      rewards:[ {type:'buff', stat:'job:hunt', mult:1.4, days:4, label:"Leif's Focus"}, {type:'resource',res:'hide',amt:10} ], reward_text:'Hunting buff + hide' },

    { id:'leif_provider', name:'The Provider', line:'leif', icon:'🍖',
      desc:'"I don\'t care for talk," Leif says, "but I\'ll make sure no one here starves." He wants to fill the larders with meat and hide.',
      requires:{ flag:['unlocked_hunting'] },
      objectives:[ {type:'total_res', res:'meat', amt:80}, {type:'total_res', res:'hide', amt:40} ],
      rewards:[ {type:'resource',res:'leather',amt:10}, {type:'morale',amt:5} ], reward_text:'+10 leather, +5 morale' },

    { id:'leif_jungle', name:'Leif and the Jungle', line:'leif', icon:'🌿',
      desc:'The dense jungle calls to Leif like nothing else has. He swears there are rare woods and stranger creatures waiting in the green dark.',
      requires:{ flag:['unlocked_exploration'] },
      objectives:[ {type:'explore_region', id:'jungle'}, {type:'char_level', charId:'leif', level:6} ],
      rewards:[ {type:'resource',res:'rarewood',amt:4}, {type:'research',amt:30} ], reward_text:'+4 rare woods, +30 research' },

    { id:'leif_expeditions', name:'Leif\'s Expeditions', line:'leif', icon:'🥾',
      desc:'Leif is restless in camp. He wants to lead expeditions deep into the unknown and bring back what others wouldn\'t dare reach.',
      requires:{ flag:['unlocked_exploration'] },
      objectives:[ {type:'expeditions', amt:4}, {type:'build', building:'expedition_camp', amt:1} ],
      rewards:[ {type:'buff', stat:'explore', mult:1.3, days:5, label:"Leif's Trail"}, {type:'research',amt:25} ], reward_text:'Explore buff, +25 research' },

    { id:'leif_highlands', name:'The High Country', line:'leif', icon:'⛰️',
      desc:'From the deck of the sinking ship Leif glimpsed mountains. Now he means to stand on them. Help him reach the windswept highlands.',
      requires:{ flag:['unlocked_exploration'] },
      objectives:[ {type:'explore_region', id:'highlands'}, {type:'char_level', charId:'leif', level:9} ],
      rewards:[ {type:'resource',res:'ironore',amt:15}, {type:'research',amt:40} ], reward_text:'+15 iron ore, +40 research' },

    { id:'leif_master_hunter', name:'Master of the Hunt', line:'leif', icon:'🎯',
      desc:'Leif has hunted in every region he can reach. Few alive can match his eye and patience. Let him become the finest hunter the island has known.',
      requires:{ flag:['reached_settlement'] },
      objectives:[ {type:'char_level', charId:'leif', level:12}, {type:'total_res', res:'meat', amt:200} ],
      rewards:[ {type:'buff', stat:'res:meat', mult:1.4, days:6, label:"Leif's Mastery"}, {type:'coin',amt:80} ], reward_text:'Meat buff, +80 coin' },

    { id:'leif_volcano', name:'Into the Fire', line:'leif', icon:'🌋',
      desc:'The volcano is the most dangerous place on the island — which is exactly why Leif must go. He needs the best gear before he braves it.',
      requires:{ flag:['reached_town'] },
      objectives:[ {type:'explore_region', id:'volcano'}, {type:'char_level', charId:'leif', level:14} ],
      rewards:[ {type:'resource',res:'gem',amt:6}, {type:'research',amt:80} ], reward_text:'+6 gems, +80 research' },

    { id:'leif_explorer', name:'Leif the Legend', line:'leif', icon:'🗺️',
      desc:'There is nowhere left on this island Leif has not walked. His name will be told around fires long after the monument is dust. See his journey complete.',
      requires:{ flag:['reached_town'] },
      objectives:[ {type:'explore_count', amt:10}, {type:'char_level', charId:'leif', level:16} ],
      rewards:[ {type:'resource',res:'exoticpet',amt:3}, {type:'coin',amt:200} ], reward_text:'+3 exotic animals, +200 coin' },

    // ============================================================
    // ERIM — Trader & Organizer. Trade, morale & population themed.
    // ============================================================
    { id:'erim_keeper', name:"Erim's Ledger", line:'erim', icon:'⚖️',
      desc:'Erim cannot stand waste. While others slept that first night, he counted every fish and stick. He wants the camp\'s stores organized properly.',
      requires:{ flag:['unlocked_research'] },
      objectives:[ {type:'build', building:'storage_tent', amt:2}, {type:'char_level', charId:'erim', level:2} ],
      rewards:[ {type:'coin',amt:20}, {type:'morale',amt:4} ], reward_text:'+20 coin, +4 morale' },

    { id:'erim_first_trade', name:'Erim\'s First Deal', line:'erim', icon:'🤝',
      desc:'"Everything has a price, friend — even out here." Erim talks a passing trader into the colony\'s first real bargain. Help him build the market and turn a profit.',
      requires:{ flag:['unlocked_trade'] },
      objectives:[ {type:'job_workers', job:'trade', amt:1}, {type:'coin', amt:120} ],
      rewards:[ {type:'coin',amt:50}, {type:'buff', stat:'trade_price', mult:1.2, days:4, label:"Erim's Charm"} ], reward_text:'+50 coin, trade buff' },

    { id:'erim_morale', name:'A Cup and a Song', line:'erim', icon:'🍺',
      desc:'"Hungry people grumble; happy people build empires," Erim insists. He wants a tavern where settlers can forget the sea for an evening.',
      requires:{ flag:['unlocked_trade'] },
      objectives:[ {type:'build', building:'tavern', amt:1}, {type:'morale', amt:75} ],
      rewards:[ {type:'morale',amt:8}, {type:'coin',amt:40} ], reward_text:'+8 morale, +40 coin' },

    { id:'erim_settlers', name:'Erim Spreads the Word', line:'erim', icon:'🛶',
      desc:'Erim has a gift for making the colony sound like paradise — and people believe him. He wants to swell the population with eager newcomers.',
      requires:{ flag:['reached_settlement'] },
      objectives:[ {type:'settlers', amt:10}, {type:'char_level', charId:'erim', level:7} ],
      rewards:[ {type:'settler',count:1}, {type:'morale',amt:5} ], reward_text:'A settler, +5 morale' },

    { id:'erim_depot', name:'Bulk and Ledgers', line:'erim', icon:'📦',
      desc:'The little market stalls can\'t handle the volume anymore. Erim wants a proper trade depot to run serious commerce.',
      requires:{ flag:['reached_colony'] },
      objectives:[ {type:'tech_id', id:'commerce'}, {type:'build', building:'trade_depot', amt:1}, {type:'coin', amt:400} ],
      rewards:[ {type:'coin',amt:120}, {type:'buff', stat:'trade_price', mult:1.25, days:5, label:"Erim's Network"} ], reward_text:'+120 coin, trade buff' },

    { id:'erim_luxury', name:'The Finer Things', line:'erim', icon:'🌶️',
      desc:'"Spices, pearls, rare woods — that is where the real coin sleeps," Erim grins. He wants to break into the luxury trade.',
      requires:{ flag:['reached_colony'] },
      objectives:[ {type:'total_res', res:'spice', amt:15}, {type:'coin', amt:500} ],
      rewards:[ {type:'coin',amt:200}, {type:'morale',amt:6} ], reward_text:'+200 coin, +6 morale' },

    { id:'erim_harbor', name:'Erim\'s Great Harbor', line:'erim', icon:'🚢',
      desc:'Erim stares at the horizon and sees trade ships, not an empty sea. A harbor would join the colony to the whole world. Help him build it.',
      requires:{ flag:['unlocked_steel'] },
      objectives:[ {type:'build', building:'harbor', amt:1}, {type:'char_level', charId:'erim', level:12} ],
      rewards:[ {type:'coin',amt:250}, {type:'buff', stat:'trade_price', mult:1.3, days:6, label:"Erim's Empire"} ], reward_text:'+250 coin, big trade buff' },

    { id:'erim_prosperity', name:'Erim\'s Prosperity', line:'erim', icon:'👑',
      desc:'From a man counting fish on a beach to the merchant prince of a thriving town. Erim has one last ambition: to make this the richest island in the sea.',
      requires:{ flag:['reached_town'] },
      objectives:[ {type:'coin', amt:900}, {type:'char_level', charId:'erim', level:15} ],
      rewards:[ {type:'coin',amt:300}, {type:'morale',amt:12} ], reward_text:'+300 coin, +12 morale' },

    // ============================================================
    // EXPLORE LINE — one per region, plus a couple multi-region.
    // Each sets a seen_* flag (used to surface some hidden quests).
    // ============================================================
    { id:'ex_beach', name:'Combing the Beach', line:'explore', icon:'🏖️',
      desc:'The wreck scattered salvage all along the shore. Comb the beach for everything the sea gave back.',
      objectives:[ {type:'explore_region', id:'beach'} ],
      rewards:[ {type:'research',amt:8}, {type:'resource',res:'sand',amt:8} ], reward_text:'+8 research, +8 sand', flag:'seen_beach' },

    { id:'ex_palmforest', name:'The Palm Belt', line:'explore', icon:'🌴',
      desc:'A green wall of palms stands inland. Push into it and see what wood, fruit and game it offers.',
      objectives:[ {type:'explore_region', id:'palmforest'} ],
      rewards:[ {type:'research',amt:12}, {type:'resource',res:'fruit',amt:10} ], reward_text:'+12 research, +10 fruit', flag:'seen_palmforest' },

    { id:'ex_river', name:'Following the River', line:'explore', icon:'🏞️',
      desc:'A clear river winds down from the heights. Trace it for clay, fresh water and the secrets it carries from upstream.',
      objectives:[ {type:'explore_region', id:'river'} ],
      rewards:[ {type:'research',amt:18}, {type:'resource',res:'clay',amt:10} ], reward_text:'+18 research, +10 clay', flag:'seen_river' },

    { id:'ex_jungle', name:'Into the Jungle', line:'explore', icon:'🌿',
      desc:'Brave the dense, humid jungle and see what it hides beneath the canopy.',
      objectives:[ {type:'explore_region', id:'jungle'} ],
      rewards:[ {type:'research',amt:30}, {type:'resource',res:'rarewood',amt:3} ], reward_text:'+30 research, rare woods', flag:'seen_jungle' },

    { id:'ex_highlands', name:'The Windswept Highlands', line:'explore', icon:'⛰️',
      desc:'Climb above the treeline to the hills where stone and ore lie at the surface.',
      objectives:[ {type:'explore_region', id:'highlands'} ],
      rewards:[ {type:'research',amt:35}, {type:'resource',res:'ironore',amt:12} ], reward_text:'+35 research, +12 iron ore', flag:'seen_highlands' },

    { id:'ex_mountainpass', name:'The Mountain Pass', line:'explore', icon:'🗻',
      desc:'A treacherous pass cuts through the peaks, its cliffs streaked with iron. Risk the cold and scree for its riches.',
      objectives:[ {type:'explore_region', id:'mountainpass'} ],
      rewards:[ {type:'research',amt:45}, {type:'resource',res:'gem',amt:3} ], reward_text:'+45 research, +3 gems', flag:'seen_mountainpass' },

    { id:'ex_ruins', name:'The Ancient Ruins', line:'explore', icon:'🏛️',
      desc:'Moss-eaten stone ruins watch from the hillside — relics of those who came before. Search them for secrets and treasure.',
      objectives:[ {type:'explore_region', id:'ruins'} ],
      rewards:[ {type:'research',amt:60}, {type:'resource',res:'gem',amt:4} ], reward_text:'+60 research, +4 gems', flag:'seen_ruins' },

    { id:'ex_caves', name:'The Hidden Caves', line:'explore', icon:'🕳️',
      desc:'A dark labyrinth threads beneath the island, rich with minerals and quiet dangers. Map it by torchlight.',
      objectives:[ {type:'explore_region', id:'caves'} ],
      rewards:[ {type:'research',amt:55}, {type:'resource',res:'ironore',amt:18} ], reward_text:'+55 research, +18 iron ore', flag:'seen_caves' },

    { id:'ex_volcano', name:'The Fiery Heart', line:'explore', icon:'🌋',
      desc:'Black rock and choking sulfur surround the island\'s burning heart. Few would dare it — but its rewards are unmatched.',
      objectives:[ {type:'explore_region', id:'volcano'} ],
      rewards:[ {type:'research',amt:80}, {type:'resource',res:'gem',amt:6} ], reward_text:'+80 research, +6 gems', flag:'seen_volcano' },

    { id:'ex_northcoast', name:'The Northern Coast', line:'explore', icon:'🧭',
      desc:'The far shore where reefs glitter with pearls and the open sea stretches to the horizon. Reach it and claim its bounty.',
      objectives:[ {type:'explore_region', id:'northcoast'} ],
      rewards:[ {type:'research',amt:50}, {type:'resource',res:'pearl',amt:4} ], reward_text:'+50 research, +4 pearls', flag:'seen_northcoast' },

    { id:'ex_inland_trio', name:'The Inland Frontier', line:'explore', icon:'🌄',
      desc:'Beyond the beach lies a whole interior. Explore the palm forest, the river and the jungle to truly know the island\'s green heart.',
      requires:{ region:['beach'] },
      objectives:[ {type:'explore_region', id:'palmforest'}, {type:'explore_region', id:'river'}, {type:'explore_region', id:'jungle'} ],
      rewards:[ {type:'research',amt:60}, {type:'resource',res:'rarewood',amt:4}, {type:'morale',amt:5} ], reward_text:'+60 research, rare woods, +5 morale', flag:'seen_inland' },

    { id:'ex_peaks_depths', name:'Peaks and Depths', line:'explore', icon:'🏔️',
      desc:'The island\'s extremes are the most dangerous and the most rewarding. Conquer the mountain pass, the hidden caves and the volcano.',
      requires:{ region:['highlands'] },
      objectives:[ {type:'explore_region', id:'mountainpass'}, {type:'explore_region', id:'caves'}, {type:'explore_region', id:'volcano'} ],
      rewards:[ {type:'research',amt:120}, {type:'resource',res:'gem',amt:8}, {type:'coin',amt:100} ], reward_text:'+120 research, +8 gems, +100 coin', flag:'seen_extremes' },

    { id:'ex_grand_tour', name:'The Grand Tour', line:'explore', icon:'🌐',
      desc:'You set out from a single stretch of sand. Now the whole island is mapped, known, and yours. Explore every last region.',
      requires:{ region:['beach','palmforest'] },
      objectives:[ {type:'explore_count', amt:10} ],
      rewards:[ {type:'research',amt:200}, {type:'resource',res:'exoticpet',amt:3}, {type:'morale',amt:10} ], reward_text:'+200 research, exotics, +10 morale', flag:'seen_everything' },

    // ============================================================
    // HIDDEN LINE — secret/bonus objectives, hidden:true, surfaced
    // by a flag set elsewhere (requires.flag). Fun stretch goals.
    // ============================================================
    { id:'hid_pearl_secret', name:'Secret of the Reef', line:'hidden', icon:'🦪', hidden:true,
      desc:'Diving the northern reef, your divers whisper of a bed of giant oysters no one has touched. Bring up a fortune in pearls.',
      requires:{ flag:['seen_northcoast'] },
      objectives:[ {type:'total_res', res:'pearl', amt:30} ],
      rewards:[ {type:'coin',amt:200}, {type:'resource',res:'pearl',amt:8} ], reward_text:'+200 coin, +8 pearls', flag:'found_pearl_bed' },

    { id:'hid_ruin_treasure', name:'The Vault Below', line:'hidden', icon:'🗝️', hidden:true,
      desc:'Behind a false wall in the ruins lies a sealed vault of the ancients. Gather the gems to match the riches you glimpsed within.',
      requires:{ flag:['seen_ruins'] },
      objectives:[ {type:'have_res', res:'gem', amt:15} ],
      rewards:[ {type:'coin',amt:300}, {type:'research',amt:80} ], reward_text:'+300 coin, +80 research', flag:'opened_vault' },

    { id:'hid_volcano_forge', name:'The Volcano\'s Gift', line:'hidden', icon:'🔥', hidden:true,
      desc:'The volcano\'s heat could fuel a forge like no other. Master its fury and pour out steel by the hundredweight.',
      requires:{ flag:['seen_volcano'] },
      objectives:[ {type:'total_res', res:'steel', amt:150} ],
      rewards:[ {type:'buff', stat:'job:steelworks', mult:1.5, days:6, label:'Volcanic Forge'}, {type:'resource',res:'steel',amt:30} ], reward_text:'Huge steel buff + steel', flag:'tamed_volcano' },

    { id:'hid_exotic_menagerie', name:'The Menagerie', line:'hidden', icon:'🦜', hidden:true,
      desc:'The jungle teems with creatures no one on the mainland has ever seen. Capture a collection of exotic animals for the colony\'s wonder.',
      requires:{ flag:['seen_jungle'] },
      objectives:[ {type:'have_res', res:'exoticpet', amt:6}, {type:'build', building:'botanical_garden', amt:1} ],
      rewards:[ {type:'morale',amt:12}, {type:'coin',amt:200} ], reward_text:'+12 morale, +200 coin', flag:'built_menagerie' },

    { id:'hid_master_chef', name:'A Feast Fit for Kings', line:'hidden', icon:'🍽️', hidden:true,
      desc:'Erim wagers the colony can set a table to shame any mainland court. Stockpile bread, meat, fruit and spice all at once.',
      requires:{ flag:['unlocked_trade'] },
      objectives:[ {type:'have_res', res:'bread', amt:30}, {type:'have_res', res:'meat', amt:30}, {type:'have_res', res:'spice', amt:10} ],
      rewards:[ {type:'morale',amt:15}, {type:'buff', stat:'global_prod', mult:1.1, days:5, label:'The Great Feast'} ], reward_text:'+15 morale, production buff', flag:'held_feast' },

    { id:'hid_polymath', name:'The Renaissance Colony', line:'hidden', icon:'🧠', hidden:true,
      desc:'A rumor spreads that your tiny island knows more than the great universities. Prove it by mastering nearly every art and science.',
      requires:{ flag:['reached_colony'] },
      objectives:[ {type:'tech', amt:45} ],
      rewards:[ {type:'research',amt:250}, {type:'buff', stat:'research', mult:1.3, days:8, label:'Age of Reason'} ], reward_text:'+250 research, big research buff', flag:'renaissance' },

    { id:'hid_full_employment', name:'Every Hand Working', line:'hidden', icon:'🛠️', hidden:true,
      desc:'A well-run colony wastes no one. Build a thriving workforce where dozens of settlers each have a purpose.',
      requires:{ flag:['reached_settlement'] },
      objectives:[ {type:'population', amt:25}, {type:'job_workers', job:'build', amt:5}, {type:'job_workers', job:'research', amt:3} ],
      rewards:[ {type:'coin',amt:150}, {type:'morale',amt:8} ], reward_text:'+150 coin, +8 morale', flag:'full_employment' },

    { id:'hid_hermit', name:'The Hermit of the Hills', line:'hidden', icon:'🧙', hidden:true,
      desc:'In the highlands lives a strange old hermit who survived the island long before you. Earn his trust with a hoard of medicine, and he shares his secrets.',
      requires:{ flag:['seen_highlands'] },
      objectives:[ {type:'total_res', res:'medicine', amt:25} ],
      rewards:[ {type:'research',amt:120}, {type:'morale',amt:6} ], reward_text:'+120 research, +6 morale', flag:'met_hermit' },

    { id:'hid_gem_cutter', name:'The Hidden Gem Cutter', line:'hidden', icon:'💎', hidden:true,
      desc:'Among the cave-mappers is a settler with a jeweler\'s past. Feed her enough precious minerals and she\'ll make the colony glitter.',
      requires:{ flag:['seen_caves'] },
      objectives:[ {type:'total_res', res:'gem', amt:25} ],
      rewards:[ {type:'coin',amt:350}, {type:'morale',amt:8} ], reward_text:'+350 coin, +8 morale', flag:'gem_cutter' },

    { id:'hid_great_navigator', name:'Charts of the Lost Sea', line:'hidden', icon:'🧭', hidden:true,
      desc:'Salvaged charts hint at routes no living sailor knows. Run enough expeditions and Leif may piece together the lost sea-roads.',
      requires:{ flag:['unlocked_exploration'] },
      objectives:[ {type:'expeditions', amt:12} ],
      rewards:[ {type:'buff', stat:'explore', mult:1.4, days:8, label:'Lost Charts'}, {type:'research',amt:100} ], reward_text:'Big explore buff, +100 research', flag:'lost_charts' },

    { id:'hid_pillar_of_steel', name:'A Pillar of Steel', line:'hidden', icon:'🏗️', hidden:true,
      desc:'Robin has a secret ambition: a single, perfect steel tower to test everything she\'s learned. Produce a mountain of steel to make it real.',
      requires:{ flag:['unlocked_steel'] },
      objectives:[ {type:'total_res', res:'steel', amt:400}, {type:'char_level', charId:'robin', level:14} ],
      rewards:[ {type:'buff', stat:'global_prod', mult:1.15, days:6, label:'Steel Pillar'}, {type:'coin',amt:200} ], reward_text:'Production buff, +200 coin', flag:'steel_pillar' },

    { id:'hid_island_paradise', name:'Island Paradise', line:'hidden', icon:'🏝️', hidden:true,
      desc:'They called this place a graveyard the night you washed ashore. Make it a paradise instead — joyful, crowded, and utterly at peace.',
      requires:{ flag:['reached_town'] },
      objectives:[ {type:'morale', amt:95}, {type:'population', amt:40} ],
      rewards:[ {type:'coin',amt:400}, {type:'buff', stat:'global_prod', mult:1.2, days:10, label:'Paradise Found'} ], reward_text:'+400 coin, great production buff', flag:'paradise' },

    { id:'hid_legend_complete', name:'The Castaways\' Saga', line:'hidden', icon:'📜', hidden:true,
      desc:'Every survivor has become a legend in their own right. See Robin, Lenni, Leif and Erim each reach the height of their craft.',
      requires:{ flag:['reached_town'] },
      objectives:[ {type:'char_level', charId:'robin', level:15}, {type:'char_level', charId:'lenni', level:15}, {type:'char_level', charId:'leif', level:15} ],
      rewards:[ {type:'coin',amt:500}, {type:'morale',amt:15} ], reward_text:'+500 coin, +15 morale', flag:'saga_complete' },

    { id:'hid_self_sufficient', name:'Need No One', line:'hidden', icon:'🌾', hidden:true,
      desc:'A secret pride of the colony: to want for nothing from the outside world. Master the art of true self-sufficiency.',
      requires:{ flag:['reached_colony'] },
      objectives:[ {type:'tech_id', id:'self_sufficiency'} ],
      rewards:[ {type:'buff', stat:'global_prod', mult:1.15, days:8, label:'Self-Reliance'}, {type:'morale',amt:10} ], reward_text:'Production buff, +10 morale', flag:'self_sufficient' },
  ];
  CG.QUESTS = QUESTS;
})(typeof window !== 'undefined' ? window : globalThis);
