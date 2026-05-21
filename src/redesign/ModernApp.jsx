// ModernApp.jsx — top-level controller. Phase machine: setup → game → end.
// Persists theme + game state to localStorage via storage.js.

import React, { useState, useEffect } from "react";
import { SetupWizard } from "./SetupWizard.jsx";
import { GameScreen } from "./GameScreen.jsx";
import { EndScreen } from "./EndScreen.jsx";
import { buildInitialState } from "../engine/index.js";
import { storage } from "../storage.js";

import "./shared.css";
import "./themes.css";

const THEME_KEY = "lifesim_modern_v1:theme";
const SAVE_KEY = "lifesim_save_v2";

// Convert wizard debtFlags (boolean map) → Debt[] for the engine.
function buildDebts(debtFlags) {
  const DEBT_MAP = {
    student: { id: "debt_student", name: "กยศ.",       type: "loan",  remaining: 200000,  rate: 0.01, monthly: 2200  },
    car:     { id: "debt_car",     name: "ผ่อนรถ",      type: "loan",  remaining: 600000,  rate: 0.04, monthly: 11500 },
    home:    { id: "debt_home",    name: "ผ่อนบ้าน",    type: "loan",  remaining: 2500000, rate: 0.03, monthly: 14500 },
    family:  { id: "debt_family",  name: "ส่งเงินบ้าน", type: "fixed", remaining: 0,       rate: 0,    monthly: 5000  },
  };
  return Object.entries(debtFlags)
    .filter(([, v]) => v)
    .map(([k]) => DEBT_MAP[k])
    .filter(Boolean);
}

export function ModernApp() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || "sky"; } catch { return "sky"; }
  });
  const [phase, setPhase] = useState("loading");
  const [gameState, setGameState] = useState(null);

  // Persist theme
  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  // Load save on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await storage.get(SAVE_KEY);
        if (saved?.value) {
          const parsed = JSON.parse(saved.value);
          if (parsed?.phase === "game" || parsed?.phase === "end") {
            setGameState(parsed);
            setPhase(parsed.phase);
            return;
          }
        }
      } catch {}
      setPhase("setup");
    })();
  }, []);

  const handleSetupComplete = (data) => {
    const engineState = buildInitialState({
      name:     data.name,
      traits:   data.traits,
      skills:   data.skills,
      company:  data.company,
      debts:    buildDebts(data.debts),
      lifeGoal: data.lifeGoal,
    });
    setGameState(engineState);
    setPhase("game");
    storage.set(SAVE_KEY, JSON.stringify(engineState)).catch(() => {});
  };

  const handleStateChange = (newState) => {
    setGameState(newState);
    storage.set(SAVE_KEY, JSON.stringify(newState)).catch(() => {});
    if (newState.phase === "end") setPhase("end");
  };

  const handleReset = async () => {
    try { await storage.delete(SAVE_KEY); } catch {}
    setGameState(null);
    setPhase("setup");
  };

  if (phase === "loading") return null;

  if (phase === "setup") {
    return (
      <SetupWizard
        theme={theme}
        setTheme={setTheme}
        onComplete={handleSetupComplete}
      />
    );
  }

  if (phase === "end") {
    return (
      <EndScreen
        theme={theme}
        setTheme={setTheme}
        state={gameState}
        onRestart={handleReset}
      />
    );
  }

  return (
    <GameScreen
      theme={theme}
      setTheme={setTheme}
      initialState={gameState}
      onStateChange={handleStateChange}
      onEnd={() => setPhase("end")}
      onReset={handleReset}
    />
  );
}
