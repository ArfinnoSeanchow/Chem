<div align="center">

# ⚡ CHEMLY — EXACT RATIONAL REDOX ENGINE
### *Pecahkan Persamaan Redoks Terkompleks Tanpa Tebakan*

[![React](https://img.shields.io/badge/React-18%2B-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4%2B-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-Animation-88CE02?style=for-the-badge&logo=greensock&logoColor=black)](https://greensock.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Motion-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://motion.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br />

> **Chemly** adalah platform analitik dan komputasi redoks pertama yang memadukan aritmatika ruang-nol matriks linear (*Null-Space Linear Algebra*) dengan presisi pecahan **BigInt**. Menghitung transfer elektron, metode setengah reaksi ion-elektron, PBO, dan ekspor KaTeX dalam hitungan milidetik.

<br />

[Jelajahi Demo](#-fitur-unggulan) • [Cara Instalasi](#-instalasi-lokal) • [Arsitektur Komputasi](#-arsitektur-matriks-linear) • [Panduan Kontribusi](#-kontribusi)

</div>

---

## 🔬 Mengapa Chemly?

Kebanyakan kalkulator kimia berbasis web memanfaatkan algoritma *brute-force* atau regresi *floating-point* yang menghasilkan pecahan desimal tidak presisi atau galat pada reaksi multivariat (seperti autoredoks dan konproporsionasi). 

**Chemly menyelesaikan masalah ini dari akarnya:**
* 📐 **Zero Floating-Point Error:** Semua persamaan dipecahkan menggunakan eliminasi Gauss-Jordan rasional murni berbasis `BigInt`.
* ⚖️ **Hukum Konservasi Mutlak:** Menjamin kesetaraan neraca massa atom dan konservasi muatan listrik IUPAC secara absolut.
* 🧪 **Dua Sudut Pandang Akademis:** Menyediakan pembongkaran langkah runtut paruh reaksi (Ion-Elektron) dan Perubahan Bilangan Oksidasi (PBO).

---

## ⚡ Fitur Unggulan

| Modul | Keterangan Teknis |
| :--- | :--- |
| **Linear Null-Space Solver** | Eliminasi matriks ruang-nol tanpa batas variabel untuk koefisien bilangan bulat terkecil |
| **Media Asam & Basa Adaptif** | Otomatisasi kompensasi atom $\text{O}$ melalui $\text{H}_2\text{O}$ serta ion $\text{H}^+$ / $\text{OH}^-$ |
| **Autoredoks & Disproporsionasi** | Deteksi mandiri spesi ganda yang mengalami reduksi dan oksidasi simultan |
| **Ekspor Multi-Format** | Salin satu-klik ke format KaTeX ($$...$$), LaTeX `\ce{...}` (mhchem), dan plain text untuk MS Word/Docs |
| **Hardware-Engineered UI** | Tampilan Notch MacBook dinamis yang bertransformasi menjadi Sticky Floating Capsule saat di-scroll |
| **Interactive Stoichiometry Scaler**| Simulasi kelipatan reaksi (1x - 10x) untuk inspeksi transfer elektron dan energi bebas Gibbs secara riil |
| **Tabel Periodik 118 Unsur** | Data interaktif bilangan oksidasi lazim, elektronegativitas, dan konfigurasi elektron unsur |

---

## 🧠 Alur Komputasi Reaksi
