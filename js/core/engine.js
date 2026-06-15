/* core/engine.js — the master loop. Advances time, recomputes derived state, ticks every
 * system with a real-time delta scaled by game speed, throttles heavy checks, autosaves. */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const C = CG.C;

  let s = null, rafId = null, lastT = 0, slowAcc = 0, renderAcc = 0, saveAcc = 0, running = false;

  function bind(state) { s = state; CG.state = state; CG.Economy.recompute(s); }

  function setSpeed(n) { if (!s) return; s.speed = n; s.paused = (n === 0); CG.emit('speed_changed'); }
  function togglePause() { if (!s) return; if (s.paused) setSpeed(s._lastSpeed || 1); else { s._lastSpeed = s.speed || 1; setSpeed(0); } }
  function isPaused() { return !s || s.paused || s.speed === 0; }

  function advanceTime(dt) {
    const prevDay = s.time.day;
    s.time.totalSec += dt;
    s.time.day = Math.floor(s.time.totalSec / C.DAY_SECONDS) + 1;
    s.time.phaseIndex = Math.floor((s.time.totalSec % C.DAY_SECONDS) / (C.DAY_SECONDS / 4));
    if (s.time.day !== prevDay) { s.stats.days = s.time.day; CG.emit('new_day', { day: s.time.day }); }
  }

  function updateStage() {
    const score = CG.Economy.computeProgress(s);
    s._progress = score;
    const st = CG.Economy.stageFor(score);
    if (st > s.stats.stage) {
      s.stats.stage = st; if (st > s.stats.maxStage) s.stats.maxStage = st;
      CG.State.log(s, '🌟 Your settlement has reached a new stage: ' + C.STAGE_NAMES[st] + '!', 'good');
      CG.emit('toast', { text: 'New Stage: ' + C.STAGE_NAMES[st], type: 'stage', icon: '🌟' });
      CG.emit('stage_changed', { stage: st });
    } else if (st !== s.stats.stage && st < s.stats.stage) {
      s.stats.stage = st; // can only really go up; guard anyway
    }
  }

  function checkVictory() {
    if (s.victory) return;
    if (s.buildings.some((b) => b.id === C.VICTORY.monumentId)) {
      s.victory = true; s.victorySeenAt = Date.now();
      s.stats.maxStage = 7; s.stats.stage = 7;
      CG.State.log(s, '🎉 The Grand Monument stands complete! Your colony has triumphed against the wild.', 'good');
      CG.emit('victory');
    }
  }

  function step(simDt, realDt) {
    advanceTime(simDt);
    CG.Economy.recompute(s);
    CG.Economy.tick(s, simDt);
    CG.Survival.tick(s, simDt);
    CG.Construction.tick(s, simDt);
    CG.Exploration.tick(s, simDt);
    CG.Research.tick(s);

    slowAcc += simDt;
    let guard = 0;
    while (slowAcc >= 0.5 && guard++ < 20) {
      slowAcc -= 0.5;
      CG.Colony.popTick(s, 0.5);
      CG.Colony.automationTick(s, 0.5);
      CG.Events.maybeFire(s);
      CG.Quests.tick(s);
      CG.Achievements.tick(s);
      updateStage();
      checkVictory();
    }
    s.stats.playtime += realDt;
  }

  function frame(now) {
    if (!running) return;
    rafId = root.requestAnimationFrame(frame);
    const realDt = Math.min(0.25, (now - lastT) / 1000 || 0); lastT = now;
    if (!isPaused()) {
      const simDt = realDt * s.speed;
      try { step(simDt, realDt); } catch (e) { console.error('step error', e); }
    }
    // autosave (real time, even at higher speeds)
    saveAcc += realDt;
    if (saveAcc >= C.AUTOSAVE_EVERY) { saveAcc = 0; CG.Save.save(s, 'auto'); }
    // throttled render
    renderAcc += realDt;
    if (renderAcc >= 0.1) { renderAcc = 0; CG.emit('render'); }
  }

  function start() { if (running) return; running = true; lastT = performance.now(); rafId = root.requestAnimationFrame(frame); }
  function stop() { running = false; if (rafId) root.cancelAnimationFrame(rafId); }

  CG.Engine = { bind, start, stop, setSpeed, togglePause, isPaused, step };
})(typeof window !== 'undefined' ? window : globalThis);
