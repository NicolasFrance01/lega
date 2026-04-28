import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_xmwSld39Oiac@ep-orange-sound-a421m5w3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function update() {
  try {
    await pool.query(`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS internal_note TEXT,
      ADD COLUMN IF NOT EXISTS internal_note_status VARCHAR(50) DEFAULT 'none';
    `);
    console.log("Database updated successfully with internal_note columns on the CORRECT DB (Orange Sound).");
  } catch (error) {
    console.error("Error updating DB:", error);
  } finally {
    pool.end();
  }
}

update();
