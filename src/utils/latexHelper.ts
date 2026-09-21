/**
 * LaTeX formatting helpers for chemical species, reactions, biloks, and numbers
 */

import { deLatexChemistry } from "./formulaAutoCorrector.js";

/**
 * Normalizes unicode superscripts and subscripts to clean caret and index notation.
 * e.g. "Cr₂O₇²⁻" -> "Cr2O7^{2-}"
 */
export function normalizeUnicodeChemistry(input: string): string {
  let str = input.trim();

  // First, extract any trailing or embedded unicode superscripts and wrap them into caret notation
  // Superscript characters: ⁰ ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ⁺ ⁻
  const supMap: Record<string, string> = {
    "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
    "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
    "⁺": "+", "⁻": "-",
  };

  // Replace contiguous superscript runs: e.g. "²⁻" -> "^{2-}", "³⁺" -> "^{3+}", "⁺" -> "^+", "⁻" -> "^-"
  str = str.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+)/g, (_, match) => {
    const converted = match.split("").map((ch: string) => supMap[ch] || ch).join("");
    return `^{${converted}}`;
  });

  // Next, replace unicode subscripts with normal digits: ₀₁₂₃₄₅₆₇₈₉
  const subMap: Record<string, string> = {
    "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
    "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
  };
  str = str.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (ch) => subMap[ch] || ch);

  return str;
}

/**
 * Converts a chemical species (e.g. "KMnO4", "Cr2O7^2-", "5H2O", "Fe3+") into a KaTeX math string.
 * Examples:
 * - "KMnO4" -> "\\mathrm{KMnO}_4"
 * - "Cr2O7^2-" -> "\\mathrm{Cr}_2\\mathrm{O}_7^{2-}"
 * - "Cr₂O₇²⁻" -> "\\mathrm{Cr}_2\\mathrm{O}_7^{2-}"
 * - "5H2O" -> "5\\mathrm{H}_2\\mathrm{O}"
 * - "14H+" -> "14\\mathrm{H}^+"
 * - "6Fe^2+" -> "6\\mathrm{Fe}^{2+}"
 */
