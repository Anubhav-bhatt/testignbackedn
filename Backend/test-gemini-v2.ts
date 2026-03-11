import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function test() {
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.5-flash-latest"];
    for (const m of models) {
        try {
            console.log(`Testing model: ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hello");
            console.log(`Success with ${m}:`, result.response.text());
        } catch (e: any) {
            console.error(`Failed with ${m}:`, e.message);
        }
    }
}

test();
