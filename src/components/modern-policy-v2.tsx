'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import type { Order } from '@/store/orders-store';
import { useToast } from '@/hooks/use-toast';
import Barcode from 'react-barcode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

type PolicySize = 
    | '100x150-portrait' | '100x150-landscape'
    | '100x100-portrait'
    | '75x50-portrait' | '75x50-landscape'
    | '60x40-portrait' | '60x40-landscape'
    | 'a4-portrait' | 'a4-landscape';

const POLICY_SIZES: Record<PolicySize, { widthMM: number; heightMM: number; label: string }> = {
    'a4-portrait': { widthMM: 210, heightMM: 297, label: 'A4 - عمودي' },
    'a4-landscape': { widthMM: 297, heightMM: 210, label: 'A4 - أفقي' },
    '100x150-portrait': { widthMM: 100, heightMM: 150, label: '100×150 ملم - عمودي' },
    '100x150-landscape': { widthMM: 150, heightMM: 100, label: '100×150 ملم - أفقي' },
    '100x100-portrait': { widthMM: 100, heightMM: 100, label: '100×100 ملم' },
    '75x50-portrait': { widthMM: 75, heightMM: 50, label: '75×50 ملم - عمودي' },
    '75x50-landscape': { widthMM: 50, heightMM: 75, label: '75×50 ملم - أفقي' },
    '60x40-portrait': { widthMM: 60, heightMM: 40, label: '60×40 ملم - عمودي' },
    '60x40-landscape': { widthMM: 40, heightMM: 60, label: '60×40 ملم - أفقي' },
};

type ModernPolicyV2Props = {
    orders: Order[];
};

export const ModernPolicyV2 = forwardRef<
    { handlePrint: () => void; handleExportPDF: () => Promise<void> },
    ModernPolicyV2Props
