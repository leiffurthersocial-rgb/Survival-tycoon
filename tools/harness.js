/* Headless test harness — loads the game without a DOM, validates content IDs,
 * then simulates thousands of ticks to surface runtime errors. Not shipped. */
global.window = global;
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = () => 0;
global.cancelAnimationFrame = () => {};
const store = {};
global.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => (store[k] = String(v)), removeItem: (k) => delete store[k] };

const ORDER = [
  'core/utils', 'data/config', 'data/resources', 'data/jobs', 'data/regions', 'data/buildings',
  'data/tech', 'data/characters', 'data/events', 'data/quests', 'data/achievements', 'core/state',
  'systems/effects', 'systems/economy', 'systems/survival', 'systems/construction', 'systems/colony',
  'systems/research', 'systems/exploration', 'systems/trade', 'systems/events', 'systems/quests',
  'systems/achievements', 'core/save', 'core/engine',
];
const path = require('path');
const ROOT = path.join(__dirname, '..');
ORDER.forEach((f) => require(path.join(ROOT, 'js', f + '.js')));
const CG = global.CG;

let problems = 0;
function bad(m) { console.log('  ✗ ' + m); problems++; }

console.log('=== CONTENT COUNTS ===');
console.log('buildings:', CG.BUILDINGS.length, '| tech:', CG.TECH.length, '| events:', CG.EVENTS.length, '| quests:', CG.QUESTS.length, '| achievements:', CG.ACHIEVEMENTS.length);

const RES = new Set(CG.RESOURCES.map((r) => r.id));
const BLD = new Set(CG.BUILDINGS.map((b) => b.id));
const TEC = new Set(CG.TECH.map((t) => t.id));
const REG = new Set(CG.REGIONS.map((r) => r.id));
const JOB = new Set(CG.JOBS.map((j) => j.id));
const CHR = new Set(['robin', 'lenni', 'leif', 'erim']);

console.log('\n=== TECH/BUILDING INTEGRITY ===');
(CG._validateTech() || []).forEach(bad);

console.log('\n=== EVENT ID VALIDATION ===');
function checkEffects(effs, ctx) {
  (effs || []).forEach((e) => {
    if (!e || !e.type) return;
    if (e.res && !RES.has(e.res)) bad(ctx + ' bad res ' + e.res);
    if (e.type === 'reveal_region' && e.id && !REG.has(e.id)) bad(ctx + ' bad region ' + e.id);
    if (e.type === 'unlock' && e.what === 'region' && e.id && !REG.has(e.id)) bad(ctx + ' bad region ' + e.id);
    if (e.type === 'tech' && e.id && !TEC.has(e.id)) bad(ctx + ' bad tech ' + e.id);
    if (e.stat && e.stat.indexOf('job:') === 0 && !JOB.has(e.stat.slice(4))) bad(ctx + ' bad job buff ' + e.stat);
    if (e.stat && e.stat.indexOf('res:') === 0 && !RES.has(e.stat.slice(4))) bad(ctx + ' bad res buff ' + e.stat);
  });
}
CG.EVENTS.forEach((ev) => {
  if (!ev.id || !ev.name || !ev.icon) bad('event missing fields: ' + (ev.id || '?'));
  checkEffects(ev.effects, 'event ' + ev.id);
  (ev.choices || []).forEach((c, i) => { if (c.cost) Object.keys(c.cost).forEach((k) => { if (!RES.has(k)) bad('event ' + ev.id + ' choice ' + i + ' bad cost ' + k); }); checkEffects(c.effects, 'event ' + ev.id + ' choice ' + i); });
  if (ev.condition && typeof ev.condition !== 'function') bad('event ' + ev.id + ' condition not fn');
});

console.log('\n=== QUEST ID VALIDATION ===');
CG.QUESTS.forEach((q) => {
  if (!q.id || !q.objectives || !q.objectives.length) bad('quest bad: ' + (q.id || '?'));
  (q.objectives || []).forEach((o) => {
    if (o.res && !RES.has(o.res)) bad('quest ' + q.id + ' bad res ' + o.res);
    if (o.building && !BLD.has(o.building)) bad('quest ' + q.id + ' bad building ' + o.building);
    if (o.id && o.type === 'tech_id' && !TEC.has(o.id)) bad('quest ' + q.id + ' bad tech ' + o.id);
    if (o.id && o.type === 'explore_region' && !REG.has(o.id)) bad('quest ' + q.id + ' bad region ' + o.id);
    if (o.job && !JOB.has(o.job)) bad('quest ' + q.id + ' bad job ' + o.job);
    if (o.charId && !CHR.has(o.charId)) bad('quest ' + q.id + ' bad char ' + o.charId);
  });
  (q.rewards || []).forEach((r) => { if (r.res && !RES.has(r.res)) bad('quest ' + q.id + ' bad reward res ' + r.res); });
  (q.requires && q.requires.quest || []).forEach((qq) => { if (!CG.QUESTS.find((x) => x.id === qq)) bad('quest ' + q.id + ' bad prereq ' + qq); });
});

