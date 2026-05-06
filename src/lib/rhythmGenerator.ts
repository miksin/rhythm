import type { Beat, Measure, RhythmSheet, Difficulty } from './types'
import { PATTERNS, THEMES } from './rhythmPatterns'

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateMeasure(patterns: Beat[]): Measure {
  return [pick(patterns), pick(patterns), pick(patterns), pick(patterns)]
}

export function generateHalf(difficulty: Difficulty): [Measure, Measure] {
  const theme = pick(THEMES[difficulty])
  return [generateMeasure(theme.patterns), generateMeasure(theme.patterns)]
}

export function generateSheet(difficulty: Difficulty): RhythmSheet {
  const [m0, m1] = generateHalf(difficulty)
  const [m2, m3] = generateHalf(difficulty)
  return [m0, m1, m2, m3]
}
