<!-- src/lib/BeatCell.svelte -->
<script lang="ts">
  import NoteRenderer from './NoteRenderer.svelte'
  import type { Beat, CellState } from './types'

  interface Props { beat: Beat; state: CellState }
  let { beat, state }: Props = $props()
</script>

<div class="cell" class:active={state === 'active'} class:played={state === 'played'}>
  <NoteRenderer {beat} />
</div>

<style>
  .cell {
    aspect-ratio: 1;
    border: 1.5px solid #4a4a6a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    box-sizing: border-box;
    background: #1e1e3a;
    transition: opacity 0.15s, background 0.1s, border-color 0.1s;
  }

  .cell.active {
    border: 3px solid #f97316;
    background: #2d1a00;
  }

  .cell.played {
    opacity: 0.35;
  }

  .cell :global(svg) {
    display: block;
  }

  .cell :global(svg ellipse[fill="black"]),
  .cell :global(svg circle[fill="black"]),
  .cell :global(svg rect[fill="black"]) {
    fill: #e8e8f0;
  }

  .cell :global(svg line[stroke="black"]),
  .cell :global(svg path[stroke="black"]) {
    stroke: #e8e8f0;
  }

  .cell :global(svg text) {
    fill: #e8e8f0;
  }
</style>
