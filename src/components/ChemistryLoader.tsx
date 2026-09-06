import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { ChemlyLogo } from "./ChemlyLogo";

interface ChemistryLoaderProps {
  onComplete: () => void;
}

export const ChemistryLoader: React.FC<ChemistryLoaderProps> = ({ onComplete }) => {
  const { isDark } = useTheme();
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Sinkron dengan pengisian cairan logo (~2.3s)
    const duration = 2300;
    const interval = 20;
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsReady(true);
          // Jeda holding sebentar pas cairan penuh lalu trigger onComplete
          setTimeout(onComplete, 350);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  const loadingLetters = "LOADING".split("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.05,
        filter: "blur(8px)",
      }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none cursor-default ${
        isDark ? "bg-[#07080b] text-white" : "bg-[#f8faf9] text-zinc-900"
      }`}
    >
      <div className="flex flex-col items-center gap-7">
        {/* Logo dengan respon interaktif hover & scale pulse pas cairan penuh */}
        <motion.div
          animate={{
            scale: isReady ? 1.06 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <ChemlyLogo size="lg" />
        </motion.div>

        {/* Loading HUD: Bar tipis + Staggered Kinetic Letters */}
        <div className="flex flex-col items-center gap-3 w-36">
          {/* Progress Bar Tipis Presisi */}
          <div
            className={`w-full h-[2px] rounded-full overflow-hidden ${
              isDark ? "bg-zinc-800" : "bg-zinc-200"
            }`}
          >
            <motion.div
              className={`h-full transition-all duration-75 ease-out ${
                isDark ? "bg-[#c2f04e]" : "bg-emerald-600"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Staggered Letter Wave Animation */}
          <div className="flex items-center justify-center gap-1">
            {loadingLetters.map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0.2, y: 3 }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  y: [2, -3, 2],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.08,
                }}
                className={`text-[11px] font-mono font-bold tracking-widest ${
                  isReady
                    ? isDark
                      ? "text-[#c2f04e]"
                      : "text-emerald-700"
                    : isDark
                    ? "text-zinc-400"
                    : "text-zinc-600"
                }`}
              >
                {char}
              </motion.span>
            ))}

            {/* Pulsing Dots */}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className={`text-[11px] font-mono font-bold ${
                isDark ? "text-[#c2f04e]" : "text-emerald-600"
              }`}
            >
              ...
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};