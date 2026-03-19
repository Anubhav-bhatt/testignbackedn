import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import { query } from './db';
import { indexDocument } from './services/ragService';

type CategoryRule = {
    category: string;
    keywords: string[];
};

const parsePdf = async (buffer: Buffer): Promise<string> => {
    const parser = new (PDFParse as unknown as new (opts: object) => { load(): Promise<void>; getText(): Promise<{ text: string }> })({ data: new Uint8Array(buffer), verbosity: 0 });
    await parser.load();
    const result = await parser.getText();
    return result.text;
};
const AI_DATA_DIR = path.resolve(__dirname, '../../AI/data');
const KB_CASE_ID = 'kb_global_laws';
const KB_CASE_CODE = 'KB-0001';

const CATEGORY_RULES: CategoryRule[] = [
    { category: 'criminal-law', keywords: ['ipc', 'criminal', 'offence', 'offense', 'bail', 'fir', 'investigation', 'charge sheet'] },
    { category: 'civil-procedure', keywords: ['cpc', 'civil', 'plaint', 'written statement', 'injunction', 'decree', 'execution'] },
    { category: 'contracts-commercial', keywords: ['contract', 'agreement', 'indemnity', 'liability', 'arbitration', 'vendor', 'service level'] },
    { category: 'property-land', keywords: ['property', 'title', 'sale deed', 'mutation', 'encumbrance', 'lease', 'tenancy'] },
    { category: 'family-law', keywords: ['marriage', 'divorce', 'maintenance', 'custody', 'hindu marriage', 'domestic violence'] },
    { category: 'constitutional-public-law', keywords: ['constitution', 'article', 'writ', 'fundamental right', 'public interest litigation'] },
    { category: 'tax-regulatory', keywords: ['gst', 'income tax', 'compliance', 'assessment', 'notice', 'penalty'] },
    { category: 'company-corporate', keywords: ['companies act', 'board resolution', 'shareholder', 'director', 'mca', 'corporate governance'] },
    { category: 'evidence-procedure', keywords: ['evidence', 'admissibility', 'cross examination', 'witness', 'affidavit'] },
];

const collectFilesRecursively = (dirPath: string): string[] => {
    if (!fs.existsSync(dirPath)) {
        return [];
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const absolute = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            files.push(...collectFilesRecursively(absolute));
            continue;
        }

        const ext = path.extname(entry.name).toLowerCase();
        if (ext === '.pdf' || ext === '.txt' || ext === '.md') {
            files.push(absolute);
        }
    }

    return files;
};

const extractTextPreview = async (filePath: string): Promise<string> => {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.pdf') {
        return await parsePdf(fs.readFileSync(filePath));
    }

    return fs.readFileSync(filePath, 'utf8');
};

const inferCategory = (fileName: string, text: string): string => {
    const corpus = `${fileName} ${(text || '').slice(0, 12000)}`.toLowerCase();

    let bestCategory = 'general-legal-reference';
    let bestScore = 0;

    for (const rule of CATEGORY_RULES) {
        let score = 0;
        for (const keyword of rule.keywords) {
            if (corpus.includes(keyword)) {
                score += 1;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestCategory = rule.category;
        }
    }

    return bestCategory;
};

const buildDocumentId = (absolutePath: string) => {
    const normalized = path.normalize(absolutePath).toLowerCase();
    const digest = crypto.createHash('sha1').update(normalized).digest('hex').slice(0, 12);
    return `kbdoc_${digest}`;
};

const ensureKnowledgeBaseCase = async () => {
    await query(
        `INSERT INTO cases (id, case_id, title, status, category, court, next_hearing)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
            KB_CASE_ID,
            KB_CASE_CODE,
            'Global Legal Knowledge Base',
            'Knowledge Base',
            'Research',
            'N/A',
            'N/A',
        ]
    );
};

const upsertKnowledgeDocument = async (params: {
    documentId: string;
    filePath: string;
    fileName: string;
    size: number;
}) => {
    const { documentId, filePath, fileName, size } = params;

    await query(
        `INSERT INTO documents (id, filename, original_name, mime_type, size, case_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (id)
         DO UPDATE SET filename = EXCLUDED.filename,
                       original_name = EXCLUDED.original_name,
                       mime_type = EXCLUDED.mime_type,
                       size = EXCLUDED.size,
                       case_id = EXCLUDED.case_id`,
        [
            documentId,
            path.basename(filePath),
            fileName,
            path.extname(filePath).toLowerCase() === '.pdf' ? 'application/pdf' : 'text/plain',
            size,
            KB_CASE_ID,
        ]
    );
};

const ingestAIData = async () => {
    if (!fs.existsSync(AI_DATA_DIR)) {
        throw new Error(`AI data directory does not exist: ${AI_DATA_DIR}`);
    }

    await ensureKnowledgeBaseCase();

    const files = collectFilesRecursively(AI_DATA_DIR);
    if (files.length === 0) {
        console.log('[AI INGEST] No supported files found in AI/data.');
        return;
    }

    console.log(`[AI INGEST] Found ${files.length} files in AI/data.`);

    for (const absolutePath of files) {
        const fileName = path.basename(absolutePath);
        const documentId = buildDocumentId(absolutePath);
        const fileSize = fs.statSync(absolutePath).size;

        const previewText = await extractTextPreview(absolutePath);
        const category = inferCategory(fileName, previewText);

        await upsertKnowledgeDocument({
            documentId,
            filePath: absolutePath,
            fileName,
            size: fileSize,
        });

        const chunkCount = await indexDocument({
            caseId: KB_CASE_ID,
            documentId,
            filePath: absolutePath,
            originalName: fileName,
            metadata: {
                source: 'ai-data-folder',
                category,
                relativePath: path.relative(AI_DATA_DIR, absolutePath),
            },
        });

        console.log(`[AI INGEST] ${fileName} -> ${category} (${chunkCount} chunks)`);
    }
};

ingestAIData()
    .then(() => {
        console.log('[AI INGEST] Completed AI/data ingestion and categorization.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('[AI INGEST] Failed:', error);
        process.exit(1);
    });
