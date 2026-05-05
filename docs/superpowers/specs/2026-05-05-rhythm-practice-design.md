# Rhythm Practice Web App — Design Spec

## Overview

A rhythm practice web app built with Svelte 5 + Vite + TypeScript. Displays a 4×4 grid (4 measures × 4 beats in 4/4 time) randomly filled with rhythm patterns. Users tap along beat-by-beat while hearing audio feedback. Difficulty and BPM are adjustable.

## Requirements

### Core

- **4×4 rhythm grid**: 4 rows (measures) × 4 columns (beats), 16 beats total
- **Random rhythm generation**: Fills all 16 beats with patterns matching the selected difficulty
- **Variable-duration notes**: Patterns occupy 1–4 consecutive cells per row. Notes do not cross measure (row) boundaries
- **Difficulty selector**: Four levels — Basic, Intermediate, Advanced, All
- **BPM control**: Slider from 40–200 BPM, default 100
- **Tap-along interaction**: Press Spacebar or tap screen to advance through beats. Current beat highlights
- **Audio playback**: Web Audio API plays note sounds on each beat advance. Mute toggle available

### Difficulty Levels

| Level | Patterns Included |
|-------|------------------|
| Basic | Quarter note, eighth note pair, quarter rest (all 1-beat) |
| Intermediate | Basic + half note, half rest (2-beat), dotted half note (3-beat) |
| Advanced | Intermediate + whole note, whole rest (4-beat), sixteenth notes, syncopated patterns |
| All | Everything |

### Out of Scope

- Actual staff notation rendering (uses Unicode symbols)
- Persistent history / saved exercises
- Multi-touch or multi-player
- Rhythm input validation (user taps freely, no accuracy scoring)

## Architecture

### File Structure

```
src/
├── App.svelte              — Layout, controls, owns all state
├── lib/RhythmGrid.svelte   — 4×4 grid, beat highlighting, keyboard/tap handling
├── lib/rhythm.ts           — Types, pattern definitions, random generation
├── lib/audio.ts            — Web Audio API init, play sounds, mute toggle
└── app.css                 — Global styles (replaced)
```

### Data Flow

```
App.svelte
  state: difficulty, bpm, grid, currentBeat, isMuted
  ├─→ RhythmGrid.svelte  (props: grid, currentBeat)
  │     emits: cellClick → advance beat
  ├─→ rhythm.ts          generateGrid(difficulty) → Beat[][]
  └─→ audio.ts           init(), playBeat(beat), setMuted(bool)
```

### Component Responsibilities

**App.svelte** — Top-level layout. Owns all state via Svelte 5 runes (`$state`). Renders difficulty dropdown, BPM slider, Generate button, mute toggle. Passes grid and currentBeat down to RhythmGrid. Handles keyboard events (Spacebar).

**RhythmGrid.svelte** — Pure display component. Receives `grid` and `currentBeat` as props. Renders the 4×4 CSS grid with correctly merged cells via `grid-column: span N`. Highlights the active beat. Emits click events for tap advancement.

**rhythm.ts** — Pure functions, no side effects.
- `generateGrid(difficulty): Cell[][]` — fills 16 beats row by row
- `getPatternsForDifficulty(d): RhythmPattern[]`
- Types: `RhythmPattern`, `Cell`, `Difficulty`

**audio.ts** — Web Audio API wrapper.
- `initAudio()` — creates AudioContext, loads/generates sounds
- `playBeat(cell: Cell)` — plays appropriate sound for the pattern
- `setMuted(bool)` — toggles gain node

### Generation Algorithm

```
for each row (4 beats to fill):
  remaining = 4
  while remaining > 0:
    candidates = patterns where duration <= remaining
                 AND difficulty <= selectedDifficulty
    pattern = randomPick(candidates)
    place pattern → occupies next `duration` cells as a merged block
    remaining -= duration
```

Placed patterns produce a flat list of `Cell` objects. Consecutive cells belonging to the same pattern form a merged block rendered via CSS `grid-column: span N`.

## Data Model

```typescript
type Difficulty = 'basic' | 'intermediate' | 'advanced' | 'all';
type NoteCategory = 'note-1' | 'note-2' | 'rest' | 'long';

interface RhythmPattern {
  id: string;
  label: string;        // e.g. "四分音符"
  symbol: string;       // e.g. "♩"
  duration: number;     // beats: 1 | 2 | 3 | 4
  category: NoteCategory;
  difficulty: Difficulty;
  subdivisions: number[]; // beat offsets to play sound, e.g. [0, 0.5] for eighth pair
}

interface Cell {
  pattern: RhythmPattern;
  span: number;         // grid-column span (same as pattern.duration, but stored per cell)
  isFirst: boolean;     // true if this is the first cell of a merged block
  isActive: boolean;    // true if this is the current tap-along beat
}
```

## UI Layout

```
┌──────────────────────────────┐
│      Rhythm Practice         │  ← Title
│                              │
│  [Difficulty ▼] [Generate] 🔊│  ← Control bar
│                              │
│         ♩ = 100             │  ← BPM display
│    40 ───●──────── 200      │  ← BPM slider
│                              │
│  ┌────┬────┬────┬────┐      │
│  │ 𝅗𝅥  │ ♩  │ ♩  │      │  ← Row 1 (half + q + q)
│  ├────┴────┼────┼────┤      │
│  │    𝅝    │  𝅗𝅥. │ ♩  │      │
│  ├────┬────┬────┼────┤      │
│  │ ♩  │ ♫  │ 𝄽  │ ♩  │      │
│  ├────┴────┼────┼────┤      │
│  │    𝅝    │ ♫  │ 𝄽  │      │
│  └─────────┴────┴────┘      │
│                              │
│      Beat 5 / 16            │  ← Progress indicator
│   [Space] or tap to advance │
└──────────────────────────────┘
```

## Visual Design

### Color Palette (Pastel Macaron)

| Role | Color | Hex |
|------|-------|-----|
| Background | Warm cream | `#F8F5F0` |
| 1-beat notes (♩ ♫ ♬) | Peach pink | `#FFB5A7` |
| Eighth patterns | Soft blue | `#A8D8EA` |
| Rests (𝄽 𝄼 𝄻) | Lavender | `#C3AED6` |
| Long notes (𝅗𝅥 𝅗𝅥. 𝅝) | Mint green | `#B5EAD7` |
| Active beat | Warm peach | `#FFDAC1` |
| Text | Muted plum | `#5D5A6D` |
| Cell background | White | `#FFFFFF` |

### Typography

- Note symbols: ~52px, centered with flexbox
- Labels below symbols: ~11px, muted color
- BPM display: 20–24px, bold
- Controls: 13px system font

## Interaction Design

1. **On load**: Generate a random rhythm at default difficulty (Intermediate), BPM 100
2. **Generate button**: New random rhythm, resets currentBeat to 0
3. **Difficulty change**: Auto-regenerates grid
4. **BPM slider**: Updates in real-time, affects audio playback timing
5. **Mute toggle**: On/off, persists within session
6. **Tap-along**: Spacebar or click/tap grid → advance currentBeat by 1 (cell by cell, 0–15 index into flattened 4×4 grid). At beat 16, wraps to 0 and restarts
7. **Active beat**: Highlighted with warm peach background and slightly scaled up

## Audio System

- Web Audio API with simple synthesized sounds (square/sine wave pulses)
- Each pattern plays its subdivisions at the current BPM:
  - Quarter note: one short tone at beat start
  - Eighth pair: two tones at 0 and 0.5 beat offsets
  - Rest: silence for that beat
  - Long notes: tone at start, sustained or single attack
- Mute via GainNode gain = 0
