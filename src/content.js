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
 * @typedef {'none'|'basic'|'full'} InsurancePlan
 *
 * @typedef {Object} AfterWorkOption
 * @property {string} id
 * @property {string} label
 * @property {string} emoji
 * @property {number} nrgGain
 * @property {number} happyGain
 * @property {number} cost
 * @property {number} [skillGain]
 * @property {string} [earnTier]   - 'low'|'medium'|'high' for freelance
 * @property {number} [contactProb]
 * @property {string} desc
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
 * @property {number} exhaustion
 * @property {number} performance
 * @property {WorkMode} workMode
 * @property {AfterWorkActivity} afterWorkActivity
 * @property {string} afterWorkSubOption
 * @property {number} foodTier
 * @property {number} transportTier
 * @property {InsurancePlan} insurance
 * @property {Record<AssetKey, number>} dcaSettings
 * @property {Record<AssetKey, number>} assetPrices
 * @property {Record<AssetKey, number>} prevAssetPrices
 * @property {Record<AssetKey, number>} portfolio
 * @property {Record<AssetKey, number>} portfolioCost
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
 * @property {SkillKey|null} studySkill
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

/**
 * After-work activities — each has sub-options the player picks daily.
 * @type {Record<AfterWorkActivity, {label:string, emoji:string, anim:string, options:AfterWorkOption[]}>}
 */
export const AFTER_WORK = {
  rest: {
    label: 'พักผ่อน', emoji: '😴', anim: 'a-rest',
    options: [
      { id:'rest_sleep', label:'นอนหลับ',    emoji:'🛏️', nrgGain:+22, happyGain:+1, cost:0,   skillGain:0, desc:'energy ฟื้นเยอะสุด' },
      { id:'rest_gym',   label:'ออกกำลังกาย', emoji:'🏋️', nrgGain:+12, happyGain:+4, cost:0,   skillGain:0, desc:'+happy, energy ฟื้นปานกลาง' },
      { id:'rest_spa',   label:'นวด/สปา',    emoji:'💆', nrgGain:+18, happyGain:+7, cost:500, skillGain:0, desc:'+happy มาก, เสียตัง' },
    ],
  },
  entertainment: {
    label: 'บันเทิง', emoji: '🎮', anim: 'a-entertainment',
    options: [
      { id:'ent_stream',  label:'ดูซีรีส์ที่บ้าน', emoji:'📺', nrgGain:+10, happyGain:+4,  cost:0,    skillGain:0, desc:'ฟรี, +happy' },
      { id:'ent_dining',  label:'กินข้าวนอกบ้าน',  emoji:'🍽️', nrgGain:+7,  happyGain:+7,  cost:600,  skillGain:0, desc:'+happy ปานกลาง' },
      { id:'ent_bar',     label:'ออกไปบาร์',       emoji:'🍸', nrgGain:+3,  happyGain:+11, cost:1200, skillGain:0, desc:'+happy เยอะ, แพง' },
    ],
  },
  study: {
    label: 'เรียนรู้', emoji: '📚', anim: 'a-study',
    options: [
      { id:'study_book',    label:'อ่านหนังสือ',   emoji:'📖', nrgGain:-5,  happyGain:-1, cost:0,    skillGain:0.6, desc:'+skill, ฟรี' },
      { id:'study_online',  label:'คอร์สออนไลน์', emoji:'💻', nrgGain:-7,  happyGain:-1, cost:300,  skillGain:1.0, desc:'+skill มากขึ้น' },
      { id:'study_seminar', label:'สัมมนา',        emoji:'🎓', nrgGain:-10, happyGain:+2, cost:1500, skillGain:1.5, desc:'+skill เยอะ, โอกาส contact' },
    ],
  },
  freelance: {
    label: 'งานเสริม', emoji: '💼', anim: 'a-freelance',
    options: [
      { id:'fl_quick',    label:'Quick task',   emoji:'⚡', nrgGain:-8,  happyGain:-1, cost:0, skillGain:0, earnTier:'low',    desc:'ได้น้อย, เสี่ยงน้อย' },
      { id:'fl_project',  label:'Project ใหญ่', emoji:'🏗️', nrgGain:-15, happyGain:-3, cost:0, skillGain:0, earnTier:'high',   desc:'ได้มาก, risky' },
      { id:'fl_retainer', label:'ลูกค้าประจำ',  emoji:'🤝', nrgGain:-10, happyGain: 0, cost:0, skillGain:0, earnTier:'medium', desc:'สม่ำเสมอ, ต้องมี skill' },
    ],
  },
  socialize: {
    label: 'พบปะสังคม', emoji: '🍻', anim: 'a-socialize',
    options: [
      { id:'soc_friend',  label:'ชวนเพื่อนกิน', emoji:'🍜', nrgGain:-3, happyGain:+5, cost:400,  skillGain:0, contactProb:0.10, desc:'+happy, โอกาสเจอ contact' },
      { id:'soc_network', label:'Networking',  emoji:'🤝', nrgGain:-6, happyGain:+2, cost:500,  skillGain:0, contactProb:0.25, desc:'+contact โอกาสสูง' },
      { id:'soc_party',   label:'ปาร์ตี้',      emoji:'🎉', nrgGain:-8, happyGain:+8, cost:1500, skillGain:0, contactProb:0.15, desc:'+happy มาก, แพง' },
    ],
  },
  invest: {
    label: 'วิเคราะห์หุ้น', emoji: '📊', anim: 'a-invest',
    options: [
      { id:'inv_news', label:'ติดตามข่าว', emoji:'📰', nrgGain:-3, happyGain:0, cost:0, skillGain:0.25, desc:'รับ hint ทิศทางตลาด' },
    ],
  },
};

