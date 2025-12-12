'use client';

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import type { Order } from '@/store/orders-store';
import { useToast } from '@/hooks/use-toast';
import Barcode from 'react-barcode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

type LabelSize = '100x150' | '100x100' | '75x50' | '60x40' | '50x30';

// تحويل من mm إلى px: 1mm = 3.7795px عند 96 DPI
const LABEL_SIZES = {
    '100x150': { widthMM: 100, heightMM: 150, label: '100×150 ملم (4×6 بوصة)' },
    '100x100': { widthMM: 100, heightMM: 100, label: '100×100 ملم' },
    '75x50': { widthMM: 75, heightMM: 50, label: '75×50 ملم' },
    '60x40': { widthMM: 60, heightMM: 40, label: '60×40 ملم' },
    '50x30': { widthMM: 50, heightMM: 30, label: '50×30 ملم' },
};

type ThermalLabelProps = {
    orders: Order[];
};

export const ThermalLabel = forwardRef(({ orders }: ThermalLabelProps, ref) => {
    const { toast } = useToast();
    const [size, setSize] = useState<LabelSize>('100x150');

    const dimensions = LABEL_SIZES[size];
    const isSmall = size === '60x40' || size === '50x30';
    const isMedium = size === '75x50';
    
    // حساب الأبعاد بالبكسل للعرض (1mm = 3.7795px)
    const widthPx = dimensions.widthMM * 3.7795;
    const heightPx = dimensions.heightMM * 3.7795;

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = async () => {
        try {
            const jsPDF = (await import('jspdf')).default;
            const html2canvas = (await import('html2canvas')).default;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [dimensions.widthMM, dimensions.heightMM],
            });

            const elements = document.querySelectorAll('.thermal-label');

            for (let i = 0; i < elements.length; i++) {
                if (i > 0) pdf.addPage([dimensions.widthMM, dimensions.heightMM], 'portrait');

                const canvas = await html2canvas(elements[i] as HTMLElement, {
                    scale: 3,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                });

                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, dimensions.widthMM, dimensions.heightMM);
            }

            pdf.save(`thermal_labels_${size}_${new Date().toISOString().split('T')[0]}.pdf`);
            toast({ title: 'تم التصدير بنجاح', description: 'تم حفظ البوالص كملف PDF' });
        } catch (error) {
            console.error('Export error:', error);
            toast({
                variant: 'destructive',
                title: 'فشل التصدير',
                description: 'حدث خطأ أثناء تصدير البوالص',
            });
        }
    };

    useImperativeHandle(ref, () => ({
        handlePrint,
        handleExportPDF,
    }));

    if (orders.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-8">
                لا توجد طلبات لطباعتها
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Settings */}
            <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="space-y-2">
                    <Label>حجم البوليصة</Label>
                    <Select value={size} onValueChange={(v) => setSize(v as LabelSize)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(LABEL_SIZES).map(([key, val]) => (
                                <SelectItem key={key} value={key}>
                                    {val.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Labels */}
            <div className="space-y-4">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="thermal-label bg-white mx-auto overflow-hidden"
                        style={{
                            /* الأبعاد بالبكسل للعرض على الشاشة */
                            width: `${widthPx}px`,
                            height: `${heightPx}px`,
                            /* الأبعاد الفعلية للطباعة */
                            maxWidth: `${dimensions.widthMM}mm`,
                            maxHeight: `${dimensions.heightMM}mm`,
                            border: '2px solid black',
                            pageBreakAfter: 'always',
                            fontFamily: 'Arial, sans-serif',
                            boxSizing: 'border-box',
                        }}
                    >
                        {/* Header - مخفي للأحجام الصغيرة */}
                        {!isSmall && !isMedium && (
                            <div style={{ 
                                borderBottom: '2px solid black', 
                                padding: '2mm', 
                                textAlign: 'center', 
                                background: 'black', 
                                color: 'white',
                                fontSize: '3.5mm',
                                fontWeight: 900,
                                lineHeight: 1,
                            }}>
                                بوليصة شحن
                            </div>
                        )}

                        {/* Barcode - محسّن للمقاس */}
                        <div style={{ 
                            borderBottom: '2px solid black', 
                            padding: isMedium ? '1mm' : '2mm', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            background: 'white' 
                        }}>
                            <Barcode
                                value={order.id}
                                width={isMedium ? 1 : isSmall ? 0.8 : 1.5}
                                height={isMedium ? 20 : isSmall ? 15 : 30}
                                fontSize={isMedium ? 8 : isSmall ? 7 : 10}
                                margin={0}
                                background="#ffffff"
                                lineColor="#000000"
                            />
                        </div>

                        {/* Content - محسّن للمساحة */}
                        <div style={{ 
                            padding: isMedium ? '1mm' : '2mm', 
                            fontSize: isMedium ? '2.5mm' : isSmall ? '2mm' : '3mm',
                            lineHeight: 1.2,
                        }}>
                            {/* Order ID */}
                            <div style={{ 
                                border: '1px solid black', 
                                padding: '1mm', 
                                background: 'white',
                                marginBottom: '1mm',
                                textAlign: 'center',
                            }}>
                                <div style={{ 
                                    fontWeight: 900, 
                                    fontSize: isMedium ? '3.5mm' : isSmall ? '3mm' : '4mm' 
                                }}>
                                    #{order.id}
                                </div>
                            </div>

                            {/* Recipient */}
                            <div style={{ 
                                border: '1px solid black', 
                                padding: '1mm', 
                                background: 'white',
                                marginBottom: '1mm',
                            }}>
                                <div style={{ 
                                    fontSize: '2mm', 
                                    fontWeight: 'bold', 
                                    borderBottom: '1px solid black', 
                                    paddingBottom: '0.5mm', 
                                    marginBottom: '0.5mm' 
                                }}>المستلم</div>
                                <div style={{ 
                                    fontWeight: 900, 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    whiteSpace: 'nowrap',
                                    fontSize: isMedium ? '2.8mm' : '3mm',
                                }}>
                                    {order.recipient}
                                </div>
                                <div style={{ 
                                    fontFamily: 'monospace', 
                                    fontWeight: 'bold', 
                                    marginTop: '0.5mm',
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    whiteSpace: 'nowrap',
                                    fontSize: isMedium ? '2.3mm' : '2.5mm',
                                }}>
                                    {order.phone}
                                </div>
                            </div>

                            {/* Address - مختصر للمقاس 75x50 */}
                            <div style={{ 
                                border: '1px solid black', 
                                padding: '1mm', 
                                background: 'white',
                                marginBottom: '1mm',
                            }}>
                                <div style={{ 
                                    fontSize: '2mm', 
                                    fontWeight: 'bold', 
                                    borderBottom: '1px solid black', 
                                    paddingBottom: '0.5mm', 
                                    marginBottom: '0.5mm' 
                                }}>العنوان</div>
                                <div style={{
                                    fontWeight: 'bold',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: isMedium ? 1 : 2,
                                    WebkitBoxOrient: 'vertical',
                                    fontSize: isMedium ? '2.2mm' : '2.5mm',
                                    lineHeight: 1.1,
                                }}>
                                    {order.address}
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '1mm', 
                                    marginTop: '0.5mm', 
                                    fontSize: '2mm', 
                                    fontWeight: 'bold' 
                                }}>
                                    <span style={{ 
                                        border: '1px solid black', 
                                        padding: '0.5mm', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis', 
                                        whiteSpace: 'nowrap',
                                        flex: 1,
                                    }}>{order.city}</span>
                                    <span style={{ 
                                        border: '1px solid black', 
                                        padding: '0.5mm', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis', 
                                        whiteSpace: 'nowrap',
                                        flex: 1,
                                    }}>{order.region}</span>
                                </div>
                            </div>

                            {/* COD & Merchant */}
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr', 
                                gap: '1mm' 
                            }}>
                                <div style={{ 
                                    border: '2px solid black', 
                                    padding: '1mm', 
                                    textAlign: 'center', 
                                    background: 'white' 
                                }}>
                                    <div style={{ fontSize: '2mm', fontWeight: 'bold' }}>المبلغ</div>
                                    <div style={{ 
                                        fontWeight: 900, 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis', 
                                        whiteSpace: 'nowrap',
                                        fontSize: isMedium ? '3mm' : '3.5mm',
                                    }}>
                                        {order.cod} د.أ
                                    </div>
                                </div>
                                <div style={{ 
                                    border: '1px solid black', 
                                    padding: '1mm', 
                                    textAlign: 'center', 
                                    background: 'white' 
                                }}>
                                    <div style={{ fontSize: '2mm', fontWeight: 'bold' }}>التاجر</div>
                                    <div style={{ 
                                        fontWeight: 'bold', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis', 
                                        whiteSpace: 'nowrap',
                                        fontSize: '2.2mm',
                                    }}>
                                        {order.merchant}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Print Styles - محسّن للطباعة الحرارية */}
            <style jsx global>{`
                @media print {
                    /* إخفاء كل شيء ما عدا البوليصة */
                    body * {
                        visibility: hidden;
                    }
                    .thermal-label,
                    .thermal-label * {
                        visibility: visible;
                    }
                    
                    /* وضع البوليصة في أعلى الصفحة بدون هوامش */
                    .thermal-label {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        page-break-after: always;
                        box-sizing: border-box !important;
                    }
                    
                    /* إزالة جميع الهوامش من الصفحة */
                    @page {
                        size: ${dimensions.widthMM}mm ${dimensions.heightMM}mm;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    
                    /* التأكد من عدم تجاوز المحتوى */
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: ${dimensions.widthMM}mm !important;
                        height: ${dimensions.heightMM}mm !important;
                        overflow: hidden !important;
                    }
                }
            `}</style>
        </div>
    );
});

ThermalLabel.displayName = 'ThermalLabel';
