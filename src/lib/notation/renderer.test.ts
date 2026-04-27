import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from './renderer';
import type { Exercise } from '../rhythm-engine/types';

// VexFlow requires a DOM with SVG support — mock heavy rendering
vi.mock('vexflow', () => {
  const mockCtx = {
    save: vi.fn(),
    restore: vi.fn(),
    setFont: vi.fn(),
    fillText: vi.fn(),
  };
  const MockStave = vi.fn().mockImplementation(() => ({
    addClef: vi.fn().mockReturnThis(),
    addTimeSignature: vi.fn().mockReturnThis(),
    setContext: vi.fn().mockReturnThis(),
    draw: vi.fn(),
  }));
  const MockStaveNote = vi.fn().mockImplementation(() => ({
    getAbsoluteX: vi.fn().mockReturnValue(100),
  }));
  const MockVoice = vi.fn().mockImplementation(() => ({
    setStrict: vi.fn().mockReturnThis(),
    addTickables: vi.fn().mockReturnThis(),
    draw: vi.fn(),
  }));
  const MockFormatter = vi.fn().mockImplementation(() => ({
    joinVoices: vi.fn().mockReturnThis(),
    format: vi.fn().mockReturnThis(),
  }));
  const MockBeam = { generateBeams: vi.fn().mockReturnValue([]) };
  const MockRenderer = vi.fn().mockImplementation(() => ({
    resize: vi.fn(),
    getContext: vi.fn().mockReturnValue(mockCtx),
  }));
  MockRenderer.Backends = { SVG: 'svg' };

  return {
    Renderer: MockRenderer,
    Stave: MockStave,
    StaveNote: MockStaveNote,
    Voice: MockVoice,
    Formatter: MockFormatter,
    Beam: MockBeam,
  };
});

const sampleExercise: Exercise = {
  measures: [
    {
      notes: [
        { value: 'quarter', syllable: 'Ta' },
        { value: 'quarter', syllable: 'Ta' },
        { value: 'eighth', syllable: 'Ti' },
        { value: 'eighth', syllable: 'Ti' },
        { value: 'quarter', syllable: 'Ta' },
      ],
      beatsPerMeasure: 4,
      beatUnit: 4,
    },
  ],
  bpm: 60,
};

describe('renderer', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('clears and renders into container', () => {
    container.innerHTML = '<span>old</span>';
    render(sampleExercise, container);
    expect(container.innerHTML).toBe('');
  });

  it('does not throw for an exercise with multiple measures', () => {
    const multi: Exercise = {
      ...sampleExercise,
      measures: [sampleExercise.measures[0], sampleExercise.measures[0]],
    };
    expect(() => render(multi, container)).not.toThrow();
  });

  it('handles empty measures gracefully', () => {
    const empty: Exercise = { measures: [], bpm: 60 };
    expect(() => render(empty, container)).not.toThrow();
  });
});
