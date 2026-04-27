import { describe, it, expect } from 'vitest';
import { NOTE_TICKS, PPQ } from '../types';

describe('types', () => {
  it('PPQ is 480', () => {
    expect(PPQ).toBe(480);
  });

  it('NOTE_TICKS has correct values', () => {
    expect(NOTE_TICKS.quarter).toBe(480);
    expect(NOTE_TICKS.eighth).toBe(240);
    expect(NOTE_TICKS.sixteenth).toBe(120);
    expect(NOTE_TICKS['eighth-rest']).toBe(240);
  });
});
