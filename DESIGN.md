# Castaway: Island Survival Tycoon — Design Contract

This document is the single source of truth for IDs, schemas, economy, and pacing.
All systems and data files MUST conform to it.

## Pillars
- Start desperate (survival), end thriving (tycoon optimization).
- Nothing appears magically — everything is worked for.
- Constant "just one more" loop via quests, tech, buildings, exploration.
- Slower than typical tycoons. Target first playthrough: 2–4 hours.
- Meaningful decisions, visible progression, fair (no punishing RNG).

## Time & Tick
- Engine tick = 1 real second at 1x. Speeds: pause, 1x, 2x, 4x.
- 1 in-game day = 90 seconds at 1x. Day has phases (dawn/day/dusk/night) for ambiance + energy.
- Target ~70–110 days for a full playthrough.

## Core Model: Worker Assignment Tycoon
- Survivors (named 4 + generic settlers) are LABOR. Each works one Station at a time.
- Stations are production jobs. Base stations exist from start; buildings add stations/slots.
- Production rate = base * workerEfficiency(XP) * toolMult * techMult * buildingLevelMult * characterBonus * eventMult * moraleMult.
- Storage caps every resource. Overflow is wasted (encourages building storage).
- Survival needs auto-consume from stockpile. Good planning prevents crises.

## Resources (IDs are stable — never rename)
Natural:  wood, stone, fiber, sticks, water, fish, fruit, clay, sand, hide
Advanced: lumber, rope, leather, charcoal, brick, ironore, ironbar, glass, steel, tools, planks, meat, crops, bread, cloth, medicine
Luxury:   spice, pearl, rarewood, exoticpet, gem
Abstract: food (aggregate? NO — food is computed from fish+fruit+meat+bread+crops), research (RP), coin (trade currency)

Note: "food value" is derived from edible resources (fish, fruit, meat, bread, crops). Coin is trade money. research is the research-point currency.

## Job/Station IDs
forage, woodcut, water, fish, hunt, mine_stone, dig_clay, dig_sand, farm, build, research,
sawmill, ropewalk, tannery, charcoal, kiln, smelt, blacksmith, glassworks, steelworks,
bakery, weaver, apothecary, dock, trade, teach, pearl_dive

## Region IDs (unlock order)
beach -> palmforest -> river -> jungle -> highlands -> mountainpass -> ruins -> caves -> volcano -> northcoast

## Building Categories
survival, production, housing, storage, civic, industry, trade, special

## Stages (settlementLevel thresholds by "progress score")
1 Shipwreck Survival
2 Permanent Camp
3 Village
4 Growing Settlement
5 Colony
6 Island Town
7 Prosperous Island
Progress score = weighted(building tiers built + population + tech researched + regions explored).

## Survival Needs (0–100 each, per survivor)
- hunger: -X/day; auto-eats food when below 70 if available.
- thirst: -Y/day; auto-drinks water when below 70 if available.
- energy: drains while working, regenerates while resting/at night & sheltered.
- health: drops if hunger/thirst==0 or energy==0 or from events; regens when needs met + shelter.
- morale: settlement-wide-ish; affected by food variety, shelter, crowding, events, luxuries.
Tuning: needs deplete slowly; a stable food+water supply keeps everyone happy.

## Character Bonuses (settlement-wide while alive/active)
Robin (builder): build speed +, structure quality +, build cost -
Lenni (researcher): research speed +, tool quality +, production efficiency +
Leif (hunter/explorer): hunt success +, explore speed +, rare resource chance +
Erim (trader/organizer): storage efficiency +, trade prices +, morale +
Each levels independently via relevant work; skill trees grant escalating bonuses + unlocks.

## Data Schemas (STRICT — content files must match)

### Building
{ id, name, cat, tier(1-7), desc, icon(emoji),
  cost: {res: amt, ...}, buildTime(sec),
  maxLevel, upgradeCostMult(per lvl), upgradeTimeMult,
  provides: { stations:[{job, slots}], housing, storageAll, storage:{res:amt}, morale, ... },
  effects: [{type, ...}],            // passive effects, see effect types
  requires: { tech:[ids], building:[ids], region:[ids], stage },
  unlockedBy: 'start'|'tech'|'quest'|'region' }

### Tech
{ id, name, cat, desc, icon, cost(RP), time(sec optional),
  requires:{ tech:[ids], stage, region:[ids] },
  effects:[{type,...}], unlocks:{ buildings:[ids], jobs:[ids], regions:[ids] } }

### Effect types (used by buildings & tech)
{type:'prod_mult', job, mult}         // multiply a job output
{type:'res_mult', res, mult}          // multiply specific resource output everywhere
{type:'global_prod', mult}            // multiply all production
{type:'storage_mult', mult}           // multiply storage caps
{type:'storage_add', res, amt}        // flat storage
{type:'housing', amt}
{type:'need_rate', need, mult}        // slow a need's drain
{type:'morale', amt}
{type:'unlock_job', job}
{type:'unlock_building', id}
{type:'unlock_region', id}
{type:'tool_quality', mult}
{type:'explore_speed', mult}
{type:'hunt_success', mult}
{type:'rare_chance', add}
{type:'trade_price', mult}
{type:'research_mult', mult}
{type:'xp_mult', mult}
{type:'recipe', job, inputs:{res:amt}, outputs:{res:amt}}  // production chains
{type:'pop_growth', mult}

