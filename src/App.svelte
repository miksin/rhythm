<script lang="ts">
  import { onMount } from 'svelte';
  import RhythmGrid from './lib/RhythmGrid.svelte';
  import { generateGrid, type Difficulty, type Row } from './lib/rhythm';
  import { initAudio, setMuted, playSubdivisions, playClick } from './lib/audio';
  import type { BeatResult } from './lib/scoring';

  type Phase = 'idle' | 'countdown' | 'playing' | 'finished';

  let difficulty: Difficulty = $state('intermediate');
  let bpm: number = $state(60);
  let rows: Row[] = $state([]);
  let currentBeat: number = $state(0);
  let isMuted: boolean = $state(false);
  let phase: Phase = $state('playing');
  let beatResults: BeatResult[] | null = $state(null);

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

<RhythmGrid {rows} {currentBeat} {phase} {beatResults} onTap={advanceBeat} />

<div class="progress">
  <div class="beat-indicator">Beat {currentBeat + 1} / 16</div>
  <div class="hint">Press Space or tap the grid to advance</div>
</div>
