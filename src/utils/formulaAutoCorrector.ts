/**
 * Formula Auto-Corrector Utility for Chemly
 * Intelligently detects notation errors like lowercase elements, misplaced charges,
 * raw LaTeX commands (\mathrm, \longrightarrow, ^_{2}), and missing redox ion charges.
 */

import { normalizeUnicodeChemistry } from "./chemistryParser";

export interface AutoCorrectionResult {
  hasCorrection: boolean;
  original: string;
  corrected: string;
  diagnostics: string[];
  summaryTitle: string;
  detailedExplanation: string;
  badges: { label: string; color: "amber" | "rose" | "blue" | "emerald" }[];
}

/**
 * Strips LaTeX / KaTeX commands and corruptions from chemistry strings.
 * Examples:
 * - "\mathrm{MnO}_{4}" -> "MnO4"
 * - "\mathrm{Mn}^_{2}" -> "Mn^2+"
 * - "\longrightarrow" -> "->"
 * - "4 \mathrm{H}_{2}\mathrm{O}" -> "4 H2O"
 */
export function deLatexChemistry(input: string): string {
  if (!input) return "";
  let str = input.trim();

  // 1. Convert LaTeX arrows to standard arrow ' -> '

  // Normalize compact Unicode ionic charges such as `Cr2O72−` -> `Cr2O7^2-`
  // and `Fe3+`-style superscript variants without disturbing ordinary
  // chemical subscripts. A charge digit run is recognized only immediately
  // before a Unicode sign.
  str = str.replace(/([A-Za-z\)])([0-9]+)[⁺⁻＋−]/g, (full, prefix, digits) => {
    // For formulas like Cr2O72−, the final digit is the charge magnitude
    // while the preceding digit belongs to the formula.
    if (digits.length > 1) {
      const charge = digits.slice(-1);
      const formulaTail = digits.slice(0, -1);
      return `${prefix}${formulaTail}^${charge}${/[⁺＋]/.test(full) ? "+" : "-"}`;
    }
    return `${prefix}${digits}${/[⁺＋]/.test(full) ? "+" : "-"}`;
  });
  str = str.replace(/\\longrightarrow|\\rightarrow|\\to|\\implies|\\rightleftharpoons/g, " -> ");

  // 2. Fix corrupted caret-underscore combinations e.g. Mn^_{2} or Mn^_2 or Mn^_{2+} -> Mn^2+
  str = str.replace(/\^_\s*\{?(\d+)[+]?\}?/g, "^$1+");
  str = str.replace(/\^_\s*\{?(\d+)[-]\}?/g, "^$1-");
  str = str.replace(/\^_\s*\{?(\d+)\}?/g, "^$1+");

  // 3. Strip LaTeX command wrappers repeatedly (handles nested macros)
  let prev = "";
  let guard = 0;
  while (prev !== str && guard < 10) {
    prev = str;
    guard++;
    str = str.replace(/\\(?:mathrm|text|ce|mathbf|mathit|textbf)\s*\{([^{}]*)\}/g, "$1");
  }

  // 4. Strip any unbracketed \mathrm or literal mathrm word
  str = str.replace(/\\mathrm\s*/g, "");
  str = str.replace(/\bmathrm\b\s*/g, "");

  // 5. Convert LaTeX subscripts: _{4} -> 4, _{10} -> 10, _2 -> 2
  str = str.replace(/_\s*\{([0-9]+)\}/g, "$1");
  str = str.replace(/_([0-9])/g, "$1");

  // 6. Normalize LaTeX superscripts: ^{2-} -> ^2-, ^{3+} -> ^3+
  str = str.replace(/\^\s*\{([^{}]+)\}/g, "^$1");

  // 7. Remove LaTeX spacing commands: \, \; \! \quad \qquad \
  str = str.replace(/\\[,;! ]/g, " ");
  str = str.replace(/\\quad/g, " ");
  str = str.replace(/\\qquad/g, " ");

  // 8. Remove escaped braces
  str = str.replace(/\\\{/g, "{").replace(/\\\}/g, "}");

  // 9. Remove any remaining isolated backslashes
  str = str.replace(/\\/g, "");

  return str.trim();
}

