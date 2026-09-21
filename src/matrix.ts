import { Rational, primitiveIntegerVector } from "./rational.js";

export interface MatrixSpecies {
  formula: string;
  charge: number;
  elements: Record<string, number>;
}

export function balanceByMatrix(
  reactants: MatrixSpecies[],
  products: MatrixSpecies[]
): { reactantCoefficients: number[]; productCoefficients: number[] } | null {
  const all = [
    ...reactants.map(x => ({ ...x, side: 1 })),
    ...products.map(x => ({ ...x, side: -1 }))
  ];
  const elements = [...new Set(all.flatMap(x => Object.keys(x.elements)))];
  const includeCharge = all.some(x => x.charge !== 0);
  const rows = elements.length + (includeCharge ? 1 : 0);
  const cols = all.length;

  const A: Rational[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Rational.zero())
  );

  elements.forEach((el, r) => {
    all.forEach((sp, c) => {
      A[r][c] = new Rational((sp.elements[el] || 0) * sp.side);
    });
  });
  if (includeCharge) {
    const r = elements.length;
    all.forEach((sp, c) => A[r][c] = new Rational(sp.charge * sp.side));
  }

  const basis = nullSpace(A);
  if (basis.length === 0) return null;

  // For ordinary reaction balancing, choose the first positive vector in the
  // null-space basis and small positive combinations. This is intentionally
  // separated from half-reaction chemistry, which does not rely on this search.
  const candidates: Rational[][] = [];
  for (const v of basis) candidates.push(v);
  if (basis.length > 1) {
    for (let i = 0; i < basis.length; i++) {
      for (let j = i + 1; j < basis.length; j++) {
        candidates.push(basis[i].map((x, k) => x.add(basis[j][k])));
        candidates.push(basis[i].map((x, k) => x.sub(basis[j][k])));
      }
    }
  }

  for (const v of candidates) {
    const signs = v.filter(x => !x.isZero()).map(x => x.isPositive() ? 1 : -1);
    if (signs.length && signs.every(s => s === 1)) {
      const ints = primitiveIntegerVector(v);
      return { reactantCoefficients: ints.slice(0, reactants.length), productCoefficients: ints.slice(reactants.length) };
    }
    if (signs.length && signs.every(s => s === -1)) {
      const ints = primitiveIntegerVector(v.map(x => x.neg()));
      return { reactantCoefficients: ints.slice(0, reactants.length), productCoefficients: ints.slice(reactants.length) };
    }
  }
  return null;
}

function nullSpace(A: Rational[][]): Rational[][] {
  if (A.length === 0) return [];
  const M = A.map(row => row.map(x => new Rational(x.n, x.d)));
  const rows = M.length, cols = M[0].length;
  let pivotRow = 0;
  const pivots: number[] = [];

  for (let col = 0; col < cols && pivotRow < rows; col++) {
    let p = pivotRow;
    while (p < rows && M[p][col].isZero()) p++;
    if (p === rows) continue;
    [M[pivotRow], M[p]] = [M[p], M[pivotRow]];
    const pivot = M[pivotRow][col];
    for (let c = 0; c < cols; c++) M[pivotRow][c] = M[pivotRow][c].div(pivot);
    for (let r = 0; r < rows; r++) {
      if (r === pivotRow || M[r][col].isZero()) continue;
      const factor = M[r][col];
      for (let c = 0; c < cols; c++) M[r][c] = M[r][c].sub(factor.mul(M[pivotRow][c]));
    }
    pivots.push(col);
    pivotRow++;
  }

  const free = Array.from({ length: cols }, (_, i) => i).filter(i => !pivots.includes(i));
  const basis: Rational[][] = [];

  for (const f of free) {
    const x = Array.from({ length: cols }, () => Rational.zero());
    x[f] = Rational.one();
    for (let r = pivots.length - 1; r >= 0; r--) {
      const pc = pivots[r];
      let sum = Rational.zero();
      for (let c = pc + 1; c < cols; c++) sum = sum.add(M[r][c].mul(x[c]));
      x[pc] = sum.neg();
    }
    basis.push(x);
  }
  return basis;
}
