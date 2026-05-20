import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// JSDoc Types
// ============================================================

/**
 * @typedef {'diligence'|'extravagance'|'socialStatus'} TraitKey
 * @typedef {'tech'|'finance'|'creative'} SkillKey
 * @typedef {'serious'|'normal'|'social'|'slack'} WorkMode
 * @typedef {'rest'|'entertainment'|'study'|'freelance'|'invest'|'socialize'} AfterWorkActivity
 * @typedef {'gold'|'bitcoin'|'index'|'bond'|'stock'|'dividend'} AssetKey
 * @typedef {'millionaire'|'house'|'freedom'|'retire'} LifeGoal
 *
 * @typedef {Object} Traits
 * @property {number} diligence
 * @property {number} extravagance
 * @property {number} socialStatus
 *
 * @typedef {Object} Skills
 * @property {number} tech
 * @property {number} finance
 * @property {number} creative
 *
 * @typedef {Object} Company
 * @property {string} id
 * @property {string} name
 * @property {string} emoji
 * @property {'startup'|'mnc'|'private'|'government'|'freelance'} type
 * @property {number} salaryMin
 * @property {number} salaryMax
 * @property {0|1|2} reviewPerYear
 * @property {number} stability
 * @property {Partial<Skills>} requires
 *
 * @typedef {Object} Debt
 * @property {string} id
 * @property {string} name
 * @property {'loan'|'fixed'} type
 * @property {number} remaining
 * @property {number} rate
 * @property {number} monthly
 *
 * @typedef {Object} Contact
 * @property {string} id
 * @property {string} name
 * @property {'mentor'|'peer'|'toxic'} kind
 *
 * @typedef {Object} LogEntry
 * @property {number} year
 * @property {number} month
 * @property {number} day
 * @property {string} text
 * @property {'info'|'good'|'bad'|'event'} kind
 *
 * @typedef {Object} PendingEvent
 * @property {string} id
 * @property {string} title
 * @property {string} desc
 * @property {{label:string, apply:(s:GameState)=>GameState, hint?:string}[]} choices
 *
 * @typedef {Object} GameState
 * @property {'game'|'end'} phase
 * @property {string} name
 * @property {number} age
 * @property {number} cash
 * @property {Traits} traits
 * @property {Skills} skills
 * @property {Company} company
 * @property {number} currentSalary
 * @property {Debt[]} debts
 * @property {number} day
 * @property {number} month
 * @property {number} year
 * @property {number} energy
 * @property {number} happiness
 * @property {number} performance
 * @property {WorkMode} workMode
 * @property {AfterWorkActivity} afterWorkActivity
 * @property {Record<AssetKey, number>} assetPrices
 * @property {Record<AssetKey, number>} portfolio
 * @property {string} lastTradeKey
 * @property {Contact[]} contacts
 * @property {number} netWorth
 * @property {number} portfolioValue
 * @property {number} passiveIncome
 * @property {number} monthlyExpenses
 * @property {number} totalEarned
 * @property {number} totalTaxPaid
 * @property {LifeGoal} lifeGoal
 * @property {boolean} goalAchieved
 * @property {{age:number,month:number,year:number}|null} goalAchievedAt
 * @property {'bankruptcy'|'age80'|undefined} endReason
 * @property {LogEntry[]} log
 * @property {PendingEvent|null} pendingEvent
 * @property {boolean} unemployed
 */

// ============================================================
// Color palette
// ============================================================

const C = {
  bg:  '#1a1209',
  sf:  '#2a1f0e',
  sf2: '#3d2e18',
  bd:  '#6b4c2a',
  ac:  '#e8a838',
  gr:  '#7bc47f',
  tx:  '#f0e6d3',
  dm:  '#9c7d5a',
  rd:  '#e05252',
  bl:  '#5b9bd5',
};

// ============================================================
// Data constants
// ============================================================

/** @type {Company[]} */
const COMPANIES = [
  { id:'techflow',   name:'TechFlow',          emoji:'🚀', type:'startup',   salaryMin:22000, salaryMax:160000, reviewPerYear:1, stability:0.30, requires:{tech:30} },
  { id:'adblast',    name:'AdBlast Agency',    emoji:'🎨', type:'startup',   salaryMin:18000, salaryMax:130000, reviewPerYear:1, stability:0.35, requires:{creative:25} },
  { id:'greenbite',  name:'GreenBite',         emoji:'🥗', type:'startup',   salaryMin:20000, salaryMax:140000, reviewPerYear:1, stability:0.25, requires:{tech:20} },
  { id:'scbglobal',  name:'SCB Global',        emoji:'🏦', type:'mnc',       salaryMin:40000, salaryMax:200000, reviewPerYear:2, stability:0.70, requires:{finance:40,tech:20} },
  { id:'unilever',   name:'Unilever TH',       emoji:'🧴', type:'mnc',       salaryMin:38000, salaryMax:180000, reviewPerYear:2, stability:0.65, requires:{creative:30,finance:15} },
  { id:'awsth',      name:'AWS Thailand',      emoji:'☁️', type:'mnc',       salaryMin:50000, salaryMax:220000, reviewPerYear:2, stability:0.70, requires:{tech:50} },
  { id:'central',    name:'Central Group',     emoji:'🛍️', type:'private',   salaryMin:20000, salaryMax:75000,  reviewPerYear:2, stability:0.60, requires:{} },
  { id:'bumrungrad', name:'Bumrungrad Hospital',emoji:'🏥',type:'private',   salaryMin:25000, salaryMax:80000,  reviewPerYear:2, stability:0.65, requires:{tech:15} },
  { id:'italianthai',name:'Italian-Thai Dev',  emoji:'🏗️', type:'private',   salaryMin:22000, salaryMax:70000,  reviewPerYear:2, stability:0.55, requires:{} },
  { id:'mdes',       name:'กระทรวงดิจิทัล',     emoji:'🏛️', type:'government',salaryMin:18000, salaryMax:45000,  reviewPerYear:1, stability:0.95, requires:{tech:10} },
  { id:'pea',        name:'การไฟฟ้า PEA',       emoji:'⚡', type:'government',salaryMin:16000, salaryMax:40000,  reviewPerYear:1, stability:0.98, requires:{} },
  { id:'gsb',        name:'ธนาคารออมสิน',       emoji:'🏦', type:'government',salaryMin:18000, salaryMax:42000,  reviewPerYear:1, stability:0.95, requires:{finance:10} },
  { id:'fl_dev',     name:'Freelance Dev',     emoji:'💻', type:'freelance', salaryMin:0,     salaryMax:300000, reviewPerYear:0, stability:0.10, requires:{tech:40} },
  { id:'fl_design',  name:'Freelance Designer',emoji:'✏️', type:'freelance', salaryMin:0,     salaryMax:250000, reviewPerYear:0, stability:0.15, requires:{creative:35} },
  { id:'content',    name:'Content Creator',   emoji:'📹', type:'freelance', salaryMin:0,     salaryMax:200000, reviewPerYear:0, stability:0.20, requires:{creative:20} },
];

const WORK_MODES = {
  serious: { label:'จริงจัง',   emoji:'🔥', perf: 0.18, nrgCost:-15, skillGain:0.4,  anim:'a-serious', desc:'+perf เยอะ แต่ energy หมดไว' },
  normal:  { label:'ปกติ',     emoji:'😐', perf: 0.06, nrgCost:-8,  skillGain:0.2,  anim:'a-normal',  desc:'balanced' },
  social:  { label:'เข้าสังคม', emoji:'🗣️', perf: 0.02, nrgCost:-5,  skillGain:0.05, anim:'a-social',  desc:'connections เยอะ, perf น้อย' },
  slack:   { label:'อู้งาน',    emoji:'💤', perf: -0.15, nrgCost:-2,  skillGain:0,    anim:'a-slack',   desc:'energy เซฟ แต่เสี่ยงโดน fire' },
};

const AFTER_WORK = {
  rest:          { label:'พักผ่อน',     emoji:'😴', nrgGain:+18, happyGain:+2,  anim:'a-rest',          cost:0,    skillGain:0,   desc:'energy ฟื้นเต็ม' },
  entertainment: { label:'ออกไปเที่ยว',  emoji:'🎮', nrgGain:+8,  happyGain:+5,  anim:'a-entertainment', cost:800,  skillGain:0,   desc:'+happiness แต่จ่ายตัง' },
  study:         { label:'อ่านหนังสือ',  emoji:'📚', nrgGain:-5,  happyGain:-1,  anim:'a-study',         cost:0,    skillGain:0.6, desc:'+skill เร็ว แต่ energy ลด' },
  freelance:     { label:'งานเสริม',    emoji:'💼', nrgGain:-12, happyGain:-2,  anim:'a-freelance',     cost:0,    skillGain:0,   desc:'+cash variable, มีโอกาส fail' },
  invest:        { label:'วิเคราะห์หุ้น',emoji:'📊', nrgGain:-3,  happyGain:-1,  anim:'a-invest',        cost:0,    skillGain:0,   desc:'+finance skill นิดหน่อย' },
  socialize:     { label:'พบเพื่อน',    emoji:'🍻', nrgGain:-5,  happyGain:+4,  anim:'a-socialize',     cost:500,  skillGain:0,   desc:'+happiness, +contact pool' },
};

