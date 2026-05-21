// data.js — static game data used by the modern UI (mocks).
// In a wired-up build, these would come from src/content.js (COMPANIES, WORK_MODES, etc.)
// We've kept a flat copy here so the redesign renders in isolation.

export const WORK_MODES = {
  serious: { label: "จริงจัง", icon: "💪" },
  normal:  { label: "ปกติ",   icon: "🙂" },
  social:  { label: "สังคม",  icon: "🗣️" },
  slack:   { label: "อู้",     icon: "😴" },
};

export const EVENING = {
  rest: {
    label: "พักผ่อน", icon: "🛌",
    sub: [
      { id: "sleep", label: "นอนหลับ",       desc: "+เอเนอจี้ 22" },
      { id: "gym",   label: "ออกกำลังกาย", desc: "+ความสุข 4" },
      { id: "spa",   label: "นวด/สปา",      desc: "−฿500 · +ความสุข 7" },
    ],
  },
  entertainment: {
    label: "บันเทิง", icon: "🎮",
    sub: [
      { id: "stream", label: "ดูซีรีส์",        desc: "+ความสุข 4" },
      { id: "dining", label: "กินข้าวนอกบ้าน", desc: "−฿600 · +ความสุข 7" },
      { id: "bar",    label: "ออกไปบาร์",      desc: "−฿1.2K · +ความสุข 11" },
    ],
  },
  study: {
    label: "เรียน", icon: "📚",
    sub: [
      { id: "book",    label: "อ่านหนังสือ",   desc: "+ทักษะ 0.6" },
      { id: "online",  label: "คอร์สออนไลน์", desc: "−฿300 · +ทักษะ 1.0" },
      { id: "seminar", label: "สัมมนา",         desc: "−฿1.5K · +ทักษะ 1.5" },
    ],
  },
  freelance: {
    label: "งานเสริม", icon: "💼",
    sub: [
      { id: "quick",   label: "Quick task",    desc: "งานเล็ก เสี่ยงน้อย" },
      { id: "project", label: "Project ใหญ่", desc: "ได้มาก, risky" },
    ],
  },
  socialize: {
    label: "สังคม", icon: "🍻",
    sub: [
      { id: "soc_friend",  label: "ชวนเพื่อนกิน", desc: "−฿400 · +ความสุข 5" },
      { id: "soc_network", label: "Networking",     desc: "−฿500 · +contact" },
      { id: "soc_party",   label: "ปาร์ตี้",          desc: "−฿1.5K · +ความสุข 8" },
    ],
  },
  invest: {
    label: "วิเคราะห์", icon: "📊",
    sub: [
      { id: "news", label: "ติดตามข่าว", desc: "hint ทิศทางตลาด" },
    ],
  },
};

export const ASSETS = [
  { k: "gold",    label: "ทอง",         icon: "🥇", price:   35200, delta:  0.6, trend: [3,4,3,5,4,6,5] },
  { k: "bitcoin", label: "Bitcoin",     icon: "₿",  price: 2400000, delta: -4.2, trend: [6,5,6,4,3,4,3] },
  { k: "index",   label: "หุ้น Index",  icon: "📈", price:    1540, delta:  1.1, trend: [3,4,5,4,5,6,6] },
  { k: "bond",    label: "พันธบัตร",     icon: "📜", price:    1000, delta:  0.0, trend: [4,4,4,5,4,4,4] },
];

export const TRAITS = {
  diligence:    { label: "ความขยัน",        emoji: "💪", desc: "income bonus + skill growth เร็ว" },
  extravagance: { label: "ความฟุ่มเฟือย",    emoji: "💸", desc: "lifestyle ค่าใช้จ่ายสูง" },
  socialStatus: { label: "ค่านิยมสังคม",     emoji: "👥", desc: "peer pressure events" },
};

export const SKILLS = {
  tech:     { label: "Tech",     emoji: "💻", color: "var(--accent)" },
  finance:  { label: "Finance",  emoji: "📊", color: "var(--success)" },
  creative: { label: "Creative", emoji: "🎨", color: "var(--danger)" },
};

export const GOALS = {
  millionaire: { label: "ล้านแรก",            emoji: "💎", desc: "Net Worth ≥ ฿1M" },
  house:       { label: "มีบ้าน",              emoji: "🏠", desc: "Net Worth ≥ ฿3M" },
  freedom:     { label: "Financial Freedom",  emoji: "🔥", desc: "Passive ≥ รายจ่าย" },
  retire:      { label: "เกษียณเร็ว",           emoji: "🌴", desc: "Net Worth ≥ ฿10M" },
};

export const DEBT_CHOICES = [
  { k: "student", label: "🎓 กยศ.",         detail: "฿200,000 @ 1%  · ฿2,200/m" },
  { k: "car",     label: "🚗 ผ่อนรถ",        detail: "฿600,000 @ 4%  · ฿11.5K/m" },
  { k: "home",    label: "🏠 ผ่อนบ้าน",      detail: "฿2.5M @ 3%  · ฿14.5K/m" },
  { k: "family",  label: "👨‍👩‍👧 ส่งเงินบ้าน", detail: "฿5,000/m · ตลอดไป" },
];

export const SETUP_COMPANIES = [
  { id: "techflow",  name: "TechFlow",          emoji: "🚀", type: "startup",    salaryMin: 22000, salaryMax: 160000, stability: 0.30, requires: { tech: 30 } },
  { id: "adblast",   name: "AdBlast Agency",    emoji: "🎨", type: "startup",    salaryMin: 18000, salaryMax: 130000, stability: 0.35, requires: { creative: 25 } },
  { id: "scbglobal", name: "SCB Global",        emoji: "🏦", type: "mnc",        salaryMin: 40000, salaryMax: 200000, stability: 0.70, requires: { finance: 40, tech: 20 } },
  { id: "awsth",     name: "AWS Thailand",      emoji: "☁️", type: "mnc",        salaryMin: 50000, salaryMax: 220000, stability: 0.70, requires: { tech: 50 } },
  { id: "central",   name: "Central Group",     emoji: "🛍️", type: "private",    salaryMin: 20000, salaryMax:  75000, stability: 0.60, requires: {} },
  { id: "mdes",      name: "กระทรวงดิจิทัล",      emoji: "🏛️", type: "government", salaryMin: 18000, salaryMax:  45000, stability: 0.95, requires: { tech: 10 } },
  { id: "pea",       name: "การไฟฟ้า PEA",        emoji: "⚡", type: "government", salaryMin: 16000, salaryMax:  40000, stability: 0.98, requires: {} },
  { id: "fl_dev",    name: "Freelance Dev",     emoji: "💻", type: "freelance",  salaryMin:     0, salaryMax: 300000, stability: 0.10, requires: { tech: 40 } },
];

export const THAI_MONTHS = ["", "ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

// A throwaway mock — used by the demo and by GameScreen when no initialState is passed.
export const MOCK_STATE = {
  name: "นพดล",
  age: 28,
  day: 14, month: 3, year: 2025,
  cash: 128540,
  netWorth: 684320,
  netWorthDelta: 12.4,
  energy: 78,
  happiness: 62,
  exhaustion: 31,
  workMode: "normal",
  evening: "socialize",
  evSub: "soc_friend",
  foodTier: 1,
  transportTier: 0,
  insurance: "basic",
  company: { id: "techflow", name: "TechFlow", emoji: "🚀" },
  salary: 38000,
  passive: 4200,
  expenses: 18400,
  skills: { tech: 72, finance: 54, creative: 38 },
  performance: 12,
  totalTaxPaid: 142000,
  totalEarned: 6840000,
};
