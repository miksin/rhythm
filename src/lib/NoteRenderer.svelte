<!-- src/lib/NoteRenderer.svelte -->
<script lang="ts">
  import { Renderer, Stave, StaveNote, Voice, Formatter, Beam, Tuplet } from 'vexflow'
  import type { Beat, NoteValue } from './types'

  interface Props { beat: Beat }
  let { beat }: Props = $props()

  let container: HTMLDivElement | undefined = $state()

  const DURATION_MAP: Record<NoteValue, string> = {
    '1/4':          'q',
    '1/8':          '8',
    '1/16':         '16',
    '1/8-dot':      '8d',
    'rest-1/4':     'qr',
    'rest-1/8':     '8r',
    'rest-1/16':    '16r',
    'rest-1/8-dot': '8dr',
    'triplet-1/8':  '8',
  }

  function buildNotes(beat: Beat): StaveNote[] {
    return beat.map(nv => new StaveNote({ keys: ['b/4'], duration: DURATION_MAP[nv] }))
  }

  // Fixed reference canvas — viewBox scaling makes it fit any cell size
  const REF_W = 260
  const REF_H = 180

  function render(el: HTMLDivElement, beat: Beat) {
    el.replaceChildren()

    const renderer = new Renderer(el, Renderer.Backends.SVG)
    renderer.resize(REF_W, REF_H)
    const ctx = renderer.getContext()
    ctx.setFillStyle('#3a2a15')
    ctx.setStrokeStyle('#3a2a15')

    const staveX = 12
    const staveY = 55   // space above for stems + triplet bracket
    const staveW = REF_W - 24

    const stave = new Stave(staveX, staveY, staveW)
    stave.setContext(ctx).draw()

    const notes = buildNotes(beat)

    const tripletIndices = beat.reduce<number[]>((acc, nv, i) =>
      nv === 'triplet-1/8' ? [...acc, i] : acc, [])
    const isTriplet = tripletIndices.length === 3

    let beams: Beam[]
    let tuplets: Tuplet[] = []

    if (isTriplet) {
      const tripletNotes = tripletIndices.map(i => notes[i])
      beams = [new Beam(tripletNotes)]
      tuplets = [new Tuplet(tripletNotes, { num_notes: 3, notes_occupied: 2 })]
    } else {
      beams = Beam.generateBeams(notes)
    }

    const voice = new Voice({ num_beats: 1, beat_value: 4 }).setStrict(false)
    voice.addTickables(notes)
    new Formatter().joinVoices([voice]).format([voice], staveW - 16)

    voice.draw(ctx, stave)
    beams.forEach(b => b.setContext(ctx).draw())
    tuplets.forEach(t => t.setContext(ctx).draw())

    // VexFlow sets inline style="width: Xpx; height: Ypx" — override with % values
    // and add viewBox so the content scales to any cell size.
    const svg = el.querySelector('svg')
    if (svg) {
      svg.setAttribute('viewBox', `0 0 ${REF_W} ${REF_H}`)
      svg.style.width = '100%'
      svg.style.height = '100%'
    }
  }

  $effect(() => {
    if (container) render(container, beat)
  })
</script>

<div bind:this={container} class="renderer"></div>

<style>
  .renderer {
    width: 100%;
    height: 100%;
  }
  .renderer :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
