# Regular Game Mode — Design Spec

**Date:** 2026-05-07
**Status:** Approved

## Overview

Add a `regular` game mode alongside the existing `endless` mode. Regular mode loops a fixed 2-bar sheet so players can practice a specific rhythm pattern repeatedly. It includes a cell-based countdown before playback begins and a two-level theme picker (difficulty → theme) for selecting which pattern family to practice.

## Architecture

### Mode switching

`App.svelte` becomes a thin shell. It holds `mode: GameMode` state and renders tabs ("Endless" | "Regular") at the top. Below the tabs it conditionally renders either `EndlessMode.svelte` or `RegularMode.svelte`. Each mode is a self-contained component owning its own sheet state, playback loop, and mode-specific controls.

### Files changed / created

| File | Change |
|---|---|
| `src/App.svelte` | Thin shell: mode state + tab UI + conditional render |
| `src/lib/types.ts` | Add `GameMode`, `RegularSheet` types |
| `src/lib/rhythmGenerator.ts` | Add `generateFromTheme(theme)` |
| `src/lib/EndlessMode.svelte` | New — extracts current App.svelte logic |
| `src/lib/RegularMode.svelte` | New — 2-bar fixed sheet, countdown, theme picker |
| `src/lib/RhythmGrid.svelte` | Parameterize: accept `Measure[]` instead of `RhythmSheet` |
| `src/lib/CountdownRow.svelte` | New — 4 cells that pulse 1→2→3→4 before playback |

## Type additions (`types.ts`)

```typescript
export type GameMode = 'endless' | 'regular'
export type RegularSheet = [Measure, Measure]
```

`RhythmSheet` stays as `[Measure, Measure, Measure, Measure]` — used only by EndlessMode.

## Generator change (`rhythmGenerator.ts`)

Add a new export:

```typescript
export function generateFromTheme(theme: Theme): RegularSheet {
  return [generateMeasure(theme.patterns), generateMeasure(theme.patterns)]
}
```

This lets RegularMode request a specific theme rather than picking one at random.

## RhythmGrid parameterization

Change the `sheet` prop from `RhythmSheet` to `Measure[]`. The grid renders whatever measures are passed in — 2 for Regular, 4 for Endless. The 4×4 layout stays for Endless; for Regular (8 cells) the grid renders 4 cols × 2 rows on desktop (matching the existing column-per-beat pattern) and 2 cols × 4 rows on mobile.

## Regular Mode Controls

Three rows inside `RegularMode.svelte`:

1. **Difficulty row** — Basic / Intermediate / Advanced buttons (same style as Endless). Disabled while playing. Changing difficulty auto-selects the first theme for that difficulty and regenerates the sheet.
2. **Theme row** — one button per theme in the selected difficulty (e.g. "Quarter Note | Eighth Note | Mixed"). Disabled while playing. Changing theme regenerates the sheet immediately.
3. **BPM row + Play/Stop** — identical to Endless.

Initial state on mount: `difficulty = 'intermediate'`, first theme of that difficulty selected, sheet generated.

## Countdown

`CountdownRow.svelte` renders a row of 4 small cells (same visual style as `BeatCell`, but smaller and without notation). It is shown only during the countdown phase.

**Sequence when Play is pressed:**

1. `phase` transitions to `'countdown'`.
2. Metronome starts. For beats 0–3, each beat lights up one countdown cell (cell 0 on beat 0, cell 1 on beat 1, etc.).
3. On beat 4, `phase` transitions to `'playing'` and the countdown row disappears.
4. Beat counter resets to 0 and sheet playback begins normally.

The countdown row sits between the controls and the grid, visible only during `phase === 'countdown'`.

## Regular Playback Loop

- Sheet has 8 cells (beats 0–7).
- Each beat advances `currentBeat` and updates `cellStates` (upcoming → active → played).
- After beat 7, all `cellStates` reset to `'upcoming'` and `currentBeat` resets to 0. Same sheet, same theme — no regeneration.
- Loop continues until Stop is pressed.
- Stop resets `phase` to `'idle'`, clears `currentBeat`, resets all `cellStates`.

## Countdown state machine

```
idle → countdown (Play pressed)
countdown → playing (beat 4 of pre-roll completes)
playing → idle (Stop pressed)
```

## What is not in scope

- Regenerating the sheet mid-loop in Regular mode (sheet is fixed until Stop).
- Per-loop statistics or accuracy tracking.
- Carrying BPM/difficulty state across mode switches (each mode initializes its own defaults).
