export class Rational {
  readonly n: bigint;
  readonly d: bigint;

  constructor(n: bigint | number, d: bigint | number = 1) {
    if (BigInt(d) === 0n) throw new Error("Division by zero");
    let a = BigInt(n);
    let b = BigInt(d);
    if (b < 0n) { a = -a; b = -b; }
    const g = gcd(abs(a), b);
    this.n = a / g;
    this.d = b / g;
  }

  static zero() { return new Rational(0n); }
  static one() { return new Rational(1n); }
  static fromNumber(x: number) {
    if (!Number.isInteger(x)) throw new Error("Only integer conversion is supported");
    return new Rational(x);
  }

  add(x: Rational) { return new Rational(this.n * x.d + x.n * this.d, this.d * x.d); }
  sub(x: Rational) { return new Rational(this.n * x.d - x.n * this.d, this.d * x.d); }
  mul(x: Rational) { return new Rational(this.n * x.n, this.d * x.d); }
  div(x: Rational) { return new Rational(this.n * x.d, this.d * x.n); }
  neg() { return new Rational(-this.n, this.d); }
  isZero() { return this.n === 0n; }
  isPositive() { return this.n > 0n; }
  isNegative() { return this.n < 0n; }
  equals(x: Rational) { return this.n === x.n && this.d === x.d; }
  toNumber() { return Number(this.n) / Number(this.d); }
  toString() { return this.d === 1n ? this.n.toString() : `${this.n}/${this.d}`; }
}

export function abs(x: bigint) { return x < 0n ? -x : x; }

export function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) [a, b] = [b, a % b];
  return abs(a);
}

export function lcm(a: bigint, b: bigint): bigint {
  if (a === 0n || b === 0n) return 0n;
  return abs((a / gcd(a, b)) * b);
}

export function primitiveIntegerVector(values: Rational[]): number[] {
  let common = 1n;
  for (const v of values) common = lcm(common, v.d);
  const ints = values.map(v => v.n * (common / v.d));
  let g = 0n;
  for (const v of ints) g = gcd(g, abs(v));
  if (g === 0n) throw new Error("Zero vector");
  return ints.map(v => Number(v / g));
}
