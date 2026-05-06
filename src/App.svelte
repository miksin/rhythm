<!-- src/App.svelte -->
<script lang="ts">
  import { Metronome } from './lib/metronome'
  import { generateSheet, generateHalf } from './lib/rhythmGenerator'
  import RhythmGrid from './lib/RhythmGrid.svelte'
  import Controls from './lib/Controls.svelte'
  import type { Difficulty, RhythmSheet, CellState } from './lib/types'

  let difficulty = $state<Difficulty>('intermediate')
  let bpm = $state(60)
  let isPlaying = $state(false)
  let sheet = $state<RhythmSheet>(generateSheet('intermediate'))
  let cellStates = $state<CellState[]>(Array(16).fill('upcoming') as CellState[])
  let currentBeat = $state(-1)
  let playCount = $state(0)

  const metronome = new Metronome()

  // Auto-scroll to active cell on mobile after DOM updates
  $effect(() => {
    if (currentBeat < 0 || !isPlaying) return
    if (window.innerWidth > 500) return
    document.querySelector('.cell.active')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })

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
  <h1>Rhythm Practice</h1>
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
