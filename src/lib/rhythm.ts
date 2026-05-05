export type Difficulty = 'basic' | 'intermediate' | 'advanced' | 'all';

export type NoteCategory = 'note-1' | 'note-2' | 'note-4' | 'rest' | 'long';

export interface RhythmPattern {
  id: string;
  label: string;
  symbol: string;
  duration: number;
  category: NoteCategory;
  difficulty: Difficulty;
  subdivisions: number[];
  weight: number;
}

export interface PlacedPattern {
  pattern: RhythmPattern;
  col: number;
  span: number;
}

export type Row = PlacedPattern[];

const PATTERNS: RhythmPattern[] = [
  // ── 1-beat, note-heavy (high weight) ──
  {
    id: 'sixteenths',
    label: '十六分音符×4',
    symbol: '♬',
    duration: 1,
    category: 'note-4',
    difficulty: 'advanced',
    subdivisions: [0, 0.25, 0.5, 0.75],
    weight: 5,
  },
  {
    id: 'sixteenth-eighth',
    label: '十六分×2+八分',
    symbol: '♬♫',
    duration: 1,
    category: 'note-4',
    difficulty: 'advanced',
    subdivisions: [0, 0.25, 0.5],
    weight: 3,
  },
  {
    id: 'eighth-sixteenth',
    label: '八分+十六分×2',
    symbol: '♫♬',
    duration: 1,
    category: 'note-4',
    difficulty: 'advanced',
    subdivisions: [0, 0.5, 0.75],
    weight: 3,
  },
  {
    id: 'sixteenth-eighth-sixteenth',
    label: '十六分+八分+十六分',
    symbol: '♬♫♬',
    duration: 1,
    category: 'note-4',
    difficulty: 'advanced',
    subdivisions: [0, 0.25, 0.75],
    weight: 3,
  },
  {
    id: 'eighth-pair',
    label: '八分音符×2',
    symbol: '♫',
    duration: 1,
    category: 'note-2',
    difficulty: 'basic',
    subdivisions: [0, 0.5],
    weight: 4,
  },
  {
    id: 'quarter',
    label: '四分音符',
    symbol: '♩',
    duration: 1,
    category: 'note-1',
    difficulty: 'basic',
    subdivisions: [0],
    weight: 2,
  },
  // ── 1-beat, rest-mixed (low weight) ──
  {
    id: 'eighth-rest-note',
    label: '八分休止+八分',
    symbol: '𝄿♪',
    duration: 1,
    category: 'note-2',
    difficulty: 'intermediate',
    subdivisions: [0.5],
    weight: 1,
  },
  {
    id: 'eighth-note-rest',
    label: '八分+八分休止',
    symbol: '♪𝄿',
    duration: 1,
    category: 'note-2',
    difficulty: 'intermediate',
    subdivisions: [0],
    weight: 1,
  },
  // ── 1-beat, pure rest (lowest weight) ──
  {
    id: 'quarter-rest',
    label: '四分休止符',
    symbol: '𝄽',
    duration: 1,
    category: 'rest',
    difficulty: 'basic',
    subdivisions: [],
    weight: 1,
  },
  // ── 2-beat (low weight) ──
  {
    id: 'half',
    label: '二分音符',
    symbol: '𝅗𝅥',
    duration: 2,
    category: 'long',
    difficulty: 'intermediate',
    subdivisions: [0],
    weight: 1,
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

function weightedRandomPick(patterns: RhythmPattern[]): RhythmPattern {
  const totalWeight = patterns.reduce((sum, p) => sum + p.weight, 0);
  let r = Math.random() * totalWeight;
  for (const p of patterns) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return patterns[patterns.length - 1];
}

export function generateGrid(difficulty: Difficulty): Row[] {
  const candidates = getPatternsForDifficulty(difficulty);
  const rows: Row[] = [];

  for (let r = 0; r < 4; r++) {
    const row: PlacedPattern[] = [];
    let remaining = 4;

    while (remaining > 0) {
      const valid = candidates.filter((p) => p.duration <= remaining);
      const picked = weightedRandomPick(valid);
      row.push({ pattern: picked, col: 4 - remaining, span: picked.duration });
      remaining -= picked.duration;
    }

    rows.push(row);
  }

  return rows;
}