### Region
{ id, name, icon, desc, order, distance(affects expedition time),
  requires:{tech:[],region:[],tools},
  resources:[res ids found here], rareResources:[ids],
  baseExpeditionTime(sec), risk(0-1), discoveries:[event-like ids] }

### Event  (data/events.js) — 100+
{ id, name, icon, desc, weight, category('weather'|'fortune'|'danger'|'social'|'discovery'|'wildlife'|'mystery'|'trade'),
  minStage, maxStage, cooldownDays, oneShot(bool),
  condition(state)->bool  (optional, default true),
  choices:[ { text, tooltip, cost:{res:amt}, effects:[eventEffect], result(text) } ]   // if no choices => auto-apply effects[0]
  effects:[eventEffect]  // for non-choice events
}
eventEffect types:
{type:'resource', res, amt}            // +/- resources (amt can be negative or 'pct')
{type:'buff', stat, mult, days, label} // temporary modifier (stat: job id, 'global_prod','explore','hunt', etc.)
{type:'morale', amt}
{type:'need', need, amt, who:'all'}    // adjust survivor needs
{type:'settler', count}                // gain settlers
{type:'unlock', what, id}              // unlock region/building/quest
{type:'health', amt, who}              // injury/heal
{type:'flag', key, value}              // set a story flag
{type:'reveal_region', id}

### Quest (data/quests.js) — 100+
{ id, name, line('main'|'robin'|'lenni'|'leif'|'erim'|'milestone'|'explore'|'hidden'),
  desc, icon, hidden(bool),
  requires:{ quest:[ids], stage, flag:[keys] },
  objectives:[ { type, target, amt, label } ],  // see objective types
  rewards:[ rewardEffect ], reward_text,
  next:[quest ids] (optional auto-offer) }
objective types:
{type:'have_res', res, amt}            // have N of resource at once
{type:'total_res', res, amt}           // cumulative gathered
{type:'build', building, amt}          // built N of building (or any if building null)
{type:'building_level', building, level}
{type:'population', amt}
{type:'tech', amt} or {type:'tech_id', id}
{type:'explore_region', id} or {type:'explore_count', amt}
{type:'job_workers', job, amt}
{type:'stage', stage}
{type:'event_seen', id}
{type:'flag', key}
rewardEffect: same as eventEffect plus {type:'research', amt}, {type:'coin', amt}

### Achievement (data/achievements.js) — 150+
{ id, name, desc, icon, category('progress'|'explore'|'secret'|'funny'|'challenge'|'economy'|'character'|'survival'),
  secret(bool), check(stats)->bool, points }
Achievements read from the global STATS dictionary (see below). Prefer stat-threshold checks.

## STATS dictionary (engine maintains; quests & achievements read it)
Keys (examples — engine guarantees these exist, default 0):
  playtime, days, population, peakPopulation, settlersArrived, deaths,
  buildingsBuilt, buildingsByType{}, buildingUpgrades, demolitions,
  techResearched, techByCat{}, researchSpent,
  regionsExplored, expeditionsRun, raresFound,
  totalGathered{res}, totalProduced{res}, totalConsumed{res}, totalTraded, coinEarned, coinSpent,
  resPeak{res}, currentRes{res},
  eventsSeen, eventsByCat{}, choicesMade,
  questsCompleted, achievementsUnlocked,
  stage, maxStage, charLevel{robin,lenni,leif,erim},
  starvationEvents, droughtSurvived, stormsSurvived, diseasesCured,
  morale, maxMorale, fishCaught, animalsHunted, mealsCooked, treesChopped,
  flags{key:value}
Engine increments these; content checks them.

## Pacing Targets (rough)
- Min 1: campfire + water + fish stable. First shelter.
- ~Day 5: first settler arrives; storage + drying rack.
- ~Day 15: farms + workshop (research begins). Stage 3.
- ~Day 30: blacksmith/iron, bakery, docks. Stage 4.
- ~Day 50: harbor + school + trade. Stage 5.
- ~Day 75: industry, exports, big pop. Stage 6.
- ~Day 90+: endgame Monument project. Stage 7. Victory -> endless sandbox.

## Content Targets
Buildings >=50, Tech >=100, Events >=100, Quests >=100, Achievements >=150.

## Tech/Code
- No build step. Plain `<script>` tags, global `CG` namespace (CastawayGame).
- Works from file:// (no ES modules). All files attach to window.CG.
- Modular files by concern. No TODOs, no placeholders, everything wired.
- Save: localStorage (autosave + 3 manual slots) + export/import JSON string.
