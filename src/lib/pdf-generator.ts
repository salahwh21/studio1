'use client';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { amiriFont } from './amiri-font'; // Make sure this path is correct

// This is a simplified type, expand it based on your actual data structure
type SlipData = {
    id: string;
    partyName: string;
    partyLabel: string;
    date: string;
    orders: {
        id: string;
        recipient: string;
        phone: string;
        previousStatus: string;
        itemPrice: number;
    }[];
};

export const generatePdf = async (slipData: SlipData, logoBase64: string | null) => {
    const doc = new jsPDF();

    // Add Amiri font to jsPDF
    doc.addFileToVFS('Amiri-Regular.ttf', amiriFont);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.setFont('Amiri');
    
    // Set text direction to RTL for the whole document
    doc.setRtl(true);

    // --- Header ---
    if (logoBase64) {
        try {
            doc.addImage(logoBase64, 'PNG', 15, 15, 40, 20);
        } catch(e) {
            console.error("Error adding logo image to PDF:", e);
        }
    }
    const title = slipData.partyLabel === 'اسم السائق' ? 'كشف استلام مرتجعات من السائق' : 'كشف المرتجع';
    doc.setFontSize(20);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });

    // --- Slip Info ---
    doc.setFontSize(12);
    doc.text(`الكشف: ${slipData.id}`, 200, 45, { align: 'right' });
    doc.text(`التاريخ: ${new Date(slipData.date).toLocaleDateString('ar-EG')}`, 200, 52, { align: 'right' });
    doc.text(`${slipData.partyLabel}: ${slipData.partyName}`, 200, 59, { align: 'right' });
    
    // --- Table ---
    const tableColumn = ["المبلغ", "سبب الإرجاع", "الهاتف", "المستلم", "رقم الطلب", "#"];
    const tableRows: (string | number)[][] = [];

    slipData.orders.forEach((order, index) => {
        const orderData = [
            order.itemPrice.toFixed(2),
            order.previousStatus,
            order.phone,
            order.recipient,
            order.id,
            index + 1,
        ];
        tableRows.push(orderData);
    });

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 70,
        theme: 'grid',
        headStyles: {
            font: 'Amiri',
            halign: 'center',
            fillColor: [230, 230, 230],
            textColor: 20
        },
        styles: {
            font: 'Amiri',
            halign: 'right'
        },
        // Apply specific alignment for columns that need it
        columnStyles: {
            0: { halign: 'center' }, // المبلغ
            5: { halign: 'center' }  // #
        }
    });

    let finalY = (doc as any).lastAutoTable.finalY;

    // --- Footer ---
    doc.setFontSize(14);
    const total = slipData.orders.reduce((sum, o) => sum + o.itemPrice, 0);
    doc.text(`الإجمالي: ${total.toFixed(2)}`, 200, finalY + 15, { align: 'right' });
    doc.text(`توقيع المستلم: .........................`, 200, finalY + 30, { align: 'right' });
    doc.text(`توقيع السائق/المندوب: .........................`, 60, finalY + 30, { align: 'right' });

    // --- Generate and Open/Save ---
    doc.save(`${slipData.id}.pdf`);
};
