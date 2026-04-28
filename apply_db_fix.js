const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_xmwSld39Oiac@ep-orange-sound-a421m5w3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function applyFix() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log("1. Eliminando restriccion UNIQUE de DNI...");
    await client.query("ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_dni_key");
    await client.query("ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_dni_unique");

    console.log("2. Creando registros de pacientes separados para restaurar identidades...");
    
    // Create Patricia Torres
    const patricia = await client.query(
        "INSERT INTO patients (name, dni) VALUES ('Patricia Torres', '.') RETURNING id"
    );
    const patriciaId = patricia.rows[0].id;

    // Create María Belen Ymze
    const maria = await client.query(
        "INSERT INTO patients (name, dni) VALUES ('María Belen Ymze', '.') RETURNING id"
    );
    const mariaId = maria.rows[0].id;

    console.log("3. Vinculando turnos a los pacientes originales...");
    
    // Apr 30 -> Patricia Torres (based on log order and typical usage)
    await client.query(
        "UPDATE appointments SET patient_id = $1 WHERE id = '033bf6b0-f31c-4e33-b5dd-550aed6cb5a6'",
        [patriciaId]
    );

    // Apr 28 (Today) -> María Belen Ymze
    await client.query(
        "UPDATE appointments SET patient_id = $1 WHERE id = 'b81b0686-5096-4eb4-8e61-9d518ac5a261'",
        [mariaId]
    );

    console.log("4. Corrigiendo nombre de JOSE GROSO en el registro restante...");
    await client.query(
        "UPDATE patients SET name = 'JOSE GROSO' WHERE id = 'ce53cfbc-2cee-46b2-91c5-370b852c607a'"
    );

    await client.query('COMMIT');
    console.log("¡REPARACIÓN EXITOSA!");

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error en la reparacion:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

applyFix();
