const { Pool } = require('pg');
const fs = require('fs');

async function migrate() {
    const envPath = 'c:/Users/Nicolas France/LEGA/.env.local';
    const content = fs.readFileSync(envPath, 'utf8');
    let dbUrl = '';
    content.split('\n').forEach(line => {
        if (line.startsWith('DATABASE_URL')) dbUrl = line.split('=').slice(1).join('=').trim();
    });

    const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

    try {
        console.log('Creating facturacion_os tables...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS facturacion_os (
                id SERIAL PRIMARY KEY,
                obra_social TEXT NOT NULL,
                fecha DATE NOT NULL,
                nro_factura TEXT,
                detalle TEXT,
                seguimiento TEXT DEFAULT 'Falta Pagos',
                month_group TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS facturacion_os_documents (
                id SERIAL PRIMARY KEY,
                facturacion_id INTEGER REFERENCES facturacion_os(id) ON DELETE CASCADE,
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
