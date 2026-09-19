import {
  ReactionMedium, RedoxChange, RedoxResult, Species, HalfReaction
} from "./types.js";
import {
  parseSpeciesToken, splitEquation, parseCoefficientToken, formatFormula, parseFormulaElements
} from "./formula.js";
import { calculateOxidationStates } from "./oxidation.js";
import { balanceByMatrix } from "./matrix.js";
import { balanceHalfReaction } from "./halfReaction.js";
import { lcm } from "./rational.js";

export function solveRedoxEquation(rawEquation: string, medium: ReactionMedium = "acidic"): RedoxResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const { left, right } = splitEquation(rawEquation);
    const reactants = left.map(parseSpecies);
    const products = right.map(parseSpecies);

    const redoxChanges = identifyRedoxChanges(reactants, products);
    const category = classifyReaction(redoxChanges);

    const halfReactions: { oxidation?: HalfReaction; reduction?: HalfReaction } = {};
    const oxidation = redoxChanges.find(c => c.type === "oxidation");
    const reduction = redoxChanges.find(c => c.type === "reduction");

    if (oxidation) {
      const r = reactants.find(x => x.formula === oxidation.reactantSpecies);
      const p = products.find(x => x.formula === oxidation.productSpecies);
      if (r && p) {
        try {
          halfReactions.oxidation = balanceHalfReaction(
            { reactant: r, product: p }, "oxidation", medium
          );
        } catch (e) {
          warnings.push(`Oxidation half-reaction could not be generated: ${(e as Error).message}`);
        }
      }
    }

    if (reduction) {
      const r = reactants.find(x => x.formula === reduction.reactantSpecies);
      const p = products.find(x => x.formula === reduction.productSpecies);
      if (r && p) {
        try {
          halfReactions.reduction = balanceHalfReaction(
            { reactant: r, product: p }, "reduction", medium
          );
        } catch (e) {
          warnings.push(`Reduction half-reaction could not be generated: ${(e as Error).message}`);
        }
      }
    }

    const pbo = calculatePbo(redoxChanges);
    const matrix = balanceByMatrix(
      reactants.map(toMatrix),
      products.map(toMatrix)
    );
    const electronTarget = matrix
      ? calculateBalancedElectronTransfer(redoxChanges, reactants, matrix.reactantCoefficients)
      : pbo.electronLCM;

    let balancedEquation = "";

    let verification: ReturnType<typeof verifyEquation>;
    if (matrix) {
      balancedEquation = formatBalanced(reactants, products, matrix.reactantCoefficients, matrix.productCoefficients);
      verification = verifyEquation(
        applyCoefficients(reactants, matrix.reactantCoefficients),
        applyCoefficients(products, matrix.productCoefficients),
        redoxChanges
      );
    } else if (halfReactions.oxidation && halfReactions.reduction) {
      const combined = combineHalfReactions(halfReactions.oxidation, halfReactions.reduction);
      balancedEquation = combined.equation;
      verification = verifyEquation(combined.left, combined.right, redoxChanges);
    } else if (halfReactions.oxidation || halfReactions.reduction) {
      const half = halfReactions.oxidation || halfReactions.reduction!;
      balancedEquation = half.equation;
      verification = verifyHalfReactionTerms(half.terms);
    } else {
      errors.push("No exact positive stoichiometric solution was found for the supplied skeleton.");
      verification = verifyEquation(reactants, products, redoxChanges);
    }

    if (!verification.overall && balancedEquation) {
      errors.push("Internal verification failed: the generated equation does not conserve atoms, charge, or electron transfer.");
    }

    const oxidizingAgents = reduction ? [reduction.reactantSpecies] : [];
    const reducingAgents = oxidation ? [oxidation.reactantSpecies] : [];
    const oxidationProducts = oxidation ? [oxidation.productSpecies] : [];
    const reductionProducts = reduction ? [reduction.productSpecies] : [];

    return {
      isValid: errors.length === 0,
      originalInput: rawEquation,
      medium,
      balancedEquation,
      reactants,
      products,
      redoxChanges,
      oxidizingAgents,
      reducingAgents,
      oxidationProducts,
      reductionProducts,
      reactionCategory: category,
      electronsTransferred: electronTarget,
      halfReactions,
      pbo,
      verification,
      errors,
      warnings
    };
  } catch (e) {
    return {
      isValid: false,
      originalInput: rawEquation,
      medium,
      balancedEquation: "",
      reactants: [],
      products: [],
      redoxChanges: [],
      oxidizingAgents: [],
      reducingAgents: [],
      oxidationProducts: [],
      reductionProducts: [],
      reactionCategory: "Non-Redox / Acid-Base",
      electronsTransferred: 0,
      halfReactions: {},
      pbo: { changes: [], electronLCM: 0, oxidationMultiplier: 0, reductionMultiplier: 0 },
      verification: {
        atoms: [], charge: { left: 0, right: 0, balanced: false },
        electrons: { lost: 0, gained: 0, balanced: false }, overall: false
      },
      errors: [(e as Error).message || "Unable to parse equation."],
      warnings
    };
  }
}

