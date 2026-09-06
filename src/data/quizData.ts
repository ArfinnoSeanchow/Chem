export type QuizType =
  | "balance_coefficients"
  | "find_oxidation_number"
  | "identify_agents"
  | "electron_transfer";

export interface QuizQuestion {
  id: string;
  type: QuizType;
  difficulty: "easy" | "medium" | "hard";
  title: string;
  prompt: string;
  equation?: string;
  medium?: "acidic" | "basic" | "neutral";
  
  // For balance coefficients
  unbalancedSpecies?: {
    reactants: { formula: string; correctCoeff: number }[];
    products: { formula: string; correctCoeff: number }[];
  };

  // For multiple choice
  options?: string[];
  correctOptionIndex?: number;

  // For direct numeric answer
  correctNumericAnswer?: number;

  // Complete Detailed Solution
  solutionExplanation: string;
  balancedEquationLatex?: string;
  halfReactionsLatex?: {
    oxidation: string;
    reduction: string;
  };
  keyConcept: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q-balance-1",
    type: "balance_coefficients",
    difficulty: "medium",
    title: "Penyetaraan Titrasi Permanganometri",
    prompt: "Tentukan koefisien stoikiometri terendah yang setara untuk reaksi redoks berikut dalam suasana asam:",
    equation: "MnO4- + C2O4^2- + H+ -> Mn^2+ + CO2 + H2O",
    medium: "acidic",
    unbalancedSpecies: {
      reactants: [
        { formula: "MnO4^-", correctCoeff: 2 },
        { formula: "C2O4^{2-}", correctCoeff: 5 },
        { formula: "H^+", correctCoeff: 16 },
      ],
      products: [
        { formula: "Mn^{2+}", correctCoeff: 2 },
        { formula: "CO2", correctCoeff: 10 },
        { formula: "H2O", correctCoeff: 8 },
      ],
    },
    solutionExplanation:
      "1. Setengah reaksi reduksi: MnO4^- + 8H^+ + 5e^- -> Mn^2+ + 4H2O (kali 2)\n2. Setengah reaksi oksidasi: C2O4^2- -> 2CO2 + 2e^- (kali 5)\n3. Penjumlahan: 2MnO4^- + 5C2O4^2- + 16H^+ -> 2Mn^2+ + 10CO2 + 8H2O. Elektron yang ditransfer adalah 10 e^-.",
    balancedEquationLatex:
      "2\\mathrm{MnO}_4^- + 5\\mathrm{C}_2\\mathrm{O}_4^{2-} + 16\\mathrm{H}^+ \\rightarrow 2\\mathrm{Mn}^{2+} + 10\\mathrm{CO}_2 + 8\\mathrm{H}_2\\mathrm{O}",
    keyConcept: "KPK elektron antara reduksi Mn (+7 -> +2, butuh 5e⁻) dan oksidasi C (+3 -> +4, lepas 2e⁻) adalah 10.",
  },
  {
    id: "q-biloks-1",
    type: "find_oxidation_number",
    difficulty: "easy",
    title: "Bilangan Oksidasi Kromium dalam Dikromat",
    prompt: "Berapakah bilangan oksidasi unsur Kromium (Cr) pada ion dikromat (Cr₂O₇²⁻)?",
    options: ["+3", "+4", "+6", "+7"],
    correctOptionIndex: 2,
    correctNumericAnswer: 6,
    solutionExplanation:
      "Gunakan aturan jumlah biloks dalam ion poliatomik = muatan ionnya (-2):\n2(Biloks Cr) + 7(Biloks O) = -2\n2(Biloks Cr) + 7(-2) = -2\n2(Biloks Cr) - 14 = -2\n2(Biloks Cr) = +12\nBiloks Cr = +6.",
    balancedEquationLatex: "\\mathrm{Cr}_2\\mathrm{O}_7^{2-}: 2(\\text{Cr}) + 7(-2) = -2 \\implies \\text{Cr} = +6",
    keyConcept: "Biloks oksigen umumnya adalah -2 (kecuali peroksida dan superoksida).",
  },
  {
    id: "q-agents-1",
    type: "identify_agents",
    difficulty: "easy",
    title: "Identifikasi Zat Pereduksi (Reduktor)",
    prompt: "Pada reaksi redoks: Zn + 2HCl -> ZnCl2 + H2, spesi manakah yang bertindak sebagai reduktor?",
    equation: "Zn + 2HCl -> ZnCl2 + H2",
    options: ["Zn (Seng)", "HCl (Asam Klorida)", "ZnCl2", "H2"],
    correctOptionIndex: 0,
    solutionExplanation:
      "1. Zn berubah dari biloks 0 menjadi +2 dalam ZnCl2 (mengalami oksidasi, melepas 2 elektron).\n2. H dalam HCl berubah dari biloks +1 menjadi 0 dalam H2 (mengalami reduksi).\nZat yang mengalami oksidasi disebut REDUKTOR. Jadi reduktornya adalah Zn.",
    keyConcept: "Reduktor = spesi yang mendonorkan elektron (biloks naik / mengalami oksidasi).",
  },
  {
    id: "q-transfer-1",
    type: "electron_transfer",
    difficulty: "medium",
    title: "Jumlah Elektron yang Terlibat",
    prompt: "Berapa jumlah mol elektron yang ditransfer pada reaksi penyetaraan lengkap antara 1 mol ion dikromat (Cr₂O₇²⁻) dengan ion Fe²⁺ dalam suasana asam?",
    options: ["2 mol elektron", "3 mol elektron", "6 mol elektron", "12 mol elektron"],
    correctOptionIndex: 2,
    correctNumericAnswer: 6,
    solutionExplanation:
      "Setengah reaksi reduksi dikromat:\nCr2O7^2- + 14H^+ + 6e^- -> 2Cr^3+ + 7H2O\nSetiap 1 mol Cr2O7^2- menangkap 6 mol elektron dari 6 mol Fe^2+ (Fe^2+ -> Fe^3+ + e^-). Jadi elektron yang ditransfer adalah 6e⁻.",
    balancedEquationLatex: "\\mathrm{Cr}_2\\mathrm{O}_7^{2-} + 6\\mathrm{Fe}^{2+} + 14\\mathrm{H}^+ \\rightarrow 2\\mathrm{Cr}^{3+} + 6\\mathrm{Fe}^{3+} + 7\\mathrm{H}_2\\mathrm{O}",
    keyConcept: "Dua atom Cr (+6) masing-masing menangkap 3 elektron menjadi Cr (+3), total = 2 x 3 = 6 e⁻.",
  },
  {
    id: "q-balance-2",
    type: "balance_coefficients",
    difficulty: "hard",
    title: "Disproporsionasi Klorin dalam Basa Panas",
    prompt: "Setarakan koefisien reaksi autoredoks klorin dalam suasana basa berikut:",
    equation: "Cl2 + OH- -> Cl- + ClO3- + H2O",
    medium: "basic",
    unbalancedSpecies: {
      reactants: [
        { formula: "Cl2", correctCoeff: 3 },
        { formula: "OH^-", correctCoeff: 6 },
      ],
      products: [
        { formula: "Cl^-", correctCoeff: 5 },
        { formula: "ClO3^-", correctCoeff: 1 },
        { formula: "H2O", correctCoeff: 3 },
      ],
    },
    solutionExplanation:
      "1. Oksidasi: Cl2 + 12OH^- -> 2ClO3^- + 6H2O + 10e^- (kali 1)\n2. Reduksi: Cl2 + 2e^- -> 2Cl^- (kali 5 -> 5Cl2 + 10e^- -> 10Cl^-)\n3. Jumlahkan: 6Cl2 + 12OH^- -> 10Cl^- + 2ClO3^- + 6H2O\n4. Sederhanakan bagi 2: 3Cl2 + 6OH^- -> 5Cl^- + ClO3^- + 3H2O.",
    balancedEquationLatex:
      "3\\mathrm{Cl}_2 + 6\\mathrm{OH}^- \\rightarrow 5\\mathrm{Cl}^- + \\mathrm{ClO}_3^- + 3\\mathrm{H}_2\\mathrm{O}",
    keyConcept: "Reaksi autoredoks: sebagian atom Cl tereduksi menjadi Cl⁻ (-1) dan sebagian teroksidasi menjadi ClO₃⁻ (+5).",
  },
  {
    id: "q-biloks-2",
    type: "find_oxidation_number",
    difficulty: "medium",
    title: "Bilangan Oksidasi Fosfor dalam Asam Pirofosfat",
    prompt: "Berapakah bilangan oksidasi unsur Fosfor (P) dalam asam pirofosfat (H₄P₂O₇)?",
    options: ["+3", "+4", "+5", "+7"],
    correctOptionIndex: 2,
    correctNumericAnswer: 5,
    solutionExplanation:
      "Senyawa netral memiliki total biloks = 0:\n4(Biloks H) + 2(Biloks P) + 7(Biloks O) = 0\n4(+1) + 2(Biloks P) + 7(-2) = 0\n+4 + 2(Biloks P) - 14 = 0\n2(Biloks P) = +10\nBiloks P = +5.",
    keyConcept: "Dalam sebagian besar asam oksi fosfor (H3PO4, H4P2O7), fosfor berada pada tingkat oksidasi tertingginya yaitu +5.",
  },
  {
    id: "q-agents-2",
    type: "identify_agents",
    difficulty: "medium",
    title: "Oksidator pada Pelarutan Tembaga",
    prompt: "Dalam reaksi: Cu + 4HNO3 -> Cu(NO3)2 + 2NO2 + 2H2O, spesi yang bertindak sebagai oksidator (zat pengoksidasi) adalah:",
    options: ["Cu (Tembaga)", "HNO3 (Asam Nitrat)", "Cu(NO3)2", "NO2"],
    correctOptionIndex: 1,
    solutionExplanation:
      "1. Cu berubah dari 0 menjadi +2 (oksidasi, maka Cu adalah reduktor).\n2. N dalam ion nitrat (HNO3) berubah dari biloks +5 menjadi +4 pada NO2 (mengalami reduksi).\nSpesi yang mengalami reduksi adalah zat OKSIDATOR, yaitu HNO3.",
    keyConcept: "Asam nitrat pekat merupakan zat pengoksidasi kuat (oksidator).",
  },
  {
    id: "q-balance-3",
    type: "balance_coefficients",
    difficulty: "easy",
    title: "Reaksi Logam Besi dengan Asam Klorida",
    prompt: "Setarakan koefisien persamaan reaksi redoks ionik berikut:",
    equation: "Fe + H+ -> Fe^2+ + H2",
    medium: "acidic",
    unbalancedSpecies: {
      reactants: [
        { formula: "Fe", correctCoeff: 1 },
        { formula: "H^+", correctCoeff: 2 },
      ],
      products: [
        { formula: "Fe^{2+}", correctCoeff: 1 },
        { formula: "H2", correctCoeff: 1 },
      ],
    },
    solutionExplanation:
      "1. Fe -> Fe^2+ + 2e^- (Oksidasi)\n2. 2H^+ + 2e^- -> H2 (Reduksi)\nKedua setengah reaksi sudah sama-sama melibatkan 2 elektron, sehingga tinggal dijumlahkan: Fe + 2H^+ -> Fe^2+ + H2.",
    balancedEquationLatex: "\\mathrm{Fe} + 2\\mathrm{H}^+ \\rightarrow \\mathrm{Fe}^{2+} + \\mathrm{H}_2",
    keyConcept: "Muatan kiri: 0 + 2(+1) = +2. Muatan kanan: +2 + 0 = +2. Muatan dan atom setara sempurna.",
  },
];
