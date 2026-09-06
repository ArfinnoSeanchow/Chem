/**
 * Types for Redox Solver chemistry engine
 */

export type ReactionMedium = "acidic" | "basic" | "neutral";
export type SolvingMethod = "half_reaction" | "oxidation_number";

export interface ParsedElement {
  symbol: string;
  count: number;
  oxidationNumber?: number;
  ruleExplanation?: string;
}

export interface ParsedSpecies {
  raw: string;
  formula: string;
  coefficient: number;
  charge: number;
  elements: Record<string, number>;
  oxidationStates: Record<string, number>;
  oxidationCalculations?: Record<string, string>;
}

export interface RedoxChange {
  element: string;
  reactantSpecies: string;
  productSpecies: string;
  reactantBiloks: number;
  productBiloks: number;
  delta: number;
  totalElectrons: number;
  type: "oxidation" | "reduction";
}

export interface HalfReactionStep {
  title: string;
  description: string;
  oxidationHalf?: string;
  reductionHalf?: string;
  netEquation?: string;
  explanation?: string;
  electronsOxidation?: number;
  electronsReduction?: number;
  multiplierOxidation?: number;
  multiplierReduction?: number;
  isSingleHalf?: boolean;
}

export interface PboStep {
  stepNumber: number;
  title: string;
  description: string;
  equation: string;
  details?: string[];
}

export interface AtomVerification {
  element: string;
  leftCount: number;
  rightCount: number;
  isBalanced: boolean;
}

export interface ChargeVerification {
  leftCharge: number;
  rightCharge: number;
  isBalanced: boolean;
}

export interface RedoxResult {
  isValid: boolean;
  errorMessage?: string;
  originalInput: string;
  medium: ReactionMedium;
  reactants: ParsedSpecies[];
  products: ParsedSpecies[];
  balancedReactants: ParsedSpecies[];
  balancedProducts: BalancedSpecies[];
  balancedEquationString: string;
  
  // Redox details
  redoxChanges: RedoxChange[];
  oxidizingAgent: string[]; // Oksidator (mengalami reduksi)
  reducingAgent: string[];  // Reduktor (mengalami oksidasi)
  oxidationProducts: string[]; // Hasil Oksidasi
  reductionProducts: string[]; // Hasil Reduksi
  electronsTransferred: number;
  reactionCategory: "Normal Redox" | "Autoredoks (Disproporsionasi)" | "Konproporsionasi" | "Non-Redox / Asam-Basa";
  
  // Step by step breakdown
  halfReactionSteps: HalfReactionStep[];
  pboSteps: PboStep[];

  // Verification
  atomVerifications: AtomVerification[];
  chargeVerification: ChargeVerification;
  electronBalance: {
    electronsLost: number;
    electronsGained: number;
    isBalanced: boolean;
  };

  // Half-reaction and interactive coefficient features
  isHalfReaction?: boolean;
  halfReactionType?: "reduction" | "oxidation";
  detailedHalfReactions?: {
    reduction?: DetailedHalfReaction;
    oxidation?: DetailedHalfReaction;
  };
  interactiveTerms?: InteractiveTerm[];
}

export interface InteractiveTerm {
  id: string;
  coefficient: number;
  formula: string;
  charge: number;
  isProduct: boolean;
  isElectron?: boolean;
  role: "main" | "water" | "hydrogen_ion" | "hydroxide" | "electron";
  roleName: string;
  whyCoefficient: string;
  whySpecies: string;
  chargeContribution: number;
  elements: Record<string, number>;
}

export interface DetailedHalfReaction {
  type: "reduction" | "oxidation";
  name: string;
  equationString: string;
  latex: string;
  multiplier: number;
  electrons: number;
  terms: InteractiveTerm[];
}

export interface BalancedSpecies {
  formula: string;
  charge: number;
  coefficient: number;
  isAddedSpectator?: boolean; // e.g. added H+, OH-, or H2O
}

export interface ReactionExample {
  id: string;
  title: string;
  equation: string;
  medium: ReactionMedium;
  category: string;
  description: string;
}
