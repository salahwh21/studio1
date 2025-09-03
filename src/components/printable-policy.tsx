
'use client';

import React, { useState, forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import type { Order } from '@/store/orders-store';
import type { SavedTemplate, PolicyElement } from '@/contexts/SettingsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from './ui/button';
import Icon from './icon';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Barcode from 'react-barcode';

// --- Helper Functions ---
const mmToPt = (mm: number) => mm * 2.83465;

const replacePlaceholders = (text: string, order: Order, logos: { companyLogo?: string | null }): string => {
    if (!text) return '';
    
    let processedText = text
        .replace(/\{\{recipient\}\}/g, order.recipient)
        .replace(/\{\{phone\}\}/g, order.phone)
        .replace(/\{\{address\}\}/g, order.address)
        .replace(/\{\{city\}\}/g, order.city)
        .replace(/\{\{region\}\}/g, order.region || '')
        .replace(/\{\{cod\}\}/g, String(order.cod))
        .replace(/\{\{merchant\}\}/g, order.merchant)
        .replace(/\{\{date\}\}/g, order.date)
        .replace(/\{\{orderId\}\}/g, order.id)
        .replace(/\{\{referenceNumber\}\}/g, order.referenceNumber || '')
        .replace(/\{\{source\}\}/g, order.source)
        .replace(/\{\{driver\}\}/g, order.driver)
        // Assume items is an array in the future; for now, join if it exists
        .replace(/\{\{items\}\}/g, Array.isArray((order as any).items) ? (order as any).items.join(', ') : '')
        .replace(/\{\{notes\}\}/g, order.notes || '');

    if (logos.companyLogo) {
        processedText = processedText.replace(/\{\{company_logo\}\}/g, logos.companyLogo);
        processedText = processedText.replace(/\{\{header_logo\}\}/g, logos.companyLogo);
    }
        
    return processedText;
};

const renderElement = (element: PolicyElement, order: Order, logos: { companyLogo?: string | null }) => {
    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        zIndex: element.zIndex,
        borderColor: element.borderColor,
        borderWidth: `${element.borderWidth}px`,
        borderStyle: 'solid',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: element.textAlign as any,
        borderRadius: `${element.borderRadius}px`,
    };

    switch (element.type) {
        case 'text':
            return (
                <div style={{ ...style, color: element.color, fontSize: `${element.fontSize}px`, fontWeight: element.fontWeight as any, whiteSpace: 'nowrap', padding: '2px' }}>
                    {replacePlaceholders(element.content, order, logos)}
                </div>
            );
        case 'barcode':
            const barcodeValue = replacePlaceholders(element.content, order, logos);
            return (
                <div style={style}>
                    {barcodeValue && (
                        <Barcode
                            value={barcodeValue}
                            width={2}
                            height={element.height > 20 ? element.height - 15 : element.height}
                            displayValue={true}
                            fontSize={12}
                            margin={5}
                        />
                    )}
                </div>
            );
        case 'image':
             const imageSrc = replacePlaceholders(element.content, order, logos);
             if (imageSrc) {
                return <img src={imageSrc} alt="Policy element" style={{...style, objectFit: 'contain'}} />;
            }
            return <div style={style}><Icon name="Image" className="w-full h-full text-muted-foreground p-2" isPrinting /></div>;
        case 'shape':
            return <div style={{ ...style, backgroundColor: element.backgroundColor, opacity: element.opacity }} />;
        default:
            return null;
    }
};

const PolicyContent = ({ order, template }: { order: Order; template: SavedTemplate }) => {
    const context = useSettings();
    const companyLogo = context.settings.login.loginLogo || context.settings.login.headerLogo;
    const logos = { companyLogo };

    return (
        <div className="relative w-full h-full bg-white text-black">
            {template.elements.sort((a, b) => a.zIndex - b.zIndex).map(el => (
                <React.Fragment key={el.id}>
                    {renderElement(el, order, logos)}
                </React.Fragment>
            ))}
        </div>
    );
};


type PrintablePolicyProps = {
    orders: Order[];
    template: SavedTemplate;
};

