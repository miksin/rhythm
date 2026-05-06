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
