# Rhythm

An interactive rhythm reading exercise app built with React + VexFlow + Tone.js, deployed as a static site on Cloudflare Pages.

## Tech Stack

- **Framework:** React 19
- **Language:** TypeScript
- **Notation rendering:** VexFlow 5
- **Audio:** Tone.js
- **Styling:** Tailwind CSS 4
- **Build tool:** Vite 6
- **Testing:** Vitest + Testing Library
- **Deployment:** Cloudflare Pages

## Local Development

### Prerequisites

- Node.js >= 18
- npm

### Setup

```bash
npm install
```

### Run dev server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

### Run tests

```bash
npm test
```

Interactive test UI:

```bash
npm run test:ui
```

### Type check

```bash
npx tsc --noEmit
```

## Build

```bash
npm run build
```

Output is written to the `dist/` directory.

Preview the production build locally:

```bash
npm run preview
```

## Deployment (Cloudflare Pages)

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | 18 |

## Project Structure

```
src/
├── components/         # React components (ExerciseSheet, etc.)
├── lib/
│   ├── notation/       # VexFlow renderer
│   └── rhythm-engine/  # Exercise generation logic & types
└── test-setup.ts
```
