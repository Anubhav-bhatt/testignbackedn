import { query } from './index';

const checkDb = async () => {
    try {
        const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', tables.rows.map((r: any) => r.table_name));

        const extensions = await query("SELECT extname FROM pg_extension");
        console.log('Extensions:', extensions.rows.map((r: any) => r.extname));
    } catch (err) {
        console.error('Error checking DB:', err);
    } finally {
        process.exit(0);
    }
};

checkDb();
