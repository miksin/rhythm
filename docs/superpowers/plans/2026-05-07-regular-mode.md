# Regular Game Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `regular` game mode alongside the existing `endless` mode — 2 fixed looping bars, cell-based countdown, and a two-level difficulty→theme picker.

**Architecture:** `App.svelte` becomes a thin shell rendering mode tabs and switching between `EndlessMode.svelte` (current logic extracted verbatim) and `RegularMode.svelte` (new). `RhythmGrid.svelte` is parameterized to accept `Measure[]` so it works for both 2- and 4-measure sheets. `CountdownRow.svelte` provides the pre-roll beat visualization.

**Tech Stack:** Svelte 5 runes (`$state`, `$derived`, `$props`), TypeScript, VexFlow (no changes), Web Audio API via existing `Metronome` class, Vitest (unit tests), Playwright (E2E).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/types.ts` | Modify | Add `GameMode`, `RegularSheet` types |
| `src/lib/rhythmGenerator.ts` | Modify | Add `generateFromTheme(theme)` |
| `src/lib/rhythmGenerator.test.ts` | Modify | Tests for `generateFromTheme` |
| `src/lib/RhythmGrid.svelte` | Modify | Accept `Measure[]`, add `.regular` CSS class for 2-measure layout |
| `src/lib/EndlessMode.svelte` | Create | Extract current `App.svelte` playback logic verbatim |
| `src/lib/CountdownRow.svelte` | Create | 4 pulsing cells for pre-roll countdown display |
| `src/lib/RegularMode.svelte` | Create | 2-bar fixed sheet, countdown, theme picker, looping playback |
| `src/App.svelte` | Modify | Thin shell: mode state + tabs + conditional render |

---

## Task 1: Add Type Definitions

**Files:**
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Add `GameMode` and `RegularSheet` to `types.ts`**

Open `src/lib/types.ts`. It currently ends at line 17. Add two lines after the existing exports:

```typescript
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

export type GameMode = 'endless' | 'regular'
export type RegularSheet = [Measure, Measure]
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add GameMode and RegularSheet types"
```

---

## Task 2: Add `generateFromTheme` to the Generator

**Files:**
- Modify: `src/lib/rhythmGenerator.ts`
- Modify: `src/lib/rhythmGenerator.test.ts`

- [ ] **Step 1: Write the failing test**

Add a new `describe` block at the end of `src/lib/rhythmGenerator.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { generateSheet, generateHalf, generateFromTheme } from './rhythmGenerator'
import { PATTERNS, THEMES } from './rhythmPatterns'
import type { Difficulty } from './types'

// ... existing tests unchanged ...

