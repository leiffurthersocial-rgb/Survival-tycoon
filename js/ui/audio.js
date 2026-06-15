/* ui/audio.js — synthesized SFX + ambient ocean + gentle generative music via WebAudio.
 * No external files. Degrades gracefully if WebAudio is unavailable. */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});

  let ctx = null, master = null, sfxGain = null, ambGain = null, musicGain = null;
  let started = false, ambNodes = null, musicTimer = null;
  let settings = { sound: true, music: true, volume: 0.6 };

  function init() {
    if (ctx) return true;
    try {
      const AC = root.AudioContext || root.webkitAudioContext; if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = settings.volume; master.connect(ctx.destination);
      sfxGain = ctx.createGain(); sfxGain.gain.value = 0.9; sfxGain.connect(master);
      ambGain = ctx.createGain(); ambGain.gain.value = 0.0; ambGain.connect(master);
      musicGain = ctx.createGain(); musicGain.gain.value = 0.0; musicGain.connect(master);
      return true;
    } catch (e) { return false; }
  }

  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

  // call on first user gesture
  function ensure() {
    if (!init()) return;
    resume();
    if (!started) {
      started = true;
      if (settings.sound) startAmbient();
      if (settings.music) startMusic();
    }
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (!ctx || !settings.sound) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
    g.gain.value = 0.0001;
    g.gain.exponentialRampToValueAtTime(vol || 0.2, ctx.currentTime + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g); g.connect(sfxGain); o.start(); o.stop(ctx.currentTime + dur + 0.02);
  }
  function chord(freqs, dur, type, vol) { (freqs || []).forEach((f) => tone(f, dur, type, (vol || 0.15) / freqs.length)); }

  const SFX = {
    click: () => tone(420, 0.06, 'triangle', 0.12),
    hover: () => tone(620, 0.03, 'sine', 0.04),
    build: () => { tone(180, 0.12, 'square', 0.12, 120); },
    complete: () => chord([523, 659, 784], 0.4, 'triangle', 0.3),
    upgrade: () => chord([392, 523, 659], 0.35, 'triangle', 0.26),
    levelup: () => chord([523, 659, 784, 1047], 0.5, 'sine', 0.3),
    achievement: () => { chord([659, 880], 0.5, 'triangle', 0.3); setTimeout(() => chord([880, 1175], 0.5, 'sine', 0.25), 140); },
    quest: () => chord([587, 740], 0.4, 'triangle', 0.25),
    research: () => chord([494, 740], 0.4, 'sine', 0.22),
    gather: () => tone(300 + Math.random() * 60, 0.05, 'sine', 0.06),
    error: () => tone(160, 0.18, 'sawtooth', 0.12, 110),
    coin: () => { tone(900, 0.06, 'square', 0.1); setTimeout(() => tone(1200, 0.06, 'square', 0.08), 50); },
    toast: () => tone(700, 0.07, 'sine', 0.1),
    explore: () => chord([330, 494], 0.3, 'triangle', 0.18),
    danger: () => tone(220, 0.3, 'sawtooth', 0.16, 90),
    victory: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => tone(f, 0.6, 'triangle', 0.3), i * 160)); },
  };

  function play(name) { if (!settings.sound) return; ensure(); (SFX[name] || SFX.click)(); }

  // ---- ambient ocean: filtered noise with slow swell ----
  function startAmbient() {
    if (!ctx || ambNodes) return;
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource(); noise.buffer = noiseBuf; noise.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520;
    const swell = ctx.createGain(); swell.gain.value = 0.5;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.1; const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.32;
    lfo.connect(lfoGain); lfoGain.connect(swell.gain);
    noise.connect(lp); lp.connect(swell); swell.connect(ambGain);
    noise.start(); lfo.start();
    ambNodes = { noise, lfo };
    ambGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2);
  }
  function stopAmbient() { if (ambGain && ctx) ambGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1); }

  // ---- gentle generative music: soft pentatonic pads ----
  const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];
  function startMusic() {
    if (!ctx || musicTimer) return;
    musicGain.gain.linearRampToValueAtTime(0.10, ctx.currentTime + 3);
    const playNote = () => {
      if (!settings.music || !ctx) return;
      const f = SCALE[Math.floor(Math.random() * SCALE.length)] / 2;
      const o = ctx.createOscillator(), g = ctx.createGain(), o2 = ctx.createOscillator();
      o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 2.001;
      const dur = 3 + Math.random() * 3;
      g.gain.value = 0.0001;
      g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.2);
      g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.connect(g); o2.connect(g); g.connect(musicGain);
      o.start(); o2.start(); o.stop(ctx.currentTime + dur); o2.stop(ctx.currentTime + dur);
    };
    musicTimer = setInterval(() => { if (Math.random() < 0.7) playNote(); }, 2600);
    setTimeout(playNote, 400);
  }
  function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } if (musicGain && ctx) musicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1); }

  function applySettings(st) {
    settings = Object.assign(settings, st);
    if (!ctx) return;
    master.gain.value = settings.volume;
    if (settings.sound) { if (started) startAmbient(); } else stopAmbient();
    if (settings.music && started) startMusic(); else stopMusic();
  }

  CG.Audio = { play, ensure, applySettings, init, get ready() { return !!ctx; } };
})(typeof window !== 'undefined' ? window : globalThis);
