# Rhythm Practice App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build a rhythm practice web app with a 4×4 grid, tap-along interaction, audio playback, and difficulty/BPM controls.

**Architecture:** Flat Svelte 5 component structure. `App.svelte` owns all state via $state runes. `RhythmGrid.svelte` is a pure display component. `rhythm.ts` holds pure functions for pattern definitions and random generation. `audio.ts` wraps Web Audio API. `app.css` provides global pastel-macaron styles.

**Tech Stack:** Svelte 5.55 (runes mode), TypeScript 6, Vite 8, Web Audio API, CSS Grid

---

### Task 1: Data types and rhythm pattern definitions

**Files:**
- Create: `src/lib/rhythm.ts`

- [ ] **Step 1: Write rhythm.ts — types, pattern catalog, and difficulty helpers**

```typescript
export type Difficulty = 'basic' | 'intermediate' | 'advanced' | 'all';

export interface RhythmPattern {
  id: string;
  label: string;
  symbol: string;
  duration: number;
  category: 'note-1' | 'note-2' | 'rest' | 'long';
  difficulty: Difficulty;
  subdivisions: number[];
}

export interface PlacedPattern {
  pattern: RhythmPattern;
  col: number;
  span: number;
}

export type Row = PlacedPattern[];

const PATTERNS: RhythmPattern[] = [
  {
    id: 'quarter',
    label: '四分音符',
    symbol: '♩',
    duration: 1,
    category: 'note-1',
    difficulty: 'basic',
    subdivisions: [0],
  },
  {
    id: 'eighth-pair',
    label: '八分音符×2',
    symbol: '♫',
    duration: 1,
    category: 'note-2',
    difficulty: 'basic',
    subdivisions: [0, 0.5],
  },
  {
    id: 'quarter-rest',
    label: '四分休止符',
    symbol: '𝄽',
    duration: 1,
    category: 'rest',
    difficulty: 'basic',
    subdivisions: [],
  },
  {
    id: 'half',
    label: '二分音符',
    symbol: '𝅗𝅥',
    duration: 2,
    category: 'long',
    difficulty: 'intermediate',
    subdivisions: [0],
  },
  {
    id: 'half-rest',
    label: '二分休止符',
    symbol: '𝄼',
    duration: 2,
    category: 'rest',
    difficulty: 'intermediate',
    subdivisions: [],
  },
  {
    id: 'dotted-half',
    label: '附點二分音符',
    symbol: '𝅗𝅥.',
    duration: 3,
    category: 'long',
    difficulty: 'intermediate',
    subdivisions: [0],
  },
  {
    id: 'whole',
    label: '全音符',
    symbol: '𝅝',
    duration: 4,
    category: 'long',
    difficulty: 'advanced',
    subdivisions: [0],
  },
  {
    id: 'whole-rest',
    label: '全休止符',
    symbol: '𝄻',
    duration: 4,
    category: 'rest',
    difficulty: 'advanced',
    subdivisions: [],
  },
  {
    id: 'sixteenths',
    label: '十六分音符×4',
    symbol: '♬',
    duration: 1,
    category: 'note-2',
    difficulty: 'advanced',
    subdivisions: [0, 0.25, 0.5, 0.75],
  },
  {
    id: 'eighth-rest-note',
    label: '八分休止+八分',
    symbol: '𝄿♪',
    duration: 1,
    category: 'note-2',
    difficulty: 'advanced',
    subdivisions: [0.5],
  },
  {
    id: 'eighth-note-rest',
    label: '八分+八分休止',
    symbol: '♪𝄿',
    duration: 1,
    category: 'note-2',
    difficulty: 'advanced',
    subdivisions: [0],
  },
];

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  basic: 0,
  intermediate: 1,
  advanced: 2,
  all: 2,
};

export function getPatternsForDifficulty(difficulty: Difficulty): RhythmPattern[] {
  const maxRank = DIFFICULTY_RANK[difficulty];
  return PATTERNS.filter((p) => DIFFICULTY_RANK[p.difficulty] <= maxRank);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/rhythm.ts
git commit -m "feat: add rhythm pattern types and catalog"
```

---

### Task 2: Random grid generation algorithm

**Files:**
- Modify: `src/lib/rhythm.ts` (append)

- [ ] **Step 1: Add generateGrid function to rhythm.ts**

Append below the existing code in `src/lib/rhythm.ts`:

```typescript
export function generateGrid(difficulty: Difficulty): Row[] {
  const candidates = getPatternsForDifficulty(difficulty);
  const rows: Row[] = [];

  for (let r = 0; r < 4; r++) {
    const row: PlacedPattern[] = [];
    let remaining = 4;

    while (remaining > 0) {
      const valid = candidates.filter((p) => p.duration <= remaining);
      const picked = valid[Math.floor(Math.random() * valid.length)];
      row.push({ pattern: picked, col: 4 - remaining, span: picked.duration });
      remaining -= picked.duration;
    }

    rows.push(row);
  }

  return rows;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/rhythm.ts
git commit -m "feat: add random grid generation algorithm"
```

