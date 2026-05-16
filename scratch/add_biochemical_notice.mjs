
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_xmwSld39Oiac@ep-orange-sound-a421m5w3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require",
});

async function addColumn() {
  try {
    await pool.query("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS biochemical_notice TEXT DEFAULT ''");
    console.log("Column biochemical_notice added successfully");
  } catch (err) {
    console.error("Error adding column:", err);
  } finally {
    await pool.end();
  }
}

addColumn();