>(({ orders }, ref) => {
    const { toast } = useToast();
    const [size, setSize] = useState<PolicySize>('100x150-portrait');

    const dimensions = POLICY_SIZES[size];
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

            const elements = document.querySelectorAll('.policy-page-v2');

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

            pdf.save(`policy_${size}_${new Date().toISOString().split('T')[0]}.pdf`);
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

    const renderPolicy = (order: Order) => {
        const baseStyle = {
            width: `${widthPx}px`,
            height: `${heightPx}px`,
            border: '2px solid #ddd',
            background: 'white',
            overflow: 'hidden',
            boxSizing: 'border-box' as const,
            pageBreakAfter: 'always' as const,
        };

        // A4 عمودي
        if (size === 'a4-portrait') {
            return (
                <div key={order.id} className="policy-page-v2" style={baseStyle}>
                    <div style={{ borderBottom: '4px solid #2563eb', padding: '12px', textAlign: 'center', background: '#eff6ff' }}>
                        <Barcode value={order.id} width={2.2} height={65} fontSize={17} margin={0} />
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '20px', margin: '15px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>المبلغ المطلوب</div>
                        <div style={{ fontSize: '40px', fontWeight: 900, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">{order.cod} د.أ</div>
                    </div>
                    <div style={{ padding: '15px' }}>
                        <div style={{ background: '#1e40af', color: 'white', padding: '10px', marginBottom: '10px', borderRadius: '6px', textAlign: 'center', fontSize: '20px', fontWeight: 900, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">#{order.id}</div>
                        <div style={{ background: '#dbeafe', border: '3px solid #2563eb', borderRight: '6px solid #2563eb', padding: '10px', marginBottom: '10px', borderRadius: '6px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>المستلم</div>
                            <div style={{ fontSize: '18px', fontWeight: 900, color: '#1e293b' }}>{order.recipient}</div>
                            <div style={{ fontSize: '14px', color: '#475569', marginTop: '4px', fontFamily: 'monospace', fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">📱 {order.phone}</div>
                        </div>
                        <div style={{ border: '2px solid #e2e8f0', background: '#f8fafc', padding: '10px', marginBottom: '10px', borderRadius: '6px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>العنوان</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', lineHeight: 1.4 }}>{order.address}</div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <span style={{ background: 'white', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>📍 {order.city}</span>
                                <span style={{ background: 'white', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{order.region}</span>
                            </div>
                        </div>
                        <div style={{ background: '#f3e8ff', border: '2px solid #a855f7', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>التاجر</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#7c3aed' }}>{order.merchant}</div>
                        </div>
                    </div>
                    <div style={{ background: '#1e293b', color: 'white', padding: '8px', textAlign: 'center', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">{order.date} | #{order.id}</div>
                    </div>
                </div>
            );
        }

        // 100×150 عمودي ملون
        if (size === '100x150-portrait') {
            return (
                <div key={order.id} className="policy-page-v2" style={baseStyle}>
                    <div style={{ borderBottom: '3px solid #2563eb', padding: '8px', textAlign: 'center', background: '#eff6ff' }}>
                        <Barcode value={order.id} width={2} height={48} fontSize={13} margin={0} />
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '12px', margin: '8px', borderRadius: '6px', textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>المبلغ المطلوب</div>
                        <div style={{ fontSize: '32px', fontWeight: 900 }}>{order.cod} د.أ</div>
                    </div>
                    <div style={{ padding: '8px' }}>
                        <div style={{ background: '#1e40af', color: 'white', padding: '6px', marginBottom: '6px', borderRadius: '4px', textAlign: 'center', fontSize: '16px', fontWeight: 900 }}>#{order.id}</div>
                        <div style={{ background: '#dbeafe', border: '2px solid #2563eb', borderRight: '4px solid #2563eb', padding: '6px', marginBottom: '6px', borderRadius: '4px' }}>
                            <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>المستلم</div>
                            <div style={{ fontSize: '14px', fontWeight: 900 }}>{order.recipient}</div>
                            <div style={{ fontSize: '11px', marginTop: '2px', fontFamily: 'monospace' }}>📱 {order.phone}</div>
                        </div>
                        <div style={{ border: '2px solid #e2e8f0', background: '#f8fafc', padding: '6px', marginBottom: '6px', borderRadius: '4px' }}>
                            <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>العنوان</div>
                            <div style={{ fontSize: '11px', fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{order.address}</div>
                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                <span style={{ background: 'white', border: '1px solid #cbd5e1', padding: '2px 4px', borderRadius: '3px', fontSize: '10px', fontWeight: 600, flex: 1, textAlign: 'center' }}>📍 {order.city}</span>
                                <span style={{ background: 'white', border: '1px solid #cbd5e1', padding: '2px 4px', borderRadius: '3px', fontSize: '10px', flex: 1, textAlign: 'center' }}>{order.region}</span>
                            </div>
                        </div>
                        <div style={{ background: '#f3e8ff', border: '2px solid #a855f7', padding: '6px', borderRadius: '4px', textAlign: 'center' }}>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>التاجر</div>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#7c3aed' }}>{order.merchant}</div>
                        </div>
                    </div>
                    <div style={{ background: '#1e293b', color: 'white', padding: '6px', textAlign: 'center', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                        <div style={{ fontSize: '10px', fontWeight: 600 }}><span dir="ltr">{order.date}</span> | #{order.id}</div>
                    </div>
                </div>
            );
        }

        // 75×50 عمودي ملون
        if (size === '75x50-portrait') {
            return (
                <div key={order.id} className="policy-page-v2" style={baseStyle}>
                    <div style={{ borderBottom: '2px solid #2563eb', padding: '5px', textAlign: 'center', background: '#eff6ff' }}>
                        <Barcode value={order.id} width={1} height={20} fontSize={8} margin={0} />
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '6px', margin: '4px', borderRadius: '4px', textAlign: 'center' }}>
                        <div style={{ fontSize: '8px', fontWeight: 'bold' }}>المبلغ</div>
                        <div style={{ fontSize: '18px', fontWeight: 900 }}>{order.cod} د.أ</div>
                    </div>
                    <div style={{ padding: '4px' }}>
                        <div style={{ background: '#1e40af', color: 'white', padding: '3px', marginBottom: '3px', borderRadius: '3px', textAlign: 'center', fontSize: '10px', fontWeight: 900 }}>#{order.id}</div>
                        <div style={{ background: '#dbeafe', border: '2px solid #2563eb', padding: '3px', marginBottom: '3px', borderRadius: '3px' }}>
                            <div style={{ fontSize: '8px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.recipient}</div>
                            <div style={{ fontSize: '7px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📱 {order.phone}</div>
                        </div>
                        <div style={{ border: '1px solid #e2e8f0', background: '#f8fafc', padding: '3px', marginBottom: '3px', borderRadius: '3px' }}>
                            <div style={{ fontSize: '7px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.address}</div>
                            <div style={{ fontSize: '6px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {order.city}</div>
                        </div>
                        <div style={{ background: '#f3e8ff', border: '1px solid #a855f7', padding: '3px', borderRadius: '3px', textAlign: 'center', fontSize: '7px', fontWeight: 'bold', color: '#7c3aed' }}>{order.merchant}</div>
                    </div>
                </div>
            );
        }

        // A4 أفقي
        if (size === 'a4-landscape') {
            return (
                <div key={order.id} className="policy-page-v2" style={baseStyle}>
                    <div style={{ display: 'flex', height: '100%' }}>
                        <div style={{ flex: '0 0 40%', borderLeft: '4px solid #2563eb', background: '#eff6ff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '15px' }}>
                            <Barcode value={order.id} width={2.5} height={80} fontSize={18} margin={0} />
                            <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '20px', marginTop: '15px', borderRadius: '8px', textAlign: 'center', width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>المبلغ المطلوب</div>
                                <div style={{ fontSize: '42px', fontWeight: 900, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">{order.cod} د.أ</div>
                            </div>
                        </div>
                        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ background: '#1e40af', color: 'white', padding: '12px', marginBottom: '12px', borderRadius: '6px', textAlign: 'center', fontSize: '22px', fontWeight: 900, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">#{order.id}</div>
                                <div style={{ background: '#dbeafe', border: '3px solid #2563eb', borderRight: '6px solid #2563eb', padding: '12px', marginBottom: '12px', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>المستلم</div>
                                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b' }}>{order.recipient}</div>
                                    <div style={{ fontSize: '16px', color: '#475569', marginTop: '6px', fontFamily: 'monospace', fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">📱 {order.phone}</div>
                                </div>
                                <div style={{ border: '2px solid #e2e8f0', background: '#f8fafc', padding: '12px', marginBottom: '12px', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>العنوان</div>
                                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', lineHeight: 1.4 }}>{order.address}</div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <span style={{ background: 'white', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: 600 }}>📍 {order.city}</span>
                                        <span style={{ background: 'white', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '4px', fontSize: '13px' }}>{order.region}</span>
                                    </div>
                                </div>
                                <div style={{ background: '#f3e8ff', border: '2px solid #a855f7', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>التاجر</div>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#7c3aed' }}>{order.merchant}</div>
                                </div>
                            </div>
                            <div style={{ background: '#1e293b', color: 'white', padding: '10px', textAlign: 'center', borderRadius: '6px', marginTop: '10px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} dir="ltr">{order.date} | #{order.id}</div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // 100×150 أفقي
        if (size === '100x150-landscape') {
            return (
                <div key={order.id} className="policy-page-v2" style={baseStyle}>
                    <div style={{ display: 'flex', height: '100%' }}>
                        <div style={{ flex: '0 0 45%', borderLeft: '3px solid #2563eb', background: '#eff6ff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '8px' }}>
                            <Barcode value={order.id} width={1.8} height={45} fontSize={12} margin={0} />
                            <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '10px', marginTop: '8px', borderRadius: '6px', textAlign: 'center', width: '100%' }}>
                                <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>المبلغ المطلوب</div>
                                <div style={{ fontSize: '28px', fontWeight: 900 }}>{order.cod} د.أ</div>
                            </div>
                        </div>
                        <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ background: '#1e40af', color: 'white', padding: '5px', marginBottom: '5px', borderRadius: '4px', textAlign: 'center', fontSize: '14px', fontWeight: 900 }}>#{order.id}</div>
                                <div style={{ background: '#dbeafe', border: '2px solid #2563eb', borderRight: '4px solid #2563eb', padding: '5px', marginBottom: '5px', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>المستلم</div>
                                    <div style={{ fontSize: '13px', fontWeight: 900 }}>{order.recipient}</div>
                                    <div style={{ fontSize: '10px', marginTop: '2px', fontFamily: 'monospace' }}>📱 {order.phone}</div>
                                </div>
                                <div style={{ border: '2px solid #e2e8f0', background: '#f8fafc', padding: '5px', marginBottom: '5px', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>العنوان</div>
                                    <div style={{ fontSize: '10px', fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{order.address}</div>
                                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                        <span style={{ background: 'white', border: '1px solid #cbd5e1', padding: '2px 4px', borderRadius: '3px', fontSize: '9px', fontWeight: 600, flex: 1, textAlign: 'center' }}>📍 {order.city}</span>
                                        <span style={{ background: 'white', border: '1px solid #cbd5e1', padding: '2px 4px', borderRadius: '3px', fontSize: '9px', flex: 1, textAlign: 'center' }}>{order.region}</span>
                                    </div>
                                </div>
                                <div style={{ background: '#f3e8ff', border: '2px solid #a855f7', padding: '5px', borderRadius: '4px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '9px', color: '#64748b' }}>التاجر</div>
                                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#7c3aed' }}>{order.merchant}</div>
                                </div>
                            </div>
                            <div style={{ background: '#1e293b', color: 'white', padding: '4px', textAlign: 'center', borderRadius: '4px' }}>
                                <div style={{ fontSize: '9px', fontWeight: 600 }}><span dir="ltr">{order.date}</span> | #{order.id}</div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // 100×100 مربع
        if (size === '100x100-portrait') {
            return (
                <div key={order.id} className="policy-page-v2" style={baseStyle}>
                    <div style={{ borderBottom: '3px solid #2563eb', padding: '6px', textAlign: 'center', background: '#eff6ff' }}>
                        <Barcode value={order.id} width={1.8} height={35} fontSize={11} margin={0} />
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '10px', margin: '6px', borderRadius: '6px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '3px' }}>المبلغ المطلوب</div>
                        <div style={{ fontSize: '28px', fontWeight: 900 }}>{order.cod} د.أ</div>
                    </div>
                    <div style={{ padding: '6px' }}>
                        <div style={{ background: '#1e40af', color: 'white', padding: '5px', marginBottom: '5px', borderRadius: '4px', textAlign: 'center', fontSize: '14px', fontWeight: 900 }}>#{order.id}</div>
                        <div style={{ background: '#dbeafe', border: '2px solid #2563eb', borderRight: '4px solid #2563eb', padding: '5px', marginBottom: '5px', borderRadius: '4px' }}>
                            <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>المستلم</div>
                            <div style={{ fontSize: '12px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.recipient}</div>
                            <div style={{ fontSize: '10px', marginTop: '2px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📱 {order.phone}</div>
                        </div>
                        <div style={{ border: '2px solid #e2e8f0', background: '#f8fafc', padding: '5px', marginBottom: '5px', borderRadius: '4px' }}>
                            <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>العنوان</div>
                            <div style={{ fontSize: '10px', fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{order.address}</div>
                            <div style={{ display: 'flex', gap: '3px', marginTop: '3px' }}>
                                <span style={{ background: 'white', border: '1px solid #cbd5e1', padding: '2px 4px', borderRadius: '3px', fontSize: '9px', fontWeight: 600, flex: 1, textAlign: 'center' }}>📍 {order.city}</span>
                                <span style={{ background: 'white', border: '1px solid #cbd5e1', padding: '2px 4px', borderRadius: '3px', fontSize: '9px', flex: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.region}</span>
                            </div>
                        </div>
                        <div style={{ background: '#f3e8ff', border: '2px solid #a855f7', padding: '5px', borderRadius: '4px', textAlign: 'center' }}>
                            <div style={{ fontSize: '9px', color: '#64748b' }}>التاجر</div>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#7c3aed', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.merchant}</div>
                        </div>
                    </div>
                    <div style={{ background: '#1e293b', color: 'white', padding: '5px', textAlign: 'center', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                        <div style={{ fontSize: '9px', fontWeight: 600 }}><span dir="ltr">{order.date}</span></div>
                    </div>
                </div>
            );
        }

        // 75×50 أفقي
        if (size === '75x50-landscape') {
            return (
                <div key={order.id} className="policy-page-v2" style={baseStyle}>
                    <div style={{ display: 'flex', height: '100%' }}>
                        <div style={{ flex: '0 0 40%', borderLeft: '2px solid #2563eb', background: '#eff6ff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4px' }}>
                            <Barcode value={order.id} width={0.8} height={18} fontSize={7} margin={0} />
                            <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '4px', marginTop: '3px', borderRadius: '3px', textAlign: 'center', width: '100%' }}>
                                <div style={{ fontSize: '6px', fontWeight: 'bold' }}>المبلغ</div>
                                <div style={{ fontSize: '14px', fontWeight: 900 }}>{order.cod} د.أ</div>
                            </div>
                        </div>
                        <div style={{ flex: 1, padding: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ background: '#1e40af', color: 'white', padding: '2px', marginBottom: '2px', borderRadius: '2px', textAlign: 'center', fontSize: '8px', fontWeight: 900 }}>#{order.id}</div>
                                <div style={{ background: '#dbeafe', border: '1px solid #2563eb', padding: '2px', marginBottom: '2px', borderRadius: '2px' }}>
                                    <div style={{ fontSize: '7px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.recipient}</div>
                                    <div style={{ fontSize: '6px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📱 {order.phone}</div>
                                </div>
                                <div style={{ border: '1px solid #e2e8f0', background: '#f8fafc', padding: '2px', marginBottom: '2px', borderRadius: '2px' }}>
                                    <div style={{ fontSize: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.address}</div>
                                    <div style={{ fontSize: '5px', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {order.city}</div>
                                </div>
                                <div style={{ background: '#f3e8ff', border: '1px solid #a855f7', padding: '2px', borderRadius: '2px', textAlign: 'center', fontSize: '6px', fontWeight: 'bold', color: '#7c3aed', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.merchant}</div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // 60×40 عمودي
        if (size === '60x40-portrait') {
            return (
                <div key={order.id} className="policy-page-v2" style={baseStyle}>
                    <div style={{ borderBottom: '2px solid #2563eb', padding: '3px', textAlign: 'center', background: '#eff6ff' }}>
                        <Barcode value={order.id} width={0.8} height={15} fontSize={6} margin={0} />
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '4px', margin: '3px', borderRadius: '3px', textAlign: 'center' }}>
                        <div style={{ fontSize: '6px', fontWeight: 'bold' }}>المبلغ</div>
                        <div style={{ fontSize: '14px', fontWeight: 900 }}>{order.cod} د.أ</div>
                    </div>
                    <div style={{ padding: '3px' }}>
                        <div style={{ background: '#1e40af', color: 'white', padding: '2px', marginBottom: '2px', borderRadius: '2px', textAlign: 'center', fontSize: '8px', fontWeight: 900 }}>#{order.id}</div>
                        <div style={{ background: '#dbeafe', border: '1px solid #2563eb', padding: '2px', marginBottom: '2px', borderRadius: '2px' }}>
                            <div style={{ fontSize: '7px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.recipient}</div>
                            <div style={{ fontSize: '6px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📱 {order.phone}</div>
                        </div>
                        <div style={{ border: '1px solid #e2e8f0', background: '#f8fafc', padding: '2px', marginBottom: '2px', borderRadius: '2px' }}>
                            <div style={{ fontSize: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.address}</div>
                            <div style={{ fontSize: '5px', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {order.city}</div>
                        </div>
                        <div style={{ background: '#f3e8ff', border: '1px solid #a855f7', padding: '2px', borderRadius: '2px', textAlign: 'center', fontSize: '6px', fontWeight: 'bold', color: '#7c3aed', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.merchant}</div>
                    </div>
                </div>
            );
        }

        // 60×40 أفقي
        if (size === '60x40-landscape') {
            return (
                <div key={order.id} className="policy-page-v2" style={baseStyle}>
                    <div style={{ display: 'flex', height: '100%' }}>
                        <div style={{ flex: '0 0 35%', borderLeft: '2px solid #2563eb', background: '#eff6ff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3px' }}>
                            <Barcode value={order.id} width={0.6} height={12} fontSize={5} margin={0} />
                            <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '3px', marginTop: '2px', borderRadius: '2px', textAlign: 'center', width: '100%' }}>
                                <div style={{ fontSize: '5px', fontWeight: 'bold' }}>المبلغ</div>
                                <div style={{ fontSize: '11px', fontWeight: 900 }}>{order.cod} د.أ</div>
                            </div>
                        </div>
                        <div style={{ flex: 1, padding: '3px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ background: '#1e40af', color: 'white', padding: '2px', marginBottom: '2px', borderRadius: '2px', textAlign: 'center', fontSize: '7px', fontWeight: 900 }}>#{order.id}</div>
                                <div style={{ background: '#dbeafe', border: '1px solid #2563eb', padding: '2px', marginBottom: '2px', borderRadius: '2px' }}>
                                    <div style={{ fontSize: '6px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.recipient}</div>
                                    <div style={{ fontSize: '5px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📱 {order.phone}</div>
                                </div>
                                <div style={{ border: '1px solid #e2e8f0', background: '#f8fafc', padding: '2px', marginBottom: '2px', borderRadius: '2px' }}>
                                    <div style={{ fontSize: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.address}</div>
                                    <div style={{ fontSize: '5px', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {order.city}</div>
                                </div>
                                <div style={{ background: '#f3e8ff', border: '1px solid #a855f7', padding: '2px', borderRadius: '2px', textAlign: 'center', fontSize: '5px', fontWeight: 'bold', color: '#7c3aed', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.merchant}</div>
                            </div>
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
                <Select value={size} onValueChange={(v) => setSize(v as PolicySize)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(POLICY_SIZES).map(([key, val]) => (
                            <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-4">
                {orders.map(renderPolicy)}
            </div>

            <style jsx global>{`
                .policy-page-v2 {
                    font-variant-numeric: lining-nums;
                    position: relative;
                }
                .policy-page-v2 * {
                    font-feature-settings: "lnum" 1;
                }
                @media print {
                    body * { visibility: hidden; }
                    .policy-page-v2, .policy-page-v2 * { visibility: visible; }
                    .policy-page-v2 {
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

ModernPolicyV2.displayName = 'ModernPolicyV2';
