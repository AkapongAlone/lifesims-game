import { clamp, fmtCompact, pushLog } from './helpers.js';
import { COMPANIES, SKILL_META, INSURANCE_PLANS, WANT_ITEMS } from '../content.js';
import { calcEmployedGross } from './tax.js';

/**
 * Monthly event roll. Returns a PendingEvent or null.
 * All choice.apply() functions receive the *current* state at choice time — no stale captures.
 * @param {import('../content.js').GameState} state
 * @returns {import('../content.js').PendingEvent | null}
 */
export function rollMonthlyEvent(state) {
  if (state.unemployed) {
    if (Math.random() < 0.4) return jobSearchEvent(state);
    return null;
  }

  const layoffProb = (1 - state.company.stability) * 0.018;
  if (Math.random() < layoffProb) {
    const severanceMultiplier = 2;
    return {
      id: 'layoff',
      title: 'ถูกเลิกจ้าง 😱',
      desc: `${state.company.name} ตัดสินใจให้คุณออก พร้อมเงินชดเชย ${fmtCompact(state.currentSalary * severanceMultiplier)}`,
      choices: [{
        label: 'รับเงินชดเชย',
        apply: (s) => ({
          ...s,
          cash: s.cash + s.currentSalary * severanceMultiplier,
          unemployed: true,
          currentSalary: 0,
          performance: 0,
          log: pushLog(s, `ถูกเลิกจ้างจาก ${s.company.name} (เงินชดเชย ${fmtCompact(s.currentSalary * severanceMultiplier)})`, 'bad'),
        }),
      }],
    };
  }

  // Want event — probability scales with extravagance + socialStatus
  const wantProb = state.traits.extravagance * 0.04 + state.traits.socialStatus * 0.02;
  if (Math.random() < wantProb) {
    const item = WANT_ITEMS[Math.floor(Math.random() * WANT_ITEMS.length)];
    const PENALTY = { 1: 2, 2: 2, 3: 5, 4: 10, 5: 12 };
    const happyPenalty = PENALTY[state.traits.extravagance] ?? 5;
    return {
      id: 'want_' + item.id,
      title: `${item.label} 🛍️`,
      desc: `${item.desc} — ราคา ${fmtCompact(item.cost)}`,
      choices: [
        {
          label: `ซื้อเลย (${fmtCompact(item.cost)})`,
          hint: '+happiness +8',
          apply: (s) => ({
            ...s,
            cash: s.cash - item.cost,
            happiness: clamp(s.happiness + 8, 0, 100),
            log: pushLog(s, `ซื้อ${item.label} ${fmtCompact(item.cost)}`, 'info'),
          }),
        },
        {
          label: 'อดทนไว้',
          hint: `-${happyPenalty} happiness`,
          apply: (s) => ({
            ...s,
            happiness: clamp(s.happiness - happyPenalty, 0, 100),
            log: pushLog(s, `อดซื้อ${item.label} — กลืนไม่เข้าคายไม่ออก`, 'info'),
          }),
        },
      ],
    };
  }

  const roll = Math.random();

  if (roll < 0.05) {
    return {
      id: 'bonus',
      title: 'โบนัสพิเศษ 🎁',
      desc: `หัวหน้าให้โบนัสพิเศษ`,
      choices: [{
        label: 'ดีใจมาก!',
        apply: (s) => {
          const amt = s.currentSalary * (0.3 + Math.random() * 0.5);
          return { ...s, cash: s.cash + amt, happiness: clamp(s.happiness + 8, 0, 100), log: pushLog(s, `ได้โบนัสพิเศษ ${fmtCompact(amt)}`, 'good') };
        },
      }],
    };
  }

  if (roll < 0.09) {
    return {
      id: 'course',
      title: `คอร์สอัพสกิล`,
      desc: `มีคอร์สน่าสนใจ`,
      choices: (() => {
        const cost = 8000 + Math.random() * 12000;
        const skillKey = ['tech', 'finance', 'creative'][Math.floor(Math.random() * 3)];
        return [
          {
            label: `ลงคอร์ส ${SKILL_META[skillKey].emoji} (${fmtCompact(cost)})`,
            hint: `+${SKILL_META[skillKey].label} skill +8`,
            apply: (s) => ({ ...s, cash: s.cash - cost, skills: { ...s.skills, [skillKey]: clamp(s.skills[skillKey] + 8, 0, 100) }, log: pushLog(s, `ลงคอร์ส ${SKILL_META[skillKey].label} +8 (${fmtCompact(cost)})`, 'good') }),
          },
          { label: 'ผ่าน', apply: (s) => s },
        ];
      })(),
    };
  }

  if (roll < 0.13) {
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
    const amt = 8000 + Math.random() * 12000;
    return {
      id: 'car',
      title: 'รถเสีย 🔧',
      desc: `รถเสียกลางทาง ค่าซ่อมประมาณ ${fmtCompact(amt)}`,
      choices: [{
        label: 'จ่ายค่าซ่อม',
        apply: (s) => ({ ...s, cash: s.cash - amt, happiness: clamp(s.happiness - 5, 0, 100), log: pushLog(s, `รถเสีย จ่ายซ่อม ${fmtCompact(amt)}`, 'bad') }),
      }],
    };
  }

  return null;
}

