// src/lib/noteGeometry.ts
import type { Beat, NoteValue } from './types'

export type NotePos = { note: NoteValue; cx: number; stemX: number }

export type RenderItem =
  | { kind: 'notehead'; cx: number; dotted: boolean }
  | { kind: 'stem'; cx: number }
  | { kind: 'flag'; cx: number; count: 1 | 2 }
  | { kind: 'beam'; x1: number; x2: number; beamIndex: 0 | 1 }
  | { kind: 'rest-quarter'; cx: number }
  | { kind: 'rest-eighth'; cx: number; dotted: boolean }
  | { kind: 'rest-sixteenth'; cx: number }
  | { kind: 'triplet-bracket'; x1: number; x2: number }

export const NOTE_DURATION: Record<NoteValue, number> = {
  '1/4': 4,
  '1/8': 2,
  '1/16': 1,
  '1/8-dot': 3,
  'rest-1/4': 4,
  'rest-1/8': 2,
  'rest-1/16': 1,
  'rest-1/8-dot': 3,
  'triplet-1/8': 4 / 3,
}

const SVG_W = 80
const BEAT_UNITS = 4

export function computePositions(beat: Beat): NotePos[] {
  let x = 0
  return beat.map(note => {
    const w = (NOTE_DURATION[note] * SVG_W) / BEAT_UNITS
    const cx = x + w / 2
    const stemX = cx + 5
    x += w
    return { note, cx, stemX }
  })
}

function isRest(note: NoteValue): boolean {
  return note.startsWith('rest-')
}

type NoteGroup =
  | { isRest: true; pos: NotePos }
  | { isRest: false; notes: NotePos[] }

function groupNotes(positions: NotePos[]): NoteGroup[] {
  const groups: NoteGroup[] = []
  let current: NotePos[] = []

  const flush = () => {
    if (current.length > 0) {
      groups.push({ isRest: false, notes: [...current] })
      current = []
    }
  }

  for (const pos of positions) {
    if (isRest(pos.note)) {
      flush()
      groups.push({ isRest: true, pos })
    } else if (pos.note === '1/4') {
      flush()
      groups.push({ isRest: false, notes: [pos] })
    } else {
      current.push(pos)
    }
  }
  flush()
  return groups
}

function renderRest(items: RenderItem[], pos: NotePos): void {
  const { note, cx } = pos
  if (note === 'rest-1/4') items.push({ kind: 'rest-quarter', cx })
  else if (note === 'rest-1/8') items.push({ kind: 'rest-eighth', cx, dotted: false })
  else if (note === 'rest-1/8-dot') items.push({ kind: 'rest-eighth', cx, dotted: true })
  else if (note === 'rest-1/16') items.push({ kind: 'rest-sixteenth', cx })
}

function renderPitchedGroup(items: RenderItem[], notes: NotePos[]): void {
  const beamed = notes.length >= 2
  const isTriplet = notes[0].note === 'triplet-1/8'

  for (const pos of notes) {
    items.push({ kind: 'notehead', cx: pos.cx, dotted: pos.note === '1/8-dot' })
    items.push({ kind: 'stem', cx: pos.cx })
  }

  if (beamed) {
    const x1 = notes[0].stemX
    const x2 = notes[notes.length - 1].stemX
    items.push({ kind: 'beam', x1, x2, beamIndex: 0 })

    const sixteenths = notes.filter(n => n.note === '1/16')
    if (sixteenths.length > 0) {
      let bx1: number, bx2: number
      if (sixteenths.length === 1) {
        const idx = notes.indexOf(sixteenths[0])
        const isLast = idx === notes.length - 1
        bx1 = isLast ? sixteenths[0].stemX - 10 : sixteenths[0].stemX
        bx2 = isLast ? sixteenths[0].stemX : sixteenths[0].stemX + 10
      } else {
        bx1 = sixteenths[0].stemX
        bx2 = sixteenths[sixteenths.length - 1].stemX
      }
      items.push({ kind: 'beam', x1: bx1, x2: bx2, beamIndex: 1 })
    }

    if (isTriplet) {
      items.push({ kind: 'triplet-bracket', x1: x1 - 5, x2: x2 + 5 })
    }
  } else {
    const { note, cx } = notes[0]
    if (note === '1/8' || note === '1/8-dot') {
      items.push({ kind: 'flag', cx, count: 1 })
    } else if (note === '1/16') {
      items.push({ kind: 'flag', cx, count: 2 })
    }
    // '1/4': no flag
  }
}

export function computeRenderItems(beat: Beat): RenderItem[] {
  const positions = computePositions(beat)
  const groups = groupNotes(positions)
  const items: RenderItem[] = []

  for (const group of groups) {
    if (group.isRest) renderRest(items, group.pos)
    else renderPitchedGroup(items, group.notes)
  }

  return items
}
