/**
 * Chemistry Formula and Equation Parser
 */

import { deLatexChemistry } from "./formulaAutoCorrector";

export const PERIODIC_TABLE_SYMBOLS = new Set([
  "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne",
  "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca",
  "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn",
  "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr",
  "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn",
  "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd",
  "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb",
  "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg",
  "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th",
  "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm",
  "Md", "No", "Lr"
]);

export interface ExtractedSpecies {
  raw: string;
  cleanFormula: string;
  charge: number;
  initialCoefficient: number;
  elements: Record<string, number>;
}

// Ordered list of 2-letter symbols followed by 1-letter symbols for greedy matching
const ORDERED_SYMBOLS: string[] = [
  // 2-letter elements (must be matched first before 1-letter)
  "He", "Li", "Be", "Ne", "Na", "Mg", "Al", "Si", "Cl", "Ar", "Ca", "Sc", "Ti",
  "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr",
  "Rb", "Sr", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn",
  "Sb", "Te", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd",
  "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "Re", "Os", "Ir", "Pt",
  "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th", "Pa",
  "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr",
  // 1-letter elements
  "H", "B", "C", "N", "O", "F", "P", "S", "K", "V", "Y", "I", "W", "U"
];

const TWO_LETTER_LOWER = new Map<string, string>();
const ONE_LETTER_LOWER = new Map<string, string>();
for (const sym of ORDERED_SYMBOLS) {
  if (sym.length === 2) {
    TWO_LETTER_LOWER.set(sym.toLowerCase(), sym);
  } else {
    ONE_LETTER_LOWER.set(sym.toLowerCase(), sym);
  }
}

/**
 * Normalizes unicode superscripts, subscripts, and symbols
 */
export function normalizeUnicodeChemistry(str: string): string {
  if (!str) return "";
  let res = str;

  // Unicode superscripts
  const supMap: Record<string, string> = {
    "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
    "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
    "⁺": "+", "⁻": "-",
  };
  res = res.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+)/g, (_, match) => {
    const converted = match.split("").map((ch: string) => supMap[ch] || ch).join("");
    return `^{${converted}}`;
  });

  // Unicode subscripts
  const subMap: Record<string, string> = {
    "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
    "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
  };
  res = res.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (ch) => subMap[ch] || ch);

  // Unicode reaction arrows
  res = res.replace(/[→⟶➔⇒⇌=]/g, " -> ");

  return res;
}

/**
 * Intelligently capitalizes a single chemical formula token (e.g. "kmno4" -> "KMnO4", "c2o4" -> "C2O4")
 */
export function autoCapitalizeChemicalFormula(rawFormula: string): string {
  let s = rawFormula.trim();
  if (!s) return "";

  // Preserve explicit chemical capitalization. This is critical for `CO2`:
  // a case-insensitive greedy matcher would incorrectly turn it into `Co2`.
  const hasExplicitUppercase = /[A-Z]/.test(s);

  // A few ubiquitous molecular/ion formulas are genuinely ambiguous when
  // written entirely in lowercase (`co2` could be tokenized as Co2). Prefer
  // the conventional chemistry notation for these common formulas.
  const lower = s.toLowerCase();
  const commonLowercase = new Map<string, string>([
    ["co", "CO"], ["co2", "CO2"], ["co3", "CO3"],
    ["no", "NO"], ["no2", "NO2"], ["no3", "NO3"],
    ["po", "PO"], ["po3", "PO3"], ["po4", "PO4"],
  ]);
  if (!hasExplicitUppercase && commonLowercase.has(lower)) {
    return commonLowercase.get(lower)!;
  }

  let result = "";
  let i = 0;

  while (i < s.length) {
    const ch = s[i];

    if (/[\d()[\]{}*.\-+^]/.test(ch)) {
      result += ch;
      i++;
      continue;
    }

    if (/[A-Za-z]/.test(ch)) {
      const next = s[i + 1] || "";

      // Explicitly written symbols: `Cr`, `Mn`, `Co`, etc.
      if (hasExplicitUppercase && /[A-Z]/.test(ch)) {
        if (/[a-z]/.test(next)) {
          const two = ch + next;
          if (TWO_LETTER_LOWER.has(two.toLowerCase())) {
            result += TWO_LETTER_LOWER.get(two.toLowerCase())!;
            i += 2;
            continue;
          }
        }
        const one = ch.toUpperCase();
        if (ONE_LETTER_LOWER.has(one.toLowerCase())) {
          result += one;
          i++;
          continue;
        }
      }

      // Lowercase/mixed input: infer conventional element capitalization.
      if (i + 1 < s.length && /[a-zA-Z]/.test(next)) {
        const two = (ch + next).toLowerCase();
        if (TWO_LETTER_LOWER.has(two)) {
          result += TWO_LETTER_LOWER.get(two)!;
          i += 2;
          continue;
        }
      }

      const one = ch.toLowerCase();
      if (ONE_LETTER_LOWER.has(one)) {
        result += ONE_LETTER_LOWER.get(one)!;
        i++;
        continue;
      }
    }

    result += ch;
    i++;
  }

  return result;
}

