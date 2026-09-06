import React, { useState } from "react";
import { RedoxResult } from "../types/redox";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";
import { equationToLatex, speciesToLatex } from "../utils/latexHelper";
import { motion, AnimatePresence } from "motion/react";
import {
  HelpCircle,
  X,
  Droplets,
  Plus,
  Minus,
  Zap,
  CheckCircle2,
  ArrowRight,
  Info,
  Scale,
  Sparkles,
} from "lucide-react";

interface WhySpeciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: RedoxResult;
  initialTopic?: "H2O" | "H+" | "OH-" | "e-" | "coefficient" | "general";
}

export const WhySpeciesModal: React.FC<WhySpeciesModalProps> = ({
  isOpen,
  onClose,
  result,
  initialTopic = "H2O",
}) => {
  const { isDark } = useTheme();
  const [activeTopic, setActiveTopic] = useState<
    "H2O" | "H+" | "OH-" | "e-" | "coefficient" | "general"
  >(initialTopic);

  if (!isOpen || !result.isValid) return null;

  // Compute stats for H2O and H+/OH- in the balanced equation
  const hasH2O = result.balancedEquationString.includes("H2O");
  const hasHPlus = result.balancedEquationString.includes("H+");
  const hasOHMinus = result.balancedEquationString.includes("OH-");

  // Extract counts from atom verification
  const oAtom = result.atomVerifications.find((a) => a.element === "O");
  const hAtom = result.atomVerifications.find((a) => a.element === "H");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className={`relative rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border shadow-2xl z-10 overflow-hidden font-sans transition-colors ${
            isDark
              ? "bg-black border-zinc-800 text-white"
              : "bg-white border-zinc-200 text-black"
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold ${
                  isDark
                    ? "bg-sky-950/60 border-sky-500/40 text-sky-400"
                    : "bg-sky-50 border-sky-200 text-sky-600"
                }`}
              >
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  Tutor Kimia: Mengapa Menambahkan Spesies Ini?
                </h3>
                <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Penjelasan logis aturan penyetaraan redoks metode ion-elektron & PBO.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  : "hover:bg-zinc-100 text-zinc-500 hover:text-black"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center gap-1.5 px-5 py-3 border-b border-zinc-800/60 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTopic("H2O")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border whitespace-nowrap ${
                activeTopic === "H2O"
                  ? isDark
                    ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                    : "bg-sky-50 text-sky-800 border-sky-300"
                  : isDark
                  ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                  : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-black"
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Kenapa H₂O?</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTopic("H+")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border whitespace-nowrap ${
                activeTopic === "H+"
                  ? isDark
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : isDark
                  ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                  : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-black"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Kenapa H⁺?</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTopic("OH-")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border whitespace-nowrap ${
                activeTopic === "OH-"
                  ? isDark
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                    : "bg-indigo-50 text-indigo-800 border-indigo-300"
                  : isDark
                  ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                  : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-black"
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Kenapa OH⁻?</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTopic("e-")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border whitespace-nowrap ${
                activeTopic === "e-"
                  ? isDark
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-amber-50 text-amber-800 border-amber-300"
                  : isDark
                  ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                  : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-black"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Kenapa e⁻?</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTopic("coefficient")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border whitespace-nowrap ${
                activeTopic === "coefficient"
                  ? isDark
                    ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                    : "bg-violet-50 text-violet-800 border-violet-300"
                  : isDark
                  ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                  : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-black"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Kenapa Koefisien Ini?</span>
            </button>
          </div>

          {/* Modal Body Content */}
          <div className="p-6 overflow-y-auto space-y-5 text-sm leading-relaxed">
            {/* TOPIC: WHY H2O */}
            {activeTopic === "H2O" && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border ${
                    isDark
                      ? "bg-sky-950/20 border-sky-800/40 text-sky-200"
                      : "bg-sky-50 border-sky-200 text-sky-900"
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider font-bold text-sky-400 mb-1 flex items-center gap-1.5">
                    <Droplets className="w-4 h-4" />
                    <span>Prinsip Penyetaraan Oksigen (O)</span>
                  </div>
                  <h4 className="text-lg font-bold mb-2">WHY H₂O?</h4>
                  <p className="text-xs sm:text-sm">
                    Molekul air (<Latex math="\text{H}_2\text{O}" />) ditambahkan karena jumlah atom{" "}
                    <strong>Oksigen (O)</strong> antara ruas reaktan (kiri) dan produk (kanan) belum seimbang sebelum reaksi disetarakan.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    className={`p-3.5 rounded-xl border ${
                      isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                    }`}
                  >
                    <div className="text-xs font-bold text-zinc-400 mb-1">Suasana Asam (Acidic):</div>
                    <p className="text-xs">
                      Tambahkan <Latex math="\text{H}_2\text{O}" /> pada ruas yang <strong>kekurangan atom Oksigen</strong>. Setiap penambahan 1 molekul <Latex math="\text{H}_2\text{O}" /> menyumbang 1 atom O dan 2 atom H.
                    </p>
                  </div>
                  <div
                    className={`p-3.5 rounded-xl border ${
                      isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                    }`}
                  >
                    <div className="text-xs font-bold text-zinc-400 mb-1">Suasana Basa (Basic):</div>
                    <p className="text-xs">
                      Tambahkan <Latex math="\text{H}_2\text{O}" /> pada ruas yang <strong>kelebihan atom Oksigen</strong> sebanyak selisihnya, kemudian tambahkan ion <Latex math="2\text{OH}^-" /> pada ruas sebaliknya.
                    </p>
                  </div>
                </div>

                {/* Specific context for this reaction */}
                <div
                  className={`p-4 rounded-xl border ${
                    isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-100 border-zinc-300"
                  }`}
                >
                  <div className="font-bold text-xs mb-2 text-zinc-300">
                    Pada Reaksi yang Anda Selesaikan:
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-zinc-800 font-mono text-xs mb-2">
                    <Latex math={equationToLatex(result.balancedEquationString)} />
                  </div>
                  <div className="text-xs space-y-1">
                    {oAtom ? (
                      <div className="flex items-center justify-between py-1 border-b border-zinc-800">
                        <span>Jumlah Total Atom Oksigen:</span>
                        <span className="font-bold text-emerald-400">
                          Kiri ({oAtom.leftCount}) = Kanan ({oAtom.rightCount}) ✓ Setara Sempurna
                        </span>
                      </div>
                    ) : (
                      <div>Reaksi ini tidak melibatkan atom Oksigen bebas.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TOPIC: WHY H+ */}
            {activeTopic === "H+" && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border ${
                    isDark
                      ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-200"
                      : "bg-emerald-50 border-emerald-200 text-emerald-900"
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Prinsip Penyetaraan Hidrogen & Muatan (Suasana Asam)</span>
                  </div>
                  <h4 className="text-lg font-bold mb-2">WHY H⁺?</h4>
                  <p className="text-xs sm:text-sm">
                    Ion hidrogen (<Latex math="\text{H}^+" />) ditambahkan karena reaksi berlangsung dalam medium <strong>asam</strong>, di mana larutan kaya akan ion hidronium/hidrogen bebas.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Menyetarakan Atom Hidrogen:</strong> Ketika <Latex math="\text{H}_2\text{O}" /> ditambahkan untuk menyetarakan Oksigen, ruas yang berlawanan menjadi kekurangan atom H. Ion <Latex math="\text{H}^+" /> ditambahkan untuk menyeimbangkan atom H tersebut.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Menyetarakan Muatan Positif:</strong> Setiap ion <Latex math="\text{H}^+" /> membawa muatan positif (+1), yang secara simultan menyeimbangkan muatan listrik total reaksi.
                    </div>
                  </div>
                </div>

                {hAtom && (
                  <div
                    className={`p-4 rounded-xl border ${
                      isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-100 border-zinc-300"
                    }`}
                  >
                    <div className="font-bold text-xs mb-1">Verifikasi Hidrogen pada Reaksi Ini:</div>
                    <div className="text-xs text-emerald-400 font-mono">
                      Ruas Kiri: {hAtom.leftCount} atom H • Ruas Kanan: {hAtom.rightCount} atom H (100% Setara Mutlak)
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TOPIC: WHY OH- */}
            {activeTopic === "OH-" && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border ${
                    isDark
                      ? "bg-indigo-950/20 border-indigo-800/40 text-indigo-200"
                      : "bg-indigo-50 border-indigo-200 text-indigo-900"
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                    <Minus className="w-4 h-4" />
                    <span>Prinsip Penyetaraan pada Suasana Basa (Basic)</span>
                  </div>
                  <h4 className="text-lg font-bold mb-2">WHY OH⁻?</h4>
                  <p className="text-xs sm:text-sm">
                    Dalam medium <strong>basa</strong>, tidak terdapat ion <Latex math="\text{H}^+" /> bebas dalam konsentrasi signifikan. Oleh karena itu, ion hidroksida (<Latex math="\text{OH}^-" />) digunakan sebagai penyeimbang.
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <div className="font-bold text-zinc-300">Metode Penyetaraan Basa Cepat:</div>
                  <ol className="list-decimal list-inside space-y-1 text-zinc-400">
                    <li>Setarakan seolah-olah suasana asam dengan menambahkan <Latex math="\text{H}^+" /> dan <Latex math="\text{H}_2\text{O}" />.</li>
                    <li>Tambahkan ion <Latex math="\text{OH}^-" /> ke <strong>KEDUA RUAS</strong> sejumlah ion <Latex math="\text{H}^+" /> yang ada.</li>
                    <li>Gabungkan <Latex math="\text{H}^+ + \text{OH}^- \rightarrow \text{H}_2\text{O}" />.</li>
                    <li>Sederhanakan molekul <Latex math="\text{H}_2\text{O}" /> yang muncul di kedua ruas.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* TOPIC: WHY e- */}
            {activeTopic === "e-" && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border ${
                    isDark
                      ? "bg-amber-950/20 border-amber-800/40 text-amber-200"
                      : "bg-amber-50 border-amber-200 text-amber-900"
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span>Kekekalan Muatan & Aliran Transfer Elektron</span>
                  </div>
                  <h4 className="text-lg font-bold mb-2">WHY e⁻ (Elektron)?</h4>
                  <p className="text-xs sm:text-sm">
                    Reaksi redoks pada hakikatnya adalah reaksi <strong>perpindahan elektron</strong>. Elektron (<Latex math="e^-" />) ditambahkan pada setengah reaksi untuk menyamakan total muatan listrik di ruas kiri dan kanan.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    className={`p-3.5 rounded-xl border ${
                      isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                    }`}
                  >
                    <div className="text-xs font-bold text-emerald-400 mb-1">Reaksi Oksidasi:</div>
                    <p className="text-xs">
                      Zat melepas elektron, sehingga bilangan oksidasi naik. Elektron ditulis di ruas <strong>produk (kanan)</strong>.
                    </p>
                  </div>
                  <div
                    className={`p-3.5 rounded-xl border ${
                      isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                    }`}
                  >
                    <div className="text-xs font-bold text-sky-400 mb-1">Reaksi Reduksi:</div>
                    <p className="text-xs">
                      Zat menyerap elektron, sehingga bilangan oksidasi turun. Elektron ditulis di ruas <strong>reaktan (kiri)</strong>.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                    isDark ? "bg-zinc-900 border-zinc-700" : "bg-zinc-100 border-zinc-300"
                  }`}
                >
                  <span>Total Elektron Ditransfer pada Reaksi Ini:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {result.electronsTransferred} mol e⁻
                  </span>
                </div>
              </div>
            )}

            {/* TOPIC: WHY THIS COEFFICIENT */}
            {activeTopic === "coefficient" && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border ${
                    isDark
                      ? "bg-violet-950/20 border-violet-800/40 text-violet-200"
                      : "bg-violet-50 border-violet-200 text-violet-900"
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider font-bold text-violet-400 mb-1 flex items-center gap-1.5">
                    <Scale className="w-4 h-4" />
                    <span>KPK Transfer Elektron (Hukum Kekekalan Muatan)</span>
                  </div>
                  <h4 className="text-lg font-bold mb-2">WHY THIS COEFFICIENT?</h4>
                  <p className="text-xs sm:text-sm">
                    Koefisien pengali dipilih berdasarkan <strong>KPK (Kelipatan Persekutuan Terkecil)</strong> dari jumlah elektron yang dilepas zat pereduksi dan jumlah elektron yang diserap zat pengoksidasi.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl border space-y-2 text-xs ${
                    isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <p>
                    Tidak boleh ada elektron bebas yang tersisa dalam persamaan reaksi redoks total. Seluruh elektron yang dilepaskan oleh reduktor harus tepat habis diserap oleh oksidator.
                  </p>
                  <div className="p-3 rounded bg-black/40 border border-zinc-800 font-mono text-center">
                    <span className="text-emerald-400">e⁻ dilepas (oksidasi)</span> = <span className="text-sky-400">e⁻ diserap (reduksi)</span> = <span className="text-amber-400">{result.electronsTransferred} e⁻</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                isDark
                  ? "bg-white text-black hover:bg-zinc-200 border-white"
                  : "bg-black text-white hover:bg-zinc-800 border-black"
              }`}
            >
              Paham, Tutup Penjelasan
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
