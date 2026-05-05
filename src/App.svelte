<script lang="ts">
  import { onMount } from 'svelte';
  import RhythmGrid from './lib/RhythmGrid.svelte';
  import { generateGrid, type Difficulty, type Row } from './lib/rhythm';
  import { initAudio, setMuted, playCountdownTick, playMetronomeTick } from './lib/audio';
  import { calculateResults, type BeatResult } from './lib/scoring';

  type Phase = 'idle' | 'countdown' | 'playing' | 'finished';
  type Mode = 'practice' | 'endless';

  let mode: Mode = $state('practice');
  let phase: Phase = $state('idle');
  let difficulty: Difficulty = $state('intermediate');
  let bpm: number = $state(60);
  let rows: Row[] = $state([]);
  let isMuted: boolean = $state(false);

  let currentCount: number = $state(4);
  let currentBeat: number = $state(0);
  let beatResults: BeatResult[] | null = $state(null);
  let round: number = $state(1);

  let schedulerInterval: ReturnType<typeof setInterval> | null = null;
  let expectedWallTimes: number[] = [];
  let tapTimestamps: number[] = [];
  let processingCursor: number = 0;
  let totalSlots: number = 0;

  function newGrid(): void {
    rows = generateGrid(difficulty);
    currentBeat = 0;
    currentCount = 4;
    beatResults = null;
    round = 1;
  }

  // ── Practice mode ──────────────────────────────────

  function startPractice(): void {
    initAudio();
    const beatMs = (60 / bpm) * 1000;
    const sessionStart = performance.now() + beatMs;
    totalSlots = 20; // 4 countdown + 16 playing
    expectedWallTimes = Array.from({ length: totalSlots }, (_, i) => sessionStart + i * beatMs);
    tapTimestamps = [];
    processingCursor = 0;
    phase = 'countdown';
    currentCount = 4;
    currentBeat = 0;
    beatResults = null;

    const checkInterval = Math.min(beatMs / 4, 50);
    schedulerInterval = setInterval(tickPractice, checkInterval);
  }

  function tickPractice(): void {
    const now = performance.now();
    while (processingCursor < totalSlots && now >= expectedWallTimes[processingCursor]) {
      processPracticeSlot(processingCursor);
      processingCursor++;
    }
    if (processingCursor >= totalSlots) {
      const graceEnd = expectedWallTimes[totalSlots - 1] + (60 / bpm) * 1000;
      if (now >= graceEnd) {
        stopScheduler();
        finishSession();
      }
    }
  }

  function processPracticeSlot(slot: number): void {
    if (slot < 4) {
      currentCount = 4 - slot;
      playCountdownTick();
    } else {
      if (phase === 'countdown') {
        phase = 'playing';
      }
      const beat = slot - 4;
      currentBeat = beat;
      playMetronomeTick(bpm);
    }
  }

  function isRestBeat(beat: number): boolean {
    const r = Math.floor(beat / 4);
    const c = beat % 4;
    const row = rows[r];
    if (!row) return false;
    const placed = row.find((p) => c >= p.col && c < p.col + p.span);
    return placed?.pattern.category === 'rest';
  }

  function finishSession(): void {
    const beatMs = (60 / bpm) * 1000;
    const toleranceMs = Math.min(beatMs * 500, 300);
    const playingExpected = expectedWallTimes.slice(4);

    const activeIndices: number[] = [];
    for (let beat = 0; beat < 16; beat++) {
      if (!isRestBeat(beat)) {
        activeIndices.push(beat);
      }
    }

    const activeExpected = activeIndices.map((i) => playingExpected[i]);
    const results = calculateResults(activeExpected, tapTimestamps, toleranceMs);

    const fullResults: BeatResult[] = [];
    let resultIdx = 0;
    for (let beat = 0; beat < 16; beat++) {
      if (isRestBeat(beat)) {
        fullResults.push({
          beatIndex: beat,
          expectedTime: playingExpected[beat],
          tapTime: null,
          deviationMs: null,
          accuracy: -1,
        });
      } else {
        fullResults.push(results.beatResults[resultIdx]);
        resultIdx++;
      }
    }

    beatResults = fullResults;
    phase = 'finished';
  }

  // ── Endless mode ───────────────────────────────────

  function startEndless(): void {
    initAudio();
    const beatMs = (60 / bpm) * 1000;
    const sessionStart = performance.now() + beatMs;
    totalSlots = 16;
    expectedWallTimes = Array.from({ length: totalSlots }, (_, i) => sessionStart + i * beatMs);
    processingCursor = 0;
    phase = 'playing';
    currentBeat = 0;
    round = 1;

    const checkInterval = Math.min(beatMs / 4, 50);
    schedulerInterval = setInterval(tickEndless, checkInterval);
  }

  function tickEndless(): void {
    const now = performance.now();
    while (processingCursor < totalSlots && now >= expectedWallTimes[processingCursor]) {
      processEndlessSlot(processingCursor);
      processingCursor++;
    }
    if (processingCursor >= totalSlots) {
      // Seamless loop: generate new grid, extend expectedWallTimes
      const beatMs = (60 / bpm) * 1000;
      const nextStart = expectedWallTimes[totalSlots - 1] + beatMs;
      rows = generateGrid(difficulty);
      round++;
      currentBeat = 0;
      expectedWallTimes = Array.from({ length: totalSlots }, (_, i) => nextStart + i * beatMs);
      processingCursor = 0;
    }
  }

  function processEndlessSlot(slot: number): void {
    currentBeat = slot;
    playMetronomeTick(bpm);
  }

  // ── Shared ─────────────────────────────────────────

  function stopScheduler(): void {
    if (schedulerInterval !== null) {
      clearInterval(schedulerInterval);
      schedulerInterval = null;
    }
  }

  function handleUserTap(timestamp: number): void {
    if (mode !== 'practice' || phase !== 'playing') return;
    tapTimestamps.push(timestamp);
  }

  function restart(): void {
    stopScheduler();
    startPractice();
  }

  function resetToIdle(): void {
    stopScheduler();
    phase = 'idle';
    currentBeat = 0;
    currentCount = 4;
    beatResults = null;
    tapTimestamps = [];
    round = 1;
  }

  function handleStart(): void {
    if (mode === 'practice') {
      startPractice();
    } else {
      startEndless();
    }
  }

  function handleStop(): void {
    stopScheduler();
    phase = 'idle';
    currentBeat = 0;
    round = 1;
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.code === 'Space') {
      e.preventDefault();
      if (mode === 'practice' && phase === 'playing') {
        handleUserTap(performance.now());
      }
    }
  }

  function setMode(newMode: Mode): void {
    if (phase !== 'idle') return;
    mode = newMode;
    newGrid();
  }

  function handleDifficultyChange(e: Event): void {
    if (phase !== 'idle') return;
    difficulty = (e.target as HTMLSelectElement).value as Difficulty;
    newGrid();
  }

  function toggleMute(): void {
    isMuted = !isMuted;
    setMuted(isMuted);
  }

  function handleGenerate(): void {
    if (phase !== 'idle') return;
    newGrid();
  }

  onMount(() => {
    newGrid();
    initAudio();
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      stopScheduler();
    };
  });
