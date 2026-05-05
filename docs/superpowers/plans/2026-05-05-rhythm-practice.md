# Rhythm Practice App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Svelte 5 web app that displays a 4×4 square grid of rhythm notation cells, plays them sequentially with metronome click sounds, and endlessly regenerates content via a double-buffer loop.

**Architecture:** Pure SVG note rendering via `noteGeometry.ts` (testable pure functions) feeding into Svelte components. A `Metronome` class using Web Audio API lookahead scheduling fires beat callbacks, which App.svelte uses to update cell highlight states and trigger double-buffer swaps.

**Tech Stack:** Svelte 5 (runes), TypeScript, Vite, Vitest, Web Audio API, SVG

---

## File Map

| File | Role |
|------|------|
| `src/lib/types.ts` | `NoteValue`, `Beat`, `Measure`, `RhythmSheet`, `Difficulty`, `CellState` |
| `src/lib/rhythmPatterns.ts` | `PATTERNS: Record<Difficulty, Beat[]>` — all permutations |
| `src/lib/rhythmGenerator.ts` | `generateSheet`, `generateHalf` — random selection from patterns |
| `src/lib/noteGeometry.ts` | `computePositions`, `computeRenderItems` — pure SVG layout logic |
| `src/lib/NoteRenderer.svelte` | SVG component consuming `RenderItem[]` from noteGeometry |
| `src/lib/BeatCell.svelte` | Square cell wrapper with upcoming/active/played styling |
| `src/lib/RhythmGrid.svelte` | 4×4 square grid; 4 rows (measures) × 4 cols (beats) |
| `src/lib/metronome.ts` | `Metronome` class — Web Audio lookahead scheduler |
| `src/lib/Controls.svelte` | Play/stop button, BPM slider (40–200), difficulty selector |
| `src/App.svelte` | Root: owns all state, wires metronome callbacks → double-buffer |

---

## SVG Coordinate System (viewBox "0 0 80 80")

- Notehead center: `y = 62`, `rx = 6`, `ry = 4.5`
- Stem x: `notehead.cx + 5` (right side), from `y = 58` up to `y = 22`
- Main beam: rect at `y = 22`, height `3`
- Second beam (16th): rect at `y = 28`, height `3`
- Dot: `cx = notehead.cx + 11`, `cy = 59`, `r = 2.5`
- Duration in 16th-note units: `1/4 = 4`, `1/8 = 2`, `1/16 = 1`, `1/8-dot = 3`, `triplet-1/8 = 4/3`
- Horizontal position: each 16th unit = `80 / 4 = 20 SVG units`

---

## Task 1: Vitest Setup + Types

**Files:**
- Modify: `vite.config.ts`
- Modify: `package.json`
- Create: `src/lib/types.ts`

- [ ] **Step 1: Add Vitest dependency**

```bash
cd /path/to/project && pnpm add -D vitest
```

- [ ] **Step 2: Update vite.config.ts**

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

- [ ] **Step 3: Add test script to package.json**

In `package.json`, add `"test": "vitest run"` and `"test:watch": "vitest"` to scripts.

- [ ] **Step 4: Create types.ts**

```ts
// src/lib/types.ts
export type NoteValue =
  | '1/4'
  | '1/8'
  | '1/16'
  | '1/8-dot'
  | 'rest-1/4'
  | 'rest-1/8'
  | 'rest-1/16'
  | 'rest-1/8-dot'
  | 'triplet-1/8'

export type Beat = NoteValue[]
export type Measure = [Beat, Beat, Beat, Beat]
export type RhythmSheet = [Measure, Measure, Measure, Measure]

export type Difficulty = 'basic' | 'intermediate' | 'advanced'
export type CellState = 'upcoming' | 'active' | 'played'
```

- [ ] **Step 5: Verify Vitest runs**

```bash
pnpm test
```

Expected: "No test files found" (or 0 tests pass). No errors.

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts package.json pnpm-lock.yaml src/lib/types.ts
git commit -m "feat: add Vitest and core types"
```

---

## Task 2: Pattern Library

**Files:**
- Create: `src/lib/rhythmPatterns.ts`
- Create: `src/lib/rhythmPatterns.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/rhythmPatterns.test.ts
import { describe, it, expect } from 'vitest'
import { PATTERNS } from './rhythmPatterns'
import type { Difficulty } from './types'

const DURATION: Record<string, number> = {
  '1/4': 4, '1/8': 2, '1/16': 1, '1/8-dot': 3,
  'rest-1/4': 4, 'rest-1/8': 2, 'rest-1/16': 1, 'rest-1/8-dot': 3,
  'triplet-1/8': 4 / 3,
}

