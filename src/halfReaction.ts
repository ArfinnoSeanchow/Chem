import { ReactionMedium, HalfReaction, HalfReactionStep, HalfReactionTerm, RedoxType } from "./types.js";
import { parseFormulaElements, formatFormula } from "./formula.js";
import { lcm } from "./rational.js";

interface Core {
  reactant: { formula: string; charge: number };
  product: { formula: string; charge: number };
}

function atom(formula: string, element: string) {
  return parseFormulaElements(formula)[element] || 0;
}

function fmt(terms: HalfReactionTerm[]): string {
  return terms
    .filter(t => t.coefficient > 0)
    .map(t => `${t.coefficient === 1 ? "" : t.coefficient + " "}${formatFormula(t.formula, t.charge)}`)
    .join(" + ");
}

function makeTerm(
  formula: string,
  charge: number,
  coefficient: number,
  role: HalfReactionTerm["role"],
  side: HalfReactionTerm["side"]
): HalfReactionTerm {
  return { formula, charge, coefficient, role, side };
}

export function balanceHalfReaction(core: Core, type: RedoxType, medium: ReactionMedium): HalfReaction {
  if (medium === "neutral") {
    throw new Error("Half-reaction balancing requires acidic or basic medium for H/O adjustment.");
  }

  const left: HalfReactionTerm[] = [
    makeTerm(core.reactant.formula, core.reactant.charge, 1, "main", "reactant")
  ];
  const right: HalfReactionTerm[] = [
    makeTerm(core.product.formula, core.product.charge, 1, "main", "product")
  ];

  const steps: HalfReactionStep[] = [
    { number: 1, title: "Kerangka setengah reaksi", equation: `${fmt(left)} → ${fmt(right)}`, explanation: "Pisahkan spesies yang mengalami perubahan bilangan oksidasi." }
  ];

  const allEls = new Set([
    ...Object.keys(parseFormulaElements(core.reactant.formula)),
    ...Object.keys(parseFormulaElements(core.product.formula))
  ]);
  allEls.delete("H");
  allEls.delete("O");

  // Balance the redox-center atom first. For Cr2O7^2- -> Cr3+, for example,
  // the product must become 2 Cr3+ before O/H/charge balancing.
  const centers = [...allEls];
  if (centers.length > 0) {
    const center = centers[0];
    const l = atom(core.reactant.formula, center);
    const r = atom(core.product.formula, center);
    if (l <= 0 || r <= 0) throw new Error(`Redox center ${center} is missing from one side.`);
    const scaleL = l > r ? 1 : r / l;
    const scaleR = l > r ? l / r : 1;
    left[0].coefficient = Math.round(scaleL);
    right[0].coefficient = Math.round(scaleR);
  }

  const oL = left.reduce((s,t) => s + atom(t.formula,"O") * t.coefficient, 0);
  const oR = right.reduce((s,t) => s + atom(t.formula,"O") * t.coefficient, 0);
  if (oL < oR) {
    left.push(makeTerm("H2O", 0, oR - oL, "water", "reactant"));
  } else if (oR < oL) {
    right.push(makeTerm("H2O", 0, oL - oR, "water", "product"));
  }
  steps.push({
    number: 2,
    title: "Menyetarakan oksigen dengan H₂O",
    equation: `${fmt(left)} → ${fmt(right)}`,
    explanation: "Tambahkan H₂O ke sisi yang kekurangan atom O."
  });

  const hL = left.reduce((s, t) => s + atom(t.formula, "H") * t.coefficient, 0);
  const hR = right.reduce((s, t) => s + atom(t.formula, "H") * t.coefficient, 0);

  if (medium === "acidic") {
    if (hL < hR) left.push(makeTerm("H", 1, hR - hL, "hydrogen_ion", "reactant"));
    else if (hR < hL) right.push(makeTerm("H", 1, hL - hR, "hydrogen_ion", "product"));
  } else {
    // First balance H as H+; convert H+ + OH- -> H2O below.
    if (hL < hR) left.push(makeTerm("H", 1, hR - hL, "hydrogen_ion", "reactant"));
    else if (hR < hL) right.push(makeTerm("H", 1, hL - hR, "hydrogen_ion", "product"));
  }

  steps.push({
    number: 3,
    title: medium === "acidic" ? "Menyetarakan hidrogen dengan H⁺" : "Menyetarakan hidrogen sementara dengan H⁺",
    equation: `${fmt(left)} → ${fmt(right)}`,
    explanation: medium === "acidic"
      ? "Tambahkan H⁺ pada sisi yang kekurangan H."
      : "Untuk metode basa yang standar, H⁺ akan dinetralkan oleh OH⁻ pada langkah berikutnya."
  });

  if (medium === "basic") {
    // Standard textbook route: add OH- to both sides for each H+,
    // then combine H+ + OH- -> H2O and cancel common water.
    const leftH = left.filter(t => t.formula === "H" && t.charge === 1).reduce((s,t)=>s+t.coefficient,0);
    const rightH = right.filter(t => t.formula === "H" && t.charge === 1).reduce((s,t)=>s+t.coefficient,0);
    const hPlusCount = leftH + rightH;

    if (hPlusCount > 0) {
      if (leftH > 0) {
        left.push(makeTerm("H2O", 0, leftH, "water", "reactant"));
        // The OH- paired with H+ is consumed; OH- remains only on the opposite side.
        right.push(makeTerm("OH", -1, leftH, "hydroxide", "product"));
      }
      if (rightH > 0) {
        right.push(makeTerm("H2O", 0, rightH, "water", "product"));
        left.push(makeTerm("OH", -1, rightH, "hydroxide", "reactant"));
      }
      for (const side of [left, right]) {
        for (let i = side.length - 1; i >= 0; i--) {
          if (side[i].formula === "H" && side[i].charge === 1) side.splice(i, 1);
        }
      }
      cancelWater(left, right);
    }

    steps.push({
      number: 4,
      title: "Mengubah suasana menjadi basa",
      equation: `${fmt(left)} → ${fmt(right)}`,
      explanation: "Netralisasi H⁺ dengan OH⁻ menghasilkan H₂O, kemudian H₂O yang sama pada kedua ruas dicoret."
    });
  }

  const chargeL = left.reduce((s, t) => s + t.charge * t.coefficient, 0);
  const chargeR = right.reduce((s, t) => s + t.charge * t.coefficient, 0);
  const diff = chargeL - chargeR;

  let electrons = Math.abs(diff);
  if (electrons === 0) electrons = 1;

  if (type === "reduction") {
    if (chargeL > chargeR) right.push(makeTerm("e", -1, Math.abs(diff), "electron", "product"));
    else left.push(makeTerm("e", -1, Math.abs(diff), "electron", "reactant"));
    // The sign above is corrected by direct charge verification below.
    if (!verifyCharge(left, right)) {
      removeElectrons(left, right);
      if (chargeL > chargeR) left.push(makeTerm("e", -1, Math.abs(diff), "electron", "reactant"));
      else right.push(makeTerm("e", -1, Math.abs(diff), "electron", "product"));
    }
  } else {
    if (chargeL > chargeR) left.push(makeTerm("e", -1, Math.abs(diff), "electron", "reactant"));
    else right.push(makeTerm("e", -1, Math.abs(diff), "electron", "product"));
  }

  const finalEquation = `${fmt(left)} → ${fmt(right)}`;
  const finalElectrons = Math.max(
    left.filter(t => t.formula === "e").reduce((s,t) => s+t.coefficient,0),
    right.filter(t => t.formula === "e").reduce((s,t) => s+t.coefficient,0)
  );

  steps.push({
    number: steps.length + 1,
    title: "Menyetarakan muatan dengan elektron",
    equation: finalEquation,
    explanation: `Elektron ditempatkan pada sisi yang diperlukan agar total muatan kedua ruas sama. Transfer = ${finalElectrons} e⁻.`
  });

  return {
    type,
    skeleton: `${formatFormula(core.reactant.formula, core.reactant.charge)} → ${formatFormula(core.product.formula, core.product.charge)}`,
    equation: finalEquation,
    electrons: finalElectrons,
    terms: [...left, ...right],
    steps
  };
}

function normalize(fn: (side: HalfReactionTerm[]) => void) {
  // kept as a hook for future canonicalization
  void fn;
}

function cancelWater(left: HalfReactionTerm[], right: HalfReactionTerm[]) {
  const l = left.find(t => t.formula === "H2O");
  const r = right.find(t => t.formula === "H2O");
  if (!l || !r) return;
  const n = Math.min(l.coefficient, r.coefficient);
  l.coefficient -= n;
  r.coefficient -= n;
}

function removeElectrons(left: HalfReactionTerm[], right: HalfReactionTerm[]) {
  for (const side of [left, right]) {
    for (let i = side.length - 1; i >= 0; i--) {
      if (side[i].formula === "e") side.splice(i, 1);
    }
  }
}

function verifyCharge(left: HalfReactionTerm[], right: HalfReactionTerm[]) {
  return left.reduce((s,t)=>s+t.charge*t.coefficient,0) === right.reduce((s,t)=>s+t.charge*t.coefficient,0);
}
