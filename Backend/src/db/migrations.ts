import pool from './index';

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        firm_name TEXT,
        bar_id TEXT,
        specialization TEXT,
        avatar TEXT,
        summary JSONB DEFAULT '{}'
      );
    `);

    // Cases
    await client.query(`
      CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        case_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        client_name TEXT,
        client_image TEXT,
        category TEXT,
        court TEXT,
        next_hearing TEXT,
        status TEXT,
        status_color TEXT,
        lawyer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        total_fixed_amount NUMERIC(10, 2)
      );
    `);

    // Documents
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT,
        size BIGINT,
        case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Payments
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        amount NUMERIC(10, 2) NOT NULL,
        status TEXT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        description TEXT,
        case_id TEXT REFERENCES cases(id) ON DELETE CASCADE
      );
    `);

    // Notes
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Hearings
    await client.query(`
      CREATE TABLE IF NOT EXISTS hearings (
        id TEXT PRIMARY KEY,
        case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
        date TEXT,
        purpose TEXT,
        status TEXT,
        document_ids TEXT[] DEFAULT '{}'
      );
    `);

    await client.query('COMMIT');
    console.log('Tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tables', error);
  } finally {
    client.release();
  }
};

const seedData = async () => {
  const client = await pool.connect();
  try {
    // Only seed if users table is empty
    const res = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(res.rows[0].count) > 0) {
      console.log('Database already seeded');
      return;
    }

    await client.query('BEGIN');

    // Seed Users
    await client.query(`
            INSERT INTO users (id, name, email, firm_name, bar_id, specialization, avatar, summary)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
      'u1',
      'Anubhav Bhatt',
      'anubhav@legal-iq.com',
      'Bhatt & Associates',
      'D-1234/2015',
      'Corporate & Civil Law',
      'https://i.pravatar.cc/150?u=lawyer1',
      JSON.stringify({ totalCases: 45, activeClients: 12, pendingTasks: 8 })
    ]);

    // Seed Cases
    const cases = [
      ['1', 'CIV-2024-001', 'Boundary Dispute: Sharma vs. Municipal Corp', 'Rakesh Sharma', 'https://i.pravatar.cc/150?u=a042581f4e29026024d', 'Civil', 'High Court, Delhi', '15 Feb, 2026', 'Evidence', '#3B82F6', 'u1'],
      ['2', 'CRI-2025-089', 'State vs. Malhotra (302 IPC)', 'Vivek Malhotra', 'https://i.pravatar.cc/150?u=a042581f4e29026704d', 'Criminal', 'Trial Court, Rohini', '20 Feb, 2026', 'Cross-Examination', '#EF4444', 'u1'],
      ['3', 'CIV-2025-012', 'Recovery Suite: Zenith vs. Axis Bank', 'Sunil Gupta (Zenith Ltd)', 'https://i.pravatar.cc/150?u=a042581f4e29026704e', 'Civil', 'District Court, Noida', '02 Mar, 2026', 'Arguments', '#3B82F6', 'u1'],
      ['4', 'CRI-2026-003', 'NCB vs. Sameer Khan (NDPS Act)', 'Sameer Khan', 'https://i.pravatar.cc/150?u=a042581f4e29026704f', 'Criminal', 'High Court, Mumbai', '25 Feb, 2026', 'Bail Hearing', '#EF4444', 'u1'],
      ['5', 'CIV-2026-112', 'Lease Dispute: DLF Mall vs. Retailers', 'Ajay Verma', 'https://i.pravatar.cc/150?u=a042581f4e29026704a', 'Civil', 'District Court, Saket', '10 Mar, 2026', 'Mediation', '#3B82F6', 'u1']
    ];

    for (const c of cases) {
      await client.query(`
                INSERT INTO cases (id, case_id, title, client_name, client_image, category, court, next_hearing, status, status_color, lawyer_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, c);
    }

    // Seed Hearings
    const hearings = [
      ['h1', '1', '10 Jan, 2026', 'Initial Appearance', 'Past', '{"d2"}'],
      ['h2', '1', '25 Jan, 2026', 'Filing of Written Statement', 'Past', '{"d1"}'],
      ['h3', '1', '15 Feb, 2026', 'Evidence Submission', 'Upcoming', '{}'],
      ['h4', '2', '05 Feb, 2026', 'Bail Argument', 'Past', '{}']
    ];

    for (const h of hearings) {
      await client.query(`
                INSERT INTO hearings (id, case_id, date, purpose, status, document_ids)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, h);
    }

    // Seed Documents (minimal)
    const docs = [
      ['d1', 'written_statement.pdf', 'Written Statement - Sharma.pdf', 'application/pdf', 358400, '1', '2026-01-24 10:00:00'],
      ['d2', 'site_map.jpg', 'Disputed Site Map.jpg', 'image/jpeg', 870400, '1', '2026-01-10 11:30:00']
    ];

    for (const d of docs) {
      await client.query(`
                INSERT INTO documents (id, filename, original_name, mime_type, size, case_id, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, d);
    }

    await client.query('COMMIT');
    console.log('Seed data inserted successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding data', error);
  } finally {
    client.release();
  }
};

const runMigrations = async () => {
  await createTables();
  await seedData();
  process.exit();
};

runMigrations();
