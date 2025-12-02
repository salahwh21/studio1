import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

    return `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <style>
                @page { margin: 0; }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html, body {
                    direction: rtl;
                    font-family: 'Segoe UI', 'Tahoma', 'Arial Unicode MS', 'Arial', 'DejaVu Sans', sans-serif;
                    padding: 20px;
                    background: white;
                    color: #000000;
                    unicode-bidi: embed;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                * {
                    font-family: 'Segoe UI', 'Tahoma', 'Arial Unicode MS', 'Arial', 'DejaVu Sans', sans-serif !important;
                }
                .pdf-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #d1d5db;
                }
                .pdf-header img {
                    height: 50px;
                    max-width: 150px;
                    object-fit: contain;
                }
                .pdf-header-info {
                    text-align: right;
                    flex: 1;
                }
                .pdf-header-info h1 {
                    font-size: 18px;
                    font-weight: bold;
                    color: #000000;
                    margin-bottom: 6px;
                    line-height: 1.4;
                }
                .pdf-header-info h2 {
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                    margin-bottom: 4px;
                }
                .pdf-header-info p {
                    font-size: 12px;
                    color: #6b7280;
                    margin: 2px 0;
                    font-weight: 400;
                }
                .pdf-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                    font-size: 12px;
                }
                .pdf-table thead {
                    background: #f9fafb;
                }
                .pdf-table th {
                    padding: 8px 6px;
                    border: 1px solid #d1d5db;
                    text-align: center;
                    font-weight: bold;
                    font-size: 12px;
                    background: #f9fafb;
                    color: #000000;
                }
                .pdf-table td {
                    padding: 6px 6px;
                    border: 1px solid #d1d5db;
                    font-size: 12px;
                    text-align: right;
                    color: #000000;
                }
                .pdf-table tbody tr {
                    background-color: #ffffff;
                }
                .pdf-table tfoot {
                    background: #f9fafb;
                    font-weight: bold;
                }
                .pdf-table tfoot td {
                    padding: 8px 6px;
                    border: 1px solid #d1d5db;
                    text-align: right;
                    font-size: 12px;
                    background: #f9fafb;
                    color: #000000;
                }
                .pdf-notes {
                    margin-top: 25px;
                    padding: 15px;
                    background: #f9fafb;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                }
                .pdf-notes h3 {
                    font-size: 15px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #000000;
                }
                .pdf-notes p {
                    font-size: 13px;
                    line-height: 1.6;
                    color: #374151;
                }
                .pdf-signatures {
                    margin-top: 50px;
                    display: flex;
                    justify-content: space-between;
                    padding-top: 20px;
                    border-top: 1px solid #d1d5db;
                }
                .pdf-signature {
                    width: 250px;
                    text-align: center;
                    padding-top: 50px;
                    border-top: 1px solid #000000;
                    font-size: 13px;
                    font-weight: 500;
                    color: #000000;
                }
            </style>
        </head>
        <body>
            <div class="pdf-header">
                ${logoUrl ? `<img src="${logoUrl}" alt="Logo" onerror="this.style.display='none'" />` : `<div style="font-size: 24px; color: #000000; font-weight: bold;">${companyName}</div>`}
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
    
    // Create a temporary hidden container with proper Arabic support
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = orientation === 'portrait' ? '794px' : '1123px'; // A4 dimensions in pixels at 96 DPI
    tempDiv.style.padding = '20px';
    tempDiv.style.backgroundColor = '#ffffff';
    tempDiv.style.direction = 'rtl';
    tempDiv.style.fontFamily = "'Segoe UI', 'Tahoma', 'Arial Unicode MS', 'Arial', sans-serif";
    tempDiv.style.color = '#000000';
    tempDiv.style.unicodeBidi = 'embed';
    tempDiv.innerHTML = htmlContent;

    document.body.appendChild(tempDiv);

    // Wait for images to load
    await new Promise(resolve => {
        const images = tempDiv.querySelectorAll('img');
        if (images.length === 0) {
            resolve(undefined);
            return;
        }
        let loaded = 0;
        const checkComplete = () => {
            loaded++;
            if (loaded === images.length) resolve(undefined);
        };
        images.forEach(img => {
            if (img.complete) checkComplete();
            else {
                img.onload = checkComplete;
                img.onerror = checkComplete;
            }
        });
    });

    // Wait for fonts and rendering
    await new Promise(resolve => setTimeout(resolve, 600));

    // Convert to canvas then PDF with better Arabic support
    const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight,
        windowWidth: tempDiv.scrollWidth,
        windowHeight: tempDiv.scrollHeight,
        onclone: (clonedDoc) => {
            // Ensure Arabic text is properly rendered in cloned document
            const clonedBody = clonedDoc.body;
            if (clonedBody) {
                clonedBody.style.direction = 'rtl';
                clonedBody.style.fontFamily = "'Segoe UI', 'Tahoma', 'Arial Unicode MS', 'Arial', sans-serif";
                clonedBody.style.unicodeBidi = 'embed';
            }
        }
    });

    // Remove temporary element
    document.body.removeChild(tempDiv);

    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // A4 dimensions in mm
    const a4Width = 210;
    const a4Height = 297;
    
    const orientationChar = orientation === 'portrait' ? 'p' : 'l';
    const doc = new jsPDF(orientationChar, 'mm', 'a4');
    
    // Calculate image dimensions to fit A4
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage(orientationChar, 'a4');
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    doc.save(fileName);
};

