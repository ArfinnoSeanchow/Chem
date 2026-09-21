import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { Scale, Zap, Info, Atom, ShieldCheck } from "lucide-react";

export interface ChemistryTooltipData {
  title?: string;
  roleName?: string;
  species?: string;
  coefficient?: number;
  whyCoefficient?: string;
  whySpecies?: string;
  chargeContribution?: number;
  elements?: Record<string, number>;
}

interface ChemistryTooltipProps {
  children: React.ReactNode;
  data: ChemistryTooltipData;
  position?: "top" | "bottom";
  className?: string;
}

export const ChemistryTooltip: React.FC<ChemistryTooltipProps> = ({
  children,
  data,
  position = "top",
  className = "",
}) => {
  const { isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {children}

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: position === "top" ? 6 : -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === "top" ? 6 : -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-50 w-72 sm:w-80 p-3.5 rounded-xl border text-xs shadow-2xl pointer-events-none transition-colors ${
              position === "top"
                ? "bottom-full left-1/2 -translate-x-1/2 mb-2.5"
                : "top-full left-1/2 -translate-x-1/2 mt-2.5"
            } ${
              isDark
                ? "bg-zinc-950/95 border-zinc-700/80 text-white backdrop-blur-md shadow-black/80"
                : "bg-white border-zinc-300 text-zinc-900 shadow-xl"
            }`}
          >
            {/* Tooltip Header */}
            <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-zinc-800/60">
              <div className="flex items-center gap-1.5 font-extrabold text-[11px] tracking-wider uppercase text-sky-400">
                <Scale className="w-3.5 h-3.5 shrink-0" />
                <span>{data.roleName || data.title || "Analisis Stoikiometri"}</span>
              </div>
              {data.coefficient !== undefined && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                    isDark
                      ? "bg-zinc-800 border-zinc-700 text-amber-300"
                      : "bg-amber-50 border-amber-300 text-amber-900"
                  }`}
                >
                  Koefisien: {data.coefficient}
                </span>
              )}
            </div>

            {/* Why This Coefficient Was Chosen */}
            {data.whyCoefficient && (
              <div className="mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Mengapa koefisien ini?</span>
                </span>
                <p className={`text-[11px] leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                  {data.whyCoefficient}
                </p>
              </div>
            )}

            {/* Why This Chemical Component Exists */}
            {data.whySpecies && (
              <div className="mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-0.5 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  <span>Peran Spesi Kimia:</span>
                </span>
                <p className={`text-[11px] leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  {data.whySpecies}
                </p>
              </div>
            )}

            {/* Micro Details: Charge & Elements */}
            {(data.chargeContribution !== undefined || (data.elements && Object.keys(data.elements).length > 0)) && (
              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-2 text-[10px] font-mono">
                {data.chargeContribution !== undefined && (
                  <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>
                    Muatan:{" "}
                    <strong
                      className={
                        data.chargeContribution > 0
                          ? "text-emerald-400"
                          : data.chargeContribution < 0
                          ? "text-rose-400"
                          : "text-zinc-300"
                      }
                    >
                      {data.chargeContribution > 0 ? "+" : ""}
                      {data.chargeContribution}
                    </strong>
                  </span>
                )}

                {data.elements && Object.keys(data.elements).length > 0 && (
                  <span className={`truncate ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    Atom:{" "}
                    <strong className="text-sky-300">
                      {Object.entries(data.elements)
                        .map(([el, cnt]) => `${el}:${Number(cnt) * (data.coefficient || 1)}`)
                        .join(", ")}
                    </strong>
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
