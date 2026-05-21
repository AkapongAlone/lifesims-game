// EndScreen.jsx — game summary screen (Net Worth, lifetime totals, skill bars, restart).

import React from "react";
import { ThemeToggle } from "./atoms.jsx";

export function EndScreen({ state, onRestart, theme, setTheme }) {
  const won = state.netWorth >= 1_000_000;
  const banner = won
    ? { ico: "🏆", title: "บรรลุเป้าหมาย" }
    : { ico: "🌅", title: "จบชีวิตการทำงาน" };

  return (
    <div className="r-root r-end" data-theme={theme}>
      <div className="r-aura"><span /></div>
      <div className="r-grain" />

      <div style={{ position: "absolute", top: 20, right: 24, zIndex: 5 }}>
        <ThemeToggle theme={theme} onChange={setTheme} />
      </div>

      <div className="r-end-card">
        <div className="summary">
          <div className="ico">{banner.ico}</div>
          <div className="ttl">{banner.title}</div>
          <div className="sub">{state.name} · อายุ {state.age} · เล่นมา {state.year - 2024} ปี</div>
        </div>

        <div className="r-end-grid">
          <div className="r-end-stat">
            <div className="label">Net Worth สุดท้าย</div>
            <div className="value serif" style={{ color: state.netWorth < 0 ? "var(--danger)" : "var(--success)" }}>
              <span style={{ font: "400 18px 'Noto Sans Thai'", opacity: 0.5, marginRight: 4 }}>฿</span>
              {Math.abs(state.netWorth).toLocaleString("en-US")}
            </div>
          </div>
          <div className="r-end-stat">
            <div className="label">เงินสด</div>
            <div className="value">฿{Math.round(state.cash).toLocaleString("en-US")}</div>
          </div>
          <div className="r-end-stat">
            <div className="label">รายได้รวมตลอดชีวิต</div>
            <div className="value">฿{Math.round(state.totalEarned || 0).toLocaleString("en-US")}</div>
          </div>
          <div className="r-end-stat">
            <div className="label">ภาษีจ่ายสะสม</div>
            <div className="value">฿{Math.round(state.totalTaxPaid || 0).toLocaleString("en-US")}</div>
          </div>
        </div>

        <div className="r-end-skills">
          <div className="title">ทักษะปลายเกม</div>
          {[
            ["tech",     "💻 Tech",     state.skills.tech,     "var(--accent)"],
            ["finance",  "📊 Finance",  state.skills.finance,  "var(--success)"],
            ["creative", "🎨 Creative", state.skills.creative, "var(--danger)"],
          ].map(([k, lbl, v, c]) => (
            <div key={k} className="row">
              <span className="lbl">{lbl}</span>
              <div className="bar"><div className="fill" style={{ width: v + "%", background: c }} /></div>
              <span className="v">{Math.round(v)}</span>
            </div>
          ))}
        </div>

        <button className="r-btn-primary" onClick={onRestart} style={{ width: "100%", justifyContent: "center", padding: "14px 20px" }}>
          🔄 เริ่มชีวิตใหม่
        </button>
      </div>
    </div>
  );
}
