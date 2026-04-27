export type NoteValue = 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth';

export interface Note {
  value: NoteValue;
  syllable: string;
}

export interface Measure {
  notes: Note[];
  /** beats per measure, default 4 */
  beatsPerMeasure: number;
  /** beat unit, default 4 (quarter note) */
  beatUnit: number;
}

export interface Exercise {
  measures: Measure[];
  bpm: number;
}
