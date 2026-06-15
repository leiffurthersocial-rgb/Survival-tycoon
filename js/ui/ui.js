/* ui/ui.js — the complete game interface: HUD, panels, modals, toasts, tooltips, onboarding.
 * Panels use a signature-based rebuild + lightweight live update to stay smooth. */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const el = CG.el, fmt = CG.fmt, $ = CG.$;
  const S = () => CG.state;
  const Eco = () => CG.Economy;

  let activeTab = 'overview';
  let rootEl, headerEl, railEl, contentEl, toastEl, modalRoot, hintEl;
  const panelState = {}; // per-tab last signature
  const rate = {}; let prevRes = null, prevT = 0;

  // ---------- generic helpers ----------
  function snd(n) { CG.Audio.play(n); }
  function bar(pct, cls) { return '<span class="bar ' + (cls || '') + '"><i style="width:' + CG.clamp(pct, 0, 100) + '%"></i></span>'; }
  function needColor(v) { return v > 60 ? 'good' : v > 30 ? 'warn' : 'bad'; }
  function tip(t) { return t ? ' data-tip="' + t.replace(/"/g, '&quot;') + '"' : ''; }

  function costStr(s, cost, inline) {
    return Object.keys(cost).map((k) => {
      const have = Eco().amountOf(s, k); const ok = have >= cost[k];
      return '<span class="cost ' + (ok ? '' : 'cant') + '">' + CG.resIcon(k) + fmt(cost[k]) + '</span>';
    }).join(inline ? ' ' : ' ');
  }
  function effSummary(effects) {
    return (effects || []).map(describeEffect).filter(Boolean).join(' · ');
  }
  function describeEffect(e) {
    switch (e.type) {
      case 'global_prod': return '+' + pct(e.mult) + ' all output';
      case 'prod_mult': return '+' + pct(e.mult) + ' ' + CG.jobName(e.job);
      case 'res_mult': return '+' + pct(e.mult) + ' ' + CG.resName(e.res);
      case 'refine_mult': return '+' + pct(e.mult) + ' refining';
      case 'storage_mult': return '+' + pct(e.mult) + ' storage';
      case 'storage_add': return '+' + fmt(e.amt) + ' ' + CG.resName(e.res) + ' storage';
      case 'build_speed': return '+' + pct(e.mult) + ' build speed';
      case 'build_cost': return pct(e.mult) + ' build cost';
      case 'explore_speed': return '+' + pct(e.mult) + ' explore speed';
      case 'hunt_success': return '+' + pct(e.mult) + ' hunting';
      case 'research_mult': return '+' + pct(e.mult) + ' research';
      case 'xp_mult': return '+' + pct(e.mult) + ' training';
      case 'trade_price': return '+' + pct(e.mult) + ' trade prices';
      case 'tool_quality': return '+' + pct(e.mult) + ' tool quality';
      case 'heal_rate': return '+' + pct(e.mult) + ' healing';
      case 'pop_growth': return '+' + pct(e.mult) + ' growth';
      case 'need_rate': { const better = e.mult < 1; return (e.need === 'health' ? 'faster healing' : (better ? 'slower ' + e.need + ' loss' : 'faster ' + e.need + ' loss')); }
      case 'rare_chance': return '+' + Math.round(e.add * 100) + '% rare finds';
      case 'trade_volume': return '+' + e.amt + ' trade volume';
      case 'attract': return '+' + e.amt + ' attractiveness';
      case 'food_variety': return '+food variety';
      case 'morale': return (e.amt >= 0 ? '+' : '') + e.amt + ' morale';
      case 'passive_res': return '+' + e.amt.toFixed(2) + '/s ' + CG.resName(e.res);
      case 'housing': return '+' + e.amt + ' housing';
      case 'station_add': return '+' + (e.slots || 1) + ' ' + CG.jobName(e.job) + ' slot';
      case 'unlock_job': return 'unlocks ' + CG.jobName(e.job);
      case 'victory': return '🏆 Wins the game';
      default: return '';
    }
  }
  function pct(mult) { return Math.round(Math.abs(mult - 1) * 100) + '%'; }
  function providesSummary(D) {
    const p = D.provides || {}; const out = [];
    if (p.housing) out.push('+' + p.housing + ' 🛏 housing');
    if (p.morale) out.push('+' + p.morale + ' 😊 morale');
    if (p.storageAll) out.push('+' + p.storageAll + ' 📦 storage (all)');
    if (p.storage) for (const k in p.storage) out.push('+' + p.storage[k] + ' ' + CG.resIcon(k) + ' storage');
    (p.stations || []).forEach((st) => out.push('+' + st.slots + ' ' + CG.jobIcon(st.job) + ' ' + CG.jobName(st.job) + ' jobs'));
    if (D.recipe) { const r = D.recipe; out.push('🏭 ' + Object.keys(r.inputs).map((k) => CG.resIcon(k)).join('') + '→' + Object.keys(r.outputs).map((k) => CG.resIcon(k)).join('')); }
    return out.concat((D.effects || []).map(describeEffect).filter(Boolean));
  }

  // ---------- toasts ----------
  function toast(text, type, icon) {
    const t = el('div', { class: 'toast t-' + (type || 'info') });
    t.innerHTML = (icon ? '<span class="t-ic">' + icon + '</span>' : '') + '<span>' + text + '</span>';
    toastEl.appendChild(t);
    snd(type === 'bad' ? 'error' : type === 'achv' ? 'achievement' : type === 'quest' ? 'quest' : type === 'tech' ? 'research' : type === 'stage' ? 'levelup' : 'toast');
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 500); }, 4200);
    while (toastEl.children.length > 6) toastEl.firstChild.remove();
  }

  // ---------- tooltips ----------
  let tipEl;
  function initTips() {
    tipEl = el('div', { class: 'tooltip' }); document.body.appendChild(tipEl);
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-tip]'); if (!t) return;
      tipEl.innerHTML = t.getAttribute('data-tip'); tipEl.classList.add('show'); moveTip(e);
    });
    document.addEventListener('mousemove', (e) => { if (tipEl.classList.contains('show')) moveTip(e); });
    document.addEventListener('mouseout', (e) => { if (e.target.closest('[data-tip]')) tipEl.classList.remove('show'); });
  }
  function moveTip(e) {
    const pad = 14; let x = e.clientX + pad, y = e.clientY + pad;
    const r = tipEl.getBoundingClientRect();
    if (x + r.width > innerWidth - 8) x = e.clientX - r.width - pad;
    if (y + r.height > innerHeight - 8) y = e.clientY - r.height - pad;
    tipEl.style.left = x + 'px'; tipEl.style.top = y + 'px';
  }

  // ---------- modals ----------
  function modal(opts) {
    const ov = el('div', { class: 'modal-ov' });
    const box = el('div', { class: 'modal ' + (opts.cls || '') });
    if (opts.title) box.appendChild(el('div', { class: 'modal-head', html: opts.title }));
    const body = el('div', { class: 'modal-body' });
    if (typeof opts.body === 'string') body.innerHTML = opts.body; else if (opts.body) body.appendChild(opts.body);
    box.appendChild(body);
    if (opts.actions) {
      const ft = el('div', { class: 'modal-foot' });
      opts.actions.forEach((a) => {
        const b = el('button', { class: 'btn ' + (a.cls || ''), text: a.text });
        b.addEventListener('click', () => { snd('click'); if (!a.keep) close(); if (a.fn) a.fn(); });
        ft.appendChild(b);
      });
      box.appendChild(ft);
    }
    ov.appendChild(box);
    if (opts.dismiss !== false) ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    modalRoot.appendChild(ov);
    function close() { ov.classList.add('out'); setTimeout(() => ov.remove(), 250); if (opts.onClose) opts.onClose(); }
    ov._close = close;
    requestAnimationFrame(() => ov.classList.add('in'));
    return { close, box, body };
  }
  function closeAllModals() { CG.$$('.modal-ov').forEach((m) => m._close && m._close()); }

  // ============================================================ HEADER
  function buildHeader() {
    headerEl.innerHTML = '';
    const left = el('div', { class: 'hd-left' });
    const menuBtn = el('button', { class: 'icon-btn', html: '☰', 'data-tip': 'Menu (save, load, settings)' });
    menuBtn.addEventListener('click', () => { snd('click'); openMenu(); });
    const title = el('div', { class: 'hd-title' });
    title.innerHTML = '<span class="hd-logo">🏝️ Castaway</span><span class="hd-stage" id="hdStage"></span>';
    left.append(menuBtn, title);

    const mid = el('div', { class: 'hd-res', id: 'hdRes' });

    const right = el('div', { class: 'hd-right' });
    const clock = el('div', { class: 'hd-clock', id: 'hdClock' });
    const speeds = el('div', { class: 'speeds' });
    [['⏸', 0, 'Pause'], ['▶', 1, '1× speed'], ['⏩', 2, '2× speed'], ['⏭', 4, '4× speed']].forEach(([lbl, v, tp]) => {
      const b = el('button', { class: 'spd', 'data-spd': v, 'data-tip': tp, text: lbl });
      b.addEventListener('click', () => { snd('click'); CG.Engine.setSpeed(v); refreshSpeed(); });
      speeds.appendChild(b);
    });
    const help = el('button', { class: 'icon-btn', html: '?', 'data-tip': 'How to play' });
    help.addEventListener('click', () => { snd('click'); welcome(true); });
    right.append(clock, speeds, help);

    headerEl.append(left, mid, right);
    refreshSpeed();
  }
  function refreshSpeed() { CG.$$('.spd').forEach((b) => b.classList.toggle('on', +b.dataset.spd === (S().paused ? 0 : S().speed))); }

  const HEADER_RES = ['food', 'water', 'wood', 'stone', 'lumber', 'brick', 'ironbar', 'tools', 'research', 'coin'];
  function updateHeader() {
    const s = S(); const c = Eco().cache(s);
    $('#hdStage').textContent = CG.C.STAGE_NAMES[s.stats.stage];
    const phase = CG.C.PHASES[s.time.phaseIndex];
    $('#hdClock').innerHTML = '<span class="phase ph-' + phase.toLowerCase() + '">' + phaseIcon(phase) + ' ' + phase + '</span><span class="day">Day ' + s.time.day + '</span>';

    // rate sampling
    const now = performance.now(); const dt = (now - prevT) / 1000; prevT = now;
    const res = s.resources; const showR = s.settings.showRates && dt > 0 && dt < 1;
    const host = $('#hdRes'); if (!host) return;

    // population + morale chips first
    let html = '';
    const idle = CG.Colony.idleCount(s);
    html += chip('👥', s.survivors.length + (idle ? ' (' + idle + ' idle)' : ''), 'Population — ' + c.assignedCount + ' working, ' + idle + ' idle, ' + Math.floor(c.housing) + ' housing', idle ? 'warn' : '');
    html += chip('😊', Math.round(s.stats.morale), 'Settlement morale (×' + c.moraleMult.toFixed(2) + ' production)', needColor(s.stats.morale));
    html += chip('🍽️', fmt(Eco().foodStock(s)), 'Food value in storage (fish, fruit, meat, bread, crops)');

    HEADER_RES.forEach((r) => {
      if (r === 'food') return;
      let amt, cap, rt;
      if (r === 'research') { amt = s.research; cap = null; rt = Eco().researchRate(s); }
      else if (r === 'coin') { amt = s.coin; cap = null; rt = null; }
      else { amt = res[r] || 0; cap = c.cap[r]; }
      if (amt <= 0 && r !== 'research' && r !== 'coin' && r !== 'wood' && r !== 'water') return; // hide empties early
      let rateTxt = '';
      if (showR) {
        let perSec;
        if (r === 'research') perSec = rt; else { const prev = prevRes ? (prevRes[r] || 0) : amt; perSec = (amt - prev) / dt; rate[r] = rate[r] == null ? perSec : rate[r] * 0.8 + perSec * 0.2; perSec = rate[r]; }
        const perDay = perSec * CG.C.DAY_SECONDS;
        if (Math.abs(perDay) > 0.05) rateTxt = '<span class="rt ' + (perDay >= 0 ? 'up' : 'dn') + '">' + (perDay >= 0 ? '▲' : '▼') + fmt(Math.abs(perDay)) + '</span>';
      }
      const capTxt = cap != null ? '<span class="cap">/' + fmt(cap) + '</span>' : '';
      const full = cap != null && amt >= cap - 0.5;
      html += '<span class="chip' + (full ? ' full' : '') + '"' + tip(CG.resName(r) + (cap != null ? ' — ' + Math.floor(amt) + '/' + fmt(cap) + (full ? ' (FULL)' : '') : '')) + '>' +
        '<span class="ci">' + CG.resIcon(r) + '</span><span class="cv">' + fmt(amt) + capTxt + '</span>' + rateTxt + '</span>';
    });
    host.innerHTML = html;
    prevRes = Object.assign({}, res);
  }
  function chip(icon, val, tp, cls) { return '<span class="chip ' + (cls || '') + '"' + tip(tp) + '><span class="ci">' + icon + '</span><span class="cv">' + val + '</span></span>'; }
  function phaseIcon(p) { return p === 'Night' ? '🌙' : p === 'Dawn' ? '🌅' : p === 'Dusk' ? '🌇' : '☀️'; }

  // ============================================================ TAB RAIL
  const TABS = [
    ['overview', '🏝️', 'Overview'], ['survivors', '🧑‍🤝‍🧑', 'Survivors'], ['build', '🏗️', 'Build'],
    ['jobs', '🧰', 'Jobs'], ['inventory', '📦', 'Storage'], ['research', '🔬', 'Research'], ['explore', '🧭', 'Explore'],
    ['trade', '⚖️', 'Trade'], ['quests', '🎯', 'Quests'], ['characters', '⭐', 'Heroes'],
    ['achievements', '🏆', 'Awards'], ['log', '📜', 'Log'],
  ];
  function buildRail() {
    railEl.innerHTML = '';
    TABS.forEach(([id, ic, name]) => {
      const b = el('button', { class: 'rail-btn', 'data-tab': id, 'data-tip': name });
      b.innerHTML = '<span class="rb-ic">' + ic + '</span><span class="rb-lbl">' + name + '</span><span class="rb-badge" data-badge="' + id + '"></span>';
      b.addEventListener('click', () => { snd('click'); switchTab(id); });
      railEl.appendChild(b);
    });
  }
  function switchTab(id) { activeTab = id; panelState[id] = null; CG.$$('.rail-btn').forEach((b) => b.classList.toggle('on', b.dataset.tab === id)); renderActive(true); }
  function setBadge(id, n) { const b = railEl.querySelector('[data-badge="' + id + '"]'); if (b) { b.textContent = n || ''; b.classList.toggle('show', !!n); } }

  // ============================================================ PANEL CONTROLLER
  const PANELS = {};
  function renderActive(force) {
    const s = S(); const p = PANELS[activeTab]; if (!p) return;
    const sig = p.sig ? p.sig(s) : Math.random();
    if (force || sig !== panelState[activeTab]) {
      const st = contentEl.scrollTop;
      contentEl.innerHTML = ''; p.render(contentEl, s); panelState[activeTab] = sig;
      contentEl.scrollTop = st;
    } else if (p.live) p.live(contentEl, s);
  }

  // ---------------- OVERVIEW ----------------
  PANELS.overview = {
    sig: (s) => s.buildings.length + '|' + s.survivors.length + '|' + s.stats.stage + '|' + s.regions.expeditions.length + '|' + s.buffs.length + '|' + (s.quests.active[0] || '') + '|' + s.queue.length,
    render(host, s) {
      const c = Eco().cache(s);
      const wrap = el('div', { class: 'ov' });
      const scene = el('div', { class: 'scene', id: 'scene' });
      wrap.appendChild(scene);

      const side = el('div', { class: 'ov-side' });
      // stage progress
      const score = CG.Economy.computeProgress(s); const st = s.stats.stage;
      const lo = CG.C.STAGE_THRESHOLDS[st], hi = CG.C.STAGE_THRESHOLDS[st + 1] || lo + 1;
      const pctp = st >= 7 ? 100 : ((score - lo) / (hi - lo)) * 100;
      side.appendChild(card('Settlement', '🌟', '<div class="stage-name">' + CG.C.STAGE_NAMES[st] + '</div>' +
        bar(pctp, 'stage') + '<div class="muted small">' + (st >= 7 ? 'Maximum stage reached' : 'Progress to ' + CG.C.STAGE_NAMES[st + 1]) + '</div>'));

      // colony growth — shows clearly when new settlers will arrive
      const g = CG.Colony.growthStatus(s); const pop = s.survivors.length; const beds = Math.floor(c.housing);
      const grow = (ok, t) => '<div class="grow-row ' + (ok ? 'ok' : 'no') + '">' + (ok ? '✅' : '⚠️') + ' ' + t + '</div>';
      side.appendChild(card('Colony Growth', '👶',
        '<div class="grow-top">👥 ' + pop + ' colonists · 🛏️ ' + beds + ' beds (' + Math.max(0, g.freeBeds) + ' free)</div>' +
        grow(g.housingOk, g.housingOk ? 'Spare housing' : 'Need free housing — build homes') +
        grow(g.foodOk, 'Food stocked') + grow(g.waterOk, 'Water stocked') +
        grow(g.moraleOk, 'Morale ' + Math.round(s.stats.morale) + ' (need ' + CG.C.POP.moraleForGrowth + '+)') +
        '<div class="grow-foot small">' + (g.canGrow ? '🎉 New settlers are on their way!' : 'Meet every condition and newcomers will arrive.') + '</div>'));

      // automation (unlocked by mid-game buildings)
      const autos = [['autoAssign', '🧰 Auto-assign idle', 'Town Hall'], ['autoExplore', '🧭 Auto-explore regions', 'Expedition Camp'], ['autoResearch', '🔬 Auto-research', 'School']];
      const ac = el('div');
      autos.forEach(([key, label, bld]) => {
        const row = el('div', { class: 'auto-row' }); row.appendChild(el('span', { html: label }));
        if (CG.Colony.autoUnlocked(s, key)) {
          const t = el('button', { class: 'toggle' + (s.automation[key] ? ' on' : ''), text: s.automation[key] ? 'On' : 'Off' });
          t.addEventListener('click', () => { s.automation[key] = !s.automation[key]; snd('click'); renderActive(true); });
          row.appendChild(t);
        } else row.appendChild(el('span', { class: 'small muted', 'data-tip': 'Build a ' + bld + ' to unlock', text: '🔒 ' + bld }));
        ac.appendChild(row);
      });
      side.appendChild(card('Automation', '⚙️', ac));

      // heroes strip
      const heroes = el('div', { class: 'heroes-strip' });
      CG.CHARS.forEach((ch) => {
        const sv = CG.State.namedSurvivor(s, ch.id); if (!sv) return;
        const h = el('div', { class: 'hero-mini', 'data-tip': ch.name + ' — ' + ch.role + (sv.job ? '<br>Working: ' + CG.jobName(sv.job) : '<br>Idle') });
        h.appendChild(CG.Render.avatar(ch.id, { size: 'av-sm' }));
        h.appendChild(el('div', { class: 'hm-info', html: '<b>' + ch.name + '</b><span class="lvl">L' + sv.level + (sv.skillPoints ? ' <span class="sp">+' + sv.skillPoints + '</span>' : '') + '</span>' }));
        h.addEventListener('click', () => switchTab('characters'));
        heroes.appendChild(h);
      });
      side.appendChild(card('Heroes', '⭐', heroes));

      // expeditions
      if (s.regions.expeditions.length) {
        const ex = el('div');
        s.regions.expeditions.forEach((e) => {
          const R = CG.REGION[e.region]; const p = Math.floor((e.progress / e.total) * 100);
          ex.appendChild(el('div', { class: 'exp-row', html: R.icon + ' ' + R.name + ' ' + bar(p) + '<span class="small">' + p + '%</span>' }));
        });
        side.appendChild(card('Expeditions', '🧭', ex));
      }
      // buffs
      if (s.buffs.length) {
        const bf = el('div', { class: 'buffs' });
        s.buffs.forEach((b) => bf.appendChild(el('span', { class: 'buff', html: '✨ ' + b.label + ' <span class="small">' + Math.max(0, b.endsDay - s.time.day) + 'd</span>' })));
        side.appendChild(card('Active Effects', '✨', bf));
      }
      // log
      const logBox = el('div', { class: 'mini-log', id: 'miniLog' });
      side.appendChild(card('Recent Events', '📜', logBox));

      wrap.appendChild(side);
      host.appendChild(wrap);
      CG.Render.update(scene, s);
      fillMiniLog(s);
    },
    live(host, s) {
      const scene = $('#scene', host); if (scene) CG.Render.update(scene, s);
      const exRows = CG.$$('.exp-row .bar i', host);
      s.regions.expeditions.forEach((e, i) => { if (exRows[i]) exRows[i].style.width = CG.clamp((e.progress / e.total) * 100, 0, 100) + '%'; });
    },
  };
  function fillMiniLog(s) { const box = $('#miniLog'); if (!box) return; box.innerHTML = s.log.slice(0, 6).map((l) => '<div class="lg lg-' + l.type + '"><span class="lg-d">D' + l.day + '</span> ' + l.text + '</div>').join('') || '<div class="muted small">Your story begins…</div>'; }

  function card(title, icon, body) {
    const c = el('div', { class: 'card' });
    c.appendChild(el('div', { class: 'card-h', html: '<span>' + icon + ' ' + title + '</span>' }));
    const b = el('div', { class: 'card-b' }); if (typeof body === 'string') b.innerHTML = body; else b.appendChild(body);
    c.appendChild(b); return c;
  }

  // ---------------- SURVIVORS ----------------
  PANELS.survivors = {
    sig: (s) => s.survivors.map((x) => x.sid + x.job + x.level).join(',') + '|' + s.regions.expeditions.length,
    render(host, s) {
      const c = Eco().cache(s);
      host.appendChild(sectionHead('Survivors', s.survivors.length + ' colonists · ' + CG.Colony.idleCount(s) + ' idle · ' + Math.floor(c.housing) + ' housing'));
      const jobs = unlockedJobList(s);
      const list = el('div', { class: 'survivor-list' });
      s.survivors.slice().sort((a, b) => (b.isNamed - a.isNamed) || (b.level - a.level)).forEach((sv) => list.appendChild(survivorRow(s, sv, jobs)));
      host.appendChild(list);
    },
    live(host, s) {
      CG.$$('.sv-row', host).forEach((row) => {
        const sv = CG.State.survivorById(s, row.dataset.sid); if (!sv) return;
        ['hunger', 'thirst', 'energy', 'health'].forEach((n) => { const i = row.querySelector('.nb-' + n + ' i'); if (i) { i.style.width = sv[n] + '%'; i.className = needColor(sv[n]); } });
        const xb = row.querySelector('.xp i'); if (xb) xb.style.width = (sv.level >= CG.C.XP.maxLevel ? 100 : (sv.xp / sv.xpNext) * 100) + '%';
      });
    },
  };
  function survivorRow(s, sv, jobs) {
    const onExp = CG.Colony.onExp(s, sv.sid);
    const row = el('div', { class: 'sv-row' + (sv.isNamed ? ' named' : ''), 'data-sid': sv.sid });
    const av = sv.isNamed ? CG.Render.avatar(sv.charId, { size: 'av-md' }) : el('div', { class: 'avatar av-md gen', html: '🧑' });
    const moodIc = { happy: '😄', ok: '🙂', exhausted: '🥱', suffering: '😣', sick: '🤒' }[sv.mood] || '🙂';
    const left = el('div', { class: 'sv-id' });
    left.append(av);
    left.appendChild(el('div', { html: '<div class="sv-name">' + sv.name + ' <span class="mood">' + moodIc + '</span></div>' +
      '<div class="sv-role small">' + (sv.isNamed ? CG.CHAR[sv.charId].role : 'Settler') + ' · L' + sv.level + (sv.charId && sv.skillPoints ? ' <span class="sp">+' + sv.skillPoints + 'sp</span>' : '') + '</div>' +
      '<span class="xp bar mini"><i style="width:' + (sv.level >= CG.C.XP.maxLevel ? 100 : (sv.xp / sv.xpNext) * 100) + '%"></i></span>' }));
    row.appendChild(left);

    const needs = el('div', { class: 'sv-needs' });
    [['hunger', '🍖'], ['thirst', '💧'], ['energy', '⚡'], ['health', '❤️']].forEach(([n, ic]) => {
      needs.appendChild(el('div', { class: 'nb nb-' + n, 'data-tip': CG.cap(n) + ': ' + Math.round(sv[n]) + '%', html: '<span class="nb-ic">' + ic + '</span><span class="bar"><i class="' + needColor(sv[n]) + '" style="width:' + sv[n] + '%"></i></span>' }));
    });
    row.appendChild(needs);

    const ctrl = el('div', { class: 'sv-ctrl' });
    if (onExp) ctrl.appendChild(el('span', { class: 'tag', html: '🧭 On expedition' }));
    else {
      const sel = el('select', { class: 'job-sel' });
      sel.appendChild(el('option', { value: '', text: '— Idle —' }));
      jobs.forEach((j) => {
        const free = CG.Colony.slotsFree(s, j.id) + (sv.job === j.id ? 1 : 0);
        const o = el('option', { value: j.id, text: j.icon + ' ' + j.name + ' (' + (CG.Colony.workersIn(s, j.id)) + '/' + CG.Colony.slots(s, j.id) + ')' });
        if (sv.job === j.id) o.selected = true;
        if (free <= 0 && sv.job !== j.id) o.disabled = true;
        sel.appendChild(o);
      });
      sel.addEventListener('change', () => { const r = CG.Colony.assign(s, sv.sid, sel.value || null); if (!r.ok) { toast(r.why || 'Cannot assign', 'bad'); renderActive(true); } else snd('click'); });
      ctrl.appendChild(sel);
    }
    if (sv.isNamed) { const b = el('button', { class: 'btn tiny', text: '⭐ Skills' + (sv.skillPoints ? ' (' + sv.skillPoints + ')' : '') }); b.addEventListener('click', () => switchTab('characters')); ctrl.appendChild(b); }
    row.appendChild(ctrl);
    return row;
  }
  function unlockedJobList(s) { const c = Eco().cache(s); return CG.JOBS.filter((j) => c.unlockedJobs[j.id]); }

  // ---------------- BUILD ----------------
  let buildFilter = 'all';
  const CATS = [['all', 'All'], ['survival', '⛺ Survival'], ['storage', '📦 Storage'], ['production', '🧺 Gathering'], ['housing', '🏠 Housing'], ['industry', '🏭 Industry'], ['civic', '🏛️ Civic'], ['trade', '⚖️ Trade'], ['special', '✨ Special']];
  let buildMode = 'available';
  PANELS.build = {
    sig: (s) => 'b|' + buildFilter + buildMode + s.buildings.map((b) => b.id + b.level).join(',') + '|' + Object.keys(s.tech.researched).length + '|' + Object.keys(s.regions.explored).length + '|' + s.queue.length,
    render(host, s) {
      const head = sectionHead('Build & Upgrade', '');
      const modes = el('div', { class: 'seg' });
      [['available', 'Available'], ['built', 'Constructed (' + s.buildings.length + ')']].forEach(([m, l]) => { const b = el('button', { class: 'seg-b' + (buildMode === m ? ' on' : ''), text: l }); b.addEventListener('click', () => { buildMode = m; snd('click'); renderActive(true); }); modes.appendChild(b); });
      head.appendChild(modes); host.appendChild(head);

      // queue
      if (s.queue.length) host.appendChild(queueBox(s));

      if (buildMode === 'available') {
        const filt = el('div', { class: 'filters' });
        CATS.forEach(([id, name]) => { const b = el('button', { class: 'fbtn' + (buildFilter === id ? ' on' : ''), text: name }); b.addEventListener('click', () => { buildFilter = id; snd('click'); renderActive(true); }); filt.appendChild(b); });
        host.appendChild(filt);
        const grid = el('div', { class: 'card-grid' });
        let menu = CG.Construction.buildMenu(s).filter((m) => !m.built); // unique: built ones move to Constructed
        if (buildFilter !== 'all') menu = menu.filter((m) => m.def.cat === buildFilter);
        menu.sort((a, b) => a.def.tier - b.def.tier);
        if (!menu.length) grid.appendChild(el('div', { class: 'muted', text: 'All available buildings are built — upgrade them in Constructed, or research & explore for more.' }));
        menu.forEach((m) => grid.appendChild(buildCard(s, m)));
        host.appendChild(grid);
      } else {
        const grid = el('div', { class: 'card-grid' });
        const groups = {}; s.buildings.forEach((b) => { (groups[b.id] = groups[b.id] || []).push(b); });
        if (!s.buildings.length) grid.appendChild(el('div', { class: 'muted', text: 'Nothing built yet. Switch to Available to start.' }));
        Object.keys(groups).sort((a, b) => CG.BLD[a].cat.localeCompare(CG.BLD[b].cat)).forEach((id) => builtCards(s, groups[id], grid));
        host.appendChild(grid);
      }
    },
    live(host, s) {
      CG.$$('.bcard', host).forEach((card) => {
        const id = card.dataset.bid; if (!id) return;
        const cost = CG.Construction.effCost(s, CG.BLD[id].cost);
        const can = CG.Construction.canBuildNew(s, CG.BLD[id]) && Eco().canAfford(s, cost);
        const btn = card.querySelector('.build-btn'); if (btn) btn.disabled = !can;
        const cs = card.querySelector('.bcost'); if (cs) cs.innerHTML = costStr(s, cost);
      });
      CG.$$('.q-row .bar i', host).forEach((i, idx) => { if (s.queue[idx]) i.style.width = (s.queue[idx].progress / s.queue[idx].total * 100) + '%'; });
    },
  };
  function buildCard(s, m) {
    const D = m.def;
    const card = el('div', { class: 'bcard tier-' + D.tier, 'data-bid': D.id });
    card.innerHTML = '<div class="bc-top"><span class="bc-ic">' + D.icon + '</span><div><div class="bc-name">' + D.name + (m.built ? ' <span class="cnt">×' + m.built + '</span>' : '') + '</div><div class="bc-tier small">Tier ' + D.tier + ' · ' + CG.cap(D.cat) + '</div></div></div>' +
      '<div class="bc-desc small">' + D.desc + '</div>' +
      '<div class="bc-prov small">' + providesSummary(D).map((x) => '<span class="prov">' + x + '</span>').join('') + '</div>' +
      '<div class="bc-foot"><span class="bcost">' + costStr(s, m.cost) + '</span></div>';
    const btn = el('button', { class: 'btn build-btn', text: '🔨 Build · ' + CG.fmtTime(D.buildTime) });
    btn.disabled = !(m.canNew && m.affordable);
    btn.addEventListener('click', () => { const r = CG.Construction.build(s, D.id); if (r.ok) { snd('build'); renderActive(true); } else { toast(r.why || 'Cannot build', 'bad'); } });
    card.querySelector('.bc-foot').appendChild(btn);
    card.setAttribute('data-tip', '<b>' + D.name + '</b><br>' + D.desc);
    return card;
  }
  function builtCards(s, group, grid) {
    const D = CG.BLD[group[0].id];
    group.forEach((b) => {
      const card = el('div', { class: 'bcard built tier-' + D.tier });
      const atMax = b.level >= D.maxLevel;
      card.innerHTML = '<div class="bc-top"><span class="bc-ic">' + D.icon + '</span><div><div class="bc-name">' + D.name + ' <span class="cnt">L' + b.level + '/' + D.maxLevel + '</span></div><div class="small muted">' + CG.cap(D.cat) + '</div></div></div>' +
        '<div class="bc-prov small">' + providesSummary(D).map((x) => '<span class="prov">' + x + '</span>').join('') + '</div>';
      const foot = el('div', { class: 'bc-foot' });
      if (!atMax) {
        const uc = CG.Construction.upgradeCost(s, b);
        foot.appendChild(el('span', { class: 'bcost', html: costStr(s, uc) }));
        const ub = el('button', { class: 'btn tiny', text: '⬆ Upgrade' });
        ub.disabled = !Eco().canAfford(s, uc) || s.queue.some((q) => q.uid === b.uid);
        ub.addEventListener('click', () => { const r = CG.Construction.upgrade(s, b.uid); if (r.ok) { snd('build'); renderActive(true); } else toast(r.why || 'Cannot upgrade', 'bad'); });
        foot.appendChild(ub);
      } else foot.appendChild(el('span', { class: 'tag', text: 'Max level' }));
      const db = el('button', { class: 'btn tiny ghost', text: '🗑' , 'data-tip': 'Demolish (refund some materials)' });
      db.addEventListener('click', () => confirmDemolish(s, b));
      foot.appendChild(db);
      card.appendChild(foot);
      grid.appendChild(card);
    });
  }
  function confirmDemolish(s, b) {
    const D = CG.BLD[b.id];
    if (!s.settings.confirmDemolish) { CG.Construction.demolish(s, b.uid); renderActive(true); return; }
    modal({ title: '🗑 Demolish ' + D.name + '?', body: '<p>You will recover a portion of the materials. This cannot be undone.</p>', cls: 'sm',
      actions: [{ text: 'Cancel' }, { text: 'Demolish', cls: 'danger', fn: () => { CG.Construction.demolish(s, b.uid); renderActive(true); } }] });
  }
  function queueBox(s) {
    const box = el('div', { class: 'queue' });
    box.appendChild(el('div', { class: 'q-head small', html: '🚧 Build Queue (' + s.queue.length + ') — ' + ((Eco().cache(s).workersByJob['build'] || []).length) + ' builders' }));
    s.queue.forEach((q, i) => {
      const D = CG.BLD[q.bid]; const p = Math.floor(q.progress / q.total * 100);
      const row = el('div', { class: 'q-row' });
      row.innerHTML = '<span class="q-ic">' + D.icon + '</span><span class="q-n">' + D.name + (q.isUpgrade ? ' →L' + q.targetLevel : '') + '</span>' + bar(p) + '<span class="small">' + p + '%</span>';
      const x = el('button', { class: 'btn tiny ghost', text: '✕', 'data-tip': 'Cancel & refund' }); x.addEventListener('click', () => { CG.Construction.cancel(s, q.qid); renderActive(true); });
      row.appendChild(x); box.appendChild(row);
    });
    return box;
  }

  // ---------------- JOBS ----------------
  PANELS.jobs = {
    sig: (s) => 'j|' + s.survivors.map((x) => x.job).join(',') + '|' + s.buildings.map((b) => b.id + b.level).join(',') + '|' + Object.keys(s.tech.researched).length,
    render(host, s) {
      const c = Eco().cache(s);
      const idle = CG.Colony.idleCount(s);
      const head = sectionHead('Jobs & Production', idle + ' idle worker' + (idle !== 1 ? 's' : '') + ' — put them to work to grow your colony');
      const auto = el('button', { class: 'btn tiny primary', text: '✨ Auto-assign idle', 'data-tip': 'Spread all idle workers across useful jobs' });
      auto.disabled = !idle;
      auto.addEventListener('click', () => { if (CG.Colony.autoAssignIdle(s)) { snd('gather'); renderActive(true); } });
      head.appendChild(auto);
      host.appendChild(head);
      const groups = { gather: [], refine: [], research: [], build: [], service: [] };
      unlockedJobList(s).forEach((j) => { (groups[j.kind] || groups.service).push(j); });
      const titles = { gather: '🌿 Gathering', refine: '🏭 Refining', research: '🔬 Knowledge', build: '🔨 Construction', service: '🛎️ Services' };
      Object.keys(groups).forEach((k) => {
        if (!groups[k].length) return;
        host.appendChild(el('div', { class: 'jgroup-title', html: titles[k] }));
        const grid = el('div', { class: 'job-grid' });
        groups[k].forEach((j) => grid.appendChild(jobCard(s, j)));
        host.appendChild(grid);
      });
      // locked jobs with a clear "how to unlock" path (e.g. how to get wood)
      const locked = CG.JOBS.filter((j) => {
        if (c.unlockedJobs[j.id] || (j.kind !== 'gather' && j.kind !== 'refine')) return false;
        const b = jobProvider(j.id); if (!b) return false;
        return j.kind === 'gather' || CG.Construction.unlocked(s, b);
      });
      if (locked.length) {
        host.appendChild(el('div', { class: 'jgroup-title', html: "🔒 Locked jobs — here's how to unlock them" }));
        const grid = el('div', { class: 'job-grid' });
        locked.forEach((j) => grid.appendChild(lockedJobCard(s, j)));
        host.appendChild(grid);
      }
    },
    live(host, s) {
      CG.$$('.jcard', host).forEach((card) => {
        const job = card.dataset.job;
        const wc = card.querySelector('.jc-count'); if (wc) wc.textContent = CG.Colony.workersIn(s, job) + '/' + CG.Colony.slots(s, job);
        const out = card.querySelector('.jc-out'); if (out) out.innerHTML = jobOutputStr(s, job);
      });
    },
  };
  function jobCard(s, j) {
    const card = el('div', { class: 'jcard', 'data-job': j.id });
    const workers = CG.Colony.workersIn(s, j.id), slots = CG.Colony.slots(s, j.id);
    card.innerHTML = '<div class="jc-top"><span class="jc-ic">' + j.icon + '</span><span class="jc-name">' + j.name + '</span><span class="jc-count">' + workers + '/' + slots + '</span></div>' +
      '<div class="jc-desc small">' + j.desc + '</div>' +
      '<div class="jc-out small">' + jobOutputStr(s, j.id) + '</div>';
    const ctrl = el('div', { class: 'jc-ctrl' });
    const minus = el('button', { class: 'rbtn', text: '−', 'data-tip': 'Remove a worker' });
    const plus = el('button', { class: 'rbtn', text: '+', 'data-tip': 'Assign an idle worker' });
    minus.addEventListener('click', () => { if (CG.Colony.removeFromJob(s, j.id, 1)) { snd('click'); renderActive(true); } });
    plus.addEventListener('click', () => { if (CG.Colony.addToJob(s, j.id, 1)) { snd('gather'); renderActive(true); } else toast(CG.Colony.idleCount(s) ? 'No free slots — build more.' : 'No idle workers.', 'bad'); });
    ctrl.append(minus, plus);
    card.appendChild(ctrl);
    return card;
  }
  function jobProvider(jobId) { return CG.BUILDINGS.find((B) => ((B.provides || {}).stations || []).some((st) => st.job === jobId)); }
  function jobUnlockHint(s, jobId) {
    const b = jobProvider(jobId); if (!b) return 'Unlocked through research.';
    const req = b.requires || {}; const parts = [];
    const mr = (req.region || []).filter((r) => !s.regions.explored[r]).map((r) => CG.REGION[r] ? CG.REGION[r].icon + ' ' + CG.REGION[r].name : r);
    const mt = (req.tech || []).filter((t) => !s.tech.researched[t]).map((t) => CG.TECHById[t] ? CG.TECHById[t].name : t);
    if (mr.length) parts.push('🧭 Explore ' + mr.join(' & '));
    if (mt.length) parts.push('🔬 Research ' + mt.join(' & '));
    parts.push((parts.length ? 'then ' : '') + '🏗️ build ' + b.icon + ' ' + b.name);
    return parts.join(' → ');
  }
  function lockedJobCard(s, j) {
    const card = el('div', { class: 'jcard locked' });
    card.innerHTML = '<div class="jc-top"><span class="jc-ic">' + j.icon + '</span><span class="jc-name">' + j.name + '</span><span class="tag">🔒</span></div>' +
      '<div class="jc-desc small">' + j.desc + '</div>' +
      '<div class="jc-hint small">' + jobUnlockHint(s, j.id) + '</div>';
    return card;
  }
  function jobOutputStr(s, job) {
    const pv = Eco().jobPreview(s, job);
    const outs = Object.keys(pv.outputs).map((r) => '<span class="io out">' + CG.resIcon(r) + CG.fmtRate(pv.outputs[r]) + '</span>').join(' ');
    const ins = Object.keys(pv.inputs).map((r) => '<span class="io in">−' + CG.resIcon(r) + fmt(pv.inputs[r] * CG.C.DAY_SECONDS) + '/day</span>').join(' ');
    if (!outs && !ins) return '<span class="muted">Assign workers to produce</span>';
    return (ins ? ins + ' → ' : '') + (outs || '');
  }

  // ---------------- RESEARCH ----------------
  let researchCat = 'all';
  PANELS.research = {
    sig: (s) => 'r|' + researchCat + Object.keys(s.tech.researched).length + '|' + s.tech.current,
    render(host, s) {
      const head = sectionHead('Research', '');
      head.appendChild(el('div', { class: 'rp-balance', id: 'rpBal' }));
      host.appendChild(head);
      if (s.tech.current) host.appendChild(currentResearch(s));
      const cats = ['all', 'survival', 'agriculture', 'construction', 'crafting', 'industry', 'exploration', 'trade', 'education'];
      const filt = el('div', { class: 'filters' });
      cats.forEach((cat) => { const b = el('button', { class: 'fbtn' + (researchCat === cat ? ' on' : ''), text: cat === 'all' ? 'All' : CG.cap(cat) }); b.addEventListener('click', () => { researchCat = cat; snd('click'); renderActive(true); }); filt.appendChild(b); });
      host.appendChild(filt);
      const grid = el('div', { class: 'card-grid' });
      let list = CG.Research.visible(s);
      if (researchCat !== 'all') list = list.filter((t) => t.cat === researchCat);
      list.sort((a, b) => (CG.Research.canResearch(s, a) ? 0 : 1) - (CG.Research.canResearch(s, b) ? 0 : 1) || a.cost - b.cost);
      if (!list.length) grid.appendChild(el('div', { class: 'muted', text: 'All available technologies in this category are researched!' }));
      list.forEach((t) => grid.appendChild(techCard(s, t)));
      host.appendChild(grid);
      updateRP(s);
    },
    live(host, s) { updateRP(s); if (s.tech.current) { const i = $('#curBar i', host); if (i) { const t = CG.TECHById[s.tech.current]; i.style.width = CG.clamp(s.research / t.cost * 100, 0, 100) + '%'; const lab = $('#curEta'); if (lab) lab.textContent = etaText(s, t); } } },
  };
  function updateRP(s) { const b = $('#rpBal'); if (b) b.innerHTML = '<span class="chip">🔬 ' + fmt(s.research) + '</span><span class="small muted">+' + CG.fmt(Eco().researchRate(s) * CG.C.DAY_SECONDS) + '/day</span>'; }
  function currentResearch(s) {
    const t = CG.TECHById[s.tech.current];
    const box = el('div', { class: 'current-research' });
    box.innerHTML = '<div class="small">Researching</div><div class="cr-name">' + t.icon + ' ' + t.name + '</div>' +
      '<span class="bar" id="curBar"><i style="width:' + CG.clamp(s.research / t.cost * 100, 0, 100) + '%"></i></span>' +
      '<div class="small muted"><span id="curEta">' + etaText(s, t) + '</span></div>';
    return box;
  }
  function etaText(s, t) {
    const need = t.cost - s.research; if (need <= 0) return 'Ready!';
    const rate = Eco().researchRate(s); if (rate <= 0) return fmt(need) + ' RP needed — assign researchers';
    return fmt(need) + ' RP left · ~' + CG.fmtTime(need / rate);
  }
  function techCard(s, t) {
    const canNow = CG.Research.canResearch(s, t); const affordable = s.research >= t.cost;
    const card = el('div', { class: 'tcard cat-' + t.cat + (canNow ? '' : ' locked') });
    const reqTxt = (t.req || []).filter((r) => !s.tech.researched[r]).map((r) => CG.TECHById[r] ? CG.TECHById[r].name : r);
    const unlocks = []; if (t.unlocks.buildings) t.unlocks.buildings.forEach((b) => CG.BLD[b] && unlocks.push(CG.BLD[b].icon + CG.BLD[b].name));
    card.innerHTML = '<div class="tc-top"><span class="tc-ic">' + t.icon + '</span><div><div class="tc-name">' + t.name + '</div><div class="small muted">' + CG.cap(t.cat) + '</div></div><span class="tc-cost">🔬' + fmt(t.cost) + '</span></div>' +
      '<div class="small tc-desc">' + t.desc + '</div>' +
      '<div class="small tc-eff">' + effSummary(t.effects) + (unlocks.length ? '<div class="unlocks">🔓 ' + unlocks.join(', ') + '</div>' : '') + '</div>' +
      (reqTxt.length ? '<div class="small req">Requires: ' + reqTxt.join(', ') + '</div>' : '');
    const foot = el('div', { class: 'tc-foot' });
    if (canNow) {
      const b = el('button', { class: 'btn ' + (affordable ? '' : 'ghost'), text: affordable ? '✔ Research now' : '🎯 Focus' });
      b.addEventListener('click', () => { const r = affordable ? CG.Research.buyNow(s, t.id) : CG.Research.setFocus(s, t.id); if (r.ok) { snd('research'); renderActive(true); } else toast(r.why || '...', 'bad'); });
      foot.appendChild(b);
      if (s.tech.current === t.id) foot.appendChild(el('span', { class: 'tag', text: 'Focused' }));
    } else foot.appendChild(el('span', { class: 'tag', text: '🔒 Locked' }));
    card.appendChild(foot);
    return card;
  }

  // ---------------- EXPLORE ----------------
  const expSel = {}; // region -> set of sids
  PANELS.explore = {
    sig: (s) => 'e|' + Object.keys(s.regions.explored).length + '|' + s.regions.expeditions.length + '|' + CG.Exploration.toolsLevel(s),
    render(host, s) {
      host.appendChild(sectionHead('Explore the Island', 'Send idle survivors on expeditions to discover regions and gather resources'));
      const grid = el('div', { class: 'card-grid' });
      CG.Exploration.list(s).forEach((r) => grid.appendChild(regionCard(s, r)));
      host.appendChild(grid);
    },
    live(host, s) {
      CG.$$('.region-card .exp-prog i', host).forEach((i) => { const id = i.dataset.region; const ex = s.regions.expeditions.find((e) => e.region === id); if (ex) i.style.width = (ex.progress / ex.total * 100) + '%'; });
    },
  };
  function regionCard(s, r) {
    const R = r.def;
    const card = el('div', { class: 'region-card' + (r.explored ? ' done' : r.can ? '' : ' locked') });
    card.innerHTML = '<div class="rc-top"><span class="rc-ic">' + R.icon + '</span><div><div class="rc-name">' + R.name + (r.explored ? ' <span class="tag ok">Discovered</span>' : '') + '</div><div class="small muted">Distance ' + R.distance + ' · Risk ' + Math.round(R.risk * 100) + '%</div></div></div>' +
      '<div class="small rc-desc">' + R.desc + '</div>' +
      '<div class="small rc-res">Yields: ' + R.resources.map((x) => CG.resIcon(x)).join(' ') + (R.rare && R.rare.length ? ' · Rare: ' + R.rare.map((x) => CG.resIcon(x)).join(' ') : '') + '</div>';
    if (r.active) {
      const p = Math.floor(r.active.progress / r.active.total * 100);
      const pb = el('div', { html: '<div class="small">Expedition underway (' + r.active.explorers.length + ')</div><span class="bar exp-prog"><i data-region="' + R.id + '" style="width:' + p + '%"></i></span>' });
      card.appendChild(pb);
      const rc = el('button', { class: 'btn tiny ghost', text: 'Recall' }); rc.addEventListener('click', () => { CG.Exploration.recall(s, r.active.eid); renderActive(true); });
      card.appendChild(rc);
    } else if (r.can) {
      const idle = s.survivors.filter((sv) => !sv.job && !CG.Colony.onExp(s, sv.sid));
      const pick = el('div', { class: 'explorer-pick' });
      expSel[R.id] = expSel[R.id] || {};
      idle.forEach((sv) => {
        const on = !!expSel[R.id][sv.sid];
        const chipb = el('button', { class: 'pick' + (on ? ' on' : ''), html: (sv.isNamed ? CG.CHAR[sv.charId].icon : '🧑') + ' ' + sv.name });
        chipb.addEventListener('click', () => { expSel[R.id][sv.sid] = !expSel[R.id][sv.sid]; chipb.classList.toggle('on'); });
        pick.appendChild(chipb);
      });
      if (!idle.length) pick.appendChild(el('span', { class: 'muted small', text: 'No idle survivors — free someone from a job first.' }));
      card.appendChild(pick);
      const go = el('button', { class: 'btn', text: '🧭 Send Expedition · ' + CG.fmtTime(r.time) });
      go.addEventListener('click', () => {
        const sids = Object.keys(expSel[R.id]).filter((k) => expSel[R.id][k]);
        const res = CG.Exploration.start(s, R.id, sids); if (res.ok) { snd('explore'); expSel[R.id] = {}; renderActive(true); } else toast(res.why || 'Cannot explore', 'bad');
      });
      card.appendChild(go);
    } else {
      const need = (R.requires.region || []).filter((x) => !s.regions.explored[x]).map((x) => CG.REGION[x].name);
      card.appendChild(el('div', { class: 'small req', html: '🔒 ' + (need.length ? 'Explore ' + need.join(', ') + ' first' : 'Requires better tools') + (R.requires.tools ? ' · needs tool tier ' + R.requires.tools : '') }));
    }
    return card;
  }

  // ---------------- TRADE ----------------
  PANELS.trade = {
    sig: (s) => 't|' + CG.Trade.hasMarket(s) + '|' + s.buildings.length + Object.keys(s.tech.researched).length,
    render(host, s) {
      host.appendChild(sectionHead('Trade', 'Sell surplus for coin · buy what you lack · recruit settlers'));
      if (!CG.Trade.hasMarket(s)) { host.appendChild(el('div', { class: 'empty', html: '⚖️ Build a <b>Market</b> (research <b>Trade</b>) to begin trading with passing ships.' })); return; }
      const top = el('div', { class: 'trade-top' });
      top.innerHTML = '<span class="chip big">🪙 ' + fmt(s.coin) + ' coin</span>';
      const rec = el('button', { class: 'btn', text: '🧑 Recruit settler · 🪙' + CG.Trade.recruitCost(s) });
      rec.disabled = !CG.Trade.canRecruit(s); rec.setAttribute('data-tip', 'Costs coin & needs a free bed');
      rec.addEventListener('click', () => { const r = CG.Trade.recruit(s); if (r.ok) { snd('coin'); renderActive(true); } else toast(r.why, 'bad'); });
      top.appendChild(rec);
      // taxation
      const tax = el('div', { class: 'tax-box' });
      tax.appendChild(el('span', { class: 'small', html: '🏛️ Tax citizens:' }));
      [['Off', 0], ['Low', 0.4], ['Med', 0.8], ['High', 1.2]].forEach(([l, v]) => { const b = el('button', { class: 'seg-b' + (s.taxRate === v ? ' on' : ''), text: l }); b.addEventListener('click', () => { s.taxRate = v; snd('click'); renderActive(true); }); tax.appendChild(b); });
      const income = Math.round(s.survivors.length * CG.C.TAX.perCitizen * s.taxRate);
      tax.appendChild(el('span', { class: 'small muted', html: '≈🪙' + income + '/day' + (s.taxRate > CG.C.TAX.moraleFreeRate ? ' · ⚠️ angers people' : '') }));
      top.appendChild(tax);
      host.appendChild(top);

      const tbl = el('div', { class: 'trade-tbl' });
      tbl.appendChild(el('div', { class: 'tt-head small', html: '<span>Resource</span><span>Have</span><span>Sell @</span><span>Sell</span><span>Buy @</span><span>Buy</span>' }));
      CG.RESOURCES.filter((r) => CG.Trade.tradable(r.id)).forEach((r) => tbl.appendChild(tradeRow(s, r.id)));
      host.appendChild(tbl);
    },
    live(host, s) { const c = $('.trade-top .chip.big', host); if (c) c.textContent = '🪙 ' + fmt(s.coin) + ' coin'; CG.$$('.tr-have', host).forEach((e) => { e.textContent = fmt(Eco().amountOf(s, e.dataset.res)); }); },
  };
  function tradeRow(s, res) {
    const row = el('div', { class: 'tr' });
    const sp = CG.Trade.sellPrice(s, res), bp = CG.Trade.buyPrice(s, res);
    row.innerHTML = '<span class="tr-n">' + CG.resIcon(res) + ' ' + CG.resName(res) + '</span><span class="tr-have" data-res="' + res + '">' + fmt(Eco().amountOf(s, res)) + '</span><span class="tr-p">🪙' + sp + '</span>';
    const sellBox = el('span', { class: 'tr-act' });
    [['1', 1], ['10', 10], ['Max', 'max']].forEach(([l, q]) => { const b = el('button', { class: 'btn tiny', text: l }); b.addEventListener('click', () => { const qty = q === 'max' ? Math.floor(Eco().amountOf(s, res)) : q; const r = CG.Trade.sell(s, res, qty); if (r.ok) { snd('coin'); renderActive(true); } else toast(r.why, 'bad'); }); sellBox.appendChild(b); });
    row.appendChild(sellBox);
    const stock = CG.Trade.stockOf(s, res);
    row.appendChild(el('span', { class: 'tr-p', html: stock <= 0 ? '<span class="oos">Out of stock</span>' : '🪙' + bp + ' <span class="muted">·📦' + stock + '</span>' }));
    const buyBox = el('span', { class: 'tr-act' });
    [['1', 1], ['10', 10]].forEach(([l, q]) => { const b = el('button', { class: 'btn tiny ghost', text: '+' + l }); b.disabled = stock <= 0; b.addEventListener('click', () => { const r = CG.Trade.buy(s, res, q); if (r.ok) { snd('coin'); renderActive(true); } else toast(r.why, 'bad'); }); buyBox.appendChild(b); });
    row.appendChild(buyBox);
    return row;
  }

  // ---------------- QUESTS ----------------
  let questLine = 'all';
  PANELS.quests = {
    sig: (s) => 'q|' + questLine + s.quests.active.join(',') + '|' + s.stats.questsCompleted,
    render(host, s) {
      host.appendChild(sectionHead('Quests', s.stats.questsCompleted + ' completed · ' + s.quests.active.length + ' active'));
      const lines = ['all', 'main', 'milestone', 'robin', 'lenni', 'leif', 'erim', 'explore', 'hidden'];
      const filt = el('div', { class: 'filters' });
      lines.forEach((l) => { const b = el('button', { class: 'fbtn' + (questLine === l ? ' on' : ''), text: l === 'all' ? 'All' : CG.cap(l) }); b.addEventListener('click', () => { questLine = l; snd('click'); renderActive(true); }); filt.appendChild(b); });
      host.appendChild(filt);
      const list = el('div', { class: 'quest-list' });
      let active = s.quests.active.map((id) => (CG.QUESTS || []).find((q) => q.id === id)).filter(Boolean);
      if (questLine !== 'all') active = active.filter((q) => q.line === questLine);
      if (!active.length) list.appendChild(el('div', { class: 'muted', text: 'No active quests here right now — keep building and exploring!' }));
      active.forEach((q) => list.appendChild(questCard(s, q)));
      // completed (collapsed)
      const comp = (CG.QUESTS || []).filter((q) => s.quests.completed[q.id] && (questLine === 'all' || q.line === questLine));
      if (comp.length) { const d = el('details', { class: 'done-quests' }); d.appendChild(el('summary', { text: '✅ Completed (' + comp.length + ')' })); comp.forEach((q) => d.appendChild(el('div', { class: 'qc done small', html: '✅ ' + (q.icon || '') + ' ' + q.name }))); list.appendChild(d); }
      host.appendChild(list);
    },
    live(host, s) {
      CG.$$('.qc.active', host).forEach((card) => { const q = (CG.QUESTS || []).find((x) => x.id === card.dataset.qid); if (!q) return; const pr = CG.Quests.progress(s, q); pr.objs.forEach((o, i) => { const bx = card.querySelectorAll('.obj')[i]; if (bx) { const bi = bx.querySelector('.bar i'); if (bi) bi.style.width = CG.clamp(o.cur / o.target * 100, 0, 100) + '%'; const cv = bx.querySelector('.ov'); if (cv) cv.textContent = fmt(Math.min(o.cur, o.target)) + '/' + fmt(o.target); bx.classList.toggle('met', o.done); } }); });
    },
  };
  function questCard(s, q) {
    const pr = CG.Quests.progress(s, q);
    const card = el('div', { class: 'qc active line-' + q.line, 'data-qid': q.id });
    card.innerHTML = '<div class="qc-h"><span class="qc-ic">' + (q.icon || '🎯') + '</span><div><div class="qc-name">' + q.name + ' <span class="qline">' + CG.cap(q.line) + '</span></div><div class="small muted">' + q.desc + '</div></div></div>';
    const objs = el('div', { class: 'qc-objs' });
    pr.objs.forEach((o) => objs.appendChild(el('div', { class: 'obj' + (o.done ? ' met' : ''), html: '<span class="obx">' + (o.done ? '✔' : '☐') + '</span><span class="ol">' + o.label + '</span>' + bar(o.cur / o.target * 100) + '<span class="ov">' + fmt(Math.min(o.cur, o.target)) + '/' + fmt(o.target) + '</span>' })));
    card.appendChild(objs);
    if (q.reward_text) card.appendChild(el('div', { class: 'qc-rew small', html: '🎁 ' + q.reward_text }));
    return card;
  }

  // ---------------- CHARACTERS ----------------
  let heroSel = 'robin';
  PANELS.characters = {
    sig: (s) => 'h|' + heroSel + s.survivors.filter((x) => x.charId).map((x) => x.charId + x.level + Object.keys(x.skills).length).join(','),
    render(host, s) {
      const tabs = el('div', { class: 'hero-tabs' });
      CG.CHARS.forEach((ch) => { const sv = CG.State.namedSurvivor(s, ch.id); const b = el('button', { class: 'hero-tab' + (heroSel === ch.id ? ' on' : '') }); b.appendChild(CG.Render.avatar(ch.id, { size: 'av-sm' })); b.appendChild(el('span', { html: ch.name + (sv && sv.skillPoints ? ' <span class="sp">+' + sv.skillPoints + '</span>' : '') })); b.addEventListener('click', () => { heroSel = ch.id; snd('click'); renderActive(true); }); tabs.appendChild(b); });
      host.appendChild(tabs);
      const ch = CG.CHAR[heroSel]; const sv = CG.State.namedSurvivor(s, heroSel); if (!sv) return;
      const head = el('div', { class: 'hero-head' });
      const big = CG.Render.avatar(ch.id, { size: 'av-xl' });
      head.appendChild(big);
      head.appendChild(el('div', { class: 'hero-meta', html: '<div class="hh-name">' + ch.name + '</div><div class="hh-role">' + ch.role + '</div>' +
        '<div class="small muted">' + ch.blurb + '</div>' +
        '<div class="hh-lvl">Level ' + sv.level + ' · <span class="bar mini inline"><i style="width:' + (sv.level >= CG.C.XP.maxLevel ? 100 : sv.xp / sv.xpNext * 100) + '%"></i></span> · ' + (sv.skillPoints ? '<b class="sp">' + sv.skillPoints + ' skill point' + (sv.skillPoints > 1 ? 's' : '') + '</b>' : 'No skill points') + '</div>' +
        '<div class="small">Currently: ' + (sv.job ? CG.jobName(sv.job) : (CG.Colony.onExp(s, sv.sid) ? 'On expedition' : 'Idle')) + ' · Favors ' + CG.jobName(ch.favJob) + '</div>' }));
      host.appendChild(head);
      // bonuses summary
      const eff = CG.charEffects(ch, sv.level, sv.skills);
      host.appendChild(el('div', { class: 'hero-bonus', html: '<b>Active bonuses:</b> ' + (eff.map(describeEffect).filter(Boolean).join(' · ') || 'none yet') }));
      // skill tree
      host.appendChild(el('div', { class: 'jgroup-title', html: '⭐ Skill Tree' }));
      const tree = el('div', { class: 'skill-tree' });
      ch.skills.forEach((node) => tree.appendChild(skillNode(s, ch, sv, node)));
      host.appendChild(tree);
    },
    live(host, s) { const i = $('.hh-lvl .bar i', host); const sv = CG.State.namedSurvivor(s, heroSel); if (i && sv) i.style.width = (sv.level >= CG.C.XP.maxLevel ? 100 : sv.xp / sv.xpNext * 100) + '%'; },
  };
  function skillNode(s, ch, sv, node) {
    const owned = !!sv.skills[node.id]; const can = CG.Colony.canSpend(s, ch.id, node.id);
    const reqMet = (node.req || []).every((r) => sv.skills[r]);
    const n = el('div', { class: 'snode' + (owned ? ' owned' : can ? ' can' : reqMet ? '' : ' locked') });
    n.innerHTML = '<div class="sn-top"><span class="sn-ic">' + node.icon + '</span><span class="sn-name">' + node.name + '</span><span class="sn-cost">' + node.cost + 'sp</span></div><div class="small">' + node.desc + '</div>' +
      (node.req && node.req.length ? '<div class="small req">After: ' + node.req.map((r) => ch.skills.find((x) => x.id === r).name).join(', ') + '</div>' : '');
    if (owned) n.appendChild(el('span', { class: 'tag ok', text: '✔ Learned' }));
    else { const b = el('button', { class: 'btn tiny', text: 'Learn' }); b.disabled = !can; b.addEventListener('click', () => { const r = CG.Colony.spendSkill(s, ch.id, node.id); if (r.ok) renderActive(true); else toast(r.why || 'Cannot learn yet', 'bad'); }); n.appendChild(b); }
    return n;
  }

  // ---------------- ACHIEVEMENTS ----------------
  let achCat = 'all';
  PANELS.achievements = {
    sig: (s) => 'a|' + achCat + s.stats.achievementsUnlocked,
    render(host, s) {
      const total = (CG.ACHIEVEMENTS || []).length;
      host.appendChild(sectionHead('Achievements', CG.Achievements.count(s) + ' / ' + total + ' unlocked · ' + CG.Achievements.totalPoints(s) + ' pts'));
      const cats = ['all', 'progress', 'explore', 'economy', 'character', 'survival', 'challenge', 'funny', 'secret'];
      const filt = el('div', { class: 'filters' });
      cats.forEach((cat) => { const b = el('button', { class: 'fbtn' + (achCat === cat ? ' on' : ''), text: cat === 'all' ? 'All' : CG.cap(cat) }); b.addEventListener('click', () => { achCat = cat; snd('click'); renderActive(true); }); filt.appendChild(b); });
      host.appendChild(filt);
      const grid = el('div', { class: 'ach-grid' });
      let list = (CG.ACHIEVEMENTS || []); if (achCat !== 'all') list = list.filter((a) => a.category === achCat);
      list.forEach((a) => {
        const got = !!s.achievements.unlocked[a.id]; const hidden = a.secret && !got;
        const c = el('div', { class: 'ach' + (got ? ' got' : '') + (hidden ? ' secret' : ''), 'data-tip': hidden ? 'Secret achievement — keep playing to discover it' : ('<b>' + a.name + '</b><br>' + a.desc + '<br>' + a.points + ' pts') });
        c.innerHTML = '<span class="ach-ic">' + (hidden ? '❓' : a.icon) + '</span><span class="ach-n">' + (hidden ? '???' : a.name) + '</span><span class="ach-p small">' + a.points + 'p</span>';
        grid.appendChild(c);
      });
      host.appendChild(grid);
    },
  };

  // ---------------- LOG ----------------
  // ---------------- INVENTORY / STORAGE ----------------
  let invPrev = null, invPrevT = 0; const invRate = {};
  PANELS.inventory = {
    sig: (s) => 'inv|' + CG.RESOURCES.filter((r) => !r.nocap && (s.resources[r.id] || 0) > 0).length + '|' + s.buildings.length,
    render(host, s) {
      const c = Eco().cache(s); const pop = s.survivors.length;
      const waterUse = pop * CG.C.NEEDS.thirstPerDay * (c.needMult.thirst || 1) / 30;
      const foodUse = pop * CG.C.NEEDS.hungerPerDay * (c.needMult.hunger || 1) / 26;
      host.appendChild(sectionHead('Storage & Inventory', 'Everything your colony holds, with live per-day rates'));
      host.appendChild(el('div', { class: 'inv-usage', html: '👥 ' + pop + ' colonists · 💧 Water used ≈ <b>' + fmt(waterUse) + '/day</b> · 🍽️ Food used ≈ <b>' + fmt(foodUse) + '/day</b>' }));
      [['natural', '🌿 Natural'], ['advanced', '🏭 Advanced'], ['luxury', '💎 Luxury'], ['abstract', '💠 Other']].forEach(([cat, title]) => {
        const list = CG.RESOURCES.filter((r) => r.cat === cat); if (!list.length) return;
        host.appendChild(el('div', { class: 'jgroup-title', html: title }));
        const grid = el('div', { class: 'inv-grid' });
        list.forEach((r) => grid.appendChild(invRow(s, r, c)));
        host.appendChild(grid);
      });
    },
    live(host, s) {
      const c = Eco().cache(s);
      const now = performance.now(); const dt = (now - invPrevT) / 1000; invPrevT = now; const can = dt > 0 && dt < 1;
      CG.$$('.inv-cell', host).forEach((cell) => {
        const r = cell.dataset.res; const cur = Eco().amountOf(s, r);
        if (can) { let per; if (r === 'research') per = Eco().researchRate(s); else { const prev = invPrev ? (invPrev[r] || 0) : cur; per = (cur - prev) / dt; } invRate[r] = invRate[r] == null ? per : invRate[r] * 0.8 + per * 0.2; }
        const cap = CG.RES[r].nocap ? null : c.cap[r];
        const h = cell.querySelector('.iv-have'); if (h) { h.textContent = fmt(cur) + (cap != null ? ' / ' + fmt(cap) : ''); h.classList.toggle('full', cap != null && cur >= cap - 0.5); }
        const rc = cell.querySelector('.iv-rate'); const pd = (invRate[r] || 0) * CG.C.DAY_SECONDS;
        if (rc) { rc.textContent = Math.abs(pd) < 0.05 ? '—' : (pd >= 0 ? '+' : '') + fmt(pd) + '/day'; rc.className = 'iv-rate small ' + (pd > 0.05 ? 'up' : pd < -0.05 ? 'dn' : ''); }
      });
      invPrev = Object.assign({}, s.resources); invPrev.research = s.research; invPrev.coin = s.coin;
    },
  };
  function invRow(s, r, c) {
    const cur = Eco().amountOf(s, r.id); const cap = r.nocap ? null : c.cap[r.id];
    const cell = el('div', { class: 'inv-cell', dataset: { res: r.id }, 'data-tip': '<b>' + r.name + '</b>' + (r.value ? '<br>Trade value: ' + r.value : '') });
    cell.innerHTML = '<span class="iv-ic">' + r.icon + '</span><span class="iv-n">' + r.name + '</span>' +
      '<span class="iv-right"><span class="iv-have">' + fmt(cur) + (cap != null ? ' / ' + fmt(cap) : '') + '</span><span class="iv-rate small">—</span></span>';
    return cell;
  }

  PANELS.log = {
    sig: (s) => 'l|' + (s.log[0] ? s.log[0].t : 0) + s.log.length,
    render(host, s) {
      host.appendChild(sectionHead('Colony Log', ''));
      const box = el('div', { class: 'full-log' });
      s.log.forEach((l) => box.appendChild(el('div', { class: 'lg lg-' + l.type, html: '<span class="lg-d">Day ' + l.day + '</span> ' + l.text })));
      if (!s.log.length) box.appendChild(el('div', { class: 'muted', text: 'Nothing yet.' }));
      host.appendChild(box);
    },
  };

  function sectionHead(title, sub) { const h = el('div', { class: 'section-head' }); h.innerHTML = '<div><h2>' + title + '</h2>' + (sub ? '<div class="small muted">' + sub + '</div>' : '') + '</div>'; return h; }

  // ============================================================ MENUS & MODALS
  function openMenu() {
    const body = el('div', { class: 'menu-list' });
    const items = [
      ['▶ Resume', () => { }],
      ['💾 Save Game', () => saveLoad('save')],
      ['📂 Load Game', () => saveLoad('load')],
      ['⚙️ Settings', () => settingsModal()],
      ['📤 Export / Import', () => exportImport()],
      ['❓ How to Play', () => welcome(true)],
      ['🆕 New Game', () => newGameConfirm()],
    ];
    items.forEach(([t, fn]) => { const b = el('button', { class: 'menu-item', text: t }); b.addEventListener('click', () => { snd('click'); m.close(); fn(); }); body.appendChild(b); });
    const m = modal({ title: '☰ Menu', body, cls: 'sm' });
  }

  function saveLoad(mode) {
    const body = el('div', { class: 'slots' });
    CG.Save.allMeta().forEach((meta, i) => {
      const slot = CG.Save.SLOTS[i];
      const row = el('div', { class: 'slot' });
      const label = slot === 'auto' ? 'Autosave' : 'Slot ' + i;
      if (meta) row.innerHTML = '<div><b>' + label + '</b> — ' + meta.stageName + '<div class="small muted">Day ' + meta.day + ' · 👥' + meta.pop + ' · ' + CG.fmtTime(meta.playtime) + (meta.victory ? ' · 🏆' : '') + '<br>' + new Date(meta.savedAt).toLocaleString() + '</div></div>';
      else row.innerHTML = '<div><b>' + label + '</b><div class="small muted">— empty —</div></div>';
      const act = el('div', { class: 'slot-act' });
      if (mode === 'save' && slot !== 'auto') { const b = el('button', { class: 'btn tiny', text: 'Save' }); b.addEventListener('click', () => { CG.Save.save(S(), slot); toast('Saved to ' + label, 'good'); m.close(); }); act.appendChild(b); }
      if (mode === 'load' && meta) { const b = el('button', { class: 'btn tiny', text: 'Load' }); b.addEventListener('click', () => { const st = CG.Save.load(slot); if (st) { CG.Engine.bind(st); toast('Loaded ' + label, 'good'); m.close(); switchTab('overview'); } }); act.appendChild(b); }
      if (meta && slot !== 'auto') { const d = el('button', { class: 'btn tiny ghost', text: '🗑' }); d.addEventListener('click', () => { CG.Save.remove(slot); m.close(); saveLoad(mode); }); act.appendChild(d); }
      row.appendChild(act); body.appendChild(row);
    });
    const m = modal({ title: mode === 'save' ? '💾 Save Game' : '📂 Load Game', body, actions: [{ text: 'Close' }] });
  }

  function settingsModal() {
    const s = S(); const body = el('div', { class: 'settings' });
    const add = (label, node) => { const r = el('div', { class: 'set-row' }); r.appendChild(el('span', { text: label })); r.appendChild(node); body.appendChild(r); };
    const toggle = (key, on) => { const b = el('button', { class: 'toggle' + (on ? ' on' : ''), text: on ? 'On' : 'Off' }); b.addEventListener('click', () => { s.settings[key] = !s.settings[key]; b.classList.toggle('on'); b.textContent = s.settings[key] ? 'On' : 'Off'; applySettings(); }); return b; };
    add('Sound effects & ambience', toggle('sound', s.settings.sound));
    add('Music', toggle('music', s.settings.music));
    const vol = el('input', { type: 'range', min: 0, max: 100, value: Math.round(s.settings.volume * 100) }); vol.addEventListener('input', () => { s.settings.volume = vol.value / 100; applySettings(); }); add('Volume', vol);
    add('Show production rates', toggle('showRates', s.settings.showRates));
    add('Confirm demolish', toggle('confirmDemolish', s.settings.confirmDemolish));
    add('Reduce motion', toggle('reduceMotion', s.settings.reduceMotion));
    modal({ title: '⚙️ Settings', body, actions: [{ text: 'Done' }] });
  }
  function applySettings() { const s = S(); CG.Audio.applySettings(s.settings); CG.Save.saveSettings(s.settings); document.body.classList.toggle('reduce-motion', s.settings.reduceMotion); }

  function exportImport() {
    const s = S(); const body = el('div');
    const ta = el('textarea', { class: 'save-text', readonly: 'true' }); ta.value = CG.Save.exportSave(s);
    body.appendChild(el('div', { class: 'small muted', text: 'Copy this code to back up your colony, or paste one in and Import.' }));
    body.appendChild(ta);
    const imp = el('textarea', { class: 'save-text', placeholder: 'Paste a save code here…' });
    body.appendChild(imp);
    modal({ title: '📤 Export / Import', body, actions: [
      { text: 'Copy', keep: true, fn: () => { ta.select(); try { document.execCommand('copy'); toast('Copied!', 'good'); } catch (e) {} } },
      { text: 'Import', cls: 'danger', fn: () => { const st = CG.Save.importSave(imp.value); if (st) { CG.Engine.bind(st); toast('Save imported!', 'good'); switchTab('overview'); } else toast('Invalid save code', 'bad'); } },
      { text: 'Close' },
    ] });
  }

  function newGameConfirm() {
    modal({ title: '🆕 New Game', body: '<p>Start a fresh shipwreck? Your current colony autosaves to the Autosave slot.</p>', cls: 'sm',
      actions: [{ text: 'Cancel' }, { text: 'New Game', cls: 'danger', fn: () => { CG.Save.save(S(), 'auto'); const st = CG.State.newGame(); CG.Engine.bind(st); switchTab('overview'); chooseFaction(); } }] });
  }

  // event modal
  function eventModal(ev) {
    const s = S();
    const body = el('div', { class: 'event-body' });
    body.innerHTML = '<div class="ev-ic">' + ev.icon + '</div><p class="ev-desc">' + ev.desc + '</p>';
    const acts = el('div', { class: 'ev-choices' });
    ev.choices.forEach((ch, i) => {
      const b = el('button', { class: 'ev-choice' });
      const can = !ch.cost || Eco().canAfford(s, ch.cost);
      b.innerHTML = '<div class="ec-text">' + ch.text + '</div>' + (ch.cost ? '<div class="small ec-cost">' + costStr(s, ch.cost) + '</div>' : '') + (ch.tooltip ? '<div class="small muted">' + ch.tooltip + '</div>' : '');
      if (!can) b.classList.add('cant');
      b.addEventListener('click', () => { const r = CG.Events.chooseOption(s, i); if (r && r.ok) { snd('click'); m.close(); if (r.result) toast(r.result, 'info', ev.icon); } else if (r && !r.ok) toast('You cannot afford that.', 'bad'); });
      acts.appendChild(b);
    });
    body.appendChild(acts);
    const m = modal({ title: ev.icon + ' ' + ev.name, body, cls: 'event ev-' + ev.category, dismiss: false });
  }

  // victory
  function victoryModal() {
    const s = S(); const st = s.stats;
    const body = el('div', { class: 'victory' });
    body.innerHTML = '<div class="vic-ic">🏝️🎉</div><p>The <b>Grand Monument</b> rises over a thriving island town. From four desperate castaways, you built a home.</p>' +
      '<div class="vic-stats">' +
      vstat('Days survived', st.days) + vstat('Population', s.survivors.length) + vstat('Peak population', st.peakPopulation) +
      vstat('Buildings built', st.buildingsBuilt) + vstat('Technologies', st.techResearched) + vstat('Regions explored', st.regionsExplored) +
      vstat('Quests completed', st.questsCompleted) + vstat('Achievements', CG.Achievements.count(s) + '/' + (CG.ACHIEVEMENTS || []).length) +
      vstat('Settlers welcomed', st.settlersArrived) + vstat('Play time', CG.fmtTime(st.playtime)) +
      '</div>';
    modal({ title: '🏆 Victory — Prosperous Island!', body, cls: 'big', dismiss: false,
      actions: [{ text: '🏖️ Continue in Sandbox', cls: 'primary', fn: () => { s.sandbox = true; toast('Sandbox mode — keep building your paradise!', 'good'); } }] });
    snd('victory');
  }
  function vstat(l, v) { return '<div class="vs"><span class="vs-v">' + v + '</span><span class="vs-l small">' + l + '</span></div>'; }

  // welcome / how to play
  function welcome(returning) {
    const body = el('div', { class: 'welcome' });
    body.innerHTML =
      '<p>' + (returning ? '' : 'Six survivors — <b>Robin</b>, <b>Lenni</b>, <b>Leif</b>, <b>Erim</b>, <b>Jovan</b> and <b>Leonidas</b> — wash ashore after a shipwreck. ') +
      'Your task: turn a desperate beach camp into a thriving island colony.</p>' +
      '<div class="how-grid">' +
      howItem('🧰', 'Assign Jobs', 'Send survivors to gather food, water and materials. Idle hands get nothing done.') +
      howItem('🏗️', 'Build', 'Raise shelters, storage and workshops. Everything is built by your <b>Builders</b>.') +
      howItem('🔬', 'Research', 'Assign a Researcher to unlock new buildings, jobs and upgrades.') +
      howItem('🧭', 'Explore', 'Send expeditions to discover regions rich in new resources.') +
      howItem('🎯', 'Follow Quests', 'Quests guide you and reward progress. Always check your next objective.') +
      howItem('⚖️', 'Thrive', 'Keep people fed, watered and happy. Grow your population and prosper.') +
      '</div>' +
      '<p class="small muted">Tip: use the speed controls (top-right) to fast-forward. The game autosaves. Your first goal: build a <b>Campfire</b>.</p>';
    modal({ title: returning ? '❓ How to Play' : '🏝️ Welcome to Castaway', body, cls: 'big', actions: [{ text: returning ? 'Got it' : "Let's survive!", cls: 'primary' }] });
  }
  function howItem(ic, t, d) { return '<div class="how"><span class="how-ic">' + ic + '</span><div><b>' + t + '</b><div class="small">' + d + '</div></div></div>'; }

  // building detail (scene click)
  function buildingDetail(uid) {
    const s = S(); const b = CG.State.buildingById(s, uid); if (!b) return; const D = CG.BLD[b.id];
    const body = el('div');
    body.innerHTML = '<div class="bd-top"><span class="bd-ic">' + D.icon + '</span><div><b>' + D.name + '</b> — Level ' + b.level + '/' + D.maxLevel + '<div class="small muted">' + D.desc + '</div></div></div>' +
      '<div class="small">' + providesSummary(D).map((x) => '<span class="prov">' + x + '</span>').join('') + '</div>';
    const acts = [{ text: 'Close' }];
    if (b.level < D.maxLevel) { const uc = CG.Construction.upgradeCost(s, b); acts.unshift({ text: '⬆ Upgrade (' + Object.keys(uc).map((k) => CG.resIcon(k) + uc[k]).join(' ') + ')', cls: 'primary', fn: () => { const r = CG.Construction.upgrade(s, b.uid); if (!r.ok) toast(r.why, 'bad'); else snd('build'); } }); }
    acts.push({ text: '🗑 Demolish', cls: 'danger', fn: () => confirmDemolish(s, b) });
    modal({ title: 'Building', body, cls: 'sm', actions: acts });
  }

  // hint bar (next main objective)
  function updateHint() {
    const s = S(); if (!hintEl) return;
    const main = s.quests.active.map((id) => (CG.QUESTS || []).find((q) => q.id === id)).filter((q) => q && q.line === 'main')[0]
      || s.quests.active.map((id) => (CG.QUESTS || []).find((q) => q.id === id)).filter(Boolean)[0];
    if (!main) { hintEl.style.display = 'none'; return; }
    const pr = CG.Quests.progress(s, main);
    const next = pr.objs.find((o) => !o.done) || pr.objs[0];
    hintEl.style.display = 'flex';
    hintEl.innerHTML = '<span class="hint-ic">🎯</span><span class="hint-t"><b>' + main.name + '</b> — ' + (next ? next.label : '') + '</span>';
    hintEl.onclick = () => switchTab('quests');
  }

  // ============================================================ BOOT
  function boot() {
    rootEl = el('div', { class: 'game' });
    headerEl = el('header', { class: 'header' });
    hintEl = el('div', { class: 'hint-bar' });
    const main = el('div', { class: 'main' });
    railEl = el('nav', { class: 'rail' });
    contentEl = el('div', { class: 'content' });
    main.append(railEl, contentEl);
    toastEl = el('div', { class: 'toasts' });
    modalRoot = el('div', { class: 'modal-root' });
    rootEl.append(headerEl, hintEl, main, toastEl, modalRoot);
    document.body.appendChild(rootEl);

    initTips();
    buildHeader(); buildRail();
    CG.Render.probeImages();
    switchTab('overview');

    // wire system events to UI
    const rebuild = () => { panelState[activeTab] = null; };
    ['buildings_changed', 'queue_changed', 'assign_changed', 'research_changed', 'explore_changed', 'population_changed',
      'quests_changed', 'achievement', 'char_changed', 'char_levelup', 'levelup', 'region_explored', 'trade_done', 'log', 'resources_changed']
      .forEach((evt) => CG.on(evt, rebuild));
    CG.on('toast', (p) => toast(p.text, p.type, p.icon));
    CG.on('event_modal', (p) => eventModal(p.event));
    CG.on('victory', () => victoryModal());
    CG.on('select_building', (p) => buildingDetail(p.uid));
    CG.on('avatar_ready', () => { panelState[activeTab] = null; });
    CG.on('quests_changed', updateHint);
    CG.on('render', () => { updateHeader(); renderActive(false); updateBadges(); updateHint(); });
    CG.on('new_day', () => { panelState.overview = null; });

    updateHint();
  }

  function updateBadges() {
    const s = S();
    setBadge('quests', s.quests.active.length || '');
    const sp = s.survivors.reduce((a, x) => a + (x.skillPoints || 0), 0);
    setBadge('characters', sp || '');
    const idle = CG.Colony.idleCount(s);
    setBadge('jobs', idle || '');
  }

  function chooseFaction() {
    const body = el('div', { class: 'fac-grid' });
    Object.keys(CG.FACTIONS).forEach((id) => {
      const f = CG.FACTIONS[id];
      const b = el('button', { class: 'fac-card' });
      b.innerHTML = '<div class="fac-ic">' + f.icon + '</div><b>' + f.name + '</b><div class="small">' + f.desc + '</div>';
      b.addEventListener('click', () => { S().faction = id; CG.Economy.recompute(S()); snd('complete'); m.close(); toast('You are ' + f.name + '!', 'good', f.icon); switchTab('overview'); welcome(false); });
      body.appendChild(b);
    });
    const m = modal({ title: '🏴 Choose your people', body, cls: 'big', dismiss: false });
  }

  CG.UI = { boot, toast, modal, welcome, switchTab, applySettings, chooseFaction };
})(typeof window !== 'undefined' ? window : globalThis);
