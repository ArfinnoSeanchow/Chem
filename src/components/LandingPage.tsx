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
import { Navbar } from "./navbar";

export interface LandingPageProps {
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
  const { isDark } = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);

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

  const [reactionIndex, setReactionIndex] = useState<number>(0);
  const [typewriterText, setTypewriterText] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>("");
  const [emailSuccess, setEmailSuccess] = useState<boolean>(false);

  // Runtime null guard
  const currentReaction = TYPEWRITER_REACTIONS[reactionIndex] ?? TYPEWRITER_REACTIONS[0];

  // GSAP Safety Hook
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (heroTitleRef.current) {
        const chars = heroTitleRef.current.querySelectorAll(".hero-char");
        if (chars.length > 0) {
          gsap.fromTo(
            chars,
            {
              opacity: 0,
              y: 35,
              rotateX: -50,
              filter: "blur(5px)",
            },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              filter: "blur(0px)",
              duration: 1,
              stagger: 0.03,
              ease: "power4.out",
            }
          );
        }
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Typewriter Loop
  useEffect(() => {
    const fullText = currentReaction?.equation || "";
    let timer: ReturnType<typeof setTimeout>;

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
    if (onSelectEquation && currentReaction) {
      onSelectEquation(currentReaction.equation, currentReaction.medium);
    }
    onEnterApp?.("solver");
  };

  const handleCopyEquation = () => {
    if (currentReaction?.balanced) {
      navigator.clipboard.writeText(currentReaction.balanced);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
        {/* Background Dither Component */}
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

        {/* 1. Navbar Hardware/Floating Notch */}
        <Navbar
          onEnterApp={onEnterApp}
          onOpenPeriodicTable={onOpenPeriodicTable}
          onOpenNotes={onOpenNotes}
        />

        {/* 2. Hero Section */}
        <main className="relative z-20 pt-28 sm:pt-32 pb-14 sm:pb-16 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-5xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }} className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] font-mono tracking-[.22em] uppercase text-zinc-500 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c2f04e]" />
                Chemly Studio · Redox Workspace
              </motion.div>

              <h1 ref={heroTitleRef} className="text-[clamp(2.35rem,5.2vw,5rem)] font-black tracking-[-.05em] leading-[.94] text-zinc-950 dark:text-white" style={{ perspective: 1000 }}>
                {"Seimbangkan reaksi.\nPahami prosesnya.".split("\n").map((line, li) => (
                  <span key={li} className="block">{line.split(" ").map((word, wi) => <span key={wi} className="hero-word inline-block mr-[.2em]">{word.split("").map((char, ci) => <span key={ci} className="hero-char inline-block">{char}</span>)}</span>)}</span>
                ))}
              </h1>

              <p className={`max-w-xl mx-auto mt-5 text-[13px] sm:text-base leading-6 sm:leading-7 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                Masukkan reaksi yang kamu punya. Chemly membantu menemukan koefisiennya, menjelaskan langkahnya, lalu memeriksa massa, muatan, dan elektron sebelum hasilnya dianggap selesai.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-6">
                <button type="button" onClick={() => onEnterApp?.("solver")} className="group h-12 px-5 rounded-2xl bg-[#c2f04e] text-black text-sm font-bold flex items-center gap-4 cursor-pointer hover:bg-[#d2ff6a] transition-all active:scale-[.98] shadow-[0_14px_40px_rgba(194,240,78,.14)]">
                  <span>Mulai menyeimbangkan</span><span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center group-hover:rotate-45 transition-transform"><ArrowUpRight className="w-3.5 h-3.5" /></span>
                </button>
                <button type="button" onClick={() => onEnterApp?.("methodology")} className="h-12 px-5 rounded-2xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-white/[.035] text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors">Lihat cara kerjanya <ArrowRight className="w-4 h-4" /></button>
              </div>

              <div className="mt-7 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[9px] sm:text-[10px] font-mono uppercase tracking-[.12em] text-zinc-500">
                <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#c2f04e]" />Mass</span>
                <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#c2f04e]" />Charge</span>
                <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#c2f04e]" />Electrons</span>
                <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#c2f04e]" />Exact rational</span>
              </div>
            </div>

            <motion.div style={{ y: heroMockupY }} className="w-full max-w-5xl mx-auto mt-8 sm:mt-10 perspective-[1400px]" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <motion.div ref={mockupRef} style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }} className="relative rounded-[28px] border border-zinc-800 bg-[#0a0b0e]/95 text-zinc-100 p-4 sm:p-6 shadow-[0_35px_90px_rgba(0,0,0,.55)] backdrop-blur-xl">
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="md:w-[30%] md:border-r border-zinc-800/80 md:pr-5 space-y-4">
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="w-7 h-7 rounded-lg bg-[#c2f04e] text-black flex items-center justify-center"><FlaskConical className="w-3.5 h-3.5" /></span><span className="text-xs font-semibold">Reaction workspace</span></div><span className="text-[9px] font-mono text-emerald-400">READY</span></div>
                    <div className="space-y-1.5">
                      <div className="text-[9px] uppercase tracking-[.16em] font-mono text-zinc-600">Example</div>
                      <div className="rounded-xl border border-zinc-800 bg-black/40 p-3 text-xs font-mono text-zinc-300 leading-6">{currentReaction.equation}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="rounded-xl border border-zinc-800 p-3"><div className="text-zinc-600">Medium</div><div className="mt-1 font-semibold text-zinc-300">{currentReaction.medium === "acidic" ? "Asam" : "Basa"}</div></div>
                      <div className="rounded-xl border border-zinc-800 p-3"><div className="text-zinc-600">Electrons</div><div className="mt-1 font-semibold text-[#c2f04e]">{currentReaction.electrons} e⁻</div></div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {["Mass balance", "Charge balance", "Electron transfer", "Primitive ratio"].map((label) => <div key={label} className="rounded-xl border border-zinc-800 bg-white/[.025] p-3"><div className="flex items-center gap-1.5 text-[9px] text-zinc-500"><Check className="w-3 h-3 text-[#c2f04e]" />{label}</div><div className="mt-2 text-[11px] font-mono text-zinc-200">VERIFIED</div></div>)}
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-black/45 p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-3 mb-4"><div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500"><Terminal className="w-3.5 h-3.5 text-[#c2f04e]" />LIVE PREVIEW</div><button type="button" onClick={handleLaunchReaction} className="px-3 py-1.5 rounded-lg bg-[#c2f04e] text-black text-[10px] font-bold cursor-pointer hover:bg-[#d2ff6a]">Setarakan</button></div>
                      <div className="font-mono text-xs sm:text-sm text-zinc-400 min-h-6">{typewriterText || " "}<span className="inline-block w-1.5 h-3.5 ml-1 bg-[#c2f04e] align-middle animate-pulse" /></div>
                      <div className="mt-5 pt-4 border-t border-zinc-800/80 overflow-x-auto"><div className="min-w-max text-base sm:text-xl text-white"><Latex math={equationToLatex(currentReaction.balanced)} /></div></div>
                      <div className="mt-4 flex flex-wrap gap-2 text-[9px] font-mono text-zinc-500"><span className="px-2 py-1 rounded-md border border-zinc-800">{currentReaction.redoxAgent}</span><span className="px-2 py-1 rounded-md border border-zinc-800">{currentReaction.stoichiometryDelta}</span><button type="button" onClick={handleCopyEquation} className="px-2 py-1 rounded-md border border-zinc-800 hover:text-white cursor-pointer">{copied ? "Copied" : "Copy result"}</button></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </main>

        {/* 3. Ticker Marquee */}
        <section
          className={`w-full overflow-hidden py-4 border-y transition-colors select-none ${
            isDark
              ? "bg-zinc-950/80 border-zinc-800/80 text-zinc-400"
              : "bg-zinc-100/70 border-zinc-200 text-zinc-600"
          }`}
        >
          <div className="flex w-max gap-8 overflow-x-hidden">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap ${
                  isDark
                    ? "bg-zinc-900/80 border-zinc-800 text-zinc-300"
                    : "bg-white border-zinc-200 text-zinc-800 shadow-sm"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Manifesto Section */}
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-24 sm:py-32">
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#c2f04e] uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chemly Engine</span>
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

        {/* 5. Bento Grid */}
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

        {/* 6. FAQ Section */}
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

        {/* 7. Footer CTA Card */}
        <div className="relative pt-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 relative z-20 mb-[-60px]">
            <div className="rounded-3xl bg-white text-black p-8 sm:p-11 shadow-2xl border border-zinc-200 text-center space-y-5">
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-balance leading-tight">
                Mulai Selesaikan Persamaan Redoks Anda Hari Ini
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
                Dapatkan koefisien bulat terkecil lengkap dengan langkah paruh reaksi tanpa perlu instalasi.
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

          <footer className="w-full rounded-t-[48px] sm:rounded-t-[64px] bg-[#9ee839] text-black pt-28 sm:pt-32 pb-14 px-6 sm:px-12 relative overflow-hidden z-10">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div
                onClick={() => onEnterApp?.("solver")}
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
                  <div className="hover:opacity-75 cursor-pointer" onClick={() => onEnterApp?.("solver")}>
                    Penyetara Redoks
                  </div>
                  <div className="hover:opacity-75 cursor-pointer" onClick={onOpenPeriodicTable}>
                    Tabel Periodik
                  </div>
                  <div className="hover:opacity-75 cursor-pointer" onClick={() => onEnterApp?.("scanner")}>
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
          </footer>
        </div>

      </div>
    </div>
  );
};

// Aliaskan export ganda untuk kompatibilitas jika masih ada import singular/plural
export { LandingPage as LandingPages };