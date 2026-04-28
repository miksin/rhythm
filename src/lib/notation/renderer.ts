import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  Beam,
  type RenderContext,
} from 'vexflow';
import type { Exercise, NoteValue } from '../rhythm-engine/types';

const DURATION_MAP: Record<NoteValue, string> = {
  quarter: 'q',
  eighth: '8',
  sixteenth: '16',
  'eighth-rest': '8r',
};

export interface RenderResult {
  svg: string;
  /** X position (relative to stave start) for each note, in measure order */
  notePositions: { measureIndex: number; noteIndex: number; x: number }[];
}

/**
 * Renders an Exercise as SVG using VexFlow on a single percussion staff.
 * Returns the SVG string plus per-note x positions for syllable overlay.
 */
export function renderExercise(exercise: Exercise): RenderResult {
  const STAVE_WIDTH = 280;
  const STAVE_X_OFFSET = 60; // extra space for clef/time sig on first measure
  const STAVE_Y = 40;
  const STAVE_HEIGHT = 120;
  const measuresPerRow = 4;
  const rows = Math.ceil(exercise.measures.length / measuresPerRow);
  const totalWidth = measuresPerRow * STAVE_WIDTH + STAVE_X_OFFSET;
  const totalHeight = rows * STAVE_HEIGHT + 40;

  // Create a detached div element for VexFlow SVG rendering
  const div = document.createElement('div');
  div.style.display = 'none';
  document.body.appendChild(div);

  const renderer = new Renderer(div, Renderer.Backends.SVG);
  renderer.resize(totalWidth, totalHeight);
  const context: RenderContext = renderer.getContext();

  const notePositions: RenderResult['notePositions'] = [];

  exercise.measures.forEach((measure, measureIndex) => {
    const row = Math.floor(measureIndex / measuresPerRow);
    const col = measureIndex % measuresPerRow;
    const xOffset = col === 0 ? STAVE_X_OFFSET : 0;
    const x = col * STAVE_WIDTH + xOffset + (col === 0 ? 0 : STAVE_X_OFFSET - STAVE_X_OFFSET);
    const y = STAVE_Y + row * STAVE_HEIGHT;

    const staveWidth = col === 0 ? STAVE_WIDTH + STAVE_X_OFFSET - 10 : STAVE_WIDTH;
    const staveX = col === 0 ? 10 : col * STAVE_WIDTH + STAVE_X_OFFSET;

    const stave = new Stave(staveX, y, staveWidth);

    if (measureIndex === 0) {
      stave.addClef('percussion');
      const [beats, beatValue] = exercise.timeSignature;
      stave.addTimeSignature(`${beats}/${beatValue}`);
    }

    stave.setContext(context).draw();

    const vfNotes = measure.notes.map((note) => {
      const duration = DURATION_MAP[note.value];
      const isRest = note.value === 'eighth-rest';
      return new StaveNote({
        keys: isRest ? ['b/4'] : ['b/4'],
        duration: duration,
        stemDirection: 1,
      });
    });

    // Generate beams
    const beams = Beam.generateBeams(vfNotes);

    const voice = new Voice({
      numBeats: exercise.timeSignature[0],
      beatValue: exercise.timeSignature[1],
    });
    voice.setMode(Voice.Mode.SOFT);
    voice.addTickables(vfNotes);

    const formatter = new Formatter();
    formatter.joinVoices([voice]).format([voice], staveWidth - 30);

    voice.draw(context, stave);
    beams.forEach((b) => b.setContext(context).draw());

    // Capture note x positions
    vfNotes.forEach((vfNote, noteIndex) => {
      try {
        const noteX = vfNote.getAbsoluteX();
        notePositions.push({ measureIndex, noteIndex, x: noteX });
      } catch {
        notePositions.push({ measureIndex, noteIndex, x: 0 });
      }
    });
  });

  const svgEl = div.querySelector('svg');
  const svg = svgEl ? svgEl.outerHTML : '';
  document.body.removeChild(div);

  return { svg, notePositions };
}
