import { RedoxResult } from "../types/redox";

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface ReactionDifficultyInfo {
  level: DifficultyLevel;
  score: number; // 1 to 10
  label: string;
  badgeColor: {
    bg: string;
    text: string;
    border: string;
    flameColor: string;
  };
  flames: string;
  reasons: string[];
}

/**
 * Calculates difficulty of a redox reaction based on:
 * - Number of species & elements involved
 * - Autoredox (disproportionation) or Comproportionation
 * - Electron transfer magnitude
 * - Medium adjustments (acidic/basic balancing requiring H+, OH-, H2O)
 * - Large stoichiometric coefficients
 */
export function calculateReactionDifficulty(result: RedoxResult): ReactionDifficultyInfo {
  if (!result.isValid) {
    return {
      level: "easy",
      score: 1,
      label: "Mudah (Dasar)",
      badgeColor: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400 dark:text-emerald-300",
        border: "border-emerald-500/30",
        flameColor: "text-emerald-400",
      },
      flames: "🔥",
      reasons: ["Persamaan dasar."],
    };
  }

  let score = 1;
  const reasons: string[] = [];

  // 1. Check category (Autoredox / Konproporsionasi)
  if (result.reactionCategory === "Autoredoks (Disproporsionasi)") {
    score += 4;
    reasons.push("Reaksi Disproporsionasi (Autoredoks): satu unsur mengalami oksidasi sekaligus reduksi.");
  } else if (result.reactionCategory === "Konproporsionasi") {
    score += 4;
    reasons.push("Reaksi Konproporsionasi: dua spesi berbeda membentuk satu spesi dengan biloks sama.");
  }

  // 2. Count distinct elements
  const allElements = new Set<string>();
  (result.reactants || []).forEach((r) => Object.keys(r.elements || {}).forEach((e) => allElements.add(e)));
  (result.products || []).forEach((p) => Object.keys(p.elements || {}).forEach((e) => allElements.add(e)));

  if (allElements.size >= 5) {
    score += 2;
    reasons.push(`Melibatkan ${allElements.size} unsur berbeda.`);
  } else if (allElements.size >= 4) {
    score += 1;
    reasons.push(`Melibatkan ${allElements.size} unsur.`);
  }

  // 3. Number of species in balanced equation
  const totalSpecies = (result.balancedReactants?.length || 0) + (result.balancedProducts?.length || 0);
  if (totalSpecies >= 6) {
    score += 2;
    reasons.push(`Persamaan akhir memiliki ${totalSpecies} spesi kimia termasuk penyesuaian ion.`);
  } else if (totalSpecies >= 4) {
    score += 1;
  }

  // 4. Electrons transferred
  if (result.electronsTransferred >= 10) {
    score += 3;
    reasons.push(`Transfer elektron sangat besar (${result.electronsTransferred} e⁻), memerlukan KPK pengali tinggi.`);
  } else if (result.electronsTransferred >= 5) {
    score += 2;
    reasons.push(`Transfer ${result.electronsTransferred} elektron antara spesi.`);
  } else if (result.electronsTransferred >= 3) {
    score += 1;
  }

  // 5. Check largest coefficient
  let maxCoeff = 1;
  result.balancedReactants.forEach((r) => {
    if (r.coefficient > maxCoeff) maxCoeff = r.coefficient;
  });
  result.balancedProducts.forEach((p) => {
    if (p.coefficient > maxCoeff) maxCoeff = p.coefficient;
  });

  if (maxCoeff >= 8) {
    score += 2;
    reasons.push(`Koefisien stoikiometri tinggi (hingga ${maxCoeff}).`);
  } else if (maxCoeff >= 4) {
    score += 1;
  }

  // 6. Medium balancing complexity (Basic medium often tricky with H2O and OH-)
  if (result.medium === "basic") {
    score += 1;
    reasons.push("Penyetaraan dalam suasana basa (memerlukan penambahan OH⁻ dan H₂O pada sisi berlawanan).");
  }

  // Clamp score 1 to 10
  const finalScore = Math.min(10, Math.max(1, score));

  if (finalScore >= 7) {
    return {
      level: "hard",
      score: finalScore,
      label: "Sulit (Tingkat UTBK / Olimpiade)",
      badgeColor: {
        bg: "bg-rose-500/10",
        text: "text-rose-400 dark:text-rose-300",
        border: "border-rose-500/30",
        flameColor: "text-rose-500",
      },
      flames: "🔥🔥🔥",
      reasons: reasons.length > 0 ? reasons : ["Kompleksitas tinggi pada transfer elektron dan penyetaraan muatan."],
    };
  }

  if (finalScore >= 4) {
    return {
      level: "medium",
      score: finalScore,
      label: "Sedang (Menengah)",
      badgeColor: {
        bg: "bg-amber-500/10",
        text: "text-amber-400 dark:text-amber-300",
        border: "border-amber-500/30",
        flameColor: "text-amber-500",
      },
      flames: "🔥🔥",
      reasons: reasons.length > 0 ? reasons : ["Melibatkan penyetaraan muatan ion dan suasana asam/basa standar."],
    };
  }

  return {
    level: "easy",
    score: finalScore,
    label: "Mudah (Dasar)",
    badgeColor: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400 dark:text-emerald-300",
      border: "border-emerald-500/30",
      flameColor: "text-emerald-400",
    },
    flames: "🔥",
    reasons: reasons.length > 0 ? reasons : ["Reaksi redoks biner sederhana dengan transfer elektron minimal."],
  };
}
