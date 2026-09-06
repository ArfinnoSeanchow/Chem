import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";
import { equationToLatex } from "../utils/latexHelper";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Dither from "./Dither";
import WarpText from "./WarpText";
import ScrollReveal from "./ScrollReveal";
import { HandwritingText } from "./ui/handwriting-text";
import {
  ArrowUpRight,
  Scan,
  Layers,
  ChevronDown,
  Sun,
  Moon,
  Check,
  Terminal,
  Mail,
  ArrowRight,
  FlaskConical,
  Copy,
  Sparkles,
} from "lucide-react";
import { NavTab } from "./Header";
import { ChemlyLogo } from "./ChemlyLogo";
import { AudioController } from "./AudioController";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface LandingPageProps {
  onEnterApp: (mode?: NavTab) => void;
  onOpenPeriodicTable: () => void;
  onOpenNotes?: () => void;
  onSelectEquation?: (eq: string, med: "acidic" | "basic") => void;
}

const TYPEWRITER_REACTIONS = [
  {
    title: "Permanganometri Asam",
    equation: "MnO4- + C2O4^2- -> Mn2+ + CO2",
    balanced: "2 MnO4- + 5 C2O4^2- + 16 H+ -> 2 Mn2+ + 10 CO2 + 8 H2O",
    medium: "acidic" as const,
    electrons: 10,
    stoichiometryDelta: "+16 H⁺",
    redoxAgent: "MnO₄⁻ (Oksidator)",
    gibbs: "ΔG° = -782 kJ/mol",
  },
  {
    title: "Dikromat & Besi(II)",
    equation: "Cr2O7^2- + Fe2+ -> Cr3+ + Fe3+",
    balanced: "Cr2O7^2- + 6 Fe2+ + 14 H+ -> 2 Cr3+ + 6 Fe3+ + 7 H2O",
    medium: "acidic" as const,
    electrons: 6,
    stoichiometryDelta: "+14 H⁺",
    redoxAgent: "Cr₂O₇²⁻ (Oksidator)",
    gibbs: "ΔG° = -542 kJ/mol",
  },
  {
    title: "Autoredoks Gas Klorin",
    equation: "Cl2 + OH- -> Cl- + ClO3-",
    balanced: "3 Cl2 + 6 OH- -> 5 Cl- + ClO3- + 3 H2O",
    medium: "basic" as const,
    electrons: 5,
    stoichiometryDelta: "+6 OH⁻",
    redoxAgent: "Cl₂ (Disproporsionasi)",
    gibbs: "ΔG° = -310 kJ/mol",
  },
];

const MARQUEE_ITEMS = [
  { icon: "⚡", text: "Penyetaraan Redoks Seketika" },
  { icon: "🧪", text: "Metode Setengah Reaksi (Ion-Elektron)" },
  { icon: "⚖️", text: "Metode Perubahan Bilangan Oksidasi (PBO)" },
  { icon: "📐", text: "Ekspor Rumus KaTeX Math & LaTeX" },
  { icon: "🔍", text: "Tutor Analitik Penyeimbangan H₂O & H⁺ / OH⁻" },
  { icon: "🔬", text: "Tabel Periodik 118 Unsur Adaptif" },
  { icon: "🛡️", text: "Verifikasi Konservasi Massa & Muatan Mutlak" },
];

