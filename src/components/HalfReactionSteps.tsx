import React, { useState, useEffect } from "react";
import { HalfReactionStep } from "../types/redox";
import {
  Layers,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
  Atom,
  Printer,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";
import { equationToLatex, speciesToLatex } from "../utils/latexHelper";
import { ChemistryTooltip, ChemistryTooltipData } from "./ChemistryTooltip";

interface HalfReactionStepsProps {
  steps: HalfReactionStep[];
}

/**
 * Generates contextual tooltip data for chemical terms appearing in steps
 */
function getStepTermTooltip(termStr: string, isOxidation: boolean): ChemistryTooltipData {
  const clean = termStr.trim();
  
  if (clean.includes("e⁻") || clean.includes("e-")) {
    return {
      title: "Elektron Penyetara Muatan",
      roleName: "Elektron Transfer (e⁻)",
      whyCoefficient: isOxidation
        ? "Elektron dilepaskan di ruas kanan untuk menyeimbangkan kenaikan bilangan oksidasi."
        : "Elektron diserap di ruas kiri untuk menetralkan muatan positif reaktan sesuai penurunan biloks.",
      whySpecies: "Elektron berfungsi menjaga kekekalan muatan listrik total dalam reaksi redoks.",
    };
  }

  if (clean.includes("H⁺") || clean.includes("H+")) {
    return {
      title: "Ion Asam Penyetara",
      roleName: "Ion Hidrogen (H⁺)",
      whyCoefficient: "Jumlah ion H⁺ disesuaikan untuk mengikat kelebihan atom Oksigen menjadi molekul air (H₂O).",
      whySpecies: "Hadir dalam suasana asam (pH < 7) untuk menyetarakan atom hidrogen dan muatan.",
    };
  }

  if (clean.includes("OH⁻") || clean.includes("OH-")) {
    return {
      title: "Ion Basa Penyetara",
      roleName: "Ion Hidroksida (OH⁻)",
      whyCoefficient: "Jumlah ion OH⁻ disesuaikan untuk menetralkan muatan atau menyetarakan hidrogen dalam suasana basa.",
      whySpecies: "Hadir dalam suasana basa (pH > 7) sebagai ion donor muatan negatif.",
    };
  }

  if (clean.includes("H₂O") || clean.includes("H2O")) {
    return {
      title: "Molekul Pelarut Air",
      roleName: "Molekul Air (H₂O)",
      whyCoefficient: "Setiap 1 molekul H₂O menyumbangkan 1 atom Oksigen dan 2 atom Hidrogen ke sistem.",
      whySpecies: "Molekul pelarut netral yang digunakan untuk menyetarakan atom oksigen.",
    };
  }

  return {
    title: "Spesi Redoks",
    roleName: isOxidation ? "Komponen Oksidasi" : "Komponen Reduksi",
    whyCoefficient: "Koefisien ditentukan berdasarkan kekekalan atom pusat yang mengalami perubahan bilangan oksidasi.",
    whySpecies: "Zat aktif yang mengalami proses transfer elektron.",
  };
}

/**
 * Breaks down an equation string into hoverable term chips
 */
const StepEquationChips: React.FC<{ equation: string; isOxidation: boolean }> = ({
  equation,
  isOxidation,
}) => {
  const { isDark } = useTheme();

  // Extract meaningful components
  const parts = equation
    .replace(/[\[\]]/g, "")
    .split(/→|->/)
    .map((side) => side.split("+").map((s) => s.trim()).filter(Boolean));

  if (parts.length < 2) return null;

  const reactants = parts[0];
  const products = parts[1];

  return (
    <div className="mt-2 pt-2 border-t border-zinc-800/50 flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-[10px] uppercase font-bold text-zinc-400 mr-1">
        Bedah Spesi:
      </span>

      {reactants.map((r, i) => (
        <ChemistryTooltip key={`r-${i}`} data={getStepTermTooltip(r, isOxidation)}>
          <span
            className={`px-2 py-0.5 rounded-md border font-mono font-bold text-[11px] cursor-pointer transition-all hover:scale-105 ${
              isDark
                ? "bg-zinc-900 border-zinc-700 text-zinc-200 hover:border-sky-400"
                : "bg-white border-zinc-300 text-zinc-800 hover:border-sky-500 shadow-2xs"
            }`}
          >
            {r}
          </span>
        </ChemistryTooltip>
      ))}

      <span className="text-zinc-500 font-bold px-0.5">→</span>

      {products.map((p, i) => (
        <ChemistryTooltip key={`p-${i}`} data={getStepTermTooltip(p, isOxidation)}>
          <span
            className={`px-2 py-0.5 rounded-md border font-mono font-bold text-[11px] cursor-pointer transition-all hover:scale-105 ${
              isDark
                ? "bg-zinc-900 border-zinc-700 text-zinc-200 hover:border-emerald-400"
                : "bg-white border-zinc-300 text-zinc-800 hover:border-emerald-500 shadow-2xs"
            }`}
          >
            {p}
          </span>
        </ChemistryTooltip>
      ))}
    </div>
  );
};

export const HalfReactionSteps: React.FC<HalfReactionStepsProps> = ({ steps }) => {
  const { isDark } = useTheme();

  // Mode: "interactive" (stepper/accordion) or "all" (full expanded)
  const [viewMode, setViewMode] = useState<"interactive" | "all">("interactive");
  // In interactive mode, which steps are open (set of indices)
  const [openSteps, setOpenSteps] = useState<Set<number>>(() => new Set([0]));
  // Current active focus step index
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  const toggleStep = (index: number) => {
    setOpenSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        if (next.size > 1 || viewMode === "all") {
          next.delete(index);
        }
      } else {
        next.add(index);
      }
      return next;
    });
    setCurrentStepIdx(index);
  };

  const handleOpenAll = () => {
    const all = new Set<number>();
    steps.forEach((_, i) => all.add(i));
    setOpenSteps(all);
    setViewMode("all");
  };

  // Automatically expand all steps when printing or generating PDF
  useEffect(() => {
    const handleBeforePrint = () => {
      const all = new Set<number>();
      steps.forEach((_, i) => all.add(i));
      setOpenSteps(all);
    };
    window.addEventListener("beforeprint", handleBeforePrint);
    return () => window.removeEventListener("beforeprint", handleBeforePrint);
  }, [steps]);

  const handleInteractiveMode = () => {
    setViewMode("interactive");
    setOpenSteps(new Set([0]));
    setCurrentStepIdx(0);
  };

  const handleNextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      setOpenSteps((prev) => new Set([...prev, nextIdx]));
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      setOpenSteps((prev) => new Set([...prev, prevIdx]));
    }
  };

  return (
    <div className="space-y-4 font-sans printable-steps-container">
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Layers className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold">
              Metode Setengah Reaksi (Ion-Elektron)
            </h3>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-sky-500/10 border-sky-500/30 text-sky-400 dark:text-sky-300">
              {steps.length} Langkah Eksak
            </span>
          </div>
          <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            Buka tiap langkah satu per satu atau arahkan kursor (hover) ke spesi kimia untuk melihat alasan stoikiometri & muatan.
          </p>
        </div>

        {/* Mode Toggle Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark
                ? "bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                : "bg-white border-zinc-300 text-zinc-700 hover:text-black hover:bg-zinc-100"
            }`}
            title="Cetak Langkah untuk Belajar Offline / Simpan PDF"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span>Cetak Panduan (PDF)</span>
          </button>

          <div
            className={`p-0.5 rounded-lg border flex items-center text-xs ${
              isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-100 border-zinc-300"
            }`}
          >
            <button
              type="button"
              onClick={handleInteractiveMode}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === "interactive"
                  ? isDark
                    ? "bg-white text-black font-bold shadow-xs"
                    : "bg-black text-white font-bold shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Buka Satu-Satu
            </button>
            <button
              type="button"
              onClick={handleOpenAll}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === "all"
                  ? isDark
                    ? "bg-white text-black font-bold shadow-xs"
                    : "bg-black text-white font-bold shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Buka Semua
            </button>
          </div>
        </div>
      </div>

      {/* Step Pills & Progress Bar (Interactive Mode) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            Progres Pembahasan: Langkah {currentStepIdx + 1} dari {steps.length}
          </span>
          <span className="text-sky-400 font-mono font-bold">
            {Math.round(((currentStepIdx + 1) / steps.length) * 100)}% Selesai
          </span>
        </div>

        {/* Step Progress Line */}
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-sky-400"
            animate={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Clickable Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentStepIdx(idx);
                  setOpenSteps(new Set([idx]));
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isCurrent
                    ? isDark
                      ? "bg-sky-400 text-black border-sky-400 shadow-xs"
                      : "bg-sky-600 text-white border-sky-600 shadow-xs"
                    : isCompleted
                    ? isDark
                      ? "bg-zinc-900 text-sky-400 border-zinc-700 hover:bg-zinc-800"
                      : "bg-zinc-100 text-sky-700 border-zinc-300 hover:bg-zinc-200"
                    : isDark
                    ? "bg-zinc-950 text-zinc-500 border-zinc-800"
                    : "bg-white text-zinc-400 border-zinc-200"
                }`}
              >
                Langkah {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion Cards Container */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isOpen = openSteps.has(index);
          const isFinal = index === steps.length - 1;
          const isFocused = currentStepIdx === index;
          const hasOx = Boolean(step.oxidationHalf);
          const hasRed = Boolean(step.reductionHalf);

          return (
            <motion.div
              key={index}
              layout
              className={`rounded-xl border transition-all duration-200 step-card-print ${
                isFinal
                  ? isDark
                    ? "border-emerald-500/50 bg-zinc-950 shadow-md shadow-emerald-500/5"
                    : "border-emerald-300 bg-white shadow-md shadow-emerald-500/10"
                  : isFocused && isOpen
                  ? isDark
                    ? "border-sky-500/50 bg-zinc-950 shadow-sm"
                    : "border-sky-300 bg-white shadow-sm"
                  : isDark
                  ? "border-zinc-800/80 bg-zinc-950/60"
                  : "border-zinc-200 bg-white"
              }`}
            >
              {/* Collapsible Step Header */}
              <button
                type="button"
                onClick={() => toggleStep(index)}
                className={`w-full p-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                  isDark ? "hover:bg-zinc-900/60" : "hover:bg-zinc-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isFinal
                        ? isDark
                          ? "bg-white text-black"
                          : "bg-black text-white"
                        : isOpen
                        ? isDark
                          ? "bg-sky-400 text-black font-bold"
                          : "bg-sky-600 text-white font-bold"
                        : isDark
                        ? "bg-zinc-900 text-white border border-zinc-700"
                        : "bg-zinc-100 text-black border border-zinc-300"
                    }`}
                  >
                    {isFinal ? <CheckCircle className="w-3.5 h-3.5" /> : index + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight">
                      {step.title}
                    </h4>
                    <span className={`text-[11px] block sm:hidden ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                      {isOpen ? "Klik untuk menutup" : "Klik untuk membuka langkah ini"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`hidden sm:inline text-[11px] font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                    {isOpen ? "Tutup" : "Buka Langkah"}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-sky-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 opacity-60" />
                  )}
                </div>
              </button>

              {/* Step Body (Expandable) */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="p-4 pt-0 border-t border-zinc-800/40"
                  >
                    <p className={`text-xs mb-3 mt-3 ml-0 sm:ml-8 ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                      {step.description}
                    </p>

                    {/* Half Reactions Section */}
                    {step.isSingleHalf ? (
                      /* Single Half Reaction Layout (e.g. MnO4- -> Mn2+) */
                      <div className="ml-0 sm:ml-8">
                        <div
                          className={`p-4 rounded-xl border ${
                            isDark ? "bg-black border-zinc-800" : "bg-zinc-50 border-zinc-200"
                          }`}
                        >
                          <span className="text-[10px] uppercase tracking-wider font-bold block mb-1 text-sky-400">
                            {hasRed ? "Setengah Reaksi Reduksi" : "Setengah Reaksi Oksidasi"}
                          </span>
                          <div className="text-sm sm:text-base font-bold py-1 overflow-x-auto">
                            <Latex math={equationToLatex(step.reductionHalf || step.oxidationHalf || "")} />
                          </div>
                          <StepEquationChips
                            equation={step.reductionHalf || step.oxidationHalf || ""}
                            isOxidation={!hasRed}
                          />
                        </div>
                      </div>
                    ) : (
                      /* Two Column Half Reactions (Oxidation & Reduction) */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-0 sm:ml-8">
                        {/* Oxidation Half */}
                        {hasOx && (
                          <div
                            className={`p-3.5 rounded-xl border ${
                              isDark ? "bg-black border-zinc-800" : "bg-zinc-50 border-zinc-200"
                            }`}
                          >
                            <span className="text-[10px] uppercase tracking-wider font-bold block mb-1 text-emerald-400">
                              Setengah Reaksi Oksidasi
                            </span>
                            <div className="text-xs sm:text-sm font-medium overflow-x-auto py-1">
                              <Latex math={equationToLatex(step.oxidationHalf)} />
                            </div>
                            {step.multiplierOxidation && (
                              <div className="text-[11px] font-semibold mt-1.5 pt-1 border-t border-zinc-800 text-sky-400">
                                Faktor Pengali: <Latex math={`\\times ${step.multiplierOxidation}`} />
                              </div>
                            )}
                            <StepEquationChips equation={step.oxidationHalf || ""} isOxidation={true} />
                          </div>
                        )}

                        {/* Reduction Half */}
                        {hasRed && (
                          <div
                            className={`p-3.5 rounded-xl border ${
                              isDark ? "bg-black border-zinc-800" : "bg-zinc-50 border-zinc-200"
                            }`}
                          >
                            <span className="text-[10px] uppercase tracking-wider font-bold block mb-1 text-sky-400">
                              Setengah Reaksi Reduksi
                            </span>
                            <div className="text-xs sm:text-sm font-medium overflow-x-auto py-1">
                              <Latex math={equationToLatex(step.reductionHalf)} />
                            </div>
                            {step.multiplierReduction && (
                              <div className="text-[11px] font-semibold mt-1.5 pt-1 border-t border-zinc-800 text-sky-400">
                                Faktor Pengali: <Latex math={`\\times ${step.multiplierReduction}`} />
                              </div>
                            )}
                            <StepEquationChips equation={step.reductionHalf || ""} isOxidation={false} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Net Equation Card (Visible in Step 7 or Final Step) */}
                    {step.netEquation && (
                      <div className="mt-3 ml-0 sm:ml-8">
                        <div
                          className={`p-4 rounded-xl border ${
                            isDark
                              ? "bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 border-emerald-500/50"
                              : "bg-gradient-to-r from-emerald-50 via-zinc-50 to-white border-emerald-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 text-emerald-400">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Persamaan Reaksi Akhir Setara (Net Ionic)</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                              Setara Sempurna ✓
                            </span>
                          </div>
                          <div className="text-sm sm:text-base font-bold py-1 overflow-x-auto">
                            <Latex math={equationToLatex(step.netEquation)} />
                          </div>
                          <StepEquationChips equation={step.netEquation} isOxidation={false} />
                        </div>
                      </div>
                    )}

                    {step.explanation && (
                      <div
                        className={`mt-3 ml-0 sm:ml-8 p-3 rounded-lg border text-[11px] ${
                          isDark
                            ? "bg-zinc-900/50 border-zinc-800 text-zinc-300"
                            : "bg-amber-50/60 border-amber-200 text-amber-900"
                        }`}
                      >
                        <strong className="text-sky-400 mr-1.5 font-bold">Catatan Penyetaraan:</strong>
                        {step.explanation}
                      </div>
                    )}

                    {/* Step Navigation Controls inside focused step */}
                    <div className="mt-4 pt-3 border-t border-zinc-800/60 ml-0 sm:ml-8 flex items-center justify-between">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={handlePrevStep}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          index === 0
                            ? "opacity-30 cursor-not-allowed text-zinc-500"
                            : isDark
                            ? "bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer"
                            : "bg-zinc-100 hover:bg-zinc-200 text-black cursor-pointer"
                        }`}
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Langkah Sebelumnya</span>
                      </button>

                      <button
                        type="button"
                        disabled={index === steps.length - 1}
                        onClick={handleNextStep}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          index === steps.length - 1
                            ? "opacity-30 cursor-not-allowed text-zinc-500"
                            : isDark
                            ? "bg-white text-black hover:bg-zinc-200 cursor-pointer"
                            : "bg-black text-white hover:bg-zinc-800 cursor-pointer"
                        }`}
                      >
                        <span>Langkah Selanjutnya</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
