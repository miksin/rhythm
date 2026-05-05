<script lang="ts">
  import type { Row } from './rhythm';
  import type { BeatResult } from './scoring';

  type Phase = 'idle' | 'countdown' | 'playing' | 'finished';

  let { rows, currentBeat, phase, beatResults, onTap }: {
    rows: Row[];
    currentBeat: number;
    phase: Phase;
    beatResults: BeatResult[] | null;
    onTap: (timestamp: number) => void;
  } = $props();

  function isActiveCell(rowIndex: number, colStart: number, span: number): boolean {
    if (phase !== 'playing') return false;
    const currentRow = Math.floor(currentBeat / 4);
    const currentCol = currentBeat % 4;
    return rowIndex === currentRow && currentCol >= colStart && currentCol < colStart + span;
  }

  function getCellAccuracy(rowIndex: number, col: number): number | null {
    if (!beatResults) return null;
    const flatIndex = rowIndex * 4 + col;
    const result = beatResults[flatIndex];
    return result ? result.accuracy : null;
  }

  function accuracyClass(acc: number | null): string {
    if (acc === null || acc < 0) return '';
    if (acc >= 0.9) return 'perfect';
    if (acc >= 0.7) return 'good';
    if (acc >= 0.4) return 'okay';
    if (acc > 0) return 'poor';
    return 'missed';
  }

  function handleClick(): void {
    if (phase === 'playing') {
      onTap(performance.now());
    }
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (phase === 'playing' && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onTap(performance.now());
    }
  }
</script>

<div class="grid" onclick={handleClick} onkeydown={handleKeydown} role="button" tabindex="0">
  {#each rows as row, ri}
    <div class="grid-row">
      {#each row as placed}
        {@const acc = phase === 'finished' ? getCellAccuracy(ri, placed.col) : null}
        <div
          class="cell {placed.pattern.category} {accuracyClass(acc)}"
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
