'use client';

import React, { useState, forwardRef, useImperativeHandle, useRef, useMemo, useEffect } from 'react';
import type { Order } from '@/store/orders-store';
import type { SavedTemplate, PolicyElement } from '@/contexts/SettingsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from './ui/button';
import Icon from './icon';
import { useToast } from '@/hooks/use-toast';
import Barcode from 'react-barcode';
import { fetchWrapper } from '@/lib/fetchWrapper';
import {
    generatePdf,
    createStandardPolicyHTML,
    createPdfPreview
} from '@/services/pdf-service';

const mmToPx = (mm: number) => mm * 3.7795;

const replacePlaceholders = (text: string, order: Order, logos: { companyLogo?: string | null }): string => {
    if (!text) return '';
    return text.replace(/\{\{([\w\d._]+)\}\}/g, (match, key) => {
        if (key === 'company_logo' || key === 'header_logo') {
            return logos.companyLogo || '';
        }
        const keys = key.split('.');
        let value: any = order;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return match;
            }
        }
        if (typeof value === 'object' && value !== null) {
            return match;
        }
        return value !== null && value !== undefined ? String(value) : '';
    });
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
                        <Barcode value={barcodeValue} width={2} height={element.height > 20 ? element.height - 15 : element.height} displayValue={true} fontSize={12} margin={5} />
                    )}
                </div>
            );
        case 'image':
            const imageSrc = replacePlaceholders(element.content, order, logos);
            if (imageSrc) {
                return <img src={imageSrc} alt="Policy element" style={{ ...style, objectFit: 'contain' }} />;
            }
            return <div style={style}><Icon name="Image" className="w-full h-full text-muted-foreground p-2" isPrinting /></div>;
        case 'shape':
            return <div style={{ ...style, backgroundColor: element.backgroundColor, opacity: element.opacity }} />;
        default:
            return null;
    }
};

