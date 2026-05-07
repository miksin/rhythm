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
</script>

<div class="grid" class:regular>
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
    /* Fit within viewport: constrain by width OR by available height (90vh minus controls/padding) */
    width: min(90vw, calc((90vh - 220px) * 13 / 9));
  }

  /* 2-measure grid doesn't need the height-based width constraint */
  .grid.regular {
    width: min(90vw, 600px);
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
