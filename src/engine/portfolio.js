import { ASSETS } from '../content.js';

/** Daily random-walk step for all asset prices. */
export function stepAssetPrices(prices) {
  const next = { ...prices };
  for (const [k, meta] of Object.entries(ASSETS)) {
    const dailyDrift = meta.drift / 252;
    const shock = (Math.random() - 0.5) * 2 * meta.volatility;
    next[k] = Math.max(meta.startPrice * 0.05, prices[k] * (1 + dailyDrift + shock));
  }
  return next;
}

/** Total portfolio market value. */
export function portfolioValueOf(portfolio, prices) {
  let v = 0;
  for (const k of Object.keys(ASSETS)) v += (portfolio[k] || 0) * prices[k];
  return v;
}

/** Monthly passive income from dividend stock + bond yield. */
export function passiveIncomeOf(portfolio, prices) {
  const divYield = 0.05;   // 5%/yr dividend stock
  const bondYield = 0.025; // 2.5%/yr bond
  const div  = (portfolio.dividend || 0) * prices.dividend * divYield  / 12;
  const bond = (portfolio.bond     || 0) * prices.bond     * bondYield / 12;
  return div + bond;
}
