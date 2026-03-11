
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    const key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(key || "");
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    try {
        console.log("Testing embedding...");
        const result = await model.embedContent("Hello world");
        console.log("Success! Embedding length:", result.embedding.values.length);
    } catch (error: any) {
        console.error("Error:", error.message);
    }
};

run();
