import { parseFormulaElements } from "./formula.js";

const FIXED: Record<string, number> = {
  F: -1
};

function isMetalLike(el: string) {
  return ["Li","Na","K","Rb","Cs","Fr","Be","Mg","Ca","Sr","Ba","Ra","Ag","Zn","Cd","Al"].includes(el);
}

function possibleStates(el: string): number[] {
  const common: Record<string, number[]> = {
    H: [1, -1],
    O: [-2, -1, 0],
    Cl: [-1, 1, 3, 5, 7],
    Br: [-1, 1, 3, 5, 7],
    I: [-1, 1, 3, 5, 7],
    S: [-2, 0, 2, 4, 6],
    N: [-3, -2, -1, 0, 1, 2, 3, 4, 5],
    P: [-3, 0, 1, 3, 5],
    C: [-4, -3, -2, -1, 0, 2, 4],
    Fe: [2, 3],
    Cu: [1, 2],
    Mn: [2, 3, 4, 6, 7],
    Cr: [2, 3, 6],
    Co: [2, 3],
    Ni: [2, 3],
    Hg: [1, 2],
    Sn: [2, 4],
    Pb: [2, 4],
    Si: [-4, 0, 4]
  };
  if (FIXED[el] !== undefined) return [FIXED[el]];
  if (isMetalLike(el)) return common[el] || [1, 2, 3];
  return common[el] || [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7];
}

function searchAssignment(elements: Record<string, number>, charge: number): Record<string, number> | null {
  const keys = Object.keys(elements);
  if (keys.length === 0) return {};

  const assignments: Record<string, number> = {};
  const fixedSum = () => Object.entries(assignments).reduce((s, [el, ox]) => s + ox * elements[el], 0);

  // Strong heuristics for common compounds.
  if (elements.O && !elements.F) assignments.O = elements.H && elements.O === 1 && elements.H === 2 ? -2 : -2;
  if (elements.F) assignments.F = -1;
  if (elements.H && !assignments.H) assignments.H = 1;

  const remaining = keys.filter(k => assignments[k] === undefined);
  function dfs(idx: number): boolean {
    if (idx === remaining.length) return fixedSum() === charge;
    const el = remaining[idx];
    for (const ox of possibleStates(el)) {
      assignments[el] = ox;
      const partial = fixedSum();
      const rest = remaining.slice(idx + 1);
      let min = partial, max = partial;
      for (const r of rest) {
        const states = possibleStates(r);
        const vals = states.map(v => v * elements[r]);
        min += Math.min(...vals);
        max += Math.max(...vals);
      }
      if (partial >= min && partial <= max && dfs(idx + 1)) return true;
      delete assignments[el];
    }
    return false;
  }

  return dfs(0) ? { ...assignments } : null;
}

export function calculateOxidationStates(formula: string, charge: number): Record<string, number> {
  const elements = parseFormulaElements(formula);
  const keys = Object.keys(elements);
  // Elemental substances have oxidation state 0 (e.g. Cl2, O2, Fe).
  if (keys.length === 1 && charge === 0) return { [keys[0]]: 0 };
  const result = searchAssignment(elements, charge);
  if (!result) return {};
  return result;
}
