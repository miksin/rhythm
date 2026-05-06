// src/lib/noteGeometry.test.ts
import { describe, it, expect } from 'vitest'
import { computePositions, computeRenderItems } from './noteGeometry'

describe('computePositions', () => {
  it('single quarter note is centered at cx=40', () => {
    const [pos] = computePositions(['1/4'])
    expect(pos.cx).toBeCloseTo(40)
  })

  it('two eighth notes are at cx=20 and cx=60', () => {
    const [a, b] = computePositions(['1/8', '1/8'])
    expect(a.cx).toBeCloseTo(20)
    expect(b.cx).toBeCloseTo(60)
  })

  it('four sixteenth notes are at cx=10,30,50,70', () => {
    const pos = computePositions(['1/16', '1/16', '1/16', '1/16'])
    expect(pos[0].cx).toBeCloseTo(10)
    expect(pos[1].cx).toBeCloseTo(30)
    expect(pos[2].cx).toBeCloseTo(50)
    expect(pos[3].cx).toBeCloseTo(70)
  })

  it('dotted eighth + sixteenth: cx=30 and cx=70', () => {
    const [a, b] = computePositions(['1/8-dot', '1/16'])
    expect(a.cx).toBeCloseTo(30)
    expect(b.cx).toBeCloseTo(70)
  })
})

describe('computeRenderItems', () => {
  it('quarter note produces notehead and stem, no flag', () => {
    const items = computeRenderItems(['1/4'])
    expect(items.some(i => i.kind === 'notehead')).toBe(true)
    expect(items.some(i => i.kind === 'stem')).toBe(true)
    expect(items.some(i => i.kind === 'flag')).toBe(false)
  })

  it('single eighth note produces single flag', () => {
    const items = computeRenderItems(['rest-1/8', '1/8'])
    const flags = items.filter(i => i.kind === 'flag')
    expect(flags).toHaveLength(1)
    expect((flags[0] as { kind: 'flag'; cx: number; count: 1 | 2 }).count).toBe(1)
  })

  it('single sixteenth note produces double flag', () => {
    const items = computeRenderItems(['rest-1/16', '1/16', 'rest-1/16', 'rest-1/16'])
    const flags = items.filter(i => i.kind === 'flag')
    expect(flags).toHaveLength(1)
    expect((flags[0] as { kind: 'flag'; cx: number; count: 1 | 2 }).count).toBe(2)
  })

  it('two eighth notes produce one beam and no flags', () => {
    const items = computeRenderItems(['1/8', '1/8'])
    expect(items.some(i => i.kind === 'beam')).toBe(true)
    expect(items.every(i => i.kind !== 'flag')).toBe(true)
  })

  it('four sixteenth notes produce two beams', () => {
    const items = computeRenderItems(['1/16', '1/16', '1/16', '1/16'])
    const beams = items.filter(i => i.kind === 'beam')
    expect(beams).toHaveLength(2)
  })

  it('rest breaks beam: [rest-1/8, 1/8] has no beam', () => {
    const items = computeRenderItems(['rest-1/8', '1/8'])
    expect(items.every(i => i.kind !== 'beam')).toBe(true)
  })

  it('rest-1/16 produces a rest-sixteenth item', () => {
    const items = computeRenderItems(['1/8', 'rest-1/16', '1/16'])
    expect(items.some(i => i.kind === 'rest-sixteenth')).toBe(true)
  })

  it('triplet produces triplet-bracket and one beam', () => {
    const items = computeRenderItems(['triplet-1/8', 'triplet-1/8', 'triplet-1/8'])
    expect(items.some(i => i.kind === 'triplet-bracket')).toBe(true)
    expect(items.some(i => i.kind === 'beam')).toBe(true)
  })

  it('[1/16, 1/8, 1/16] produces two separate secondary beams (stubs), not one spanning beam', () => {
    const items = computeRenderItems(['1/16', '1/8', '1/16'])
    const beams = items.filter(i => i.kind === 'beam') as { kind: 'beam'; x1: number; x2: number; beamIndex: 0 | 1 }[]
    const secondaryBeams = beams.filter(b => b.beamIndex === 1)
    // Should produce 2 secondary beam stubs, not 1 spanning beam
    expect(secondaryBeams).toHaveLength(2)
    // They should not overlap: first stub ends before second begins
    expect(secondaryBeams[0].x2).toBeLessThan(secondaryBeams[1].x1)
  })
})