---

### Task 3: Audio engine

**Files:**
- Create: `src/lib/audio.ts`

- [ ] **Step 1: Write audio.ts — Web Audio API wrapper**

```typescript
let audioCtx: AudioContext | null = null;
let gainNode: GainNode | null = null;

export function initAudio(): boolean {
  if (audioCtx) return true;
  try {
    audioCtx = new AudioContext();
    gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = 1;
    return true;
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  if (gainNode) {
    gainNode.gain.value = muted ? 0 : 1;
  }
}

export function playSubdivisions(subdivisions: number[], bpm: number): void {
  if (!audioCtx || !gainNode || subdivisions.length === 0) return;

  const beatDuration = 60 / bpm;
  const now = audioCtx.currentTime;

  for (const offset of subdivisions) {
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    osc.connect(env);
    env.connect(gainNode);

    osc.type = 'square';
    osc.frequency.value = 880;

    const startTime = now + offset * beatDuration;
    env.gain.setValueAtTime(0.3, startTime);
    env.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

    osc.start(startTime);
    osc.stop(startTime + 0.1);
  }
}

export function playClick(): void {
  if (!audioCtx || !gainNode) return;

  const osc = audioCtx.createOscillator();
  const env = audioCtx.createGain();
  osc.connect(env);
  env.connect(gainNode);

  osc.type = 'sine';
  osc.frequency.value = 660;

  const now = audioCtx.currentTime;
  env.gain.setValueAtTime(0.2, now);
  env.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.start(now);
  osc.stop(now + 0.06);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/audio.ts
git commit -m "feat: add Web Audio API engine with mute toggle"
```

---

### Task 4: Global styles

**Files:**
- Modify: `src/app.css` (rewrite entire file)

- [ ] **Step 1: Rewrite app.css with pastel macaron theme**

```css
:root {
  --bg: #F8F5F0;
  --text: #5D5A6D;
  --text-muted: #b8b2a6;
  --cell-bg: #FFFFFF;
  --border-note-1: #FFB5A7;
  --border-note-2: #A8D8EA;
  --border-rest: #C3AED6;
  --border-long: #B5EAD7;
  --active-bg: #FFDAC1;
  --control-bg: #FFFFFF;
  --control-border: #e8e4df;
  --btn-primary: #FFB5A7;
  --btn-primary-text: #FFFFFF;
  --font: system-ui, 'Segoe UI', Roboto, sans-serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
}

#app {
  max-width: 520px;
  margin: 0 auto;
  padding: 32px 20px 48px;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

h1 {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.controls {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.controls select {
  background: var(--control-bg);
  color: var(--text);
  border: 1px solid var(--control-border);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-family: var(--font);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235D5A6D' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
}

.controls button {
  background: var(--control-bg);
  color: var(--text);
  border: 1px solid var(--control-border);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  font-family: var(--font);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.controls button:hover {
  border-color: #ccc;
}

.controls button.primary {
  background: var(--btn-primary);
  color: var(--btn-primary-text);
  border: none;
  font-weight: 600;
}

.controls button.primary:hover {
  opacity: 0.9;
}

.controls button.mute-btn {
  font-size: 18px;
  padding: 6px 10px;
  line-height: 1;
}

.bpm-section {
  text-align: center;
}

.bpm-display {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}

.bpm-slider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}

.bpm-slider span {
  font-size: 12px;
  color: var(--text-muted);
  width: 24px;
  text-align: center;
}

.bpm-slider input[type="range"] {
  width: 180px;
  accent-color: var(--btn-primary);
  cursor: pointer;
}

.grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  user-select: none;
}

.grid-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.cell {
  background: var(--cell-bg);
  border: 2px solid var(--border-note-1);
  border-radius: 10px;
  padding: 24px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
  cursor: pointer;
}

.cell.note-2 {
  border-color: var(--border-note-2);
}

.cell.rest {
  border-color: var(--border-rest);
}

.cell.long {
  border-color: var(--border-long);
}

.cell.active {
  background: var(--active-bg);
  transform: scale(1.03);
}

.cell .symbol {
  font-size: 52px;
  line-height: 1;
}

.cell .label {
  font-size: 11px;
  color: var(--text-muted);
}

.progress {
  text-align: center;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.progress .beat-indicator {
  display: inline-block;
  background: var(--active-bg);
  color: #8B7E6E;
  border-radius: 8px;
  padding: 8px 20px;
  font-weight: 500;
}

.progress .hint {
  font-size: 12px;
  color: var(--text-muted);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app.css
git commit -m "feat: add pastel macaron global styles"
```

---

### Task 5: RhythmGrid component

**Files:**
- Create: `src/lib/RhythmGrid.svelte`

- [ ] **Step 1: Write RhythmGrid.svelte**

