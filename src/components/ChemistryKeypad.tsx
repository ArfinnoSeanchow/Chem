import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Delete, RotateCcw, CornerDownLeft, Binary, Zap, FlaskConical, Hash, Layers } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";
import { speciesToLatex } from "../utils/latexHelper";

interface ChemistryKeypadProps {
  onInsert: (value: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onOpenPeriodicTable?: () => void;
}

type KeypadCategory = "numbers" | "charges" | "species" | "symbols";

export const ChemistryKeypad: React.FC<ChemistryKeypadProps> = ({
  onInsert,
  onBackspace,
  onClear,
  onOpenPeriodicTable,
}) => {
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState<KeypadCategory>("numbers");
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const numberButtons = [
    { label: "1", val: "1", latex: "1", subLatex: "x_1" },
    { label: "2", val: "2", latex: "2", subLatex: "x_2" },
    { label: "3", val: "3", latex: "3", subLatex: "x_3" },
    { label: "4", val: "4", latex: "4", subLatex: "x_4" },
    { label: "5", val: "5", latex: "5", subLatex: "x_5" },
    { label: "6", val: "6", latex: "6", subLatex: "x_6" },
    { label: "7", val: "7", latex: "7", subLatex: "x_7" },
    { label: "8", val: "8", latex: "8", subLatex: "x_8" },
    { label: "9", val: "9", latex: "9", subLatex: "x_9" },
    { label: "0", val: "0", latex: "0", subLatex: "x_0" },
  ];

  const chargeButtons = [
    { latex: "^+", val: "^+" },
    { latex: "^-", val: "^-" },
    { latex: "^{2+}", val: "^2+" },
    { latex: "^{3+}", val: "^3+" },
    { latex: "^{4+}", val: "^4+" },
    { latex: "^{2-}", val: "^2-" },
    { latex: "^{3-}", val: "^3-" },
    { latex: "^{+1}", val: "^1+" },
    { latex: "^{-1}", val: "^1-" },
    { latex: "+", val: "+" },
    { latex: "-", val: "-" },
  ];

  const commonSpecies = [
    { formula: "MnO4^-", val: "MnO4^-" },
    { formula: "Cr2O7^2-", val: "Cr2O7^2-" },
    { formula: "C2O4^2-", val: "C2O4^2-" },
    { formula: "Fe^2+", val: "Fe^2+" },
    { formula: "Fe^3+", val: "Fe^3+" },
    { formula: "SO4^2-", val: "SO4^2-" },
    { formula: "SO3^2-", val: "SO3^2-" },
    { formula: "NO3^-", val: "NO3^-" },
    { formula: "NO2^-", val: "NO2^-" },
    { formula: "Cl^-", val: "Cl^-" },
    { formula: "Br^-", val: "Br^-" },
    { formula: "I^-", val: "I^-" },
    { formula: "I2", val: "I2" },
    { formula: "H2O2", val: "H2O2" },
    { formula: "H^+", val: "H+" },
    { formula: "OH^-", val: "OH-" },
    { formula: "H2O", val: "H2O" },
    { formula: "e^-", val: "e-" },
  ];

  const symbolsButtons = [
    { label: "→", val: " -> ", latex: "\\longrightarrow" },
    { label: "+", val: " + ", latex: "+" },
    { label: "(", val: "(", latex: "(" },
    { label: ")", val: ")", latex: ")" },
    { label: "⇌", val: " ⇌ ", latex: "\\rightleftharpoons" },
    { label: "(aq)", val: "(aq)", latex: "\\text{(aq)}" },
    { label: "(s)", val: "(s)", latex: "\\text{(s)}" },
    { label: "(l)", val: "(l)", latex: "\\text{(l)}" },
    { label: "(g)", val: "(g)", latex: "\\text{(g)}" },
  ];

  return (
    <div
      className={`rounded-lg border transition-colors ${
        isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
      }`}
    >
      {/* Header bar of Keypad */}
      <div
        className={`px-3 py-2 flex items-center justify-between border-b ${
          isDark ? "border-zinc-800" : "border-zinc-200"
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider mr-1 hidden sm:inline ${
              isDark ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            Keypad LaTeX:
          </span>

          {/* Category Tabs */}
          <button
            type="button"
            onClick={() => {
              setActiveCategory("numbers");
              if (!isExpanded) setIsExpanded(true);
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
              activeCategory === "numbers"
                ? isDark
                  ? "bg-white text-black font-bold"
                  : "bg-black text-white font-bold"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Angka</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveCategory("charges");
              if (!isExpanded) setIsExpanded(true);
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
              activeCategory === "charges"
                ? isDark
                  ? "bg-white text-black font-bold"
                  : "bg-black text-white font-bold"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Muatan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveCategory("species");
              if (!isExpanded) setIsExpanded(true);
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
              activeCategory === "species"
                ? isDark
                  ? "bg-white text-black font-bold"
                  : "bg-black text-white font-bold"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Spesi Populer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveCategory("symbols");
              if (!isExpanded) setIsExpanded(true);
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
              activeCategory === "symbols"
                ? isDark
                  ? "bg-white text-black font-bold"
                  : "bg-black text-white font-bold"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Simbol & Panah</span>
          </button>

          {/* Quick Periodic Table Modal Launcher */}
          {onOpenPeriodicTable && (
            <button
              type="button"
              onClick={onOpenPeriodicTable}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isDark
                  ? "bg-zinc-900 border-zinc-700 text-zinc-200 hover:text-white hover:border-sky-400/50"
                  : "bg-white border-zinc-300 text-zinc-800 hover:text-black hover:border-sky-500"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Tabel 118 Unsur</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-sky-500/10 text-sky-400 dark:text-sky-300 border border-sky-500/20">
                ⚛
              </span>
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`text-[11px] font-medium px-2 py-1 rounded transition-colors cursor-pointer ${
            isDark
              ? "text-zinc-400 hover:text-white"
              : "text-zinc-500 hover:text-black"
          }`}
        >
          {isExpanded ? "Sembunyikan" : "Tampilkan"}
        </button>
      </div>

      {/* Keypad Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="p-3 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-3">
              {/* Category specific keys */}
              <div className="flex-1">
                {activeCategory === "numbers" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                      {numberButtons.map((btn) => (
                        <motion.button
                          key={btn.val}
                          whileTap={{ scale: 0.94 }}
                          type="button"
                          onClick={() => onInsert(btn.val)}
                          className={`p-2 rounded-lg font-sans font-bold border transition-colors flex flex-col items-center justify-center cursor-pointer ${
                            isDark
                              ? "bg-black hover:bg-zinc-900 border-zinc-800 text-white"
                              : "bg-white hover:bg-zinc-100 border-zinc-200 text-black"
                          }`}
                        >
                          <span className="text-sm">
                            <Latex math={btn.latex} />
                          </span>
                          <span className="text-[9px] text-zinc-400">
                            <Latex math={btn.subLatex} />
                          </span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Quick index buttons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold mr-1 self-center ${
                          isDark ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        Indeks Subskrip:
                      </span>
                      {["2", "3", "4", "7", "8"].map((n) => (
                        <motion.button
                          key={n}
                          whileTap={{ scale: 0.94 }}
                          type="button"
                          onClick={() => onInsert(n)}
                          className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-colors cursor-pointer ${
                            isDark
                              ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-white"
                              : "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-black"
                          }`}
                        >
                          <Latex math={`_{${n}}`} />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {activeCategory === "charges" && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {chargeButtons.map((btn) => (
                      <motion.button
                        key={btn.val}
                        whileTap={{ scale: 0.94 }}
                        type="button"
                        onClick={() => onInsert(btn.val)}
                        className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
                          isDark
                            ? "bg-black hover:bg-zinc-900 border-zinc-800 text-white"
                            : "bg-white hover:bg-zinc-100 border-zinc-200 text-black"
                        }`}
                      >
                        <Latex math={btn.latex} />
                      </motion.button>
                    ))}
                  </div>
                )}

                {activeCategory === "species" && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {commonSpecies.map((btn) => (
                      <motion.button
                        key={btn.val}
                        whileTap={{ scale: 0.94 }}
                        type="button"
                        onClick={() => onInsert(btn.val)}
                        className={`p-2 rounded-lg border transition-colors text-center cursor-pointer flex items-center justify-center ${
                          isDark
                            ? "bg-black hover:bg-zinc-900 border-zinc-800 text-white"
                            : "bg-white hover:bg-zinc-100 border-zinc-200 text-black"
                        }`}
                      >
                        <Latex math={speciesToLatex(btn.formula)} />
                      </motion.button>
                    ))}
                  </div>
                )}

                {activeCategory === "symbols" && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {symbolsButtons.map((btn) => (
                      <motion.button
                        key={btn.val}
                        whileTap={{ scale: 0.94 }}
                        type="button"
                        onClick={() => onInsert(btn.val)}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
                          isDark
                            ? "bg-black hover:bg-zinc-900 border-zinc-800 text-white"
                            : "bg-white hover:bg-zinc-100 border-zinc-200 text-black"
                        }`}
                      >
                        <Latex math={btn.latex} />
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action column (Arrow, Space, Backspace, Clear) */}
              <div
                className={`flex flex-row md:flex-col gap-1.5 md:w-36 pt-2 md:pt-0 border-t md:border-t-0 md:border-l pl-0 md:pl-3 ${
                  isDark ? "border-zinc-800" : "border-zinc-200"
                }`}
              >
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={() => onInsert(" -> ")}
                  className={`flex-1 p-2 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isDark
                      ? "bg-white text-black border-white hover:bg-zinc-200"
                      : "bg-black text-white border-black hover:bg-zinc-800"
                  }`}
                  title="Tanda panah reaksi"
                >
                  <CornerDownLeft className="w-3.5 h-3.5 rotate-180" />
                  <span>Panah -&gt;</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={() => onInsert(" + ")}
                  className={`flex-1 p-2 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isDark
                      ? "bg-black hover:bg-zinc-900 border-zinc-800 text-white"
                      : "bg-white hover:bg-zinc-100 border-zinc-200 text-black"
                  }`}
                  title="Tanda tambah"
                >
                  <span>+ Tambah</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={onBackspace}
                  className={`flex-1 p-2 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isDark
                      ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-white"
                      : "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-black"
                  }`}
                  title="Hapus satu karakter"
                >
                  <Delete className="w-3.5 h-3.5" />
                  <span>Hapus (⌫)</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={onClear}
                  className={`flex-1 p-2 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isDark
                      ? "bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                      : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-black"
                  }`}
                  title="Bersihkan persamaan"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

