import { describe, it, expect } from 'vitest'
import { PATTERNS } from './rhythmPatterns'
import type { Difficulty } from './types'

const DURATION: Record<string, number> = {
  '1/4': 4, '1/8': 2, '1/16': 1, '1/8-dot': 3,
  'rest-1/4': 4, 'rest-1/8': 2, 'rest-1/16': 1, 'rest-1/8-dot': 3,
  'triplet-1/8': 4 / 3,
}

describe('PATTERNS', () => {
  const difficulties: Difficulty[] = ['basic', 'intermediate', 'advanced']

  it('each difficulty has at least one pattern', () => {
    for (const d of difficulties) {
      expect(PATTERNS[d].length).toBeGreaterThan(0)
    }
  })

  it('every pattern sums to exactly 4 sixteenth-note units (one beat)', () => {
    for (const d of difficulties) {
      for (const pattern of PATTERNS[d]) {
        const total = pattern.reduce((sum, note) => sum + DURATION[note], 0)
        expect(total).toBeCloseTo(4, 5)
      }
    }
  })

  it('advanced includes all intermediate patterns', () => {
    const intStrings = new Set(PATTERNS.intermediate.map(p => JSON.stringify(p)))
    for (const p of PATTERNS.intermediate) {
      expect(intStrings.has(JSON.stringify(p))).toBe(true)
    }
    for (const p of PATTERNS.intermediate) {
      expect(
        PATTERNS.advanced.some(ap => JSON.stringify(ap) === JSON.stringify(p))
      ).toBe(true)
    }
  })
})
