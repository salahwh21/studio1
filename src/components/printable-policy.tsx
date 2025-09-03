

'use client';

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import type { Order } from '@/store/orders-store';
import { useSettings, type PolicySettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import Barcode from 'react-barcode';
import Icon from './icon';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { htmlToText } from 'html-to-text';

const paperSizeClasses = {
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
  label_4x6: { width: 101.6, height: 152.4 },
  label_4x4: { width: 101.6, height: 101.6 },
};

// This function resolves placeholder values like {order_id} with actual order data.
const resolveContent = (content: string, order: Order, settings: any): string => {
    if (!content) return '';
    const { formatCurrency } = settings;
    return content
        .replace(/{order_id}/g, order.id)
        .replace(/{reference_id}/g, order.referenceNumber || '')
        .replace(/{recipient_name}/g, order.recipient)
        .replace(/{recipient_phone}/g, order.phone)
        .replace(/{recipient_address}/g, `${order.address}, ${order.city}`)
        .replace(/{recipient_info}/g, `${order.recipient}\n${order.phone}\n${order.address}, ${order.city}`)
        .replace(/{cod_amount}/g, formatCurrency(order.cod))
        .replace(/{order_notes}/g, order.notes || '')
        .replace(/{order_items}/g, 'Item 1, Item 2') // Replace with actual item data if available
        .replace(/{items_count}/g, '3') // Replace with actual item count
        .replace(/{merchant_name}/g, order.merchant)
        .replace(/{merchant_phone}/g, '0780123456') // Placeholder
        .replace(/{merchant_address}/g, 'Amman, Jordan'); // Placeholder
};


// This component renders a single element on the policy
const RenderedElement = ({ el, order, settings, loginSettings }: { el: any, order: Order, settings: any, loginSettings: any }) => {
    const baseStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${el.x}px`,
        top: `${el.y}px`,
        width: `${el.width}px`,
        height: `${el.height}px`,
        zIndex: el.zIndex,
        fontSize: `${el.fontSize ?? 14}px`,
        fontWeight: el.fontWeight ?? 'normal',
        color: el.type === 'line' ? 'transparent' : (el.color ?? '#000000'),
        borderWidth: el.type === 'rect' || el.type === 'table' ? `${el.borderWidth ?? 1}px` : 0,
        borderColor: el.borderColor ?? 'transparent',
        borderStyle: 'solid',
        opacity: el.opacity ?? 1,
        backgroundColor: el.type === 'line' ? (el.color ?? '#000000') : (el.backgroundColor ?? 'transparent'),
        textAlign: 'center',
        padding: '4px',
        wordBreak: 'break-word',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        whiteSpace: 'pre-wrap',
    };

    const content = resolveContent(el.content, order, settings);

    if (el.type === 'text') return <div style={baseStyle}>{content}</div>;
    if (el.type === 'line') return <div style={{ ...baseStyle, padding: 0 }}></div>;
    if (el.type === 'rect') return <div style={baseStyle}></div>;
    if (el.type === 'image') {
        let imageUrl: string | null = null;
        if (el.content.includes('{company_logo}')) imageUrl = loginSettings.policyLogo;
        if (el.content.includes('{merchant_logo}')) imageUrl = null; // Placeholder for merchant logo

        return (
            <div style={baseStyle}>
                {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt="Logo" 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        crossOrigin="anonymous"
                    />
                ) : (
                    <Icon name="Image" className="h-8 w-8 text-muted-foreground" isPrinting />
                )}
            </div>
        );
    }
    if (el.type === 'barcode') {
        const barcodeValue = resolveContent(el.content, order, settings);
        return <div style={{ ...baseStyle, backgroundColor: '#ffffff' }}><Barcode value={barcodeValue} height={el.height - 10} width={1.5} displayValue={false} margin={0} /></div>
    }
    if (el.type === 'table') {
        const { headers = [], tableData = [], borderColor = '#000000', fontSize = 12, fontWeight = 'bold' } = el;
        return (
            <div style={{...baseStyle, display: 'block', padding: 0, alignItems: 'stretch', justifyContent: 'stretch' }}>
                <table className="w-full h-full border-collapse" style={{fontSize: `${fontSize}px`}}>
                    <thead>
                        <tr style={{fontWeight: fontWeight}}>
                            {headers.map((header: string, i: number) => (
                                <th key={i} className="border p-1 overflow-hidden" style={{borderColor}}>{resolveContent(header, order, settings)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row: any) => (
                            <tr key={row.id}>
                                {row.cells.map((cell: any) => (
                                    <td key={cell.id} className="border p-1" style={{borderColor}}>{resolveContent(cell.content, order, settings)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    return null;
}

const Policy: React.FC<{ order: Order; settings: PolicySettings; loginSettings: any }> = ({ order, settings, loginSettings }) => {
    const policySettings = settings || {};
    const paperSizeKey = policySettings.paperSize || 'custom';
    const customDimensions = policySettings.customDimensions || { width: 75, height: 45 };
    
    const paperDimensions = {
        width: paperSizeKey === 'custom' ? customDimensions.width : paperSizeClasses[paperSizeKey].width,
        height: paperSizeKey === 'custom' ? customDimensions.height : paperSizeClasses[paperSizeKey].height,
    };
    
    const style = {
        width: `${paperDimensions.width}mm`,
        height: `${paperDimensions.height}mm`,
        padding: 0, // Padding is handled by element positions now
    };

    return (
        <div className="policy-sheet relative font-sans text-black bg-white shadow-lg mx-auto" style={style}>
            {policySettings.elements.sort((a, b) => a.zIndex - b.zIndex).map(el => (
                <RenderedElement key={el.id} el={el} order={order} settings={useSettings()} loginSettings={loginSettings} />
            ))}
        </div>
    );
};


export const PrintablePolicy = forwardRef<
    { handleExportPDF: () => void },
    { orders: Order[], onExport?: () => void }
>(({ orders, onExport }, ref) => {
    const context = useSettings();
    const { toast } = useToast();
    
    const activeSettings = context?.settings.policy;
    const loginSettings = context?.settings.login;

    const pxToMm = (px: number) => px * (25.4 / 96);
    const mmToPt = (mm: number) => mm * (72 / 25.4);

    const handleExportPDF = async () => {
        if (!activeSettings) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'لا يمكن تحميل إعدادات البوليصة.' });
            return;
        }

        const displayOrders = orders.length > 0 ? orders : [{
            id: 'ORD-1719810001', recipient: 'محمد جاسم', merchant: 'تاجر أ', date: new Date().toISOString(),
            phone: '07701112233', address: 'الصويفية, عمان, شارع الوكالات, بناية 15, الطابق 3',
            cod: 35.5, referenceNumber: 'REF-00101',
            city: 'عمان', driver: 'علي', itemPrice: 33, deliveryFee: 2.5, notes: 'ملاحظة تجريبية للطباعة.', orderNumber: 1, region: 'الصويفية', source: 'Manual', status: 'جاري التوصيل', whatsapp: ''
        }];
        
        const paperSizeKey = activeSettings.paperSize || 'custom';
        const customDimensions = activeSettings.customDimensions || { width: 0, height: 0 };
        const paperDimensions = {
            width: paperSizeKey === 'custom' ? customDimensions.width : paperSizeClasses[paperSizeKey].width,
            height: paperSizeKey === 'custom' ? customDimensions.height : paperSizeClasses[paperSizeKey].height,
        };

        const pdf = new jsPDF({
            orientation: paperDimensions.width > paperDimensions.height ? 'l' : 'p',
            unit: 'pt',
            format: [mmToPt(paperDimensions.width), mmToPt(paperDimensions.height)]
        });
        
        // Add the font. jsPDF requires this for Arabic text.
        // The font file needs to be publicly available. For this example, I'll assume it is.
        // This is a simplified approach. A real app would bundle the font.
        try {
            await pdf.addFont('/Tajawal-Regular.ttf', 'Tajawal', 'normal');
            pdf.setFont('Tajawal');
        } catch(e) {
            console.warn("Could not load custom font for PDF. Arabic text might not render correctly.", e);
        }

        for (let i = 0; i < displayOrders.length; i++) {
            const order = displayOrders[i];
            if (i > 0) {
                pdf.addPage([mmToPt(paperDimensions.width), mmToPt(paperDimensions.height)], paperDimensions.width > paperDimensions.height ? 'l' : 'p');
            }

            for (const el of activeSettings.elements.sort((a, b) => a.zIndex - b.zIndex)) {
                const x_pt = mmToPt(pxToMm(el.x));
                const y_pt = mmToPt(pxToMm(el.y));
                const w_pt = mmToPt(pxToMm(el.width));
                const h_pt = mmToPt(pxToMm(el.height));

                switch (el.type) {
                    case 'text':
                        const text = resolveContent(el.content, order, context);
                        pdf.setFontSize(el.fontSize || 14);
                        pdf.setTextColor(el.color || '#000000');
                        pdf.text(text, x_pt, y_pt + (el.fontSize || 14), { align: 'right', lang: 'ar' });
                        break;
                    
                    case 'rect':
                        pdf.setDrawColor(el.borderColor || '#000000');
                        pdf.setFillColor(el.backgroundColor || '#FFFFFF');
                        pdf.rect(x_pt, y_pt, w_pt, h_pt, el.backgroundColor ? 'FD' : 'S');
                        break;
                    
                    case 'line':
                         pdf.setDrawColor(el.color || '#000000');
                         pdf.line(x_pt, y_pt, x_pt + w_pt, y_pt + h_pt);
                         break;

                    case 'image':
                        let imageUrl: string | null = null;
                        if (el.content.includes('{company_logo}')) imageUrl = loginSettings.policyLogo;
                        if (imageUrl) {
                             try {
                                // We can't directly use external URLs in jsPDF addImage due to CORS.
                                // A proper solution would be to fetch via a server-side proxy.
                                // For now, we will skip if it fails.
                                pdf.addImage(imageUrl, 'PNG', x_pt, y_pt, w_pt, h_pt);
                             } catch(e) {
                                console.error("Could not add image to PDF, likely due to CORS.", e);
                             }
                        }
                        break;
                }
            }
        }

        pdf.autoPrint();
        window.open(pdf.output('bloburl'), '_blank');
        if (onExport) onExport();

    };
    
    useImperativeHandle(ref, () => ({
        handleExportPDF,
    }));
    
    if (!context?.isHydrated || !activeSettings || !loginSettings) {
        return <div><Skeleton className="h-[297mm] w-[210mm]" /></div>;
    }
    
    const displayOrders = orders.length > 0 ? orders : [{
        id: 'ORD-1719810001', recipient: 'محمد جاسم', merchant: 'تاجر أ', date: new Date().toISOString(),
        phone: '07701112233', address: 'الصويفية, عمان, شارع الوكالات, بناية 15, الطابق 3',
        cod: 35.5, referenceNumber: 'REF-00101',
        city: 'عمان', driver: 'علي', itemPrice: 33, deliveryFee: 2.5, notes: 'ملاحظة تجريبية للطباعة.', orderNumber: 1, region: 'الصويفية', source: 'Manual', status: 'جاري التوصيل', whatsapp: ''
    }];

    return (
        <div>
             <div id="printable-area">
                {displayOrders.map((order, index) => (
                    <React.Fragment key={order.id}>
                       <Policy order={order} settings={activeSettings} loginSettings={loginSettings}/>
                       {index < displayOrders.length - 1 && <div className="page-break"></div>}
                    </React.Fragment>
                ))}
            </div>
            {orders.length === 0 && (
                <div className="text-center mt-4 no-print">
                     <button onClick={handleExportPDF} className="bg-primary text-primary-foreground p-2 rounded-md">
                        <Icon name="Printer" className="ml-2 h-4 w-4 inline" />
                        طباعة معاينة
                    </button>
                </div>
            )}
        </div>
    );
});

PrintablePolicy.displayName = 'PrintablePolicy';

