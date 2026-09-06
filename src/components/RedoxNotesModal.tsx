import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  BookOpen,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Bookmark,
} from "lucide-react";
import { Latex } from "./Latex";

interface RedoxNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "tutorial" | "rules" | "glossary" | "tips" | "disclaimer";
}

export const RedoxNotesModal: React.FC<RedoxNotesModalProps> = ({
  isOpen,
  onClose,
  initialTab = "tutorial",
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<
    "tutorial" | "rules" | "glossary" | "tips" | "disclaimer"
  >(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18 }}
          className={`relative rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border shadow-2xl overflow-hidden z-10 transition-colors ${
            isDark ? "bg-[#090A0E] border-zinc-800 text-white" : "bg-white border-zinc-200 text-black"
          }`}
        >
          {/* Header */}
          <div
            className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 shrink-0 ${
              isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold border shadow-xs ${
                  isDark
                    ? "bg-zinc-900 border-zinc-700 text-sky-400"
                    : "bg-white border-zinc-300 text-sky-600"
                }`}
              >
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                    Catatan Teori, Tutorial & Panduan Redoks
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-sky-500/10 border-sky-500/30 text-sky-400">
                    Buku Pintar
                  </span>
                </div>
                <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Referensi komprehensif aturan biloks, langkah penyetaraan, trik ujian, dan disclaimer ilmiah.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300"
                  : "bg-white hover:bg-zinc-100 border-zinc-300 text-zinc-700"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div
            className={`px-4 pt-2.5 pb-2 border-b flex items-center gap-1.5 overflow-x-auto shrink-0 ${
              isDark ? "bg-zinc-950/60 border-zinc-800" : "bg-zinc-100/70 border-zinc-200"
            }`}
          >
            {[
              { id: "tutorial", label: "Tutorial Penyetaraan", icon: Layers },
              { id: "rules", label: "Aturan Biloks IUPAC", icon: FileText },
              { id: "glossary", label: "Glosarium Terminologi", icon: Bookmark },
              { id: "tips", label: "Tips Ujian & Trik Cepat", icon: Lightbulb },
              { id: "disclaimer", label: "Disclaimer & Ketentuan", icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all border cursor-pointer ${
                    isActive
                      ? isDark
                        ? "bg-white text-black border-white shadow-xs font-bold"
                        : "bg-black text-white border-black shadow-xs font-bold"
                      : isDark
                      ? "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white"
                      : "bg-white/80 border-zinc-300 text-zinc-600 hover:text-black"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* TAB 1: TUTORIAL PENYETARAAN */}
            {activeTab === "tutorial" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-sky-400 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>Metode 1: Setengah Reaksi (Ion-Elektron)</span>
                  </h4>
                  <p className={`text-xs mt-1 ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                    Metode standar emas untuk reaksi dalam larutan berair (asam atau basa).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Suasana Asam */}
                  <div
                    className={`p-4 rounded-xl border ${
                      isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                    }`}
                  >
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-block mb-2">
                      Suasana Asam (pH &lt; 7)
                    </span>
                    <ol className="text-xs space-y-2.5 list-decimal list-inside leading-relaxed opacity-90">
                      <li>
                        <strong>Pisahkan</strong> reaksi menjadi 2 setengah reaksi: oksidasi dan reduksi.
                      </li>
                      <li>
                        <strong>Setarakan atom utama</strong> yang berubah bilangan oksidasinya (selain O dan H).
                      </li>
                      <li>
                        <strong>Setarakan atom Oksigen</strong> dengan menambahkan molekul{" "}
                        <span className="font-mono font-bold text-sky-400">H₂O</span> pada ruas yang kekurangan O.
                      </li>
                      <li>
                        <strong>Setarakan atom Hidrogen</strong> dengan menambahkan ion{" "}
                        <span className="font-mono font-bold text-emerald-400">H⁺</span> pada ruas yang kekurangan H.
                      </li>
                      <li>
                        <strong>Setarakan muatan listrik</strong> dengan menambahkan elektron{" "}
                        <span className="font-mono font-bold text-purple-400">(e⁻)</span> pada ruas yang muatannya lebih positif.
                      </li>
                      <li>
                        <strong>Samakan jumlah elektron</strong> di kedua setengah reaksi (cari KPK-nya), lalu jumlahkan dan eliminasi spesi yang sama.
                      </li>
                    </ol>
                  </div>

                  {/* Suasana Basa */}
                  <div
                    className={`p-4 rounded-xl border ${
                      isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                    }`}
                  >
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 inline-block mb-2">
                      Suasana Basa (pH &gt; 7)
                    </span>
                    <ol className="text-xs space-y-2.5 list-decimal list-inside leading-relaxed opacity-90">
                      <li>
                        Lakukan langkah 1 sampai 5 seperti pada suasana asam.
                      </li>
                      <li>
                        Tambahkan ion{" "}
                        <span className="font-mono font-bold text-cyan-400">OH⁻</span> pada <strong>KEDUA RUAS</strong> sebanyak jumlah ion H⁺ yang ada.
                      </li>
                      <li>
                        Gabungkan ion <span className="font-mono">H⁺ + OH⁻</span> di ruas yang sama menjadi molekul air{" "}
                        <span className="font-mono font-bold text-sky-400">H₂O</span>.
                      </li>
                      <li>
                        Coret atau kurangkan molekul <span className="font-mono">H₂O</span> yang berlebih di kedua ruas jika muncul di kiri dan kanan.
                      </li>
                      <li>
                        Samakan elektron (KPK e⁻), jumlahkan reaksi, dan verifikasi muatan.
                      </li>
                    </ol>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border ${
                    isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Metode 2: Perubahan Bilangan Oksidasi (PBO)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed opacity-90">
                    <div>
                      <p>
                        <strong>1. Tentukan biloks</strong> setiap unsur pada reaktan dan produk.
                      </p>
                      <p className="mt-1">
                        <strong>2. Identifikasi unsur</strong> yang mengalami kenaikan biloks (oksidasi) dan penurunan biloks (reduksi).
                      </p>
                      <p className="mt-1">
                        <strong>3. Setarakan jumlah atom</strong> yang biloksnya berubah dengan memberi koefisien sementara.
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>4. Hitung total perubahan biloks</strong> (selisih × jumlah atom) lalu samakan dengan pengali silang (KPK).
                      </p>
                      <p className="mt-1">
                        <strong>5. Setarakan muatan</strong> dengan ion H⁺ (jika asam) atau ion OH⁻ (jika basa).
                      </p>
                      <p className="mt-1">
                        <strong>6. Sempurnakan atom H dan O</strong> dengan menambahkan molekul H₂O.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ATURAN BILOKS IUPAC */}
            {activeTab === "rules" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-sky-400">
                    8 Aturan Baku Penentuan Bilangan Oksidasi (IUPAC)
                  </h4>
                  <p className={`text-xs mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                    Hafalkan hierarki aturan ini untuk menyelesaikan setiap soal redoks tanpa keraguan.
                  </p>
                </div>

                <div className="space-y-2.5 text-xs">
                  {[
                    {
                      num: 1,
                      title: "Unsur Bebas Memiliki Biloks = 0",
                      desc: "Unsur dalam bentuk atom bebas atau molekul unsur netral seperti Fe, Na, H₂, O₂, Cl₂, P₄, S₈ biloksnya selalu 0.",
                      example: "Biloks Fe = 0, O dalam O₂ = 0",
                    },
                    {
                      num: 2,
                      title: "Ion Monoatom Sesuai Muatannya",
                      desc: "Bilangan oksidasi ion monoatomik persis sama dengan muatan listrik ion tersebut.",
                      example: "Na⁺ = +1, Mg²⁺ = +2, Fe³⁺ = +3, Cl⁻ = -1, S²⁻ = -2",
                    },
                    {
                      num: 3,
                      title: "Unsur Fluorin (F) Selalu = -1",
                      desc: "Fluorin adalah unsur paling elektronegatif di seluruh tabel periodik, sehingga biloksnya selalu -1 dalam semua senyawanya.",
                      example: "HF, NaF, CF₄ (semua F = -1)",
                    },
                    {
                      num: 4,
                      title: "Biloks Hidrogen (H) Umumnya = +1",
                      desc: "Dalam sebagian besar senyawa H = +1. Pengecualian: Pada hidrida logam (senyawa H dengan logam aktif seperti NaH, CaH₂), biloks H = -1.",
                      example: "H₂O (H = +1); NaH (H = -1)",
                    },
                    {
                      num: 5,
                      title: "Biloks Oksigen (O) Umumnya = -2",
                      desc: "Dalam senyawa biasa O = -2. Pengecualian penting: Pada peroksida (H₂O₂, Na₂O₂) O = -1; Pada superoksida (KO₂) O = -½; Pada OF₂ O = +2.",
                      example: "KMnO₄ (O = -2); H₂O₂ (O = -1); OF₂ (O = +2)",
                    },
                    {
                      num: 6,
                      title: "Logam Golongan IA, IIA, dan Al",
                      desc: "Golongan IA (Li, Na, K, Rb, Cs) selalu +1. Golongan IIA (Be, Mg, Ca, Sr, Ba) selalu +2. Aluminium (Al) selalu +3 dalam senyawanya.",
                      example: "NaCl (Na = +1), CaCO₃ (Ca = +2), Al₂O₃ (Al = +3)",
                    },
                    {
                      num: 7,
                      title: "Jumlah Biloks dalam Molekul Netral = 0",
                      desc: "Total akumulasi biloks semua atom penyusun molekul netral harus sama dengan 0.",
                      example: "H₂SO₄: 2(+1) + S + 4(-2) = 0 → S = +6",
                    },
                    {
                      num: 8,
                      title: "Jumlah Biloks dalam Ion Poliatom = Muatannya",
                      desc: "Total akumulasi biloks semua atom penyusun ion poliatomik harus sama dengan muatan ion itu.",
                      example: "MnO₄⁻: Mn + 4(-2) = -1 → Mn = +7; Cr₂O₇²⁻: 2Cr + 7(-2) = -2 → Cr = +6",
                    },
                  ].map((rule) => (
                    <div
                      key={rule.num}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                        isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-xs border border-sky-500/30">
                        {rule.num}
                      </span>
                      <div className="space-y-1">
                        <div className="font-bold text-sm tracking-tight">{rule.title}</div>
                        <p className={isDark ? "text-zinc-300" : "text-zinc-600"}>{rule.desc}</p>
                        <div className="font-mono text-[11px] text-emerald-400 dark:text-emerald-300 pt-0.5">
                          Contoh: {rule.example}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: GLOSARIUM TERMINOLOGI */}
            {activeTab === "glossary" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-sky-400">
                    Glosarium & Kamus Istilah Reaksi Redoks
                  </h4>
                  <p className={`text-xs mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                    Pahami perbedaan mendasar istilah yang kerap membingungkan pada ujian kimia.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    {
                      term: "Oksidasi (Oxidation)",
                      badge: "Naik Biloks / Lepas e⁻",
                      def: "Peristiwa pelepasan elektron oleh suatu spesi, ditandai dengan kenaikan bilangan oksidasi atom tersebut.",
                    },
                    {
                      term: "Reduksi (Reduction)",
                      badge: "Turun Biloks / Tangkap e⁻",
                      def: "Peristiwa penangkapan/penerimaan elektron oleh suatu spesi, ditandai dengan penurunan bilangan oksidasi atom tersebut.",
                    },
                    {
                      term: "Zat Oksidator (Pengoksidasi)",
                      badge: "Mengalami Reduksi",
                      def: "Zat yang menyebabkan zat lain teroksidasi dengan cara menarik elektron dari zat lain tersebut. Zat oksidator itu sendiri justru tereduksi.",
                    },
                    {
                      term: "Zat Reduktor (Pereduksi)",
                      badge: "Mengalami Oksidasi",
                      def: "Zat yang menyebabkan zat lain tereduksi dengan cara menyumbang elektron. Zat reduktor itu sendiri justru teroksidasi.",
                    },
                    {
                      term: "Reaksi Autoredoks (Disproporsionasi)",
                      badge: "1 Zat Jadi 2",
                      def: "Reaksi redoks di mana SATU spesi reaktan yang sama sekaligus bertindak sebagai reduktor dan oksidator.",
                    },
                    {
                      term: "Reaksi Konproporsionasi",
                      badge: "2 Zat Jadi 1 Produk",
                      def: "Kebalikan dari disproporsionasi: dua zat berbeda yang mengandung unsur yang sama dengan biloks berbeda menghasilkan satu produk dengan biloks sama.",
                    },
                    {
                      term: "Ion Spektator (Ion Pengiring)",
                      badge: "Tidak Berubah",
                      def: "Ion yang hadir di larutan namun bilangan oksidasinya sama sekali tidak berubah (misalnya K⁺, Na⁺, SO₄²⁻).",
                    },
                    {
                      term: "Kekekalan Muatan (Charge Balance)",
                      badge: "Hukum Fisika",
                      def: "Jumlah total muatan listrik di ruas reaktan (kiri) wajib tepat sama dengan ruas produk (kanan).",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border ${
                        isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <strong className="text-sm font-bold text-sky-400">{item.term}</strong>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border bg-zinc-900 border-zinc-700 text-zinc-300">
                          {item.badge}
                        </span>
                      </div>
                      <p className={`mt-1 leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                        {item.def}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: TIPS UJIAN & TRIK CEPAT */}
            {activeTab === "tips" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-sky-400">
                    Tips & Trik Mengerjakan Soal Redoks Cepat & Akurat
                  </h4>
                  <p className={`text-xs mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                    Strategi jitu untuk ujian sekolah, UTBK SNBT, hingga olimpiade kimia sains.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div
                    className={`p-4 rounded-xl border ${
                      isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                    }`}
                  >
                    <strong className="text-sm text-emerald-400 flex items-center gap-1.5 mb-1.5">
                      <Lightbulb className="w-4 h-4" />
                      <span>1. Cara Cepat Membedakan Redoks vs Bukan Redoks</span>
                    </strong>
                    <p className={`leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                      Cari apakah ada <strong>unsur bebas</strong> (seperti Fe, Zn, Cl₂, O₂, H₂) di salah satu ruas, lalu berubah menjadi senyawa di ruas lainnya (atau sebaliknya). Jika ada unsur bebas yang menjadi senyawa, <strong>PASTI reaksi redoks</strong> (karena biloks unsur bebas = 0, sedangkan dalam senyawa ≠ 0).
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-xl border ${
                      isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                    }`}
                  >
                    <strong className="text-sm text-emerald-400 flex items-center gap-1.5 mb-1.5">
                      <Lightbulb className="w-4 h-4" />
                      <span>2. Menghilangkan Ion Spektator Lebih Dahulu</span>
                    </strong>
                    <p className={`leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                      Jika menemui senyawa molekuler kompleks seperti KMnO₄ + FeSO₄ + H₂SO₄, ubah ke bentuk ion bersihnya terlebih dahulu:{" "}
                      <span className="font-mono text-sky-400">MnO₄⁻ + Fe²⁺ → Mn²⁺ + Fe³⁺</span>. Setelah setara, masukkan kembali ion K⁺ dan SO₄²⁻ sebagai ion pendamping.
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-xl border ${
                      isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                    }`}
                  >
                    <strong className="text-sm text-emerald-400 flex items-center gap-1.5 mb-1.5">
                      <Lightbulb className="w-4 h-4" />
                      <span>3. Verifikasi Super Cepat dengan Total Muatan</span>
                    </strong>
                    <p className={`leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                      Banyak siswa menyetarakan atom tetapi lupa memeriksa muatan. Contoh: MnO₄⁻ (-1) + 5 Fe²⁺ (+10) + 8 H⁺ (+8) = total muatan kiri <strong>+17</strong>. Ruas kanan: Mn²⁺ (+2) + 5 Fe³⁺ (+15) = <strong>+17</strong>. Kiri = Kanan = +17 → PASTI 100% BENAR.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: DISCLAIMER & KETENTUAN EDUKASI */}
            {activeTab === "disclaimer" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-sky-400">
                    Disclaimer Ilmiah & Ketentuan Penggunaan Chemly
                  </h4>
                  <p className={`text-xs mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                    Informasi mengenai dasar algoritma perhitungan deterministik dan komitmen akurasi.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl border space-y-3 text-xs leading-relaxed ${
                    isDark ? "bg-zinc-950 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-700"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p>
                      <strong>Algoritma Deterministik Eksak:</strong> Chemly menggunakan eliminasi Gauss-Jordan matriks aljabar rasional murni pecahan bilangan bulat (bukan aproksimasi desimal floating point). Hal ini menjamin koefisien stoikiometri yang dihasilkan adalah bilangan bulat positif terkecil (FPB/KPK terkecil) yang mematuhi hukum kekekalan massa Lavoisier dan hukum Faraday.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p>
                      <strong>Kesesuaian Kurikulum Kimia:</strong> Langkah-langkah setengah reaksi (ion-elektron) dan metode PBO disusun sesuai standar kurikulum kimia SMA Kemendikbudristek RI, Cambridge A-Level, AP Chemistry, dan International Baccalaureate (IB).
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p>
                      <strong>Disclaimer Reversibilitas & Kondisi Nyata:</strong> Persamaan reaksi yang disetarakan mencerminkan kesetaraan stoikiometri teoritis. Dalam praktikum laboratorium riil, beberapa reaksi memerlukan katalis, suhu tertentu, atau kondisi potensial reduksi standar ($E^\circ$) positif agar dapat berlangsung spontan secara termodinamika.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border text-[11px] text-center font-mono ${
                    isDark ? "bg-zinc-900/50 border-zinc-800 text-zinc-400" : "bg-zinc-100 border-zinc-300 text-zinc-600"
                  }`}
                >
                  Chemly - Chemistry Intelligence Platform © 2026. Didedikasikan untuk pendidikan kimia Indonesia & global.
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
