const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://default:B9Nol6vOcbGk@ep-round-lab-a4w18o7d-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require"
});

async function main() {
  const sheetName = "O. Sociales";

  // Check if exists
  const res = await pool.query("SELECT * FROM prestaciones_data WHERE sheet_name = $1", [sheetName]);

  if (res.rows.length > 0) {
    console.log("Sheet 'O. Sociales' already exists. Skipping migration.");
    return;
  }

  console.log("Migrating 'O. Sociales'...");

  let rowIndex = 0;

  const insert = async (rowData) => {
    await pool.query(
      "INSERT INTO prestaciones_data (sheet_name, row_index, row_data) VALUES ($1, $2, $3)",
      [sheetName, rowIndex++, JSON.stringify(rowData)]
    );
  };

  // Row 0: TITLE
  await insert({ __EMPTY: "ABRIL", meta_part: "TITLE", __row_color: "#dca7be" });

  // Row 1: HEADER
  await insert({ 
    __EMPTY: "OBRA SOCIAL", 
    __EMPTY_1: "ANALISIS", 
    __EMPTY_2: "COSTO DERIVACION", 
    __EMPTY_3: "LUGAR DE DERIVACION",
    __EMPTY_4: "COBICO",
    __EMPTY_5: "NBU",
    __EMPTY_6: "COBERTURA OBRA SOCIAL",
    __EMPTY_7: "",
    meta_part: "HEADER",
    __cell_color___EMPTY: "#dca7be",
    __cell_color___EMPTY_1: "#dca7be",
    __cell_color___EMPTY_2: "#dca7be",
    __cell_color___EMPTY_3: "#dca7be",
    __cell_color___EMPTY_4: "#dca7be",
    __cell_color___EMPTY_5: "#dca7be",
    __cell_color___EMPTY_6: "#dca7be",
    __cell_color___EMPTY_7: "#dca7be"
  });

  // Row 2: DATA (SWISS Calprotectina)
  await insert({
    __EMPTY: "SWISS",
    __EMPTY_1: "Calprotectina",
    __EMPTY_2: 32697.94,
    __EMPTY_3: "MANLAB",
    __EMPTY_4: 140500.00,
    __EMPTY_5: 100,
    __EMPTY_6: 41537.49,
    __EMPTY_7: "=G3-C3",
    meta_part: "DATA"
  });

  // Row 3: DATA (SWISS Elastasa)
  await insert({
    __EMPTY: "",
    __EMPTY_1: "Elastasa",
    __EMPTY_2: 85049.00,
    __EMPTY_3: "CIBIC",
    __EMPTY_4: 168600.00,
    __EMPTY_5: 120,
    __EMPTY_6: 53330.41,
    __EMPTY_7: "=G4-C4",
    meta_part: "DATA"
  });

  // Row 4: DATA (SWISS HLA DQ2-DQ8)
  await insert({
    __EMPTY: "",
    __EMPTY_1: "HLA DQ2-DQ8",
    __EMPTY_2: 85124.00,
    __EMPTY_3: "CIBIC",
    __EMPTY_4: 224800.00,
    __EMPTY_5: 160,
    __EMPTY_6: 47097.23,
    __EMPTY_7: "No sabemos si incluye a los dos o solo uno",
    meta_part: "DATA"
  });

  // Row 5: DATA (GALENO Calprotectina)
  await insert({
    __EMPTY: "GALENO",
    __EMPTY_1: "Calprotectina",
    __EMPTY_2: 32697.94,
    __EMPTY_3: "MANLAB",
    __EMPTY_4: 140500.00,
    __EMPTY_5: 100,
    __EMPTY_6: 68053.21,
    __EMPTY_7: "=G6-C6",
    meta_part: "DATA"
  });

  // Row 6: DATA (GALENO Elastasa)
  await insert({
    __EMPTY: "",
    __EMPTY_1: "Elastasa",
    __EMPTY_2: 85049.00,
    __EMPTY_3: "CIBIC",
    __EMPTY_4: 168600.00,
    __EMPTY_5: 120,
    __EMPTY_6: 111408.30,
    __EMPTY_7: "=G7-C7",
    meta_part: "DATA"
  });

  // Row 7: DATA (GALENO HLA DQ2-DQ8)
  await insert({
    __EMPTY: "",
    __EMPTY_1: "HLA DQ2-DQ8",
    __EMPTY_2: 85124.00,
    __EMPTY_3: "CIBIC",
    __EMPTY_4: 224800.00,
    __EMPTY_5: 160,
    __EMPTY_6: 111408.30,
    __EMPTY_7: "=G8-C8",
    meta_part: "DATA"
  });

  // Row 8: DATA (MEDIFE Calprotectina)
  await insert({
    __EMPTY: "MEDIFE",
    __EMPTY_1: "Calprotectina",
    __EMPTY_2: 32697.94,
    __EMPTY_3: "MANLAB",
    __EMPTY_4: 140500.00,
    __EMPTY_5: 100,
    __EMPTY_6: 0,
    __EMPTY_7: "",
    meta_part: "DATA"
  });

  // Row 9: DATA (MEDIFE Elastasa)
  await insert({
    __EMPTY: "",
    __EMPTY_1: "Elastasa",
    __EMPTY_2: 85049.00,
    __EMPTY_3: "CIBIC",
    __EMPTY_4: 168600.00,
    __EMPTY_5: 120,
    __EMPTY_6: 0,
    __EMPTY_7: "",
    meta_part: "DATA"
  });

  // Row 10: DATA (MEDIFE HLA DQ2-DQ8)
  await insert({
    __EMPTY: "",
    __EMPTY_1: "HLA DQ2-DQ8",
    __EMPTY_2: 85124.00,
    __EMPTY_3: "CIBIC",
    __EMPTY_4: 224800.00,
    __EMPTY_5: 160,
    __EMPTY_6: 0,
    __EMPTY_7: "",
    meta_part: "DATA"
  });

  console.log("Migration 'O. Sociales' completed successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
