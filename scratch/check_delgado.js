const XLSX = require('xlsx');
const workbook = XLSX.readFile('./public/Listado de Prestaciones OK.xlsx');
console.log('Sheets:', workbook.SheetNames);
if (workbook.SheetNames.includes('Delgado')) {
    const sheet = workbook.Sheets['Delgado'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log('Delgado Row 4:', data[3]); // Row 4 is index 3
    console.log('Delgado Data Sample:', data.slice(0, 10));
}
