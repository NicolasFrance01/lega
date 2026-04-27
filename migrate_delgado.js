const { Pool } = require('pg');
const XLSX = require('xlsx');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = env.match(/DATABASE_URL=(.*)/);
const databaseUrl = dbUrlMatch ? dbUrlMatch[1].trim() : null;

const pool = new Pool({
  connectionString: databaseUrl
});

async function main() {
  const sheetName = "Delgado";

  // Check if exists
  const res = await pool.query("SELECT * FROM prestaciones_data WHERE sheet_name = $1", [sheetName]);

  if (res.rows.length > 0) {
    console.log("Sheet 'Delgado' already exists. Deleting old data for re-migration...");
    await pool.query("DELETE FROM prestaciones_data WHERE sheet_name = $1", [sheetName]);
  }

  console.log("Migrating 'Delgado'...");

  const workbook = XLSX.readFile('./public/Listado de Prestaciones OK.xlsx');
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.error("Sheet 'Delgado' not found in Excel file.");
    return;
  }

  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  // Row 4 (index 3) is the header according to user
  const excelHeader = data[3] || [];
  console.log("Detected Header:", excelHeader);

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowData = {};
    
    if (i === 0) {
      rowData.__EMPTY = "DELGADO";
      rowData.meta_part = "TITLE";
      rowData.__row_color = "#a7c7dc";
    } else if (i === 3) { // Header row
      rowData.meta_part = "HEADER";
      excelHeader.forEach((label, j) => {
        const key = j === 0 ? "__EMPTY" : `__EMPTY_${j}`;
        rowData[key] = label || "";
        rowData[`__cell_color_${key}`] = "#a7c7dc";
      });
    } else if (i > 3) { // Data rows
      if (!row || row.length === 0 || (!row[0] && !row[1])) {
        // Empty row but keep index
      } else {
        rowData.meta_part = "DATA";
        for (let j = 0; j < excelHeader.length; j++) {
          const key = j === 0 ? "__EMPTY" : `__EMPTY_${j}`;
          const cellAddress = XLSX.utils.encode_cell({ r: i, c: j });
          const cell = sheet[cellAddress];
          let val = "";
          if (cell) {
            if (cell.f) {
              val = "=" + cell.f;
            } else {
              val = cell.v === null || cell.v === undefined ? "" : cell.v;
            }
          }
          rowData[key] = val;
        }
      }
    } else {
       // Rows 1, 2 (empty or other info)
       if (row) {
         row.forEach((val, j) => {
           const key = j === 0 ? "__EMPTY" : `__EMPTY_${j}`;
           rowData[key] = val;
         });
       }
    }

    await pool.query(
      "INSERT INTO prestaciones_data (sheet_name, row_index, row_data) VALUES ($1, $2, $3)",
      [sheetName, i, JSON.stringify(rowData)]
    );
  }

  console.log(`Migration 'Delgado' completed. ${data.length} rows inserted.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
