/* Castaway: Island Survival Tycoon
 * core/utils.js — global namespace, helpers, RNG, formatting, tiny pub/sub.
 */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});

  // ---- Seeded-ish RNG (mulberry32) so balance is deterministic per session if needed ----
  let _seed = (Date.now() ^ 0x9e3779b9) >>> 0;
  const RNG = {
    seed(s) { _seed = (s >>> 0) || 1; },
    next() {
      _seed |= 0; _seed = (_seed + 0x6d2b79f5) | 0;
      let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    range(a, b) { return a + RNG.next() * (b - a); },
    int(a, b) { return Math.floor(RNG.range(a, b + 1)); },
    chance(p) { return RNG.next() < p; },
    pick(arr) { return arr[Math.floor(RNG.next() * arr.length)]; },
    // weighted pick: items must have .weight (defaults to 1)
    weighted(arr, weightFn) {
      let total = 0;
      const w = arr.map((it) => {
        const ww = Math.max(0, weightFn ? weightFn(it) : (it.weight == null ? 1 : it.weight));
        total += ww; return ww;
      });
      if (total <= 0) return null;
      let r = RNG.next() * total;
      for (let i = 0; i < arr.length; i++) { r -= w[i]; if (r <= 0) return arr[i]; }
      return arr[arr.length - 1];
    },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(RNG.next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    },
  };
  CG.RNG = RNG;

  // ---- Number formatting ----
  function fmt(n) {
    if (n == null || isNaN(n)) return '0';
    const neg = n < 0; n = Math.abs(n);
    let s;
    if (n < 1000) s = (n % 1 === 0 ? n.toString() : n.toFixed(n < 10 ? 1 : 0));
    else if (n < 1e6) s = (n / 1e3).toFixed(n < 1e4 ? 2 : 1).replace(/\.0+$/, '') + 'k';
    else if (n < 1e9) s = (n / 1e6).toFixed(2).replace(/\.0+$/, '') + 'M';
    else s = (n / 1e9).toFixed(2).replace(/\.0+$/, '') + 'B';
    return (neg ? '-' : '') + s;
  }
  function fmtSigned(n) { return (n >= 0 ? '+' : '') + fmt(n); }
  // rate formatting per minute or per day
  function fmtRate(perSec) {
    const perDay = perSec * (CG.C ? CG.C.DAY_SECONDS : 90);
    return fmtSigned(perDay) + '/day';
  }
  function fmtTime(sec) {
    sec = Math.max(0, Math.ceil(sec));
    if (sec < 60) return sec + 's';
    const m = Math.floor(sec / 60), s = sec % 60;
    if (m < 60) return m + 'm' + (s ? ' ' + s + 's' : '');
    const h = Math.floor(m / 60), mm = m % 60;
    return h + 'h' + (mm ? ' ' + mm + 'm' : '');
  }
  function fmtClock(totalSec) {
    const h = Math.floor((totalSec / 3600) % 24);
    const m = Math.floor((totalSec / 60) % 60);
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }
  CG.fmt = fmt; CG.fmtSigned = fmtSigned; CG.fmtRate = fmtRate; CG.fmtTime = fmtTime; CG.fmtClock = fmtClock;

  // ---- Math helpers ----
  CG.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  CG.lerp = (a, b, t) => a + (b - a) * t;
  CG.sum = (arr, f) => arr.reduce((s, x) => s + (f ? f(x) : x), 0);
  CG.cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  CG.deepClone = (o) => JSON.parse(JSON.stringify(o));

  // ---- Tiny event bus (decouples systems from UI) ----
  const _subs = {};
  CG.on = (evt, fn) => { (_subs[evt] = _subs[evt] || []).push(fn); return () => CG.off(evt, fn); };
  CG.off = (evt, fn) => { if (_subs[evt]) _subs[evt] = _subs[evt].filter((f) => f !== fn); };
  CG.emit = (evt, payload) => { (_subs[evt] || []).forEach((f) => { try { f(payload); } catch (e) { console.error('bus', evt, e); } }); };

  // ---- DOM helpers ----
  CG.el = (tag, props, children) => {
    const e = document.createElement(tag);
    if (props) for (const k in props) {
      if (k === 'class') e.className = props[k];
      else if (k === 'html') e.innerHTML = props[k];
      else if (k === 'text') e.textContent = props[k];
      else if (k === 'style' && typeof props[k] === 'object') Object.assign(e.style, props[k]);
      else if (k.startsWith('on') && typeof props[k] === 'function') e.addEventListener(k.slice(2).toLowerCase(), props[k]);
      else if (k === 'dataset') Object.assign(e.dataset, props[k]);
      else if (props[k] != null) e.setAttribute(k, props[k]);
    }
    if (children != null) (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c == null) return;
      e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(c) : c);
    });
    return e;
  };
  CG.$ = (sel, ctx) => (ctx || document).querySelector(sel);
  CG.$$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  // unique id
  let _uid = 1;
  CG.uid = (p) => (p || 'id') + '_' + (_uid++);
})(typeof window !== 'undefined' ? window : globalThis);
