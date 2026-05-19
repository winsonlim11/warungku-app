# WarungKu 🏪
**Sistem Kasir Pintar & Asisten Bisnis Berbasis AI untuk UMKM Indonesia**

Dibuat khusus untuk kompetisi **#JuaraVibeCoding 2026** oleh Google.

WarungKu adalah transformasi digital menyeluruh untuk toko kecil dan warung di Indonesia. Tidak hanya sekadar sistem kasir (Point of Sale), aplikasi ini dilengkapi dengan Asisten AI canggih yang bertindak sebagai konsultan bisnis pribadi yang tahu persis kondisi keuangan warung Anda.

## ✨ Fitur Utama
- **Sistem Kasir (POS) Interaktif**: Antarmuka penjualan visual yang *mobile-friendly*, perhitungan otomatis, dan pencarian produk yang instan.
- **Manajemen Gudang & Stok Pintar**: Pelacakan stok barang secara *real-time*. Sistem akan mencegah penjualan jika stok habis. Terproteksi dengan kata sandi khusus pemilik.
- **Laporan Keuangan & Analitik**: Visualisasi data pendapatan, grafik tren penjualan, pemfilteran berdasarkan tanggal, dan kemampuan *export* ke file CSV.
- **Asisten AI (Konsultan Bisnis)**: Didukung oleh **Gemini 2.5 Flash**, Asisten AI ini tidak hanya menjawab pertanyaan, tapi juga menganalisis total pendapatan dan metrik warung Anda untuk memberikan saran bisnis yang sangat terpersonalisasi.
- **Keamanan Berlapis**: Kunci PIN aplikasi (`12345`) dan sandi khusus area pemilik (`winwin`) untuk menjaga kerahasiaan data Laporan, Gudang, dan AI.
- **Desain Premium**: Menggunakan antarmuka *Glassmorphism* modern dengan dukungan penuh fitur *Dark Mode*.

## 🛠️ Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS v4, Lucide Icons, React Markdown
- **Backend**: Node.js, Express, `@google/genai` (Model: Gemini 2.5 Flash)
- **Deployment**: Docker, Google Cloud Run

---

## 🚀 Cara Menjalankan Lokal (Bagi Pengembang)

**Prasyarat:**
- Node.js (v18+)
- Gemini API Key (Dapatkan di Google AI Studio)

**1. Setup Backend:**
```bash
cd backend
npm install
cp .env.example .env
```
Edit file `.env` di dalam folder `backend` dan masukkan `GEMINI_API_KEY` Anda.

**2. Setup Frontend:**
```bash
cd ../frontend
npm install
```

**3. Menjalankan Server Development:**
Buka 2 terminal terpisah:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Backend akan berjalan di http://localhost:8080
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Frontend akan berjalan di http://localhost:5173
```

---

## ☁️ Cara Deploy ke Google Cloud Run

Proyek ini sudah dilengkapi dengan `Dockerfile` multi-stage yang menggabungkan Frontend dan Backend menjadi satu mesin (*container*) yang siap di-deploy ke Cloud Run.

**Langkah Termudah (Via GitHub):**
1. *Push* kode ini ke repositori GitHub Anda.
2. Buka **Google Cloud Console** > **Cloud Run** > **Create Service**.
3. Pilih opsi **Continuously deploy from a source repository**, lalu sambungkan repositori GitHub Anda.
4. Di bagian *Build Configuration*, pilih **Dockerfile**.
5. Di bagian *Variables & Secrets*, tambahkan *Environment Variable* baru: `GEMINI_API_KEY` dan isi dengan API Key Anda.
6. Centang **Allow unauthenticated invocations**.
7. Klik **Deploy**.

*Dibuat dengan ❤️ untuk UMKM Indonesia. Powered by Google Gemini.*