function parseSpecies(token: string): Species {
  const { coefficient, species } = parseCoefficientToken(token);
  const parsed = parseSpeciesToken(species);
  return {
    raw: species,
    formula: parsed.formula,
    charge: parsed.charge,
    coefficient,
    elements: parsed.elements,
    oxidationStates: calculateOxidationStates(parsed.formula, parsed.charge)
  };
}

function identifyRedoxChanges(reactants: Species[], products: Species[]): RedoxChange[] {
  const out: RedoxChange[] = [];

  for (const r of reactants) {
    for (const p of products) {
      const shared = Object.keys(r.elements).filter(el => p.elements[el] !== undefined);
      for (const el of shared) {
        const rox = r.oxidationStates[el];
        const pox = p.oxidationStates[el];
        if (rox === undefined || pox === undefined || rox === pox) continue;

        // Only infer a transformation when the element is present in both
        // species and is the chemically plausible redox center.
        const count = p.elements[el] === r.elements[el] ? r.elements[el] : 1;
        const electrons = Math.abs(pox - rox) * count;
        if (!Number.isInteger(electrons) || electrons <= 0) continue;

        out.push({
          element: el,
          reactantSpecies: r.formula,
          productSpecies: p.formula,
          reactantOxidationState: rox,
          productOxidationState: pox,
          delta: pox - rox,
          atomCount: count,
          electrons,
          type: pox > rox ? "oxidation" : "reduction"
        });
      }
    }
  }

  // Prefer transformations with the largest absolute oxidation-state change
  // per element, preventing spectator H/O transitions from dominating.
  const byElement = new Map<string, RedoxChange[]>();
  for (const c of out) {
    const arr = byElement.get(c.element) || [];
    arr.push(c);
    byElement.set(c.element, arr);
  }
  const selected: RedoxChange[] = [];
  for (const arr of byElement.values()) {
    const max = Math.max(...arr.map(x => Math.abs(x.delta)));
    selected.push(...arr.filter(x => Math.abs(x.delta) === max));
  }
  return dedupeChanges(selected);
}

function dedupeChanges(changes: RedoxChange[]) {
  const map = new Map<string, RedoxChange>();
  for (const c of changes) {
    const key = `${c.element}|${c.reactantSpecies}|${c.productSpecies}|${c.type}`;
    if (!map.has(key)) map.set(key, c);
  }
  return [...map.values()];
}

function classifyReaction(changes: RedoxChange[]): RedoxResult["reactionCategory"] {
  if (!changes.length) return "Non-Redox / Acid-Base";

  const bySource = new Map<string, { ox: boolean; red: boolean }>();
  for (const c of changes) {
    const x = bySource.get(`${c.element}|${c.reactantSpecies}`) || { ox: false, red: false };
    if (c.type === "oxidation") x.ox = true;
    else x.red = true;
    bySource.set(`${c.element}|${c.reactantSpecies}`, x);
  }
  if ([...bySource.values()].some(x => x.ox && x.red)) return "Autoredoks (Disproporsionasi)";

  const products = new Map<string, Set<"oxidation" | "reduction">>();
  for (const c of changes) {
    const set = products.get(`${c.element}|${c.productSpecies}`) || new Set();
    set.add(c.type);
    products.set(`${c.element}|${c.productSpecies}`, set);
  }
  if ([...products.values()].some(s => s.has("oxidation") && s.has("reduction"))) return "Konproporsionasi";
  return "Normal Redox";
}

function calculateBalancedElectronTransfer(changes: RedoxChange[], reactants: Species[], coefficients: number[]): number {
  const ox = changes.filter(c=>c.type==="oxidation").reduce((s,c)=>{
    const i=reactants.findIndex(x=>x.formula===c.reactantSpecies);
    return s+c.electrons*(i>=0?coefficients[i]:1);
  },0);
  const red = changes.filter(c=>c.type==="reduction").reduce((s,c)=>{
    const i=reactants.findIndex(x=>x.formula===c.reactantSpecies);
    return s+c.electrons*(i>=0?coefficients[i]:1);
  },0);
  return ox && red ? Number(lcm(BigInt(ox),BigInt(red))) : Math.max(ox,red);
}

function calculatePbo(changes: RedoxChange[]) {
  const ox = changes.filter(c => c.type === "oxidation").reduce((s,c)=>s+c.electrons,0);
  const red = changes.filter(c => c.type === "reduction").reduce((s,c)=>s+c.electrons,0);
  if (!ox || !red) return {
    changes, electronLCM: Math.max(ox, red),
    oxidationMultiplier: 1, reductionMultiplier: 1
  };
  const target = Number(lcm(BigInt(ox), BigInt(red)));
  return {
    changes,
    electronLCM: target,
    oxidationMultiplier: target / ox,
    reductionMultiplier: target / red
  };
}

