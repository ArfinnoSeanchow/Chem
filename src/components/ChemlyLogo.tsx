import React, { useId } from "react";
import { useTheme } from "../context/ThemeContext";

interface ChemlyLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  inverted?: boolean;
}

export const ChemlyLogo: React.FC<ChemlyLogoProps> = ({
  className = "",
  size = "md",
  showTagline = false,
  inverted = false,
}) => {
  const { isDark } = useTheme();
  const id = useId();

  const isNight = inverted ? !isDark : isDark;

  const heightClass = {
    sm: "h-6 sm:h-7",
    md: "h-8 sm:h-9",
    lg: "h-10 sm:h-12",
    xl: "h-14 sm:h-16",
  }[size];

  // Palet Fluida Kimiawi Eksklusif
  const glassTubeColor = isNight ? "#112217" : "#d1fae5";
  const fluidColor1 = isNight ? "#22c55e" : "#059669";
  const fluidColor2 = isNight ? "#bef264" : "#10b981";
  const fluidColor3 = isNight ? "#4ade80" : "#047857";

  const liquidGradId = `chemly-unified-grad-${id}`;
  const glassGlowId = `chemly-unified-glow-${id}`;

  return (
    <div className={`inline-flex flex-col select-none ${className} group cursor-pointer`}>
      <style>{`
        /* Siklus Pengisian Penuh Bersama -> Tahan -> Terkuras Habis -> Looping */
        @keyframes fullLiquidCycle {
          0% {
            stroke-dashoffset: 1;
            opacity: 0.2;
          }
          3% {
            opacity: 1;
          }
          45% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          62% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          88% {
            stroke-dashoffset: -1;
            opacity: 1;
          }
          93% {
            opacity: 0;
          }
          100% {
            stroke-dashoffset: -1;
            opacity: 0;
          }
        }

        /* Reaksi Flash Berpendar Saat Cairan 100% Penuh */
        @keyframes fullReagentSurge {
          0%, 42% {
            opacity: 0;
            filter: drop-shadow(0 0 0px transparent);
          }
          50%, 58% {
            opacity: 0.9;
            filter: drop-shadow(0 0 14px ${isNight ? "#bef264" : "#10b981"});
          }
          68%, 100% {
            opacity: 0;
            filter: drop-shadow(0 0 0px transparent);
          }
        }

        /* Gelembung Reaksi Internal */
        @keyframes reagentBubbling {
          0%, 20% {
            transform: translateY(16px) scale(0.3);
            opacity: 0;
          }
          45%, 60% {
            transform: translateY(-6px) scale(1.1);
            opacity: 0.95;
          }
          80%, 100% {
            transform: translateY(-22px) scale(0.4);
            opacity: 0;
          }
        }

        .chemly-fluid-core {
          stroke-dasharray: 1 1;
          animation: fullLiquidCycle 5.2s cubic-bezier(0.45, 0, 0.25, 1) infinite;
        }

        .chemly-surge-overlay {
          animation: fullReagentSurge 5.2s ease-in-out infinite;
        }

        .chemly-gas-bubble {
          animation: reagentBubbling 5.2s ease-in-out infinite;
        }
      `}</style>

      <div className="relative flex items-center">
        <svg
          viewBox="0 0 495 94"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${heightClass} w-auto transition-transform duration-300 group-hover:scale-[1.03]`}
          aria-label="CHEMLY"
          role="img"
        >
          <defs>
            {/* Filter Glow Fluida */}
            <filter id={glassGlowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Liquid Flow Gradient */}
            <linearGradient id={liquidGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={fluidColor1} />
              <stop offset="50%" stopColor={fluidColor2} />
              <stop offset="100%" stopColor={fluidColor3} />
            </linearGradient>
          </defs>

          {/* ======================================================== */}
          {/* LAYER 1: TABUNG KACA VAKUM KOSONG (BASE GLASS TUBE)     */}
          {/* ======================================================== */}
          <g
            stroke={glassTubeColor}
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={isNight ? 0.35 : 0.55}
            className="transition-opacity duration-300 group-hover:opacity-75"
          >
            {/* C */}
            <path d="M 68 25 C 58 13 42 7 26 15 C 9 24 5 44 8 62 C 11 78 28 89 45 86 C 58 83 67 74 72 63" />

            {/* H (Full Siphon Pipe) */}
            <path d="M 102 10 V 84 M 102 47 C 114 34 126 34 132 47 C 138 60 150 60 162 47 M 162 10 V 84" />

            {/* E (Continuous Connected Branch) */}
            <path d="M 242 16 H 194 V 47 H 234 M 194 47 V 78 H 242" />

            {/* M */}
            <path d="M 272 84 V 11 L 302 58 L 332 11 V 84" />

            {/* L */}
            <path d="M 364 10 V 84 H 406" />

            {/* Y (Siphon Funnel) */}
            <path d="M 434 10 L 454 46 M 474 10 L 454 46 V 67 C 454 79 462 84 474 84" />
          </g>

          {/* ======================================================== */}
          {/* LAYER 2: ALIRAN CAIRAN AKTIF (TERISI PENUH -> KOSONG)    */}
          {/* ======================================================== */}
          <g
            stroke={`url(#${liquidGradId})`}
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={isNight ? `url(#${glassGlowId})` : undefined}
          >
            {/* Huruf C */}
            <path
              pathLength="1"
              d="M 68 25 C 58 13 42 7 26 15 C 9 24 5 44 8 62 C 11 78 28 89 45 86 C 58 83 67 74 72 63"
              className="chemly-fluid-core"
            />

            {/* Huruf H: Kiri Turun -> Naik Jembatan Siphon -> Kanan Turun (Lengkap Penuh) */}
            <path
              pathLength="1"
              d="M 102 10 V 84 M 102 47 C 114 34 126 34 132 47 C 138 60 150 60 162 47 M 162 10 V 84"
              className="chemly-fluid-core"
            />

            {/* Huruf E: Aliran Terpadu Mengisi Seluruh Cabang Atas, Tengah & Bawah */}
            <path
              pathLength="1"
              d="M 242 16 H 194 V 47 H 234 M 194 47 V 78 H 242"
              className="chemly-fluid-core"
            />

            {/* Huruf M */}
            <path
              pathLength="1"
              d="M 272 84 V 11 L 302 58 L 332 11 V 84"
              className="chemly-fluid-core"
            />

            {/* Huruf L */}
            <path
              pathLength="1"
              d="M 364 10 V 84 H 406"
              className="chemly-fluid-core"
            />

            {/* Huruf Y */}
            <path
              pathLength="1"
              d="M 434 10 L 454 46 M 474 10 L 454 46 V 67 C 454 79 462 84 474 84"
              className="chemly-fluid-core"
            />
          </g>

          {/* ======================================================== */}
          {/* LAYER 3: SURGE OVERLAY (FLASH REAKTIF SAAT 100% TERISI) */}
          {/* ======================================================== */}
          <g
            stroke={isNight ? "#bef264" : "#10b981"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="chemly-surge-overlay pointer-events-none"
          >
            <path d="M 68 25 C 58 13 42 7 26 15 C 9 24 5 44 8 62 C 11 78 28 89 45 86 C 58 83 67 74 72 63" />
            <path d="M 102 10 V 84 M 102 47 C 114 34 126 34 132 47 C 138 60 150 60 162 47 M 162 10 V 84" />
            <path d="M 242 16 H 194 V 47 H 234 M 194 47 V 78 H 242" />
            <path d="M 272 84 V 11 L 302 58 L 332 11 V 84" />
            <path d="M 364 10 V 84 H 406" />
            <path d="M 434 10 L 454 46 M 474 10 L 454 46 V 67 C 454 79 462 84 474 84" />
          </g>

          {/* ======================================================== */}
          {/* LAYER 4: GELEMBUNG REAKSI MIKRO (AKTIF SAAT TAHAP HOLD) */}
          {/* ======================================================== */}
          <g fill={isNight ? "#ffffff" : "#34d399"} className="chemly-gas-bubble">
            <circle cx="28" cy="50" r="2.2" />
            <circle cx="102" cy="55" r="2.0" />
            <circle cx="162" cy="35" r="1.8" />
            <circle cx="194" cy="60" r="2.0" />
            <circle cx="302" cy="46" r="2.2" />
            <circle cx="454" cy="64" r="2.1" />
          </g>
        </svg>
      </div>

      {showTagline && (
        <div className="flex items-center gap-1.5 mt-0.5 pl-1">
          <span
            className={`text-[9px] tracking-[0.28em] font-mono font-bold uppercase transition-colors duration-300 ${
              isNight ? "text-[#bef264]" : "text-[#047857]"
            }`}
          >
            REDOX ENGINE
          </span>
        </div>
      )}
    </div>
  );
};