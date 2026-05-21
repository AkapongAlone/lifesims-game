// panels.jsx — mid-level components. Wired to the real engine state fields.

import React, { useState, useEffect, useRef } from "react";
import { WORK_MODES, AFTER_WORK, ASSETS, GOALS, FOOD_TIERS, TRANSPORT_TIERS, INSURANCE_PLANS } from "../content.js";
import { tradeKey, pushLog } from "../engine/index.js";
import { fmtBaht, fmtBahtFull, thaiDate, deriveEveningEmoji } from "./helpers.js";
import { VitalRing, BossChip, ThemeToggle, Sparkline } from "./atoms.jsx";

// ---------- Top bar ----------
export function TopBar({ s, theme, setTheme }) {
  return (
    <div className="r-topbar glass">
      <div className="meta">
        <div className="name">{s.name} <span className="r-muted" style={{ fontWeight: 400 }}>· {s.age}</span></div>
        <div className="date">{thaiDate(s)}</div>
      </div>
      <div className="glass-pill" style={{ marginLeft: 12 }}>
        <span style={{ opacity: 0.6 }}>{s.company.emoji}</span>
        <span>{s.company.name}</span>
      </div>
      <div className="spacer" />
      <VitalRing icon="⚡" value={s.energy} />
      <VitalRing icon="❤" value={s.happiness} />
      <VitalRing icon="🫧" value={100 - s.exhaustion} />
      {setTheme && (
        <div style={{ marginLeft: 8 }}>
          <ThemeToggle theme={theme} onChange={setTheme} />
        </div>
      )}
    </div>
  );
}

// ---------- Character scene ----------
export function Scene({ s, mood }) {
  const activity = s.afterWorkActivity || "rest";
  const eveningEmoji = deriveEveningEmoji(activity);
  const wm = WORK_MODES[s.workMode] || WORK_MODES.normal;
  const [moodShift, setMoodShift] = useState(false);
  const lastFace = useRef(mood.face);

  useEffect(() => {
    if (mood.face !== lastFace.current) {
      setMoodShift(true);
      const t = setTimeout(() => setMoodShift(false), 500);
      lastFace.current = mood.face;
      return () => clearTimeout(t);
    }
  }, [mood.face]);

  return (
    <div className="r-scene">
      <div className="sky" />
      <div className="horizon" />
      <div className="divider" />
      <div className="side left">
        <div className="badge">☀ ทำงาน · {wm.label}</div>
        <BossChip performance={s.performance} />
        <div className={`r-char ${mood.anim} ${moodShift ? "mood-shift" : ""}`}>{mood.face}</div>
        {mood.face === "😄" && Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className="r-particle" style={{
            left: `${48 + i * 4}%`,
            bottom: 70,
            "--dx": `${(i - 1) * 18}px`,
            animationDelay: `${i * 0.6}s`,
            background: i === 1 ? "var(--accent)" : "var(--success)",
          }} />
        ))}
      </div>
      <div className="side right">
        <div className="badge">🌙 ตอนเย็น · {AFTER_WORK[activity]?.label ?? activity}</div>
        <div className="r-char anim-float">{eveningEmoji}</div>
      </div>
    </div>
  );
}