/**
 * Split one reaction side into species while preserving positive-ion charges.
 * `Cr3+ + Fe3+` -> [`Cr3+`, `Fe3+`].
 */
function splitSpeciesList(sideStr: string): string[] {
  const s = sideStr.trim();
  if (!s) return [];

  const results: string[] = [];
  let current = "";
  let groupDepth = 0;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    // A plus inside charge braces/parentheses is part of the charge, not
    // the species separator: `Fe^{2+}`, `Fe(2+)`.
    if (ch === "{" || ch === "(") {
      groupDepth++;
      current += ch;
      continue;
    }
    if (ch === "}" || ch === ")") {
      groupDepth = Math.max(0, groupDepth - 1);
      current += ch;
      continue;
    }
    if (ch !== "+" || groupDepth > 0) {
      current += ch;
      continue;
    }

    const trimmed = current.trim();
    let j = i + 1;
    while (j < s.length && /\s/.test(s[j])) j++;
    const next = j < s.length ? s[j] : "";

    // In `Fe3+ + Cr3+`, the first + is charge and the second + is the
    // separator. Consume the pair as one operation.
    if (/^\s*\+/.test(s.slice(i + 1))) {
      current += "+";
      if (current.trim()) results.push(current.trim());
      current = "";
      i = j;
      continue;
    }

    // Terminal + is an ionic charge: H+, Fe3+, NH4+.
    if (trimmed && next === "") {
      current += "+";
      continue;
    }

    // Otherwise + separates species.
    if (trimmed) results.push(trimmed);
    current = "";
  }

  if (current.trim()) results.push(current.trim());
  return results;
}

/**
 * Sanitizes and normalizes an entire equation string
 * - Normalizes unicode (subscripts, superscripts, arrows)
 * - Converts spaced charges: e.g. "C2O4 2-" -> "C2O4^2-" or "Fe 3+" -> "Fe^3+"
 * - Auto-capitalizes elements: e.g. "kmno4 + h2c2o4 -> mn2+ + co2" -> "KMnO4 + H2C2O4 -> Mn2+ + CO2"
 * - Cleans multiple spaces
 */
