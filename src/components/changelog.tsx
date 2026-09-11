import React, { useState, useEffect } from "react";
import { 
  X, GitCommit, Sparkles, Zap, Bug, ShieldCheck, 
  Terminal, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";

interface ChangelogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChangeType = "feature" | "perf" | "fix" | "sec";

interface ChangeDetail {
  type: ChangeType;
  title: string;
  desc: string;
}

interface ReleaseItem {
  version: string;
  codename: string;
  commitHash: string;
  date: string;
  isLatest?: boolean;
  highlights: string;
  changes: ChangeDetail[];
}

const releases: ReleaseItem[] = [
  {
    version: "v2.5.0",
    codename: "Quantum Catalyst",
    commitHash: "4f8a29c",
    date: "Sep 2026",
    isLatest: true,
    highlights: "Integrasi text-to-LaTeX transpiler kimia dan optimasi kernel eliminasi matriks redoks.",
    changes: [
      {
        type: "feature",
        title: "Transpiler mhchem LaTeX IUPAC",
        desc: "Parser ekspresi kimia acak menjadi kode TeX jurnal standar tanpa round-trip server."
      },
      {
        type: "perf",
        title: "Peningkatan Latensi Gauss-Jordan",
        desc: "Eksekusi penyetaraan reaksi redoks asam/basa 42% lebih cepat via memory typed arrays."
      },
      {
        type: "feature",
        title: "Linear-grade Action Nav Bar",
        desc: "Sistem navigasi instan dengan keyboard shortcuts (⌘1 - ⌘5) dan dynamic preview."
      },
      {
        type: "fix",
        title: "Strict Union Type Narrowing",
        desc: "Eliminasi memory leaks pada unmounted audio oscillator dan handling timeout browser."
      }
    ]
  },
  {
    version: "v2.4.2",
    codename: "Electron Drift",
    commitHash: "9b31d01",
    date: "Jul 2026",
    highlights: "Visualisasi interaktif 118 unsur periodik dan rendering mekanika kuantum orbital.",
    changes: [
      {
        type: "feature",
        title: "Shader Visualizer Orbital 3D",
        desc: "Simulasi konfigurasi elektron orbital s, p, d, f berbasis WebGL shader hemat daya."
      },
      {
        type: "perf",
        title: "Resource Pool Audio Controller",
        desc: "Manajemen siklus hidup Web Audio API saat tab browser beralih ke background state."
      },
      {
        type: "fix",
        title: "Penetapan Muatan Senyawa Kompleks",
        desc: "Koreksi parsing bilangan oksidasi pada ligan polidentat netral dan khelat."
      }
    ]
  },
  {
    version: "v2.0.0",
    codename: "Genesis Reaction",
    commitHash: "1e77af8",
    date: "Jan 2026",
    highlights: "Arsitektur multimodal AI Chemical Tutor dan OCR tulisan tangan terenkripsi.",
    changes: [
      {
        type: "feature",
        title: "AI Chemical Tutor Multimodal",
        desc: "Evaluasi tahapan stokiometri dan reaksi redoks langkah-demi-langkah."
      },
      {
        type: "feature",
        title: "Kamera Reaction OCR",
        desc: "Pendeteksi formula kimia tulisan tangan langsung dari media lembar kerja."
      },
      {
        type: "sec",
        title: "Enkripsi Sesi Klien (Local Only)",
        desc: "Zero-knowledge session: seluruh riwayat workspace terisolasi di localStorage pengguna."
      }
    ]
  }
];

const badgeConfig: Record<ChangeType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  feature: { label: "feat", icon: Sparkles },
  perf: { label: "perf", icon: Zap },
  fix: { label: "fix", icon: Bug },
  sec: { label: "sec", icon: ShieldCheck },
};