/**
 * Build a mild or severe illness pendingEvent.
 * choice.apply receives state with pendingEvent already cleared.
 * @param {import('../content.js').GameState} state
 * @param {boolean} severe
 * @returns {import('../content.js').PendingEvent}
 */
export function illnessEvent(state, severe) {
  if (!severe) {
    return {
      id: 'illness_mild',
      title: 'ร่างกายไม่สู้ 🤒',
      desc: `exhaustion สะสมอยู่ที่ ${Math.round(state.exhaustion)} — ร่างกายเริ่มส่งสัญญาณเตือน`,
      choices: [
        {
          label: 'ฝืนทำงานต่อ',
          hint: 'exhaustion +10, performance -3',
          apply: (s) => ({
            ...s,
            performance: s.performance - 3,
            exhaustion: clamp(s.exhaustion + 10, 0, 100),
            happiness: clamp(s.happiness - 5, 0, 100),
            log: pushLog(s, 'ฝืนทำงานทั้งที่ไม่สบาย 😰', 'bad'),
          }),
        },
        {
          label: 'หยุดพักที่บ้าน',
          hint: 'energy +20, exhaustion -20, performance -5',
          apply: (s) => ({
            ...s,
            energy: clamp(s.energy + 20, 0, 100),
            exhaustion: clamp(s.exhaustion - 20, 0, 100),
            performance: s.performance - 5,
            log: pushLog(s, 'หยุดพักรักษาตัว 💊', 'info'),
          }),
        },
      ],
    };
  }

  // Severe illness — single forced choice; may chain a layoff event
  const insurancePlan = INSURANCE_PLANS[state.insurance || 'none'];
  const baseCost = 8000 + Math.random() * 12000;
  const finalCost = baseCost * (1 - insurancePlan.coverage);
  const coverageNote = insurancePlan.coverage > 0
    ? ` (ประกันรับ ${(insurancePlan.coverage * 100).toFixed(0)}%)`
    : '';

  return {
    id: 'illness_severe',
    title: 'ป่วยหนัก ต้องนอนโรงพยาบาล 🏥',
    desc: `exhaustion ${Math.round(state.exhaustion)} — ร่างกายล้มเหลว ค่ารักษา ${fmtCompact(finalCost)}${coverageNote}${insurancePlan.firesafe ? '' : ' ⚠️ เสี่ยงถูกไล่ออก'}`,
    choices: [{
      label: 'เข้ารับการรักษา',
      apply: (s) => {
        const fireRoll = !insurancePlan.firesafe && Math.random() < 0.18;
        const base = {
          ...s,
          cash: s.cash - finalCost,
          energy: clamp(s.energy - 30, 0, 100),
          exhaustion: clamp(s.exhaustion - 30, 0, 100),
          performance: s.performance - 12,
          happiness: clamp(s.happiness - 10, 0, 100),
          log: pushLog(s, `ป่วยหนัก นอน รพ. จ่ายค่ารักษา ${fmtCompact(finalCost)}${coverageNote}`, 'bad'),
        };
        if (fireRoll) return {
          ...base,
          pendingEvent: {
            id: 'illness_fired',
            title: 'ถูกเลิกจ้างเพราะขาดงาน 😱',
            desc: 'บริษัทตัดสินใจให้ออกเนื่องจากขาดงานนาน (ซื้อประกันครอบคลุมเพื่อป้องกัน)',
            choices: [{
              label: 'รับชะตากรรม',
              apply: (st) => ({
                ...st,
                unemployed: true,
                currentSalary: 0,
                performance: 0,
                log: pushLog(st, 'ถูกไล่ออกเพราะป่วยหนัก', 'bad'),
              }),
            }],
          },
        };
        return base;
      },
    }],
  };
}

/** Job search event during unemployment. */
export function jobSearchEvent(state) {
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