const StandardPolicyTemplate = ({ order }: { order: Order }) => {
    const context = useSettings();
    const companyLogo = context.settings.login.loginLogo || context.settings.login.headerLogo;
    const companyName = context.settings.login?.companyName || 'شركة الشحن';

    return (
        <div className="w-full h-full bg-white text-black p-4 font-sans" style={{ fontSize: '12px', lineHeight: '1.4' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-300">
                <div className="flex items-center gap-3">
                    {companyLogo && (
                        <img src={companyLogo} alt="Company Logo" className="h-12 w-auto object-contain" />
                    )}
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">{companyName}</h1>
                        <p className="text-sm text-gray-600">بوليصة شحن</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold">رقم الطلب: {order.orderNumber}</div>
                    <div className="text-xs text-gray-600">التاريخ: {order.date}</div>
                </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                    <h3 className="font-bold text-sm border-b border-gray-200 pb-1">معلومات المستلم</h3>
                    <div className="space-y-1 text-xs">
                        <div><span className="font-medium">الاسم:</span> {order.recipient}</div>
                        <div><span className="font-medium">الهاتف:</span> {order.phone}</div>
                        <div><span className="font-medium">العنوان:</span> {order.address}</div>
                        <div><span className="font-medium">المدينة:</span> {order.city}</div>
                        <div><span className="font-medium">المنطقة:</span> {order.region}</div>
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="font-bold text-sm border-b border-gray-200 pb-1">معلومات الطلب</h3>
                    <div className="space-y-1 text-xs">
                        <div><span className="font-medium">التاجر:</span> {order.merchant}</div>
                        <div><span className="font-medium">المبلغ المستحق:</span> {order.cod} ريال</div>
                        <div><span className="font-medium">سعر المنتج:</span> {order.itemPrice} ريال</div>
                        <div><span className="font-medium">رسوم التوصيل:</span> {order.deliveryFee} ريال</div>
                        <div><span className="font-medium">الحالة:</span> {order.status}</div>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {order.notes && (
                <div className="mb-4">
                    <h3 className="font-bold text-sm border-b border-gray-200 pb-1 mb-2">ملاحظات</h3>
                    <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">{order.notes}</p>
                </div>
            )}

            {/* Barcode */}
            <div className="flex justify-center mb-4">
                <div className="text-center">
                    <Barcode
                        value={order.id}
                        width={1.5}
                        height={40}
                        displayValue={true}
                        fontSize={10}
                        margin={0}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-300 pt-3 mt-4">
                <div className="flex justify-between items-center text-xs text-gray-600">
                    <div>
                        <div>رقم المرجع: {order.referenceNumber || order.id}</div>
                        <div>المصدر: {order.source}</div>
                    </div>
                    <div className="text-right">
                        <div>تم الإنشاء: {new Date().toLocaleDateString('ar-SA')}</div>
                        <div>الوقت: {new Date().toLocaleTimeString('ar-SA')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PolicyContent = ({ order, template }: { order: Order; template: SavedTemplate | null }) => {
    // If no template is provided, use the standard template
    if (!template) {
        return <StandardPolicyTemplate order={order} />;
    }

    const context = useSettings();
    const companyLogo = context.settings.login.loginLogo || context.settings.login.headerLogo;
    const logos = { companyLogo };
    return (
        <div className="relative w-full h-full bg-white text-black">
            {template.elements.sort((a, b) => a.zIndex - b.zIndex).map(el => (
                <React.Fragment key={el.id}>{renderElement(el, order, logos)}</React.Fragment>
            ))}
        </div>
    );
};

type PrintablePolicyProps = {
    orders: Order[];
    template: SavedTemplate | null;
    hideControls?: boolean;
};

export const PrintablePolicy = forwardRef<{ handleExport: () => Promise<void>; handleDirectPrint: (order: any, type: 'zpl' | 'escpos') => Promise<void> }, PrintablePolicyProps>(({ orders, template, hideControls }, ref) => {
    const { toast } = useToast();
    const context = useSettings(); // نقل useSettings إلى أعلى المكون
    const [isExporting, setIsExporting] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const printAreaRef = useRef<HTMLDivElement>(null);

    const displayOrders = orders.length > 0 ? orders : [{
        id: '12345', orderNumber: 12345, recipient: 'Sample Recipient', phone: '0790000000',
        address: 'Sample Address', city: 'City', region: 'Region', cod: 100, merchant: 'Sample Merchant',
        date: new Date().toISOString().split('T')[0], notes: 'Sample notes', source: 'Manual' as const,
        referenceNumber: 'REF-001', whatsapp: '', status: 'Pending', previousStatus: '', driver: 'Driver',
        itemPrice: 98, deliveryFee: 2, additionalCost: 0, driverFee: 5, driverAdditionalFare: 0,
    }];

    const paperDimensions = useMemo(() => {
        // For standard template, use A4 size
        if (!template) return { width: 210, height: 297 };

        const paperSizes: Record<string, { width: number; height: number }> = {
            a4: { width: 210, height: 297 }, a5: { width: 148, height: 210 },
            a6: { width: 105, height: 148 }, '4x6': { width: 101.6, height: 152.4 }
        };
        if (template.paperSize === 'custom') return template.customDimensions;
        return paperSizes[template.paperSize] || { width: 210, height: 297 };
    }, [template]);

    // إنشاء معاينة HTML
    const createPreview = async () => {
        if (!printAreaRef.current) return;
        setIsExporting(true);

        try {
            const order = displayOrders[0];

            // تحويل بيانات الطلب
            const policyData = {
                companyName: context.settings.login?.companyName || 'شركة الشحن',
                orderNumber: order.orderNumber || order.id,
                recipient: order.recipient,
                phone: order.phone,
                address: order.address,
                city: order.city,
                region: order.region,
                cod: order.cod,
                merchant: order.merchant,
                date: order.date,
                notes: order.notes,
                barcode: order.id
            };

            // إنشاء HTML للمعاينة
            const html = createStandardPolicyHTML(policyData, {
                width: paperDimensions.width,
                height: paperDimensions.height
            });

            // إنشاء معاينة
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            setPdfUrl(createPdfPreview(html));
        } catch (error) {
            console.error('Preview generation error:', error);
            toast({ variant: 'destructive', title: 'فشل في إنشاء المعاينة' });
        } finally {
            setIsExporting(false);
        }
    };

    // إنشاء المعاينة عند تحميل المكون
    useEffect(() => {
        if (displayOrders.length > 0) {
            const timer = setTimeout(() => createPreview(), 500);
            return () => clearTimeout(timer);
        }
        return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
    }, [template, displayOrders.length]);

    const handleExport = async () => {
        if (!printAreaRef.current) {
            toast({ variant: "destructive", title: "Error", description: "Cannot find print area." });
            return;
        }
        setIsExporting(true);

        try {
            const order = displayOrders[0];

            // تحويل بيانات الطلب
            const policyData = {
                companyName: context.settings.login?.companyName || 'شركة الشحن',
                orderNumber: order.orderNumber || order.id,
                recipient: order.recipient,
                phone: order.phone,
                address: order.address,
                city: order.city,
                region: order.region,
                cod: order.cod,
                merchant: order.merchant,
                date: order.date,
                notes: order.notes,
                barcode: order.id
            };

            // استخدام الطباعة المحسّنة
            const html = createStandardPolicyHTML(policyData, {
                width: paperDimensions.width,
                height: paperDimensions.height
            });

            const templateName = template?.name || 'standard_pdf';
            await generatePdf(html, `policy_${templateName}_${new Date().toISOString().split('T')[0]}.pdf`);

            toast({ title: "تم! ✅", description: "تم تحميل PDF بنجاح" });
        } catch (error: any) {
            console.error("PDF export error:", error);
            toast({ variant: 'destructive', title: 'فشل في التصدير', description: error.message });
        } finally {
            setIsExporting(false);
        }
    };

    const handleDirectPrint = async (order: Order | null, type: 'zpl' | 'escpos') => {
        if (!order) {
            toast({ variant: 'destructive', title: 'Error', description: 'No order to print' });
            return;
        }
        const companyLogo = context.settings.login.loginLogo || context.settings.login.headerLogo;
        const logos = { companyLogo };
        const printData = `^XA^FO50,50^A0N,50,50^FD${replacePlaceholders('{{recipient}}', order, logos)}^FS^FO50,110^A0N,30,30^FD${replacePlaceholders('{{address}}', order, logos)}^FS^FO50,200^BY3^BCN,100,Y,N,N^FD${replacePlaceholders('{{orderId}}', order, logos)}^FS^XZ`;
        toast({ title: 'Sending to printer...' });
        try {
            await fetchWrapper('/api/print', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, data: printData }) });
            toast({ title: 'Success!', description: 'Print command sent.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Print Failed', description: error.message });
        }
    };

    useImperativeHandle(ref, () => ({
        handleExport,
        handleDirectPrint
    }));

    // Show standard template when no template is provided
    if (!template) {
        if (hideControls) {
            return (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                    <div ref={printAreaRef} style={{ width: `${mmToPx(paperDimensions.width)}px`, height: `${mmToPx(paperDimensions.height)}px`, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backgroundColor: 'white' }}>
                        <PolicyContent order={displayOrders[0]} template={null} />
                    </div>
                </div>
            );
        }

        return (
            <div className="w-full h-full flex flex-col">
                {/* المعاينة */}
                {pdfUrl ? (
                    <div className="flex flex-col h-full">
                        {/* أزرار الطباعة */}
                        <div className="flex gap-3 justify-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b no-print shadow-sm">
                            <Button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105 shadow-md"
                            >
                                <Icon name={isExporting ? "Loader2" : "Download"} className={`ml-2 h-4 w-4 ${isExporting ? "animate-spin" : ""}`} />
                                <span>{isExporting ? "جاري التحضير..." : "📥 تحميل PDF"}</span>
                            </Button>
                            <Button
                                onClick={() => createPreview()}
                                disabled={isExporting}
                                variant="outline"
                                className="border-blue-300 hover:bg-blue-50 transition-all"
                            >
                                <Icon name={isExporting ? "Loader2" : "RefreshCw"} className={`ml-2 h-4 w-4 ${isExporting ? "animate-spin" : ""}`} />
                                <span>تحديث المعاينة</span>
                            </Button>
                        </div>

                        {/* المعاينة */}
                        <iframe
                            src={pdfUrl}
                            style={{ width: '100%', height: '100%', border: 'none', flex: 1, minHeight: '500px' }}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
                        <div ref={printAreaRef} style={{ width: `${mmToPx(paperDimensions.width)}px`, height: `${mmToPx(paperDimensions.height)}px`, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backgroundColor: 'white' }}>
                            <PolicyContent order={displayOrders[0]} template={null} />
                        </div>
                    </div>
                )}

                {/* أزرار عند عدم وجود معاينة */}
                {!pdfUrl && orders.length === 0 && (
                    <div className="text-center mt-4 no-print flex gap-2 justify-center p-4">
                        <Button onClick={() => createPreview()} disabled={isExporting} variant="outline">
                            <Icon name={isExporting ? "Loader2" : "Eye"} className={`ml-2 h-4 w-4 inline ${isExporting ? "animate-spin" : ""}`} />
                            {isExporting ? "جاري المعاينة..." : "معاينة"}
                        </Button>
                        <Button onClick={handleExport} disabled={isExporting}>
                            <Icon name={isExporting ? "Loader2" : "Download"} className={`ml-2 h-4 w-4 inline ${isExporting ? "animate-spin" : ""}`} />
                            {isExporting ? "جاري التحضير..." : "📥 تحميل PDF"}
                        </Button>
                    </div>
                )}

                {/* العنصر المخفي للتقاط */}
                <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                    <div ref={printAreaRef} style={{ width: `${mmToPx(paperDimensions.width)}px`, height: `${mmToPx(paperDimensions.height)}px`, backgroundColor: 'white' }}>
                        <PolicyContent order={displayOrders[0]} template={null} />
                    </div>
                </div>
            </div>
        );
    }

    // عند إخفاء أدوات التحكم، نعرض المعاينة مباشرة
    if (hideControls) {
        return (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                <div ref={printAreaRef} style={{ width: `${mmToPx(paperDimensions.width)}px`, height: `${mmToPx(paperDimensions.height)}px`, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backgroundColor: 'white' }}>
                    <PolicyContent order={displayOrders[0]} template={template} />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col">
            {/* المعاينة */}
            {pdfUrl ? (
                <div className="flex flex-col h-full">
                    {/* أزرار الطباعة */}
                    <div className="flex gap-3 justify-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b no-print shadow-sm">
                        <Button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105 shadow-md"
                        >
                            <Icon name={isExporting ? "Loader2" : "Download"} className={`ml-2 h-4 w-4 ${isExporting ? "animate-spin" : ""}`} />
                            <span>{isExporting ? "جاري التحضير..." : "📥 تحميل PDF"}</span>
                        </Button>
                        <Button
                            onClick={() => createPreview()}
                            disabled={isExporting}
                            variant="outline"
                            className="border-blue-300 hover:bg-blue-50 transition-all"
                        >
                            <Icon name={isExporting ? "Loader2" : "RefreshCw"} className={`ml-2 h-4 w-4 ${isExporting ? "animate-spin" : ""}`} />
                            <span>تحديث المعاينة</span>
                        </Button>
                    </div>

                    {/* المعاينة */}
                    <iframe
                        src={pdfUrl}
                        style={{ width: '100%', height: '100%', border: 'none', flex: 1, minHeight: '500px' }}
                    />
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
            )}

            {/* العنصر المخفي للتقاط */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <div ref={printAreaRef} style={{ width: `${mmToPx(paperDimensions.width)}px`, height: `${mmToPx(paperDimensions.height)}px`, backgroundColor: 'white' }}>
                    <PolicyContent order={displayOrders[0]} template={template} />
                </div>
            </div>
        </div>
    );
});

PrintablePolicy.displayName = 'PrintablePolicy';
