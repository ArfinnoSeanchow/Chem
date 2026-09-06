import React, { useState } from "react";
import { RedoxResult } from "../types/redox";
import { calculateReactionDifficulty, ReactionDifficultyInfo } from "../utils/difficultyCalculator";
import { useTheme } from "../context/ThemeContext";
import { Flame, Info, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DifficultyBadgeProps {
  result: RedoxResult;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ result }) => {
  const { isDark } = useTheme();
  const [showDetails, setShowDetails] = useState(false);

  const diff: ReactionDifficultyInfo = calculateReactionDifficulty(result);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
          diff.badgeColor.bg
        } ${diff.badgeColor.border} ${diff.badgeColor.text}`}
        title="Klik untuk melihat analisis tingkat kesulitan reaksi"
      >
        <Flame className={`w-3.5 h-3.5 ${diff.badgeColor.flameColor}`} />
        <span>{diff.label}</span>
        <span className="text-[11px]">{diff.flames}</span>
        {showDetails ? (
          <ChevronUp className="w-3 h-3 opacity-70" />
        ) : (
          <ChevronDown className="w-3 h-3 opacity-70" />
        )}
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            className={`absolute left-0 mt-2 w-72 sm:w-80 p-3 rounded-xl border shadow-xl z-30 text-xs transition-colors ${
              isDark
                ? "bg-zinc-950 border-zinc-800 text-zinc-200"
                : "bg-white border-zinc-200 text-zinc-800"
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/60 font-bold">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                <span>Analisis Kompleksitas ({diff.score}/10)</span>
              </div>
              <span className={`text-[11px] font-mono ${diff.badgeColor.text}`}>
                {diff.label.split(" ")[0]}
              </span>
            </div>

            <ul className="space-y-1.5 text-[11px] leading-relaxed">
              {diff.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
