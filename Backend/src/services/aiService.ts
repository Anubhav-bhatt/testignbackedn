
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../database";

// Initialize Gemini lazily
let genAI: GoogleGenerativeAI | null = null;

export const generateLegalResponse = async (query: string, caseId?: string): Promise<string> => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            return "Configuration Error: Gemini API Key is missing or invalid. Please update GEMINI_API_KEY in your backend .env file.";
        }

        if (!genAI) {
            genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

        // Phase 1: Context Retrieval (RAG)
        // We fetch relevant structured data from our "Legal Graph" (the database)
        let context = "You are a highly experienced Legal AI Assistant named 'Legal IQ'. You help lawyers manage cases, draft documents, and plan strategy.";
        context += "\n\nKnowledge Base:\n";

        if (caseId && caseId !== 'undefined' && caseId !== 'default') {
            const caseData = db.getCaseById(caseId);
            if (caseData) {
                // 1. Case Metadata
                context += `[Current Case]: ${caseData.title} (${caseData.caseId})\n`;
                context += `Client: ${caseData.clientName}\n`;
                context += `Court: ${caseData.court} | Category: ${caseData.category}\n`;
                context += `Status: ${caseData.status} (Next Hearing: ${caseData.nextHearing})\n`;

                // 2. Recent Hearings (Tactical Context)
                const hearings = db.hearings
                    .filter(h => h.caseId === caseId)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 3);

                if (hearings.length > 0) {
                    context += `\n[Recent Hearings]:\n`;
                    hearings.forEach(h => {
                        context += `- ${h.date}: ${h.purpose} (${h.status})\n`;
                    });
                }

                // 3. Notes (Lawyer's Thoughts)
                const notes = db.notes
                    .filter(n => n.caseId === caseId)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 3);

                if (notes.length > 0) {
                    context += `\n[Recent Lawyer Notes]:\n`;
                    notes.forEach(n => {
                        context += `- ${n.content}\n`;
                    });
                }

                // 4. Documents (Evidence & Filings)
                const docs = db.documents.filter(d => d.caseId === caseId);
                if (docs.length > 0) {
                    context += `\n[Available Documents]:\n`;
                    docs.forEach(d => {
                        context += `- ${d.originalName} (${d.mimeType})\n`;
                    });
                }
            }
        } else {
            context += "No specific case selected. You are in 'General Counsel' mode. Answer legal questions generally.\n";
            // Check for general user query context if needed (e.g. searching for a case)
        }

        // Check for greetings and simple queries to avoid token usage/latency
        const q = query.toLowerCase().trim();
        if (['hi', 'hello', 'hey', 'greetings'].includes(q)) {
            return "Good day, Counsel. I am ready to assist with your matters. What would you like to review?";
        }

        // Phase 2: Generation
        const prompt = `${context}\n\n[User Query]: "${query}"\n\n[Instruction]: Provide a professional, tactical legal response. If the query asks for a draft, provide a structured draft. If it asks for strategy, reference the specific facts above. Keep it concise but authoritative.`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (genError: any) {
            if (genError.status === 429) {
                console.warn("Rate limited, retrying...");
                await new Promise(resolve => setTimeout(resolve, 2000)); // Simple wait
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            }
            throw genError;
        }

    } catch (error) {
        console.error("AI Generation Error:", error);
        return "I apologize, but I'm having trouble accessing the legal intelligence network right now. Please try again later.";
    }
};
