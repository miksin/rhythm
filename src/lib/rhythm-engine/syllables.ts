import type { NoteValue, Note } from './types';

const SYLLABLE_MAP: Record<NoteValue, string> = {
  whole: 'Ehm',
  half: 'Ta-a',
  quarter: 'Ta',
  eighth: 'Ti',
  sixteenth: 'Ti-ka',
};

export function noteToSyllable(value: NoteValue): string {
  return SYLLABLE_MAP[value] ?? 'Ta';
}

export function makeNote(value: NoteValue): Note {
  return { value, syllable: noteToSyllable(value) };
}
