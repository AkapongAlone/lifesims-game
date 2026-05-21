// helpers.js — pure formatting + derive functions.

import { THAI_MONTHS } from "./data.js";

export function fmtBaht(n) {
  if (n == null) return "—";
  if (Math.abs(n) >= 1_000_000) return "฿" + (n / 1_000_000).toFixed(2) + "M";
  if (Math.abs(n) >= 1_000)     return "฿" + (n / 1_000).toFixed(1) + "K";
  return "฿" + Math.round(n).toLocaleString("en-US");
}

export const fmtBahtFull = (n) => "฿" + Math.round(n).toLocaleString("en-US");

export function thaiDate(s) {
  return `${s.day} ${THAI_MONTHS[s.month]} ${s.year + 543}`;
}

// Derive character face + animation class from vitals.
export function deriveMood(s) {
  if (s.exhaustion > 70) return { face: "😵‍💫", anim: "anim-shake",  vibe: "เหนื่อยมาก" };
  if (s.energy    < 30)  return { face: "😪",   anim: "anim-breath", vibe: "ง่วงนอน"   };
  if (s.happiness < 30)  return { face: "😔",   anim: "anim-wobble", vibe: "ห่อเหี่ยว"  };
  if (s.happiness > 75)  return { face: "😄",   anim: "anim-joy",    vibe: "อารมณ์ดีมาก" };
  if (s.workMode === "serious") return { face: "🤓", anim: "anim-fast",   vibe: "โฟกัส" };
  if (s.workMode === "slack")   return { face: "😏", anim: "anim-breath", vibe: "ชิวๆ"  };
  return                           { face: "🙂", anim: "anim-float",  vibe: "ปกติ" };
}

export function deriveEveningEmoji(activity) {
  const map = {
    rest:          "😴",
    entertainment: "🎮",
    study:         "📚",
    freelance:     "💻",
    socialize:     "🍻",
    invest:        "📊",
  };
  return map[activity] || "✨";
}

// Boss reaction — 5 tiers.
export function deriveBoss(performance) {
  if (performance >  20) return { face: "🤩", label: "ประทับใจมาก",    color: "var(--success)" };
  if (performance >   5) return { face: "😊", label: "หัวหน้าพอใจ",      color: "var(--success)" };
  if (performance >  -5) return { face: "😐", label: "เฉยๆ",             color: "var(--tx-mute)" };
  if (performance > -20) return { face: "😒", label: "ไม่ค่อยพอใจ",      color: "var(--accent)"  };
  return                       { face: "😡", label: "หัวหน้าโกรธมาก",    color: "var(--danger)"  };
}
