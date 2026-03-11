import { getAssistantResponse } from "../../../AI/engine/assistant";

export const generateLegalResponse = async (query: string, caseId?: string): Promise<string> => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            return "Configuration Error: Gemini API Key is missing or using placeholder. Please update GEMINI_API_KEY in your Backend/.env file.";
        }

        // Delegate to the domain-specific AI engine
        return await getAssistantResponse(query, caseId);

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return `I apologize, but I'm having trouble accessing the legal intelligence network. Error: ${error.message}`;
    }
};

