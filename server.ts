/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json());

// Lazy-loaded Gemini AI client variable
let aiClient: GoogleGenAI | null = null;

// Lazy initialization function to prevent startup crash if API key is missing
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      throw new Error('Kunci API GEMINI_API_KEY tidak dikonfigurasikan di server.');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// API endpoint for AI travel assistant
app.post('/api/gemini', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Sila masukkan soalan anda.' });
  }

  try {
    const client = getGeminiClient();

    const systemInstruction = 
      "Anda adalah seorang pakar pemandu pelancong virtual rasmi untuk Negeri Kedah Darul Aman, Malaysia. " +
      "Tugas anda adalah menjawab semua soalan tentang tarikan pelancongan, makanan tradisional yang menarik (seperti Laksa Kedah, Pekasam, Nasi Daging, Gulai Batang Pisang dll), tapak sejarah lama, kebudayaan tempatan Kedah, pengangkutan, peta laluan, dan perancangan itinerari percutian dengan sangat sopan, mesra, dan penuh maklumat. " +
      "Sila jawab soalan dalam Bahasa Melayu yang kasual, santun, menarik, serta mudah difahami oleh pelancong tempatan mahupun asing. " +
      "Gunakan penanda emoji yang menarik jika sesuai. Jangan memalsukan data. Berikan anggaran harga atau info sebenar jika ditanya.";

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || 'Maaf, saya menghadapi kesukaran memproses jawapan.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini API Error:', error.message);
    res.status(500).json({ 
      error: 'Hubungi AI ralat', 
      reply: 'Maaf, saya tidak dapat menjawab ketika ini kerana ralat sambungan atau kunci API pembantu AI tidak aktif. Sila hubungi pentadbir sistem.' 
    });
  }
});

// Setup development and production route flows
async function main() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running in DEVELOPMENT mode with Vite Middleware');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running in PRODUCTION mode');
    const distPath = path.join(process.cwd(), 'dist');
    // Serves static bundle artifacts from /dist
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is booting on port ${PORT}`);
    console.log(`Access the application at http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
});
