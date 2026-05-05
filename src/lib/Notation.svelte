<script lang="ts">
  import type { RhythmPattern } from './rhythm';

  let { pattern }: { pattern: RhythmPattern } = $props();

  function noteX(fraction: number): number {
    return 10 + fraction * 80;
  }

  function notehead(cx: number, cy: number, filled: boolean): string {
    const fill = filled ? 'currentColor' : 'none';
    return `<ellipse cx="${cx}" cy="${cy}" rx="4.5" ry="3.2" fill="${fill}" stroke="currentColor" stroke-width="1"/>`;
  }

  function stem(cx: number, y1: number, y2: number): string {
    return `<line x1="${cx}" y1="${y1}" x2="${cx}" y2="${y2}" stroke="currentColor" stroke-width="1.2"/>`;
  }

  function beam(x1: number, x2: number, y: number, h: number): string {
    return `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="${h}" fill="currentColor"/>`;
  }

  function flag(cx: number, y: number): string {
    return `<path d="M${cx},${y} Q${cx + 8},${y + 5} ${cx + 10},${y + 12}" fill="none" stroke="currentColor" stroke-width="1.2"/>`;
  }
</script>

<svg viewBox="0 0 100 32" class="notation" xmlns="http://www.w3.org/2000/svg">
  {@html (() => {
    const cy = 14;
    const stemTop = 2;
    const beamH = 3;
    const beamGap = 1.5;

    switch (pattern.id) {
      // ── Quarter ──
      case 'quarter':
        return notehead(50, cy, true) + stem(54.5, cy, stemTop);

      // ── Half ──
      case 'half':
        return notehead(50, cy, false) + stem(54.5, cy, stemTop);

      // ── Eighth pair ──
      case 'eighth-pair': {
        const x1 = noteX(0), x2 = noteX(0.5);
        const stemX1 = x1 + 4.5, stemX2 = x2 + 4.5;
        return notehead(x1, cy, true) + notehead(x2, cy, true)
          + stem(stemX1, cy, stemTop) + stem(stemX2, cy, stemTop)
          + beam(stemX1 - 1, stemX2 + 1, stemTop, beamH);
      }

      // ── Four sixteenths ──
      case 'sixteenths': {
        const xs = [noteX(0), noteX(0.25), noteX(0.5), noteX(0.75)];
        const stemXs = xs.map(x => x + 4.5);
        let s = '';
        for (let i = 0; i < 4; i++) {
          s += notehead(xs[i], cy, true) + stem(stemXs[i], cy, stemTop);
        }
        s += beam(stemXs[0] - 1, stemXs[3] + 1, stemTop, beamH);
        s += beam(stemXs[0] - 1, stemXs[3] + 1, stemTop + beamH + beamGap, beamH);
        return s;
      }

      // ── Eighth + two sixteenths ──
      case 'eighth-sixteenth': {
        // 8th at 0-0.5, 16th at 0.5-0.75, 16th at 0.75-1.0
        const xs = [noteX(0), noteX(0.5), noteX(0.75)];
        const stemXs = xs.map(x => x + 4.5);
        let s = '';
        for (let i = 0; i < 3; i++) {
          s += notehead(xs[i], cy, true) + stem(stemXs[i], cy, stemTop);
        }
        // Single beam over all three
        s += beam(stemXs[0] - 1, stemXs[2] + 1, stemTop, beamH);
        // Double beam over last two (16ths): starts at the 8th note stem
        s += beam(stemXs[1] - 1, stemXs[2] + 1, stemTop + beamH + beamGap, beamH);
        return s;
      }

      // ── Two sixteenths + eighth ──
      case 'sixteenth-eighth': {
        // 16th at 0-0.25, 16th at 0.25-0.5, 8th at 0.5-1.0
        const xs = [noteX(0), noteX(0.25), noteX(0.5)];
        const stemXs = xs.map(x => x + 4.5);
        let s = '';
        for (let i = 0; i < 3; i++) {
          s += notehead(xs[i], cy, true) + stem(stemXs[i], cy, stemTop);
        }
        // Single beam over all three
        s += beam(stemXs[0] - 1, stemXs[2] + 1, stemTop, beamH);
        // Double beam over first two (16ths): runs from stem 0 to stem 1
        s += beam(stemXs[0] - 1, stemXs[1] + 1, stemTop + beamH + beamGap, beamH);
        return s;
      }

      // ── Eighth rest + eighth note ──
      case 'eighth-rest-note': {
        const xn = noteX(0.5);
        const stemX = xn + 4.5;
        // Eighth rest at left, eighth note at right with flag
        let s = `<text x="${noteX(0.25)}" y="${cy + 8}" text-anchor="middle" font-size="20" fill="currentColor">𝄿</text>`;
        s += notehead(xn, cy, true) + stem(stemX, cy, stemTop) + flag(stemX, stemTop);
        return s;
      }

      // ── Eighth note + eighth rest ──
      case 'eighth-note-rest': {
        const xn = noteX(0);
        const stemX = xn + 4.5;
        // Eighth note at left with flag, eighth rest at right
        let s = notehead(xn, cy, true) + stem(stemX, cy, stemTop) + flag(stemX, stemTop);
        s += `<text x="${noteX(0.75)}" y="${cy + 8}" text-anchor="middle" font-size="20" fill="currentColor">𝄿</text>`;
        return s;
      }

      // ── Quarter rest ──
      case 'quarter-rest':
        return `<text x="50" y="${cy + 10}" text-anchor="middle" font-size="28" fill="currentColor">𝄽</text>`;

      default:
        return notehead(50, cy, true) + stem(54.5, cy, stemTop);
    }
  })()}
</svg>

<style>
  .notation {
    width: 100%;
    height: auto;
    display: block;
    color: var(--text);
  }
</style>
