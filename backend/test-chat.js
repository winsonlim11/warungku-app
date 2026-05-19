import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function run() {
    try {
        console.log("Sending chat request...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: 'Halo' }] }
            ],
            config: {
                systemInstruction: "Kamu adalah asisten UMKM.",
                temperature: 0.7,
            }
        });
        console.log("SUCCESS:", response.text);
    } catch (err) {
        console.log("ERROR STATUS:", err.status);
        console.log("ERROR MESSAGE:", err.message);
        console.log("FULL ERROR:", JSON.stringify(err, null, 2));
    }
}

run();
