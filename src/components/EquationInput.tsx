import React, { useState, useRef, useMemo } from "react";
import { ReactionMedium, ReactionExample } from "../types/redox";
import { EXAMPLE_REACTIONS } from "../data/exampleReactions";
import {
  Sparkles,
  RotateCcw,
  Beaker,
  HelpCircle,
  Eye,
  Layers,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Wand2,
  Code2,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChemistryKeypad } from "./ChemistryKeypad";
import { Latex } from "./Latex";
import { equationToLatex } from "../utils/latexHelper";
import { sanitizeEquationInput } from "../utils/chemistryParser";
import { detectAndAutoCorrectFormula, AutoCorrectionResult } from "../utils/formulaAutoCorrector";
import { useTheme } from "../context/ThemeContext";
import { detectEquationMistakes, MistakeDiagnostic } from "../utils/mistakeDetector";
import { detectReactionMedium, AcidBaseDetectionResult } from "../utils/acidBaseDetector";
import { RecentReactions } from "./RecentReactions";

interface EquationInputProps {
  equation: string;
  setEquation: (eq: string) => void;
  medium: ReactionMedium;
  setMedium: (m: ReactionMedium) => void;
  onSolve: () => void;
  onSelectExample: (ex: ReactionExample) => void;
  onOpenPeriodicTable?: () => void;
  onOpenQuiz?: () => void;
  onSelectRecent?: (eq: string, med: ReactionMedium) => void;
  onOpenTextToLatex?: () => void;
}

