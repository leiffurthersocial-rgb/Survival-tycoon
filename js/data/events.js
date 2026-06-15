/* data/events.js — dynamic events */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const EVENTS = [
    /* ============================================================
     * WEATHER — early survival pressure, water swings, storms
     * ============================================================ */
    { id:'gentle_rain', name:'Gentle Rain', icon:'🌦️', desc:'A soft rain refills your water stores overnight.', category:'weather', weight:3, minStage:1, maxStage:4, cooldownDays:6,
      effects:[ {type:'resource', res:'water', amt:12} ] },

    { id:'morning_dew', name:'Heavy Dew', icon:'💦', desc:'Thick dew clings to broad palm leaves at dawn — easy water for the taking.', category:'weather', weight:3, minStage:1, maxStage:3, cooldownDays:5,
      effects:[ {type:'resource', res:'water', amt:7} ] },

    { id:'warm_spell', name:'Warm Spell', icon:'☀️', desc:'A run of bright, dry days lifts everyone\'s spirits and dries the firewood.', category:'weather', weight:2, minStage:1, cooldownDays:9,
      effects:[ {type:'morale', amt:4}, {type:'resource', res:'water', amt:-4} ] },

    { id:'sea_breeze', name:'Cool Sea Breeze', icon:'🌬️', desc:'A steady breeze off the water keeps the camp comfortable and the workers fresh.', category:'weather', weight:2, minStage:1, cooldownDays:8,
      effects:[ {type:'need', need:'energy', amt:8, who:'all'} ] },

    { id:'humid_haze', name:'Humid Haze', icon:'🌁', desc:'A muggy haze settles over the island and saps everyone\'s strength.', category:'weather', weight:2, minStage:1, cooldownDays:8,
      effects:[ {type:'need', need:'energy', amt:-7, who:'all'} ] },

    { id:'dry_days', name:'Dry Stretch', icon:'🌵', desc:'No rain for days — the water catches run low.', category:'weather', weight:2, minStage:1, maxStage:5, cooldownDays:10,
      effects:[ {type:'resource', res:'water', pct:-0.15} ] },

    { id:'drought', name:'Drought', icon:'☀️', desc:'The sun bakes the island and every pool shrinks to mud.', category:'weather', weight:1, minStage:2, cooldownDays:16,
      choices:[
        { text:'Ration water carefully', tooltip:'Save supplies, strain people', effects:[ {type:'resource', res:'water', amt:-6}, {type:'need', need:'thirst', amt:-10, who:'all'} ], result:'You stretch the water thin. Throats are dry but the stores hold.' },
        { text:'Dig for a hidden seep', tooltip:'Spend tools for a chance at water', cost:{tools:1}, effects:[ {type:'resource', res:'water', amt:16}, {type:'need', need:'energy', amt:-6, who:'random'} ], result:'After hard digging, a cool seep bubbles up.' }
      ] },

    { id:'tropical_storm', name:'Tropical Storm', icon:'⛈️', desc:'A fierce storm batters the camp through the night.', category:'weather', weight:1.5, minStage:2, cooldownDays:14,
      choices:[
        { text:'Shelter everyone (lose a work day)', tooltip:'Spend wood to stay safe', cost:{wood:5}, effects:[ {type:'morale', amt:3} ], result:'You hunker down. Everyone is shaken but safe.' },
        { text:'Protect the stores', tooltip:'Risk to people, save goods', effects:[ {type:'health', amt:-7, who:'random'}, {type:'resource', res:'fish', amt:-3} ], result:'You save most supplies but someone takes a fall.' }
      ] },

    { id:'monsoon_rains', name:'Monsoon Rains', icon:'🌧️', desc:'Days of warm downpour fill every barrel and swell the river.', category:'weather', weight:2, minStage:1, maxStage:5, cooldownDays:11,
      effects:[ {type:'resource', res:'water', amt:20}, {type:'buff', stat:'job:farm', mult:1.4, days:3, label:'Monsoon (+40% farming)'} ] },

    { id:'lightning_strike', name:'Lightning Strike', icon:'⚡', desc:'A bolt splits a dead palm at the camp\'s edge — frightening, but it leaves dry wood.', category:'weather', weight:1, minStage:2, cooldownDays:14,
      effects:[ {type:'resource', res:'wood', amt:8}, {type:'morale', amt:-3} ] },

    { id:'king_tide', name:'King Tide', icon:'🌊', desc:'An unusually high tide surges up the beach and laps at the stores.', category:'weather', weight:1.5, minStage:1, maxStage:5, cooldownDays:12,
      choices:[
        { text:'Haul supplies uphill', tooltip:'Tiring but safe', effects:[ {type:'need', need:'energy', amt:-8, who:'all'} ], result:'Everyone pitches in and the stores stay dry.' },
        { text:'Sandbag the shoreline', tooltip:'Spend sand to hold the line', cost:{sand:6}, effects:[ {type:'morale', amt:2} ], result:'A wall of wet sand turns the surge aside.' }
      ] },

    { id:'red_sky_dawn', name:'Red Sky at Dawn', icon:'🌅', desc:'A blood-red sunrise — sailors\' warning of rough weather to come.', category:'weather', weight:1.5, minStage:1, maxStage:4, cooldownDays:10,
      effects:[ {type:'flag', key:'storm_warning'}, {type:'morale', amt:-2} ] },

    { id:'cool_night', name:'Cold Snap', icon:'❄️', desc:'A rare chill settles in after dark and everyone huddles by the fire.', category:'weather', weight:1.5, minStage:1, maxStage:4, cooldownDays:12,
      choices:[
        { text:'Burn extra firewood', tooltip:'Spend wood to keep warm', cost:{wood:4}, effects:[ {type:'morale', amt:3} ], result:'The fire roars and the camp stays cozy.' },
        { text:'Tough it out', tooltip:'Save wood, lose some rest', effects:[ {type:'need', need:'energy', amt:-9, who:'all'} ], result:'A long, shivering night — but the woodpile is untouched.' }
      ] },

    { id:'perfect_weather', name:'Perfect Day', icon:'🌤️', desc:'A flawless day of sun and gentle wind — work has never felt so easy.', category:'weather', weight:1.5, minStage:1, cooldownDays:10,
      effects:[ {type:'buff', stat:'global_prod', mult:1.15, days:2, label:'Perfect Weather (+15% output)'} ] },

    { id:'thick_fog', name:'Thick Fog', icon:'🌫️', desc:'A heavy fog rolls in off the sea and slows every expedition to a crawl.', category:'weather', weight:1.5, minStage:2, maxStage:6, cooldownDays:10,
      effects:[ {type:'buff', stat:'explore', mult:0.7, days:2, label:'Thick Fog (-30% exploration)'} ] },

    { id:'hailstorm', name:'Freak Hailstorm', icon:'🌨️', desc:'Hail the size of pebbles rattles the rooftops and dents the crop beds.', category:'weather', weight:1, minStage:2, maxStage:6, cooldownDays:15,
      effects:[ {type:'resource', res:'crops', pct:-0.2}, {type:'morale', amt:-3} ] },

    { id:'rainbow', name:'Double Rainbow', icon:'🌈', desc:'A brilliant double rainbow arcs over the bay after the rain clears.', category:'weather', weight:1.5, minStage:1, cooldownDays:9,
      effects:[ {type:'morale', amt:6} ] },

    /* ============================================================
     * WILDLIFE — early game, fishing/hunting/foraging swings, fauna
     * ============================================================ */
    { id:'great_shoal', name:'Great Shoal', icon:'🐟', desc:'A massive shoal moves into the bay — fishing is incredible!', category:'wildlife', weight:2, minStage:1, maxStage:5, cooldownDays:10,
      effects:[ {type:'buff', stat:'job:fish', mult:1.6, days:3, label:'Great Shoal (+60% fishing)'} ] },

    { id:'turtle_nesting', name:'Turtle Nesting', icon:'🐢', desc:'Sea turtles come ashore to nest, leaving a windfall of eggs in the sand.', category:'wildlife', weight:2, minStage:1, maxStage:4, cooldownDays:11,
      choices:[
        { text:'Gather a few eggs', tooltip:'A modest, sustainable harvest', effects:[ {type:'resource', res:'fruit', amt:5}, {type:'morale', amt:1} ], result:'You take only a handful and leave the nest to thrive.' },
        { text:'Take the whole nest', tooltip:'More food now, but it feels wrong', effects:[ {type:'resource', res:'fruit', amt:12}, {type:'morale', amt:-4} ] , result:'The larder is full, but the empty beach weighs on you.' }
      ] },

    { id:'wild_boar', name:'Wild Boar', icon:'🐗', desc:'A fat boar roots through the underbrush near camp.', category:'wildlife', weight:2, minStage:1, maxStage:5, cooldownDays:9,
      choices:[
        { text:'Hunt it down', tooltip:'Meat and hide, but boars fight back', effects:[ {type:'resource', res:'meat', amt:6}, {type:'resource', res:'hide', amt:3}, {type:'health', amt:-5, who:'random'} ], result:'You bring it down after a scuffle — fresh meat tonight.' },
        { text:'Drive it off', tooltip:'Protect the camp, no reward', effects:[ {type:'morale', amt:1} ], result:'You chase the boar back into the trees, gardens intact.' }
      ] },

    { id:'fruit_bats', name:'Fruit Bats', icon:'🦇', desc:'A swarm of fruit bats descends on the orchard overnight.', category:'wildlife', weight:2, minStage:1, maxStage:5, cooldownDays:8,
      effects:[ {type:'resource', res:'fruit', pct:-0.15} ] },

    { id:'crab_migration', name:'Crab Migration', icon:'🦀', desc:'Thousands of crabs scuttle across the beach toward the sea — easy pickings.', category:'wildlife', weight:2, minStage:1, maxStage:4, cooldownDays:10,
      effects:[ {type:'resource', res:'meat', amt:5}, {type:'resource', res:'fish', amt:3} ] },

    { id:'monkey_raid', name:'Monkey Raid', icon:'🐒', desc:'A troop of cheeky monkeys ransacks the food stores and scatters laughing.', category:'wildlife', weight:2, minStage:1, maxStage:5, cooldownDays:9,
      choices:[
        { text:'Chase them off', tooltip:'Save food, tire the camp', effects:[ {type:'need', need:'energy', amt:-6, who:'random'}, {type:'resource', res:'fruit', amt:-2} ], result:'You recover most of the loot after a noisy chase.' },
        { text:'Bribe them with fruit', tooltip:'Give a little to lose a little less', cost:{fruit:3}, effects:[ {type:'morale', amt:2} ], result:'A peace offering of fruit, and the troop moves on content.' }
      ] },

    { id:'seabird_colony', name:'Seabird Colony', icon:'🐦', desc:'Nesting seabirds blanket the cliffs, their guano rich for the fields.', category:'wildlife', weight:2, minStage:2, maxStage:6, cooldownDays:11,
      effects:[ {type:'buff', stat:'job:farm', mult:1.3, days:3, label:'Guano fertilizer (+30% farming)'} ] },

    { id:'injured_dolphin', name:'Stranded Dolphin', icon:'🐬', desc:'A dolphin beaches itself in the shallows, thrashing weakly.', category:'wildlife', weight:1.5, minStage:1, maxStage:6, cooldownDays:14,
      choices:[
        { text:'Push it back to sea', tooltip:'Kind, but hard work', effects:[ {type:'need', need:'energy', amt:-7, who:'all'}, {type:'morale', amt:7} ], result:'With everyone wading in, the dolphin slips free and leaps away.' },
        { text:'Leave it be', tooltip:'Do nothing', effects:[ {type:'morale', amt:-3} ], result:'You turn away, and the tide decides its fate.' }
      ] },

    { id:'snake_in_camp', name:'Snake in Camp', icon:'🐍', desc:'A long snake is found coiled under the food stores.', category:'wildlife', weight:2, minStage:1, maxStage:5, cooldownDays:9,
      choices:[
        { text:'Carefully remove it', tooltip:'Safe and calm', effects:[ {type:'morale', amt:1} ], result:'Leif coaxes it onto a stick and carries it far off.' },
        { text:'Kill it for meat', tooltip:'Food, but a small risk', effects:[ {type:'resource', res:'meat', amt:3}, {type:'health', amt:-4, who:'random'} ], result:'A quick strike — snake stew, and one nipped hand.' }
      ] },

    { id:'wild_chickens', name:'Wild Jungle Fowl', icon:'🐔', desc:'A clutch of wild fowl nests near the treeline — and they could be tamed.', category:'wildlife', weight:1.5, minStage:1, maxStage:5, cooldownDays:12,
      effects:[ {type:'resource', res:'meat', amt:3}, {type:'resource', res:'fruit', amt:2} ] },

    { id:'parrot_friend', name:'Curious Parrot', icon:'🦜', desc:'A brilliant parrot takes a liking to the camp and refuses to leave.', category:'wildlife', weight:1, minStage:1, maxStage:6, cooldownDays:16,
      effects:[ {type:'morale', amt:5} ] },

    { id:'shark_waters', name:'Sharks in the Shallows', icon:'🦈', desc:'Fins circle the fishing grounds — the divers stay close to shore.', category:'wildlife', weight:1.5, minStage:1, maxStage:6, cooldownDays:10,
      effects:[ {type:'buff', stat:'job:fish', mult:0.75, days:2, label:'Sharks about (-25% fishing)'} ] },

    { id:'bee_swarm', name:'Wild Beehive', icon:'🐝', desc:'A humming hive hangs heavy in a hollow tree, dripping with honey.', category:'wildlife', weight:1.5, minStage:1, maxStage:5, cooldownDays:12,
      choices:[
        { text:'Smoke them out for honey', tooltip:'Sweet reward, a few stings', effects:[ {type:'resource', res:'fruit', amt:6}, {type:'health', amt:-3, who:'random'} ], result:'Golden honey for all — and a few swollen fingers.' },
        { text:'Leave the hive alone', tooltip:'No reward, no risk', effects:[], result:'You give the bees a wide berth and move on.' }
      ] },

    { id:'manta_rays', name:'Gliding Manta Rays', icon:'🐠', desc:'Great manta rays glide through the bay in a slow, peaceful parade.', category:'wildlife', weight:1.5, minStage:1, cooldownDays:11,
      effects:[ {type:'morale', amt:4} ] },

    { id:'rat_infestation', name:'Rats in the Stores', icon:'🐀', desc:'Rats have found the grain and are breeding fast.', category:'wildlife', weight:1.5, minStage:2, maxStage:6, cooldownDays:12,
      choices:[
        { text:'Set traps with tools', tooltip:'Spend tools to end it cleanly', cost:{tools:1}, effects:[ {type:'morale', amt:2} ], result:'Snap traps clear the vermin in a single night.' },
        { text:'Let it ride', tooltip:'Lose a little stored food', effects:[ {type:'resource', res:'crops', pct:-0.15}, {type:'resource', res:'bread', pct:-0.1} ], result:'The rats feast before you finally drive them out.' }
      ] },

    /* ============================================================
     * FORTUNE — luck, small windfalls, useful buffs (mostly positive)
     * ============================================================ */
    { id:'driftwood_haul', name:'Driftwood Haul', icon:'🪵', desc:'A storm tide piles fine driftwood along the high-water line.', category:'fortune', weight:3, minStage:1, maxStage:5, cooldownDays:7,
      effects:[ {type:'resource', res:'wood', amt:9} ] },

    { id:'ripe_grove', name:'Ripe Grove', icon:'🍍', desc:'A hidden grove of fruit comes ripe all at once.', category:'fortune', weight:3, minStage:1, maxStage:4, cooldownDays:7,
      effects:[ {type:'resource', res:'fruit', amt:8} ] },

    { id:'rich_seam', name:'Rich Stone Seam', icon:'🪨', desc:'A cracked boulder splits to reveal an easy seam of good stone.', category:'fortune', weight:2, minStage:1, maxStage:5, cooldownDays:9,
      effects:[ {type:'resource', res:'stone', amt:8} ] },

    { id:'fiber_field', name:'Fiber in Bloom', icon:'🌾', desc:'The fiber plants put out a heavy season of long, strong stalks.', category:'fortune', weight:2, minStage:1, maxStage:4, cooldownDays:8,
      effects:[ {type:'resource', res:'fiber', amt:8} ] },

    { id:'lucky_dive', name:'Lucky Dive', icon:'🦪', desc:'A diver surfaces clutching an oyster — and it holds a pearl!', category:'fortune', weight:1, minStage:3, cooldownDays:14,
      effects:[ {type:'resource', res:'pearl', amt:1} ] },

    { id:'good_omen', name:'Good Omen', icon:'🍀', desc:'A green sprout pushes up through the old fire pit — the camp takes heart.', category:'fortune', weight:2, minStage:1, cooldownDays:9,
      effects:[ {type:'morale', amt:5} ] },

    { id:'inspired_tinkering', name:'Inspired Tinkering', icon:'💡', desc:'Lenni stays up late and cracks a stubborn problem by lamplight.', category:'fortune', weight:2, minStage:2, cooldownDays:10,
      effects:[ {type:'research', amt:14} ] },

    { id:'sharpened_tools', name:'Well-Honed Tools', icon:'🛠️', desc:'A morning spent sharpening every blade makes the whole camp hum.', category:'fortune', weight:2, minStage:2, cooldownDays:9,
      effects:[ {type:'buff', stat:'global_prod', mult:1.12, days:3, label:'Sharp Tools (+12% output)'} ] },

    { id:'second_wind', name:'Second Wind', icon:'😤', desc:'A burst of collective energy sweeps the camp and the work flies.', category:'fortune', weight:2, minStage:1, cooldownDays:9,
      effects:[ {type:'need', need:'energy', amt:14, who:'all'} ] },

    { id:'found_coins', name:'Coins in the Wreck', icon:'🪙', desc:'A rusted strongbox in the wreck still holds a few good coins.', category:'fortune', weight:2, minStage:1, maxStage:5, cooldownDays:10,
      effects:[ {type:'coin', amt:10} ] },

    { id:'message_bottle', name:'Message in a Bottle', icon:'🍾', desc:'A sealed bottle bobs ashore with a faded chart inside.', category:'fortune', weight:1, minStage:2, maxStage:6, cooldownDays:14,
      choices:[
        { text:'Study the chart', tooltip:'Knowledge from a lost sailor', effects:[ {type:'research', amt:10} ], result:'The scrawled notes teach you something new about the coast.' },
        { text:'Sell it to a passing trader', tooltip:'Turn curiosity into coin', effects:[ {type:'coin', amt:12} ], result:'A trader pays handsomely for the curious old map.' }
      ] },

    { id:'windfall_clay', name:'Riverbank Collapse', icon:'🟤', desc:'A bank slumps after the rains, exposing a thick vein of good clay.', category:'fortune', weight:2, minStage:2, maxStage:6, cooldownDays:10,
      effects:[ {type:'resource', res:'clay', amt:9} ] },

    { id:'salvage_rope', name:'Salvaged Rigging', icon:'🪢', desc:'A tangle of ship\'s rigging washes in, still sound enough to use.', category:'fortune', weight:2, minStage:1, maxStage:5, cooldownDays:10,
      effects:[ {type:'resource', res:'rope', amt:5} ] },

    { id:'clear_thinking', name:'A Clear Head', icon:'🧠', desc:'A calm, focused mood settles over the researchers.', category:'fortune', weight:1.5, minStage:2, cooldownDays:11,
      effects:[ {type:'buff', stat:'research', mult:1.4, days:3, label:'Focused Minds (+40% research)'} ] },

    { id:'lucky_haul', name:'A Lucky Catch', icon:'🎣', desc:'Every line comes up full today — the smokehouse can barely keep up.', category:'fortune', weight:2, minStage:1, maxStage:5, cooldownDays:9,
      effects:[ {type:'resource', res:'fish', amt:9} ] },

    /* ============================================================
     * DANGER — mostly minStage 2+, recoverable losses, fair choices
     * ============================================================ */
    { id:'minor_cave_in', name:'Quarry Slip', icon:'⛏️', desc:'Loose rock gives way at the quarry face and a worker is caught short.', category:'danger', weight:1.5, minStage:2, maxStage:6, cooldownDays:11,
      effects:[ {type:'health', amt:-6, who:'random'}, {type:'resource', res:'stone', amt:4} ] },

    { id:'tool_breakage', name:'Broken Tools', icon:'🔧', desc:'Hard use finally snaps a few well-worn tools.', category:'danger', weight:2, minStage:2, maxStage:6, cooldownDays:9,
      effects:[ {type:'resource', res:'tools', pct:-0.2} ] },

    { id:'food_spoilage', name:'Spoiled Stores', icon:'🤢', desc:'Damp gets into the larder and some of the food has turned.', category:'danger', weight:2, minStage:1, maxStage:5, cooldownDays:10,
      choices:[
        { text:'Salt and salvage what you can', tooltip:'Lose a little, save the rest', effects:[ {type:'resource', res:'fish', pct:-0.1} ], result:'Quick work saves most of the catch before it spoils.' },
        { text:'Toss it all to be safe', tooltip:'Lose more, but no one gets sick', effects:[ {type:'resource', res:'fish', pct:-0.2}, {type:'morale', amt:2} ], result:'Better safe than sorry — the bad food goes to the tide.' }
      ] },

    { id:'campfire_flareup', name:'Campfire Flare-Up', icon:'🔥', desc:'A gust catches the cookfire and embers leap toward the woodpile.', category:'danger', weight:1.5, minStage:1, maxStage:5, cooldownDays:11,
      choices:[
        { text:'Beat it out fast', tooltip:'Risk a burn to save the wood', effects:[ {type:'health', amt:-4, who:'random'} ], result:'Singed but quick — the woodpile is saved.' },
        { text:'Let it burn down', tooltip:'Lose some wood, no injuries', effects:[ {type:'resource', res:'wood', amt:-6} ], result:'You let the fire eat a stack of logs and gutter out.' }
      ] },

    { id:'twisted_ankle', name:'Twisted Ankle', icon:'🩹', desc:'A misstep on the rocks leaves one of the crew limping.', category:'danger', weight:2, minStage:1, maxStage:6, cooldownDays:9,
      effects:[ {type:'health', amt:-5, who:'random'} ] },

    { id:'fever_outbreak', name:'Marsh Fever', icon:'🤒', desc:'A sweating fever spreads from the wetlands through the camp.', category:'danger', weight:1.5, minStage:2, maxStage:6, cooldownDays:15,
      choices:[
        { text:'Treat with medicine', tooltip:'Spend medicine for a clean recovery', cost:{medicine:1}, effects:[ {type:'health', amt:6, who:'all'}, {type:'morale', amt:2} ], result:'A dose all round, and the fever breaks by morning.' },
        { text:'Rest and ride it out', tooltip:'No cost, but it lingers', effects:[ {type:'health', amt:-6, who:'all'}, {type:'need', need:'energy', amt:-8, who:'all'} ], result:'Days of bed rest pass before the fever finally lifts.' }
      ] },

    { id:'rockslide_block', name:'Rockslide on the Trail', icon:'🪨', desc:'A slide buries the highland trail and cuts off an expedition route.', category:'danger', weight:1.5, minStage:3, maxStage:7, cooldownDays:12,
      choices:[
        { text:'Clear the path', tooltip:'Hard labor reopens the route', effects:[ {type:'need', need:'energy', amt:-9, who:'all'}, {type:'resource', res:'stone', amt:6} ], result:'Backbreaking work clears the trail — and yields good stone.' },
        { text:'Find a way around', tooltip:'Slower expeditions for a while', effects:[ {type:'buff', stat:'explore', mult:0.8, days:3, label:'Detour (-20% exploration)'} ], result:'A longer path keeps the expeditions running, if slowly.' }
      ] },

    { id:'leaky_roof', name:'Leaking Roofs', icon:'🏚️', desc:'The rains find every weak seam in the thatch and soak the bunks.', category:'danger', weight:1.5, minStage:2, maxStage:6, cooldownDays:10,
      choices:[
        { text:'Patch with fresh thatch', tooltip:'Spend fiber to fix it right', cost:{fiber:5}, effects:[ {type:'morale', amt:2} ], result:'New thatch goes up and the bunks stay dry.' },
        { text:'Sleep wet for now', tooltip:'No cost, poor rest', effects:[ {type:'need', need:'energy', amt:-8, who:'all'}, {type:'morale', amt:-3} ], result:'A damp, restless night for everyone.' }
      ] },

    { id:'foraging_mishap', name:'Poison Berries', icon:'🍒', desc:'Someone eats a handful of bright berries that turn out to be poison.', category:'danger', weight:1.5, minStage:1, maxStage:5, cooldownDays:11,
      effects:[ {type:'health', amt:-5, who:'random'}, {type:'morale', amt:-2} ] },

    { id:'jellyfish_bloom', name:'Jellyfish Bloom', icon:'🪼', desc:'A bloom of stinging jellyfish drifts through the dive grounds.', category:'danger', weight:1.5, minStage:2, maxStage:7, cooldownDays:12,
      effects:[ {type:'health', amt:-4, who:'random'}, {type:'buff', stat:'job:pearl_dive', mult:0.7, days:2, label:'Jellyfish (-30% diving)'} ] },

    { id:'pest_blight', name:'Crop Blight', icon:'🐛', desc:'A creeping blight spots the leaves of the crop beds.', category:'danger', weight:1.5, minStage:2, maxStage:6, cooldownDays:13,
      choices:[
        { text:'Burn the infected plants', tooltip:'Lose some crops, stop the spread', effects:[ {type:'resource', res:'crops', pct:-0.2} ], result:'A quick cull and a controlled burn save the rest of the field.' },
        { text:'Try a herbal remedy', tooltip:'Spend medicine to save the harvest', cost:{medicine:1}, effects:[ {type:'morale', amt:2} ], result:'A brewed wash clears the blight and the field recovers.' }
      ] },

    { id:'sleepless_nights', name:'Sleepless Nights', icon:'😩', desc:'Howling wind and worry rob the whole camp of sleep.', category:'danger', weight:1.5, minStage:1, maxStage:5, cooldownDays:10,
      effects:[ {type:'need', need:'energy', amt:-10, who:'all'} ] },

    { id:'scaffold_collapse', name:'Scaffold Collapse', icon:'🧱', desc:'A half-finished scaffold buckles and comes down in a clatter of poles.', category:'danger', weight:1, minStage:3, maxStage:7, cooldownDays:13,
      effects:[ {type:'health', amt:-6, who:'random'}, {type:'resource', res:'planks', pct:-0.1} ] },

    { id:'flash_flood', name:'Flash Flood', icon:'🌊', desc:'The river bursts its banks after upstream rain and races through the low camp.', category:'danger', weight:1, minStage:2, maxStage:6, cooldownDays:16,
      choices:[
        { text:'Save the people', tooltip:'Everyone safe, some stores lost', effects:[ {type:'resource', res:'wood', amt:-5}, {type:'resource', res:'fiber', amt:-4} ], result:'You get everyone to high ground; the floodwater takes some supplies.' },
        { text:'Grab the tools and seed', tooltip:'Save key goods, risk a soaking', cost:{}, effects:[ {type:'health', amt:-5, who:'random'}, {type:'resource', res:'tools', amt:2} ], result:'You snatch the vital gear from the current — and pull a friend out too.' }
      ] },

    { id:'gear_rust', name:'Salt Rust', icon:'🧂', desc:'The sea air eats at the iron stores, flaking them with rust.', category:'danger', weight:1.5, minStage:3, maxStage:7, cooldownDays:12,
      effects:[ {type:'resource', res:'ironbar', pct:-0.15} ] },

    { id:'venomous_centipede', name:'Giant Centipede', icon:'🐛', desc:'A monstrous centipede bites a sleeper before it can be flung away.', category:'danger', weight:1, minStage:2, maxStage:6, cooldownDays:13,
      effects:[ {type:'health', amt:-7, who:'random'} ] },

    /* ============================================================
     * SOCIAL — settlers, morale, community; weighted toward later
     * ============================================================ */
    { id:'lone_castaway', name:'Lone Castaway', icon:'🚶', desc:'A bedraggled survivor stumbles out of the surf, begging to join you.', category:'social', weight:2, minStage:1, maxStage:5, cooldownDays:12,
      choices:[
        { text:'Welcome them in', tooltip:'A new pair of hands (costs food)', cost:{fish:4}, effects:[ {type:'settler', count:1}, {type:'morale', amt:3} ], result:'You share a meal and the colony grows by one.' },
        { text:'Send them on with supplies', tooltip:'Be kind without the mouth to feed', cost:{fruit:3}, effects:[ {type:'morale', amt:4} ], result:'You give them food and directions; the camp feels good about it.' }
      ] },

    { id:'campfire_tales', name:'Campfire Tales', icon:'🔥', desc:'Old stories and laughter go round the fire late into the night.', category:'social', weight:2, minStage:1, cooldownDays:8,
      effects:[ {type:'morale', amt:5} ] },

    { id:'small_feast', name:'A Shared Feast', icon:'🍲', desc:'The cooks pool the best of the stores for one great meal together.', category:'social', weight:2, minStage:1, cooldownDays:10,
      choices:[
        { text:'Hold the feast', tooltip:'Spend food for a big morale boost', cost:{fish:5}, effects:[ {type:'morale', amt:9}, {type:'need', need:'hunger', amt:12, who:'all'} ], result:'Full bellies and full hearts all around.' },
        { text:'Keep the stores for lean days', tooltip:'No cost, small lift', effects:[ {type:'morale', amt:1} ], result:'A sensible call — the larder stays stocked.' }
      ] },

    { id:'petty_quarrel', name:'Petty Quarrel', icon:'😠', desc:'A squabble over chores boils over between two of the crew.', category:'social', weight:2, minStage:1, cooldownDays:9,
      choices:[
        { text:'Mediate patiently', tooltip:'Erim smooths it over', effects:[ {type:'morale', amt:3} ], result:'Cooler heads prevail and the two shake on it.' },
        { text:'Ignore it', tooltip:'Let it fester a little', effects:[ {type:'morale', amt:-4} ], result:'The bad blood lingers and sours the mood.' }
      ] },

    { id:'newcomers', name:'Wandering Family', icon:'👨‍👩‍👧', desc:'A small family appears from the far side of the island seeking a home.', category:'social', weight:1.5, minStage:3, maxStage:7, cooldownDays:14,
      choices:[
        { text:'Take them all in', tooltip:'Two new settlers (costs food)', cost:{fruit:6}, effects:[ {type:'settler', count:2}, {type:'morale', amt:2} ], result:'The colony swells with eager new hands.' },
        { text:'Offer shelter for the night', tooltip:'Goodwill, no new mouths', cost:{water:4}, effects:[ {type:'morale', amt:3} ], result:'A warm night\'s rest, and they move on grateful.' }
      ] },

    { id:'birthday', name:'A Birthday', icon:'🎂', desc:'Someone realizes it\'s their birthday — the first one on the island.', category:'social', weight:1.5, minStage:1, cooldownDays:12,
      effects:[ {type:'morale', amt:6} ] },

    { id:'music_night', name:'Music Night', icon:'🪕', desc:'A carved flute and a drum of stretched hide fill the night with song.', category:'social', weight:1.5, minStage:1, cooldownDays:9,
      effects:[ {type:'morale', amt:5}, {type:'need', need:'energy', amt:5, who:'all'} ] },

    { id:'leadership_dispute', name:'Who\'s in Charge?', icon:'🗣️', desc:'Tempers flare over who should make the big decisions for the colony.', category:'social', weight:1.5, minStage:3, maxStage:7, cooldownDays:13,
      choices:[
        { text:'Hold a fair vote', tooltip:'A little time, lasting goodwill', effects:[ {type:'morale', amt:5} ], result:'A show of hands settles it, and everyone feels heard.' },
        { text:'Let the loudest win', tooltip:'Quick, but resentment builds', effects:[ {type:'morale', amt:-4} ], result:'The matter is forced, and a few grumble for days.' }
      ] },

    { id:'lovers_match', name:'A New Romance', icon:'💞', desc:'Two of the colonists have quietly fallen for each other.', category:'social', weight:1, minStage:2, cooldownDays:18,
      effects:[ {type:'morale', amt:7} ] },

    { id:'homesickness', name:'Homesickness', icon:'😢', desc:'A gray, quiet day, and thoughts drift to the world left behind.', category:'social', weight:2, minStage:1, cooldownDays:9,
      choices:[
        { text:'Gather everyone to talk', tooltip:'Shared grief, shared comfort', effects:[ {type:'morale', amt:4} ], result:'Speaking it aloud lightens the load for all.' },
        { text:'Bury it in work', tooltip:'A short burst, a heavier heart', effects:[ {type:'buff', stat:'global_prod', mult:1.1, days:1, label:'Distracted by work (+10%)'}, {type:'morale', amt:-3} ], result:'Hands stay busy, but the ache stays too.' }
      ] },

    { id:'community_build', name:'Barn-Raising Spirit', icon:'🤝', desc:'A wave of teamwork sweeps the camp — everyone wants to pitch in.', category:'social', weight:1.5, minStage:2, cooldownDays:11,
      effects:[ {type:'buff', stat:'job:build', mult:1.5, days:3, label:'Team Spirit (+50% building)'} ] },

    { id:'founders_day', name:'Founders\' Day', icon:'🎉', desc:'The colony marks another season since the wreck with a day of rest and games.', category:'social', weight:1.5, minStage:3, cooldownDays:16,
      effects:[ {type:'morale', amt:8}, {type:'need', need:'energy', amt:8, who:'all'} ] },

    { id:'rumor_mill', name:'Rumors and Gossip', icon:'🗨️', desc:'An ugly rumor races around the camp and puts everyone on edge.', category:'social', weight:1.5, minStage:2, cooldownDays:10,
      effects:[ {type:'morale', amt:-3} ] },

    { id:'mentorship', name:'A Patient Teacher', icon:'📚', desc:'An experienced hand spends the day showing the newcomers the ropes.', category:'social', weight:1.5, minStage:2, cooldownDays:11,
      effects:[ {type:'buff', stat:'global_prod', mult:1.1, days:3, label:'Good Training (+10% output)'}, {type:'morale', amt:2} ] },

    /* ============================================================
     * DISCOVERY — exploration finds, region reveals, story (oneShots)
     * ============================================================ */
    { id:'driftwood_crate', name:'Driftwood Crate', icon:'📦', desc:'A crate from the wreck washes ashore. Pry it open?', category:'discovery', weight:2, minStage:1, maxStage:4, cooldownDays:12,
      choices:[
        { text:'Open it carefully', tooltip:'Safe, modest reward', effects:[ {type:'resource', res:'rope', amt:4}, {type:'resource', res:'tools', amt:1} ], result:'Inside: coils of rope and a salvaged tool.' },
        { text:'Smash it open fast', tooltip:'Risk splinters for more', effects:[ {type:'resource', res:'wood', amt:8}, {type:'health', amt:-5, who:'random'} ], result:'You grab the wood but someone cuts their hand.' }
      ] },

    { id:'hidden_spring', name:'Hidden Spring', icon:'⛲', desc:'A scout follows a trickle of water to a clear spring in the rocks.', category:'discovery', weight:2, minStage:1, maxStage:5, cooldownDays:12,
      effects:[ {type:'resource', res:'water', amt:14}, {type:'morale', amt:2} ] },

    { id:'old_toolkit', name:'Buried Toolkit', icon:'🧰', desc:'Half-buried in the dunes, a sailor\'s waterproofed kit of fine tools.', category:'discovery', weight:1.5, minStage:1, maxStage:5, cooldownDays:14,
      effects:[ {type:'resource', res:'tools', amt:2} ] },

    { id:'cave_mouth', name:'A Hidden Cave Mouth', icon:'🕳️', desc:'Leif finds a cave entrance veiled behind a curtain of vines — there\'s a draft from within.', category:'discovery', weight:1, minStage:4, maxStage:7, cooldownDays:0, oneShot:true,
      effects:[ {type:'reveal_region', id:'caves'}, {type:'research', amt:8} ] },

    { id:'cliff_path', name:'The Cliff Path', icon:'🧗', desc:'A narrow goat path winds up toward the far northern shore.', category:'discovery', weight:1, minStage:3, maxStage:6, oneShot:true,
      effects:[ {type:'reveal_region', id:'northcoast'}, {type:'morale', amt:3} ] },

    { id:'old_campsite', name:'Abandoned Campsite', icon:'⛺', desc:'A long-cold fire ring and a lean-to — someone was here before you.', category:'discovery', weight:1.5, minStage:2, maxStage:6, cooldownDays:14,
      effects:[ {type:'resource', res:'rope', amt:3}, {type:'resource', res:'charcoal', amt:3}, {type:'research', amt:4} ] },

    { id:'tide_pools', name:'Rich Tide Pools', icon:'🐚', desc:'At low tide a maze of pools brims with shellfish and shells.', category:'discovery', weight:2, minStage:1, maxStage:5, cooldownDays:10,
      effects:[ {type:'resource', res:'fish', amt:4}, {type:'resource', res:'sand', amt:3} ] },

    { id:'carved_stone', name:'A Strange Carved Stone', icon:'🗿', desc:'A weathered stone face stares up from the jungle floor, marked with unknown signs.', category:'discovery', weight:1, minStage:4, maxStage:7, oneShot:true,
      effects:[ {type:'flag', key:'found_ruins_hint'}, {type:'research', amt:12}, {type:'morale', amt:3} ] },

    { id:'fertile_valley', name:'A Sheltered Valley', icon:'🌄', desc:'Beyond a ridge lies a green, sheltered valley with deep, dark soil.', category:'discovery', weight:1.5, minStage:3, maxStage:7, cooldownDays:15,
      effects:[ {type:'buff', stat:'job:farm', mult:1.4, days:4, label:'Fertile Valley (+40% farming)'} ] },

    { id:'sunken_dinghy', name:'Sunken Dinghy', icon:'🛶', desc:'A ship\'s dinghy lies half-sunk in the shallows, its lockers still sealed.', category:'discovery', weight:1.5, minStage:2, maxStage:6, cooldownDays:13,
      choices:[
        { text:'Dive and salvage', tooltip:'Good haul, cold work', effects:[ {type:'resource', res:'planks', amt:5}, {type:'resource', res:'rope', amt:3}, {type:'need', need:'energy', amt:-6, who:'random'} ], result:'You haul up sound planks and rigging from the wreck.' },
        { text:'Strip it from shore', tooltip:'Less reward, no risk', effects:[ {type:'resource', res:'wood', amt:6} ], result:'You pry loose what you can reach and leave the rest.' }
      ] },

    { id:'glittering_seam', name:'A Glittering Seam', icon:'💎', desc:'Deep in the rock, a miner\'s torch catches an unmistakable glint.', category:'discovery', weight:0.5, minStage:5, maxStage:7, cooldownDays:18,
      effects:[ {type:'resource', res:'gem', amt:1}, {type:'morale', amt:4} ] },

    { id:'medicinal_herbs', name:'Medicinal Herbs', icon:'🌿', desc:'A foraging party recognizes a patch of healing herbs among the ferns.', category:'discovery', weight:1.5, minStage:2, maxStage:6, cooldownDays:12,
      effects:[ {type:'resource', res:'medicine', amt:1}, {type:'research', amt:4} ] },

    { id:'ancient_cache', name:'Ancient Cache', icon:'🏺', desc:'Behind a false wall in the ruins waits a sealed cache of the old people.', category:'discovery', weight:0.5, minStage:5, maxStage:7, oneShot:true,
      choices:[
        { text:'Take the treasure', tooltip:'Coin and curiosities', effects:[ {type:'coin', amt:20}, {type:'resource', res:'gem', amt:1} ], result:'Old coins and a single cut gem — a fortune by island reckoning.' },
        { text:'Study the writings instead', tooltip:'Knowledge over wealth', effects:[ {type:'research', amt:24}, {type:'morale', amt:4} ], result:'The carved tablets give up secrets worth more than gold.' }
      ] },

    { id:'salt_flat', name:'Hidden Salt Flat', icon:'🧂', desc:'A dried-up tidal flat has left a crust of clean white salt.', category:'discovery', weight:1.5, minStage:2, maxStage:6, cooldownDays:13,
      effects:[ {type:'resource', res:'spice', amt:1} ] },

    /* ============================================================
     * MYSTERY — strange, atmospheric, late-game flavor & oneShots
     * ============================================================ */
    { id:'strange_lights', name:'Lights on the Water', icon:'🌌', desc:'Pale lights drift across the dark sea, far from any ship lane.', category:'mystery', weight:1, minStage:3, cooldownDays:15,
      choices:[
        { text:'Watch and wonder', tooltip:'A quiet awe settles in', effects:[ {type:'morale', amt:5} ], result:'You watch until they fade — strange and beautiful.' },
        { text:'Signal back with a fire', tooltip:'Spend wood; who knows what answers', cost:{wood:4}, effects:[ {type:'flag', key:'signaled_lights'}, {type:'morale', amt:2} ], result:'You light a beacon. The lights pulse once, then are gone.' }
      ] },

    { id:'whispering_ruins', name:'Whispering Ruins', icon:'🏛️', desc:'Among the old stones, the wind makes a sound almost like voices.', category:'mystery', weight:1, minStage:5, maxStage:7, cooldownDays:16,
      effects:[ {type:'research', amt:10}, {type:'morale', amt:-2} ] },

    { id:'meteor_shower', name:'Meteor Shower', icon:'☄️', desc:'The whole sky streaks with falling stars and the camp stares up in silence.', category:'mystery', weight:1, minStage:2, cooldownDays:16,
      effects:[ {type:'morale', amt:7} ] },

    { id:'strange_idol', name:'The Smiling Idol', icon:'🪆', desc:'A small carved idol turns up in the camp — no one will admit to placing it there.', category:'mystery', weight:0.5, minStage:4, maxStage:7, oneShot:true,
      choices:[
        { text:'Keep it for luck', tooltip:'A superstitious comfort', effects:[ {type:'flag', key:'kept_idol'}, {type:'morale', amt:4} ], result:'You set it by the fire. Somehow, the camp feels luckier.' },
        { text:'Throw it into the sea', tooltip:'Be rid of the eerie thing', effects:[ {type:'morale', amt:-2} ], result:'It vanishes beneath the waves. Good riddance — probably.' }
      ] },

    { id:'glowing_pool', name:'The Glowing Pool', icon:'🫧', desc:'A cave pool glows a faint, cold blue when the torchlight dies.', category:'mystery', weight:0.5, minStage:5, maxStage:7, cooldownDays:18,
      choices:[
        { text:'Collect a sample', tooltip:'Study the strange water', effects:[ {type:'research', amt:14} ], result:'The luminous water yields fascinating, useful insights.' },
        { text:'Leave it undisturbed', tooltip:'Some things are best left alone', effects:[ {type:'morale', amt:2} ], result:'You back away quietly. The blue glow follows you in dreams.' }
      ] },

    { id:'tremor', name:'A Distant Tremor', icon:'🌋', desc:'The ground shivers and a thread of smoke rises from the mountain.', category:'mystery', weight:1, minStage:4, cooldownDays:14,
      effects:[ {type:'morale', amt:-3}, {type:'flag', key:'volcano_stirs'} ] },

    { id:'ghost_ship', name:'The Ghost Ship', icon:'⛵', desc:'At dawn a ragged, silent ship drifts past the reef — and no one stands at the helm.', category:'mystery', weight:0.5, minStage:4, maxStage:7, oneShot:true,
      choices:[
        { text:'Row out to board it', tooltip:'Brave the wreck for salvage', effects:[ {type:'resource', res:'planks', amt:8}, {type:'resource', res:'cloth', amt:4}, {type:'coin', amt:8} ], result:'Empty but for cargo — you strip it before it drifts away.' },
        { text:'Let it pass', tooltip:'Some ships are best left alone', effects:[ {type:'morale', amt:-2} ], result:'You watch the silent ship slip back into the mist.' }
      ] },

    { id:'message_in_stone', name:'A Warning in Stone', icon:'⚠️', desc:'A scout finds words scratched into a cliff in a hand long dead: "Do not dig deeper."', category:'mystery', weight:0.5, minStage:5, maxStage:7, oneShot:true,
      effects:[ {type:'flag', key:'read_warning'}, {type:'morale', amt:-2}, {type:'research', amt:8} ] },

    { id:'dream_omen', name:'A Shared Dream', icon:'💭', desc:'Half the camp wakes having dreamt the very same strange dream.', category:'mystery', weight:0.5, minStage:3, cooldownDays:18,
      effects:[ {type:'morale', amt:3}, {type:'research', amt:5} ] },

    { id:'compass_spin', name:'The Spinning Needle', icon:'🧭', desc:'Near the volcano the compass needle whirls and will not settle.', category:'mystery', weight:1, minStage:5, maxStage:7, cooldownDays:15,
      effects:[ {type:'buff', stat:'explore', mult:0.85, days:2, label:'Compass haywire (-15% exploration)'} ] },

    /* ============================================================
     * TRADE — passing ships, merchants; weighted later (minStage 3+)
     * ============================================================ */
    { id:'passing_trader', name:'Passing Trader', icon:'⛵', desc:'A trading sloop drops anchor in the bay and the captain calls out a deal.', category:'trade', weight:2, minStage:3, cooldownDays:9,
      choices:[
        { text:'Sell surplus fish', tooltip:'Trade food for coin', cost:{fish:8}, effects:[ {type:'coin', amt:14} ], result:'The catch fetches a fair price in silver.' },
        { text:'Buy a crate of tools', tooltip:'Spend coin for tools', cost:{coin:12}, effects:[ {type:'resource', res:'tools', amt:3} ], result:'A crate of well-made tools comes ashore.' },
        { text:'Wave them on', tooltip:'No deal today', effects:[], result:'You let the sloop sail on with a friendly wave.' }
      ] },

    { id:'spice_merchant', name:'Spice Merchant', icon:'🧆', desc:'A merchant dhow heavy with spices seeks rare island goods.', category:'trade', weight:1.5, minStage:4, cooldownDays:12,
      choices:[
        { text:'Trade rare wood for spice', tooltip:'Swap luxury for luxury', cost:{rarewood:1}, effects:[ {type:'resource', res:'spice', amt:2} ], result:'A fine length of rarewood for two sacks of spice.' },
        { text:'Sell pearls for coin', tooltip:'Cash in your pearls', cost:{pearl:1}, effects:[ {type:'coin', amt:20} ], result:'The merchant pays a premium for island pearls.' }
      ] },

    { id:'market_boom', name:'Market Boom', icon:'📈', desc:'Word arrives that island goods are fetching high prices on the mainland.', category:'trade', weight:1.5, minStage:4, cooldownDays:13,
      effects:[ {type:'buff', stat:'trade_price', mult:1.4, days:3, label:'Market Boom (+40% trade prices)'} ] },

    { id:'market_slump', name:'Market Slump', icon:'📉', desc:'A glut of goods on the mainland drives prices down for a while.', category:'trade', weight:1.5, minStage:4, cooldownDays:13,
      effects:[ {type:'buff', stat:'trade_price', mult:0.75, days:3, label:'Market Slump (-25% trade prices)'} ] },

    { id:'generous_captain', name:'A Generous Captain', icon:'🧑‍✈️', desc:'A captain you once helped returns the favor with a gift of supplies.', category:'trade', weight:1, minStage:3, cooldownDays:14,
      effects:[ {type:'resource', res:'cloth', amt:4}, {type:'resource', res:'tools', amt:1}, {type:'coin', amt:6} ] },

    { id:'pearl_buyer', name:'Pearl Buyer', icon:'💰', desc:'A jeweler\'s agent has heard of your reef and wants every pearl you can spare.', category:'trade', weight:1, minStage:5, cooldownDays:14,
      choices:[
        { text:'Sell your pearls', tooltip:'A handsome lump of coin', cost:{pearl:2}, effects:[ {type:'coin', amt:34} ], result:'Two pearls for a small fortune in coin.' },
        { text:'Hold out for a better price', tooltip:'Keep them for now', effects:[ {type:'flag', key:'pearl_market_known'} ], result:'You keep the pearls. Word of your reef will only spread.' }
      ] },

    { id:'tool_caravan', name:'Tinker\'s Barge', icon:'🛠️', desc:'A floating workshop ties up at the dock, its tinker hawking fine ironwork.', category:'trade', weight:1.5, minStage:4, cooldownDays:11,
      choices:[
        { text:'Buy iron bars', tooltip:'Spend coin for refined iron', cost:{coin:14}, effects:[ {type:'resource', res:'ironbar', amt:4} ], result:'A neat stack of iron bars for the forge.' },
        { text:'Sell raw ore', tooltip:'Turn ore into coin', cost:{ironore:8}, effects:[ {type:'coin', amt:12} ], result:'The tinker takes your ore off your hands at a fair rate.' }
      ] },

    { id:'exotic_dealer', name:'Exotic Animal Dealer', icon:'🦜', desc:'A flamboyant dealer offers coin for the island\'s most colorful creatures.', category:'trade', weight:1, minStage:5, cooldownDays:15,
      choices:[
        { text:'Sell an exotic animal', tooltip:'High price, mixed feelings', cost:{exoticpet:1}, effects:[ {type:'coin', amt:24}, {type:'morale', amt:-2} ], result:'A fat purse of coin — though the cage feels emptier.' },
        { text:'Refuse the trade', tooltip:'Keep the island\'s wonders', effects:[ {type:'morale', amt:3} ], result:'You send the dealer off; some things aren\'t for sale.' }
      ] },

    { id:'supply_convoy', name:'Supply Convoy', icon:'🚢', desc:'A small convoy passes and is willing to part with bulk staples.', category:'trade', weight:1.5, minStage:4, cooldownDays:12,
      choices:[
        { text:'Buy planks and rope', tooltip:'Stock up on building goods', cost:{coin:16}, effects:[ {type:'resource', res:'planks', amt:6}, {type:'resource', res:'rope', amt:4} ], result:'A solid load of building stock comes off the boats.' },
        { text:'Buy bread and medicine', tooltip:'Stock up on comforts', cost:{coin:16}, effects:[ {type:'resource', res:'bread', amt:6}, {type:'resource', res:'medicine', amt:2} ], result:'Fresh bread and medicine for the storeroom.' }
      ] },

    { id:'haggler_visit', name:'A Sharp Haggler', icon:'💬', desc:'A silver-tongued trader wants to dicker — and Erim is more than ready.', category:'trade', weight:1.5, minStage:4, cooldownDays:11,
      effects:[ {type:'buff', stat:'trade_price', mult:1.25, days:2, label:'Good Bargaining (+25% trade prices)'}, {type:'coin', amt:5} ] },

    { id:'shipwright_offer', name:'Shipwright\'s Offer', icon:'⚓', desc:'A wandering shipwright offers fine glass and steel for the right price.', category:'trade', weight:1, minStage:6, cooldownDays:14,
      choices:[
        { text:'Buy glass and steel', tooltip:'Advanced goods for coin', cost:{coin:24}, effects:[ {type:'resource', res:'glass', amt:3}, {type:'resource', res:'steel', amt:2} ], result:'Crates of glass and gleaming steel — rare luxuries indeed.' },
        { text:'Sell tools in bulk', tooltip:'Trade craftwork for coin', cost:{tools:5}, effects:[ {type:'coin', amt:22} ], result:'Your toolwork has a fine reputation; the coin flows.' }
      ] },

    { id:'lost_cargo', name:'Lost Cargo Claim', icon:'📜', desc:'A captain offers a finder\'s fee if you\'ll return cargo washed onto your shore.', category:'trade', weight:1, minStage:3, maxStage:7, cooldownDays:13,
      choices:[
        { text:'Return the cargo honestly', tooltip:'A fair fee and goodwill', cost:{cloth:3}, effects:[ {type:'coin', amt:16}, {type:'morale', amt:3} ], result:'The grateful captain pays well and remembers your honesty.' },
        { text:'Keep what washed ashore', tooltip:'Finders keepers', effects:[ {type:'resource', res:'cloth', amt:5}, {type:'morale', amt:-2} ], result:'You keep the bolts of cloth, conscience be damned.' }
      ] },

    { id:'rival_colony_trade', name:'Envoy from Afar', icon:'🤝', desc:'An envoy from a distant settlement proposes a standing trade pact.', category:'trade', weight:0.5, minStage:6, maxStage:7, oneShot:true,
      choices:[
        { text:'Sign the pact', tooltip:'Lasting trade bonus', effects:[ {type:'flag', key:'trade_pact'}, {type:'buff', stat:'trade_price', mult:1.2, days:5, label:'Trade Pact (+20% prices)'}, {type:'coin', amt:10} ], result:'Hands clasped — a friendship that should pay for years.' },
        { text:'Stay independent', tooltip:'A polite refusal, small gift', effects:[ {type:'coin', amt:6}, {type:'morale', amt:2} ], result:'You decline gracefully and part on good terms.' }
      ] },

    /* ============================================================
     * EXTRA passives & fillers across categories for variety/count
     * ============================================================ */
    { id:'calm_seas', name:'Calm Seas', icon:'🌊', desc:'The water lies flat and glassy, and the boats come back heavy.', category:'weather', weight:2, minStage:1, maxStage:5, cooldownDays:8,
      effects:[ {type:'resource', res:'fish', amt:6} ] },

    { id:'foggy_forage', name:'Mushroom Flush', icon:'🍄', desc:'A damp spell brings up a flush of edible mushrooms across the forest floor.', category:'fortune', weight:2, minStage:1, maxStage:5, cooldownDays:9,
      effects:[ {type:'resource', res:'fruit', amt:5}, {type:'resource', res:'fiber', amt:2} ] },

    { id:'volcanic_ash', name:'Volcanic Ash', icon:'🌋', desc:'Fine ash drifts down from the mountain, and the air smells of sulfur.', category:'danger', weight:1, minStage:5, maxStage:7, cooldownDays:14,
      choices:[
        { text:'Cover the water and food', tooltip:'Spend fiber to protect stores', cost:{fiber:4}, effects:[ {type:'morale', amt:1} ], result:'You cover everything in time; the ash settles harmlessly.' },
        { text:'Let it settle', tooltip:'Ash fouls some water', effects:[ {type:'resource', res:'water', pct:-0.15}, {type:'need', need:'health', amt:-3, who:'all'} ], result:'Gritty water and itchy throats until the air clears.' }
      ] },

    { id:'good_harvest', name:'Bumper Harvest', icon:'🌽', desc:'The crop beds come in thick and golden, far beyond expectation.', category:'fortune', weight:2, minStage:3, maxStage:7, cooldownDays:11,
      effects:[ {type:'resource', res:'crops', amt:10} ] },

    { id:'restful_night', name:'A Restful Night', icon:'🌙', desc:'A still, mild night gives the whole camp the best sleep in memory.', category:'fortune', weight:2, minStage:1, cooldownDays:8,
      effects:[ {type:'need', need:'energy', amt:16, who:'all'} ] },

    { id:'eager_apprentice', name:'An Eager Apprentice', icon:'🧑‍🔧', desc:'A young settler throws themselves into learning every trade at once.', category:'social', weight:1.5, minStage:3, cooldownDays:12,
      effects:[ {type:'buff', stat:'global_prod', mult:1.08, days:4, label:'Eager Apprentice (+8% output)'} ] },

    { id:'wandering_scholar', name:'Wandering Scholar', icon:'🎓', desc:'A castaway scholar shares a head full of half-remembered knowledge.', category:'social', weight:1, minStage:4, cooldownDays:14,
      choices:[
        { text:'Host them a while', tooltip:'Spend food for research', cost:{fruit:4}, effects:[ {type:'research', amt:16}, {type:'morale', amt:2} ], result:'Long evenings of talk leave the colony wiser.' },
        { text:'Send them along', tooltip:'A small parting gift', cost:{water:3}, effects:[ {type:'morale', amt:1} ], result:'You send the scholar off with full waterskins.' }
      ] },

    { id:'storm_wreckage', name:'Fresh Wreckage', icon:'🪕', desc:'After a gale, new wreckage from some other lost ship litters the sand.', category:'discovery', weight:1.5, minStage:2, maxStage:6, cooldownDays:12,
      effects:[ {type:'resource', res:'planks', amt:4}, {type:'resource', res:'cloth', amt:2}, {type:'resource', res:'rope', amt:2} ] },

    { id:'lucky_strike', name:'Lucky Strike', icon:'⛏️', desc:'A casual swing of the pick uncovers a pocket of iron ore.', category:'fortune', weight:1.5, minStage:3, maxStage:7, cooldownDays:11,
      effects:[ {type:'resource', res:'ironore', amt:6} ] },

    { id:'morale_low', name:'A Gray Mood', icon:'☁️', desc:'No reason anyone can name — just a heavy, listless gray over the camp.', category:'social', weight:2, minStage:1, cooldownDays:8,
      effects:[ {type:'morale', amt:-4} ] },

    { id:'flint_find', name:'Good Flint', icon:'🪨', desc:'A bed of fine flint turns up — easy sparks and sharp edges for all.', category:'fortune', weight:1.5, minStage:1, maxStage:4, cooldownDays:10,
      effects:[ {type:'resource', res:'tools', amt:1}, {type:'morale', amt:2} ] },

    { id:'energetic_morning', name:'A Bright Morning', icon:'🌞', desc:'Everyone wakes clear-eyed and ready, and the work simply flows.', category:'fortune', weight:2, minStage:1, cooldownDays:8,
      effects:[ {type:'buff', stat:'global_prod', mult:1.1, days:2, label:'Bright Morning (+10% output)'} ] },

    { id:'fishing_slump', name:'Empty Nets', icon:'🪣', desc:'For no clear reason, the fish simply will not bite this week.', category:'wildlife', weight:1.5, minStage:1, maxStage:5, cooldownDays:10,
      effects:[ {type:'buff', stat:'job:fish', mult:0.8, days:2, label:'Fish gone shy (-20% fishing)'} ] },

    { id:'helpful_current', name:'A Helpful Current', icon:'🌊', desc:'A favorable current carries the expedition boats swiftly out and back.', category:'fortune', weight:1.5, minStage:3, maxStage:7, cooldownDays:11,
      effects:[ {type:'buff', stat:'explore', mult:1.3, days:3, label:'Fair Current (+30% exploration)'} ] },

    { id:'wild_garden', name:'A Wild Garden', icon:'🌻', desc:'An old castaway\'s garden, gone wild, still bears vegetables among the weeds.', category:'discovery', weight:1.5, minStage:2, maxStage:6, cooldownDays:13,
      effects:[ {type:'resource', res:'crops', amt:6}, {type:'resource', res:'fruit', amt:3} ] },

    { id:'pep_talk', name:'A Rousing Speech', icon:'📣', desc:'Erim climbs onto a crate and reminds everyone how far they\'ve come.', category:'social', weight:1.5, minStage:2, cooldownDays:11,
      effects:[ {type:'morale', amt:6} ] },

    { id:'sandstorm', name:'Stinging Sandstorm', icon:'🌪️', desc:'A whirling wind whips the beach sand into a stinging cloud.', category:'weather', weight:1, minStage:2, maxStage:6, cooldownDays:13,
      effects:[ {type:'buff', stat:'global_prod', mult:0.85, days:1, label:'Sandstorm (-15% output)'}, {type:'need', need:'energy', amt:-5, who:'all'} ] },

    { id:'whale_song', name:'Whale Song', icon:'🐋', desc:'The deep, mournful song of whales carries across the bay all night.', category:'wildlife', weight:1, minStage:2, cooldownDays:14,
      effects:[ {type:'morale', amt:5} ] },

    { id:'firefly_night', name:'A Night of Fireflies', icon:'✨', desc:'Thousands of fireflies turn the treeline into a slow river of light.', category:'wildlife', weight:1.5, minStage:1, cooldownDays:11,
      effects:[ {type:'morale', amt:4} ] },

    { id:'reef_bloom', name:'Pearl Reef Bloom', icon:'🦪', desc:'The reef oysters spawn thick and the diving is the best it\'s ever been.', category:'fortune', weight:1, minStage:5, maxStage:7, cooldownDays:13,
      effects:[ {type:'buff', stat:'job:pearl_dive', mult:1.6, days:3, label:'Reef Bloom (+60% diving)'} ] },

    { id:'iron_rich_vein', name:'Iron-Rich Vein', icon:'🔩', desc:'A miner breaks into a vein where the ore runs unusually pure.', category:'fortune', weight:1, minStage:5, maxStage:7, cooldownDays:13,
      effects:[ {type:'buff', stat:'job:mine_stone', mult:1.4, days:3, label:'Rich Vein (+40% mining)'} ] },

    { id:'inventors_breakthrough', name:'A Breakthrough', icon:'🔬', desc:'Months of failed tinkering suddenly click into a real discovery.', category:'fortune', weight:0.5, minStage:5, cooldownDays:16,
      effects:[ {type:'research', amt:22}, {type:'morale', amt:4} ] },

    { id:'sudden_squall', name:'Sudden Squall', icon:'🌧️', desc:'A short, hard squall blows through and knocks over a half-stacked store.', category:'weather', weight:2, minStage:1, maxStage:5, cooldownDays:8,
      effects:[ {type:'resource', res:'sticks', amt:-3}, {type:'resource', res:'water', amt:6} ] },

    { id:'helpful_stranger', name:'A Helping Hand', icon:'🫱', desc:'A traveler passing through lends a day of labor before moving on.', category:'social', weight:1.5, minStage:2, maxStage:6, cooldownDays:11,
      effects:[ {type:'buff', stat:'global_prod', mult:1.1, days:2, label:'Extra Hand (+10% output)'} ] },

    { id:'bountiful_hunt', name:'Bountiful Hunt', icon:'🏹', desc:'A hunting party returns laden, the game running thick this season.', category:'wildlife', weight:1.5, minStage:2, maxStage:6, cooldownDays:10,
      effects:[ {type:'buff', stat:'job:hunt', mult:1.5, days:3, label:'Game Aplenty (+50% hunting)'} ] },

    { id:'salt_in_well', name:'Brackish Water', icon:'🧂', desc:'A high tide pushes salt into the freshwater pools and fouls them briefly.', category:'danger', weight:1.5, minStage:2, maxStage:6, cooldownDays:11,
      effects:[ {type:'resource', res:'water', pct:-0.2} ] },

    { id:'curious_visitor', name:'A Curious Visitor', icon:'🧓', desc:'An old hermit from the island\'s far side comes to trade tales and tips.', category:'social', weight:1, minStage:3, maxStage:7, cooldownDays:14,
      effects:[ {type:'research', amt:8}, {type:'morale', amt:3} ] },

    { id:'clear_morning_catch', name:'Dawn Catch', icon:'🐟', desc:'An early start on a calm dawn fills every basket before the heat.', category:'fortune', weight:2, minStage:1, maxStage:5, cooldownDays:8,
      effects:[ {type:'resource', res:'fish', amt:7} ] },

    { id:'storm_damage', name:'Wind Damage', icon:'💨', desc:'Overnight gusts tear at the lighter structures and scatter loose goods.', category:'danger', weight:1.5, minStage:2, maxStage:6, cooldownDays:10,
      choices:[
        { text:'Repair quickly', tooltip:'Spend sticks to fix it', cost:{sticks:5}, effects:[ {type:'morale', amt:1} ], result:'Fast repairs and everything\'s sound again by dusk.' },
        { text:'Patch it later', tooltip:'Lose a little to the wind', effects:[ {type:'resource', res:'fiber', amt:-4}, {type:'morale', amt:-2} ], result:'The damage sits a while, and the wind takes a bit more.' }
      ] },

    { id:'generous_tide', name:'A Generous Tide', icon:'🐚', desc:'The ebb tide leaves the flats strewn with clams, kelp, and useful flotsam.', category:'fortune', weight:2, minStage:1, maxStage:5, cooldownDays:9,
      effects:[ {type:'resource', res:'fish', amt:4}, {type:'resource', res:'fiber', amt:3} ] },

    { id:'lava_glass', name:'Obsidian Find', icon:'⚫', desc:'Near the volcano, cooled lava has formed sheets of glassy black stone.', category:'discovery', weight:0.5, minStage:6, maxStage:7, cooldownDays:15,
      effects:[ {type:'resource', res:'glass', amt:2}, {type:'resource', res:'charcoal', amt:3} ] },

    { id:'overworked', name:'Worn Thin', icon:'😓', desc:'A long stretch of hard days leaves the whole camp dragging its feet.', category:'social', weight:2, minStage:2, cooldownDays:9,
      choices:[
        { text:'Call a rest day', tooltip:'Lose a day, restore the crew', effects:[ {type:'need', need:'energy', amt:14, who:'all'}, {type:'morale', amt:4} ], result:'A day off, and everyone comes back the better for it.' },
        { text:'Push through', tooltip:'Keep working, pay in morale', effects:[ {type:'morale', amt:-4}, {type:'need', need:'energy', amt:-6, who:'all'} ], result:'You keep at it, but the grumbling grows.' }
      ] },

    { id:'fair_winds', name:'Fair Winds', icon:'⛵', desc:'Steady, kind winds favor every journey off the island this week.', category:'trade', weight:1.5, minStage:4, cooldownDays:11,
      effects:[ {type:'buff', stat:'trade_price', mult:1.15, days:3, label:'Fair Winds (+15% trade)'}, {type:'coin', amt:4} ] },

    { id:'first_bread', name:'The First Loaf', icon:'🍞', desc:'The bakers pull the very first proper loaf from the oven to cheers all round.', category:'fortune', weight:1, minStage:3, maxStage:6, oneShot:true,
      effects:[ {type:'resource', res:'bread', amt:4}, {type:'morale', amt:6} ] },

    { id:'great_view', name:'A View from the Peak', icon:'⛰️', desc:'Explorers reach a high lookout and map the land laid out far below.', category:'discovery', weight:1.5, minStage:4, maxStage:7, cooldownDays:13,
      effects:[ {type:'buff', stat:'explore', mult:1.2, days:3, label:'Good Maps (+20% exploration)'}, {type:'research', amt:5} ] },

    { id:'spoiled_water', name:'Algae Bloom', icon:'🟢', desc:'A green algae bloom slicks the surface of the water catches.', category:'danger', weight:1.5, minStage:1, maxStage:5, cooldownDays:11,
      effects:[ {type:'resource', res:'water', pct:-0.1} ] },

    { id:'kind_gesture', name:'An Unexpected Kindness', icon:'💗', desc:'A quiet act of generosity between colonists lifts everyone who sees it.', category:'social', weight:2, minStage:1, cooldownDays:9,
      effects:[ {type:'morale', amt:4} ] },

    { id:'clay_landslide', name:'Clay Landslip', icon:'🟤', desc:'Rain loosens the riverbank and slumps a heap of fresh clay onto the path.', category:'fortune', weight:1.5, minStage:2, maxStage:6, cooldownDays:10,
      effects:[ {type:'resource', res:'clay', amt:7} ] },

    { id:'fortunes_favor', name:'Fortune\'s Favor', icon:'🌟', desc:'Everything just seems to go right today, from the catch to the cookpot.', category:'fortune', weight:1, minStage:2, cooldownDays:13,
      effects:[ {type:'morale', amt:5}, {type:'coin', amt:6} ] },

    { id:'lazy_afternoon', name:'A Lazy Afternoon', icon:'🌴', desc:'The heat of midday slows everyone to a crawl in the shade.', category:'weather', weight:2, minStage:1, cooldownDays:8,
      effects:[ {type:'buff', stat:'global_prod', mult:0.9, days:1, label:'Midday Heat (-10% output)'}, {type:'need', need:'energy', amt:4, who:'all'} ] },

    { id:'salvaged_sail', name:'A Salvaged Sail', icon:'⛵', desc:'A great bolt of ship\'s canvas washes in, sun-bleached but strong.', category:'discovery', weight:1.5, minStage:2, maxStage:6, cooldownDays:12,
      effects:[ {type:'resource', res:'cloth', amt:5} ] },

    { id:'mountain_echo', name:'The Mountain Speaks', icon:'🗻', desc:'A low rumble rolls down from the peaks, and the camp falls quiet to listen.', category:'mystery', weight:1, minStage:5, maxStage:7, cooldownDays:14,
      effects:[ {type:'morale', amt:-2}, {type:'research', amt:6} ] },

    { id:'shared_supper', name:'Quiet Supper Together', icon:'🍵', desc:'An ordinary evening meal, shared with no fuss, knits the colony a little tighter.', category:'social', weight:2, minStage:1, cooldownDays:8,
      effects:[ {type:'morale', amt:3} ] },

    { id:'rare_butterfly', name:'A Rare Butterfly', icon:'🦋', desc:'A butterfly of impossible colors drifts through camp and everyone stops to look.', category:'wildlife', weight:1, minStage:1, cooldownDays:13,
      effects:[ {type:'morale', amt:3} ] },

    { id:'driftnet_tangle', name:'Tangled Driftnet', icon:'🥅', desc:'An old driftnet snags on the reef, full of fish but a mess to clear.', category:'wildlife', weight:1.5, minStage:1, maxStage:5, cooldownDays:10,
      choices:[
        { text:'Untangle it for the catch', tooltip:'Patient work, good reward', effects:[ {type:'resource', res:'fish', amt:7}, {type:'resource', res:'rope', amt:2}, {type:'need', need:'energy', amt:-5, who:'random'} ], result:'Hours of picking knots, but the catch is worth it.' },
        { text:'Cut it free and let it sink', tooltip:'Quick, smaller reward', effects:[ {type:'resource', res:'fish', amt:3} ], result:'You salvage what you can and send the rest to the deep.' }
      ] },

    { id:'visiting_healer', name:'A Visiting Healer', icon:'⚗️', desc:'A traveling healer offers to tend the colony\'s aches and teach a little of the craft.', category:'social', weight:1, minStage:3, maxStage:7, cooldownDays:14,
      choices:[
        { text:'Accept the care', tooltip:'Spend coin for healing', cost:{coin:8}, effects:[ {type:'health', amt:8, who:'all'}, {type:'morale', amt:2} ], result:'Salves and poultices set everyone right by week\'s end.' },
        { text:'Trade goods for medicine', tooltip:'Swap food for medicine', cost:{fruit:5}, effects:[ {type:'resource', res:'medicine', amt:2} ], result:'A fair barter leaves your shelves better stocked.' }
      ] },

    { id:'wreck_strongbox', name:'The Captain\'s Strongbox', icon:'🔐', desc:'Divers finally reach the captain\'s cabin in the old wreck and find his strongbox.', category:'discovery', weight:0.5, minStage:3, maxStage:7, oneShot:true,
      choices:[
        { text:'Force the lock', tooltip:'Risk a hand for the coin within', effects:[ {type:'coin', amt:24}, {type:'health', amt:-4, who:'random'} ], result:'The lid gives at last — a respectable hoard of coin inside.' },
        { text:'Bring it up whole to open carefully', tooltip:'Slower, but safe', effects:[ {type:'coin', amt:18}, {type:'resource', res:'tools', amt:1} ], result:'Opened on dry sand: coin, and the captain\'s fine instruments.' }
      ] },

    { id:'lantern_festival', name:'Lantern Night', icon:'🏮', desc:'The colony floats little lanterns out onto the dark bay in memory of those lost.', category:'social', weight:1, minStage:4, cooldownDays:16,
      effects:[ {type:'morale', amt:7} ] },

    { id:'rough_surf', name:'Rough Surf', icon:'🌊', desc:'Heavy swell makes the shallows dangerous and keeps the boats beached.', category:'weather', weight:2, minStage:1, maxStage:5, cooldownDays:9,
      effects:[ {type:'buff', stat:'job:fish', mult:0.8, days:2, label:'Rough Surf (-20% fishing)'} ] },

    { id:'eureka_charcoal', name:'A Better Burn', icon:'🔥', desc:'A burner figures out a tighter stack and the charcoal comes out clean and plentiful.', category:'fortune', weight:1.5, minStage:3, maxStage:7, cooldownDays:11,
      effects:[ {type:'resource', res:'charcoal', amt:6} ] },

    { id:'mystery_seeds', name:'Strange Seeds', icon:'🌱', desc:'A pod of unfamiliar seeds drifts ashore — could be a new crop, could be nothing.', category:'mystery', weight:1, minStage:2, maxStage:6, cooldownDays:13,
      choices:[
        { text:'Plant them and see', tooltip:'A gamble on a new crop', effects:[ {type:'resource', res:'crops', amt:6}, {type:'research', amt:4} ], result:'They sprout into something hardy and good to eat!' },
        { text:'Study before planting', tooltip:'Caution over haste', effects:[ {type:'research', amt:8} ], result:'You learn what you can; the seeds wait for a wiser season.' }
      ] },

    { id:'birds_return', name:'The Birds Return', icon:'🕊️', desc:'After a long absence, the migrating birds wheel back over the island in great flocks.', category:'wildlife', weight:1.5, minStage:1, cooldownDays:12,
      effects:[ {type:'morale', amt:4}, {type:'resource', res:'meat', amt:2} ] },

    { id:'old_orchard', name:'A Forgotten Orchard', icon:'🍊', desc:'Deep in the palms, a neat row of fruit trees someone planted long ago still bears.', category:'discovery', weight:1, minStage:2, maxStage:6, cooldownDays:14,
      effects:[ {type:'resource', res:'fruit', amt:8}, {type:'morale', amt:2} ] },

    { id:'sturdy_repair', name:'A Job Well Done', icon:'🔨', desc:'A round of careful maintenance leaves every structure sound and the builders proud.', category:'fortune', weight:1.5, minStage:2, cooldownDays:11,
      effects:[ {type:'morale', amt:3}, {type:'resource', res:'wood', amt:4} ] },

    { id:'gull_thieves', name:'Thieving Gulls', icon:'🦅', desc:'Bold gulls snatch fish straight off the drying racks.', category:'wildlife', weight:2, minStage:1, maxStage:5, cooldownDays:8,
      effects:[ {type:'resource', res:'fish', pct:-0.1} ] },

    { id:'stargazing', name:'A Night of Stargazing', icon:'🌠', desc:'Clear skies and idle hours; the colony lies back and names the constellations anew.', category:'social', weight:1.5, minStage:1, cooldownDays:10,
      effects:[ {type:'morale', amt:4}, {type:'need', need:'energy', amt:4, who:'all'} ] },

    { id:'rich_loam', name:'A Patch of Rich Loam', icon:'🟫', desc:'Diggers turn up a pocket of dark, fertile loam perfect for the seed beds.', category:'fortune', weight:1.5, minStage:3, maxStage:7, cooldownDays:12,
      effects:[ {type:'buff', stat:'job:farm', mult:1.3, days:3, label:'Rich Loam (+30% farming)'} ] },

    { id:'broken_dam', name:'A Beaver-Built Dam', icon:'🦫', desc:'Something has dammed the upstream river, and the flow to the camp is choked.', category:'wildlife', weight:1, minStage:3, maxStage:7, cooldownDays:13,
      choices:[
        { text:'Clear the dam', tooltip:'Restore the flow with hard work', effects:[ {type:'resource', res:'water', amt:12}, {type:'resource', res:'sticks', amt:4}, {type:'need', need:'energy', amt:-6, who:'random'} ], result:'The river runs free again — and you salvage a heap of sticks.' },
        { text:'Leave it and dig a channel', tooltip:'Spend tools for a lasting fix', cost:{tools:1}, effects:[ {type:'resource', res:'water', amt:8} ], result:'A new channel routes water around the blockage neatly.' }
      ] },

    { id:'good_clay_firing', name:'A Perfect Firing', icon:'🧱', desc:'The kiln runs hot and even, and every brick comes out flawless.', category:'fortune', weight:1.5, minStage:4, maxStage:7, cooldownDays:11,
      effects:[ {type:'resource', res:'brick', amt:6} ] },

    { id:'castaway_dog', name:'A Loyal Stray', icon:'🐕', desc:'A scruffy dog wanders into camp, wags its tail, and decides to stay.', category:'wildlife', weight:1, minStage:1, cooldownDays:16,
      effects:[ {type:'morale', amt:6} ] },

    { id:'merchant_credit', name:'A Line of Credit', icon:'📒', desc:'A trader who trusts your name fronts you goods now, to settle later.', category:'trade', weight:1, minStage:5, maxStage:7, cooldownDays:14,
      choices:[
        { text:'Take the goods on credit', tooltip:'Useful stock now', effects:[ {type:'resource', res:'tools', amt:2}, {type:'resource', res:'cloth', amt:3}, {type:'coin', amt:-4} ], result:'You take the goods and square most of it from the coffers.' },
        { text:'Pay cash and keep it clean', tooltip:'No debts, fair price', cost:{coin:10}, effects:[ {type:'resource', res:'tools', amt:2}, {type:'resource', res:'cloth', amt:3} ], result:'Paid in full — no debts hanging over the colony.' }
      ] },

    { id:'sunburn_day', name:'Scorching Sun', icon:'🥵', desc:'A relentless sun beats down and the workers wilt by midday.', category:'weather', weight:1.5, minStage:1, cooldownDays:9,
      effects:[ {type:'need', need:'energy', amt:-8, who:'all'}, {type:'resource', res:'water', amt:-4} ] },

    { id:'good_smelt', name:'A Clean Smelt', icon:'🌋', desc:'The smelter\'s fire burns just right and the iron pours pure and bright.', category:'fortune', weight:1.5, minStage:5, maxStage:7, cooldownDays:12,
      effects:[ {type:'resource', res:'ironbar', amt:4} ] },

    { id:'ancient_aqueduct', name:'Ruins of an Aqueduct', icon:'🏛️', desc:'The old people left a half-buried stone channel that, cleared, could carry water again.', category:'discovery', weight:0.5, minStage:6, maxStage:7, oneShot:true,
      effects:[ {type:'resource', res:'water', amt:18}, {type:'research', amt:14}, {type:'morale', amt:4} ] },

    { id:'shooting_contest', name:'A Friendly Contest', icon:'🎯', desc:'The hunters set up targets and the whole camp turns out to cheer and wager.', category:'social', weight:1.5, minStage:2, cooldownDays:11,
      effects:[ {type:'morale', amt:5}, {type:'need', need:'energy', amt:3, who:'all'} ] },

    { id:'gift_of_the_sea', name:'A Gift of the Sea', icon:'🎁', desc:'The morning tide leaves an oddly tidy heap of useful things on the sand, as if placed.', category:'mystery', weight:1, minStage:2, cooldownDays:14,
      effects:[ {type:'resource', res:'rope', amt:3}, {type:'resource', res:'cloth', amt:2}, {type:'coin', amt:6} ] },

    { id:'cooperative_day', name:'A Day of Cooperation', icon:'🧑‍🤝‍🧑', desc:'Every task seems to find an extra pair of willing hands today.', category:'social', weight:2, minStage:2, cooldownDays:9,
      effects:[ {type:'buff', stat:'global_prod', mult:1.1, days:2, label:'Cooperation (+10% output)'} ] },

    { id:'mild_quake', name:'A Gentle Quake', icon:'〰️', desc:'A brief shudder rattles the shelves; nothing breaks, but nerves are frayed.', category:'danger', weight:1.5, minStage:3, maxStage:7, cooldownDays:12,
      effects:[ {type:'morale', amt:-3}, {type:'resource', res:'clay', amt:-2} ] },

    { id:'fresh_recruits', name:'Word Spreads', icon:'📢', desc:'Tales of your thriving colony reach other castaways, and a few come looking for a home.', category:'social', weight:1, minStage:5, maxStage:7, cooldownDays:16,
      effects:[ {type:'settler', count:1}, {type:'morale', amt:2} ] },

    { id:'low_tide_treasure', name:'Low-Tide Treasure', icon:'🪙', desc:'An exceptionally low tide bares a stretch of seabed scattered with old, lost coins.', category:'fortune', weight:1, minStage:2, maxStage:6, cooldownDays:13,
      effects:[ {type:'coin', amt:9}, {type:'resource', res:'sand', amt:4} ] }
  ];
  EVENTS.forEach(function(e){ e.weight = e.weight==null?1:e.weight; e.category = e.category||'fortune'; });
  CG.EVENTS = EVENTS;
})(typeof window !== 'undefined' ? window : globalThis);
