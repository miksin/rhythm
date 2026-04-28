import { describe, it, expect, vi } from 'vitest';
import { generateExercise } from '@/lib/rhythm-engine/generator';

// Mock VexFlow since it requires a full DOM with SVG support
vi.mock('vexflow', () => {
  const MockStaveNote = vi.fn().mockImplementation(() => ({
    getAbsoluteX: () => 100,
  }));
  const MockStave = vi.fn().mockImplementation(() => ({
    addClef: vi.fn().mockReturnThis(),
    addTimeSignature: vi.fn().mockReturnThis(),
    setContext: vi.fn().mockReturnThis(),
    draw: vi.fn().mockReturnThis(),
  }));
  const MockVoice = vi.fn().mockImplementation(() => ({
    setMode: vi.fn().mockReturnThis(),
    addTickables: vi.fn().mockReturnThis(),
    draw: vi.fn().mockReturnThis(),
  }));
  (MockVoice as unknown as { Mode: { SOFT: number } }).Mode = { SOFT: 2 };
  const MockFormatter = vi.fn().mockImplementation(() => ({
    joinVoices: vi.fn().mockReturnThis(),
    format: vi.fn().mockReturnThis(),
  }));
  const MockBeam = vi.fn().mockImplementation(() => ({
    setContext: vi.fn().mockReturnThis(),
    draw: vi.fn().mockReturnThis(),
  }));
  (MockBeam as unknown as { generateBeams: (notes: unknown[]) => unknown[] }).generateBeams = vi.fn().mockReturnValue([]);
  const mockSvgEl = {
    outerHTML: '<svg width="100" height="100"><g></g></svg>',
    querySelector: vi.fn().mockReturnValue(null),
  };
  const mockDiv = {
    style: { display: '' },
    querySelector: vi.fn().mockReturnValue(mockSvgEl),
  };
  const mockDocumentBody = {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  };
  // Patch document.createElement and document.body in the test environment
  vi.stubGlobal('document', {
    createElement: vi.fn().mockReturnValue(mockDiv),
    body: mockDocumentBody,
    querySelector: vi.fn().mockReturnValue(null),
  });

  const MockRenderer = vi.fn().mockImplementation(() => ({
    resize: vi.fn().mockReturnThis(),
    getContext: vi.fn().mockReturnValue({} as object),
  }));
  (MockRenderer as unknown as { Backends: { SVG: number } }).Backends = { SVG: 2 };

  return {
    Renderer: MockRenderer,
    Stave: MockStave,
    StaveNote: MockStaveNote,
    Voice: MockVoice,
    Formatter: MockFormatter,
    Beam: MockBeam,
  };
});

describe('renderExercise', () => {
  it('returns svg string and note positions for a simple exercise', async () => {
    const { renderExercise } = await import('@/lib/notation/renderer');
    const exercise = generateExercise(1, 42, 2);
    const result = renderExercise(exercise);
    expect(typeof result.svg).toBe('string');
    expect(Array.isArray(result.notePositions)).toBe(true);
    expect(result.notePositions.length).toBeGreaterThan(0);
    result.notePositions.forEach((pos) => {
      expect(typeof pos.measureIndex).toBe('number');
      expect(typeof pos.noteIndex).toBe('number');
      expect(typeof pos.x).toBe('number');
    });
  });
});
