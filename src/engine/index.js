import { clamp, fmtCompact, pushLog, uid } from './helpers.js';
import { calcEmployedGross } from './tax.js';
import { stepAssetPrices, portfolioValueOf, passiveIncomeOf } from './portfolio.js';
import { dominantSkillKey, bumpSkill } from './skills.js';
import { monthlySettlement, applyReview } from './settlement.js';
import { rollMonthlyEvent } from './events.js';
import { ASSETS, GOALS, WORK_MODES, AFTER_WORK } from '../content.js';

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
    performance: 0,
    workMode: 'normal',
    afterWorkActivity: 'rest',
    assetPrices: startPrices,
    portfolio: Object.fromEntries(Object.keys(ASSETS).map(k => [k, 0])),
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
  if (!s.unemployed) {
    const wm = WORK_MODES[s.workMode];
    const lowEnergy = s.energy < 30 ? 0.5 : 1;
    const lowHappy  = s.happiness < 30 ? 0.5 : 1;
    s.energy = clamp(s.energy + wm.nrgCost, 0, 100);
    s.performance += wm.perf * lowEnergy;
    const sk = dominantSkillKey(s.company, s.skills);
    s.skills = bumpSkill(s.skills, sk, wm.skillGain * lowEnergy * lowHappy);
  } else {
    s.energy    = clamp(s.energy    - 2, 0, 100);
    s.happiness = clamp(s.happiness - 1, 0, 100);
  }

  // 2. After-work slot
  const aw = AFTER_WORK[s.afterWorkActivity];
  s.energy    = clamp(s.energy    + aw.nrgGain,   0, 100);
  s.happiness = clamp(s.happiness + aw.happyGain, 0, 100);
  if (aw.cost) s.cash -= aw.cost;

  if (s.afterWorkActivity === 'study') {
    const hasMentor = s.contacts.some(c => c.kind === 'mentor');
    const factor    = hasMentor ? 1.2 : 1.0;
    const lowEnergy = s.energy < 30 ? 0.5 : 1;
    const sk = dominantSkillKey(s.company, s.skills);
    s.skills = bumpSkill(s.skills, sk, aw.skillGain * factor * lowEnergy);
  } else if (s.afterWorkActivity === 'invest') {
    s.skills = bumpSkill(s.skills, 'finance', 0.25);
  } else if (s.afterWorkActivity === 'freelance') {
    const skillMax  = Math.max(s.skills.tech, s.skills.creative);
    const hasPeer   = s.contacts.some(c => c.kind === 'peer');
    const finalProb = Math.min(0.95, (0.4 + (skillMax / 100) * 0.5) + (hasPeer ? 0.1 : 0));
    if (Math.random() < finalProb) {
      const earned = 500 + Math.random() * (skillMax * 30);
      s.cash += earned;
      s.log = pushLog(s, `งานเสริมสำเร็จ +${fmtCompact(earned)}`, 'good');
    } else {
      s.happiness = clamp(s.happiness - 3, 0, 100);
      s.log = pushLog(s, `งานเสริม fail 😞`, 'bad');
    }
  } else if (s.afterWorkActivity === 'socialize') {
    if (Math.random() < 0.15) {
      const r    = Math.random();
      const kind = r < 0.25 ? 'mentor' : r < 0.80 ? 'peer' : 'toxic';
      const names = { mentor: 'พี่ที่ปรึกษา', peer: 'เพื่อนสายงาน', toxic: 'เพื่อนนิสัยไม่ดี' };
      const c = { id: uid(), name: names[kind], kind };
      s.contacts = [...s.contacts, c];
      s.log = pushLog(s, `เจอ${names[kind]}ใหม่ (${kind})`, kind === 'toxic' ? 'bad' : 'good');
    }
  }

  // Toxic contacts drain happiness
  const toxicCount = s.contacts.filter(c => c.kind === 'toxic').length;
  if (toxicCount > 0) s.happiness = clamp(s.happiness - toxicCount * 0.3, 0, 100);

  // 3. Asset price random walk
  s.assetPrices = stepAssetPrices(s.assetPrices);

  // 4. Advance day
  s.day += 1;
  let monthlySettled = false;
  if (s.day > 30) {
    s.day = 1;
    s.month += 1;
    if (s.month > 12) { s.month = 1; s.year += 1; s.age += 1; }
    monthlySettled = true;
  }

  // 5. Monthly settlement + review + events
  if (monthlySettled) {
    s = monthlySettlement(s);
    s = applyReview(s);
    const evt = rollMonthlyEvent(s);
    if (evt) s.pendingEvent = evt;
  }

  // 6. Derived values
  s.portfolioValue = portfolioValueOf(s.portfolio, s.assetPrices);
  s.netWorth = s.cash + s.portfolioValue
    - s.debts.filter(d => d.type === 'loan').reduce((a, d) => a + d.remaining, 0);

  // 7. Goal achievement
  if (!s.goalAchieved) {
    const goal = GOALS[s.lifeGoal];
    if (goal.check(s)) {
      s.goalAchieved = true;
      s.goalAchievedAt = { age: s.age, month: s.month, year: s.year };
      s.log = pushLog(s, `🎯 บรรลุเป้าหมาย: ${goal.label}! เล่นต่อได้ถึงอายุ 80`, 'event');
    }
  }

  // 8. End conditions
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
