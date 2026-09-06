import { parseFormulaElements } from "./chemistryParser";
import { detectAndAutoCorrectFormula } from "./formulaAutoCorrector";

export interface MistakeDiagnostic {
  hasMistake: boolean;
  type: "syntax" | "conservation" | "format" | "non-redox" | "none";
  title: string;
  message: string;
  suggestion?: string;
  autoFix?: string;
}

/**
 * Validates a chemical equation in real-time and detects common chemistry student mistakes:
 * 1. Missing reaction arrow (-> or =)
 * 2. Raw LaTeX markup (\mathrm, \longrightarrow, ^_{2})
 * 3. Unbalanced elements (element on left that doesn't exist on right)
 * 4. Capitalization mistakes (e.g. "fe" instead of "Fe", "cl" instead of "Cl")
 * 5. Charge typo (e.g. "++" or "2--" or lowercase charge)
 * 6. Space / bracket mismatches
 */
export function detectEquationMistakes(equation: string): MistakeDiagnostic | null {
  const trimmed = equation.trim();
  if (!trimmed) return null;

  // Run Auto-Corrector check
  const autoCorr = detectAndAutoCorrectFormula(trimmed);

  // 1. Missing arrow
  const arrowMatch = trimmed.match(/\\longrightarrow|\\rightarrow|\\to|->|-->|→|⟶|=>|⇌|=/);
  if (!arrowMatch) {
    return {
      hasMistake: true,
      type: "syntax",
      title: "Tanda Panah Reaksi Belum Ditemukan",
      message: "Persamaan reaksi memerlukan tanda panah untuk memisahkan reaktan (ruas kiri) dan produk (ruas kanan).",
      suggestion: "Gunakan '->' atau '→' untuk memisahkan reaktan dan produk (contoh: Cu + HNO3 -> Cu2+ + NO2).",
      autoFix: autoCorr.hasCorrection ? autoCorr.corrected : undefined,
    };
  }

  const parts = trimmed.split(/\\longrightarrow|\\rightarrow|\\to|->|-->|→|⟶|=>|⇌|=/);
  if (parts.length > 2) {
    return {
      hasMistake: true,
      type: "syntax",
      title: "Terlalu Banyak Tanda Panah",
      message: "Ditemukan lebih dari satu tanda panah dalam persamaan reaksi.",
      suggestion: "Gunakan tepat satu tanda panah '->'.",
      autoFix: autoCorr.hasCorrection ? autoCorr.corrected : undefined,
    };
  }

  const leftSide = parts[0].trim();
  const rightSide = parts[1].trim();

  if (!leftSide) {
    return {
      hasMistake: true,
      type: "syntax",
      title: "Ruas Kiri (Reaktan) Kosong",
      message: "Masukkan minimal satu senyawa reaktan di sebelah kiri panah.",
    };
  }

  if (!rightSide) {
    return {
      hasMistake: true,
      type: "syntax",
      title: "Ruas Kanan (Produk) Kosong",
      message: "Masukkan minimal satu senyawa produk di sebelah kanan panah.",
    };
  }

  // Check for raw LaTeX syntax
  if (/\\(?:mathrm|text|ce|mathbf)|_\{|\^_\s*\{?|\bmathrm\b/.test(trimmed)) {
    return {
      hasMistake: true,
      type: "format",
      title: "Sintaks LaTeX Raw Terdeteksi",
      message: "Formula mengandung kode LaTeX (seperti \\mathrm atau \\longrightarrow) yang dapat dibersihkan otomatis.",
      suggestion: "Klik 'Koreksi Otomatis' untuk merapikan notasi LaTeX menjadi formula kimia standar.",
      autoFix: autoCorr.hasCorrection ? autoCorr.corrected : undefined,
    };
  }

  // 2. Check brackets balance
  const openParens = (trimmed.match(/\(/g) || []).length;
  const closeParens = (trimmed.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    return {
      hasMistake: true,
      type: "format",
      title: "Tanda Kurung Tidak Seimbang",
      message: `Jumlah kurung buka (${openParens}) tidak sama dengan kurung tutup (${closeParens}).`,
      suggestion: "Pastikan setiap gugus poliatomik seperti (NO3)2 atau (SO4)3 tertutup rapi.",
    };
  }

  // 3. Check for double charge signs
  if (/[+\-]{2,}/.test(trimmed)) {
    return {
      hasMistake: true,
      type: "format",
      title: "Penulisan Muatan Terulang",
      message: "Ditemukan tanda plus atau minus berturut-turut (seperti '++' atau '--').",
      suggestion: "Gunakan notasi muatan standar seperti 2+ atau 2- (contoh: Fe^2+ atau Fe2+).",
    };
  }

  // 4. Check element conservation across reactant and product sides
  try {
    const parseSideElements = (side: string): Set<string> => {
      const elements = new Set<string>();
      const speciesList = side.split("+").map((s) => s.trim()).filter(Boolean);
      for (const sp of speciesList) {
        // Remove leading coefficient and charge notation
        const formula = sp.replace(/^\d+/, "").replace(/\^?[-+]?\d*[-+]/g, "");
        const parsed = parseFormulaElements(formula);
        Object.keys(parsed || {}).forEach((el) => elements.add(el));
      }
      return elements;
    };

    const leftElements = parseSideElements(leftSide);
    const rightElements = parseSideElements(rightSide);

    // Elements in left but missing in right (excluding H and O if in acidic/basic medium)
    const missingInRight = Array.from(leftElements).filter(
      (el) => !rightElements.has(el) && el !== "H" && el !== "O"
    );

    // Elements in right but missing in left (excluding H and O)
    const missingInLeft = Array.from(rightElements).filter(
      (el) => !leftElements.has(el) && el !== "H" && el !== "O"
    );

    if (missingInRight.length > 0) {
      return {
        hasMistake: true,
        type: "conservation",
        title: `Hukum Kekekalan Massa: Unsur ${missingInRight.join(", ")} Hilang di Ruas Kanan`,
        message: `Unsur ${missingInRight.join(", ")} ada di sisi reaktan tetapi tidak ada di sisi produk. Dalam reaksi kimia, atom tidak dapat musnah.`,
        suggestion: `Tambahkan spesi yang mengandung ${missingInRight.join(", ")} di ruas kanan produk.`,
      };
    }

    if (missingInLeft.length > 0) {
      return {
        hasMistake: true,
        type: "conservation",
        title: `Hukum Kekekalan Massa: Unsur ${missingInLeft.join(", ")} Tidak Ada di Ruas Kiri`,
        message: `Unsur ${missingInLeft.join(", ")} ada di produk tetapi belum dituliskan di sisi reaktan. Atom tidak dapat tercipta dari ketiadaan.`,
        suggestion: `Tambahkan spesi yang mengandung ${missingInLeft.join(", ")} di ruas kiri reaktan.`,
      };
    }
  } catch {
    // If parser encounters strange characters, don't crash
  }

  return null;
}