console.log('\n=== ACHIEVEMENT CHECK FUNCTIONS ===');
const sampleStats = CG.State.makeStats();
sampleStats.currentRes = {}; sampleStats.buildingsByType = {}; sampleStats.totalProduced = {}; sampleStats.totalGathered = {};
sampleStats.techByCat = {}; sampleStats.resPeak = {}; sampleStats.eventsByCat = {}; sampleStats.totalConsumed = {};
CG.ACHIEVEMENTS.forEach((a) => {
  if (!a.id || !a.check) { bad('ach bad: ' + (a.id || '?')); return; }
  try { a.check(sampleStats, { survivors: [], resources: {}, buildings: [] }); } catch (e) { bad('ach ' + a.id + ' check throws: ' + e.message); }
});

console.log(problems === 0 ? '\n✓ All content validation passed' : '\n✗ ' + problems + ' content problems');

// ---------------- SIMULATION ----------------
console.log('\n=== SIMULATION (assigns workers, builds, researches; ~30 in-game days) ===');
CG.RNG.seed(12345);
let s = CG.State.newGame();
CG.Engine.bind(s);
let simErrors = 0;
let stepErr = null;
const realDt = 0.25;
const stageDay = {};
const STEPS = 40000; // ~278 days at 4x

// priority order for balanced worker coverage (build/research handled separately)
const GATHER_PRIO = ['forage', 'water', 'fish', 'mine_stone', 'woodcut', 'hunt', 'dig_clay', 'dig_sand', 'farm',
  'sawmill', 'charcoal', 'kiln', 'smelt', 'ropewalk', 'tannery', 'weaver', 'bakery', 'blacksmith', 'glassworks', 'steelworks', 'pearl_dive'];

function rebalance() {
  const pop = s.survivors.length;
  s.survivors.forEach((sv) => { if (!CG.Colony.onExp(s, sv.sid)) sv.job = null; });
  CG.Economy.recompute(s);
  // hold off on research until the colony can spare hands (survival + housing come first)
  const rWant = pop < 6 ? 0 : Math.min(CG.Colony.slots(s, 'research'), pop < 14 ? 2 : 3);
  for (let i = 0; i < rWant && CG.Colony.idleCount(s) > 0; i++) CG.Colony.addToJob(s, 'research', 1);
  // builders: enough to raise housing and bootstrap growth
  if (s.queue.length) { const want = Math.min(s.queue.length, pop < 8 ? 2 : 1 + Math.floor(pop / 8)); for (let i = 0; i < want && CG.Colony.idleCount(s) > 0; i++) CG.Colony.addToJob(s, 'build', 1); }
  // round-robin gather coverage so every resource gets some attention
  let pass = true;
  while (pass && CG.Colony.idleCount(s) > 0) {
    pass = false;
    for (const j of GATHER_PRIO) { if (CG.Colony.idleCount(s) <= 0) break; if (CG.Colony.slotsFree(s, j) > 0 && CG.Colony.addToJob(s, j, 1)) pass = true; }
  }
  while (CG.Colony.idleCount(s) > 0) { if (CG.Colony.addToJob(s, 'fish', 1) || CG.Colony.addToJob(s, 'forage', 1) || CG.Colony.addToJob(s, 'build', 1)) continue; break; }
}

