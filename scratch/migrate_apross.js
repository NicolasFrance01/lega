const { Pool } = require('pg');
const fs = require('fs');

async function migrate() {
    const envPath = 'c:/Users/Nicolas France/LEGA/.env.local';
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    let dbUrl = '';
    lines.forEach(line => {
        if (line.includes('DATABASE_URL')) dbUrl = line.split('=')[1].trim();
    });

    const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    
    try {
        console.log('Creating Apross tables...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS apross (
                id SERIAL PRIMARY KEY,
                fecha DATE NOT NULL,
                paciente TEXT NOT NULL,
                dni TEXT,
                telefono TEXT,
                analisis TEXT,
                coseguro NUMERIC,
                particular NUMERIC,
                observaciones TEXT,
                month_group TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS apross_documents (
                id SERIAL PRIMARY KEY,
                apross_id INTEGER REFERENCES apross(id) ON DELETE CASCADE,
                document_url TEXT NOT NULL,
                filename TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Tables created successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
