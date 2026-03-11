import { processDocument } from '../../AI/engine/ingestion';
import pool from './db';

const ingestLocalPdf = async () => {
    try {
        console.log('Ingesting global law PDF...');
        
        // Ensure "global_laws" case exists or temporarily bypass
        await pool.query(`INSERT INTO cases (id, case_id, title, client_name) VALUES ('global_laws', 'GLOBAL-000', 'Global Law Context', 'System') ON CONFLICT DO NOTHING;`);
        await pool.query(`INSERT INTO documents (id, case_id, filename, original_name) VALUES ('pdf_law_doc', 'global_laws', 'pdf law.pdf', 'pdf law.pdf') ON CONFLICT DO NOTHING;`);

        await processDocument('../../AI/Data/pdf law.pdf', 'global_laws', 'pdf_law_doc');
        console.log('Global laws indexed successfully.');
    } catch (err) {
        console.error('Ingestion failed', err);
    } finally {
        process.exit();
    }
};

ingestLocalPdf();
