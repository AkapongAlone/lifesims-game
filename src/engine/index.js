import { clamp, fmtCompact, pushLog, uid } from './helpers.js';
import { calcEmployedGross } from './tax.js';
import { stepAssetPrices, portfolioValueOf } from './portfolio.js';
import { dominantSkillKey, bumpSkill } from './skills.js';
import { monthlySettlement, applyReview } from './settlement.js';
import { rollMonthlyEvent, illnessEvent } from './events.js';
import { ASSETS, GOALS, WORK_MODES, AFTER_WORK, FOOD_TIERS, TRANSPORT_TIERS, NEWS_EVENTS } from '../content.js';

// Re-export helpers used by UI
export { fmt, fmtCompact, monthLabel, tradeKey, pushLog } from './helpers.js';

/**
 * Build the initial GameState from setup config.
 * @param {{name:string, traits:import('../content.js').Traits, skills:import('../content.js').Skills, company:import('../content.js').Company, debts:import('../content.js').Debt[], lifeGoal:import('../content.js').LifeGoal}} setup
 * @returns {import('../content.js').GameState}
 */
export function buildInitialState(setup) {
  const startPrices = Object.fromEntries(
    Object.entries(ASSETS).map(([k, v]) => [k, v.startPrice])
  );
  const baseGross = setup.company.type === 'freelance'
    ? (setup.company.salaryMin + setup.company.salaryMax) / 4
    : calcEmployedGross(setup.company, setup.skills, setup.traits);

  const s = {
    phase: 'game',
    name: setup.name,
    age: 22,
    cash: 50_000,
    traits: setup.traits,
    skills: setup.skills,
    company: setup.company,
    currentSalary: baseGross,
    debts: setup.debts,
    day: 1,
    month: 1,
    year: 2024,
    energy: 80,
    happiness: 70,
    exhaustion: 0,
    performance: 0,
    workMode: 'normal',
    afterWorkActivity: 'rest',
    afterWorkSubOption: 'rest_sleep',
    foodTier: 1,
    transportTier: 1,
    insurance: 'none',
    dcaSettings: Object.fromEntries(Object.keys(ASSETS).map(k => [k, 0])),
    assetPrices: startPrices,
    prevAssetPrices: startPrices,
    portfolio: Object.fromEntries(Object.keys(ASSETS).map(k => [k, 0])),
    portfolioCost: Object.fromEntries(Object.keys(ASSETS).map(k => [k, 0])),
    lastTradeKey: '',
    contacts: [],
    netWorth: 50_000,
    portfolioValue: 0,
    passiveIncome: 0,
    monthlyExpenses: 0,
    totalEarned: 0,
    totalTaxPaid: 0,
    lifeGoal: setup.lifeGoal,
    goalAchieved: false,
    goalAchievedAt: null,
    endReason: undefined,
    log: [],
    pendingEvent: null,
    unemployed: false,
    studySkill: null,
  };
  s.log = pushLog(s, `เริ่มต้นชีวิตการทำงานที่ ${setup.company.name} 🎉`, 'event');
  return s;
}

/**
 * Pure tick: 1 call = 1 in-game day. Returns new GameState.
 * @param {import('../content.js').GameState} state
 * @returns {import('../content.js').GameState}
 */