const ASSETS = {
  gold:     { label:'ทอง',         emoji:'🥇', drift:0.04,  volatility:0.012, startPrice:35000, unitLabel:'บาททอง' },
  bitcoin:  { label:'Bitcoin',     emoji:'₿',  drift:0.18,  volatility:0.08,  startPrice:70000, unitLabel:'BTC' },
  index:    { label:'หุ้น Index',   emoji:'📈', drift:0.08,  volatility:0.025, startPrice:1500,  unitLabel:'หน่วย' },
  bond:     { label:'พันธบัตร',     emoji:'📜', drift:0.025, volatility:0.003, startPrice:1000,  unitLabel:'หน่วย' },
  stock:    { label:'หุ้นทั่วไป',    emoji:'📊', drift:0.10,  volatility:0.04,  startPrice:50,    unitLabel:'หุ้น' },
  dividend: { label:'หุ้นปันผล',    emoji:'💵', drift:0.06,  volatility:0.02,  startPrice:100,   unitLabel:'หุ้น' },
};

const GOALS = {
  millionaire: { label:'ล้านแรก',          emoji:'💎', desc:'Net Worth ≥ ฿1,000,000',          check:(/**@type{GameState}*/s) => s.netWorth >= 1_000_000 },
  house:       { label:'มีบ้าน',            emoji:'🏠', desc:'Net Worth ≥ ฿3,000,000 (พอซื้อบ้าน)', check:(/**@type{GameState}*/s) => s.netWorth >= 3_000_000 },
  freedom:     { label:'Financial Freedom', emoji:'🔥', desc:'Passive income ≥ ค่าใช้จ่ายต่อเดือน', check:(/**@type{GameState}*/s) => s.passiveIncome >= s.monthlyExpenses && s.passiveIncome > 10000 },
  retire:      { label:'เกษียณเร็ว',         emoji:'🌴', desc:'Net Worth ≥ ฿10,000,000',         check:(/**@type{GameState}*/s) => s.netWorth >= 10_000_000 },
};

const SKILL_META = {
  tech:     { label:'Tech',     emoji:'💻', color:C.bl },
  finance:  { label:'Finance',  emoji:'📊', color:C.gr },
  creative: { label:'Creative', emoji:'🎨', color:C.ac },
};

const TRAIT_META = {
  diligence:    { label:'ความขยัน',    emoji:'💪', desc:'income bonus + skill growth เร็ว' },
  extravagance: { label:'ความฟุ่มเฟือย', emoji:'💸', desc:'lifestyle ค่าใช้จ่ายสูง, drain happiness ถ้าอดออม' },
  socialStatus: { label:'ค่านิยมสังคม',  emoji:'👥', desc:'peer pressure events, ต้องใช้เงินตามสังคม' },
};

// ============================================================
// Inline CSS
// ============================================================

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');

.ls-root, .ls-root * { box-sizing: border-box; }
.ls-root {
  font-family: 'Noto Sans Thai', system-ui, -apple-system, sans-serif;
  color: ${C.tx};
  background: ${C.bg};
  min-height: 100vh;
  letter-spacing: 0.005em;
  font-size: 14px;
  line-height: 1.5;
  background-image:
    radial-gradient(circle at 10% 20%, rgba(232,168,56,0.04) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(91,155,213,0.03) 0%, transparent 40%);
}

.ls-card {
  background: ${C.sf};
  border: 1px solid ${C.bd};
  border-radius: 8px;
  padding: 14px;
}

.ls-card-tight {
  background: ${C.sf};
  border: 1px solid ${C.bd};
  border-radius: 8px;
  padding: 10px;
}

.ls-h1 { font-size: 28px; font-weight: 700; color: ${C.ac}; letter-spacing: 0.5px; }
.ls-h2 { font-size: 18px; font-weight: 600; color: ${C.ac}; margin-bottom: 8px; }
.ls-h3 { font-size: 14px; font-weight: 600; color: ${C.dm}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
.ls-muted { color: ${C.dm}; font-size: 12px; }

.ls-btn {
  background: ${C.sf2};
  border: 1px solid ${C.bd};
  color: ${C.tx};
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ls-btn:hover:not(:disabled) { background: ${C.bd}; transform: translateY(-1px); }
.ls-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ls-btn-primary { background: ${C.ac}; color: ${C.bg}; border-color: ${C.ac}; font-weight: 600; }
.ls-btn-primary:hover:not(:disabled) { background: #f0b848; }
.ls-btn-danger { background: ${C.rd}; color: ${C.tx}; border-color: ${C.rd}; }
.ls-btn-active { background: ${C.ac} !important; color: ${C.bg} !important; border-color: ${C.ac} !important; font-weight: 600; }
.ls-btn-ghost { background: transparent; border-color: ${C.bd}; }

.ls-input {
  background: ${C.bg};
  border: 1px solid ${C.bd};
  color: ${C.tx};
  padding: 8px 12px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  width: 100%;
}
.ls-input:focus { outline: none; border-color: ${C.ac}; }

.ls-slider {
  -webkit-appearance: none;
  width: 100%; height: 6px;
  border-radius: 3px;
  background: ${C.sf2};
  outline: none;
}
.ls-slider::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: ${C.ac};
  cursor: pointer;
  border: 2px solid ${C.bg};
}
.ls-slider::-moz-range-thumb {
  width: 18px; height: 18px;
  border-radius: 50%;
  background: ${C.ac};
  cursor: pointer;
  border: 2px solid ${C.bg};
}

.ls-scene {
  background: linear-gradient(180deg, #4a3520 0%, #2a1f0e 60%, #1a1209 100%);
  border: 1px solid ${C.bd};
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  height: 150px;
  display: flex;
}
.ls-scene-half {
  flex: 1;
  position: relative;
  border-right: 1px dashed ${C.bd};
}
.ls-scene-half:last-child { border-right: none; }
.ls-scene-label {
  position: absolute;
  top: 6px; left: 8px;
  font-size: 11px;
  color: ${C.dm};
  text-transform: uppercase;
  letter-spacing: 1px;
}

.ls-pixel-ground {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 24px;
  background: repeating-linear-gradient(
    90deg,
    #5a3f1d 0px, #5a3f1d 6px,
    #4a3015 6px, #4a3015 12px
  );
  border-top: 2px solid ${C.bd};
}

.ls-char {
  position: absolute;
  bottom: 28px; left: 50%;
  transform: translateX(-50%);
  font-size: 48px;
  filter: drop-shadow(0 4px 0 rgba(0,0,0,0.4));
  user-select: none;
}

@keyframes bob       { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-4px); } }
@keyframes fast-bob  { 0%,100% { transform: translateX(-50%) translateY(0) rotate(-2deg); } 50% { transform: translateX(-50%) translateY(-6px) rotate(2deg); } }
@keyframes nod       { 0%,100% { transform: translateX(-50%) rotate(-3deg); } 50% { transform: translateX(-50%) rotate(3deg); } }
@keyframes zzz       { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.04); } }
@keyframes dance     { 0%,100% { transform: translateX(-50%) translateY(0) rotate(-5deg); } 25% { transform: translateX(-50%) translateY(-4px) rotate(0deg); } 75% { transform: translateX(-50%) translateY(-4px) rotate(5deg); } }

.a-serious       { animation: fast-bob .5s infinite ease-in-out; }
.a-normal        { animation: bob 1.5s infinite ease-in-out; }
.a-social        { animation: nod 1s infinite ease-in-out; }
.a-slack         { animation: zzz 2s infinite ease-in-out; }
.a-rest          { animation: zzz 3s infinite ease-in-out; }
.a-study         { animation: bob 2s infinite ease-in-out; }
.a-freelance     { animation: fast-bob .7s infinite ease-in-out; }
.a-invest        { animation: nod 1.5s infinite ease-in-out; }
.a-entertainment { animation: dance 1.5s infinite ease-in-out; }
.a-socialize     { animation: dance .8s infinite ease-in-out; }

.ls-bar {
  background: ${C.bg};
  border: 1px solid ${C.bd};
  border-radius: 999px;
  overflow: hidden;
  height: 10px;
  position: relative;
}
.ls-bar-fill { height: 100%; transition: width 0.3s ease; }

.ls-stat-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed ${C.sf2}; }
.ls-stat-row:last-child { border-bottom: none; }
.ls-stat-label { color: ${C.dm}; font-size: 13px; }
.ls-stat-value { font-weight: 600; }

.ls-log-entry {
  padding: 6px 10px;
  border-left: 3px solid;
  border-radius: 0 4px 4px 0;
  margin-bottom: 4px;
  background: rgba(0,0,0,0.2);
  font-size: 12.5px;
  display: flex;
  gap: 8px;
}
.ls-log-time { color: ${C.dm}; font-size: 11px; font-variant-numeric: tabular-nums; min-width: 64px; }
.ls-log-good  { border-color: ${C.gr}; }
.ls-log-bad   { border-color: ${C.rd}; }
.ls-log-event { border-color: ${C.ac}; }
.ls-log-info  { border-color: ${C.bd}; }

.ls-tab {
  background: transparent;
  border: none;
  color: ${C.dm};
  padding: 8px 14px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}
.ls-tab:hover { color: ${C.tx}; }
.ls-tab.active { color: ${C.ac}; border-bottom-color: ${C.ac}; }

