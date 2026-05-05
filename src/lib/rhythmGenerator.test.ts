import { describe, it, expect } from 'vitest'
import { generateSheet, generateHalf } from './rhythmGenerator'
import { PATTERNS } from './rhythmPatterns'
import type { Difficulty } from './types'

const DURATION: Record<string, number> = {
  '1/4': 4, '1/8': 2, '1/16': 1, '1/8-dot': 3,
  'rest-1/4': 4, 'rest-1/8': 2, 'rest-1/16': 1, 'rest-1/8-dot': 3,
  'triplet-1/8': 4 / 3,
}

const difficulties: Difficulty[] = ['basic', 'intermediate', 'advanced']

describe('generateSheet', () => {
  it('returns 4 measures of 4 beats each', () => {
    for (const d of difficulties) {
      const sheet = generateSheet(d)
      expect(sheet).toHaveLength(4)
      for (const measure of sheet) expect(measure).toHaveLength(4)
    }
  })

  it('each beat sums to exactly 4 sixteenth units', () => {
    for (const d of difficulties) {
      const sheet = generateSheet(d)
      for (const measure of sheet) {
        for (const beat of measure) {
          const total = beat.reduce((s, n) => s + DURATION[n], 0)
          expect(total).toBeCloseTo(4, 5)
        }
      }
    }
  })

  it('each beat is a pattern from the correct difficulty library', () => {
    const patternStrings = (d: Difficulty) =>
      new Set(PATTERNS[d].map(p => JSON.stringify(p)))

    for (const d of difficulties) {
      const allowed = patternStrings(d)
      const sheet = generateSheet(d)
      for (const measure of sheet) {
        for (const beat of measure) {
          expect(allowed.has(JSON.stringify(beat))).toBe(true)
        }
      }
    }
  })
})

describe('generateHalf', () => {
  it('returns 2 measures of 4 beats each', () => {
    const half = generateHalf('basic')
    expect(half).toHaveLength(2)
    for (const measure of half) expect(measure).toHaveLength(4)
  })
})