// ---------- Hero numbers ----------
export function Hero({ s, netWorthDelta = 0 }) {
  const goal = GOALS[s.lifeGoal];
  const positive = netWorthDelta >= 0;
  const compact = (() => {
    const n = s.netWorth;
    if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
    if (Math.abs(n) >= 1_000)     return (n / 1_000).toFixed(1) + "K";
    return Math.round(n).toLocaleString("en-US");
  })();

  const goalLine = (() => {
    if (!goal) return null;
    if (s.lifeGoal === "freedom") {
      const rem = Math.max(0, s.monthlyExpenses - s.passiveIncome);
      return `เป้าหมาย · ${goal.label} ${goal.emoji} · Passive เหลืออีก ${fmtBaht(rem)}/m`;
    }
    const targets = { millionaire: 1_000_000, house: 3_000_000, retire: 10_000_000 };
    const rem = Math.max(0, (targets[s.lifeGoal] ?? 1_000_000) - s.netWorth);
    return `เป้าหมาย · ${goal.label} ${goal.emoji} · เหลืออีก ${fmtBaht(rem)}`;
  })();

  return (
    <div className="glass r-hero">
      <div className="r-eyebrow">Net worth</div>
      <div className="net-row">
        <div className="r-big-num">
          <span style={{ font: "400 28px/1 'Noto Sans Thai'", marginRight: 6, opacity: 0.5, letterSpacing: 0 }}>฿</span>
          {compact}
        </div>
        <div className="delta" style={{ color: positive ? "var(--success)" : "var(--danger)" }}>
          {positive ? "↑" : "↓"} {Math.abs(netWorthDelta).toFixed(1)}%
        </div>
      </div>
      {goalLine && <div className="r-muted" style={{ fontSize: 12 }}>{goalLine}</div>}

      <div className="sublist">
        <div>
          <div className="label">เงินสด</div>
          <div className="value">{fmtBahtFull(s.cash)}</div>
        </div>
        <div>
          <div className="label">รายเดือน</div>
          <div className="value r-success">+{fmtBaht(s.currentSalary + s.passiveIncome)}</div>
        </div>
        <div>
          <div className="label">ค่าใช้จ่าย</div>
          <div className="value r-danger">−{fmtBaht(s.monthlyExpenses)}</div>
        </div>
        <div>
          <div className="label">Passive</div>
          <div className="value">+{fmtBaht(s.passiveIncome)}/m</div>
        </div>
      </div>
    </div>
  );
}