// 2-letter and 1-letter element symbols for case auto-correction
const TWO_LETTER_ELEMENTS: Record<string, string> = {
  he: "He", li: "Li", be: "Be", ne: "Ne", na: "Na", mg: "Mg", al: "Al", si: "Si", cl: "Cl",
  ar: "Ar", ca: "Ca", sc: "Sc", ti: "Ti", cr: "Cr", mn: "Mn", fe: "Fe", co: "Co", ni: "Ni",
  cu: "Cu", zn: "Zn", ga: "Ga", ge: "Ge", as: "As", se: "Se", br: "Br", kr: "Kr", rb: "Rb",
  sr: "Sr", zr: "Zr", nb: "Nb", mo: "Mo", tc: "Tc", ru: "Ru", rh: "Rh", pd: "Pd", ag: "Ag",
  cd: "Cd", in: "In", sn: "Sn", sb: "Sb", te: "Te", xe: "Xe", cs: "Cs", ba: "Ba", la: "La",
  ce: "Ce", pr: "Pr", nd: "Nd", pm: "Pm", sm: "Sm", eu: "Eu", gd: "Gd", tb: "Tb", dy: "Dy",
  ho: "Ho", er: "Er", tm: "Tm", yb: "Yb", lu: "Lu", hf: "Hf", ta: "Ta", re: "Re", os: "Os",
  ir: "Ir", pt: "Pt", au: "Au", hg: "Hg", tl: "Tl", pb: "Pb", bi: "Bi", po: "Po", at: "At",
  rn: "Rn", fr: "Fr", ra: "Ra", ac: "Ac", th: "Th", pa: "Pa", np: "Np", pu: "Pu", am: "Am",
};

const ONE_LETTER_ELEMENTS: Record<string, string> = {
  h: "H", b: "B", c: "C", n: "N", o: "O", f: "F", p: "P", s: "S", k: "K", v: "V", y: "Y", i: "I", w: "W", u: "U",
};

/**
 * Capitalizes chemical element symbols while preserving numbers, parentheses, and charges.
 */
export function autoCapitalizeFormula(formula: string): string {
  let s = formula.trim();
  if (!s) return "";

  let res = "";
  let i = 0;
  const len = s.length;

  while (i < len) {
    const ch = s[i];

    // Numbers, brackets, carets, signs
    if (/[\d()[\]{}*.\-+^]/.test(ch)) {
      res += ch;
      i++;
      continue;
    }

    // Try 2-letter element match
    if (i + 1 < len && /[a-zA-Z]/.test(s[i + 1])) {
      const two = (ch + s[i + 1]).toLowerCase();
      if (TWO_LETTER_ELEMENTS[two]) {
        res += TWO_LETTER_ELEMENTS[two];
        i += 2;
        continue;
      }
    }

    // Try 1-letter element match
    const one = ch.toLowerCase();
    if (ONE_LETTER_ELEMENTS[one]) {
      res += ONE_LETTER_ELEMENTS[one];
      i++;
      continue;
    }

    res += ch;
    i++;
  }

  return res;
}

/**
 * Normalizes a single species term (e.g. "c2o4 2-" -> "C2O4^2-", "fe 3+" -> "Fe^3+", "MnO4" -> "MnO4-")
 */
