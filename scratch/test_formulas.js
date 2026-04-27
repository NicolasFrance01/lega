function colToIndex(colStr) {
  let index = 0;
  for (let i = 0; i < colStr.length; i++) {
    index = index * 26 + (colStr.charCodeAt(i) - 64);
  }
  return index - 1;
}

function indexToCol(index) {
  let colStr = '';
  let n = index + 1;
  while (n > 0) {
    let r = (n - 1) % 26;
    colStr = String.fromCharCode(65 + r) + colStr;
    n = Math.floor((n - 1) / 26);
  }
  return colStr;
}

function parseNumberValue(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  let s = String(val).trim();
  if (s === '') return 0;
  let isPercent = false;
  if (s.endsWith('%')) { isPercent = true; s = s.slice(0, -1).trim(); }
  s = s.replace(/\$/g, '').trim();
  if (/^-?\d+(\.\d+)?$/.test(s)) {
     const n = parseFloat(s);
     return isPercent ? n / 100 : n;
  }
  s = s.replace(/\./g, '').replace(/,/g, '.');
  const num = parseFloat(s);
  if (isNaN(num)) return 0;
  return isPercent ? num / 100 : num;
}

function evaluateFormula(formula, getCellValue) {
  if (!formula || typeof formula !== 'string' || !formula.startsWith('=')) return formula;
  try {
    let expression = formula.substring(1).toUpperCase();
    expression = expression.replace(/(\d),(\d)/g, '$1.$2');
    expression = expression.replace(/\$/g, '');
    expression = expression.replace(/(SUMA|SUM)\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)/g, (match, fn, startColStr, startRowStr, endColStr, endRowStr) => {
      const startCol = colToIndex(startColStr);
      const startRow = parseInt(startRowStr, 10);
      const endCol = colToIndex(endColStr);
      const endRow = parseInt(endRowStr, 10);
      const cells = [];
      for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
        for (let c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c++) {
          cells.push(`${indexToCol(c)}${r}`);
        }
      }
      return `(${cells.join('+')})`;
    });
    expression = expression.replace(/(SUMA|SUM)\(([^)]+)\)/g, '($2)');
    expression = expression.replace(/[A-Z]+\d+/g, (match) => {
      const colStr = match.match(/[A-Z]+/)[0];
      const rowStr = match.match(/\d+/)[0];
      const colIdx = colToIndex(colStr);
      const rowIdx = parseInt(rowStr, 10) - 1;
      const val = getCellValue(colIdx, rowIdx);
      if (val === null || isNaN(val)) return "0";
      return val < 0 ? `(${val})` : String(val);
    });
    if (!/^[0-9.+\-*/() ]+$/.test(expression)) return "#ERROR";
    const result = new Function(`return ${expression}`)();
    if (!isFinite(result)) return "#DIV/0!";
    return result;
  } catch (error) { return "#ERROR"; }
}

const columns = ["__EMPTY", "__EMPTY_1", "__EMPTY_2", "__EMPTY_3", "__EMPTY_4", "__EMPTY_5", "__EMPTY_6", "__EMPTY_7", "__EMPTY_8", "__EMPTY_9"];
const rows = [
    { row_data: { __EMPTY: "TITLE", __EMPTY_7: "0.3", __EMPTY_8: "0.3" } }, // Row 1
    { row_data: { __EMPTY: "", __EMPTY_7: "0.3", __EMPTY_8: "0.3" } }, // Row 2
    { row_data: { __EMPTY: "Subtitle", __EMPTY_5: "0.01", __EMPTY_7: "0.25", __EMPTY_8: "0.2" } }, // Row 3
    { row_data: { __EMPTY: "Prestaciones", __EMPTY_1: "Derivación" } }, // Row 4 (Header)
    { row_data: { __EMPTY: "ESTUDIO", __EMPTY_1: "297460", __EMPTY_2: "CIBIC", __EMPTY_3: "20000", __EMPTY_4: "0", __EMPTY_5: "2974.6" } }, // Row 5
];

const getCellValue = (c, r) => {
    const row = rows[r];
    if (!row) return 0;
    const key = columns[c];
    return parseNumberValue(row.row_data[key]);
};

console.log("Formula 1 (=B5*$F$3):", evaluateFormula("=B5*$F$3", getCellValue));
console.log("Formula 2 (=+SUM(B5:F5)*(1+$H$2)):", evaluateFormula("=+SUM(B5:F5)*(1+$H$2)", getCellValue));
