import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { LEGAL_SYSTEM_PROMPT } from '../prompts';
import pool from '../utils/db';

dotenv.config({ path: path.resolve(__dirname, '../../Backend/.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getAssistantResponse = async (queryText: string, caseId?: string) => {
    let context = "";

    console.log(`[AI Assistant] Processing query for caseId: ${caseId}`);
    if (caseId) {
        console.log(`[AI Assistant] Fetching case details...`);
        const caseResult = await pool.query('SELECT * FROM cases WHERE id = $1', [caseId]);
        console.log(`[AI Assistant] Case details fetched. Rows: ${caseResult.rows.length}`);
        if (caseResult.rows.length > 0) {
            const caseData = caseResult.rows[0];
            context = `[Current Case Context]: 
            Title: ${caseData.title}
            Category: ${caseData.category}
            Court: ${caseData.court}
            Stage: ${caseData.status}
            `;
        }
    }

    console.log(`[AI Assistant] Initializing model gemini-1.5-flash...`);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: LEGAL_SYSTEM_PROMPT
    });

    const prompt = `
    ${context}
    
    User Query: ${queryText}
    
    Please provide an analytical, domain-specific legal response.
    `;

    console.log(`[AI Assistant] Generating content...`);
    try {
        const result = await model.generateContent(prompt);
        console.log(`[AI Assistant] Content generated. getting response...`);
        const response = await result.response;
        console.log(`[AI Assistant] Response received.`);
        return response.text();
    } catch (e) {
        console.error("[AI Assistant] Error generating content:", e);
        throw e;
    }
};
