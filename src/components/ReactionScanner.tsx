import React, { useState } from "react";
import { ReactionMedium, RedoxResult } from "../types/redox";
import { solveRedoxEquation } from "../utils/redoxSolver";
import { detectReactionMedium } from "../utils/acidBaseDetector";
import { Latex } from "./Latex";
import { equationToLatex, speciesToLatex } from "../utils/latexHelper";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "motion/react";
import {
  Scan,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Layers,
  HelpCircle,
  Flame,
} from "lucide-react";

interface ScannedReactionItem {
  id: string;
  originalText: string;
  cleanEquation: string;
  medium: ReactionMedium;
  result: RedoxResult;
}

interface ReactionScannerProps {
  onSelectDetail: (equation: string, medium: ReactionMedium) => void;
}

const DEFAULT_BATCH_INPUT = `1. Fe2+ + MnO4- -> Fe3+ + Mn2+
2. Cr2O7^2- + Fe2+ -> Cr3+ + Fe3+
3. Cl2 + OH- -> Cl- + ClO-
4. KMnO4 + H2C2O4 -> MnO2 + CO2 + H2O`;

export const ReactionScanner: React.FC<ReactionScannerProps> = ({
  onSelectDetail,
}) => {
  const { isDark } = useTheme();
  const [inputText, setInputText] = useState(DEFAULT_BATCH_INPUT);
  const [defaultMedium, setDefaultMedium] = useState<ReactionMedium>("acidic");
  const [autoDetectMedium, setAutoDetectMedium] = useState(true);
  const [scannedResults, setScannedResults] = useState<ScannedReactionItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Clean and parse lines
  const handleSolveAll = () => {
    if (!inputText.trim()) return;

    const lines = inputText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const items: ScannedReactionItem[] = lines.map((line, idx) => {
      // Strip leading numbers or bullets like "1.", "2)", "a.", "- ", "[1]"
      const cleaned = line
        .replace(/^(\d+[\.\)]\s*|[a-zA-Z][\.\)]\s*|\-\s*|\[\d+\]\s*)/, "")
        .trim();

      // Determine medium: auto-detect or default
      let effectiveMedium = defaultMedium;
      if (autoDetectMedium) {
        const detection = detectReactionMedium(cleaned);
        if (detection.detectedMedium) {
          effectiveMedium = detection.detectedMedium;
        }
      }

      const res = solveRedoxEquation(cleaned, effectiveMedium);

      return {
        id: `batch-${idx}-${Date.now()}`,
        originalText: line,
        cleanEquation: cleaned,
        medium: effectiveMedium,
        result: res,
      };
    });

    setScannedResults(items);
  };

  const handleCopyEquation = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setInputText("");
    setScannedResults([]);
  };

  const successCount = scannedResults.filter((r) => r.result.isValid).length;

  return (
    <div
      className={`border rounded-xl p-6 space-y-6 transition-colors font-sans ${
        isDark
          ? "bg-black border-zinc-800 text-white"
          : "bg-white border-zinc-200 text-black shadow-xs"
      }`}
    >
      {/* Title & Introduction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold ${
              isDark
                ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                : "bg-sky-50 border-sky-200 text-sky-700"
            }`}
          >
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              Reaction Scanner (Batch Solver)
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isDark
                    ? "bg-sky-950/80 border-sky-500/40 text-sky-300"
                    : "bg-sky-50 border-sky-300 text-sky-800"
                }`}
              >
                Multi-Equation Engine
              </span>
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              Tempel daftar persamaan reaksi tugas/ujian sekaligus. Sistem akan menyelesaikan semuanya dalam satu klik!
            </p>
          </div>
        </div>

        {/* Medium Selection for Batch */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoDetectMedium}
              onChange={(e) => setAutoDetectMedium(e.target.checked)}
              className="rounded accent-sky-500"
            />
            <span className={isDark ? "text-zinc-300" : "text-zinc-700"}>
              Deteksi Suasana Otomatis
            </span>
          </label>
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <label
            htmlFor="batch-input-area"
            className="font-bold text-zinc-400 uppercase tracking-wider text-[11px]"
          >
            Tempel Persamaan Reaksi (Satu per baris):
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInputText(DEFAULT_BATCH_INPUT)}
              className="text-xs text-sky-400 hover:underline cursor-pointer"
            >
              Muat Contoh Soal
            </button>
            <span className="text-zinc-600">•</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Bersihkan
            </button>
          </div>
        </div>

        <textarea
          id="batch-input-area"
          rows={5}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`1. Fe2+ + MnO4- -> Fe3+ + Mn2+\n2. Cr2O7^2- + Fe2+ -> Cr3+ + Fe3+\n3. Cl2 + OH- -> Cl- + ClO-`}
          className={`w-full p-4 rounded-xl font-mono text-sm border transition-colors focus:outline-none leading-relaxed ${
            isDark
              ? "bg-zinc-950 border-zinc-800 text-white focus:border-sky-400 placeholder:text-zinc-600"
              : "bg-white border-zinc-300 text-black focus:border-black placeholder:text-zinc-400"
          }`}
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            Tips: Mendukung format bernomor (<code className="font-mono">1.</code>, <code className="font-mono">2)</code>, <code className="font-mono">-</code>) ataupun rumus langsung dengan panah <code className="font-mono">-&gt;</code>.
          </p>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleSolveAll}
            className={`w-full sm:w-auto px-6 py-3 font-bold uppercase tracking-wide text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border ${
              isDark
                ? "bg-white text-black hover:bg-zinc-200 border-white"
                : "bg-black text-white hover:bg-zinc-800 border-black"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Solve All (Analisis Semua)</span>
          </motion.button>
        </div>
      </div>

      {/* Scanned Batch Results */}
      {scannedResults.length > 0 && (
        <div className="space-y-4 pt-2 border-t border-zinc-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">Hasil Penyetaraan Massal</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  successCount === scannedResults.length
                    ? isDark
                      ? "bg-emerald-950 border-emerald-700 text-emerald-300"
                      : "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : isDark
                    ? "bg-amber-950 border-amber-700 text-amber-300"
                    : "bg-amber-50 border-amber-300 text-amber-800"
                }`}
              >
                {successCount} dari {scannedResults.length} Berhasil Disetarakan Mutlak
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {scannedResults.map((item, idx) => {
              const res = item.result;
              const isCopied = copiedId === item.id;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-xl border transition-all ${
                    res.isValid
                      ? isDark
                        ? "bg-zinc-950/80 border-zinc-800 hover:border-zinc-700"
                        : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                      : isDark
                      ? "bg-red-950/20 border-red-900/40"
                      : "bg-red-50/50 border-red-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Left: Input & Balanced Output */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-300 text-xs font-mono font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-mono opacity-70">
                          {item.originalText}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded border ${
                            item.medium === "acidic"
                              ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                              : item.medium === "basic"
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          Suasana {item.medium === "acidic" ? "Asam" : item.medium === "basic" ? "Basa" : "Netral"}
                        </span>
                      </div>

                      {res.isValid ? (
                        <>
                          {/* Final Balanced Formula in LaTeX */}
                          <div
                            className={`p-3 rounded-lg border font-mono text-sm sm:text-base font-semibold overflow-x-auto ${
                              isDark ? "bg-black border-zinc-800" : "bg-white border-zinc-200"
                            }`}
                          >
                            <Latex
                              math={equationToLatex(res.balancedEquationString)}
                            />
                          </div>

                          {/* Quick Summary Meta */}
                          <div className="flex items-center gap-3 flex-wrap text-xs text-zinc-400">
                            <div>
                              <span>Oksidator: </span>
                              <strong className="text-sky-400">
                                {res.oxidizingAgent.join(", ") || "—"}
                              </strong>
                            </div>
                            <span>•</span>
                            <div>
                              <span>Reduktor: </span>
                              <strong className="text-emerald-400">
                                {res.reducingAgent.join(", ") || "—"}
                              </strong>
                            </div>
                            <span>•</span>
                            <div>
                              <span>Transfer: </span>
                              <strong className="text-amber-400 font-mono">
                                {res.electronsTransferred} e⁻
                              </strong>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-red-400 flex items-center gap-1.5 pt-1">
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span>{res.errorMessage}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    {res.isValid && (
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyEquation(item.id, res.balancedEquationString)
                          }
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isDark
                              ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300"
                              : "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectDetail(item.cleanEquation, item.medium)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isDark
                              ? "bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/40 text-sky-400"
                              : "bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-800"
                          }`}
                        >
                          <span>Buka Detail Lengkap</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
