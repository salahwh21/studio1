'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import type { Order } from '@/store/orders-store';
import { useToast } from '@/hooks/use-toast';
import Barcode from 'react-barcode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

// قائمة جاهزة: كل مقاس له خيارين (عمودي + أفقي)
type LabelSize = 
    | '100x150-portrait' | '100x150-landscape'
    | '100x100-portrait' 
    | '75x50-portrait' | '75x50-landscape'
    | '60x40-portrait' | '60x40-landscape'
    | '50x30-portrait' | '50x30-landscape';

const LABEL_SIZES: Record<LabelSize, { widthMM: number; heightMM: number; label: string }> = {
    '100x150-portrait': { widthMM: 100, heightMM: 150, label: '100×150 ملم - عمودي' },
    '100x150-landscape': { widthMM: 150, heightMM: 100, label: '100×150 ملم - أفقي' },
    '100x100-portrait': { widthMM: 100, heightMM: 100, label: '100×100 ملم' },
    '75x50-portrait': { widthMM: 75, heightMM: 50, label: '75×50 ملم - عمودي' },
    '75x50-landscape': { widthMM: 50, heightMM: 75, label: '75×50 ملم - أفقي' },
    '60x40-portrait': { widthMM: 60, heightMM: 40, label: '60×40 ملم - عمودي' },
    '60x40-landscape': { widthMM: 40, heightMM: 60, label: '60×40 ملم - أفقي' },
    '50x30-portrait': { widthMM: 50, heightMM: 30, label: '50×30 ملم - عمودي' },
    '50x30-landscape': { widthMM: 30, heightMM: 50, label: '50×30 ملم - أفقي' },
};

type ThermalLabelOptimizedProps = {
    orders: Order[];
};

export const ThermalLabelOptimized = forwardRef<
    { handlePrint: () => void; handleExportPDF: () => Promise<void> },
    ThermalLabelOptimizedProps
