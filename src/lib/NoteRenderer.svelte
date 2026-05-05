<!-- src/lib/NoteRenderer.svelte -->
<script lang="ts">
  import type { Beat } from './types'
  import { computeRenderItems, type RenderItem } from './noteGeometry'

  interface Props { beat: Beat }
  let { beat }: Props = $props()

  let items = $derived(computeRenderItems(beat))
</script>

<svg viewBox="0 0 80 80" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  {#each items as item (JSON.stringify(item))}
    {#if item.kind === 'notehead'}
      <ellipse cx={item.cx} cy={62} rx={6} ry={4.5} fill="black" />
      {#if item.dotted}
        <circle cx={item.cx + 11} cy={59} r={2.5} fill="black" />
      {/if}

    {:else if item.kind === 'stem'}
      <line x1={item.cx + 5} y1={58} x2={item.cx + 5} y2={22}
            stroke="black" stroke-width="1.5" />

    {:else if item.kind === 'flag'}
      <path d="M {item.cx + 5},22 C {item.cx + 20},30 {item.cx + 21},40 {item.cx + 9},50"
            stroke="black" stroke-width="1.5" fill="none" stroke-linecap="round" />
      {#if item.count === 2}
        <path d="M {item.cx + 5},30 C {item.cx + 20},38 {item.cx + 21},48 {item.cx + 9},58"
              stroke="black" stroke-width="1.5" fill="none" stroke-linecap="round" />
      {/if}

    {:else if item.kind === 'beam'}
      <rect x={item.x1} y={item.beamIndex === 0 ? 22 : 28}
            width={item.x2 - item.x1 + 1.5} height={3} fill="black" />

    {:else if item.kind === 'rest-quarter'}
      <path d="M {item.cx + 4},30 L {item.cx - 5},38
               C {item.cx + 4},42 {item.cx + 5},46 {item.cx - 2},52
               L {item.cx + 4},60"
            stroke="black" stroke-width="2.5" stroke-linecap="round" fill="none" />

    {:else if item.kind === 'rest-eighth'}
      <circle cx={item.cx + 2} cy={35} r={4.5} fill="black" />
      <line x1={item.cx + 5} y1={37} x2={item.cx - 4} y2={62}
            stroke="black" stroke-width="2" stroke-linecap="round" />
      {#if item.dotted}
        <circle cx={item.cx + 12} cy={33} r={2.5} fill="black" />
      {/if}

    {:else if item.kind === 'rest-sixteenth'}
      <circle cx={item.cx + 2} cy={30} r={3.5} fill="black" />
      <circle cx={item.cx + 6} cy={44} r={3.5} fill="black" />
      <line x1={item.cx + 5} y1={32} x2={item.cx - 4} y2={62}
            stroke="black" stroke-width="1.8" stroke-linecap="round" />

    {:else if item.kind === 'triplet-bracket'}
      <line x1={item.x1} y1={16} x2={item.x1} y2={11} stroke="black" stroke-width="1.2" />
      <line x1={item.x1} y1={11} x2={item.x2} y2={11} stroke="black" stroke-width="1.2" />
      <line x1={item.x2} y1={11} x2={item.x2} y2={16} stroke="black" stroke-width="1.2" />
      <text x={(item.x1 + item.x2) / 2} y={10} font-size="9"
            text-anchor="middle" font-family="serif" fill="black">3</text>
    {/if}
  {/each}
</svg>