export function sanitizeEquationInput(rawInput: string): string {
  if (!rawInput) return "";
  const deLatexed = deLatexChemistry(rawInput);
  let cleaned = normalizeUnicodeChemistry(deLatexed.trim());

  // Ensure standard arrow
  cleaned = cleaned.replace(/\s*(?:\\longrightarrow|\\rightarrow|\\to|->|-->|→|⟶|=>|⇌|=)\s*/g, " -> ");

  // If there's an arrow, split and sanitize both sides
  if (cleaned.includes(" -> ")) {
    const [left, right] = cleaned.split(" -> ");
    const cleanSide = (side: string) => {
      return splitSpeciesList(side)
        .map((term) => {
          let t = term.trim();
          // Fix spaced charge at end: e.g. "c2o4 2-" -> "c2o4^2-", "fe 3+" -> "fe^3+"
          t = t.replace(/\s+([0-9]*[+-]|[+-][0-9]*)$/, "^$1");
          // Fix parenthesis charge: e.g. "c2o4(2-)" -> "c2o4^2-"
          t = t.replace(/\(([0-9]*[+-]|[+-][0-9]*)\)$/, "^$1");
          return autoCapitalizeChemicalFormula(t);
        })
        .filter(Boolean)
        .join(" + ");
    };

    return `${cleanSide(left)} -> ${cleanSide(right)}`;
  }

  // If no arrow yet, clean as single expression
  return splitSpeciesList(cleaned)
    .map((term) => {
      let t = term.trim();
      t = t.replace(/\s+([0-9]*[+-]|[+-][0-9]*)$/, "^$1");
      return autoCapitalizeChemicalFormula(t);
    })
    .filter(Boolean)
    .join(" + ");
}

/**
 * Parses charge from species string.
 * Examples:
 * - "MnO4^-" -> formula "MnO4", charge -1
 * - "Cr2O7^{2-}" -> formula "Cr2O7", charge -2
 * - "Cr2O7^2-" -> formula "Cr2O7", charge -2
 * - "Cr2O7(2-)" -> formula "Cr2O7", charge -2
 * - "Fe^3+" -> formula "Fe", charge +3
 * - "Fe3+" -> formula "Fe", charge +3
 * - "Cl-" -> formula "Cl", charge -1
 * - "Na+" -> formula "Na", charge +1
 * - "H+" -> formula "H", charge +1
 * - "OH-" -> formula "OH", charge -1
 * - "KMnO4" -> formula "KMnO4", charge 0
 */
