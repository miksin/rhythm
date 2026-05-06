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
