import { Renderer, Stave, StaveNote, Voice, Formatter, Beam } from 'vexflow';
import type { Exercise, Note, NoteValue } from '../rhythm-engine/types';

const VF_DURATION_MAP: Record<NoteValue, string> = {
  whole: 'w',
  half: 'h',
  quarter: 'q',
  eighth: '8',
  sixteenth: '16',
};

interface NotePosition {
  x: number;
  syllable: string;
}

function getNotePositions(
  staveNotes: StaveNote[],
  notes: Note[]
): NotePosition[] {
  return staveNotes.map((sn, i) => ({
    x: sn.getAbsoluteX(),
    syllable: notes[i]?.syllable ?? '',
  }));
}

function drawSyllables(
  ctx: CanvasRenderingContext2D | SVGElement,
  positions: NotePosition[],
  y: number,
  renderer: Renderer
): void {
  // Use the VexFlow context's SVG or canvas element to draw syllable text
  const vfCtx = renderer.getContext();
  positions.forEach(({ x, syllable }) => {
    if (!syllable) return;
    vfCtx.save();
    vfCtx.setFont('Arial', 11);
    vfCtx.fillText(syllable, x - syllable.length * 2.5, y);
    vfCtx.restore();
  });
}

export interface RenderOptions {
  width?: number;
  height?: number;
  staveWidth?: number;
  syllableOffset?: number;
}

export function render(exercise: Exercise, container: HTMLElement, options: RenderOptions = {}): void {
  const {
    width = 600,
    height = 160,
    staveWidth = 130,
    syllableOffset = 30,
  } = options;

  // Clear previous content
  container.innerHTML = '';

  const totalWidth = staveWidth * exercise.measures.length + 40;
  const renderer = new Renderer(container as HTMLDivElement, Renderer.Backends.SVG);
  renderer.resize(Math.max(width, totalWidth), height);
  const ctx = renderer.getContext();

  let startX = 10;
  const staveY = 20;

  const allNotePositions: NotePosition[] = [];

  exercise.measures.forEach((measure, measureIndex) => {
    const stave = new Stave(startX, staveY, staveWidth);
    if (measureIndex === 0) {
      stave.addClef('percussion').addTimeSignature(`${measure.beatsPerMeasure}/${measure.beatUnit}`);
    }
    stave.setContext(ctx).draw();

    const staveNotes = measure.notes.map(
      (note) =>
        new StaveNote({
          keys: ['b/4'],
          duration: VF_DURATION_MAP[note.value],
          stemDirection: -1,
        })
    );

    const voice = new Voice({ numBeats: measure.beatsPerMeasure, beatValue: measure.beatUnit });
    voice.setStrict(false);
    voice.addTickables(staveNotes);

    const beams = Beam.generateBeams(staveNotes);

    new Formatter().joinVoices([voice]).format([voice], staveWidth - 20);
    voice.draw(ctx, stave);
    beams.forEach((b) => b.setContext(ctx).draw());

    const positions = getNotePositions(staveNotes, measure.notes);
    allNotePositions.push(...positions);

    startX += staveWidth;
  });

  // Draw syllables below all staves
  const syllableY = staveY + 80 + syllableOffset;
  drawSyllables(ctx as unknown as CanvasRenderingContext2D, allNotePositions, syllableY, renderer);
}