function normalizeSpeciesTerm(term: string, isReactant: boolean, context: { hasPermanganate: boolean; hasDichromate: boolean }): string {
  let t = term.trim();
  if (!t) return "";

  // 1. Separate leading coefficient if any (e.g. "7 Fe" or "8 H")
  let coef = "";
  const coefMatch = t.match(/^(\d+)\s*(.*)$/);
  if (coefMatch) {
    coef = coefMatch[1] + " ";
    t = coefMatch[2].trim();
  }

  // 2. Fix spaced charges: e.g. "c2o4 2-" -> "c2o4^2-", "fe 3+" -> "fe^3+", "mn 2+" -> "mn^2+"
  t = t.replace(/\s+([0-9]*[+-]|[+-][0-9]*)$/, "^$1");

  // 3. Fix parenthesis charge: e.g. "Fe(2+)" -> "Fe^2+", "Cr2O7(2-)" -> "Cr2O7^2-"
  t = t.replace(/\(([0-9]*[+-]|[+-][0-9]*)\)$/, "^$1");

  // 4. Fix inverted charge signs: e.g. "Fe+2" -> "Fe^2+", "SO4-2" -> "SO4^2-", "Cr+3" -> "Cr^3+"
  t = t.replace(/([A-Za-z0-9])([+-])([1-9])$/, "$1^$3$2");

  // 5. Fix multiple signs: e.g. "Fe+++" -> "Fe^3+", "Fe++" -> "Fe^2+", "O--" -> "O^2-"
  const multiSignMatch = t.match(/^(.*?)([+-]{2,4})$/);
  if (multiSignMatch) {
    const base = multiSignMatch[1];
    const sign = multiSignMatch[2][0];
    const count = multiSignMatch[2].length;
    t = `${base}^${count}${sign}`;
  }

  // 6. Fix corrupted caret like ^_{2} or ^_2
  t = t.replace(/\^_\s*\{?(\d+)\}?/g, "^$1+");

  // 7. Auto capitalize element symbols
  t = autoCapitalizeFormula(t);

  // 8. Redox-specific intelligent missing charge completion:
  // Permanganate: "MnO4" without charge is almost universally "MnO4-" in redox
  if (t === "MnO4") {
    t = "MnO4^-";
  }

  // Dichromate: "Cr2O7" without charge is "Cr2O7^2-"
  if (t === "Cr2O7") {
    t = "Cr2O7^2-";
  }

  // Oxalate: "C2O4" without charge is "C2O4^2-"
  if (t === "C2O4") {
    t = "C2O4^2-";
  }

  // Carbonate: "CO3" without charge in ionic form is "CO3^2-"
  if (t === "CO3") {
    t = "CO3^2-";
  }

  // Sulfate: "SO4" without charge is "SO4^2-"
  if (t === "SO4") {
    t = "SO4^2-";
  }

  // Hydrogen ion in redox context
  if (t === "H") {
    t = "H^+";
  }

  // Iron in permanganate or dichromate redox context:
  // e.g. MnO4- + Fe -> Mn2+ + Fe
  // Reactant Fe should be Fe^2+, Product Fe should be Fe^3+!
  if (t === "Fe" && (context.hasPermanganate || context.hasDichromate)) {
    t = isReactant ? "Fe^2+" : "Fe^3+";
  }

  // Reassemble coefficient
  return `${coef}${t}`.trim();
}


/**
 * Split a reaction side without confusing the `+` in ionic charges with the
 * `+` operator. Handles compact input such as `Cr2O7^2-+Fe2+` and
 * spaced input such as `Cr2O7^2- + Fe2+`.
 */
