import React, { useState } from "react";
import { RedoxResult } from "../types/redox";
import { Bot, Send, X, Loader2, BookOpen, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";
import { equationToLatex } from "../utils/latexHelper";

interface AiTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentResult: RedoxResult | null;
}

export const AiTutorModal: React.FC<AiTutorModalProps> = ({
  isOpen,
  onClose,
  currentResult,
}) => {
  const { isDark } = useTheme();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (customQuestion?: string) => {
    const q = customQuestion || query;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reaction: currentResult?.balancedEquationString || currentResult?.originalInput || "Reaksi Redoks Umum",
          medium: currentResult?.medium || "acidic",
          query: q,
          context: currentResult
            ? {
                oxidizingAgent: currentResult.oxidizingAgent,
                reducingAgent: currentResult.reducingAgent,
                electronsTransferred: currentResult.electronsTransferred,
                category: currentResult.reactionCategory,
              }
            : null,
        }),
      });

      const data = await response.json();
      if (data.success && data.explanation) {
        setExplanation(data.explanation);
      } else {
        setError(
          data.error ||
            "Layanan AI memerlukan GEMINI_API_KEY. Pastikan API key telah dikonfigurasi di Settings."
        );
      }
    } catch (err: any) {
      setError("Gagal terhubung ke server AI Tutor: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Jelaskan mengapa zat oksidator dan reduktor tersebut dipilih dalam reaksi ini?",
    "Bagaimana aplikasi nyata reaksi ini dalam industri atau laboratorium (misal titrasi/baterai)?",
    "Jelaskan prinsip bilangan oksidasi dan aturan penentuannya secara singkat dan mudah dihafal.",
    "Bagaimana cara cepat membedakan suasana asam vs suasana basa saat mengerjakan soal ujian?",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18 }}
            className={`relative rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col border shadow-2xl overflow-hidden z-10 transition-colors ${
              isDark
                ? "bg-black border-zinc-800 text-white"
                : "bg-white border-zinc-200 text-black"
            }`}
          >
            {/* Header */}
            <div
              className={`p-4 sm:p-5 border-b flex items-center justify-between transition-colors ${
                isDark
                  ? "bg-zinc-950 border-zinc-800"
                  : "bg-zinc-50 border-zinc-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                    isDark
                      ? "bg-white text-black border-white"
                      : "bg-black text-white border-black"
                  }`}
                >
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-1.5">
                    AI Chemistry Tutor
                    <span
                      className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded border ${
                        isDark
                          ? "bg-zinc-900 text-zinc-300 border-zinc-700"
                          : "bg-zinc-100 text-zinc-700 border-zinc-300"
                      }`}
                    >
                      Gemini
                    </span>
                  </h3>
                  <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                    Tanyakan konsep, mekanisme orbital, latar belakang reaksi, atau tips belajar redoks.
                  </p>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={onClose}
                className={`p-1.5 rounded-md transition-colors cursor-pointer border ${
                  isDark
                    ? "text-zinc-400 hover:text-white border-zinc-800 hover:bg-zinc-900"
                    : "text-zinc-600 hover:text-black border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content Area */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
              {currentResult && (
                <div
                  className={`p-3 rounded-lg border transition-colors ${
                    isDark
                      ? "bg-zinc-950 border-zinc-800"
                      : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-zinc-400">
                    Reaksi yang Sedang Dianalisis:
                  </div>
                  <div className="overflow-x-auto py-1">
                    <Latex
                      math={equationToLatex(
                        currentResult.balancedEquationString || currentResult.originalInput
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Quick Prompts */}
              {!explanation && !loading && (
                <div className="space-y-2">
                  <div className={`text-xs font-semibold flex items-center gap-1 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    <Lightbulb className="w-3.5 h-3.5 text-zinc-400" />
                    Pertanyaan Populer:
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {sampleQuestions.map((sq, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setQuery(sq);
                          handleAsk(sq);
                        }}
                        className={`p-2.5 text-left border rounded-lg text-xs transition-colors cursor-pointer ${
                          isDark
                            ? "bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-300"
                            : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800"
                        }`}
                      >
                        {sq}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading Indicator */}
              {loading && (
                <div className={`py-12 flex flex-col items-center justify-center gap-3 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-xs font-medium">AI Chemistry Tutor sedang menganalisis konsep reaksi...</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div
                  className={`p-3.5 rounded-lg text-xs border ${
                    isDark
                      ? "bg-zinc-950 border-zinc-700 text-white"
                      : "bg-zinc-100 border-zinc-300 text-black"
                  }`}
                >
                  <div className="font-bold mb-1">Pemberitahuan:</div>
                  {error}
                </div>
              )}

              {/* Explanation Output */}
              {explanation && (
                <div
                  className={`p-4 rounded-lg border space-y-3 leading-relaxed transition-colors ${
                    isDark
                      ? "bg-zinc-950 border-zinc-800"
                      : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                    <BookOpen className="w-4 h-4" />
                    Penjelasan dari Tutor:
                  </div>
                  <div className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                    {explanation}
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div
              className={`p-4 border-t transition-colors ${
                isDark
                  ? "bg-zinc-950 border-zinc-800"
                  : "bg-zinc-50 border-zinc-200"
              }`}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tanyakan apapun seputar redoks ini..."
                  className={`flex-1 px-4 py-2 rounded-lg text-xs sm:text-sm focus:outline-none transition-colors border ${
                    isDark
                      ? "bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white"
                      : "bg-white border-zinc-200 text-black placeholder:text-zinc-400 focus:border-black"
                  }`}
                />
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  disabled={loading || !query.trim()}
                  className={`px-4 py-2 disabled:opacity-40 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    isDark
                      ? "bg-white text-black hover:bg-zinc-200 border-white"
                      : "bg-black text-white hover:bg-zinc-800 border-black"
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Kirim</span>
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


