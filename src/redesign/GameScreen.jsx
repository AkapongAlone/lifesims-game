// GameScreen.jsx — in-game wrapper. Connects the real tick() engine to the
// redesigned UI. Speed is lifted here so Dock can control the interval.

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { tick } from "../engine/index.js";
import { rollMonthlyEvent } from "../engine/events.js";
import { deriveMood } from "./helpers.js";
import { TopBar, Scene, Hero, ActionPicker, DetailPanel, Dock, EventModal } from "./panels.jsx";
import { Tick, MoodBadge } from "./atoms.jsx";

export function GameScreen({ theme, setTheme, initialState, onStateChange, onEnd, onReset }) {
  const [s, setS] = useState(initialState);
  const [speed, setSpeed] = useState(1);
  const prevNetWorthRef = useRef(initialState?.netWorth ?? 0);
  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;

  const mood = useMemo(() => deriveMood(s), [s]);

  // Real game loop — 1 tick = 1 in-game day.
  useEffect(() => {
    if (!s || speed === 0 || s.pendingEvent || s.phase !== "game") return;
    const ms = Math.round(8000 / speed);
    const timer = setInterval(() => {
      setS(prev => {
        if (!prev || prev.pendingEvent || prev.phase !== "game") return prev;
        prevNetWorthRef.current = prev.netWorth;
        return tick(prev);
      });
    }, ms);
    return () => clearInterval(timer);
  }, [speed, s?.pendingEvent, s?.phase]);

  // Persist + end-phase detection on each state change.
  useEffect(() => {
    if (!s) return;
    onStateChangeRef.current?.(s);
    if (s.phase === "end") onEnd?.();
  }, [s]);

  const handleSetS = useCallback((next) => setS(next), []);

  const handleChoice = useCallback((choice) => {
    setS(prev => choice.apply({ ...prev, pendingEvent: null }));
  }, []);

  const handleTestEvent = useCallback(() => {
    setS(prev => {
      if (!prev || prev.pendingEvent) return prev;
      const evt = rollMonthlyEvent(prev);
      return evt ? { ...prev, pendingEvent: evt } : prev;
    });
  }, []);

  // Net-worth delta vs previous day for the Hero panel.
  const netWorthDelta = s
    ? ((s.netWorth - prevNetWorthRef.current) / Math.abs(prevNetWorthRef.current || 1)) * 100
    : 0;

  if (!s) return null;

  return (
    <div className="r-root" data-theme={theme || "sky"}>
      <div className="r-aura"><span /></div>
      <div className="r-grain" />
      <div className="r-stage">
        <TopBar s={s} theme={theme} setTheme={setTheme} />
        <div style={{ position: "relative", gridColumn: "1 / -1" }}>
          <Scene s={s} mood={mood} />
          <MoodBadge mood={mood} />
        </div>
        <Tick speed={speed} paused={speed === 0 || !!s.pendingEvent} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Hero s={s} netWorthDelta={netWorthDelta} />
          <ActionPicker s={s} setS={handleSetS} />
        </div>
        <DetailPanel s={s} setS={handleSetS} />
        <Dock
          speed={speed}
          onSpeedChange={setSpeed}
          onEvent={handleTestEvent}
          onEnd={onEnd}
          onReset={onReset}
        />
      </div>
      {s.pendingEvent && (
        <EventModal event={s.pendingEvent} onChoice={handleChoice} />
      )}
    </div>
  );
}