export function splitChemicalSide(side: string): string[] {
  const parts: string[] = [];
  let start = 0;
  let depth = 0;

  const isSpeciesStart = (ch: string | undefined) =>
    !!ch && /[A-Za-z0-9(\[]/.test(ch);

  for (let i = 0; i < side.length; i++) {
    const ch = side[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth = Math.max(0, depth - 1);
    if (ch !== '+' || depth > 0) continue;

    // `Fe2++MnO4-`: the first + is the charge sign; the second + is the
    // species separator. Likewise, `Fe2+ + MnO4-` is handled by the
    // whitespace-aware lookahead below.
    let j = i + 1;
    while (j < side.length && /\s/.test(side[j])) j++;
    if (side[j] === '+') continue;

    // If another species starts after this plus (optionally after spaces),
    // this plus is the separator. This deliberately preserves the + in a
    // terminal ion such as `Fe2+` because there is no following species.
    if (isSpeciesStart(side[j])) {
      // When the plus follows an element/number and another species starts
      // immediately, it is the terminal charge of the current species
      // (`Cr3+Fe3+`). If it follows `-`/`+`, it is the separator
      // (`Cr2O7^2-+Fe2+`, `Fe2++MnO4-`).
      const previous = side[i - 1] || "";
      const plusBelongsToCharge = /[A-Za-z0-9)]/.test(previous);
      parts.push(side.slice(start, plusBelongsToCharge ? i + 1 : i).trim());
      start = i + 1;
    }
  }

  parts.push(side.slice(start).trim());
  return parts.filter(Boolean);
}

/**
 * Master Formula Auto-Corrector Detector
 * Analyzes equation and detects:
 * - Lowercase elements (e.g. kmno4 -> KMnO4)
 * - Misplaced charges (e.g. c2o4 2- -> C2O4^2-, fe+3 -> Fe^3+, fe(2+) -> Fe^2+)
 * - LaTeX raw code (e.g. \mathrm{MnO}_{4} + 7 \mathrm{Fe} + 8 \mathrm{H} \longrightarrow \mathrm{Mn}^_{2} + 7 \mathrm{Fe} + 4 \mathrm{H}_{2}\mathrm{O})
 * - Missing charges on prominent redox ions (MnO4 -> MnO4-, H -> H+, Fe -> Fe^2+/Fe^3+)
 * - Arrow variations (==>, -->, →, ⟶, =, ⇌)
 */
export function detectAndAutoCorrectFormula(rawInput: string): AutoCorrectionResult {
  const original = (rawInput || "").trim();
  if (!original) {
    return {
      hasCorrection: false,
      original: "",
      corrected: "",
      diagnostics: [],
      summaryTitle: "",
      detailedExplanation: "",
      badges: [],
    };
  }

  const diagnostics: string[] = [];
  const badges: { label: string; color: "amber" | "rose" | "blue" | "emerald" }[] = [];

  // Check 1: LaTeX raw commands
  const hasLatexRaw = /\\(?:mathrm|text|ce|mathbf|longrightarrow|rightarrow)|_\{|\^_\s*\{?|\bmathrm\b/.test(original);
  if (hasLatexRaw) {
    diagnostics.push("Ditemukan sintaks LaTeX raw (seperti \\mathrm, \\longrightarrow, atau ^_{2}).");
    badges.push({ label: "LaTeX Raw Dibersihkan", color: "rose" });
  }

  const hasUnicodeCharge = /[⁺⁻＋−]/.test(original);
  if (hasUnicodeCharge) {
    diagnostics.push("Ditemukan notasi muatan Unicode; dinormalisasi ke format kimia standar tanpa mengubah bilangan indeks formula.");
    badges.push({ label: "Muatan Unicode Dinormalisasi", color: "blue" });
  }

  // Check 2: Lowercase element names (e.g. kmno4, c2o4, cu, fe, hno3)
  const hasLowercase = /\b(?:kmno4|c2o4|hno3|h2so4|cu|fe|mn|cr|zn|cl2|br2|na|ag|al|so4|co2|h2o)\b|[a-z]{2,}/.test(
    original.replace(/\\mathrm|\\text|\\longrightarrow/g, "")
  );
  if (hasLowercase) {
    diagnostics.push("Ditemukan simbol unsur huruf kecil (misal: 'kmno4', 'cu', 'fe') yang harus diawali huruf kapital.");
    badges.push({ label: "Kapitalisasi Unsur", color: "blue" });
  }

  // Check 3: Spaced or inverted charges (e.g. 'c2o4 2-', 'fe 3+', 'fe+2', 'fe+++')
  const hasMisplacedCharge = /\s+[0-9]+[+-]|\s+[+-][0-9]+|[A-Za-z0-9][+-][1-9]\b|[A-Za-z]\([0-9]*[+-]\)|[+-]{2,4}|\^_\s*\{?\d+\}?/.test(original);
  if (hasMisplacedCharge) {
    diagnostics.push("Ditemukan penulisan muatan spasi atau format terbalik (misal: '2-' diubah menjadi '^2-').");
    badges.push({ label: "Format Muatan Dirapikan", color: "amber" });
  }

  // Check 4: Missing charges on well-known redox ions
  const chargeSuffix = "(?:\\^\\s*\\{?\\d*[+-]\\}?|\\s*\\d*[+-]|[⁺⁻＋−])";
  const hasMissingIonCharge = new RegExp(
    `(?:\\bMnO4\\b|\\bCr2O7\\b|\\bC2O4\\b|\\bSO4\\b)(?!${chargeSuffix})|(?<![A-Za-z0-9])H(?![A-Za-z0-9]|${chargeSuffix})`
  ).test(original.replace(/\\mathrm|\\text/g, ""));
  if (hasMissingIonCharge) {
    diagnostics.push("Ditemukan ion redoks poliatomik tanpa muatan (misal: 'MnO4' menjadi 'MnO4⁻', 'H' menjadi 'H⁺').");
    badges.push({ label: "Muatan Ion Dilengkapi", color: "emerald" });
  }

  // Perform multi-stage intelligent correction
  // Stage 1: De-LaTeX
  let step1 = deLatexChemistry(original);

  // Stage 2: Normalize Unicode superscripts and subscripts
  step1 = normalizeUnicodeChemistry(step1);

  // Stage 3: Normalize arrow
  step1 = step1.replace(/\s*(?:->|-->|→|⟶|=>|⇌|=)\s*/g, " -> ");

  // Determine context flags
  const context = {
    hasPermanganate: /MnO4/i.test(step1),
    hasDichromate: /Cr2O7/i.test(step1),
  };

  let corrected = "";

  if (step1.includes(" -> ")) {
    const [left, right] = step1.split(" -> ");
    const cleanSide = (sideStr: string, isReactant: boolean) => {
      return splitChemicalSide(sideStr)
        .map((t) => normalizeSpeciesTerm(t, isReactant, context))
        .filter(Boolean)
        .join(" + ");
    };

    const leftClean = cleanSide(left, true);
    const rightClean = cleanSide(right, false);
    corrected = `${leftClean} -> ${rightClean}`;
  } else {
    // Single side or formula
    corrected = splitChemicalSide(step1)
      .map((t) => normalizeSpeciesTerm(t, true, context))
      .filter(Boolean)
      .join(" + ");
  }

  // Ensure clean spacing
  corrected = corrected.replace(/\s+/g, " ").trim();

  // Special check for user's specific query:
  // \mathrm{MnO}_{4} + 7 \mathrm{Fe} + 8 \mathrm{H} \longrightarrow \mathrm{Mn}^_{2} + 7 \mathrm{Fe} + 4 \mathrm{H}_{2}\mathrm{O}
  // Notice in this reaction, iron is oxidized (Fe^2+ -> Fe^3+), permanganate is reduced (MnO4- -> Mn^2+), and acid medium (8 H+ -> 4 H2O)
  // If reactants has Fe^2+ and products has Fe^3+, ensure the distinction is crisp!
  if (/MnO4\^-/.test(corrected) && /Mn\^2\+/.test(corrected) && /Fe/.test(corrected)) {
    // Ensure Fe on left has 2+ and Fe on right has 3+ if not already set
    const parts = corrected.split(" -> ");
    if (parts.length === 2) {
      let l = parts[0];
      let r = parts[1];
      l = l.replace(/\bFe\b(?!\^)/g, "Fe^2+");
      r = r.replace(/\bFe\b(?!\^)/g, "Fe^3+");
      corrected = `${l} -> ${r}`;
    }
  }

  const hasCorrection = corrected !== original && corrected.length > 0;

  let summaryTitle = "Koreksi Formula Otomatis Tersedia";
  if (hasLatexRaw) {
    summaryTitle = "Perapihan Sintaks LaTeX & Notasi Muatan";
  } else if (hasLowercase && hasMisplacedCharge) {
    summaryTitle = "Koreksi Huruf Kapital & Muatan Partikel";
  } else if (hasLowercase) {
    summaryTitle = "Koreksi Huruf Kapital Unsur Kimia";
  } else if (hasMisplacedCharge || hasMissingIonCharge) {
    summaryTitle = "Normalisasi Muatan Ion Redoks";
  }

  const detailedExplanation =
    diagnostics.length > 0
      ? diagnostics.join(" ")
      : "Formula telah dinormalisasi ke format standar reaksi kimia redoks yang valid.";

  return {
    hasCorrection,
    original,
    corrected,
    diagnostics,
    summaryTitle,
    detailedExplanation,
    badges: badges.length > 0 ? badges : [{ label: "Format Otomatis", color: "blue" }],
  };
}
