const { Pool } = require('pg');
const XLSX = require('xlsx');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = env.match(/DATABASE_URL=(.*)/);
const DATABASE_URL = dbUrlMatch[1].trim();

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const workbook = XLSX.readFile('./public/Listado de Prestaciones OK.xlsx');
    const sheetName = 'Cotizador';
    const sheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`Migrando '${sheetName}'...`);
    await pool.query("DELETE FROM prestaciones_data WHERE sheet_name = $1", [sheetName]);
    
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowData = {};
        
        let metaPart = "DATA";
        const firstCell = String(row?.[0] || "").trim();
        if (i === 0) metaPart = "TITLE";
        else if (firstCell.includes("Valores actualizados")) metaPart = "SUBTITLE";
        else if (firstCell === "Prestaciones" || firstCell === "Nombre" || (row && row.includes("Prestaciones "))) metaPart = "HEADER";
        else if (firstCell.includes("NOTA:")) metaPart = "NOTE";
        
        rowData["meta_part"] = metaPart;

        const maxCols = 13; 
        for (let j = 0; j < maxCols; j++) {
            const colKey = j === 0 ? "__EMPTY" : `__EMPTY_${j}`;
            const cellAddress = XLSX.utils.encode_cell({ r: i, c: j });
            const cell = sheet[cellAddress];
            
            if (cell) {
                if (cell.f) {
                    rowData[colKey] = "=" + cell.f;
                } else {
                    rowData[colKey] = cell.v === null || cell.v === undefined ? "" : cell.v;
                }
            } else {
                rowData[colKey] = "";
            }
        }
        
        // Estética
        if (metaPart === "TITLE") rowData["__row_color"] = "#e2f2e2"; // Verde suave
        if (metaPart === "HEADER") {
           Object.keys(rowData).forEach(k => {
               if (k.startsWith("__EMPTY")) rowData[`__cell_color_${k}`] = "#e2f2e2";
           });
        }

        await pool.query(
            "INSERT INTO prestaciones_data (sheet_name, row_index, row_data) VALUES ($1, $2, $3)",
            [sheetName, i, JSON.stringify(rowData)]
        );
        
        if (i % 200 === 0) console.log(i);
    }
    
    console.log(`Migración '${sheetName}' completada.`);
    await pool.end();
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
