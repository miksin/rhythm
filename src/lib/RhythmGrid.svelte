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
  {#each sheet as measure, measureIdx}
    <div class="measure-row" class:last={measureIdx === 3}>
      {#each measure as beat, beatIdx}
        {@const flatIdx = measureIdx * 4 + beatIdx}
        <div class="cell-wrap" class:last-col={beatIdx === 3}>
          <BeatCell {beat} state={cellStates[flatIdx]} />
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .grid {
    display: flex;
    flex-direction: column;
    width: min(85vw, 85vh, 600px);
    aspect-ratio: 1;
    border: 2px solid #6a6a9a;
    border-radius: 4px;
    overflow: hidden;
  }

  .measure-row {
    display: flex;
    flex: 1;
    border-bottom: 3px solid #6a6a9a;
  }

  .measure-row.last {
    border-bottom: none;
  }

  .cell-wrap {
    flex: 1;
    border-right: 1.5px solid #4a4a6a;
    min-width: 0;
  }

  .cell-wrap.last-col {
    border-right: none;
  }
</style>
