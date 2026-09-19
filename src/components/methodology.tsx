import React, { useState } from "react";
import { 
  Cpu, GitBranch, Terminal, Layers, ArrowRight, 
  Sparkles, CheckCircle2, ShieldCheck, Binary, 
  Workflow, BookOpen, Atom, Zap, ChevronRight,
  Code2, Eye, Database, Gauge
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";

interface MethodologyProps {
  onClose?: () => void;
  onExploreModule?: (tab: string) => void;
}

interface StepDetail {
  id: string;
  number: string;
  title: string;
  tagline: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  description: string;
  inputExample: string;
  outputExample: string;
  technicalSpecs: {
    algorithm: string;
    complexity: string;
    environment: string;
    errorMargin: string;
  };
  deepDive: string[];
}

const pipelineSteps: StepDetail[] = [
  {
    id: "lexer-parser",
    number: "01",
    title: "Lexical Tokenization & AST Parsing",
    tagline: "Dekomposisi string formula kimia menjadi Abstract Syntax Tree",
    badge: "Lexer & Grammar",
    icon: Binary,
    accentColor: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    description:
      "Input formula mentah (baik melalui pengetikan manual atau deteksi Vision OCR) melalui tahapan tokenizer deterministik. Tokenizer memvalidasi karakter kapitalisasi simbol IUPAC, indeks subskrip poliatomik, kurung bersarang (nested brackets), dan muatan kation/anion.",
    inputExample: "Cr2O7^2- + Fe^2+ + H^+ -> Cr^3+ + Fe^3+ + H2O",
    outputExample: "AST: { Reactants: [{ Cr: 2, O: 7, q: -2 }, { Fe: 1, q: +2 }, { H: 1, q: +1 }], Products: [...] }",
    technicalSpecs: {
      algorithm: "Recursive Descent Parsing / DFA State Machine",
      complexity: "O(N) waktu, O(N) ruang memori",
      environment: "Web Worker Isolated Sandbox",
      errorMargin: "0.00% (Strict Chemical Grammar)",
    },
    deepDive: [
      "Normalisasi string: mengubah format acak menjadi penandaan muatan terstandarisasi.",
      "Resolusi tanda kurung poliatomik seperti Cu(NO3)2 menjadi representasi matriks kuantitatif atom.",
      "Validasi hukum kekekalan jenis unsur sebelum alokasi matriks numerik.",
    ],
  },
  {
    id: "matrix-kernel",
    number: "02",
    title: "Stoichiometric Matrix & Gauss-Jordan",
    tagline: "Konstruksi sistem persamaan linier homogen dan eliminasi baris",
    badge: "Linear Algebra",
    icon: Cpu,
    accentColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    description:
      "Setiap molekul dialokasikan sebagai kolom matriks, sedangkan setiap unsur kimia dan muatan elektrostatik menjadi baris. Sistem $A \\cdot x = 0$ diselesaikan menggunakan eliminasi Gauss-Jordan di atas TypedArrays untuk mencari Kernel (Null Space) bernilai bulat terkecil.",
    inputExample: "Matriks Konservasi Massa [Unsur x Spesi] berdimensi M x N",
    outputExample: "Null Space Basis Vector: [1, 6, 14] -> [2, 6, 7]",
    technicalSpecs: {
      algorithm: "Fractional Gauss-Jordan Elimination with Pivoting",
      complexity: "O(M · N²) matriks terduksi baris",
      environment: "TypedFloat64 / BigInt Fraction Resolver",
      errorMargin: "Exact Rational (Bebas Floating Point Error)",
    },
    deepDive: [
      "Penghitungan pecahan presisi rasional (Numerator / Denominator) untuk mencegah rounding error desimal.",
      "Penerapan KPK (LCM) terhadap pembagi vektor basis untuk menghasilkan bilangan bulat terkecil alami.",
      "Pemisahan otomatis antara reaksi redoks spontan, autoredoks (disproporsionasi), dan reaksi asam-basa.",
    ],
  },
  {
    id: "redox-half-reaction",
    number: "03",
    title: "Metode Setengah Reaksi & Ion-Elektron",
    tagline: "Verifikasi bilangan oksidasi dan penyeimbangan suasana asam/basa",
    badge: "Redox Engine",
    icon: Zap,
    accentColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    description:
      "Untuk mode edukatif dan visualisasi langkah demi langkah, engine memecah persamaan menjadi reaksi oksidasi dan reduksi secara terpisah. Penyetaraan atom oksigen menggunakan molekul H2O, atom hidrogen menggunakan H+, dan muatan diimbangi oleh transfer elektron (e-).",
    inputExample: "Oksidasi: Fe^2+ -> Fe^3+ | Reduksi: Cr2O7^2- -> Cr^3+",
    outputExample: "Cr2O7^2- + 14H^+ + 6Fe^2+ -> 2Cr^3+ + 6Fe^3+ + 7H2O",
    technicalSpecs: {
      algorithm: "Ion-Electron Splitter & Formal Biloks Allocator",
      complexity: "O(K) partisi spesi elektrokimia",
      environment: "Client-side Execution (< 2ms latency)",
      errorMargin: "Kekekalan muatan & massa 100% identik",
    },
    deepDive: [
      "Penetapan otomatis bilangan oksidasi atom sentral berdasarkan aturan keelektronegatifan Pauling.",
      "Penyesuaian suasana basa otomatis melalui penambahan ion hidroksida (OH-) setara pada kedua ruas.",
      "Kalkulasi kuantitas elektron valensi yang ditransfer untuk penentuan ekivalensi titrasi dan sel elektrokimia.",
    ],
  },
  {
    id: "latex-compiler",
    number: "04",
    title: "IUPAC mhchem LaTeX Transpiler",
    tagline: "Generasi tipografi jurnal ilmiah publikasi tinggi secara instan",
    badge: "Publishing Ready",
    icon: Code2,
    accentColor: "text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10",
    description:
      "Hasil akhir yang telah setara ditranspilasi menjadi sintaks KaTeX/LaTeX standar mhchem. Format ini siap disalin ke publikasi jurnal, skripsi, lembar kerja LaTeX, maupun dirender langsung pada DOM secara responsif di berbagai ukuran viewport.",
    inputExample: "Vektor Koefisien Setara: [1, 6, 14, 2, 6, 7]",
    outputExample: "\\ce{Cr2O7^{2-} + 6Fe^{2+} + 14H+ -> 2Cr^{3+} + 6Fe^{3+} + 7H2O}",
    technicalSpecs: {
      algorithm: "AST-to-TeX Code Emitter",
      complexity: "O(N) linear format string output",
      environment: "DOM KaTeX Hardware-accelerated Canvas",
      errorMargin: "Kompatibel 100% dengan standard Overleaf & Typst",
    },
    deepDive: [
      "Superscript muatan ionik diformat dengan tanda plus/minus standar IUPAC (contoh: SO4^2- -> SO_4^{2-}).",
      "Koleksi formula instan untuk copy-paste cepat ke Markdown, Word Math, atau TeX editors.",
      "Export metadata interaktif ke dalam visualizer kinetika reaksi dan orbital Bohr.",
    ],
  },
];

export const Methodology: React.FC<MethodologyProps> = ({ onClose, onExploreModule }) => {
  const { isDark } = useTheme();
  const [selectedStep, setSelectedStep] = useState<string>("matrix-kernel");

  const currentStep = pipelineSteps.find((s) => s.id === selectedStep) ?? pipelineSteps[1];
  const StepIcon = currentStep.icon;

  return (
    <div className={`w-full min-h-screen py-10 px-4 sm:px-6 lg:px-8 transition-colors ${
      isDark ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900"
    }`}>
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Hero Section */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium border border-sky-500/30 bg-sky-500/10 text-sky-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Arsitektur Sistem & Metodologi Komputasi</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Bagaimana Chemly Bekerja di Balik Layar.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Chemly bukan sekadar pemroses teks statis. Seluruh penyetaraan redoks, parsing formula kimia, dan kalkulasi biloks dieksekusi secara deterministik menggunakan aljabar linier murni pada sisi klien (*client-side execution*) tanpa latensi server.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900/50">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Zero-Server Latency
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900/50">
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
              &lt; 1.5ms Matrix Reduction
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900/50">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              Local Client Privacy
            </span>
          </div>
        </div>

        {/* Interactive Pipeline Steps Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pipelineSteps.map((step) => {
            const isSelected = selectedStep === step.id;
            const Icon = step.icon;

            return (
              <motion.button
                key={step.id}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedStep(step.id)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? isDark
                      ? "bg-zinc-900/90 border-zinc-600 shadow-xl ring-1 ring-zinc-500"
                      : "bg-zinc-100 border-zinc-400 shadow-md ring-1 ring-zinc-400"
                    : isDark
                    ? "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40"
                    : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-zinc-500">
                    STEP {step.number}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${step.accentColor}`}>
                    {step.badge}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-zinc-300" />
                    <h4 className="text-xs sm:text-sm font-bold truncate">{step.title}</h4>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {step.tagline}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[10px] font-mono text-zinc-500">
                  <span>{step.technicalSpecs.complexity.split(" ")[0]}</span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "translate-x-1 text-sky-400" : "opacity-40"}`} />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Step Command Center & Deep Dive */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${
              isDark 
                ? "bg-zinc-950/80 border-zinc-800 text-zinc-100 shadow-black/80" 
                : "bg-white border-zinc-200 text-zinc-900 shadow-zinc-300/40"
            }`}
          >
            {/* Background Ambient Glow */}
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
              
              {/* Left Column: Conceptual Breakdown */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${currentStep.accentColor}`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                      Pemeriksaan Arsitektur • Tahap {currentStep.number}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold">{currentStep.title}</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {currentStep.description}
                </p>

                {/* Algorithmic Features List */}
                <div className="space-y-2.5">
                  <span className="text-xs font-mono font-semibold text-zinc-300 block">
                    Karakteristik Operasional:
                  </span>
                  {currentStep.deepDive.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Input -> Output Live Visualization Card */}
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                }`}>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">State Input:</span>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-sky-300 overflow-x-auto">
                      {currentStep.inputExample}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Computed State Output:</span>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                      {currentStep.outputExample}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Hard Engineering Specifications */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-6 border-t lg:border-t-0 lg:border-l border-zinc-800/80 lg:pl-8 pt-6 lg:pt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                      Spesifikasi Kernel Komputasi
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className={`p-3 rounded-xl border text-xs ${
                      isDark ? "bg-zinc-900/30 border-zinc-800/80" : "bg-zinc-50 border-zinc-200"
                    }`}>
                      <span className="text-[10px] font-mono text-zinc-500 block">Algoritma Inti:</span>
                      <span className="font-semibold mt-0.5 block">{currentStep.technicalSpecs.algorithm}</span>
                    </div>

                    <div className={`p-3 rounded-xl border text-xs ${
                      isDark ? "bg-zinc-900/30 border-zinc-800/80" : "bg-zinc-50 border-zinc-200"
                    }`}>
                      <span className="text-[10px] font-mono text-zinc-500 block">Kompleksitas Asimtotik:</span>
                      <span className="font-mono text-amber-400 font-bold mt-0.5 block">{currentStep.technicalSpecs.complexity}</span>
                    </div>

                    <div className={`p-3 rounded-xl border text-xs ${
                      isDark ? "bg-zinc-900/30 border-zinc-800/80" : "bg-white border-zinc-200"
                    }`}>
                      <span className="text-[10px] font-mono text-zinc-500 block">Runtime Environment:</span>
                      <span className="font-mono text-zinc-300 mt-0.5 block">{currentStep.technicalSpecs.environment}</span>
                    </div>

                    <div className={`p-3 rounded-xl border text-xs ${
                      isDark ? "bg-zinc-900/30 border-zinc-800/80" : "bg-white border-zinc-200"
                    }`}>
                      <span className="text-[10px] font-mono text-zinc-500 block">Toleransi / Error Margin:</span>
                      <span className="font-mono text-emerald-400 font-bold mt-0.5 block">{currentStep.technicalSpecs.errorMargin}</span>
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                {onExploreModule && (
                  <button
                    type="button"
                    onClick={() => onExploreModule("solver")}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                      isDark 
                        ? "bg-white text-black hover:bg-zinc-200" 
                        : "bg-black text-white hover:bg-zinc-800"
                    }`}
                  >
                    <span>Uji Coba di Modul Reaksi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

        {/* Mathematical Foundation Showcase */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${
          isDark ? "bg-zinc-950/40 border-zinc-800/80" : "bg-zinc-50 border-zinc-200"
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold">Fondasi Formal: Penyetaraan Matriks Gauss-Jordan</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Representasi matematis dari setiap atom yang memenuhi Hukum Kekekalan Massa Lavoisier.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Determinant Solvable</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase">Hukum Kekekalan Muatan</span>
              <p className="text-zinc-300 font-sans text-xs">
                Jumlah total muatan ruas kiri harus tepat sama dengan ruas kanan:
              </p>
              <div className="pt-2 text-sky-400 font-bold">
                <Latex math="\sum_{i} c_i \cdot q_i = 0" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase">Eliminasi Matriks Homogen</span>
              <p className="text-zinc-300 font-sans text-xs">
                Mencari basis ruang nol non-trivial dari matriks stoikiometri $A$:
              </p>
              <div className="pt-2 text-emerald-400 font-bold">
                <Latex math="A \cdot \vec{x} = \vec{0}, \quad \vec{x} \in \mathbb{Z}^+" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase">Penyetaraan Suasana Asam/Basa</span>
              <p className="text-zinc-300 font-sans text-xs">
                Penyeimbangan rasio H⁺ dan H₂O secara deterministik:
              </p>
              <div className="pt-2 text-amber-400 font-bold">
                <Latex math="\Delta [\mathrm{O}] \to \mathrm{H_2O}, \quad \Delta [\mathrm{H}] \to \mathrm{H}^+" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};