<!-- src/lib/RhythmGrid.svelte -->
<script lang="ts">
  import BeatCell from './BeatCell.svelte'
  import type { RhythmSheet, CellState } from './types'

  interface Props {
    sheet: RhythmSheet
    cellStates: CellState[]
  }

  let { sheet, cellStates }: Props = $props()
</script>

<div class="grid">
  {#each sheet.flat() as beat, i}
    <div class="cell-wrap">
      <BeatCell {beat} state={cellStates[i]} />
    </div>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    width: min(90vw, 600px);
  }

  /* Mobile: 2 columns × 8 rows */
  @media (max-width: 500px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .cell-wrap {
    aspect-ratio: 13 / 9;
    min-width: 0;
    min-height: 0;
  }
</style>
