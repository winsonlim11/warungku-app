import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || '';
console.log(`[INIT] Gemini API Key terbaca: ${apiKey ? apiKey.substring(0, 8) + '...' : 'TIDAK ADA'}`);
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash'; // Model terbaru yang terbukti berhasil dengan kunci API ini

// System prompt for Tanya AI
const TANYA_AI_SYSTEM_PROMPT = `Kamu adalah konsultan bisnis untuk pemilik UMKM Indonesia. 
Jawab dengan ramah, praktis, dan dalam Bahasa Indonesia. 
Berikan tips konkret yang bisa langsung diterapkan. 
Hindari istilah bisnis yang terlalu rumit. 
Maksimal 200 kata per jawaban.`;

const handleGeminiError = (res, error, endpoint) => {
  console.error(`\n[ERROR ASLI dari ${endpoint}]:`, error);
  
  const status = error.status || (error.response && error.response.status) || 500;
  
  if (status === 400) {
    return res.status(400).json({ error: 'Permintaan tidak valid (Bad Request)' });
  } else if (status === 401 || status === 403) {
    return res.status(status).json({ error: 'API Key tidak valid atau tidak diizinkan' });
  } else if (status === 404) {
    return res.status(404).json({ error: 'Model tidak ditemukan. Pastikan nama model valid.' });
  } else if (status === 429) {
    return res.status(429).json({ error: 'Rate limit tercapai, coba lagi sebentar' });
  } else if (status === 503) {
    return res.status(503).json({ error: 'Server Google sedang penuh (High Demand), mohon coba beberapa saat lagi.' });
  }
  
  return res.status(500).json({ error: 'Server Gemini error, coba lagi' });
};

// API Endpoint for Tanya AI
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, context } = req.body;
    console.log(`\n[API /chat] Menerima request...`);
    console.log(`[API /chat] Body:`, JSON.stringify(req.body).substring(0, 100) + '...');
    console.log(`[API /chat] Menggunakan model: ${MODEL_NAME}`);

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Format history for Gemini API
    const formattedHistory = history ? history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })) : [];
    
    let currentSystemPrompt = TANYA_AI_SYSTEM_PROMPT;
    if (context) {
      currentSystemPrompt += `\n\nKonteks Data Penjualan Pengguna Saat Ini:\n${context}`;
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: currentSystemPrompt,
        temperature: 0.7,
      }
    });

    console.log(`[API /chat] Sukses mendapat response dari Gemini.`);
    res.json({ reply: response.text });
  } catch (error) {
    handleGeminiError(res, error, '/api/chat');
  }
});

// API Endpoint for Generator Caption
app.post('/api/caption', async (req, res) => {
  try {
    const { nama_produk, deskripsi, platform, gaya } = req.body;
    console.log(`\n[API /caption] Menerima request...`);
    console.log(`[API /caption] Body:`, req.body);
    console.log(`[API /caption] Menggunakan model: ${MODEL_NAME}`);

    if (!nama_produk || !deskripsi || !platform || !gaya) {
      return res.status(400).json({ error: 'Semua field (nama produk, deskripsi, platform, gaya) harus diisi.' });
    }

    const prompt = `Buatkan 3 variasi caption promosi untuk platform ${platform} 
dengan gaya ${gaya} untuk produk berikut:
Nama: ${nama_produk}
Deskripsi: ${deskripsi}

Format output: JSON array berisi 3 string caption (tanpa markdown format \`\`\`json, hanya text murni array).
Setiap caption maksimal 150 karakter untuk Instagram/Facebook, 
80 karakter untuk WhatsApp/TikTok.
Tambahkan emoji yang relevan.
Pakai bahasa Indonesia yang natural untuk pasar Indonesia.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      }
    });

    console.log(`[API /caption] Sukses mendapat response dari Gemini.`);

    // Parse the JSON array
    let captions = [];
    try {
        captions = JSON.parse(response.text);
    } catch (parseError) {
        console.error("[API /caption] Failed to parse JSON output from Gemini:", response.text);
        // Fallback array if parsing fails
        captions = [response.text]; 
    }

    res.json({ captions });
  } catch (error) {
    handleGeminiError(res, error, '/api/caption');
  }
});

// Serve static frontend files in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, 'public');

app.use(express.static(frontendPath));

// Catch-all to serve index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`Server is running on port ${PORT}`);
  console.log(`========================================\n`);
});
