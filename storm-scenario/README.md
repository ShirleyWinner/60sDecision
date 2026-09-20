# 60s Decisions — Storm Corridor

An interactive level prototype about **calibrating trust in AI advice**. You command the MV MERIDIAN,
link one of three AI advisors, judge six pieces of intelligence as reliable or not, and issue a final
routing order. No LLM is involved — every advisor and clue is fixed, scripted data.

Built with **Next.js (App Router) + React + TypeScript**, exported as a fully static site.

## Requirements

- Node.js 18.18+ (developed on Node 26)
- npm

## Quick start

```bash
npm install
```

Development server with hot reload:

```bash
npm run dev
```

Open http://localhost:3000 .

## Build

```bash
npm run build
```

`next build` writes the static export to `out/`, and the build script copies it to **`dist/`**.
`dist/` is generated output — never edit it by hand; change `src/` and rebuild.

Preview the built site with any static file server:

```bash
npm run serve
```

That serves `dist/` on http://localhost:8765 . Any equivalent server works, for example:

```bash
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
```

Because the export uses absolute asset paths (`/_next/...`), serve `dist/` as the server **root**;
opening `dist/index.html` directly from the filesystem will not load styles or scripts.

## Scripts

| Script              | What it does                                       |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Next dev server on port 3000                        |
| `npm run build`     | Static export to `out/`, copied to `dist/`          |
| `npm run serve`     | Serve the built `dist/` on port 8765                |
| `npm run lint`      | ESLint (flat config, `next/core-web-vitals`)        |
| `npm run typecheck` | `tsc --noEmit`                                      |

## Project layout

```
src/
  app/
    layout.tsx        Document shell, metadata, viewport, global CSS imports
    page.tsx          Mounts the game into #app
    style.css         Base theme: colors, typography, panels, desktop layout
    mobile.css        Portrait "handheld" shell: HUD, radar background, sheets
  components/
    Game.tsx          State wiring, audio cues, sheets, fullscreen, keyboard
    GameHud.tsx       Top bar: stage name, disabled clock, MUSIC/SFX/immersive
    ScreenFrame.tsx   Shared title / content / dock layout + DockButton
    TacticalMap.tsx   Tactical plot SVG
    screens/          One component per phase (brief … debrief)
    sheets/           Source record and evidence review bottom sheets
  data/
    agents.ts         The three advisors, their bias and per-clue advice
    evidence.ts       Six clues: claim, source, full record, ground truth
    routes.ts         Three final routes and the outcome each leads to
    outcomes.ts       Ending copy and stage names
    types.ts          Shared types
  lib/
    gameState.ts      Reducer for the phase machine + debrief scoring
    audio.ts          Procedural Web Audio score and UI cues
    useGameAudio.ts   React hook owning one audio engine
    modelContext.ts   Optional read-only `read_operation_status` browser tool
```

All game content lives in `src/data/`, so the scenario can be retuned without touching components.

## Rules

- The countdown is currently **disabled**; no phase has a time limit.
- Situation → link exactly one AI advisor. Advisors are locked in for the run.
- Six fixed clues; each advisor gives different per-clue advice. Every clue must be judged
  TRUST or DON'T TRUST before the next one appears.
- Inspecting a source is recorded and costs nothing.
- The final routing order unlocks only after all six judgments.
- **Minor Detour**: safe, on time. **Major Detour**: safe, 25 minutes late. **Wait 1 hour**: caught
  in the storm. The Timeout ending exists in the data but is unreachable while the timer is off.
- The debrief scores correct judgments, agreement with the AI, and source checks. Time management
  scoring is off while the timer is disabled.
- Judgments never change the scenario facts. "Play again" resets the run completely.

## Interface

Portrait, handheld-style layout: fixed HUD, bottom action dock, animated radar background,
an advisor carousel (arrows, dots or swipe), one clue at a time, bottom sheets for source records
and the evidence review, then outcome and debrief.

Checked at 375×667 and 390×844; the main actions never require scrolling the page. The full evidence
review scrolls inside its own sheet. The top-right `⛶` button toggles an immersive mode that requests
fullscreen where the browser allows it — this is still a web page, not a native app package.

Fonts come from Google Fonts and fall back to system fonts offline, which does not affect gameplay.
The page stores no player data; a refresh resets the run.

## Background music and sound effects

`src/lib/audio.ts` generates an original soundtrack locally with the Web Audio API: slow harmonic
pads, sonar-like notes and bass pulses in a D minor / B-flat / F / C progression. Advisor linking,
source inspection, trust/reject judgments and each ending have distinct cues. Nothing is downloaded
and no third-party music is used.

Music and SFX default to enabled but can only start after a user gesture, per browser autoplay
rules. The separate **MUSIC** and **SFX** controls in the top bar mute each channel independently.
Audio suspends while the page is hidden.

The engine still supports countdown urgency (`setCountdown`) — faster pulses plus warning and
critical cues under 10 seconds. Nothing calls it while the timer is disabled.

## Assistant integration

When the browser exposes `document.modelContext`, the page registers one **read-only** tool,
`read_operation_status`, reporting the current phase, linked advisor, completed judgments and
outcome. It accepts no parameters and cannot change the game. Browsers without that API are
unaffected.

Simulated data, for the game only. Not for navigation.
