'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import type { Order } from '@/store/orders-store';
import { useToast } from '@/hooks/use-toast';
import Barcode from 'react-barcode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

type PolicySize = '100x150' | '100x100' | '75x50' | '60x40' | '50x30';
type PolicyOrientation = 'portrait' | 'landscape';

const POLICY_SIZES = {
    '100x150': { widthMM: 100, heightMM: 150, label: '100×150 ملم (4×6 بوصة)' },
    '100x100': { widthMM: 100, heightMM: 100, label: '100×100 ملم (مربع)' },
    '75x50': { widthMM: 75, heightMM: 50, label: '75×50 ملم' },
    '60x40': { widthMM: 60, heightMM: 40, label: '60×40 ملم' },
    '50x30': { widthMM: 50, heightMM: 30, label: '50×30 ملم' },
};

type ThermalPolicyProps = {
    orders: Order[];
};

export const ThermalPolicy = forwardRef<{ handlePrint: () => void; handleExportPDF: () => Promise<void> }, ThermalPolicyProps>(
    ({ orders }, ref) => {
        const { toast } = useToast();
        const [size, setSize] = useState<PolicySize>('100x150');
        const [orientation, setOrientation] = useState<PolicyOrientation>('portrait');

        const dimensions = POLICY_SIZES[size];
        const widthMM = orientation === 'portrait' ? dimensions.widthMM : dimensions.heightMM;
        const heightMM = orientation === 'portrait' ? dimensions.heightMM : dimensions.widthMM;
        const widthPx = widthMM * 3.7795;
        const heightPx = heightMM * 3.7795;

        const handlePrint = () => {
            window.print();
        };

        const handleExportPDF = async () => {
            try {
                const jsPDF = (await import('jspdf')).default;
                const html2canvas = (await import('html2canvas')).default;

                const pdf = new jsPDF({
                    orientation: orientation,
                    unit: 'mm',
                    format: [widthMM, heightMM],
                });

                const elements = document.querySelectorAll('.thermal-policy-page');

                for (let i = 0; i < elements.length; i++) {
                    if (i > 0) pdf.addPage([widthMM, heightMM], orientation);

                    const canvas = await html2canvas(elements[i] as HTMLElement, {
                        scale: 3,
                        useCORS: true,
                        backgroundColor: '#ffffff',
                    });

                    const imgData = canvas.toDataURL('image/png');
                    pdf.addImage(imgData, 'PNG', 0, 0, widthMM, heightMM);
                }

                pdf.save(`thermal_${size}_${orientation}_${new Date().toISOString().split('T')[0]}.pdf`);
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

        // تصميم مخصص لكل مقاس - الباركود والسعر أولوية
        const renderPolicy = (order: Order) => {
            const baseStyle = {
                width: `${widthPx}px`,
                height: `${heightPx}px`,
                border: '2px solid black',
                background: 'white',
                fontFamily: 'Arial, sans-serif',
                overflow: 'hidden',
                boxSizing: 'border-box' as const,
                pageBreakAfter: 'always' as const,
                display: 'flex',
                flexDirection: 'column' as const,
            };

            // 100×150 ملم - كامل المميزات
            if (size === '100x150') {
                return (
                    <div key={order.id} className="thermal-policy-page" style={baseStyle}>
                        {/* Barcode - كبير وموسط */}
                        <div style={{ borderBottom: '2px solid black', padding: '3mm', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Barcode value={order.id} width={2.2} height={45} fontSize={13} margin={0} />
                        </div>
                        
                        {/* السعر - كبير جداً */}
                        <div style={{ border: '3px solid black', padding: '3mm', margin: '2mm', textAlign: 'center' }}>
                            <div style={{ fontSize: '3.5mm', fontWeight: 'bold', marginBottom: '1mm' }}>المبلغ المطلوب</div>
                            <div style={{ fontSize: '9mm', fontWeight: 900, lineHeight: 1.1, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">{order.cod} د.أ</div>
                        </div>
                        
                        <div style={{ padding: '2mm', flex: 1 }}>
                            {/* رقم الطلب */}
                            <div style={{ border: '2px solid black', padding: '1.5mm', marginBottom: '1.5mm', textAlign: 'center', fontSize: '4.5mm', fontWeight: 900, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">
                                #{order.id}
                            </div>
                            
                            {/* المستلم */}
                            <div style={{ border: '1px solid black', padding: '1.5mm', marginBottom: '1.5mm' }}>
                                <div style={{ fontSize: '2.8mm', fontWeight: 'bold', marginBottom: '0.8mm' }}>المستلم</div>
                                <div style={{ fontSize: '3.8mm', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.recipient}</div>
                                <div style={{ fontSize: '3.2mm', fontFamily: 'monospace', marginTop: '0.8mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">{order.phone}</div>
                            </div>
                            
                            {/* العنوان */}
                            <div style={{ border: '1px solid black', padding: '1.5mm', marginBottom: '1.5mm' }}>
                                <div style={{ fontSize: '2.8mm', fontWeight: 'bold', marginBottom: '0.8mm' }}>العنوان</div>
                                <div style={{ fontSize: '3.2mm', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{order.address}</div>
                                <div style={{ display: 'flex', gap: '1.5mm', marginTop: '1.5mm', fontSize: '2.8mm' }}>
                                    <span style={{ border: '1px solid black', padding: '0.8mm', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{order.city}</span>
                                    <span style={{ border: '1px solid black', padding: '0.8mm', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{order.region}</span>
                                </div>
                            </div>
                            
                            {/* التاجر والتاريخ */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5mm' }}>
                                <div style={{ border: '1px solid black', padding: '1.5mm', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2.3mm', fontWeight: 'bold' }}>التاجر</div>
                                    <div style={{ fontSize: '2.8mm', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.merchant}</div>
                                </div>
                                <div style={{ border: '1px solid black', padding: '1.5mm', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2.3mm', fontWeight: 'bold' }}>التاريخ</div>
                                    <div style={{ fontSize: '2.8mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">{order.date}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            // 100×100 ملم - مربع
            if (size === '100x100') {
                return (
                    <div key={order.id} className="thermal-policy-page" style={baseStyle}>
                        {/* Barcode - موسط */}
                        <div style={{ borderBottom: '2px solid black', padding: '2mm 1.5mm', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Barcode value={order.id} width={1.8} height={32} fontSize={10} margin={0} />
                        </div>
                        
                        {/* السعر - كبير */}
                        <div style={{ border: '2px solid black', padding: '2mm', margin: '1.5mm', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5mm', fontWeight: 'bold' }}>المبلغ</div>
                            <div style={{ fontSize: '6mm', fontWeight: 900, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">{order.cod} د.أ</div>
                        </div>
                        
                        <div style={{ padding: '1.5mm', flex: 1 }}>
                            <div style={{ border: '1px solid black', padding: '1mm', marginBottom: '1mm', textAlign: 'center', fontSize: '3.5mm', fontWeight: 900, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">
                                #{order.id}
                            </div>
                            
                            <div style={{ border: '1px solid black', padding: '1mm', marginBottom: '1mm' }}>
                                <div style={{ fontSize: '2.2mm', fontWeight: 'bold' }}>المستلم</div>
                                <div style={{ fontSize: '3mm', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.recipient}</div>
                                <div style={{ fontSize: '2.5mm', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">{order.phone}</div>
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

            // 75×50 ملم - مضغوط
            if (size === '75x50') {
                return (
                    <div key={order.id} className="thermal-policy-page" style={baseStyle}>
                        {/* Barcode - موسط */}
                        <div style={{ borderBottom: '1px solid black', padding: '1.2mm 1mm', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Barcode value={order.id} width={1.1} height={20} fontSize={8} margin={0} />
                        </div>
                        
                        {/* السعر */}
                        <div style={{ border: '2px solid black', padding: '1.2mm', margin: '0.8mm', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.8mm', fontWeight: 'bold' }}>المبلغ</div>
                            <div style={{ fontSize: '4.5mm', fontWeight: 900, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">{order.cod} د.أ</div>
                        </div>
                        
                        <div style={{ padding: '0.8mm', flex: 1 }}>
                            <div style={{ border: '1px solid black', padding: '0.6mm', marginBottom: '0.6mm', textAlign: 'center', fontSize: '2.2mm', fontWeight: 900, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">
                                #{order.id}
                            </div>
                            
                            <div style={{ border: '1px solid black', padding: '0.6mm', marginBottom: '0.6mm' }}>
                                <div style={{ fontSize: '2.2mm', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.recipient}</div>
                                <div style={{ fontSize: '1.8mm', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">{order.phone}</div>
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

            // 60×40 ملم - صغير
            if (size === '60x40') {
                return (
                    <div key={order.id} className="thermal-policy-page" style={baseStyle}>
                        {/* Barcode - موسط */}
                        <div style={{ borderBottom: '1px solid black', padding: '0.7mm 0.5mm', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Barcode value={order.id} width={0.9} height={14} fontSize={7} margin={0} />
                        </div>
                        
                        {/* السعر */}
                        <div style={{ border: '1px solid black', padding: '0.8mm', margin: '0.6mm', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.3mm', fontWeight: 'bold' }}>المبلغ</div>
                            <div style={{ fontSize: '3.5mm', fontWeight: 900, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">{order.cod} د.أ</div>
                        </div>
                        
                        <div style={{ padding: '0.6mm', flex: 1 }}>
                            <div style={{ border: '1px solid black', padding: '0.4mm', marginBottom: '0.4mm', textAlign: 'center', fontSize: '1.8mm', fontWeight: 900, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">
                                #{order.id}
                            </div>
                            
                            <div style={{ border: '1px solid black', padding: '0.4mm', marginBottom: '0.4mm' }}>
                                <div style={{ fontSize: '1.8mm', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.recipient}</div>
                                <div style={{ fontSize: '1.5mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">{order.phone}</div>
                            </div>
                            
                            <div style={{ border: '1px solid black', padding: '0.4mm', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.city}</div>
                            </div>
                        </div>
                    </div>
                );
            }

            // 50×30 ملم - الأصغر
            if (size === '50x30') {
                return (
                    <div key={order.id} className="thermal-policy-page" style={baseStyle}>
                        {/* Barcode - موسط */}
                        <div style={{ borderBottom: '1px solid black', padding: '0.4mm 0.3mm', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Barcode value={order.id} width={0.65} height={9} fontSize={5} margin={0} />
                        </div>
                        
                        {/* السعر */}
                        <div style={{ border: '1px solid black', padding: '0.6mm', margin: '0.4mm', textAlign: 'center' }}>
                            <div style={{ fontSize: '3mm', fontWeight: 900, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">{order.cod} د.أ</div>
                        </div>
                        
                        <div style={{ padding: '0.4mm', flex: 1 }}>
                            <div style={{ border: '1px solid black', padding: '0.3mm', marginBottom: '0.3mm', textAlign: 'center', fontSize: '1.6mm', fontWeight: 900, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">
                                #{order.id}
                            </div>
                            
                            <div style={{ fontSize: '1.4mm', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
                                {order.recipient}
                            </div>
                        </div>
                    </div>
                );
            }

            return null;
        };

        return (
            <div className="space-y-6">
                {/* Settings */}
                <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>حجم البوليصة</Label>
                            <Select value={size} onValueChange={(v) => setSize(v as PolicySize)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(POLICY_SIZES).map(([key, val]) => (
                                        <SelectItem key={key} value={key}>
                                            {val.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>الاتجاه</Label>
                            <RadioGroup value={orientation} onValueChange={(v) => setOrientation(v as PolicyOrientation)}>
                                <div className="flex gap-4">
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <RadioGroupItem value="portrait" id="portrait-thermal" />
                                        <Label htmlFor="portrait-thermal">عمودي</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <RadioGroupItem value="landscape" id="landscape-thermal" />
                                        <Label htmlFor="landscape-thermal">أفقي</Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                </div>

                {/* Policies */}
                <div className="space-y-4">
                    {orders.map(renderPolicy)}
                </div>

                {/* Print Styles */}
                <style jsx global>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .thermal-policy-page,
                        .thermal-policy-page * {
                            visibility: visible;
                        }
                        .thermal-policy-page {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            margin: 0 !important;
                        }
                        @page {
                            size: ${widthMM}mm ${heightMM}mm;
                            margin: 0 !important;
                        }
                    }
                `}</style>
            </div>
        );
    }
);

ThermalPolicy.displayName = 'ThermalPolicy';
