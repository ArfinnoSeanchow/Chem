import React, { useState, useEffect } from "react";
import { PboStep } from "../types/redox";
import { Hash, CheckCircle2, ChevronDown, ChevronUp, ArrowRight, ArrowLeft, Printer } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";
import { equationToLatex } from "../utils/latexHelper";

interface PboStepsProps {
  steps: PboStep[];
}

export const PboSteps: React.FC<PboStepsProps> = ({ steps }) => {
  const { isDark } = useTheme();

  const [viewMode, setViewMode] = useState<"interactive" | "all">("interactive");
  const [openSteps, setOpenSteps] = useState<Set<number>>(() => new Set([0]));
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
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Hash className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold">
              Metode Perubahan Bilangan Oksidasi (PBO)
            </h3>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-sky-500/10 border-sky-500/30 text-sky-400 dark:text-sky-300">
              {steps.length} Tahapan
            </span>
          </div>
          <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            Buka tiap tahapan satu per satu untuk mengikuti analisis kenaikan dan penurunan biloks.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark
                ? "bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                : "bg-white border-zinc-300 text-zinc-700 hover:text-black hover:bg-zinc-100"
            }`}
            title="Cetak Tahapan PBO untuk Belajar Offline / Simpan PDF"
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

      {/* Step Pills & Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            Progres Pembahasan: Langkah {currentStepIdx + 1} dari {steps.length}
          </span>
          <span className="text-sky-400 font-mono font-bold">
            {Math.round(((currentStepIdx + 1) / steps.length) * 100)}% Selesai
          </span>
        </div>

        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-sky-400"
            animate={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {steps.map((step, idx) => {
            const isOpen = openSteps.has(idx);
            const isCurrent = currentStepIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleStep(idx)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold shrink-0 transition-all cursor-pointer border ${
                  isCurrent
                    ? "bg-sky-400 text-black border-sky-400 shadow-sm"
                    : isOpen
                    ? isDark
                      ? "bg-zinc-900 border-zinc-700 text-sky-400"
                      : "bg-sky-50 border-sky-300 text-sky-700"
                    : isDark
                    ? "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                    : "bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-zinc-800"
                }`}
              >
                Langkah {step.stepNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Cards List */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isFinal = step.stepNumber === steps.length;
          const isOpen = openSteps.has(idx);
          const isFocused = currentStepIdx === idx;
          const equationLines = step.equation.split("\n").filter((l) => l.trim().length > 0);

          return (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.15 }}
              key={step.stepNumber}
              className={`rounded-xl border transition-all overflow-hidden step-card-print ${
                isFocused
                  ? isDark
                    ? "bg-[#0c0d12] border-sky-500/40 ring-1 ring-sky-500/30"
                    : "bg-white border-sky-500 ring-1 ring-sky-500/20 shadow-md"
                  : isFinal
                  ? isDark
                    ? "bg-zinc-900/80 border-zinc-700"
                    : "bg-zinc-100 border-zinc-400"
                  : isDark
                  ? "bg-zinc-950 border-zinc-800"
                  : "bg-white border-zinc-200"
              }`}
            >
              {/* Header */}
              <button
                type="button"
                onClick={() => toggleStep(idx)}
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
                    {isFinal ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.stepNumber}
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

              {/* Body */}
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

                    {/* Equation / Summary Box */}
                    <div
                      className={`ml-0 sm:ml-8 p-3 rounded-lg text-xs font-medium border overflow-x-auto space-y-1.5 ${
                        isDark
                          ? "bg-black border-zinc-800 text-white"
                          : "bg-zinc-50 border-zinc-200 text-black"
                      }`}
                    >
                      {equationLines.map((line, lIdx) => (
                        <div key={lIdx} className="overflow-x-auto py-0.5">
                          <Latex math={equationToLatex(line)} />
                        </div>
                      ))}
                    </div>

                    {step.details && step.details.length > 0 && (
                      <ul className="mt-3 ml-0 sm:ml-8 space-y-1.5 p-2.5 rounded-lg border border-zinc-800/60 bg-zinc-900/20">
                        {step.details.map((d, i) => (
                          <li
                            key={i}
                            className={`text-[11px] flex items-start gap-1.5 ${
                              isDark ? "text-zinc-300" : "text-zinc-600"
                            }`}
                          >
                            <span className="text-sky-400 font-bold">•</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Navigation */}
                    <div className="mt-4 pt-3 border-t border-zinc-800/60 ml-0 sm:ml-8 flex items-center justify-between">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={handlePrevStep}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          idx === 0
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
                        disabled={idx === steps.length - 1}
                        onClick={handleNextStep}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          idx === steps.length - 1
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
