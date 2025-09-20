// @ts-nocheck
import type { Order } from '@/store/orders-store';
import type { DriverSlip, MerchantSlip } from '@/store/returns-store';
import type { User } from '@/store/user-store';

async function generateBarcodeBase64(text: string): Promise<string> {
    if (typeof window === 'undefined') {
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


async function generateSlipWorksheet(workbook, slip: DriverSlip | MerchantSlip, users: User[], reportsLogo: string | null, isDriver: boolean) {
    const ExcelJS = (await import('exceljs')).default;
    const worksheet = workbook.addWorksheet(`Slip ${slip.id.substring(3, 7)}`, {
        pageSetup: { paperSize: 9, orientation: 'portrait', margins: { left: 0.25, right: 0.25, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 } },
        views: [{ rightToLeft: true }]
    });

    // --- Column Widths ---
    worksheet.columns = [
        { key: 'colA', width: 5 },
        { key: 'colB', width: 20 },
        { key: 'colC', width: 25 },
        { key: 'colD', width: 25 },
        { key: 'colE', width: 15 },
        { key: 'colF', width: 15 }
    ];

    // --- Logo & Barcode ---
    if (reportsLogo && reportsLogo.startsWith('data:image')) {
        const logoImageId = workbook.addImage({ base64: reportsLogo.split(',')[1], extension: 'png' });
        worksheet.addImage(logoImageId, { tl: { col: 4, row: 1 }, ext: { width: 100, height: 40 } });
    }
    
    const barcodeBase64 = await generateBarcodeBase64(slip.id);
    if (barcodeBase64 && barcodeBase64.startsWith('data:image')) {
        const barcodeImageId = workbook.addImage({ base64: barcodeBase64.split(',')[1], extension: 'png' });
        worksheet.addImage(barcodeImageId, { tl: { col: 0, row: 1 }, ext: { width: 150, height: 50 } });
    } else {
        worksheet.getCell('A2').value = slip.id;
    }

    // --- Header ---
    worksheet.mergeCells('B2:E2');
    const titleCell = worksheet.getCell('B2');
    titleCell.value = isDriver ? 'كشف استلام مرتجعات من السائق' : 'كشف المرتجع';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(2).height = 30;
    
    const partyName = isDriver ? (slip as DriverSlip).driverName : (slip as MerchantSlip).merchant;
    const user = isDriver
        ? users.find(u => u.name === partyName)
        : users.find(u => u.storeName === partyName);

    worksheet.getCell('B4').value = `${isDriver ? 'اسم السائق' : 'اسم التاجر'}: ${partyName}`;
    worksheet.getCell('B5').value = `رقم الهاتف/البريد: ${user?.email || 'N/A'}`;
    worksheet.getCell('E4').value = `التاريخ: ${new Date(slip.date).toLocaleDateString('ar-EG')}`;
    worksheet.getCell('E5').value = `الفرع: ${slip.orders[0]?.city || ''}`;

    // --- Table Header ---
    const headerRow = worksheet.getRow(7);
    headerRow.values = ['#', 'رقم الطلب', 'المستلم', 'العنوان', 'سبب الإرجاع', 'المبلغ'];
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
        cell.border = { bottom: { style: 'thin' } };
    });

    // --- Table Data ---
    slip.orders.forEach((order, index) => {
        const row = worksheet.addRow([
            index + 1,
            order.id,
            `${order.recipient}\n${order.phone}`,
            `${order.city} - ${order.address}`,
            order.previousStatus || order.status,
            order.itemPrice || 0
        ]);
        row.getCell('C').alignment = { wrapText: true, vertical: 'middle' };
        row.getCell('D').alignment = { wrapText: true, vertical: 'middle' };
        row.getCell('F').numFmt = '#,##0.00 "د.أ"';
        row.eachCell(cell => { cell.alignment = { ...cell.alignment, vertical: 'middle' }; });
    });

    // --- Table Footer ---
    const totalRow = worksheet.addRow(['', 'الإجمالي', '', '', '', slip.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0)]);
    worksheet.mergeCells(`B${totalRow.number}:E${totalRow.number}`);
    totalRow.font = { bold: true };
    totalRow.getCell('B').alignment = { horizontal: 'center' };
    totalRow.getCell('F').numFmt = '#,##0.00 "د.أ"';

    // --- Footer ---
    const signatureRow = worksheet.addRow(['']);
    signatureRow.height = 40;
    worksheet.mergeCells(`B${signatureRow.number}:C${signatureRow.number}`);
    worksheet.getCell(`B${signatureRow.number}`).value = 'توقيع المستلم: .........................';
    worksheet.getCell(`B${signatureRow.number}`).font = { size: 12 };
    worksheet.getCell(`B${signatureRow.number}`).alignment = { vertical: 'bottom' };
}

async function generateExcel(slips: (DriverSlip | MerchantSlip)[], users: User[], reportsLogo: string | null, isDriver: boolean, filename: string) {
    if (typeof window === 'undefined') return;

    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    
    for (const slip of slips) {
        await generateSlipWorksheet(workbook, slip, users, reportsLogo, isDriver);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
}

export const generateDriverSlipExcel = (slips: DriverSlip[], users: User[], reportsLogo: string | null) => {
    return generateExcel(slips, users, reportsLogo, true, `driver_slips_${new Date().toISOString().slice(0,10)}.xlsx`);
};

export const generateMerchantSlipExcel = (slips: MerchantSlip[], users: User[], reportsLogo: string | null) => {
    return generateExcel(slips, users, reportsLogo, false, `merchant_slips_${new Date().toISOString().slice(0,10)}.xlsx`);
};
