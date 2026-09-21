import React, { useState, useRef, useEffect } from "react";
import { 
  Atom, Sparkles, Moon, Sun, Layers, Scan, 
  Gamepad2, Hash, Code2, ChevronDown, ArrowUpRight,
  BookOpen, Home, Cpu, Workflow
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { ChemlyLogo } from "./ChemlyLogo";
import { AudioController } from "./AudioController";
import { Changelog } from "./changelog";
import { Methodology } from "./methodology";

export type NavTab = 
  | "solver" 
  | "scanner" 
  | "playground" 
  | "biloks-calc" 
  | "text-to-latex" 
  | "methodology";

interface HeaderProps {
  onOpenAiTutor: () => void;
  onOpenPeriodicTable: () => void;
  onOpenLanding: () => void;
  onOpenNotes?: () => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

interface NavItemConfig {
  id: NavTab;
  label: string;
  desc: string;
  shortcut: string;
  badge: string;
  kernelState: string;
  icon: React.ComponentType<{ className?: string }>;
  accentGradient: string;
}

const navItems: NavItemConfig[] = [
  { 
    id: "solver", 
    label: "Penyetara Redoks", 
    desc: "Matrix elimination engine untuk reaksi reduksi-oksidasi suasana asam & basa.",
    shortcut: "⌘1",
    badge: "Core Engine",
    kernelState: "Gauss-Jordan Rational",
    icon: Atom,
    accentGradient: "from-sky-500/20 via-blue-500/10 to-transparent",
  },
  { 
    id: "scanner", 
    label: "Reaction Scanner", 
    desc: "Neural optical character recognition untuk ekstraksi rumus tulisan tangan.",
    shortcut: "⌘2",
    badge: "AI Vision",
    kernelState: "OCR Tensor Graph",
    icon: Scan,
    accentGradient: "from-teal-500/20 via-emerald-500/10 to-transparent",
  },
  { 
    id: "playground", 
    label: "Playground Reaksi", 
    desc: "Sandbox kinetika reaksi kimia dan visualisasi stereokimia orbital molekul.",
    shortcut: "⌘3",
    badge: "Interactive",
    kernelState: "Kinetic Engine 120fps",
    icon: Gamepad2,
    accentGradient: "from-amber-500/20 via-orange-500/10 to-transparent",
  },
  { 
    id: "biloks-calc", 
    label: "Kalkulator Biloks", 
    desc: "Kalkulasi bilangan oksidasi deterministik seluruh atom poliatomik netral & ion.",
    shortcut: "⌘4",
    badge: "Computation",
    kernelState: "Pauling Matrix Rules",
    icon: Hash,
    accentGradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
  },
  { 
    id: "text-to-latex", 
    label: "Formula ke LaTeX", 
    desc: "Transpiler ekspresi kimia mentah ke sintaks mhchem KaTeX standar jurnal IUPAC.",
    shortcut: "⌘5",
    badge: "Transpiler",
    kernelState: "KaTeX/mhchem AST",
    icon: Code2,
    accentGradient: "from-cyan-500/20 via-sky-500/10 to-transparent",
  },
  { 
    id: "methodology", 
    label: "Metodologi & Algoritma", 
    desc: "Arsitektur lengkap matematika linier, AST parser, dan alur komputasi Chemly.",
    shortcut: "⌘6",
    badge: "Architecture",
    kernelState: "Deterministic Whitepaper",
    icon: Workflow,
    accentGradient: "from-fuchsia-500/20 via-rose-500/10 to-transparent",
  },
];

export const Header: React.FC<HeaderProps> = ({
  onOpenAiTutor,
  onOpenPeriodicTable,
  onOpenLanding,
  onOpenNotes,
  activeTab,
  setActiveTab,
}) => {
  const { toggleTheme, isDark } = useTheme();
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<NavTab>(activeTab);
  const [navPillHover, setNavPillHover] = useState<string | null>(null);

  // Spotlight pointer tracking inside dropdown
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsMegaOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimerRef.current = setTimeout(() => {
      setIsMegaOpen(false);
    }, 180);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!megaMenuRef.current) return;
    const rect = megaMenuRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Keyboard Shortcuts (⌘1 - ⌘6)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        const index = parseInt(e.key, 10) - 1;
        if (index >= 0 && index < navItems.length) {
          e.preventDefault();
          setActiveTab(navItems[index].id);
          setIsMegaOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setActiveTab]);

  const activeItem = navItems.find((n) => n.id === activeTab) ?? navItems[0];
  const inspectedItem = navItems.find((n) => n.id === hoveredTab) ?? activeItem;
  const InspectedIcon = inspectedItem.icon;

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-all duration-300 ${
          isDark
            ? "bg-zinc-950/92 border-zinc-800/90 text-zinc-100"
            : "bg-white/94 border-zinc-200 text-zinc-900"
        }`}
      >
        <div className="max-w-[1480px] mx-auto px-3 sm:px-5 lg:px-7 h-[58px] flex items-center gap-3">

          {/* Brand */}
          <button
            type="button"
            onClick={onOpenLanding}
            className="shrink-0 flex items-center cursor-pointer focus:outline-none transition-transform duration-200 hover:scale-[1.015] active:scale-[0.985]"
            title="Kembali ke Beranda Chemly"
          >
            <ChemlyLogo size="md" />
          </button>

          <span className={`hidden sm:block h-5 w-px shrink-0 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />

          {/* One-line primary navigation */}
          <nav className="hidden md:flex min-w-0 flex-1 items-center gap-0.5" aria-label="Navigasi Studio Chemly">
            <button
              type="button"
              onClick={() => setIsMegaOpen((prev) => !prev)}
              className={`group inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-semibold transition-colors cursor-pointer ${
                isMegaOpen
                  ? isDark ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-950"
                  : isDark ? "text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-100" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
              }`}
            >
              <span>Modules</span>
              <ChevronDown className={`w-3.5 h-3.5 opacity-50 transition-transform duration-300 ${isMegaOpen ? "rotate-180" : ""}`} />
            </button>

            <button type="button" onClick={onOpenLanding} className={`h-9 rounded-lg px-2.5 text-[12px] font-semibold transition-colors cursor-pointer ${isDark ? "text-zinc-400 hover:bg-zinc-900/70 hover:text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"}`}>Studio</button>
            <button type="button" onClick={onOpenPeriodicTable} className={`h-9 rounded-lg px-2.5 text-[12px] font-semibold transition-colors cursor-pointer ${isDark ? "text-zinc-400 hover:bg-zinc-900/70 hover:text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"}`}>Periodic Table</button>
            <button type="button" onClick={() => setIsMethodologyModalOpen(true)} className={`h-9 rounded-lg px-2.5 text-[12px] font-semibold transition-colors cursor-pointer ${isDark ? "text-zinc-400 hover:bg-zinc-900/70 hover:text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"}`}>Methodology</button>
            {onOpenNotes && (
              <button type="button" onClick={onOpenNotes} className={`h-9 rounded-lg px-2.5 text-[12px] font-semibold transition-colors cursor-pointer ${isDark ? "text-zinc-400 hover:bg-zinc-900/70 hover:text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"}`}>Notes</button>
            )}
          </nav>

          {/* Compact metadata rail: no bright status dot */}
          <div className="hidden lg:flex items-center gap-2 shrink-0 font-mono text-[9px] tracking-[0.08em] uppercase text-zinc-500">
            <button type="button" onClick={() => setIsChangelogOpen(true)} className="hover:text-zinc-300 transition-colors cursor-pointer">v2.5</button>
            <span className={isDark ? "text-zinc-800" : "text-zinc-200"}>/</span>
            <span>Deterministic</span>
            <span className={isDark ? "text-zinc-800" : "text-zinc-200"}>/</span>
            <span>IUPAC</span>
          </div>

          {/* Interactive Cinematic Mega Menu */}
          <div 
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsMegaOpen((prev) => !prev)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight border transition-all duration-200 cursor-pointer ${
                isMegaOpen
                  ? isDark
                    ? "bg-zinc-900 border-zinc-700 text-white shadow-lg shadow-black/60 ring-2 ring-sky-500/20"
                    : "bg-zinc-100 border-zinc-400 text-zinc-900 shadow-md ring-2 ring-sky-500/20"
                  : isDark
                  ? "bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-900 text-zinc-300 hover:text-white"
                  : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900"
              }`}
            >
              <span className="font-mono text-[10px] text-sky-400 font-bold tracking-[0.12em]">MODUL</span>
              <span className="font-bold">{activeItem.label}</span>
              <ChevronDown 
                className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 ${
                  isMegaOpen ? "rotate-180 text-sky-400" : ""
                }`} 
              />
            </motion.button>

            {/* Dropdown Floating Canvas */}
            <AnimatePresence>
              {isMegaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ type: "spring", damping: 25, stiffness: 380 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-2.5 w-[760px] max-w-[94vw] z-50 pointer-events-auto"
                >
                  <div
                    ref={megaMenuRef}
                    onMouseMove={handleMouseMove}
                    className={`rounded-3xl border shadow-2xl backdrop-blur-3xl overflow-hidden relative ${
                      isDark 
                        ? "bg-zinc-950/95 border-zinc-800/90 text-zinc-100 shadow-black/90 ring-1 ring-white/10" 
                        : "bg-white/95 border-zinc-200/90 text-zinc-900 shadow-zinc-400/40 ring-1 ring-black/5"
                    }`}
                  >
                    {/* Dynamic Spotlight Radial Effect following Cursor */}
                    <div
                      className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-60"
                      style={{
                        background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.08), transparent 80%)`,
                      }}
                    />

                    <div className="grid grid-cols-12 divide-x divide-zinc-200 dark:divide-zinc-800/80 relative z-10">
                      
                      {/* Left Pane: Modular Actions */}
                      <div 
                        className="col-span-7 p-3 space-y-1"
                        onMouseLeave={() => setNavPillHover(null)}
                      >
                        <div className="flex items-center justify-between px-2.5 py-1 mb-1 border-b border-zinc-800/40">
                          <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold">
                            Engine Kernel & Arsitektur
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Client WASM
                          </span>
                        </div>

                        {navItems.map((item) => {
                          const Icon = item.icon;
                          const isSelected = activeTab === item.id;
                          return (
                            <div
                              key={item.id}
                              className="relative"
                              onMouseEnter={() => {
                                setHoveredTab(item.id);
                                setNavPillHover(item.id);
                              }}
                              onClick={() => {
                                setActiveTab(item.id);
                                setIsMegaOpen(false);
                              }}
                            >
                              {/* Animated Layout Pill Hover Backdrop */}
                              {navPillHover === item.id && (
                                <motion.div
                                  layoutId="megaMenuPillHover"
                                  transition={{ type: "spring", bounce: 0.15, duration: 0.25 }}
                                  className={`absolute inset-0 rounded-xl ${
                                    isDark ? "bg-zinc-900/90" : "bg-zinc-100"
                                  }`}
                                />
                              )}

                              <button
                                type="button"
                                className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-colors z-10 cursor-pointer ${
                                  isSelected 
                                    ? isDark ? "text-white font-bold" : "text-zinc-900 font-bold"
                                    : isDark ? "text-zinc-400 hover:text-zinc-100" : "text-zinc-600 hover:text-zinc-900"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-1.5 rounded-lg border transition-colors ${
                                    isSelected
                                      ? isDark ? "bg-black border-zinc-700 text-sky-400" : "bg-white border-zinc-300 text-sky-600"
                                      : isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-600"
                                  }`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <span className="block font-semibold">{item.label}</span>
                                    <span className="text-[10px] text-zinc-500 font-normal font-sans block truncate max-w-[200px]">
                                      {item.desc}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                                    isSelected
                                      ? isDark ? "bg-sky-500/15 border-sky-500/30 text-sky-400" : "bg-sky-50 border-sky-300 text-sky-700"
                                      : isDark ? "bg-zinc-800/80 border-zinc-700 text-zinc-400" : "bg-zinc-200 border-zinc-300 text-zinc-600"
                                  }`}>
                                    {item.badge}
                                  </span>
                                  <kbd className="hidden sm:inline-block text-[9px] font-mono text-zinc-500">
                                    {item.shortcut}
                                  </kbd>
                                </div>
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right Pane: Live Tactical Feature Inspector */}
                      <div className={`col-span-5 p-5 flex flex-col justify-between relative overflow-hidden ${
                        isDark ? "bg-zinc-900/40" : "bg-zinc-50/70"
                      }`}>
                        {/* Conic Ambient Radial Highlight */}
                        <div className={`absolute -right-10 -top-10 w-48 h-48 rounded-full bg-gradient-to-tr ${inspectedItem.accentGradient} blur-3xl pointer-events-none transition-all duration-500`} />

                        <div className="relative z-10 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-lg ${
                              isDark ? "bg-zinc-900 border-zinc-700 text-sky-400" : "bg-white border-zinc-300 text-sky-600"
                            }`}>
                              <InspectedIcon className="w-5 h-5" />
                            </div>

                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                              Active Node
                            </span>
                          </div>

                          <div>
                            <div className="flex items-baseline gap-2">
                              <h4 className="text-sm font-bold tracking-tight">{inspectedItem.label}</h4>
                              <span className="text-[10px] font-mono text-zinc-500">{inspectedItem.shortcut}</span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-normal">
                              {inspectedItem.desc}
                            </p>
                          </div>

                          {/* Technical Telemetry Box */}
                          <div className={`p-3 rounded-xl border font-mono text-[10px] space-y-1.5 ${
                            isDark ? "bg-black/60 border-zinc-800 text-zinc-400" : "bg-white border-zinc-200 text-zinc-600"
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-500">Pipeline State:</span>
                              <span className="text-sky-400 font-bold">{inspectedItem.kernelState}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-500">Benchmark Latency:</span>
                              <span className="text-emerald-400 font-bold">&lt; 1.2ms</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-500">Fault Tolerance:</span>
                              <span className="text-zinc-300 font-bold">100% Deterministic</span>
                            </div>
                          </div>
                        </div>

                        {/* Direct Trigger to Methodology Whitepaper Modal */}
                        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between relative z-10">
                          <button
                            type="button"
                            onClick={() => {
                              setIsMegaOpen(false);
                              setIsMethodologyModalOpen(true);
                            }}
                            className="text-[11px] font-mono text-sky-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Buka Whitepaper Lengkap</span>
                          </button>

                          <span className="text-[10px] font-mono text-zinc-500">
                            IUPAC-Spec
                          </span>
                        </div>

                      </div>

                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Compact action rail */}
          <div className="flex items-center gap-1 shrink-0">
            <AudioController />

            <button
              type="button"
              onClick={toggleTheme}
              className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                isDark
                  ? "border-zinc-800 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100"
                  : "border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={onOpenAiTutor}
              className={`hidden sm:inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[12px] font-bold transition-all cursor-pointer ${
                isDark ? "bg-zinc-100 text-zinc-950 hover:bg-white" : "bg-zinc-950 text-white hover:bg-zinc-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Tutor</span>
            </button>
          </div>
        </div>
      </header>

      {/* Changelog Modal */}
      <Changelog isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} />

      {/* Full Methodology Modal Dialog */}
      <AnimatePresence>
        {isMethodologyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMethodologyModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: "spring", damping: 28, stiffness: 360 }}
              className={`relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
                isDark ? "bg-zinc-950 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
              }`}
            >
              <div className="flex-1 overflow-y-auto">
                <Methodology 
                  onClose={() => setIsMethodologyModalOpen(false)}
                  onExploreModule={(targetTab) => {
                    setActiveTab(targetTab as NavTab);
                    setIsMethodologyModalOpen(false);
                  }}
                />
              </div>

              {/* Close Bar */}
              <div className={`px-6 py-3 border-t flex items-center justify-between text-xs font-mono ${
                isDark ? "border-zinc-800 bg-zinc-900/60 text-zinc-400" : "border-zinc-200 bg-zinc-50 text-zinc-600"
              }`}>
                <span>Tekan ESC atau klik tombol untuk kembali</span>
                <button
                  type="button"
                  onClick={() => setIsMethodologyModalOpen(false)}
                  className="font-bold text-sky-400 hover:underline cursor-pointer"
                >
                  Tutup Metodologi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};