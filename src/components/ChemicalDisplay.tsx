import React from "react";
import { formatFormulaUnicode } from "../utils/chemistryParser";

interface ChemicalDisplayProps {
  formula: string;
  charge?: number;
  coefficient?: number;
  isOxidizingAgent?: boolean;
  isReducingAgent?: boolean;
  className?: string;
  showBadge?: boolean;
}

export const ChemicalDisplay: React.FC<ChemicalDisplayProps> = ({
  formula,
  charge = 0,
  coefficient = 1,
  isOxidizingAgent,
  isReducingAgent,
  className = "",
  showBadge = false,
}) => {
  const formatted = formatFormulaUnicode(formula, charge);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono ${
        isOxidizingAgent
          ? "text-blue-400 font-semibold"
          : isReducingAgent
          ? "text-amber-400 font-semibold"
          : "text-slate-100"
      } ${className}`}
    >
      {coefficient > 1 && (
        <span className="font-bold text-emerald-400">
          {coefficient}
        </span>
      )}
      <span>{formatted}</span>
      {showBadge && isOxidizingAgent && (
        <span className="text-[9px] uppercase font-sans tracking-wide bg-blue-500/15 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30 font-bold">
          Oksidator
        </span>
      )}
      {showBadge && isReducingAgent && (
        <span className="text-[9px] uppercase font-sans tracking-wide bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">
          Reduktor
        </span>
      )}
    </span>
  );
};
