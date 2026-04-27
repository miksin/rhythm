import type { Exercise, Measure, NoteValue } from './types';
import { makeNote } from './syllables';

const QUARTER_VALUES: NoteValue[] = ['quarter', 'quarter', 'quarter', 'quarter'];
const PATTERNS: NoteValue[][] = [
  ['quarter', 'quarter', 'quarter', 'quarter'],
  ['quarter', 'eighth', 'eighth', 'quarter', 'quarter'],
  ['quarter', 'quarter', 'eighth', 'eighth', 'quarter'],
  ['eighth', 'eighth', 'quarter', 'quarter', 'quarter'],
  ['quarter', 'quarter', 'quarter', 'eighth', 'eighth'],
];

function randomPattern(): NoteValue[] {
  return PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
}

export function generateMeasure(): Measure {
  const noteValues = Math.random() > 0.3 ? randomPattern() : QUARTER_VALUES;
  return {
    notes: noteValues.map(makeNote),
    beatsPerMeasure: 4,
    beatUnit: 4,
  };
}

export function generateExercise(numMeasures = 4, bpm = 60): Exercise {
  return {
    measures: Array.from({ length: numMeasures }, generateMeasure),
    bpm,
  };
}
