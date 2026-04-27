const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkSchema() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'appointments'
    `);
    console.log("APPOINTMENTS COLUMNS:");
    console.table(res.rows);

    const res2 = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'patients'
    `);
    console.log("PATIENTS COLUMNS:");
    console.table(res2.rows);
  } finally {
    client.release();
    pool.end();
  }
}

checkSchema();
