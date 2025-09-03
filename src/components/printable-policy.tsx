

'use client';

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import type { Order } from '@/store/orders-store';
import { useSettings, type PolicySettings, type PolicyElement } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';
import Barcode from 'react-barcode';
import Icon from './icon';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from './ui/button';

const paperSizeClasses = {
  a4: 'w-[210mm] min-h-[297mm]',
  a5: 'w-[148mm] min-h-[210mm]',
  label_4x6: 'w-[101.6mm] min-h-[152.4mm]',
  label_4x4: 'w-[101.6mm] min-h-[101.6mm]',
  custom: 'w-[75mm] h-[45mm]',
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
const RenderedElement = ({ el, order, settings, loginSettings }: { el: PolicyElement, order: Order, settings: any, loginSettings: any }) => {
    const baseStyle: React.CSSProperties = {
        position: 'absolute',
        left: el.x,
        top: el.y,
        width: el.width,
        height: el.height,
        zIndex: el.zIndex,
        fontSize: el.fontSize ?? 14,
        fontWeight: el.fontWeight ?? 'normal',
        color: el.type === 'line' ? 'transparent' : (el.color ?? '#000000'),
        borderWidth: el.type === 'rect' || el.type === 'table' ? el.borderWidth ?? 1 : 0,
        borderColor: el.borderColor ?? 'transparent',
        borderStyle: 'solid',
        opacity: el.opacity ?? 1,
        backgroundColor: el.type === 'line' ? (el.color ?? '#000000') : el.backgroundColor,
        textAlign: 'center',
        padding: 4,
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
                    <Image src={imageUrl} alt="Logo" layout="fill" objectFit="contain" />
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
                            {headers.map((header, i) => (
                                <th key={i} className="border p-1 overflow-hidden" style={{borderColor}}>{resolveContent(header, order, settings)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row) => (
                            <tr key={row.id}>
                                {row.cells.map((cell) => (
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
    const paperSize = policySettings.paperSize || 'custom';
    const customDimensions = policySettings.customDimensions || { width: 75, height: 45 };
    const margins = policySettings.margins || { top: 2, right: 2, bottom: 2, left: 2 };
    const elements = policySettings.elements || [];

    const paperDimensions = {
        width: paperSize === 'custom' ? customDimensions.width : parseFloat(paperSizeClasses[paperSize].match(/w-\[(\d+\.?\d*)mm\]/)?.[1] || '0'),
        height: paperSize === 'custom' ? customDimensions.height : parseFloat(paperSizeClasses[paperSize].match(/min-h-\[(\d+\.?\d*)mm\]/)?.[0].match(/(\d+\.?\d*)/)?.[0] || '0'),
    };
    
    const style = {
        width: `${paperDimensions.width}mm`,
        minHeight: `${paperDimensions.height}mm`,
        padding: `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`,
    };

    return (
        <div className="policy-sheet relative font-sans text-black bg-white shadow-lg mx-auto" style={style}>
            {elements.sort((a, b) => a.zIndex - b.zIndex).map(el => (
                <RenderedElement key={el.id} el={el} order={order} settings={useSettings()} loginSettings={loginSettings} />
            ))}
        </div>
    );
};


export const PrintablePolicy = forwardRef<
    { handleExportPDF: () => void },
    { orders: Order[], previewSettings?: PolicySettings, onExport?: () => void }
>(({ orders, previewSettings, onExport }, ref) => {
    const context = useSettings();
    const { toast } = useToast();
    const printAreaRef = useRef<HTMLDivElement>(null);

    const activeSettings = previewSettings || context?.settings.policy;
    const loginSettings = context?.settings.login;

    const handleExportPDF = async () => {
        const finalSettings = activeSettings;

        const printArea = printAreaRef.current;
        if (!printArea) {
            toast({ variant: 'destructive', title: 'خطأ في الطباعة', description: 'لا يمكن العثور على المحتوى للطباعة.' });
            return;
        }

        const policyElements = Array.from(printArea.querySelectorAll('.policy-sheet'));
        if (policyElements.length === 0) {
            toast({ variant: 'destructive', title: 'لا طلبات محددة', description: 'الرجاء تحديد طلب واحد على الأقل لطباعة البوليصة.' });
            return;
        }
        
        if (!finalSettings) {
            toast({ variant: 'destructive', title: 'خطأ في الإعدادات', description: 'لا يمكن تحميل إعدادات البوليصة.' });
            return;
        }

        const paperDimensions = {
            width: finalSettings.paperSize === 'custom' ? finalSettings.customDimensions.width : parseFloat(paperSizeClasses[finalSettings.paperSize].match(/w-\[(\d+\.?\d*)mm\]/)?.[1] || '0'),
            height: finalSettings.paperSize === 'custom' ? finalSettings.customDimensions.height : parseFloat(paperSizeClasses[finalSettings.paperSize].match(/min-h-\[(\d+\.?\d*)mm\]/)?.[0].match(/(\d+\.?\d*)/)?.[0] || '0'),
        };

        try {
            const pdf = new jsPDF({ 
                orientation: paperDimensions.width > paperDimensions.height ? 'l' : 'p', 
                unit: 'mm', 
                format: [paperDimensions.width, paperDimensions.height] 
            });

            for (let i = 0; i < policyElements.length; i++) {
                const element = policyElements[i] as HTMLElement;
                
                const canvas = await html2canvas(element, { 
                    scale: 3, 
                    useCORS: true,
                    allowTaint: true,
                });
                const imgData = canvas.toDataURL('image/png');

                if (!imgData || imgData === 'data:,') {
                    throw new Error("Failed to generate image data from the policy element.");
                }
                
                if (i > 0) {
                    pdf.addPage([paperDimensions.width, paperDimensions.height], paperDimensions.width > paperDimensions.height ? 'l' : 'p');
                }
                
                pdf.addImage(imgData, 'PNG', 0, 0, paperDimensions.width, paperDimensions.height);
            }
            pdf.autoPrint();
            window.open(pdf.output('bloburl'), '_blank');
            if (onExport) onExport();
        } catch (err: any) {
            console.error("Error generating PDF: ", err);
            toast({
                variant: 'destructive',
                title: 'خطأ أثناء توليد الـ PDF',
                description: err.message || 'حدث خطأ غير متوقع أثناء تحويل البوليصة إلى صورة.'
            });
        }
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
             <div ref={printAreaRef} id="printable-area" className="bg-muted p-4 sm:p-8 flex items-start justify-center flex-wrap gap-4">
                {displayOrders.map((order) => (
                    <React.Fragment key={order.id}>
                       <Policy order={order} settings={activeSettings} loginSettings={loginSettings}/>
                       <div className="page-break"></div>
                    </React.Fragment>
                ))}
            </div>
            {orders.length === 0 && (
                <div className="text-center mt-4 no-print">
                     <Button onClick={() => handleExportPDF()}>
                        <Icon name="Printer" className="ml-2 h-4 w-4" />
                        طباعة معاينة
                    </Button>
                </div>
            )}
        </div>
    );
});

PrintablePolicy.displayName = 'PrintablePolicy';
