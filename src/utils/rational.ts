/**
 * Exact Rational number arithmetic to avoid floating-point inaccuracies
 * in chemical equation stoichiometric matrix elimination.
 */

export class Rational {
  numerator: bigint;
  denominator: bigint;

  constructor(num: bigint | number, den: bigint | number = 1n) {
    let n = BigInt(num);
    let d = BigInt(den);

    if (d === 0n) {
      throw new Error("Denominator cannot be zero");
    }

    if (d < 0n) {
      n = -n;
      d = -d;
    }

    const common = Rational.gcd(Rational.abs(n), d);
    this.numerator = n / common;
    this.denominator = d / common;
  }

  static zero(): Rational {
    return new Rational(0n, 1n);
  }

  static one(): Rational {
    return new Rational(1n, 1n);
  }

  static fromNumber(val: number): Rational {
    if (Number.isInteger(val)) {
      return new Rational(BigInt(val), 1n);
    }
    // simple fraction approx
    const str = val.toString();
    if (str.includes(".")) {
      const decPlaces = str.split(".")[1].length;
      const den = 10n ** BigInt(decPlaces);
      const num = BigInt(Math.round(val * Number(den)));
      return new Rational(num, den);
    }
    return new Rational(BigInt(Math.round(val)), 1n);
  }

  static gcd(a: bigint, b: bigint): bigint {
    while (b !== 0n) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  static lcm(a: bigint, b: bigint): bigint {
    if (a === 0n || b === 0n) return 0n;
    return (Rational.abs(a) * Rational.abs(b)) / Rational.gcd(a, b);
  }

  static abs(a: bigint): bigint {
    return a < 0n ? -a : a;
  }

  add(other: Rational): Rational {
    const num = this.numerator * other.denominator + other.numerator * this.denominator;
    const den = this.denominator * other.denominator;
    return new Rational(num, den);
  }

  sub(other: Rational): Rational {
    const num = this.numerator * other.denominator - other.numerator * this.denominator;
    const den = this.denominator * other.denominator;
    return new Rational(num, den);
  }

  mul(other: Rational): Rational {
    return new Rational(this.numerator * other.numerator, this.denominator * other.denominator);
  }

  div(other: Rational): Rational {
    if (other.numerator === 0n) {
      throw new Error("Division by zero in Rational");
    }
    return new Rational(this.numerator * other.denominator, this.denominator * other.numerator);
  }

  isZero(): boolean {
    return this.numerator === 0n;
  }

  isPositive(): boolean {
    return this.numerator > 0n;
  }

  isNegative(): boolean {
    return this.numerator < 0n;
  }

  toNumber(): number {
    return Number(this.numerator) / Number(this.denominator);
  }

  toString(): string {
    if (this.denominator === 1n) return this.numerator.toString();
    return `${this.numerator}/${this.denominator}`;
  }
}
