<!-- src/lib/BeatCell.svelte -->
<script lang="ts">
  import NoteRenderer from './NoteRenderer.svelte'
  import type { Beat, CellState } from './types'

  interface Props { beat: Beat; state: CellState; repeatEnd?: boolean }
  let { beat, state, repeatEnd = false }: Props = $props()
</script>

<div class="cell" class:active={state === 'active'} class:played={state === 'played'}>
  <NoteRenderer {beat} {repeatEnd} />
</div>

<style>
  .cell {
    width: 100%;
    height: 100%;
    border-radius: 3px;
    outline: 2px solid transparent;
    outline-offset: -1px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    box-sizing: border-box;
    transition: opacity 0.15s, background 0.1s, outline-color 0.1s;
  }

  .cell.active {
    outline-color: #b07030;
    background: #fff3dc;
  }

  .cell.played {
    opacity: 0.35;
  }

  .cell :global(svg) {
    display: block;
  }
</style>
