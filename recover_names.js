const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_xmwSld39Oiac@ep-orange-sound-a421m5w3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
  const res = await pool.query("SELECT action, details, created_at FROM audit_logs WHERE action IN ('CREATE_APPOINTMENT', 'CREATE_INGRESO', 'UPDATE_APPOINTMENT') ORDER BY created_at DESC LIMIT 100");
  res.rows.forEach(row => {
    if (row.details.dni === '.') {
      console.log(`${row.created_at.toISOString()} | ${row.action} | ${row.details.patient_name}`);
    }
  });
  await pool.end();
}
run();
