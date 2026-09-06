/**
 * IUPAC Oxidation State (Bilangan Oksidasi / Biloks) Calculator
 * Implements deterministic chemical rules hierarchy and mathematical algebra
 */

import { ParsedSpecies } from "../types/redox";
import { parseFormulaElements } from "./chemistryParser";

export interface ElementBiloksDetail {
  element: string;
  count: number;
  biloks: number;
  totalBiloks: number;
  explanation: string;
}

export interface CompoundBiloksResult {
  formula: string;
  charge: number;
  details: Record<string, ElementBiloksDetail>;
  overallEquation: string;
}

// Groups & Fixed Oxidation Rules
const ALKALI_METALS = new Set(["Li", "Na", "K", "Rb", "Cs", "Fr"]);
const ALKALINE_EARTH_METALS = new Set(["Be", "Mg", "Ca", "Sr", "Ba", "Ra"]);
const HALOGENS = new Set(["F", "Cl", "Br", "I", "At"]);

export function calculateOxidationStates(
  formula: string,
  charge: number = 0
): CompoundBiloksResult {
  const elements = parseFormulaElements(formula) || {};
  const elementKeys = Object.keys(elements);
  const details: Record<string, ElementBiloksDetail> = {};

  // Case 1: Free Element (single element type with charge 0, e.g. O2, P4, S8, Fe, Cu)
  if (elementKeys.length === 1 && charge === 0) {
    const el = elementKeys[0];
    const count = elements[el];
    details[el] = {
      element: el,
      count,
      biloks: 0,
      totalBiloks: 0,
      explanation: `Unsur bebas (${formula}) dalam keadaan bebas/standar memiliki bilangan oksidasi 0.`,
    };
    return {
      formula,
      charge,
      details,
      overallEquation: `Biloks ${el} = 0 (Unsur Bebas)`,
    };
  }

  // Case 2: Monatomic Ion (single element type with non-zero charge, e.g. Fe^3+, Cl^-, S^2-)
  if (elementKeys.length === 1 && charge !== 0) {
    const el = elementKeys[0];
    const count = elements[el];
    const biloks = charge / count;
    details[el] = {
      element: el,
      count,
      biloks,
      totalBiloks: charge,
      explanation: `Ion monoatomik memiliki biloks sama dengan muatannya (${charge > 0 ? "+" : ""}${charge}).`,
    };
    return {
      formula,
      charge,
      details,
      overallEquation: `Biloks ${el} = ${biloks > 0 ? "+" : ""}${biloks} (Sesuai muatan ion)`,
    };
  }

  // Case 3: Polyatomic molecule or ion
  // We apply the standard priority hierarchy:
  // 1. Group 1: +1
  // 2. Group 2: +2
  // 3. F: -1
  // 4. Al: +3, Zn: +2, Ag: +1
  // 5. H: usually +1 (unless bonded with active metals -> -1)
  // 6. O: usually -2 (unless in peroxides e.g. H2O2 -> -1, or OF2 -> +2)
  // 7. Halogens (Cl, Br, I): -1 in binary without O or F
  // 8. Solve remaining single unknown by charge conservation: sum(count_i * biloks_i) = charge

  const knownBiloks: Record<string, { biloks: number; explanation: string }> = {};

  // Check Fluorine
  if (elements["F"]) {
    knownBiloks["F"] = {
      biloks: -1,
      explanation: "Fluorin (F) selalu memiliki biloks -1 dalam senyawa.",
    };
  }

  // Check Group 1 (Li, Na, K, Rb, Cs, Fr)
  for (const el of elementKeys) {
    if (ALKALI_METALS.has(el)) {
      knownBiloks[el] = {
        biloks: 1,
        explanation: `Logam alkali Golongan IA (${el}) selalu memiliki biloks +1 dalam senyawanya.`,
      };
    }
  }

  // Check Group 2 (Be, Mg, Ca, Sr, Ba, Ra)
  for (const el of elementKeys) {
    if (ALKALINE_EARTH_METALS.has(el)) {
      knownBiloks[el] = {
        biloks: 2,
        explanation: `Logam alkali tanah Golongan IIA (${el}) selalu memiliki biloks +2 dalam senyawanya.`,
      };
    }
  }

  // Check fixed metals Al, Zn, Ag
  if (elements["Al"]) {
    knownBiloks["Al"] = { biloks: 3, explanation: "Aluminium (Al) selalu memiliki biloks +3 dalam senyawa." };
  }
  if (elements["Zn"]) {
    knownBiloks["Zn"] = { biloks: 2, explanation: "Seng (Zn) selalu memiliki biloks +2 dalam senyawa." };
  }
  if (elements["Ag"]) {
    knownBiloks["Ag"] = { biloks: 1, explanation: "Perak (Ag) memiliki biloks +1 dalam senyawa umumnya." };
  }

  // Check Hydrogen
  if (elements["H"] && !knownBiloks["H"]) {
    // Check if it's a metal hydride (e.g. NaH, CaH2, LiH)
    const isMetalHydride = elementKeys.some(
      (el) => el !== "H" && (ALKALI_METALS.has(el) || ALKALINE_EARTH_METALS.has(el)) && !elements["O"]
    );
    if (isMetalHydride) {
      knownBiloks["H"] = {
        biloks: -1,
        explanation: "Hidrogen (H) berikatan dengan logam aktif (hidrida logam) memiliki biloks -1.",
      };
    } else {
      knownBiloks["H"] = {
        biloks: 1,
        explanation: "Hidrogen (H) dalam senyawa umumnya memiliki biloks +1.",
      };
    }
  }

  // Check Oxygen
  if (elements["O"] && !knownBiloks["O"]) {
    // Check OF2
    if (elements["F"] && elementKeys.length === 2) {
      const fCount = elements["F"];
      const oCount = elements["O"];
      const oBiloks = (2 * fCount) / oCount; // OF2 -> +2
      knownBiloks["O"] = {
        biloks: oBiloks,
        explanation: "Oksigen (O) berikatan dengan Fluorin memiliki biloks positif (+2).",
      };
    }
    // Check peroxides: H2O2, Na2O2, BaO2
    else if (
      (formula === "H2O2" || formula === "Na2O2" || formula === "K2O2" || formula === "BaO2") &&
      charge === 0
    ) {
      knownBiloks["O"] = {
        biloks: -1,
        explanation: "Oksigen (O) dalam senyawa peroksida memiliki biloks -1.",
      };
    }
    // Superoxides: KO2, NaO2
    else if ((formula === "KO2" || formula === "NaO2") && charge === 0) {
      knownBiloks["O"] = {
        biloks: -0.5,
        explanation: "Oksigen (O) dalam senyawa superoksida memiliki biloks -1/2.",
      };
    } else {
      knownBiloks["O"] = {
        biloks: -2,
        explanation: "Oksigen (O) dalam senyawa oksida dan oksi-anion memiliki biloks -2.",
      };
    }
  }

  // Check Halogens (Cl, Br, I) if binary without O or F (e.g. NaCl, FeCl3, KI, HCl)
  for (const hal of ["Cl", "Br", "I"]) {
    if (elements[hal] && !knownBiloks[hal]) {
      // If there is no Oxygen or Fluorine in compound
      if (!elements["O"] && !elements["F"]) {
        knownBiloks[hal] = {
          biloks: -1,
          explanation: `Halogen (${hal}) dalam senyawa halida biner tanpa O/F memiliki biloks -1.`,
        };
      }
    }
  }

  // Now find unknown elements
  const unknowns = elementKeys.filter((el) => !knownBiloks[el]);

  if (unknowns.length === 1) {
    const target = unknowns[0];
    const targetCount = elements[target];

    // Total known sum
    let knownSum = 0;
    const knownEquationParts: string[] = [];

    for (const [el, info] of Object.entries(knownBiloks)) {
      const cnt = elements[el] || 0;
      knownSum += cnt * info.biloks;
      knownEquationParts.push(
        `${cnt} × (${info.biloks > 0 ? "+" : ""}${info.biloks}) [${el}]`
      );
    }

    // targetCount * X + knownSum = charge
    // targetCount * X = charge - knownSum
    // X = (charge - knownSum) / targetCount
    const targetTotal = charge - knownSum;
    const targetBiloks = targetTotal / targetCount;

    // Format explanation
    const sign = targetBiloks > 0 ? "+" : "";
    const algebraExp = `(${targetCount} × biloks ${target}) + [${knownEquationParts.join(" + ")}] = ${charge > 0 ? "+" : ""}${charge}
${targetCount} × biloks ${target} + (${knownSum}) = ${charge}
${targetCount} × biloks ${target} = ${targetTotal}
biloks ${target} = ${sign}${targetBiloks}`;

    knownBiloks[target] = {
      biloks: targetBiloks,
      explanation: algebraExp,
    };
  } else if (unknowns.length > 1) {
    // Multiple unknowns (e.g. complex salts like Fe2(SO4)3 or (NH4)2Cr2O7)
    // Try to resolve common polyatomic radicals: SO4 (-2), NO3 (-1), CO3 (-2), PO4 (-3), OH (-1), NH4 (+1), CN (-1)
    resolvePolyatomicUnknowns(formula, elements, knownBiloks, charge);
  }

  // Populate details
  let equationParts: string[] = [];
  for (const el of elementKeys) {
    const count = elements[el];
    const info = knownBiloks[el] || {
      biloks: 0,
      explanation: `Biloks ${el} diestimasi netral.`,
    };
    const biloks = info.biloks;
    const total = count * biloks;
    details[el] = {
      element: el,
      count,
      biloks,
      totalBiloks: total,
      explanation: info.explanation,
    };
    equationParts.push(`${count} × (${biloks > 0 ? "+" : ""}${biloks})`);
  }

  const overallEquation = `Total: ${equationParts.join(" + ")} = ${charge > 0 ? "+" : ""}${charge}`;

  return {
    formula,
    charge,
    details,
    overallEquation,
  };
}

