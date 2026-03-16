import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateLegalResponse = async (query: string, caseId?: string): Promise<string> => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            return "Configuration Error: Gemini API Key is missing or using placeholder. Please update GEMINI_API_KEY in your Backend/.env file.";
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
You are a legal assistant for Indian legal workflows.
Case ID: ${caseId || "N/A"}
User Query: ${query}

Provide a concise, practical legal-assistant style response with:
1) Key point summary
2) Suggested next action
3) Any risk/caution
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return `I apologize, but I'm having trouble accessing the legal intelligence network. Error: ${error.message}`;
    }
};

