# Rhythm Practice — Implementation Patch Notes

**Date:** 2026-05-06  
**Base spec:** `2026-05-05-rhythm-practice-design.md`  
**Status:** Shipped

This document records every divergence from the original approved spec. The spec is preserved as-is for historical reference.

---

## 1. Note rendering: custom SVG → VexFlow

**Original spec:** Hand-crafted SVG via `noteGeometry.ts` (pure functions, 80×80 viewBox).  
**Actual:** `noteGeometry.ts` was never created. Instead, `NoteRenderer.svelte` uses [VexFlow 5](https://www.vexflow.com/) — a full music engraving library — which produces professionally typeset notation.

**Reason:** VexFlow handles beaming, tuplets, dotted notes, and all rest symbols with correct music-engraving rules. The hand-crafted approach would have required significant geometry work for edge cases that VexFlow already solves.

**Key gotcha (document in `CLAUDE.md`):** VexFlow sets `style="width: Xpx; height: Ypx"` as inline styles on the SVG element after every render, overriding CSS. Must override after each render:

```typescript
svg.setAttribute('viewBox', `0 0 ${REF_W} ${REF_H}`)  // REF_W=260, REF_H=180
svg.style.width = '100%'
svg.style.height = '100%'
```

---

## 2. Cell aspect ratio: square (1:1) → landscape (13:9)

**Original spec:** "The 4×4 grid is always square. Each cell is square."  
**Actual:** Cells are 13:9 (landscape), matching VexFlow's reference canvas ratio (260:180). The grid is no longer square.

**Reason:** Music staves are naturally landscape. Square cells wasted vertical space and compressed the notation. 13:9 eliminates letterboxing for the VexFlow viewBox.

**CSS implementation:**
```css
.cell-wrap { aspect-ratio: 13 / 9; }
```

---

## 3. Grid width: capped at 600px → fills viewport height

**Original spec:** `width: min(85vw, 85vh, 600px)` (implicitly capped).  
**Actual:** `width: min(90vw, calc((90vh - 220px) * 13 / 9))` — no hard cap. On large screens the grid grows to use available height.

**Reason:** On displays larger than ~700px the grid was unnecessarily small.

---

## 4. Mobile layout: desktop-only → responsive 2×8

**Original spec:** "app is desktop-focused but should be usable on tablet" — no specific mobile layout defined.  
**Actual:**
- ≤500px wide: 2-column CSS Grid (2×8 layout), 90vw width, reduced padding (6px sides)
- >500px: 4-column CSS Grid (4×4 layout)
- Active cell auto-scrolls into view on mobile during playback

**Implementation:** `@media (max-width: 500px)` in `RhythmGrid.svelte`; `$effect` auto-scroll in `App.svelte`.

---

## 5. Theme-based generation added

**Original spec:** Pure random selection from the difficulty's flat pattern pool.  
**Actual:** Added `THEMES: Record<Difficulty, Theme[]>` in `rhythmPatterns.ts`. Each 2-measure half (`generateHalf`) picks one theme and samples only from that theme's pattern subset.

**Reason:** Fully random selection produced incoherent rhythm sequences (mixing dotted rhythms with triplets with syncopation). Real exercises focus on one vocabulary at a time.

**Themes per difficulty:**

| Level | Themes |
|-------|--------|
| Basic | Quarter Note, Eighth Note, Mixed |
| Intermediate | Eighth Note, Sixteenth Subdivision, Dotted Rhythm, Syncopation |
| Advanced | Triplet, Advanced Syncopation, Mixed Advanced |

The flat `PATTERNS` pool is retained for unit test validation.

---

## 6. Default BPM: 80 → 60

**Original spec:** "BPM slider: Range 40–200, default 80."  
**Actual:** Default is 60 BPM.

**Reason:** 60 BPM maps to 1 beat per second — easier for beginners to count and a natural starting point.

---

## 7. Default difficulty: Basic → Intermediate

**Original spec:** Not explicitly stated (implied Basic from ordered list).  
**Actual:** App initializes with `difficulty = 'intermediate'`.

**Reason:** Basic patterns (quarter and eighth notes only) are too simple to be immediately engaging; Intermediate shows the full value of the app on first open.

---

## 8. Grid layout implementation: nested flex → CSS Grid

**Original spec:** `RhythmGrid` using nested flex rows (`measure-row` containing `cell-wrap`).  
**Actual:** Flat `sheet.flat()` rendered into a single CSS Grid (`grid-template-columns: repeat(4, 1fr)`).

**Reason:** CSS Grid handles responsive column switching (`repeat(2, 1fr)` on mobile) more cleanly than nested flex, and the flattened structure matches the flat `cellStates[]` array indexing.

---

## 9. Visual style: dark theme → parchment theme

**Original spec:** Dark background (`#12122a`), light text, purple difficulty buttons.  
**Actual:** Parchment background (`#f5f0e8`), dark brown text (`#2c2417`), warm brown active state (`#b07030`). Georgia serif font. English UI labels.

**Reason:** Design pivot toward a classic music manuscript aesthetic.

---

## 10. SEO and meta

Not in original spec. Added:
- `<title>Rhythm Practice</title>`
- `<meta name="description">`, `keywords`, Open Graph, Twitter Card
- Custom favicon: eighth note SVG in app brown palette (replaces Vite lightning bolt)
- Footer link to `github.com/miksin/rhythm`

---

## 11. Testing infrastructure

**Original spec:** Vitest unit tests for pattern library, generator, and note geometry.  
**Actual:**
- Unit tests: pattern library + generator (note geometry tests dropped — `noteGeometry.ts` not built)
- Added: Playwright E2E tests (`e2e/layout.spec.ts`) covering:
  - 16 cells rendered
  - 13:9 aspect ratio per cell (±5%)
  - VexFlow SVGs use `width: 100%` (not fixed px)
  - All cells visible in viewport (desktop + mobile/WebKit)
- `CLAUDE.md` documents VexFlow gotcha, cell squareness rules, and Playwright debug flow

---

## 12. Out-of-scope items that remain out of scope

All items listed in the original spec's "Out of Scope" section are unchanged.
