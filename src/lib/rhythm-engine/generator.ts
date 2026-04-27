import type { NoteValue, Note, Measure, Exercise } from './types';
import { NOTE_TICKS, PPQ } from './types';
import { getSyllable } from './syllables';

const TICKS_PER_MEASURE = 4 * PPQ; // 4/4 time

type Difficulty = 1 | 2 | 3;

function noteValuesForDifficulty(difficulty: Difficulty): NoteValue[] {
  if (difficulty === 1) return ['quarter'];
  if (difficulty === 2) return ['quarter', 'eighth'];
  return ['quarter', 'eighth', 'sixteenth', 'eighth-rest'];
}

// Simple seeded LCG random number generator
function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickRandom<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function generateMeasure(difficulty: Difficulty, rng: () => number, beamGroupStart = 0): Measure {
  const allowedValues = noteValuesForDifficulty(difficulty);
  const notes: Note[] = [];
  let remaining = TICKS_PER_MEASURE;
  let beamGroupCounter = beamGroupStart;

  while (remaining > 0) {
    // Only pick values that fit in remaining ticks
    const fitting = allowedValues.filter(v => NOTE_TICKS[v] <= remaining);
    if (fitting.length === 0) break;

    const value = pickRandom(rng, fitting);
    const ticks = NOTE_TICKS[value];

    const note: Note = {
      value,
      syllable: getSyllable(value),
      durationTicks: ticks,
    };

    // Assign beam groups for eighth and sixteenth notes
    if (value === 'eighth' || value === 'sixteenth') {
      note.beamGroup = beamGroupCounter;
    } else {
      beamGroupCounter++;
    }

    // Increment beam group after a complete beat (480 ticks)
    notes.push(note);
    remaining -= ticks;

    // New beam group after each beat boundary
    const usedTicks = TICKS_PER_MEASURE - remaining;
    if (usedTicks % PPQ === 0) {
      beamGroupCounter++;
    }
  }

  return {
    notes,
    totalTicks: TICKS_PER_MEASURE,
  };
}

export function generateExercise(
  difficulty: Difficulty = 1,
  seed?: number,
  measureCount?: number,
): Exercise {
  const rng = createRng(seed ?? Math.floor(Math.random() * 0x7fffffff));
  const count = measureCount ?? randomInt(rng, 8, 16);

  const subtitleMap: Record<Difficulty, string> = {
    1: 'Crotchet',
    2: 'Crotchet & Quaver',
    3: 'Crotchet, Quaver & Semiquaver',
  };

  const measures: Measure[] = [];
  let beamGroupStart = 0;
  for (let i = 0; i < count; i++) {
    const m = generateMeasure(difficulty, rng, beamGroupStart);
    beamGroupStart += m.notes.length;
    measures.push(m);
  }

  return {
    title: `Exercise ${randomInt(rng, 1, 99)}`,
    subtitle: subtitleMap[difficulty],
    timeSignature: [4, 4],
    measures,
    totalMeasures: count,
  };
}
