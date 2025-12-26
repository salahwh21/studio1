/**
 * Export utilities with lazy loading for better performance
 */

// Lazy load heavy libraries only when needed
export async function exportToCSV(data: any[], filename: string) {
  const Papa = await import('papaparse');
  const csvData = Papa.unparse(data);
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvData], {
    type: 'text/csv;charset=utf-8;'
  });
  downloadBlob(blob, filename);
}

export async function exportToExcel(data: any[], filename: string, sheetName = 'Sheet1') {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Add headers from first data object keys
  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map(key => ({
      header: key,
      key: key,
      width: 15
    }));

    // Add rows
    data.forEach(row => worksheet.addRow(row));
  }

  // Generate buffer and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, filename);
}

export async function exportToPDF(
  data: any[],
  headers: string[],
  filename: string,
  options?: {
    title?: string;
    orientation?: 'portrait' | 'landscape';
  }
) {
  const { generatePdf, downloadPdf } = await import('@/services/pdf-service');
  
  const orientation = options?.orientation || 'portrait';
  const pageWidth = orientation === 'portrait' ? '210mm' : '297mm';
  const pageHeight = orientation === 'portrait' ? '297mm' : '210mm';
  
  // Build HTML table
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: ${pageWidth} ${pageHeight}; margin: 15mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, Tahoma, sans-serif; padding: 10mm; background: white; }
        h1 { font-size: 18px; margin-bottom: 15px; text-align: center; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #f3f4f6; padding: 8px; border: 1px solid #d1d5db; text-align: center; font-weight: bold; }
        td { padding: 6px 8px; border: 1px solid #d1d5db; text-align: right; }
        tr:nth-child(even) { background: #fafafa; }
      </style>
    </head>
    <body>
      ${options?.title ? `<h1>${options.title}</h1>` : ''}
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${data.map(row => `<tr>${Object.values(row).map(v => `<td>${String(v || '')}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
  
  const blob = await generatePdf(html, {
    width: pageWidth,
    height: pageHeight,
    filename: filename.replace('.pdf', ''),
  });
  
  downloadPdf(blob, filename);
}

// Helper function to download blob
function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// Parse CSV file
export async function parseCSV(file: File): Promise<any[]> {
  const Papa = await import('papaparse');

  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
}

// Parse Excel file
export async function parseExcel(file: File): Promise<any[]> {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();

  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const jsonData: any[] = [];
  const headers: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      // First row is headers
      row.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = String(cell.value || '');
      });
    } else {
      // Data rows
      const rowData: any = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1] || `col${colNumber}`;
        rowData[header] = cell.value;
      });
      jsonData.push(rowData);
    }
  });

  return jsonData;
}
