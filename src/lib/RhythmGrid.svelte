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
    <div class="measure-row">
      {#each measure as beat, beatIdx}
        {@const flatIdx = measureIdx * 4 + beatIdx}
        <div class="cell-wrap">
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
    gap: 8px;
    width: min(85vw, 85vh, 600px);
    aspect-ratio: 1;
  }

  .measure-row {
    display: flex;
    flex: 1;
    gap: 8px;
  }

  .cell-wrap {
    flex: 1;
    min-width: 0;
    min-height: 0;
  }
</style>
