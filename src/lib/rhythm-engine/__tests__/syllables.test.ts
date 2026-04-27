import { describe, it, expect } from 'vitest';
import { getSyllable, SYLLABLE_MAP } from '../syllables';

describe('syllables', () => {
  it('SYLLABLE_MAP covers all NoteValues', () => {
    expect(SYLLABLE_MAP.quarter).toBe('Ta');
    expect(SYLLABLE_MAP.eighth).toBe('Ti');
    expect(SYLLABLE_MAP.sixteenth).toBe('ti-ka');
    expect(SYLLABLE_MAP['eighth-rest']).toBe('Ehm');
  });

  it('getSyllable returns correct syllables', () => {
    expect(getSyllable('quarter')).toBe('Ta');
    expect(getSyllable('eighth')).toBe('Ti');
    expect(getSyllable('sixteenth')).toBe('ti-ka');
    expect(getSyllable('eighth-rest')).toBe('Ehm');
  });
});
