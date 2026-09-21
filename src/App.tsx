/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ReactionMedium, SolvingMethod, RedoxResult, ReactionExample } from "./types/redox";
import { solveRedoxEquation } from "./utils/redoxSolver";
import { Header, NavTab } from "./components/Header";
import { EquationInput } from "./components/EquationInput";
import { RedoxSummary } from "./components/RedoxSummary";
import { HalfReactionSteps } from "./components/HalfReactionSteps";
import { PboSteps } from "./components/PboSteps";
import { VerificationPanel } from "./components/VerificationPanel";
import { BiloksInspector } from "./components/BiloksInspector";
import { QuickBiloksCalculator } from "./components/QuickBiloksCalculator";
import { AiTutorModal } from "./components/AiTutorModal";
import { PeriodicTableModal } from "./components/PeriodicTableModal";
import { ExportModal } from "./components/ExportModal";
import { ReactionScanner } from "./components/ReactionScanner";
import { CoefficientPlayground } from "./components/CoefficientPlayground";
import { LandingPage } from "./components/LandingPage";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { RedoxNotesModal } from "./components/RedoxNotesModal";
import { saveRecentReaction } from "./components/RecentReactions";
import { TextToLatexConverter } from "./components/TextToLatexConverter";
import { ChemistryLoader } from "./components/ChemistryLoader";
import { sanitizeEquationInput } from "./utils/chemistryParser";
import { AlertCircle, Layers, Hash, Sparkles, ArrowLeft, RefreshCw, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "./context/ThemeContext";

export default function App() {
  const { isDark } = useTheme();

  // Landing Page & Loading Entry state
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [isLoadingEntry, setIsLoadingEntry] = useState<boolean>(false);
  const [pendingTab, setPendingTab] = useState<NavTab>("solver");

  // Default to 100% accurate balanced reaction: MnO4- + C2O4^2- -> Mn2+ + CO2
  const [equation, setEquation] = useState<string>("MnO4- + C2O4^2- -> Mn2+ + CO2");
  const [medium, setMedium] = useState<ReactionMedium>("acidic");
  const [activeMethod, setActiveMethod] = useState<SolvingMethod>("half_reaction");
  const [activeTab, setActiveTab] = useState<NavTab>("solver");

  // Modals state
  const [isAiTutorOpen, setIsAiTutorOpen] = useState<boolean>(false);
  const [isPeriodicTableOpen, setIsPeriodicTableOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);

  const [result, setResult] = useState<RedoxResult>(() =>
    solveRedoxEquation("MnO4- + C2O4^2- -> Mn2+ + CO2", "acidic")
  );

  const handleSolve = () => {
    if (!equation.trim()) return;
    const sanitized = sanitizeEquationInput(equation);
    if (sanitized && sanitized !== equation) {
      setEquation(sanitized);
    }
    const targetEq = sanitized || equation;
    const res = solveRedoxEquation(targetEq, medium);
    setResult(res);
    if (res.isValid) {
      saveRecentReaction(targetEq, medium);
    }

    // Smooth scroll down to result or feedback section so user ALWAYS sees the outcome!
    setTimeout(() => {
      const targetId = res.isValid ? "redox-result-section" : "redox-feedback-section";
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);
  };

  const handleInsertElement = (symbol: string) => {
    setEquation((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return symbol;
      if (trimmed.endsWith("+") || trimmed.endsWith("->")) {
        return `${trimmed} ${symbol}`;
      }
      return `${trimmed}${symbol}`;
    });
  };

  // Re-solve on medium change
  useEffect(() => {
    if (equation.trim()) {
      const res = solveRedoxEquation(equation, medium);
      setResult(res);
    }
  }, [medium]);

  const handleSelectExample = (ex: ReactionExample) => {
    setEquation(ex.equation);
    setMedium(ex.medium);
    const res = solveRedoxEquation(ex.equation, ex.medium);
    setResult(res);
    if (res.isValid) {
      saveRecentReaction(ex.equation, ex.medium);
    }
  };

  // Switch from Reaction Scanner directly to deep Solver view
  const handleScannerSelectDetail = (eq: string, med: ReactionMedium) => {
    setEquation(eq);
    setMedium(med);
    const res = solveRedoxEquation(eq, med);
    setResult(res);
    if (res.isValid) {
      saveRecentReaction(eq, med);
    }
    setActiveTab("solver");
    setShowLanding(false);
  };

  // Select reaction from Recent History
  const handleSelectRecent = (eq: string, med: ReactionMedium) => {
    setEquation(eq);
    setMedium(med);
    const res = solveRedoxEquation(eq, med);
    setResult(res);
  };

  const handleEnterAppWithLoading = (targetMode: NavTab = "solver") => {
    setPendingTab(targetMode);
    setIsLoadingEntry(true);
  };

  // If loading entry animation is active, show ChemistryLoader
  if (isLoadingEntry) {
    return (
      <ChemistryLoader
        onComplete={() => {
          setIsLoadingEntry(false);
          setShowLanding(false);
          setActiveTab(pendingTab);
        }}
      />
    );
  }

  // If on landing page, render LandingPage view
  if (showLanding) {
    return (
      <>
        <LandingPage
          onEnterApp={handleEnterAppWithLoading}
          onOpenPeriodicTable={() => setIsPeriodicTableOpen(true)}
          onOpenNotes={() => setIsNotesOpen(true)}
          onSelectEquation={(eq, med) => {
            setEquation(eq);
            setMedium(med);
            const res = solveRedoxEquation(eq, med);
            setResult(res);
          }}
        />

        {/* Periodic Table Modal accessible from Landing as well */}
        <PeriodicTableModal
          isOpen={isPeriodicTableOpen}
          onClose={() => setIsPeriodicTableOpen(false)}
          onInsertElement={handleInsertElement}
        />

        {/* Notes, Tutorials & Disclaimer Modal */}
        <RedoxNotesModal
          isOpen={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
        />
      </>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${
        isDark
          ? "bg-black text-white selection:bg-zinc-800 selection:text-white"
          : "bg-zinc-50 text-black selection:bg-zinc-200 selection:text-black"
      }`}
    >
      {/* Top Navigation */}
      <Header
        onOpenAiTutor={() => setIsAiTutorOpen(true)}
        onOpenPeriodicTable={() => setIsPeriodicTableOpen(true)}
        onOpenLanding={() => setShowLanding(true)}
        onOpenNotes={() => setIsNotesOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-28 md:pb-8">
        {/* ======================================================== */}
        {/* TAB 1: PENYETARA REDOKS (MAIN SOLVER) */}
        {/* ======================================================== */}
        {activeTab === "solver" && (
          <>
            {/* Input Section */}
            <EquationInput
              equation={equation}
              setEquation={setEquation}
              medium={medium}
              setMedium={setMedium}
              onSolve={handleSolve}
              onSelectExample={handleSelectExample}
              onOpenPeriodicTable={() => setIsPeriodicTableOpen(true)}
              onSelectRecent={handleSelectRecent}
              onOpenTextToLatex={() => setActiveTab("text-to-latex")}
            />

            {/* Error Message if Invalid */}
            {!result.isValid && (
              <motion.div
                id="redox-feedback-section"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-xl flex flex-col sm:flex-row items-start gap-3.5 border transition-colors ${
                  isDark
                    ? "bg-zinc-950 border-zinc-700 text-white"
                    : "bg-zinc-100 border-zinc-300 text-black"
                }`}
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                <div className="space-y-2 flex-1">
                  <div>
                    <h4 className="text-sm font-bold">
                      Tidak Dapat Menyelesaikan Persamaan Redoks
                    </h4>
                    <p className="text-xs leading-relaxed opacity-90 mt-0.5">
                      {result.errorMessage}
                    </p>
                  </div>

                  <div className="text-xs font-mono opacity-80">
                    Tips penulisan: Gunakan tanda panah{" "}
                    <code className="px-1.5 py-0.5 rounded border border-zinc-700 font-bold">
                      -&gt;
                    </code>
                    , muatan seperti{" "}
                    <code className="px-1.5 py-0.5 rounded border border-zinc-700 font-bold">
                      MnO4-
                    </code>{" "}
                    atau{" "}
                    <code className="px-1.5 py-0.5 rounded border border-zinc-700 font-bold">
                      Cr2O7^2-
                    </code>
                    , dan huruf kapital untuk simbol unsur kimia (misal{" "}
                    <code className="px-1.5 py-0.5 rounded border border-zinc-700 font-bold">
                      KMnO4
                    </code>
                    , bukan{" "}
                    <code className="px-1.5 py-0.5 rounded border border-zinc-700 font-bold">
                      kmno4
                    </code>
                    ).
                  </div>

                  {/* Instant 1-Click Fix Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const sanitized = sanitizeEquationInput(equation);
                        setEquation(sanitized);
                        const res = solveRedoxEquation(sanitized, medium);
                        setResult(res);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                        isDark
                          ? "bg-white text-black hover:bg-zinc-200 border-white"
                          : "bg-black text-white hover:bg-zinc-800 border-black"
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Auto-Rapikan Huruf & Selesaikan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const sample = "MnO4- + C2O4^2- -> Mn2+ + CO2";
                        setEquation(sample);
                        setMedium("acidic");
                        const res = solveRedoxEquation(sample, "acidic");
                        setResult(res);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                        isDark
                          ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300"
                          : "bg-zinc-200 hover:bg-zinc-300 border-zinc-300 text-zinc-800"
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Muat Contoh Reaksi Setara (Permanganat)</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Results Section */}
            {result.isValid && (
              <div className="space-y-6">
                {/* 1. Redox Summary with Hero Answer & Why-Tutor Chips */}
                <RedoxSummary
                  result={result}
                  onOpenExport={() => setIsExportOpen(true)}
                  onOpenPlayground={() => setActiveTab("playground")}
                  onOpenTextToLatex={() => setActiveTab("text-to-latex")}
                />

                {/* 2. Solving Method Selector & Walkthrough */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`border rounded-xl p-6 space-y-5 transition-colors ${
                    isDark
                      ? "bg-black border-zinc-800 text-white"
                      : "bg-white border-zinc-200 text-black shadow-xs"
                  }`}
                >
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
                      isDark ? "border-zinc-800" : "border-zinc-200"
                    }`}
                  >
                    <div>
                      <h3 className="text-base font-bold">
                        Langkah Penyelesaian Terperinci
                      </h3>
                      <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                        Pilih metode penyetaraan yang ingin dipelajari secara bertahap.
                      </p>
                    </div>

                    {/* Method Selector Pills */}
                    <div
                      className={`flex items-center p-1 rounded-lg self-start sm:self-auto border transition-colors ${
                        isDark
                          ? "bg-zinc-950 border-zinc-800"
                          : "bg-zinc-100 border-zinc-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveMethod("half_reaction")}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                          activeMethod === "half_reaction"
                            ? isDark
                              ? "bg-white text-black"
                              : "bg-black text-white"
                            : isDark
                            ? "text-zinc-400 hover:text-white"
                            : "text-zinc-600 hover:text-black"
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Setengah Reaksi (Ion-Elektron)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveMethod("oxidation_number")}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                          activeMethod === "oxidation_number"
                            ? isDark
                              ? "bg-white text-black"
                              : "bg-black text-white"
                            : isDark
                            ? "text-zinc-400 hover:text-white"
                            : "text-zinc-600 hover:text-black"
                        }`}
                      >
                        <Hash className="w-3.5 h-3.5" />
                        <span>Metode PBO (Biloks)</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Method Walkthrough */}
                  <AnimatePresence mode="wait">
                    {activeMethod === "half_reaction" ? (
                      <motion.div
                        key="half_reaction"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                      >
                        <HalfReactionSteps steps={result.halfReactionSteps} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="oxidation_number"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                      >
                        <PboSteps steps={result.pboSteps} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* 3. Atom & Charge Verification Matrix */}
                <VerificationPanel
                  atomVerifications={result.atomVerifications}
                  chargeVerification={result.chargeVerification}
                  electronsTransferred={result.electronsTransferred}
                />

                {/* 4. Detailed Biloks Breakdown for Each Compound */}
                <BiloksInspector
                  reactants={result.reactants}
                  products={result.products}
                  redoxChanges={result.redoxChanges}
                />

                {/* Bottom Prompt to ask AI Tutor */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`p-6 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
                    isDark
                      ? "bg-black border-zinc-800 text-white"
                      : "bg-white border-zinc-200 text-black shadow-xs"
                  }`}
                >
                  <div>
                    <h4 className="text-base font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      Ingin Penjelasan Konsep Lebih Dalam?
                    </h4>
                    <p
                      className={`text-xs mt-1 max-w-xl leading-relaxed ${
                        isDark ? "text-zinc-400" : "text-zinc-600"
                      }`}
                    >
                      AI Chemistry Tutor siap menjelaskan mengapa kalium permanganat adalah oksidator kuat, potensial reduksi standar (E°), atau tips menjawab soal ujian redoks.
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => setIsAiTutorOpen(true)}
                    className={`px-5 py-2 font-bold text-xs rounded-lg shrink-0 transition-colors cursor-pointer border ${
                      isDark
                        ? "bg-white text-black hover:bg-zinc-200 border-white"
                        : "bg-black text-white hover:bg-zinc-800 border-black"
                    }`}
                  >
                    Buka AI Tutor
                  </motion.button>
                </motion.div>
              </div>
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 2: REACTION SCANNER (BATCH SOLVER) */}
        {/* ======================================================== */}
        {activeTab === "scanner" && (
          <ReactionScanner onSelectDetail={handleScannerSelectDetail} />
        )}

        {/* ======================================================== */}
        {/* TAB 3: COEFFICIENT PLAYGROUND */}
        {/* ======================================================== */}
        {activeTab === "playground" && (
          <CoefficientPlayground result={result} />
        )}

        {/* ======================================================== */}
        {/* TAB 4: KALKULATOR BILOKS */}
        {/* ======================================================== */}
        {activeTab === "biloks-calc" && (
          <div className="space-y-6">
            <QuickBiloksCalculator />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: KONVERTER TEKS KE LATEX & KATEX */}
        {/* ======================================================== */}
        {activeTab === "text-to-latex" && (
  <div className="space-y-6">
    {React.createElement(TextToLatexConverter as any, {
      initialText: result?.isValid ? result.balancedEquationString : equation,
      onSendToSolver: (cleanEq: string) => {
        setEquation(cleanEq);
        const res = solveRedoxEquation(cleanEq, medium);
        setResult(res);
        if (res?.isValid) {
          saveRecentReaction(cleanEq, medium);
        }
        setActiveTab("solver");
      },
    })}
  </div>
)}
</main>

      {/* AI Tutor Dialog */}
      <AiTutorModal
        isOpen={isAiTutorOpen}
        onClose={() => setIsAiTutorOpen(false)}
        currentResult={result.isValid ? result : null}
      />

      {/* Interactive Periodic Table 118 Elements Modal */}
      <PeriodicTableModal
        isOpen={isPeriodicTableOpen}
        onClose={() => setIsPeriodicTableOpen(false)}
        onInsertElement={handleInsertElement}
      />

      {/* Notes, Tutorials & Disclaimers Modal */}
      <RedoxNotesModal
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
      />

      {/* Export LaTeX / PNG / PDF Modal */}
      {result.isValid && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          result={result}
        />
      )}

      {/* Android / Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPeriodicTable={() => setIsPeriodicTableOpen(true)}
      />

      {/* Footer */}
      <footer
        className={`border-t py-6 mt-12 mb-16 md:mb-0 transition-colors ${
          isDark
            ? "border-zinc-800 bg-black text-zinc-400"
            : "border-zinc-200 bg-white text-zinc-600"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold">Chemly</span>
            <span>•</span>
            <span>Penyetara Reaksi Redoks Eksak & Platform Belajar Kimia</span>
          </div>
          <div className={isDark ? "text-zinc-500" : "text-zinc-400"}>
            Kaidah IUPAC • Konservasi Massa & Muatan Listrik
          </div>
        </div>
      </footer>
    </div>
  );
}