describe('PATTERNS', () => {
  const difficulties: Difficulty[] = ['basic', 'intermediate', 'advanced']

  it('each difficulty has at least one pattern', () => {
    for (const d of difficulties) {
      expect(PATTERNS[d].length).toBeGreaterThan(0)
    }
  })

  it('every pattern sums to exactly 4 sixteenth-note units (one beat)', () => {
    for (const d of difficulties) {
      for (const pattern of PATTERNS[d]) {
        const total = pattern.reduce((sum, note) => sum + DURATION[note], 0)
        expect(total).toBeCloseTo(4, 5)
      }
    }
  })

  it('advanced includes all intermediate patterns', () => {
    const intStrings = new Set(PATTERNS.intermediate.map(p => JSON.stringify(p)))
    for (const p of PATTERNS.intermediate) {
      expect(intStrings.has(JSON.stringify(p))).toBe(true)
    }
    for (const p of PATTERNS.intermediate) {
      expect(
        PATTERNS.advanced.some(ap => JSON.stringify(ap) === JSON.stringify(p))
      ).toBe(true)
    }
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test
```

Expected: FAIL — "Cannot find module './rhythmPatterns'"

- [ ] **Step 3: Create rhythmPatterns.ts**

```ts
// src/lib/rhythmPatterns.ts
import type { Beat, Difficulty } from './types'

const BASIC: Beat[] = [
  ['1/4'],
  ['1/8', '1/8'],
  ['rest-1/4'],
  ['1/8', 'rest-1/8'],
  ['rest-1/8', '1/8'],
]

const INTERMEDIATE_EXTRA: Beat[] = [
  ['1/16', '1/16', '1/16', '1/16'],
  ['1/8-dot', '1/16'],
  ['1/16', '1/8-dot'],
  ['1/8', '1/16', '1/16'],
  ['1/16', '1/8', '1/16'],
  ['1/16', '1/16', '1/8'],
  ['rest-1/16', '1/16', '1/16', '1/16'],
  ['1/16', 'rest-1/16', '1/16', '1/16'],
  ['1/16', '1/16', 'rest-1/16', '1/16'],
  ['1/16', '1/16', '1/16', 'rest-1/16'],
]

const ADVANCED_EXTRA: Beat[] = [
  ['triplet-1/8', 'triplet-1/8', 'triplet-1/8'],
  ['rest-1/16', '1/16', '1/8'],
  ['rest-1/16', '1/8', '1/16'],
  ['1/16', 'rest-1/16', '1/8'],
  ['1/16', '1/8', 'rest-1/16'],
  ['1/8', 'rest-1/16', '1/16'],
  ['1/8', '1/16', 'rest-1/16'],
  ['rest-1/8-dot', '1/16'],
  ['1/16', 'rest-1/8-dot'],
]

export const PATTERNS: Record<Difficulty, Beat[]> = {
  basic: BASIC,
  intermediate: [...BASIC, ...INTERMEDIATE_EXTRA],
  advanced: [...BASIC, ...INTERMEDIATE_EXTRA, ...ADVANCED_EXTRA],
}
```

- [ ] **Step 4: Run tests to verify pass**

```bash
pnpm test
```

Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/rhythmPatterns.ts src/lib/rhythmPatterns.test.ts
git commit -m "feat: add rhythm pattern library with all permutations"
```

---

## Task 3: Rhythm Generator

**Files:**
- Create: `src/lib/rhythmGenerator.ts`
- Create: `src/lib/rhythmGenerator.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/rhythmGenerator.test.ts
import { describe, it, expect } from 'vitest'
import { generateSheet, generateHalf } from './rhythmGenerator'
import { PATTERNS } from './rhythmPatterns'
import type { Difficulty } from './types'

const DURATION: Record<string, number> = {
  '1/4': 4, '1/8': 2, '1/16': 1, '1/8-dot': 3,
  'rest-1/4': 4, 'rest-1/8': 2, 'rest-1/16': 1, 'rest-1/8-dot': 3,
  'triplet-1/8': 4 / 3,
}

const difficulties: Difficulty[] = ['basic', 'intermediate', 'advanced']

describe('generateSheet', () => {
  it('returns 4 measures of 4 beats each', () => {
    for (const d of difficulties) {
      const sheet = generateSheet(d)
      expect(sheet).toHaveLength(4)
      for (const measure of sheet) expect(measure).toHaveLength(4)
    }
  })

  it('each beat sums to exactly 4 sixteenth units', () => {
    for (const d of difficulties) {
      const sheet = generateSheet(d)
      for (const measure of sheet) {
        for (const beat of measure) {
          const total = beat.reduce((s, n) => s + DURATION[n], 0)
          expect(total).toBeCloseTo(4, 5)
        }
      }
    }
  })

  it('each beat is a pattern from the correct difficulty library', () => {
    const patternStrings = (d: Difficulty) =>
      new Set(PATTERNS[d].map(p => JSON.stringify(p)))

    for (const d of difficulties) {
      const allowed = patternStrings(d)
      const sheet = generateSheet(d)
      for (const measure of sheet) {
        for (const beat of measure) {
          expect(allowed.has(JSON.stringify(beat))).toBe(true)
        }
      }
    }
  })
})

describe('generateHalf', () => {
  it('returns 2 measures of 4 beats each', () => {
    const half = generateHalf('basic')
    expect(half).toHaveLength(2)
    for (const measure of half) expect(measure).toHaveLength(4)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test
```

Expected: FAIL — "Cannot find module './rhythmGenerator'"

- [ ] **Step 3: Create rhythmGenerator.ts**

```ts
// src/lib/rhythmGenerator.ts
import type { Beat, Measure, RhythmSheet, Difficulty } from './types'
import { PATTERNS } from './rhythmPatterns'

function randomBeat(difficulty: Difficulty): Beat {
  const patterns = PATTERNS[difficulty]
  return patterns[Math.floor(Math.random() * patterns.length)]
}

function generateMeasure(difficulty: Difficulty): Measure {
  return [
    randomBeat(difficulty),
    randomBeat(difficulty),
    randomBeat(difficulty),
    randomBeat(difficulty),
  ]
}

export function generateHalf(difficulty: Difficulty): [Measure, Measure] {
  return [generateMeasure(difficulty), generateMeasure(difficulty)]
}

export function generateSheet(difficulty: Difficulty): RhythmSheet {
  return [
    generateMeasure(difficulty),
    generateMeasure(difficulty),
    generateMeasure(difficulty),
    generateMeasure(difficulty),
  ]
}
```

- [ ] **Step 4: Run tests to verify pass**

```bash
pnpm test
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/rhythmGenerator.ts src/lib/rhythmGenerator.test.ts
git commit -m "feat: add rhythm sheet generator"
```

---

## Task 4: Note Geometry (Pure SVG Layout)

**Files:**
- Create: `src/lib/noteGeometry.ts`
- Create: `src/lib/noteGeometry.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/noteGeometry.test.ts
import { describe, it, expect } from 'vitest'
import { computePositions, computeRenderItems } from './noteGeometry'

describe('computePositions', () => {
  it('single quarter note is centered at cx=40', () => {
    const [pos] = computePositions(['1/4'])
    expect(pos.cx).toBeCloseTo(40)
  })

  it('two eighth notes are at cx=20 and cx=60', () => {
    const [a, b] = computePositions(['1/8', '1/8'])
    expect(a.cx).toBeCloseTo(20)
    expect(b.cx).toBeCloseTo(60)
  })

  it('four sixteenth notes are at cx=10,30,50,70', () => {
    const pos = computePositions(['1/16', '1/16', '1/16', '1/16'])
    expect(pos[0].cx).toBeCloseTo(10)
    expect(pos[1].cx).toBeCloseTo(30)
    expect(pos[2].cx).toBeCloseTo(50)
    expect(pos[3].cx).toBeCloseTo(70)
  })

  it('dotted eighth + sixteenth: cx=30 and cx=70', () => {
    const [a, b] = computePositions(['1/8-dot', '1/16'])
    expect(a.cx).toBeCloseTo(30)
    expect(b.cx).toBeCloseTo(70)
  })
})

describe('computeRenderItems', () => {
  it('quarter note produces notehead and stem, no flag', () => {
    const items = computeRenderItems(['1/4'])
    expect(items.some(i => i.kind === 'notehead')).toBe(true)
    expect(items.some(i => i.kind === 'stem')).toBe(true)
    expect(items.some(i => i.kind === 'flag')).toBe(false)
  })

  it('single eighth note produces single flag', () => {
    const items = computeRenderItems(['rest-1/8', '1/8'])
    const flags = items.filter(i => i.kind === 'flag')
    expect(flags).toHaveLength(1)
    expect((flags[0] as { kind: 'flag'; cx: number; count: 1 | 2 }).count).toBe(1)
  })

  it('single sixteenth note produces double flag', () => {
    const items = computeRenderItems(['rest-1/16', '1/16', 'rest-1/16', 'rest-1/16'])
    const flags = items.filter(i => i.kind === 'flag')
    expect(flags).toHaveLength(1)
    expect((flags[0] as { kind: 'flag'; cx: number; count: 1 | 2 }).count).toBe(2)
  })

  it('two eighth notes produce one beam and no flags', () => {
    const items = computeRenderItems(['1/8', '1/8'])
    expect(items.some(i => i.kind === 'beam')).toBe(true)
    expect(items.every(i => i.kind !== 'flag')).toBe(true)
  })

  it('four sixteenth notes produce two beams', () => {
    const items = computeRenderItems(['1/16', '1/16', '1/16', '1/16'])
    const beams = items.filter(i => i.kind === 'beam')
    expect(beams).toHaveLength(2)
  })

  it('rest breaks beam: [rest-1/8, 1/8] has no beam', () => {
    const items = computeRenderItems(['rest-1/8', '1/8'])
    expect(items.every(i => i.kind !== 'beam')).toBe(true)
  })

  it('rest-1/16 produces a rest-sixteenth item', () => {
    const items = computeRenderItems(['1/8', 'rest-1/16', '1/16'])
    expect(items.some(i => i.kind === 'rest-sixteenth')).toBe(true)
  })

  it('triplet produces triplet-bracket and one beam', () => {
    const items = computeRenderItems(['triplet-1/8', 'triplet-1/8', 'triplet-1/8'])
    expect(items.some(i => i.kind === 'triplet-bracket')).toBe(true)
    expect(items.some(i => i.kind === 'beam')).toBe(true)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test
```

Expected: FAIL — "Cannot find module './noteGeometry'"

- [ ] **Step 3: Create noteGeometry.ts**

```ts
// src/lib/noteGeometry.ts
import type { Beat, NoteValue } from './types'

export type NotePos = { note: NoteValue; cx: number; stemX: number }

export type RenderItem =
  | { kind: 'notehead'; cx: number; dotted: boolean }
  | { kind: 'stem'; cx: number }
  | { kind: 'flag'; cx: number; count: 1 | 2 }
  | { kind: 'beam'; x1: number; x2: number; beamIndex: 0 | 1 }
  | { kind: 'rest-quarter'; cx: number }
  | { kind: 'rest-eighth'; cx: number; dotted: boolean }
  | { kind: 'rest-sixteenth'; cx: number }
  | { kind: 'triplet-bracket'; x1: number; x2: number }

export const NOTE_DURATION: Record<NoteValue, number> = {
  '1/4': 4,
  '1/8': 2,
  '1/16': 1,
  '1/8-dot': 3,
  'rest-1/4': 4,
  'rest-1/8': 2,
  'rest-1/16': 1,
  'rest-1/8-dot': 3,
  'triplet-1/8': 4 / 3,
}

const SVG_W = 80
const BEAT_UNITS = 4

export function computePositions(beat: Beat): NotePos[] {
  let x = 0
  return beat.map(note => {
    const w = (NOTE_DURATION[note] * SVG_W) / BEAT_UNITS
    const cx = x + w / 2
    const stemX = cx + 5
    x += w
    return { note, cx, stemX }
  })
}

function isRest(note: NoteValue): boolean {
  return note.startsWith('rest-')
}

type NoteGroup =
  | { isRest: true; pos: NotePos }
  | { isRest: false; notes: NotePos[] }

function groupNotes(positions: NotePos[]): NoteGroup[] {
  const groups: NoteGroup[] = []
  let current: NotePos[] = []

  const flush = () => {
    if (current.length > 0) {
      groups.push({ isRest: false, notes: [...current] })
      current = []
    }
  }

  for (const pos of positions) {
    if (isRest(pos.note)) {
      flush()
      groups.push({ isRest: true, pos })
    } else if (pos.note === '1/4') {
      flush()
      groups.push({ isRest: false, notes: [pos] })
    } else {
      current.push(pos)
    }
  }
  flush()
  return groups
}

function renderRest(items: RenderItem[], pos: NotePos): void {
  const { note, cx } = pos
  if (note === 'rest-1/4') items.push({ kind: 'rest-quarter', cx })
  else if (note === 'rest-1/8') items.push({ kind: 'rest-eighth', cx, dotted: false })
  else if (note === 'rest-1/8-dot') items.push({ kind: 'rest-eighth', cx, dotted: true })
  else if (note === 'rest-1/16') items.push({ kind: 'rest-sixteenth', cx })
}

function renderPitchedGroup(items: RenderItem[], notes: NotePos[]): void {
  const beamed = notes.length >= 2
  const isTriplet = notes[0].note === 'triplet-1/8'

  for (const pos of notes) {
    items.push({ kind: 'notehead', cx: pos.cx, dotted: pos.note === '1/8-dot' })
    items.push({ kind: 'stem', cx: pos.cx })
  }

  if (beamed) {
    const x1 = notes[0].stemX
    const x2 = notes[notes.length - 1].stemX
    items.push({ kind: 'beam', x1, x2, beamIndex: 0 })

    const sixteenths = notes.filter(n => n.note === '1/16')
    if (sixteenths.length > 0) {
      let bx1: number, bx2: number
      if (sixteenths.length === 1) {
        const idx = notes.indexOf(sixteenths[0])
        const isLast = idx === notes.length - 1
        bx1 = isLast ? sixteenths[0].stemX - 10 : sixteenths[0].stemX
        bx2 = isLast ? sixteenths[0].stemX : sixteenths[0].stemX + 10
      } else {
        bx1 = sixteenths[0].stemX
        bx2 = sixteenths[sixteenths.length - 1].stemX
      }
      items.push({ kind: 'beam', x1: bx1, x2: bx2, beamIndex: 1 })
    }

    if (isTriplet) {
      items.push({ kind: 'triplet-bracket', x1: x1 - 5, x2: x2 + 5 })
    }
  } else {
    const { note, cx } = notes[0]
    if (note === '1/8' || note === '1/8-dot') {
      items.push({ kind: 'flag', cx, count: 1 })
    } else if (note === '1/16') {
      items.push({ kind: 'flag', cx, count: 2 })
    }
    // '1/4': no flag
  }
}

export function computeRenderItems(beat: Beat): RenderItem[] {
  const positions = computePositions(beat)
  const groups = groupNotes(positions)
  const items: RenderItem[] = []

  for (const group of groups) {
    if (group.isRest) renderRest(items, group.pos)
    else renderPitchedGroup(items, group.notes)
  }

  return items
}
```

- [ ] **Step 4: Run tests to verify pass**

```bash
pnpm test
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/noteGeometry.ts src/lib/noteGeometry.test.ts
git commit -m "feat: add pure SVG note geometry with beaming logic"
```

---

## Task 5: NoteRenderer Component

**Files:**
- Create: `src/lib/NoteRenderer.svelte`

No unit test (SVG rendering is visual; covered by noteGeometry tests).

- [ ] **Step 1: Create NoteRenderer.svelte**

```svelte
<!-- src/lib/NoteRenderer.svelte -->
<script lang="ts">
  import type { Beat } from './types'
  import { computeRenderItems, type RenderItem } from './noteGeometry'

  interface Props { beat: Beat }
  let { beat }: Props = $props()

  let items = $derived(computeRenderItems(beat))
</script>

<svg viewBox="0 0 80 80" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  {#each items as item (JSON.stringify(item))}
    {#if item.kind === 'notehead'}
      <ellipse cx={item.cx} cy={62} rx={6} ry={4.5} fill="black" />
      {#if item.dotted}
        <circle cx={item.cx + 11} cy={59} r={2.5} fill="black" />
      {/if}

    {:else if item.kind === 'stem'}
      <line x1={item.cx + 5} y1={58} x2={item.cx + 5} y2={22}
            stroke="black" stroke-width="1.5" />

    {:else if item.kind === 'flag'}
      <path d="M {item.cx + 5},22 C {item.cx + 20},30 {item.cx + 21},40 {item.cx + 9},50"
            stroke="black" stroke-width="1.5" fill="none" stroke-linecap="round" />
      {#if item.count === 2}
        <path d="M {item.cx + 5},30 C {item.cx + 20},38 {item.cx + 21},48 {item.cx + 9},58"
              stroke="black" stroke-width="1.5" fill="none" stroke-linecap="round" />
      {/if}

    {:else if item.kind === 'beam'}
      <rect x={item.x1} y={item.beamIndex === 0 ? 22 : 28}
            width={item.x2 - item.x1 + 1.5} height={3} fill="black" />

    {:else if item.kind === 'rest-quarter'}
      <path d="M {item.cx + 4},30 L {item.cx - 5},38
               C {item.cx + 4},42 {item.cx + 5},46 {item.cx - 2},52
               L {item.cx + 4},60"
            stroke="black" stroke-width="2.5" stroke-linecap="round" fill="none" />

    {:else if item.kind === 'rest-eighth'}
      <circle cx={item.cx + 2} cy={35} r={4.5} fill="black" />
      <line x1={item.cx + 5} y1={37} x2={item.cx - 4} y2={62}
            stroke="black" stroke-width="2" stroke-linecap="round" />
      {#if item.dotted}
        <circle cx={item.cx + 12} cy={33} r={2.5} fill="black" />
      {/if}

    {:else if item.kind === 'rest-sixteenth'}
      <circle cx={item.cx + 2} cy={30} r={3.5} fill="black" />
      <circle cx={item.cx + 6} cy={44} r={3.5} fill="black" />
      <line x1={item.cx + 5} y1={32} x2={item.cx - 4} y2={62}
            stroke="black" stroke-width="1.8" stroke-linecap="round" />

    {:else if item.kind === 'triplet-bracket'}
      <line x1={item.x1} y1={16} x2={item.x1} y2={11} stroke="black" stroke-width="1.2" />
      <line x1={item.x1} y1={11} x2={item.x2} y2={11} stroke="black" stroke-width="1.2" />
      <line x1={item.x2} y1={11} x2={item.x2} y2={16} stroke="black" stroke-width="1.2" />
      <text x={(item.x1 + item.x2) / 2} y={10} font-size="9"
            text-anchor="middle" font-family="serif" fill="black">3</text>
    {/if}
  {/each}
</svg>
```

- [ ] **Step 2: Verify dev server compiles without error**

```bash
pnpm dev
```

Expected: dev server starts, no TypeScript/Svelte errors in terminal.

- [ ] **Step 3: Commit**

```bash
git add src/lib/NoteRenderer.svelte
git commit -m "feat: SVG note renderer component"
```

---

## Task 6: BeatCell Component

**Files:**
- Create: `src/lib/BeatCell.svelte`

- [ ] **Step 1: Create BeatCell.svelte**

```svelte
<!-- src/lib/BeatCell.svelte -->
<script lang="ts">
  import NoteRenderer from './NoteRenderer.svelte'
  import type { Beat, CellState } from './types'

  interface Props { beat: Beat; state: CellState }
  let { beat, state }: Props = $props()
</script>

<div class="cell" class:active={state === 'active'} class:played={state === 'played'}>
  <NoteRenderer {beat} />
</div>

<style>
  .cell {
    aspect-ratio: 1;
    border: 1.5px solid #4a4a6a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    box-sizing: border-box;
    background: #1e1e3a;
    transition: opacity 0.15s, background 0.1s, border-color 0.1s;
  }

  .cell.active {
    border: 3px solid #f97316;
    background: #2d1a00;
  }

  .cell.played {
    opacity: 0.35;
  }

  .cell :global(svg) {
    display: block;
  }

  .cell :global(svg ellipse),
  .cell :global(svg circle),
  .cell :global(svg line),
  .cell :global(svg path),
  .cell :global(svg rect),
  .cell :global(svg text) {
    fill: revert;
    stroke: revert;
  }

  /* Override SVG fill/stroke to white on dark background */
  .cell :global(svg ellipse[fill="black"]),
  .cell :global(svg circle[fill="black"]),
  .cell :global(svg rect[fill="black"]) {
    fill: #e8e8f0;
  }

  .cell :global(svg line[stroke="black"]),
  .cell :global(svg path[stroke="black"]) {
    stroke: #e8e8f0;
  }

  .cell :global(svg text) {
    fill: #e8e8f0;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/BeatCell.svelte
git commit -m "feat: BeatCell component with upcoming/active/played states"
```

---

## Task 7: RhythmGrid Component

**Files:**
- Create: `src/lib/RhythmGrid.svelte`

Layout: 4 rows (measures) × 4 columns (beats) in a square grid. Thicker borders separate measures.

- [ ] **Step 1: Create RhythmGrid.svelte**

```svelte
<!-- src/lib/RhythmGrid.svelte -->
<script lang="ts">
  import BeatCell from './BeatCell.svelte'
  import type { RhythmSheet, CellState } from './types'

  interface Props {
    sheet: RhythmSheet
    cellStates: CellState[]
  }

  let { sheet, cellStates }: Props = $props()
</script>

<div class="grid">
  {#each sheet as measure, measureIdx}
    <div class="measure-row" class:last={measureIdx === 3}>
      {#each measure as beat, beatIdx}
        {@const flatIdx = measureIdx * 4 + beatIdx}
        <div class="cell-wrap" class:last-col={beatIdx === 3}>
          <BeatCell {beat} state={cellStates[flatIdx]} />
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .grid {
    display: flex;
    flex-direction: column;
    width: min(85vw, 85vh, 600px);
    aspect-ratio: 1;
    border: 2px solid #6a6a9a;
    border-radius: 4px;
    overflow: hidden;
  }

  .measure-row {
    display: flex;
    flex: 1;
    border-bottom: 3px solid #6a6a9a;
  }

  .measure-row.last {
    border-bottom: none;
  }

  .cell-wrap {
    flex: 1;
    border-right: 1.5px solid #4a4a6a;
    min-width: 0;
  }

  .cell-wrap.last-col {
    border-right: none;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/RhythmGrid.svelte
git commit -m "feat: 4x4 square RhythmGrid component"
```

---

## Task 8: Metronome

**Files:**
- Create: `src/lib/metronome.ts`

Uses Web Audio API lookahead scheduling. Audio timing is sample-accurate; UI callback uses `setTimeout` with computed delay.

- [ ] **Step 1: Create metronome.ts**

```ts
// src/lib/metronome.ts
export class Metronome {
  private ctx: AudioContext | null = null
  private schedulerTimer: ReturnType<typeof setTimeout> | null = null
  private nextBeatTime = 0
  private beatCounter = 0

  private readonly LOOKAHEAD = 0.1  // seconds to look ahead
  private readonly INTERVAL = 25    // ms between scheduler runs

  bpm = 80

  start(bpm: number, onBeat: (beat: number) => void): void {
    this.stop()
    this.ctx = new AudioContext()
    this.bpm = bpm
    this.beatCounter = 0
    this.nextBeatTime = this.ctx.currentTime

    const schedule = () => {
      const beatDuration = 60 / this.bpm

      while (this.nextBeatTime < this.ctx!.currentTime + this.LOOKAHEAD) {
        this.scheduleClick(this.nextBeatTime)

        const beat = this.beatCounter % 16
        const delayMs = Math.max(0, (this.nextBeatTime - this.ctx!.currentTime) * 1000)
        setTimeout(() => onBeat(beat), delayMs)

        this.beatCounter++
        this.nextBeatTime += beatDuration
      }

      this.schedulerTimer = setTimeout(schedule, this.INTERVAL)
    }

    schedule()
  }

  stop(): void {
    if (this.schedulerTimer !== null) {
      clearTimeout(this.schedulerTimer)
      this.schedulerTimer = null
    }
    this.ctx?.close()
    this.ctx = null
    this.beatCounter = 0
  }

  private scheduleClick(time: number): void {
    if (!this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.type = 'sine'
    osc.frequency.value = 880

    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(0.4, time + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.055)

    osc.start(time)
    osc.stop(time + 0.06)
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/metronome.ts
git commit -m "feat: Web Audio API metronome with lookahead scheduling"
```

---

## Task 9: Controls Component

**Files:**
- Create: `src/lib/Controls.svelte`

- [ ] **Step 1: Create Controls.svelte**

```svelte
<!-- src/lib/Controls.svelte -->
<script lang="ts">
  import type { Difficulty } from './types'

  interface Props {
    bpm: number
    difficulty: Difficulty
    isPlaying: boolean
    onBpmChange: (bpm: number) => void
    onDifficultyChange: (d: Difficulty) => void
    onPlay: () => void
    onStop: () => void
  }

  let {
    bpm, difficulty, isPlaying,
    onBpmChange, onDifficultyChange, onPlay, onStop,
  }: Props = $props()

  const DIFFICULTY_LABELS: Record<Difficulty, string> = {
    basic: '初級',
    intermediate: '中級',
    advanced: '進階',
  }
</script>

<div class="controls">
  <div class="difficulty-row">
    {#each (['basic', 'intermediate', 'advanced'] as Difficulty[]) as d}
      <button
        class="diff-btn"
        class:active={difficulty === d}
        disabled={isPlaying}
        onclick={() => onDifficultyChange(d)}
      >
        {DIFFICULTY_LABELS[d]}
      </button>
    {/each}
  </div>

  <div class="bpm-row">
    <span class="bpm-label">BPM</span>
    <input
      type="range"
      min="40"
      max="200"
      value={bpm}
      oninput={(e) => onBpmChange(Number(e.currentTarget.value))}
    />
    <span class="bpm-value">{bpm}</span>
  </div>

  <button
    class="play-btn"
    class:playing={isPlaying}
    onclick={isPlaying ? onStop : onPlay}
  >
    {isPlaying ? '■ 停止' : '▶ 播放'}
  </button>
</div>

<style>
  .controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;
  }

  .difficulty-row {
    display: flex;
    gap: 8px;
  }

  .diff-btn {
    padding: 8px 20px;
    border: 1.5px solid #6a6a9a;
    background: transparent;
    color: #aaa;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.15s, color 0.15s;
  }

  .diff-btn.active {
    background: #4a4aaa;
    color: white;
    border-color: #8080dd;
  }

  .diff-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .bpm-row {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #ccc;
  }

  .bpm-label {
    font-size: 13px;
    letter-spacing: 0.05em;
    width: 32px;
  }

  input[type='range'] {
    width: 180px;
    accent-color: #8080dd;
  }

  .bpm-value {
    font-size: 14px;
    width: 32px;
    text-align: right;
  }

  .play-btn {
    padding: 10px 36px;
    background: #4a4aaa;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .play-btn:hover {
    background: #6060cc;
  }

  .play-btn.playing {
    background: #aa4444;
  }

  .play-btn.playing:hover {
    background: #cc5555;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/Controls.svelte
git commit -m "feat: Controls component with play/stop, BPM slider, difficulty"
```

---

## Task 10: Wire App.svelte

**Files:**
- Modify: `src/App.svelte`
- Modify: `src/app.css`

This task connects everything: owns state, drives the double-buffer loop via metronome callbacks, and renders the full UI.

- [ ] **Step 1: Replace App.svelte**

```svelte
<!-- src/App.svelte -->
<script lang="ts">
  import { Metronome } from './lib/metronome'
  import { generateSheet, generateHalf } from './lib/rhythmGenerator'
  import RhythmGrid from './lib/RhythmGrid.svelte'
  import Controls from './lib/Controls.svelte'
  import type { Difficulty, RhythmSheet, CellState } from './lib/types'

  let difficulty = $state<Difficulty>('basic')
  let bpm = $state(80)
  let isPlaying = $state(false)
  let sheet = $state<RhythmSheet>(generateSheet('basic'))
  let cellStates = $state<CellState[]>(Array(16).fill('upcoming') as CellState[])
  let currentBeat = $state(-1)
  let playCount = $state(0)

  const metronome = new Metronome()

  function handleBeat(beat: number): void {
    // Dim previous cell, highlight current
    if (currentBeat >= 0) cellStates[currentBeat] = 'played'
    cellStates[beat] = 'active'
    currentBeat = beat

    // Double-buffer: beat=0 → loop started; beat=8 → halfway
    if (beat === 0) {
      playCount++
      if (playCount > 1) {
        // Back half (8-15) just finished → regenerate it
        const [m2, m3] = generateHalf(difficulty)
        sheet = [sheet[0], sheet[1], m2, m3]
        for (let i = 8; i < 16; i++) cellStates[i] = 'upcoming'
      }
    }

    if (beat === 8) {
      // Front half (0-7) just finished → regenerate it
      const [m0, m1] = generateHalf(difficulty)
      sheet = [m0, m1, sheet[2], sheet[3]]
      for (let i = 0; i < 8; i++) cellStates[i] = 'upcoming'
    }
  }

  function play(): void {
    isPlaying = true
    playCount = 0
    currentBeat = -1
    cellStates = Array(16).fill('upcoming') as CellState[]
    metronome.bpm = bpm
    metronome.start(bpm, handleBeat)
  }

  function stop(): void {
    isPlaying = false
    currentBeat = -1
    cellStates = Array(16).fill('upcoming') as CellState[]
    metronome.stop()
  }

  function handleBpmChange(newBpm: number): void {
    bpm = newBpm
    metronome.bpm = newBpm
  }

  function handleDifficultyChange(d: Difficulty): void {
    difficulty = d
    sheet = generateSheet(d)
  }
</script>

<main>
  <h1>節奏練習</h1>
  <Controls
    {bpm}
    {difficulty}
    {isPlaying}
    onBpmChange={handleBpmChange}
    onDifficultyChange={handleDifficultyChange}
    onPlay={play}
    onStop={stop}
  />
  <RhythmGrid {sheet} {cellStates} />
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
    padding: 32px 16px;
    min-height: 100vh;
  }

  h1 {
    font-size: 1.6rem;
    letter-spacing: 0.08em;
    color: #d0d0f0;
    margin: 0;
  }
</style>
```

- [ ] **Step 2: Update app.css for dark background**

```css
/* src/app.css */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #12122a;
  color: #e0e0f0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

- [ ] **Step 3: Run dev server and verify visually**

```bash
pnpm dev
```

Open the local URL. Verify:
- 4×4 square grid renders with notes in each cell
- Difficulty buttons switch and regenerate the grid
- BPM slider changes value
- Play button starts metronome click sounds + sequential cell highlighting
- Played cells dim, active cell highlights orange
- After 8 beats, front half regenerates silently
- Stop button resets all cells to upcoming state

- [ ] **Step 4: Run full test suite**

```bash
pnpm test
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/App.svelte src/app.css
git commit -m "feat: wire App.svelte with double-buffer playback loop"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ 4×4 square grid of cells (Task 7, 10)
- ✅ All note/rest types rendered as SVG (Tasks 4, 5)
- ✅ All difficulty levels with all permutations (Task 2)
- ✅ Beaming logic (consecutive non-rest groups) (Task 4)
- ✅ Double-buffer regeneration at beat 8 and beat 0 (Task 10)
- ✅ Three cell states: upcoming / active / played (Task 6)
- ✅ Played cells dim; regenerated cells reset to upcoming (Task 10)
- ✅ Web Audio API metronome click (Task 8)
- ✅ BPM slider 40–200, default 80 (Task 9)
- ✅ Difficulty selector disables during playback (Task 9)
- ✅ Play/Stop resets cell states (Task 10)
- ✅ Triplet bracket above beamed triplet notes (Task 4, 5)
- ✅ Dotted notes rendered with dot (Tasks 4, 5)
