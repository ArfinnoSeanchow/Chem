export type ReactionMedium = "acidic" | "basic" | "neutral";
export type RedoxType = "oxidation" | "reduction";

export interface Species {
  raw: string;
  formula: string;
  charge: number;
  coefficient: number;
  elements: Record<string, number>;
  oxidationStates: Record<string, number>;
}

export interface RedoxChange {
  element: string;
  reactantSpecies: string;
  productSpecies: string;
  reactantOxidationState: number;
  productOxidationState: number;
  delta: number;
  atomCount: number;
  electrons: number;
  type: RedoxType;
}

export interface HalfReactionTerm {
  formula: string;
  charge: number;
  coefficient: number;
  role: "main" | "water" | "hydrogen_ion" | "hydroxide" | "electron";
  side: "reactant" | "product";
}

export interface HalfReaction {
  type: RedoxType;
  skeleton: string;
  equation: string;
  electrons: number;
  terms: HalfReactionTerm[];
  steps: HalfReactionStep[];
}

export interface HalfReactionStep {
  number: number;
  title: string;
  equation: string;
  explanation: string;
}

export interface Verification {
  atoms: {
    element: string;
    left: number;
    right: number;
    balanced: boolean;
  }[];
  charge: {
    left: number;
    right: number;
    balanced: boolean;
  };
  electrons: {
    lost: number;
    gained: number;
    balanced: boolean;
  };
  overall: boolean;
}

export interface RedoxResult {
  isValid: boolean;
  originalInput: string;
  medium: ReactionMedium;
  balancedEquation: string;
  reactants: Species[];
  products: Species[];
  redoxChanges: RedoxChange[];
  oxidizingAgents: string[];
  reducingAgents: string[];
  oxidationProducts: string[];
  reductionProducts: string[];
  reactionCategory: "Normal Redox" | "Non-Redox / Acid-Base" | "Autoredoks (Disproporsionasi)" | "Konproporsionasi";
  electronsTransferred: number;
  halfReactions: {
    oxidation?: HalfReaction;
    reduction?: HalfReaction;
  };
  pbo: {
    changes: RedoxChange[];
    electronLCM: number;
    oxidationMultiplier: number;
    reductionMultiplier: number;
  };
  verification: Verification;
  errors: string[];
  warnings: string[];
}
