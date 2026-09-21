import React, { useState, useEffect } from "react";
import { ReactionMedium } from "../types/redox";
import { History, Trash2, ArrowUpRight, Clock, Sparkles } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";
import { equationToLatex } from "../utils/latexHelper";

export interface StoredReaction {
  id: string;
  equation: string;
  medium: ReactionMedium;
  timestamp: number;
}

const STORAGE_KEY = "chemly_recent_equations_v1";
const MAX_RECENT = 5;

export function loadRecentReactions(): StoredReaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, MAX_RECENT);
    }
  } catch (e) {
    console.error("Failed to load recent reactions", e);
  }
  return [];
}

export function saveRecentReaction(equation: string, medium: ReactionMedium): StoredReaction[] {
  try {
    if (!equation || !equation.trim()) return loadRecentReactions();
    const cleanEq = equation.trim();
    const existing = loadRecentReactions();

    // Filter out duplicates with the same equation and medium
    const filtered = existing.filter(
      (item) => !(item.equation.toLowerCase() === cleanEq.toLowerCase() && item.medium === medium)
    );

    const newItem: StoredReaction = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      equation: cleanEq,
      medium,
      timestamp: Date.now(),
    };

    const updated = [newItem, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save recent reaction", e);
    return [];
  }
}

export function clearRecentReactions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear recent reactions", e);
  }
}

interface RecentReactionsProps {
  onSelectReaction: (equation: string, medium: ReactionMedium) => void;
  currentEquation?: string;
}

export const RecentReactions: React.FC<RecentReactionsProps> = ({
  onSelectReaction,
  currentEquation,
}) => {
  const { isDark } = useTheme();
  const [history, setHistory] = useState<StoredReaction[]>([]);

  const refreshHistory = () => {
    setHistory(loadRecentReactions());
  };

  useEffect(() => {
    refreshHistory();

    // Listen for custom event or storage changes
    const handler = () => refreshHistory();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleClear = () => {
    clearRecentReactions();
    setHistory([]);
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div
      className={`p-3 sm:p-3.5 rounded-xl border transition-colors ${
        isDark ? "bg-zinc-950/80 border-zinc-800/80" : "bg-zinc-50 border-zinc-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <History className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-400">
            Reaksi Terakhir ({history.length}/5)
          </span>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="text-[10px] flex items-center gap-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer px-1 py-0.5 rounded"
          title="Hapus riwayat lokal"
        >
          <Trash2 className="w-3 h-3" />
          <span>Hapus</span>
        </button>
      </div>

      {/* List of 5 Recent Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {history.map((item) => {
          const isCurrent =
            currentEquation &&
            currentEquation.trim().toLowerCase() === item.equation.toLowerCase();

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectReaction(item.equation, item.medium)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                isCurrent
                  ? isDark
                    ? "bg-sky-950/50 border-sky-500 text-sky-300 ring-1 ring-sky-500/40"
                    : "bg-sky-50 border-sky-400 text-sky-900 ring-1 ring-sky-400/40"
                  : isDark
                  ? "bg-zinc-900/90 border-zinc-700/70 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800"
                  : "bg-white border-zinc-300 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-100 shadow-2xs"
              }`}
              title="Klik untuk memuat ulang reaksi ini ke penyetara"
            >
              <span className="truncate max-w-[200px] sm:max-w-[260px]">
                <Latex math={equationToLatex(item.equation)} />
              </span>

              <span
                className={`text-[9px] font-sans font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${
                  item.medium === "acidic"
                    ? isDark
                      ? "bg-amber-950/40 border-amber-700/50 text-amber-300"
                      : "bg-amber-100 border-amber-300 text-amber-900"
                    : isDark
                    ? "bg-cyan-950/40 border-cyan-700/50 text-cyan-300"
                    : "bg-cyan-100 border-cyan-300 text-cyan-900"
                }`}
              >
                {item.medium === "acidic" ? "Asam" : "Basa"}
              </span>

              <ArrowUpRight className="w-3 h-3 opacity-40 group-hover:opacity-100" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
