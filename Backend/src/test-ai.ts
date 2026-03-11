
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    const key = process.env.GEMINI_API_KEY;
    console.log("Key available:", !!key);
    if (key) {
        console.log("Key starts with:", key.substring(0, 5));
        console.log("Key length:", key.length);
    }

    const genAI = new GoogleGenerativeAI(key || "");
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: "You are a helpful assistant."
    });

    try {
        const result = await model.generateContent("Hello from test script");
        const response = await result.response;
        console.log("Success! Response:", response.text());
    } catch (error: any) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("StatusText:", error.response.statusText);
        }
    }
};

run();
