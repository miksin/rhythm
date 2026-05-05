export type Difficulty = 'basic' | 'intermediate' | 'advanced' | 'all';

export interface RhythmPattern {
  id: string;
  label: string;
  symbol: string;
  duration: number;
  category: 'note-1' | 'note-2' | 'rest' | 'long';
  difficulty: Difficulty;
  subdivisions: number[];
}

export interface PlacedPattern {
  pattern: RhythmPattern;
  col: number;
  span: number;
}

export type Row = PlacedPattern[];

const PATTERNS: RhythmPattern[] = [
  {
    id: 'quarter',
    label: '四分音符',
    symbol: '♩',
    duration: 1,
    category: 'note-1',
    difficulty: 'basic',
    subdivisions: [0],
  },
  {
    id: 'eighth-pair',
    label: '八分音符×2',
    symbol: '♫',
    duration: 1,
    category: 'note-2',
    difficulty: 'basic',
    subdivisions: [0, 0.5],
  },
  {
    id: 'quarter-rest',
    label: '四分休止符',
    symbol: '𝄽',
    duration: 1,
    category: 'rest',
    difficulty: 'basic',
    subdivisions: [],
  },
  {
    id: 'half',
    label: '二分音符',
    symbol: '𝅗𝅥',
    duration: 2,
    category: 'long',
    difficulty: 'intermediate',
    subdivisions: [0],
  },
  {
    id: 'half-rest',
    label: '二分休止符',
    symbol: '𝄼',
    duration: 2,
    category: 'rest',
    difficulty: 'intermediate',
    subdivisions: [],
  },
  {
    id: 'dotted-half',
    label: '附點二分音符',
    symbol: '𝅗𝅥.',
    duration: 3,
    category: 'long',
    difficulty: 'intermediate',
    subdivisions: [0],
  },
  {
    id: 'whole',
    label: '全音符',
    symbol: '𝅝',
    duration: 4,
    category: 'long',
    difficulty: 'advanced',
    subdivisions: [0],
  },
  {
    id: 'whole-rest',
    label: '全休止符',
    symbol: '𝄻',
    duration: 4,
    category: 'rest',
    difficulty: 'advanced',
    subdivisions: [],
  },
  {
    id: 'sixteenths',
    label: '十六分音符×4',
    symbol: '♬',
    duration: 1,
    category: 'note-2',
    difficulty: 'advanced',
    subdivisions: [0, 0.25, 0.5, 0.75],
  },
  {
    id: 'eighth-rest-note',
    label: '八分休止+八分',
    symbol: '𝄿♪',
    duration: 1,
    category: 'note-2',
    difficulty: 'advanced',
    subdivisions: [0.5],
  },
  {
    id: 'eighth-note-rest',
    label: '八分+八分休止',
    symbol: '♪𝄿',
    duration: 1,
    category: 'note-2',
    difficulty: 'advanced',
    subdivisions: [0],
  },
];

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  basic: 0,
  intermediate: 1,
  advanced: 2,
  all: 2,
};

export function getPatternsForDifficulty(difficulty: Difficulty): RhythmPattern[] {
  const maxRank = DIFFICULTY_RANK[difficulty];
  return PATTERNS.filter((p) => DIFFICULTY_RANK[p.difficulty] <= maxRank);
}
