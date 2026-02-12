import { query } from './db';

const updateSchema = async () => {
    try {
        await query('ALTER TABLE documents ADD COLUMN IF NOT EXISTS doc_type TEXT');
        console.log('Schema updated: added doc_type to documents');
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
};

updateSchema();
