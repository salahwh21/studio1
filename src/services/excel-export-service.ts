// @ts-nocheck
import ExcelJS from 'exceljs';
import type { Order } from '@/store/orders-store';
import type { DriverSlip, MerchantSlip } from '@/store/returns-store';
import type { User } from '@/store/user-store';

async function generateBarcodeBase64(text: string): Promise<string> {
    if (typeof window === 'undefined') return '';
    try {
        const bwipjs = (await import('bwip-js')).default;
        const canvas = document.createElement('canvas');
        await bwipjs.toCanvas(canvas, {
            bcid: 'code128',
            text: text,
            scale: 3,
            height: 10,
            includetext: true,
            textsize: 10
        });
        return canvas.toDataURL('image/png');
    } catch (e) {
        console.error("Barcode generation error:", e);
        return '';
    }
}

async function generateSlipWorksheet(workbook: ExcelJS.Workbook, slip: DriverSlip | MerchantSlip, users: User[], reportsLogo: string | null, isDriver: boolean) {
    const worksheet = workbook.addWorksheet(`Slip ${slip.id.substring(3, 7)}`);

    // --- Page Setup ---
    worksheet.views = [{ rightToLeft: true }];
    worksheet.pageSetup = { paperSize: 9, orientation: 'portrait', margins: { left: 0.25, right: 0.25, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 } };
    worksheet.properties.defaultColWidth = 12;
    worksheet.getColumn('C').width = 25;
    worksheet.getColumn('D').width = 25;

    // --- Logo & Barcode ---
    if (reportsLogo) {
        const logoImageId = workbook.addImage({ base64: reportsLogo, extension: 'png' });
        worksheet.addImage(logoImageId, { tl: { col: 3, row: 1 }, ext: { width: 100, height: 40 } });
    }
    
    const barcodeBase64 = await generateBarcodeBase64(slip.id);
    if (barcodeBase64) {
        const barcodeImageId = workbook.addImage({ base64: barcodeBase64, extension: 'png' });
        worksheet.addImage(barcodeImageId, { tl: { col: 0.5, row: 1 }, ext: { width: 150, height: 50 } });
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

    worksheet.getCell('F3').value = `${isDriver ? 'اسم السائق' : 'اسم التاجر'}: ${partyName}`;
    worksheet.getCell('F4').value = `رقم الهاتف/البريد: ${user?.email || 'N/A'}`;
    worksheet.getCell('F5').value = `التاريخ: ${new Date(slip.date).toLocaleDateString('ar-EG')}`;
    worksheet.getCell('G3').value = `الفرع: ${slip.orders[0]?.city || ''}`;

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
        row.getCell(3).alignment = { wrapText: true };
        row.getCell(4).alignment = { wrapText: true };
        row.getCell(6).numFmt = '#,##0.00 "د.أ"';
        row.eachCell(cell => { cell.alignment = { ...cell.alignment, vertical: 'middle' }; });
    });

    // --- Table Footer ---
    const totalRow = worksheet.addRow(['', 'الإجمالي', '', '', '', slip.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0)]);
    worksheet.mergeCells(`B${totalRow.number}:E${totalRow.number}`);
    totalRow.font = { bold: true };
    totalRow.getCell(6).numFmt = '#,##0.00 "د.أ"';

    // --- Footer ---
    const signatureRow = worksheet.addRow(['']);
    worksheet.mergeCells(`A${signatureRow.number}:C${signatureRow.number}`);
    worksheet.getCell(`A${signatureRow.number}`).value = 'توقيع المستلم: .........................';
    worksheet.getCell(`A${signatureRow.number}`).font = { size: 12 };
}

async function generateExcel(slips: (DriverSlip | MerchantSlip)[], users: User[], reportsLogo: string | null, isDriver: boolean, filename: string) {
    const workbook = new ExcelJS.Workbook();
    
    for (const slip of slips) {
        await generateSlipWorksheet(workbook, slip, users, reportsLogo, isDriver);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

export const generateDriverSlipExcel = (slips: DriverSlip[], users: User[], reportsLogo: string | null) => {
    return generateExcel(slips, users, reportsLogo, true, `driver_slips_${new Date().toISOString().slice(0,10)}.xlsx`);
};

export const generateMerchantSlipExcel = (slips: MerchantSlip[], users: User[], reportsLogo: string | null) => {
    return generateExcel(slips, users, reportsLogo, false, `merchant_slips_${new Date().toISOString().slice(0,10)}.xlsx`);
};
