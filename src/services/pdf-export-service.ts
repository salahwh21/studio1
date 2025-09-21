// @ts-nocheck
import type { DriverSlip, MerchantSlip } from '@/store/returns-store';
import type { User } from '@/store/user-store';
import pdfMake from "pdfmake/build/pdfmake";
import * as fs from 'fs';
import * as path from 'path';

// Define the fonts for pdfmake
pdfMake.fonts = {
  Tajawal: {
    normal: 'Tajawal-Regular.ttf',
  },
};

// Function to read the font file and convert it to base64
// This is necessary because pdfmake on the server-side needs the font file data.
const readFontAsBase64 = (filename: string) => {
    const fontPath = path.join(process.cwd(), 'src/assets/fonts', filename);
    if (fs.existsSync(fontPath)) {
        return fs.readFileSync(fontPath).toString('base64');
    }
    console.error(`Font file not found at: ${fontPath}`);
    return null;
}

// Prepare the virtual file system for pdfmake
const vfsFont = readFontAsBase64('Tajawal-Regular.ttf');
if (vfsFont) {
    pdfMake.vfs = {
        "Tajawal-Regular.ttf": vfsFont
    };
}


async function generateBarcodeBase64(text: string): Promise<string> {
    if (typeof window === 'undefined') {
        // This is a server-side environment, we cannot use the canvas element.
        // For now, we will return an empty string. A more robust solution
        // would involve a server-side canvas library if barcodes are needed in server-generated PDFs.
        console.warn("Barcode generation is not supported on the server-side without a canvas library.");
        return '';
    }
    try {
        const bwipjs = (await import('bwip-js')).default;
        
        const canvas = document.createElement('canvas');
        return new Promise<string>((resolve, reject) => {
            bwipjs.toCanvas(canvas, {
                bcid: 'code128',
                text: text,
                scale: 3,
                height: 10,
                includetext: true,
                textsize: 10,
                backgroundcolor: 'FFFFFF',
            }, (err) => {
                if (err) return reject(err);
                resolve(canvas.toDataURL('image/png'));
            });
        });
    } catch (e) {
        console.error("Barcode generation error:", e);
        return '';
    }
}


const createSlipContent = async (slip: DriverSlip | MerchantSlip, users: User[], reportsLogo: string | null, isDriver: boolean) => {
    const partyName = isDriver ? (slip as DriverSlip).driverName : (slip as MerchantSlip).merchant;
    const user = isDriver
        ? users.find(u => u.name === partyName)
        : users.find(u => u.storeName === partyName);
    
    const barcodeBase64 = await generateBarcodeBase64(slip.id);

    const title = isDriver ? 'كشف استلام مرتجعات من السائق' : 'كشف المرتجع';
    const partyLabel = isDriver ? 'اسم السائق' : 'اسم التاجر';
    
    const tableBody = [
        [{ text: '#', style: 'tableHeader' }, { text: 'رقم الطلب', style: 'tableHeader' }, { text: 'المستلم', style: 'tableHeader' }, { text: 'العنوان', style: 'tableHeader' }, { text: 'سبب الإرجاع', style: 'tableHeader' }, { text: 'المبلغ', style: 'tableHeader' }],
        ...slip.orders.map((o, i) => [
            { text: String(i + 1), style: 'tableCell' },
            { text: String(o.id || ''), style: 'tableCell', alignment: 'center' },
            { text: `${String(o.recipient || '')}\n${String(o.phone || '')}`, style: 'tableCell' },
            { text: `${String(o.city || '')} - ${String(o.address || '')}`, style: 'tableCell' },
            { text: String(o.previousStatus || o.status || 'غير محدد'), style: 'tableCell' },
            { text: String(o.itemPrice?.toFixed(2) || '0.00'), style: 'tableCell', alignment: 'center' }
        ]),
        [{ text: 'الإجمالي', colSpan: 5, bold: true, style: 'tableCell', alignment: 'left' }, {}, {}, {}, {}, { text: slip.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0).toFixed(2), bold: true, style: 'tableCell', alignment: 'center' }]
    ];

    const pageContent = [
        {
            columns: [
                { width: 'auto', stack: [{ text: `${partyLabel}: ${partyName}`, fontSize: 9 }, { text: `رقم الهاتف/البريد: ${String(user?.email || 'غير متوفر')}`, fontSize: 9 }, { text: `التاريخ: ${new Date(slip.date).toLocaleString('ar-EG')}`, fontSize: 9 }, { text: `الفرع: ${String(slip.orders[0]?.city || 'غير متوفر')}`, fontSize: 9 },], alignment: 'right' },
                { width: '*', stack: [ reportsLogo ? { image: reportsLogo, width: 70, alignment: 'center', margin: [0, 0, 0, 5] } : {}, { text: title, style: 'header' }] },
                { width: 'auto', stack: [ barcodeBase64 ? { image: barcodeBase64, width: 120, alignment: 'center' } : { text: slip.id, alignment: 'center' }], alignment: 'left' }
            ],
            columnGap: 10
        },
        { table: { headerRows: 1, widths: ['auto', 'auto', '*', '*', '*', 'auto'], body: tableBody, }, layout: 'lightHorizontalLines', margin: [0, 20, 0, 10] },
        { columns: [{ text: `توقيع المستلم: .........................`, margin: [0, 50, 0, 0] }] }
    ];

    return pageContent;
};

export const generatePdf = async (slips: (DriverSlip | MerchantSlip)[], users: User[], reportsLogo: string | null, isDriver: boolean) => {
    
    const allPagesContent: any[] = [];

    for (let i = 0; i < slips.length; i++) {
        const slip = slips[i];
        const pageContent = await createSlipContent(slip, users, reportsLogo, isDriver);
        allPagesContent.push(...pageContent);

        if (i < slips.length - 1) {
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

    return pdfMake.createPdf(docDefinition);
}

export const generateDriverSlipPdf = (slips: DriverSlip[], users: User[], reportsLogo: string | null) => {
    return generatePdf(slips, users, reportsLogo, true);
};

export const generateMerchantSlipPdf = (slips: MerchantSlip[], users: User[], reportsLogo: string | null) => {
    return generatePdf(slips, users, reportsLogo, false);
};
