export type NoteValue =
  | '1/4'
  | '1/8'
  | '1/16'
  | '1/8-dot'
  | 'rest-1/4'
  | 'rest-1/8'
  | 'rest-1/16'
  | 'rest-1/8-dot'
  | 'triplet-1/8'

export type Beat = NoteValue[]
export type Measure = [Beat, Beat, Beat, Beat]
export type RhythmSheet = [Measure, Measure, Measure, Measure]

export type Difficulty = 'basic' | 'intermediate' | 'advanced'
export type CellState = 'upcoming' | 'active' | 'played'

export type GameMode = 'endless' | 'regular'
export type RegularSheet = RhythmSheet
