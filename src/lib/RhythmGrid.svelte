<!-- src/lib/RhythmGrid.svelte -->
<script lang="ts">
  import BeatCell from './BeatCell.svelte'
  import type { Measure, CellState } from './types'

  interface Props {
    sheet: Measure[]
    cellStates: CellState[]
  }

  let { sheet, cellStates }: Props = $props()
  const regular = $derived(sheet.length === 2)
  const lastIndex = $derived(sheet.flat().length - 1)
</script>

<div class="grid" class:regular>
  {#each sheet.flat() as beat, i}
    <div class="cell-wrap">
      <BeatCell {beat} state={cellStates[i]} repeatEnd={regular && i === lastIndex} />
    </div>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    /* Fit within viewport: constrain by width OR by available height (90vh minus controls/padding) */
    width: min(90vw, calc((90vh - 220px) * 13 / 9));
  }

  /* 2 rows instead of 4 → can be twice as wide for the same viewport height.
     Formula derived from: grid_height = W × 9/26, solve for W at 90vh - controls */
  .grid.regular {
    width: min(90vw, calc((90vh - 240px) * 26 / 9));
  }

  /* Mobile: 2 columns × 8 rows (endless) or 2 × 4 rows (regular) */
  @media (max-width: 500px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
      width: 90vw;
    }
  }

  .cell-wrap {
    aspect-ratio: 13 / 9;
    min-width: 0;
    min-height: 0;
  }
</style>
