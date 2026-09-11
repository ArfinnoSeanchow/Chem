import React, { useState, useEffect, useRef } from "react";
import { 
  Atom, Layers, Sun, Moon, ArrowUpRight, 
  ChevronDown, Scan, Code2, Sparkles, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { ChemlyLogo } from "./ChemlyLogo";
import { AudioController } from "./AudioController";
import { NavTab } from "./Header";

export interface NavbarProps {
  onEnterApp: (mode?: NavTab) => void;
  onOpenPeriodicTable: () => void;
  onOpenNotes?: () => void;
}

interface ModuleItem {
  id: NavTab;
  title: string;
  tag: string;
  code: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}

const MODULES_DATA: ModuleItem[] = [
  {
    id: "solver",
    title: "Penyetara Redoks",
    tag: "Core Matrix",
    code: "EQ_SOLV",
    desc: "Eliminasi Gauss-Jordan matriks pecahan eksak tanpa galat pembulatan.",
    icon: Atom,
    accent: "#c2f04e",
  },
  {
    id: "scanner",
    title: "Reaction Scanner",
    tag: "Neural OCR",
    code: "VIS_PARSER",
    desc: "Parsing optik reaksi tulisan tangan langsung ke sintaks presisi.",
    icon: Scan,
    accent: "#38bdf8",
  },
  {
    id: "text-to-latex",
    title: "Text ke LaTeX",
    tag: "IUPAC Mhchem",
    code: "KATEX_FMT",
    desc: "Compiler ekspresi teks bebas ke format matematika jurnal ilmiah.",
    icon: Code2,
    accent: "#34d399",
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  onEnterApp,
  onOpenPeriodicTable,
  onOpenNotes,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMegaOpen, setIsMegaOpen] = useState<boolean>(false);
  const [activeModule, setActiveModule] = useState<NavTab>("solver");

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(top > 28);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleDropdownMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dropdownRef.current) return;
    const rect = dropdownRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    dropdownRef.current.style.setProperty("--mouse-x", `${x}px`);
    dropdownRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleMenuEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsMegaOpen(true);
  };

  const handleMenuLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsMegaOpen(false);
    }, 180);
  };

  const currentModuleData = MODULES_DATA.find((m) => m.id === activeModule) ?? MODULES_DATA[0];

  return (
    <div
      className={`z-50 flex justify-center w-full pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${
        isScrolled
          ? "fixed top-3 left-0 right-0 px-3 sm:px-4"
          : "absolute top-0 left-0 right-0 px-0"
      }`}
    >
      <header
        className={`pointer-events-auto flex items-center justify-between border transition-all duration-500 backdrop-blur-3xl relative overflow-visible ${
          isScrolled
            ? `w-full max-w-3xl px-4 sm:px-6 py-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.65)] ${
                isDark
                  ? "bg-[#090a0f]/90 border-zinc-700/60 text-white"
                  : "bg-white/95 border-zinc-300/80 text-zinc-900 shadow-zinc-400/20"
              }`
            : `w-full max-w-5xl px-6 sm:px-10 py-3.5 rounded-b-[28px] border-t-0 border-x border-b ${
                isDark
                  ? "bg-[#08090d]/95 border-zinc-800/80 text-white shadow-2xl"
                  : "bg-[#0d0f12]/95 border-zinc-800 text-white shadow-xl"
              }`
        }`}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#c2f04e]/25 to-transparent pointer-events-none" />

        {/* Brand & Clean Status Dot (Tanpa tulisan Engine) */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onEnterApp?.("solver")}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="transition-transform duration-300 group-hover:scale-105 active:scale-95">
              <ChemlyLogo size="sm" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-950/60">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c2f04e] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#c2f04e]" />
            </span>
            <span className="text-[10px] font-mono font-bold text-zinc-400">v2.5</span>
          </div>
        </div>

        {/* Center Navigation Matrix & Safe Hover Dropdown */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wide"
        >
          {/* Dropdown Hover */}
          <div
            className="relative"
            onMouseEnter={handleMenuEnter}
            onMouseLeave={handleMenuLeave}
          >
            <button
              type="button"
              onClick={() => onEnterApp?.("solver")}
              className={`flex items-center gap-1.5 py-1.5 transition-colors cursor-pointer ${
                isMegaOpen ? "text-[#c2f04e]" : "text-zinc-300 hover:text-white"
              }`}
            >
              <span>Modul Kimia</span>
              <ChevronDown
                className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ${
                  isMegaOpen ? "rotate-180 text-[#c2f04e]" : "group-hover:translate-y-0.5"
                }`}
              />
            </button>

            {/* Canvas Dropdown Card */}
            <AnimatePresence>
              {isMegaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 450, damping: 28 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[500px] z-50 pointer-events-auto"
                >
                  <div
                    ref={dropdownRef}
                    onMouseMove={handleDropdownMouseMove}
                    className={`relative p-3.5 rounded-3xl border shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-3xl overflow-hidden ${
                      isDark 
                        ? "bg-[#07080b]/95 border-zinc-800/90 text-zinc-100" 
                        : "bg-white/95 border-zinc-200 text-zinc-900"
                    }`}
                    style={{
                      // Spotlight dynamic gradient via pure CSS variable
                      backgroundImage: `radial-gradient(350px circle at var(--mouse-x, 250px) var(--mouse-y, 100px), ${
                        isDark ? "rgba(194, 240, 78, 0.08)" : "rgba(194, 240, 78, 0.15)"
                      }, transparent 70%)`
                    }}
                  >
                    {/* Top Bar Status */}
                    <div className="flex items-center justify-between px-2 pb-2.5 mb-1.5 border-b border-zinc-800/50 text-[10px] font-mono tracking-wider text-zinc-400">
                      <span className="uppercase">Koleksi Alat Presisi</span>
                      <span className="text-[#c2f04e] font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        IUPAC Standard
                      </span>
                    </div>

                    {/* Dual Column Layout */}
                    <div className="grid grid-cols-12 gap-2.5 relative z-10">
                      {/* Left: Modul List */}
                      <div className="col-span-7 space-y-1">
                        {MODULES_DATA.map((mod) => {
                          const Icon = mod.icon;
                          const isHovered = activeModule === mod.id;
                          return (
                            <div
                              key={mod.id}
                              onMouseEnter={() => setActiveModule(mod.id)}
                              onClick={() => {
                                onEnterApp?.(mod.id);
                                setIsMegaOpen(false);
                              }}
                              className={`p-2.5 rounded-2xl border transition-all duration-150 cursor-pointer flex items-center justify-between ${
                                isHovered
                                  ? isDark
                                    ? "bg-zinc-900/90 border-zinc-700 text-white shadow-sm"
                                    : "bg-zinc-100 border-zinc-300 text-black shadow-sm"
                                  : "border-transparent text-zinc-400 hover:text-zinc-200"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="p-2 rounded-xl border transition-colors"
                                  style={{
                                    backgroundColor: isHovered ? `${mod.accent}18` : "transparent",
                                    borderColor: isHovered ? `${mod.accent}35` : "rgba(113,113,122,0.2)",
                                    color: isHovered ? mod.accent : "#71717a",
                                  }}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold leading-tight">
                                    {mod.title}
                                  </div>
                                  <span className="text-[10px] font-mono text-zinc-500">{mod.tag}</span>
                                </div>
                              </div>
                              <ArrowUpRight
                                className={`w-3.5 h-3.5 transition-all duration-200 ${
                                  isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"
                                }`}
                                style={{ color: mod.accent }}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Right: Spec Preview */}
                      <div
                        className={`col-span-5 p-3 rounded-2xl border flex flex-col justify-between ${
                          isDark ? "bg-zinc-950/60 border-zinc-800/80" : "bg-zinc-50 border-zinc-200"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <span
                            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border inline-block"
                            style={{
                              color: currentModuleData.accent,
                              borderColor: `${currentModuleData.accent}30`,
                              backgroundColor: `${currentModuleData.accent}12`,
                            }}
                          >
                            {currentModuleData.code}
                          </span>
                          <h4 className="text-xs font-bold text-zinc-100 mt-1">
                            {currentModuleData.title}
                          </h4>
                          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                            {currentModuleData.desc}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#c2f04e]" />
                            Siap Digunakan
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={onOpenPeriodicTable}
            className="text-zinc-300 hover:text-[#c2f04e] transition-colors cursor-pointer flex items-center gap-1.5 group"
          >
            <span>Tabel Periodik</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-500/15 border border-sky-500/30 text-sky-400 group-hover:border-sky-400/60">
              118
            </span>
          </button>

          {onOpenNotes && (
            <button
              type="button"
              onClick={onOpenNotes}
              className="text-zinc-300 hover:text-[#c2f04e] transition-colors cursor-pointer"
            >
              Glosarium
            </button>
          )}
        </nav>

        {/* Right Tools Hub */}
        <div className="flex items-center gap-2.5">
          <AudioController />

          <button
            type="button"
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                : "border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-black"
            }`}
            title={`Beralih ke tema ${isDark ? "Terang" : "Gelap"}`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onEnterApp?.("solver")}
            className="relative group overflow-hidden bg-[#c2f04e] hover:bg-[#b5e642] text-black font-extrabold text-xs px-4 sm:px-5 py-2 rounded-full flex items-center gap-1.5 cursor-pointer shadow-[0_0_18px_rgba(194,240,78,0.3)] transition-all duration-300"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
            <span className="relative z-10 font-mono tracking-tight">MULAI</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </motion.button>
        </div>
      </header>
    </div>
  );
};