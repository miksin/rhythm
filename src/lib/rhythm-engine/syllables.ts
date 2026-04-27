import type { NoteValue } from './types';

export const SYLLABLE_MAP: Record<NoteValue, string> = {
  quarter: 'Ta',
  eighth: 'Ti',
  sixteenth: 'ti-ka',
  'eighth-rest': 'Ehm',
};

export function getSyllable(value: NoteValue): string {
  return SYLLABLE_MAP[value];
}
