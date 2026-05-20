import { clamp } from './helpers.js';

const TAX_BRACKETS = [
  { upTo: 150_000,   rate: 0.00 },
  { upTo: 300_000,   rate: 0.05 },
  { upTo: 500_000,   rate: 0.10 },
  { upTo: 750_000,   rate: 0.15 },
  { upTo: 1_000_000, rate: 0.20 },
  { upTo: 2_000_000, rate: 0.25 },
  { upTo: 5_000_000, rate: 0.30 },
  { upTo: Infinity,  rate: 0.35 },
];

/** Thai PIT progressive tax on taxable annual income. */
function calcAnnualTax(taxable) {
  if (taxable <= 0) return 0;
  let tax = 0, prev = 0;
  for (const b of TAX_BRACKETS) {
    if (taxable <= b.upTo) { tax += (taxable - prev) * b.rate; break; }
    tax += (b.upTo - prev) * b.rate;
    prev = b.upTo;
  }
  return tax;
}

/** Monthly tax given annual gross + finance skill discount. */
export function computeMonthlyTax(annualGross, financeSkill) {
  const taxable = Math.max(0, annualGross - Math.min(annualGross * 0.5, 100_000) - 60_000);
  let tax = calcAnnualTax(taxable);
  tax *= 1 - (financeSkill / 100) * 0.15;
  return tax / 12;
}

/** Gross monthly salary for an employed character. */
export function calcEmployedGross(company, skills, traits) {
  const dom = Math.max(skills.tech, skills.finance, skills.creative);
  let gross = company.salaryMin + (dom / 100) * (company.salaryMax - company.salaryMin);
  gross *= 1 + ((traits.diligence - 1) / 4) * 0.25;
  return gross;
}

/** Lifestyle spending scaled by extravagance + socialStatus. */
export function calcLifestyleSpend(salary, traits) {
  const lifeMult = (0.4 + (traits.extravagance - 1) * 0.3) * (1 + (traits.socialStatus - 1) * 0.12);
  return salary * 0.15 * lifeMult;
}
