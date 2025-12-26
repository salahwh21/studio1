import { generatePdf, downloadPdf } from '@/services/pdf-service';

export interface PDFExportOptions {
    title: string;
    subtitle?: string;
    logoUrl?: string | null;
    companyName?: string;
    date?: string;
    tableHeaders: string[];
    tableRows: string[][];
    footerRow?: string[];
    showSignatures?: boolean;
    signatureLabels?: [string, string];
    includeFields?: string[]; // Fields to include in export
    notes?: string; // Optional notes field
    showNotes?: boolean; // Whether to show notes
    orientation?: 'portrait' | 'landscape'; // Page orientation
}

export const generatePDFHTML = (options: PDFExportOptions): string => {
    const {
        title,
        subtitle,
        logoUrl,
        companyName = 'الشركة',
        date,
        tableHeaders,
        tableRows,
        footerRow,
        showSignatures = true,
        signatureLabels = ['توقيع المستلم', 'توقيع الموظف المالي'],
        notes,
        showNotes = false,
        orientation = 'portrait'
    } = options;

    const pageWidth = orientation === 'portrait' ? '210mm' : '297mm';
    const pageHeight = orientation === 'portrait' ? '297mm' : '210mm';

    return `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <style>
                @page { 
                    size: ${pageWidth} ${pageHeight}; 
                    margin: 15mm; 
                }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html, body {
                    direction: rtl;
                    font-family: Arial, Tahoma, sans-serif;
                    background: white;
                    color: #000000;
                    font-size: 12px;
                    line-height: 1.4;
                }
                .pdf-container {
                    padding: 10mm;
                }
                .pdf-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #333;
                }
                .pdf-header img {
                    height: 60px;
                    max-width: 150px;
                    object-fit: contain;
                }
                .pdf-header-info {
                    text-align: right;
                    flex: 1;
                }
                .pdf-header-info h1 {
                    font-size: 20px;
                    font-weight: bold;
                    color: #000000;
                    margin-bottom: 8px;
                }
                .pdf-header-info h2 {
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                    margin-bottom: 6px;
                }
                .pdf-header-info p {
                    font-size: 12px;
                    color: #6b7280;
                    margin: 3px 0;
                }
                .pdf-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    font-size: 11px;
                }
                .pdf-table thead {
                    background: #f3f4f6;
                }
                .pdf-table th {
                    padding: 10px 8px;
                    border: 1px solid #d1d5db;
                    text-align: center;
                    font-weight: bold;
                    font-size: 11px;
                    background: #f3f4f6;
                    color: #000000;
                }
                .pdf-table td {
                    padding: 8px;
                    border: 1px solid #d1d5db;
                    font-size: 11px;
                    text-align: right;
                    color: #000000;
                }
                .pdf-table tbody tr:nth-child(even) {
                    background-color: #fafafa;
                }
                .pdf-table tfoot {
                    background: #e5e7eb;
                    font-weight: bold;
                }
                .pdf-table tfoot td {
                    padding: 10px 8px;
                    border: 1px solid #d1d5db;
                    font-size: 12px;
                    background: #e5e7eb;
                    color: #000000;
                }
                .pdf-notes {
                    margin-top: 30px;
                    padding: 15px;
                    background: #f9fafb;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                }
                .pdf-notes h3 {
                    font-size: 14px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #000000;
                }
                .pdf-notes p {
                    font-size: 12px;
                    line-height: 1.6;
                    color: #374151;
                }
                .pdf-signatures {
                    margin-top: 60px;
                    display: flex;
                    justify-content: space-between;
                    padding-top: 20px;
                }
                .pdf-signature {
                    width: 200px;
                    text-align: center;
                    padding-top: 40px;
                    border-top: 1px solid #000000;
                    font-size: 12px;
                    font-weight: 500;
                    color: #000000;
                }
            </style>
        </head>
        <body>
            <div class="pdf-container">
                <div class="pdf-header">
                    ${logoUrl ? `<img src="${logoUrl}" alt="Logo" />` : `<div style="font-size: 24px; color: #000000; font-weight: bold;">${companyName}</div>`}
                    <div class="pdf-header-info">
                        <h1>${title}</h1>
                        ${subtitle ? `<h2>${subtitle}</h2>` : ''}
                        ${date ? `<p>التاريخ: ${date}</p>` : ''}
                    </div>
                </div>
                <table class="pdf-table">
                    <thead>
                        <tr>
                            ${tableHeaders.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
                    </tbody>
                    ${footerRow ? `
                        <tfoot>
                            <tr>
                                ${footerRow.map(cell => `<td>${cell}</td>`).join('')}
                            </tr>
                        </tfoot>
                    ` : ''}
                </table>
                ${showNotes && notes ? `
                    <div class="pdf-notes">
                        <h3>ملاحظات:</h3>
                        <p>${notes}</p>
                    </div>
                ` : ''}
                ${showSignatures ? `
                    <div class="pdf-signatures">
                        <div class="pdf-signature">${signatureLabels[0]}</div>
                        <div class="pdf-signature">${signatureLabels[1]}</div>
                    </div>
                ` : ''}
            </div>
        </body>
        </html>
    `;
};

export const exportToPDF = async (
    options: PDFExportOptions,
    fileName: string
): Promise<void> => {
    const orientation = options.orientation || 'portrait';
    const htmlContent = generatePDFHTML(options);
    
    console.log('[PDF Export] Generated HTML length:', htmlContent.length);
    console.log('[PDF Export] Options:', { orientation, fileName });
    
    try {
        // Use Puppeteer backend for PDF generation
        const blob = await generatePdf(htmlContent, {
            width: orientation === 'portrait' ? '210mm' : '297mm',
            height: orientation === 'portrait' ? '297mm' : '210mm',
            filename: fileName.replace('.pdf', ''),
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });
        
        console.log('[PDF Export] Blob received, size:', blob.size);
        downloadPdf(blob, fileName);
    } catch (error) {
        console.error('[PDF Export] Error:', error);
        throw error;
    }
};
