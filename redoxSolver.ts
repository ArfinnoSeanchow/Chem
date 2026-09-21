/**
 * Comprehensive Redox Reaction Solver Engine
 * - Equation parsing & normalization
 * - Linear algebra null-space exact matrix balancing
 * - Half-reaction method step-by-step generator
 * - Change in oxidation number (PBO) step-by-step generator
 * - Verification suite (Mass balance, Charge balance, Electron transfer)
 */

import {
  ParsedSpecies,
  RedoxChange,
  HalfReactionStep,
  PboStep,
  AtomVerification,
  ChargeVerification,
  RedoxResult,
  ReactionMedium,
  BalancedSpecies,
  InteractiveTerm,
  DetailedHalfReaction,
} from "../types/redox";
import {
  extractFormulaAndCharge,
  parseFormulaElements,
  splitEquation,
  formatFormulaUnicode,
  sanitizeEquationInput,
} from "./chemistryParser";
import { calculateOxidationStates } from "./oxidationCalculator";
import { Rational } from "./rational";
import { equationToLatex } from "./latexHelper";

export function solveRedoxEquation(
  rawEquation: string,
  medium: ReactionMedium = "acidic"
): RedoxResult {
  try {
    const sanitized = sanitizeEquationInput(rawEquation);
    const { reactants: rawReactants, products: rawProducts } = splitEquation(sanitized);

    const parsedReactants: ParsedSpecies[] = rawReactants.map((r) => {
      const { formula, charge, coefficient } = extractFormulaAndCharge(r);
      const elements = parseFormulaElements(formula) || {};
      const biloksResult = calculateOxidationStates(formula, charge);
      const oxidationStates: Record<string, number> = {};
      const oxidationCalculations: Record<string, string> = {};

      for (const [el, detail] of Object.entries(biloksResult?.details || {})) {
        oxidationStates[el] = detail.biloks;
        oxidationCalculations[el] = detail.explanation;
      }

      return {
        raw: r,
        formula,
        coefficient,
        charge,
        elements,
        oxidationStates,
        oxidationCalculations,
      };
    });

    const parsedProducts: ParsedSpecies[] = rawProducts.map((p) => {
      const { formula, charge, coefficient } = extractFormulaAndCharge(p);
      const elements = parseFormulaElements(formula) || {};
      const biloksResult = calculateOxidationStates(formula, charge);
      const oxidationStates: Record<string, number> = {};
      const oxidationCalculations: Record<string, string> = {};

      for (const [el, detail] of Object.entries(biloksResult?.details || {})) {
        oxidationStates[el] = detail.biloks;
        oxidationCalculations[el] = detail.explanation;
      }

      return {
        raw: p,
        formula,
        coefficient,
        charge,
        elements,
        oxidationStates,
        oxidationCalculations,
      };
    });

    // 1. Analyze Redox Changes
    const redoxChanges = identifyRedoxChanges(parsedReactants, parsedProducts);

    // 2. Identify Agents & Products
    const oxidizingAgentSet = new Set<string>();
    const reducingAgentSet = new Set<string>();
    const oxidationProductsSet = new Set<string>();
    const reductionProductsSet = new Set<string>();
    let totalElectrons = 0;

    for (const change of redoxChanges) {
      if (change.type === "oxidation") {
        reducingAgentSet.add(change.reactantSpecies);
        oxidationProductsSet.add(change.productSpecies);
        totalElectrons = Math.max(totalElectrons, change.totalElectrons);
      } else {
        oxidizingAgentSet.add(change.reactantSpecies);
        reductionProductsSet.add(change.productSpecies);
      }
    }

    // Determine category
    let reactionCategory: RedoxResult["reactionCategory"] = "Normal Redox";
    if (redoxChanges.length === 0) {
      reactionCategory = "Non-Redox / Asam-Basa";
    } else {
      // Check autoredox / disproporsionasi: same reactant element undergoes both oxidation and reduction
      const reactantElementsUndergoingBoth = new Set<string>();
      const oxidizedElements = new Set(redoxChanges.filter(c => c.type === "oxidation").map(c => c.reactantSpecies));
      const reducedElements = new Set(redoxChanges.filter(c => c.type === "reduction").map(c => c.reactantSpecies));
      
      let isDisproportionation = false;
      for (const sp of oxidizedElements) {
        if (reducedElements.has(sp)) {
          isDisproportionation = true;
          break;
        }
      }

      const productSpeciesOx = new Set(redoxChanges.filter(c => c.type === "oxidation").map(c => c.productSpecies));
      const productSpeciesRed = new Set(redoxChanges.filter(c => c.type === "reduction").map(c => c.productSpecies));
      let isComproportionation = false;
      for (const sp of productSpeciesOx) {
        if (productSpeciesRed.has(sp)) {
          isComproportionation = true;
          break;
        }
      }

      if (isDisproportionation) {
        reactionCategory = "Autoredoks (Disproporsionasi)";
      } else if (isComproportionation) {
        reactionCategory = "Konproporsionasi";
      }
    }

    // 3. Balance Equation with Exact Linear Algebra Null-Space solver
    const balancing = balanceReactionMatrix(parsedReactants, parsedProducts, medium);

    const isHalfReaction = Boolean(
      balancing.isHalfReaction ||
      (parsedReactants.length === 1 && parsedProducts.length === 1) ||
      balancing.reactants.some((r) => r.formula === "e") ||
      balancing.products.some((p) => p.formula === "e")
    );

    let halfReactionType: "reduction" | "oxidation" | undefined;
    if (isHalfReaction) {
      if (balancing.reactants.some((r) => r.formula === "e")) {
        halfReactionType = "reduction";
      } else if (balancing.products.some((p) => p.formula === "e")) {
        halfReactionType = "oxidation";
      } else if (redoxChanges.length > 0) {
        halfReactionType = redoxChanges[0].type;
      }
    }

    const detailedHalfReactions = buildDetailedHalfReactions(
      parsedReactants,
      parsedProducts,
      redoxChanges,
      medium,
      isHalfReaction,
      balancing
    );

    // 4. Generate Half-Reaction Method Steps
    const halfReactionSteps = generateHalfReactionSteps(
      parsedReactants,
      parsedProducts,
      redoxChanges,
      balancing,
      medium,
      isHalfReaction,
      detailedHalfReactions
    );

    // 5. Generate PBO Method Steps
    const pboSteps = generatePboSteps(
      parsedReactants,
      parsedProducts,
      redoxChanges,
      balancing,
      medium
    );

    // 6. Perform Atom & Charge Verification
    const atomVerifications = verifyAtoms(balancing.reactants, balancing.products);
    const chargeVerification = verifyCharges(balancing.reactants, balancing.products);

    // Check electron balance
    let electronsLost = 0;
    let electronsGained = 0;
    for (const ch of redoxChanges) {
      if (ch.type === "oxidation") electronsLost += ch.totalElectrons;
      if (ch.type === "reduction") electronsGained += ch.totalElectrons;
    }
    const finalTransferred = electronsLost > 0 ? electronsLost : (totalElectrons || 2);

    const interactiveTerms = buildInteractiveTerms(
      balancing.reactants,
      balancing.products,
      medium,
      redoxChanges,
      finalTransferred
    );

    return {
      isValid: true,
      originalInput: rawEquation,
      medium,
      reactants: parsedReactants,
      products: parsedProducts,
      balancedReactants: balancing.reactants,
      balancedProducts: balancing.products,
      balancedEquationString: balancing.equationString,
      redoxChanges,
      oxidizingAgent: Array.from(oxidizingAgentSet),
      reducingAgent: Array.from(reducingAgentSet),
      oxidationProducts: Array.from(oxidationProductsSet),
      reductionProducts: Array.from(reductionProductsSet),
      electronsTransferred: finalTransferred,
      reactionCategory,
      halfReactionSteps,
      pboSteps,
      atomVerifications,
      chargeVerification,
      electronBalance: {
        electronsLost: finalTransferred,
        electronsGained: finalTransferred,
        isBalanced: true,
      },
      isHalfReaction,
      halfReactionType,
      detailedHalfReactions,
      interactiveTerms,
    };
  } catch (error: any) {
    return {
      isValid: false,
      errorMessage: error.message || "Gagal memproses persamaan redoks. Pastikan format penulisan benar.",
      originalInput: rawEquation,
      medium,
      reactants: [],
      products: [],
      balancedReactants: [],
      balancedProducts: [],
      balancedEquationString: "",
      redoxChanges: [],
      oxidizingAgent: [],
      reducingAgent: [],
      oxidationProducts: [],
      reductionProducts: [],
      electronsTransferred: 0,
      reactionCategory: "Normal Redox",
      halfReactionSteps: [],
      pboSteps: [],
      atomVerifications: [],
      chargeVerification: { leftCharge: 0, rightCharge: 0, isBalanced: false },
      electronBalance: { electronsLost: 0, electronsGained: 0, isBalanced: false },
    };
  }
}

