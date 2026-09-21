# Accurate Redox Solver v2

A clean TypeScript redox engine designed around deterministic chemistry rules rather than guessing from a null-space solution.

## What changed

- Exact rational arithmetic for matrix operations.
- Deterministic half-reaction balancing.
- Acidic medium handled directly.
- Basic medium handled by the standard acidic-to-basic conversion.
- Electron accounting is never hard-coded as balanced.
- Atom and charge verification are independent.
- PBO/change-in-oxidation-number analysis supports multiple redox changes.
- Disproportionation and comproportionation are detected from oxidation-state transitions.
- Full-reaction balancing uses exact stoichiometric null-space solving only after chemistry-aware auxiliary handling.
- Intermediate half-reaction states are generated from the actual transformations.
- Verification returns explicit failures instead of silently converting invalid results into "balanced".

## Supported notation

Examples:

- `Fe2+`
- `MnO4-`
- `Cr2O7^2-`
- `SO4^2-`
- `H+`
- `OH-`
- `H2O`
- `e-`
- parentheses such as `Fe2(SO4)3`

Equation separator:

`->`, `→`, `=`

Species separator:

`+`

Medium:

`acidic | basic | neutral`

## Build

```bash
npm install
npm run build
npm test
```

The public API is exported from `src/index.ts`.

## Important scope

This engine targets conventional aqueous inorganic redox chemistry. It intentionally does not pretend that arbitrary organic/coordination chemistry can always be resolved from formula text alone. Ambiguous oxidation-state assignments are reported rather than silently guessed.