```svelte
<script lang="ts">
  import type { Row } from './rhythm';

  let { rows, currentBeat, onAdvance }: {
    rows: Row[];
    currentBeat: number;
    onAdvance: () => void;
  } = $props();

  function isActiveCell(rowIndex: number, colStart: number, span: number): boolean {
    const currentRow = Math.floor(currentBeat / 4);
    const currentCol = currentBeat % 4;
    return rowIndex === currentRow && currentCol >= colStart && currentCol < colStart + span;
  }
</script>

<div class="grid" onclick={onAdvance} role="button" tabindex="0">
  {#each rows as row, ri}
    <div class="grid-row">
      {#each row as placed}
        <div
          class="cell {placed.pattern.category}"
          class:active={isActiveCell(ri, placed.col, placed.span)}
          style="grid-column: span {placed.span}"
        >
          <span class="symbol">{placed.pattern.symbol}</span>
          <span class="label">{placed.pattern.label}</span>
        </div>
      {/each}
    </div>
  {/each}
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/RhythmGrid.svelte
git commit -m "feat: add RhythmGrid component with beat highlighting"
```

---

### Task 6: App.svelte — main integration

**Files:**
- Modify: `src/App.svelte` (rewrite entire file)
- Delete: `src/lib/Counter.svelte`

- [ ] **Step 1: Rewrite App.svelte**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import RhythmGrid from './lib/RhythmGrid.svelte';
  import { generateGrid, type Difficulty, type Row } from './lib/rhythm';
  import { initAudio, setMuted, playSubdivisions, playClick } from './lib/audio';

  let difficulty: Difficulty = $state('intermediate');
  let bpm: number = $state(60);
  let rows: Row[] = $state([]);
  let currentBeat: number = $state(0);
  let isMuted: boolean = $state(false);

  function newGrid(): void {
    rows = generateGrid(difficulty);
    currentBeat = 0;
  }

  function advanceBeat(): void {
    initAudio();
    const flatIndex = currentBeat;
    const r = Math.floor(flatIndex / 4);
    const c = flatIndex % 4;
    const row = rows[r];
    if (!row) return;

    const placed = row.find((p) => c >= p.col && c < p.col + p.span);
    if (placed) {
      const offsetInPattern = c - placed.col;
      const subdivisions = placed.pattern.subdivisions.map((s) => s - offsetInPattern).filter((s) => s >= 0 && s < 1);
      playSubdivisions(subdivisions, bpm);
    } else {
      playClick();
    }

    currentBeat = (currentBeat + 1) % 16;
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.code === 'Space') {
      e.preventDefault();
      advanceBeat();
    }
  }

  function handleDifficultyChange(e: Event): void {
    difficulty = (e.target as HTMLSelectElement).value as Difficulty;
    newGrid();
  }

  function toggleMute(): void {
    isMuted = !isMuted;
    setMuted(isMuted);
  }

  onMount(() => {
    newGrid();
    initAudio();
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<h1>Rhythm Practice</h1>

<div class="controls">
  <select value={difficulty} onchange={handleDifficultyChange}>
    <option value="basic">Basic</option>
    <option value="intermediate">Intermediate</option>
    <option value="advanced">Advanced</option>
    <option value="all">All</option>
  </select>
  <button class="primary" onclick={newGrid}>Generate</button>
  <button class="mute-btn" onclick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
    {isMuted ? '🔇' : '🔊'}
  </button>
</div>

<div class="bpm-section">
  <div class="bpm-display">♩ = {bpm}</div>
  <div class="bpm-slider">
    <span>40</span>
    <input
      type="range"
      min="40"
      max="200"
      bind:value={bpm}
    />
    <span>200</span>
  </div>
</div>

<RhythmGrid {rows} {currentBeat} onAdvance={advanceBeat} />

<div class="progress">
  <div class="beat-indicator">Beat {currentBeat + 1} / 16</div>
  <div class="hint">Press Space or tap the grid to advance</div>
</div>
```

- [ ] **Step 2: Delete Counter.svelte boilerplate**

```bash
rm src/lib/Counter.svelte
```

- [ ] **Step 3: Verify the app compiles**

```bash
pnpm run check
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.svelte src/lib/Counter.svelte
git commit -m "feat: integrate rhythm grid, audio, and controls in App.svelte"
```

---

### Task 7: Title and cleanup

**Files:**
- Modify: `index.html`
- Delete: `src/assets/hero.png`, `src/assets/svelte.svg`, `src/assets/vite.svg`

- [ ] **Step 1: Update page title**

```html
<title>Rhythm Practice</title>
```

Change line 6 of `index.html` from `<title>rhythm</title>` to `<title>Rhythm Practice</title>`.

- [ ] **Step 2: Remove unused assets**

```bash
rm src/assets/hero.png src/assets/svelte.svg src/assets/vite.svg
```

- [ ] **Step 3: Verify dev server runs**

```bash
pnpm dev
```

Expected: Vite dev server starts. Open the URL, see the rhythm grid, test Spacebar and mouse click to advance beats. Verify Generate, difficulty, BPM, and mute toggle all work.

- [ ] **Step 4: Commit**

```bash
git add index.html src/assets/hero.png src/assets/svelte.svg src/assets/vite.svg
git commit -m "chore: update title and remove template assets"
```
