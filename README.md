# UMKM Pintar 🏪

**Asisten Pintar untuk Warung & Toko Kecil**
Dibuat untuk kompetisi #JuaraVibeCoding 2026 oleh Google.

UMKM Pintar adalah aplikasi web yang membantu pemilik UMKM di Indonesia dengan fitur:
1. **Tanya AI:** Konsultasi bisnis langsung dengan Gemini.
2. **Kalkulator Untung Rugi:** Hitung estimasi keuntungan dan margin dengan cepat.
3. **Generator Caption:** Buat caption promosi otomatis untuk berbagai media sosial.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Lucide React
- **Backend:** Node.js, Express, @google/genai (Gemini 2.0 Flash)
- **Deployment:** Docker, Google Cloud Run

## 🚀 Cara Menjalankan Lokal

### Prasyarat
- Node.js (v18+)
- Gemini API Key ([Dapatkan di Google AI Studio](https://aistudio.google.com/app/apikey))

### Setup
1. **Clone/Download** repository ini.
2. **Setup Backend:**
   \`\`\`bash
   cd backend
   npm install
   cp .env.example .env
   \`\`\`
   Edit file `.env` di dalam folder \`backend\` dan masukkan `GEMINI_API_KEY` Anda.
3. **Setup Frontend:**
   \`\`\`bash
   cd ../frontend
   npm install
   \`\`\`

### Menjalankan Server Development
Buka 2 terminal terpisah:

**Terminal 1 (Backend):**
\`\`\`bash
cd backend
npm run dev
# Backend akan berjalan di http://localhost:8080
\`\`\`

**Terminal 2 (Frontend):**
\`\`\`bash
cd frontend
npm run dev
# Frontend akan berjalan (biasanya di http://localhost:5173)
\`\`\`

## ☁️ Cara Deploy ke Google Cloud Run

Proyek ini sudah dilengkapi dengan \`Dockerfile\` multi-stage yang siap di-deploy ke Cloud Run.

### Langkah-langkah:
1. Pastikan Anda sudah menginstall [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) dan login ke akun Google Cloud Anda.
2. Buka terminal di root direktori proyek ini (di mana terdapat file \`Dockerfile\`).
3. Set project ID Google Cloud Anda (ganti \`YOUR_PROJECT_ID\`):
   \`\`\`bash
   gcloud config set project YOUR_PROJECT_ID
   \`\`\`
4. Deploy langsung menggunakan gcloud run (Ganti \`YOUR_API_KEY\`):
   \`\`\`bash
   gcloud run deploy umkm-pintar \
     --source . \
     --region asia-southeast2 \
     --allow-unauthenticated \
     --set-env-vars="GEMINI_API_KEY=YOUR_API_KEY"
   \`\`\`
5. Tunggu proses build dan deploy selesai. Google Cloud Run akan memberikan URL publik untuk aplikasi Anda.

---
*Dibuat dengan ❤️ untuk #JuaraVibeCoding 2026. Powered by Google Gemini.*
