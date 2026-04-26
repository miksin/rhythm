export type NoteValue = 'quarter' | 'eighth' | 'sixteenth' | 'eighth-rest';

export interface Note {
  value: NoteValue;
  syllable: string;
  durationTicks: number;
  beamGroup?: number;
}

export interface Measure {
  notes: Note[];
  totalTicks: number;
}

export interface Exercise {
  title: string;
  subtitle: string;
  timeSignature: [number, number];
  measures: Measure[];
  totalMeasures: number;
}
