import React, { useState } from "react";
import {
  calculateOxidationStates,
  CompoundBiloksResult,
  ElementBiloksDetail,
} from "../utils/oxidationCalculator";
import { extractFormulaAndCharge } from "../utils/chemistryParser";
import { Calculator, BookOpen } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";
import { speciesToLatex, biloksToLatex } from "../utils/latexHelper";

export const QuickBiloksCalculator: React.FC = () => {
  const { isDark } = useTheme();
  const [inputFormula, setInputFormula] = useState("K2Cr2O7");
  const [analyzed, setAnalyzed] = useState<CompoundBiloksResult>(() => {
    const { formula, charge } = extractFormulaAndCharge("K2Cr2O7");
    return calculateOxidationStates(formula, charge);
  });

  const handleCalculate = (str: string = inputFormula) => {
    if (!str.trim()) return;
    try {
      const { formula, charge } = extractFormulaAndCharge(str);
      const res = calculateOxidationStates(formula, charge);
      setAnalyzed(res);
    } catch {
      // ignore
    }
  };

  const presets = ["K2Cr2O7", "KMnO4", "H2C2O4", "H2SO4", "Na2S2O3", "Cr2O7^2-", "MnO4^-", "NH4^+", "NO3^-", "ClO4^-"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`border rounded-xl p-6 space-y-4 transition-colors font-sans ${
        isDark
          ? "bg-black border-zinc-800 text-white"
          : "bg-white border-zinc-200 text-black shadow-xs"
      }`}
    >
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5" />
        <div>
          <h3 className="text-base font-bold">
            Kalkulator Bilangan Oksidasi (Single Compound)
          </h3>
          <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            Hitung dan pelajari cara menentukan biloks setiap atom dalam rumus senyawa atau ion poliatomik apapun.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={inputFormula}
          onChange={(e) => {
            setInputFormula(e.target.value);
            handleCalculate(e.target.value);
          }}
          placeholder="Ketik rumus (misal: K2Cr2O7, MnO4^-, H2SO4)"
          className={`flex-1 px-4 py-2 rounded-lg font-mono text-sm focus:outline-none transition-colors border ${
            isDark
              ? "bg-zinc-950 border-zinc-800 text-white focus:border-white placeholder:text-zinc-600"
              : "bg-zinc-50 border-zinc-200 text-black focus:border-black placeholder:text-zinc-400"
          }`}
        />
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => handleCalculate(inputFormula)}
          className={`px-5 py-2 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
            isDark
              ? "bg-white text-black hover:bg-zinc-200 border-white"
              : "bg-black text-white hover:bg-zinc-800 border-black"
          }`}
        >
          <span>Hitung Biloks</span>
        </motion.button>
      </div>

      {/* Preset pills with LaTeX */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`text-[10px] uppercase tracking-wider font-semibold mr-1 ${
            isDark ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          Contoh Cepat:
        </span>
        {presets.map((p) => (
          <motion.button
            whileTap={{ scale: 0.94 }}
            key={p}
            type="button"
            onClick={() => {
              setInputFormula(p);
              handleCalculate(p);
            }}
            className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
              isDark
                ? "bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-800"
                : "bg-zinc-100 hover:bg-zinc-200 text-black border-zinc-200"
            }`}
          >
            <Latex math={speciesToLatex(p)} />
          </motion.button>
        ))}
      </div>

      {/* Result Card */}
      {analyzed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18 }}
          className={`mt-4 p-4 rounded-lg border space-y-3 transition-colors ${
            isDark
              ? "bg-zinc-950 border-zinc-800"
              : "bg-zinc-50 border-zinc-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold">
              <Latex math={speciesToLatex(analyzed.formula + (analyzed.charge !== 0 ? `^${analyzed.charge > 0 ? (analyzed.charge === 1 ? "+" : `${analyzed.charge}+`) : (analyzed.charge === -1 ? "-" : `${Math.abs(analyzed.charge)}-`)}` : ""))} />
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded border ${
                isDark
                  ? "bg-zinc-900 text-white border-zinc-700"
                  : "bg-zinc-200 text-black border-zinc-300"
              }`}
            >
              Muatan Total: <Latex math={analyzed.charge > 0 ? `+${analyzed.charge}` : `${analyzed.charge}`} />
            </span>
          </div>

          {/* Element Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {Object.entries(analyzed?.details || {}).map(([el, rawDetail]) => {
              const detail = rawDetail as ElementBiloksDetail;
              return (
                <div
                  key={el}
                  className={`p-3 rounded-md border transition-colors ${
                    isDark
                      ? "bg-black border-zinc-800"
                      : "bg-white border-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">
                      <Latex math={`\\mathrm{${el}}`} /> ({detail.count} atom)
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded border ${
                        isDark
                          ? "text-white bg-zinc-900 border-zinc-700"
                          : "text-black bg-zinc-100 border-zinc-300"
                      }`}
                    >
                      <Latex math={biloksToLatex(detail.biloks)} />
                    </span>
                  </div>
                  <div className={`text-[11px] ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    {detail.explanation}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className={`pt-2 border-t text-xs flex items-center gap-1.5 ${
              isDark
                ? "border-zinc-800 text-zinc-400"
                : "border-zinc-200 text-zinc-600"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Persamaan Aljabar: {analyzed.overallEquation}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};