>(({ orders }, ref) => {
    const { toast } = useToast();
    const [size, setSize] = useState<LabelSize>('75x50-portrait');

    const dimensions = LABEL_SIZES[size];
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
                orientation: dimensions.widthMM > dimensions.heightMM ? 'landscape' : 'portrait',
                unit: 'mm',
                format: [dimensions.widthMM, dimensions.heightMM],
            });

            const elements = document.querySelectorAll('.thermal-label-opt');

            for (let i = 0; i < elements.length; i++) {
                if (i > 0) pdf.addPage([dimensions.widthMM, dimensions.heightMM]);

                const canvas = await html2canvas(elements[i] as HTMLElement, {
                    scale: 3,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                });

                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, dimensions.widthMM, dimensions.heightMM);
            }

            pdf.save(`thermal_${size}_${new Date().toISOString().split('T')[0]}.pdf`);
            toast({ title: 'تم التصدير بنجاح' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'فشل التصدير' });
        }
    };

    useImperativeHandle(ref, () => ({
        handlePrint,
        handleExportPDF,
    }));

    if (orders.length === 0) {
        return <div className="text-center text-muted-foreground p-8">لا توجد طلبات</div>;
    }

    const renderLabel = (order: Order) => {
        const baseStyle = {
            width: `${widthPx}px`,
            height: `${heightPx}px`,
            border: '2px solid black',
            background: 'white',
            fontFamily: 'Arial, sans-serif',
            overflow: 'hidden',
            boxSizing: 'border-box' as const,
            pageBreakAfter: 'always' as const,
        };

        // تصميم 100×150 عمودي
        if (size === '100x150-portrait') {
            return (
                <div key={order.id} className="thermal-label-opt" style={baseStyle}>
                    <div style={{ borderBottom: '2px solid black', padding: '3mm', textAlign: 'center' }}>
                        <Barcode value={order.id} width={2} height={45} fontSize={13} margin={0} />
                    </div>
                    <div style={{ border: '3px solid black', padding: '3mm', margin: '2mm', textAlign: 'center' }}>
                        <div style={{ fontSize: '3.5mm', fontWeight: 'bold' }}>المبلغ المطلوب</div>
                        <div style={{ fontSize: '9mm', fontWeight: 900 }}>{order.cod} د.أ</div>
                    </div>
                    <div style={{ padding: '2mm' }}>
                        <div style={{ border: '2px solid black', padding: '1.5mm', marginBottom: '1.5mm', textAlign: 'center', fontSize: '4.5mm', fontWeight: 900 }}>
                            #{order.id}
                        </div>
                        <div style={{ border: '1px solid black', padding: '1.5mm', marginBottom: '1.5mm' }}>
                            <div style={{ fontSize: '2.8mm', fontWeight: 'bold' }}>المستلم</div>
                            <div style={{ fontSize: '3.8mm', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.recipient}</div>
                            <div style={{ fontSize: '3.2mm', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.phone}</div>
                        </div>
                        <div style={{ border: '1px solid black', padding: '1.5mm', marginBottom: '1.5mm' }}>
                            <div style={{ fontSize: '2.8mm', fontWeight: 'bold' }}>العنوان</div>
                            <div style={{ fontSize: '3.2mm', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{order.address}</div>
                            <div style={{ display: 'flex', gap: '1.5mm', marginTop: '1.5mm', fontSize: '2.8mm' }}>
                                <span style={{ border: '1px solid black', padding: '0.8mm', flex: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.city}</span>
                                <span style={{ border: '1px solid black', padding: '0.8mm', flex: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.region}</span>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5mm' }}>
                            <div style={{ border: '1px solid black', padding: '1.5mm', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.3mm', fontWeight: 'bold' }}>التاجر</div>
                                <div style={{ fontSize: '2.8mm', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.merchant}</div>
                            </div>
                            <div style={{ border: '1px solid black', padding: '1.5mm', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.3mm', fontWeight: 'bold' }}>التاريخ</div>
                                <div style={{ fontSize: '2.8mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><span dir="ltr">{order.date}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // تصميم 100×150 أفقي
        if (size === '100x150-landscape') {
            return (
                <div key={order.id} className="thermal-label-opt" style={baseStyle}>
                    <div style={{ display: 'flex', height: '100%' }}>
                        <div style={{ width: '40%', borderRight: '2px solid black', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ borderBottom: '2px solid black', padding: '2mm', textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Barcode value={order.id} width={1.5} height={35} fontSize={10} margin={0} />
                            </div>
                            <div style={{ border: '3px solid black', margin: '2mm', padding: '2mm', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ fontSize: '2.5mm', fontWeight: 'bold' }}>المبلغ</div>
                                <div style={{ fontSize: '7mm', fontWeight: 900 }}>{order.cod} د.أ</div>
                            </div>
                        </div>
                        <div style={{ width: '60%', padding: '2mm', display: 'flex', flexDirection: 'column', gap: '1mm' }}>
                            <div style={{ border: '2px solid black', padding: '1mm', textAlign: 'center', fontSize: '3.5mm', fontWeight: 900 }}>#{order.id}</div>
                            <div style={{ border: '1px solid black', padding: '1mm' }}>
                                <div style={{ fontSize: '2.2mm', fontWeight: 'bold' }}>المستلم</div>
                                <div style={{ fontSize: '3mm', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.recipient}</div>
                                <div style={{ fontSize: '2.5mm', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.phone}</div>
                            </div>
                            <div style={{ border: '1px solid black', padding: '1mm', flex: 1 }}>
                                <div style={{ fontSize: '2.2mm', fontWeight: 'bold' }}>العنوان</div>
                                <div style={{ fontSize: '2.5mm', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{order.address}</div>
                                <div style={{ fontSize: '2.2mm', marginTop: '0.5mm' }}>{order.city}</div>
                            </div>
                            <div style={{ border: '1px solid black', padding: '1mm', textAlign: 'center' }}>
                                <span style={{ fontSize: '2mm' }}>التاجر: </span>
                                <span style={{ fontSize: '2.2mm', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.merchant}</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // تصميم 100×100 (مربع)
        if (size === '100x100-portrait') {
            return (
                <div key={order.id} className="thermal-label-opt" style={baseStyle}>
                    <div style={{ borderBottom: '2px solid black', padding: '2mm', textAlign: 'center' }}>
                        <Barcode value={order.id} width={1.6} height={30} fontSize={10} margin={0} />
                    </div>
                    <div style={{ border: '2px solid black', padding: '2mm', margin: '1.5mm', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5mm', fontWeight: 'bold' }}>المبلغ</div>
                        <div style={{ fontSize: '6mm', fontWeight: 900 }}>{order.cod} د.أ</div>
                    </div>
                    <div style={{ padding: '1.5mm' }}>
                        <div style={{ border: '1px solid black', padding: '1mm', marginBottom: '1mm', textAlign: 'center', fontSize: '3.5mm', fontWeight: 900 }}>#{order.id}</div>
                        <div style={{ border: '1px solid black', padding: '1mm', marginBottom: '1mm' }}>
                            <div style={{ fontSize: '2.2mm', fontWeight: 'bold' }}>المستلم</div>
                            <div style={{ fontSize: '3mm', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.recipient}</div>
                            <div style={{ fontSize: '2.5mm', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.phone}</div>
                        </div>
                        <div style={{ border: '1px solid black', padding: '1mm', marginBottom: '1mm' }}>
                            <div style={{ fontSize: '2.2mm', fontWeight: 'bold' }}>العنوان</div>
                            <div style={{ fontSize: '2.5mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.address}</div>
                            <div style={{ fontSize: '2.2mm', marginTop: '0.5mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.city}</div>
                        </div>
                        <div style={{ border: '1px solid black', padding: '0.8mm', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.8mm' }}>التاجر</div>
                            <div style={{ fontSize: '2.2mm', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.merchant}</div>
                        </div>
                    </div>
                </div>
            );
        }

        // تصميم 75×50 عمودي
        if (size === '75x50-portrait') {
            return (
                <div key={order.id} className="thermal-label-opt" style={baseStyle}>
                    <div style={{ borderBottom: '1px solid black', padding: '1mm', textAlign: 'center' }}>
                        <Barcode value={order.id} width={1} height={20} fontSize={8} margin={0} />
                    </div>
                    <div style={{ border: '2px solid black', padding: '1mm', margin: '0.8mm', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8mm', fontWeight: 'bold' }}>المبلغ</div>
                        <div style={{ fontSize: '4.5mm', fontWeight: 900 }}>{order.cod} د.أ</div>
                    </div>
                    <div style={{ padding: '0.8mm' }}>
                        <div style={{ border: '1px solid black', padding: '0.6mm', marginBottom: '0.6mm', textAlign: 'center', fontSize: '2.2mm', fontWeight: 900 }}>#{order.id}</div>
                        <div style={{ border: '1px solid black', padding: '0.6mm', marginBottom: '0.6mm' }}>
                            <div style={{ fontSize: '2.2mm', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.recipient}</div>
                            <div style={{ fontSize: '1.8mm', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.phone}</div>
                        </div>
                        <div style={{ border: '1px solid black', padding: '0.6mm', marginBottom: '0.6mm' }}>
                            <div style={{ fontSize: '1.8mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.address}</div>
                            <div style={{ fontSize: '1.6mm', marginTop: '0.3mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.city}</div>
                        </div>
                        <div style={{ border: '1px solid black', padding: '0.5mm', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.6mm', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.merchant}</div>
                        </div>
                    </div>
                </div>
            );
        }

        // تصميم 75×50 أفقي - بدون فراغات
        if (size === '75x50-landscape') {
            return (
                <div key={order.id} className="thermal-label-opt" style={baseStyle}>
                    <div style={{ borderBottom: '1px solid black', padding: '0.8mm', textAlign: 'center' }}>
                        <Barcode value={order.id} width={0.8} height={16} fontSize={7} margin={0} />
                    </div>
                    <div style={{ border: '2px solid black', padding: '1mm', margin: '0.8mm', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5mm', fontWeight: 'bold' }}>المبلغ</div>
                        <div style={{ fontSize: '4mm', fontWeight: 900 }}>{order.cod} د.أ</div>
                    </div>
                    <div style={{ padding: '0.8mm' }}>
                        <div style={{ border: '1px solid black', padding: '0.5mm', marginBottom: '0.5mm', textAlign: 'center', fontSize: '2mm', fontWeight: 900 }}>#{order.id}</div>
                        <div style={{ border: '1px solid black', padding: '0.5mm', marginBottom: '0.5mm' }}>
                            <div style={{ fontSize: '2mm', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.recipient}</div>
                            <div style={{ fontSize: '1.6mm', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.phone}</div>
                        </div>
                        <div style={{ border: '1px solid black', padding: '0.5mm', marginBottom: '0.5mm' }}>
                            <div style={{ fontSize: '1.6mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.address}</div>
                            <div style={{ fontSize: '1.4mm', marginTop: '0.3mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.city}</div>
                        </div>
                        <div style={{ border: '1px solid black', padding: '0.4mm', textAlign: 'center', fontSize: '1.4mm', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.merchant}</div>
                    </div>
                </div>
            );
        }

        // تصميم 60×40 عمودي
        if (size === '60x40-portrait') {
            return (
                <div key={order.id} className="thermal-label-opt" style={baseStyle}>
                    <div style={{ borderBottom: '1px solid black', padding: '0.6mm', textAlign: 'center' }}>
                        <Barcode value={order.id} width={0.8} height={14} fontSize={7} margin={0} />
                    </div>
                    <div style={{ border: '1px solid black', padding: '0.8mm', margin: '0.6mm', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3mm', fontWeight: 'bold' }}>المبلغ</div>
                        <div style={{ fontSize: '3.2mm', fontWeight: 900 }}>{order.cod} د.أ</div>
                    </div>
                    <div style={{ padding: '0.6mm' }}>
                        <div style={{ border: '1px solid black', padding: '0.4mm', marginBottom: '0.4mm', textAlign: 'center', fontSize: '1.8mm', fontWeight: 900 }}>#{order.id}</div>
                        <div style={{ border: '1px solid black', padding: '0.4mm', marginBottom: '0.4mm' }}>
                            <div style={{ fontSize: '1.8mm', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.recipient}</div>
                            <div style={{ fontSize: '1.5mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.phone}</div>
                        </div>
                        <div style={{ border: '1px solid black', padding: '0.4mm', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.city}</div>
                        </div>
                    </div>
                </div>
            );
        }

        // تصميم 60×40 أفقي
        if (size === '60x40-landscape') {
            return (
                <div key={order.id} className="thermal-label-opt" style={baseStyle}>
                    <div style={{ display: 'flex', height: '100%' }}>
                        <div style={{ width: '30%', borderRight: '1px solid black', padding: '0.8mm', display: 'flex', flexDirection: 'column', gap: '0.6mm' }}>
                            <div style={{ textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Barcode value={order.id} width={0.7} height={14} fontSize={6} margin={0} />
                            </div>
                            <div style={{ border: '1px solid black', padding: '0.6mm', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.2mm', fontWeight: 'bold' }}>المبلغ</div>
                                <div style={{ fontSize: '2.8mm', fontWeight: 900 }}>{order.cod} د.أ</div>
                            </div>
                        </div>
                        <div style={{ width: '70%', padding: '0.8mm', display: 'flex', flexDirection: 'column', gap: '0.5mm' }}>
                            <div style={{ border: '1px solid black', padding: '0.4mm', textAlign: 'center', fontSize: '1.6mm', fontWeight: 900 }}>#{order.id}</div>
                            <div style={{ border: '1px solid black', padding: '0.4mm', flex: 1 }}>
                                <div style={{ fontSize: '1.6mm', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.recipient}</div>
                                <div style={{ fontSize: '1.3mm', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.phone}</div>
                                <div style={{ fontSize: '1.3mm', marginTop: '0.3mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.city}</div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // تصميم 50×30 عمودي
        if (size === '50x30-portrait') {
            return (
                <div key={order.id} className="thermal-label-opt" style={baseStyle}>
                    <div style={{ borderBottom: '1px solid black', padding: '0.4mm', textAlign: 'center' }}>
                        <Barcode value={order.id} width={0.6} height={10} fontSize={6} margin={0} />
                    </div>
                    <div style={{ border: '1px solid black', padding: '0.6mm', margin: '0.4mm', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.8mm', fontWeight: 900 }}>{order.cod} د.أ</div>
                    </div>
                    <div style={{ padding: '0.4mm' }}>
                        <div style={{ border: '1px solid black', padding: '0.3mm', marginBottom: '0.3mm', textAlign: 'center', fontSize: '1.6mm', fontWeight: 900 }}>#{order.id}</div>
                        <div style={{ fontSize: '1.4mm', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{order.recipient}</div>
                    </div>
                </div>
            );
        }

        // تصميم 50×30 أفقي
        if (size === '50x30-landscape') {
            return (
                <div key={order.id} className="thermal-label-opt" style={baseStyle}>
                    <div style={{ display: 'flex', height: '100%' }}>
                        <div style={{ width: '40%', borderRight: '1px solid black', padding: '0.5mm', display: 'flex', flexDirection: 'column', gap: '0.4mm' }}>
                            <div style={{ textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Barcode value={order.id} width={0.5} height={10} fontSize={5} margin={0} />
                            </div>
                            <div style={{ border: '1px solid black', padding: '0.4mm', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.2mm', fontWeight: 900 }}>{order.cod} د.أ</div>
                            </div>
                        </div>
                        <div style={{ width: '60%', padding: '0.5mm', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.4mm' }}>
                            <div style={{ border: '1px solid black', padding: '0.3mm', textAlign: 'center', fontSize: '1.4mm', fontWeight: 900 }}>#{order.id}</div>
                            <div style={{ fontSize: '1.3mm', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{order.recipient}</div>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border">
                <Label>حجم واتجاه البوليصة</Label>
                <Select value={size} onValueChange={(v) => setSize(v as LabelSize)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(LABEL_SIZES).map(([key, val]) => (
                            <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-4">
                {orders.map(renderLabel)}
            </div>

            <style jsx global>{`
                .thermal-label-opt {
                    font-variant-numeric: lining-nums;
                }
                .thermal-label-opt * {
                    font-feature-settings: "lnum" 1;
                }
                @media print {
                    body * { visibility: hidden; }
                    .thermal-label-opt, .thermal-label-opt * { visibility: visible; }
                    .thermal-label-opt {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        margin: 0 !important;
                    }
                    @page {
                        size: ${dimensions.widthMM}mm ${dimensions.heightMM}mm;
                        margin: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
});

ThermalLabelOptimized.displayName = 'ThermalLabelOptimized';
