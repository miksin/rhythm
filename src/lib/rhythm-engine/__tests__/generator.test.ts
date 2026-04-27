import { describe, it, expect } from 'vitest';
import { generateMeasure, generateExercise } from '../generator';
import { PPQ } from '../types';

const TICKS_PER_MEASURE = 4 * PPQ;

describe('generateMeasure', () => {
  const rng = () => 0.5;

  it('returns a measure with totalTicks equal to 4*PPQ', () => {
    const measure = generateMeasure(1, rng);
    expect(measure.totalTicks).toBe(TICKS_PER_MEASURE);
  });

  it('difficulty 1 only produces quarter notes', () => {
    const rng = () => 0.3;
    const measure = generateMeasure(1, rng);
    for (const note of measure.notes) {
      expect(note.value).toBe('quarter');
    }
  });

  it('note durationTicks sum equals totalTicks', () => {
    const rng = () => 0.7;
    for (const diff of [1, 2, 3] as const) {
      const measure = generateMeasure(diff, rng);
      const sum = measure.notes.reduce((acc, n) => acc + n.durationTicks, 0);
      expect(sum).toBe(TICKS_PER_MEASURE);
    }
  });

  it('each note has correct syllable', () => {
    const measure = generateMeasure(1, () => 0.5);
    for (const note of measure.notes) {
      expect(note.syllable).toBeTruthy();
    }
  });
});

describe('generateExercise', () => {
  it('returns an exercise with correct timeSignature', () => {
    const ex = generateExercise(1, 42);
    expect(ex.timeSignature).toEqual([4, 4]);
  });

  it('all measures have correct totalTicks', () => {
    const ex = generateExercise(2, 123);
    for (const m of ex.measures) {
      expect(m.totalTicks).toBe(TICKS_PER_MEASURE);
      const sum = m.notes.reduce((acc, n) => acc + n.durationTicks, 0);
      expect(sum).toBe(TICKS_PER_MEASURE);
    }
  });

  it('difficulty 3 can include all note types', () => {
    // Run many exercises to ensure all types appear eventually
    const allValues = new Set<string>();
    for (let seed = 0; seed < 100; seed++) {
      const ex = generateExercise(3, seed, 4);
      for (const m of ex.measures) {
        for (const n of m.notes) allValues.add(n.value);
      }
    }
    expect(allValues.has('quarter')).toBe(true);
    expect(allValues.has('eighth')).toBe(true);
  });

  it('measureCount is respected when given', () => {
    const ex = generateExercise(1, 42, 8);
    expect(ex.measures.length).toBe(8);
    expect(ex.totalMeasures).toBe(8);
  });

  it('same seed produces same exercise', () => {
    const ex1 = generateExercise(2, 999);
    const ex2 = generateExercise(2, 999);
    expect(ex1.title).toBe(ex2.title);
    expect(ex1.measures.length).toBe(ex2.measures.length);
  });
});