export function speciesToLatex(species: string, explicitCharge?: number): string {
  const deLatexed = deLatexChemistry(species);
  let str = normalizeUnicodeChemistry(deLatexed);
  if (!str) return "";

  // Special handling for electron "e" or "e-"
  if (str === "e" || str === "e-" || str === "e^-" || str === "^{e-}") {
    return "\\mathrm{e}^-";
  }
  const eMatch = str.match(/^(\d+)\s*(?:e|e-|e\^-|\^\{e-\})$/);
  if (eMatch) {
    return `${eMatch[1]}\\mathrm{e}^-`;
  }

  // Extract leading coefficient if any
  let coef = "";
  const coefMatch = str.match(/^(\d+)\s*([A-Za-z([].*)$/);
  if (coefMatch) {
    coef = coefMatch[1] + " ";
    str = coefMatch[2].trim();
  }

  // Phase notation at end e.g. (aq), (s), (l), (g)
  let phaseStr = "";
  const phaseMatch = str.match(/^(.*?)\s*(\((?:aq|s|l|g)\))$/i);
  if (phaseMatch) {
    str = phaseMatch[1].trim();
    phaseStr = `\\,\\mathrm{${phaseMatch[2].toLowerCase()}}`;
  }

  // Extract charge if written as ^{2-}, ^{2+}, ^2-, ^-, ^+, 2-, 2+, +, -
  let chargeStr = "";

  // 1. Caret notation: ^{2-}, ^{2+}, ^2-, ^-, ^+
  const caretMatch = str.match(/^(.*?)\^\{?([0-9]*[+-]|[+-][0-9]*)\}?$/);
  if (caretMatch) {
    str = caretMatch[1];
    chargeStr = caretMatch[2];
  } else {
    // 2. End charge notation with parenthesis: Cr2O7(2-) or Fe(2+)
    const parenMatch = str.match(/^(.*?)\(([0-9]*[+-]|[+-][0-9]*)\)$/);
    if (parenMatch) {
      str = parenMatch[1];
      chargeStr = parenMatch[2];
    } else {
      // 3. Spaced charge like "Cr2O7 2-" or "Fe 2+" or "MnO4 -"
      const spacedMatch = str.match(/^(.*?)\s+([0-9]+[+-]|[+-][0-9]+|[+-])$/);
      if (spacedMatch) {
        str = spacedMatch[1];
        chargeStr = spacedMatch[2];
      } else {
        // 4. Monoatomic ion with number charge: e.g. Fe2+, Fe3+, Mn2+, Cr3+, Cu2+, Zn2+, O2-
        const monoatomicMatch = str.match(/^([A-Z][a-z]?)(\d+)([+-])$/);
        if (monoatomicMatch) {
          str = monoatomicMatch[1];
          chargeStr = `${monoatomicMatch[2]}${monoatomicMatch[3]}`;
        } else {
          // 5. Trailing multiple signs like Fe+++, Fe--
          const multiSigns = str.match(/^(.*?)([+-]{2,4})$/);
          if (multiSigns && multiSigns[1].length > 0) {
            str = multiSigns[1];
            chargeStr = `${multiSigns[2].length}${multiSigns[2][0]}`;
          } else {
            // 6. Trailing single sign: e.g. "MnO4-" or "H+" or "OH-" or "Cl-"
            const singleSign = str.match(/^(.*?)([+-])$/);
            if (singleSign && singleSign[1].length > 0) {
              str = singleSign[1];
              chargeStr = singleSign[2];
            } else {
              // 7. Known polyatomic ions without caret: SO42-, Cr2O72-, C2O42-, CO32-, PO43-
              // To prevent greedy merging with index (e.g. C2O42- should be C2O4 and 2-, NOT C2O and 42-),
              // we check if the formula ends with a single digit charge [1-4][+-]
              const polyMatch = str.match(/^(.*?[A-Za-z])(\d*)([1-4][+-])$/);
              if (polyMatch) {
                // E.g. "SO4" + "" + "2-" -> base "SO4", charge "2-"
                // E.g. "Cr2O7" + "" + "2-" -> base "Cr2O7", charge "2-"
                str = `${polyMatch[1]}${polyMatch[2]}`;
                chargeStr = polyMatch[3];
              }
            }
          }
        }
      }
    }
  }

  // Format standard charge: if e.g. "2-", format as "2-", if "-", format as "-"
  let formattedCharge = "";
  if (chargeStr) {
    let clean = chargeStr.trim();
    if (clean === "+") clean = "+";
    else if (clean === "-") clean = "-";
    else if (clean.startsWith("+") || clean.startsWith("-")) {
      const sign = clean[0];
      const num = clean.slice(1);
      clean = num + sign;
    }
    formattedCharge = `^{${clean}}`;
  } else if (explicitCharge !== undefined && explicitCharge !== 0) {
    const sign = explicitCharge > 0 ? "+" : "-";
    const abs = Math.abs(explicitCharge);
    formattedCharge = `^{${abs === 1 ? sign : `${abs}${sign}`}}`;
  }

  // Convert numbers in formula into subscripts
  // Handles element symbols, parentheses (), brackets []
  let latexFormula = "";
  let i = 0;
  const len = str.length;

  while (i < len) {
    const ch = str[i];
    if (ch >= "0" && ch <= "9") {
      let num = "";
      while (i < len && str[i] >= "0" && str[i] <= "9") {
        num += str[i];
        i++;
      }
      latexFormula += `_{${num}}`;
    } else if (ch === "(" || ch === ")" || ch === "[" || ch === "]") {
      latexFormula += ch;
      i++;
    } else if ((ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z")) {
      let text = "";
      while (i < len && ((str[i] >= "A" && str[i] <= "Z") || (str[i] >= "a" && str[i] <= "z"))) {
        text += str[i];
        i++;
      }
      latexFormula += `\\mathrm{${text}}`;
    } else if (ch === "•" || ch === "·" || ch === "*") {
      latexFormula += "\\cdot ";
      i++;
    } else {
      latexFormula += ch;
      i++;
    }
  }

  return `${coef}${latexFormula}${formattedCharge}${phaseStr}`;
}

/**
 * Splits a chemical side into individual species terms without confusing '+' in charges with '+' operator.
 */
export function splitChemicalTerms(sideStr: string): string[] {
  const trimmed = sideStr.trim();
  if (!trimmed) return [];

  // Check if spaces around '+' exist: "A + B"
  if (/\s+\+\s+/.test(trimmed)) {
    return trimmed.split(/\s+\+\s+/).map((s) => s.trim()).filter(Boolean);
  }

  // Fallback: If someone wrote "A+B" without spaces, be careful not to split on "H+" or "Fe2+"
  // Split on '+' only if preceded by a chemical formula and followed by a number or uppercase letter
  const terms: string[] = [];
  let current = "";
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    const prev = i > 0 ? trimmed[i - 1] : "";
    const next = i + 1 < trimmed.length ? trimmed[i + 1] : "";

    // If current is empty, just append
    if (!current) {
      current += ch;
      continue;
    }

    // Check if '+' is an addition operator:
    // If it's '+' and previous character is a charge sign (like '+', '-', or followed by space),
    // or if prev was not a charge sign but next is an uppercase letter or number:
    if (ch === "+") {
      // If preceded or followed by whitespace
      if (prev === " " || next === " ") {
        if (current.trim()) terms.push(current.trim());
        current = "";
        continue;
      }
      // If current ends with another sign like "H+" and next is a new term "Fe", e.g. "H++Fe"
      if ((prev === "+" || prev === "-") && /[A-Z0-9]/.test(next)) {
        if (current.trim()) terms.push(current.trim());
        current = "";
        continue;
      }
    }
    current += ch;
  }
  if (current.trim()) terms.push(current.trim());
  return terms.length > 0 ? terms : [trimmed];
}

/**
 * Converts a chemical equation (e.g. "KMnO4 + H2C2O4 -> MnO2 + CO2") into full KaTeX string.
 */
export function equationToLatex(equation: string | undefined): string {
  if (!equation) return "";

  // kode function yang sekarang tetap di bawah sini
  const cleanedEquation = deLatexChemistry(equation);

  // Normalize reaction arrow
  const arrowRegex = /\s*(?:->|-->|→|=>|⇌|\\rightleftharpoons|\\longrightarrow|=)\s*/;
  const isEquilibrium = cleanedEquation.includes("⇌") || cleanedEquation.includes("<=>");
  const arrowLatex = isEquilibrium ? " \\rightleftharpoons " : " \\longrightarrow ";

  const parts = cleanedEquation.split(arrowRegex);

  if (parts.length === 2) {
    const reactants = splitChemicalTerms(parts[0])
      .map((s) => speciesToLatex(s.trim()))
      .join(" + ");

    const products = splitChemicalTerms(parts[1])
      .map((s) => speciesToLatex(s.trim()))
      .join(" + ");

    return `${reactants}${arrowLatex}${products}`;
  }

  // Fallback for single line or partial text
  return speciesToLatex(equation);
}

/**
 * Formats a single biloks number as signed LaTeX string e.g. +7 -> "+7", -2 -> "-2", 0 -> "0"
 */
export function biloksToLatex(val: number): string {
  if (val > 0) return `+${val}`;
  if (val < 0) return `${val}`;
  return `0`;
}

/**
 * Comprehensive Plain Text to LaTeX result structure
 */
export interface PlainTextToLatexResult {
  rawInput: string;
  cleanedText: string;
  katexInline: string;
  katexBlock: string;
  latexDocBlock: string;
  mhchemString: string;
  unicodeText: string;
  isReaction: boolean;
  isValidSyntax: boolean;
  warningMessage?: string;
}

/**
 * Advanced converter from plain casual chemistry text to multiple LaTeX and Unicode formats
 */
export function convertPlainTextToLatex(raw: string): PlainTextToLatexResult {
  const trimmed = (raw || "").trim();
  if (!trimmed) {
    return {
      rawInput: "",
      cleanedText: "",
      katexInline: "",
      katexBlock: "",
      latexDocBlock: "",
      mhchemString: "",
      unicodeText: "",
      isReaction: false,
      isValidSyntax: true,
    };
  }

  // Clean and normalize text
  const normalized = normalizeUnicodeChemistry(trimmed);
  const isReaction = /(?:->|-->|→|=>|⇌|=)/.test(normalized);

  // Check for lowercase element warning (e.g. kmno4 instead of KMnO4)
  let warningMessage: string | undefined;
  if (/^[a-z]{2,}/.test(trimmed)) {
    warningMessage = "Peringatan: Simbol unsur kimia harus diawali huruf kapital (misal: KMnO4, bukan kmno4).";
  }

  const katexFormula = isReaction ? equationToLatex(normalized) : speciesToLatex(normalized);
  const katexInline = `$${katexFormula}$`;
  const katexBlock = `$$${katexFormula}$$`;
  const latexDocBlock = `\\begin{equation}\n  ${katexFormula}\n\\end{equation}`;

  // Build mhchem string: \ce{...}
  const cleanMhchem = trimmed
    .replace(/->|-->|→|=>/g, " -> ")
    .replace(/⇌|<=>/g, " <=> ")
    .replace(/\s+/g, " ");
  const mhchemString = `\\ce{${cleanMhchem}}`;

  // Build formatted Unicode string: e.g. 2 MnO₄⁻ + 5 C₂O₄²⁻ -> 2 Mn²⁺ + 10 CO₂
  const subDigits: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  };
  const supDigits: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻",
  };

  const toUnicodeFormula = (s: string) => {
    let str = normalizeUnicodeChemistry(s);
    // Replace caret charges: ^{2-} or ^2- or ^+ or ^-
    str = str.replace(/\^\{?([0-9]*[+-]|[+-][0-9]*)\}?/g, (_, chg) => {
      return chg.split("").map((c: string) => supDigits[c] || c).join("");
    });
    // Replace spaced or trailing charges: e.g. "2-" or "3+" or "+" or "-" at end
    str = str.replace(/([0-9]+[+-]|[+-][0-9]+|[+-])$/g, (chg) => {
      return chg.split("").map((c: string) => supDigits[c] || c).join("");
    });
    // Replace digits after element letters with subscripts
    str = str.replace(/([A-Za-z)\]])(\d+)/g, (_, sym, num) => {
      const subs = num.split("").map((d: string) => subDigits[d] || d).join("");
      return `${sym}${subs}`;
    });
    // Remove space between formula and superscript charge: e.g. "C₂O₄ ²⁻" -> "C₂O₄²⁻"
    str = str.replace(/([A-Za-z₀₁₂₃₄₅₆₇₈₉)\]])\s+([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+)/g, "$1$2");
    return str;
  };

  const unicodeText = isReaction
    ? trimmed
        .split(/\s*(?:->|-->|→|=>|=)\s*/)
        .map((side) =>
          splitChemicalTerms(side)
            .map((term) => toUnicodeFormula(term.trim()))
            .join(" + ")
        )
        .join(" → ")
    : toUnicodeFormula(trimmed);

  return {
    rawInput: raw,
    cleanedText: normalized,
    katexInline,
    katexBlock,
    latexDocBlock,
    mhchemString,
    unicodeText,
    isReaction,
    isValidSyntax: true,
    warningMessage,
  };
}
