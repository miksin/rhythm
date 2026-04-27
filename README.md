# Rhythm Practice App

A web app that generates interactive rhythm exercise sheets with playback — practice reading crotchets, quavers, and semiquavers with a BPM-controlled metronome.

## Features

- Auto-generated rhythm exercise sheets
- Rhythmic syllable display beneath each note
- BPM-controlled playback with beat-following highlight
- Print / Export PNG support
- Dark mode via Tailwind CSS v4

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Vite + React + TypeScript |
| Music notation | VexFlow 5 |
| Timing / playback | Tone.js (Web Audio API) |
| Styling | Tailwind CSS v4 |
| Testing | Vitest + Testing Library |

## Local Development

### Prerequisites

- Node.js 20+

### Install

```bash
npm install
```

### Start dev server

```bash
npm run dev
```

Open `http://localhost:5173`.

### Run tests

```bash
npm test
```

### Build

```bash
npm run build
```

## Deployment

Static site — deploy the `dist/` output to any static host (Cloudflare Pages, Netlify, etc.):

```bash
npm run build
# then deploy dist/
```

## License

Private project — All rights reserved.
