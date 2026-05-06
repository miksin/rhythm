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

  function render(el: HTMLDivElement, beat: Beat) {
    el.replaceChildren()
    const W = el.clientWidth
    const H = el.clientHeight
    if (W === 0 || H === 0) return

    const renderer = new Renderer(el, Renderer.Backends.SVG)
    renderer.resize(W, H)
    const ctx = renderer.getContext()
    ctx.setFillStyle('#3a2a15')
    ctx.setStrokeStyle('#3a2a15')

    const staveX = 5
    const staveY = H * 0.1
    const staveW = W - 10

    const stave = new Stave(staveX, staveY, staveW)
    stave.setContext(ctx).draw()

    const notes = buildNotes(beat)

    // Detect triplet group
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
  }

  $effect(() => {
    const currentBeat = beat
    if (!container) return
    const el = container

    render(el, currentBeat)

    const ro = new ResizeObserver(() => render(el, currentBeat))
    ro.observe(el)
    return () => ro.disconnect()
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
  }
</style>
