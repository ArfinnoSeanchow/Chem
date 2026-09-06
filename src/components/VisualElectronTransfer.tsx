import React from "react";
import { RedoxResult } from "../types/redox";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";
import { Zap, ArrowRight, ShieldCheck, Flame, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { speciesToLatex } from "../utils/latexHelper";

interface VisualElectronTransferProps {
  result: RedoxResult;
}

export const VisualElectronTransfer: React.FC<VisualElectronTransferProps> = ({ result }) => {
  const { isDark } = useTheme();

  if (!result.isValid || result.redoxChanges.length === 0) return null;

  const oxidationChanges = result.redoxChanges.filter((c) => c.type === "oxidation");
  const reductionChanges = result.redoxChanges.filter((c) => c.type === "reduction");

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isDark ? "bg-[#090A0D] border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold border ${
              isDark
                ? "bg-zinc-900 border-zinc-700 text-sky-400"
                : "bg-sky-50 border-sky-200 text-sky-600"
            }`}
          >
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight">
              Diagram Visual Transfer Elektron
            </h4>
            <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              Aliran elektron dari zat pereduksi (reduktor) menuju zat pengoksidasi (oksidator).
            </p>
          </div>
        </div>

        {/* Total Electrons Transferred Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border bg-sky-500/10 border-sky-500/30 text-sky-400 dark:text-sky-300 font-mono text-xs font-bold shrink-0">
          <Zap className="w-3.5 h-3.5" />
          <span>{result.electronsTransferred} e⁻ Ditransfer</span>
        </div>
      </div>

      {/* Main Flow Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 items-center">
        {/* Left: Reduktor Card (Oksidasi) */}
        <div
          className={`lg:col-span-3 p-4 rounded-xl border flex flex-col justify-between relative overflow-hidden transition-all ${
            isDark
              ? "bg-zinc-950 border-zinc-800"
              : "bg-zinc-50 border-zinc-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Reduktor • Oksidasi
            </span>
            <span className={`text-[11px] font-mono ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              Melepas Elektron
            </span>
          </div>

          <div className="space-y-2.5 my-2">
            {oxidationChanges.map((change, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border ${
                  isDark ? "bg-black/80 border-zinc-800" : "bg-white border-zinc-200"
                }`}
              >
                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span className="font-bold">
                    <Latex math={speciesToLatex(change.reactantSpecies)} />
                    {" → "}
                    <Latex math={speciesToLatex(change.productSpecies)} />
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400">
                    +{change.totalElectrons} e⁻ lepas
                  </span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                  <span>
                    Unsur <strong>{change.element}</strong>:
                  </span>
                  <span>
                    Biloks: {change.reactantBiloks > 0 ? `+${change.reactantBiloks}` : change.reactantBiloks} →{" "}
                    {change.productBiloks > 0 ? `+${change.productBiloks}` : change.productBiloks}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={`text-[10px] mt-1 italic ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            Zat yang mengalami kenaikan bilangan oksidasi dan bertindak sebagai pendonor elektron.
          </div>
        </div>

        {/* Center: Electron Particle Bridge */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center py-2 lg:py-0">
          <div className="relative w-full flex items-center justify-center">
            {/* Animated Pulses */}
            <div className="flex items-center gap-1.5 w-full justify-center">
              <motion.div
                animate={{ x: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                className="w-2 h-2 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50"
              />
              <motion.div
                animate={{ x: [0, 12, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.4, delay: 0.2, ease: "easeInOut" }}
                className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50"
              />
              <motion.div
                animate={{ x: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.4, delay: 0.4, ease: "easeInOut" }}
                className="w-2 h-2 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50"
              />
            </div>
          </div>

          <div className="my-1 text-center">
            <span className="text-xs font-mono font-bold text-sky-400 dark:text-sky-300 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 whitespace-nowrap">
              {result.electronsTransferred} e⁻
            </span>
          </div>

          <div className={`text-[9px] uppercase tracking-wider font-bold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
            Aliran Elektron
          </div>
        </div>

        {/* Right: Oksidator Card (Reduksi) */}
        <div
          className={`lg:col-span-3 p-4 rounded-xl border flex flex-col justify-between relative overflow-hidden transition-all ${
            isDark
              ? "bg-zinc-950 border-zinc-800"
              : "bg-zinc-50 border-zinc-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
              Oksidator • Reduksi
            </span>
            <span className={`text-[11px] font-mono ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              Menangkap Elektron
            </span>
          </div>

          <div className="space-y-2.5 my-2">
            {reductionChanges.map((change, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border ${
                  isDark ? "bg-black/80 border-zinc-800" : "bg-white border-zinc-200"
                }`}
              >
                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span className="font-bold">
                    <Latex math={speciesToLatex(change.reactantSpecies)} />
                    {" → "}
                    <Latex math={speciesToLatex(change.productSpecies)} />
                  </span>
                  <span className="text-[11px] font-mono font-bold text-sky-400">
                    -{change.totalElectrons} e⁻ terima
                  </span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                  <span>
                    Unsur <strong>{change.element}</strong>:
                  </span>
                  <span>
                    Biloks: {change.reactantBiloks > 0 ? `+${change.reactantBiloks}` : change.reactantBiloks} →{" "}
                    {change.productBiloks > 0 ? `+${change.productBiloks}` : change.productBiloks}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={`text-[10px] mt-1 italic ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            Zat yang mengalami penurunan bilangan oksidasi dan bertindak sebagai penerima elektron.
          </div>
        </div>
      </div>
    </div>
  );
};
