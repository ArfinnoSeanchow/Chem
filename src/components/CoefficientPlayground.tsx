import React, { useState, useEffect, useMemo } from "react";
import { RedoxResult } from "../types/redox";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";
import { speciesToLatex, equationToLatex } from "../utils/latexHelper";
import { parseFormulaElements } from "../utils/chemistryParser";
import { motion, AnimatePresence } from "motion/react";
import {
  Gamepad2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Zap,
  Plus,
  Minus,
  Scale,
  ShieldCheck,
  Award,
  AlertTriangle,
} from "lucide-react";

interface CoefficientPlaygroundProps {
  result: RedoxResult;
  onApplyBalanced?: () => void;
}

interface CompoundItem {
  id: string;
  rawFormula: string;
  charge: number;
  atoms: Record<string, number>;
  correctCoefficient: number;
  currentCoefficient: number;
  isProduct: boolean;
}

export const CoefficientPlayground: React.FC<CoefficientPlaygroundProps> = ({
  result,
}) => {
  const { isDark } = useTheme();

  // Extract compounds from the balanced equation
  const initialCompounds: CompoundItem[] = useMemo(() => {
    if (!result || !result.isValid) return [];

    const items: CompoundItem[] = [];

    const reactantsSource =
      result.balancedReactants && result.balancedReactants.length > 0
        ? result.balancedReactants
        : result.reactants || [];

    const productsSource =
      result.balancedProducts && result.balancedProducts.length > 0
        ? result.balancedProducts
        : result.products || [];

    // Parse reactants
    reactantsSource.forEach((r, idx) => {
      const atoms = (r as any).elements || parseFormulaElements(r.formula) || {};
      items.push({
        id: `reactant-${idx}-${r.formula}`,
        rawFormula: r.formula,
        charge: r.charge || 0,
        atoms,
        correctCoefficient: r.coefficient || 1,
        currentCoefficient: r.coefficient || 1,
        isProduct: false,
      });
    });

    // Parse products
    productsSource.forEach((p, idx) => {
      const atoms = (p as any).elements || parseFormulaElements(p.formula) || {};
      items.push({
        id: `product-${idx}-${p.formula}`,
        rawFormula: p.formula,
        charge: p.charge || 0,
        atoms,
        correctCoefficient: p.coefficient || 1,
        currentCoefficient: p.coefficient || 1,
        isProduct: true,
      });
    });

    return items;
  }, [result]);

  const [compounds, setCompounds] = useState<CompoundItem[]>(initialCompounds);

  // Sync when result changes
  useEffect(() => {
    setCompounds(initialCompounds);
  }, [initialCompounds]);

  // Update a compound's coefficient
  const handleCoefficientChange = (id: string, newCoeff: number) => {
    const val = Math.max(0, Math.min(99, isNaN(newCoeff) ? 0 : newCoeff));
    setCompounds((prev) =>
      prev.map((c) => (c.id === id ? { ...c, currentCoefficient: val } : c))
    );
  };

  const handleResetToCorrect = () => {
    setCompounds((prev) =>
      prev.map((c) => ({ ...c, currentCoefficient: c.correctCoefficient }))
    );
  };

  const handleResetToOne = () => {
    setCompounds((prev) => prev.map((c) => ({ ...c, currentCoefficient: 1 })));
  };

  // Compute live atom balances
  const allElements = useMemo(() => {
    const set = new Set<string>();
    compounds.forEach((c) => {
      Object.keys(c.atoms || {}).forEach((el) => set.add(el));
    });
    return Array.from(set).sort();
  }, [compounds]);

  const atomVerification = useMemo(() => {
    return allElements.map((el) => {
      let left = 0;
      let right = 0;

      compounds.forEach((c) => {
        const count = ((c.atoms && c.atoms[el]) || 0) * (c.currentCoefficient || 0);
        if (c.isProduct) {
          right += count;
        } else {
          left += count;
        }
      });

      return {
        element: el,
        leftCount: left,
        rightCount: right,
        isBalanced: left === right && left > 0,
      };
    });
  }, [compounds, allElements]);

  // Compute live charge balance
  const chargeVerification = useMemo(() => {
    let left = 0;
    let right = 0;

    compounds.forEach((c) => {
      const q = (c.charge || 0) * (c.currentCoefficient || 0);
      if (c.isProduct) {
        right += q;
      } else {
        left += q;
      }
    });

    return {
      leftCharge: left,
      rightCharge: right,
      isBalanced: left === right,
    };
  }, [compounds]);

  const isAllAtomsBalanced =
    atomVerification.length > 0 && atomVerification.every((a) => a.isBalanced);
  const isChargeBalanced = chargeVerification.isBalanced;
  const isFullyBalanced = isAllAtomsBalanced && isChargeBalanced;

  const reactants = compounds.filter((c) => !c.isProduct);
  const products = compounds.filter((c) => c.isProduct);

  return (
    <div
      className={`border rounded-xl p-6 space-y-6 transition-colors font-sans ${
        isDark
          ? "bg-black border-zinc-800 text-white"
          : "bg-white border-zinc-200 text-black shadow-xs"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold ${
              isDark
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}
          >
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
              Coefficient Playground
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                  isFullyBalanced
                    ? isDark
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : isDark
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-amber-50 text-amber-800 border-amber-300"
                }`}
              >
                {isFullyBalanced ? "BALANCED ✓" : "UNBALANCED ✕"}
              </span>
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              Eksperimen ubah angka koefisien secara manual. Sistem memeriksa kesetaraan atom dan muatan seketika!
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToOne}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? "bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                : "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700 hover:text-black"
            }`}
          >
            Semua = 1
          </button>
          <button
            type="button"
            onClick={handleResetToCorrect}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark
                ? "bg-white text-black hover:bg-zinc-200 border-white font-bold"
                : "bg-black text-white hover:bg-zinc-800 border-black font-bold"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Jawaban Benar</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Chemical Equation Sandbox */}
      <div
        className={`p-5 rounded-xl border transition-colors ${
          isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
        }`}
      >
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3">
          Sesuaikan Koefisien Tiap Zat:
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2">
          {/* Reactants */}
          {reactants.map((c, idx) => (
            <React.Fragment key={c.id}>
              {idx > 0 && <span className="text-lg font-bold text-zinc-500">+</span>}
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                  c.currentCoefficient === c.correctCoefficient
                    ? isDark
                      ? "bg-zinc-900/90 border-zinc-700 ring-1 ring-zinc-600"
                      : "bg-white border-zinc-300 shadow-xs"
                    : isDark
                    ? "bg-amber-950/20 border-amber-500/40"
                    : "bg-amber-50/60 border-amber-300"
                }`}
              >
                {/* Stepper controls */}
                <div className="flex items-center border border-zinc-700 rounded-lg overflow-hidden bg-black/40">
                  <button
                    type="button"
                    onClick={() =>
                      handleCoefficientChange(c.id, c.currentCoefficient - 1)
                    }
                    className="p-1 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Kurangi"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={c.currentCoefficient}
                    onChange={(e) =>
                      handleCoefficientChange(c.id, parseInt(e.target.value, 10))
                    }
                    className="w-10 text-center font-mono font-bold text-sm bg-transparent border-x border-zinc-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleCoefficientChange(c.id, c.currentCoefficient + 1)
                    }
                    className="p-1 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Tambah"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Formula */}
                <div className="text-base font-semibold px-1">
                  <Latex
                    math={speciesToLatex(
                      c.charge !== 0
                        ? `${c.rawFormula}^${c.charge > 0 ? (c.charge === 1 ? "+" : `${c.charge}+`) : (c.charge === -1 ? "-" : `${Math.abs(c.charge)}-`)}`
                        : c.rawFormula
                    )}
                  />
                </div>
              </div>
            </React.Fragment>
          ))}

          {/* Arrow */}
          <div className="px-2 py-1 rounded bg-zinc-800 text-zinc-200 text-lg font-bold font-mono">
            →
          </div>

          {/* Products */}
          {products.map((c, idx) => (
            <React.Fragment key={c.id}>
              {idx > 0 && <span className="text-lg font-bold text-zinc-500">+</span>}
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                  c.currentCoefficient === c.correctCoefficient
                    ? isDark
                      ? "bg-zinc-900/90 border-zinc-700 ring-1 ring-zinc-600"
                      : "bg-white border-zinc-300 shadow-xs"
                    : isDark
                    ? "bg-amber-950/20 border-amber-500/40"
                    : "bg-amber-50/60 border-amber-300"
                }`}
              >
                {/* Stepper controls */}
                <div className="flex items-center border border-zinc-700 rounded-lg overflow-hidden bg-black/40">
                  <button
                    type="button"
                    onClick={() =>
                      handleCoefficientChange(c.id, c.currentCoefficient - 1)
                    }
                    className="p-1 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Kurangi"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={c.currentCoefficient}
                    onChange={(e) =>
                      handleCoefficientChange(c.id, parseInt(e.target.value, 10))
                    }
                    className="w-10 text-center font-mono font-bold text-sm bg-transparent border-x border-zinc-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleCoefficientChange(c.id, c.currentCoefficient + 1)
                    }
                    className="p-1 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Tambah"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Formula */}
                <div className="text-base font-semibold px-1">
                  <Latex
                    math={speciesToLatex(
                      c.charge !== 0
                        ? `${c.rawFormula}^${c.charge > 0 ? (c.charge === 1 ? "+" : `${c.charge}+`) : (c.charge === -1 ? "-" : `${Math.abs(c.charge)}-`)}`
                        : c.rawFormula
                    )}
                  />
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Real-time Status Verification Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Atom Balances */}
        <div
          className={`p-4 rounded-xl border ${
            isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>Kesetaraan Jumlah Atom</span>
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                isAllAtomsBalanced
                  ? isDark
                    ? "bg-emerald-950 border-emerald-700 text-emerald-300"
                    : "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : isDark
                  ? "bg-red-950 border-red-700 text-red-300"
                  : "bg-red-50 border-red-300 text-red-800"
              }`}
            >
              {isAllAtomsBalanced ? "Semua Atom Cocok ✓" : "Ada Atom Belum Setara ✕"}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            {atomVerification.map((a) => (
              <div
                key={a.element}
                className={`p-2 rounded-lg border flex items-center justify-between ${
                  a.isBalanced
                    ? isDark
                      ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300"
                      : "bg-emerald-50/60 border-emerald-200 text-emerald-800"
                    : isDark
                    ? "bg-red-950/20 border-red-900/40 text-red-300"
                    : "bg-red-50/60 border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  <span className="w-6 text-center">{a.element}</span>
                  <span className="text-zinc-400 font-normal">
                    Kiri: {a.leftCount} | Kanan: {a.rightCount}
                  </span>
                </div>
                <div>
                  {a.isBalanced ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Setara</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400 font-bold">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>
                        Selisih {Math.abs(a.leftCount - a.rightCount)}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charge Balance & Overall Status */}
        <div className="space-y-4">
          <div
            className={`p-4 rounded-xl border ${
              isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Kesetaraan Muatan Listrik</span>
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  isChargeBalanced
                    ? isDark
                      ? "bg-emerald-950 border-emerald-700 text-emerald-300"
                      : "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : isDark
                    ? "bg-red-950 border-red-700 text-red-300"
                    : "bg-red-50 border-red-300 text-red-800"
                }`}
              >
                {isChargeBalanced ? "Muatan Sama ✓" : "Muatan Berbeda ✕"}
              </span>
            </div>

            <div
              className={`p-3 rounded-lg border font-mono text-xs flex items-center justify-between ${
                isChargeBalanced
                  ? isDark
                    ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300"
                    : "bg-emerald-50/60 border-emerald-200 text-emerald-800"
                  : isDark
                  ? "bg-red-950/20 border-red-900/40 text-red-300"
                  : "bg-red-50/60 border-red-200 text-red-800"
              }`}
            >
              <div>
                Muatan Kiri:{" "}
                <strong>
                  {chargeVerification.leftCharge > 0 ? "+" : ""}
                  {chargeVerification.leftCharge}
                </strong>
                {" • "}
                Muatan Kanan:{" "}
                <strong>
                  {chargeVerification.rightCharge > 0 ? "+" : ""}
                  {chargeVerification.rightCharge}
                </strong>
              </div>
              <div className="font-bold">
                {isChargeBalanced ? "✓ Netral" : "✕ Selisih"}
              </div>
            </div>
          </div>

          {/* Celebratory Banner */}
          <AnimatePresence>
            {isFullyBalanced ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={`p-4 rounded-xl border flex items-center gap-3 ${
                  isDark
                    ? "bg-emerald-950/40 border-emerald-500 text-emerald-200"
                    : "bg-emerald-50 border-emerald-400 text-emerald-900"
                }`}
              >
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm">
                    BALANCED! Persamaan Reaksi Setara Sempurna
                  </div>
                  <div className="text-xs opacity-90">
                    Kekekalan massa dan muatan listrik terpenuhi 100% tanpa ada selisih atom maupun elektron.
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={`p-4 rounded-xl border flex items-center gap-3 ${
                  isDark
                    ? "bg-amber-950/30 border-amber-800/40 text-amber-200"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">Belum Setara:</span> Sesuaikan angka koefisien pada kotak di atas hingga seluruh atom dan muatan menunjukkan tanda centang hijau.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
