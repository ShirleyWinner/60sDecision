# 60s Decisions — Storm Corridor

An interactive level prototype about **calibrating trust in AI advice**. You command the MV MERIDIAN,
link one of three AI advisors, judge six pieces of intelligence as reliable or not, and issue a final
routing order. No LLM is involved — every advisor and clue is fixed, scripted data.

Built with **Next.js (App Router) + React + TypeScript**. The after-action debrief calls an LLM
through OpenRouter from a server route, so the app runs on Node rather than as a static export.

## Requirements

- Node.js 18.18+ (developed on Node 26)
- npm
- An [OpenRouter](https://openrouter.ai/keys) API key, for the debrief's Personalized Feedback
  section. The game is fully playable without one — that section falls back to a locally
  generated summary.

## Quick start

```bash
npm install
cp .env.example .env.local   # then paste your OpenRouter key into .env.local
```

`.env.local` is gitignored and read only on the server, so the key never reaches the browser:

```
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=anthropic/claude-sonnet-5   # optional
```

Development server with hot reload:

```bash
npm run dev
```

Open http://localhost:3000 .

## Production

```bash
npm run build
npm start
```

This needs a Node process — there is no static `dist/` any more, because the debrief depends on
the `/api/debrief` server route holding the API key.

## Scripts

| Script              | What it does                                       |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Next dev server on port 3000                        |
| `npm run build`     | Production build                                    |
| `npm start`         | Serve the production build on port 3000             |
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
  app/api/debrief/
    route.ts          Server route: builds the prompt, calls OpenRouter
  lib/
    gameState.ts      Reducer for the phase machine + phase 4/5 trajectory
    debrief.ts        Mission outcome, decision profile, trust calibration
    useFeedback.ts    Fetches the LLM feedback, falls back locally
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

## Debrief

The after-action screen has five sections. The first four are computed locally from the run, in
`src/lib/debrief.ts`:

1. **Mission Outcome** — final order, ending, arrival and whether it was on time, crew safety, and
   deliberation time. There is no "time remaining" because the countdown is disabled; the screen
   reports elapsed time on the clues and on the final order instead.
2. **Your Decision Profile** — one of Evidence-Led Commander, Cautious Verifier, AI-Aligned
   Operator, Independent Strategist or Rapid Responder. Each archetype scores 0..1 from the same
   normalised signals (accuracy, source checks, agreement rate, independence, speed) and the
   highest wins, so the label always traces back to what the player did.
3. **AI Trust Calibration** — not just "how often you agreed", but the four quadrants of advisor
   correctness against player choice: correct adoption, correct challenge, blind trust, wrong
   rejection. These always sum to six.
4. **Evidence Review** — per clue: the player's call, the advisor's recommendation, ground truth,
   whether the source was inspected, and why the claim holds or fails.
5. **Personalized Feedback** — generated by an LLM from the run's trajectory. See below.

### Personalized Feedback

`POST /api/debrief` receives the trajectory summary, builds a prompt containing the scenario facts,
the ground truth, and what the player actually did, and asks OpenRouter for 2-3 sentences (60 words
max). The request is fired once per run.

The player never supplies free text, so nothing player-authored enters the prompt.

If `OPENROUTER_API_KEY` is unset, or OpenRouter errors or times out, the section falls back to a
locally generated summary and labels itself as such. The game never blocks on the network — the
other four sections render immediately.

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
