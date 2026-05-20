import { clamp, fmtCompact, pushLog } from './helpers.js';
import { computeMonthlyTax, calcEmployedGross, calcLifestyleSpend } from './tax.js';
import { passiveIncomeOf } from './portfolio.js';
import { ASSETS, INSURANCE_PLANS } from '../content.js';

/** Apply end-of-month logic: payroll, tax, expenses, DCA, debt amortization, passive income. */
export function monthlySettlement(state) {
  let s = { ...state };

  let gross = 0;
  if (s.unemployed) {
    // gross stays 0
  } else if (s.company.type === 'freelance') {
    const base = calcEmployedGross(s.company, s.skills, s.traits);
    const variance = Math.max(0.05, 0.6 + Math.random() * 0.8);
    gross = base * variance;
    s.currentSalary = gross;
  } else {
    gross = s.currentSalary;
  }

  const annualEstimate = gross * 12;
  const tax = s.unemployed ? 0 : computeMonthlyTax(annualEstimate, s.skills.finance);

  // Lifestyle is reduced since food+transport are now daily explicit costs
  const lifestyle = calcLifestyleSpend(s.currentSalary || 15000, s.traits);
  const fixedDebtPayments = s.debts.filter(d => d.type === 'fixed').reduce((a, d) => a + d.monthly, 0);
  const loanPayments = s.debts.filter(d => d.type === 'loan' && d.remaining > 0).reduce((a, d) => a + d.monthly, 0);
  const utilities = 3000;
  const insurancePlan = INSURANCE_PLANS[s.insurance || 'none'];
  const insurancePremium = insurancePlan.premium;
  const totalExpense = lifestyle + fixedDebtPayments + loanPayments + utilities + insurancePremium;

  const passive = passiveIncomeOf(s.portfolio, s.assetPrices);
  const net = (gross - tax) + passive - totalExpense;
  s.cash += net;
  s.totalEarned += gross + passive;
  s.totalTaxPaid += tax;
  s.monthlyExpenses = totalExpense;
  s.passiveIncome = passive;

  s.debts = s.debts.map(d => {
    if (d.type !== 'loan' || d.remaining <= 0) return d;
    const monthlyRate = d.rate / 12;
    const interest = d.remaining * monthlyRate;
    const principalPaid = Math.max(0, d.monthly - interest);
    return { ...d, remaining: Math.max(0, d.remaining - principalPaid) };
  });

  const expenseLabel = insurancePremium > 0 ? `+ประกัน ${fmtCompact(insurancePremium)}` : '';
  s.log = pushLog(s, `เงินเดือน ${fmtCompact(gross)} - ภาษี ${fmtCompact(tax)} - ค่าใช้จ่าย ${fmtCompact(totalExpense)} ${expenseLabel}= ${net >= 0 ? '+' : ''}${fmtCompact(net)}`, net >= 0 ? 'good' : 'bad');

  // DCA auto-buy after receiving payroll
  const dcaSettings = s.dcaSettings || {};
  for (const [asset, bahtAmt] of Object.entries(dcaSettings)) {
    if (bahtAmt <= 0) continue;
    const price = s.assetPrices[asset];
    if (!price || s.cash < bahtAmt) continue;
    const units = bahtAmt / price;
    s.cash -= bahtAmt;
    s.portfolio = { ...s.portfolio, [asset]: (s.portfolio[asset] || 0) + units };
    s.portfolioCost = { ...s.portfolioCost, [asset]: (s.portfolioCost?.[asset] || 0) + bahtAmt };
    s.log = pushLog(s, `DCA ${ASSETS[asset]?.label || asset} ${fmtCompact(bahtAmt)}`, 'info');
  }

  let dHap = -1;
  if (net >= 0) dHap += 2;
  else dHap -= s.traits.extravagance;
  const heavyDebt = s.debts.filter(d => d.type === 'loan' && d.remaining > 0).length;
  dHap -= Math.min(heavyDebt, 3);
  s.happiness = clamp(s.happiness + dHap, 0, 100);

  return s;
}

/** Apply performance review bonus + raise at scheduled months. */
export function applyReview(state) {
  const s = { ...state };
  if (s.company.type === 'freelance' || s.unemployed) return s;
  const reviewMonths = s.company.reviewPerYear === 2 ? [6, 12] : [12];
  if (!reviewMonths.includes(s.month)) return s;

  const perf = s.performance;
  let bonus = 0, raisePct = 0, kind, msg;
  if (perf > 30) {
    bonus = s.currentSalary * 1.5; raisePct = 0.08;
    kind = 'good'; msg = `Review: หัวหน้าพอใจมาก! โบนัส ${fmtCompact(bonus)} + ขึ้นเงินเดือน 8%`;
  } else if (perf > 5) {
    bonus = s.currentSalary * 0.75; raisePct = 0.04;
    kind = 'good'; msg = `Review: ผลงานดี โบนัส ${fmtCompact(bonus)} + ขึ้นเงินเดือน 4%`;
  } else if (perf > -10) {
    raisePct = 0.01;
    kind = 'info'; msg = `Review: ผลงานพอใช้ ขึ้นเงินเดือน 1%`;
  } else {
    kind = 'bad'; msg = `Review: หัวหน้าไม่พอใจ ไม่มีโบนัสและไม่ขึ้นเงินเดือน`;
  }

  s.cash += bonus;
  s.currentSalary *= 1 + raisePct;
  s.performance = 0;
  s.log = pushLog(s, msg, kind);
  return s;
}
