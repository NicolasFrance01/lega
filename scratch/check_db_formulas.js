const { Pool } = require('pg');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = env.match(/DATABASE_URL=(.*)/);
const pool = new Pool({ connectionString: dbUrlMatch[1].trim() });

async function check() {
  const res = await pool.query("SELECT row_index, row_data FROM prestaciones_data WHERE sheet_name = 'Delgado' AND row_data::text LIKE '%=%' LIMIT 10");
  res.rows.forEach(row => {
    console.log(`Index ${row.row_index}: ${JSON.stringify(row.row_data)}`);
  });
  await pool.end();
}
check();