// ---------- Action picker ----------
export function ActionPicker({ s, setS }) {
  const activity = s.afterWorkActivity || "rest";
  const subOpt   = s.afterWorkSubOption || AFTER_WORK[activity].options[0].id;

  const setActivity = (k) => {
    setS({ ...s, afterWorkActivity: k, afterWorkSubOption: AFTER_WORK[k].options[0].id });
  };
  const setSubOpt     = (id) => setS({ ...s, afterWorkSubOption: id });
  const setStudySkill = (sk)  => setS({ ...s, studySkill: sk });

  return (
    <div className="glass r-actions">
      <div className="head">
        <div className="r-eyebrow">วันนี้</div>
        <div className="r-muted" style={{ fontSize: 11 }}>เลือกโหมดทำงาน + กิจกรรมตอนเย็น</div>
      </div>

      {/* Work mode */}
      <div className="seg" style={{ marginBottom: 14 }}>
        {Object.entries(WORK_MODES).map(([k, m]) => (
          <button key={k} className={s.workMode === k ? "on" : ""} onClick={() => setS({ ...s, workMode: k })}>
            <span>{m.emoji}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Evening activity */}
      <div className="seg">
        {Object.entries(AFTER_WORK).map(([k, a]) => (
          <button key={k} className={activity === k ? "on" : ""}
            onClick={() => setActivity(k)}
            style={{ flexDirection: "column", gap: 2, padding: "8px 4px" }}
          >
            <span style={{ fontSize: 16 }}>{a.emoji}</span>
            <span style={{ fontSize: 10 }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Study skill selector */}
      {activity === "study" && (
        <div className="sub" style={{ marginTop: 6 }}>
          <div className="r-muted" style={{ fontSize: 11, padding: "4px 0 2px" }}>เลือก skill ที่จะฝึก</div>
          {[
            { k: null,       label: "อัตโนมัติ",  color: "var(--tx-mute)" },
            { k: "tech",     label: "💻 Tech",    color: "var(--accent)"  },
            { k: "finance",  label: "📊 Finance", color: "var(--success)" },
            { k: "creative", label: "🎨 Creative",color: "var(--danger)"  },
          ].map(({ k, label, color }) => (
            <button key={String(k)} className={s.studySkill === k ? "on" : ""} onClick={() => setStudySkill(k)}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.studySkill === k ? color : "var(--tx-mute)", flex: "none" }} />
              <span style={{ color: s.studySkill === k ? color : undefined }}>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Sub-options */}
      <div className="sub">
        {AFTER_WORK[activity].options.map(opt => (
          <button key={opt.id} className={subOpt === opt.id ? "on" : ""} onClick={() => setSubOpt(opt.id)}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: subOpt === opt.id ? "var(--accent)" : "var(--tx-mute)", flex: "none" }} />
            <span>{opt.emoji} {opt.label}</span>
            <span className="desc">{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Overview sub-panel ----------
function OverviewPanel({ s }) {
  const skills = [
    { k: "tech",     label: "Tech",     icon: "💻", v: s.skills.tech,     color: "var(--accent)"  },
    { k: "finance",  label: "Finance",  icon: "📊", v: s.skills.finance,  color: "var(--success)" },
    { k: "creative", label: "Creative", icon: "🎨", v: s.skills.creative, color: "var(--danger)"  },
  ];
  const food      = FOOD_TIERS[s.foodTier]           || FOOD_TIERS[1];
  const transport = TRANSPORT_TIERS[s.transportTier] || TRANSPORT_TIERS[1];
  const insurance = INSURANCE_PLANS[s.insurance]     || INSURANCE_PLANS.none;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="r-eyebrow">ทักษะ</div>
      {skills.map(sk => (
        <div key={sk.k} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: "var(--row-hover)" }}>
          <div style={{ width: 32, height: 32, display: "grid", placeItems: "center", borderRadius: 10, background: "var(--glass-bg-strong)", fontSize: 15, flex: "none" }}>{sk.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontSize: 13, lineHeight: 1.2 }}>{sk.label}</span>
              <span style={{ font: "500 12px/1 'JetBrains Mono'", fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em", color: "var(--tx-mute)" }}>
                {sk.v.toFixed(0)}<span style={{ opacity: 0.5 }}>/100</span>
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 999, background: "var(--seg-track)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: sk.v + "%", background: sk.color, borderRadius: 999, transition: "width 0.4s ease" }} />
            </div>
          </div>
        </div>
      ))}

      <div className="r-eyebrow" style={{ marginTop: 8 }}>ค่าใช้จ่ายวันนี้</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div className="r-chip"><div className="ico">{food.emoji}</div><div><div className="label">อาหาร</div><div className="value">฿{food.cost}/วัน</div></div></div>
        <div className="r-chip"><div className="ico">{transport.emoji}</div><div><div className="label">เดินทาง</div><div className="value">฿{transport.cost}/วัน</div></div></div>
        <div className="r-chip"><div className="ico">{insurance.emoji}</div><div><div className="label">ประกัน</div><div className="value">{insurance.label}</div></div></div>
        <div className="r-chip"><div className="ico">👥</div><div><div className="label">Contacts</div><div className="value">{s.contacts.length} คน</div></div></div>
      </div>
    </div>
  );
}

// ---------- Portfolio sub-panel ----------
function PortfolioPanel({ s, setS }) {
  const [selected, setSelected] = useState("gold");
  const [bahtAmount, setBahtAmount] = useState(1000);

  // Rolling 14-day price history per asset — updated once per game day
  const priceHistRef = useRef(
    Object.fromEntries(Object.entries(ASSETS).map(([k, m]) => [k, [m.startPrice]]))
  );
  const lastDayRef = useRef(`${s.day}-${s.month}-${s.year}`);
  const dayKey = `${s.day}-${s.month}-${s.year}`;
  if (dayKey !== lastDayRef.current) {
    lastDayRef.current = dayKey;
    Object.keys(ASSETS).forEach(k => {
      const h = priceHistRef.current[k];
      h.push(s.assetPrices?.[k] ?? ASSETS[k].startPrice);
      if (h.length > 14) h.shift();
    });
  }

  const todayKey = tradeKey(s);
  const canTrade = s.lastTradeKey !== todayKey;

  const meta         = ASSETS[selected];
  const price        = s.assetPrices?.[selected]     ?? meta.startPrice;
  const holding      = s.portfolio?.[selected]       ?? 0;
  const holdingValue = holding * price;
  const costBasis    = s.portfolioCost?.[selected]   ?? 0;
  const pnl          = holdingValue - costBasis;
  const pnlPct       = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
  const tradeUnits   = price > 0 ? bahtAmount / price : 0;
  const canBuy  = canTrade && s.cash >= bahtAmount && bahtAmount > 0;
  const canSell = canTrade && holding >= tradeUnits  && bahtAmount > 0;

  const buy = () => {
    if (!canBuy) return;
    setS(prev => {
      const p     = prev.assetPrices[selected];
      const units = bahtAmount / p;
      return {
        ...prev,
        cash:          prev.cash - bahtAmount,
        portfolio:     { ...prev.portfolio,     [selected]: (prev.portfolio[selected]     || 0) + units     },
        portfolioCost: { ...prev.portfolioCost, [selected]: (prev.portfolioCost[selected] || 0) + bahtAmount },
        lastTradeKey:  todayKey,
        log: pushLog(prev, `ซื้อ ${meta.label} ${fmtBaht(bahtAmount)} (${units.toFixed(4)} ${meta.unitLabel})`, 'info'),
      };
    });
  };

  const sell = () => {
    if (!canSell) return;
    setS(prev => {
      const p     = prev.assetPrices[selected];
      const units = bahtAmount / p;
      const h     = prev.portfolio[selected]     || 0;
      const cb    = prev.portfolioCost[selected] || 0;
      const costReduce = h > 0 ? (units / h) * cb : 0;
      return {
        ...prev,
        cash:          prev.cash + bahtAmount,
        portfolio:     { ...prev.portfolio,     [selected]: Math.max(0, h - units)          },
        portfolioCost: { ...prev.portfolioCost, [selected]: Math.max(0, cb - costReduce)    },
        lastTradeKey:  todayKey,
        log: pushLog(prev, `ขาย ${meta.label} ${fmtBaht(bahtAmount)}`, 'info'),
      };
    });
  };

  const held = Object.entries(s.portfolio || {}).filter(([, v]) => v > 0.0001);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>

      {/* Asset list */}
      <div className="r-eyebrow">ตลาดวันนี้</div>
      {Object.entries(ASSETS).map(([k, m]) => {
        const p      = s.assetPrices?.[k]     ?? m.startPrice;
        const prev   = s.prevAssetPrices?.[k] ?? p;
        const delta  = prev > 0 ? ((p - prev) / prev) * 100 : 0;
        const pos    = delta >= 0;
        const color  = pos ? "var(--success)" : "var(--danger)";
        const hist   = priceHistRef.current[k] || [p];
        const isSel  = k === selected;
        return (
          <div key={k} className="r-asset"
            style={{ cursor: "pointer", background: isSel ? "var(--row-active)" : undefined, borderColor: isSel ? "var(--accent)" : undefined }}
            onClick={() => setSelected(k)}
          >
            <div className="left">
              <span style={{ fontSize: 22 }}>{m.emoji}</span>
              <div>
                <div style={{ fontSize: 13 }}>{m.label}</div>
                <div className="r-muted" style={{ fontSize: 11 }}>
                  ถือ {(s.portfolio?.[k] ?? 0) > 0.0001 ? (s.portfolio[k]).toFixed(4) : "0"} {m.unitLabel}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {hist.length >= 2 && <Sparkline data={hist} color={color} />}
              <div style={{ minWidth: 84, textAlign: "right" }}>
                <div className="px">{fmtBaht(p)}</div>
                <div className="ch" style={{ color }}>
                  {pos ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Trade panel */}
      <div className="r-eyebrow" style={{ marginTop: 10 }}>ซื้อขาย {meta.emoji} {meta.label}</div>
      <div style={{ padding: "14px 16px", borderRadius: 16, background: "var(--glass-bg-strong)", border: "1px solid var(--glass-bd)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 18px", marginBottom: 12 }}>
          <div>
            <div className="r-muted" style={{ fontSize: 10, marginBottom: 2 }}>ราคาปัจจุบัน</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{fmtBaht(price)}</div>
          </div>
          <div>
            <div className="r-muted" style={{ fontSize: 10, marginBottom: 2 }}>มูลค่าที่ถือ</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{fmtBaht(holdingValue)}</div>
          </div>
          {costBasis > 0 && (
            <>
              <div>
                <div className="r-muted" style={{ fontSize: 10, marginBottom: 2 }}>ต้นทุนรวม</div>
                <div style={{ fontSize: 13 }}>{fmtBaht(costBasis)}</div>
              </div>
              <div>
                <div className="r-muted" style={{ fontSize: 10, marginBottom: 2 }}>กำไร / ขาดทุน</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: pnl >= 0 ? "var(--success)" : "var(--danger)" }}>
                  {pnl >= 0 ? "+" : ""}{fmtBaht(pnl)} ({pnl >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)
                </div>
              </div>
            </>
          )}
        </div>

        {!canTrade && (
          <div style={{ padding: "6px 10px", borderRadius: 8, background: "var(--seg-track)", fontSize: 11, color: "var(--tx-mute)", marginBottom: 10 }}>
            ⏰ เทรดได้วันละ 1 ครั้ง — รอพรุ่งนี้
          </div>
        )}

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <input
            type="number" min="100" step="100"
            value={bahtAmount}
            onChange={e => setBahtAmount(Math.max(100, +e.target.value))}
            style={{
              flex: 1, padding: "8px 10px", borderRadius: 10,
              border: "1px solid var(--glass-bd)", background: "var(--seg-track)",
              color: "var(--tx)", font: "500 13px/1 'JetBrains Mono'",
            }}
          />
          <span className="r-muted" style={{ fontSize: 11, whiteSpace: "nowrap" }}>
            ≈ {tradeUnits.toFixed(4)} {meta.unitLabel}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="r-btn-primary" style={{ flex: 1, justifyContent: "center", padding: "10px 0" }}
            disabled={!canBuy} onClick={buy}>
            ซื้อ
          </button>
          <button className="r-btn-ghost" style={{ flex: 1, justifyContent: "center", padding: "10px 0" }}
            disabled={!canSell} onClick={sell}>
            ขาย
          </button>
        </div>
      </div>

      {/* DCA settings */}
      <div className="r-eyebrow" style={{ marginTop: 10 }}>💰 DCA รายเดือน</div>
      {Object.entries(ASSETS).map(([k, m]) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
          <span style={{ fontSize: 14, minWidth: 22 }}>{m.emoji}</span>
          <span style={{ fontSize: 12, flex: 1 }}>{m.label}</span>
          <input
            type="number" min="0" step="100"
            value={s.dcaSettings?.[k] ?? 0}
            onChange={e => setS(prev => ({
              ...prev,
              dcaSettings: { ...prev.dcaSettings, [k]: Math.max(0, +e.target.value) },
            }))}
            style={{
              width: 100, padding: "6px 8px", borderRadius: 8, textAlign: "right",
              border: "1px solid var(--glass-bd)", background: "var(--seg-track)",
              color: "var(--tx)", font: "500 12px/1 'JetBrains Mono'",
            }}
          />
          <span className="r-muted" style={{ fontSize: 11, minWidth: 36 }}>/เดือน</span>
        </div>
      ))}

      {/* Holdings P&L summary */}
      {held.length > 0 && (
        <>
          <div className="r-eyebrow" style={{ marginTop: 10 }}>พอร์ตของฉัน</div>
          {held.map(([k, units]) => {
            const m    = ASSETS[k];
            const val  = units * (s.assetPrices?.[k] ?? m.startPrice);
            const cost = s.portfolioCost?.[k] ?? 0;
            const gain = val - cost;
            const gPct = cost > 0 ? (gain / cost) * 100 : 0;
            return (
              <div key={k} style={{ padding: "10px 12px", borderRadius: 12, background: "var(--row-hover)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 13 }}>{m.emoji} {m.label}</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{fmtBaht(val)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 4 }}>
                  <span className="r-muted">{units.toFixed(4)} {m.unitLabel} · ต้นทุน {cost > 0 ? fmtBaht(cost) : "—"}</span>
                  {cost > 0 && (
                    <span style={{ color: gain >= 0 ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>
                      {gain >= 0 ? "+" : ""}{fmtBaht(gain)} ({gain >= 0 ? "+" : ""}{gPct.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ---------- Log sub-panel ----------
function LogPanel({ s }) {
  const log = [...(s.log || [])].reverse().slice(0, 30);
  const colors = { good: "var(--success)", bad: "var(--danger)", event: "var(--accent)", info: "var(--tx-mute)" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div className="r-eyebrow">บันทึก</div>
      {log.length === 0 && <div className="r-muted" style={{ fontSize: 13 }}>ยังไม่มีรายการ</div>}
      {log.map((e, i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "42px 1fr", gap: 12,
          padding: "10px 12px", borderRadius: 12, background: "var(--row-hover)",
        }}>
          <span style={{ font: "500 11px/1 'JetBrains Mono'", color: "var(--tx-mute)", letterSpacing: "0.02em" }}>
            {e.day}/{e.month}
          </span>
          <span style={{ fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors[e.kind] || colors.info, flex: "none" }} />
            {e.text}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------- Detail panel (tabs) ----------
export function DetailPanel({ s, setS }) {
  const [tab, setTab] = useState("overview");
  return (
    <div className="glass" style={{ padding: 18 }}>
      <div className="r-tabs">
        <button className={tab === "overview"  ? "on" : ""} onClick={() => setTab("overview")}>ภาพรวม</button>
        <button className={tab === "portfolio" ? "on" : ""} onClick={() => setTab("portfolio")}>พอร์ต</button>
        <button className={tab === "log"       ? "on" : ""} onClick={() => setTab("log")}>บันทึก</button>
      </div>
      {tab === "overview"  && <OverviewPanel s={s} />}
      {tab === "portfolio" && <PortfolioPanel s={s} setS={setS} />}
      {tab === "log"       && <LogPanel s={s} />}
    </div>
  );
}

// ---------- Bottom dock ----------
export function Dock({ speed, onSpeedChange, onEvent, onEnd, onReset }) {
  return (
    <div className="glass r-dock">
      <div className="speed">
        {[1, 2, 4].map(sp => (
          <button key={sp} className={speed === sp ? "on" : ""} onClick={() => onSpeedChange(sp)}>{sp}×</button>
        ))}
        <button onClick={() => onSpeedChange(0)} className={speed === 0 ? "on" : ""}>⏸</button>
      </div>
      <div className="info">⏱ 1 วัน ≈ {speed === 0 ? "—" : Math.round(8 / speed) + "s"}</div>
      <div className="right">
        <button className="ghost" onClick={onEvent}>🎲 ทดลอง event</button>
        {onEnd   && <button className="ghost" onClick={onEnd}>🏁 จบเกม</button>}
        {onReset && <button className="ghost" onClick={onReset}>↺ เริ่มใหม่</button>}
      </div>
    </div>
  );
}

// ---------- Event modal (wired to real pendingEvent) ----------
export function EventModal({ event, onChoice }) {
  return (
    <div className="r-modal-stage show">
      <div className="scrim" />
      <div className="r-modal">
        <div className="r-eyebrow" style={{ marginBottom: 8 }}>เหตุการณ์</div>
        <h3>{event.title}</h3>
        <p>{event.desc}</p>
        <div className="choices">
          {event.choices.map((choice, i) => (
            <button key={i} className="choice" onClick={() => onChoice(choice)}>
              <span>{choice.label}</span>
              {choice.hint && <span className="hint">{choice.hint}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
