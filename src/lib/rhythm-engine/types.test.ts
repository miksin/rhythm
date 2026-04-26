import { describe, it, expect } from 'vitest'
import type { NoteValue, Note, Measure, Exercise } from './types'

describe('rhythm-engine types', () => {
  it('creates a valid Note', () => {
    const note: Note = {
      value: 'quarter' as NoteValue,
      syllable: 'Ta',
      durationTicks: 480,
    }
    expect(note.value).toBe('quarter')
    expect(note.syllable).toBe('Ta')
    expect(note.durationTicks).toBe(480)
  })

  it('creates a valid Measure', () => {
    const measure: Measure = {
      notes: [
        { value: 'quarter', syllable: 'Ta', durationTicks: 480 },
        { value: 'quarter', syllable: 'Ta', durationTicks: 480 },
        { value: 'quarter', syllable: 'Ta', durationTicks: 480 },
        { value: 'quarter', syllable: 'Ta', durationTicks: 480 },
      ],
      totalTicks: 1920,
    }
    expect(measure.totalTicks).toBe(1920)
    expect(measure.notes).toHaveLength(4)
  })

  it('creates a valid Exercise', () => {
    const exercise: Exercise = {
      title: 'Exercise 1',
      subtitle: 'Crotchets only',
      timeSignature: [4, 4],
      measures: [],
      totalMeasures: 0,
    }
    expect(exercise.timeSignature).toEqual([4, 4])
  })
})
