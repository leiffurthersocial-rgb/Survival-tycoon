/* systems/trade.js — sell surplus & buy goods at a market; recruit settlers with coin. */
(function (root) {
  'use strict';
  const CG = (root.CG = root.CG || {});
  const C = CG.C, E = () => CG.Economy;

  function hasMarket(s) { return !!E().cache(s).unlockedJobs.trade; }
  function priceMult(s) {
    const c = E().cache(s);
    const merchants = (c.workersByJob['trade'] || []).length;
    return c.mult.trade_price * (1 + 0.04 * merchants);
  }

  function sellPrice(s, res) {
    const v = CG.resValue(res); if (v <= 0) return 0;
    return Math.max(1, Math.round(v * C.TRADE.baseMargin * priceMult(s)));
  }
  function buyPrice(s, res) {
    const v = CG.resValue(res); if (v <= 0) return 0;
    let p = Math.ceil(v * 1.8 / priceMult(s));
    return Math.max(p, sellPrice(s, res) * 2 + 1); // no arbitrage
  }
  function tradable(res) { const r = CG.RES[res]; return r && !r.nocap; }

  function sell(s, res, qty) {
    if (!hasMarket(s)) return { ok: false, why: 'Build a Market first' };
    qty = Math.min(qty, Math.floor(E().amountOf(s, res)));
    if (qty <= 0) return { ok: false, why: 'Nothing to sell' };
    const unit = sellPrice(s, res); const gain = unit * qty;
    E().addRes(s, res, -qty);
    s.coin += gain; s.stats.coinEarned += gain; s.stats.totalTraded += qty;
    CG.State.log(s, 'Sold ' + qty + ' ' + CG.resName(res) + ' for ' + gain + ' coin.', 'info');
    CG.emit('trade_done'); CG.emit('resources_changed');
    return { ok: true, gain };
  }

  function buy(s, res, qty) {
    if (!hasMarket(s)) return { ok: false, why: 'Build a Market first' };
    const unit = buyPrice(s, res); const cost = unit * qty;
    if (s.coin < cost) return { ok: false, why: 'Not enough coin' };
    const added = E().addRes(s, res, qty);
    if (added <= 0) return { ok: false, why: 'No storage room' };
    const realCost = unit * Math.round(added);
    s.coin -= realCost; s.stats.coinSpent += realCost; s.stats.totalTraded += added;
    CG.State.log(s, 'Bought ' + Math.round(added) + ' ' + CG.resName(res) + ' for ' + realCost + ' coin.', 'info');
    CG.emit('trade_done'); CG.emit('resources_changed');
    return { ok: true };
  }

  function recruitCost(s) { return Math.round(30 + s.survivors.length * 14); }
  function canRecruit(s) {
    const c = E().cache(s);
    return hasMarket(s) && c.housing > s.survivors.length && s.coin >= recruitCost(s);
  }
  function recruit(s) {
    if (!canRecruit(s)) return { ok: false, why: 'Need a market, free housing and coin' };
    const cost = recruitCost(s);
    s.coin -= cost; s.stats.coinSpent += cost;
    CG.Colony.addSettler(s, 'You recruited a settler from a passing ship.');
    CG.emit('trade_done');
    return { ok: true };
  }

  CG.Trade = { hasMarket, sellPrice, buyPrice, sell, buy, tradable, recruitCost, canRecruit, recruit, priceMult };
})(typeof window !== 'undefined' ? window : globalThis);
