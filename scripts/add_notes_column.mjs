import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_xmwSld39Oiac@ep-orange-sound-a421m5w3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require",
});

async function migrate() {
  try {
    await pool.query("ALTER TABLE medical_results ADD COLUMN IF NOT EXISTS notes TEXT;");
    console.log("Migration successful: Added notes column to medical_results");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

migrate();
