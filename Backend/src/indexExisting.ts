import fs from 'fs';
import path from 'path';
import { processDocument } from '../../AI/engine/ingestion';
import pool from './db';

const indexExistingCases = async () => {
    try {
        console.log('Starting full re-indexing of existing case documents...');

        // 1. Fetch all documents from database
        const { rows: documents } = await pool.query('SELECT * FROM documents WHERE case_id IS NOT NULL');

        console.log(`Found ${documents.length} documents to process.`);

        for (const doc of documents) {
            const filePath = path.join(__dirname, '../uploads', doc.filename);

            if (fs.existsSync(filePath)) {
                console.log(`Processing: ${doc.original_name} (${doc.id})...`);
                await processDocument(filePath, doc.case_id, doc.id);
            } else {
                console.warn(`File not found: ${filePath}`);
            }
        }

        console.log('Re-indexing completed successfully!');
    } catch (err: any) {
        console.error('Error during re-indexing:', err);
    } finally {
        process.exit(0);
    }
};

indexExistingCases();
