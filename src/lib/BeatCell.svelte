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
    width: 100%;
    height: 100%;
    border: 2px solid transparent;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    box-sizing: border-box;
    transition: opacity 0.15s, background 0.1s, border-color 0.1s;
  }

  .cell.active {
    border-color: #b07030;
    background: #fff3dc;
  }

  .cell.played {
    opacity: 0.35;
  }

  .cell :global(svg) {
    display: block;
  }
</style>
