import { clamp } from './helpers.js';

/** Identify the skill a company demands most, or the player's current dominant skill. */
export function dominantSkillKey(company, skills) {
  if (Object.keys(company.requires || {}).length > 0) {
    let best = 'tech', bestVal = -1;
    for (const [k, req] of Object.entries(company.requires)) {
      if (req > bestVal) { bestVal = req; best = k; }
    }
    return best;
  }
  let best = 'tech', bestVal = -1;
  for (const k of ['tech', 'finance', 'creative']) {
    if (skills[k] > bestVal) { bestVal = skills[k]; best = k; }
  }
  return best;
}

/** Diminishing-returns skill gain, capped at 100. */
export function bumpSkill(skills, key, amount) {
  if (amount <= 0) return skills;
  const cur = skills[key];
  const factor = Math.max(0.1, 1 - cur / 110);
  return { ...skills, [key]: clamp(cur + amount * factor, 0, 100) };
}
