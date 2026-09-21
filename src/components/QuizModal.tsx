import React, { useState, useMemo } from "react";
import { QUIZ_QUESTIONS, QuizQuestion, QuizType } from "../data/quizData";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";
import {
  Sparkles,
  X,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  Flame,
  Award,
  ChevronRight,
  BookOpen,
  Send,
  Zap,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadEquationToSolver?: (equation: string, medium?: "acidic" | "basic" | "neutral") => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  onLoadEquationToSolver,
}) => {
  const { isDark } = useTheme();

  const [selectedDifficulty, setSelectedDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // User input states
  const [userSelectedOption, setUserSelectedOption] = useState<number | null>(null);
  const [userCoefficients, setUserCoefficients] = useState<Record<string, string>>({});
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // Score & Streak
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Filtered question pool
  const filteredQuestions = useMemo(() => {
    if (selectedDifficulty === "all") return QUIZ_QUESTIONS;
    return QUIZ_QUESTIONS.filter((q) => q.difficulty === selectedDifficulty);
  }, [selectedDifficulty]);

  const currentQuestion: QuizQuestion =
    filteredQuestions[currentQuestionIndex % filteredQuestions.length] || QUIZ_QUESTIONS[0];

  // Reset inputs when question changes
  const resetQuestionState = () => {
    setUserSelectedOption(null);
    setUserCoefficients({});
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setShowSolution(false);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => (prev + 1) % filteredQuestions.length);
    resetQuestionState();
  };

  const handleRandomQuestion = () => {
    const nextIdx = Math.floor(Math.random() * filteredQuestions.length);
    setCurrentQuestionIndex(nextIdx);
    resetQuestionState();
  };

  const handleCheckAnswer = () => {
    if (currentQuestion.type === "balance_coefficients" && currentQuestion.unbalancedSpecies) {
      // Check every coefficient
      let allCorrect = true;
      const { reactants, products } = currentQuestion.unbalancedSpecies;

      reactants.forEach((r, idx) => {
        const val = parseInt(userCoefficients[`r_${idx}`] || "1", 10);
        if (val !== r.correctCoeff) allCorrect = false;
      });

      products.forEach((p, idx) => {
        const val = parseInt(userCoefficients[`p_${idx}`] || "1", 10);
        if (val !== p.correctCoeff) allCorrect = false;
      });

      setIsCorrect(allCorrect);
      setIsAnswerChecked(true);
      if (allCorrect) {
        setScore((s) => s + 15);
        setStreak((st) => st + 1);
      } else {
        setStreak(0);
      }
    } else {
      // Multiple choice check
      const correct = userSelectedOption === currentQuestion.correctOptionIndex;
      setIsCorrect(correct);
      setIsAnswerChecked(true);
      if (correct) {
        setScore((s) => s + 10);
        setStreak((st) => st + 1);
      } else {
        setStreak(0);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className={`relative rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col border shadow-2xl overflow-hidden z-10 transition-colors ${
            isDark
              ? "bg-[#090A0D] border-zinc-800 text-white"
              : "bg-white border-zinc-200 text-black"
          }`}
        >
          {/* Header */}
          <div
            className={`p-4 border-b flex items-center justify-between gap-3 shrink-0 ${
              isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border ${
                  isDark
                    ? "bg-zinc-900 border-zinc-700 text-amber-400"
                    : "bg-amber-50 border-amber-200 text-amber-600"
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight">
                    Arena Kuis & Latihan Redoks
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-amber-500/10 border-amber-500/30 text-amber-400 dark:text-amber-300">
                    Mode Belajar
                  </span>
                </div>
                <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Uji pemahaman Anda: kerjakan dahulu, periksa jawaban, lalu pelajari pembahasannya.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Score & Streak Counters */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-semibold">
                <span className="px-2 py-1 rounded-md border bg-zinc-900 border-zinc-800 text-amber-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>{score} Poin</span>
                </span>
                <span className="px-2 py-1 rounded-md border bg-zinc-900 border-zinc-800 text-orange-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{streak} Streak</span>
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                    : "border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-100"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div
            className={`p-3 border-b flex flex-wrap items-center justify-between gap-2 shrink-0 ${
              isDark ? "bg-black/60 border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            <div className="flex items-center gap-1 text-xs">
              <span className={`text-[11px] mr-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                Tingkat:
              </span>
              {(["all", "easy", "medium", "hard"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setSelectedDifficulty(lvl);
                    setCurrentQuestionIndex(0);
                    resetQuestionState();
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer border ${
                    selectedDifficulty === lvl
                      ? isDark
                        ? "bg-white text-black border-white"
                        : "bg-black text-white border-black"
                      : isDark
                      ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                      : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-black"
                  }`}
                >
                  {lvl === "all"
                    ? "Semua"
                    : lvl === "easy"
                    ? "Mudah 🔥"
                    : lvl === "medium"
                    ? "Sedang 🔥🔥"
                    : "Sulit 🔥🔥🔥"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRandomQuestion}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  isDark
                    ? "bg-zinc-900 border-zinc-700 text-zinc-200 hover:text-white"
                    : "bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black"
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Acak Soal</span>
              </button>

              <button
                type="button"
                onClick={handleNextQuestion}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  isDark
                    ? "bg-sky-400 text-black border-sky-400 font-bold"
                    : "bg-sky-600 text-white border-sky-600 font-bold"
                }`}
              >
                <span>Soal Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Question Content Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {/* Question Card */}
            <div
              className={`p-4 sm:p-5 rounded-xl border relative ${
                isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
              }`}
            >
              {/* Question Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
                  {currentQuestion.type === "balance_coefficients"
                    ? "Setarakan Koefisien"
                    : currentQuestion.type === "find_oxidation_number"
                    ? "Hitung Bilangan Oksidasi"
                    : currentQuestion.type === "identify_agents"
                    ? "Oksidator & Reduktor"
                    : "Transfer Elektron"}
                </span>

                <span
                  className={`text-xs font-bold font-mono ${
                    currentQuestion.difficulty === "hard"
                      ? "text-rose-400"
                      : currentQuestion.difficulty === "medium"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {currentQuestion.difficulty === "hard"
                    ? "🔥🔥🔥 Sulit"
                    : currentQuestion.difficulty === "medium"
                    ? "🔥🔥 Sedang"
                    : "🔥 Mudah"}
                </span>
              </div>

              {/* Title & Prompt */}
              <h4 className="text-base font-bold mb-2">
                {currentQuestion.title}
              </h4>
              <p className={`text-xs sm:text-sm mb-4 leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                {currentQuestion.prompt}
              </p>

              {/* TYPE 1: Interactive Balance Coefficients Box */}
              {currentQuestion.type === "balance_coefficients" &&
                currentQuestion.unbalancedSpecies && (
                  <div
                    className={`p-3.5 sm:p-4 rounded-xl border mb-4 ${
                      isDark ? "bg-black border-zinc-800" : "bg-white border-zinc-300"
                    }`}
                  >
                    <div className="text-[11px] font-semibold text-zinc-400 mb-2">
                      Isi koefisien bilangan bulat terkecil (ketik angka di setiap kotak):
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-bold">
                      {/* Reactants */}
                      {currentQuestion.unbalancedSpecies.reactants.map((r, i) => (
                        <div key={`r_${i}`} className="flex items-center gap-1.5">
                          {i > 0 && <span className="text-zinc-400 font-bold">+</span>}
                          <input
                            type="number"
                            min={1}
                            max={50}
                            placeholder="1"
                            disabled={isAnswerChecked && isCorrect}
                            value={userCoefficients[`r_${i}`] || ""}
                            onChange={(e) =>
                              setUserCoefficients((prev) => ({
                                ...prev,
                                [`r_${i}`]: e.target.value,
                              }))
                            }
                            className={`w-11 sm:w-12 h-9 text-center rounded-lg border font-mono text-sm font-bold focus:outline-none transition-colors ${
                              isDark
                                ? "bg-zinc-900 border-zinc-700 text-white focus:border-sky-400"
                                : "bg-zinc-100 border-zinc-300 text-black focus:border-sky-500"
                            }`}
                          />
                          <span className="font-mono text-xs sm:text-sm">
                            <Latex math={r.formula} />
                          </span>
                        </div>
                      ))}

                      {/* Arrow */}
                      <span className="text-sky-400 font-bold px-1 text-base">→</span>

                      {/* Products */}
                      {currentQuestion.unbalancedSpecies.products.map((p, i) => (
                        <div key={`p_${i}`} className="flex items-center gap-1.5">
                          {i > 0 && <span className="text-zinc-400 font-bold">+</span>}
                          <input
                            type="number"
                            min={1}
                            max={50}
                            placeholder="1"
                            disabled={isAnswerChecked && isCorrect}
                            value={userCoefficients[`p_${i}`] || ""}
                            onChange={(e) =>
                              setUserCoefficients((prev) => ({
                                ...prev,
                                [`p_${i}`]: e.target.value,
                              }))
                            }
                            className={`w-11 sm:w-12 h-9 text-center rounded-lg border font-mono text-sm font-bold focus:outline-none transition-colors ${
                              isDark
                                ? "bg-zinc-900 border-zinc-700 text-white focus:border-sky-400"
                                : "bg-zinc-100 border-zinc-300 text-black focus:border-sky-500"
                            }`}
                          />
                          <span className="font-mono text-xs sm:text-sm">
                            <Latex math={p.formula} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* TYPE 2: Multiple Choice Options */}
              {currentQuestion.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = userSelectedOption === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (!isAnswerChecked || !isCorrect) {
                            setUserSelectedOption(idx);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? isDark
                              ? "bg-sky-950/60 border-sky-400 text-white ring-1 ring-sky-400 shadow-md"
                              : "bg-sky-50 border-sky-500 text-sky-950 ring-1 ring-sky-500 shadow-sm"
                            : isDark
                            ? "bg-black/60 border-zinc-800 text-zinc-200 hover:border-zinc-700"
                            : "bg-white border-zinc-200 text-zinc-800 hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold ${
                              isSelected
                                ? isDark
                                  ? "bg-sky-400 text-black"
                                  : "bg-sky-600 text-white"
                                : isDark
                                ? "bg-zinc-900 text-zinc-400"
                                : "bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </div>

                        {isSelected && <Zap className="w-4 h-4 text-sky-400" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons: Check Answer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCheckAnswer}
                  className={`py-2 px-4 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                    isDark
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "bg-black text-white hover:bg-zinc-800"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Periksa Jawaban</span>
                </button>

                {/* Show Solver Link if equation exists */}
                {currentQuestion.equation && onLoadEquationToSolver && (
                  <button
                    type="button"
                    onClick={() => {
                      onLoadEquationToSolver(
                        currentQuestion.equation!,
                        currentQuestion.medium || "acidic"
                      );
                      onClose();
                    }}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Buka di Penyetara Reaksi Utama</span>
                  </button>
                )}
              </div>
            </div>

            {/* Answer Result Banner */}
            <AnimatePresence>
              {isAnswerChecked && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCorrect
                      ? isDark
                        ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                        : "bg-emerald-50 border-emerald-300 text-emerald-900"
                      : isDark
                      ? "bg-rose-950/40 border-rose-500/50 text-rose-200"
                      : "bg-rose-50 border-rose-300 text-rose-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <h5 className="font-bold text-sm">
                        {isCorrect
                          ? "Jawaban Anda Benar! Hebat!"
                          : "Jawaban Kurang Tepat, Jangan Menyerah!"}
                      </h5>
                      <p className="text-xs opacity-90">
                        {isCorrect
                          ? "Pemahaman konsep redoks Anda sangat baik. Poin telah ditambahkan ke streak latihan."
                          : "Silakan periksa kembali atau buka langkah pembahasan lengkap di bawah untuk mempelajarinya."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setShowSolution(!showSolution)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                        isDark
                          ? "bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
                          : "bg-white border-zinc-300 text-black hover:bg-zinc-100"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                      <span>{showSolution ? "Tutup Pembahasan" : "Buka Pembahasan Lengkap"}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Detailed Step-by-Step Solution Card */}
            <AnimatePresence>
              {showSolution && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`p-4 sm:p-5 rounded-xl border space-y-3 transition-colors ${
                    isDark ? "bg-black border-zinc-800" : "bg-white border-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 font-bold text-sm">
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>Langkah Penyelesaian Lengkap</span>
                  </div>

                  {/* Balanced Equation */}
                  {currentQuestion.balancedEquationLatex && (
                    <div
                      className={`p-3 rounded-lg border text-xs sm:text-sm font-medium overflow-x-auto ${
                        isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-sky-400 block mb-1">
                        Persamaan Reaksi Setara:
                      </span>
                      <Latex math={currentQuestion.balancedEquationLatex} />
                    </div>
                  )}

                  {/* Explanation text */}
                  <div
                    className={`p-3 rounded-lg text-xs leading-relaxed whitespace-pre-line font-sans border ${
                      isDark ? "bg-zinc-950 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-800"
                    }`}
                  >
                    {currentQuestion.solutionExplanation}
                  </div>

                  {/* Key Concept Tip */}
                  <div className="p-2.5 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-400 dark:text-sky-300 text-xs">
                    <strong>Konsep Kunci: </strong>
                    <span>{currentQuestion.keyConcept}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
