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
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  const fontSize = 12;

  // Add title
  if (options?.title) {
    page.drawText(options.title, {
      x: 50,
      y: height - 50,
      size: 18,
      font,
      color: rgb(0, 0, 0),
    });
  }

  // Add headers
  let yPosition = height - 100;
  headers.forEach((header, index) => {
    page.drawText(header, {
      x: 50 + (index * 100),
      y: yPosition,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  });

  // Add data rows (simplified - you can enhance this)
  yPosition -= 20;
  data.slice(0, 20).forEach((row) => {
    Object.values(row).forEach((value: any, index) => {
      page.drawText(String(value).substring(0, 15), {
        x: 50 + (index * 100),
        y: yPosition,
        size: fontSize - 2,
        font,
        color: rgb(0, 0, 0),
      });
    });
    yPosition -= 15;
    if (yPosition < 50) return; // Stop if page is full
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  downloadBlob(blob, filename);
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