describe('generateFromTheme', () => {
  it('returns exactly 2 measures of 4 beats each', () => {
    const theme = THEMES.basic[0]
    const sheet = generateFromTheme(theme)
    expect(sheet).toHaveLength(2)
    for (const measure of sheet) expect(measure).toHaveLength(4)
  })

  it('each beat belongs to the given theme pattern pool', () => {
    const theme = THEMES.intermediate[1] // Sixteenth Subdivision
    const allowed = new Set(theme.patterns.map(p => JSON.stringify(p)))
    const sheet = generateFromTheme(theme)
    for (const measure of sheet) {
      for (const beat of measure) {
        expect(allowed.has(JSON.stringify(beat))).toBe(true)
      }
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test
```

Expected: FAIL — `generateFromTheme is not a function` (or similar import error).

- [ ] **Step 3: Implement `generateFromTheme`**

In `src/lib/rhythmGenerator.ts`, import `RegularSheet` and `Theme`, then add the export after `generateSheet`:

```typescript
import type { Beat, Measure, RhythmSheet, Difficulty, RegularSheet } from './types'
import { PATTERNS, THEMES } from './rhythmPatterns'
import type { Theme } from './rhythmPatterns'

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateMeasure(patterns: Beat[]): Measure {
  return [pick(patterns), pick(patterns), pick(patterns), pick(patterns)]
}

export function generateHalf(difficulty: Difficulty): [Measure, Measure] {
  const theme = pick(THEMES[difficulty])
  return [generateMeasure(theme.patterns), generateMeasure(theme.patterns)]
}

export function generateSheet(difficulty: Difficulty): RhythmSheet {
  const [m0, m1] = generateHalf(difficulty)
  const [m2, m3] = generateHalf(difficulty)
  return [m0, m1, m2, m3]
}

export function generateFromTheme(theme: Theme): RegularSheet {
  return [generateMeasure(theme.patterns), generateMeasure(theme.patterns)]
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/rhythmGenerator.ts src/lib/rhythmGenerator.test.ts
git commit -m "feat: add generateFromTheme for theme-pinned regular mode sheets"
```

---

## Task 3: Parameterize RhythmGrid

**Files:**
- Modify: `src/lib/RhythmGrid.svelte`

- [ ] **Step 1: Replace the full file content**

`RhythmGrid.svelte` must accept `Measure[]` instead of `RhythmSheet` so both 2- and 4-measure sheets work. Replace the entire file:

```svelte
<!-- src/lib/RhythmGrid.svelte -->
<script lang="ts">
  import BeatCell from './BeatCell.svelte'
  import type { Measure, CellState } from './types'

  interface Props {
    sheet: Measure[]
    cellStates: CellState[]
  }

  let { sheet, cellStates }: Props = $props()
  const regular = $derived(sheet.length === 2)
</script>

<div class="grid" class:regular>
  {#each sheet.flat() as beat, i}
    <div class="cell-wrap">
      <BeatCell {beat} state={cellStates[i]} />
    </div>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    /* Fit within viewport: constrain by width OR by available height (90vh minus controls/padding) */
    width: min(90vw, calc((90vh - 220px) * 13 / 9));
  }

  /* 2-measure grid doesn't need the height-based width constraint */
  .grid.regular {
    width: min(90vw, 600px);
  }

  /* Mobile: 2 columns × 8 rows (endless) or 2 × 4 rows (regular) */
  @media (max-width: 500px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
      width: 90vw;
    }
  }

  .cell-wrap {
    aspect-ratio: 13 / 9;
    min-width: 0;
    min-height: 0;
  }
</style>
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors (callers pass `RhythmSheet` which is `[Measure, Measure, Measure, Measure]` — assignable to `Measure[]`).

- [ ] **Step 3: Commit**

```bash
git add src/lib/RhythmGrid.svelte
git commit -m "feat: parameterize RhythmGrid to accept Measure[] for 2- or 4-bar sheets"
```

---

## Task 4: Extract EndlessMode.svelte

**Files:**
- Create: `src/lib/EndlessMode.svelte`

This is a near-verbatim extraction of the current `App.svelte` logic. `App.svelte` will become a thin shell in Task 7.

- [ ] **Step 1: Create `src/lib/EndlessMode.svelte`**

```svelte
<!-- src/lib/EndlessMode.svelte -->
<script lang="ts">
  import { Metronome } from './metronome'
  import { generateSheet, generateHalf } from './rhythmGenerator'
  import RhythmGrid from './RhythmGrid.svelte'
  import Controls from './Controls.svelte'
  import type { Difficulty, RhythmSheet, CellState, Measure } from './types'

  let difficulty = $state<Difficulty>('intermediate')
  let bpm = $state(60)
  let isPlaying = $state(false)
  let sheet = $state<RhythmSheet>(generateSheet('intermediate'))
  let cellStates = $state<CellState[]>(Array(16).fill('upcoming') as CellState[])
  let currentBeat = $state(-1)
  let playCount = $state(0)

  const metronome = new Metronome()

  $effect(() => {
    if (currentBeat < 0 || !isPlaying) return
    if (window.innerWidth > 500) return
    document.querySelector('.cell.active')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })

  function handleBeat(beat: number): void {
    if (currentBeat >= 0) cellStates[currentBeat] = 'played'
    cellStates[beat] = 'active'
    currentBeat = beat

    if (beat === 0) {
      playCount++
      if (playCount > 1) {
        const [m2, m3] = generateHalf(difficulty)
        sheet = [sheet[0], sheet[1], m2, m3]
        for (let i = 8; i < 16; i++) cellStates[i] = 'upcoming'
      }
    }

    if (beat === 8) {
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

<Controls
  {bpm}
  {difficulty}
  {isPlaying}
  onBpmChange={handleBpmChange}
  onDifficultyChange={handleDifficultyChange}
  onPlay={play}
  onStop={stop}
/>
<RhythmGrid sheet={sheet as Measure[]} {cellStates} />
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/EndlessMode.svelte
git commit -m "feat: extract EndlessMode component from App"
```

---

## Task 5: Create CountdownRow.svelte

**Files:**
- Create: `src/lib/CountdownRow.svelte`

- [ ] **Step 1: Create `src/lib/CountdownRow.svelte`**

Four small cells in a row. `activeBeat` is -1 (none lit) or 0–3 (which cell is active).

```svelte
<!-- src/lib/CountdownRow.svelte -->
<script lang="ts">
  interface Props { activeBeat: number }
  let { activeBeat }: Props = $props()
</script>

<div class="countdown-row">
  {#each [0, 1, 2, 3] as i}
    <div class="countdown-cell" class:active={activeBeat === i}></div>
  {/each}
</div>

<style>
  .countdown-row {
    display: flex;
    gap: 8px;
  }

  .countdown-cell {
    width: 40px;
    height: 40px;
    border-radius: 3px;
    border: 1.5px solid #c8a878;
    background: transparent;
    transition: background 0.1s, border-color 0.1s;
  }

  .countdown-cell.active {
    background: #fff3dc;
    border-color: #b07030;
  }
</style>
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/CountdownRow.svelte
git commit -m "feat: add CountdownRow component for pre-roll beat visualization"
```

---

## Task 6: Create RegularMode.svelte

**Files:**
- Create: `src/lib/RegularMode.svelte`

- [ ] **Step 1: Create `src/lib/RegularMode.svelte`**

Key design notes:
- `absoluteBeat` is a plain `let` (not `$state`) — it's a raw counter, not reactive UI.
- `phase` drives what is rendered: `'idle'` → just controls + grid; `'countdown'` → controls + CountdownRow + grid; `'playing'` → controls + grid.
- `cellStates` has 8 entries (2 measures × 4 beats).
- `handleBeat` ignores the metronome's `beat` parameter and uses `absoluteBeat` exclusively.

```svelte
<!-- src/lib/RegularMode.svelte -->
<script lang="ts">
  import { Metronome } from './metronome'
  import { generateFromTheme } from './rhythmGenerator'
  import { THEMES } from './rhythmPatterns'
  import RhythmGrid from './RhythmGrid.svelte'
  import CountdownRow from './CountdownRow.svelte'
  import type { Difficulty, RegularSheet, CellState, Measure } from './types'
  import type { Theme } from './rhythmPatterns'

  type Phase = 'idle' | 'countdown' | 'playing'

  const DIFFICULTY_LABELS: Record<Difficulty, string> = {
    basic: 'Basic',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  }

  let difficulty = $state<Difficulty>('intermediate')
  let selectedTheme = $state<Theme>(THEMES['intermediate'][0])
  let bpm = $state(60)
  let phase = $state<Phase>('idle')
  let sheet = $state<RegularSheet>(generateFromTheme(THEMES['intermediate'][0]))
  let cellStates = $state<CellState[]>(Array(8).fill('upcoming') as CellState[])
  let currentBeat = $state(-1)
  let countdownActiveBeat = $state(-1)

  const metronome = new Metronome()
  let absoluteBeat = -1

  const isPlaying = $derived(phase !== 'idle')
  const themes = $derived(THEMES[difficulty])

  function handleBeat(_: number): void {
    absoluteBeat++

    if (absoluteBeat < 4) {
      countdownActiveBeat = absoluteBeat
      return
    }

    if (absoluteBeat === 4) {
      phase = 'playing'
      countdownActiveBeat = -1
    }

    const sheetBeat = (absoluteBeat - 4) % 8
    if (sheetBeat === 0 && absoluteBeat > 4) {
      cellStates = Array(8).fill('upcoming') as CellState[]
      currentBeat = -1
    }
    if (currentBeat >= 0) cellStates[currentBeat] = 'played'
    cellStates[sheetBeat] = 'active'
    currentBeat = sheetBeat
  }

  function play(): void {
    absoluteBeat = -1
    countdownActiveBeat = -1
    currentBeat = -1
    cellStates = Array(8).fill('upcoming') as CellState[]
    phase = 'countdown'
    metronome.bpm = bpm
    metronome.start(bpm, handleBeat)
  }

  function stop(): void {
    metronome.stop()
    phase = 'idle'
    currentBeat = -1
    countdownActiveBeat = -1
    cellStates = Array(8).fill('upcoming') as CellState[]
  }

  function handleBpmChange(newBpm: number): void {
    bpm = newBpm
    metronome.bpm = newBpm
  }

  function handleDifficultyChange(d: Difficulty): void {
    difficulty = d
    selectedTheme = THEMES[d][0]
    sheet = generateFromTheme(selectedTheme)
  }

  function handleThemeChange(theme: Theme): void {
    selectedTheme = theme
    sheet = generateFromTheme(theme)
  }
</script>

<div class="controls">
  <div class="difficulty-row">
    {#each (['basic', 'intermediate', 'advanced'] as Difficulty[]) as d}
      <button
        class="diff-btn"
        class:active={difficulty === d}
        disabled={isPlaying}
        onclick={() => handleDifficultyChange(d)}
      >
        {DIFFICULTY_LABELS[d]}
      </button>
    {/each}
  </div>

  <div class="theme-row">
    {#each themes as theme}
      <button
        class="theme-btn"
        class:active={selectedTheme === theme}
        disabled={isPlaying}
        onclick={() => handleThemeChange(theme)}
      >
        {theme.name}
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
      oninput={(e) => handleBpmChange(Number(e.currentTarget.value))}
    />
    <span class="bpm-value">{bpm}</span>
  </div>

  <button
    class="play-btn"
    class:playing={isPlaying}
    onclick={isPlaying ? stop : play}
  >
    {isPlaying ? '■ Stop' : '▶ Play'}
  </button>
</div>

{#if phase === 'countdown'}
  <CountdownRow activeBeat={countdownActiveBeat} />
{/if}

<RhythmGrid sheet={sheet as Measure[]} {cellStates} />

<style>
  .controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;
  }

  .difficulty-row,
  .theme-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .diff-btn,
  .theme-btn {
    padding: 8px 20px;
    border: 1.5px solid #9a8060;
    background: transparent;
    color: #7a6040;
    border-radius: 3px;
    cursor: pointer;
    font-size: 14px;
    font-family: Georgia, serif;
    transition: background 0.15s, color 0.15s;
  }

  .diff-btn.active,
  .theme-btn.active {
    background: #7a5530;
    color: #faf6ee;
    border-color: #7a5530;
  }

  .diff-btn:disabled,
  .theme-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .bpm-row {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #6a5030;
  }

  .bpm-label {
    font-size: 13px;
    letter-spacing: 0.08em;
    width: 32px;
    font-family: Georgia, serif;
  }

  input[type='range'] {
    width: 180px;
    accent-color: #7a5530;
  }

  .bpm-value {
    font-size: 14px;
    width: 32px;
    text-align: right;
    font-family: Georgia, serif;
  }

  .play-btn {
    padding: 10px 36px;
    background: #7a5530;
    color: #faf6ee;
    border: none;
    border-radius: 3px;
    font-size: 16px;
    font-family: Georgia, serif;
    cursor: pointer;
    transition: background 0.15s;
    letter-spacing: 0.05em;
  }

  .play-btn:hover {
    background: #8f6640;
  }

  .play-btn.playing {
    background: #8a3a28;
  }

  .play-btn.playing:hover {
    background: #a04535;
  }
</style>
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/RegularMode.svelte
git commit -m "feat: add RegularMode with 2-bar fixed sheet, countdown, and theme picker"
```

---

## Task 7: Refactor App.svelte to Thin Shell

**Files:**
- Modify: `src/App.svelte`

- [ ] **Step 1: Replace `App.svelte` with the thin shell**

```svelte
<!-- src/App.svelte -->
<script lang="ts">
  import EndlessMode from './lib/EndlessMode.svelte'
  import RegularMode from './lib/RegularMode.svelte'
  import type { GameMode } from './lib/types'

  let mode = $state<GameMode>('endless')
</script>

<main>
  <h1>Rhythm Practice</h1>

  <div class="mode-tabs">
    <button
      class="tab-btn"
      class:active={mode === 'endless'}
      onclick={() => mode = 'endless'}
    >
      Endless
    </button>
    <button
      class="tab-btn"
      class:active={mode === 'regular'}
      onclick={() => mode = 'regular'}
    >
      Regular
    </button>
  </div>

  {#if mode === 'endless'}
    <EndlessMode />
  {:else}
    <RegularMode />
  {/if}

  <footer>
    <a href="https://github.com/miksin/rhythm" target="_blank" rel="noopener noreferrer">
      miksin/rhythm
    </a>
  </footer>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 24px 6px;
    min-height: 100vh;
  }

  @media (min-width: 500px) {
    main {
      gap: 28px;
      padding: 32px 16px;
    }
  }

  h1 {
    font-size: 1.6rem;
    letter-spacing: 0.12em;
    color: #4a3520;
    margin: 0;
    font-weight: normal;
  }

  .mode-tabs {
    display: flex;
    gap: 0;
    border: 1.5px solid #9a8060;
    border-radius: 3px;
    overflow: hidden;
  }

  .tab-btn {
    padding: 8px 28px;
    background: transparent;
    color: #7a6040;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-family: Georgia, serif;
    letter-spacing: 0.06em;
    transition: background 0.15s, color 0.15s;
  }

  .tab-btn:first-child {
    border-right: 1.5px solid #9a8060;
  }

  .tab-btn.active {
    background: #7a5530;
    color: #faf6ee;
  }

  footer {
    margin-top: auto;
    padding-top: 8px;
  }

  footer a {
    font-size: 0.75rem;
    color: #9a7a55;
    text-decoration: none;
    letter-spacing: 0.05em;
    opacity: 0.7;
    transition: opacity 0.15s;
  }

  footer a:hover {
    opacity: 1;
  }
</style>
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Run unit tests**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/App.svelte
git commit -m "feat: refactor App to thin shell with Endless/Regular mode tabs"
```

---

## Task 8: Verify E2E Tests

The existing E2E suite checks 16 cells, aspect ratios, and VexFlow SVG dimensions — all for the Endless mode (default on load). These should pass unchanged.

- [ ] **Step 1: Start the dev server**

```bash
pnpm dev --host 127.0.0.1
```

Keep it running in the background.

- [ ] **Step 2: Run E2E tests**

```bash
pnpm test:e2e
```

Expected: all existing tests pass (app loads in Endless mode by default, 16 cells visible).

- [ ] **Step 3: Manual smoke test — Regular mode**

Open `http://127.0.0.1:5173/` in the browser:

1. Click **Regular** tab → grid shrinks to 8 cells (4 cols × 2 rows), theme buttons appear.
2. Change difficulty to **Basic** → theme buttons update (Quarter Note, Eighth Note, Mixed).
3. Select **Quarter Note** theme → grid regenerates.
4. Click **▶ Play** → CountdownRow appears, 4 cells pulse 1→2→3→4, then disappears and the 8-cell sheet begins playing.
5. Watch the sheet loop at least twice — same cells, no regeneration.
6. Click **■ Stop** → all cells reset to upcoming, CountdownRow gone.
7. Switch back to **Endless** tab → 16-cell grid with standard controls, plays normally.

- [ ] **Step 4: Kill dev server**

```bash
kill $(lsof -ti:5173)
```
