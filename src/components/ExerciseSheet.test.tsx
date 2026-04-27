import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render as rtlRender } from '@testing-library/react';
import { ExerciseSheet } from './ExerciseSheet';
import type { Exercise } from '../lib/rhythm-engine/types';

vi.mock('../lib/notation/renderer', () => ({
  render: vi.fn(),
}));

const sampleExercise: Exercise = {
  measures: [
    {
      notes: [{ value: 'quarter', syllable: 'Ta' }],
      beatsPerMeasure: 4,
      beatUnit: 4,
    },
  ],
  bpm: 60,
};

describe('ExerciseSheet', () => {
  it('renders without crashing', () => {
    const { container } = rtlRender(<ExerciseSheet exercise={sampleExercise} />);
    expect(container.querySelector('.exercise-sheet')).toBeTruthy();
  });

  it('has accessible role=img with aria-label', () => {
    const { getByRole } = rtlRender(<ExerciseSheet exercise={sampleExercise} />);
    const el = getByRole('img');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-label')).toBe('Rhythm exercise sheet');
  });

  it('applies given width style', () => {
    const { container } = rtlRender(<ExerciseSheet exercise={sampleExercise} width={800} />);
    const sheet = container.querySelector('.exercise-sheet') as HTMLElement;
    expect(sheet.style.width).toBe('800px');
  });
});
