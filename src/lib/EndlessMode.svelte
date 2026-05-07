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

  $effect(() => () => metronome.stop())

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