export function extractFormulaAndCharge(input: string): { formula: string; charge: number; coefficient: number } {
  let str = autoCapitalizeChemicalFormula(normalizeUnicodeChemistry(input.trim()));
  let coefficient = 1;

  // Extract leading coefficient if user typed e.g. "2KMnO4" or "2 KMnO4"
  const coefMatch = str.match(/^(\d+)\s*([A-Za-z(].*)$/);
  if (coefMatch) {
    coefficient = parseInt(coefMatch[1], 10);
    str = coefMatch[2].trim();
  }

  // 1. Remove caret notation e.g. ^{2-} or ^2- or ^-
  const caretMatch = str.match(/^(.*?)\^\{?([0-9]*[+-]|[+-][0-9]*)\}?$/);
  if (caretMatch) {
    const base = caretMatch[1];
    const chargeStr = caretMatch[2];
    return {
      formula: base,
      charge: parseChargeNumber(chargeStr),
      coefficient,
    };
  }

  // 2. Check for parenthesis charge at end e.g. Cr2O7(2-) or SO4(2-) or Fe(2+)
  const parenChargeMatch = str.match(/^(.*?)\(([0-9]*[+-]|[+-][0-9]*)\)$/);
  if (parenChargeMatch) {
    return {
      formula: parenChargeMatch[1],
      charge: parseChargeNumber(parenChargeMatch[2]),
      coefficient,
    };
  }

  // 3. Spaced charge at end e.g. 'Cr2O7 2-', 'SO4 2-', 'Fe 2+'
  const spacedCharge = str.match(/^(.*?)\s+([0-9]+[+-]|[+-][0-9]+|[+-])$/);
  if (spacedCharge) {
    return {
      formula: spacedCharge[1],
      charge: parseChargeNumber(spacedCharge[2]),
      coefficient,
    };
  }

  // 4. Monoatomic ion with number charge: e.g. Fe2+, Fe3+, Mn2+, Cr3+, Cu2+, Zn2+, O2-, S2-
  const monoatomicMatch = str.match(/^([A-Z][a-z]?)(\d+)([+-])$/);
  if (monoatomicMatch) {
    const el = monoatomicMatch[1];
    const num = parseInt(monoatomicMatch[2], 10);
    const sign = monoatomicMatch[3] === "+" ? 1 : -1;
    return {
      formula: el,
      charge: num * sign,
      coefficient,
    };
  }

  // 5. Multiple signs like Fe+++, Fe++, O--
  const plusesMinuses = str.match(/^(.*?)([+-]{2,4})$/);
  if (plusesMinuses && plusesMinuses[1].length > 0) {
    const base = plusesMinuses[1];
    const sign = plusesMinuses[2][0];
    const count = plusesMinuses[2].length;
    return {
      formula: base,
      charge: sign === "+" ? count : -count,
      coefficient,
    };
  }

  // 6. Trailing single sign: e.g. MnO4-, Cl-, Na+, H+, OH-, NO3-, ClO3-
  const singleSign = str.match(/^(.*?)([+-])$/);
  if (singleSign) {
    return {
      formula: singleSign[1],
      charge: singleSign[2] === "+" ? 1 : -1,
      coefficient,
    };
  }

  // 7. Known polyatomic ions without caret: e.g. SO42-, C2O42-, Cr2O72-, CO32-, PO43-
  const polyMatch = str.match(/^(.*?)(\d+)([+-])$/);
  if (polyMatch) {
    const num = parseInt(polyMatch[2], 10);
    const sign = polyMatch[3] === "+" ? 1 : -1;
    return {
      formula: polyMatch[1],
      charge: num * sign,
      coefficient,
    };
  }

  // Neutral compound
  return {
    formula: str,
    charge: 0,
    coefficient,
  };
}

function parseChargeNumber(chargeStr: string): number {
  const trimmed = chargeStr.trim();
  if (trimmed === "+" || trimmed === "1+") return 1;
  if (trimmed === "-" || trimmed === "1-") return -1;
  if (trimmed.endsWith("+")) {
    return parseInt(trimmed.slice(0, -1), 10) || 1;
  }
  if (trimmed.endsWith("-")) {
    return -(parseInt(trimmed.slice(0, -1), 10) || 1);
  }
  if (trimmed.startsWith("+")) {
    return parseInt(trimmed.slice(1), 10) || 1;
  }
  if (trimmed.startsWith("-")) {
    return -(parseInt(trimmed.slice(1), 10) || 1);
  }
  const val = parseInt(trimmed, 10);
  return isNaN(val) ? 0 : val;
}

/**
 * Parses compound formula into element atom counts.
 * Handles nested parentheses, brackets: (NH4)2SO4, [Fe(CN)6], Ca(OH)2, H2C2O4, etc.
 * Handles hydrates: CuSO4.5H2O
 */
export function parseFormulaElements(formula: string): Record<string, number> {
  const clean = formula.replace(/\s+/g, "");
  
  // Check for hydrate dot (e.g., CuSO4.5H2O or FeSO4*7H2O)
  if (clean.includes(".") || clean.includes("·") || clean.includes("*")) {
    const parts = clean.split(/[.·*]/);
    const mainCounts = parseFormulaGroup(parts[0]);
    
    // Parse hydrate part
    const hydrateStr = parts[1];
    const hydrateMatch = hydrateStr.match(/^(\d*)(.*)$/);
    const hydrateMultiplier = hydrateMatch && hydrateMatch[1] ? parseInt(hydrateMatch[1], 10) : 1;
    const hydrateFormula = hydrateMatch ? hydrateMatch[2] : hydrateStr;
    const hydrateCounts = parseFormulaGroup(hydrateFormula);

    for (const [el, cnt] of Object.entries(hydrateCounts)) {
      mainCounts[el] = (mainCounts[el] || 0) + cnt * hydrateMultiplier;
    }
    return mainCounts;
  }

  return parseFormulaGroup(clean);
}

function parseFormulaGroup(groupStr: string): Record<string, number> {
  const counts: Record<string, number> = {};
  const stack: Record<string, number>[] = [{}];

  let i = 0;
  const len = groupStr.length;

  while (i < len) {
    const ch = groupStr[i];

    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push({});
      i++;
    } else if (ch === ")" || ch === "]" || ch === "}") {
      i++;
      // Parse multiplier after closing parenthesis
      let numStr = "";
      while (i < len && /\d/.test(groupStr[i])) {
        numStr += groupStr[i];
        i++;
      }
      const multiplier = numStr ? parseInt(numStr, 10) : 1;
      const popped = stack.pop() || {};
      const current = stack[stack.length - 1];

      for (const [el, cnt] of Object.entries(popped)) {
        current[el] = (current[el] || 0) + cnt * multiplier;
      }
    } else if (/[A-Z]/.test(ch)) {
      // Element symbol starts with uppercase letter
      let symbol = ch;
      i++;
      if (i < len && /[a-z]/.test(groupStr[i])) {
        symbol += groupStr[i];
        i++;
      }

      // Check for count
      let numStr = "";
      while (i < len && /\d/.test(groupStr[i])) {
        numStr += groupStr[i];
        i++;
      }
      const count = numStr ? parseInt(numStr, 10) : 1;
      const current = stack[stack.length - 1];
      current[symbol] = (current[symbol] || 0) + count;
    } else {
      // Ignore unrecognized characters or move forward
      i++;
    }
  }

  // Merge remaining stack
  while (stack.length > 1) {
    const popped = stack.pop() || {};
    const current = stack[stack.length - 1];
    for (const [el, cnt] of Object.entries(popped)) {
      current[el] = (current[el] || 0) + cnt;
    }
  }

  return stack[0] || {};
}

