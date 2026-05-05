# Rhythm Practice Web App — Design Spec

**Date:** 2026-05-05  
**Stack:** Svelte 5 + Vite + TypeScript  
**Status:** Approved

---

## Overview

A web app for rhythm reading practice. Displays 16 beats arranged in a 4×4 square grid (4 beats × 4 measures). Each cell shows one beat rendered as standard music notation using SVG. A play button activates sequential cell highlighting with a metronome click sound. Rhythm patterns are randomly generated from a difficulty-tiered pattern library and continuously refreshed via a double-buffer loop.

---

## Architecture

```
src/
├── App.svelte
├── lib/
│   ├── RhythmGrid.svelte       ← 4×4 grid container, manages cell states
│   ├── BeatCell.svelte         ← Single square cell, renders SVG notation
│   ├── NoteRenderer.svelte     ← SVG drawing logic for all note types
│   ├── Controls.svelte         ← Play/stop button + BPM slider + difficulty selector
│   └── rhythmPatterns.ts       ← Pattern library per difficulty level
│   └── rhythmGenerator.ts      ← Random beat/measure generation
│   └── metronome.ts            ← Web Audio API metronome + playback state
```

---

## Data Model

```ts
type NoteValue =
  | '1/4'
  | '1/8' | '1/16'
  | '1/4-dot' | '1/8-dot'
  | 'rest-1/4' | 'rest-1/8' | 'rest-1/16'
  | 'triplet-1/8'  // three notes filling one beat

type Beat = NoteValue[]   // sum of durations = exactly 1 beat

type Measure = [Beat, Beat, Beat, Beat]   // 4 beats
type RhythmSheet = [Measure, Measure, Measure, Measure]  // 4 measures = 16 cells
```

Each `Beat` array must sum to exactly 1 beat. The generator enforces this constraint. Triplet entries always appear as groups of 3 `'triplet-1/8'` notes.

---

## Difficulty Levels

Three levels selectable via UI buttons. Switching regenerates the full sheet.

**Principle:** The pattern library includes **all unique permutations** of each note combination. For example, the combination {1/8, 1/16, 1/16} yields three patterns: `[1/8,1/16,1/16]`, `[1/16,1/8,1/16]`, `[1/16,1/16,1/8]`.

### Basic

| Combination | Permutations |
|-------------|-------------|
| {1/4} | `['1/4']` |
| {1/8, 1/8} | `['1/8','1/8']` |
| {rest-1/4} | `['rest-1/4']` |
| {1/8, rest-1/8} | `['1/8','rest-1/8']`, `['rest-1/8','1/8']` |

### Intermediate (includes all Basic patterns, plus:)

| Combination | Permutations |
|-------------|-------------|
| {1/16×4} | `['1/16','1/16','1/16','1/16']` |
| {1/8-dot, 1/16} | `['1/8-dot','1/16']`, `['1/16','1/8-dot']` |
| {1/8, 1/16, 1/16} | `['1/8','1/16','1/16']`, `['1/16','1/8','1/16']`, `['1/16','1/16','1/8']` |
| {rest-1/8, 1/8} | `['rest-1/8','1/8']` *(`['1/8','rest-1/8']` already in Basic)* |
| {rest-1/16, 1/16, 1/16, 1/16} | `['rest-1/16','1/16','1/16','1/16']`, `['1/16','rest-1/16','1/16','1/16']`, `['1/16','1/16','rest-1/16','1/16']`, `['1/16','1/16','1/16','rest-1/16']` |

### Advanced (includes all Intermediate patterns, plus:)

| Combination | Permutations |
|-------------|-------------|
| {triplet-1/8 × 3} | `['triplet-1/8','triplet-1/8','triplet-1/8']` |
| {rest-1/16, 1/16, 1/8} | `['rest-1/16','1/16','1/8']`, `['rest-1/16','1/8','1/16']`, `['1/16','rest-1/16','1/8']`, `['1/16','1/8','rest-1/16']`, `['1/8','rest-1/16','1/16']`, `['1/8','1/16','rest-1/16']` |
| {rest-1/8-dot, 1/16} | `['rest-1/8-dot','1/16']`, `['1/16','rest-1/8-dot']` |

Note: `1/4-dot` (= 1.5 beats) cannot fill a single beat cell alone. Dotted notes are valid within a beat only when combined appropriately (e.g., `['1/8-dot','1/16']` = 0.75 + 0.25 = 1 beat).

---

## Grid Layout

- The 4×4 grid is always square. Each cell is square.
- Grid fills the available viewport width; cell size = (grid width) / 4.
- Small measure separators (thicker borders) visually group cells into 4 measures.
- No staff lines inside cells — just the note symbols centered vertically within each square.

### Cell Visual States

| State | Appearance |
|-------|-----------|
| **Upcoming** | Full opacity, normal styling |
| **Active** | Orange border + light background highlight |
| **Played** | Dimmed (reduced opacity ~40%) |

When the double-buffer replaces a played half, those cells reset to "upcoming" state before playback reaches them.

---

## Double-Buffer Playback Loop

The sheet is split into two halves: front (measures 1–2, cells 1–8) and back (measures 3–4, cells 9–16).

```
Playback:   [M1][M2] → [M3][M4] → [M1*][M2*] → [M3*][M4*] → ...
Background:        ↑ regenerate M1,M2      ↑ regenerate M3,M4
```

- When playback enters measure 3, silently regenerate measures 1–2 in the background.
- When playback loops back to measure 1, silently regenerate measures 3–4 in the background.
- Regenerated cells get "upcoming" visual state immediately upon replacement.
- The loop runs indefinitely until the user presses stop.

---

## Metronome & Playback

- **Audio:** Web Audio API. Each beat plays a short oscillator click (sine wave, ~10ms fade-in, ~50ms total, ~800Hz).
- **Timing:** Uses `AudioContext.currentTime` for sample-accurate scheduling, not `setInterval`, to avoid drift.
- **BPM slider:** Range 40–200, default 80. Changes take effect on the next beat.
- **Play/Stop button:** Starts from measure 1 on play; stops and resets all cell states on stop.

---

## SVG Note Rendering

Each `BeatCell` renders an SVG sized to fill the square cell. Notes in a beat are laid out horizontally, with width proportional to their duration.

| Note Type | SVG Elements |
|-----------|-------------|
| Quarter note | Filled oval notehead + upward stem |
| Eighth note | Filled oval notehead + stem + single flag |
| Sixteenth note | Filled oval notehead + stem + double flag |
| Dotted note | Base note + small dot to the right |
| Beamed group | Two/four noteheads + stems + horizontal beam bar instead of flags |
| Quarter rest | Standard squiggle rest symbol (path) |
| Eighth rest | 7-shaped rest symbol (path) |
| Sixteenth rest | Double-hook rest symbol (path) |
| Triplet | Three beamed eighth noteheads + arc above + "3" label |

- Stems point upward. Noteheads sit on a single invisible baseline at the bottom third of the cell.
- Eighth and sixteenth notes within the same beat are beamed together (shared horizontal bar).
- All SVG paths are defined as constants in `NoteRenderer.svelte`.

---

## Out of Scope

- Score tracking or grading
- Microphone input / rhythm detection
- Time signatures other than 4/4
- Exporting or saving sessions
- Mobile touch interaction (app is desktop-focused but should be usable on tablet)
