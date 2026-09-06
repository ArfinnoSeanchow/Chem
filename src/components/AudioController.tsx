import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music, Sliders, Play, Pause } from "lucide-react";
import { backgroundSound } from "../utils/audioPlayer";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "motion/react";

export const AudioController: React.FC = () => {
  const { isDark } = useTheme();
  const [state, setState] = useState(backgroundSound.getState());
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = backgroundSound.subscribe(() => {
      setState(backgroundSound.getState());
    });
    return () => unsub();
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };
    if (showPopover) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPopover]);

  const handleToggle = () => {
    if (!state.isPlaying) {
      backgroundSound.play();
    } else {
      backgroundSound.toggleMute();
    }
  };

  const isAudible = state.isPlaying && !state.isMuted;

  return (
    <div className="relative" ref={popoverRef}>
      {/* Main Header Sound Button */}
      <button
        type="button"
        onClick={handleToggle}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowPopover((prev) => !prev);
        }}
        className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
          isAudible
            ? isDark
              ? "bg-sky-500/10 border-sky-500/30 text-sky-400 shadow-xs"
              : "bg-sky-50 border-sky-300 text-sky-700 shadow-xs"
            : isDark
            ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
            : "bg-white border-zinc-200 text-zinc-500 hover:text-black hover:border-zinc-300"
        }`}
        title={
          isAudible
            ? "Backsound Aktif (Klik untuk Mute, Klik Kanan untuk Pengaturan)"
            : "Aktifkan Backsound Relaksasi (backsound.mp3 / Lo-Fi)"
        }
      >
        {isAudible ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-sky-400" />
            {/* Animated Equalizer Wave Bars */}
            <span className="flex items-center gap-0.5 h-3">
              <span className="w-0.5 h-2 bg-sky-400 rounded-full animate-pulse" />
              <span className="w-0.5 h-3 bg-sky-400 rounded-full animate-pulse delay-75" />
              <span className="w-0.5 h-1.5 bg-sky-400 rounded-full animate-pulse delay-150" />
            </span>
            <span className="hidden sm:inline text-[11px] font-mono font-bold">BGM</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 opacity-70" />
            <span className="hidden sm:inline text-[11px] font-mono">BGM Mute</span>
          </>
        )}
      </button>

      {/* Mini Controls Popover (Click right or hover settings) */}
      <AnimatePresence>
        {showPopover && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 mt-2 w-64 p-3.5 rounded-xl border shadow-xl z-50 text-xs ${
              isDark
                ? "bg-zinc-950/95 border-zinc-800 text-white"
                : "bg-white/95 border-zinc-200 text-zinc-900"
            } backdrop-blur-md`}
          >
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-zinc-800/40">
              <div className="flex items-center gap-1.5 font-bold">
                <Music className="w-3.5 h-3.5 text-sky-400" />
                <span>Audio Backsound</span>
              </div>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                  state.usingFileAudio
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-sky-500/10 border-sky-500/30 text-sky-400"
                }`}
              >
                {state.usingFileAudio ? "backsound.mp3" : "Ambient Lo-Fi"}
              </span>
            </div>

            {/* Play/Pause & Mute Toggle */}
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => backgroundSound.toggle()}
                className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  state.isPlaying
                    ? "bg-zinc-800 text-white hover:bg-zinc-700"
                    : "bg-sky-500 text-black hover:bg-sky-400"
                }`}
              >
                {state.isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Jeda</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Putar Backsound</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => backgroundSound.toggleMute()}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  state.isMuted
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : isDark
                    ? "bg-zinc-900 border-zinc-800 text-zinc-300"
                    : "bg-zinc-100 border-zinc-300 text-zinc-700"
                }`}
                title={state.isMuted ? "Bunyikan" : "Bisukan"}
              >
                {state.isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Volume Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Volume Audio</span>
                <span className="font-mono">{Math.round(state.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={state.volume}
                onChange={(e) => backgroundSound.setVolume(parseFloat(e.target.value))}
                className="w-full accent-sky-400 h-1 bg-zinc-700 rounded-lg cursor-pointer"
              />
            </div>

            <p className="mt-2.5 text-[10px] text-zinc-500 leading-tight">
              Jika file <code className="font-mono text-zinc-400">/backsound.mp3</code> diletakkan di folder publik, audio file akan diputar otomatis.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