/** @type {Record<AssetKey, {label:string, emoji:string, drift:number, volatility:number, startPrice:number, unitLabel:string}>} */
export const ASSETS = {
  gold:     { label:'ทอง',          emoji:'🥇', drift:0.04,  volatility:0.012, startPrice:35000, unitLabel:'บาทโกลด์' },
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

/** Daily food spending tiers. */
export const FOOD_TIERS = [
  { label:'ประหยัด', emoji:'🍱', cost:80,  happyDelta:-1, desc:'ข้าวแกงราคาถูก' },
  { label:'ปกติ',   emoji:'🍜', cost:200, happyDelta: 0, desc:'ร้านอาหารทั่วไป' },
  { label:'หรู',    emoji:'🍣', cost:480, happyDelta:+1, desc:'ร้านอาหารดี' },
];

/** Daily transport spending tiers. */
export const TRANSPORT_TIERS = [
  { label:'รถเมล์',   emoji:'🚌', cost:40,  nrgDelta:-1, happyDelta:-1, desc:'BTS/MRT/รถเมล์' },
  { label:'รถตัวเอง', emoji:'🚗', cost:120, nrgDelta: 0, happyDelta: 0, desc:'ขับรถเอง' },
  { label:'Grab',    emoji:'🚕', cost:340, nrgDelta:+1, happyDelta:+1, desc:'แท็กซี่/Grab' },
];

/** @type {Record<InsurancePlan, {label:string, emoji:string, premium:number, coverage:number, firesafe:boolean, desc:string}>} */
export const INSURANCE_PLANS = {
  none:  { label:'ไม่มีประกัน',     emoji:'❌', premium:0,    coverage:0,   firesafe:false, desc:'จ่ายเต็ม + เสี่ยงถูกไล่ออก' },
  basic: { label:'ประกันพื้นฐาน',   emoji:'🛡️', premium:500,  coverage:0.5, firesafe:false, desc:'ลดค่ารักษา 50%' },
  full:  { label:'ประกันครอบคลุม',  emoji:'🏥', premium:1500, coverage:0.8, firesafe:true,  desc:'ลดค่ารักษา 80% + ป้องกันถูกไล่ออก' },
};

/** Items player may want to buy — triggers trait-weighted monthly event. */
export const WANT_ITEMS = [
  { id:'phone',    label:'โทรศัพท์รุ่นใหม่',  cost:32000, desc:'มีรุ่นใหม่ออก ฟีเจอร์ดีมาก' },
  { id:'laptop',   label:'Laptop ใหม่',        cost:45000, desc:'เครื่องเก่าช้าลงมาก' },
  { id:'watch',    label:'นาฬิกาหรู',          cost:18000, desc:'เพื่อนๆ ใส่กันหมดเลย' },
  { id:'bag',      label:'กระเป๋าแบรนด์เนม',   cost:22000, desc:'อยากได้มานานแล้ว' },
  { id:'vacation', label:'ตั๋วเที่ยวต่างประเทศ', cost:55000, desc:'โปรโมชั่นดีมาก ราคาพิเศษ' },
  { id:'camera',   label:'กล้องถ่ายรูป',       cost:28000, desc:'อยากถ่ายรูปสวยๆ' },
];

/** News events shown as popup when player picks inv_news. finance skill ≥ 60 → hintClear. */
export const NEWS_EVENTS = [
  { headline:'Fed ส่งสัญญาณขึ้นดอกเบี้ย',   asset:'bond',     sentiment:'bear', hintClear:'พันธบัตรอาจราคาลดระยะสั้น',       hintVague:'ตลาดพันธบัตรผันผวน' },
  { headline:'Bitcoin ETF ได้รับอนุมัติ',    asset:'bitcoin',  sentiment:'bull', hintClear:'Bitcoin มีแรงซื้อจากสถาบัน',      hintVague:'ข่าวดีฝั่ง crypto' },
  { headline:'GDP ไทยโตต่ำกว่าคาด',          asset:'index',    sentiment:'bear', hintClear:'หุ้น Index อาจปรับตัวลง',         hintVague:'เศรษฐกิจส่งสัญญาณไม่ดี' },
  { headline:'ราคาน้ำมันดิบพุ่งสูง',          asset:'gold',     sentiment:'bull', hintClear:'ทองคำมักแข็งค่าในช่วงความไม่แน่นอน', hintVague:'สินทรัพย์ปลอดภัยน่าสนใจ' },
  { headline:'หุ้นกลุ่ม Energy ปันผลดี',      asset:'dividend', sentiment:'bull', hintClear:'หุ้นปันผลมีแรงซื้อช่วงนี้',         hintVague:'กลุ่มหุ้น defensive น่าสนใจ' },
  { headline:'Tech sector sell-off ทั่วโลก', asset:'stock',    sentiment:'bear', hintClear:'หุ้นทั่วไปมีแรงขาย ระวังความเสี่ยง', hintVague:'ตลาดมีแรงขายอยู่' },
  { headline:'เงินเฟ้อต่ำกว่าคาด',            asset:'bond',     sentiment:'bull', hintClear:'พันธบัตรน่าสนใจถ้าดอกเบี้ยจะลด',   hintVague:'สัญญาณบวกจากตัวเลขเศรษฐกิจ' },
  { headline:'นักลงทุนสถาบันหนี crypto',      asset:'bitcoin',  sentiment:'bear', hintClear:'Bitcoin อาจมีแรงขายในระยะนี้',     hintVague:'ความเสี่ยงตลาดสูงขึ้น' },
];
