const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_xmwSld39Oiac@ep-orange-sound-a421m5w3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function fix() {
  try {
    console.log("Checking unique constraints on patients...");
    const constraints = await pool.query("SELECT conname FROM pg_constraint WHERE conrelid = 'patients'::regclass AND contype = 'u'");
    console.table(constraints.rows);

    // Identify the bad record
    const badPatient = await pool.query("SELECT id, name, dni FROM patients WHERE dni = '.'");
    console.log("Afected record (DNI '.'):", badPatient.rows);

    if (badPatient.rows.length > 0) {
        const pId = badPatient.rows[0].id;
        
        // Find all appointments for this pId
        const appts = await pool.query("SELECT id, appointment_date, analysis_type, observations, evolution_notes FROM appointments WHERE patient_id = $1", [pId]);
        console.log("Appointments linked to this record:");
        console.table(appts.rows);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
fix();
