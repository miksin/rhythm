<script lang="ts">
  import type { RhythmPattern } from './rhythm';

  let { pattern }: { pattern: RhythmPattern } = $props();

  const W = 100;
  const H = 44;
  const cy = 28;
  const stemTop = 6;
  const beamH = 3;
  const beamGap = 2.5;

  // SMuFL codepoints (U+E000–U+F8FF private use area)
  const Q  = ''; // noteQuarterUp
  const Hf = ''; // noteHalfUp
  const E  = ''; // note8thUp
  const BE = ''; // beamedEighthNotes
  const BS = ''; // beamedSixteenthNotes
  const NB = ''; // noteheadBlack
  const R8 = ''; // rest8th
  const RQ = ''; // restQuarter

  // noteheadBlack dimensions at font-size 16: ~8w x ~6.4h
  const nhW = 4;
  const nhH = 3.2;

  function nx(frac: number): number {
    return 8 + frac * 84;
  }

  function nh(x: number): string {
    return `<text x="${x}" y="${cy}" font-family="Bravura" font-size="16" text-anchor="middle" fill="currentColor">${NB}</text>`;
  }

  function stem(x: number): string {
    const sx = x + nhW + 0.5;
    const sy = cy - nhH;
    return `<line x1="${sx}" y1="${sy}" x2="${sx}" y2="${stemTop}" stroke="currentColor" stroke-width="1.1"/>`;
  }

  function beam(x1: number, x2: number, y: number): string {
    const sx1 = x1 + nhW + 0.5;
    const sx2 = x2 + nhW + 0.5;
    const w = sx2 - sx1;
    if (w <= 0) return '';
    return `<polygon points="${sx1 - 1},${y} ${sx2 + 1},${y + 0.8} ${sx2 + 1},${y + beamH + 0.8} ${sx1 - 1},${y + beamH}" fill="currentColor"/>`;
  }

  function textGlyph(glyph: string, x: number, size: number): string {
    return `<text x="${x}" y="${cy}" font-family="Bravura" font-size="${size}" text-anchor="middle" fill="currentColor">${glyph}</text>`;
  }
</script>

<svg viewBox="0 0 {W * pattern.duration} {H}" class="notation" xmlns="http://www.w3.org/2000/svg">
  {@html (() => {
    const d = pattern.duration;
    const offX = d > 1 ? (d - 1) * W / 2 : 0;

    function nxf(frac: number): number {
      return offX + nx(frac);
    }

    switch (pattern.id) {
      case 'quarter':
        return textGlyph(Q, nxf(0.5), 30);

      case 'half':
        return textGlyph(Hf, nxf(0.5), 30);

      case 'eighth-pair':
        return textGlyph(BE, nxf(0.25), 26);

      case 'sixteenths':
        return textGlyph(BS, nxf(0.125), 26);

      case 'eighth-sixteenth': {
        const xs = [nxf(0), nxf(0.5), nxf(0.75)];
        let s = '';
        for (const x of xs) s += nh(x) + stem(x);
        s += beam(xs[0], xs[2], stemTop);
        s += beam(xs[1], xs[2], stemTop + beamH + beamGap);
        return s;
      }

      case 'sixteenth-eighth': {
        const xs = [nxf(0), nxf(0.25), nxf(0.5)];
        let s = '';
        for (const x of xs) s += nh(x) + stem(x);
        s += beam(xs[0], xs[2], stemTop);
        s += beam(xs[0], xs[1], stemTop + beamH + beamGap);
        return s;
      }

      case 'sixteenth-eighth-sixteenth': {
        const xs = [nxf(0), nxf(0.25), nxf(0.75)];
        let s = '';
        for (const x of xs) s += nh(x) + stem(x);
        s += beam(xs[0], xs[2], stemTop);
        s += beam(xs[0], xs[0], stemTop + beamH + beamGap);
        s += beam(xs[2], xs[2], stemTop + beamH + beamGap);
        return s;
      }

      case 'eighth-rest-note':
        return textGlyph(R8, nxf(0.15), 22) + textGlyph(E, nxf(0.5), 28);

      case 'eighth-note-rest':
        return textGlyph(E, nxf(0), 28) + textGlyph(R8, nxf(0.85), 22);

      case 'quarter-rest':
        return textGlyph(RQ, nxf(0.5), 24);

      default:
        return textGlyph(Q, nxf(0.5), 30);
    }
  })()}
</svg>

<style>
  .notation {
    display: block;
    width: auto;
    height: 44px;
    max-width: 100%;
    color: var(--text);
  }
</style>
