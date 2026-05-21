// atoms.jsx — small reusable UI bits.

import React, { useState, useEffect, useMemo, useRef } from "react";
import { deriveBoss } from "./helpers.js";

// Tiny inline SVG line chart for the asset rows.
export function Sparkline({ data, color }) {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 64, h = 22;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg className="sparkline" width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Apple-watch style ring with center icon.
export function VitalRing({ icon, value }) {
  return (
    <div className="vital">
      <div className="ring" style={{ "--p": value }}>
        <span className="ico">{icon}</span>
      </div>
      <div className="v">{Math.round(value)}</div>
    </div>
  );
}

// Theme toggle pill — sun / moon.
export function ThemeToggle({ theme, onChange }) {
  return (
    <div className="r-theme-toggle" role="group" aria-label="theme">
      <button className={theme === "sky" ? "on" : ""}    onClick={() => onChange("sky")}    title="Light · Sky">☀</button>
      <button className={theme === "vision" ? "on" : ""} onClick={() => onChange("vision")} title="Dark · Vision">☾</button>
    </div>
  );
}

// Day-tick progress bar. speed controls animation duration; paused freezes it.
export function Tick({ speed = 1, paused = false }) {
  const duration = speed > 0 ? `${(8 / speed).toFixed(1)}s` : "8s";
  return (
    <div className="r-tick">
      <div className="fill" style={{
        animationDuration: duration,
        animationPlayState: paused ? "paused" : "running",
      }} />
    </div>
  );
}

// Mood badge floating above the scene.
export function MoodBadge({ mood }) {
  return (
    <div style={{
      position: "absolute",
      top: 18, left: "50%", transform: "translateX(-50%)",
      zIndex: 3,
      padding: "6px 14px",
      borderRadius: 999,
      background: "var(--glass-bg-strong)",
      backdropFilter: "blur(20px)",
      border: "1px solid var(--glass-bd)",
      font: "500 11px/1 'Noto Sans Thai'",
      letterSpacing: "-0.005em",
      display: "flex", gap: 6, alignItems: "center",
    }}>
      <span style={{ fontSize: 14 }}>{mood.face}</span>
      <span className="r-muted">รู้สึก</span>
      <span>{mood.vibe}</span>
    </div>
  );
}

// Boss reaction chip — small pulse when the label changes.
export function BossChip({ performance }) {
  const state = useMemo(() => deriveBoss(performance), [performance]);
  const [pulse, setPulse] = useState(false);
  const last = useRef(state.label);
  useEffect(() => {
    if (state.label !== last.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      last.current = state.label;
      return () => clearTimeout(t);
    }
  }, [state.label]);

  return (
    <div className={`r-boss ${pulse ? "pulse" : ""}`}>
      <span className="face">{state.face}</span>
      <span className="text">
        <span className="eb">หัวหน้า</span>
        <span className="lbl" style={{ color: state.color }}>{state.label}</span>
      </span>
    </div>
  );
}
