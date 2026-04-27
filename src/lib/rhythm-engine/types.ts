export type NoteValue = 'quarter' | 'eighth' | 'sixteenth' | 'eighth-rest';

export const PPQ = 480;

export const NOTE_TICKS: Record<NoteValue, number> = {
  quarter: PPQ,
  eighth: PPQ / 2,
  sixteenth: PPQ / 4,
  'eighth-rest': PPQ / 2,
};

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
