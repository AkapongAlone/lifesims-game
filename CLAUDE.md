# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


## Coding Behavior

When writing, modifying, or reviewing code in this repository, follow the behavioral guidelines in `/AI_GUIDELINES.md`.

In particular:
- think before coding and surface assumptions,
- prefer the simplest solution that fully solves the task,
- make surgical changes only,
- avoid unrelated refactors or speculative improvements,
- define clear success criteria and verify the result.

## Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server (Vite, hot reload)
npm run build     # production build to dist/
npm run preview   # preview production build locally
```

No test suite is configured.

## Architecture

The app is split across `src/lifesim.jsx` (UI + React), `src/content.js` (all data constants), `src/engine/` (pure game logic), and `src/storage.js` (localStorage adapter). `src/main.jsx` is a thin entry point.

### File map

| File | Role |
|---|---|
| `src/content.js` | All immutable game data: `COMPANIES`, `WORK_MODES`, `AFTER_WORK`, `ASSETS`, `GOALS`, `SKILL_META`, `TRAIT_META`, `FOOD_TIERS`, `TRANSPORT_TIERS`, `INSURANCE_PLANS`, `WANT_ITEMS`, `NEWS_EVENTS`. All balancing lives here. Also contains the `GameState` JSDoc typedef. |
| `src/engine/index.js` | `buildInitialState()` and `tick()` — the pure daily game loop. |
| `src/engine/settlement.js` | `monthlySettlement()` (payroll, tax, DCA, insurance premium, debt) and `applyReview()`. |
| `src/engine/events.js` | `rollMonthlyEvent()`, `illnessEvent()`, `jobSearchEvent()`. |
| `src/engine/portfolio.js` | `stepAssetPrices()`, `portfolioValueOf()`, `passiveIncomeOf()`. |
| `src/engine/tax.js` | `computeMonthlyTax()`, `calcEmployedGross()`, `calcLifestyleSpend()`. |
| `src/engine/skills.js` | `dominantSkillKey()`, `bumpSkill()`. |
| `src/engine/helpers.js` | `clamp`, `fmt`, `fmtCompact`, `monthLabel`, `uid`, `tradeKey`, `pushLog`. |
| `src/lifesim.jsx` | All React UI components and the `App` root (game loop, save/load). |
| `src/storage.js` | `window.storage` / `localStorage` adapter. |

### Key design decisions

- **All CSS is injected via a `<style>` tag** inside `App` using a template-literal `CSS` constant. Class names are prefixed `ls-`. Colors are CSS custom properties defined in `:root`.
- **All game state** is a single `GameState` object managed with `useState`. Shape is fully typed via JSDoc in `content.js`.
- **No external state library** — state updates are plain `setState` calls with spread/replace patterns.
- **Save format**: `SAVE_KEY = 'lifesim_save_v2'` in localStorage. Increment the version when the GameState shape changes incompatibly.
- **`pendingEvent`** is a one-at-a-time modal; the tick is a no-op while one is pending. `handleChoice` passes state with `pendingEvent: null` into `choice.apply()` so choices can chain a new event (e.g. severe illness → fired). The modal blocks Escape key and has no backdrop-click dismiss — only player choice can close it.
- **Game loop** is `useEffect` + `setInterval`. One tick = one in-game day.

### Game concepts

- Player has `traits` (diligence, extravagance, socialStatus), `skills` (tech, finance, creative), a current `company`, `debts`, `portfolio` (assets), and `contacts`.
- Each day the player chooses a `workMode`, an `afterWorkActivity`, and an `afterWorkSubOption` within that activity. The tick applies their combined effects.
- **After-work sub-options**: each of the 6 activities has 2–3 named daily sub-options with distinct trade-offs (cost, energy, happiness, skill). The `invest` activity has a single sub-option `inv_news` (news popup); manual trading is always accessible from the portfolio panel.
- **Study skill selector**: `studySkill` (null | 'tech' | 'finance' | 'creative') lets the player pick which skill to train. null = auto (dominant skill for their company). Shown as buttons when study activity is selected.
- **Daily living costs**: `foodTier` (0–2) and `transportTier` (0–2) are deducted every tick from cash, with small energy/happiness effects. Monthly lifestyle spending (`calcLifestyleSpend`) covers everything else (reduced base multiplier 0.07 vs original 0.15 to avoid double-counting).
- **Exhaustion**: `exhaustion` (0–100) accumulates when energy is low and drains when energy is high. Each day, if `exhaustion > 30`, there is a daily probability of triggering an illness `pendingEvent`. Mild illness is ignorable; severe illness (exhaustion ≥ 70) forces a hospital bill and may trigger firing.
- **Insurance**: `insurance` field ('none' | 'basic' | 'full') sets a monthly premium and reduces illness costs. 'full' also prevents illness-related firing.
- **DCA**: `dcaSettings` is a per-asset monthly baht amount. Applied automatically in `monthlySettlement()` after payroll. Manual trading requires `afterWorkActivity === 'invest'` and `afterWorkSubOption === 'inv_trade'`. All trades use baht amounts (not unit counts); units = baht / price.
- **Want events**: triggered monthly, probability proportional to `extravagance + socialStatus` traits. Refusing costs happiness proportional to extravagance.
- **News popup**: triggered when `afterWorkSubOption === 'inv_news'`. Finance skill ≥ 60 shows the clear hint; below 60 shows a vague hint.
- `pendingEvent` is a one-at-a-time modal event with player choices; the tick pauses until resolved.
- Game ends on bankruptcy (cash < −฿500,000) or age 80 (`phase: 'end'`).

### Deployment

`vercel.json` rewrites all routes to `index.html` for SPA routing on Vercel.
