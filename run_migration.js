const fs = require('fs');
let dbUrl = '';
if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf8');
  const match = content.match(/DATABASE_URL=["']?([^"'\n]+)/);
  if (match) dbUrl = match[1];
}
if (!dbUrl && fs.existsSync('.env')) {
  const content = fs.readFileSync('.env', 'utf8');
  const match = content.match(/DATABASE_URL=["']?([^"'\n]+)/);
  if (match) dbUrl = match[1];
}

const { Pool } = require('pg');
const pool = new Pool({ connectionString: dbUrl });

async function main() {
  const sheetName = 'O. Sociales';
  const res = await pool.query("SELECT * FROM prestaciones_data WHERE sheet_name = $1", [sheetName]);
  if (res.rows.length > 0) {
    console.log("Sheet 'O. Sociales' already exists.");
    return;
  }
  
  console.log("Migrating...");
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

  // Data rows
  await insert({ __EMPTY: "SWISS", __EMPTY_1: "Calprotectina", __EMPTY_2: 32697.94, __EMPTY_3: "MANLAB", __EMPTY_4: 140500.00, __EMPTY_5: 100, __EMPTY_6: 41537.49, __EMPTY_7: "=G3-C3", meta_part: "DATA" });
  await insert({ __EMPTY: "", __EMPTY_1: "Elastasa", __EMPTY_2: 85049.00, __EMPTY_3: "CIBIC", __EMPTY_4: 168600.00, __EMPTY_5: 120, __EMPTY_6: 53330.41, __EMPTY_7: "=G4-C4", meta_part: "DATA" });
  await insert({ __EMPTY: "", __EMPTY_1: "HLA DQ2-DQ8", __EMPTY_2: 85124.00, __EMPTY_3: "CIBIC", __EMPTY_4: 224800.00, __EMPTY_5: 160, __EMPTY_6: 47097.23, __EMPTY_7: "No sabemos si incluye a los dos o solo uno", meta_part: "DATA" });

  await insert({ __EMPTY: "GALENO", __EMPTY_1: "Calprotectina", __EMPTY_2: 32697.94, __EMPTY_3: "MANLAB", __EMPTY_4: 140500.00, __EMPTY_5: 100, __EMPTY_6: 68053.21, __EMPTY_7: "=G6-C6", meta_part: "DATA" });
  await insert({ __EMPTY: "", __EMPTY_1: "Elastasa", __EMPTY_2: 85049.00, __EMPTY_3: "CIBIC", __EMPTY_4: 168600.00, __EMPTY_5: 120, __EMPTY_6: 111408.30, __EMPTY_7: "=G7-C7", meta_part: "DATA" });
  await insert({ __EMPTY: "", __EMPTY_1: "HLA DQ2-DQ8", __EMPTY_2: 85124.00, __EMPTY_3: "CIBIC", __EMPTY_4: 224800.00, __EMPTY_5: 160, __EMPTY_6: 111408.30, __EMPTY_7: "=G8-C8", meta_part: "DATA" });

  await insert({ __EMPTY: "MEDIFE", __EMPTY_1: "Calprotectina", __EMPTY_2: 32697.94, __EMPTY_3: "MANLAB", __EMPTY_4: 140500.00, __EMPTY_5: 100, __EMPTY_6: 0, __EMPTY_7: "", meta_part: "DATA" });
  await insert({ __EMPTY: "", __EMPTY_1: "Elastasa", __EMPTY_2: 85049.00, __EMPTY_3: "CIBIC", __EMPTY_4: 168600.00, __EMPTY_5: 120, __EMPTY_6: 0, __EMPTY_7: "", meta_part: "DATA" });
  await insert({ __EMPTY: "", __EMPTY_1: "HLA DQ2-DQ8", __EMPTY_2: 85124.00, __EMPTY_3: "CIBIC", __EMPTY_4: 224800.00, __EMPTY_5: 160, __EMPTY_6: 0, __EMPTY_7: "", meta_part: "DATA" });

  console.log("Migration finished.");
}
main().catch(console.error).finally(() => pool.end());
