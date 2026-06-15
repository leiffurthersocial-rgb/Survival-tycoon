/* systems/trade.js — balanced market: capped prices, limited & fluctuating stock.
 * Each resource has a price modifier that rises when players buy a lot and falls when
 * they sell a lot, then drifts back to normal over a few days. Buyable stock is limited
 * (and some non-essential goods go out of stock), so the market can't be exploited. */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const C = CG.C, E = () => CG.Economy;

  const ESSENTIAL = { water: 1, fish: 1, fruit: 1, wood: 1, fiber: 1, sticks: 1, stone: 1 };
  const PRICE_CAP = 2.0; // hard cap on the trade-price multiplier so sells stay reasonable

  function hasMarket(s) { return !!E().cache(s).unlockedJobs.trade; }
  function priceFactor(s) {
    const c = E().cache(s); const merchants = (c.workersByJob['trade'] || []).length;
    return Math.min(PRICE_CAP, c.mult.trade_price * (1 + 0.04 * merchants));
  }
  function mod(s, r) { return (s.market.mod && s.market.mod[r]) || 1; }

  function baseStock(id) { const R = CG.RES[id]; if (R.cat === 'luxury') return 2; if (R.tier >= 5) return 4; if (R.tier >= 3) return 10; if (R.cat === 'advanced') return 14; return 40; }
  function restock(s) {
    const st = {};
    CG.RESOURCES.forEach((R) => { if (R.nocap || R.cat === 'abstract') return; let q = baseStock(R.id); if (!ESSENTIAL[R.id] && CG.RNG.chance(0.15)) q = 0; st[R.id] = q; });
    s.market.stock = st;
  }
  function ensureDay(s) {
    if (!s.market) s.market = { mod: {}, stock: {}, day: s.time.day };
    const d = s.time.day, last = s.market.day || d;
    if (d > last) {
      const days = d - last; s.market.day = d;
      const m = s.market.mod || (s.market.mod = {});
      for (const r in m) { m[r] = m[r] + (1 - m[r]) * Math.min(1, 0.25 * days); if (Math.abs(m[r] - 1) < 0.02) delete m[r]; }
      restock(s);
    }
    if (!s.market.stock || !Object.keys(s.market.stock).length) restock(s);
  }
  function stockOf(s, r) { ensureDay(s); return s.market.stock[r] == null ? baseStock(r) : s.market.stock[r]; }

  function sellPrice(s, r) { const v = CG.resValue(r); if (v <= 0) return 0; ensureDay(s); return Math.max(1, Math.round(v * 0.6 * priceFactor(s) * CG.clamp(mod(s, r), 0.4, 1.3))); }
  function buyPrice(s, r) { const v = CG.resValue(r); if (v <= 0) return 0; ensureDay(s); const p = Math.ceil(v * 1.7 / priceFactor(s) * CG.clamp(mod(s, r), 0.8, 2.5)); return Math.max(p, sellPrice(s, r) * 1.6 + 1); }
  function tradable(res) { const r = CG.RES[res]; return r && !r.nocap; }

  function sell(s, res, qty) {
    if (!hasMarket(s)) return { ok: false, why: 'Build a Market first' };
    qty = Math.min(qty, Math.floor(E().amountOf(s, res)));
    if (qty <= 0) return { ok: false, why: 'Nothing to sell' };
    const unit = sellPrice(s, res), gain = unit * qty;
    E().addRes(s, res, -qty); s.coin += gain; s.stats.coinEarned += gain; s.stats.totalTraded += qty;
    s.market.mod[res] = Math.max(0.4, mod(s, res) - qty * 0.008);     // flooding the market lowers price
    s.market.stock[res] = (s.market.stock[res] || 0) + qty;          // your goods add to local stock
    CG.State.log(s, 'Sold ' + qty + ' ' + CG.resName(res) + ' for ' + gain + ' coin.', 'info');
    CG.emit('trade_done'); CG.emit('resources_changed');
    return { ok: true, gain };
  }
  function buy(s, res, qty) {
    if (!hasMarket(s)) return { ok: false, why: 'Build a Market first' };
    const stock = stockOf(s, res);
    if (stock <= 0) return { ok: false, why: 'Out of stock' };
    qty = Math.min(qty, stock);
    const unit = buyPrice(s, res), cost = unit * qty;
    if (s.coin < cost) return { ok: false, why: 'Not enough coin' };
    const added = E().addRes(s, res, qty); if (added <= 0) return { ok: false, why: 'No storage room' };
    const got = Math.round(added), realCost = unit * got;
    s.coin -= realCost; s.stats.coinSpent += realCost; s.stats.totalTraded += got;
    s.market.stock[res] = Math.max(0, stock - got);
    s.market.mod[res] = Math.min(2.5, mod(s, res) + got * 0.02);      // buying drives the price up
    CG.State.log(s, 'Bought ' + got + ' ' + CG.resName(res) + ' for ' + realCost + ' coin.', 'info');
    CG.emit('trade_done'); CG.emit('resources_changed');
    return { ok: true };
  }

  function recruitCost(s) { return Math.round(30 + s.survivors.length * 14); }
  function canRecruit(s) { const c = E().cache(s); return hasMarket(s) && c.housing > s.survivors.length && s.coin >= recruitCost(s); }
  function recruit(s) {
    if (!canRecruit(s)) return { ok: false, why: 'Need a market, free housing and coin' };
    s.coin -= recruitCost(s); s.stats.coinSpent += recruitCost(s);
    CG.Colony.addSettler(s, 'You recruited a settler from a passing ship.');
    CG.emit('trade_done'); return { ok: true };
  }

  CG.Trade = { hasMarket, sellPrice, buyPrice, sell, buy, tradable, recruitCost, canRecruit, recruit, priceFactor, stockOf, mod, ensureDay };
})(typeof window !== 'undefined' ? window : globalThis);
