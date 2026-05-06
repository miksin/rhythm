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
    border: 1.5px solid #c8b89a;
    border-radius: 4px;
    outline: 2px solid transparent;
    outline-offset: -2px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    box-sizing: border-box;
    background: #faf6ee;
    box-shadow: 0 1px 4px rgba(80, 50, 20, 0.08);
    transition: opacity 0.15s, background 0.1s, outline-color 0.1s;
  }

  .cell.active {
    outline: 2px solid #b07030;
    background: #fff3dc;
  }

  .cell.played {
    opacity: 0.35;
  }

  .cell :global(svg) {
    display: block;
  }
</style>
