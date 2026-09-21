import React, { useState, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";
import {
  convertPlainTextToLatex,
  PlainTextToLatexResult,
} from "../utils/latexHelper";
import {
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Code2,
  FileText,
  HelpCircle,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Calculator,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TextToLatexConverterProps {
  onSendToSolver?: (equation: string) => void;
  onClose?: () => void;
}

const PRESET_QUICK_TEXTS = [
  {
    label: "Permanganat + Oksalat",
    text: "2MnO4- + 5C2O4 2- + 16H+ -> 2Mn2+ + 10CO2 + 8H2O",
    category: "Redoks Setara",
  },
  {
    label: "Dikromat + Besi(II)",
    text: "Cr2O7 2- + 6Fe 2+ + 14H+ -> 2Cr 3+ + 6Fe 3+ + 7H2O",
    category: "Redoks Setara",
  },
  {
    label: "Tembaga + Asam Nitrat",
    text: "Cu + 4HNO3 -> Cu(NO3)2 + 2NO2 + 2H2O",
    category: "Molekuler",
  },
  {
    label: "Disproporsionasi Klorin",
    text: "3Cl2 + 6OH- -> 5Cl- + ClO3- + 3H2O",
    category: "Autoredoks",
  },
  {
    label: "Ion Kompleks Sianida",
    text: "[Fe(CN)6]4- + Ce4+ -> [Fe(CN)6]3- + Ce3+",
    category: "Kompleks",
  },
  {
    label: "Fosfat Kalsium",
    text: "Ca3(PO4)2 + 3H2SO4 -> 3CaSO4 + 2H3PO4",
    category: "Molekuler",
  },
];

export const TextToLatexConverter: React.FC<TextToLatexConverterProps> = ({
  onSendToSolver,
  onClose,
}) => {
  const { isDark } = useTheme();
  const [inputText, setInputText] = useState<string>(
    "2MnO4- + 5C2O4 2- + 16H+ -> 2Mn2+ + 10CO2 + 8H2O"
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Convert plain text to LaTeX formats
  const conversion: PlainTextToLatexResult = useMemo(() => {
    return convertPlainTextToLatex(inputText);
  }, [inputText]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Smart capitalization auto-fix: fix kmno4 -> KMnO4, h2o -> H2O, etc.
  const handleAutoCapitalize = () => {
    let fixed = inputText;
    const replacements: [RegExp, string][] = [
      [/\bkmno4\b/gi, "KMnO4"],
      [/\bmno4\b/gi, "MnO4"],
      [/\bcr2o7\b/gi, "Cr2O7"],
      [/\bh2o\b/gi, "H2O"],
      [/\bco2\b/gi, "CO2"],
      [/\bhno3\b/gi, "HNO3"],
      [/\bh2so4\b/gi, "H2SO4"],
      [/\bhcl\b/gi, "HCl"],
      [/\bnaoh\b/gi, "NaOH"],
      [/\bfe\b/gi, "Fe"],
      [/\bcu\b/gi, "Cu"],
      [/\bmn\b/gi, "Mn"],
      [/\bcr\b/gi, "Cr"],
      [/\bcl\b/gi, "Cl"],
      [/\bbr\b/gi, "Br"],
      [/\bi2\b/gi, "I2"],
      [/\bo2\b/gi, "O2"],
      [/\bh2\b/gi, "H2"],
    ];
    for (const [pattern, rep] of replacements) {
      fixed = fixed.replace(pattern, rep);
    }
    setInputText(fixed);
  };

  return (
    <div
      className={`border rounded-2xl p-6 sm:p-8 transition-colors ${
        isDark
          ? "bg-zinc-950 border-zinc-800 text-white"
          : "bg-white border-zinc-200 text-black shadow-sm"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`p-2 rounded-xl ${
                isDark ? "bg-sky-500/10 text-sky-400" : "bg-sky-100 text-sky-700"
              }`}
            >
              <Code2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Konverter Teks Biasa ke LaTeX & KaTeX Kimia
              </h2>
              <p
                className={`text-xs sm:text-sm mt-0.5 ${
                  isDark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                Ketik teks persamaan kimia mentah atau salinan dari dokumen — hasilkan rumus KaTeX presisi tinggi dan teks Unicode yang rapi secara otomatis.
              </p>
            </div>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold self-start sm:self-auto cursor-pointer ${
              isDark
                ? "bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                : "bg-zinc-100 border-zinc-300 hover:bg-zinc-200 text-zinc-700"
            }`}
          >
            Tutup Konverter
          </button>
        )}
      </div>

      {/* Preset Quick Chips */}
      <div className="mt-5 space-y-2">
        <span
          className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isDark ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Preset Reaksi Siap Pakai:</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_QUICK_TEXTS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setInputText(preset.text)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                inputText === preset.text
                  ? isDark
                    ? "bg-sky-500/20 border-sky-500 text-sky-300 font-bold"
                    : "bg-sky-100 border-sky-400 text-sky-900 font-bold"
                  : isDark
                  ? "bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800"
                  : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="plain-chemical-input"
            className="text-xs font-bold uppercase tracking-wider text-zinc-400"
          >
            Teks Biasa / Mentah (Input):
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoCapitalize}
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                isDark
                  ? "bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                  : "bg-zinc-100 border-zinc-300 hover:bg-zinc-200 text-zinc-700"
              }`}
              title="Perbaiki huruf kecil unsur seperti kmno4 -> KMnO4"
            >
              <Wand2 className="w-3 h-3 text-sky-400" />
              <span>Auto-Kapital</span>
            </button>
            <button
              type="button"
              onClick={() => setInputText("")}
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                isDark
                  ? "bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                  : "bg-zinc-100 border-zinc-300 hover:bg-zinc-200 text-zinc-700"
              }`}
            >
              <RefreshCw className="w-3 h-3 text-zinc-400" />
              <span>Bersihkan</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            id="plain-chemical-input"
            rows={2}
            value={inputText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)}
            placeholder="Contoh: 2MnO4- + 5C2O4 2- + 16H+ -> 2Mn2+ + 10CO2 + 8H2O"
            className={`w-full p-3.5 rounded-xl font-mono text-sm border focus:outline-none focus:ring-2 transition-all ${
              isDark
                ? "bg-zinc-900/80 border-zinc-700 text-zinc-100 focus:border-sky-500 focus:ring-sky-500/20"
                : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-sky-500 focus:ring-sky-500/20"
            }`}
          />
        </div>

        {/* Warning if any */}
        {conversion.warningMessage && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{conversion.warningMessage}</span>
          </div>
        )}
      </div>

      {/* Live Preview Display (KaTeX Rendering) */}
      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hasil Render KaTeX Real-Time:</span>
          </span>
          {conversion.isReaction && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Persamaan Reaksi Terdeteksi
            </span>
          )}
        </div>

        <div
          className={`p-5 rounded-xl border flex flex-col items-center justify-center min-h-[90px] overflow-x-auto transition-colors ${
            isDark
              ? "bg-black/60 border-zinc-800 text-white"
              : "bg-zinc-50 border-zinc-200 text-zinc-900"
          }`}
        >
          {conversion.cleanedText ? (
            <div className="text-lg sm:text-2xl py-2 px-1 text-center select-all">
              <Latex math={conversion.katexBlock.replace(/^\$\$|\$\$$/g, "")} />
            </div>
          ) : (
            <span className="text-xs text-zinc-500 italic">
              Masukkan rumus atau persamaan di atas untuk melihat tampilan KaTeX langsung...
            </span>
          )}
        </div>
      </div>

      {/* Fast Action: Setarakan Reaksi Ini */}
      {conversion.isReaction && onSendToSolver && (
        <div className="mt-4 p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Calculator className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              Ingin menyetarakan persamaan ini secara otomatis langkah demi langkah?
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSendToSolver(conversion.cleanedText)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs transition-colors cursor-pointer shrink-0"
          >
            <span>Setarakan Reaksi Ini Langsung</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Output Format Grid & 1-Click Copy */}
      <div className="mt-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-zinc-400" />
          <span>Format Kode LaTeX & Teks Bersih:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Format 1: KaTeX Inline */}
          <div
            className={`p-3.5 rounded-xl border transition-colors ${
              isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-sky-400">KaTeX Inline ($...$)</span>
              <button
                type="button"
                onClick={() => copyToClipboard(conversion.katexInline, "katex-inline")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                  copiedKey === "katex-inline"
                    ? "bg-emerald-500 text-black border-emerald-400"
                    : isDark
                    ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200"
                    : "bg-zinc-100 border-zinc-300 hover:bg-zinc-200 text-zinc-800"
                }`}
              >
                {copiedKey === "katex-inline" ? (
                  <>
                    <Check className="w-3 h-3 text-black" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-xs text-zinc-300 break-all p-2 rounded bg-black/40 border border-zinc-800/80 select-all">
              {conversion.katexInline || "-"}
            </p>
          </div>

          {/* Format 2: KaTeX Block Display */}
          <div
            className={`p-3.5 rounded-xl border transition-colors ${
              isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-400">KaTeX Display Block ($$...$$)</span>
              <button
                type="button"
                onClick={() => copyToClipboard(conversion.katexBlock, "katex-block")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                  copiedKey === "katex-block"
                    ? "bg-emerald-500 text-black border-emerald-400"
                    : isDark
                    ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200"
                    : "bg-zinc-100 border-zinc-300 hover:bg-zinc-200 text-zinc-800"
                }`}
              >
                {copiedKey === "katex-block" ? (
                  <>
                    <Check className="w-3 h-3 text-black" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-xs text-zinc-300 break-all p-2 rounded bg-black/40 border border-zinc-800/80 select-all">
              {conversion.katexBlock || "-"}
            </p>
          </div>

          {/* Format 3: mhchem package */}
          <div
            className={`p-3.5 rounded-xl border transition-colors ${
              isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-purple-400">LaTeX mhchem (\ce&#123;...&#125;)</span>
              <button
                type="button"
                onClick={() => copyToClipboard(conversion.mhchemString, "mhchem")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                  copiedKey === "mhchem"
                    ? "bg-emerald-500 text-black border-emerald-400"
                    : isDark
                    ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200"
                    : "bg-zinc-100 border-zinc-300 hover:bg-zinc-200 text-zinc-800"
                }`}
              >
                {copiedKey === "mhchem" ? (
                  <>
                    <Check className="w-3 h-3 text-black" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-xs text-zinc-300 break-all p-2 rounded bg-black/40 border border-zinc-800/80 select-all">
              {conversion.mhchemString || "-"}
            </p>
          </div>

          {/* Format 4: Clean Unicode Chemistry Text */}
          <div
            className={`p-3.5 rounded-xl border transition-colors ${
              isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-400">Teks Unicode Bersih (Word / Chat)</span>
              <button
                type="button"
                onClick={() => copyToClipboard(conversion.unicodeText, "unicode")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                  copiedKey === "unicode"
                    ? "bg-emerald-500 text-black border-emerald-400"
                    : isDark
                    ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200"
                    : "bg-zinc-100 border-zinc-300 hover:bg-zinc-200 text-zinc-800"
                }`}
              >
                {copiedKey === "unicode" ? (
                  <>
                    <Check className="w-3 h-3 text-black" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-xs text-zinc-300 break-all p-2 rounded bg-black/40 border border-zinc-800/80 select-all">
              {conversion.unicodeText || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
