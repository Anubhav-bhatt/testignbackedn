import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import pool from '../utils/db';

dotenv.config({ path: path.resolve(__dirname, '../../Backend/.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Domain-specific Document Ingestion
 * Extracts text, chunks optimally for legal documents, and stores vectors.
 */
export const processDocument = async (filePath: string, caseId: string, documentId: string) => {
    const ext = path.extname(filePath).toLowerCase();
    let text = "";

    try {
        if (ext === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            text = data.text;
        } else if (ext === '.txt' || ext === '.md') {
            text = fs.readFileSync(filePath, 'utf8');
        } else {
            console.warn(`Unsupported file type: ${ext}`);
            return;
        }

        if (!text.trim()) return;

        // Legal documents often have important headers/footers, so we use slightly larger chunks with more overlap
        const chunks = chunkText(text, 1200, 200);

        for (const chunk of chunks) {
            const embedding = await generateEmbedding(chunk);
            await storeEmbedding(caseId, documentId, chunk, embedding);
        }
    } catch (err: any) {
        console.error('Error processing legal document:', err);
        throw err;
    }
};

const chunkText = (text: string, size: number, overlap: number): string[] => {
    const chunks: string[] = [];
    let current = 0;
    while (current < text.length) {
        chunks.push(text.substring(current, current + size));
        current += size - overlap;
    }
    return chunks;
};

const generateEmbedding = async (text: string): Promise<number[]> => {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
};

const storeEmbedding = async (caseId: string, documentId: string, content: string, embedding: number[]) => {
    await pool.query(
        'INSERT INTO case_embeddings (case_id, document_id, content, embedding) VALUES ($1, $2, $3, $4)',
        [caseId, documentId, content, embedding]
    );
};
