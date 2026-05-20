// ============================================================
// All game data constants — edit here to add content
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

/** @type {Company[]} */
export const COMPANIES = [
  { id:'techflow',   name:'TechFlow',           emoji:'🚀', type:'startup',    salaryMin:22000, salaryMax:160000, reviewPerYear:1, stability:0.30, requires:{tech:30} },
  { id:'adblast',    name:'AdBlast Agency',     emoji:'🎨', type:'startup',    salaryMin:18000, salaryMax:130000, reviewPerYear:1, stability:0.35, requires:{creative:25} },
  { id:'greenbite',  name:'GreenBite',          emoji:'🥗', type:'startup',    salaryMin:20000, salaryMax:140000, reviewPerYear:1, stability:0.25, requires:{tech:20} },
  { id:'scbglobal',  name:'SCB Global',         emoji:'🏦', type:'mnc',        salaryMin:40000, salaryMax:200000, reviewPerYear:2, stability:0.70, requires:{finance:40,tech:20} },
  { id:'unilever',   name:'Unilever TH',        emoji:'🧴', type:'mnc',        salaryMin:38000, salaryMax:180000, reviewPerYear:2, stability:0.65, requires:{creative:30,finance:15} },
  { id:'awsth',      name:'AWS Thailand',       emoji:'☁️', type:'mnc',        salaryMin:50000, salaryMax:220000, reviewPerYear:2, stability:0.70, requires:{tech:50} },
  { id:'central',    name:'Central Group',      emoji:'🛍️', type:'private',    salaryMin:20000, salaryMax:75000,  reviewPerYear:2, stability:0.60, requires:{} },
  { id:'bumrungrad', name:'Bumrungrad Hospital',emoji:'🏥', type:'private',    salaryMin:25000, salaryMax:80000,  reviewPerYear:2, stability:0.65, requires:{tech:15} },
  { id:'italianthai',name:'Italian-Thai Dev',   emoji:'🏗️', type:'private',    salaryMin:22000, salaryMax:70000,  reviewPerYear:2, stability:0.55, requires:{} },
  { id:'mdes',       name:'กระทรวงดิจิทัล',      emoji:'🏛️', type:'government', salaryMin:18000, salaryMax:45000,  reviewPerYear:1, stability:0.95, requires:{tech:10} },
  { id:'pea',        name:'การไฟฟ้า PEA',        emoji:'⚡', type:'government', salaryMin:16000, salaryMax:40000,  reviewPerYear:1, stability:0.98, requires:{} },
  { id:'gsb',        name:'ธนาคารออมสิน',        emoji:'🏦', type:'government', salaryMin:18000, salaryMax:42000,  reviewPerYear:1, stability:0.95, requires:{finance:10} },
  { id:'fl_dev',     name:'Freelance Dev',      emoji:'💻', type:'freelance',  salaryMin:0,     salaryMax:300000, reviewPerYear:0, stability:0.10, requires:{tech:40} },
  { id:'fl_design',  name:'Freelance Designer', emoji:'✏️', type:'freelance',  salaryMin:0,     salaryMax:250000, reviewPerYear:0, stability:0.15, requires:{creative:35} },
  { id:'content',    name:'Content Creator',    emoji:'📹', type:'freelance',  salaryMin:0,     salaryMax:200000, reviewPerYear:0, stability:0.20, requires:{creative:20} },
];

/** @type {Record<WorkMode, {label:string, emoji:string, perf:number, nrgCost:number, skillGain:number, anim:string, desc:string}>} */
export const WORK_MODES = {
  serious: { label:'จริงจัง',    emoji:'🔥', perf: 0.18,  nrgCost:-15, skillGain:0.4,  anim:'a-serious', desc:'+perf เยอะ แต่ energy หมดไว' },
  normal:  { label:'ปกติ',      emoji:'😐', perf: 0.06,  nrgCost:-8,  skillGain:0.2,  anim:'a-normal',  desc:'balanced' },
  social:  { label:'เข้าสังคม',  emoji:'🗣️', perf: 0.02,  nrgCost:-5,  skillGain:0.05, anim:'a-social',  desc:'connections เยอะ, perf น้อย' },
  slack:   { label:'อู้งาน',     emoji:'💤', perf: -0.15, nrgCost:-2,  skillGain:0,    anim:'a-slack',   desc:'energy เซฟ แต่เสี่ยงโดน fire' },
};

