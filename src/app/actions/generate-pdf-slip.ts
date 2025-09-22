
'use server';

import pdfMake from 'pdfmake/build/pdfmake';
import { z } from 'zod';

// Import font data directly to avoid filesystem access issues on the server
import fontBuffer from '@/assets/fonts/Tajawal-Regular.ttf';


const SlipOrderSchema = z.object({
    id: z.string(),
    recipient: z.string(),
    phone: z.string(),
    city: z.string(),
    address: z.string(),
    previousStatus: z.string(),
    itemPrice: z.number(),
});

const SlipDataSchema = z.object({
    id: z.string(),
    partyName: z.string(),
    partyLabel: z.string(),
    date: z.string(),
    branch: z.string(),
    orders: z.array(SlipOrderSchema),
    total: z.number(),
});

const PdfActionInputSchema = z.object({
    slipsData: z.array(SlipDataSchema),
    reportsLogo: z.string().nullable(),
    isDriver: z.boolean(),
});

type State = {
  data: string | null; // Base64 encoded PDF
  error: string | null;
  success: boolean;
};

// Helper function to process the logo
const processLogo = async (logo: string | null): Promise<any | null> => {
    if (!logo) return null;
    // Check if it's a data URI
    if (logo.startsWith('data:image')) {
        return logo;
    }
    // For now, we only support data URI logos on the server.
    return null;
};


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

    // Header section
    let headerColumns: any[] = [
        { width: '*', stack: [{ text: `${slip.partyLabel}: ${slip.partyName}`, fontSize: 9 }, { text: `التاريخ: ${new Date(slip.date).toLocaleString('ar-EG')}`, fontSize: 9 }, { text: `الفرع: ${slip.branch}`, fontSize: 9 },], alignment: 'right' },
        { width: 'auto', stack: [{ text: title, style: 'header' }] },
        { text: slip.id, alignment: 'left', style: 'header', margin: [0, 5, 0, 0] }
    ];

    if (reportsLogo) {
        headerColumns.splice(1, 0, { image: reportsLogo, width: 70, alignment: 'center', margin: [0, 0, 0, 5] });
    }
    
    content.push({ columns: headerColumns, columnGap: 10 });
    content.push({ table: { headerRows: 1, widths: ['auto', 'auto', '*', '*', '*', 'auto'], body: tableBody, }, layout: 'lightHorizontalLines', margin: [0, 20, 0, 10] });
    content.push({ columns: [{ text: `توقيع المستلم: .........................`, margin: [0, 50, 0, 0] }] });

    return content;
};


export async function generatePdfSlipAction(validatedData: z.infer<typeof PdfActionInputSchema>): Promise<State> {
    try {
        // Use the imported font buffer
        const vfs = {
            "Tajawal-Regular.ttf": fontBuffer.toString('base64')
        };
        
        pdfMake.vfs = vfs;
        pdfMake.fonts = {
            Tajawal: {
                normal: 'Tajawal-Regular.ttf'
            }
        };

        const { slipsData, reportsLogo } = validatedData;
        const allPagesContent: any[] = [];
        
        const processedLogo = await processLogo(reportsLogo);

        for (let i = 0; i < slipsData.length; i++) {
            const slip = slipsData[i];
            const pageContent = createSlipContent(slip, processedLogo);
            allPagesContent.push(...pageContent);

            if (i < slipsData.length - 1) {
                allPagesContent.push({ text: '', pageBreak: 'after' });
            }
        }

        const docDefinition = {
            defaultStyle: { font: "Tajawal", fontSize: 10, alignment: "right" },
            content: allPagesContent,
            styles: {
                header: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
                tableHeader: { bold: true, fontSize: 11, fillColor: '#eeeeee', alignment: 'center' },
                tableCell: { margin: [5, 5, 5, 5] },
            },
            footer: (currentPage: number, pageCount: number) => ({ text: `صفحة ${currentPage} من ${pageCount}`, alignment: 'center', fontSize: 8, margin: [0, 10, 0, 0] }),
            pageSize: 'A4',
            pageMargins: [20, 40, 20, 40]
        };

        const pdfDoc = pdfMake.createPdf(docDefinition);
        
        const pdfBase64 = await new Promise<string>((resolve, reject) => {
             pdfDoc.getBase64((data: string) => {
                if (data) {
                    resolve(data);
                } else {
                    reject(new Error("Failed to generate PDF base64."));
                }
            });
        });

        return {
            data: pdfBase64,
            error: null,
            success: true,
        };
    } catch (error: any) {
        console.error('Error generating PDF:', error);
        return {
            data: null,
            error: error.message || 'Failed to generate PDF.',
            success: false,
        };
    }
}
