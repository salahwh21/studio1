// @ts-nocheck
import type { DriverSlip, MerchantSlip } from '@/store/returns-store';
import type { User } from '@/store/user-store';
import { generatePdfSlipAction } from '@/app/actions/generate-pdf-slip';

const generatePdf = async (slips: (DriverSlip | MerchantSlip)[], users: User[], reportsLogo: string | null, isDriver: boolean) => {
    
    const slipsData = slips.map(slip => ({
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
    }));

    const result = await generatePdfSlipAction({
        slipsData,
        reportsLogo,
        isDriver,
    });

    if (result.success && result.data) {
        // In a browser environment, we can open the PDF.
        // The server action returns the PDF as a data URL.
        if (typeof window !== 'undefined') {
            const byteCharacters = atob(result.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            window.open(url);
        }
    } else {
        throw new Error(result.error || 'Failed to generate PDF on the server.');
    }
};

export const generateDriverSlipPdf = (slips: DriverSlip[], users: User[], reportsLogo: string | null) => {
    return generatePdf(slips, users, reportsLogo, true);
};

export const generateMerchantSlipPdf = (slips: MerchantSlip[], users: User[], reportsLogo: string | null) => {
    return generatePdf(slips, users, reportsLogo, false);
};