/** @type {Record<AfterWorkActivity, {label:string, emoji:string, nrgGain:number, happyGain:number, anim:string, cost:number, skillGain:number, desc:string}>} */
export const AFTER_WORK = {
  rest:          { label:'พักผ่อน',      emoji:'😴', nrgGain:+18, happyGain:+2,  anim:'a-rest',          cost:0,   skillGain:0,   desc:'energy ฟื้นเต็ม' },
  entertainment: { label:'ออกไปเที่ยว',   emoji:'🎮', nrgGain:+8,  happyGain:+5,  anim:'a-entertainment', cost:800, skillGain:0,   desc:'+happiness แต่จ่ายตัง' },
  study:         { label:'อ่านหนังสือ',   emoji:'📚', nrgGain:-5,  happyGain:-1,  anim:'a-study',         cost:0,   skillGain:0.6, desc:'+skill เร็ว แต่ energy ลด' },
  freelance:     { label:'งานเสริม',     emoji:'💼', nrgGain:-12, happyGain:-2,  anim:'a-freelance',     cost:0,   skillGain:0,   desc:'+cash variable, มีโอกาส fail' },
  invest:        { label:'วิเคราะห์หุ้น', emoji:'📊', nrgGain:-3,  happyGain:-1,  anim:'a-invest',        cost:0,   skillGain:0,   desc:'+finance skill นิดหน่อย' },
  socialize:     { label:'พบเพื่อน',     emoji:'🍻', nrgGain:-5,  happyGain:+4,  anim:'a-socialize',     cost:500, skillGain:0,   desc:'+happiness, +contact pool' },
};

/** @type {Record<AssetKey, {label:string, emoji:string, drift:number, volatility:number, startPrice:number, unitLabel:string}>} */
export const ASSETS = {
  gold:     { label:'ทอง',          emoji:'🥇', drift:0.04,  volatility:0.012, startPrice:35000, unitLabel:'บาททอง' },
  bitcoin:  { label:'Bitcoin',      emoji:'₿',  drift:0.18,  volatility:0.08,  startPrice:70000, unitLabel:'BTC' },
  index:    { label:'หุ้น Index',    emoji:'📈', drift:0.08,  volatility:0.025, startPrice:1500,  unitLabel:'หน่วย' },
  bond:     { label:'พันธบัตร',      emoji:'📜', drift:0.025, volatility:0.003, startPrice:1000,  unitLabel:'หน่วย' },
  stock:    { label:'หุ้นทั่วไป',     emoji:'📊', drift:0.10,  volatility:0.04,  startPrice:50,    unitLabel:'หุ้น' },
  dividend: { label:'หุ้นปันผล',     emoji:'💵', drift:0.06,  volatility:0.02,  startPrice:100,   unitLabel:'หุ้น' },
};

/** @type {Record<LifeGoal, {label:string, emoji:string, desc:string, check:(s:GameState)=>boolean}>} */
export const GOALS = {
  millionaire: { label:'ล้านแรก',           emoji:'💎', desc:'Net Worth ≥ ฿1,000,000',           check:(s) => s.netWorth >= 1_000_000 },
  house:       { label:'มีบ้าน',             emoji:'🏠', desc:'Net Worth ≥ ฿3,000,000 (พอซื้อบ้าน)', check:(s) => s.netWorth >= 3_000_000 },
  freedom:     { label:'Financial Freedom',  emoji:'🔥', desc:'Passive income ≥ ค่าใช้จ่ายต่อเดือน',  check:(s) => s.passiveIncome >= s.monthlyExpenses && s.passiveIncome > 10000 },
  retire:      { label:'เกษียณเร็ว',          emoji:'🌴', desc:'Net Worth ≥ ฿10,000,000',          check:(s) => s.netWorth >= 10_000_000 },
};

/** @type {Record<SkillKey, {label:string, emoji:string, color:string}>} */
export const SKILL_META = {
  tech:     { label:'Tech',     emoji:'💻', color:'var(--c-bl)' },
  finance:  { label:'Finance',  emoji:'📊', color:'var(--c-gr)' },
  creative: { label:'Creative', emoji:'🎨', color:'var(--c-ac)' },
};

/** @type {Record<TraitKey, {label:string, emoji:string, desc:string}>} */
export const TRAIT_META = {
  diligence:    { label:'ความขยัน',     emoji:'💪', desc:'income bonus + skill growth เร็ว' },
  extravagance: { label:'ความฟุ่มเฟือย',  emoji:'💸', desc:'lifestyle ค่าใช้จ่ายสูง, drain happiness ถ้าอดออม' },
  socialStatus: { label:'ค่านิยมสังคม',   emoji:'👥', desc:'peer pressure events, ต้องใช้เงินตามสังคม' },
};
