import type { Beat, Measure, RhythmSheet, Difficulty } from './types'
import { PATTERNS } from './rhythmPatterns'

function randomBeat(difficulty: Difficulty): Beat {
  const patterns = PATTERNS[difficulty]
  return patterns[Math.floor(Math.random() * patterns.length)]
}

function generateMeasure(difficulty: Difficulty): Measure {
  return [
    randomBeat(difficulty),
    randomBeat(difficulty),
    randomBeat(difficulty),
    randomBeat(difficulty),
  ]
}

export function generateHalf(difficulty: Difficulty): [Measure, Measure] {
  return [generateMeasure(difficulty), generateMeasure(difficulty)]
}

export function generateSheet(difficulty: Difficulty): RhythmSheet {
  return [
    generateMeasure(difficulty),
    generateMeasure(difficulty),
    generateMeasure(difficulty),
    generateMeasure(difficulty),
  ]
}
