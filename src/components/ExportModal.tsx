import React, { useState, useRef } from "react";
import { RedoxResult } from "../types/redox";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";
import { equationToLatex, speciesToLatex } from "../utils/latexHelper";
import { toPng, toJpeg } from "html-to-image";
import {
  Download,
  Copy,
  Check,
  FileText,
  Image as ImageIcon,
  Printer,
  X,
  Sparkles,
  Zap,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: RedoxResult;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<"image" | "latex" | "print">("image");
  const [imageFormat, setImageFormat] = useState<"png" | "jpeg">("png");
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLatex, setCopiedLatex] = useState(false);

  // Student metadata for print/export
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Generate complete LaTeX document string
  const generateFullLatex = (): string => {
    if (!result.isValid) return "";

    const balancedLatex = equationToLatex(result.balancedEquationString);

    let halfStepsLatex = "";
    if (result.halfReactionSteps.length > 0) {
      halfStepsLatex = result.halfReactionSteps
        .map(
          (step, idx) => `
% Langkah ${idx + 1}: ${step.title}
\\subsection*{Langkah ${idx + 1}: ${step.title}}
${step.description}

\\begin{align*}
\\text{Oksidasi: } & ${equationToLatex(step.oxidationHalf)} \\\\
\\text{Reduksi: } & ${equationToLatex(step.reductionHalf)}
\\end{align*}
${step.explanation ? `\\textit{Catatan: ${step.explanation}}` : ""}
`
        )
        .join("\n");
    }

    return `% Dokumen Penyelesaian Penyetaraan Reaksi Redoks
% Dihasilkan secara otomatis oleh RedoxSolver Pro

\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=2cm]{geometry}
\\usepackage{amsmath,amssymb}
\\usepackage{mhchem} % Opsional untuk notasi kimia lanjut

\\title{\\textbf{Laporan Penyetaraan Persamaan Reaksi Redoks}}
\\author{${studentName ? studentName : "Siswa Kimia"} ${studentClass ? `(${studentClass})` : ""}}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Persamaan Reaksi}
\\textbf{Reaksi Awal:} 
\\[
${equationToLatex(result.originalInput)}
\\]
\\textbf{Suasana Reaksi:} ${result.medium === "acidic" ? "Asam ($H^+$)" : result.medium === "basic" ? "Basa ($OH^-$)" : "Netral"} \\\\
\\textbf{Kategori Reaksi:} ${result.reactionCategory} \\\\
\\textbf{Elektron Ditransfer:} ${result.electronsTransferred}\\,e^-

\\section{Persamaan Reaksi Setara}
\\[
${balancedLatex}
\\]

\\section{Analisis Zat dan Perubahan Bilangan Oksidasi}
\\begin{itemize}
  \\item \\textbf{Zat Pengoksidasi (Oksidator):} ${result.oxidizingAgent.join(", ") || "-"}
  \\item \\textbf{Zat Pereduksi (Reduktor):} ${result.reducingAgent.join(", ") || "-"}
  \\item \\textbf{Hasil Reduksi:} ${result.reductionProducts.join(", ") || "-"}
  \\item \\textbf{Hasil Oksidasi:} ${result.oxidationProducts.join(", ") || "-"}
\\end{itemize}

\\section{Langkah-Langkah Penyetaraan Terperinci}
${halfStepsLatex}

\\section{Verifikasi Kekekalan Massa dan Muatan}
\\begin{itemize}
  \\item \\textbf{Muatan Ruas Kiri:} ${result.chargeVerification.leftCharge}
  \\item \\textbf{Muatan Ruas Kanan:} ${result.chargeVerification.rightCharge}
  \\item \\textbf{Status:} ${result.chargeVerification.isBalanced ? "SETARA SEMPURNA (Q_kiri = Q_kanan)" : "Belum Setara"}
\\end{itemize}

\\end{document}
`;
  };

  const handleCopyLatex = async () => {
    try {
      await navigator.clipboard.writeText(generateFullLatex());
      setCopiedLatex(true);
      setTimeout(() => setCopiedLatex(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadImage = async () => {
    if (!printAreaRef.current) return;
    setIsExporting(true);

    try {
      const node = printAreaRef.current;
      const dataUrl =
        imageFormat === "png"
          ? await toPng(node, { quality: 0.95, pixelRatio: 2, cacheBust: true })
          : await toJpeg(node, { quality: 0.92, pixelRatio: 2, cacheBust: true });

      const link = document.createElement("a");
      link.download = `redox-penyelesaian-${Date.now()}.${imageFormat}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal export gambar:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className={`relative rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border shadow-2xl overflow-hidden z-10 transition-colors ${
            isDark
              ? "bg-[#090A0D] border-zinc-800 text-white"
              : "bg-white border-zinc-200 text-black"
          }`}
        >
          {/* Header */}
          <div
            className={`p-4 border-b flex items-center justify-between gap-3 shrink-0 ${
              isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border ${
                  isDark
                    ? "bg-zinc-900 border-zinc-700 text-sky-400"
                    : "bg-sky-50 border-sky-200 text-sky-600"
                }`}
              >
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold tracking-tight">
                  Export Jawaban & Lembar Penyelesaian
                </h3>
                <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Ekspor hasil ke gambar berkualitas tinggi (PNG/JPG), kode LaTeX KaTeX, atau cetak lembar PDF.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                  : "border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-100"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div
            className={`p-3 border-b flex items-center justify-between gap-2 shrink-0 ${
              isDark ? "bg-black/60 border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("image")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  activeTab === "image"
                    ? isDark
                      ? "bg-white text-black border-white font-bold"
                      : "bg-black text-white border-black font-bold"
                    : isDark
                    ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                    : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-black"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Gambar (PNG / JPG)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("latex")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  activeTab === "latex"
                    ? isDark
                      ? "bg-white text-black border-white font-bold"
                      : "bg-black text-white border-black font-bold"
                    : isDark
                    ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                    : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-black"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Kode LaTeX</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("print")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  activeTab === "print"
                    ? isDark
                      ? "bg-white text-black border-white font-bold"
                      : "bg-black text-white border-black font-bold"
                    : isDark
                    ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                    : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-black"
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / PDF Lembar Ujian</span>
              </button>
            </div>

            {/* Action on tab */}
            {activeTab === "image" && (
              <div className="flex items-center gap-2">
                <select
                  value={imageFormat}
                  onChange={(e) => setImageFormat(e.target.value as "png" | "jpeg")}
                  className={`px-2 py-1 rounded-md text-xs font-semibold border ${
                    isDark
                      ? "bg-zinc-900 border-zinc-700 text-white"
                      : "bg-zinc-100 border-zinc-300 text-black"
                  }`}
                >
                  <option value="png">Format PNG (Tajam)</option>
                  <option value="jpeg">Format JPG (Kompresi)</option>
                </select>

                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleDownloadImage}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isDark
                      ? "bg-sky-400 text-black hover:bg-sky-300"
                      : "bg-sky-600 text-white hover:bg-sky-500"
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting ? "Memproses..." : "Unduh Gambar"}</span>
                </button>
              </div>
            )}

            {activeTab === "latex" && (
              <button
                type="button"
                onClick={handleCopyLatex}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isDark
                    ? "bg-sky-400 text-black hover:bg-sky-300"
                    : "bg-sky-600 text-white hover:bg-sky-500"
                }`}
              >
                {copiedLatex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-950" />
                    <span>Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode LaTeX</span>
                  </>
                )}
              </button>
            )}

            {activeTab === "print" && (
              <button
                type="button"
                onClick={handlePrint}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isDark
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "bg-black text-white hover:bg-zinc-800"
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Simpan sebagai PDF</span>
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {/* TAB 1 & 3: Image / Printable Preview Canvas */}
            {(activeTab === "image" || activeTab === "print") && (
              <div className="space-y-4">
                {/* Optional Student Info Form */}
                <div
                  className={`p-3 rounded-xl border flex flex-wrap items-center gap-3 ${
                    isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs flex-1 min-w-[200px]">
                    <span className={`text-[11px] font-semibold ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                      Nama Siswa / Mahasiswa:
                    </span>
                    <input
                      type="text"
                      placeholder="Masukkan nama..."
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className={`px-2.5 py-1 rounded-md text-xs border flex-1 font-medium ${
                        isDark
                          ? "bg-black border-zinc-800 text-white"
                          : "bg-white border-zinc-300 text-black"
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs w-48">
                    <span className={`text-[11px] font-semibold ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                      Kelas / Jurusan:
                    </span>
                    <input
                      type="text"
                      placeholder="XII IPA 1 / Kimia"
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className={`px-2.5 py-1 rounded-md text-xs border flex-1 font-medium ${
                        isDark
                          ? "bg-black border-zinc-800 text-white"
                          : "bg-white border-zinc-300 text-black"
                      }`}
                    />
                  </div>
                </div>

                {/* Printable / Snapshot Sheet Container */}
                <div className="border border-zinc-700/60 rounded-xl overflow-hidden shadow-xl">
                  <div
                    ref={printAreaRef}
                    className="p-6 sm:p-8 bg-white text-black font-sans space-y-6"
                    style={{ minWidth: "600px" }}
                  >
                    {/* Header Sheet */}
                    <div className="flex items-start justify-between border-b-2 border-black pb-4">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-black">
                          LEMBAR PENYELESAIAN REAKSI REDOKS
                        </h2>
                        <p className="text-xs text-zinc-600 font-mono">
                          RedoxSolver Pro • Solusi Kimia Terperinci
                        </p>
                      </div>
                      <div className="text-right text-xs">
                        <div className="font-bold">
                          {studentName ? studentName : "Nama: _________________"}
                        </div>
                        <div className="text-zinc-600">
                          {studentClass ? studentClass : "Kelas: _________________"}
                        </div>
                        <div className="text-zinc-500 font-mono text-[10px]">
                          Tanggal: {new Date().toLocaleDateString("id-ID")}
                        </div>
                      </div>
                    </div>

                    {/* Section 1: Initial Equation & Result */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
                        Persamaan Reaksi Asal:
                      </span>
                      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm">
                        <Latex math={equationToLatex(result.originalInput)} />
                      </div>
                    </div>

                    {/* Section 2: Balanced Final Equation */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 block">
                        Hasil Persamaan Reaksi Setara:
                      </span>
                      <div className="p-4 bg-sky-50 border-2 border-sky-400 rounded-xl text-base font-bold text-black overflow-x-auto">
                        <Latex math={equationToLatex(result.balancedEquationString)} />
                      </div>
                    </div>

                    {/* Section 3: Summary Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">Suasana</div>
                        <div className="font-bold text-sm">
                          {result.medium === "acidic" ? "Asam (H⁺)" : result.medium === "basic" ? "Basa (OH⁻)" : "Netral"}
                        </div>
                      </div>
                      <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">Transfer e⁻</div>
                        <div className="font-bold text-sm font-mono">{result.electronsTransferred} e⁻</div>
                      </div>
                      <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">Oksidator</div>
                        <div className="font-bold text-sm">
                          {result.oxidizingAgent.join(", ") || "-"}
                        </div>
                      </div>
                      <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">Reduktor</div>
                        <div className="font-bold text-sm">
                          {result.reducingAgent.join(", ") || "-"}
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Step by step half reactions */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1">
                        Tahapan Metode Setengah Reaksi (Ion-Elektron)
                      </h4>

                      <div className="space-y-2.5">
                        {result.halfReactionSteps.slice(0, 5).map((st, i) => (
                          <div key={i} className="p-2.5 rounded-lg border border-zinc-200 bg-zinc-50/70 text-xs">
                            <div className="font-bold mb-1">
                              Langkah {i + 1}: {st.title}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px] my-1">
                              <div>
                                <span className="text-[9px] uppercase font-bold text-emerald-700">Oksidasi:</span>
                                <div className="font-mono">
                                  <Latex math={equationToLatex(st.oxidationHalf)} />
                                </div>
                              </div>
                              <div>
                                <span className="text-[9px] uppercase font-bold text-sky-700">Reduksi:</span>
                                <div className="font-mono">
                                  <Latex math={equationToLatex(st.reductionHalf)} />
                                </div>
                              </div>
                            </div>
                            {st.explanation && (
                              <div className="text-[10px] text-zinc-500 italic mt-1">
                                Catatan: {st.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 5: Verification footer */}
                    <div className="p-3 bg-zinc-100 rounded-lg border border-zinc-200 flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Kekekalan Massa & Muatan:</span>
                      </div>
                      <span className="font-mono text-emerald-700 font-bold">
                        Q_kiri ({result.chargeVerification.leftCharge}) = Q_kanan ({result.chargeVerification.rightCharge}) ✓ Setara
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LaTeX Code Viewer & Copier */}
            {activeTab === "latex" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    Kode KaTeX / LaTeX Lengkap Siap Pakai di Overleaf, Paper, atau Microsoft Word:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLatex}
                    className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Semua Kode</span>
                  </button>
                </div>

                <pre
                  className={`p-4 rounded-xl border text-xs font-mono overflow-x-auto max-h-[500px] leading-relaxed ${
                    isDark
                      ? "bg-black border-zinc-800 text-zinc-200"
                      : "bg-zinc-50 border-zinc-300 text-zinc-900"
                  }`}
                >
                  {generateFullLatex()}
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
