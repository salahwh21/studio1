'use client';

import { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react';
import type { Order } from '@/store/orders-store';
import { useToast } from '@/hooks/use-toast';
import Barcode from 'react-barcode';
import { Label } from './ui/label';
import { Button } from './ui/button';
import Icon from './icon';
import { useSettings } from '@/contexts/SettingsContext';
import { 
    createStandardPolicyHTML,
    generatePdf,
    generateStandardPolicy
} from '@/services/pdf-service';

type PolicySize = 'a4' | 'a5';
type PolicyOrientation = 'portrait' | 'landscape';

const POLICY_SIZES = {
    'a4': { widthMM: 210, heightMM: 297, label: 'A4 (210×297 مم)' },
    'a5': { widthMM: 148, heightMM: 210, label: 'A5 (148×210 مم)' },
};

// إعدادات التخصيص
export interface ModernPolicyCustomization {
    showBarcode?: boolean;
    showCOD?: boolean;
    showPhone?: boolean;
    showAddress?: boolean;
    showCity?: boolean;
    showRegion?: boolean;
    showMerchant?: boolean;
    showDate?: boolean;
    showNotes?: boolean;
    primaryColor?: string;
    secondaryColor?: string;
    codFontScale?: number;
    bodyFontScale?: number;
}

type ModernPolicyV2Props = {
    orders: Order[];
    customization?: ModernPolicyCustomization;
    hideControls?: boolean;
};

export const ModernPolicyV2 = forwardRef<
    { handlePrint: () => void; handleExportPDF: () => Promise<void> },
    ModernPolicyV2Props
>(({ orders, customization, hideControls }, ref) => {
    const { toast } = useToast();
    const { settings } = useSettings();
    const currencySymbol = settings.regional.currencySymbol;
    
    // إعدادات التخصيص مع القيم الافتراضية
    const custom = {
        showBarcode: customization?.showBarcode ?? true,
        showCOD: customization?.showCOD ?? true,
        showPhone: customization?.showPhone ?? true,
        showAddress: customization?.showAddress ?? true,
        showCity: customization?.showCity ?? true,
        showRegion: customization?.showRegion ?? true,
        showMerchant: customization?.showMerchant ?? true,
        showDate: customization?.showDate ?? true,
        showNotes: customization?.showNotes ?? true,
        primaryColor: customization?.primaryColor ?? '#2563eb',
        secondaryColor: customization?.secondaryColor ?? '#10b981',
        codFontScale: customization?.codFontScale ?? 1,
        bodyFontScale: customization?.bodyFontScale ?? 1,
    };
    
    // Default settings
    const [size, setSize] = useState<PolicySize>('a4');
    const [orientation, setOrientation] = useState<PolicyOrientation>('portrait');
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const policyContainerRef = useRef<HTMLDivElement>(null);

    const dimensions = POLICY_SIZES[size];
    const widthMM = orientation === 'portrait' ? dimensions.widthMM : dimensions.heightMM;
    const heightMM = orientation === 'portrait' ? dimensions.heightMM : dimensions.widthMM;
    const widthPx = widthMM * 3.7795;
    const heightPx = heightMM * 3.7795;

    // إنشاء PDF باستخدام الخدمة الجديدة
    const generatePdfPreviewFn = async () => {
        if (orders.length === 0) return;
        setIsGenerating(true);
        
        try {
            const order = orders[0];
            
            // تحويل بيانات الطلب
            const policyData = {
                companyName: settings.login?.companyName || 'شركة التوصيل',
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

            // إنشاء HTML للبوليصة
            const html = createStandardPolicyHTML(policyData, {
                width: widthMM,
                height: heightMM
            });

            // إنشاء معاينة
            const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
            
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            setPdfUrl(URL.createObjectURL(blob));
        } catch (error: any) {
            console.error('Preview generation error:', error);
            toast({ variant: 'destructive', title: 'فشل توليد المعاينة', description: error.message });
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (orders.length > 0) generatePdfPreviewFn();
        }, 500);
        return () => clearTimeout(timer);
    }, [size, orientation, orders.length, custom.showBarcode, custom.showCOD, custom.showPhone, custom.showAddress, custom.showCity, custom.showRegion, custom.showMerchant, custom.showDate, custom.showNotes, custom.primaryColor, custom.secondaryColor, custom.codFontScale, custom.bodyFontScale]);

    const handlePrint = () => generatePdfPreviewFn();

    const handleExportPDF = async () => {
        try {
            const order = orders[0];
            
            // تحويل بيانات الطلب
            const policyData = {
                companyName: settings.login?.companyName || 'شركة التوصيل',
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

            // استخدام الخدمة الجديدة
            await generateStandardPolicy(policyData, {
                width: widthMM,
                height: heightMM
            }, `policy_colored_${size}_${orientation}_${new Date().toISOString().split('T')[0]}.pdf`);
            
            toast({ title: 'تم! ✅', description: 'تم تحميل PDF بنجاح إلى جهازك' });
        } catch (error: any) {
            console.error('PDF export error:', error);
            toast({ variant: 'destructive', title: 'فشل التصدير', description: error.message });
        }
    };

    useImperativeHandle(ref, () => ({
        handlePrint,
        handleExportPDF,
    }));

    if (orders.length === 0) {
        return <div className="text-center text-muted-foreground p-8">لا توجد طلبات</div>;
    }

    // حساب المعاملات بناءً على الحجم والاتجاه
    const getScaleFactors = () => {
        const isLandscape = orientation === 'landscape';
        const isA5 = size === 'a5';
        
        return {
            // Header
            headerPadding: isA5 ? (isLandscape ? '12px 15px' : '12px') : (isLandscape ? '15px 20px' : '18px'),
            companyFontSize: isA5 ? (isLandscape ? '18px' : '20px') : (isLandscape ? '22px' : '26px'),
            subtitleFontSize: isA5 ? '10px' : '12px',
            barcodeWidth: isA5 ? (isLandscape ? 1.5 : 1.8) : (isLandscape ? 2 : 2.2),
            barcodeHeight: isA5 ? (isLandscape ? 35 : 40) : (isLandscape ? 45 : 55),
            barcodeFontSize: isA5 ? 10 : 12,
            // Order Number
            orderNumPadding: isA5 ? '8px' : '12px',
            orderNumFontSize: isA5 ? (isLandscape ? '16px' : '18px') : (isLandscape ? '20px' : '24px'),
            // COD
            codPadding: isA5 ? (isLandscape ? '12px' : '15px') : (isLandscape ? '18px' : '22px'),
            codMargin: isA5 ? '10px' : '15px',
            codLabelFontSize: isA5 ? '10px' : '13px',
            codAmountFontSize: isA5 ? (isLandscape ? '28px' : '32px') : (isLandscape ? '38px' : '44px'),
            // Sections
            sectionPadding: isA5 ? (isLandscape ? '8px' : '10px') : (isLandscape ? '12px' : '14px'),
            sectionMargin: isA5 ? (isLandscape ? '6px' : '8px') : (isLandscape ? '10px' : '12px'),
            sectionLabelFontSize: isA5 ? '10px' : '12px',
            merchantFontSize: isA5 ? (isLandscape ? '14px' : '16px') : (isLandscape ? '18px' : '20px'),
            recipientFontSize: isA5 ? (isLandscape ? '16px' : '18px') : (isLandscape ? '20px' : '22px'),
            phoneFontSize: isA5 ? (isLandscape ? '14px' : '15px') : (isLandscape ? '17px' : '18px'),
            addressFontSize: isA5 ? (isLandscape ? '11px' : '12px') : (isLandscape ? '13px' : '14px'),
            tagPadding: isA5 ? '4px 10px' : '6px 14px',
            tagFontSize: isA5 ? '10px' : '12px',
            // Notes
            notesFontSize: isA5 ? '11px' : '13px',
            // Footer
            footerPadding: isA5 ? '6px 12px' : '10px 18px',
            footerFontSize: isA5 ? '9px' : '11px',
            // Content padding
            contentPadding: isA5 ? (isLandscape ? '10px' : '12px') : (isLandscape ? '15px' : '18px'),
        };
    };

    const s = getScaleFactors();

    const renderPolicy = (order: Order) => {
        const isLandscape = orientation === 'landscape';
        
        const baseStyle: React.CSSProperties = {
            width: `${widthPx}px`,
            height: `${heightPx}px`,
            border: '2px solid #e2e8f0',
            background: 'white',
            overflow: 'hidden',
            boxSizing: 'border-box',
            pageBreakAfter: 'always',
            position: 'relative',
            fontFamily: 'Arial, sans-serif',
            display: 'flex',
            flexDirection: 'column',
        };

        // تصميم أفقي - تخطيط مختلف بالكامل
        if (isLandscape) {
            return (
                <div key={order.id} className="policy-page-v2" style={baseStyle}>
                    <div style={{ display: 'flex', height: '100%' }}>
                        {/* الجانب الأيسر - الباركود والمبلغ */}
                        <div style={{ 
                            width: '38%', 
                            background: `linear-gradient(180deg, ${custom.primaryColor} 0%, ${custom.primaryColor}dd 100%)`, 
                            display: 'flex', 
                            flexDirection: 'column',
                            padding: s.contentPadding,
                        }}>
                            {/* شعار الشركة */}
                            <div style={{ color: 'white', textAlign: 'center', marginBottom: '10px' }}>
                                <div style={{ fontSize: s.companyFontSize, fontWeight: 900 }}>🚚 شركة التوصيل</div>
                                <div style={{ fontSize: s.subtitleFontSize, opacity: 0.8, marginTop: '2px' }}>للتوصيل السريع</div>
                            </div>
                            
                            {/* الباركود */}
                            {custom.showBarcode && (
                            <div style={{ background: 'white', padding: '8px', borderRadius: '8px', textAlign: 'center', marginBottom: '10px' }}>
                                <Barcode value={order.id} width={s.barcodeWidth} height={s.barcodeHeight} fontSize={s.barcodeFontSize} margin={0} />
                            </div>
                            )}
                            
                            {/* رقم الطلب */}
                            <div style={{ background: '#0f172a', color: 'white', padding: s.orderNumPadding, borderRadius: '6px', textAlign: 'center', marginBottom: '10px' }}>
                                <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>رقم الطلب</div>
                                <div style={{ fontSize: s.orderNumFontSize, fontWeight: 900, fontVariantNumeric: 'lining-nums' }} dir="ltr">#{order.id}</div>
                            </div>
                            
                            {/* المبلغ */}
                            {custom.showCOD && (
                            <div style={{ 
                                background: `linear-gradient(135deg, ${custom.secondaryColor} 0%, ${custom.secondaryColor}dd 100%)`, 
                                flex: 1, 
                                borderRadius: '10px', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                padding: '10px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                            }}>
                                <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: s.codLabelFontSize, fontWeight: 'bold', marginBottom: '5px' }}>المبلغ شامل التوصيل</div>
                                <div style={{ color: 'white', fontSize: `calc(${s.codAmountFontSize} * ${custom.codFontScale})`, fontWeight: 900, fontVariantNumeric: 'lining-nums' }} dir="ltr">{order.cod}</div>
                                <div style={{ color: 'white', fontSize: size === 'a5' ? '14px' : '18px', fontWeight: 'bold' }}>{currencySymbol}</div>
                            </div>
                            )}
                            
                            {/* Footer */}
                            {custom.showDate && (
                            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: s.footerFontSize, textAlign: 'center', marginTop: '8px', fontVariantNumeric: 'lining-nums' }} dir="ltr">
                                {order.date}
                            </div>
                            )}
                        </div>
                        
                        {/* الجانب الأيمن - التفاصيل */}
                        <div style={{ flex: 1, padding: s.contentPadding, display: 'flex', flexDirection: 'column' }}>
                            {/* التاجر */}
                            {custom.showMerchant && (
                            <div style={{ background: '#f3e8ff', border: '2px solid #a855f7', borderRadius: '8px', padding: s.sectionPadding, marginBottom: s.sectionMargin }}>
                                <div style={{ fontSize: s.sectionLabelFontSize, color: '#7c3aed', fontWeight: 'bold', marginBottom: '3px' }}>📦 المرسل</div>
                                <div style={{ fontSize: s.merchantFontSize, fontWeight: 900, color: '#581c87', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.merchant}</div>
                            </div>
                            )}
                            
                            {/* المستلم */}
                            <div style={{ background: '#dbeafe', border: `2px solid ${custom.primaryColor}`, borderRadius: '8px', padding: s.sectionPadding, marginBottom: s.sectionMargin }}>
                                <div style={{ fontSize: s.sectionLabelFontSize, color: '#1d4ed8', fontWeight: 'bold', marginBottom: '3px' }}>👤 المستلم</div>
                                <div style={{ fontSize: `calc(${s.recipientFontSize} * ${custom.bodyFontScale})`, fontWeight: 900, color: '#1e3a8a', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.recipient}</div>
                                {custom.showPhone && (
                                <div style={{ fontSize: s.phoneFontSize, fontFamily: 'monospace', fontWeight: 'bold', color: '#1e40af', fontVariantNumeric: 'lining-nums' }} dir="ltr">📱 {order.phone}</div>
                                )}
                            </div>
                            
                            {/* العنوان */}
                            {custom.showAddress && (
                            <div style={{ border: '2px solid #e2e8f0', background: '#f8fafc', borderRadius: '8px', padding: s.sectionPadding, marginBottom: s.sectionMargin, flex: order.notes && custom.showNotes ? 0 : 1 }}>
                                <div style={{ fontSize: s.sectionLabelFontSize, color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}>📍 العنوان</div>
                                <div style={{ fontSize: s.addressFontSize, fontWeight: 600, color: '#1e293b', lineHeight: 1.4, marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{order.address}</div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {custom.showCity && <span style={{ background: custom.primaryColor, color: 'white', padding: s.tagPadding, borderRadius: '5px', fontSize: s.tagFontSize, fontWeight: 'bold' }}>{order.city}</span>}
                                    {custom.showRegion && <span style={{ background: '#64748b', color: 'white', padding: s.tagPadding, borderRadius: '5px', fontSize: s.tagFontSize }}>{order.region}</span>}
                                </div>
                            </div>
                            )}
                            
                            {/* الملاحظات */}
                            {custom.showNotes && order.notes && (
                                <div style={{ background: '#fef3c7', border: '2px dashed #f59e0b', borderRadius: '8px', padding: s.sectionPadding, flex: 1 }}>
                                    <div style={{ fontSize: s.sectionLabelFontSize, color: '#b45309', fontWeight: 'bold', marginBottom: '3px' }}>📝 ملاحظات</div>
                                    <div style={{ fontSize: s.notesFontSize, color: '#92400e', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{order.notes}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // تصميم عمودي - التخطيط الأصلي المحسّن
        return (
            <div key={order.id} className="policy-page-v2" style={baseStyle}>
                {/* Header: شعار الشركة والباركود */}
                <div style={{ background: `linear-gradient(135deg, ${custom.primaryColor} 0%, ${custom.primaryColor}dd 100%)`, color: 'white', padding: s.headerPadding, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: s.companyFontSize, fontWeight: 900 }}>🚚 شركة التوصيل</div>
                        <div style={{ fontSize: s.subtitleFontSize, opacity: 0.9, marginTop: '3px' }}>للتوصيل السريع والآمن</div>
                    </div>
                    {custom.showBarcode && (
                    <div style={{ background: 'white', padding: '8px', borderRadius: '8px' }}>
                        <Barcode value={order.id} width={s.barcodeWidth} height={s.barcodeHeight} fontSize={s.barcodeFontSize} margin={0} />
                    </div>
                    )}
                </div>
                
                {/* رقم الطلب */}
                <div style={{ background: '#1e293b', color: 'white', padding: s.orderNumPadding, textAlign: 'center' }}>
                    <div style={{ fontSize: s.orderNumFontSize, fontWeight: 900, fontVariantNumeric: 'lining-nums' }} dir="ltr">طلب رقم #{order.id}</div>
                </div>
                
                {/* المبلغ شامل */}
                {custom.showCOD && (
                <div style={{ 
                    background: `linear-gradient(135deg, ${custom.secondaryColor} 0%, ${custom.secondaryColor}dd 100%)`, 
                    color: 'white', 
                    padding: s.codPadding, 
                    margin: s.codMargin, 
                    borderRadius: '12px', 
                    textAlign: 'center', 
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' 
                }}>
                    <div style={{ fontSize: s.codLabelFontSize, fontWeight: 'bold', marginBottom: '6px', opacity: 0.9 }}>المبلغ المطلوب (شامل التوصيل)</div>
                    <div style={{ fontSize: `calc(${s.codAmountFontSize} * ${custom.codFontScale})`, fontWeight: 900, fontVariantNumeric: 'lining-nums' }} dir="ltr">{order.cod} {currencySymbol}</div>
                </div>
                )}
                
                <div style={{ padding: s.contentPadding, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* التاجر المرسل */}
                    {custom.showMerchant && (
                    <div style={{ background: '#f3e8ff', border: '2px solid #a855f7', borderRadius: '10px', padding: s.sectionPadding, marginBottom: s.sectionMargin }}>
                        <div style={{ fontSize: s.sectionLabelFontSize, color: '#7c3aed', fontWeight: 'bold', marginBottom: '4px' }}>📦 المرسل (التاجر)</div>
                        <div style={{ fontSize: s.merchantFontSize, fontWeight: 900, color: '#581c87' }}>{order.merchant}</div>
                    </div>
                    )}
                    
                    {/* تفاصيل الزبون */}
                    <div style={{ background: '#dbeafe', border: `2px solid ${custom.primaryColor}`, borderRadius: '10px', padding: s.sectionPadding, marginBottom: s.sectionMargin }}>
                        <div style={{ fontSize: s.sectionLabelFontSize, color: '#1d4ed8', fontWeight: 'bold', marginBottom: '5px' }}>👤 المستلم</div>
                        <div style={{ fontSize: `calc(${s.recipientFontSize} * ${custom.bodyFontScale})`, fontWeight: 900, color: '#1e3a8a', marginBottom: '6px' }}>{order.recipient}</div>
                        {custom.showPhone && (
                        <div style={{ fontSize: s.phoneFontSize, fontFamily: 'monospace', fontWeight: 'bold', color: '#1e40af', fontVariantNumeric: 'lining-nums' }} dir="ltr">📱 {order.phone}</div>
                        )}
                    </div>
                    
                    {/* العنوان */}
                    {custom.showAddress && (
                    <div style={{ border: '2px solid #e2e8f0', background: '#f8fafc', borderRadius: '10px', padding: s.sectionPadding, marginBottom: s.sectionMargin }}>
                        <div style={{ fontSize: s.sectionLabelFontSize, color: '#64748b', fontWeight: 'bold', marginBottom: '5px' }}>📍 العنوان</div>
                        <div style={{ fontSize: s.addressFontSize, fontWeight: 600, color: '#1e293b', lineHeight: 1.5, marginBottom: '10px' }}>{order.address}</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {custom.showCity && <span style={{ background: custom.primaryColor, color: 'white', padding: s.tagPadding, borderRadius: '6px', fontSize: s.tagFontSize, fontWeight: 'bold' }}>{order.city}</span>}
                            {custom.showRegion && <span style={{ background: '#64748b', color: 'white', padding: s.tagPadding, borderRadius: '6px', fontSize: s.tagFontSize }}>{order.region}</span>}
                        </div>
                    </div>
                    )}
                    
                    {/* الملاحظات */}
                    {custom.showNotes && order.notes && (
                        <div style={{ background: '#fef3c7', border: '2px dashed #f59e0b', borderRadius: '10px', padding: s.sectionPadding, flex: 1 }}>
                            <div style={{ fontSize: s.sectionLabelFontSize, color: '#b45309', fontWeight: 'bold', marginBottom: '4px' }}>📝 ملاحظات هامة</div>
                            <div style={{ fontSize: s.notesFontSize, color: '#92400e', lineHeight: 1.5 }}>{order.notes}</div>
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                {custom.showDate && (
                <div style={{ background: '#f1f5f9', borderTop: '2px solid #e2e8f0', padding: s.footerPadding, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: s.footerFontSize, color: '#64748b', fontVariantNumeric: 'lining-nums' }} dir="ltr">
                        التاريخ: {order.date}
                    </div>
                    <div style={{ fontSize: s.footerFontSize, color: '#64748b', fontVariantNumeric: 'lining-nums' }} dir="ltr">
                        رقم الطلب: #{order.id}
                    </div>
                </div>
                )}
            </div>
        );
    };

    // عند إخفاء أدوات التحكم، نعرض المعاينة مباشرة
    if (hideControls) {
        return (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                <div ref={policyContainerRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders.map(renderPolicy)}
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', minHeight: '600px', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
            {/* أدوات التحكم */}
            <div style={{ backgroundColor: '#fff', padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>حجم الورقة:</Label>
                    <select 
                        value={size} 
                        onChange={(e) => setSize(e.target.value as PolicySize)}
                        style={{ 
                            padding: '6px 12px', 
                            border: '1px solid #d1d5db', 
                            borderRadius: '6px', 
                            fontSize: '14px',
                            backgroundColor: '#fff',
                            minWidth: '140px'
                        }}
                    >
                        {Object.entries(POLICY_SIZES).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                        ))}
                    </select>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>الاتجاه:</Label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input 
                                type="radio" 
                                name="orientation" 
                                value="portrait" 
                                checked={orientation === 'portrait'}
                                onChange={(e) => setOrientation(e.target.value as PolicyOrientation)}
                                style={{ marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0 }}
                            />
                            <span style={{ fontSize: '14px' }}>عمودي</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input 
                                type="radio" 
                                name="orientation" 
                                value="landscape" 
                                checked={orientation === 'landscape'}
                                onChange={(e) => setOrientation(e.target.value as PolicyOrientation)}
                                style={{ marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0 }}
                            />
                            <span style={{ fontSize: '14px' }}>أفقي</span>
                        </label>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                    <div style={{ 
                        padding: '4px 8px', 
                        backgroundColor: '#f3f4f6', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        color: '#6b7280' 
                    }}>
                        {widthMM}×{heightMM} ملم
                    </div>
                </div>
            </div>

            {/* المعاينة */}
            {isGenerating ? (
                <div className="h-full flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
            ) : pdfUrl ? (
                <div className="flex flex-col h-full">
                    {/* أزرار الطباعة */}
                    <div className="flex gap-3 justify-center p-4 bg-white border-b no-print">
                        <Button 
                            onClick={handleExportPDF} 
                            disabled={isGenerating}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            <Icon name={isGenerating ? "Loader2" : "Download"} className={`ml-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                            {isGenerating ? "جاري التحضير..." : "📥 تحميل PDF ملون"}
                        </Button>
                        <Button 
                            onClick={() => generatePdfPreviewFn()} 
                            disabled={isGenerating}
                            variant="outline"
                        >
                            <Icon name={isGenerating ? "Loader2" : "RefreshCw"} className={`ml-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                            تحديث المعاينة
                        </Button>
                    </div>
                    
                    {/* المعاينة */}
                    <iframe 
                        src={pdfUrl} 
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            border: 'none',
                            flex: 1
                        }} 
                    />
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <div className="text-center text-muted-foreground">جاري تحميل المعاينة...</div>
                    
                    {/* أزرار بديلة عند عدم وجود معاينة */}
                    <div className="flex gap-3 no-print">
                        <Button 
                            onClick={handleExportPDF} 
                            disabled={isGenerating}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            <Icon name={isGenerating ? "Loader2" : "Download"} className={`ml-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                            {isGenerating ? "جاري التحضير..." : "📥 تحميل PDF ملون"}
                        </Button>
                        <Button 
                            onClick={() => generatePdfPreviewFn()} 
                            disabled={isGenerating}
                            variant="outline"
                        >
                            <Icon name={isGenerating ? "Loader2" : "Eye"} className={`ml-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                            إنشاء معاينة
                        </Button>
                    </div>
                </div>
            )}
            
            {/* البوالص مخفية */}
            <div ref={policyContainerRef} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                {orders.map(renderPolicy)}
            </div>
        </div>
    );
});

ModernPolicyV2.displayName = 'ModernPolicyV2';
