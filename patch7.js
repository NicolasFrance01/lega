const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'PrestacionesDashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add handleHeaderColorChange
const submitPoint = 'const handleTableStructureSubmit = async';
const newHandler = `
  const handleHeaderColorChange = async (headerId: number, colKey: string, color: string) => {
    const headerRow = data.find(r => r.id === headerId);
    if (!headerRow) return;
    const newRowData = { ...headerRow.row_data };
    if (color === "#ffffff") {
      delete newRowData[\`__cell_color_\${colKey}\`];
    } else {
      newRowData[\`__cell_color_\${colKey}\`] = color;
    }
    
    const newData = [...data];
    const idx = newData.findIndex(r => r.id === headerId);
    newData[idx] = { ...newData[idx], row_data: newRowData };
    setData(newData);
    
    await updatePrestacion(headerId, newRowData);
  };

  const handleTableStructureSubmit = async`;
content = content.replace(submitPoint, newHandler);

// 2. Replace hardcoded Panel BioM checks with isExcelSheet where appropriate
const isStructuredPoint = 'const isStructuredSheet = useMemo(() => {';
const isExcelSheetDecl = `
  const isExcelSheet = activeSheet === "Panel BioM. Int.Panel" || activeSheet === "O. Sociales";

  const isStructuredSheet = useMemo(() => {`;
content = content.replace(isStructuredPoint, isExcelSheetDecl);

// Replace string matches
content = content.replace(/activeSheet === "Panel BioM\. Int\.Panel"/g, "isExcelSheet");
content = content.replace(/activeSheet !== "Panel BioM\. Int\.Panel"/g, "!isExcelSheet");

// Fix specific column widths for O. Sociales if needed
content = content.replace(/isExcelSheet \? '200px' : '300px'/g, "isExcelSheet ? (activeSheet === 'O. Sociales' ? '150px' : '200px') : '300px'");

// Fix types hardcoding for O. Sociales
const typesOld = `          if (isExcelSheet) {
             const priceCols = ["__EMPTY_1", "__EMPTY_3", "__EMPTY_4", "__EMPTY_5", "__EMPTY_6", "__EMPTY_7", "__EMPTY_8", "__EMPTY_9", "__EMPTY_10"];
             priceCols.forEach(c => currentSection.types[c] = "price");
             currentSection.rows.push(row);
          }`;
const typesNew = `          if (isExcelSheet) {
             let priceCols: string[] = [];
             if (activeSheet === "Panel BioM. Int.Panel") {
               priceCols = ["__EMPTY_1", "__EMPTY_3", "__EMPTY_4", "__EMPTY_5", "__EMPTY_6", "__EMPTY_7", "__EMPTY_8", "__EMPTY_9", "__EMPTY_10"];
             } else if (activeSheet === "O. Sociales") {
               priceCols = ["__EMPTY_2", "__EMPTY_4", "__EMPTY_6", "__EMPTY_7"];
             }
             priceCols.forEach(c => currentSection.types[c] = "price");
             currentSection.rows.push(row);
          }`;
content = content.replace(typesOld, typesNew);

// 3. Update TH mapping to include background color and color picker
const thOld = `<th key={h} style={{ padding: '1rem', textAlign: isDesc ? 'left' : 'right', color: 'white', fontWeight: 700, border: '1px solid #1e3a8a', fontSize: '0.85rem' }}>
                          {isExcelSheet && <div style={{fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 800}}>{indexToCol(colIdx)}</div>}
                          {section.labels[h] || h}
                        </th>`;

const thNew = `<th key={h} style={{ position: 'relative', padding: '1rem', textAlign: isDesc ? 'left' : 'right', color: 'white', fontWeight: 700, border: '1px solid #1e3a8a', fontSize: '0.85rem', backgroundColor: (data.find(r => r.id === section.structuralIds.header)?.row_data[\`__cell_color_\${h}\`]) || '#244c7d' }}>
                          {isExcelSheet && (
                            <>
                              <div style={{fontSize: '0.7rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 800}}>{indexToCol(colIdx)}</div>
                              <input 
                                type="color" 
                                title="Color de cabecera"
                                value={(data.find(r => r.id === section.structuralIds.header)?.row_data[\`__cell_color_\${h}\`]) || "#ffffff"}
                                onChange={(e) => section.structuralIds.header && handleHeaderColorChange(section.structuralIds.header, h, e.target.value)}
                                style={{ position: 'absolute', top: '4px', right: '4px', width: '12px', height: '12px', padding: 0, border: 'none', borderRadius: '50%', cursor: 'pointer', opacity: 0.3 }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.3'}
                              />
                            </>
                          )}
                          {section.labels[h] || h}
                        </th>`;
content = content.replace(thOld, thNew);

fs.writeFileSync(file, content);
console.log('Update complete.');
