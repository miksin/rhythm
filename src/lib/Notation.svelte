<script lang="ts">
  import type { RhythmPattern } from './rhythm';

  let { pattern }: { pattern: RhythmPattern } = $props();

  const W = 100; // viewBox width per beat
  const H = 36;
  const cy = 15; // notehead center y
  const stemTop = 3;
  const beamH = 2.8;
  const beamGap = 2;
  const noteRx = 4.5;
  const noteRy = 3;

  function nx(frac: number): number {
    return 8 + frac * 84;
  }

  function notehead(x: number, filled: boolean): string {
    const fill = filled ? 'currentColor' : 'none';
    return `<ellipse cx="${x}" cy="${cy}" rx="${noteRx}" ry="${noteRy}" fill="${fill}" stroke="currentColor" stroke-width="0.9"/>`;
  }

  function stem(x: number): string {
    return `<line x1="${x}" y1="${cy - noteRy}" x2="${x}" y2="${stemTop}" stroke="currentColor" stroke-width="1.1"/>`;
  }

  function beamElement(x1: number, x2: number, y: number): string {
    const w = x2 - x1;
    if (w <= 0) return '';
    return `<polygon points="${x1},${y} ${x2},${y + 0.8} ${x2},${y + beamH + 0.8} ${x1},${y + beamH}" fill="currentColor"/>`;
  }

  function flag(x: number): string {
    return `<path d="M${x},${stemTop} Q${x + 7},${stemTop + 5} ${x + 9},${stemTop + 13}" fill="none" stroke="currentColor" stroke-width="1.1"/>`;
  }

  function restQuarter(): string {
    return `<path d="M${50 - 6},${cy - 6} L${50 + 4},${cy - 8} L${50 - 2},${cy} L${50 + 8},${cy - 2} L${50 + 2},${cy + 6} L${50 - 8},${cy + 4} Z" fill="currentColor"/>`;
  }

  function restEighth(x: number): string {
    const cx = x;
    return `<circle cx="${cx}" cy="${cy - 3}" r="2.2" fill="currentColor"/><path d="M${cx + 2},${cy - 3} Q${cx + 6},${cy + 2} ${cx + 4},${cy + 8}" fill="none" stroke="currentColor" stroke-width="1.1"/>`;
  }
</script>

<svg viewBox="0 0 {W * pattern.duration} {H}" class="notation" xmlns="http://www.w3.org/2000/svg">
  {@html (() => {
    const d = pattern.duration;
    const vbW = W * d;
    // Center single notes in multi-beat cells
    const offX = d > 1 ? (d - 1) * W / 2 : 0;

    function nxf(frac: number): number {
      return offX + 8 + frac * 84;
    }

    switch (pattern.id) {
      case 'quarter': {
        const x = nxf(0.5);
        return notehead(x, true) + stem(x + noteRx);
      }

      case 'half': {
        const x = nxf(0.5);
        return notehead(x, false) + stem(x + noteRx);
      }

      case 'eighth-pair': {
        const x0 = nxf(0), x1 = nxf(0.5);
        const s0 = x0 + noteRx, s1 = x1 + noteRx;
        return notehead(x0, true) + stem(s0) + notehead(x1, true) + stem(s1)
          + beamElement(s0 - 1, s1 + 1, stemTop);
      }

      case 'sixteenths': {
        const xs = [nxf(0), nxf(0.25), nxf(0.5), nxf(0.75)];
        const ss = xs.map(x => x + noteRx);
        let s = '';
        for (let i = 0; i < 4; i++) s += notehead(xs[i], true) + stem(ss[i]);
        s += beamElement(ss[0] - 1, ss[3] + 1, stemTop);
        s += beamElement(ss[0] - 1, ss[3] + 1, stemTop + beamH + beamGap);
        return s;
      }

      case 'eighth-sixteenth': {
        // 8th at 0, 16th at 0.5, 16th at 0.75
        const xs = [nxf(0), nxf(0.5), nxf(0.75)];
        const ss = xs.map(x => x + noteRx);
        let s = '';
        for (let i = 0; i < 3; i++) s += notehead(xs[i], true) + stem(ss[i]);
        // Single beam over all three
        s += beamElement(ss[0] - 1, ss[2] + 1, stemTop);
        // Secondary beam over last two (16ths)
        s += beamElement(ss[1] - 1, ss[2] + 1, stemTop + beamH + beamGap);
        return s;
      }

      case 'sixteenth-eighth': {
        // 16th at 0, 16th at 0.25, 8th at 0.5
        const xs = [nxf(0), nxf(0.25), nxf(0.5)];
        const ss = xs.map(x => x + noteRx);
        let s = '';
        for (let i = 0; i < 3; i++) s += notehead(xs[i], true) + stem(ss[i]);
        s += beamElement(ss[0] - 1, ss[2] + 1, stemTop);
        s += beamElement(ss[0] - 1, ss[1] + 1, stemTop + beamH + beamGap);
        return s;
      }

      case 'sixteenth-eighth-sixteenth': {
        // 16th at 0, 8th at 0.25, 16th at 0.75
        const xs = [nxf(0), nxf(0.25), nxf(0.75)];
        const ss = xs.map(x => x + noteRx);
        let s = '';
        for (let i = 0; i < 3; i++) s += notehead(xs[i], true) + stem(ss[i]);
        // Single beam over all three
        s += beamElement(ss[0] - 1, ss[2] + 1, stemTop);
        // Secondary beam over first note (16th)
        s += beamElement(ss[0] - 1, ss[0] + 1, stemTop + beamH + beamGap);
        // Secondary beam over last note (16th) — separate from first
        s += beamElement(ss[2] - 1, ss[2] + 1, stemTop + beamH + beamGap);
        return s;
      }

      case 'eighth-rest-note': {
        // Rest at 0-0.5, 8th note at 0.5-1.0
        const xn = nxf(0.5);
        const sn = xn + noteRx;
        return restEighth(nxf(0.15)) + notehead(xn, true) + stem(sn) + flag(sn);
      }

      case 'eighth-note-rest': {
        // 8th note at 0-0.5, rest at 0.5-1.0
        const xn = nxf(0);
        const sn = xn + noteRx;
        return notehead(xn, true) + stem(sn) + flag(sn) + restEighth(nxf(0.85));
      }

      case 'quarter-rest':
        return restQuarter();

      default:
        return notehead(nxf(0.5), true) + stem(nxf(0.5) + noteRx);
    }
  })()}
</svg>

<style>
  .notation {
    display: block;
    width: auto;
    height: 36px;
    max-width: 100%;
    color: var(--text);
  }
</style>
