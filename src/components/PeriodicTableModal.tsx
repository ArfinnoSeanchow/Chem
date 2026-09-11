import React, { useState, useMemo, useEffect } from "react";
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
  ArrowUpDown,
  Smartphone,
  Table,
  ChevronDown,
  Atom,
  Flame,
  Radio,
  Sparkles,
  Compass,
  Activity,
  ShieldAlert,
  SlidersHorizontal,
  ExternalLink
} from "lucide-react";
import { BohrAtomVisualizer } from "./BohrAtomVisualizer";

interface PeriodicTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertElement?: (symbol: string) => void;
}

const POPULAR_REDOX_ELEMENTS = [
  { symbol: "Mn", name: "Mangan", biloks: "+2, +4, +7", role: "Oksidator Kuat (KMnO₄)" },
  { symbol: "Fe", name: "Besi", biloks: "+2, +3", role: "Reduktor / Oksidator Khas" },
  { symbol: "Cr", name: "Kromium", biloks: "+3, +6", role: "Oksidator Asam (K₂Cr₂O₇)" },
  { symbol: "Cu", name: "Tembaga", biloks: "+1, +2", role: "Pasangan Sel Volta Cu/Zn" },
  { symbol: "I", name: "Iodin", biloks: "-1, 0, +5", role: "Titrasi Iodometri (I₂ / I⁻)" },
  { symbol: "Cl", name: "Klorin", biloks: "-1, 0, +1, +5", role: "Disproporsionasi Klor" },
  { symbol: "S", name: "Belerang", biloks: "-2, +4, +6", role: "Spesi Redoks Tiosulfat" },
  { symbol: "N", name: "Nitrogen", biloks: "-3, +2, +4, +5", role: "Oksidator Asam Nitrat" },
  { symbol: "O", name: "Oksigen", biloks: "-2, -1", role: "Spesi Air & Peroksida" },
  { symbol: "H", name: "Hidrogen", biloks: "+1, 0, -1", role: "Penyetara Muatan Asam (H⁺)" },
  { symbol: "Pb", name: "Timbal", biloks: "+2, +4", role: "Katoda/Anoda Sel Aki PbO₂" },
  { symbol: "Sn", name: "Timah", biloks: "+2, +4", role: "Reduktor Sn²⁺ → Sn⁴⁺" },
];

