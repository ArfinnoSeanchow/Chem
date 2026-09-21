import React, { useState } from "react";
import { RedoxResult, InteractiveTerm } from "../types/redox";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";
import { speciesToLatex, equationToLatex } from "../utils/latexHelper";
import { formatFormulaUnicode } from "../utils/chemistryParser";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  Droplets,
  Plus,
  Minus,
  Info,
  HelpCircle,
  Check,
  Copy,
  Sparkles,
  Scale,
  Atom,
  Layers,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { ChemistryTooltip } from "./ChemistryTooltip";

interface InteractiveEquationProps {
  result: RedoxResult;
  onOpenWhyModal?: (topic: "H2O" | "H+" | "OH-" | "e-" | "coefficient" | "general") => void;
  compact?: boolean;
}

export const InteractiveEquation: React.FC<InteractiveEquationProps> = ({
  result,
  onOpenWhyModal,
  compact = false,
}) => {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"net" | "reduction" | "oxidation">("net");
  const [hoveredTerm, setHoveredTerm] = useState<InteractiveTerm | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<InteractiveTerm | null>(null);
  const [displayType, setDisplayType] = useState<"interactive" | "katex">("interactive");

  // Determine available detailed half-reactions
  const hasReductionHalf = Boolean(result.detailedHalfReactions?.reduction);
  const hasOxidationHalf = Boolean(result.detailedHalfReactions?.oxidation);
  const isSingleHalf = Boolean(result.isHalfReaction);

  // Active terms depending on view mode
  const activeTerms: InteractiveTerm[] = React.useMemo(() => {
    if (viewMode === "reduction" && result.detailedHalfReactions?.reduction) {
      return result.detailedHalfReactions.reduction.terms;
    }
    if (viewMode === "oxidation" && result.detailedHalfReactions?.oxidation) {
      return result.detailedHalfReactions.oxidation.terms;
    }
    return result.interactiveTerms || [];
  }, [viewMode, result]);

  // User-customizable stoichiometric coefficients state
  const [userCoefficients, setUserCoefficients] = useState<Record<string, number>>({});

  // Synchronize initial coefficients when active terms change
  React.useEffect(() => {
    const initial: Record<string, number> = {};
    activeTerms.forEach((t) => {
      initial[t.id] = t.coefficient;
    });
    setUserCoefficients(initial);
  }, [activeTerms]);

  // Check if coefficients have been manually modified
  const isCustomized = React.useMemo(() => {
    return activeTerms.some((t) => (userCoefficients[t.id] ?? t.coefficient) !== t.coefficient);
  }, [activeTerms, userCoefficients]);

  // Reset to ideal balanced coefficients
  const handleReset = () => {
    const initial: Record<string, number> = {};
    activeTerms.forEach((t) => {
      initial[t.id] = t.coefficient;
    });
    setUserCoefficients(initial);
  };

  // Adjust coefficient by delta
  const handleAdjustCoefficient = (termId: string, delta: number) => {
    setUserCoefficients((prev) => {
      const current = prev[termId] ?? 1;
      const next = Math.max(1, Math.min(50, current + delta));
      return { ...prev, [termId]: next };
    });
  };

  // Set coefficient directly
  const handleSetCoefficient = (termId: string, val: number) => {
    setUserCoefficients((prev) => ({
      ...prev,
      [termId]: Math.max(1, Math.min(50, val)),
    }));
  };

  // Live stoichiometric atom balance metrics
  const liveAtoms = React.useMemo(() => {
    const elements = new Set<string>();
    activeTerms.forEach((t) => {
      Object.keys(t.elements || {}).forEach((el) => elements.add(el));
    });

    const rows: { element: string; left: number; right: number; isBalanced: boolean }[] = [];
    Array.from(elements).sort().forEach((el) => {
      let left = 0;
      let right = 0;
      activeTerms.forEach((t) => {
        const coef = userCoefficients[t.id] ?? t.coefficient;
        const count = (t.elements && t.elements[el]) || 0;
        if (t.isProduct) {
          right += coef * count;
        } else {
          left += coef * count;
        }
      });
      rows.push({ element: el, left, right, isBalanced: left === right && left > 0 });
    });
    return rows;
  }, [activeTerms, userCoefficients]);

  // Live charge balance metrics
  const liveCharge = React.useMemo(() => {
    let left = 0;
    let right = 0;
    activeTerms.forEach((t) => {
      const coef = userCoefficients[t.id] ?? t.coefficient;
      const charge = t.isElectron ? -1 : t.charge;
      if (t.isProduct) {
        right += coef * charge;
      } else {
        left += coef * charge;
      }
    });
    return { left, right, isBalanced: left === right };
  }, [activeTerms, userCoefficients]);

  const isLiveFullyBalanced = liveCharge.isBalanced && liveAtoms.every((a) => a.isBalanced);

  // Active equation string (derived from current user coefficients)
  const activeEquationString = React.useMemo(() => {
    const reactantParts: string[] = [];
    const productParts: string[] = [];

    activeTerms.forEach((t) => {
      const coef = userCoefficients[t.id] ?? t.coefficient;
      const coefStr = coef > 1 ? `${coef} ` : "";
      // Preserve ionic charge in the generated equation. The previous implementation
      // used only `t.formula`, which stripped Fe²⁺/Fe³⁺/Mn²⁺/MnO₄⁻/H⁺ charges
      // when switching to KaTeX mode or copying the interactive equation.
      const formulaStr = t.isElectron ? "e⁻" : formatFormulaUnicode(t.formula, t.charge);
      const item = `${coefStr}${formulaStr}`;
      if (t.isProduct) {
        productParts.push(item);
      } else {
        reactantParts.push(item);
      }
    });

    return `${reactantParts.join(" + ")} → ${productParts.join(" + ")}`;
  }, [activeTerms, userCoefficients]);

  // Split active terms into reactants and products
  const reactantTerms = activeTerms.filter((t) => !t.isProduct);
  const productTerms = activeTerms.filter((t) => t.isProduct);

  // Default select first meaningful term if none selected
  React.useEffect(() => {
    if (!selectedTerm && activeTerms.length > 0) {
      const preferred =
        activeTerms.find((t) => t.isElectron) ||
        activeTerms.find((t) => t.role === "hydrogen_ion" || t.role === "hydroxide") ||
        activeTerms.find((t) => t.role === "water") ||
        activeTerms[0];
      setSelectedTerm(preferred || null);
    }
  }, [activeTerms, selectedTerm]);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeEquationString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleBadgeStyle = (role: InteractiveTerm["role"]) => {
    switch (role) {
      case "electron":
        return isDark
          ? "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30"
          : "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200";
      case "hydrogen_ion":
        return isDark
          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30"
          : "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200";
      case "hydroxide":
        return isDark
          ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 hover:bg-indigo-500/30"
          : "bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-200";
      case "water":
        return isDark
          ? "bg-sky-500/20 text-sky-300 border-sky-500/50 hover:bg-sky-500/30"
          : "bg-sky-100 text-sky-900 border-sky-300 hover:bg-sky-200";
      default:
        return isDark
          ? "bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30"
          : "bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200";
    }
  };

  const getRoleIcon = (role: InteractiveTerm["role"]) => {
    switch (role) {
      case "electron":
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case "hydrogen_ion":
        return <Plus className="w-3.5 h-3.5 text-emerald-400" />;
      case "hydroxide":
        return <Minus className="w-3.5 h-3.5 text-indigo-400" />;
      case "water":
        return <Droplets className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Atom className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const activeFocus = hoveredTerm || selectedTerm;

  return (
    <div className="space-y-4">
      {/* Top Bar: View Mode Switcher + Tools */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Mode Tabs (Only if not single half-reaction) */}
        {!isSingleHalf && (hasReductionHalf || hasOxidationHalf) ? (
          <div
            className={`flex items-center p-1 rounded-xl border text-xs font-bold gap-1 ${
              isDark ? "bg-zinc-900/90 border-zinc-800" : "bg-zinc-100 border-zinc-200"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setViewMode("net");
                setSelectedTerm(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "net"
                  ? isDark
                    ? "bg-white text-black shadow-xs font-extrabold"
                    : "bg-white text-black shadow-xs border border-zinc-200 font-extrabold"
                  : isDark
                  ? "text-zinc-400 hover:text-white"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Reaksi Lengkap (Net)</span>
            </button>

            {hasReductionHalf && (
              <button
                type="button"
                onClick={() => {
                  setViewMode("reduction");
                  setSelectedTerm(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "reduction"
                    ? "bg-amber-400 text-black shadow-xs font-extrabold"
                    : isDark
                    ? "text-zinc-400 hover:text-white"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  Reduksi (+ e⁻)
                  {result.detailedHalfReactions?.reduction?.multiplier &&
                    result.detailedHalfReactions.reduction.multiplier > 1 &&
                    ` (×${result.detailedHalfReactions.reduction.multiplier})`}
                </span>
              </button>
            )}

            {hasOxidationHalf && (
              <button
                type="button"
                onClick={() => {
                  setViewMode("oxidation");
                  setSelectedTerm(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "oxidation"
                    ? "bg-purple-400 text-black shadow-xs font-extrabold"
                    : isDark
                    ? "text-zinc-400 hover:text-white"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-purple-600" />
                <span>
                  Oksidasi (+ e⁻)
                  {result.detailedHalfReactions?.oxidation?.multiplier &&
                    result.detailedHalfReactions.oxidation.multiplier > 1 &&
                    ` (×${result.detailedHalfReactions.oxidation.multiplier})`}
                </span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                isDark
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-amber-100 text-amber-800 border-amber-300"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {result.halfReactionType === "oxidation"
                  ? "Setengah Reaksi Oksidasi (Pelepasan Elektron)"
                  : "Setengah Reaksi Reduksi (Penerimaan Elektron)"}
              </span>
            </span>
          </div>
        )}

        {/* Display Mode & Reset & Copy Button */}
        <div className="flex items-center gap-2">
          {isCustomized && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              type="button"
              onClick={handleReset}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                isDark
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30"
                  : "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
              }`}
              title="Kembalikan semua koefisien ke nilai hasil penyetaraan eksak"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Koefisien</span>
            </motion.button>
          )}

          <button
            type="button"
            onClick={() => setDisplayType(displayType === "interactive" ? "katex" : "interactive")}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
              isDark
                ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300"
                : "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700"
            }`}
            title="Ubah antara mode interaktif token atau KaTeX murni"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{displayType === "interactive" ? "KaTeX Murni" : "Mode Interaktif"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
              isDark
                ? "bg-white text-black hover:bg-zinc-200 border-white"
                : "bg-black text-white hover:bg-zinc-800 border-black"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Teks</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Formula Board */}
      <div
        className={`relative p-5 sm:p-6 rounded-2xl border transition-all ${
          isDark
            ? "bg-black/95 border-zinc-800 text-white shadow-inner"
            : "bg-white border-zinc-200 text-black shadow-xs"
        }`}
      >
        {/* Instruction Badge */}
        <div className="flex items-center justify-between gap-2 mb-3 text-[11px] font-mono text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              💡 <strong>Koefisien Interaktif:</strong> Gunakan tombol <strong>[-] / [+]</strong>{" "}
              atau pilih angka untuk menguji hukum kekekalan massa & muatan secara langsung!
            </span>
          </span>
          {activeFocus && (
            <span className="hidden sm:inline-flex items-center gap-1 text-sky-400 font-bold">
              <span>Aktif: {activeFocus.formula}</span>
            </span>
          )}
        </div>

        {displayType === "katex" ? (
          <div className="text-center font-mono py-4 overflow-x-auto">
            <div className="text-lg sm:text-2xl font-bold tracking-wide">
              <Latex displayMode math={equationToLatex(activeEquationString)} />
            </div>
          </div>
        ) : (
          /* Interactive Token Equation View */
          <div className="py-3 px-1 overflow-x-auto">
            <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-4 text-base sm:text-xl font-bold min-w-max sm:min-w-0">
              {/* Reactants */}
              {reactantTerms.map((term, index) => (
                <React.Fragment key={term.id}>
                  {index > 0 && (
                    <span className="text-zinc-400 font-bold select-none text-base sm:text-lg">
                      +
                    </span>
                  )}
                  <InteractiveTermItem
                    term={term}
                    currentCoefficient={userCoefficients[term.id] ?? term.coefficient}
                    onAdjust={(delta) => handleAdjustCoefficient(term.id, delta)}
                    onSet={(val) => handleSetCoefficient(term.id, val)}
                    isSelected={selectedTerm?.id === term.id}
                    isHovered={hoveredTerm?.id === term.id}
                    onHover={() => setHoveredTerm(term)}
                    onLeave={() => setHoveredTerm(null)}
                    onClick={() => setSelectedTerm(term)}
                    isDark={isDark}
                    getRoleBadgeStyle={getRoleBadgeStyle}
                  />
                </React.Fragment>
              ))}

              {/* Reaction Arrow */}
              <div className="px-2 flex items-center justify-center select-none">
                <span
                  className={`px-3 py-1 rounded-xl border font-mono text-sm sm:text-base font-extrabold flex items-center gap-1 shadow-xs ${
                    isDark
                      ? "bg-zinc-900 border-zinc-700 text-sky-300"
                      : "bg-zinc-100 border-zinc-300 text-sky-800"
                  }`}
                  title="Arah reaksi redoks berkesudahan"
                >
                  <span>→</span>
                </span>
              </div>

              {/* Products */}
              {productTerms.map((term, index) => (
                <React.Fragment key={term.id}>
                  {index > 0 && (
                    <span className="text-zinc-400 font-bold select-none text-base sm:text-lg">
                      +
                    </span>
                  )}
                  <InteractiveTermItem
                    term={term}
                    currentCoefficient={userCoefficients[term.id] ?? term.coefficient}
                    onAdjust={(delta) => handleAdjustCoefficient(term.id, delta)}
                    onSet={(val) => handleSetCoefficient(term.id, val)}
                    isSelected={selectedTerm?.id === term.id}
                    isHovered={hoveredTerm?.id === term.id}
                    onHover={() => setHoveredTerm(term)}
                    onLeave={() => setHoveredTerm(null)}
                    onClick={() => setSelectedTerm(term)}
                    isDark={isDark}
                    getRoleBadgeStyle={getRoleBadgeStyle}
                  />
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Live Balance Status Bar (Immediate Feedback on Coefficient Adjustment) */}
        <div
          className={`mt-4 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            isLiveFullyBalanced
              ? isDark
                ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                : "bg-emerald-50 border-emerald-300 text-emerald-900"
              : isDark
              ? "bg-amber-950/30 border-amber-500/40 text-amber-300"
              : "bg-amber-50 border-amber-300 text-amber-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {isLiveFullyBalanced ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>
                  {isLiveFullyBalanced
                    ? "Reaksi Setara Sempurna!"
                    : "Reaksi Belum Setara (Koefisien Berubah)"}
                </span>
                {isCustomized && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Mode Modifikasi Pengguna
                  </span>
                )}
              </div>
              <p className="text-[11px] opacity-90 mt-0.5">
                {isLiveFullyBalanced
                  ? "Semua jenis atom dan total muatan listrik di ruas kiri dan kanan sama persis."
                  : "Sesuaikan kembali koefisien di atas atau klik tombol 'Reset Koefisien' untuk mengembalikan ke jawaban mutlak."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto font-mono text-[11px]">
            <div className="flex items-center gap-1.5">
              <span>Muatan:</span>
              <strong
                className={`px-1.5 py-0.5 rounded border ${
                  liveCharge.isBalanced
                    ? isDark
                      ? "bg-emerald-900/40 border-emerald-700 text-emerald-300"
                      : "bg-emerald-100 border-emerald-300 text-emerald-900"
                    : isDark
                    ? "bg-rose-900/40 border-rose-700 text-rose-300"
                    : "bg-rose-100 border-rose-300 text-rose-900"
                }`}
              >
                {liveCharge.left > 0 ? `+${liveCharge.left}` : liveCharge.left} vs{" "}
                {liveCharge.right > 0 ? `+${liveCharge.right}` : liveCharge.right}{" "}
                {liveCharge.isBalanced ? "✓" : "✗"}
              </strong>
            </div>
          </div>
        </div>

        {/* Real-time Atom Conservation Metric Chips */}
        <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Atom className="w-3.5 h-3.5 text-sky-400" />
            <span>Verifikasi Atom Real-Time:</span>
          </span>
          {liveAtoms.map((a) => (
            <div
              key={a.element}
              className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 font-mono text-[11px] ${
                a.isBalanced
                  ? isDark
                    ? "bg-zinc-900/70 border-zinc-700 text-zinc-300"
                    : "bg-zinc-100 border-zinc-300 text-zinc-800"
                  : isDark
                  ? "bg-rose-950/40 border-rose-600/50 text-rose-300"
                  : "bg-rose-50 border-rose-300 text-rose-800"
              }`}
            >
              <strong className="text-sky-400 font-bold">{a.element}</strong>:
              <span>
                {a.left} vs {a.right}
              </span>
              <span className={a.isBalanced ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                {a.isBalanced ? "✓" : "✗"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Deep-Dive Term Inspector Card (Visible when any term is selected/hovered) */}
      <AnimatePresence mode="wait">
        {activeFocus && (
          <motion.div
            key={activeFocus.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className={`p-5 sm:p-6 rounded-2xl border transition-all ${
              isDark
                ? "bg-zinc-950 border-zinc-700/80 text-white shadow-xl"
                : "bg-zinc-50 border-zinc-300 text-black shadow-sm"
            }`}
          >
            {/* Header Inspector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/60">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-center font-bold ${getRoleBadgeStyle(
                    activeFocus.role
                  )}`}
                >
                  {getRoleIcon(activeFocus.role)}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md border bg-zinc-900 border-zinc-700 text-zinc-300">
                      {activeFocus.isProduct ? "Ruas Produk (Kanan)" : "Ruas Reaktan (Kiri)"}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getRoleBadgeStyle(
                        activeFocus.role
                      )}`}
                    >
                      {activeFocus.roleName}
                    </span>
                  </div>

                  <h4 className="text-lg sm:text-xl font-extrabold tracking-tight mt-1 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <span>Spesi:</span>
                      <span className="text-sky-400 font-mono font-bold inline-flex items-center">
                        {activeFocus.formula === "e" ? (
                          <span>
                            {(userCoefficients[activeFocus.id] ?? activeFocus.coefficient) > 1
                              ? `${userCoefficients[activeFocus.id] ?? activeFocus.coefficient} `
                              : ""}
                            e⁻
                          </span>
                        ) : (
                          <Latex
                            math={`${
                              (userCoefficients[activeFocus.id] ?? activeFocus.coefficient) > 1
                                ? `${userCoefficients[activeFocus.id] ?? activeFocus.coefficient}\\;`
                                : ""
                            }${speciesToLatex(activeFocus.formula, activeFocus.charge)}`}
                          />
                        )}
                      </span>
                    </span>
                    <span className="text-xs font-normal text-zinc-400 font-sans">
                      (Koefisien Aktif:{" "}
                      <strong>{userCoefficients[activeFocus.id] ?? activeFocus.coefficient}</strong>)
                    </span>
                  </h4>
                </div>
              </div>

              {/* Quick Tutor Action */}
              {onOpenWhyModal && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeFocus.role === "water") onOpenWhyModal("H2O");
                    else if (activeFocus.role === "hydrogen_ion") onOpenWhyModal("H+");
                    else if (activeFocus.role === "hydroxide") onOpenWhyModal("OH-");
                    else if (activeFocus.role === "electron") onOpenWhyModal("e-");
                    else onOpenWhyModal("coefficient");
                  }}
                  className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                    isDark
                      ? "bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/40 text-sky-300"
                      : "bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-800"
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                  <span>Buka Penjelasan Lengkap Spesifik</span>
                </button>
              )}
            </div>

            {/* Explanation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
              {/* Box 1: Why This Coefficient */}
              <div
                className={`p-4 rounded-xl border space-y-1.5 ${
                  isDark ? "bg-black/60 border-zinc-800" : "bg-white border-zinc-200"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-400">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Mengapa Koefisien {activeFocus.coefficient}?</span>
                </div>
                <p className="leading-relaxed text-xs sm:text-sm font-medium">
                  {activeFocus.whyCoefficient}
                </p>
              </div>

              {/* Box 2: Why This Species */}
              <div
                className={`p-4 rounded-xl border space-y-1.5 ${
                  isDark ? "bg-black/60 border-zinc-800" : "bg-white border-zinc-200"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-sky-400">
                  <Info className="w-3.5 h-3.5" />
                  <span>Peran Kimia & Suasana:</span>
                </div>
                <p className="leading-relaxed text-xs sm:text-sm font-medium">
                  {activeFocus.whySpecies}
                </p>
              </div>
            </div>

            {/* Micro Details (Charge & Elements) */}
            <div className="mt-4 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-zinc-400">
                  Kontribusi Muatan:{" "}
                  <strong className="text-white font-mono">
                    {userCoefficients[activeFocus.id] ?? activeFocus.coefficient} × (
                    {activeFocus.charge >= 0 ? "+" : ""}
                    {activeFocus.charge}) ={" "}
                    <span
                      className={
                        (userCoefficients[activeFocus.id] ?? activeFocus.coefficient) *
                          activeFocus.charge >
                        0
                          ? "text-emerald-400"
                          : (userCoefficients[activeFocus.id] ?? activeFocus.coefficient) *
                              activeFocus.charge <
                            0
                          ? "text-rose-400"
                          : "text-zinc-400"
                      }
                    >
                      {(userCoefficients[activeFocus.id] ?? activeFocus.coefficient) *
                        activeFocus.charge >
                      0
                        ? "+"
                        : ""}
                      {(userCoefficients[activeFocus.id] ?? activeFocus.coefficient) *
                        activeFocus.charge}
                    </span>
                  </strong>
                </span>

                {Object.keys(activeFocus.elements).length > 0 && (
                  <span className="text-zinc-400">
                    Atom Disumbangkan:{" "}
                    <strong className="text-sky-300 font-mono">
                      {Object.entries(activeFocus.elements)
                        .map(
                          ([el, count]) =>
                            `${el}: ${
                              Number(count) *
                              (userCoefficients[activeFocus.id] ?? activeFocus.coefficient)
                            }`
                        )
                        .join(", ")}
                    </strong>
                  </span>
                )}
              </div>

              <div className="text-[11px] text-zinc-500 font-mono">
                ID Term: {activeFocus.id}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface InteractiveTermItemProps {
  term: InteractiveTerm;
  currentCoefficient: number;
  onAdjust: (delta: number) => void;
  onSet: (val: number) => void;
  isSelected: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  isDark: boolean;
  getRoleBadgeStyle: (role: InteractiveTerm["role"]) => string;
}

const InteractiveTermItem: React.FC<InteractiveTermItemProps> = ({
  term,
  currentCoefficient,
  onAdjust,
  onSet,
  isSelected,
  isHovered,
  onHover,
  onLeave,
  onClick,
  isDark,
  getRoleBadgeStyle,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const isSpecial =
    term.isElectron ||
    term.role === "water" ||
    term.role === "hydrogen_ion" ||
    term.role === "hydroxide";

  const tooltipData = {
    roleName: term.roleName,
    species: term.formula,
    coefficient: currentCoefficient,
    whyCoefficient: term.whyCoefficient,
    whySpecies: term.whySpecies,
    chargeContribution: currentCoefficient * (term.isElectron ? -1 : term.charge),
    elements: term.elements,
  };

  return (
    <ChemistryTooltip data={tooltipData}>
      <div
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        className={`group relative inline-flex items-center gap-1.5 p-1.5 pr-3 rounded-xl border transition-all cursor-pointer select-none ${
          isSelected
            ? isDark
              ? "bg-zinc-800 border-sky-400 shadow-md ring-2 ring-sky-400/40"
              : "bg-sky-50 border-sky-500 shadow-md ring-2 ring-sky-400/30"
            : isHovered
            ? isDark
              ? "bg-zinc-900 border-zinc-500 scale-102"
              : "bg-zinc-100 border-zinc-400 scale-102"
            : isDark
            ? "bg-zinc-950/90 border-zinc-800 hover:border-zinc-700"
            : "bg-white border-zinc-200 hover:border-zinc-300 shadow-2xs"
        }`}
      >
        {/* Interactive Coefficient Stepper / Dropdown Control */}
        <div
          className={`flex items-center rounded-lg border overflow-hidden font-mono text-xs ${
            isDark ? "bg-zinc-900 border-zinc-700" : "bg-zinc-100 border-zinc-300"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decrement Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdjust(-1);
            }}
            disabled={currentCoefficient <= 1}
            className={`w-6 h-7 flex items-center justify-center transition-colors cursor-pointer ${
              currentCoefficient <= 1
                ? "opacity-30 cursor-not-allowed"
                : isDark
                ? "hover:bg-zinc-800 text-zinc-300 hover:text-white"
                : "hover:bg-zinc-200 text-zinc-700 hover:text-black"
            }`}
            title="Kurangi Koefisien (-1)"
          >
            <Minus className="w-3 h-3" />
          </button>

          {/* Direct Value Button (Click to open numbers dropdown) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className={`px-2 h-7 flex items-center justify-center font-extrabold text-sm sm:text-base border-x transition-colors cursor-pointer ${
              isSpecial
                ? getRoleBadgeStyle(term.role)
                : isDark
                ? "border-zinc-700 text-white hover:bg-zinc-800"
                : "border-zinc-300 text-black hover:bg-zinc-200"
            }`}
            title="Klik untuk memilih koefisien langsung"
          >
            <span>{currentCoefficient}</span>
            <ChevronDown className="w-2.5 h-2.5 ml-0.5 opacity-60" />
          </button>

          {/* Increment Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdjust(1);
            }}
            className={`w-6 h-7 flex items-center justify-center transition-colors cursor-pointer ${
              isDark
                ? "hover:bg-zinc-800 text-zinc-300 hover:text-white"
                : "hover:bg-zinc-200 text-zinc-700 hover:text-black"
            }`}
            title="Tambah Koefisien (+1)"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Dropdown Quick Picker for Coefficients (1..16) */}
        {showDropdown && (
          <div
            className={`absolute top-full left-0 mt-1.5 p-2 rounded-xl border shadow-2xl z-50 grid grid-cols-4 gap-1 w-44 ${
              isDark
                ? "bg-zinc-950 border-zinc-700 text-white"
                : "bg-white border-zinc-300 text-black shadow-xl"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="col-span-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 px-1">
              Pilih Koefisien:
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  onSet(num);
                  setShowDropdown(false);
                }}
                className={`py-1 text-xs font-mono font-bold rounded-md border transition-colors cursor-pointer ${
                  currentCoefficient === num
                    ? isDark
                      ? "bg-sky-500 text-black border-sky-400"
                      : "bg-sky-600 text-white border-sky-700"
                    : isDark
                    ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                    : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-800"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        )}

        {/* Chemical Formula (Clickable for Inspector) */}
        <div
          onClick={onClick}
          className="font-mono text-base sm:text-lg font-bold tracking-tight pl-1 cursor-pointer"
        >
          {term.formula === "e" ? (
            <span className="text-amber-400">e⁻</span>
          ) : (
            <Latex math={speciesToLatex(term.formula, term.charge)} />
          )}
        </div>
      </div>
    </ChemistryTooltip>
  );
};
