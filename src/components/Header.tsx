import React from "react";
import { Atom, Sparkles, Moon, Sun, Layers, Scan, Gamepad2, Hash, Home, BookOpen, Code2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { ChemlyLogo } from "./ChemlyLogo";
import { AudioController } from "./AudioController";

export type NavTab = "solver" | "scanner" | "playground" | "biloks-calc" | "text-to-latex";

interface HeaderProps {
  onOpenAiTutor: () => void;
  onOpenPeriodicTable: () => void;
  onOpenLanding: () => void;
  onOpenNotes?: () => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAiTutor,
  onOpenPeriodicTable,
  onOpenLanding,
  onOpenNotes,
  activeTab,
  setActiveTab,
}) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <header
      className={`border-b sticky top-0 z-40 transition-colors backdrop-blur-md ${
        isDark ? "bg-black/90 border-zinc-800" : "bg-white/95 border-zinc-200"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo & Brand Name */}
        <div
          onClick={onOpenLanding}
          className="flex items-center gap-2.5 cursor-pointer group select-none py-1"
          title="Kembali ke Beranda Chemly"
        >
          <ChemlyLogo size="md" />
          <span
            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border hidden sm:inline-block ${
              isDark
                ? "bg-zinc-900 text-zinc-300 border-zinc-700"
                : "bg-zinc-100 text-zinc-700 border-zinc-300"
            }`}
          >
            v2.5
          </span>
        </div>

        {/* Desktop Navigation Tabs */}
        <div
          className={`hidden lg:flex items-center p-1 rounded-xl border transition-colors ${
            isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-100 border-zinc-300"
          }`}
        >
          {/* Solver Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("solver")}
            className={`relative px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "solver"
                ? isDark
                  ? "text-black"
                  : "text-white"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            {activeTab === "solver" && (
              <motion.div
                layoutId="headerActiveTab"
                className={`absolute inset-0 rounded-lg ${
                  isDark ? "bg-white" : "bg-black"
                }`}
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Atom className="w-3.5 h-3.5" />
              <span>Penyetara Redoks</span>
            </span>
          </button>

          {/* Scanner Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("scanner")}
            className={`relative px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "scanner"
                ? isDark
                  ? "text-black"
                  : "text-white"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            {activeTab === "scanner" && (
              <motion.div
                layoutId="headerActiveTab"
                className={`absolute inset-0 rounded-lg ${
                  isDark ? "bg-white" : "bg-black"
                }`}
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Scan className="w-3.5 h-3.5" />
              <span>Reaction Scanner</span>
            </span>
          </button>

          {/* Playground Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("playground")}
            className={`relative px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "playground"
                ? isDark
                  ? "text-black"
                  : "text-white"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            {activeTab === "playground" && (
              <motion.div
                layoutId="headerActiveTab"
                className={`absolute inset-0 rounded-lg ${
                  isDark ? "bg-white" : "bg-black"
                }`}
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Playground</span>
            </span>
          </button>

          {/* Biloks Calc Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("biloks-calc")}
            className={`relative px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "biloks-calc"
                ? isDark
                  ? "text-black"
                  : "text-white"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            {activeTab === "biloks-calc" && (
              <motion.div
                layoutId="headerActiveTab"
                className={`absolute inset-0 rounded-lg ${
                  isDark ? "bg-white" : "bg-black"
                }`}
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              <span>Kalkulator Biloks</span>
            </span>
          </button>

          {/* Text to LaTeX Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("text-to-latex")}
            className={`relative px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "text-to-latex"
                ? isDark
                  ? "text-black"
                  : "text-white"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            {activeTab === "text-to-latex" && (
              <motion.div
                layoutId="headerActiveTab"
                className={`absolute inset-0 rounded-lg ${
                  isDark ? "bg-white" : "bg-black"
                }`}
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Text ke LaTeX</span>
            </span>
          </button>
        </div>

        {/* Right side: Beranda, Tabel Periodik, Theme Toggle & AI Tutor */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Beranda Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onOpenLanding}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isDark
                ? "bg-zinc-900/90 hover:bg-zinc-800 border-zinc-750 text-zinc-300 hover:text-white"
                : "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700 hover:text-black"
            }`}
            title="Kembali ke Beranda Chemly"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Beranda</span>
          </motion.button>

          {/* Periodic Table Quick Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onOpenPeriodicTable}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isDark
                ? "bg-zinc-900/90 hover:bg-zinc-800 border-zinc-750 text-white"
                : "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-black"
            }`}
            title="Buka Tabel Periodik 118 Unsur"
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Tabel Periodik</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-500/15 border border-sky-500/30 text-sky-400 dark:text-sky-300">
              118
            </span>
          </motion.button>

          {/* Catatan & Panduan Button */}
          {onOpenNotes && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onOpenNotes}
              className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                isDark
                  ? "bg-zinc-900/90 hover:bg-zinc-800 border-zinc-750 text-zinc-300 hover:text-white"
                  : "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700 hover:text-black"
              }`}
              title="Buka Catatan Teori & Tutorial Redoks"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Catatan</span>
            </motion.button>
          )}

          {/* Audio Backsound Controller */}
          <AudioController />

          {/* Animated Theme Switcher Button */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer flex items-center justify-center relative overflow-hidden ${
              isDark
                ? "bg-zinc-900/90 hover:bg-zinc-800 border-zinc-750 text-amber-300 hover:text-amber-200"
                : "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700 hover:text-black"
            }`}
            title={`Beralih ke tema ${isDark ? "Terang (Light Mode)" : "Gelap (Dark Mode)"}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDark ? "sun" : "moon"}
                initial={{ y: -12, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 12, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.2 }}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* AI Tutor Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onOpenAiTutor}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              isDark
                ? "border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 text-white"
                : "border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-black"
            }`}
            title="Buka AI Tutor Kimia"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">AI Tutor</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
