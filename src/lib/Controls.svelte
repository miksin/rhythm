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
    basic: 'Basic',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
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
    {isPlaying ? '■ Stop' : '▶ Play'}
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
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .diff-btn {
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

  .diff-btn.active {
    background: #7a5530;
    color: #faf6ee;
    border-color: #7a5530;
  }

  .diff-btn:disabled {
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