function toMatrix(s: Species) {
  return { formula: s.formula, charge: s.charge, elements: s.elements };
}

function formatBalanced(
  reactants: Species[],
  products: Species[],
  rc: number[],
  pc: number[]
) {
  const side = (arr: Species[], cs: number[]) => arr.map((s,i) => `${cs[i] === 1 ? "" : cs[i] + " "}${formatFormula(s.formula,s.charge)}`).join(" + ");
  return `${side(reactants,rc)} → ${side(products,pc)}`;
}

function applyCoefficients(species: Species[], coefficients: number[]): Species[] {
  return species.map((s, i) => ({ ...s, coefficient: coefficients[i] }));
}

function verifyEquation(left: Species[], right: Species[], changes: RedoxChange[]) {
  const els = [...new Set([...left,...right].flatMap(s=>Object.keys(s.elements)))].sort();
  const atoms = els.map(el => {
    const l = left.reduce((s,x)=>s+(x.elements[el] || 0)*x.coefficient,0);
    const r = right.reduce((s,x)=>s+(x.elements[el] || 0)*x.coefficient,0);
    return { element: el, left:l, right:r, balanced:l===r };
  });
  const lc = left.reduce((s,x)=>s+x.charge*x.coefficient,0);
  const rc = right.reduce((s,x)=>s+x.charge*x.coefficient,0);

  const lost = changes.filter(c=>c.type==="oxidation").reduce((s,c)=>{
    const src = left.find(x=>x.formula===c.reactantSpecies);
    return s + c.electrons * (src?.coefficient ?? 1);
  },0);
  const gained = changes.filter(c=>c.type==="reduction").reduce((s,c)=>{
    const src = left.find(x=>x.formula===c.reactantSpecies);
    return s + c.electrons * (src?.coefficient ?? 1);
  },0);

  const atomOk = atoms.every(x=>x.balanced);
  const chargeOk = lc === rc;
  const electronOk = !changes.length || lost === gained;

  return {
    atoms,
    charge: { left: lc, right: rc, balanced: chargeOk },
    electrons: { lost, gained, balanced: electronOk },
    overall: atomOk && chargeOk && electronOk
  };
}

function parseBalancedEquation(eq: string, right = false): Species[] {
  const { left, right: r } = splitEquation(eq);
  const side = right ? r : left;
  return side.map(parseSpecies);
}

function speciesFromHalfTerm(term: import("./types.js").HalfReactionTerm): Species {
  return {
    raw: term.formula,
    formula: term.formula,
    charge: term.charge,
    coefficient: term.coefficient,
    elements: term.formula === "e" ? {} : parseFormulaElements(term.formula),
    oxidationStates: {}
  };
}

function combineHalfReactions(ox: HalfReaction, red: HalfReaction) {
  const oxMult = red.electrons;
  const redMult = ox.electrons;
  const all = new Map<string, { formula:string; charge:number; left:number; right:number }>();

  const add = (t: import("./types.js").HalfReactionTerm, mult:number) => {
    if (t.formula === "e") return;
    const key = `${t.formula}|${t.charge}`;
    const x = all.get(key) || {formula:t.formula, charge:t.charge, left:0, right:0};
    if (t.side === "reactant") x.left += t.coefficient * mult;
    else x.right += t.coefficient * mult;
    all.set(key,x);
  };
  ox.terms.forEach(t=>add(t,oxMult));
  red.terms.forEach(t=>add(t,redMult));

  const left: Species[] = [], right: Species[] = [];
  for (const x of all.values()) {
    const cancel = Math.min(x.left,x.right);
    x.left -= cancel; x.right -= cancel;
    if (x.left) left.push(speciesFromHalfTerm({formula:x.formula,charge:x.charge,coefficient:x.left,role:"main",side:"reactant"}));
    if (x.right) right.push(speciesFromHalfTerm({formula:x.formula,charge:x.charge,coefficient:x.right,role:"main",side:"product"}));
  }
  const fmtSide=(side:Species[])=>side.map(s=>`${s.coefficient===1?"":s.coefficient+" "}${formatFormula(s.formula,s.charge)}`).join(" + ");
  return { equation:`${fmtSide(left)} → ${fmtSide(right)}`, left, right };
}

function verifyHalfReactionTerms(terms: import("./types.js").HalfReactionTerm[]) {
  const left = terms.filter(t=>t.side==="reactant").map(speciesFromHalfTerm);
  const right = terms.filter(t=>t.side==="product").map(speciesFromHalfTerm);
  return verifyEquation(left,right,[]);
}
