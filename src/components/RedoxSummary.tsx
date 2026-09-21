import React, { useState } from "react";
import { RedoxResult } from "../types/redox";
import {
  CheckCircle2,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Zap,
  ShieldCheck,
  Info,
  Download,
  HelpCircle,
  Gamepad2,
  Droplets,
  Plus,
  Minus,
  Scale,
  Sparkles,
  Award,
  Code2,
} from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";
import { equationToLatex, speciesToLatex, convertPlainTextToLatex } from "../utils/latexHelper";
import { DifficultyBadge } from "./DifficultyBadge";
import { WhySpeciesModal } from "./WhySpeciesModal";
import { InteractiveEquation } from "./InteractiveEquation";
import { ChemistryTooltip } from "./ChemistryTooltip";

interface RedoxSummaryProps {
  result: RedoxResult;
  onOpenExport?: () => void;
  onOpenPlayground?: () => void;
  onOpenTextToLatex?: () => void;
}

export const RedoxSummary: React.FC<RedoxSummaryProps> = ({
  result,
  onOpenExport,
  onOpenPlayground,
  onOpenTextToLatex,
}) => {
  const { isDark } = useTheme();
  const [copiedType, setCopiedType] = useState<"text" | "latex" | null>(null);
  const [whyTopic, setWhyTopic] = useState<
    "H2O" | "H+" | "OH-" | "e-" | "coefficient" | "general" | null
  >(null);

  const handleCopyText = () => {
    navigator.clipboard.writeText(result.balancedEquationString);
    setCopiedType("text");
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyLatex = () => {
    const latex = equationToLatex(result.balancedEquationString);
    navigator.clipboard.writeText(`$${latex}$`);
    setCopiedType("latex");
    setTimeout(() => setCopiedType(null), 2000);
  };

  const isAllAtomsBalanced = result.atomVerifications.every((a) => a.isBalanced);
  const isChargeBalanced = result.chargeVerification.isBalanced;

  // Calculate stoichiometric ratio string
  const reactantRatio = result.balancedReactants.map((r) => r.coefficient).join(" : ");
  const productRatio = result.balancedProducts.map((p) => p.coefficient).join(" : ");
  const fullRatio = `${reactantRatio} → ${productRatio}`;

  // Check added species in final balanced string
  const hasH2O = result.balancedEquationString.includes("H2O");
  const hasHPlus = result.balancedEquationString.includes("H+");
  const hasOHMinus = result.balancedEquationString.includes("OH-");

  return (
    <>
      <motion.div
        id="redox-result-section"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`border rounded-2xl p-6 sm:p-7 space-y-6 transition-colors font-sans shadow-md ${
          isDark
            ? "bg-black border-zinc-800 text-white shadow-black/40"
            : "bg-white border-zinc-200 text-black shadow-zinc-200/50"
        }`}
      >
        {/* ======================================================== */}
        {/* 1. JAWABAN MUTLAK SETARA (HERO ANSWER DISPLAY) */}
        {/* ======================================================== */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
            isDark
              ? "bg-gradient-to-b from-zinc-950 to-zinc-900/90 border-zinc-700/80 shadow-lg"
              : "bg-gradient-to-b from-zinc-50 to-zinc-100/80 border-zinc-300 shadow-sm"
          }`}
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl border flex items-center justify-center font-bold ${
                  isDark
                    ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                    : "bg-emerald-50 border-emerald-300 text-emerald-800"
                }`}
              >
                <Award className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full border tracking-wider flex items-center gap-1 ${
                      isDark
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-emerald-100 text-emerald-800 border-emerald-300"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Sudah Setara Sempurna (100% Balanced)</span>
                  </span>
                  <DifficultyBadge result={result} />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight mt-0.5">
                  Persamaan Reaksi Redoks Setara Sempurna
                </h3>
              </div>
            </div>

            {/* Quick Actions & 1-Click Copy */}
            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              {onOpenTextToLatex && (
                <button
                  type="button"
                  onClick={onOpenTextToLatex}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    isDark
                      ? "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/40 text-purple-300"
                      : "bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-800"
                  }`}
                  title="Buka Konverter Teks ke LaTeX untuk mengekspor rumus matematika"
                >
                  <Code2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Text ke LaTeX</span>
                </button>
              )}

              {onOpenExport && (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={onOpenExport}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    isDark
                      ? "bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/40 text-sky-300"
                      : "bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-800"
                  }`}
                  title="Unduh foto PNG atau ekspor LaTeX"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </motion.button>
              )}

              {/* Salin Teks Biasa */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={handleCopyText}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 border text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  copiedType === "text"
                    ? "bg-emerald-500 text-black border-emerald-400"
                    : isDark
                    ? "bg-white text-black hover:bg-zinc-200 border-white"
                    : "bg-black text-white hover:bg-zinc-800 border-black"
                }`}
                title="Salin hasil persamaan redoks setara teks"
              >
                {copiedType === "text" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-black" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Jawaban</span>
                  </>
                )}
              </motion.button>

              {/* Salin LaTeX */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={handleCopyLatex}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  copiedType === "latex"
                    ? "bg-emerald-500 text-black border-emerald-400"
                    : isDark
                    ? "bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                    : "bg-zinc-100 border-zinc-300 hover:bg-zinc-200 text-zinc-800"
                }`}
                title="Salin rumus KaTeX ($...$)"
              >
                {copiedType === "latex" ? (
                  <>
                    <Check className="w-3 h-3 text-black" />
                    <span>LaTeX OK</span>
                  </>
                ) : (
                  <>
                    <Code2 className="w-3 h-3 text-sky-400" />
                    <span>KaTeX</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Stoichiometric Ratio & Conservation Chips */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-md border ${
                isAllAtomsBalanced
                  ? isDark
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Semua Atom Terkonservasi</span>
            </span>

            <span
              className={`inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-md border ${
                isChargeBalanced
                  ? isDark
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
<span>Muatan Listrik Setara (Σ={(result.chargeVerification as any).leftTotal})</span>
            </span>

            <span
              className={`inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-md border ${
                isDark
                  ? "bg-zinc-900 border-zinc-700 text-zinc-300"
                  : "bg-zinc-100 border-zinc-300 text-zinc-700"
              }`}
            >
              <Scale className="w-3 h-3 text-sky-400" />
              <span>Rasio: <strong>{fullRatio}</strong></span>
            </span>
          </div>

          {/* INTERACTIVE BALANCED EQUATION WITH ACTIVE CLICKABLE/HOVERABLE COEFFICIENTS */}
          <div className="my-3">
            <InteractiveEquation
              result={result}
              onOpenWhyModal={(topic) => setWhyTopic(topic)}
            />
          </div>

          {/* INTERACTIVE BREAKDOWN: Added Species & Why-Tutor Chips */}
          <div className="mt-4 pt-3 border-t border-zinc-800/60 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="font-bold text-zinc-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                <span>Analisis Penambahan Spesies (Klik untuk Penjelasan):</span>
              </span>

              {onOpenPlayground && (
                <button
                  type="button"
                  onClick={onOpenPlayground}
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>Uji di Playground Koefisien</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Why H2O */}
              {hasH2O && (
                <button
                  type="button"
                  onClick={() => setWhyTopic("H2O")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                    isDark
                      ? "bg-sky-950/50 hover:bg-sky-900/60 border-sky-600/40 text-sky-300"
                      : "bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-800"
                  }`}
                >
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                  <span>
                    Ada <strong className="font-mono">H₂O</strong> (Kenapa ditambah?)
                  </span>
                </button>
              )}

              {/* Why H+ */}
              {hasHPlus && (
                <button
                  type="button"
                  onClick={() => setWhyTopic("H+")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                    isDark
                      ? "bg-emerald-950/50 hover:bg-emerald-900/60 border-emerald-600/40 text-emerald-300"
                      : "bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Ada <strong className="font-mono">H⁺</strong> (Kenapa suasana asam?)
                  </span>
                </button>
              )}

              {/* Why OH- */}
              {hasOHMinus && (
                <button
                  type="button"
                  onClick={() => setWhyTopic("OH-")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                    isDark
                      ? "bg-indigo-950/50 hover:bg-indigo-900/60 border-indigo-600/40 text-indigo-300"
                      : "bg-indigo-50 hover:bg-indigo-100 border-indigo-300 text-indigo-800"
                  }`}
                >
                  <Minus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    Ada <strong className="font-mono">OH⁻</strong> (Kenapa suasana basa?)
                  </span>
                </button>
              )}

              {/* Why e- */}
              <button
                type="button"
                onClick={() => setWhyTopic("e-")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                  isDark
                    ? "bg-amber-950/50 hover:bg-amber-900/60 border-amber-600/40 text-amber-300"
                    : "bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Transfer <strong className="font-mono">{result.electronsTransferred} e⁻</strong> (Kenapa jumlah ini?)
                </span>
              </button>

              {/* Why Coefficient */}
              <button
                type="button"
                onClick={() => setWhyTopic("coefficient")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                  isDark
                    ? "bg-violet-950/50 hover:bg-violet-900/60 border-violet-600/40 text-violet-300"
                    : "bg-violet-50 hover:bg-violet-100 border-violet-300 text-violet-800"
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-violet-400" />
                <span>Kenapa Koefisien Ini?</span>
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. GRID OF KEY REDOX INDICATORS (Oksidator, Reduktor, dll) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Zat Oksidator */}
          <div
            className={`p-4 rounded-xl border ${
              isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5 text-zinc-400">
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-sky-400" />
                <span className="text-[10px] uppercase tracking-wider font-bold">
                  Zat Oksidator
                </span>
              </div>
              <ChemistryTooltip
                data={{
                  title: "Terminologi: Zat Oksidator (Pengoksidasi)",
                  roleName: "Oxidizing Agent (Penerima e⁻)",
                  whySpecies:
                    "Zat yang mengoksidasi zat lain dengan cara menarik atau menyerap elektron. Spesi oksidator itu sendiri justru mengalami proses REDUKSI (penurunan bilangan oksidasi).",
                  whyCoefficient:
                    "Koefisiennya ditentukan berdasarkan jumlah mol yang dibutuhkan untuk menyerap elektron dari reduktor.",
                }}
              >
                <button
                  type="button"
                  aria-label="Penjelasan terminologi Zat Oksidator"
                  className="p-0.5 rounded text-zinc-500 hover:text-sky-400 transition-colors cursor-help"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </ChemistryTooltip>
            </div>
            <div className="text-base font-bold min-h-[1.75rem] flex items-center">
              {result.oxidizingAgent.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {result.oxidizingAgent.map((s, idx) => (
                    <ChemistryTooltip
                      key={idx}
                      data={{
                        title: "Zat Pengoksidasi (Oksidator)",
                        roleName: "Oksidator",
                        species: s,
                        whySpecies: "Mengalami reduksi (penurunan bilangan oksidasi) dengan menarik/menyerap elektron dari zat reduktor.",
                      }}
                    >
                      <span className="cursor-pointer transition-transform hover:scale-105 inline-block">
                        <Latex math={speciesToLatex(s)} />
                      </span>
                    </ChemistryTooltip>
                  ))}
                </div>
              ) : (
                "—"
              )}
            </div>
            <p className={`text-[11px] mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              Mengalami <strong>reduksi</strong> (menerima e⁻ / biloks turun).
            </p>
          </div>

          {/* Zat Reduktor */}
          <div
            className={`p-4 rounded-xl border ${
              isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5 text-zinc-400">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] uppercase tracking-wider font-bold">
                  Zat Reduktor
                </span>
              </div>
              <ChemistryTooltip
                data={{
                  title: "Terminologi: Zat Reduktor (Pereduksi)",
                  roleName: "Reducing Agent (Pelepas e⁻)",
                  whySpecies:
                    "Zat yang mereduksi zat lain dengan cara mendonorkan atau melepaskan elektron. Spesi reduktor itu sendiri justru mengalami proses OKSIDASI (kenaikan bilangan oksidasi).",
                  whyCoefficient:
                    "Koefisiennya ditentukan berdasarkan jumlah mol yang dibutuhkan untuk menyediakan elektron bagi oksidator.",
                }}
              >
                <button
                  type="button"
                  aria-label="Penjelasan terminologi Zat Reduktor"
                  className="p-0.5 rounded text-zinc-500 hover:text-emerald-400 transition-colors cursor-help"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </ChemistryTooltip>
            </div>
            <div className="text-base font-bold min-h-[1.75rem] flex items-center">
              {result.reducingAgent.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {result.reducingAgent.map((s, idx) => (
                    <ChemistryTooltip
                      key={idx}
                      data={{
                        title: "Zat Pereduksi (Reduktor)",
                        roleName: "Reduktor",
                        species: s,
                        whySpecies: "Mengalami oksidasi (kenaikan bilangan oksidasi) dengan melepaskan elektron kepada zat oksidator.",
                      }}
                    >
                      <span className="cursor-pointer transition-transform hover:scale-105 inline-block">
                        <Latex math={speciesToLatex(s)} />
                      </span>
                    </ChemistryTooltip>
                  ))}
                </div>
              ) : (
                "—"
              )}
            </div>
            <p className={`text-[11px] mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              Mengalami <strong>oksidasi</strong> (melepas e⁻ / biloks naik).
            </p>
          </div>

          {/* Hasil Oksidasi */}
          <div
            className={`p-4 rounded-xl border ${
              isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5 text-zinc-400">
              <span className="text-[10px] uppercase tracking-wider font-bold">
                Hasil Oksidasi
              </span>
              <ChemistryTooltip
                data={{
                  title: "Terminologi: Hasil Oksidasi",
                  roleName: "Oxidation Product",
                  whySpecies:
                    "Spesi/senyawa produk baru yang terbentuk di ruas kanan setelah zat reduktor melepaskan elektronnya (mengalami kenaikan biloks).",
                  whyCoefficient:
                    "Koefisiennya mengikuti kesetaraan atom pusat yang telah melepaskan elektron.",
                }}
              >
                <button
                  type="button"
                  aria-label="Penjelasan terminologi Hasil Oksidasi"
                  className="p-0.5 rounded text-zinc-500 hover:text-sky-400 transition-colors cursor-help"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </ChemistryTooltip>
            </div>
            <div className="text-base font-bold min-h-[1.75rem] flex items-center">
              {result.oxidationProducts.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {result.oxidationProducts.map((s, idx) => (
                    <ChemistryTooltip
                      key={idx}
                      data={{
                        title: "Produk Hasil Oksidasi",
                        roleName: "Hasil Oksidasi",
                        species: s,
                        whySpecies: "Senyawa/ion yang terbentuk setelah spesi reduktor melepaskan elektronnya.",
                      }}
                    >
                      <span className="cursor-pointer transition-transform hover:scale-105 inline-block">
                        <Latex math={speciesToLatex(s)} />
                      </span>
                    </ChemistryTooltip>
                  ))}
                </div>
              ) : (
                "—"
              )}
            </div>
            <p className={`text-[11px] mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              Senyawa/ion produk bentukan oksidasi.
            </p>
          </div>

          {/* Hasil Reduksi */}
          <div
            className={`p-4 rounded-xl border ${
              isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5 text-zinc-400">
              <span className="text-[10px] uppercase tracking-wider font-bold">
                Hasil Reduksi
              </span>
              <ChemistryTooltip
                data={{
                  title: "Terminologi: Hasil Reduksi",
                  roleName: "Reduction Product",
                  whySpecies:
                    "Spesi/senyawa produk baru yang terbentuk di ruas kanan setelah zat oksidator mengikat elektron (mengalami penurunan biloks).",
                  whyCoefficient:
                    "Koefisiennya mengikuti kesetaraan atom pusat yang telah menerima elektron.",
                }}
              >
                <button
                  type="button"
                  aria-label="Penjelasan terminologi Hasil Reduksi"
                  className="p-0.5 rounded text-zinc-500 hover:text-sky-400 transition-colors cursor-help"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </ChemistryTooltip>
            </div>
            <div className="text-base font-bold min-h-[1.75rem] flex items-center">
              {result.reductionProducts.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {result.reductionProducts.map((s, idx) => (
                    <ChemistryTooltip
                      key={idx}
                      data={{
                        title: "Produk Hasil Reduksi",
                        roleName: "Hasil Reduksi",
                        species: s,
                        whySpecies: "Senyawa/ion yang terbentuk setelah spesi oksidator menangkap elektron.",
                      }}
                    >
                      <span className="cursor-pointer transition-transform hover:scale-105 inline-block">
                        <Latex math={speciesToLatex(s)} />
                      </span>
                    </ChemistryTooltip>
                  ))}
                </div>
              ) : (
                "—"
              )}
            </div>
            <p className={`text-[11px] mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              Senyawa/ion produk bentukan reduksi.
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. VERIFIKASI KEKEKALAN MASSA & MUATAN SUMMARY */}
        {/* ======================================================== */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                isDark
                  ? "bg-zinc-900 border border-zinc-700 text-sky-400"
                  : "bg-sky-50 border border-sky-200 text-sky-600"
              }`}
            >
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-2">
                <span>Konservasi Muatan & Elektron:</span>
                <span className="font-mono text-sky-400">
                  {result.electronsTransferred} mol elektron
                </span>
              </div>
              <div className={`text-[11px] ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                Muatan Kiri ={" "}
                <strong>
                  {result.chargeVerification.leftCharge > 0 ? "+" : ""}
                  {result.chargeVerification.leftCharge}
                </strong>
                {" • "}
                Muatan Kanan ={" "}
                <strong>
                  {result.chargeVerification.rightCharge > 0 ? "+" : ""}
                  {result.chargeVerification.rightCharge}
                </strong>{" "}
                (Netralitas & Kesetaraan Mutlak Terpenuhi ✓)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                isAllAtomsBalanced && isChargeBalanced
                  ? isDark
                    ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                    : "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : isDark
                  ? "bg-red-950/40 border-red-800/60 text-red-300"
                  : "bg-red-50 border-red-300 text-red-800"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isAllAtomsBalanced && isChargeBalanced
                  ? "Massa & Muatan Terverifikasi Eksak"
                  : "Belum Setara"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tutor Modal for "Why Did You Add H2O / H+ / OH- / e-?" */}
      <WhySpeciesModal
        isOpen={whyTopic !== null}
        onClose={() => setWhyTopic(null)}
        result={result}
        initialTopic={whyTopic || "H2O"}
      />
    </>
  );
};