</script>

<h1>Rhythm Practice</h1>

<div class="controls">
  <div class="mode-toggle">
    <button
      class="mode-btn"
      class:active={mode === 'practice'}
      onclick={() => setMode('practice')}
      disabled={phase !== 'idle'}
    >Practice</button>
    <button
      class="mode-btn"
      class:active={mode === 'endless'}
      onclick={() => setMode('endless')}
      disabled={phase !== 'idle'}
    >Endless</button>
  </div>
</div>

<div class="controls">
  <select value={difficulty} onchange={handleDifficultyChange} disabled={phase !== 'idle'}>
    <option value="basic">Basic</option>
    <option value="intermediate">Intermediate</option>
    <option value="advanced">Advanced</option>
    <option value="all">All</option>
  </select>
  <button class="primary" onclick={handleGenerate} disabled={phase !== 'idle'}>Generate</button>
  <button class="mute-btn" onclick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
    {isMuted ? '🔇' : '🔊'}
  </button>
</div>

<div class="bpm-section">
  <div class="bpm-display">♩ = {bpm}</div>
  <div class="bpm-slider">
    <span>40</span>
    <input type="range" min="40" max="200" bind:value={bpm} disabled={phase !== 'idle'} />
    <span>200</span>
  </div>
</div>

<div class="grid-container">
  <RhythmGrid {rows} {currentBeat} {phase} {beatResults} onTap={handleUserTap} />

  {#if phase === 'countdown'}
    <div class="countdown-overlay">
      <div class="countdown-number">{currentCount}</div>
    </div>
  {/if}
</div>

<div class="progress">
  {#if phase === 'idle'}
    <button class="start-btn" onclick={handleStart}>
      {mode === 'practice' ? 'Start Practice' : 'Start Endless'}
    </button>
  {:else if phase === 'countdown'}
    <div class="hint">Listen to the countdown...</div>
  {:else if phase === 'playing'}
    <div class="beat-indicator">
      {mode === 'endless' ? `Round ${round} · Beat ${currentBeat + 1} / 16` : `Beat ${currentBeat + 1} / 16`}
    </div>
    {#if mode === 'practice'}
      <div class="hint">Tap Space or click the grid</div>
    {:else}
      <div class="hint">Listen and follow along</div>
      <button class="stop-btn" onclick={handleStop}>Stop</button>
    {/if}
  {:else if phase === 'finished'}
    {@const activeResults = beatResults?.filter(r => r.accuracy >= 0) ?? []}
    {@const hitCount = activeResults.filter(r => r.tapTime !== null).length}
    {@const totalActive = activeResults.length}
    {@const overallPct = totalActive > 0
      ? Math.round(activeResults.reduce((s, r) => s + r.accuracy, 0) / totalActive * 100)
      : 0}
    {@const restCount = (beatResults?.length ?? 0) - totalActive}
    <div class="results-accuracy">{overallPct}%</div>
    <div class="results-label">Accuracy</div>
    <div class="results-stats">
      <span>Hits: {hitCount}/{totalActive}</span>
      {#if restCount > 0}
        <span>Rests: {restCount}</span>
      {/if}
    </div>
    <div class="results-actions">
      <button class="primary" onclick={restart}>Practice Again</button>
      <button onclick={resetToIdle}>New Exercise</button>
    </div>
  {/if}
</div>
