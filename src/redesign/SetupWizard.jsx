// SetupWizard.jsx — five-step onboarding (Name → Traits → Skills → Company → Debts+Goal)
// Uses real COMPANIES from content.js. Calls `onComplete(data)` with engine-ready setup.

import React, { useState } from "react";
import { COMPANIES, TRAIT_META, SKILL_META, GOALS } from "../content.js";
import { ThemeToggle } from "./atoms.jsx";

const DEBT_CHOICES = [
  { k: "student", label: "🎓 กยศ.",         detail: "฿200,000 @ 1% · ฿2,200/m" },
  { k: "car",     label: "🚗 ผ่อนรถ",        detail: "฿600,000 @ 4% · ฿11.5K/m" },
  { k: "home",    label: "🏠 ผ่อนบ้าน",      detail: "฿2.5M @ 3% · ฿14.5K/m" },
  { k: "family",  label: "👨‍👩‍👧 ส่งเงินบ้าน", detail: "฿5,000/m · ตลอดไป" },
];

export function SetupWizard({ onComplete, theme, setTheme }) {
  const [step, setStep]           = useState(0);
  const [name, setName]           = useState("");
  const [traits, setTraits]       = useState({ diligence: 3, extravagance: 3, socialStatus: 3 });
  const [skills, setSkills]       = useState({ tech: 10, finance: 10, creative: 10 });
  const [companyId, setCompanyId] = useState("");
  const [debtFlags, setDebtFlags] = useState({});
  const [lifeGoal, setLifeGoal]   = useState("millionaire");

  const SKILL_POOL     = 70;
  const skillUsed      = skills.tech + skills.finance + skills.creative - 30;
  const skillRemaining = SKILL_POOL - skillUsed;

  const setSkill = (k, v) => {
    const others = Object.entries(skills).filter(([key]) => key !== k).reduce((a, [, val]) => a + val, 0);
    const max    = SKILL_POOL + 30 - others;
    const next   = Math.min(100, Math.max(10, Math.min(max, v)));
    setSkills({ ...skills, [k]: next });
  };

  const eligibleCompanies = COMPANIES.map(co => {
    const failed = [];
    for (const [k, req] of Object.entries(co.requires)) {
      if (skills[k] < req) failed.push(`${SKILL_META[k].label} ${skills[k]}/${req}`);
    }
    return { ...co, _failed: failed };
  });

  const selectedCompany = eligibleCompanies.find(c => c.id === companyId);

  const titles = ["ชื่อ", "ลักษณะนิสัย", "ทักษะ", "งาน", "หนี้สิน + เป้าหมาย"];
  const helps  = [
    "ใส่ชื่อก็ได้ — เกมนี้คือคุณ",
    "ตั้งค่านิสัย 1–5 มีผลต่อรายรับ รายจ่าย และความสุข",
    "แจกแต้ม 70 (เริ่ม 10 ต่อ skill)",
    "บริษัทที่ skill ไม่ถึงจะกดไม่ได้",
    "เลือกหนี้ที่มีจริง + เป้าหมายชีวิต",
  ];

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 2) return skillRemaining >= 0;
    if (step === 3) return Boolean(selectedCompany && selectedCompany._failed.length === 0);
    return true;
  };

  const finish = () => {
    const rawCompany = selectedCompany || eligibleCompanies.find(c => c.id === "central") || COMPANIES[6];
    const { _failed, ...company } = rawCompany;
    onComplete({ name: name.trim() || "ผู้เล่น", traits, skills, lifeGoal, company, debts: debtFlags });
  };

  // Animated character preview reacts to dominant trait.
  const previewMood = (() => {
    if (traits.diligence    >= 4) return { face: "💪", anim: "anim-fast"   };
    if (traits.extravagance >= 4) return { face: "😎", anim: "anim-float"  };
    if (traits.socialStatus >= 4) return { face: "🗣️", anim: "anim-wobble" };
    return                             { face: "🙂", anim: "anim-float"  };
  })();

  return (
    <div className="r-root r-setup" data-theme={theme}>
      <div className="r-aura"><span /></div>
      <div className="r-grain" />

      <div style={{ position: "absolute", top: 20, right: 24, zIndex: 5 }}>
        <ThemeToggle theme={theme} onChange={setTheme} />
      </div>

      <div className="r-setup-card">
        <div className="brand">
          <div className={`logo ${previewMood.anim}`}>{previewMood.face}</div>
          <div className="word">LifeSim</div>
          <div className="tag">เกมจำลองชีวิตการเงิน · เริ่มต้นอายุ 22 ฿50,000</div>
        </div>

        <div className="steps">
          {titles.map((_, i) => <div key={i} className={"seg " + (i <= step ? "done" : "")} />)}
        </div>

        <div className="step-head">
          <div>
            <div className="num">ขั้นตอน {step + 1}/5</div>
            <div className="ttl">{titles[step]}</div>
          </div>
          {step === 2 && (
            <div className="glass-pill" style={{ borderColor: skillRemaining < 0 ? "var(--danger)" : "var(--glass-bd)" }}>
              <span className="r-muted">เหลือ</span>
              <span style={{ color: skillRemaining < 0 ? "var(--danger)" : "var(--accent)", fontWeight: 600 }}>
                {skillRemaining}
              </span>
            </div>
          )}
        </div>
        <p className="step-help">{helps[step]}</p>

        {/* Step 0 — Name */}
        {step === 0 && (
          <input
            className="r-setup-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="ชื่อ..."
            maxLength={20}
            autoFocus
          />
        )}

        {/* Step 1 — Traits */}
        {step === 1 && (
          <div>
            {Object.entries(TRAIT_META).map(([k, m]) => (
              <div key={k} className="r-slider-row">
                <div className="top">
                  <span className="l">{m.emoji} {m.label}</span>
                  <span className="v">{traits[k]}</span>
                </div>
                <input type="range" min={1} max={5} step={1} value={traits[k]}
                  onChange={e => setTraits({ ...traits, [k]: +e.target.value })}
                  className="r-slider" />
                <div className="desc">{m.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* Step 2 — Skills */}
        {step === 2 && (
          <div>
            {Object.entries(SKILL_META).map(([k, m]) => (
              <div key={k} className="r-slider-row">
                <div className="top">
                  <span className="l">{m.emoji} {m.label}</span>
                  <span className="v" style={{ color: m.color }}>{skills[k]}</span>
                </div>
                <input type="range" min={10} max={100} step={1} value={skills[k]}
                  onChange={e => setSkill(k, +e.target.value)}
                  className="r-slider" />
              </div>
            ))}
          </div>
        )}

        {/* Step 3 — Company */}
        {step === 3 && (
          <div className="r-company-list">
            {eligibleCompanies.map(co => {
              const locked = co._failed.length > 0;
              return (
                <div key={co.id}
                  className={"r-company-row " + (companyId === co.id ? "on " : "") + (locked ? "locked" : "")}
                  onClick={() => !locked && setCompanyId(co.id)}
                >
                  <span className="emoji">{co.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div className="name">{co.name}</div>
                    <div className="meta">
                      {co.type} · ฿{(co.salaryMin / 1000).toFixed(0)}K–฿{(co.salaryMax / 1000).toFixed(0)}K · stability {(co.stability * 100).toFixed(0)}%
                    </div>
                  </div>
                  {locked && <div className="lock">ขาด {co._failed.join(", ")}</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* Step 4 — Debts + Goal */}
        {step === 4 && (
          <div>
            <div className="r-debt-list">
              {DEBT_CHOICES.map(d => (
                <div key={d.k}
                  className={"r-debt-row " + (debtFlags[d.k] ? "on" : "")}
                  onClick={() => setDebtFlags({ ...debtFlags, [d.k]: !debtFlags[d.k] })}
                >
                  <div className="check">{debtFlags[d.k] ? "✓" : ""}</div>
                  <div style={{ flex: 1 }}>
                    <div className="name">{d.label}</div>
                    <div className="terms">{d.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ font: "500 10px/1 'JetBrains Mono'", textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--tx-mute)", margin: "20px 0 10px" }}>
              เป้าหมายชีวิต
            </div>
            <div className="r-goal-grid">
              {Object.entries(GOALS).map(([k, g]) => (
                <div key={k} className={"r-goal-row " + (lifeGoal === k ? "on" : "")} onClick={() => setLifeGoal(k)}>
                  <span className="e">{g.emoji}</span>
                  <span className="l">{g.label}</span>
                  <span className="d">{g.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="r-setup-nav">
          <button className="r-btn-ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← ย้อนกลับ</button>
          {step < 4
            ? <button className="r-btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>ต่อไป →</button>
            : <button className="r-btn-primary" onClick={finish} disabled={!selectedCompany}>เริ่มเล่น 🎮</button>
          }
        </div>
      </div>
    </div>
  );
}