export function tick(state) {
  if (state.phase !== 'game' || state.pendingEvent) return state;
  let s = { ...state };

  // 1. Work slot
  if (s.unemployed) {
    s.energy    = clamp(s.energy    - 2, 0, 100);
    s.happiness = clamp(s.happiness - 1, 0, 100);
  } else {
    const wm = WORK_MODES[s.workMode];
    const lowEnergy = s.energy < 30 ? 0.5 : 1;
    const lowHappy  = s.happiness < 30 ? 0.5 : 1;
    s.energy = clamp(s.energy + wm.nrgCost, 0, 100);
    s.performance += wm.perf * lowEnergy;
    const sk = dominantSkillKey(s.company, s.skills);
    s.skills = bumpSkill(s.skills, sk, wm.skillGain * lowEnergy * lowHappy);
  }

  // 2. After-work slot
  const awAct = AFTER_WORK[s.afterWorkActivity];
  const awOpt = awAct.options.find(o => o.id === s.afterWorkSubOption) || awAct.options[0];

  s.energy    = clamp(s.energy    + awOpt.nrgGain,   0, 100);
  s.happiness = clamp(s.happiness + awOpt.happyGain, 0, 100);
  if (awOpt.cost) s.cash -= awOpt.cost;

  // Activity-specific logic
  if (s.afterWorkActivity === 'study') {
    const hasMentor = s.contacts.some(c => c.kind === 'mentor');
    const factor    = hasMentor ? 1.2 : 1.0;
    const lowEnergy = s.energy < 30 ? 0.5 : 1;
    const sk = s.studySkill || dominantSkillKey(s.company, s.skills);
    s.skills = bumpSkill(s.skills, sk, (awOpt.skillGain || 0) * factor * lowEnergy);
    if (awOpt.id === 'study_seminar' && Math.random() < 0.20) {
      const r = Math.random();
      const kind = r < 0.35 ? 'mentor' : r < 0.85 ? 'peer' : 'toxic';
      const names = { mentor: 'พี่ที่ปรึกษา', peer: 'เพื่อนสายงาน', toxic: 'เพื่อนนิสัยไม่ดี' };
      s.contacts = [...s.contacts, { id: uid(), name: names[kind], kind }];
      s.log = pushLog(s, `เจอ${names[kind]}ใหม่จากสัมมนา`, kind === 'toxic' ? 'bad' : 'good');
    }
  } else if (s.afterWorkActivity === 'invest') {
    s.skills = bumpSkill(s.skills, 'finance', awOpt.skillGain || 0);
    if (awOpt.id === 'inv_news') {
      const news = NEWS_EVENTS[Math.floor(Math.random() * NEWS_EVENTS.length)];
      const hint = s.skills.finance >= 60 ? news.hintClear : news.hintVague;
      const sentimentEmoji = news.sentiment === 'bull' ? '📈' : '📉';
      s.pendingEvent = {
        id: 'news_' + news.asset,
        title: `📰 ${news.headline}`,
        desc: `${sentimentEmoji} [${news.asset.toUpperCase()}] ${hint}`,
        choices: [{ label: 'รับทราบ', apply: (st) => st }],
      };
    }
  } else if (s.afterWorkActivity === 'freelance') {
    const skillMax  = Math.max(s.skills.tech, s.skills.creative);
    const hasPeer   = s.contacts.some(c => c.kind === 'peer');
    const tier      = awOpt.earnTier || 'low';
    const BASE_PROB = { high: 0.3, medium: 0.55, low: 0.7 };
    const EARN_MULT = { high: 5, medium: 2.5, low: 1 };
    const baseProb  = BASE_PROB[tier] ?? 0.7;
    const finalProb = Math.min(0.95, baseProb + (skillMax / 100) * 0.5 + (hasPeer ? 0.08 : 0));
    if (Math.random() < finalProb) {
      const multiplier = EARN_MULT[tier] ?? 1;
      const earned = (500 + Math.random() * (skillMax * 20)) * multiplier;
      s.cash += earned;
      s.log = pushLog(s, `งานเสริม (${awOpt.label}) +${fmtCompact(earned)}`, 'good');
    } else {
      s.happiness = clamp(s.happiness - 3, 0, 100);
      s.log = pushLog(s, `งานเสริม (${awOpt.label}) fail 😞`, 'bad');
    }
  } else if (s.afterWorkActivity === 'socialize') {
    const contactProb = awOpt.contactProb || 0;
    if (Math.random() < contactProb) {
      const r    = Math.random();
      const kind = r < 0.25 ? 'mentor' : r < 0.80 ? 'peer' : 'toxic';
      const names = { mentor: 'พี่ที่ปรึกษา', peer: 'เพื่อนสายงาน', toxic: 'เพื่อนนิสัยไม่ดี' };
      s.contacts = [...s.contacts, { id: uid(), name: names[kind], kind }];
      s.log = pushLog(s, `เจอ${names[kind]}ใหม่`, kind === 'toxic' ? 'bad' : 'good');
    }
  }

  // Toxic contacts drain happiness
  const toxicCount = s.contacts.filter(c => c.kind === 'toxic').length;
  if (toxicCount > 0) s.happiness = clamp(s.happiness - toxicCount * 0.3, 0, 100);

  // 3. Daily living costs (food + transport)
  const food      = FOOD_TIERS[s.foodTier] || FOOD_TIERS[1];
  const transport = TRANSPORT_TIERS[s.transportTier] || TRANSPORT_TIERS[1];
  s.cash      -= food.cost + transport.cost;
  s.happiness  = clamp(s.happiness + food.happyDelta + transport.happyDelta, 0, 100);
  s.energy     = clamp(s.energy + transport.nrgDelta, 0, 100);

  // 4. Exhaustion update
  let exDelta = 0;
  if      (s.energy < 25) exDelta = +3;
  else if (s.energy < 40) exDelta = +1.5;
  else if (s.energy < 60) exDelta = -0.5;
  else                     exDelta = -1.5;
  if (awOpt.id === 'rest_sleep') exDelta -= 0.5;
  s.exhaustion = clamp(s.exhaustion + exDelta, 0, 100);

  // 5. Daily illness roll (skip if pendingEvent already set)
  if (!s.pendingEvent && s.exhaustion > 30) {
    const illnessProb = ((s.exhaustion - 30) / 70) * 0.12;
    if (Math.random() < illnessProb) {
      const severe = s.exhaustion >= 70;
      s.pendingEvent = illnessEvent(s, severe);
    }
  }

  // 6. Asset price random walk
  s.prevAssetPrices = s.assetPrices;
  s.assetPrices = stepAssetPrices(s.assetPrices);

  // 7. Advance day
  s.day += 1;
  let monthlySettled = false;
  if (s.day > 30) {
    s.day = 1;
    s.month += 1;
    if (s.month > 12) { s.month = 1; s.year += 1; s.age += 1; }
    monthlySettled = true;
  }

  // 8. Monthly settlement + review + events
  if (monthlySettled) {
    s = monthlySettlement(s);
    s = applyReview(s);
    if (!s.pendingEvent) {
      const evt = rollMonthlyEvent(s);
      if (evt) s.pendingEvent = evt;
    }
  }

  // 9. Derived values
  s.portfolioValue = portfolioValueOf(s.portfolio, s.assetPrices);
  s.netWorth = s.cash + s.portfolioValue
    - s.debts.filter(d => d.type === 'loan').reduce((a, d) => a + d.remaining, 0);

  // 10. Goal achievement
  if (!s.goalAchieved) {
    const goal = GOALS[s.lifeGoal];
    if (goal.check(s)) {
      s.goalAchieved = true;
      s.goalAchievedAt = { age: s.age, month: s.month, year: s.year };
      s.log = pushLog(s, `🎯 บรรลุเป้าหมาย: ${goal.label}! เล่นต่อได้ถึงอายุ 80`, 'event');
    }
  }

  // 11. End conditions
  if (s.cash < -500_000) {
    s.phase = 'end';
    s.endReason = 'bankruptcy';
    s.log = pushLog(s, `💀 ล้มละลาย เงินสดติดลบ ${fmtCompact(s.cash)}`, 'bad');
  } else if (s.age >= 80) {
    s.phase = 'end';
    s.endReason = 'age80';
    s.log = pushLog(s, `🌅 อายุครบ 80 ปี เกมจบ`, 'event');
  }

  return s;
}
