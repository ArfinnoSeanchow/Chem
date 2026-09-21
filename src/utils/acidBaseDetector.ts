import { ReactionMedium } from "../types/redox";

export interface AcidBaseDetectionResult {
  detectedMedium: ReactionMedium | null;
  confidence: "high" | "medium" | "low";
  indicatorSpecies: string[];
  reason: string;
}

/**
 * Inspects a raw chemical equation string or tokens to identify if it contains
 * strong indicators of acidic or basic medium.
 */
export function detectReactionMedium(equation: string): AcidBaseDetectionResult {
  const eq = equation.trim();
  if (!eq) {
    return {
      detectedMedium: null,
      confidence: "low",
      indicatorSpecies: [],
      reason: "Belum ada persamaan yang dimasukkan.",
    };
  }

  // Tokenize by spaces and + and ->
  const cleanTokens = eq
    .replace(/->|=>|→|=/g, " ")
    .split(/\+|\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const acidicIndicators: string[] = [];
  const basicIndicators: string[] = [];

  const acidPatterns = [
    { pattern: /^H\+?$/i, name: "H⁺ (Ion Hidrogen)" },
    { pattern: /^H3O\+?$/i, name: "H₃O⁺ (Ion Hidronium)" },
    { pattern: /^H2SO4$/i, name: "H₂SO₄ (Asam Sulfat)" },
    { pattern: /^HNO3$/i, name: "HNO₃ (Asam Nitrat)" },
    { pattern: /^HCl$/i, name: "HCl (Asam Klorida)" },
    { pattern: /^HBr$/i, name: "HBr (Asam Bromida)" },
    { pattern: /^HI$/i, name: "HI (Asam Iodida)" },
    { pattern: /^HClO4$/i, name: "HClO₄ (Asam Perklorat)" },
    { pattern: /^H3PO4$/i, name: "H₃PO₄ (Asam Fosfat)" },
    { pattern: /^H2C2O4$/i, name: "H₂C₂O₄ (Asam Oksalat)" },
  ];

  const basePatterns = [
    { pattern: /^OH-?$/i, name: "OH⁻ (Ion Hidroksida)" },
    { pattern: /^NaOH$/i, name: "NaOH (Natrium Hidroksida)" },
    { pattern: /^KOH$/i, name: "KOH (Kalium Hidroksida)" },
    { pattern: /^Ba\(OH\)2$/i, name: "Ba(OH)₂ (Barium Hidroksida)" },
    { pattern: /^Ca\(OH\)2$/i, name: "Ca(OH)₂ (Kalsium Hidroksida)" },
    { pattern: /^NH3$/i, name: "NH₃ (Amonia)" },
    { pattern: /^NH4OH$/i, name: "NH₄OH (Amonium Hidroksida)" },
  ];

  for (const token of cleanTokens) {
    // Strip leading numbers
    const cleanToken = token.replace(/^\d+/, "");

    for (const ap of acidPatterns) {
      if (ap.pattern.test(cleanToken)) {
        if (!acidicIndicators.includes(ap.name)) acidicIndicators.push(ap.name);
      }
    }

    for (const bp of basePatterns) {
      if (bp.pattern.test(cleanToken)) {
        if (!basicIndicators.includes(bp.name)) basicIndicators.push(bp.name);
      }
    }
  }

  if (acidicIndicators.length > 0 && basicIndicators.length === 0) {
    return {
      detectedMedium: "acidic",
      confidence: "high",
      indicatorSpecies: acidicIndicators,
      reason: `Terdeteksi spesi asam: ${acidicIndicators.join(", ")}`,
    };
  }

  if (basicIndicators.length > 0 && acidicIndicators.length === 0) {
    return {
      detectedMedium: "basic",
      confidence: "high",
      indicatorSpecies: basicIndicators,
      reason: `Terdeteksi spesi basa: ${basicIndicators.join(", ")}`,
    };
  }

  if (acidicIndicators.length > 0 && basicIndicators.length > 0) {
    return {
      detectedMedium: "acidic",
      confidence: "medium",
      indicatorSpecies: [...acidicIndicators, ...basicIndicators],
      reason: "Terdapat spesi asam dan basa sekaligus. Suasana asam disarankan sebagai default.",
    };
  }

  return {
    detectedMedium: null,
    confidence: "low",
    indicatorSpecies: [],
    reason: "Tidak ditemukan indikator kuat H⁺ atau OH⁻ dalam reaksi awal.",
  };
}
