import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: any = null;
function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    // Dynamic import or require to ensure resilience
    const { GoogleGenAI } = require("@google/genai");
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Redox Solver" });
});

// API endpoint to ask AI Chemistry Tutor about redox reaction
app.post("/api/ai-explain", async (req, res) => {
  try {
    const { reaction, medium, query, context } = req.body;
    if (!reaction && !query) {
      return res.status(400).json({ error: "Reaction or query is required." });
    }

    const ai = getAIClient();
    const systemPrompt = `Anda adalah Guru Kimia Ahli dan Tutor Reaksi Redoks (Redox Chemistry Specialist).
Tugas Anda adalah menjelaskan reaksi reduksi-oksidasi secara mendalam, akurat, mudah dipahami siswa SMA/Mahasiswa, dengan tata bahasa Indonesia yang baik dan terstruktur.
Gunakan format markdown yang rapi dengan:
- Bilangan Oksidasi (Biloks) setiap unsur
- Mekanisme transfer elektron (siapa melepas, siapa menerima)
- Identifikasi Oksidator, Reduktor, Hasil Oksidasi, Hasil Reduksi
- Penjelasan mengapa reaksi tersebut terjadi (misal potensial reduksi standar E°, sifat keelektronegatifan, atau kestabilan orbital)
- Aplikasi nyata di laboratorium, industri, atau kehidupan sehari-hari jika relevan (misal sel volta, pemutih, titrasi permanganometri).
Gunakan gaya bahasa pedagogis yang ramah, jelas, dan memotivasi.`;

    const userPrompt = `Persamaan Reaksi: ${reaction || "Konsep Redoks Umum"}
Suasana: ${medium || "Asam / Asal"}
Konteks Analisis Tersedia: ${context ? JSON.stringify(context) : "None"}
Pertanyaan Pengguna: ${query || "Berikan penjelasan konsep mendalam tentang reaksi redoks ini, mengapa unsur tersebut teroksidasi/tereduksi, dan tips memahaminya."}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const text = response.text || "Tidak ada respons dari AI.";
    res.json({ success: true, explanation: text });
  } catch (error: any) {
    console.error("AI Explanation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Gagal menghasilkan penjelasan AI. Pastikan GEMINI_API_KEY telah dikonfigurasi.",
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Redox Solver server running on http://localhost:${PORT}`);
  });
}

startServer();