const BLOCK_THEMES: Record<"s" | "p" | "d" | "f", { 
  border: string; 
  badge: string; 
  accentColor: string;
  glowEffect: string;
  radialGradient: string;
}> = {
  s: { 
    border: "border-emerald-500/50 hover:border-emerald-400", 
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    accentColor: "text-emerald-400",
    glowEffect: "shadow-emerald-500/20",
    radialGradient: "from-emerald-500/25 via-emerald-600/10 to-transparent"
  },
  p: { 
    border: "border-sky-500/50 hover:border-sky-400", 
    badge: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    accentColor: "text-sky-400",
    glowEffect: "shadow-sky-500/20",
    radialGradient: "from-sky-500/25 via-sky-600/10 to-transparent"
  },
  d: { 
    border: "border-amber-500/50 hover:border-amber-400", 
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    accentColor: "text-amber-400",
    glowEffect: "shadow-amber-500/20",
    radialGradient: "from-amber-500/25 via-amber-600/10 to-transparent"
  },
  f: { 
    border: "border-fuchsia-500/50 hover:border-fuchsia-400", 
    badge: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
    accentColor: "text-fuchsia-400",
    glowEffect: "shadow-fuchsia-500/20",
    radialGradient: "from-fuchsia-500/25 via-fuchsia-600/10 to-transparent"
  },
};

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
  const [selectedElement, setSelectedElement] = useState<PeriodicElement>(() =>
    PERIODIC_ELEMENTS.find((el) => el.symbol === "Mn") || PERIODIC_ELEMENTS[0]
  );

  const [activeTabHud, setActiveTabHud] = useState<"orbital" | "redox">("orbital");
  const [copied, setCopied] = useState<string | null>(null);
  const [insertToast, setInsertToast] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [viewMode, setViewMode] = useState<"tulisan" | "table">("table");

  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    setViewMode(isMobile ? "tulisan" : "table");
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredElements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = PERIODIC_ELEMENTS.filter((el) => {
      const matchCat = selectedCategory === "all" || el.category === selectedCategory;
      const matchBlock = selectedBlock === "all" || el.block === selectedBlock;
      if (!matchCat || !matchBlock) return false;
      if (!q) return true;

      return (
        el.symbol.toLowerCase().includes(q) ||
        el.name.toLowerCase().includes(q) ||
        el.nameEn.toLowerCase().includes(q) ||
        el.atomicNumber.toString() === q ||
        el.commonOxidationStates.includes(q)
      );
    });

    if (sortOrder === "name") {
      return [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [searchQuery, selectedCategory, selectedBlock, sortOrder]);

  const activeInspector = hoveredElement || selectedElement;
  const currentBlockTheme = BLOCK_THEMES[activeInspector.block];

  const handleCopyText = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopied(label);
    setTimeout(() => setCopied(null), 1400);
  };

  const handleExplicitInsert = (sym: string) => {
    if (onInsertElement) {
      onInsertElement(sym);
      setInsertToast(`Unsur ${sym} ditambahkan ke persamaan reaksi!`);
      setTimeout(() => setInsertToast(null), 1800);
    }
  };

  const getGridPosition = (el: PeriodicElement): { row: number; col: number } => {
    if (el.category === "lanthanide") {
      return { row: 8, col: 3 + (el.atomicNumber - 57) };
    }
    if (el.category === "actinide") {
      return { row: 9, col: 3 + (el.atomicNumber - 89) };
    }
    return { row: el.period, col: el.group || 3 };
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden select-none">
        
        {/* Ambient Chromatic Backdrop Blur Layer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-2xl transition-all"
        />

        {/* Modal Outer Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 14 }}
          transition={{ type: "spring", damping: 28, stiffness: 360 }}
          className={`relative w-full max-w-[1460px] h-[96vh] sm:h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden z-10 backdrop-blur-3xl transition-colors ${
            isDark 
              ? "bg-zinc-950/90 border-zinc-800/90 text-zinc-100 shadow-sky-950/30" 
              : "bg-white/95 border-zinc-200 text-zinc-900 shadow-zinc-400/30"
          }`}
        >
          {/* Top Bar Header */}
          <div className={`px-4 sm:px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 backdrop-blur-xl ${
            isDark ? "bg-zinc-950/70 border-zinc-800/80" : "bg-white/70 border-zinc-200"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm ${
                isDark 
                  ? "bg-zinc-900/90 border-zinc-700/70 text-sky-400" 
                  : "bg-white border-zinc-300 text-sky-600 shadow-xs"
              }`}>
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight">Katalog Periodik & Reaktivitas Kuantum</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400">
                    118 IUPAC
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 hidden sm:block">
                  Klik elemen untuk inspeksi orbital & sifat redoks tanpa mengubah rumus yang sedang disusun.
                </p>
              </div>
            </div>

            {/* View Switcher & Action Controls */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center p-1 rounded-xl border backdrop-blur-md ${
                isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-zinc-100 border-zinc-300"
              }`}>
                <button
                  type="button"
                  onClick={() => setViewMode("tulisan")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "tulisan"
                      ? isDark ? "bg-zinc-800 text-white shadow-sm" : "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Kartu Sentuh (HP)</span>
                  <span className="sm:hidden">Daftar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "table"
                      ? isDark ? "bg-zinc-800 text-white shadow-sm" : "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Table className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">18-Kolom Matriks</span>
                  <span className="sm:hidden">Matriks</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isDark 
                    ? "border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white" 
                    : "border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900"
                }`}
                title="Tutup (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Redox Elements Horizontal Strip */}
          <div className={`px-4 sm:px-6 py-2 border-b flex items-center gap-2 overflow-x-auto scrollbar-none backdrop-blur-md ${
            isDark ? "bg-zinc-900/20 border-zinc-800/80" : "bg-zinc-50/50 border-zinc-200"
          }`}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 shrink-0 flex items-center gap-1 pr-1">
              <Zap className="w-3.5 h-3.5" />
              Unsur Redoks Kunci:
            </span>
            {POPULAR_REDOX_ELEMENTS.map((item) => {
              const el = PERIODIC_ELEMENTS.find((p) => p.symbol === item.symbol);
              const isInspected = activeInspector.symbol === item.symbol;
              return (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => {
                    if (el) {
                      setSelectedElement(el);
                      if (window.innerWidth < 1024) setMobileDrawerOpen(true);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isInspected
                      ? isDark
                        ? "bg-sky-500 text-black border-sky-400 shadow-md shadow-sky-500/20 ring-1 ring-sky-300"
                        : "bg-sky-600 text-white border-sky-600 shadow-md"
                      : isDark
                      ? "bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-sky-500/50 hover:text-white"
                      : "bg-white border-zinc-300 text-zinc-700 hover:border-sky-500/50"
                  }`}
                  title={`${item.name} • ${item.role}`}
                >
                  <span className="text-sm">{item.symbol}</span>
                  <span className="text-[10px] opacity-70 hidden sm:inline font-sans font-medium">{item.name}</span>
                  <span className={`text-[9px] px-1 rounded ${
                    isInspected ? "bg-black/20 text-current" : "bg-amber-500/15 text-amber-400"
                  }`}>
                    {item.biloks.split(",")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filters & Dynamic Query Strip */}
          <div className={`p-3 sm:px-6 border-b flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
            isDark ? "bg-zinc-950/60 border-zinc-800" : "bg-white/60 border-zinc-200"
          }`}>
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari simbol, nama, nomor atom (cth: Mn, Besi, 25, +7)..."
                className={`w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border transition-all focus:outline-none ${
                  isDark 
                    ? "bg-zinc-900/70 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20" 
                    : "bg-zinc-50 border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills with Orbital Categories */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => setSortOrder((p) => (p === "number" ? "name" : "number"))}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isDark ? "bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white" : "bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black"
                }`}
              >
                <ArrowUpDown className="w-3 h-3 text-sky-400" />
                <span>{sortOrder === "number" ? "No. Atom" : "A-Z"}</span>
              </button>

              <div className="flex items-center gap-1 border-l pl-2 border-zinc-800">
                {(["all", "s", "p", "d", "f"] as const).map((blk) => {
                  const isSelected = selectedBlock === blk;
                  return (
                    <button
                      key={blk}
                      type="button"
                      onClick={() => setSelectedBlock(blk)}
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono uppercase font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? blk === "all"
                            ? isDark ? "bg-white text-black border-white" : "bg-black text-white border-black"
                            : BLOCK_THEMES[blk].badge
                          : isDark ? "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white" : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-black"
                      }`}
                    >
                      {blk === "all" ? "Semua" : `Blok-${blk}`}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 border-l pl-2 border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    selectedCategory === "all"
                      ? isDark ? "bg-white text-black border-white" : "bg-black text-white border-black"
                      : isDark ? "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white" : "bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black"
                  }`}
                >
                  Semua ({PERIODIC_ELEMENTS.length})
                </button>
                {(Object.keys(CATEGORY_LABELS) as ElementCategory[]).map((cat) => {
                  const catMeta = CATEGORY_LABELS[cat];
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
                        isSelected
                          ? isDark
                            ? `${catMeta.bgDark} ring-2 ring-sky-400/50 border-sky-400`
                            : `${catMeta.bgLight} ring-2 ring-sky-600/50 border-sky-600`
                          : isDark
                          ? "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white"
                          : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-black"
                      }`}
                    >
                      {catMeta.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content Workspace */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            
            {/* VIEW 1: MODE TULISAN / HP ANDROID TOUCH CARDS */}
            {viewMode === "tulisan" && (
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto overscroll-contain">
                <div className="max-w-4xl mx-auto space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                    <span>
                      Ditemukan <strong className="text-sky-400">{filteredElements.length}</strong> unsur:
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      Tap kartu untuk inspeksi data lengkap
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredElements.map((el) => {
                      const isInspected = activeInspector.symbol === el.symbol;
                      const catInfo = CATEGORY_LABELS[el.category];
                      const biloksList = el.commonOxidationStates.split(",").map((s) => s.trim());
                      const blockTheme = BLOCK_THEMES[el.block];

                      return (
                        <motion.div
                          key={el.symbol}
                          whileHover={{ y: -2 }}
                          onClick={() => {
                            setSelectedElement(el);
                            setMobileDrawerOpen(true);
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden backdrop-blur-md ${
                            isInspected
                              ? isDark
                                ? "bg-zinc-900/90 border-sky-400/90 shadow-xl shadow-sky-500/10 ring-2 ring-sky-400/30"
                                : "bg-sky-50/80 border-sky-500 shadow-md ring-2 ring-sky-500/30"
                              : isDark
                              ? "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50"
                              : "bg-white/80 border-zinc-200 hover:border-zinc-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-black border shrink-0 transition-transform ${
                                isInspected
                                  ? isDark ? "bg-sky-500 text-black border-sky-400 shadow-md" : "bg-sky-600 text-white border-sky-600"
                                  : isDark ? "bg-zinc-900 border-zinc-800 text-sky-400" : "bg-zinc-100 border-zinc-300 text-sky-600"
                              }`}>
                                <span className="text-lg leading-none">{el.symbol}</span>
                                <span className="text-[9px] opacity-70 mt-0.5">#{el.atomicNumber}</span>
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 truncate">
                                  <h4 className="font-bold text-sm leading-tight">{el.name}</h4>
                                  <span className="text-[10px] font-mono opacity-50">({el.nameEn})</span>
                                </div>
                                <div className="text-[11px] text-zinc-400 font-mono mt-0.5 flex items-center gap-2">
                                  <span>{el.atomicMass} u</span>
                                  <span>•</span>
                                  <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] border ${blockTheme.badge}`}>
                                    blok-{el.block}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                              isDark ? catInfo.bgDark : catInfo.bgLight
                            }`}>
                              {catInfo.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/50 text-xs">
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

                          {/* Detail & Explicit Insert */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExplicitInsert(el.symbol);
                              }}
                              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                                isDark
                                  ? "bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/30 text-sky-300"
                                  : "bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-700"
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Masukkan ke Reaksi</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedElement(el);
                                setMobileDrawerOpen(true);
                              }}
                              className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border ${
                                isDark
                                  ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
                                  : "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700"
                              }`}
                            >
                              <Info className="w-3.5 h-3.5" />
                              <span>Inspeksi</span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: 18-COLUMN PERIODIC MATRIX (Desktop High-Performance Grid) */}
            {viewMode === "table" && (
              <div className="flex-1 p-4 overflow-auto overscroll-contain relative">
                <div className="min-w-[880px] pb-4">
                  <div
                    className="grid auto-rows-fr relative gap-1 select-none"
                    style={{
                      gridTemplateColumns: "repeat(18, minmax(46px, 1fr))",
                      transform: "translateZ(0)",
                    }}
                  >
                    {PERIODIC_ELEMENTS.map((el) => {
                      const pos = getGridPosition(el);
                      const isInspected = activeInspector.symbol === el.symbol;
                      const isHovered = hoveredElement?.symbol === el.symbol;
                      const isMatchesFilter = !searchQuery || filteredElements.some((f) => f.symbol === el.symbol);
                      const isCategoryDimmed = hoveredElement && hoveredElement.category !== el.category;
                      const catMeta = CATEGORY_LABELS[el.category];
                      const blockTheme = BLOCK_THEMES[el.block];

                      return (
                        <div
                          key={el.symbol}
                          style={{ gridRow: pos.row, gridColumn: pos.col }}
                          onMouseEnter={() => setHoveredElement(el)}
                          onMouseLeave={() => setHoveredElement(null)}
                          onClick={() => {
                            // HANYA SELECT UNTUK INSPEKSI (TIDAK OTOMATIS INSERT)
                            setSelectedElement(el);
                          }}
                          className={`relative aspect-square rounded-xl border p-1 flex flex-col justify-between cursor-pointer transition-all duration-150 backdrop-blur-md ${
                            isInspected
                              ? isDark
                                ? "bg-white text-black border-white font-extrabold z-20 shadow-2xl scale-105 ring-2 ring-sky-400"
                                : "bg-black text-white border-black font-extrabold z-20 shadow-2xl scale-105 ring-2 ring-sky-500"
                              : isHovered
                              ? isDark
                                ? "bg-zinc-800/90 border-sky-400 text-white z-30 shadow-2xl scale-110 ring-1 ring-sky-400/50"
                                : "bg-zinc-100 border-sky-500 text-black z-30 shadow-2xl scale-110 ring-1 ring-sky-500/50"
                              : isMatchesFilter
                              ? isDark
                                ? `${catMeta.bgDark} ${blockTheme.border} hover:scale-105`
                                : `${catMeta.bgLight} ${blockTheme.border} hover:scale-105`
                              : "opacity-15 border-transparent bg-transparent pointer-events-none"
                          } ${isCategoryDimmed && !isHovered ? "opacity-20 filter grayscale" : ""}`}
                        >
                          <div className="flex items-center justify-between text-[8px] font-mono leading-none">
                            <span className="opacity-70 font-semibold">{el.atomicNumber}</span>
                            <span className="opacity-50 text-[7px] uppercase">{el.block}</span>
                          </div>

                          <div className="text-center font-black font-mono text-sm leading-none tracking-tight">
                            {el.symbol}
                          </div>

                          <div className="text-[7px] text-center font-medium truncate opacity-80 leading-none">
                            {el.name}
                          </div>
                        </div>
                      );
                    })}

                    {/* Series Indicators */}
                    <div
                      style={{ gridRow: 6, gridColumn: 3 }}
                      className="rounded-xl border border-dashed border-fuchsia-500/50 bg-fuchsia-500/10 flex flex-col items-center justify-center font-mono text-[9px] text-fuchsia-400"
                    >
                      <span className="font-bold">57-71</span>
                      <span className="text-[7px]">La-Lu</span>
                    </div>
                    <div
                      style={{ gridRow: 7, gridColumn: 3 }}
                      className="rounded-xl border border-dashed border-rose-500/50 bg-rose-500/10 flex flex-col items-center justify-center font-mono text-[9px] text-rose-400"
                    >
                      <span className="font-bold">89-103</span>
                      <span className="text-[7px]">Ac-Lr</span>
                    </div>
                  </div>

                  {/* Footnote Guide */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> Blok-s
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-sky-400">
                        <span className="w-2 h-2 rounded-full bg-sky-400" /> Blok-p
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-amber-400">
                        <span className="w-2 h-2 rounded-full bg-amber-400" /> Blok-d
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-fuchsia-400">
                        <span className="w-2 h-2 rounded-full bg-fuchsia-400" /> Blok-f
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-sky-400">
                      <Sparkles className="w-3 h-3" />
                      Klik unsur untuk melihat spek lengkap di HUD kanan
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* UPGRADED COMMAND CENTER HUD (Right Lateral Dynamic Workspace) */}
            <div className={`hidden lg:flex w-[400px] shrink-0 border-l p-5 flex-col justify-between overflow-y-auto backdrop-blur-2xl relative ${
              isDark ? "bg-zinc-950/80 border-zinc-800" : "bg-zinc-50/80 border-zinc-200"
            }`}>
              
              {/* Dynamic Atmospheric Glow Background based on inspected element block */}
              <div className="absolute -right-20 top-20 w-72 h-72 rounded-full pointer-events-none opacity-20 blur-3xl transition-all duration-700 bg-gradient-to-tr from-sky-500 to-emerald-400" />

              <div className="space-y-4 relative z-10">
                
                {/* 3D Visualizer Chamber with Gyroscopic Kinetic Rings */}
                <div className={`p-4 rounded-2xl border flex flex-col items-center relative overflow-hidden backdrop-blur-xl ${
                  isDark ? "bg-black/50 border-zinc-800/90 shadow-2xl" : "bg-white/80 border-zinc-200 shadow-sm"
                }`}>
                  {/* Subtle Background Radial Aura */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
                      className={`w-64 h-64 rounded-full bg-gradient-to-tr ${currentBlockTheme.radialGradient} blur-2xl`}
                    />
                  </div>

                  {/* Header HUD Tracker Strip */}
                  <div className="w-full flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-2 relative z-10">
                    <span className="flex items-center gap-1.5 font-bold text-zinc-400">
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                      MODEL BOHR KUANTUM
                    </span>
                    <span className="px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-300 font-mono">
                      Z = {activeInspector.atomicNumber}
                    </span>
                  </div>

                  {/* Bohr Atom Centerpiece */}
                  <div className="relative z-10 py-1 flex items-center justify-center">
                    <BohrAtomVisualizer
                      atomicNumber={activeInspector.atomicNumber}
                      symbol={activeInspector.symbol}
                      size={145}
                      className="mb-1"
                    />
                  </div>

                  {/* Identification Footnote */}
                  <div className="w-full flex items-end justify-between pt-3 border-t border-zinc-800/80 relative z-10">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black font-mono text-sky-400 tracking-tight">
                          {activeInspector.symbol}
                        </span>
                        <span className="text-xs font-bold text-zinc-200">
                          {activeInspector.name}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        {activeInspector.nameEn} • Golongan {activeInspector.group ?? "—"} • Periode {activeInspector.period}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isDark ? CATEGORY_LABELS[activeInspector.category].bgDark : CATEGORY_LABELS[activeInspector.category].bgLight
                      }`}>
                        {CATEGORY_LABELS[activeInspector.category].label}
                      </span>
                      <div className="text-[10px] font-mono mt-1 text-zinc-400 font-bold">
                        {activeInspector.atomicMass} u
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-Tabs: Orbital Spec vs Redox Mechanics */}
                <div className={`flex items-center p-1 rounded-xl border text-xs font-semibold ${
                  isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-zinc-100 border-zinc-200"
                }`}>
                  <button
                    type="button"
                    onClick={() => setActiveTabHud("orbital")}
                    className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
                      activeTabHud === "orbital"
                        ? isDark ? "bg-zinc-800 text-white shadow-sm" : "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Spek Orbital & Kuantum
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTabHud("redox")}
                    className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
                      activeTabHud === "redox"
                        ? isDark ? "bg-zinc-800 text-white shadow-sm" : "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Reaktivitas & Redoks
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {activeTabHud === "orbital" ? (
                    <motion.div
                      key="orbital"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3"
                    >
                      {/* Grid Specs */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`p-2.5 rounded-xl border text-xs ${
                          isDark ? "bg-zinc-900/40 border-zinc-800/80" : "bg-white border-zinc-200"
                        }`}>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Elektronegativitas</span>
                          <span className="text-sm font-mono font-bold text-amber-400 mt-0.5 block">
                            {activeInspector.electronegativity ? `${activeInspector.electronegativity} Pauling` : "—"}
                          </span>
                        </div>

                        <div className={`p-2.5 rounded-xl border text-xs ${
                          isDark ? "bg-zinc-900/40 border-zinc-800/80" : "bg-white border-zinc-200"
                        }`}>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Subkulit Orbital</span>
                          <span className={`text-sm font-mono font-bold mt-0.5 block ${currentBlockTheme.accentColor}`}>
                            Blok-{activeInspector.block} (l = {activeInspector.block === 's' ? 0 : activeInspector.block === 'p' ? 1 : activeInspector.block === 'd' ? 2 : 3})
                          </span>
                        </div>
                      </div>

                      {/* Electron Configuration with Copy Button */}
                      <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                        isDark ? "bg-zinc-900/40 border-zinc-800/80" : "bg-white border-zinc-200"
                      }`}>
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                          <span>KONFIGURASI ELEKTRON (AUFBAU):</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(activeInspector.electronConfiguration, "config")}
                            className="text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {copied === "config" ? "Tersalin!" : "Salin"}
                          </button>
                        </div>
                        <div className="font-mono text-xs font-semibold text-zinc-200 break-all bg-zinc-950/70 p-2 rounded-lg border border-zinc-800">
                          {activeInspector.electronConfiguration}
                        </div>
                      </div>

                      {/* Biloks State Chips */}
                      <div className={`p-3 rounded-xl border text-xs space-y-2 ${
                        isDark ? "bg-zinc-900/40 border-zinc-800/80" : "bg-white border-zinc-200"
                      }`}>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                          <span className="flex items-center gap-1 font-bold">
                            <Zap className="w-3 h-3 text-amber-400" />
                            Tingkat Oksidasi yang Lazim:
                          </span>
                          <span className="text-[9px] text-zinc-500">Klik nilai untuk salin</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {activeInspector.commonOxidationStates.split(",").map((s) => {
                            const trimmed = s.trim();
                            const isPositive = trimmed.startsWith("+");
                            const isNegative = trimmed.startsWith("-");
                            return (
                              <button
                                key={trimmed}
                                type="button"
                                onClick={() => handleCopyText(trimmed, trimmed)}
                                className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border transition-transform hover:scale-105 cursor-pointer ${
                                  isPositive
                                    ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                                    : isNegative
                                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                                    : "bg-zinc-800 border-zinc-700 text-zinc-300"
                                }`}
                              >
                                {copied === trimmed ? "✓" : <Latex math={trimmed} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="redox"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3"
                    >
                      {/* Tactical Chemical Character & Redox Briefing */}
                      <div className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-2.5 ${
                        isDark ? "bg-zinc-900/30 border-zinc-800/80" : "bg-white border-zinc-200"
                      }`}>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-400">
                          <Compass className="w-3.5 h-3.5" />
                          <span>Profil Reaktivitas Kimiawi:</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                          {activeInspector.description}
                        </p>

                        {activeInspector.redoxRole && (
                          <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-amber-300/95 font-mono flex items-start gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{activeInspector.redoxRole}</span>
                          </div>
                        )}
                      </div>

                      <div className={`p-3 rounded-xl border text-xs ${
                        isDark ? "bg-zinc-900/20 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                      }`}>
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Pedoman Reaksi Stoikiometri</span>
                        <p className="text-[11px] text-zinc-400">
                          Unsur ini terintegrasi penuh ke dalam Redoks Engine Chemly untuk perhitungan koefisien matriks asam/basa Gauss-Jordan.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Explicit Action Buttons Bottom */}
              <div className="pt-4 border-t border-zinc-800/80 flex items-center gap-2 relative z-10">
                <button
                  type="button"
                  onClick={() => handleExplicitInsert(activeInspector.symbol)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                    isDark 
                      ? "bg-white text-black hover:bg-zinc-200 shadow-white/10" 
                      : "bg-black text-white hover:bg-zinc-800 shadow-black/10"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Masukkan {activeInspector.symbol} ke Reaksi</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyText(activeInspector.symbol, "symbol")}
                  className={`p-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                    isDark 
                      ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700" 
                      : "border-zinc-300 bg-zinc-100 text-zinc-700 hover:text-black"
                  }`}
                  title="Salin Simbol"
                >
                  {copied === "symbol" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ANDROID MOBILE SHEET DRAWER */}
            <AnimatePresence>
              {mobileDrawerOpen && (
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 26, stiffness: 300 }}
                  className={`lg:hidden fixed bottom-0 left-0 right-0 max-h-[88vh] rounded-t-3xl border-t p-5 flex flex-col justify-between shadow-2xl z-50 overflow-y-auto backdrop-blur-3xl ${
                    isDark ? "bg-zinc-950/95 border-zinc-800 text-zinc-100" : "bg-white/95 border-zinc-200 text-zinc-900"
                  }`}
                >
                  <div>
                    <div className="w-12 h-1 rounded-full bg-zinc-700 mx-auto mb-4" />
                    
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-baseline gap-2 font-mono">
                          <span className="text-2xl font-black text-sky-400">{selectedElement.symbol}</span>
                          <span className="text-xs text-zinc-500">Z = {selectedElement.atomicNumber}</span>
                        </div>
                        <h3 className="text-sm font-bold">{selectedElement.name} ({selectedElement.nameEn})</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMobileDrawerOpen(false)}
                        className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Bohr Visualizer Mobile */}
                      <div className="p-3 rounded-2xl border border-zinc-800 bg-black/60 flex flex-col items-center">
                        <BohrAtomVisualizer
                          atomicNumber={selectedElement.atomicNumber}
                          symbol={selectedElement.symbol}
                          size={115}
                          className="mb-1"
                        />
                        <span className="text-[10px] font-mono text-zinc-500">{selectedElement.atomicMass} u</span>
                      </div>

                      <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Bilangan Oksidasi:</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {selectedElement.commonOxidationStates.split(",").map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-[11px] space-y-1 font-mono">
                        <div>Konfigurasi: <span className="text-zinc-200">{selectedElement.electronConfiguration}</span></div>
                        <div>Blok Orbital: <span className="font-bold uppercase text-sky-400">Blok-{selectedElement.block}</span></div>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {selectedElement.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-800 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleExplicitInsert(selectedElement.symbol);
                        setMobileDrawerOpen(false);
                      }}
                      className="flex-1 py-3 rounded-xl bg-white text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Masukkan {selectedElement.symbol} ke Reaksi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyText(selectedElement.symbol, "mob")}
                      className="p-3 rounded-xl border border-zinc-800 text-zinc-300"
                    >
                      {copied === "mob" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Toast Notification Alert */}
          <AnimatePresence>
            {insertToast && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 text-zinc-100 border border-zinc-700 text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 font-mono backdrop-blur-md"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{insertToast}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};