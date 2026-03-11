import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { INSIGHTS_GENERATOR_PROMPT, LEGAL_SYSTEM_PROMPT } from '../prompts';
import pool from '../utils/db';

dotenv.config({ path: path.resolve(__dirname, '../../Backend/.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getCaseInsights = async (caseId: string) => {
    try {
        // 1. Fetch current case details
        const caseResult = await pool.query('SELECT * FROM cases WHERE id = $1', [caseId]);
        if (caseResult.rows.length === 0) throw new Error("Case not found");
        const caseData = caseResult.rows[0];

        // 2. Fetch context: Notes and Hearings
        const [notesRes, hearingsRes] = await Promise.all([
            pool.query('SELECT content, created_at FROM notes WHERE case_id = $1 ORDER BY created_at DESC LIMIT 5', [caseId]),
            pool.query('SELECT purpose, date, status FROM hearings WHERE case_id = $1 ORDER BY date DESC', [caseId])
        ]);

        const notesText = notesRes.rows.map(r => `[${r.created_at.toISOString().split('T')[0]}] ${r.content}`).join("\n");
        const hearingsText = hearingsRes.rows.map(r => `[${r.date}] ${r.purpose} - ${r.status}`).join("\n");

        // 3. Vector search for similar precedent/documents (Manual Cosine Similarity)
        let context = "No similar precedents found in the local knowledge base.";
        try {
            const searchQuery = `${caseData.title} ${caseData.category}`;
            const queryEmbedding = await generateEmbedding(searchQuery);

            const embeddingsResult = await pool.query('SELECT content, embedding FROM case_embeddings');

            if (embeddingsResult.rows.length > 0) {
                const candidates = embeddingsResult.rows.map((row: any) => ({
                    content: row.content,
                    similarity: cosineSimilarity(queryEmbedding, row.embedding)
                }));

                candidates.sort((a, b) => b.similarity - a.similarity);
                const top5 = candidates.slice(0, 5);

                if (top5.length > 0) {
                    context = top5.map((r: any) => r.content).join("\n\n---\n\n");
                }
            }
        } catch (err) {
            console.warn("Error during vector search, proceeding without context:", err);
        }

        // 4. Generate structured legal insights
        const modelName = "gemini-1.5-flash";
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: LEGAL_SYSTEM_PROMPT
        });

        const prompt = INSIGHTS_GENERATOR_PROMPT(caseData, context, notesText, hearingsText);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        if (!response) {
            throw new Error("No response from Gemini API");
        }
        let text = response.text();

        // Clean JSON output
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse AI response as JSON", text);
            return {
                summary: "Partial execution completed.",
                risks: ["Structured output mapping failed"],
                actions: ["Review raw output in logs"],
                precedents: "None"
            };
        }
    } catch (apiError: any) {
        console.error("AI Insight Pipeline Error:", apiError.message);

        // Check for specific API error signatures
        const isQuotaError = apiError.status === 429 ||
            apiError.message?.includes("429") ||
            apiError.message?.toLowerCase().includes("quota") ||
            apiError.message?.toLowerCase().includes("too many requests");

        if (isQuotaError) {
            return {
                case_summary: "AI Engine Rate Limit (429).",
                tactical_insights: [
                    "The Gemini API free tier limit has been reached (15-20 req/min).",
                    "Wait 60 seconds and click 'Retry Analysis' above.",
                    "If you recently uploaded large PDFs, indexing may still be consuming quota."
                ],
                evidentiary_risks: ["Real-time document cross-referencing is temporarily paused."],
                precedents_analysis: "Service throttled by Google API limits.",
                procedural_next_steps: ["Pause automated requests for 1 minute."],
                probability_assessment: "Operation will resume once the rate limit window resets."
            };
        }

        // Handle generic errors (like "Case not found" or DB issues)
        return {
            case_summary: "AI Analysis Interrupted.",
            tactical_insights: ["System Error: " + (apiError.message || "Unknown connectivity issue")],
            evidentiary_risks: ["Unable to process case data at this time."],
            precedents_analysis: "Data retrieval failure."
        };
    }
};

const generateEmbedding = async (text: string): Promise<number[]> => {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
};

function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    return (magnitudeA && magnitudeB) ? dotProduct / (magnitudeA * magnitudeB) : 0;
}
