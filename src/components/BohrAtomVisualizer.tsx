import React from "react";
import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";

interface BohrAtomVisualizerProps {
  atomicNumber: number;
  symbol: string;
  className?: string;
  size?: number;
}

// Compute standard Bohr shell distribution (K, L, M, N, O, P, Q) for elements 1-118
function computeBohrShells(z: number): number[] {
  // Common Bohr shell electron distributions for elements
  // Standard capacity max: 2, 8, 18, 32, 32, 18, 8
  const capacities = [2, 8, 18, 32, 32, 18, 8];
  const shells: number[] = [];
  let remaining = z;

  // Simple realistic distribution rules for chemistry education
  if (z <= 2) return [z];
  if (z <= 10) return [2, z - 2];
  if (z <= 18) return [2, 8, z - 10];
  if (z <= 20) return [2, 8, 8, z - 18];
  if (z <= 30) return [2, 8, 8 + (z - 20), 2]; // 3d filling, 4s2
  if (z <= 36) return [2, 8, 18, z - 28]; // 4p filling
  if (z <= 38) return [2, 8, 18, 8, z - 36];
  if (z <= 48) return [2, 8, 18, 8 + (z - 38), 2];
  if (z <= 54) return [2, 8, 18, 18, z - 46];
  if (z <= 56) return [2, 8, 18, 18, 8, z - 54];
  if (z <= 86) {
    const rem = z - 56;
    return [2, 8, 18, 18 + Math.min(14, rem), 8 + Math.max(0, Math.min(10, rem - 14)), 2];
  }

  // Fallback for heavy elements
  for (const cap of capacities) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, cap);
    shells.push(take);
    remaining -= take;
  }
  return shells.slice(0, 5); // display up to 5 outermost rings for visual balance
}

export const BohrAtomVisualizer: React.FC<BohrAtomVisualizerProps> = ({
  atomicNumber,
  symbol,
  className = "",
  size = 140,
}) => {
  const { isDark } = useTheme();
  const shells = computeBohrShells(atomicNumber);
  const shellLabels = ["K", "L", "M", "N", "O", "P", "Q"];

  const center = size / 2;
  const nucleusRadius = 14;
  const maxRadius = center - 8;
  const ringStep = (maxRadius - nucleusRadius) / (shells.length || 1);

  return (
    <div
      className={`relative flex flex-col items-center select-none ${className}`}
      style={{ width: size, height: size + 24 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Ambient Nucleus Glow */}
        <circle
          cx={center}
          cy={center}
          r={nucleusRadius + 6}
          fill={isDark ? "#38bdf8" : "#0284c7"}
          opacity={0.15}
          className="animate-pulse"
        />

        {/* Orbit Rings & Orbiting Electrons */}
        {shells.map((count, idx) => {
          const r = nucleusRadius + (idx + 1) * ringStep;
          const duration = 8 + idx * 3.5; // outer rings orbit slower
          const isClockwise = idx % 2 === 0;

          // Place electrons evenly spaced around the ring
          const electrons = Array.from({ length: Math.min(count, 12) }).map((_, eIdx) => {
            const angle = (eIdx / Math.min(count, 12)) * (2 * Math.PI);
            const ex = center + r * Math.cos(angle);
            const ey = center + r * Math.sin(angle);
            return { ex, ey };
          });

          return (
            <g key={idx}>
              {/* Concentric Orbit Track */}
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke={isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}
                strokeWidth="1"
                strokeDasharray="2,3"
              />

              {/* Rotating Group of Electrons */}
              <motion.g
                animate={{ rotate: isClockwise ? 360 : -360 }}
                transition={{
                  duration,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ transformOrigin: `${center}px ${center}px` }}
              >
                {electrons.map((e, eIdx) => (
                  <circle
                    key={eIdx}
                    cx={e.ex}
                    cy={e.ey}
                    r="2.5"
                    fill={isDark ? "#38bdf8" : "#0284c7"}
                    stroke={isDark ? "#ffffff" : "#000000"}
                    strokeWidth="0.5"
                    className="drop-shadow-[0_0_4px_rgba(56,189,248,0.8)]"
                  />
                ))}
              </motion.g>
            </g>
          );
        })}

        {/* Central Nucleus with Symbol */}
        <circle
          cx={center}
          cy={center}
          r={nucleusRadius}
          fill={isDark ? "#18181b" : "#f4f4f5"}
          stroke={isDark ? "#38bdf8" : "#0284c7"}
          strokeWidth="1.5"
        />
        <text
          x={center}
          y={center + 3.5}
          textAnchor="middle"
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
          fill={isDark ? "#ffffff" : "#09090b"}
        >
          {symbol}
        </text>
      </svg>

      {/* Electron Distribution Per Shell (K, L, M...) */}
      <div className="flex items-center gap-1 mt-1 text-[9px] font-mono">
        {shells.map((count, idx) => (
          <span
            key={idx}
            className={`px-1 py-0.2 rounded border ${
              isDark
                ? "bg-zinc-900 border-zinc-800 text-zinc-300"
                : "bg-zinc-100 border-zinc-200 text-zinc-700"
            }`}
            title={`Kulit ${shellLabels[idx]}: ${count} elektron`}
          >
            <span className="opacity-60">{shellLabels[idx]}:</span>
            <span className="font-bold text-sky-400 ml-0.5">{count}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
