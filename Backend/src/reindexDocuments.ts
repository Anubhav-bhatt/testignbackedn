import fs from 'fs';
import path from 'path';
import { query } from './db';
import { indexDocument } from './services/ragService';

const reindexDocuments = async () => {
    const documentsRes = await query(
        'SELECT id, case_id, filename, original_name, mime_type, doc_type FROM documents WHERE case_id IS NOT NULL ORDER BY created_at ASC'
    );

    for (const document of documentsRes.rows as Array<{
        id: string;
        case_id: string;
        filename: string;
        original_name: string;
        mime_type: string;
        doc_type: string;
    }>) {
        const filePath = path.join(__dirname, '../uploads', document.filename);
        if (!fs.existsSync(filePath)) {
            console.warn(`[AI] Skipping missing file for document ${document.id}: ${filePath}`);
            continue;
        }

        console.log(`[AI] Reindexing document ${document.id} (${document.original_name})`);
        const chunkCount = await indexDocument({
            caseId: document.case_id,
            documentId: document.id,
            filePath,
            originalName: document.original_name,
            metadata: {
                mimeType: document.mime_type,
                docType: document.doc_type,
                source: 'manual-reindex',
            },
        });

        console.log(`[AI] Indexed ${chunkCount} chunks for document ${document.id}`);
    }
};

reindexDocuments()
    .then(() => {
        console.log('[AI] Document reindex complete');
        process.exit(0);
    })
    .catch((error) => {
        console.error('[AI] Document reindex failed:', error);
        process.exit(1);
    });