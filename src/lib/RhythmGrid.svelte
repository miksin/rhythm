<script lang="ts">
  import type { Row } from './rhythm';

  let { rows, currentBeat, onAdvance }: {
    rows: Row[];
    currentBeat: number;
    onAdvance: () => void;
  } = $props();

  function isActiveCell(rowIndex: number, colStart: number, span: number): boolean {
    const currentRow = Math.floor(currentBeat / 4);
    const currentCol = currentBeat % 4;
    return rowIndex === currentRow && currentCol >= colStart && currentCol < colStart + span;
  }
</script>

<div class="grid" onclick={onAdvance} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') onAdvance(); }} role="button" tabindex="0">
  {#each rows as row, ri}
    <div class="grid-row">
      {#each row as placed}
        <div
          class="cell {placed.pattern.category}"
          class:active={isActiveCell(ri, placed.col, placed.span)}
          style="grid-column: span {placed.span}"
        >
          <span class="symbol">{placed.pattern.symbol}</span>
          <span class="label">{placed.pattern.label}</span>
        </div>
      {/each}
    </div>
  {/each}
</div>
