import React, { useState, useMemo } from "react";
import {
  PERIODIC_ELEMENTS,
  PeriodicElement,
  ElementCategory,
  CATEGORY_LABELS,
} from "../data/periodicTableData";
import { Latex } from "./Latex";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Search,
  Plus,
  Copy,
  Check,
  Zap,
  Info,
  Layers,
  Sparkles,
  ChevronRight,
  Atom,
  SlidersHorizontal,
  ArrowUpDown,
  Smartphone,
  Table,
} from "lucide-react";
import { BohrAtomVisualizer } from "./BohrAtomVisualizer";

interface PeriodicTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertElement?: (symbol: string) => void;
}

// Popular redox elements that students and chemists encounter frequently
const POPULAR_REDOX_ELEMENTS = [
  { symbol: "Mn", name: "Mangan", biloks: "+2, +4, +7", role: "Oksidator Kuat (KMnO₄)" },
  { symbol: "Fe", name: "Besi", biloks: "+2, +3", role: "Reduktor / Oksidator" },
  { symbol: "Cr", name: "Kromium", biloks: "+3, +6", role: "Oksidator (K₂Cr₂O₇)" },
  { symbol: "Cu", name: "Tembaga", biloks: "+1, +2", role: "Reduktor Khas Logam" },
  { symbol: "I", name: "Iodin", biloks: "-1, 0, +5", role: "Iodometri (I₂ / I⁻ / IO₃⁻)" },
  { symbol: "Cl", name: "Klorin", biloks: "-1, 0, +1, +5", role: "Autoredoks Gas Cl₂" },
  { symbol: "S", name: "Belerang", biloks: "-2, +4, +6", role: "Spesi SO₃²⁻, SO₄²⁻, S₂O₃²⁻" },
  { symbol: "N", name: "Nitrogen", biloks: "-3, +2, +4, +5", role: "Asam Nitrat HNO₃, NO₂" },
  { symbol: "O", name: "Oksigen", biloks: "-2, -1", role: "H₂O, O₂, Peroksida" },
  { symbol: "H", name: "Hidrogen", biloks: "+1, 0, -1", role: "Ion H⁺ Penyetara Asam" },
  { symbol: "Pb", name: "Timbal", biloks: "+2, +4", role: "Aki Timbal Pb / PbO₂" },
  { symbol: "Sn", name: "Timah", biloks: "+2, +4", role: "Reduktor Sn²⁺ → Sn⁴⁺" },
];