try {
  for (let i = 0; i < STEPS; i++) {
    CG.Engine.step(realDt * 4, realDt);
    if (!stageDay[s.stats.stage]) stageDay[s.stats.stage] = s.time.day;
    if (process.env.TRACE && i % 4000 === 0) { const c = CG.Economy.cache(s); console.log('  D' + s.time.day, 'pop=' + s.survivors.length, 'house=' + Math.floor(c.housing), 'food=' + Math.floor(CG.Economy.foodStock(s)), 'water=' + Math.floor(s.resources.water || 0), 'mor=' + Math.round(s.stats.morale), 'bld=' + s.buildings.length + '/' + new Set(s.buildings.map((b) => b.id)).size, 'tech=' + s.stats.techResearched, 'q=' + s.queue.length); }

    if (i % 20 === 0) {
      if (s.events.pending) CG.Events.chooseOption(s, 0);
      // research cheapest available, preferring unlock techs
      if (!s.tech.current) { const av = CG.Research.available(s).sort((a, b) => (b.unlocks && b.unlocks.buildings ? -1 : 0) - (a.unlocks && a.unlocks.buildings ? -1 : 0) || a.cost - b.cost)[0]; if (av) CG.Research.setFocus(s, av.id); }
      // explore next unexplored region: free up to 2 workers (only once the colony can spare them)
      const reg = CG.Exploration.list(s).find((r) => r.can && !r.active && !r.explored);
      if (reg && s.survivors.length >= 6 && s.regions.expeditions.length < 1) {
        const pickers = s.survivors.filter((x) => !CG.Colony.onExp(s, x.sid)).slice(-2).map((x) => x.sid);
        CG.Exploration.start(s, reg.def.id, pickers);
      }
      rebalance();
      // build: new types first (unlock chains), then housing/storage pressure; cap duplicates
      const DUP = (id) => { const D = CG.BLD[id]; const p = D.provides || {}; if (p.housing) return 14; if (p.storageAll || p.storage) return 8; if (p.stations) return 5; if (D.cat === 'civic' || D.cat === 'trade') return 2; return 1; };
      if (s.queue.length < 3) {
        const c = CG.Economy.cache(s);
        const needHousing = c.housing <= s.survivors.length + 1;
        const anyFull = CG.RESOURCES.some((r) => !r.nocap && (s.resources[r.id] || 0) >= (c.cap[r.id] || 1e9) - 1);
        let menu = CG.Construction.buildMenu(s).filter((m) => m.canNew && m.affordable && m.built < DUP(m.def.id));
        menu.sort((a, b) => {
          const rank = (m) => {
            let r = (m.built === 0 ? 0 : 5) + m.def.tier * 0.3;
            if (needHousing && m.def.cat === 'housing') r = -10 + m.def.tier * 0.3;   // critical: housing beats novelty
            if (anyFull && m.def.cat === 'storage') r = Math.min(r, -8 + m.def.tier * 0.3);
            return r;
          };
          return rank(a) - rank(b);
        });
        if (menu[0]) CG.Construction.build(s, menu[0].def.id);
      }
      // light upgrades only when the build queue is clear, so construction/gathering aren't starved
      if (i % 80 === 0 && s.queue.length === 0 && s.buildings.length) {
        const up = s.buildings.filter((b) => b.level < CG.BLD[b.id].maxLevel)
          .sort((a, b) => a.level - b.level)[0];
        if (up && CG.Economy.canAfford(s, CG.Construction.upgradeCost(s, up))) CG.Construction.upgrade(s, up.uid);
      }
      // spend skill points greedily
      s.survivors.filter((x) => x.charId && x.skillPoints > 0).forEach((sv) => { const ch = CG.CHAR[sv.charId]; const node = ch.skills.find((n) => CG.Colony.canSpend(s, sv.charId, n.id)); if (node) CG.Colony.spendSkill(s, sv.charId, node.id); });
      // recruit with coin if rich
      if (s.coin > 200 && CG.Trade.canRecruit(s)) CG.Trade.recruit(s);
    }
  }
} catch (e) { stepErr = e; simErrors++; }

const E = CG.Economy;
console.log('Day:', s.time.day, '| Stage:', s.stats.stage, '(' + CG.C.STAGE_NAMES[s.stats.stage] + ')');
console.log('Population:', s.survivors.length, '| Buildings:', s.buildings.length, '| Distinct:', new Set(s.buildings.map((b) => b.id)).size);
console.log('Tech researched:', s.stats.techResearched, '| Regions explored:', s.stats.regionsExplored, '| Expeditions:', s.stats.expeditionsRun);
console.log('Quests done:', s.stats.questsCompleted, '| Achievements:', CG.Achievements.count(s), '| Events seen:', s.stats.eventsSeen);
console.log('Morale:', Math.round(s.stats.morale), '| Deaths:', s.stats.deaths, '| Coin:', Math.floor(s.coin), '| Research:', Math.floor(s.research));
console.log('Sample resources:', ['wood', 'stone', 'lumber', 'tools', 'fish', 'fruit', 'water'].map((r) => r + ':' + Math.floor(E.amountOf(s, r))).join(' '));
console.log('Stage reached on day:', Object.keys(stageDay).map((k) => 'S' + k + '=D' + stageDay[k]).join(' '));
console.log('Victory:', s.victory ? ('YES (day ' + (s.victorySeenAt ? s.stats.days : '?') + ')') : 'no');
if (stepErr) { console.log('\n✗ SIM ERROR:', stepErr.message); console.log(stepErr.stack.split('\n').slice(0, 8).join('\n')); }
else console.log('\n✓ Simulation ran ' + STEPS + ' steps with no runtime errors');

// save/load roundtrip
try {
  CG.Save.save(s, 's1');
  const s2 = CG.Save.load('s1');
  console.log('Save/load roundtrip:', s2 && s2.survivors.length === s.survivors.length ? '✓ ok' : '✗ mismatch');
  const code = CG.Save.exportSave(s); const s3 = CG.Save.importSave(code);
  console.log('Export/import roundtrip:', s3 && s3.buildings.length === s.buildings.length ? '✓ ok' : '✗ mismatch');
} catch (e) { console.log('✗ save/load error:', e.message); }

process.exit(problems + simErrors > 0 ? 1 : 0);