export const EquationInput: React.FC<EquationInputProps> = ({
  equation,
  setEquation,
  medium,
  setMedium,
  onSolve,
  onSelectExample,
  onOpenPeriodicTable,
  onOpenQuiz,
  onSelectRecent,
  onOpenTextToLatex,
}) => {
  const { isDark } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showExamplesModal, setShowExamplesModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 1800);
  };

  // Formula Auto-Corrector detection
  const autoCorrection: AutoCorrectionResult = useMemo(() => {
    return detectAndAutoCorrectFormula(equation);
  }, [equation]);

  const handleAutoFix = () => {
    if (autoCorrection.hasCorrection && autoCorrection.corrected) {
      setEquation(autoCorrection.corrected);
    } else {
      const fixed = sanitizeEquationInput(equation);
      if (fixed && fixed !== equation) {
        setEquation(fixed);
      }
    }
  };

  // Real-time mistake detection
  const mistake: MistakeDiagnostic | null = useMemo(() => {
    return detectEquationMistakes(equation);
  }, [equation]);

  // Real-time acid/base medium auto-detection
  const acidBaseDetection: AcidBaseDetectionResult = useMemo(() => {
    return detectReactionMedium(equation);
  }, [equation]);

  const handleInsert = (text: string) => {
    const el = inputRef.current;
    if (el) {
      const start = el.selectionStart ?? equation.length;
      const end = el.selectionEnd ?? equation.length;
      const nextVal = equation.slice(0, start) + text + equation.slice(end);
      setEquation(nextVal);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    } else {
      setEquation(equation + text);
    }
  };

  const handleBackspace = () => {
    const el = inputRef.current;
    if (el) {
      const start = el.selectionStart ?? equation.length;
      const end = el.selectionEnd ?? equation.length;
      if (start === end) {
        if (start > 0) {
          const nextVal = equation.slice(0, start - 1) + equation.slice(end);
          setEquation(nextVal);
          setTimeout(() => {
            el.focus();
            el.setSelectionRange(start - 1, start - 1);
          }, 0);
        }
      } else {
        const nextVal = equation.slice(0, start) + equation.slice(end);
        setEquation(nextVal);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start, start);
        }, 0);
      }
    } else {
      setEquation(equation.slice(0, -1));
    }
  };

  const handleClear = () => {
    setEquation("");
    inputRef.current?.focus();
  };

  const categories = ["Semua", "Molekuler / PRD", "Suasana Asam", "Suasana Basa", "Autoredoks", "Konproporsionasi"];
  const filteredExamples = selectedCategory === "Semua"
    ? EXAMPLE_REACTIONS
    : EXAMPLE_REACTIONS.filter((ex) => ex.category.includes(selectedCategory));

  return (
    <div
      className={`border rounded-xl p-6 transition-colors font-sans ${
        isDark
          ? "bg-black border-zinc-800 text-white"
          : "bg-white border-zinc-200 text-black shadow-xs"
      }`}
    >
      {/* Title & Medium Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2
              className={`text-base sm:text-lg font-bold flex items-center gap-2 ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              <Beaker className="w-5 h-5" />
              Input Persamaan Reaksi Redoks
            </h2>

            {onOpenQuiz && (
              <button
                type="button"
                onClick={onOpenQuiz}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <Flame className="w-3 h-3 text-amber-500" />
                <span>Kuis & Latihan</span>
              </button>
            )}
          </div>
          <p
            className={`text-xs mt-0.5 ${
              isDark ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            Gunakan panah <code className="font-mono font-bold px-1 py-0.5 rounded border border-current">-&gt;</code> untuk memisahkan reaktan dan produk.
          </p>
        </div>

        {/* Medium Selector */}
        <div
          className={`flex items-center gap-1 p-1 rounded-lg border transition-colors ${
            isDark
              ? "bg-zinc-950 border-zinc-800"
              : "bg-zinc-100 border-zinc-300"
          }`}
        >
          <span
            className={`text-[10px] uppercase tracking-wider font-semibold px-2 ${
              isDark ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            Suasana:
          </span>
          <button
            type="button"
            onClick={() => setMedium("acidic")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              medium === "acidic"
                ? isDark
                  ? "bg-white text-black"
                  : "bg-black text-white"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            Asam (H⁺)
          </button>
          <button
            type="button"
            onClick={() => setMedium("basic")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              medium === "basic"
                ? isDark
                  ? "bg-white text-black"
                  : "bg-black text-white"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            Basa (OH⁻)
          </button>
          <button
            type="button"
            onClick={() => setMedium("neutral")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              medium === "neutral"
                ? isDark
                  ? "bg-white text-black"
                  : "bg-black text-white"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            Netral
          </button>
        </div>
      </div>

      {/* Auto Detect Asam/Basa Suggestion Banner */}
      {acidBaseDetection.detectedMedium &&
        acidBaseDetection.detectedMedium !== medium && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={`mb-3 p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
              isDark
                ? "bg-sky-950/40 border-sky-500/40 text-sky-200"
                : "bg-sky-50 border-sky-300 text-sky-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Wand2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>
                <strong>Deteksi Otomatis Suasana:</strong> {acidBaseDetection.reason}.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMedium(acidBaseDetection.detectedMedium!)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer shrink-0 ml-2 ${
                isDark
                  ? "bg-sky-400 text-black border-sky-400 hover:bg-sky-300"
                  : "bg-sky-600 text-white border-sky-600 hover:bg-sky-500"
              }`}
            >
              Ganti ke {acidBaseDetection.detectedMedium === "acidic" ? "Asam" : "Basa"}
            </button>
          </motion.div>
        )}

      {/* Input Field & Solve Button */}
      <div className="relative mb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              id="equation-input-field"
              type="text"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSolve();
              }}
              placeholder="Contoh: MnO4- + C2O4^2- -> Mn2+ + CO2 atau Cu + HNO3 -> Cu(NO3)2 + NO + H2O"
              className={`w-full ${
                autoCorrection.hasCorrection ? "pr-28 sm:pr-32" : equation ? "pr-10" : "px-4"
              } pl-4 py-3 rounded-lg font-mono text-sm sm:text-base border transition-colors focus:outline-none ${
                isDark
                  ? "bg-zinc-950 border-zinc-800 text-white focus:border-white placeholder:text-zinc-600"
                  : "bg-white border-zinc-300 text-black focus:border-black placeholder:text-zinc-400"
              }`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {autoCorrection.hasCorrection && (
                <button
                  type="button"
                  onClick={() => setEquation(autoCorrection.corrected)}
                  className="px-2 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 transition-all cursor-pointer shadow-xs animate-pulse"
                  title="Klik untuk menerapkan perbaikan notasi/LaTeX secara otomatis"
                >
                  <Wand2 className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Auto-Koreksi</span>
                </button>
              )}
              {equation && (
                <button
                  type="button"
                  onClick={handleClear}
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    isDark
                      ? "text-zinc-500 hover:text-white hover:bg-zinc-800"
                      : "text-zinc-400 hover:text-black hover:bg-zinc-100"
                  }`}
                  title="Hapus Semua"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            id="btn-solve-redox"
            type="button"
            onClick={onSolve}
            className={`px-6 py-3 font-bold uppercase tracking-wide text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              isDark
                ? "bg-white text-black hover:bg-zinc-200"
                : "bg-black text-white hover:bg-zinc-800"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Selesaikan Reaksi</span>
          </motion.button>
        </div>

        {/* Formula Auto-Corrector Interactive Suggestion Card */}
        {autoCorrection.hasCorrection && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-2.5 p-3.5 rounded-xl border flex flex-col gap-2.5 transition-all shadow-sm ${
              isDark
                ? "bg-gradient-to-r from-amber-950/40 via-zinc-950 to-amber-950/20 border-amber-500/40 text-white"
                : "bg-gradient-to-r from-amber-50 via-white to-amber-50 border-amber-300 text-zinc-900"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`p-1.5 rounded-lg border ${isDark ? "bg-zinc-900 border-zinc-800 text-amber-300" : "bg-zinc-50 border-zinc-200 text-amber-600"}`}>
                  <Wand2 className="w-3.5 h-3.5" />
                </span>
                <span className={`text-xs font-bold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
                  {autoCorrection.summaryTitle}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {autoCorrection.badges.map((b, i) => (
                  <span
                    key={i}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      b.color === "rose"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        : b.color === "emerald"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : b.color === "blue"
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    }`}
                  >
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
              {autoCorrection.detailedExplanation}
            </p>

            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t ${
                isDark ? "border-amber-500/20" : "border-amber-200"
              }`}
            >
              <div className="flex flex-col gap-1.5 text-xs overflow-x-auto py-1">
                <span
                  className={`text-[10px] uppercase tracking-[0.08em] font-sans font-bold shrink-0 ${
                    isDark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Hasil Koreksi:
                </span>
                <div
                  className={`px-2.5 py-1 rounded border shrink-0 ${
                    isDark ? "bg-black/60 border-zinc-700/60" : "bg-white border-zinc-300"
                  }`}
                >
                  <Latex math={equationToLatex(autoCorrection.corrected)} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEquation(autoCorrection.corrected)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${isDark ? "bg-zinc-100 hover:bg-white text-black border-zinc-100" : "bg-zinc-900 hover:bg-black text-white border-zinc-900"}`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Terapkan Koreksi</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEquation(autoCorrection.corrected);
                    setTimeout(() => onSolve(), 60);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${isDark ? "bg-amber-400 hover:bg-amber-300 text-black border-amber-400" : "bg-amber-500 hover:bg-amber-400 text-black border-amber-500"}`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Koreksi & Selesaikan</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Real-Time Mistake Detector & Validation Alert */}
        {mistake && mistake.hasMistake && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-2 p-3 rounded-lg border flex items-start gap-2.5 text-xs ${
              isDark
                ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
                : "bg-amber-50 border-amber-300 text-amber-900"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold">{mistake.title}</div>
              <p className="text-[11px] opacity-90">{mistake.message}</p>
              {mistake.suggestion && (
                <div className="text-[11px] font-medium pt-0.5 text-sky-400 dark:text-sky-300">
                  Saran: {mistake.suggestion}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Live Automatic Text-to-LaTeX Studio Bar */}
        {equation.trim() && (
          <div
            className={`mt-2.5 p-3.5 rounded-xl border flex flex-col gap-2.5 transition-all shadow-xs ${
              isDark
                ? "bg-zinc-950/90 border-zinc-800 text-white"
                : "bg-zinc-50 border-zinc-200 text-black"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${
                    isDark
                      ? "bg-sky-950/60 border-sky-600/40 text-sky-300"
                      : "bg-sky-50 border-sky-200 text-sky-700"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Live KaTeX & LaTeX</span>
                </span>
                <span className="text-[11px] font-mono opacity-60">
                  {equation.includes("->") ? "✓ Lengkap (Reaktan → Produk)" : "ℹ Belum ada tanda panah '->'"}
                </span>
              </div>

              {/* Action buttons: Auto-Fix, Copy LaTeX, Copy \ce, Copy Unicode */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAutoFix}
                  className={`px-2 py-1 rounded text-[11px] font-semibold border flex items-center gap-1 transition-colors cursor-pointer ${
                    isDark
                      ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-amber-300 hover:text-amber-200"
                      : "bg-white hover:bg-zinc-100 border-zinc-300 text-amber-700 hover:text-amber-800"
                  }`}
                  title="Otomatis rapikan huruf kecil, spasi, muatan dan panah"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>⚡ Auto-Kapitalisasi</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyText(`$${equationToLatex(equation)}$`, "dollar")}
                  className={`px-2 py-1 rounded text-[11px] font-semibold border flex items-center gap-1 transition-colors cursor-pointer ${
                    isDark
                      ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                      : "bg-white hover:bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black"
                  }`}
                  title="Salin kode LaTeX Math ($...$)"
                >
                  {copiedType === "dollar" ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>$ LaTeX</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyText(`\\ce{${equation}}`, "ce")}
                  className={`px-2 py-1 rounded text-[11px] font-semibold border flex items-center gap-1 transition-colors cursor-pointer ${
                    isDark
                      ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                      : "bg-white hover:bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black"
                  }`}
                  title="Salin kode \\ce{...} mhchem untuk paper ilmiah"
                >
                  {copiedType === "ce" ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Code2 className="w-3 h-3" />
                      <span>\ce&#123;&#125;</span>
                    </>
                  )}
                </button>

                {onOpenTextToLatex && (
                  <button
                    type="button"
                    onClick={onOpenTextToLatex}
                    className={`px-2 py-1 rounded text-[11px] font-semibold border flex items-center gap-1 transition-colors cursor-pointer ${
                      isDark
                        ? "bg-sky-950/60 hover:bg-sky-900/60 border-sky-700/50 text-sky-300"
                        : "bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-700"
                    }`}
                    title="Buka Text-to-LaTeX Studio Lengkap"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Studio Penuh →</span>
                  </button>
                )}
              </div>
            </div>

            {/* Rendered Live Math display */}
            <div
              className={`p-3 rounded-lg border font-mono text-sm sm:text-base flex items-center justify-center overflow-x-auto ${
                isDark ? "bg-black/60 border-zinc-850" : "bg-white border-zinc-200"
              }`}
            >
              <Latex math={equationToLatex(equation)} />
            </div>
          </div>
        )}
      </div>

      {/* Chemistry Keypad */}
      <div className="mb-4">
        <ChemistryKeypad
          onInsert={handleInsert}
          onBackspace={handleBackspace}
          onClear={handleClear}
          onOpenPeriodicTable={onOpenPeriodicTable}
        />
      </div>

      {/* Recent Reactions History (Last 5 Solved Reactions) */}
      <div className="mb-3">
        <RecentReactions
          currentEquation={equation}
          onSelectReaction={(eq, med) => {
            if (onSelectRecent) {
              onSelectRecent(eq, med);
            } else {
              setEquation(eq);
              setMedium(med);
              setTimeout(() => onSolve(), 10);
            }
          }}
        />
      </div>

      {/* Examples Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-zinc-800/60">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-semibold ${
              isDark ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            Contoh Cepat:
          </span>
          {EXAMPLE_REACTIONS.slice(0, 3).map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => onSelectExample(ex)}
              className={`px-2.5 py-1 text-xs rounded-md border font-mono transition-colors cursor-pointer ${
                isDark
                  ? "bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
                  : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-black"
              }`}
              title={ex.description}
            >
              {ex.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {onOpenQuiz && (
            <button
              type="button"
              onClick={onOpenQuiz}
              className={`sm:hidden px-3 py-1 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-amber-50 border-amber-200 text-amber-700"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Kuis</span>
            </button>
          )}

          {onOpenTextToLatex && (
            <button
              type="button"
              onClick={onOpenTextToLatex}
              className={`px-3 py-1 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-300"
                  : "bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-800"
              }`}
              title="Konverter Teks ke LaTeX & KaTeX"
            >
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Text ke LaTeX</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowExamplesModal(true)}
            className={`px-3 py-1 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark
                ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-white"
                : "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-black"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Lihat Semua Soal Latihan</span>
          </button>
        </div>
      </div>

      {/* Examples Modal Dialog */}
      <AnimatePresence>
        {showExamplesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExamplesModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`relative rounded-xl p-6 w-full max-w-2xl max-h-[85vh] flex flex-col border shadow-2xl z-10 transition-colors ${
                isDark
                  ? "bg-black border-zinc-800 text-white"
                  : "bg-white border-zinc-200 text-black"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                <div>
                  <h3 className="text-base font-bold">
                    Katalog Soal & Reaksi Redoks Terkenal
                  </h3>
                  <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                    Pilih reaksi redoks dari kurikulum SMA, Olimpiade Kimia, atau titrasi volumetri.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExamplesModal(false)}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-100 text-zinc-500 hover:text-black"
                  }`}
                >
                  ✕
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-zinc-800/60 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                      selectedCategory === cat
                        ? isDark
                          ? "bg-white text-black border-white"
                          : "bg-black text-white border-black"
                        : isDark
                        ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                        : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-black"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* List of Examples */}
              <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
                {filteredExamples.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => {
                      onSelectExample(ex);
                      setShowExamplesModal(false);
                    }}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                      isDark
                        ? "bg-zinc-950 hover:bg-zinc-900 border-zinc-800"
                        : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-sm">
                        {ex.title}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border ${
                          isDark
                            ? "bg-zinc-900 border-zinc-700 text-zinc-300"
                            : "bg-white border-zinc-300 text-zinc-700"
                        }`}
                      >
                        {ex.medium === "acidic" ? "Asam" : ex.medium === "basic" ? "Basa" : "Netral"}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-zinc-400 mb-1.5">
                      {ex.equation}
                    </div>

                    <p
                      className={`text-xs ${
                        isDark ? "text-zinc-400" : "text-zinc-600"
                      }`}
                    >
                      {ex.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
