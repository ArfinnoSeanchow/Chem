import React from "react";
import { Atom, Layers, Hash, Scan, Gamepad2, Code2 } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { NavTab } from "./Header";

interface MobileBottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenPeriodicTable: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenPeriodicTable,
}) => {
  const { isDark } = useTheme();

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t backdrop-blur-md transition-colors ${
        isDark
          ? "bg-black/90 border-zinc-800 text-white"
          : "bg-white/95 border-zinc-200 text-black shadow-lg"
      }`}
      style={{
        paddingBottom: "max(0.6rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="grid grid-cols-6 items-center px-1 py-1 text-center">
        {/* Tab 1: Solver */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={() => setActiveTab("solver")}
          className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer relative ${
            activeTab === "solver"
              ? isDark
                ? "text-white font-bold"
                : "text-black font-bold"
              : isDark
              ? "text-zinc-500 hover:text-zinc-300"
              : "text-zinc-400 hover:text-zinc-700"
          }`}
        >
          {activeTab === "solver" && (
            <motion.div
              layoutId="mobileActiveIndicator"
              className="absolute -top-1 w-5 h-1 rounded-full bg-sky-400"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <Atom
            className={`w-4 h-4 mb-0.5 ${
              activeTab === "solver" ? "text-sky-400" : ""
            }`}
          />
          <span className="text-[8.5px] tracking-tight">Setara</span>
        </motion.button>

        {/* Tab 2: Reaction Scanner */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={() => setActiveTab("scanner")}
          className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer relative ${
            activeTab === "scanner"
              ? isDark
                ? "text-white font-bold"
                : "text-black font-bold"
              : isDark
              ? "text-zinc-500 hover:text-zinc-300"
              : "text-zinc-400 hover:text-zinc-700"
          }`}
        >
          {activeTab === "scanner" && (
            <motion.div
              layoutId="mobileActiveIndicator"
              className="absolute -top-1 w-5 h-1 rounded-full bg-sky-400"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <Scan
            className={`w-4 h-4 mb-0.5 ${
              activeTab === "scanner" ? "text-sky-400" : ""
            }`}
          />
          <span className="text-[8.5px] tracking-tight">Scanner</span>
        </motion.button>

        {/* Tab 3: Coefficient Playground */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={() => setActiveTab("playground")}
          className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer relative ${
            activeTab === "playground"
              ? isDark
                ? "text-white font-bold"
                : "text-black font-bold"
              : isDark
              ? "text-zinc-500 hover:text-zinc-300"
              : "text-zinc-400 hover:text-zinc-700"
          }`}
        >
          {activeTab === "playground" && (
            <motion.div
              layoutId="mobileActiveIndicator"
              className="absolute -top-1 w-5 h-1 rounded-full bg-amber-400"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <Gamepad2
            className={`w-4 h-4 mb-0.5 ${
              activeTab === "playground" ? "text-amber-400" : ""
            }`}
          />
          <span className="text-[8.5px] tracking-tight">Playground</span>
        </motion.button>

        {/* Tab 4: Kalkulator Biloks */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={() => setActiveTab("biloks-calc")}
          className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer relative ${
            activeTab === "biloks-calc"
              ? isDark
                ? "text-white font-bold"
                : "text-black font-bold"
              : isDark
              ? "text-zinc-500 hover:text-zinc-300"
              : "text-zinc-400 hover:text-zinc-700"
          }`}
        >
          {activeTab === "biloks-calc" && (
            <motion.div
              layoutId="mobileActiveIndicator"
              className="absolute -top-1 w-5 h-1 rounded-full bg-sky-400"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <Hash
            className={`w-4 h-4 mb-0.5 ${
              activeTab === "biloks-calc" ? "text-sky-400" : ""
            }`}
          />
          <span className="text-[8.5px] tracking-tight">Biloks</span>
        </motion.button>

        {/* Tab 5: Text to LaTeX */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={() => setActiveTab("text-to-latex")}
          className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer relative ${
            activeTab === "text-to-latex"
              ? isDark
                ? "text-white font-bold"
                : "text-black font-bold"
              : isDark
              ? "text-zinc-500 hover:text-zinc-300"
              : "text-zinc-400 hover:text-zinc-700"
          }`}
        >
          {activeTab === "text-to-latex" && (
            <motion.div
              layoutId="mobileActiveIndicator"
              className="absolute -top-1 w-5 h-1 rounded-full bg-purple-400"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <Code2
            className={`w-4 h-4 mb-0.5 ${
              activeTab === "text-to-latex" ? "text-purple-400" : ""
            }`}
          />
          <span className="text-[8.5px] tracking-tight">LaTeX</span>
        </motion.button>

        {/* Tab 6: Tabel Periodik Modal Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={onOpenPeriodicTable}
          className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer relative ${
            isDark
              ? "text-zinc-300 hover:text-white"
              : "text-zinc-700 hover:text-black"
          }`}
        >
          <div className="relative">
            <Layers className="w-4 h-4 mb-0.5 text-sky-400" />
          </div>
          <span className="text-[8.5px] tracking-tight">Tabel 118</span>
        </motion.button>
      </div>
    </nav>
  );
};
