const fs = require('fs');
let dbUrl = '';
if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf8');
  const match = content.match(/DATABASE_URL=["']?([^"'\n]+)/);
  if (match) dbUrl = match[1];
}
const { Pool } = require('pg');
const pool = new Pool({ connectionString: dbUrl });
async function main() {
  const res = await pool.query('SELECT DISTINCT sheet_name FROM prestaciones_data');
  console.log(res.rows);
}
main().catch(console.error).finally(() => pool.end());
