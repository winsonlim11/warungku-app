import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("NO API KEY");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const modelsToTest = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
];

async function runTest() {
    console.log("Testing Models...");
    for (const model of modelsToTest) {
        try {
            console.log(`\nTesting ${model}...`);
            const response = await ai.models.generateContent({
                model: model,
                contents: "Say 'Hello'"
            });
            console.log(`✅ SUCCESS: ${model} -> ${response.text.trim()}`);
        } catch (err) {
            console.log(`❌ FAILED: ${model} -> ${err.status} : ${err.message}`);
        }
    }
}

runTest();
