import { clamp, fmtCompact, pushLog, uid } from './helpers.js';
import { COMPANIES, SKILL_META } from '../content.js';
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
    // Capture compensation multiplier at roll time (fair — it's the company's offer)
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
    const amt = 5000 + Math.random() * 20000;
    return {
      id: 'hospital',
      title: 'เข้าโรงพยาบาล 🏥',
      desc: `ป่วยกะทันหัน ค่ารักษาประมาณ ${fmtCompact(amt)}`,
      choices: [{
        label: 'จ่ายค่ารักษา',
        apply: (s) => ({ ...s, cash: s.cash - amt, energy: clamp(s.energy - 30, 0, 100), happiness: clamp(s.happiness - 8, 0, 100), log: pushLog(s, `เข้าโรงพยาบาล จ่ายค่ารักษา ${fmtCompact(amt)}`, 'bad') }),
      }],
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
    const cost = 8000 + Math.random() * 12000;
    const skillKey = ['tech', 'finance', 'creative'][Math.floor(Math.random() * 3)];
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
    const amt = 8000 + Math.random() * 15000;
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
