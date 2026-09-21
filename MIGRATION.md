# Migration from the old engine

The old implementation mixed:
1. parsing,
2. oxidation-state inference,
3. auxiliary-species guessing,
4. matrix balancing,
5. pedagogical step generation.

This package separates those responsibilities.

Recommended integration:

```ts
import { solveRedoxEquation } from "./redox";

const result = solveRedoxEquation(
  "Fe2+ + MnO4- + H+ -> Fe3+ + Mn2+ + H2O",
  "acidic"
);

if (!result.isValid) {
  console.error(result.errors);
} else {
  console.log(result.balancedEquation);
  console.log(result.halfReactions);
  console.log(result.pbo);
  console.log(result.verification);
}
```

Do not map `verification.overall` to `true` manually. It is intentionally derived from independent checks.
