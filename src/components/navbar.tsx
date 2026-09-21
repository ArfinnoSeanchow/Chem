import React, { useEffect, useRef, useState } from "react";
import {
  Atom, Layers, Sun, Moon, ArrowUpRight, ChevronDown, Scan, Code2,
  Sparkles, CheckCircle2, FlaskConical, Workflow, BookOpen, Menu, X
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
  { id: "solver", title: "Penyetara Redoks", tag: "Core Matrix", code: "EQ_SOLV", desc: "Eliminasi Gauss–Jordan dengan pecahan eksak untuk mencari koefisien terkecil.", icon: Atom, accent: "#c2f04e" },
  { id: "scanner", title: "Reaction Scanner", tag: "Vision", code: "VIS_PARSE", desc: "Ekstraksi persamaan dari tulisan atau lembar kerja untuk dilanjutkan ke solver.", icon: Scan, accent: "#38bdf8" },
  { id: "text-to-latex", title: "Text ke LaTeX", tag: "IUPAC", code: "KATEX_FMT", desc: "Mengubah formula mentah menjadi representasi kimia yang siap dibaca dan disalin.", icon: Code2, accent: "#34d399" },
];

export const Navbar: React.FC<NavbarProps> = ({ onEnterApp, onOpenPeriodicTable, onOpenNotes }) => {
  const { isDark, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<NavTab>("solver");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled((window.scrollY || 0) > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsOpen(true);
  };
  const closeMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setIsOpen(false), 160);
  };

  const current = MODULES_DATA.find((m) => m.id === activeModule) ?? MODULES_DATA[0];

  return (
    <div className={`absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-3 sm:px-5 transition-all duration-500 ${isScrolled ? "pt-3" : "pt-3 sm:pt-5"}`}>
      <header className={`pointer-events-auto w-full max-w-[1280px] border transition-all duration-500 ${
        isScrolled
          ? "rounded-[26px] bg-[#050608]/95 border-zinc-800/90 shadow-[0_18px_55px_rgba(0,0,0,.38)] backdrop-blur-xl"
          : "rounded-[28px] sm:rounded-[32px] bg-[#07080b]/88 border-zinc-800/75 backdrop-blur-xl"
      }`}>
        <div className="h-[62px] sm:h-[72px] px-3.5 sm:px-6 flex items-center gap-3">
          <span aria-hidden="true" className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 h-[2px] w-24 rounded-full bg-zinc-700/70" />
          <button type="button" onClick={() => onEnterApp("solver")} className="shrink-0 flex items-center gap-2.5 cursor-pointer group" aria-label="Buka Chemly">
            <span className="transition-transform duration-300 group-hover:scale-[1.03] group-active:scale-95"><ChemlyLogo size="sm" /></span>
            <span className="hidden sm:block text-[10px] font-mono tracking-[.22em] text-zinc-500">STUDIO</span>
          </button>

          {/* LEFT MODULE CONTROL */}
          <div className="relative ml-1" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              aria-expanded={isOpen}
              className={`h-10 sm:h-11 px-3.5 sm:px-4 flex items-center gap-2 rounded-xl border text-xs font-semibold transition-all duration-300 cursor-pointer ${
                isOpen ? "bg-zinc-100 text-zinc-950 border-zinc-200" : "bg-white/[.035] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white"
              }`}
            >
              <span className="text-[#c2f04e] font-mono text-[9px] tracking-[.16em]">MODUL</span>
              <span className="hidden sm:inline max-w-32 truncate">{current.title}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scaleX: 0.18, transformOrigin: "top left" }}
                  animate={{ opacity: 1, y: 0, scaleX: 1 }}
                  exit={{ opacity: 0, y: -4, scaleX: 0.18 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24, mass: .68 }}
                  className="absolute left-0 top-full pt-2.5 w-[min(980px,calc(100vw-20px))] z-50"
                >
                  <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-800 bg-[#07080b]/98 backdrop-blur-2xl shadow-[0_34px_110px_rgba(0,0,0,.68)]">
                    <div className="px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[9px] font-mono tracking-[.2em] uppercase text-zinc-500">Chemly Studio / Modules</div>
                        <div className="text-xs text-zinc-300 mt-1">Pilih ruang kerja yang ingin kamu buka.</div>
                      </div>
                      <span className="hidden sm:flex items-center gap-1.5 text-[9px] font-mono text-emerald-400"><CheckCircle2 className="w-3 h-3" />LOCAL</span>
                    </div>

                    <div className="p-2.5 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      {MODULES_DATA.map((mod) => {
                        const Icon = mod.icon;
                        const selected = activeModule === mod.id;
                        return (
                          <button
                            type="button"
                            key={mod.id}
                            onMouseEnter={() => setActiveModule(mod.id)}
                            onClick={() => { onEnterApp(mod.id); setIsOpen(false); }}
                            className={`text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${selected ? "bg-white/[.06] border-zinc-700" : "border-transparent hover:bg-white/[.03] hover:border-zinc-800"}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="w-8 h-8 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center" style={{ color: mod.accent }}><Icon className="w-4 h-4" /></span>
                              <span className="text-[8px] font-mono text-zinc-600">{mod.code}</span>
                            </div>
                            <div className="mt-3 text-xs font-semibold text-zinc-100">{mod.title}</div>
                            <div className="mt-1 text-[10px] text-zinc-500 leading-relaxed">{mod.desc}</div>
                            <div className="mt-3 text-[9px] font-mono" style={{ color: mod.accent }}>{mod.tag}</div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="px-3 pb-3 grid grid-cols-2 gap-1.5">
                      <button type="button" onClick={() => { onOpenPeriodicTable(); setIsOpen(false); }} className="h-9 px-3 rounded-xl border border-zinc-800 text-[10px] text-zinc-400 hover:text-white hover:bg-white/[.035] transition-colors cursor-pointer flex items-center gap-2"><Layers className="w-3.5 h-3.5" />Periodic Table</button>
                      {onOpenNotes && <button type="button" onClick={() => { onOpenNotes(); setIsOpen(false); }} className="h-9 px-3 rounded-xl border border-zinc-800 text-[10px] text-zinc-400 hover:text-white hover:bg-white/[.035] transition-colors cursor-pointer flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" />Redox Notes</button>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <nav className="hidden lg:flex items-center ml-auto gap-1 text-[11px] text-zinc-500 font-medium">
            <button type="button" onClick={() => onEnterApp("solver")} className="px-2.5 py-2 rounded-lg hover:text-white hover:bg-white/[.03] transition-colors cursor-pointer">Solver</button>
            <button type="button" onClick={() => onEnterApp("methodology")} className="px-2.5 py-2 rounded-lg hover:text-white hover:bg-white/[.03] transition-colors cursor-pointer">Methodology</button>
            <button type="button" onClick={() => onOpenNotes?.()} className="px-2.5 py-2 rounded-lg hover:text-white hover:bg-white/[.03] transition-colors cursor-pointer">Notes</button>
          </nav>

          <div className="ml-auto lg:ml-2 flex items-center gap-1">
            <button type="button" onClick={toggleTheme} className="w-9 h-9 rounded-xl border border-zinc-800 text-zinc-500 hover:text-white hover:bg-white/[.04] transition-colors cursor-pointer flex items-center justify-center" aria-label="Ubah tema">{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
            <AudioController />
            <button type="button" onClick={() => onEnterApp("solver")} className="hidden sm:flex h-9 px-3.5 rounded-xl bg-[#c2f04e] text-black text-[10px] font-bold items-center gap-1.5 hover:bg-[#d2ff6a] active:scale-[.98] transition-all cursor-pointer">Start <ArrowUpRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </header>
    </div>
  );
};