function resolvePolyatomicUnknowns(
  formula: string,
  elements: Record<string, number>,
  knownBiloks: Record<string, { biloks: number; explanation: string }>,
  charge: number
) {
  // If formula contains sulfate SO4 (e.g. FeSO4, Fe2(SO4)3, CuSO4)
  if (formula.includes("SO4") && elements["Fe"]) {
    // Fe2(SO4)3 -> Fe = +3, S = +6, O = -2
    if (elements["Fe"] === 2 && elements["S"] === 3) {
      knownBiloks["Fe"] = { biloks: 3, explanation: "Ion besi(III) Fe³⁺ dari garam Fe₂(SO₄)₃ memiliki biloks +3." };
      knownBiloks["S"] = { biloks: 6, explanation: "Belerang (S) dalam ion sulfat SO₄²⁻ memiliki biloks +6." };
    } else if (elements["Fe"] === 1 && elements["S"] === 1) {
      knownBiloks["Fe"] = { biloks: 2, explanation: "Ion besi(II) Fe²⁺ dari garam FeSO₄ memiliki biloks +2." };
      knownBiloks["S"] = { biloks: 6, explanation: "Belerang (S) dalam ion sulfat SO₄²⁻ memiliki biloks +6." };
    }
  }

  // If formula contains nitrate NO3 (e.g. Cu(NO3)2)
  if (formula.includes("NO3") && elements["Cu"]) {
    if (elements["Cu"] === 1 && elements["N"] === 2) {
      knownBiloks["Cu"] = { biloks: 2, explanation: "Ion tembaga(II) Cu²⁺ dari garam Cu(NO₃)₂ memiliki biloks +2." };
      knownBiloks["N"] = { biloks: 5, explanation: "Nitrogen (N) dalam ion nitrat NO₃⁻ memiliki biloks +5." };
    }
  }

  // If formula contains ammonium NH4 (e.g. (NH4)2SO4)
  if (formula.includes("NH4")) {
    knownBiloks["N"] = { biloks: -3, explanation: "Nitrogen (N) dalam ion amonium NH₄⁺ memiliki biloks -3." };
  }

  // Solve any remaining single unknown
  const remaining = Object.keys(elements).filter((el) => !knownBiloks[el]);
  if (remaining.length === 1) {
    const target = remaining[0];
    const targetCount = elements[target];
    let knownSum = 0;
    for (const [el, info] of Object.entries(knownBiloks)) {
      knownSum += (elements[el] || 0) * info.biloks;
    }
    const targetTotal = charge - knownSum;
    const targetBiloks = targetTotal / targetCount;
    knownBiloks[target] = {
      biloks: targetBiloks,
      explanation: `Dari kesetimbangan muatan total: biloks ${target} = ${targetBiloks > 0 ? "+" : ""}${targetBiloks}`,
    };
  }
}
