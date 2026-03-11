import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const testAPI = async () => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
        console.error("❌ Error: GEMINI_API_KEY is not set or is still the placeholder in .env file.");
        process.exit(1);
    }

    console.log("Starting API Key Verification...");
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Use a lightweight model for verification
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("Sending test prompt: 'Hello, are you working?'");
        const result = await model.generateContent("Hello, are you working? Respond with 'YES' if you can hear me.");
        const response = await result.response;
        const text = response.text();

        console.log("-----------------------------------");
        console.log("AI Response:", text);
        console.log("-----------------------------------");

        if (text.includes("YES") || text.length > 0) {
            console.log("✅ Success! Your Gemini API key is valid and working correctly.");
        } else {
            console.log("❓ API responded, but the output was unexpected. Please check your account quota.");
        }
    } catch (error: any) {
        console.error("❌ API Verification Failed!");
        if (error.status === 400 || error.message?.includes("API_KEY_INVALID")) {
            console.error("Error: The API key provided is invalid.");
        } else {
            console.error("Details:", error.message || error);
        }
    }
};

testAPI();
