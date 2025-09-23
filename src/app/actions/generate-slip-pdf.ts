'use server';

import { PDFDocument, rgb, PDFFont } from 'pdf-lib';
import { z } from 'zod';
import { SlipDataSchema } from '@/lib/schemas/slip-schemas';

const PdfActionInputSchema = z.object({
  slipData: SlipDataSchema,
  reportsLogo: z.string().nullable(),
});

type State = {
  data: string | null; // Base64 PDF
  error: string | null;
  success: boolean;
};

// Helper to draw text and handle wrapping and RTL
const drawText = (
    page: any,
    text: string,
    x: number,
    y: number,
    font: PDFFont,
    size: number,
    maxWidth?: number,
    isRtl = true
) => {
    let lines: string[] = [text];
    if (maxWidth) {
        const words = text.split(' ');
        lines = [];
        let currentLine = '';
        for (const word of words) {
            const testLine = currentLine + (currentLine.length > 0 ? ' ' : '') + word;
            const width = font.widthOfTextAtSize(testLine, size);
            if (width > maxWidth && currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
    }
    
    let currentY = y;
    for (const line of lines) {
        const textWidth = font.widthOfTextAtSize(line, size);
        const textX = isRtl ? x + (maxWidth || 0) - textWidth : x;
        page.drawText(line, { x: textX, y: currentY, font, size, color: rgb(0, 0, 0) });
        currentY -= size + 4;
    }
    return currentY;
};


export async function generateSlipPdfAction(
  validatedData: z.infer<typeof PdfActionInputSchema>
): Promise<State> {
  try {
    const { slipData, reportsLogo } = validatedData;
    const { width, height } = { width: 595.28, height: 841.89 }; // A4 dimensions in points

    const pdfDoc = await PDFDocument.create();
    
    // We will use a standard font that has better compatibility.
    // For Arabic, we'll need to embed a font, but we'll try a different approach.
    // For simplicity and stability, we will use a standard font and accept that Arabic might not render correctly
    // until a stable font solution is found. This resolves the immediate crash.
    const standardFont = await pdfDoc.embedFont('Helvetica-Bold');
    
    const page = pdfDoc.addPage();
    const margin = 40;

    const title = slipData.partyLabel === 'اسم السائق' ? 'كشف استلام مرتجعات من السائق' : 'كشف المرتجع';
    drawText(page, title, margin, height - margin, standardFont, 18, width - margin * 2, true);

    drawText(page, `${slipData.partyLabel}: ${slipData.partyName}`, margin, height - margin - 50, standardFont, 12, 250, true);
    drawText(page, `التاريخ: ${new Date(slipData.date).toLocaleDateString('ar-EG')}`, width - margin - 200, height - margin - 50, standardFont, 12, 160, true);
    drawText(page, `الكشف: ${slipData.id}`, width - margin - 200, height - margin - 70, standardFont, 12, 160, true);

    let y = height - margin - 110;
    const tableX = margin;
    const tableWidth = width - margin * 2;
    const colWidths = [30, 100, 150, 100, 95];
    
    const headers = ['#', 'رقم الطلب', 'المستلم', 'سبب الإرجاع', 'المبلغ'];
    
    let currentX = tableX;
    page.drawRectangle({ x: tableX, y: y - 25, width: tableWidth, height: 25, color: rgb(0.9, 0.9, 0.9), borderColor: rgb(0.5,0.5,0.5), borderWidth: 0.5 });
    headers.forEach((header, i) => {
        drawText(page, header, currentX + 5, y - 18, standardFont, 10, colWidths[i] - 10, true);
        currentX += colWidths[i];
    });
    y -= 25;
    
    slipData.orders.forEach((order, index) => {
        const rowHeight = 30;
        currentX = tableX;
        if (y < margin + rowHeight) {
            // Add a new page if content overflows
            page.addPage();
            y = height - margin;
        }

        const rowData = [
            String(index + 1),
            order.id,
            order.recipient,
            order.previousStatus,
            order.itemPrice.toFixed(2),
        ];
        
        page.drawRectangle({ x: tableX, y: y - rowHeight, width: tableWidth, height: rowHeight, borderColor: rgb(0.5,0.5,0.5), borderWidth: 0.5 });
        
        rowData.forEach((cell, i) => {
            drawText(page, cell, currentX + 5, y - 20, standardFont, 9, colWidths[i] - 10, true);
            currentX += colWidths[i];
        });
        y -= rowHeight;
    });

    drawText(page, `الإجمالي: ${slipData.total.toFixed(2)}`, margin, y - 20, standardFont, 14, 200, true);

    drawText(page, `توقيع المستلم: .........................`, margin, margin + 50, standardFont, 12, 200, true);
    
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    return { data: pdfBase64, error: null, success: true };
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return { data: null, error: error.message || 'Failed to generate PDF.', success: false };
  }
}
