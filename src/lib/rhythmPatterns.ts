import type { Beat, Difficulty } from './types'

export type Theme = {
  name: string
  patterns: Beat[]
}

// ── raw pattern lists ────────────────────────────────────────────────────────

const BASIC: Beat[] = [
  ['1/4'],
  ['1/8', '1/8'],
  ['rest-1/4'],
  ['1/8', 'rest-1/8'],
  ['rest-1/8', '1/8'],
]

const INTERMEDIATE_EXTRA: Beat[] = [
  ['1/16', '1/16', '1/16', '1/16'],
  ['1/8-dot', '1/16'],
  ['1/16', '1/8-dot'],
  ['1/8', '1/16', '1/16'],
  ['1/16', '1/8', '1/16'],
  ['1/16', '1/16', '1/8'],
  ['rest-1/16', '1/16', '1/16', '1/16'],
  ['1/16', 'rest-1/16', '1/16', '1/16'],
  ['1/16', '1/16', 'rest-1/16', '1/16'],
  ['1/16', '1/16', '1/16', 'rest-1/16'],
]

const ADVANCED_EXTRA: Beat[] = [
  ['triplet-1/8', 'triplet-1/8', 'triplet-1/8'],
  ['rest-1/16', '1/16', '1/8'],
  ['rest-1/16', '1/8', '1/16'],
  ['1/16', 'rest-1/16', '1/8'],
  ['1/16', '1/8', 'rest-1/16'],
  ['1/8', 'rest-1/16', '1/16'],
  ['1/8', '1/16', 'rest-1/16'],
  ['rest-1/8-dot', '1/16'],
  ['1/16', 'rest-1/8-dot'],
]

// ── flat pools (kept for test validation) ────────────────────────────────────

export const PATTERNS: Record<Difficulty, Beat[]> = {
  basic:        BASIC,
  intermediate: [...BASIC, ...INTERMEDIATE_EXTRA],
  advanced:     [...BASIC, ...INTERMEDIATE_EXTRA, ...ADVANCED_EXTRA],
}

// ── themes ────────────────────────────────────────────────────────────────────

export const THEMES: Record<Difficulty, Theme[]> = {
  basic: [
    {
      name: 'Quarter Note',
      patterns: [['1/4'], ['rest-1/4']],
    },
    {
      name: 'Eighth Note',
      patterns: [['1/8', '1/8'], ['1/8', 'rest-1/8'], ['rest-1/8', '1/8']],
    },
    {
      name: 'Mixed',
      patterns: BASIC,
    },
  ],

  intermediate: [
    {
      name: 'Eighth Note',
      patterns: [['1/8', '1/8'], ['1/8', 'rest-1/8'], ['rest-1/8', '1/8']],
    },
    {
      name: 'Sixteenth Subdivision',
      patterns: [
        ['1/16', '1/16', '1/16', '1/16'],
        ['1/8', '1/16', '1/16'],
        ['1/16', '1/16', '1/8'],
        ['1/16', '1/8', '1/16'],
      ],
    },
    {
      name: 'Dotted Rhythm',
      patterns: [['1/8-dot', '1/16'], ['1/16', '1/8-dot'], ['1/8', '1/8']],
    },
    {
      name: 'Syncopation',
      patterns: [
        ['rest-1/16', '1/16', '1/16', '1/16'],
        ['1/16', 'rest-1/16', '1/16', '1/16'],
        ['1/16', '1/16', 'rest-1/16', '1/16'],
        ['1/16', '1/16', '1/16', 'rest-1/16'],
      ],
    },
  ],

  advanced: [
    {
      name: 'Triplet',
      patterns: [['triplet-1/8', 'triplet-1/8', 'triplet-1/8'], ['1/4'], ['1/8', '1/8']],
    },
    {
      name: 'Advanced Syncopation',
      patterns: [
        ['rest-1/16', '1/16', '1/8'],
        ['rest-1/16', '1/8', '1/16'],
        ['1/16', 'rest-1/16', '1/8'],
        ['1/16', '1/8', 'rest-1/16'],
        ['1/8', 'rest-1/16', '1/16'],
        ['1/8', '1/16', 'rest-1/16'],
        ['rest-1/8-dot', '1/16'],
        ['1/16', 'rest-1/8-dot'],
      ],
    },
    {
      name: 'Mixed Advanced',
      patterns: [...BASIC, ...INTERMEDIATE_EXTRA, ...ADVANCED_EXTRA],
    },
  ],
}