.ls-modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.ls-modal {
  background: ${C.sf};
  border: 1px solid ${C.ac};
  border-radius: 12px;
  padding: 24px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.ls-banner {
  background: linear-gradient(90deg, ${C.ac}22, transparent);
  border: 1px solid ${C.ac};
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.ls-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.ls-scroll {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: ${C.bd} ${C.bg};
}
.ls-scroll::-webkit-scrollbar { width: 8px; }
.ls-scroll::-webkit-scrollbar-track { background: ${C.bg}; }
.ls-scroll::-webkit-scrollbar-thumb { background: ${C.bd}; border-radius: 4px; }

.ls-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ls-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.ls-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }

@media (max-width: 900px) {
  .ls-main-layout { grid-template-columns: 1fr !important; }
}
`;

// ============================================================
// Helpers
// ============================================================

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const fmt = (n) => (n < 0 ? '-' : '') + '฿' + Math.abs(Math.round(n)).toLocaleString('en-US');
const fmtCompact = (n) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return sign + '฿' + (abs / 1_000_000).toFixed(2) + 'M';
  if (abs >= 1_000) return sign + '฿' + (abs / 1000).toFixed(1) + 'K';
  return sign + '฿' + Math.round(abs);
};
const monthLabel = (m) => ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][m - 1] || '?';
const uid = () => Math.random().toString(36).slice(2, 9);
const tradeKey = (s) => `${s.day}-${s.month}-${s.year}`;

/** Append to log, trim to last 80. */
function pushLog(state, text, kind = 'info') {
  const entry = { year: state.year, month: state.month, day: state.day, text, kind };
  const next = [...state.log, entry];
  if (next.length > 80) next.splice(0, next.length - 80);
  return next;
}

// ============================================================
// Tax & income math
// ============================================================

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
  let tax = 0;
  let prev = 0;
  for (const b of TAX_BRACKETS) {
    if (taxable <= b.upTo) { tax += (taxable - prev) * b.rate; break; }
    tax += (b.upTo - prev) * b.rate;
    prev = b.upTo;
  }
  return tax;
}

/** Compute monthly tax payable given annual gross + finance skill discount. */
function computeMonthlyTax(annualGross, financeSkill) {
  // standard deduction: 50% capped at 100k + personal 60k
  const taxable = Math.max(0, annualGross - Math.min(annualGross * 0.5, 100_000) - 60_000);
  let tax = calcAnnualTax(taxable);
  tax *= 1 - (financeSkill / 100) * 0.15;
  return tax / 12;
}

/** Compute gross monthly salary for an employed character (capped between min and max). */
function calcEmployedGross(company, skills, traits) {
  const dom = Math.max(skills.tech, skills.finance, skills.creative);
  let gross = company.salaryMin + (dom / 100) * (company.salaryMax - company.salaryMin);
  gross *= 1 + ((traits.diligence - 1) / 4) * 0.25;
  return gross;
}

/** Lifestyle spending = pct of salary, scaled by extravagance + socialStatus. */
function calcLifestyleSpend(salary, traits) {
  const lifeMult = (0.4 + (traits.extravagance - 1) * 0.3) * (1 + (traits.socialStatus - 1) * 0.12);
  return salary * 0.15 * lifeMult;
}

// ============================================================
// Portfolio math
// ============================================================

/** Random walk for asset prices (daily step). */
function stepAssetPrices(prices) {
  const next = { ...prices };
  for (const [k, meta] of Object.entries(ASSETS)) {
    const dailyDrift = meta.drift / 252; // ~252 trading days
    const shock = (Math.random() - 0.5) * 2 * meta.volatility;
    next[k] = Math.max(meta.startPrice * 0.05, prices[k] * (1 + dailyDrift + shock));
  }
  return next;
}

/** Total portfolio market value at given prices. */
function portfolioValueOf(portfolio, prices) {
  let v = 0;
  for (const k of Object.keys(ASSETS)) v += (portfolio[k] || 0) * prices[k];
  return v;
}

/** Monthly passive income from dividend stock + bond yield. */
function passiveIncomeOf(portfolio, prices) {
  const divYield = 0.05; // 5%/yr dividend stock
  const bondYield = 0.025; // 2.5%/yr bond
  const div = (portfolio.dividend || 0) * prices.dividend * divYield / 12;
  const bond = (portfolio.bond || 0) * prices.bond * bondYield / 12;
  return div + bond;
}

// ============================================================
// Skill growth
// ============================================================

/** Identify dominant skill for the company / job context. */
function dominantSkillKey(company, skills) {
  if (Object.keys(company.requires || {}).length > 0) {
    // grow the skill the company demands most
    let best = 'tech'; let bestVal = -1;
    for (const [k, req] of Object.entries(company.requires)) {
      if (req > bestVal) { bestVal = req; best = k; }
    }
    return best;
  }
  // otherwise grow current dominant skill
  let best = 'tech'; let bestVal = -1;
  for (const k of /** @type {SkillKey[]} */ (['tech','finance','creative'])) {
    if (skills[k] > bestVal) { bestVal = skills[k]; best = k; }
  }
  return best;
}

/** Diminishing-returns skill gain capped at 100. */
function bumpSkill(skills, key, amount) {
  if (amount <= 0) return skills;
  const cur = skills[key];
  // slows down as skill approaches 100
  const factor = Math.max(0.1, 1 - cur / 110);
  return { ...skills, [key]: clamp(cur + amount * factor, 0, 100) };
}

// ============================================================
// Initial state
// ============================================================

/**
 * @param {{name:string, traits:Traits, skills:Skills, company:Company, debts:Debt[], lifeGoal:LifeGoal}} setup
 * @returns {GameState}
 */
function buildInitialState(setup) {
  const startPrices = Object.fromEntries(
    Object.entries(ASSETS).map(([k, v]) => [k, v.startPrice])
  );
  const baseGross = setup.company.type === 'freelance'
    ? (setup.company.salaryMin + setup.company.salaryMax) / 4 // rough guess
    : calcEmployedGross(setup.company, setup.skills, setup.traits);

  /** @type {GameState} */
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

// ============================================================
// Monthly settlement
// ============================================================

/** Apply end-of-month logic: payroll, tax, expenses, debt, passive income. */
function monthlySettlement(state) {
  let s = { ...state };
  let log = s.log;

  // Salary calc
  let gross = 0;
  if (s.unemployed) {
    gross = 0;
  } else if (s.company.type === 'freelance') {
    const base = calcEmployedGross(s.company, s.skills, s.traits);
    const variance = Math.max(0.05, 0.6 + Math.random() * 0.8);
    gross = base * variance;
    s.currentSalary = gross;
  } else {
    gross = s.currentSalary;
  }

  // Tax (Thai PIT). Annualize current salary as estimate.
  const annualEstimate = gross * 12;
  const tax = s.unemployed ? 0 : computeMonthlyTax(annualEstimate, s.skills.finance);

  // Expenses
  const lifestyle = calcLifestyleSpend(s.currentSalary || 15000, s.traits);
  const fixedDebtPayments = s.debts.filter(d => d.type === 'fixed').reduce((a, d) => a + d.monthly, 0);
  const loanPayments = s.debts.filter(d => d.type === 'loan' && d.remaining > 0).reduce((a, d) => a + d.monthly, 0);
  const utilities = 3000;
  const totalExpense = lifestyle + fixedDebtPayments + loanPayments + utilities;

  // Net cash flow
  const passive = passiveIncomeOf(s.portfolio, s.assetPrices);
  const net = (gross - tax) + passive - totalExpense;
  s.cash += net;
  s.totalEarned += gross + passive;
  s.totalTaxPaid += tax;
  s.monthlyExpenses = totalExpense;
  s.passiveIncome = passive;

  // Amortize loans
  s.debts = s.debts.map(d => {
    if (d.type !== 'loan' || d.remaining <= 0) return d;
    const monthlyRate = d.rate / 12;
    const interest = d.remaining * monthlyRate;
    const principalPaid = Math.max(0, d.monthly - interest);
    const newRemaining = Math.max(0, d.remaining - principalPaid);
    return { ...d, remaining: newRemaining };
  });

  // Log monthly summary
  log = pushLog({ ...s, log }, `เงินเดือน ${fmtCompact(gross)} - ภาษี ${fmtCompact(tax)} - ค่าใช้จ่าย ${fmtCompact(totalExpense)} = ${net >= 0 ? '+' : ''}${fmtCompact(net)}`, net >= 0 ? 'good' : 'bad');

  // Happiness drift based on net flow + debt + traits
  let dHap = -1;
  if (net >= 0) dHap += 2;
  else dHap -= s.traits.extravagance;
  const heavyDebt = s.debts.filter(d => d.type === 'loan' && d.remaining > 0).length;
  dHap -= Math.min(heavyDebt, 3);
  s.happiness = clamp(s.happiness + dHap, 0, 100);

  return { ...s, log };
}

/** Apply performance review at scheduled month. */
function applyReview(state) {
  const s = { ...state };
  if (s.company.type === 'freelance' || s.unemployed) return s;
  const reviewMonths = s.company.reviewPerYear === 2 ? [6, 12] : [12];
  if (!reviewMonths.includes(s.month)) return s;

  const perf = s.performance;
  let bonus = 0, raisePct = 0, kind = 'info', msg = '';
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

// ============================================================
// Events
// ============================================================

/**
 * Monthly event roll. Returns a pendingEvent or null.
 * @param {GameState} state
 * @returns {PendingEvent | null}
 */
function rollMonthlyEvent(state) {
  if (state.unemployed) {
    // Always offer job search in unemployment
    if (Math.random() < 0.4) {
      return jobSearchEvent(state);
    }
    return null;
  }

  // Layoff check (skip first 3 months at job)
  const layoffProb = (1 - state.company.stability) * 0.018;
  if (Math.random() < layoffProb) {
    return {
      id: 'layoff',
      title: 'ถูกเลิกจ้าง 😱',
      desc: `${state.company.name} ตัดสินใจให้คุณออก พร้อมเงินชดเชย ${fmtCompact(state.currentSalary * 2)}`,
      choices: [{
        label: 'รับเงินชดเชย',
        apply: (s) => ({
          ...s,
          cash: s.cash + s.currentSalary * 2,
          unemployed: true,
          currentSalary: 0,
          performance: 0,
          log: pushLog(s, `ถูกเลิกจ้างจาก ${s.company.name} (เงินชดเชย ${fmtCompact(s.currentSalary * 2)})`, 'bad'),
        }),
      }],
    };
  }

  const roll = Math.random();
  if (roll < 0.05) {
    // Bonus
    const amt = state.currentSalary * (0.3 + Math.random() * 0.5);
    return {
      id: 'bonus',
      title: 'โบนัสพิเศษ 🎁',
      desc: `หัวหน้าให้โบนัสพิเศษ ${fmtCompact(amt)}`,
      choices: [{
        label: 'ดีใจมาก!',
        apply: (s) => ({ ...s, cash: s.cash + amt, happiness: clamp(s.happiness + 8, 0, 100), log: pushLog(s, `ได้โบนัสพิเศษ ${fmtCompact(amt)}`, 'good') }),
      }],
    };
  }
  if (roll < 0.09) {
    // Hospital
    const amt = 5000 + Math.random() * 20000;
    return {
      id: 'hospital',
      title: 'เข้าโรงพยาบาล 🏥',
      desc: `ป่วยกะทันหัน ค่ารักษา ${fmtCompact(amt)}`,
      choices: [{
        label: 'จ่ายค่ารักษา',
        apply: (s) => ({ ...s, cash: s.cash - amt, energy: clamp(s.energy - 30, 0, 100), happiness: clamp(s.happiness - 8, 0, 100), log: pushLog(s, `เข้าโรงพยาบาล จ่ายค่ารักษา ${fmtCompact(amt)}`, 'bad') }),
      }],
    };
  }
  if (roll < 0.13) {
    // Friend invite
    const amt = 2000 + Math.random() * 4000;
    return {
      id: 'friend_trip',
      title: 'เพื่อนชวนเที่ยว 🍻',
      desc: `เพื่อนชวนไปเที่ยวต่างจังหวัด ค่าใช้จ่ายประมาณ ${fmtCompact(amt)}`,
      choices: [
        {
          label: 'ไปเที่ยว',
          hint: '+happiness แต่จ่ายตัง',
          apply: (s) => ({ ...s, cash: s.cash - amt, happiness: clamp(s.happiness + 12, 0, 100), log: pushLog(s, `ไปเที่ยวกับเพื่อน จ่าย ${fmtCompact(amt)}`, 'info') }),
        },
        {
          label: 'ปฏิเสธ',
          hint: state.traits.socialStatus >= 4 ? 'happy ลด (status สูง)' : '-happiness นิดหน่อย',
          apply: (s) => ({ ...s, happiness: clamp(s.happiness - (s.traits.socialStatus >= 4 ? 8 : 3), 0, 100), log: pushLog(s, `ปฏิเสธไปเที่ยวกับเพื่อน`, 'info') }),
        },
      ],
    };
  }
  if (roll < 0.17) {
    // Skill course
    const cost = 8000 + Math.random() * 12000;
    const skillKey = ['tech','finance','creative'][Math.floor(Math.random()*3)];
    return {
      id: 'course',
      title: `คอร์สอัพสกิล ${SKILL_META[skillKey].emoji}`,
      desc: `มีคอร์ส ${SKILL_META[skillKey].label} น่าสนใจ ราคา ${fmtCompact(cost)}`,
      choices: [
        {
          label: 'ลงคอร์ส',
          hint: `+${SKILL_META[skillKey].label} skill +8`,
          apply: (s) => ({ ...s, cash: s.cash - cost, skills: { ...s.skills, [skillKey]: clamp(s.skills[skillKey] + 8, 0, 100) }, log: pushLog(s, `ลงคอร์ส ${SKILL_META[skillKey].label} +8 (${fmtCompact(cost)})`, 'good') }),
        },
        {
          label: 'ผ่าน',
          apply: (s) => s,
        },
      ],
    };
  }
  if (roll < 0.20) {
    // Car broken
    const amt = 8000 + Math.random() * 15000;
    return {
      id: 'car',
      title: 'รถเสีย 🔧',
      desc: `รถเสียกลางทาง ค่าซ่อม ${fmtCompact(amt)}`,
      choices: [{
        label: 'จ่ายค่าซ่อม',
        apply: (s) => ({ ...s, cash: s.cash - amt, happiness: clamp(s.happiness - 5, 0, 100), log: pushLog(s, `รถเสีย จ่ายซ่อม ${fmtCompact(amt)}`, 'bad') }),
      }],
    };
  }
  return null;
}

/** Job search event in unemployment. */
function jobSearchEvent(state) {
  const eligible = COMPANIES.filter(c => {
    for (const [k, req] of Object.entries(c.requires)) {
      if (state.skills[k] < req) return false;
    }
    return true;
  });
  const choices = eligible.slice(0, 4).map(co => ({
    label: `${co.emoji} ${co.name}`,
    hint: `${fmtCompact(co.salaryMin)}–${fmtCompact(co.salaryMax)} • ${co.type}`,
    apply: (s) => {
      const newSalary = co.type === 'freelance' ? 0 : calcEmployedGross(co, s.skills, s.traits);
      return {
        ...s,
        company: co,
        currentSalary: newSalary,
        unemployed: false,
        performance: 0,
        log: pushLog(s, `เริ่มงานใหม่ที่ ${co.name} (${fmtCompact(newSalary)}/เดือน)`, 'good'),
      };
    },
  }));
  choices.push({ label: 'รอเดือนหน้า', apply: (s) => s });
  return {
    id: 'job_search',
    title: 'หางานใหม่ 🔍',
    desc: 'มีตำแหน่งงานที่คุณสมัครได้:',
    choices,
  };
}

// ============================================================
// Tick — pure game loop
// ============================================================

/**
 * Pure tick: 1 tick = 1 day. Returns new state.
 * @param {GameState} state
 * @returns {GameState}
 */
function tick(state) {
  if (state.phase !== 'game' || state.pendingEvent) return state;
  let s = { ...state };

  // 1. Work slot
  if (!s.unemployed) {
    const wm = WORK_MODES[s.workMode];
    const lowEnergy = s.energy < 30 ? 0.5 : 1;
    const lowHappy = s.happiness < 30 ? 0.5 : 1;
    s.energy = clamp(s.energy + wm.nrgCost, 0, 100);
    s.performance += wm.perf * lowEnergy;
    const sk = dominantSkillKey(s.company, s.skills);
    s.skills = bumpSkill(s.skills, sk, wm.skillGain * lowEnergy * lowHappy);
  } else {
    // unemployment drains
    s.energy = clamp(s.energy - 2, 0, 100);
    s.happiness = clamp(s.happiness - 1, 0, 100);
  }

  // 2. After-work slot
  const aw = AFTER_WORK[s.afterWorkActivity];
  s.energy = clamp(s.energy + aw.nrgGain, 0, 100);
  s.happiness = clamp(s.happiness + aw.happyGain, 0, 100);
  if (aw.cost) s.cash -= aw.cost;

  if (s.afterWorkActivity === 'study') {
    const hasMentor = s.contacts.some(c => c.kind === 'mentor');
    const factor = hasMentor ? 1.2 : 1.0;
    const lowEnergy = s.energy < 30 ? 0.5 : 1;
    const sk = dominantSkillKey(s.company, s.skills);
    s.skills = bumpSkill(s.skills, sk, aw.skillGain * factor * lowEnergy);
  } else if (s.afterWorkActivity === 'invest') {
    s.skills = bumpSkill(s.skills, 'finance', 0.25);
  } else if (s.afterWorkActivity === 'freelance') {
    const skillMax = Math.max(s.skills.tech, s.skills.creative);
    const successProb = 0.4 + (skillMax / 100) * 0.5;
    const hasPeer = s.contacts.some(c => c.kind === 'peer');
    const finalProb = hasPeer ? Math.min(0.95, successProb + 0.1) : successProb;
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
      const r = Math.random();
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

  // 3. Asset prices random walk
  s.assetPrices = stepAssetPrices(s.assetPrices);

  // 4. Advance day
  s.day += 1;
  let monthlySettled = false;
  if (s.day > 30) {
    s.day = 1;
    s.month += 1;
    if (s.month > 12) {
      s.month = 1;
      s.year += 1;
      s.age += 1;
    }
    monthlySettled = true;
  }

  // 5. Monthly settlement
  if (monthlySettled) {
    s = monthlySettlement(s);
    s = applyReview(s);
    const evt = rollMonthlyEvent(s);
    if (evt) s.pendingEvent = evt;
  }

  // 6. Derived values
  s.portfolioValue = portfolioValueOf(s.portfolio, s.assetPrices);
  s.netWorth = s.cash + s.portfolioValue - s.debts.filter(d => d.type === 'loan').reduce((a, d) => a + d.remaining, 0);

  // 7. Goal achievement (milestone, not end)
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

// ============================================================
// Setup screen
// ============================================================

function SetupScreen({ onStart }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [traits, setTraits] = useState({ diligence: 3, extravagance: 3, socialStatus: 3 });
  const SKILL_POOL = 70;
  const [skills, setSkills] = useState({ tech: 10, finance: 10, creative: 10 });
  const [companyId, setCompanyId] = useState('');
  const [debtFlags, setDebtFlags] = useState({ student: false, car: false, home: false, family: false });
  const [lifeGoal, setLifeGoal] = useState('millionaire');

  const skillUsed = skills.tech + skills.finance + skills.creative - 30;
  const skillRemaining = SKILL_POOL - skillUsed;

  const setSkill = (k, v) => {
    const others = Object.entries(skills).filter(([key]) => key !== k).reduce((a, [_, val]) => a + val, 0);
    const maxAllowed = SKILL_POOL + 30 - others;
    setSkills({ ...skills, [k]: clamp(v, 10, Math.min(100, maxAllowed)) });
  };

  const eligibleCompanies = COMPANIES.map(co => {
    const failed = [];
    for (const [k, req] of Object.entries(co.requires)) {
      if (skills[k] < req) failed.push(`${SKILL_META[k].label} ${skills[k]}/${req}`);
    }
    return { ...co, _failed: failed };
  });

  const selectedCompany = COMPANIES.find(c => c.id === companyId);
  const estimatedSalary = selectedCompany
    ? selectedCompany.type === 'freelance'
      ? `${fmtCompact(selectedCompany.salaryMin)}–${fmtCompact(selectedCompany.salaryMax)}/เดือน (variable)`
      : fmt(calcEmployedGross(selectedCompany, skills, traits)) + '/เดือน'
    : '';

  const buildDebts = () => {
    /** @type {Debt[]} */
    const arr = [];
    if (debtFlags.student) arr.push({ id: uid(), name: 'กยศ.', type: 'loan', remaining: 200_000, rate: 0.01, monthly: 2200 });
    if (debtFlags.car)     arr.push({ id: uid(), name: 'รถยนต์', type: 'loan', remaining: 600_000, rate: 0.04, monthly: 11500 });
    if (debtFlags.home)    arr.push({ id: uid(), name: 'บ้าน', type: 'loan', remaining: 2_500_000, rate: 0.03, monthly: 14500 });
    if (debtFlags.family)  arr.push({ id: uid(), name: 'ส่งเงินบ้าน', type: 'fixed', remaining: Infinity, rate: 0, monthly: 5000 });
    if (!debtFlags.home)   arr.push({ id: uid(), name: 'ค่าเช่า', type: 'fixed', remaining: Infinity, rate: 0, monthly: 7000 });
    return arr;
  };

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 3) {
      const elig = eligibleCompanies.find(c => c.id === companyId);
      return Boolean(elig && elig._failed.length === 0);
    }
    return true;
  };

  const start = () => {
    onStart({
      name: name.trim(),
      traits,
      skills,
      company: selectedCompany,
      debts: buildDebts(),
      lifeGoal,
    });
  };

  const stepTitles = ['ชื่อ', 'ลักษณะนิสัย', 'ทักษะ', 'งาน', 'หนี้สิน + เป้าหมาย'];

  return (
    <div className="ls-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 720, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="ls-h1">🌾 LifeSim</div>
          <div className="ls-muted">เกมจำลองชีวิตการเงิน — เริ่มต้นที่อายุ 22 ฿50,000</div>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {stepTitles.map((t, i) => (
            <div key={i} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: i <= step ? C.ac : C.sf2,
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        <div className="ls-card" style={{ minHeight: 420 }}>
          <div className="ls-h3">Step {step + 1} / 5 — {stepTitles[step]}</div>

          {step === 0 && (
            <div>
              <div className="ls-h2">ชื่อตัวละครของคุณ</div>
              <div className="ls-muted" style={{ marginBottom: 12 }}>ใส่ชื่อจริงก็ได้ — เกมนี้คือคุณ</div>
              <input
                className="ls-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="ชื่อ..."
                maxLength={20}
                autoFocus
              />
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="ls-h2">ลักษณะนิสัย</div>
              <div className="ls-muted" style={{ marginBottom: 16 }}>ตั้งค่านิสัย 1–5 — มีผลต่อรายรับ รายจ่าย และความสุข</div>
              {Object.entries(TRAIT_META).map(([k, meta]) => (
                <div key={k} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <span style={{ marginRight: 6 }}>{meta.emoji}</span>
                      <span style={{ fontWeight: 600 }}>{meta.label}</span>
                    </div>
                    <span style={{ color: C.ac, fontWeight: 700 }}>{traits[k]}</span>
                  </div>
                  <input
                    type="range" min={1} max={5} step={1}
                    value={traits[k]}
                    onChange={e => setTraits({ ...traits, [k]: +e.target.value })}
                    className="ls-slider"
                  />
                  <div className="ls-muted" style={{ marginTop: 4 }}>{meta.desc}</div>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="ls-h2">ทักษะ</div>
              <div className="ls-muted" style={{ marginBottom: 8 }}>
                แจกแต้ม 70 แต้ม (เริ่มต้นแต่ละทักษะที่ 10) — เหลือ <span style={{ color: skillRemaining < 0 ? C.rd : C.ac, fontWeight: 700 }}>{skillRemaining}</span> แต้ม
              </div>
              {Object.entries(SKILL_META).map(([k, meta]) => (
                <div key={k} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <span style={{ marginRight: 6 }}>{meta.emoji}</span>
                      <span style={{ fontWeight: 600 }}>{meta.label}</span>
                    </div>
                    <span style={{ color: meta.color, fontWeight: 700 }}>{skills[k]}</span>
                  </div>
                  <input
                    type="range" min={10} max={100} step={1}
                    value={skills[k]}
                    onChange={e => setSkill(k, +e.target.value)}
                    className="ls-slider"
                  />
                </div>
              ))}
              {skillRemaining < 0 && (
                <div style={{ color: C.rd, fontSize: 12, marginTop: 8 }}>⚠️ ใช้แต้มเกินไป โปรดลด</div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="ls-h2">เลือกบริษัท</div>
              <div className="ls-muted" style={{ marginBottom: 12 }}>บริษัทที่ skill ไม่ถึงจะ grey out</div>
              <div className="ls-scroll" style={{ maxHeight: 320, paddingRight: 4 }}>
                {eligibleCompanies.map(co => {
                  const locked = co._failed.length > 0;
                  const selected = co.id === companyId;
                  return (
                    <button
                      key={co.id}
                      disabled={locked}
                      onClick={() => setCompanyId(co.id)}
                      className="ls-btn"
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        marginBottom: 6,
                        padding: '10px 12px',
                        background: selected ? C.ac : C.sf2,
                        color: selected ? C.bg : C.tx,
                        borderColor: selected ? C.ac : C.bd,
                        opacity: locked ? 0.4 : 1,
                      }}
                    >
                      <span style={{ fontSize: 22, marginRight: 10 }}>{co.emoji}</span>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontWeight: 600 }}>{co.name}</div>
                        <div style={{ fontSize: 11, opacity: 0.8 }}>
                          {co.type} • {fmtCompact(co.salaryMin)}–{fmtCompact(co.salaryMax)} • stability {(co.stability * 100).toFixed(0)}%
                        </div>
                      </div>
                      {locked && (
                        <div style={{ fontSize: 11, color: C.rd }}>
                          ขาด {co._failed.join(', ')}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedCompany && (
                <div className="ls-card-tight" style={{ marginTop: 10, background: C.sf2 }}>
                  <div className="ls-h3" style={{ marginBottom: 4 }}>คาดการณ์รายได้</div>
                  <div style={{ color: C.ac, fontWeight: 600 }}>{estimatedSalary}</div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="ls-h2">หนี้สิน & รายจ่ายประจำ</div>
              <div className="ls-muted" style={{ marginBottom: 12 }}>เลือกที่มีอยู่จริง</div>

              {[
                { k: 'student', label: '🎓 กยศ.', detail: '฿200,000 @ 1% (฿2,200/mo)' },
                { k: 'car', label: '🚗 ผ่อนรถ', detail: '฿600,000 @ 4% (฿11,500/mo)' },
                { k: 'home', label: '🏠 ผ่อนบ้าน', detail: '฿2.5M @ 3% (฿14,500/mo)' },
                { k: 'family', label: '👨‍👩‍👧 ส่งเงินบ้าน', detail: '฿5,000/mo (ตลอดไป)' },
              ].map(item => (
                <label key={item.k} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: 10, marginBottom: 6,
                  background: debtFlags[item.k] ? C.sf2 : C.bg,
                  border: `1px solid ${debtFlags[item.k] ? C.ac : C.bd}`,
                  borderRadius: 6, cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={debtFlags[item.k]}
                    onChange={e => setDebtFlags({ ...debtFlags, [item.k]: e.target.checked })}
                    style={{ accentColor: C.ac, width: 16, height: 16 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.label}</div>
                    <div className="ls-muted">{item.detail}</div>
                  </div>
                </label>
              ))}
              {!debtFlags.home && (
                <div className="ls-muted" style={{ marginBottom: 12, marginTop: 6 }}>
                  💡 ไม่มีบ้าน → auto-add ค่าเช่า ฿7,000/เดือน
                </div>
              )}

              <div className="ls-h2" style={{ marginTop: 16 }}>เป้าหมายชีวิต</div>
              <div className="ls-grid-2">
                {Object.entries(GOALS).map(([k, g]) => (
                  <button
                    key={k}
                    onClick={() => setLifeGoal(k)}
                    className="ls-btn"
                    style={{
                      flexDirection: 'column', alignItems: 'flex-start',
                      padding: 12, height: 'auto',
                      background: lifeGoal === k ? C.ac : C.sf2,
                      color: lifeGoal === k ? C.bg : C.tx,
                      borderColor: lifeGoal === k ? C.ac : C.bd,
                    }}
                  >
                    <div style={{ fontSize: 18 }}>{g.emoji} {g.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4, textAlign: 'left' }}>{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <button
            className="ls-btn ls-btn-ghost"
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            ← Back
          </button>
          {step < 4 ? (
            <button
              className="ls-btn ls-btn-primary"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed() || (step === 2 && skillRemaining < 0)}
            >
              Next →
            </button>
          ) : (
            <button
              className="ls-btn ls-btn-primary"
              onClick={start}
              disabled={!selectedCompany}
            >
              เริ่มเล่น 🎮
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Event modal
// ============================================================

function EventModal({ event, onChoice }) {
  return (
    <div className="ls-modal-backdrop">
      <div className="ls-modal">
        <div className="ls-h2" style={{ marginBottom: 8 }}>{event.title}</div>
        <div style={{ marginBottom: 16 }}>{event.desc}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {event.choices.map((c, i) => (
            <button
              key={i}
              className="ls-btn"
              style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
              onClick={() => onChoice(c)}
            >
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 600 }}>{c.label}</div>
                {c.hint && <div className="ls-muted" style={{ marginTop: 2 }}>{c.hint}</div>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Top bar
// ============================================================

function TopBar({ state }) {
  const happyColor = state.happiness > 60 ? C.gr : state.happiness > 30 ? C.ac : C.rd;
  const energyColor = state.energy > 60 ? C.gr : state.energy > 30 ? C.ac : C.rd;

  return (
    <div className="ls-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, marginBottom: 12, flexWrap: 'wrap' }}>
      <div>
        <div className="ls-muted" style={{ fontSize: 10 }}>ตัวละคร</div>
        <div style={{ fontWeight: 700 }}>{state.name} <span style={{ color: C.dm, fontWeight: 400 }}>(อายุ {state.age})</span></div>
      </div>
      <div style={{ width: 1, height: 28, background: C.bd }} />
      <div>
        <div className="ls-muted" style={{ fontSize: 10 }}>วันที่</div>
        <div style={{ fontVariantNumeric: 'tabular-nums' }}>{state.day} {monthLabel(state.month)} {state.year + 543}</div>
      </div>
      <div style={{ width: 1, height: 28, background: C.bd }} />
      <div>
        <div className="ls-muted" style={{ fontSize: 10 }}>💰 เงินสด</div>
        <div style={{ fontWeight: 700, color: state.cash < 0 ? C.rd : C.tx }}>{fmt(state.cash)}</div>
      </div>
      <div>
        <div className="ls-muted" style={{ fontSize: 10 }}>📈 Net Worth</div>
        <div style={{ fontWeight: 700, color: state.netWorth < 0 ? C.rd : C.gr }}>{fmtCompact(state.netWorth)}</div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ minWidth: 120 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span>⚡ Energy</span><span style={{ color: energyColor, fontVariantNumeric: 'tabular-nums' }}>{Math.round(state.energy)}</span>
        </div>
        <div className="ls-bar">
          <div className="ls-bar-fill" style={{ width: state.energy + '%', background: energyColor }} />
        </div>
      </div>
      <div style={{ minWidth: 120 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span>❤️ Happy</span><span style={{ color: happyColor, fontVariantNumeric: 'tabular-nums' }}>{Math.round(state.happiness)}</span>
        </div>
        <div className="ls-bar">
          <div className="ls-bar-fill" style={{ width: state.happiness + '%', background: happyColor }} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Character scene
// ============================================================

function CharacterScene({ state }) {
  const workAnim = WORK_MODES[state.workMode].anim;
  const afterAnim = AFTER_WORK[state.afterWorkActivity].anim;
  return (
    <div className="ls-scene">
      <div className="ls-scene-half">
        <div className="ls-scene-label">☀️ Work</div>
        <div className="ls-pixel-ground" />
        <div className={`ls-char ${workAnim}`}>{state.unemployed ? '😔' : '🧑‍💼'}</div>
      </div>
      <div className="ls-scene-half">
        <div className="ls-scene-label">🌙 Evening</div>
        <div className="ls-pixel-ground" />
        <div className={`ls-char ${afterAnim}`}>
          {state.afterWorkActivity === 'rest' ? '😴' :
           state.afterWorkActivity === 'entertainment' ? '🎮' :
           state.afterWorkActivity === 'study' ? '📚' :
           state.afterWorkActivity === 'freelance' ? '💻' :
           state.afterWorkActivity === 'invest' ? '📊' : '🍻'}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Stats panel
// ============================================================

function StatsPanel({ state }) {
  const totalLoanRemaining = state.debts.filter(d => d.type === 'loan').reduce((a, d) => a + d.remaining, 0);
  const fixedMonthly = state.debts.filter(d => d.type === 'fixed').reduce((a, d) => a + d.monthly, 0);
  const loanMonthly = state.debts.filter(d => d.type === 'loan' && d.remaining > 0).reduce((a, d) => a + d.monthly, 0);

  return (
    <div>
      <div className="ls-card-tight" style={{ marginBottom: 10 }}>
        <div className="ls-h3">การเงิน</div>
        <div className="ls-stat-row"><span className="ls-stat-label">เงินสด</span><span className="ls-stat-value">{fmt(state.cash)}</span></div>
        <div className="ls-stat-row"><span className="ls-stat-label">มูลค่าพอร์ต</span><span className="ls-stat-value">{fmtCompact(state.portfolioValue)}</span></div>
        <div className="ls-stat-row"><span className="ls-stat-label">หนี้คงเหลือ</span><span className="ls-stat-value" style={{ color: C.rd }}>{fmtCompact(totalLoanRemaining)}</span></div>
        <div className="ls-stat-row"><span className="ls-stat-label">Net Worth</span><span className="ls-stat-value" style={{ color: state.netWorth < 0 ? C.rd : C.gr }}>{fmtCompact(state.netWorth)}</span></div>
      </div>

      <div className="ls-card-tight" style={{ marginBottom: 10 }}>
        <div className="ls-h3">รายเดือน</div>
        <div className="ls-stat-row"><span className="ls-stat-label">เงินเดือน (gross)</span><span className="ls-stat-value">{fmtCompact(state.currentSalary)}</span></div>
        <div className="ls-stat-row"><span className="ls-stat-label">Passive income</span><span className="ls-stat-value" style={{ color: C.gr }}>+{fmtCompact(state.passiveIncome)}</span></div>
        <div className="ls-stat-row"><span className="ls-stat-label">ค่าใช้จ่ายเดือนล่าสุด</span><span className="ls-stat-value" style={{ color: C.rd }}>{fmtCompact(state.monthlyExpenses)}</span></div>
        <div className="ls-stat-row"><span className="ls-stat-label">ภาษีจ่ายสะสม</span><span className="ls-stat-value">{fmtCompact(state.totalTaxPaid)}</span></div>
      </div>

      <div className="ls-card-tight" style={{ marginBottom: 10 }}>
        <div className="ls-h3">ทักษะ</div>
        {Object.entries(SKILL_META).map(([k, m]) => (
          <div key={k} style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
              <span>{m.emoji} {m.label}</span><span style={{ color: m.color, fontWeight: 600 }}>{state.skills[k].toFixed(1)}</span>
            </div>
            <div className="ls-bar"><div className="ls-bar-fill" style={{ width: state.skills[k] + '%', background: m.color }} /></div>
          </div>
        ))}
      </div>

      <div className="ls-card-tight" style={{ marginBottom: 10 }}>
        <div className="ls-h3">หนี้สิน ({state.debts.length} รายการ)</div>
        {state.debts.length === 0 && <div className="ls-muted">ไม่มีหนี้สิน 🎉</div>}
        {state.debts.map(d => (
          <div key={d.id} className="ls-stat-row">
            <span className="ls-stat-label">
              {d.name} <span style={{ fontSize: 10, color: C.dm }}>({d.type === 'loan' ? `${(d.rate * 100).toFixed(1)}%` : 'fixed'})</span>
            </span>
            <span className="ls-stat-value" style={{ fontSize: 12 }}>
              {d.type === 'fixed' ? '∞' : fmtCompact(d.remaining)}
              <span style={{ color: C.dm, fontWeight: 400, fontSize: 11 }}> / {fmtCompact(d.monthly)}/m</span>
            </span>
          </div>
        ))}
        <div className="ls-stat-row" style={{ marginTop: 6, borderTop: `1px solid ${C.bd}`, paddingTop: 6 }}>
          <span className="ls-stat-label">รวม fixed ต่อเดือน</span>
          <span className="ls-stat-value">{fmtCompact(fixedMonthly + loanMonthly)}</span>
        </div>
      </div>

      {state.contacts.length > 0 && (
        <div className="ls-card-tight" style={{ marginBottom: 10 }}>
          <div className="ls-h3">Contacts ({state.contacts.length})</div>
          {state.contacts.map(c => (
            <div key={c.id} className="ls-stat-row">
              <span className="ls-stat-label">{c.name}</span>
              <span className="ls-tag" style={{
                background: c.kind === 'mentor' ? C.gr : c.kind === 'peer' ? C.bl : C.rd,
                color: C.bg,
              }}>{c.kind}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Portfolio panel
// ============================================================

function PortfolioPanel({ state, setState }) {
  const [selected, setSelected] = useState('gold');
  const [amount, setAmount] = useState(1);
  const todayKey = tradeKey(state);
  const canTradeToday = state.lastTradeKey !== todayKey;

  const meta = ASSETS[selected];
  const price = state.assetPrices[selected];
  const holding = state.portfolio[selected] || 0;
  const cost = price * amount;

  const buy = () => {
    if (!canTradeToday) return;
    if (state.cash < cost) return;
    setState(s => ({
      ...s,
      cash: s.cash - cost,
      portfolio: { ...s.portfolio, [selected]: (s.portfolio[selected] || 0) + amount },
      lastTradeKey: todayKey,
      log: pushLog(s, `ซื้อ ${meta.label} ${amount} ${meta.unitLabel} @ ${fmt(price)}`, 'info'),
    }));
  };

  const sell = () => {
    if (!canTradeToday) return;
    if (holding < amount) return;
    setState(s => ({
      ...s,
      cash: s.cash + cost,
      portfolio: { ...s.portfolio, [selected]: holding - amount },
      lastTradeKey: todayKey,
      log: pushLog(s, `ขาย ${meta.label} ${amount} ${meta.unitLabel} @ ${fmt(price)}`, 'info'),
    }));
  };

  return (
    <div>
      <div className="ls-card-tight" style={{ marginBottom: 10 }}>
        <div className="ls-h3">ราคาตลาดวันนี้</div>
        {Object.entries(ASSETS).map(([k, m]) => {
          const p = state.assetPrices[k];
          const start = m.startPrice;
          const change = ((p - start) / start) * 100;
          const isSel = k === selected;
          return (
            <button
              key={k}
              onClick={() => setSelected(k)}
              className="ls-btn"
              style={{
                width: '100%', justifyContent: 'space-between',
                marginBottom: 4, padding: '8px 10px',
                background: isSel ? C.sf2 : 'transparent',
                borderColor: isSel ? C.ac : C.bd,
              }}
            >
              <span>{m.emoji} {m.label}</span>
              <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{fmtCompact(p)}</span>
                <span style={{ fontSize: 11, color: change >= 0 ? C.gr : C.rd, minWidth: 50, textAlign: 'right' }}>
                  {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="ls-card-tight" style={{ marginBottom: 10 }}>
        <div className="ls-h3">ซื้อขาย {meta.emoji} {meta.label}</div>
        <div className="ls-stat-row"><span className="ls-stat-label">ราคา</span><span className="ls-stat-value">{fmt(price)}</span></div>
        <div className="ls-stat-row"><span className="ls-stat-label">ถืออยู่</span><span className="ls-stat-value">{holding.toFixed(2)} {meta.unitLabel}</span></div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8 }}>
          <span className="ls-muted">จำนวน:</span>
          <input
            type="number"
            min="0.01" step="0.01"
            className="ls-input"
            style={{ width: 100 }}
            value={amount}
            onChange={e => setAmount(Math.max(0.01, +e.target.value))}
          />
          <span className="ls-muted" style={{ fontSize: 12 }}>= {fmt(cost)}</span>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button
            className="ls-btn ls-btn-primary"
            disabled={!canTradeToday || state.cash < cost}
            onClick={buy}
            style={{ flex: 1 }}
          >ซื้อ</button>
          <button
            className="ls-btn"
            disabled={!canTradeToday || holding < amount}
            onClick={sell}
            style={{ flex: 1 }}
          >ขาย</button>
        </div>
        {!canTradeToday && (
          <div className="ls-muted" style={{ marginTop: 6, fontSize: 11 }}>
            ⏰ เทรดได้วันละ 1 ครั้ง — รออีก {31 - state.day} วันสำหรับเดือนถัดไป (หรือพรุ่งนี้ก็ได้ ลองดูในเดือนถัดไป)
          </div>
        )}
      </div>

      <div className="ls-card-tight">
        <div className="ls-h3">พอร์ตของฉัน</div>
        {Object.entries(state.portfolio).filter(([_, v]) => v > 0).length === 0 && (
          <div className="ls-muted">ยังไม่มีสินทรัพย์</div>
        )}
        {Object.entries(state.portfolio).filter(([_, v]) => v > 0).map(([k, v]) => {
          const m = ASSETS[k];
          const value = v * state.assetPrices[k];
          return (
            <div key={k} className="ls-stat-row">
              <span className="ls-stat-label">{m.emoji} {m.label}</span>
              <span className="ls-stat-value" style={{ fontSize: 12 }}>
                {v.toFixed(2)} <span style={{ color: C.dm, fontWeight: 400 }}>= {fmtCompact(value)}</span>
              </span>
            </div>
          );
        })}
        <div className="ls-stat-row" style={{ marginTop: 6, borderTop: `1px solid ${C.bd}`, paddingTop: 6 }}>
          <span className="ls-stat-label">มูลค่ารวม</span>
          <span className="ls-stat-value" style={{ color: C.ac }}>{fmtCompact(state.portfolioValue)}</span>
        </div>
        <div className="ls-stat-row">
          <span className="ls-stat-label">Passive income / เดือน</span>
          <span className="ls-stat-value" style={{ color: C.gr }}>+{fmtCompact(state.passiveIncome)}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Log panel
// ============================================================

function LogPanel({ state }) {
  const logEnd = useRef(null);
  useEffect(() => { logEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [state.log.length]);

  return (
    <div className="ls-card-tight ls-scroll" style={{ maxHeight: 500, padding: 8 }}>
      {state.log.length === 0 && <div className="ls-muted">ยังไม่มี events</div>}
      {state.log.map((e, i) => (
        <div key={i} className={`ls-log-entry ls-log-${e.kind}`}>
          <span className="ls-log-time">{e.day}/{e.month}/{(e.year + 543).toString().slice(-2)}</span>
          <span>{e.text}</span>
        </div>
      ))}
      <div ref={logEnd} />
    </div>
  );
}

// ============================================================
// Performance badge (fuzzy display)
// ============================================================

function PerformanceBadge({ state }) {
  if (state.company.type === 'freelance' || state.unemployed) return null;
  const perf = state.performance;
  let label, color;
  if (perf > 20)      { label = 'หัวหน้าประทับใจ ⭐';    color = C.gr; }
  else if (perf > 5)  { label = 'หัวหน้าพอใจ ✓';         color = C.gr; }
  else if (perf > -5) { label = 'หัวหน้าเฉยๆ';            color = C.dm; }
  else if (perf > -20){ label = 'หัวหน้าไม่ค่อยพอใจ ⚠️'; color = C.ac; }
  else                { label = 'หัวหน้าโกรธมาก 🔥';       color = C.rd; }
  return (
    <div className="ls-card-tight" style={{ borderColor: color, marginTop: 8 }}>
      <div className="ls-h3" style={{ marginBottom: 2 }}>ผลงาน (จาก review ครั้งล่าสุด)</div>
      <div style={{ color, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// ============================================================
// Game screen
// ============================================================

function GameScreen({ state, setState, speed, setSpeed, paused, setPaused, onResetSave }) {
  const [tab, setTab] = useState('stats');

  const goalDef = GOALS[state.lifeGoal];

  return (
    <div className="ls-root" style={{ padding: 12 }}>
      {state.goalAchieved && (
        <div className="ls-banner">
          <span style={{ fontSize: 24 }}>{goalDef.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: C.ac }}>บรรลุเป้าหมาย: {goalDef.label}</div>
            <div className="ls-muted" style={{ fontSize: 12 }}>
              บรรลุเมื่ออายุ {state.goalAchievedAt?.age} • เล่นต่อได้จนถึงอายุ 80
            </div>
          </div>
        </div>
      )}
      {state.unemployed && (
        <div className="ls-banner" style={{ borderColor: C.rd, background: `linear-gradient(90deg, ${C.rd}22, transparent)` }}>
          <span style={{ fontSize: 24 }}>😔</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: C.rd }}>ตอนนี้คุณว่างงาน</div>
            <div className="ls-muted" style={{ fontSize: 12 }}>เดือนถัดไปจะมี event ให้สมัครงาน (รอ event เกิด หรือทำงานเสริม)</div>
          </div>
        </div>
      )}

      <TopBar state={state} />

      <div className="ls-main-layout" style={{
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        gap: 12,
      }}>
        {/* LEFT */}
        <div>
          <CharacterScene state={state} />

          <div className="ls-card-tight" style={{ marginTop: 10 }}>
            <div className="ls-h3">☀️ Work mode</div>
            <div className="ls-grid-2">
              {Object.entries(WORK_MODES).map(([k, m]) => (
                <button
                  key={k}
                  className="ls-btn"
                  onClick={() => setState(s => ({ ...s, workMode: k }))}
                  style={{
                    flexDirection: 'column', padding: 8, gap: 2,
                    background: state.workMode === k ? C.ac : C.sf2,
                    color: state.workMode === k ? C.bg : C.tx,
                    borderColor: state.workMode === k ? C.ac : C.bd,
                  }}
                  title={m.desc}
                >
                  <div style={{ fontSize: 18 }}>{m.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="ls-card-tight" style={{ marginTop: 10 }}>
            <div className="ls-h3">🌙 After-work</div>
            <div className="ls-grid-3">
              {Object.entries(AFTER_WORK).map(([k, a]) => (
                <button
                  key={k}
                  className="ls-btn"
                  onClick={() => setState(s => ({ ...s, afterWorkActivity: k }))}
                  style={{
                    flexDirection: 'column', padding: 8, gap: 2,
                    background: state.afterWorkActivity === k ? C.ac : C.sf2,
                    color: state.afterWorkActivity === k ? C.bg : C.tx,
                    borderColor: state.afterWorkActivity === k ? C.ac : C.bd,
                  }}
                  title={a.desc + (a.cost ? ` (฿${a.cost})` : '')}
                >
                  <div style={{ fontSize: 18 }}>{a.emoji}</div>
                  <div style={{ fontSize: 10, fontWeight: 600 }}>{a.label}</div>
                </button>
              ))}
            </div>
          </div>

          <PerformanceBadge state={state} />

          <div className="ls-card-tight" style={{ marginTop: 10 }}>
            <div className="ls-h3">เป้าหมาย: {goalDef.emoji} {goalDef.label}</div>
            <div className="ls-muted" style={{ fontSize: 12 }}>{goalDef.desc}</div>
            {state.goalAchieved && <div style={{ color: C.gr, marginTop: 4, fontSize: 12 }}>✓ บรรลุแล้ว</div>}
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${C.bd}`, marginBottom: 10 }}>
            <button className={`ls-tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>📊 สถิติ</button>
            <button className={`ls-tab ${tab === 'portfolio' ? 'active' : ''}`} onClick={() => setTab('portfolio')}>💹 พอร์ต</button>
            <button className={`ls-tab ${tab === 'log' ? 'active' : ''}`} onClick={() => setTab('log')}>📝 Log</button>
          </div>
          {tab === 'stats' && <StatsPanel state={state} />}
          {tab === 'portfolio' && <PortfolioPanel state={state} setState={setState} />}
          {tab === 'log' && <LogPanel state={state} />}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="ls-card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, padding: 10, flexWrap: 'wrap' }}>
        <div>
          <div className="ls-muted" style={{ fontSize: 10 }}>บริษัท</div>
          <div style={{ fontWeight: 600 }}>{state.company.emoji} {state.company.name}</div>
        </div>
        <div style={{ width: 1, height: 28, background: C.bd }} />
        <div>
          <div className="ls-muted" style={{ fontSize: 10 }}>Speed</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 4].map(sp => (
              <button
                key={sp}
                className={`ls-btn ${speed === sp && !paused ? 'ls-btn-active' : ''}`}
                style={{ padding: '4px 10px', fontSize: 12 }}
                onClick={() => { setSpeed(sp); setPaused(false); }}
              >
                {sp}x
              </button>
            ))}
            <button
              className={`ls-btn ${paused ? 'ls-btn-active' : ''}`}
              style={{ padding: '4px 10px', fontSize: 12 }}
              onClick={() => setPaused(p => !p)}
            >
              ⏸ {paused ? 'Resume' : 'Pause'}
            </button>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          className="ls-btn ls-btn-ghost"
          onClick={onResetSave}
          style={{ fontSize: 12 }}
        >
          🗑️ ล้าง save + เริ่มใหม่
        </button>
      </div>
    </div>
  );
}

// ============================================================
// End screen
// ============================================================

function EndScreen({ state, onRestart }) {
  const goalDef = GOALS[state.lifeGoal];
  const yearsLived = state.year - 2024;
  const totalSaved = state.totalEarned - state.totalTaxPaid;

  // categorize log entries
  const goodCount = state.log.filter(l => l.kind === 'good').length;
  const badCount = state.log.filter(l => l.kind === 'bad').length;
  const eventCount = state.log.filter(l => l.kind === 'event').length;

  return (
    <div className="ls-root" style={{ minHeight: '100vh', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 720, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 64 }}>
            {state.endReason === 'bankruptcy' ? '💀' : state.goalAchieved ? '🏆' : '🌅'}
          </div>
          <div className="ls-h1">
            {state.endReason === 'bankruptcy' ? 'ล้มละลาย' : state.goalAchieved ? `${goalDef.label}` : 'จบชีวิตการทำงาน'}
          </div>
          <div className="ls-muted">
            {state.name} • อายุ {state.age} • เล่นมา {yearsLived} ปีในเกม
          </div>
        </div>

        <div className="ls-card" style={{ marginBottom: 16 }}>
          <div className="ls-h2">สรุปการเงิน</div>
          <div className="ls-stat-row"><span className="ls-stat-label">Net Worth สุดท้าย</span><span className="ls-stat-value" style={{ color: state.netWorth < 0 ? C.rd : C.gr }}>{fmt(state.netWorth)}</span></div>
          <div className="ls-stat-row"><span className="ls-stat-label">เงินสด</span><span className="ls-stat-value">{fmt(state.cash)}</span></div>
          <div className="ls-stat-row"><span className="ls-stat-label">มูลค่าพอร์ตลงทุน</span><span className="ls-stat-value">{fmt(state.portfolioValue)}</span></div>
          <div className="ls-stat-row"><span className="ls-stat-label">หนี้คงเหลือ</span><span className="ls-stat-value" style={{ color: C.rd }}>{fmt(state.debts.filter(d => d.type === 'loan').reduce((a, d) => a + d.remaining, 0))}</span></div>
          <div className="ls-stat-row"><span className="ls-stat-label">รายได้รวมตลอดชีวิต</span><span className="ls-stat-value">{fmt(state.totalEarned)}</span></div>
          <div className="ls-stat-row"><span className="ls-stat-label">ภาษีจ่ายสะสม</span><span className="ls-stat-value">{fmt(state.totalTaxPaid)}</span></div>
          <div className="ls-stat-row"><span className="ls-stat-label">รายได้หลังภาษี</span><span className="ls-stat-value">{fmt(totalSaved)}</span></div>
        </div>

        <div className="ls-card" style={{ marginBottom: 16 }}>
          <div className="ls-h2">ทักษะปลายเกม</div>
          {Object.entries(SKILL_META).map(([k, m]) => (
            <div key={k} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{m.emoji} {m.label}</span>
                <span style={{ color: m.color, fontWeight: 600 }}>{state.skills[k].toFixed(0)}/100</span>
              </div>
              <div className="ls-bar"><div className="ls-bar-fill" style={{ width: state.skills[k] + '%', background: m.color }} /></div>
            </div>
          ))}
        </div>

        <div className="ls-card" style={{ marginBottom: 16 }}>
          <div className="ls-h2">เหตุการณ์ในชีวิต</div>
          <div className="ls-grid-3" style={{ marginBottom: 12 }}>
            <div className="ls-card-tight" style={{ textAlign: 'center', background: C.sf2 }}>
              <div style={{ fontSize: 24, color: C.gr }}>{goodCount}</div>
              <div className="ls-muted">ดีๆ</div>
            </div>
            <div className="ls-card-tight" style={{ textAlign: 'center', background: C.sf2 }}>
              <div style={{ fontSize: 24, color: C.rd }}>{badCount}</div>
              <div className="ls-muted">แย่ๆ</div>
            </div>
            <div className="ls-card-tight" style={{ textAlign: 'center', background: C.sf2 }}>
              <div style={{ fontSize: 24, color: C.ac }}>{eventCount}</div>
              <div className="ls-muted">events</div>
            </div>
          </div>
          <div className="ls-scroll" style={{ maxHeight: 220, padding: 4 }}>
            {state.log.slice(-30).map((e, i) => (
              <div key={i} className={`ls-log-entry ls-log-${e.kind}`}>
                <span className="ls-log-time">{e.day}/{e.month}/{(e.year + 543).toString().slice(-2)}</span>
                <span>{e.text}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="ls-btn ls-btn-primary" style={{ width: '100%', padding: 12, fontSize: 16 }} onClick={onRestart}>
          🔄 เริ่มชีวิตใหม่
        </button>
      </div>
    </div>
  );
}

// ============================================================
// App + game loop + storage
// ============================================================

const SAVE_KEY = 'lifesim_save_v1';

export default function App() {
  /** @type {[GameState|null, any]} */
  const [gameState, setGameState] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const r = await storage.get(SAVE_KEY);
        if (r?.value) {
          const parsed = JSON.parse(r.value);
          // pendingEvent contains functions which can't be JSON-serialized; drop on load
          parsed.pendingEvent = null;
          setGameState(parsed);
        }
      } catch (e) {
        // no save yet
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Persist on state change (debounced via simple setTimeout)
  useEffect(() => {
    if (!loaded || !gameState) return;
    const t = setTimeout(async () => {
      try {
        // strip pendingEvent (has functions) before save
        const { pendingEvent, ...rest } = gameState;
        await storage.set(SAVE_KEY, JSON.stringify(rest));
      } catch (e) {}
    }, 500);
    return () => clearTimeout(t);
  }, [gameState, loaded]);

  // Game loop
  useEffect(() => {
    if (!gameState || gameState.phase !== 'game' || paused || gameState.pendingEvent) return;
    const interval = Math.round(8000 / speed);
    const timer = setInterval(() => {
      setGameState(prev => (prev && prev.phase === 'game' && !prev.pendingEvent) ? tick(prev) : prev);
    }, interval);
    return () => clearInterval(timer);
  }, [speed, paused, gameState?.phase, gameState?.pendingEvent]);

  const handleStart = useCallback((setup) => {
    const initial = buildInitialState(setup);
    setGameState(initial);
    setPaused(false);
  }, []);

  const handleRestart = useCallback(async () => {
    try { await storage.delete(SAVE_KEY); } catch (e) {}
    setGameState(null);
    setSpeed(1);
    setPaused(false);
  }, []);

  const handleResetSave = useCallback(async () => {
    if (!window.confirm('ล้าง save แล้วเริ่มใหม่?')) return;
    try { await storage.delete(SAVE_KEY); } catch (e) {}
    setGameState(null);
    setSpeed(1);
    setPaused(false);
  }, []);

  const handleChoice = useCallback((choice) => {
    setGameState(prev => {
      if (!prev || !prev.pendingEvent) return prev;
      const next = choice.apply(prev);
      return { ...next, pendingEvent: null };
    });
  }, []);

  return (
    <>
      <style>{CSS}</style>
      {!loaded && (
        <div className="ls-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="ls-muted">กำลังโหลด...</div>
        </div>
      )}
      {loaded && !gameState && <SetupScreen onStart={handleStart} />}
      {loaded && gameState && gameState.phase === 'game' && (
        <>
          <GameScreen
            state={gameState}
            setState={setGameState}
            speed={speed}
            setSpeed={setSpeed}
            paused={paused}
            setPaused={setPaused}
            onResetSave={handleResetSave}
          />
          {gameState.pendingEvent && (
            <EventModal event={gameState.pendingEvent} onChoice={handleChoice} />
          )}
        </>
      )}
      {loaded && gameState && gameState.phase === 'end' && (
        <EndScreen state={gameState} onRestart={handleRestart} />
      )}
    </>
  );
}
