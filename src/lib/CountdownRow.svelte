<!-- src/lib/CountdownRow.svelte -->
<script lang="ts">
  interface Props { activeBeat: number }
  let { activeBeat }: Props = $props()
</script>

<div class="countdown-row">
  {#each [0, 1, 2, 3] as i}
    <div class="countdown-cell" class:active={activeBeat === i}></div>
  {/each}
</div>

<style>
  .countdown-row {
    display: flex;
    gap: 8px;
  }

  .countdown-cell {
    width: 40px;
    height: 40px;
    border-radius: 3px;
    border: 1.5px solid #c8a878;
    background: transparent;
    transition: background 0.1s, border-color 0.1s;
  }

  .countdown-cell.active {
    background: #fff3dc;
    border-color: #b07030;
  }
</style>
