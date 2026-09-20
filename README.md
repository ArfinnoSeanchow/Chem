# Chemly Redox Lab v3

A clean rebuild of Chemly focused on a stable, dependency-light redox solver UI.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## What changed

- Removed unused animation/UI/3D dependency chain that caused deployment failures.
- Kept the existing redox calculation engine from `src/utils` and its chemistry types.
- Rebuilt the interface as a single React application with responsive CSS.
- No Tailwind, Motion, Three.js, GSAP, KaTeX, Lucide, OGL or optional native packages required.
- TypeScript is strict and `jsx` uses the React 19 JSX runtime.
- Build script performs `tsc --noEmit` before Vite bundling.
- Added analysis, generated method steps, mass/charge/electron verification, examples, copy action and mobile layout.
