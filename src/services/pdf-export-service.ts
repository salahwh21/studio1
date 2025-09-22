
// @ts-nocheck
import type { DriverSlip, MerchantSlip } from '@/store/returns-store';
import type { User } from '@/store/user-store';
import { generatePdfSlipAction } from '@/app/actions/generate-pdf-slip';
import { jsPDF } from 'jspdf';


const generatePdf = async (slips: (DriverSlip | MerchantSlip)[], users: User[], reportsLogo: string | null, isDriver: boolean) => {
    
    if (slips.length === 0) {
        throw new Error("No slips to process.");
    }
    
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    for (let i = 0; i < slips.length; i++) {
        const slip = slips[i];
        
        // Prepare the data for a single slip
        const slipData = {
            id: slip.id,
            partyName: isDriver ? (slip as DriverSlip).driverName : (slip as MerchantSlip).merchant,
            partyLabel: isDriver ? 'اسم السائق' : 'اسم التاجر',
            date: slip.date,
            branch: slip.orders[0]?.city || 'غير متوفر',
            orders: slip.orders.map(o => ({
                id: o.id || '',
                recipient: o.recipient || '',
                phone: o.phone || '',
                city: o.city || '',
                address: o.address || '',
                previousStatus: o.previousStatus || o.status || 'غير محدد',
                itemPrice: o.itemPrice || 0,
            })),
            total: slip.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0),
        };

        // Call the server action for each slip
        const result = await generatePdfSlipAction({
            slipData,
            reportsLogo,
            isDriver,
        });
        
        if (result.success && result.data) {
            const imgData = 'data:image/jpeg;base64,' + result.data;
             if (i > 0) {
                pdf.addPage();
            }
            const { width, height } = pdf.internal.pageSize;
            pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
        } else {
            throw new Error(result.error || `Failed to generate PDF for slip ${slip.id}.`);
        }
    }

    if (typeof window !== 'undefined') {
        pdf.output('dataurlnewwindow');
    }
};

export const generateDriverSlipPdf = (slips: DriverSlip[], users: User[], reportsLogo: string | null) => {
    return generatePdf(slips, users, reportsLogo, true);
};

export const generateMerchantSlipPdf = (slips: MerchantSlip[], users: User[], reportsLogo: string | null) => {
    return generatePdf(slips, users, reportsLogo, false);
};
