import { query } from './index';

const setupVectorDb = async () => {
    try {
        console.log('Enabling pgvector extension...');
        await query('CREATE EXTENSION IF NOT EXISTS vector');

        console.log('Creating case_embeddings table...');
        await query(`
            CREATE TABLE IF NOT EXISTS case_embeddings (
                id SERIAL PRIMARY KEY,
                case_id TEXT NOT NULL,
                document_id TEXT,
                content TEXT NOT NULL,
                metadata JSONB,
                embedding vector(768), -- text-embedding-004 uses 768 dimensions
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Creating index for vector search...');
        // HNSW index for faster vector search
        await query(`
            CREATE INDEX IF NOT EXISTS case_embeddings_vector_idx ON case_embeddings 
            USING hnsw (embedding vector_cosine_ops)
        `);

        console.log('Vector database setup successfully!');
    } catch (err) {
        console.error('Error setting up vector DB:', err);
    } finally {
        process.exit(0);
    }
};

setupVectorDb();