const FAQ_ITEMS = [
  {
    question: "Bagaimana Chemly menjamin persamaan 100% setara tanpa galat?",
    answer:
      "Chemly memanfaatkan komputasi aljabar pecahan eksak pada matriks reaksi tanpa pembulatan desimal, sehingga neraca massa atom dan kesetaraan muatan listrik tervalidasi secara absolut.",
  },
  {
    question: "Kapan harus memilih Suasana Asam versus Suasana Basa?",
    answer:
      "Pilih Suasana Asam bila media mengandung ion H⁺ (menyeimbangkan O dengan molekul H₂O lalu menambah ion H⁺). Pada Suasana Basa, sistem otomatis menyeimbangkan muatan melalui ion OH⁻ dan menetralkan kelebihan H⁺ menjadi H₂O.",
  },
  {
    question: "Apakah didukung reaksi autoredoks dan konproporsionasi?",
    answer:
      "Ya. Spesi ganda seperti Cl₂ menjadi Cl⁻ dan ClO₃⁻ dideteksi secara otomatis dan dipecah ke dua paruh reaksi reduksi dan oksidasi terpisah.",
  },
  {
    question: "Bagaimana cara menyalin hasil ke Word atau makalah LaTeX?",
    answer:
      "Tersedia tombol satu-klik untuk format teks bersih siap tempel ke Docs/Word, format display math ($$...$$), maupun format LaTeX murni.",
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenPeriodicTable,
  onOpenNotes,
  onSelectEquation,
}) => {
  const { isDark, toggleTheme } = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollPos > 35);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 180 };
  const tiltX = useSpring(useTransform(mouseY, [-300, 300], [5, -5]), springConfig);
  const tiltY = useSpring(useTransform(mouseX, [-300, 300], [-5, 5]), springConfig);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const heroMockupY = useTransform(scrollYProgress, [0, 0.25], [15, -35]);

  const [reactionIndex, setReactionIndex] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSuccess, setEmailSuccess] = useState(false);

  const currentReaction = TYPEWRITER_REACTIONS[reactionIndex];

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroTitleRef.current) {
        gsap.fromTo(
          heroTitleRef.current.querySelectorAll(".hero-char"),
          {
            opacity: 0,
            y: 40,
            rotateX: -60,
            filter: "blur(6px)",
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            filter: "blur(0px)",
            duration: 1.1,
            stagger: 0.03,
            ease: "power4.out",
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const fullText = currentReaction.equation;
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (typewriterText.length < fullText.length) {
        timer = setTimeout(() => {
          setTypewriterText(fullText.slice(0, typewriterText.length + 1));
        }, 40);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2600);
      }
    } else {
      if (typewriterText.length > 0) {
        timer = setTimeout(() => {
          setTypewriterText(fullText.slice(0, typewriterText.length - 1));
        }, 20);
      } else {
        setIsDeleting(false);
        setReactionIndex((prev) => (prev + 1) % TYPEWRITER_REACTIONS.length);
      }
    }

    return () => clearTimeout(timer);
  }, [typewriterText, isDeleting, currentReaction]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mockupRef.current) return;
    const rect = mockupRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleLaunchReaction = () => {
    if (onSelectEquation) {
      onSelectEquation(currentReaction.equation, currentReaction.medium);
    }
    onEnterApp("solver");
  };

  const handleCopyEquation = () => {
    navigator.clipboard.writeText(currentReaction.balanced);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen w-full p-2.5 sm:p-4 lg:p-6 transition-colors duration-700 font-sans selection:bg-[#c2f04e] selection:text-black ${
        isDark ? "bg-[#07080b] text-zinc-100" : "bg-[#d8ded9] text-zinc-900"
      }`}
    >
      <div
        className={`relative w-full rounded-2xl sm:rounded-[40px] border overflow-hidden transition-colors shadow-2xl ${
          isDark
            ? "bg-[#020305] border-zinc-800/80 shadow-black/90"
            : "bg-[#fcfdfc] border-zinc-300 shadow-zinc-400/25"
        }`}
      >
        {/* Background Dither */}
        <div className="absolute top-0 left-0 right-0 h-[1050px] pointer-events-auto opacity-80 dark:opacity-70 select-none overflow-hidden z-0">
          <Dither
            waveSpeed={0.05}
            waveFrequency={2.8}
            waveAmplitude={0.3}
            enableMouseInteraction={true}
            mouseRadius={0.45}
            pixelSize={3.0}
            colorNum={5}
            waveColor={isDark ? [0.42, 0.95, 0.2] : [0.26, 0.72, 0.14]}
            backgroundColor={isDark ? [0.015, 0.03, 0.015] : [0.92, 0.97, 0.9]}
          />
          <div
            className={`absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-90% ${
              isDark ? "to-[#020305]" : "to-[#fcfdfc]"
            }`}
          />
        </div>

        {/* ========================================================================= */}
        {/* HARDWARE-ALIGNED MACBOOK NOTCH -> DYNAMIC FLOATING CAPSULE ON SCROLL     */}
        {/* ========================================================================= */}
        <div
          className={`z-50 flex justify-center w-full pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isScrolled
              ? "fixed top-3 left-0 right-0 px-4"
              : "absolute top-0 left-0 right-0 px-0"
          }`}
        >
          <header
            className={`pointer-events-auto flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border shadow-2xl backdrop-blur-2xl ${
              isScrolled
                ? `w-full max-w-3xl px-5 sm:px-7 py-2.5 rounded-full border-zinc-700/80 shadow-[0_15px_40px_rgba(0,0,0,0.55)] ${
                    isDark
                      ? "bg-[#0b0c10]/90 text-white"
                      : "bg-white/95 text-zinc-900 border-zinc-300 shadow-zinc-400/30"
                  }`
                : `w-full max-w-5xl px-6 sm:px-10 py-3.5 rounded-b-3xl border-t-0 border-x border-b ${
                    isDark
                      ? "bg-[#0b0c10]/95 border-zinc-800/90 text-white shadow-black/50"
                      : "bg-[#0f1115]/95 text-white border-zinc-900 shadow-zinc-900/15"
                  }`
            }`}
          >
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => onEnterApp("solver")}
            >
              <div className="transition-transform duration-300 group-hover:scale-105">
                <ChemlyLogo size="sm" />
              </div>
            </div>

            <div
              className={`hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide transition-colors ${
                !isScrolled || isDark ? "text-zinc-300" : "text-zinc-700"
              }`}
            >
              <button
                type="button"
                onClick={() => onEnterApp("solver")}
                className="hover:text-[#c2f04e] transition-colors cursor-pointer flex items-center gap-1 group"
              >
                <span>Penyetara Redoks</span>
                <ChevronDown className="w-3 h-3 opacity-60 transition-transform group-hover:translate-y-0.5" />
              </button>
              <button
                type="button"
                onClick={onOpenPeriodicTable}
                className="hover:text-[#c2f04e] transition-colors cursor-pointer flex items-center gap-1 group"
              >
                <span>Tabel Periodik</span>
                <ChevronDown className="w-3 h-3 opacity-60 transition-transform group-hover:translate-y-0.5" />
              </button>
              {onOpenNotes && (
                <button
                  type="button"
                  onClick={onOpenNotes}
                  className="hover:text-[#c2f04e] transition-colors cursor-pointer"
                >
                  Glosarium
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <AudioController />
              <button
                type="button"
                onClick={toggleTheme}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-white/5 ${
                  !isScrolled || isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-black"
                }`}
                title="Ganti Tema"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => onEnterApp("solver")}
                className="relative group overflow-hidden bg-[#c2f04e] hover:bg-[#b2e23f] text-black font-extrabold text-xs px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer shadow-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(194,240,78,0.55)] hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                <span className="relative z-10">Mulai</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </header>
        </div>

        {/* Hero Section */}
        <main className="relative z-20 pt-24 sm:pt-32 pb-16 px-4 sm:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-7">
            <div className="space-y-4">
              {/* Highlighted Chemly Badge */}
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-2 font-black text-xs sm:text-sm tracking-[0.35em] uppercase px-5 py-2 rounded-full border border-[#2d8517]/40 dark:border-[#c2f04e]/50 bg-[#2d8517]/15 dark:bg-[#c2f04e]/10 text-[#094d11] dark:text-[#c2f04e] backdrop-blur-xl shadow-[0_0_25px_rgba(194,240,78,0.25)] transition-transform duration-300 hover:scale-105">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#2d8517] dark:text-[#c2f04e]" />
                  <span>Chemly</span>
                </span>
              </div>

              {/* Headline Title */}
              <h1
                ref={heroTitleRef}
                className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.06] text-balance text-zinc-950 dark:text-white"
                style={{ perspective: 1000 }}
              >
                {"Kuasai Kesetaraan Redoks".split(" ").map((word, wIdx) => (
                  <span key={wIdx} className="inline-block whitespace-nowrap mr-3 sm:mr-4">
                    {word.split("").map((char, cIdx) => (
                      <span key={cIdx} className="hero-char inline-block">
                        {char}
                      </span>
                    ))}
                  </span>
                ))}
              </h1>

              {/* Dynamic Subline Calligraphy */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-2xl sm:text-4xl lg:text-5xl font-serif">
                <span className="text-zinc-700 dark:text-zinc-400 font-normal italic">
                  Solusi mutlak,
                </span>
                <HandwritingText
                  words={[
                    "tanpa tebakan.",
                    "100% presisi IUPAC.",
                    "tutor ion-elektron.",
                    "langkah terinci.",
                  ]}
                  className={`${
                    isDark
                      ? "text-[#9ef824] drop-shadow-[0_0_16px_rgba(158,248,36,0.35)]"
                      : "text-[#053d0e] drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
                  } font-sans font-extrabold not-italic`}
                  height="1.2em"
                  interval={3200}
                />
              </div>
            </div>

            {/* Subtext */}
            <p
              className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${
                isDark ? "text-zinc-300" : "text-zinc-800 font-medium"
              }`}
            >
              Bedah reaksi redoks paling kompleks dengan eliminasi aljabar pecahan eksak.
              Dapatkan dekomposisi paruh reaksi, neraca muatan elektron, dan sintaks LaTeX seketika.
            </p>

            {/* Action Button */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onEnterApp("solver")}
                className="relative group overflow-hidden bg-[#0b0c0f] hover:bg-[#12141a] text-white pl-7 pr-3 py-3 rounded-full text-sm font-bold tracking-wide flex items-center gap-4 cursor-pointer shadow-2xl border border-zinc-700/80 transition-all duration-300 hover:border-[#c2f04e]/70 hover:shadow-[0_0_35px_rgba(194,240,78,0.3)] hover:scale-[1.03] active:scale-[0.98]"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#c2f04e]/20 to-transparent pointer-events-none" />
                <span className="relative z-10 font-semibold tracking-normal">Buka Penyetara Reaksi</span>
                <div className="relative z-10 w-8 h-8 rounded-full bg-[#c2f04e] text-black flex items-center justify-center transition-all duration-300 group-hover:rotate-45 group-hover:bg-[#d4ff59] shadow-md">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </button>
            </div>
          </div>

          {/* Console Mockup */}
          <motion.div
            style={{ y: heroMockupY }}
            className="w-full max-w-5xl mx-auto mt-14 sm:mt-18 perspective-[1400px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              ref={mockupRef}
              style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
              className="relative rounded-3xl border border-zinc-700/60 bg-[#0c0d11]/95 text-zinc-100 p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-3xl transition-shadow duration-300 hover:shadow-[0_30px_70px_-10px_rgba(158,232,57,0.15)]"
            >
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-3 border-b md:border-b-0 md:border-r border-zinc-800/80 pr-4 pb-4 md:pb-0 space-y-3.5">
                  <div className="flex items-center gap-2 px-1 pt-0.5">
                    <div className="w-4 h-4 rounded-full bg-[#c2f04e] flex items-center justify-center text-[9px] font-bold text-black shadow-sm">
                      ✓
                    </div>
                    <span className="text-xs font-semibold text-zinc-200 tracking-wide">
                      Chemly Lab
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 px-2 block">
                      Navigasi
                    </span>
                    <div className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-800/90 text-white font-medium border border-zinc-700/50 shadow-inner">
                      <FlaskConical className="w-4 h-4 text-[#c2f04e]" />
                      <span>Penyetara Live</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onEnterApp("scanner")}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer text-left hover:bg-zinc-800/40"
                    >
                      <Scan className="w-4 h-4" />
                      <span>Scanner Batch</span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenPeriodicTable}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer text-left hover:bg-zinc-800/40"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Tabel Periodik</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 text-[11px] font-mono space-y-1">
                    <div className="text-zinc-500 text-[10px]">TERMODINAMIKA</div>
                    <div className="text-[#c2f04e] font-bold">{currentReaction.gibbs}</div>
                  </div>
                </div>

                <div className="md:col-span-9 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl border border-zinc-800/80 bg-[#13141a]/90 backdrop-blur-md">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>Transfer e⁻</span>
                        <span className="text-[#c2f04e] font-mono font-bold">Setara</span>
                      </div>
                      <div className="text-base sm:text-lg font-bold font-mono text-white mt-1">
                        {currentReaction.electrons} e⁻
                      </div>
                      <span className="text-[10px] text-zinc-500">Konservasi muatan</span>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-zinc-800/80 bg-[#13141a]/90 backdrop-blur-md">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>Kompensasi</span>
                        <span className="text-[#c2f04e] font-mono font-bold">Otomatis</span>
                      </div>
                      <div className="text-base sm:text-lg font-bold font-mono text-zinc-200 mt-1">
                        {currentReaction.stoichiometryDelta}
                      </div>
                      <span className="text-[10px] text-zinc-500">Neraca O & H</span>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-zinc-800/80 bg-[#13141a]/90 backdrop-blur-md">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>Oksidator</span>
                        <span className="text-[#c2f04e] font-mono font-bold">Aktif</span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold font-mono text-zinc-200 mt-1.5 truncate">
                        {currentReaction.redoxAgent}
                      </div>
                      <span className="text-[10px] text-zinc-500">Spesi tereduksi</span>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-zinc-800/80 bg-[#13141a]/90 backdrop-blur-md">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>Akurasi</span>
                        <span className="text-[#c2f04e] font-mono font-bold">Penuh</span>
                      </div>
                      <div className="text-base sm:text-lg font-bold font-mono text-[#c2f04e] mt-1">
                        100%
                      </div>
                      <span className="text-[10px] text-zinc-500">Standar IUPAC</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-700/80 bg-[#050608] space-y-3.5 shadow-2xl">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 overflow-x-auto">
                        <Terminal className="w-4 h-4 text-[#c2f04e] shrink-0" />
                        <span className="text-zinc-100 font-bold tracking-wide bg-zinc-900/80 px-2.5 py-1 rounded border border-zinc-800">
                          {typewriterText || " "}
                        </span>
                        <span className="w-2 h-4 bg-[#c2f04e] animate-pulse shrink-0 inline-block" />
                      </div>
                      <button
                        type="button"
                        onClick={handleLaunchReaction}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#c2f04e] hover:bg-[#b0df3c] text-black transition-all cursor-pointer shrink-0 shadow active:scale-95"
                      >
                        Setarakan
                      </button>
                    </div>

                    <div className="border-t border-zinc-800/90 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-zinc-950/60 p-2.5 rounded-lg">
                      <div className="overflow-x-auto font-serif text-sm sm:text-base font-medium text-[#73e61a] drop-shadow-[0_0_12px_rgba(115,230,26,0.35)]">
                        <Latex math={equationToLatex(currentReaction.balanced)} />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleCopyEquation}
                          className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer bg-zinc-900 px-2.5 py-1 rounded border border-zinc-700 hover:border-zinc-500"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 text-[#c2f04e]" />
                          ) : (
                            <Copy className="w-3 h-3 text-zinc-400" />
                          )}
                          <span>{copied ? "Tersalin!" : "Salin"}</span>
                        </button>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                          <Check className="w-3.5 h-3.5 text-[#c2f04e]" />
                          <span>100% Setara</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>

        {/* Marquee Ticker */}
        <section
          className={`w-full overflow-hidden py-4 border-y transition-colors select-none ${
            isDark
              ? "bg-zinc-950/80 border-zinc-800/80 text-zinc-400"
              : "bg-zinc-100/70 border-zinc-200 text-zinc-600"
          }`}
        >
          <div className="flex w-max animate-chemly-marquee gap-8">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap ${
                  isDark
                    ? "bg-zinc-900/80 border-zinc-800 text-zinc-300"
                    : "bg-white border-zinc-200 text-zinc-800 shadow-2xs"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section Manifesto */}
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-24 sm:py-32">
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#c2f04e] uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chemly Platform</span>
              </div>

              <div className="h-[100px] sm:h-[130px] w-full max-w-xl">
                <WarpText
                  text="Chemly"
                  color={isDark ? "#c2f04e" : "#2d8517"}
                  warpStrength={0.08}
                  warpScale={1.5}
                  speed={0.5}
                  pointerInfluence={0.4}
                  pointerStrength={0.35}
                  refraction={0.018}
                  ripple={true}
                  fontSize="clamp(3.5rem, 8vw, 6.5rem)"
                  fontWeight={900}
                  letterSpacing="-0.04em"
                  style={{ height: "100%", width: "100%" }}
                />
              </div>
            </div>

            <ScrollReveal
              baseOpacity={0.15}
              enableBlur={true}
              blurStrength={6}
              baseRotation={1.5}
              textClassName={isDark ? "text-zinc-200" : "text-zinc-800"}
            >
              Siswa, guru, dan peserta olimpiade memanfaatkan Chemly untuk membedah setiap tahapan
              reaksi redoks, menggabungkan ketelitian kimia fisik dengan komputasi rasional
              dalam satu sistem yang terverifikasi.
            </ScrollReveal>
          </div>
        </section>

        {/* Bento Grid */}
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-5 rounded-[36px] bg-[#9ee839] text-black p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-xl transition-transform duration-300 hover:-translate-y-1">
              <div className="space-y-2 z-10">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                  Tutor Runtut
                  <br />
                  Setiap Reaksi
                </h3>
                <p className="text-xs sm:text-sm font-medium opacity-85 max-w-xs">
                  Pahami alasan penambahan H₂O, penentuan biloks atom, dan eliminasi elektron per
                  tahap.
                </p>
              </div>

              <div className="mt-8 mx-auto w-full max-w-[260px] rounded-[32px] bg-white text-black p-4 shadow-2xl border-4 border-black/10">
                <div className="w-14 h-3 bg-black rounded-full mx-auto mb-3" />
                <div className="space-y-2.5 p-1">
                  <div className="text-sm font-extrabold tracking-tight">Reaksi Siap Dihitung!</div>
                  <div className="text-[11px] text-zinc-500 leading-tight">
                    Metode Ion-Elektron terverifikasi otomatis.
                  </div>
                  <div className="p-3 rounded-2xl bg-[#9ee839]/30 border border-[#9ee839] space-y-1.5">
                    <div className="text-xs font-bold">Reduksi: MnO₄⁻ → Mn²⁺</div>
                    <div className="text-[10px] font-mono text-zinc-700">+5 e⁻ • 4 H₂O • 8 H⁺</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 space-y-5">
              <div className="rounded-[36px] bg-[#141715] text-white p-6 sm:p-8 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6 transition-transform duration-300 hover:-translate-y-1">
                <div className="space-y-2 max-w-xs">
                  <h4 className="text-xl font-bold">Matriks Konservasi</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Pantau neraca massa setiap elemen dan muatan listrik secara seketika.
                  </p>
                </div>

                <div className="w-full sm:w-52 rounded-2xl bg-black border border-zinc-800 p-3.5 space-y-2">
                  <div className="w-10 h-2 bg-zinc-800 rounded-full mx-auto" />
                  <div className="text-[11px] text-zinc-400">Neraca Muatan Listrik</div>
                  <div className="text-lg font-bold font-mono text-[#9ee839]">Σ Kiri = Σ Kanan</div>
                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-zinc-900 text-zinc-400">
                    <span>Hukum Lavoisier</span>
                    <span className="text-[#9ee839]">Tervalidasi</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="rounded-[32px] bg-[#121417] text-white p-6 border border-zinc-800 space-y-3 transition-transform duration-300 hover:-translate-y-1">
                  <div className="text-xs text-zinc-400 font-medium">Pengguna Aktif</div>
                  <div className="text-2xl font-bold font-mono">150k+ Reaksi</div>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-black" />
                      <div className="w-6 h-6 rounded-full bg-sky-500 border-2 border-black" />
                      <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-black" />
                    </div>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      SMA, UTBK & Olimpiade
                    </span>
                  </div>
                </div>

                <div className="rounded-[32px] bg-[#9ee839] text-black p-6 space-y-3 shadow-md transition-transform duration-300 hover:-translate-y-1">
                  <div className="text-lg font-extrabold leading-tight">118 Unsur Kimia</div>
                  <p className="text-xs font-medium opacity-85">
                    Tabel periodik adaptif ponsel lengkap dengan biloks lazim.
                  </p>
                  <div className="space-y-1.5 pt-1 font-mono text-[11px]">
                    <div className="px-2.5 py-1 rounded-lg bg-black/10 font-bold flex items-center justify-between">
                      <span>Golongan</span>
                      <span>1 s/d 18</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-black/10 font-bold flex items-center justify-between">
                      <span>Akurasi Biloks</span>
                      <span>100% IUPAC</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full max-w-4xl mx-auto px-4 sm:px-8 pb-28">
          <div className="text-center mb-8 space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h3>
            <p className={`text-xs sm:text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Detail teknis algoritma, aturan suasana, dan metode penyetaraan Chemly.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-zinc-800/90 bg-[#0b0c10] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer text-white"
                  >
                    <span className="font-semibold text-sm sm:text-base">{item.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#9ee839]" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-900">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <div className="relative pt-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 relative z-20 mb-[-60px]">
            <div className="rounded-3xl bg-white text-black p-8 sm:p-11 shadow-2xl border border-zinc-200 text-center space-y-5">
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-balance leading-tight">
                Mulai Selesaikan Persamaan Redoks Anda Hari Ini
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
                Dapatkan koefisien bulat terkecil lengkap dengan langkah paruh reaksi tanpa perlu
                instalasi.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (emailInput) {
                    setEmailSuccess(true);
                    setTimeout(() => setEmailSuccess(false), 3000);
                  }
                }}
                className="max-w-md mx-auto flex items-center p-1.5 rounded-full border border-zinc-300 bg-zinc-50 shadow-inner"
              >
                <div className="flex items-center gap-2 pl-3 text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className="w-full bg-transparent px-2 py-1.5 text-xs text-black focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <span>{emailSuccess ? "Terdaftar!" : "Daftar Akses"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          <div className="w-full rounded-t-[48px] sm:rounded-t-[64px] bg-[#9ee839] text-black pt-28 sm:pt-32 pb-14 px-6 sm:px-12 relative overflow-hidden z-10">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div
                onClick={() => onEnterApp("solver")}
                className="flex items-center gap-3.5 cursor-pointer select-none group p-2 -m-2 rounded-2xl transition-all duration-300 hover:bg-black/10"
              >
                <div className="p-2.5 rounded-xl bg-black text-[#9ee839] shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-zinc-900 group-hover:shadow-black/30 group-hover:shadow-lg">
                  <ChemlyLogo size="md" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-10 sm:gap-16 text-xs font-semibold">
                <div className="space-y-2.5">
                  <span className="text-[10px] uppercase tracking-wider opacity-60 font-mono block">
                    Modul
                  </span>
                  <div
                    className="hover:opacity-75 cursor-pointer"
                    onClick={() => onEnterApp("solver")}
                  >
                    Penyetara Redoks
                  </div>
                  <div className="hover:opacity-75 cursor-pointer" onClick={onOpenPeriodicTable}>
                    Tabel Periodik
                  </div>
                  <div
                    className="hover:opacity-75 cursor-pointer"
                    onClick={() => onEnterApp("scanner")}
                  >
                    Scanner Reaksi
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] uppercase tracking-wider opacity-60 font-mono block">
                    Referensi
                  </span>
                  <div className="hover:opacity-75 cursor-pointer" onClick={onOpenNotes}>
                    8 Aturan Biloks
                  </div>
                  <div className="hover:opacity-75 cursor-pointer" onClick={onOpenNotes}>
                    Metode Ion-Elektron
                  </div>
                  <div className="hover:opacity-75 cursor-pointer" onClick={onOpenNotes}>
                    Glosarium
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] uppercase tracking-wider opacity-60 font-mono block">
                    Standar
                  </span>
                  <div>IUPAC</div>
                  <div>Exact Rational</div>
                  <div>KaTeX mhchem</div>
                </div>
              </div>
            </div>

            <div className="max-w-5xl mx-auto pt-10 border-t border-black/10 mt-10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-medium opacity-75">
              <span>© 2026 Chemly. Hak cipta dilindungi undang-undang.</span>
              <span>Konservasi Massa & Muatan Mutlak</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};