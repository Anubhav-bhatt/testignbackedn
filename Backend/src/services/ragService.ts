import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import { query } from '../db';
import { embedText } from './ollamaService';

type IndexDocumentInput = {
    caseId: string;
    documentId: string;
    filePath: string;
    originalName?: string;
    metadata?: Record<string, unknown>;
};

export type RetrievedChunk = {
    content: string;
    score: number;
    documentId: string | null;
    metadata: Record<string, unknown> | null;
};

export type RagSource = {
    label: string;
    similarity: number;
    excerpt: string;
    documentId: string | null;
};

export type RetrievalResult = {
    chunks: RetrievedChunk[];
    scope: 'case' | 'global' | 'none';
    totalCandidates: number;
};

const DEFAULT_CHUNK_SIZE = 1400;
const DEFAULT_CHUNK_OVERLAP = 250;
const MIN_RELEVANCE_SCORE = 0.18;

const parsePdf = async (buffer: Buffer): Promise<string> => {
    const parser = new (PDFParse as unknown as new (opts: object) => { load(): Promise<void>; getText(): Promise<{ text: string }> })({ data: new Uint8Array(buffer), verbosity: 0 });
    await parser.load();
    const result = await parser.getText();
    return result.text;
};

const normalizeText = (text: string) => text.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();

const chunkText = (text: string, size = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_CHUNK_OVERLAP): string[] => {
    const normalized = normalizeText(text);
    if (!normalized) {
        return [];
    }

    const chunks: string[] = [];
    let cursor = 0;

    while (cursor < normalized.length) {
        const slice = normalized.slice(cursor, cursor + size).trim();
        if (slice) {
            chunks.push(slice);
        }

        if (cursor + size >= normalized.length) {
            break;
        }

        cursor += size - overlap;
    }

    return chunks;
};

const extractTextFromFile = async (filePath: string): Promise<string> => {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.pdf') {
        return await parsePdf(fs.readFileSync(filePath));
    }

    if (ext === '.txt' || ext === '.md') {
        return fs.readFileSync(filePath, 'utf8');
    }

    throw new Error(`Unsupported document type for RAG indexing: ${ext}`);
};

const cosineSimilarity = (left: number[], right: number[]): number => {
    if (!left.length || left.length !== right.length) {
        return 0;
    }

    let dotProduct = 0;
    let leftMagnitude = 0;
    let rightMagnitude = 0;

    for (let index = 0; index < left.length; index += 1) {
        dotProduct += left[index] * right[index];
        leftMagnitude += left[index] * left[index];
        rightMagnitude += right[index] * right[index];
    }

    if (!leftMagnitude || !rightMagnitude) {
        return 0;
    }

    return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
};

const rankRows = (
    queryEmbedding: number[],
    rows: Array<{ content: string; embedding: number[]; document_id: string | null; metadata: Record<string, unknown> | null }>,
    limit: number
): RetrievedChunk[] => rows
    .map((row) => ({
        content: row.content,
        score: cosineSimilarity(queryEmbedding, row.embedding),
        documentId: row.document_id,
        metadata: row.metadata,
    }))
    .filter((row) => row.score >= MIN_RELEVANCE_SCORE)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);

export const getSourceLabel = (chunk: RetrievedChunk, index: number): string => {
    if (typeof chunk.metadata?.originalName === 'string' && chunk.metadata.originalName.trim()) {
        return chunk.metadata.originalName;
    }

    return chunk.documentId || `document-${index + 1}`;
};

const compactExcerpt = (content: string, maxLength = 220) => {
    const normalized = content.replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxLength) {
        return normalized;
    }

    return `${normalized.slice(0, maxLength - 3)}...`;
};

export const deleteDocumentEmbeddings = async (documentId: string) => {
    await query('DELETE FROM case_embeddings WHERE document_id = $1', [documentId]);
};

export const indexNoteEmbedding = async (noteId: string, caseId: string, content: string): Promise<number> => {
    const chunks = chunkText(content);
    if (!chunks.length) return 0;

    await query('DELETE FROM case_embeddings WHERE document_id = $1', [`note_${noteId}`]);

    for (let index = 0; index < chunks.length; index += 1) {
        const embedding = await embedText(chunks[index]);
        await query(
            'INSERT INTO case_embeddings (case_id, document_id, content, metadata, embedding) VALUES ($1, $2, $3, $4, $5)',
            [
                caseId,
                `note_${noteId}`,
                chunks[index],
                { source: 'case-note', noteId, chunkIndex: index, originalName: 'Case Note' },
                embedding,
            ]
        );
    }

    return chunks.length;
};

export const deleteNoteEmbeddings = async (noteId: string) => {
    await query('DELETE FROM case_embeddings WHERE document_id = $1', [`note_${noteId}`]);
};

export const indexDocument = async (input: IndexDocumentInput): Promise<number> => {
    if (!fs.existsSync(input.filePath)) {
        throw new Error(`Document file not found for indexing: ${input.filePath}`);
    }

    const rawText = await extractTextFromFile(input.filePath);
    const chunks = chunkText(rawText);

    await deleteDocumentEmbeddings(input.documentId);

    for (let index = 0; index < chunks.length; index += 1) {
        const chunk = chunks[index];
        const embedding = await embedText(chunk);
        await query(
            'INSERT INTO case_embeddings (case_id, document_id, content, metadata, embedding) VALUES ($1, $2, $3, $4, $5)',
            [
                input.caseId,
                input.documentId,
                chunk,
                {
                    ...input.metadata,
                    originalName: input.originalName,
                    sourcePath: path.basename(input.filePath),
                    chunkIndex: index,
                },
                embedding,
            ]
        );
    }

    return chunks.length;
};

export const retrieveRelevantChunks = async (question: string, caseId?: string, limit = 5): Promise<RetrievalResult> => {
    const queryEmbedding = await embedText(question);

    const caseResult = caseId
        ? await query('SELECT content, embedding, document_id, metadata FROM case_embeddings WHERE case_id = $1', [caseId])
        : null;

    if (caseResult) {
        const caseChunks = rankRows(queryEmbedding, caseResult.rows, limit);
        if (caseChunks.length > 0) {
            return {
                chunks: caseChunks,
                scope: 'case',
                totalCandidates: caseResult.rows.length,
            };
        }
    }

    const globalResult = await query('SELECT content, embedding, document_id, metadata FROM case_embeddings');
    const globalChunks = rankRows(queryEmbedding, globalResult.rows, limit);

    if (globalChunks.length > 0) {
        return {
            chunks: globalChunks,
            scope: caseId ? 'global' : 'case',
            totalCandidates: globalResult.rows.length,
        };
    }

    return {
        chunks: [],
        scope: 'none',
        totalCandidates: globalResult.rows.length,
    };
};

export const buildContextBlock = (chunks: RetrievedChunk[]): string => {
    if (!chunks.length) {
        return 'No indexed document context was found for this request.';
    }

    return chunks
        .map((chunk, index) => {
            const source = getSourceLabel(chunk, index);

            return `[Source ${index + 1}: ${source}; similarity=${chunk.score.toFixed(3)}]\n${chunk.content}`;
        })
        .join('\n\n---\n\n');
};

export const buildSources = (chunks: RetrievedChunk[]): RagSource[] => chunks.map((chunk, index) => ({
    label: getSourceLabel(chunk, index),
    similarity: Number(chunk.score.toFixed(3)),
    excerpt: compactExcerpt(chunk.content),
    documentId: chunk.documentId,
}));