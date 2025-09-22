'use server';

import pdfMake from 'pdfmake/build/pdfmake';
import { z } from 'zod';
import { SlipDataSchema, PdfActionInputSchema } from '@/lib/schemas/slip-schemas';

type State = {
  data: string | null; // Base64 PDF
  error: string | null;
  success: boolean;
};

// Helper: process logo
const processLogo = (logo: string | null) => {
  if (!logo || !logo.startsWith('data:image')) return null;
  return logo;
};

// Create content
const createSlipContent = (slip: z.infer<typeof SlipDataSchema>, reportsLogo: any | null) => {
  const title = slip.partyLabel === 'اسم السائق' ? 'كشف استلام مرتجعات من السائق' : 'كشف المرتجع';

  const tableBody = [
    [{ text: '#', style: 'tableHeader' }, { text: 'رقم الطلب', style: 'tableHeader' }, { text: 'المستلم', style: 'tableHeader' }, { text: 'العنوان', style: 'tableHeader' }, { text: 'سبب الإرجاع', style: 'tableHeader' }, { text: 'المبلغ', style: 'tableHeader' }],
    ...slip.orders.map((o, i) => [
      { text: String(i + 1), style: 'tableCell' },
      { text: String(o.id || ''), style: 'tableCell', alignment: 'center' },
      { text: `${String(o.recipient || '')}\n${String(o.phone || '')}`, style: 'tableCell' },
      { text: `${String(o.city || '')} - ${String(o.address || '')}`, style: 'tableCell' },
      { text: String(o.previousStatus || 'غير محدد'), style: 'tableCell' },
      { text: String(o.itemPrice?.toFixed(2) || '0.00'), style: 'tableCell', alignment: 'center' }
    ]),
    [{ text: 'الإجمالي', colSpan: 5, bold: true, style: 'tableCell', alignment: 'left' }, {}, {}, {}, {}, { text: slip.total.toFixed(2), bold: true, style: 'tableCell', alignment: 'center' }]
  ];

  const content: any[] = [];

  let headerColumns: any[] = [
    { width: '*', stack: [{ text: `${slip.partyLabel}: ${slip.partyName}`, fontSize: 9 }, { text: `التاريخ: ${new Date(slip.date).toLocaleString('ar-EG')}`, fontSize: 9 }, { text: `الفرع: ${slip.branch}`, fontSize: 9 }], alignment: 'right' },
    { width: 'auto', stack: [{ text: title, style: 'header' }] },
    { text: slip.id, alignment: 'left', style: 'header', margin: [0, 5, 0, 0] }
  ];

  if (reportsLogo) {
    headerColumns.splice(1, 0, { image: reportsLogo, width: 70, alignment: 'center', margin: [0, 0, 0, 5] });
  }

  content.push({ columns: headerColumns, columnGap: 10 });
  content.push({ table: { headerRows: 1, widths: ['auto', 'auto', '*', '*', '*', 'auto'], body: tableBody }, layout: 'lightHorizontalLines', margin: [0, 20, 0, 10] });
  content.push({ columns: [{ text: `توقيع المستلم: .........................`, margin: [0, 50, 0, 0] }] });

  return content;
};

// Main function
export async function generatePdfSlipAction(validatedData: z.infer<typeof PdfActionInputSchema>): Promise<State> {
  try {
    const { slipData, reportsLogo } = validatedData;
    const processedLogo = processLogo(reportsLogo);
    const pageContent = createSlipContent(slipData, processedLogo);

    // Use default built-in Roboto font
    const docDefinition: any = {
      defaultStyle: { font: 'Roboto', fontSize: 10, alignment: 'right' },
      content: pageContent,
      styles: {
        header: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        tableHeader: { bold: true, fontSize: 11, fillColor: '#eeeeee', alignment: 'center' },
        tableCell: { margin: [5, 5, 5, 5] },
      },
      footer: { text: 'صفحة 1 من 1', alignment: 'center', fontSize: 8, margin: [0, 10, 0, 0] },
      pageSize: 'A4',
      pageMargins: [20, 40, 20, 40]
    };
    
    // Fallback fonts
    if (pdfMake.fonts) {
        pdfMake.fonts.Roboto = {
            normal: 'Roboto-Regular.ttf',
            bold: 'Roboto-Medium.ttf',
            italics: 'Roboto-Italic.ttf',
            bolditalics: 'Roboto-MediumItalic.ttf'
        };
    }

    const pdfDoc = pdfMake.createPdf(docDefinition);

    const pdfBase64 = await new Promise<string>((resolve, reject) => {
      pdfDoc.getBase64((data: string) => {
        if (data) resolve(data);
        else reject(new Error('Failed to generate PDF Base64.'));
      });
    });

    return { data: pdfBase64, error: null, success: true };
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return { data: null, error: error.message || 'Failed to generate PDF.', success: false };
  }
}
