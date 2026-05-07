const { Pool } = require('pg');
const fs = require('fs');

async function migrate() {
  const envPath = 'c:/Users/Nicolas France/LEGA/.env.local';
  const content = fs.readFileSync(envPath, 'utf8');
  let dbUrl = '';
  content.split('\n').forEach(line => {
    if (line.includes('DATABASE_URL')) dbUrl = line.split('=').slice(1).join('=').trim();
  });

  const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS custom_health_insurances (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Table custom_health_insurances created successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