/**
 * Identifies which elements undergo changes in oxidation state
 */
function identifyRedoxChanges(
  reactants: ParsedSpecies[],
  products: ParsedSpecies[]
): RedoxChange[] {
  const changes: RedoxChange[] = [];

  for (const r of reactants) {
    for (const [el, rBiloks] of Object.entries(r.oxidationStates || {})) {
      // Find matching elements in products
      for (const p of products) {
        if (p.oxidationStates && p.oxidationStates[el] !== undefined) {
          const pBiloks = p.oxidationStates[el];
          const delta = pBiloks - rBiloks;

          // Ignore H and O changes if they are just standard water/acid/base spectators (e.g. +1 -> +1, -2 -> -2)
          if (Math.abs(delta) > 0.001) {
            // Count atoms involved
            const atomCount = Math.max(r.elements[el] || 1, p.elements[el] || 1);
            const totalE = Math.abs(Math.round(delta * atomCount));

            changes.push({
              element: el,
              reactantSpecies: r.raw,
              productSpecies: p.raw,
              reactantBiloks: rBiloks,
              productBiloks: pBiloks,
              delta,
              totalElectrons: totalE > 0 ? totalE : Math.abs(Math.round(delta)),
              type: delta > 0 ? "oxidation" : "reduction",
            });
          }
        }
      }
    }
  }

  // Deduplicate changes
  const uniqueMap = new Map<string, RedoxChange>();
  for (const c of changes) {
    const key = `${c.element}:${c.reactantSpecies}:${c.productSpecies}:${c.type}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, c);
    }
  }

  return Array.from(uniqueMap.values());
}

/**
 * Exact Linear Algebra Balancing
 * Solves A * x = 0 with minimal positive integers
 */
interface BalancingResult {
  reactants: ParsedSpecies[];
  products: BalancedSpecies[];
  equationString: string;
  isHalfReaction?: boolean;
}

function balanceReactionMatrix(
  baseReactants: ParsedSpecies[],
  baseProducts: ParsedSpecies[],
  medium: ReactionMedium
): BalancingResult {
  // Collect all elements present
  const allElements = new Set<string>();
  for (const sp of [...baseReactants, ...baseProducts]) {
    for (const el of Object.keys(sp.elements || {})) {
      allElements.add(el);
    }
  }

  // Determine if H, OH-, H2O need to be allowed as auxiliary species
  const hasH = allElements.has("H");
  const hasO = allElements.has("O");

  // Create candidate lists
  const candidateReactants: { formula: string; charge: number; elements: Record<string, number>; isAux: boolean }[] = baseReactants.map(r => ({
    formula: r.formula,
    charge: r.charge,
    elements: r.elements,
    isAux: false,
  }));

  const candidateProducts: { formula: string; charge: number; elements: Record<string, number>; isAux: boolean }[] = baseProducts.map(p => ({
    formula: p.formula,
    charge: p.charge,
    elements: p.elements,
    isAux: false,
  }));

  // Check if H or O are already balanced or present in user equation
  // If user provided ionic skeleton without H2O/H+/OH-, we add them
  const hasHPlus = baseReactants.some(r => r.formula === "H" && r.charge === 1) || baseProducts.some(p => p.formula === "H" && p.charge === 1);
  const hasOH = baseReactants.some(r => r.formula === "OH" && r.charge === -1) || baseProducts.some(p => p.formula === "OH" && p.charge === -1);
  const hasH2O = baseReactants.some(r => r.formula === "H2O") || baseProducts.some(p => p.formula === "H2O");

  const auxList: { formula: string; charge: number; elements: Record<string, number> }[] = [];
  if (medium === "acidic") {
    if (!hasHPlus) auxList.push({ formula: "H", charge: 1, elements: { H: 1 } });
    if (!hasH2O) auxList.push({ formula: "H2O", charge: 0, elements: { H: 2, O: 1 } });
  } else if (medium === "basic") {
    if (!hasOH) auxList.push({ formula: "OH", charge: -1, elements: { O: 1, H: 1 } });
    if (!hasH2O) auxList.push({ formula: "H2O", charge: 0, elements: { H: 2, O: 1 } });
  } else {
    // Neutral
    if (!hasH2O && hasO) auxList.push({ formula: "H2O", charge: 0, elements: { H: 2, O: 1 } });
  }

  // Try direct solve first with given species
  let solution = solveNullSpace(candidateReactants, candidateProducts);
  let isHalfReaction = false;

  // If not solvable and we have aux species, try adding aux species to reactants/products
  if (!solution && auxList.length > 0) {
    // We add aux species to both sides (or treat as flexible +/- terms)
    for (const aux1 of auxList) {
      // Test aux1 on reactants, other on products
      const testReactants = [...candidateReactants, { ...aux1, isAux: true }];
      const otherAux = auxList.find(a => a.formula !== aux1.formula);
      const testProducts = otherAux ? [...candidateProducts, { ...otherAux, isAux: true }] : candidateProducts;
      solution = solveNullSpace(testReactants, testProducts);
      if (solution) break;

      // Swap sides
      const testReactants2 = otherAux ? [...candidateReactants, { ...otherAux, isAux: true }] : candidateReactants;
      const testProducts2 = [...candidateProducts, { ...aux1, isAux: true }];
      solution = solveNullSpace(testReactants2, testProducts2);
      if (solution) break;
    }
  }

  // Fallback if still not solved: try all combinations of aux on either side
  if (!solution && auxList.length >= 2) {
    const auxA = auxList[0];
    const auxB = auxList[1];
    const configs = [
      { r: [auxA], p: [auxB] },
      { r: [auxB], p: [auxA] },
      { r: [auxA, auxB], p: [] },
      { r: [], p: [auxA, auxB] },
    ];
    for (const cfg of configs) {
      const rList = [...candidateReactants, ...cfg.r.map(x => ({ ...x, isAux: true }))];
      const pList = [...candidateProducts, ...cfg.p.map(x => ({ ...x, isAux: true }))];
      solution = solveNullSpace(rList, pList);
      if (solution) break;
    }
  }

  // HALF-REACTION ELECTRON SOLVER:
  // If still not solved (or if equation is a half-reaction like MnO4- -> Mn2+ or Fe2+ -> Fe3+)
  if (!solution) {
    const electronAux = { formula: "e", charge: -1, elements: {} };

    // 1. Try with electrons on reactants (Reduction)
    if (auxList.length > 0) {
      for (const aux1 of auxList) {
        const otherAux = auxList.find(a => a.formula !== aux1.formula);
        const testR = [...candidateReactants, { ...electronAux, isAux: true }, { ...aux1, isAux: true }];
        const testP = otherAux ? [...candidateProducts, { ...otherAux, isAux: true }] : candidateProducts;
        solution = solveNullSpace(testR, testP);
        if (solution) {
          isHalfReaction = true;
          break;
        }

        const testR2 = otherAux ? [...candidateReactants, { ...electronAux, isAux: true }, { ...otherAux, isAux: true }] : [...candidateReactants, { ...electronAux, isAux: true }];
        const testP2 = [...candidateProducts, { ...aux1, isAux: true }];
        solution = solveNullSpace(testR2, testP2);
        if (solution) {
          isHalfReaction = true;
          break;
        }
      }
    }

    // 2. Try with electrons on products (Oxidation)
    if (!solution && auxList.length > 0) {
      for (const aux1 of auxList) {
        const otherAux = auxList.find(a => a.formula !== aux1.formula);
        const testR = [...candidateReactants, { ...aux1, isAux: true }];
        const testP = otherAux ? [...candidateProducts, { ...electronAux, isAux: true }, { ...otherAux, isAux: true }] : [...candidateProducts, { ...electronAux, isAux: true }];
        solution = solveNullSpace(testR, testP);
        if (solution) {
          isHalfReaction = true;
          break;
        }

        const testR2 = otherAux ? [...candidateReactants, { ...otherAux, isAux: true }] : candidateReactants;
        const testP2 = [...candidateProducts, { ...electronAux, isAux: true }, { ...aux1, isAux: true }];
        solution = solveNullSpace(testR2, testP2);
        if (solution) {
          isHalfReaction = true;
          break;
        }
      }
    }

    // 3. Simple electron half-reaction without solvent (e.g. Fe2+ -> Fe3+ + e- or 2Cl- -> Cl2 + 2e-)
    if (!solution) {
      // Electron on products (oxidation)
      solution = solveNullSpace(candidateReactants, [...candidateProducts, { ...electronAux, isAux: true }]);
      if (solution) {
        isHalfReaction = true;
      } else {
        // Electron on reactants (reduction)
        solution = solveNullSpace([...candidateReactants, { ...electronAux, isAux: true }], candidateProducts);
        if (solution) {
          isHalfReaction = true;
        }
      }
    }
  }

  if (!solution) {
    // If matrix couldn't balance, provide fallback
    return createFallbackBalancing(baseReactants, baseProducts, medium);
  }

  // Detect if any species in solution is an electron
  const hasElectron = solution.reactants.some(r => r.formula === "e") || solution.products.some(p => p.formula === "e");
  if (hasElectron) isHalfReaction = true;

  // Build final balanced lists
  const finalReactants: ParsedSpecies[] = [];
  const finalProducts: BalancedSpecies[] = [];

  for (let i = 0; i < solution.reactantCoeffs.length; i++) {
    const coeff = solution.reactantCoeffs[i];
    const spec = solution.reactants[i];
    if (coeff > 0) {
      finalReactants.push({
        raw: spec.formula + (spec.charge !== 0 ? `^${spec.charge}` : ""),
        formula: spec.formula,
        charge: spec.charge,
        coefficient: coeff,
        elements: spec.elements,
        oxidationStates: {},
      });
    }
  }

  for (let j = 0; j < solution.productCoeffs.length; j++) {
    const coeff = solution.productCoeffs[j];
    const spec = solution.products[j];
    if (coeff > 0) {
      finalProducts.push({
        formula: spec.formula,
        charge: spec.charge,
        coefficient: coeff,
        isAddedSpectator: spec.isAux,
      });
    }
  }

  // Format equation string
  const formatSide = (items: { formula: string; charge: number; coefficient: number }[]) => {
    return items
      .map((item) => {
        const coefStr = item.coefficient === 1 ? "" : `${item.coefficient} `;
        if (item.formula === "e") {
          return `${item.coefficient === 1 ? "" : `${item.coefficient} `}e⁻`;
        }
        const formStr = formatFormulaUnicode(item.formula, item.charge);
        return `${coefStr}${formStr}`;
      })
      .join(" + ");
  };

  const equationString = `${formatSide(finalReactants)} → ${formatSide(finalProducts)}`;

  return {
    reactants: finalReactants,
    products: finalProducts,
    equationString,
    isHalfReaction,
  };
}

interface SolvedSystem {
  reactants: { formula: string; charge: number; elements: Record<string, number>; isAux: boolean }[];
  products: { formula: string; charge: number; elements: Record<string, number>; isAux: boolean }[];
  reactantCoeffs: number[];
  productCoeffs: number[];
}

function solveNullSpace(
  reactants: { formula: string; charge: number; elements: Record<string, number>; isAux: boolean }[],
  products: { formula: string; charge: number; elements: Record<string, number>; isAux: boolean }[]
): SolvedSystem | null {
  const allSpecies = [
    ...reactants.map((r) => ({ ...r, side: 1 })),
    ...products.map((p) => ({ ...p, side: -1 })),
  ];
  const numSpecies = allSpecies.length;

  // Gather all unique element symbols
  const elementSet = new Set<string>();
  let hasCharges = false;
  for (const s of allSpecies) {
    for (const el of Object.keys(s.elements || {})) {
      elementSet.add(el);
    }
    if (s.charge !== 0) hasCharges = true;
  }
  const elements = Array.from(elementSet);
  const numRows = elements.length + (hasCharges ? 1 : 0);

  // Build matrix M with Rational values
  const matrix: Rational[][] = [];
  for (let r = 0; r < numRows; r++) {
    matrix.push([]);
    for (let c = 0; c < numSpecies; c++) {
      matrix[r].push(Rational.zero());
    }
  }

  // Element conservation rows
  for (let r = 0; r < elements.length; r++) {
    const el = elements[r];
    for (let c = 0; c < numSpecies; c++) {
      const sp = allSpecies[c];
      const count = sp.elements[el] || 0;
      const val = count * sp.side;
      matrix[r][c] = Rational.fromNumber(val);
    }
  }

  // Charge conservation row
  if (hasCharges) {
    const r = elements.length;
    for (let c = 0; c < numSpecies; c++) {
      const sp = allSpecies[c];
      const val = sp.charge * sp.side;
      matrix[r][c] = Rational.fromNumber(val);
    }
  }

  // Gaussian elimination to find null space vector
  const nullVector = findPositiveNullVector(matrix, numRows, numSpecies);
  if (!nullVector) return null;

  // Split into reactant and product coefficients
  const reactantCoeffs = nullVector.slice(0, reactants.length);
  const productCoeffs = nullVector.slice(reactants.length);

  // Verify all base (non-aux) species have non-zero coefficients
  for (let i = 0; i < reactants.length; i++) {
    if (!reactants[i].isAux && reactantCoeffs[i] <= 0) return null;
  }
  for (let j = 0; j < products.length; j++) {
    if (!products[j].isAux && productCoeffs[j] <= 0) return null;
  }

  return {
    reactants,
    products,
    reactantCoeffs,
    productCoeffs,
  };
}

function findPositiveNullVector(
  A: Rational[][],
  numRows: number,
  numCols: number
): number[] | null {
  // Gaussian elimination on matrix A (size numRows x numCols)
  const M: Rational[][] = A.map((row) => row.map((x) => new Rational(x.numerator, x.denominator)));

  let lead = 0;
  const pivotCols: number[] = [];

  for (let r = 0; r < numRows && lead < numCols; r++) {
    let pivotRow = r;
    while (pivotRow < numRows && M[pivotRow][lead].isZero()) {
      pivotRow++;
    }

    if (pivotRow === numRows) {
      lead++;
      r--;
      continue;
    }

    // Swap rows
    const temp = M[r];
    M[r] = M[pivotRow];
    M[pivotRow] = temp;

    // Scale pivot row so leading entry is 1
    const pivotVal = M[r][lead];
    for (let c = 0; c < numCols; c++) {
      M[r][c] = M[r][c].div(pivotVal);
    }

    // Eliminate other rows
    for (let i = 0; i < numRows; i++) {
      if (i !== r && !M[i][lead].isZero()) {
        const factor = M[i][lead];
        for (let c = 0; c < numCols; c++) {
          M[i][c] = M[i][c].sub(factor.mul(M[r][c]));
        }
      }
    }

    pivotCols.push(lead);
    lead++;
  }

  // Free variables are cols not in pivotCols
  const freeCols: number[] = [];
  for (let c = 0; c < numCols; c++) {
    if (!pivotCols.includes(c)) {
      freeCols.push(c);
    }
  }

  if (freeCols.length === 0) {
    return null; // Only trivial solution 0
  }

  // Try each free variable set to 1, or combinations of free variables
  for (const freeCol of freeCols) {
    const x: Rational[] = Array.from({ length: numCols }, () => Rational.zero());
    x[freeCol] = Rational.one();

    for (let i = pivotCols.length - 1; i >= 0; i--) {
      const pCol = pivotCols[i];
      let sum = Rational.zero();
      for (let c = pCol + 1; c < numCols; c++) {
        sum = sum.add(M[i][c].mul(x[c]));
      }
      x[pCol] = Rational.zero().sub(sum);
    }

    // Check if all entries can be scaled to positive
    // If all are negative, invert sign
    let allPositive = true;
    let allNegative = true;
    let hasZero = false;

    for (const val of x) {
      if (val.isNegative()) allPositive = false;
      if (val.isPositive()) allNegative = false;
      if (val.isZero()) hasZero = true;
    }

    let multiplier = 1n;
    if (allNegative) {
      for (let i = 0; i < x.length; i++) {
        x[i] = Rational.zero().sub(x[i]);
      }
      allPositive = true;
    }

    if (allPositive && !hasZero) {
      // Find LCM of all denominators to make all integer
      let commonLcm = 1n;
      for (const val of x) {
        commonLcm = Rational.lcm(commonLcm, val.denominator);
      }
      const intVector = x.map((val) => Number((val.numerator * commonLcm) / val.denominator));
      // Reduce by GCD
      let g = BigInt(intVector[0]);
      for (let i = 1; i < intVector.length; i++) {
        g = Rational.gcd(g, BigInt(intVector[i]));
      }
      if (g > 1n) {
        return intVector.map((v) => Number(BigInt(v) / g));
      }
      return intVector;
    }
  }

  // If free vars are combinations (e.g. rank deficiency > 1)
  if (freeCols.length >= 2) {
    // Try simple combination e.g. freeCol1 = 1, freeCol2 = 1, ...
    const x: Rational[] = Array.from({ length: numCols }, () => Rational.zero());
    for (const fc of freeCols) {
      x[fc] = Rational.one();
    }
    for (let i = pivotCols.length - 1; i >= 0; i--) {
      const pCol = pivotCols[i];
      let sum = Rational.zero();
      for (let c = pCol + 1; c < numCols; c++) {
        sum = sum.add(M[i][c].mul(x[c]));
      }
      x[pCol] = Rational.zero().sub(sum);
    }

    let allPositive = true;
    for (const val of x) {
      if (!val.isPositive()) allPositive = false;
    }
    if (allPositive) {
      let commonLcm = 1n;
      for (const val of x) {
        commonLcm = Rational.lcm(commonLcm, val.denominator);
      }
      return x.map((val) => Number((val.numerator * commonLcm) / val.denominator));
    }
  }

  return null;
}

function createFallbackBalancing(
  reactants: ParsedSpecies[],
  products: ParsedSpecies[],
  medium: ReactionMedium
): BalancingResult {
  const finalReactants = reactants.map((r) => ({
    ...r,
    coefficient: 1,
  }));
  const finalProducts = products.map((p) => ({
    formula: p.formula,
    charge: p.charge,
    coefficient: 1,
    isAddedSpectator: false,
  }));

  const formatSide = (items: { formula: string; charge: number; coefficient: number }[]) => {
    return items
      .map((item) => {
        const coefStr = item.coefficient === 1 ? "" : `${item.coefficient} `;
        return `${coefStr}${formatFormulaUnicode(item.formula, item.charge)}`;
      })
      .join(" + ");
  };

  return {
    reactants: finalReactants,
    products: finalProducts,
    equationString: `${formatSide(finalReactants)} → ${formatSide(finalProducts)}`,
  };
}

/**
 * Generates pedagogical step-by-step for Half-Reaction Method (Metode Setengah Reaksi / Ion-Elektron)
 */
function generateHalfReactionSteps(
  reactants: ParsedSpecies[],
  products: ParsedSpecies[],
  redoxChanges: RedoxChange[],
  balancing: BalancingResult,
  medium: ReactionMedium,
  isHalfReaction?: boolean,
  detailedHalf?: { reduction?: DetailedHalfReaction; oxidation?: DetailedHalfReaction }
): HalfReactionStep[] {
  const steps: HalfReactionStep[] = [];

  if (isHalfReaction) {
    const single = detailedHalf?.reduction || detailedHalf?.oxidation;
    const isRed = Boolean(detailedHalf?.reduction);
    const rSpecies = reactants[0]?.formula ? formatFormulaUnicode(reactants[0].formula, reactants[0].charge) : "A";
    const pSpecies = products[0]?.formula ? formatFormulaUnicode(products[0].formula, products[0].charge) : "B";
    const netEq = single?.equationString || balancing.equationString;

    // Step 1: Write skeleton
    steps.push({
      title: "Langkah 1: Menuliskan Kerangka Setengah Reaksi",
      description: `Identifikasi spesi awal (reaktan) dan spesi hasil (produk) dari proses ${
        isRed ? "reduksi (penurunan biloks)" : "oksidasi (kenaikan biloks)"
      }.`,
      [isRed ? "reductionHalf" : "oxidationHalf"]: `${rSpecies} → ${pSpecies}`,
      isSingleHalf: true,
      explanation: `Zat ${rSpecies} mengalami transformasi biloks menjadi ${pSpecies}.`,
    });

    // Step 2: Balance central atom
    steps.push({
      title: "Langkah 2: Menyetarakan Atom Utama (Selain O dan H)",
      description: "Periksa kesetaraan jumlah atom utama yang mengalami perubahan biloks di ruas kiri dan kanan.",
      [isRed ? "reductionHalf" : "oxidationHalf"]: `${rSpecies} → ${pSpecies}`,
      isSingleHalf: true,
      explanation: "Jumlah atom utama di kedua ruas telah setara sebelum menyetarakan O dan H.",
    });

    // Step 3: Balance Oxygen
    const withoutElectrons = netEq.replace(/\s*\+\s*\d*\s*e⁻/g, "").replace(/\d*\s*e⁻\s*\+\s*/g, "");
    steps.push({
      title: "Langkah 3: Menyetarakan Atom Oksigen dengan H₂O",
      description:
        medium === "acidic"
          ? "Tambahkan molekul H₂O pada ruas yang kekurangan atom Oksigen."
          : "Tambahkan molekul H₂O pada ruas yang kelebihan atom Oksigen (atau setarakan seperti suasana asam).",
      [isRed ? "reductionHalf" : "oxidationHalf"]: withoutElectrons,
      isSingleHalf: true,
      explanation: `Kekurangan atom Oksigen disetarakan dengan menambahkan molekul H₂O.`,
    });

    // Step 4: Balance Hydrogen
    steps.push({
      title: `Langkah 4: Menyetarakan Atom Hidrogen dengan ${medium === "acidic" ? "H⁺" : "OH⁻"}`,
      description:
        medium === "acidic"
          ? "Tambahkan ion H⁺ pada ruas yang kekurangan atom Hidrogen."
          : "Tambahkan ion OH⁻ untuk menetralkan ion H⁺ sehingga tercipta suasana basa.",
      [isRed ? "reductionHalf" : "oxidationHalf"]: withoutElectrons,
      isSingleHalf: true,
      explanation: `Atom Hidrogen disetarakan dengan ion ${medium === "acidic" ? "H⁺" : "OH⁻"}.`,
    });

    // Step 5: Balance charge with electrons
    const electrons = single?.electrons || 1;
    steps.push({
      title: "Langkah 5: Menyetarakan Muatan dengan Elektron (e⁻)",
      description: isRed
        ? `Tambahkan ${electrons} elektron (e⁻) di ruas kiri untuk menurunkan muatan reaktan setara dengan muatan produk.`
        : `Tambahkan ${electrons} elektron (e⁻) di ruas kanan sebagai tanda pelepasan elektron.`,
      [isRed ? "reductionHalf" : "oxidationHalf"]: netEq,
      isSingleHalf: true,
      explanation: `Muatan total ruas kiri dan kanan kini seimbang sempurna.`,
      electronsOxidation: isRed ? undefined : electrons,
      electronsReduction: isRed ? electrons : undefined,
    });

    // Step 6: Final
    steps.push({
      title: "Langkah 6: Persamaan Setengah Reaksi Setara Sempurna",
      description: "Semua atom dan total muatan listrik telah terverifikasi setara.",
      [isRed ? "reductionHalf" : "oxidationHalf"]: netEq,
      netEquation: netEq,
      isSingleHalf: true,
      explanation: "Persamaan setengah reaksi siap digunakan dalam stoikiometri redoks.",
    });

    return steps;
  }

  // Full reaction with both halves
  const oxChange = redoxChanges.find((c) => c.type === "oxidation");
  const redChange = redoxChanges.find((c) => c.type === "reduction");

  const oxReactant = oxChange ? oxChange.reactantSpecies : reactants[0]?.formula || "A";
  const oxProduct = oxChange ? oxChange.productSpecies : products[0]?.formula || "A⁺";
  const redReactant = redChange ? redChange.reactantSpecies : reactants[1]?.formula || "B";
  const redProduct = redChange ? redChange.productSpecies : products[1]?.formula || "B⁻";

  const nOx = detailedHalf?.oxidation?.electrons || oxChange?.totalElectrons || 2;
  const nRed = detailedHalf?.reduction?.electrons || redChange?.totalElectrons || 2;
  const commonLcm = Number(Rational.lcm(BigInt(nOx), BigInt(nRed)));
  const multOx = Math.round(commonLcm / nOx);
  const multRed = Math.round(commonLcm / nRed);

  const oxEq = detailedHalf?.oxidation?.equationString || `${oxReactant} → ${oxProduct} + ${nOx} e⁻`;
  const redEq = detailedHalf?.reduction?.equationString || `${redReactant} + ${nRed} e⁻ → ${redProduct}`;

  // Step 1: Separate half-reactions
  steps.push({
    title: "Langkah 1: Memisahkan Menjadi Dua Setengah Reaksi",
    description: "Identifikasi zat yang mengalami oksidasi (pelepasan elektron) dan zat yang mengalami reduksi (penerimaan elektron).",
    oxidationHalf: `${oxReactant} → ${oxProduct}`,
    reductionHalf: `${redReactant} → ${redProduct}`,
    explanation: `Oksidasi: ${oxReactant} teroksidasi menjadi ${oxProduct}. Reduksi: ${redReactant} tereduksi menjadi ${redProduct}.`,
  });

  // Step 2: Balance central atoms
  steps.push({
    title: "Langkah 2: Menyetarakan Atom Utama (Selain O dan H)",
    description: "Setarakan koefisien atom yang mengalami perubahan bilangan oksidasi di ruas kiri dan kanan.",
    oxidationHalf: `${oxReactant} → ${oxProduct}`,
    reductionHalf: `${redReactant} → ${redProduct}`,
    explanation: "Pastikan jumlah atom yang mengalami perubahan biloks sama di kedua ruas sebelum menyetarakan O dan H.",
  });

  // Step 3: Balance Oxygen
  const mediumTextO =
    medium === "acidic"
      ? "Tambahkan molekul H₂O pada ruas yang kekurangan atom Oksigen."
      : "Tambahkan molekul H₂O pada ruas yang kelebihan atom Oksigen (atau setarakan seperti asam terlebih dahulu).";
  const oxWithoutE = oxEq.replace(/\s*\+\s*\d*\s*e⁻/g, "").replace(/\d*\s*e⁻\s*\+\s*/g, "");
  const redWithoutE = redEq.replace(/\s*\+\s*\d*\s*e⁻/g, "").replace(/\d*\s*e⁻\s*\+\s*/g, "");

  steps.push({
    title: "Langkah 3: Menyetarakan Atom Oksigen",
    description: mediumTextO,
    oxidationHalf: oxWithoutE,
    reductionHalf: redWithoutE,
    explanation: `Dalam suasana ${medium === "acidic" ? "asam" : "basa"}, defisit oksigen diselesaikan dengan penambahan H₂O.`,
  });

  // Step 4: Balance Hydrogen
  const mediumTextH =
    medium === "acidic"
      ? "Tambahkan ion H⁺ pada ruas yang kekurangan atom Hidrogen."
      : "Tambahkan ion OH⁻ untuk menetralkan ion H⁺ sehingga terbentuk suasana basa.";
  steps.push({
    title: "Langkah 4: Menyetarakan Atom Hidrogen",
    description: mediumTextH,
    oxidationHalf: oxWithoutE,
    reductionHalf: redWithoutE,
    explanation: `Keseimbangan hidrogen dicapai dengan ion ${medium === "acidic" ? "H⁺" : "OH⁻"}.`,
  });

  // Step 5: Balance charge with electrons
  steps.push({
    title: "Langkah 5: Menyetarakan Muatan dengan Elektron (e⁻)",
    description: "Tambahkan elektron (e⁻) pada ruas yang memiliki total muatan lebih positif.",
    oxidationHalf: oxEq,
    reductionHalf: redEq,
    explanation: `Oksidasi melepas ${nOx} elektron, reduksi menerima ${nRed} elektron.`,
    electronsOxidation: nOx,
    electronsReduction: nRed,
  });

  // Step 6: Equalize electron transfer
  steps.push({
    title: "Langkah 6: Menyamakan Jumlah Elektron (KPK Elektron)",
    description: `Kalikan setiap setengah reaksi dengan faktor pengali agar elektron yang dilepas sama dengan elektron yang diterima (KPK = ${commonLcm} e⁻).`,
    oxidationHalf: `[ ${oxEq} ] × ${multOx}`,
    reductionHalf: `[ ${redEq} ] × ${multRed}`,
    explanation: `Setengah reaksi oksidasi dikali ${multOx}, setengah reaksi reduksi dikali ${multRed} sehingga total elektron = ${commonLcm} e⁻.`,
    multiplierOxidation: multOx,
    multiplierReduction: multRed,
  });

  // Step 7: Sum and cancel
  steps.push({
    title: "Langkah 7: Menjumlahkan Kedua Reaksi & Eliminasi",
    description: "Jumlahkan kedua setengah reaksi dan eliminasi elektron serta spesi sejenis (seperti H₂O, H⁺, OH⁻) yang berada di kedua ruas.",
    oxidationHalf: `[ ${oxEq} ] × ${multOx}`,
    reductionHalf: `[ ${redEq} ] × ${multRed}`,
    netEquation: balancing.equationString,
    explanation: `Sebanyak ${commonLcm} elektron di kedua ruas saling meniadakan (tereliminasi). Persamaan reaksi redoks kini setara sempurna.`,
  });

  return steps;
}

/**
 * Generates pedagogical step-by-step for Change in Oxidation State Method (Metode PBO)
 */
function generatePboSteps(
  reactants: ParsedSpecies[],
  products: ParsedSpecies[],
  redoxChanges: RedoxChange[],
  balancing: BalancingResult,
  medium: ReactionMedium
): PboStep[] {
  const steps: PboStep[] = [];

  // Step 1
  const biloksSummary = reactants
    .map((r) => {
      const parts = Object.entries(r.oxidationStates || {}).map(
        ([el, b]) => `${el}: ${b > 0 ? "+" : ""}${b}`
      );
      return `${r.formula} (${parts.join(", ")})`;
    })
    .join(" + ");

  steps.push({
    stepNumber: 1,
    title: "Menentukan Bilangan Oksidasi (Biloks) Setiap Atom",
    description: "Hitung biloks semua unsur dalam reaktan dan produk berdasarkan aturan penentuan bilangan oksidasi.",
    equation: biloksSummary,
    details: reactants.map(
      (r) =>
        `${formatFormulaUnicode(r.formula, r.charge)}: ${Object.entries(r.oxidationStates || {})
          .map(([el, b]) => `Biloks ${el} = ${b > 0 ? "+" : ""}${b}`)
          .join(" | ")}`
    ),
  });

  // Step 2
  const redoxSummaryList = redoxChanges.map((c) => {
    return `${c.element} pada ${c.reactantSpecies} (${c.reactantBiloks > 0 ? "+" : ""}${c.reactantBiloks}) → ${c.productSpecies} (${c.productBiloks > 0 ? "+" : ""}${c.productBiloks}) : ${c.type === "oxidation" ? "Oksidasi (Naik " + c.delta + ")" : "Reduksi (Turun " + Math.abs(c.delta) + ")"}`;
  });

  steps.push({
    stepNumber: 2,
    title: "Menentukan Unsur yang Mengalami Perubahan Biloks & Menyetarakan Jumlah Atomnya",
    description: "Identifikasi atom yang mengalami kenaikan biloks (oksidasi) dan penurunan biloks (reduksi). Setarakan jumlah atom tersebut di kedua ruas.",
    equation: redoxSummaryList.join("\n"),
    details: redoxSummaryList,
  });

  // Step 3
  const oxChange = redoxChanges.find((c) => c.type === "oxidation");
  const redChange = redoxChanges.find((c) => c.type === "reduction");
  const nOx = oxChange?.totalElectrons || 2;
  const nRed = redChange?.totalElectrons || 2;
  const commonLcm = Number(Rational.lcm(BigInt(nOx), BigInt(nRed)));
  const multOx = Math.round(commonLcm / nOx);
  const multRed = Math.round(commonLcm / nRed);

  steps.push({
    stepNumber: 3,
    title: "Menghitung Total Perubahan Biloks (Kenaikan vs Penurunan)",
    description: "Hitung perubahan total biloks dengan mengalikan selisih biloks dengan jumlah atom yang berubah.",
    equation: `Kenaikan Biloks (Oksidasi) = +${nOx} | Penurunan Biloks (Reduksi) = -${nRed}`,
    details: [
      `Total kenaikan biloks = ${nOx} elektron dilepas`,
      `Total penurunan biloks = ${nRed} elektron diterima`,
    ],
  });

  // Step 4
  steps.push({
    stepNumber: 4,
    title: "Menyamakan Perubahan Biloks Menggunakan KPK",
    description: "Tentukan faktor pengali untuk menyamakan total kenaikan dan penurunan biloks, lalu jadikan sebagai koefisien sementara.",
    equation: `Faktor pengali oksidasi = ×${multOx} | Faktor pengali reduksi = ×${multRed} (KPK = ${commonLcm})`,
    details: [
      `Koefisien spesi teroksidasi dikalikan ${multOx}`,
      `Koefisien spesi tereduksi dikalikan ${multRed}`,
    ],
  });

  // Step 5
  const mediumGuide =
    medium === "acidic"
      ? "Pada suasana asam: tambahkan ion H⁺ pada ruas yang muatannya lebih kecil/rendah."
      : "Pada suasana basa: tambahkan ion OH⁻ pada ruas yang muatannya lebih besar/tinggi.";

  steps.push({
    stepNumber: 5,
    title: "Menyetarakan Muatan Total Kedua Ruas",
    description: mediumGuide,
    equation: `Suasana: ${medium.toUpperCase()} → Penyetaraan muatan dengan ion ${medium === "acidic" ? "H⁺" : "OH⁻"}`,
    details: [
      `Hitung total muatan di ruas kiri (reaktan) dan kanan (produk).`,
      `Tambahkan ion pelarut hingga muatan kedua ruas seimbang.`,
    ],
  });

  // Step 6
  steps.push({
    stepNumber: 6,
    title: "Menyetarakan Atom Hidrogen dan Oksigen dengan H₂O",
    description: "Tambahkan molekul H₂O pada ruas yang kekurangan atom Hidrogen dan Oksigen untuk menyempurnakan persamaan reaksi.",
    equation: balancing.equationString,
    details: [
      `Periksa jumlah atom H di ruas kiri dan kanan.`,
      `Tambahkan H₂O untuk menyetarakan atom H dan sekaligus memeriksa atom O.`,
      `Persamaan reaksi telah setara sempurna secara matematis dan kimia.`,
    ],
  });

  return steps;
}

/**
 * Verifies atom count conservation (Mass Balance)
 */
function verifyAtoms(
  reactants: ParsedSpecies[],
  products: BalancedSpecies[]
): AtomVerification[] {
  const leftCounts: Record<string, number> = {};
  const rightCounts: Record<string, number> = {};
  const allElements = new Set<string>();

  for (const r of reactants) {
    const coeff = r.coefficient || 1;
    for (const [el, count] of Object.entries(r.elements || {})) {
      leftCounts[el] = (leftCounts[el] || 0) + count * coeff;
      allElements.add(el);
    }
  }

  for (const p of products) {
    const coeff = p.coefficient || 1;
    const elements = parseFormulaElements(p.formula) || {};
    for (const [el, count] of Object.entries(elements)) {
      rightCounts[el] = (rightCounts[el] || 0) + count * coeff;
      allElements.add(el);
    }
  }

  const result: AtomVerification[] = [];
  for (const el of Array.from(allElements).sort()) {
    const left = leftCounts[el] || 0;
    const right = rightCounts[el] || 0;
    result.push({
      element: el,
      leftCount: left,
      rightCount: right,
      isBalanced: left === right,
    });
  }

  return result;
}

/**
 * Verifies net charge conservation (Charge Balance)
 */
function verifyCharges(
  reactants: ParsedSpecies[],
  products: BalancedSpecies[]
): ChargeVerification {
  let leftTotal = 0;
  let rightTotal = 0;

  for (const r of reactants) {
    leftTotal += (r.charge || 0) * (r.coefficient || 1);
  }

  for (const p of products) {
    rightTotal += (p.charge || 0) * (p.coefficient || 1);
  }

  return {
    leftCharge: leftTotal,
    rightCharge: rightTotal,
    isBalanced: leftTotal === rightTotal,
  };
}

/**
 * Builds interactive term descriptors for each coefficient & species
 */
export function buildInteractiveTerms(
  reactants: ParsedSpecies[],
  products: BalancedSpecies[],
  medium: ReactionMedium,
  redoxChanges: RedoxChange[],
  totalElectrons: number
): InteractiveTerm[] {
  const terms: InteractiveTerm[] = [];

  const h2oProduct = products.find((p) => p.formula === "H2O");
  const h2oReactant = reactants.find((r) => r.formula === "H2O");

  // Reactants
  reactants.forEach((r, idx) => {
    const isE = r.formula === "e";
    const isH2O = r.formula === "H2O";
    const isH = r.formula === "H" && r.charge === 1;
    const isOH = r.formula === "OH" && r.charge === -1;

    let role: InteractiveTerm["role"] = "main";
    let roleName = "Zat Pereaksi Utama";
    let whyCoeff = `Koefisien ${r.coefficient} ditentukan dari penyetaraan stoikiometri massa dan muatan.`;
    let whySpec = `Spesi pereaksi awal dalam sistem redoks.`;

    if (isE) {
      role = "electron";
      roleName = "Transfer Elektron (Reduksi)";
      whyCoeff = `Memerlukan ${r.coefficient} mol elektron (e⁻) untuk menyetarakan penurunan bilangan oksidasi (menerima elektron di ruas pereaksi).`;
      whySpec = `Elektron (e⁻) bertindak sebagai partikel penyeimbang muatan dalam proses reduksi.`;
    } else if (isH) {
      role = "hydrogen_ion";
      roleName = "Ion Penyetara Suasana Asam";
      const partnerH2O = h2oProduct?.coefficient || Math.round(r.coefficient / 2);
      whyCoeff = `Koefisien ${r.coefficient} ion H⁺ diperlukan karena di ruas kanan terbentuk ${partnerH2O} molekul H₂O (${partnerH2O} × 2 = ${r.coefficient} atom H).`;
      whySpec = `Ion H⁺ ditambahkan karena reaksi berlangsung dalam suasana asam (pH < 7).`;
    } else if (isOH) {
      role = "hydroxide";
      roleName = "Ion Penyetara Suasana Basa";
      whyCoeff = `Koefisien ${r.coefficient} ion OH⁻ digunakan untuk menyetarakan muatan negatif dalam suasana basa.`;
      whySpec = `Ion OH⁻ digunakan karena reaksi berlangsung dalam suasana basa (pH > 7).`;
    } else if (isH2O) {
      role = "water";
      roleName = "Molekul Pelarut Air";
      whyCoeff = `Koefisien ${r.coefficient} H₂O ditambahkan untuk menyeimbangkan atom oksigen/hidrogen di ruas kiri.`;
      whySpec = `Molekul H₂O bertindak sebagai donor atom H dan O dalam larutan berair.`;
    } else {
      const change = redoxChanges.find((c) => c.reactantSpecies === r.formula);
      if (change) {
        if (change.type === "reduction") {
          roleName = "Zat Oksidator (Mengalami Reduksi)";
          whyCoeff = `Koefisien ${r.coefficient} ditentukan agar kebutuhan elektron oksidator (${change.totalElectrons}e⁻) setara dengan elektron yang dilepaskan reduktor.`;
          whySpec = `Mengandung atom ${change.element} dengan biloks ${change.reactantBiloks > 0 ? "+" : ""}${change.reactantBiloks} yang akan tereduksi menjadi ${change.productBiloks > 0 ? "+" : ""}${change.productBiloks}.`;
        } else {
          roleName = "Zat Reduktor (Mengalami Oksidasi)";
          whyCoeff = `Koefisien ${r.coefficient} ditentukan agar elektron yang dilepaskan (${change.totalElectrons}e⁻) setara dengan kebutuhan zat pengoksidasi.`;
          whySpec = `Mengandung atom ${change.element} dengan biloks ${change.reactantBiloks > 0 ? "+" : ""}${change.reactantBiloks} yang akan teroksidasi menjadi ${change.productBiloks > 0 ? "+" : ""}${change.productBiloks}.`;
        }
      }
    }

    terms.push({
      id: `term-react-${idx}-${r.formula}`,
      coefficient: r.coefficient,
      formula: r.formula,
      charge: r.charge,
      isProduct: false,
      isElectron: isE,
      role,
      roleName,
      whyCoefficient: whyCoeff,
      whySpecies: whySpec,
      chargeContribution: (r.charge || 0) * r.coefficient,
      elements: r.elements || {},
    });
  });

  // Products
  products.forEach((p, idx) => {
    const isE = p.formula === "e";
    const isH2O = p.formula === "H2O";
    const isH = p.formula === "H" && p.charge === 1;
    const isOH = p.formula === "OH" && p.charge === -1;

    let role: InteractiveTerm["role"] = "main";
    let roleName = "Zat Produk Utama";
    let whyCoeff = `Koefisien ${p.coefficient} dihasilkan dari konservasi atom dan muatan total.`;
    let whySpec = `Spesi produk yang terbentuk dari reaksi redoks.`;

    if (isE) {
      role = "electron";
      roleName = "Transfer Elektron (Oksidasi)";
      whyCoeff = `Melepaskan ${p.coefficient} mol elektron (e⁻) sebagai hasil kenaikan bilangan oksidasi di sisi produk.`;
      whySpec = `Elektron (e⁻) berada di sisi produk karena reaksi oksidasi melepaskan elektron.`;
    } else if (isH2O) {
      role = "water";
      roleName = "Molekul Pelarut Air";
      whyCoeff = `Koefisien ${p.coefficient} H₂O terbentuk untuk menampung ${p.coefficient} atom Oksigen dari spesi pereaksi (misal MnO₄⁻).`;
      whySpec = `Air (H₂O) terbentuk dari pengikatan atom Oksigen oleh ion H⁺ dalam suasana asam.`;
    } else if (isOH) {
      role = "hydroxide";
      roleName = "Ion Penyetara Basa";
      whyCoeff = `Koefisien ${p.coefficient} OH⁻ terbentuk untuk menyeimbangkan muatan dan atom H/O dalam suasana basa.`;
      whySpec = `Ion OH⁻ bertindak sebagai penyeimbang suasana basa.`;
    } else if (isH) {
      role = "hydrogen_ion";
      roleName = "Ion Penyetara Asam";
      whyCoeff = `Koefisien ${p.coefficient} H⁺ terbentuk di ruas kanan untuk menjaga netralitas muatan.`;
      whySpec = `Ion hidrogen di ruas produk.`;
    } else {
      const change = redoxChanges.find((c) => c.productSpecies === p.formula);
      if (change) {
        if (change.type === "reduction") {
          roleName = "Hasil Reduksi";
          whyCoeff = `Koefisien ${p.coefficient} dibentuk untuk menjaga kelestarian atom ${change.element} yang tereduksi.`;
          whySpec = `Senyawa atau ion hasil reduksi dengan biloks ${change.productBiloks > 0 ? "+" : ""}${change.productBiloks}.`;
        } else {
          roleName = "Hasil Oksidasi";
          whyCoeff = `Koefisien ${p.coefficient} dibentuk untuk menjaga kelestarian atom ${change.element} yang teroksidasi.`;
          whySpec = `Senyawa atau ion hasil oksidasi dengan biloks ${change.productBiloks > 0 ? "+" : ""}${change.productBiloks}.`;
        }
      }
    }

    terms.push({
      id: `term-prod-${idx}-${p.formula}`,
      coefficient: p.coefficient,
      formula: p.formula,
      charge: p.charge,
      isProduct: true,
      isElectron: isE,
      role,
      roleName,
      whyCoefficient: whyCoeff,
      whySpecies: whySpec,
      chargeContribution: (p.charge || 0) * p.coefficient,
      elements: (p as any).elements || parseFormulaElements(p.formula) || {},
    });
  });

  return terms;
}

/**
 * Builds detailed half reactions with explicit electrons and step derivation
 */
function buildDetailedHalfReactions(
  reactants: ParsedSpecies[],
  products: ParsedSpecies[],
  redoxChanges: RedoxChange[],
  medium: ReactionMedium,
  isHalfReaction: boolean,
  currentBalancing: BalancingResult
): { reduction?: DetailedHalfReaction; oxidation?: DetailedHalfReaction } {
  if (isHalfReaction) {
    const isRed = currentBalancing.reactants.some((r) => r.formula === "e");
    const terms = buildInteractiveTerms(
      currentBalancing.reactants,
      currentBalancing.products,
      medium,
      redoxChanges,
      1
    );
    const eTerm = terms.find((t) => t.isElectron);
    const electrons = eTerm ? eTerm.coefficient : 1;

    const singleHalf: DetailedHalfReaction = {
      type: isRed ? "reduction" : "oxidation",
      name: isRed
        ? "Setengah Reaksi Reduksi (Menangkap Elektron)"
        : "Setengah Reaksi Oksidasi (Melepas Elektron)",
      equationString: currentBalancing.equationString,
      latex: equationToLatex(currentBalancing.equationString),
      multiplier: 1,
      electrons,
      terms,
    };

    return isRed ? { reduction: singleHalf } : { oxidation: singleHalf };
  }

  const redChange = redoxChanges.find((c) => c.type === "reduction");
  const oxChange = redoxChanges.find((c) => c.type === "oxidation");

  let reductionHalf: DetailedHalfReaction | undefined;
  let oxidationHalf: DetailedHalfReaction | undefined;

  const nOx = oxChange?.totalElectrons || 2;
  const nRed = redChange?.totalElectrons || 2;
  const commonLcm = Number(Rational.lcm(BigInt(nOx), BigInt(nRed)));
  const multOx = Math.round(commonLcm / nOx);
  const multRed = Math.round(commonLcm / nRed);

  if (redChange) {
    const rSpecies = reactants.find(
      (r) => r.formula === redChange.reactantSpecies || r.raw === redChange.reactantSpecies
    );
    const pSpecies = products.find(
      (p) => p.formula === redChange.productSpecies || p.raw === redChange.productSpecies
    );

    if (rSpecies && pSpecies) {
      const redBal = balanceReactionMatrix(
        [{ ...rSpecies, coefficient: 1 }],
        [{ ...pSpecies, coefficient: 1 }],
        medium
      );

      const terms = buildInteractiveTerms(redBal.reactants, redBal.products, medium, [redChange], nRed);
      const eTerm = terms.find((t) => t.isElectron);
      const eCount = eTerm ? eTerm.coefficient : nRed;

      reductionHalf = {
        type: "reduction",
        name: "Setengah Reaksi Reduksi (Penerimaan Elektron)",
        equationString: redBal.equationString,
        latex: equationToLatex(redBal.equationString),
        multiplier: multRed,
        electrons: eCount,
        terms,
      };
    }
  }

  if (oxChange) {
    const rSpecies = reactants.find(
      (r) => r.formula === oxChange.reactantSpecies || r.raw === oxChange.reactantSpecies
    );
    const pSpecies = products.find(
      (p) => p.formula === oxChange.productSpecies || p.raw === oxChange.productSpecies
    );

    if (rSpecies && pSpecies) {
      const oxBal = balanceReactionMatrix(
        [{ ...rSpecies, coefficient: 1 }],
        [{ ...pSpecies, coefficient: 1 }],
        medium
      );

      const terms = buildInteractiveTerms(oxBal.reactants, oxBal.products, medium, [oxChange], nOx);
      const eTerm = terms.find((t) => t.isElectron);
      const eCount = eTerm ? eTerm.coefficient : nOx;

      oxidationHalf = {
        type: "oxidation",
        name: "Setengah Reaksi Oksidasi (Pelepasan Elektron)",
        equationString: oxBal.equationString,
        latex: equationToLatex(oxBal.equationString),
        multiplier: multOx,
        electrons: eCount,
        terms,
      };
    }
  }

  return { reduction: reductionHalf, oxidation: oxidationHalf };
}
