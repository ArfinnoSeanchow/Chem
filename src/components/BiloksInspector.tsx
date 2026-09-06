import React, { useState } from "react";
import { ParsedSpecies, RedoxChange } from "../types/redox";
import { Calculator, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";
import { speciesToLatex, biloksToLatex } from "../utils/latexHelper";

interface BiloksInspectorProps {
  reactants: ParsedSpecies[];
  products: ParsedSpecies[];
  redoxChanges: RedoxChange[];
}

export const BiloksInspector: React.FC<BiloksInspectorProps> = ({
  reactants,
  products,
  redoxChanges,
}) => {
  const { isDark } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIndex(expandedIndex === id ? null : id);
  };

  const isElementChanged = (speciesRaw: string, element: string) => {
    return redoxChanges.some(
      (c) => (c.reactantSpecies === speciesRaw || c.productSpecies === speciesRaw) && c.element === element
    );
  };

  const renderSpeciesColumn = (
    speciesList: ParsedSpecies[],
    prefix: string,
    title: string
  ) => (
    <div className="space-y-3">
      <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
        {title}
      </div>

      {speciesList.map((item, idx) => {
        const cardId = `${prefix}-${idx}`;
        const isExpanded = expandedIndex === cardId;

        return (
          <div
            key={cardId}
            className={`border rounded-lg overflow-hidden transition-colors ${
              isDark
                ? "border-zinc-800 bg-zinc-950"
                : "border-zinc-200 bg-white shadow-xs"
            }`}
          >
            <div
              onClick={() => toggleExpand(cardId)}
              className={`p-3.5 flex items-center justify-between cursor-pointer select-none transition-colors ${
                isDark
                  ? "hover:bg-zinc-900/60"
                  : "hover:bg-zinc-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base font-bold">
                  <Latex math={speciesToLatex(item.formula + (item.charge !== 0 ? `^${item.charge > 0 ? (item.charge === 1 ? "+" : `${item.charge}+`) : (item.charge === -1 ? "-" : `${Math.abs(item.charge)}-`)}` : ""))} />
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded border ${
                    isDark
                      ? "text-zinc-300 bg-zinc-900 border-zinc-700"
                      : "text-zinc-700 bg-zinc-100 border-zinc-300"
                  }`}
                >
                  Muatan: <Latex math={item.charge > 0 ? `+${item.charge}` : `${item.charge}`} />
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold hidden sm:inline text-zinc-400">
                  {isExpanded ? "Tutup Rincian" : "Lihat Aturan"}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                )}
              </div>
            </div>

            {/* Biloks Pills Summary */}
            <div
              className={`px-3.5 py-2 border-t flex flex-wrap gap-2 transition-colors ${
                isDark
                  ? "bg-black border-zinc-800"
                  : "bg-zinc-50 border-zinc-200"
              }`}
            >
              {Object.entries(item.oxidationStates || {}).map(([el, b]) => {
                const changed = isElementChanged(item.raw, el);
                const bNum = Number(b);
                return (
                  <div
                    key={el}
                    className={`text-xs px-2 py-0.5 rounded-md flex items-center gap-1.5 border ${
                      changed
                        ? isDark
                          ? "bg-white text-black font-bold border-white"
                          : "bg-black text-white font-bold border-black"
                        : isDark
                        ? "bg-zinc-900 text-white border-zinc-700"
                        : "bg-white text-black border-zinc-300"
                    }`}
                  >
                    <span>
                      <Latex math={`\\mathrm{${el}}`} />:
                    </span>
                    <Latex math={biloksToLatex(bNum)} />
                    {changed && (
                      <span
                        className={`text-[9px] font-bold px-1 rounded uppercase tracking-wider ${
                          isDark
                            ? "bg-zinc-200 text-black"
                            : "bg-zinc-800 text-white"
                        }`}
                      >
                        Redoks
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={`p-3.5 border-t space-y-2 text-xs transition-colors overflow-hidden ${
                    isDark
                      ? "bg-zinc-950 border-zinc-800"
                      : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-zinc-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    Penurunan Matematis & Kaidah IUPAC:
                  </div>
                  {Object.entries(item.oxidationCalculations || {}).map(
                    ([el, exp]) => {
                      const bVal = item.oxidationStates ? (item.oxidationStates[el] ?? 0) : 0;
                      return (
                        <div
                          key={el}
                          className={`p-2.5 rounded-md border transition-colors ${
                            isDark
                              ? "bg-black border-zinc-800"
                              : "bg-white border-zinc-200"
                          }`}
                        >
                          <div className="font-bold mb-1">
                            Unsur <Latex math={`\\mathrm{${el}}`} /> (Biloks = <Latex math={biloksToLatex(bVal)} />):
                          </div>
                          <div className={`whitespace-pre-line leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                            {exp}
                          </div>
                        </div>
                      );
                    }
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );

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
            Pemeriksa & Penjelasan Bilangan Oksidasi (Biloks)
          </h3>
          <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            Klik salah satu senyawa untuk melihat rincian aljabar dan aturan penentuan biloks setiap atomnya.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {renderSpeciesColumn(reactants, "r", "Reaktan (Ruas Kiri)")}
        {renderSpeciesColumn(products, "p", "Produk (Ruas Kanan)")}
      </div>
    </motion.div>
  );
};


