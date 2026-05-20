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

This is a single-file React app. All game logic, UI, data constants, and inline CSS live in **`src/lifesim.jsx`** (~1200+ lines). `src/main.jsx` is a thin entry point that mounts the default export from `lifesim.jsx`.

### Key design decisions

- **All CSS is injected via a `<style>` tag** inside the component using a template-literal `CSS` constant. Class names are prefixed `ls-`. Colors come from the `C` palette object at the top of the file.
- **All game state** is a single `GameState` object (typed via JSDoc `@typedef`) managed with `useState`. The shape is defined in the JSDoc block near the top of the file.
- **No external state library** — state updates are plain `setState` calls with spread/replace patterns.
- **`window.storage` vs `localStorage`**: The original code was built for Claude artifact sandboxes where `window.storage` is injected. For standalone deployment, replace `window.storage` calls with `localStorage`.
- **Inline data constants** (`COMPANIES`, `WORK_MODES`, `AFTER_WORK`, `ASSETS`, `GOALS`, `SKILL_META`, `TRAIT_META`) are module-level and immutable. All balancing lives here.
- **Game loop** is driven by a `useEffect` + `setInterval` tick. One tick = one in-game day. The tick function mutates a draft of `GameState` then calls `setState`.

### Game concepts

- Player has `traits` (diligence, extravagance, socialStatus), `skills` (tech, finance, creative), a current `company`, `debts`, `portfolio` (assets), and `contacts`.
- Each day the player chooses a `workMode` and `afterWorkActivity`; the tick applies their effects to energy, happiness, performance, and skills.
- `pendingEvent` is a one-at-a-time modal event with player choices; the tick pauses until resolved.
- Game ends on bankruptcy or age 80 (`phase: 'end'`).

### Deployment

`vercel.json` rewrites all routes to `index.html` for SPA routing on Vercel.
