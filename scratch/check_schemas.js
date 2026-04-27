const { Pool } = require('pg');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = env.match(/DATABASE_URL=(.*)/);
const pool = new Pool({ connectionString: dbUrlMatch[1].trim() });

async function check() {
  const tables = ['patients', 'appointments', 'appointment_documents'];
  for (const t of tables) {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '" + t + "'");
    console.log(t + ':');
    console.table(res.rows);
  }
  await pool.end();
}
check();
