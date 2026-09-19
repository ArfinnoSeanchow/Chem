export interface ParsedFormula {
  formula: string;
  charge: number;
  elements: Record<string, number>;
}

function normalizeFormula(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, "")
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, c => String("₀₁₂₃₄₅₆₇₈₉".indexOf(c)))
    .replace(/−/g, "-");
}

export function parseSpeciesToken(token: string): ParsedFormula {
  let s = normalizeFormula(token);
  let charge = 0;

  // e-, e^-, e−
  if (/^e(?:\^)?-$/i.test(s)) return { formula: "e", charge: -1, elements: {} };

  // Explicit ^2-, ^3+, ^-
  const caret = s.match(/\^(\d*)([+-])$/);
  if (caret) {
    charge = (caret[1] ? Number(caret[1]) : 1) * (caret[2] === "+" ? 1 : -1);
    s = s.slice(0, caret.index);
  } else {
    // Terminal charge without caret. Distinguish Fe2+ (charge +2) from
    // MnO4- (oxygen subscript 4, charge -1). For polyatomic formulas the
    // trailing digit belongs to the formula; for a single-element ion it
    // is conventionally the charge magnitude.
    const m = s.match(/(\d*)([+-])$/);
    if (m) {
      const magnitudeText = m[1];
      const before = s.slice(0, m.index);
      const hasMultipleElements = /[A-Z][a-z]?[^A-Za-z]*[A-Z][a-z]?/.test(before);
      const magnitude = magnitudeText && !hasMultipleElements ? Number(magnitudeText) : 1;
      charge = magnitude * (m[2] === "+" ? 1 : -1);
      s = before + (magnitudeText && hasMultipleElements ? magnitudeText : "");
    }
  }

  if (!s) throw new Error(`Invalid species: ${token}`);
  const elements = parseFormulaElements(s);
  return { formula: s, charge, elements };
}

export function parseFormulaElements(formula: string): Record<string, number> {
  const s = normalizeFormula(formula);
  let i = 0;

  function readNumber(): number {
    const start = i;
    while (i < s.length && /[0-9]/.test(s[i])) i++;
    return start === i ? 1 : Number(s.slice(start, i));
  }

  function group(stop?: string): Record<string, number> {
    const out: Record<string, number> = {};
    while (i < s.length) {
      if (stop && s[i] === stop) { i++; break; }
      if (s[i] === "(" || s[i] === "[" || s[i] === "{") {
        const open = s[i++];
        const close = open === "(" ? ")" : open === "[" ? "]" : "}";
        const inner = group(close);
        const mult = readNumber();
        for (const [el, n] of Object.entries(inner)) out[el] = (out[el] || 0) + n * mult;
        continue;
      }
      if (!/[A-Z]/.test(s[i])) throw new Error(`Invalid formula near "${s.slice(i)}" in ${formula}`);
      const start = i++;
      if (i < s.length && /[a-z]/.test(s[i])) i++;
      const el = s.slice(start, i);
      const mult = readNumber();
      out[el] = (out[el] || 0) + mult;
    }
    if (stop && s[i - 1] !== stop) throw new Error(`Unclosed group in ${formula}`);
    return out;
  }

  return group();
}

export function formatFormula(formula: string, charge = 0): string {
  if (formula === "e") return "e⁻";
  const sub = (s: string) => s.replace(/(\d+)/g, d => d.split("").map(x => "₀₁₂₃₄₅₆₇₈₉"[Number(x)]).join(""));
  const f = sub(formula);
  if (charge === 0) return f;
  const absCharge = Math.abs(charge);
  const sign = charge > 0 ? "+" : "−";
  return `${f}${absCharge === 1 ? sign : `${absCharge}${sign}`}`;
}

export function splitEquation(raw: string): { left: string[]; right: string[] } {
  const cleaned = raw.trim().replace(/⇌|⟷|⟶|⟹|→/g, "->");
  const parts = cleaned.split("->");
  if (parts.length !== 2) throw new Error("Equation must contain exactly one reaction arrow.");
  const splitSide = (side: string) => {
    const items: string[] = [];
    let depth = 0;
    let current = "";
    const chars = [...side];
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      if ("([{".includes(ch)) depth++;
      if (")]}".includes(ch)) depth--;

      if (ch === "+" && depth === 0) {
        // A plus sign is a separator only when another species follows it.
        // Thus H+ -> ... is not split, while H+ + MnO4- is split at the
        // second plus sign.
        let j = i + 1;
        while (j < chars.length && /\s/.test(chars[j])) j++;
        const next = chars[j] || "";
        if (next && /[A-Za-z0-9([{]/.test(next)) {
          if (current.trim()) items.push(current.trim());
          current = "";
          continue;
        }
      }
      current += ch;
    }
    if (current.trim()) items.push(current.trim());
    return items;
  };
  return { left: splitSide(parts[0]), right: splitSide(parts[1]) };
}

export function parseCoefficientToken(token: string): { coefficient: number; species: string } {
  const m = token.trim().match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
  if (!m) return { coefficient: 1, species: token.trim() };
  const coefficient = Number(m[1]);
  if (!Number.isInteger(coefficient) || coefficient <= 0) throw new Error(`Invalid coefficient: ${m[1]}`);
  return { coefficient, species: m[2].trim() };
}
