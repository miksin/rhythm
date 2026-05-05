import type { Beat, Difficulty } from './types'

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

export const PATTERNS: Record<Difficulty, Beat[]> = {
  basic: BASIC,
  intermediate: [...BASIC, ...INTERMEDIATE_EXTRA],
  advanced: [...BASIC, ...INTERMEDIATE_EXTRA, ...ADVANCED_EXTRA],
}
