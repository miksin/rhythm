# Rhythm Practice App — Design Document

> **Project:** `git@github.com:miksin/rhythm.git`  
> **For Hermes:** Use `subagent-driven-development` skill to implement this plan task-by-task.

---

## Goal

A web app that auto-generates printable/interactive rhythm exercise sheets (crotchets / quavers / semiquavers), displays rhythmic syllables below each note, and plays back at user-controlled BPM with a visual highlight following the beat.

---

## User Experience

1. User opens the app → sees a freshly generated exercise sheet
2. Adjusts BPM (slider or +/- buttons, default 60)
3. Clicks **Play** → metronome ticks, notes highlight in sequence
4. Can click **New Exercise** to regenerate a different sheet
5. Optionally click **Print / Export PNG** to save the sheet

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Vite + React (TypeScript)** | Fast DX, strong ecosystem |
| Music notation rendering | **VexFlow 4** | First-class SVG/Canvas notation, supports rhythmic notation on percussion clef |
| Timing / playback | **Web Audio API** (via Tone.js scheduler) | Sample-accurate metronome |
| Styling | **Tailwind CSS v4** | Utility-first, easy dark mode |
| Testing | **Vitest + Testing Library** | Co-located with Vite |

---

## Architecture Overview

```
src/
  lib/
    rhythm-engine/      # Pure TS: note generation, syllable mapping, measure validation
      generator.ts      # Random exercise generator
      syllables.ts      # Note type → syllable string (Ta / Ti-ti / Ti-ka-ti-ka / Ehm)
      types.ts          # NoteValue, Measure, Exercise types
    notation/
      renderer.ts       # Wraps VexFlow: Exercise → SVG
    playback/
      metronome.ts      # Tone.js Transport wrapper, emits beat events
  components/
    ExerciseSheet.tsx   # Renders the SVG notation + syllables overlay
    BpmControl.tsx      # Slider + numeric input
    PlaybackBar.tsx     # Play / Stop / New Exercise buttons
    App.tsx             # Top-level state orchestration
  main.tsx
```

---

## Data Model

```ts
// src/lib/rhythm-engine/types.ts

export type NoteValue = 'quarter' | 'eighth' | 'sixteenth' | 'eighth-rest';

export interface Note {
  value: NoteValue;        // rhythmic duration
  syllable: string;        // "Ta" | "Ti" | "ti-ka" | "Ehm" …
  durationTicks: number;   // in PPQ ticks (e.g. 480 = quarter at 480 PPQ)
  beamGroup?: number;      // notes sharing a beam share the same group id
}

export interface Measure {
  notes: Note[];
  totalTicks: number;      // must equal 4 * 480 for 4/4
}

export interface Exercise {
  title: string;           // e.g. "Exercise 3"
  subtitle: string;        // e.g. "Crotchet, quaver & semiquaver"
  timeSignature: [number, number]; // [4, 4]
  measures: Measure[];
  totalMeasures: number;
}
```

---

## Feature Phases

### Phase 1 — Static Render (MVP)

- [x] Scaffold Vite + React + TypeScript + Tailwind
- [ ] Implement `rhythm-engine`: types, syllable map, random generator
- [ ] Implement VexFlow renderer: render one Exercise as SVG on a single-line (percussion) staff
- [ ] Render syllables below each note (positioned via VexFlow tick position)
- [ ] Hardcode one exercise to verify render output

### Phase 2 — Playback

- [ ] BpmControl component (range 40–200, default 60)
- [ ] Tone.js metronome: schedule a tick per subdivision, emit `beatTick` events
- [ ] ExerciseSheet subscribes to `beatTick` → highlights active note
- [ ] Play / Stop / Pause controls

### Phase 3 — Exercise Generation

- [ ] Random generator: given `difficulty` (1–3), generate 8–16 measures
  - Difficulty 1: crotchets only
  - Difficulty 2: crotchets + quavers
  - Difficulty 3: all three + rests
- [ ] "New Exercise" regenerates and resets playback
- [ ] Seed-based generation (URL param `?seed=abc`) for reproducibility/sharing

### Phase 4 — Polish

- [ ] Responsive layout: full sheet view on desktop, scrollable on mobile
- [ ] Print stylesheet (hide controls, show sheet full-width)
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts: Space = play/stop, R = regenerate, +/- = BPM

---

## VexFlow Integration Notes

- Use `Stave` with percussion clef (no pitch needed, only rhythmic values)
- Map `NoteValue` → VexFlow `StaveNote` duration strings: `quarter` → `"q"`, `eighth` → `"8"`, `sixteenth` → `"16"`, `eighth-rest` → `"8r"`
- Beaming: use `Beam.generateBeams(notes)` for automatic beam grouping
- Syllable overlay: after `formatter.format()`, read each note's `getX()` to position `<text>` elements in SVG coordinate space
- Render target: `<div id="notation">` → VexFlow Renderer with SVG backend

---

## Syllable Mapping

| Note Type | Syllable(s) |
|---|---|
| Crotchet (quarter) | **Ta** |
| Quaver pair (eighth × 2) | **Ti-ti** |
| Semiquaver group (×4) | **ti-ka-ti-ka** |
| Eighth rest | **Ehm** |
| Single quaver (beamed with semis) | **Ti** / **ka** depending on position |

---

## Acceptance Criteria

- [ ] Generates valid 4/4 measures (ticks always sum to 4 beats)
- [ ] Syllables are horizontally aligned under corresponding notes
- [ ] BPM slider updates playback in real time without restarting
- [ ] Note highlight follows the beat accurately (< 20ms jitter)
- [ ] Print output matches the reference exercise image style

---

## Open Questions

1. **Difficulty selector** — simple 3-level radio, or a more detailed note-type toggle?
2. **Audio feedback** — only visual highlight, or also a click/woodblock sound per beat?
3. **Measure count** — fixed 15 measures (like the example), or variable?
4. **Export** — PNG export via `html2canvas` or server-side render?

---

## File Checklist (Phase 1)

```
rhythm/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── ExerciseSheet.tsx
│   │   ├── BpmControl.tsx
│   │   └── PlaybackBar.tsx
│   └── lib/
│       ├── rhythm-engine/
│       │   ├── types.ts
│       │   ├── syllables.ts
│       │   └── generator.ts
│       ├── notation/
│       │   └── renderer.ts
│       └── playback/
│           └── metronome.ts
└── PLAN.md
```
