import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

// Load .env from Backend folder as it's the source of truth for config
dotenv.config({ path: path.resolve(__dirname, '../../Backend/.env') });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'legaliq_db',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;
