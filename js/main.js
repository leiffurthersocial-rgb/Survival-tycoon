/* main.js — bootstrap: load settings, resume autosave or start fresh, boot UI, run engine. */
(function (root) {
  'use strict';
  const CG = root.CG;

  function start() {
    const splash = document.getElementById('splash');
    const settings = CG.Save.loadSettings();
    document.body.classList.toggle('reduce-motion', settings.reduceMotion);

    // resume autosave if present, else a fresh shipwreck
    const hasAuto = CG.Save.exists('auto');
    let s = null;
    if (hasAuto) { try { s = CG.Save.load('auto'); } catch (e) { s = null; } }
    if (!s) s = CG.State.newGame();
    s.settings = Object.assign(CG.State.defaultSettings(), settings, s.settings || {});

    CG.Engine.bind(s);
    CG.UI.boot();
    CG.Audio.applySettings(s.settings);
    CG.Engine.start();

    if (splash) { splash.classList.add('hide'); setTimeout(() => splash.remove(), 600); }
    if (!hasAuto) CG.UI.welcome(false);

    // unlock WebAudio on first interaction (browser autoplay policy)
    const unlock = () => { CG.Audio.ensure(); root.removeEventListener('pointerdown', unlock); root.removeEventListener('keydown', unlock); };
    root.addEventListener('pointerdown', unlock); root.addEventListener('keydown', unlock);

    // save on exit/hide
    root.addEventListener('beforeunload', () => { try { CG.Save.save(CG.state, 'auto'); } catch (e) {} });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { try { CG.Save.save(CG.state, 'auto'); } catch (e) {} } });

    // keyboard: space=pause, 1/2/3/4 speeds
    root.addEventListener('keydown', (e) => {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); CG.Engine.togglePause(); CG.emit('speed_changed'); }
      else if (e.key === '1') CG.Engine.setSpeed(1);
      else if (e.key === '2') CG.Engine.setSpeed(2);
      else if (e.key === '3' || e.key === '4') CG.Engine.setSpeed(4);
    });
    CG.on('speed_changed', () => { CG.$$('.spd').forEach((b) => b.classList.toggle('on', +b.dataset.spd === (CG.state.paused ? 0 : CG.state.speed))); });

    root.CASTAWAY = CG; // expose for debugging
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})(window);
