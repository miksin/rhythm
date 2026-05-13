# Rhythm Practice

A web app for reading and practicing rhythm notation. Displays 16 beats in a scrolling grid, plays them sequentially with metronome click sounds, and continuously regenerates content via a double-buffer loop.

**Live:** [rhythm.miksin.art](https://rhythm.miksin.art/) · **Repo:** [github.com/miksin/rhythm](https://github.com/miksin/rhythm)

---

## Features

- **Real music notation** — rendered by [VexFlow](https://www.vexflow.com/), not hand-crafted SVG
- **Three difficulty levels** — Basic, Intermediate, Advanced
- **Theme-based generation** — each 2-measure half draws from one rhythmic theme (e.g. Dotted Rhythm, Syncopation, Triplet) for musical coherence
- **Double-buffer loop** — patterns refresh silently in the background while playing, keeping the session going indefinitely
- **Web Audio API metronome** — lookahead-scheduled click, drift-free at any BPM
- **Responsive** — 4×4 grid on desktop, 2×8 on mobile with auto-scroll to the active cell

---

## Getting Started

```bash
pnpm install
pnpm dev --host 127.0.0.1   # dev server
pnpm test                    # unit tests (Vitest)
pnpm test:e2e                # E2E layout tests (Playwright)
npx tsc --noEmit             # type check
```

> Use `--host 127.0.0.1` — the default `::1` (IPv6) causes EPERM on some systems.

---

## Stack

| Layer | Tool |
|-------|------|
| Framework | Svelte 5 (runes) |
| Build | Vite |
| Language | TypeScript |
| Notation | VexFlow 5 |
| Audio | Web Audio API |
| Unit tests | Vitest |
| E2E tests | Playwright (Chromium + WebKit/iPhone 14) |

---

## Architecture

```
src/
├── App.svelte              — state, double-buffer loop, metronome wiring
├── lib/
│   ├── Controls.svelte     — BPM slider, difficulty buttons, play/stop
│   ├── RhythmGrid.svelte   — CSS Grid layout (4-col desktop / 2-col mobile)
│   ├── BeatCell.svelte     — single cell: upcoming / active / played states
│   ├── NoteRenderer.svelte — VexFlow rendering, SVG scaling fix
│   ├── types.ts            — NoteValue, Beat, Measure, RhythmSheet, Difficulty, CellState
│   ├── rhythmPatterns.ts   — PATTERNS pool + THEMES (theme-based generation groups)
│   ├── rhythmGenerator.ts  — generateHalf(), generateSheet() — theme-aware
│   └── metronome.ts        — Web Audio API lookahead scheduler
```

### Double-buffer playback

The 16-cell sheet is split into two halves. While you're hearing the front half, the back half regenerates in the background — and vice versa. This gives infinite variety with no interruption.

```
Playing:     [M0][M1] → [M2][M3] → [M0*][M1*] → ...
Background:         ↑ regenerate M2,M3       ↑ regenerate M0,M1
```

### VexFlow SVG scaling — key gotcha

VexFlow writes `style="width: Xpx; height: Ypx"` as inline styles on the SVG after every render, overriding CSS. The fix in `NoteRenderer.svelte`:

```typescript
const svg = el.querySelector('svg')
if (svg) {
  svg.setAttribute('viewBox', `0 0 ${REF_W} ${REF_H}`)
  svg.style.width = '100%'   // overrides VexFlow's inline px value
  svg.style.height = '100%'
}
```

The E2E test `VexFlow SVGs use percentage dimensions` catches regressions.

---

## Difficulty Levels

Each difficulty adds rhythmic vocabulary on top of the previous level.

| Level | Themes |
|-------|--------|
| Basic | Quarter Note, Eighth Note, Mixed |
| Intermediate | Eighth Note, Sixteenth Subdivision, Dotted Rhythm, Syncopation |
| Advanced | Triplet, Advanced Syncopation, Mixed Advanced |

Within a single playback session, each 2-measure block draws from one theme — giving the feel of a real exercise rather than random noise.
