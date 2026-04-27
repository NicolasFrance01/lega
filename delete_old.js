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
  await pool.query("DELETE FROM prestaciones_data WHERE sheet_name = 'O. SOCIALES '");
  console.log('Deleted O. SOCIALES (old format)');
}
main().catch(console.error).finally(() => pool.end());
