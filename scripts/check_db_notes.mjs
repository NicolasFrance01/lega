import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_L5PDKCSB4lhf@ep-gentle-star-an2yqhb2-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function check() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'appointments'
      AND column_name LIKE 'internal_note%';
    `);
    console.log("Columns found:", res.rows);
    
    const count = await pool.query(`SELECT COUNT(*) FROM appointments WHERE internal_note IS NOT NULL`);
    console.log("Appointments with notes:", count.rows[0].count);

  } catch (error) {
    console.error("Error checking DB:", error);
  } finally {
    pool.end();
  }
}

check();