/**
 * Splits equation string into reactant and product species tokens.
 * Handles reaction arrows: ->, -->, →, =, =>, ⇌
 */
export function splitEquation(equation: string): { reactants: string[]; products: string[] } {
  // Normalize arrows
  const arrowRegex = /\s*(?:\\longrightarrow|\\rightarrow|\\to|->|-->|→|⟶|=>|⇌|=)\s*/;
  const parts = equation.split(arrowRegex);

  if (parts.length !== 2) {
    throw new Error("Persamaan harus memiliki dua sisi yang dipisahkan oleh tanda panah (-> atau →).");
  }

  const parseSpeciesList = (sideStr: string): string[] => splitSpeciesList(sideStr);

  const reactants = parseSpeciesList(parts[0]);
  const products = parseSpeciesList(parts[1]);

  if (reactants.length === 0) {
    throw new Error("Sisi reaktan (kiri) tidak boleh kosong.");
  }
  if (products.length === 0) {
    throw new Error("Sisi produk (kanan) tidak boleh kosong.");
  }

  return { reactants, products };
}

/**
 * Converts a chemical formula string with charges and subscripts into formatted unicode
 * e.g., "Cr2O7^2-" -> "Cr₂O₇²⁻", "MnO4-" -> "MnO₄⁻", "H2O" -> "H₂O"
 */
export function formatFormulaUnicode(formula: string, charge: number = 0): string {
  const subscripts: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  };

  const superscripts: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻",
  };

  // Convert numbers following element symbols or parentheses to subscripts
  let formatted = formula.replace(/([A-Za-z)\]])(\d+)/g, (_match, prefix, num) => {
    const sub = num.split("").map((d: string) => subscripts[d] || d).join("");
    return prefix + sub;
  });

  // Attach charge as superscript if not zero
  if (charge !== 0) {
    let chargeStr = "";
    const absCharge = Math.abs(charge);
    const sign = charge > 0 ? "+" : "-";
    if (absCharge === 1) {
      chargeStr = superscripts[sign];
    } else {
      const numSuperscript = absCharge.toString().split("").map(d => superscripts[d] || d).join("");
      chargeStr = numSuperscript + superscripts[sign];
    }
    formatted += chargeStr;
  }

  return formatted;
}