export const PeriodicTableModal: React.FC<PeriodicTableModalProps> = ({
  isOpen,
  onClose,
  onInsertElement,
}) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | "all">("all");
  const [selectedBlock, setSelectedBlock] = useState<"all" | "s" | "p" | "d" | "f">("all");
  const [sortOrder, setSortOrder] = useState<"number" | "name">("number");
  const [hoveredElement, setHoveredElement] = useState<PeriodicElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<PeriodicElement | null>(() =>
    PERIODIC_ELEMENTS.find((el) => el.symbol === "Mn") || PERIODIC_ELEMENTS[0]
  );
  const [copied, setCopied] = useState(false);
  const [insertToast, setInsertToast] = useState<string | null>(null);

  // Default to "tulisan" (Mode Tulisan Android) on mobile screens, or user toggle
  const [viewMode, setViewMode] = useState<"tulisan" | "table">(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return "tulisan";
    }
    return "tulisan"; // Default to tulisan for easier navigation
  });

  // Mobile drawer inspector open state
  const [showMobileInspector, setShowMobileInspector] = useState(false);

  // Filter elements
  const filteredElements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = PERIODIC_ELEMENTS.filter((el) => {
      const matchCat =
        selectedCategory === "all" || el.category === selectedCategory;
      const matchBlock =
        selectedBlock === "all" || el.block === selectedBlock;
      if (!matchCat || !matchBlock) return false;
      if (!q) return true;

      const matchSymbol = el.symbol.toLowerCase().includes(q);
      const matchName = el.name.toLowerCase().includes(q);
      const matchEn = el.nameEn.toLowerCase().includes(q);
      const matchNum = el.atomicNumber.toString() === q;
      const matchVal = el.commonOxidationStates.includes(q);

      return matchSymbol || matchName || matchEn || matchNum || matchVal;
    });

    if (sortOrder === "name") {
      return [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [searchQuery, selectedCategory, selectedBlock, sortOrder]);

  const activeInspector = hoveredElement || selectedElement;

  const handleCopySymbol = (sym: string) => {
    navigator.clipboard.writeText(sym);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleInsert = (sym: string) => {
    if (onInsertElement) {
      onInsertElement(sym);
      setInsertToast(`Unsur ${sym} disisipkan ke persamaan!`);
      setTimeout(() => setInsertToast(null), 1800);
    }
  };

  // Build 18-col grid map for standard desktop table
  const getGridPosition = (el: PeriodicElement): { row: number; col: number } => {
    if (el.category === "lanthanide") {
      const offset = el.atomicNumber - 57;
      return { row: 8, col: 3 + offset };
    }
    if (el.category === "actinide") {
      const offset = el.atomicNumber - 89;
      return { row: 9, col: 3 + offset };
    }
    return { row: el.period, col: el.group || 3 };
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
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={`relative rounded-2xl w-full max-w-7xl max-h-[96vh] sm:max-h-[92vh] flex flex-col border shadow-2xl overflow-hidden z-10 transition-colors ${
            isDark
              ? "bg-[#090A0D] border-zinc-800 text-white"
              : "bg-white border-zinc-200 text-black"
          }`}
        >
          {/* Header */}
          <div
            className={`p-3 sm:p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 transition-colors ${
              isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold border transition-colors shadow-xs ${
                  isDark
                    ? "bg-zinc-900 border-zinc-700 text-sky-400"
                    : "bg-white border-zinc-300 text-sky-600"
                }`}
              >
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight">
                    Tabel Periodik & Unsur Redoks
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border bg-sky-500/10 border-sky-500/30 text-sky-400 dark:text-sky-300">
                    118 Unsur
                  </span>
                </div>
                <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Sentuh kartu unsur untuk memasukkan ke rumus dan melihat analisis orbital elektron.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Responsive Mode Switcher: Mode Tulisan (Android) vs Tabel 18-Kolom */}
              <div
                className={`flex items-center p-0.5 rounded-lg border ${
                  isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-200 border-zinc-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setViewMode("tulisan")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "tulisan"
                      ? isDark
                        ? "bg-white text-black shadow-xs"
                        : "bg-black text-white shadow-xs"
                      : "text-zinc-400 hover:text-white"
                  }`}
                  title="Mode Tulisan responsif, mudah dibaca dan disentuh di HP Android"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mode Tulisan (Android)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "table"
                      ? isDark
                        ? "bg-white text-black shadow-xs"
                        : "bg-black text-white shadow-xs"
                      : "text-zinc-400 hover:text-white"
                  }`}
                  title="Tampilan tabel periodik penuh 18-kolom"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tabel 18-Kolom</span>
                  <span className="sm:hidden">Tabel</span>
                </button>
              </div>

              {/* Close Button */}
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

          {/* Quick Redox Elements Horizontal Strip (Unsur Populer Redoks) */}
          <div
            className={`px-3 py-2 border-b flex items-center gap-2 overflow-x-auto scrollbar-none transition-colors ${
              isDark ? "bg-zinc-950/80 border-zinc-800/80" : "bg-zinc-100/80 border-zinc-200"
            }`}
          >
            <div className="flex items-center gap-1 text-[11px] font-bold text-sky-400 shrink-0 pr-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Unsur Redoks Populer:</span>
            </div>
            {POPULAR_REDOX_ELEMENTS.map((item) => {
              const el = PERIODIC_ELEMENTS.find((p) => p.symbol === item.symbol);
              const isSelected = selectedElement?.symbol === item.symbol;
              return (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => {
                    if (el) {
                      setSelectedElement(el);
                      setShowMobileInspector(true);
                    }
                  }}
                  className={`px-2 py-1 rounded-lg border text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? isDark
                        ? "bg-sky-500 text-black border-sky-400 shadow-xs"
                        : "bg-sky-600 text-white border-sky-600 shadow-xs"
                      : isDark
                      ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                      : "bg-white border-zinc-300 text-zinc-800 hover:text-black hover:border-zinc-400"
                  }`}
                  title={`${item.name} (${item.role})`}
                >
                  <span className="text-sm">{item.symbol}</span>
                  <span className="text-[10px] opacity-70 font-sans font-medium hidden sm:inline">
                    {item.name}
                  </span>
                  <span
                    className={`text-[9px] px-1 rounded ${
                      isSelected
                        ? "bg-black/20 text-current"
                        : "bg-sky-500/15 text-sky-400"
                    }`}
                  >
                    {item.biloks.split(",")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter & Search Toolbar */}
          <div
            className={`p-3 border-b flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 shrink-0 transition-colors ${
              isDark ? "bg-black/60 border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-zinc-500" : "text-zinc-400"
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari simbol, nama, atau nomor atom (cth: Mn, Besi, 25, +7)..."
                className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border transition-colors focus:outline-none ${
                  isDark
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-sky-400"
                    : "bg-zinc-50 border-zinc-300 text-black placeholder:text-zinc-400 focus:border-sky-500"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Block & Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none text-xs">
              {/* Sort Order Toggle */}
              <button
                type="button"
                onClick={() => setSortOrder((prev) => (prev === "number" ? "name" : "number"))}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer border flex items-center gap-1 ${
                  isDark
                    ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
                    : "bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black"
                }`}
                title="Ubah Urutan"
              >
                <ArrowUpDown className="w-3 h-3 text-sky-400" />
                <span>{sortOrder === "number" ? "Urut No. Atom" : "Urut Nama A-Z"}</span>
              </button>

              {/* Block Filter */}
              <div className="flex items-center gap-0.5 border-l pl-1.5 border-zinc-700/50">
                {(["all", "s", "p", "d", "f"] as const).map((blk) => (
                  <button
                    key={blk}
                    type="button"
                    onClick={() => setSelectedBlock(blk)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
                      selectedBlock === blk
                        ? isDark
                          ? "bg-sky-400 text-black border-sky-400 font-bold"
                          : "bg-sky-600 text-white border-sky-600 font-bold"
                        : isDark
                        ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                        : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-black"
                    }`}
                  >
                    {blk === "all" ? "Semua Blok" : `Blok-${blk}`}
                  </button>
                ))}
              </div>

              {/* Category Pills */}
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  selectedCategory === "all"
                    ? isDark
                      ? "bg-white text-black border-white font-bold"
                      : "bg-black text-white border-black font-bold"
                    : isDark
                    ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                    : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-black"
                }`}
              >
                Semua Kategori ({PERIODIC_ELEMENTS.length})
              </button>
              {(Object.keys(CATEGORY_LABELS) as ElementCategory[]).map((cat) => {
                const labelObj = CATEGORY_LABELS[cat];
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                      isSelected
                        ? isDark
                          ? "bg-sky-400 text-black border-sky-400 font-bold"
                          : "bg-sky-600 text-white border-sky-600 font-bold"
                        : isDark
                        ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                        : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-black"
                    }`}
                  >
                    {labelObj.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            {/* View 1: MODE TULISAN / KARTU ANDROID (Designed for phone touch and readability) */}
            {viewMode === "tulisan" && (
              <div className="flex-1 p-3 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                    <span>
                      Menampilkan <strong className="text-sky-400">{filteredElements.length}</strong> unsur kimia (tulisan format kartu sentuh):
                    </span>
                    <span className="text-[11px] font-mono">
                      Klik <strong className="text-white">+ Sisipkan</strong> untuk langsung masukkan ke rumus
                    </span>
                  </div>

                  {/* Vertical / 2-Column Responsive Element Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredElements.map((el) => {
                      const isSelected = selectedElement?.symbol === el.symbol;
                      const catInfo = CATEGORY_LABELS[el.category];
                      const biloksList = el.commonOxidationStates.split(",").map((s) => s.trim());

                      return (
                        <motion.div
                          key={el.symbol}
                          whileHover={{ y: -2 }}
                          onClick={() => {
                            setSelectedElement(el);
                            setShowMobileInspector(true);
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative overflow-hidden ${
                            isSelected
                              ? isDark
                                ? "bg-sky-950/40 border-sky-400 shadow-md ring-1 ring-sky-400/40"
                                : "bg-sky-50 border-sky-500 shadow-md ring-1 ring-sky-500/40"
                              : isDark
                              ? "bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60"
                              : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-white"
                          }`}
                        >
                          {/* Top row: Symbol, Name, Category */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              {/* Prominent Atomic Symbol */}
                              <div
                                className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-extrabold border transition-all ${
                                  isSelected
                                    ? "bg-sky-500 text-black border-sky-400 shadow-xs"
                                    : isDark
                                    ? "bg-zinc-900 border-zinc-750 text-sky-400"
                                    : "bg-white border-zinc-300 text-sky-600 shadow-xs"
                                }`}
                              >
                                <span className="text-lg leading-none">{el.symbol}</span>
                                <span className="text-[9px] opacity-70 mt-0.5">#{el.atomicNumber}</span>
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-bold text-sm leading-tight">{el.name}</h4>
                                  <span className="text-[10px] font-mono opacity-60">({el.nameEn})</span>
                                </div>
                                <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                  Massa: {el.atomicMass} u • Blok-{el.block}
                                </div>
                              </div>
                            </div>

                            {/* Category Pill */}
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${
                                isDark ? catInfo.bgDark : catInfo.bgLight
                              }`}
                            >
                              {catInfo.label}
                            </span>
                          </div>

                          {/* Middle row: Biloks & Electron Config */}
                          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-zinc-800/40 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-zinc-400 font-medium">Biloks:</span>
                              <div className="flex flex-wrap gap-1">
                                {biloksList.map((b) => (
                                  <span
                                    key={b}
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${
                                      b.startsWith("+")
                                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                        : b.startsWith("-")
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                        : "bg-zinc-800 border-zinc-700 text-zinc-300"
                                    }`}
                                  >
                                    {b}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <span className="text-[10px] font-mono opacity-60 truncate max-w-[150px]">
                              {el.electronConfiguration}
                            </span>
                          </div>

                          {/* Bottom Action Buttons: Sisipkan & Detail */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInsert(el.symbol);
                              }}
                              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                                isDark
                                  ? "bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/40 text-sky-300"
                                  : "bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-700"
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Sisipkan {el.symbol}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedElement(el);
                                setShowMobileInspector(true);
                              }}
                              className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border ${
                                isDark
                                  ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
                                  : "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700"
                              }`}
                            >
                              <Info className="w-3.5 h-3.5" />
                              <span>Detail</span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* View 2: STANDARD 18-COLUMN TABLE (Desktop & Advanced View) */}
            {viewMode === "table" && (
              <div
                className={`flex-1 p-3 overflow-auto transition-all ${
                  hoveredElement ? "table-has-hover" : ""
                }`}
              >
                <div className="min-w-[760px] pb-2">
                  <div
                    className="grid auto-rows-fr relative gap-1"
                    style={{ gridTemplateColumns: "repeat(18, minmax(38px, 1fr))" }}
                  >
                    {PERIODIC_ELEMENTS.map((el) => {
                      const pos = getGridPosition(el);
                      const isHovered = hoveredElement?.symbol === el.symbol;
                      const isSelected = selectedElement?.symbol === el.symbol;
                      const isMatchesSearch =
                        !searchQuery ||
                        filteredElements.some((f) => f.symbol === el.symbol);
                      const isBlurred =
                        hoveredElement && hoveredElement.symbol !== el.symbol;

                      return (
                        <motion.div
                          key={el.symbol}
                          style={{ gridRow: pos.row, gridColumn: pos.col }}
                          onMouseEnter={() => setHoveredElement(el)}
                          onMouseLeave={() => setHoveredElement(null)}
                          onClick={() => {
                            setSelectedElement(el);
                            handleInsert(el.symbol);
                          }}
                          className={`relative aspect-square rounded-md border flex flex-col justify-between p-1 cursor-pointer transition-all select-none ${
                            isSelected
                              ? isDark
                                ? "bg-sky-500 text-black border-sky-300 ring-2 ring-sky-400 font-bold z-20 shadow-lg scale-105"
                                : "bg-sky-600 text-white border-sky-400 ring-2 ring-sky-500 font-bold z-20 shadow-lg scale-105"
                              : isHovered
                              ? isDark
                                ? "bg-zinc-800 text-white border-sky-400 scale-110 z-30 shadow-xl"
                                : "bg-zinc-200 text-black border-sky-500 scale-110 z-30 shadow-xl"
                              : isMatchesSearch
                              ? isDark
                                ? `${CATEGORY_LABELS[el.category].bgDark} hover:border-sky-400`
                                : `${CATEGORY_LABELS[el.category].bgLight} hover:border-sky-500`
                              : isDark
                              ? "bg-zinc-950/40 border-zinc-900 text-zinc-600 opacity-25"
                              : "bg-zinc-100/50 border-zinc-200 text-zinc-400 opacity-25"
                          } ${isBlurred && !isHovered ? "opacity-35" : ""}`}
                        >
                          <div className="flex items-center justify-between text-[8px] font-mono leading-none">
                            <span>{el.atomicNumber}</span>
                            <span className="opacity-70 text-[7px]">{el.block}</span>
                          </div>
                          <div className="text-center font-bold font-mono text-xs leading-none">
                            {el.symbol}
                          </div>
                          <div className="text-[7px] text-center font-medium truncate leading-none">
                            {el.name}
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Placeholders for Lanthanides & Actinides */}
                    <div
                      style={{ gridRow: 6, gridColumn: 3 }}
                      className={`rounded-md border font-mono font-bold flex flex-col items-center justify-center text-center p-1 text-[9px] ${
                        isDark
                          ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                          : "bg-emerald-50 border-emerald-200 text-emerald-800"
                      }`}
                    >
                      <span>57-71</span>
                      <span className="text-[6px]">La</span>
                    </div>

                    <div
                      style={{ gridRow: 7, gridColumn: 3 }}
                      className={`rounded-md border font-mono font-bold flex flex-col items-center justify-center text-center p-1 text-[9px] ${
                        isDark
                          ? "bg-red-950/20 border-red-800/40 text-red-300"
                          : "bg-red-50 border-red-200 text-red-800"
                      }`}
                    >
                      <span>89-103</span>
                      <span className="text-[6px]">Ac</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-300">Deret f:</span>
                      <span>Lantanida (57-71)</span>
                      <span>•</span>
                      <span>Aktinida (89-103)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sky-400 font-mono">
                      <Zap className="w-3 h-3" />
                      <span>Klik unsur untuk memasukkan ke rumus</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Element Inspector Panel / HUD */}
            <div
              className={`w-full lg:w-84 shrink-0 border-t lg:border-t-0 lg:border-l p-4 flex flex-col justify-between overflow-y-auto transition-colors ${
                isDark ? "bg-zinc-950/95 border-zinc-800" : "bg-zinc-50 border-zinc-200"
              }`}
            >
              {activeInspector ? (
                <div className="space-y-3.5">
                  {/* Big Card Header with Bohr Visualizer */}
                  <div
                    className={`p-3.5 rounded-xl border flex flex-col items-center relative overflow-hidden transition-all ${
                      isDark
                        ? "bg-black border-zinc-800 shadow-inner"
                        : "bg-white border-zinc-300 shadow-xs"
                    }`}
                  >
                    {/* Animated Bohr Atom Visualizer */}
                    <BohrAtomVisualizer
                      atomicNumber={activeInspector.atomicNumber}
                      symbol={activeInspector.symbol}
                      size={130}
                      className="mb-1"
                    />

                    <div className="w-full flex items-center justify-between pt-2 border-t border-zinc-800/40">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-bold font-mono text-sky-400">
                            {activeInspector.symbol}
                          </span>
                          <span className="text-xs font-mono opacity-60">
                            Z = {activeInspector.atomicNumber}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold leading-tight">
                          {activeInspector.name} ({activeInspector.nameEn})
                        </h4>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                            CATEGORY_LABELS[activeInspector.category].bgDark
                          }`}
                        >
                          {CATEGORY_LABELS[activeInspector.category].label}
                        </span>
                        <div className="text-[9px] font-mono mt-0.5 opacity-70">
                          {activeInspector.atomicMass} u
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Valensi & Bilangan Oksidasi */}
                  <div
                    className={`p-3 rounded-lg border transition-colors ${
                      isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200"
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold tracking-wider mb-1.5 flex items-center justify-between">
                      <span className={isDark ? "text-zinc-400" : "text-zinc-500"}>
                        Bilangan Oksidasi Populer:
                      </span>
                      <span className="text-sky-400 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Status Redoks
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {activeInspector.commonOxidationStates.split(",").map((s) => {
                        const trimmed = s.trim();
                        return (
                          <span
                            key={trimmed}
                            className="px-2 py-0.5 rounded text-xs font-mono font-bold border bg-sky-500/10 border-sky-500/30 text-sky-400 dark:text-sky-300"
                          >
                            <Latex math={trimmed} />
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Konfigurasi Elektron & Sifat Fisik */}
                  <div
                    className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                      isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                        Konfigurasi Elektron:
                      </span>
                      <span className="font-mono font-semibold">
                        {activeInspector.electronConfiguration}
                      </span>
                    </div>
                    {activeInspector.electronegativity && (
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                          Elektronegativitas (Pauling):
                        </span>
                        <span className="font-mono font-semibold">
                          {activeInspector.electronegativity}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                        Blok Orbital & Periode:
                      </span>
                      <span className="font-mono font-bold uppercase text-sky-400">
                        Blok-{activeInspector.block} • Periode {activeInspector.period}
                      </span>
                    </div>
                  </div>

                  {/* Deskripsi & Peran Redoks */}
                  <div
                    className={`p-3 rounded-lg border text-xs leading-relaxed space-y-2 ${
                      isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-zinc-300">
                      <Info className="w-3.5 h-3.5 text-sky-400" />
                      Peran Kimia & Reaksi:
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                      {activeInspector.description}
                    </p>
                    {activeInspector.redoxRole && (
                      <div className="pt-1 text-[11px] border-t border-zinc-800/60 font-mono text-sky-400 dark:text-sky-300">
                        {activeInspector.redoxRole}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400 text-xs">
                  <Layers className="w-8 h-8 mb-2 opacity-40 text-sky-400" />
                  Pilih unsur apapun untuk melihat animasi orbital dan sifat redoksnya.
                </div>
              )}

              {/* Action Buttons */}
              {activeInspector && (
                <div className="mt-3 pt-3 border-t border-zinc-800 flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => handleInsert(activeInspector.symbol)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border transition-colors ${
                      isDark
                        ? "bg-white text-black hover:bg-zinc-200 border-white shadow-xs"
                        : "bg-black text-white hover:bg-zinc-800 border-black shadow-xs"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Sisipkan {activeInspector.symbol}</span>
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => handleCopySymbol(activeInspector.symbol)}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors ${
                      isDark
                        ? "bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white"
                        : "bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black"
                    }`}
                    title="Salin Simbol"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Floating Insert Toast */}
          <AnimatePresence>
            {insertToast && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{insertToast}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
