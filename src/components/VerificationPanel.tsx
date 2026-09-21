import React from "react";
import { AtomVerification, ChargeVerification } from "../types/redox";
import { ShieldCheck, CheckCircle2, XCircle, Scale, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { Latex } from "./Latex";

interface VerificationPanelProps {
  atomVerifications: AtomVerification[];
  chargeVerification: ChargeVerification;
  electronsTransferred: number;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({
  atomVerifications,
  chargeVerification,
  electronsTransferred,
}) => {
  const { isDark } = useTheme();
  const isAllAtomsBalanced = atomVerifications.every((a) => a.isBalanced);
  const isChargeBalanced = chargeVerification.isBalanced;
  const isFullyValid = isAllAtomsBalanced && isChargeBalanced;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`border rounded-xl p-6 space-y-6 transition-colors font-sans ${
        isDark
          ? "bg-black border-zinc-800 text-white"
          : "bg-white border-zinc-200 text-black shadow-xs"
      }`}
    >
      {/* Header with validation badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Verifikasi & Validasi Matematis-Kimia
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            Pemeriksaan ketat hukum kekekalan massa (Lavoisier) dan hukum kekekalan muatan listrik.
          </p>
        </div>

        <div className="self-start sm:self-auto">
          {isFullyValid ? (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md border ${
                isDark
                  ? "bg-white text-black border-white"
                  : "bg-black text-white border-black"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Reaksi 100% Tervalidasi & Setara
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md border ${
                isDark
                  ? "bg-zinc-900 text-white border-zinc-700"
                  : "bg-zinc-100 text-black border-zinc-300"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Terdapat Ketidaksesuaian
            </span>
          )}
        </div>
      </div>

      {/* 3 Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Atom Balance */}
        <div
          className={`p-4 rounded-lg border transition-colors ${
            isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
              Konservasi Massa (Atom)
            </span>
            <Scale className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-lg font-bold">
            <Latex
              math={`\\mathbf{${atomVerifications.filter((a) => a.isBalanced).length} / ${atomVerifications.length}} \\text{ Unsur}`}
            />
          </div>
          <p className={`text-[11px] mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            {isAllAtomsBalanced
              ? "Semua atom setara sempurna di kedua ruas."
              : "Terdapat perbedaan jumlah atom."}
          </p>
        </div>

        {/* Card 2: Charge Balance */}
        <div
          className={`p-4 rounded-lg border transition-colors ${
            isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
              Konservasi Muatan
            </span>
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-lg font-bold">
            <Latex
              math={`${chargeVerification.leftCharge > 0 ? `+${chargeVerification.leftCharge}` : chargeVerification.leftCharge} = ${chargeVerification.rightCharge > 0 ? `+${chargeVerification.rightCharge}` : chargeVerification.rightCharge}`}
            />
          </div>
          <p className={`text-[11px] mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            {isChargeBalanced
              ? "Muatan netto reaktan sama dengan produk."
              : "Muatan kedua ruas belum seimbang."}
          </p>
        </div>

        {/* Card 3: Electron Conservation */}
        <div
          className={`p-4 rounded-lg border transition-colors ${
            isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
              Konservasi Elektron
            </span>
            <Zap className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-lg font-bold">
            <Latex math={`${electronsTransferred}\\mathrm{e}^-`} />
          </div>
          <p className={`text-[11px] mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            Elektron dilepas reduktor = elektron diserap oksidator.
          </p>
        </div>
      </div>

      {/* Table: Element by Element Mass Conservation */}
      <div>
        <h4 className="text-[10px] uppercase tracking-wider font-bold mb-2.5 text-zinc-400">
          Tabel Rincian Kesetaraan Jumlah Atom (Kiri vs Kanan)
        </h4>

        <div
          className={`border rounded-lg overflow-hidden transition-colors ${
            isDark ? "border-zinc-800" : "border-zinc-200"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`border-b font-semibold ${
                  isDark
                    ? "bg-zinc-950 text-zinc-400 border-zinc-800"
                    : "bg-zinc-100 text-zinc-700 border-zinc-200"
                }`}
              >
                <tr>
                  <th className="px-4 py-2.5">Unsur</th>
                  <th className="px-4 py-2.5">Ruas Kiri (Reaktan)</th>
                  <th className="px-4 py-2.5">Ruas Kanan (Produk)</th>
                  <th className="px-4 py-2.5">Selisih (Δ)</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? "divide-zinc-800" : "divide-zinc-200"
                }`}
              >
                {atomVerifications.map((item) => (
                  <tr
                    key={item.element}
                    className={`transition-colors ${
                      isDark ? "hover:bg-zinc-900/50" : "hover:bg-zinc-50"
                    }`}
                  >
                    <td className="px-4 py-2.5 font-bold">
                      <Latex math={`\\mathrm{${item.element}}`} />
                    </td>
                    <td className="px-4 py-2.5">
                      <Latex math={`${item.leftCount}`} /> atom
                    </td>
                    <td className="px-4 py-2.5">
                      <Latex math={`${item.rightCount}`} /> atom
                    </td>
                    <td className="px-4 py-2.5 font-medium">
                      <Latex math={`${item.leftCount - item.rightCount}`} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {item.isBalanced ? (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                            isDark
                              ? "text-white bg-zinc-900 border-zinc-700"
                              : "text-black bg-zinc-100 border-zinc-300"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Setara
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                            isDark
                              ? "text-zinc-400 bg-zinc-950 border-zinc-800"
                              : "text-zinc-600 bg-zinc-100 border-zinc-300"
                          }`}
                        >
                          <XCircle className="w-3 h-3" />
                          Belum Setara
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


