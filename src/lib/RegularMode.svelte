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

  $effect(() => () => metronome.stop())

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
