/* ui/render.js — the island scene (buildings appear & evolve), day/night sky, character avatars. */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const el = CG.el;

  // ---- character avatar with graceful image fallback (assets/<id>.jpeg if present) ----
  const imgOK = {};
  function probeImages() {
    CG.CHARS.forEach((ch) => {
      // try common name/case/extension variants so photos load however they're saved
      const C = CG.cap(ch.id);
      const cands = ['assets/' + C + '.jpeg', 'assets/' + ch.id + '.jpeg', 'assets/' + C + '.jpg', 'assets/' + ch.id + '.jpg', 'assets/' + C + '.png', ch.img];
      let i = 0;
      const tryNext = () => {
        if (i >= cands.length) { imgOK[ch.id] = false; return; }
        const src = cands[i++]; const im = new Image();
        im.onload = () => { imgOK[ch.id] = src; CG.emit('avatar_ready', { id: ch.id }); };
        im.onerror = tryNext;
        im.src = src;
      };
      tryNext();
    });
  }

  function avatar(charId, opts) {
    opts = opts || {};
    const ch = CG.CHAR[charId];
    const a = el('div', { class: 'avatar ' + (opts.size || 'av-md'), title: ch.name, style: { '--cc': ch.color } });
    a.style.background = 'radial-gradient(circle at 50% 35%, ' + tint(ch.color, 0.25) + ', ' + ch.color + ')';
    const face = el('div', { class: 'avatar-face', html: ch.icon });
    a.appendChild(face);
    if (imgOK[charId]) { a.style.backgroundImage = 'url(' + imgOK[charId] + ')'; a.classList.add('has-img'); face.style.display = 'none'; }
    return a;
  }
  function tint(hex, amt) {
    const c = hex.replace('#', ''); const r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
    const m = (v) => Math.round(v + (255 - v) * amt);
    return 'rgb(' + m(r) + ',' + m(g) + ',' + m(b) + ')';
  }

  // ---- sky/day-night ----
  const SKY = {
    Dawn: ['#ffd9a0', '#ffb27a', '#7ec8e3'],
    Day: ['#aee8ff', '#7ec8e3', '#bff0d4'],
    Dusk: ['#ffb27a', '#e98a6b', '#5b6aa0'],
    Night: ['#1b2a4a', '#24365e', '#33507a'],
  };

  let built = false, sky, sea, island, bLayer, banner, sun;
  function ensure(container) {
    if (built && container.contains(sky)) return;
    container.innerHTML = '';
    sky = el('div', { class: 'scene-sky' });
    sun = el('div', { class: 'scene-sun' });
    sea = el('div', { class: 'scene-sea' });
    island = el('div', { class: 'scene-island' });
    bLayer = el('div', { class: 'scene-buildings' });
    banner = el('div', { class: 'scene-banner' });
    const palms = el('div', { class: 'scene-decor', html: '🌴🌴🌳' });
    container.append(sky, sun, sea, island, palms, bLayer, banner);
    built = true;
    renderBuildings(CG.state);
  }

  function update(container, s) {
    ensure(container);
    const phase = CG.C.PHASES[s.time.phaseIndex];
    const cols = SKY[phase] || SKY.Day;
    sky.style.background = 'linear-gradient(180deg,' + cols[0] + ' 0%,' + cols[1] + ' 55%,' + cols[2] + ' 100%)';
    const night = phase === 'Night';
    container.classList.toggle('is-night', night);
    // sun/moon arc across the day
    const frac = (s.time.totalSec % CG.C.DAY_SECONDS) / CG.C.DAY_SECONDS;
    sun.style.left = (8 + frac * 84) + '%';
    sun.style.top = (70 - Math.sin(frac * Math.PI) * 58) + '%';
    sun.textContent = night ? '🌙' : '☀️';
    // construction banner
    if (s.queue.length) {
      const q = s.queue[0]; const D = CG.BLD[q.bid];
      const pct = Math.floor((q.progress / q.total) * 100);
      banner.style.display = 'flex';
      banner.innerHTML = '<span class="cb-ic">🚧</span><span>' + D.icon + ' ' + D.name + (q.isUpgrade ? ' → L' + q.targetLevel : '') +
        '</span><span class="cb-bar"><i style="width:' + pct + '%"></i></span><span class="cb-pct">' + pct + '%</span>' +
        (s.queue.length > 1 ? '<span class="cb-more">+' + (s.queue.length - 1) + '</span>' : '');
    } else banner.style.display = 'none';
  }

  let lastSig = '';
  function renderBuildings(s) {
    if (!bLayer || !s) return;
    const sig = s.buildings.map((b) => b.id + b.level).join(',');
    if (sig === lastSig) return; lastSig = sig;
    bLayer.innerHTML = '';
    // sort by y so lower ones overlap correctly
    const list = s.buildings.slice().sort((a, b) => (a.y || 0) - (b.y || 0));
    list.forEach((b) => {
      const D = CG.BLD[b.id]; if (!D) return;
      const node = el('div', { class: 'bld pop', title: D.name + ' (L' + b.level + ')',
        style: { left: (b.x || 50) + '%', top: (b.y || 70) + '%', fontSize: (15 + D.tier * 2) + 'px' } });
      node.innerHTML = '<span class="bld-ic">' + D.icon + '</span>';
      if (b.level > 1) { const pips = el('span', { class: 'bld-pips' }); for (let i = 1; i < b.level; i++) pips.appendChild(el('i')); node.appendChild(pips); }
      node.addEventListener('click', () => CG.emit('select_building', { uid: b.uid }));
      bLayer.appendChild(node);
    });
  }

  CG.on('buildings_changed', () => { if (CG.state) renderBuildings(CG.state); });
  CG.on('queue_changed', () => {});

  CG.Render = { update, avatar, probeImages, renderBuildings, tint };
})(typeof window !== 'undefined' ? window : globalThis);