export const Changelog: React.FC<ChangelogProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [selectedVersion, setSelectedVersion] = useState<string>("v2.5.0");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const currentRelease = releases.find((r) => r.version === selectedVersion) ?? releases[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          {/* Subtle Dim Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: "spring", damping: 30, stiffness: 380 }}
            className={`relative w-full max-w-2xl max-h-[82vh] flex flex-col rounded-xl border shadow-2xl overflow-hidden ${
              isDark 
                ? "bg-zinc-950 border-zinc-800 text-zinc-100 shadow-black/80" 
                : "bg-white border-zinc-200 text-zinc-900 shadow-zinc-300/50"
            }`}
          >
            {/* Minimal Header */}
            <div className={`flex items-center justify-between px-5 py-3.5 border-b ${
              isDark ? "border-zinc-800/80 bg-zinc-900/30" : "border-zinc-200 bg-zinc-50/50"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-md border ${
                  isDark ? "border-zinc-800 bg-zinc-900 text-zinc-300" : "border-zinc-200 bg-white text-zinc-700"
                }`}>
                  <GitCommit className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold tracking-tight">System Changelog</h2>
                  <p className="text-[10px] font-mono text-zinc-500">Release timeline & patch notes</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <kbd className="hidden sm:inline-block text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 border rounded border-zinc-200 dark:border-zinc-800">
                  ESC
                </kbd>
                <button
                  type="button"
                  onClick={onClose}
                  className={`p-1 rounded-md transition-colors ${
                    isDark 
                      ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" 
                      : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Version Navigator Tabs (Floating Spring Layout) */}
            <div className={`px-5 py-2 border-b flex items-center gap-1.5 overflow-x-auto ${
              isDark ? "border-zinc-800/80 bg-zinc-900/10" : "border-zinc-200 bg-zinc-50/20"
            }`}>
              {releases.map((rel) => {
                const isSelected = rel.version === selectedVersion;
                return (
                  <button
                    key={rel.version}
                    type="button"
                    onClick={() => setSelectedVersion(rel.version)}
                    className={`relative px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                      isSelected 
                        ? isDark ? "text-white font-medium" : "text-zinc-900 font-semibold"
                        : isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeVersionPill"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.25 }}
                        className={`absolute inset-0 rounded-md border ${
                          isDark 
                            ? "bg-zinc-900 border-zinc-700" 
                            : "bg-zinc-100 border-zinc-300"
                        }`}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <span>{rel.version}</span>
                      {rel.isLatest && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Content Body with Animated Transitions */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentRelease.version}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className="space-y-4"
                >
                  {/* Meta Strip */}
                  <div className={`p-3.5 rounded-lg border ${
                    isDark ? "bg-zinc-900/30 border-zinc-800" : "bg-zinc-50/70 border-zinc-200"
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="font-semibold text-sm">{currentRelease.version}</span>
                        <span className="text-zinc-500">({currentRelease.codename})</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                        <span className="px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                          {currentRelease.commitHash}
                        </span>
                        <span>{currentRelease.date}</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                      {currentRelease.highlights}
                    </p>
                  </div>

                  {/* Changes Grid */}
                  <div className="space-y-2">
                    {currentRelease.changes.map((change, idx) => {
                      const meta = badgeConfig[change.type];
                      const Icon = meta.icon;
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border transition-all ${
                            isDark 
                              ? "bg-zinc-900/20 border-zinc-800/80 hover:border-zinc-700" 
                              : "bg-white border-zinc-200 hover:border-zinc-300"
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono tracking-tight shrink-0 flex items-center gap-1 border mt-0.5 ${
                              isDark 
                                ? "bg-zinc-900 border-zinc-700 text-zinc-400" 
                                : "bg-zinc-100 border-zinc-200 text-zinc-600"
                            }`}>
                              <Icon className="w-2.5 h-2.5" />
                              <span>{meta.label}</span>
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium tracking-tight">
                                {change.title}
                              </div>
                              <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                                {change.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Bar */}
            <div className={`px-5 py-3 border-t flex items-center justify-between text-[11px] font-mono ${
              isDark ? "border-zinc-800/80 bg-zinc-900/20 text-zinc-500" : "border-zinc-200 bg-zinc-50 text-zinc-500"
            }`}>
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-zinc-400" />
                <span>production client-compiled</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={`flex items-center gap-1 font-medium transition-colors ${
                  isDark ? "text-zinc-300 hover:text-white" : "text-zinc-700 hover:text-zinc-900"
                }`}
              >
                <span>Dismiss</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};