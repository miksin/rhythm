# Rhythm Practice — Agent Notes

## Commands

```bash
pnpm dev --host 127.0.0.1   # dev server (use 127.0.0.1, not ::1 — EPERM on IPv6)
pnpm test                    # unit tests (Vitest)
pnpm test:e2e                # E2E layout tests (Playwright, desktop + mobile)
npx tsc --noEmit             # type check
```

## Visual debugging with Playwright MCP

When UI layout bugs are suspected, use the Playwright MCP tools to verify visually
before and after each fix. Standard flow:

```
1. pnpm dev --host 127.0.0.1   (background, dangerouslyDisableSandbox: true)
2. browser_navigate → http://127.0.0.1:5173/
3. browser_take_screenshot      (see what's broken)
4. browser_evaluate             (measure DOM dimensions)
5. fix code → reload → screenshot again
6. kill $(lsof -ti:5173)        (cleanup)
```

## VexFlow SVG sizing — critical gotcha

VexFlow sets `style="width: Xpx; height: Ypx"` as **inline styles** on the SVG
element after every render. These override both CSS rules and element attributes.

The fix (in `NoteRenderer.svelte`) — always override inline styles after rendering:

```typescript
const svg = el.querySelector('svg')
if (svg) {
  svg.setAttribute('viewBox', `0 0 ${REF_W} ${REF_H}`)
  svg.style.width = '100%'   // overrides VexFlow's inline px value
  svg.style.height = '100%'  // overrides VexFlow's inline px value
}
```

The `viewBox` + `width/height: 100%` combination makes the notation scale to any
cell size via CSS, with `preserveAspectRatio="xMidYMid meet"` (SVG default)
centering the content.

If this is ever broken, the E2E test `VexFlow SVGs use percentage dimensions` will
catch it immediately.

## Cell squareness

Cells must be square. The math that guarantees squareness:

- Grid: `width: min(85vw, 85vh, 600px); aspect-ratio: 1` → square grid
- Row/column gap must be **equal** (`gap: 8px` on both `.grid` and `.measure-row`)
- Cell: `width: 100%; height: 100%` (not `aspect-ratio: 1` — unreliable in WebKit flex)

The E2E test `each cell is square` (desktop + mobile/WebKit) guards this.

## Architecture

```
App.svelte              — state, double-buffer loop, metronome wiring
├── Controls.svelte     — BPM slider, difficulty buttons, play/stop
└── RhythmGrid.svelte   — 4×4 flex grid
    └── BeatCell.svelte — single cell (upcoming/active/played states)
        └── NoteRenderer.svelte — VexFlow rendering

src/lib/
  types.ts              — NoteValue, Beat, Measure, RhythmSheet, Difficulty, CellState
  rhythmPatterns.ts     — PATTERNS flat pool + THEMES (theme-based generation groups)
  rhythmGenerator.ts    — generateHalf(), generateSheet() — theme-aware
  metronome.ts          — Web Audio API lookahead scheduler
```

## Double-buffer playback loop

`generateHalf()` picks a random theme and fills 2 measures from that theme's
pattern pool. Each 2-measure block has consistent rhythmic vocabulary.

```
beat=0, playCount>1  → regenerate back half (measures 2-3)
beat=8               → regenerate front half (measures 0-1)
```