export const PrintablePolicy = forwardRef(({ orders, template }: PrintablePolicyProps, ref) => {
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);
    const printAreaRef = useRef<HTMLDivElement>(null);
    const context = useSettings();
    
    const displayOrders = orders.length > 0 ? orders : [{
        id: '12345', orderNumber: 12345, recipient: 'اسم المستلم التجريبي', phone: '0790000000',
        address: 'العنوان التجريبي, الشارع, المبنى', city: 'المدينة', region: 'المنطقة',
        cod: 100, merchant: 'اسم التاجر التجريبي', date: new Date().toISOString().split('T')[0],
        notes: 'هذه ملاحظات تجريبية للطباعة.', source: 'Manual', referenceNumber: 'REF-001',
        whatsapp: '', status: 'بالانتظار', driver: 'اسم السائق', itemPrice: 98, deliveryFee: 2,
    }];
    
    const paperDimensions = useMemo(() => {
        const paperSizes = { a4: { width: 210, height: 297 }, a5: { width: 148, height: 210 }, a6: { width: 105, height: 148 }, '4x6': { width: 101.6, height: 152.4 } };
        if (template.paperSize === 'custom') return template.customDimensions;
        return paperSizes[template.paperSize];
    }, [template.paperSize, template.customDimensions]);


    const handleExport = async () => {
        if (!printAreaRef.current) {
            toast({ variant: "destructive", title: "خطأ", description: "لا يمكن العثور على منطقة الطباعة." });
            return;
        }
        
        setIsExporting(true);
        toast({ title: "جاري تجهيز الملف...", description: "قد تستغرق العملية بضع لحظات." });
        
        const pdf = new jsPDF({
            orientation: paperDimensions.width > paperDimensions.height ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [paperDimensions.width, paperDimensions.height]
        });

        const policyElements = Array.from(printAreaRef.current.children) as HTMLElement[];

        for (let i = 0; i < policyElements.length; i++) {
            const policyHtmlElement = policyElements[i];
            try {
                const canvas = await html2canvas(policyHtmlElement, { scale: 3, useCORS: true, allowTaint: true });
                const imgData = canvas.toDataURL('image/png');
                if (i > 0) {
                    pdf.addPage([paperDimensions.width, paperDimensions.height], paperDimensions.width > paperDimensions.height ? 'landscape' : 'portrait');
                }
                pdf.addImage(imgData, 'PNG', 0, 0, paperDimensions.width, paperDimensions.height);
            } catch (e) {
                console.error("Error generating PDF page:", e);
                toast({ variant: 'destructive', title: 'خطأ في الطباعة', description: `حدث خطأ أثناء توليد الصفحة ${i+1}.` });
                setIsExporting(false);
                return;
            }
        }

        pdf.save('policies.pdf');
        setIsExporting(false);
    };

    const handleDirectPrint = async (order: Order | null, type: 'zpl' | 'escpos') => {
        if (!order) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'لا يوجد طلب لطباعته' });
            return;
        }

        const companyLogo = context.settings.login.loginLogo || context.settings.login.headerLogo;
        const logos = { companyLogo };

        const printData = `
            ^XA
            ^FO50,50^A0N,50,50^FD${replacePlaceholders('{{recipient}}', order, logos)}^FS
            ^FO50,110^A0N,30,30^FD${replacePlaceholders('{{address}}', order, logos)}^FS
            ^FO50,200^BY3^BCN,100,Y,N,N^FD${replacePlaceholders('{{orderId}}', order, logos)}^FS
            ^XZ
        `;

        toast({ title: 'جاري إرسال الطلب للطابعة...' });

        try {
            const response = await fetch('/api/print', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, data: printData }),
            });
            const result = await response.json();
            if (result.success) {
                toast({ title: 'تم الإرسال بنجاح!', description: 'تم إرسال أمر الطباعة إلى الطابعة.' });
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'فشل الطباعة', description: error.message });
        }
    };

    useImperativeHandle(ref, () => ({
        handleExport,
        handleDirectPrint,
    }));
    
    return (
        <div className="w-full">
            <div ref={printAreaRef}>
                {displayOrders.map((order) => (
                    <div key={order.id} className="printable-page" style={{ width: `${mmToPt(paperDimensions.width)}pt`, height: `${mmToPt(paperDimensions.height)}pt`, overflow: 'hidden' }}>
                        <PolicyContent order={order} template={template} />
                    </div>
                ))}
            </div>

            {orders.length === 0 && (
                <div className="text-center mt-4 no-print flex gap-2 justify-center">
                    <Button onClick={handleExport} disabled={isExporting}>
                        <Icon name={isExporting ? "Loader2" : "Printer"} className={`ml-2 h-4 w-4 inline ${isExporting ? "animate-spin" : ""}`} />
                        {isExporting ? "جاري التصدير..." : "تصدير كـ PDF"}
                    </Button>
                </div>
            )}
        </div>
    );
});

PrintablePolicy.displayName = 'PrintablePolicy';
