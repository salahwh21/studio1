'use client';

import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import type { Order } from '@/store/orders-store';
import { useToast } from '@/hooks/use-toast';
import Barcode from 'react-barcode';
import { Label } from './ui/label';
import { useSettings } from '@/contexts/SettingsContext';
import {
    createThermalLabelHTML,
    generatePdf,
    generateThermalLabel,
    generatePdfViaBrowserPrint
} from '@/services/pdf-service';

// 5 مقاسات أساسية
type BaseSize = '100x150' | '100x100' | '75x50' | '60x40' | '50x30';
type Orientation = 'portrait' | 'landscape';

interface SizeConfig {
    widthMM: number;  // العرض في الوضع الافتراضي
    heightMM: number; // الطول في الوضع الافتراضي
    label: string;
    supportsLandscape: boolean;
    defaultOrientation: Orientation; // الوضع الطبيعي لهذا المقاس
}

const BASE_SIZES: Record<BaseSize, SizeConfig> = {
    // المقاسات الطويلة (الوضع الطبيعي عمودي)
    '100x150': { widthMM: 100, heightMM: 150, label: '100×150 ملم (الأكبر)', supportsLandscape: true, defaultOrientation: 'portrait' },
    '100x100': { widthMM: 100, heightMM: 100, label: '100×100 ملم (مربع)', supportsLandscape: false, defaultOrientation: 'portrait' },
    // المقاسات العريضة (الوضع الطبيعي أفقي)
    '75x50': { widthMM: 75, heightMM: 50, label: '75×50 ملم (متوسط)', supportsLandscape: true, defaultOrientation: 'landscape' },
    '60x40': { widthMM: 60, heightMM: 40, label: '60×40 ملم (صغير)', supportsLandscape: true, defaultOrientation: 'landscape' },
    '50x30': { widthMM: 50, heightMM: 30, label: '50×30 ملم (الأصغر)', supportsLandscape: true, defaultOrientation: 'landscape' },
};

// إعدادات التخصيص
export interface ThermalCustomization {
    showBarcode?: boolean;
    showCOD?: boolean;
    showPhone?: boolean;
    showAddress?: boolean;
    showCity?: boolean;
    showRegion?: boolean;
    showMerchant?: boolean;
    showDate?: boolean;
    primaryColor?: string;
    // الاتجاه
    orientation?: 'portrait' | 'landscape';
    // أحجام الخطوط المنفصلة
    codFontScale?: number;
    recipientFontScale?: number;
    phoneFontScale?: number;
    addressFontScale?: number;
    cityFontScale?: number;
    regionFontScale?: number;
    merchantFontScale?: number;
    dateFontScale?: number;
    orderIdFontScale?: number;
    // للتوافق مع القديم
    bodyFontScale?: number;
    borderWidth?: number;
    // المسافات والتباعد العامة
    elementSpacing?: number;
    contentPadding?: number;
    codPadding?: number;
    sectionSpacing?: number;
    // إزاحة كل عنصر (mm)
    barcodeOffsetX?: number;
    barcodeOffsetY?: number;
    codOffsetX?: number;
    codOffsetY?: number;
    orderIdOffsetX?: number;
    orderIdOffsetY?: number;
    recipientOffsetX?: number;
    recipientOffsetY?: number;
    phoneOffsetX?: number;
    phoneOffsetY?: number;
    addressOffsetX?: number;
    addressOffsetY?: number;
    cityOffsetX?: number;
    cityOffsetY?: number;
    regionOffsetX?: number;
    regionOffsetY?: number;
    merchantOffsetX?: number;
    merchantOffsetY?: number;
    dateOffsetX?: number;
    dateOffsetY?: number;
    // أبعاد الصناديق (%)
    barcodeWidth?: number;
    barcodeHeight?: number;
    codWidth?: number;
    codHeight?: number;
    orderIdWidth?: number;
    orderIdHeight?: number;
    recipientWidth?: number;
    recipientHeight?: number;
    addressWidth?: number;
    addressHeight?: number;
    cityWidth?: number;
    cityHeight?: number;
    regionWidth?: number;
    regionHeight?: number;
    merchantWidth?: number;
    merchantHeight?: number;
    dateWidth?: number;
    dateHeight?: number;
    // محاذاة النص
    codTextAlign?: 'left' | 'center' | 'right';
    recipientTextAlign?: 'left' | 'center' | 'right';
    addressTextAlign?: 'left' | 'center' | 'right';
    merchantTextAlign?: 'left' | 'center' | 'right';
    dateTextAlign?: 'left' | 'center' | 'right';
    orderIdTextAlign?: 'left' | 'center' | 'right';
    cityTextAlign?: 'left' | 'center' | 'right';
    regionTextAlign?: 'left' | 'center' | 'right';
    // محاذاة عمودية
    codVerticalAlign?: 'top' | 'center' | 'bottom';
    recipientVerticalAlign?: 'top' | 'center' | 'bottom';
    addressVerticalAlign?: 'top' | 'center' | 'bottom';
    merchantVerticalAlign?: 'top' | 'center' | 'bottom';
    dateVerticalAlign?: 'top' | 'center' | 'bottom';
    orderIdVerticalAlign?: 'top' | 'center' | 'bottom';
    cityVerticalAlign?: 'top' | 'center' | 'bottom';
    regionVerticalAlign?: 'top' | 'center' | 'bottom';
}

type ThermalLabelOptimizedProps = {
    orders: Order[];
    selectedSize?: string;
    customization?: ThermalCustomization;
    hideControls?: boolean;
};

export const ThermalLabelOptimized = forwardRef<
    { handlePrint: () => void; handleExportPDF: () => Promise<void> },
    ThermalLabelOptimizedProps
>(({ orders, selectedSize, customization, hideControls }, ref) => {
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
        primaryColor: customization?.primaryColor ?? '#000000',
        codFontScale: customization?.codFontScale ?? 1,
        recipientFontScale: customization?.recipientFontScale ?? customization?.bodyFontScale ?? 1,
        phoneFontScale: customization?.phoneFontScale ?? customization?.bodyFontScale ?? 1,
        addressFontScale: customization?.addressFontScale ?? customization?.bodyFontScale ?? 1,
        cityFontScale: customization?.cityFontScale ?? customization?.bodyFontScale ?? 1,
        regionFontScale: customization?.regionFontScale ?? customization?.bodyFontScale ?? 1,
        merchantFontScale: customization?.merchantFontScale ?? customization?.bodyFontScale ?? 1,
        dateFontScale: customization?.dateFontScale ?? customization?.bodyFontScale ?? 1,
        orderIdFontScale: customization?.orderIdFontScale ?? customization?.bodyFontScale ?? 1,
        bodyFontScale: customization?.bodyFontScale ?? 1,
        borderWidth: customization?.borderWidth ?? 2,
        elementSpacing: customization?.elementSpacing ?? 1.5,
        contentPadding: customization?.contentPadding ?? 2,
        codPadding: customization?.codPadding ?? 3,
        sectionSpacing: customization?.sectionSpacing ?? 2,
        // إزاحات العناصر
        barcodeOffsetX: customization?.barcodeOffsetX ?? 0,
        barcodeOffsetY: customization?.barcodeOffsetY ?? 0,
        codOffsetX: customization?.codOffsetX ?? 0,
        codOffsetY: customization?.codOffsetY ?? 0,
        orderIdOffsetX: customization?.orderIdOffsetX ?? 0,
        orderIdOffsetY: customization?.orderIdOffsetY ?? 0,
        recipientOffsetX: customization?.recipientOffsetX ?? 0,
        recipientOffsetY: customization?.recipientOffsetY ?? 0,
        phoneOffsetX: customization?.phoneOffsetX ?? 0,
        phoneOffsetY: customization?.phoneOffsetY ?? 0,
        addressOffsetX: customization?.addressOffsetX ?? 0,
        addressOffsetY: customization?.addressOffsetY ?? 0,
        cityOffsetX: customization?.cityOffsetX ?? 0,
        cityOffsetY: customization?.cityOffsetY ?? 0,
        regionOffsetX: customization?.regionOffsetX ?? 0,
        regionOffsetY: customization?.regionOffsetY ?? 0,
        merchantOffsetX: customization?.merchantOffsetX ?? 0,
        merchantOffsetY: customization?.merchantOffsetY ?? 0,
        dateOffsetX: customization?.dateOffsetX ?? 0,
        dateOffsetY: customization?.dateOffsetY ?? 0,
        // أبعاد الصناديق
        barcodeWidth: customization?.barcodeWidth ?? 100,
        barcodeHeight: customization?.barcodeHeight ?? 100,
        codWidth: customization?.codWidth ?? 100,
        codHeight: customization?.codHeight ?? 100,
        orderIdWidth: customization?.orderIdWidth ?? 100,
        orderIdHeight: customization?.orderIdHeight ?? 100,
        recipientWidth: customization?.recipientWidth ?? 100,
        recipientHeight: customization?.recipientHeight ?? 100,
        addressWidth: customization?.addressWidth ?? 100,
        addressHeight: customization?.addressHeight ?? 100,
        cityWidth: customization?.cityWidth ?? 100,
        cityHeight: customization?.cityHeight ?? 100,
        regionWidth: customization?.regionWidth ?? 100,
        regionHeight: customization?.regionHeight ?? 100,
        merchantWidth: customization?.merchantWidth ?? 100,
        merchantHeight: customization?.merchantHeight ?? 100,
        dateWidth: customization?.dateWidth ?? 100,
        dateHeight: customization?.dateHeight ?? 100,
        // محاذاة النص
        codTextAlign: customization?.codTextAlign ?? 'center',
        recipientTextAlign: customization?.recipientTextAlign ?? 'center',
        addressTextAlign: customization?.addressTextAlign ?? 'center',
        merchantTextAlign: customization?.merchantTextAlign ?? 'center',
        dateTextAlign: customization?.dateTextAlign ?? 'center',
        orderIdTextAlign: customization?.orderIdTextAlign ?? 'center',
        cityTextAlign: customization?.cityTextAlign ?? 'center',
        regionTextAlign: customization?.regionTextAlign ?? 'center',
        // محاذاة عمودية
        codVerticalAlign: customization?.codVerticalAlign ?? 'center',
        recipientVerticalAlign: customization?.recipientVerticalAlign ?? 'center',
        addressVerticalAlign: customization?.addressVerticalAlign ?? 'center',
        merchantVerticalAlign: customization?.merchantVerticalAlign ?? 'center',
        dateVerticalAlign: customization?.dateVerticalAlign ?? 'center',
        orderIdVerticalAlign: customization?.orderIdVerticalAlign ?? 'center',
        cityVerticalAlign: customization?.cityVerticalAlign ?? 'center',
        regionVerticalAlign: customization?.regionVerticalAlign ?? 'center',
    };

    const [baseSize, setBaseSize] = useState<BaseSize>('100x150');
    const [internalOrientation, setInternalOrientation] = useState<Orientation>('portrait');
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // استخدام الاتجاه من customization (للمحرر) أو الداخلي (للاستخدام العادي)
    const orientation: Orientation = hideControls ? (customization?.orientation ?? 'portrait') : internalOrientation;

    // تحويل selectedSize من الصفحة إلى baseSize (بدون تغيير الاتجاه)
    useEffect(() => {
        if (selectedSize) {
            const sizeMap: Record<string, BaseSize> = {
                '100×150': '100x150',
                '100×100': '100x100',
                '75×50': '75x50',
                '60×40': '60x40',
                '50×30': '50x30'
            };
            const mappedSize = sizeMap[selectedSize];
            if (mappedSize && mappedSize !== baseSize) {
                setBaseSize(mappedSize);
            }
        }
    }, [selectedSize]);

    const sizeConfig = BASE_SIZES[baseSize];
    const isLandscape = orientation === 'landscape' && sizeConfig.supportsLandscape;

    const shouldSwap = orientation !== sizeConfig.defaultOrientation;
    const widthMM = shouldSwap ? sizeConfig.heightMM : sizeConfig.widthMM;
    const heightMM = shouldSwap ? sizeConfig.widthMM : sizeConfig.heightMM;
    const widthPx = widthMM * 3.7795;
    const heightPx = heightMM * 3.7795;

    // إنشاء PDF باستخدام الخدمة الجديدة
    const generatePdfPreview = async () => {
        if (orders.length === 0) return;
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const order = orders[0];

            // تحويل بيانات الطلب
            const thermalData = {
                companyName: settings.login?.companyName || 'شركة الشحن',
                orderNumber: order.orderNumber || order.id,
                recipient: order.recipient,
                phone: order.phone,
                address: order.address,
                cod: order.cod,
                barcode: order.id
            };

            // إنشاء HTML للملصق الحراري
            const html = createThermalLabelHTML(thermalData, {
                width: widthMM,
                height: heightMM,
                customization: custom
            });

            // إنشاء معاينة
            const blob = new Blob([html], { type: 'text/html; charset=utf-8' });

            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            setPdfUrl(URL.createObjectURL(blob));
        } catch (error) {
            console.error('PDF generation error:', error);
            toast({ variant: 'destructive', title: 'فشل' });
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (orders.length > 0) generatePdfPreview();
        return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
    }, [baseSize, orientation, orders.length, custom.showBarcode, custom.showCOD, custom.showPhone, custom.showAddress, custom.showCity, custom.showRegion, custom.showMerchant, custom.showDate, custom.primaryColor, custom.codFontScale, custom.recipientFontScale, custom.phoneFontScale, custom.addressFontScale, custom.cityFontScale, custom.merchantFontScale, custom.dateFontScale, custom.orderIdFontScale, custom.bodyFontScale, custom.borderWidth, custom.elementSpacing, custom.contentPadding, custom.codPadding, custom.sectionSpacing]);

    // دالة الطباعة المباشرة
    const handlePrint = async () => {
        if (orders.length === 0) return;
        try {
            const order = orders[0];
            const thermalData = {
                companyName: settings.login?.companyName || 'شركة الشحن',
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

            const html = createThermalLabelHTML(thermalData, {
                width: widthMM,
                height: heightMM,
                customization: custom
            });

            await generatePdfViaBrowserPrint(html, {
                width: widthMM,
                height: heightMM,
                filename: `label_${order.orderNumber}.pdf`
            });
        } catch (error) {
            console.error('Print error:', error);
            toast({ variant: 'destructive', title: 'فشل الطباعة' });
        }
    };

    const handleExportPDF = async () => {
        try {
            const order = orders[0];

            // تحويل بيانات الطلب
            const thermalData = {
                companyName: settings.login?.companyName || 'شركة الشحن',
                orderNumber: order.orderNumber || order.id,
                recipient: order.recipient,
                phone: order.phone,
                address: order.address,
                cod: order.cod,
                barcode: order.id
            };

            // استخدام الخدمة الجديدة
            await generateThermalLabel(thermalData, {
                width: widthMM,
                height: heightMM,
                customization: custom
            }, `thermal_${baseSize}_${orientation}_${new Date().toISOString().split('T')[0]}.pdf`);

            toast({ title: 'تم التصدير بنجاح' });
        } catch (error) {
            console.error('PDF export error:', error);
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

    // دوال مساعدة مشتركة لجميع التصميمات
    const getTextAlign = (align: string): 'left' | 'center' | 'right' => {
        switch (align) {
            case 'left': return 'left';
            case 'right': return 'right';
            case 'center':
            default: return 'center';
        }
    };

    const getVerticalAlign = (align: string) => {
        switch (align) {
            case 'top': return 'flex-start';
            case 'bottom': return 'flex-end';
            case 'center':
            default: return 'center';
        }
    };

    const getHorizontalAlign = (align: string) => {
        switch (align) {
            case 'left': return 'flex-start';
            case 'right': return 'flex-end';
            case 'center':
            default: return 'center';
        }
    };

    // دالة للإزاحة باستخدام margin (أفضل لـ html2canvas من transform)
    const getOffset = (x: number, y: number) => ({
        marginLeft: x !== 0 ? `${x}mm` : undefined,
        marginTop: y !== 0 ? `${y}mm` : undefined,
    });

    // ========== تصميم 100×150 (الأكبر) ==========
    const render100x150Portrait = (order: Order) => {
        return (
            <div key={order.id} className="thermal-label-opt" style={{
                width: `${widthPx}px`, height: `${heightPx}px`,
                ['--label-width-mm' as any]: `${widthMM}mm`,
                ['--label-height-mm' as any]: `${heightMM}mm`,
                border: `${custom.borderWidth}px solid ${custom.primaryColor}`, background: '#fff', fontFamily: 'Arial, sans-serif',
                display: 'flex', flexDirection: 'column', boxSizing: 'border-box', pageBreakAfter: 'always',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Barcode */}
                {custom.showBarcode && (
                    <div style={{
                        borderBottom: `${custom.borderWidth}px solid ${custom.primaryColor}`,
                        padding: `${custom.codPadding}mm`,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        ...getOffset(custom.barcodeOffsetX, custom.barcodeOffsetY),
                    }}>
                        <div style={{
                            width: `${custom.barcodeWidth}%`,
                            height: `${custom.barcodeHeight}%`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Barcode value={order.id} width={2.2} height={45} fontSize={13} margin={0} />
                        </div>
                    </div>
                )}

                {/* السعر */}
                {custom.showCOD && (
                    <div style={{
                        border: `3px solid ${custom.primaryColor}`,
                        padding: `${custom.codPadding}mm`,
                        margin: `${custom.sectionSpacing}mm`,
                        ...getOffset(custom.codOffsetX, custom.codOffsetY),
                        width: `${custom.codWidth}%`,
                        minHeight: custom.codHeight !== 100 ? `${custom.codHeight * 0.5}mm` : 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: getVerticalAlign(custom.codVerticalAlign),
                        alignItems: getHorizontalAlign(custom.codTextAlign),
                    }}>
                        <div style={{ fontSize: `${3.5 * custom.bodyFontScale}mm`, fontWeight: 'bold', marginBottom: '1mm', textAlign: getTextAlign(custom.codTextAlign) }}>المبلغ المطلوب</div>
                        <div style={{ fontSize: `${9 * custom.codFontScale}mm`, fontWeight: 900, lineHeight: 1.1, textAlign: getTextAlign(custom.codTextAlign) }} dir="ltr">{order.cod} {currencySymbol}</div>
                    </div>
                )}

                <div style={{ padding: `${custom.contentPadding}mm`, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* المستلم */}
                    <div style={{
                        border: `1px solid ${custom.primaryColor}`,
                        padding: `${custom.elementSpacing}mm`,
                        marginBottom: `${custom.elementSpacing}mm`,
                        ...getOffset(custom.recipientOffsetX, custom.recipientOffsetY),
                        width: `${custom.recipientWidth}%`,
                        minHeight: custom.recipientHeight !== 100 ? `${custom.recipientHeight * 0.3}mm` : 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: getVerticalAlign(custom.recipientVerticalAlign),
                        alignItems: getHorizontalAlign(custom.recipientTextAlign),
                    }}>
                        <div style={{ fontSize: `${2.8 * custom.bodyFontScale}mm`, fontWeight: 'bold', marginBottom: '0.8mm', textAlign: getTextAlign(custom.recipientTextAlign), width: '100%' }}>المستلم</div>
                        <div style={{ fontSize: `${3.8 * custom.recipientFontScale}mm`, fontWeight: 900, textAlign: getTextAlign(custom.recipientTextAlign), width: '100%' }}>{order.recipient}</div>
                        {custom.showPhone && (
                            <div style={{
                                fontSize: `${3.2 * custom.phoneFontScale}mm`,
                                fontFamily: 'monospace',
                                marginTop: custom.phoneOffsetY !== 0 ? `${0.8 + custom.phoneOffsetY}mm` : '0.8mm',
                                marginLeft: custom.phoneOffsetX !== 0 ? `${custom.phoneOffsetX}mm` : undefined,
                                textAlign: getTextAlign(custom.recipientTextAlign),
                                width: '100%',
                            }} dir="ltr">{order.phone}</div>
                        )}
                    </div>

                    {/* العنوان */}
                    {custom.showAddress && (
                        <div style={{
                            border: `1px solid ${custom.primaryColor}`,
                            padding: `${custom.elementSpacing}mm`,
                            marginBottom: `${custom.elementSpacing}mm`,
                            ...getOffset(custom.addressOffsetX, custom.addressOffsetY),
                            width: `${custom.addressWidth}%`,
                            minHeight: custom.addressHeight !== 100 ? `${custom.addressHeight * 0.3}mm` : 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: getVerticalAlign(custom.addressVerticalAlign),
                            alignItems: getHorizontalAlign(custom.addressTextAlign),
                        }}>
                            <div style={{ fontSize: `${2.8 * custom.bodyFontScale}mm`, fontWeight: 'bold', marginBottom: '0.8mm', textAlign: getTextAlign(custom.addressTextAlign), width: '100%' }}>العنوان</div>
                            <div style={{ fontSize: `${3.2 * custom.addressFontScale}mm`, lineHeight: 1.3, textAlign: getTextAlign(custom.addressTextAlign), marginBottom: '0.5mm', width: '100%' }}>{order.address}</div>
                            <div style={{ display: 'flex', gap: `${custom.elementSpacing}mm`, fontSize: `${2.8 * custom.cityFontScale}mm`, width: '100%' }}>
                                {custom.showCity && <div style={{
                                    border: `1px solid ${custom.primaryColor}`,
                                    padding: '0.8mm',
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: getVerticalAlign(custom.cityVerticalAlign),
                                    justifyContent: getHorizontalAlign(custom.cityTextAlign),
                                    minHeight: '20px',
                                    ...getOffset(custom.cityOffsetX, custom.cityOffsetY),
                                }}>{order.city}</div>}
                                {custom.showRegion && <div style={{
                                    border: `1px solid ${custom.primaryColor}`,
                                    padding: '0.8mm',
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: getVerticalAlign(custom.regionVerticalAlign),
                                    justifyContent: getHorizontalAlign(custom.regionTextAlign),
                                    minHeight: '20px',
                                    ...getOffset(custom.regionOffsetX, custom.regionOffsetY),
                                }}>{order.region}</div>}
                            </div>
                        </div>
                    )}

                    {/* التاجر والتاريخ */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${custom.elementSpacing}mm`, marginTop: 'auto' }}>
                        {custom.showMerchant && (
                            <div style={{
                                border: `1px solid ${custom.primaryColor}`,
                                padding: `${custom.elementSpacing}mm`,
                                ...getOffset(custom.merchantOffsetX, custom.merchantOffsetY),
                                width: `${custom.merchantWidth}%`,
                                minHeight: custom.merchantHeight !== 100 ? `${custom.merchantHeight * 0.2}mm` : 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: getVerticalAlign(custom.merchantVerticalAlign),
                                alignItems: getHorizontalAlign(custom.merchantTextAlign),
                            }}>
                                <div style={{ fontSize: `${2.3 * custom.bodyFontScale}mm`, fontWeight: 'bold', textAlign: getTextAlign(custom.merchantTextAlign), width: '100%' }}>التاجر</div>
                                <div style={{ fontSize: `${2.8 * custom.merchantFontScale}mm`, fontWeight: 'bold', textAlign: getTextAlign(custom.merchantTextAlign), width: '100%' }}>{order.merchant}</div>
                            </div>
                        )}
                        {custom.showDate && (
                            <div style={{
                                border: `1px solid ${custom.primaryColor}`,
                                padding: `${custom.elementSpacing}mm`,
                                ...getOffset(custom.dateOffsetX, custom.dateOffsetY),
                                width: `${custom.dateWidth}%`,
                                minHeight: custom.dateHeight !== 100 ? `${custom.dateHeight * 0.2}mm` : 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: getVerticalAlign(custom.dateVerticalAlign),
                                alignItems: getHorizontalAlign(custom.dateTextAlign),
                            }}>
                                <div style={{ fontSize: `${2.3 * custom.bodyFontScale}mm`, fontWeight: 'bold', textAlign: getTextAlign(custom.dateTextAlign), width: '100%' }}>التاريخ</div>
                                <div style={{ fontSize: `${2.8 * custom.dateFontScale}mm`, textAlign: getTextAlign(custom.dateTextAlign), width: '100%' }} dir="ltr">{order.date}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const render100x150Landscape = (order: Order) => {
        return (
            <div key={order.id} className="thermal-label-opt" style={{
                width: `${widthPx}px`, height: `${heightPx}px`,
                ['--label-width-mm' as any]: `${widthMM}mm`,
                ['--label-height-mm' as any]: `${heightMM}mm`,
                border: `${custom.borderWidth}px solid ${custom.primaryColor}`, background: '#fff', fontFamily: 'Arial, sans-serif',
                display: 'flex', boxSizing: 'border-box', pageBreakAfter: 'always',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Left Panel - Barcode & COD */}
                <div style={{
                    width: '40%', borderRight: `${custom.borderWidth}px solid ${custom.primaryColor}`,
                    display: 'flex', flexDirection: 'column',
                }}>
                    {custom.showBarcode && (
                        <div style={{
                            padding: '2mm', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            ...getOffset(custom.barcodeOffsetX, custom.barcodeOffsetY),
                        }}>
                            <div style={{
                                padding: '1.5mm',
                                width: `${custom.barcodeWidth}%`,
                                height: `${custom.barcodeHeight}%`,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <Barcode value={order.id} width={1.8} height={35} fontSize={11} margin={0} />
                            </div>
                        </div>
                    )}
                    {custom.showCOD && (
                        <div style={{
                            padding: '2.5mm', textAlign: getTextAlign(custom.codTextAlign), borderTop: `${custom.borderWidth}px solid ${custom.primaryColor}`,
                            ...getOffset(custom.codOffsetX, custom.codOffsetY),
                            width: `${custom.codWidth}%`,
                            height: `${custom.codHeight}%`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: getVerticalAlign(custom.codVerticalAlign),
                            alignItems: getHorizontalAlign(custom.codTextAlign),
                        }}>
                            <div style={{ fontSize: `${2.5 * custom.bodyFontScale}mm`, fontWeight: 'bold', color: custom.primaryColor }}>المبلغ المطلوب</div>
                            <div style={{ fontSize: `${7 * custom.codFontScale}mm`, fontWeight: 900 }} dir="ltr">{order.cod} {currencySymbol}</div>
                        </div>
                    )}
                </div>

                {/* Right Panel - Info */}
                <div style={{ width: '60%', padding: '2mm', display: 'flex', flexDirection: 'column', gap: '1.5mm' }}>
                    <div style={{
                        border: `1px solid ${custom.primaryColor}`, borderRadius: '1mm', padding: '2mm',
                        ...getOffset(custom.recipientOffsetX, custom.recipientOffsetY),
                        width: `${custom.recipientWidth}%`,
                        height: `${custom.recipientHeight}%`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: getVerticalAlign(custom.recipientVerticalAlign),
                        alignItems: getHorizontalAlign(custom.recipientTextAlign),
                    }}>
                        <div style={{ fontSize: `${2.5 * custom.bodyFontScale}mm`, fontWeight: 'bold', marginBottom: '0.5mm', textAlign: getTextAlign(custom.recipientTextAlign) }}>المستلم</div>
                        <div style={{ fontSize: `${3.5 * custom.recipientFontScale}mm`, fontWeight: 900, marginBottom: '0.5mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: getTextAlign(custom.recipientTextAlign) }}>{order.recipient}</div>
                        {custom.showPhone && (
                            <div style={{
                                fontSize: `${3 * custom.phoneFontScale}mm`,
                                fontFamily: 'monospace',
                                color: custom.primaryColor,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textAlign: getTextAlign(custom.recipientTextAlign),
                                ...getOffset(custom.phoneOffsetX, custom.phoneOffsetY),
                            }} dir="ltr">{order.phone}</div>
                        )}
                    </div>

                    {custom.showAddress && (
                        <div style={{
                            border: `1px solid ${custom.primaryColor}`, borderRadius: '1mm', padding: '2mm', flex: 1,
                            ...getOffset(custom.addressOffsetX, custom.addressOffsetY),
                            width: `${custom.addressWidth}%`,
                            height: `${custom.addressHeight}%`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: getVerticalAlign(custom.addressVerticalAlign),
                            alignItems: getHorizontalAlign(custom.addressTextAlign),
                        }}>
                            <div style={{ fontSize: `${2.5 * custom.bodyFontScale}mm`, fontWeight: 'bold', marginBottom: '0.5mm', textAlign: getTextAlign(custom.addressTextAlign) }}>العنوان</div>
                            <div style={{ fontSize: `${2.8 * custom.addressFontScale}mm`, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', textAlign: getTextAlign(custom.addressTextAlign) }}>{order.address}</div>
                            <div style={{ marginTop: '1mm', display: 'flex', gap: '1mm' }}>
                                {custom.showCity && <div style={{
                                    border: `1px solid ${custom.primaryColor}`,
                                    padding: '0.5mm',
                                    flex: 1,
                                    fontSize: `${2.5 * custom.cityFontScale}mm`,
                                    fontWeight: 'bold',
                                    textAlign: getTextAlign(custom.cityTextAlign),
                                    display: 'flex',
                                    alignItems: getVerticalAlign(custom.cityVerticalAlign),
                                    justifyContent: getHorizontalAlign(custom.cityTextAlign),
                                    ...getOffset(custom.cityOffsetX, custom.cityOffsetY),
                                }}>{order.city}</div>}
                                {custom.showRegion && <div style={{
                                    border: `1px solid ${custom.primaryColor}`,
                                    padding: '0.5mm',
                                    flex: 1,
                                    fontSize: `${2.5 * custom.regionFontScale}mm`,
                                    fontWeight: 'bold',
                                    textAlign: getTextAlign(custom.regionTextAlign),
                                    display: 'flex',
                                    alignItems: getVerticalAlign(custom.regionVerticalAlign),
                                    justifyContent: getHorizontalAlign(custom.regionTextAlign),
                                    ...getOffset(custom.regionOffsetX, custom.regionOffsetY),
                                }}>{order.region}</div>}
                            </div>
                        </div>
                    )}

                    {custom.showMerchant && (
                        <div style={{
                            border: `1px solid ${custom.primaryColor}`, borderRadius: '1mm', padding: '1.5mm 2mm',
                            textAlign: getTextAlign(custom.merchantTextAlign),
                            ...getOffset(custom.merchantOffsetX, custom.merchantOffsetY),
                            width: `${custom.merchantWidth}%`,
                            height: `${custom.merchantHeight}%`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: getVerticalAlign(custom.merchantVerticalAlign),
                            alignItems: getHorizontalAlign(custom.merchantTextAlign),
                        }}>
                            <div style={{ fontSize: `${2 * custom.bodyFontScale}mm`, fontWeight: 'bold' }}>التاجر</div>
                            <span style={{ fontSize: `${2.5 * custom.merchantFontScale}mm`, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.merchant}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ========== تصميم 100×100 (مربع) ==========
    const render100x100 = (order: Order) => {
        return (
            <div key={order.id} className="thermal-label-opt" style={{
                width: `${widthPx}px`, height: `${heightPx}px`,
                ['--label-width-mm' as any]: `${widthMM}mm`,
                ['--label-height-mm' as any]: `${heightMM}mm`,
                border: `${custom.borderWidth}px solid ${custom.primaryColor}`, background: '#fff', fontFamily: 'Arial, sans-serif',
                display: 'flex', flexDirection: 'column', boxSizing: 'border-box', pageBreakAfter: 'always',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    padding: '2mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `${custom.borderWidth}px solid ${custom.primaryColor}`
                }}>
                    {custom.showBarcode && (
                        <div style={{
                            padding: '1mm',
                            ...getOffset(custom.barcodeOffsetX, custom.barcodeOffsetY),
                            width: `${custom.barcodeWidth}%`,
                            height: `${custom.barcodeHeight}%`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Barcode value={order.id} width={1.8} height={32} fontSize={10} margin={0} />
                        </div>
                    )}
                </div>

                {/* COD */}
                {custom.showCOD && (
                    <div style={{
                        border: `${custom.borderWidth}px solid ${custom.primaryColor}`, margin: '2mm', borderRadius: '2mm', padding: '2mm',
                        textAlign: getTextAlign(custom.codTextAlign),
                        ...getOffset(custom.codOffsetX, custom.codOffsetY),
                        width: `${custom.codWidth}%`,
                        height: `${custom.codHeight}%`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: getVerticalAlign(custom.codVerticalAlign),
                        alignItems: getHorizontalAlign(custom.codTextAlign),
                    }}>
                        <div style={{ fontSize: `${2.5 * custom.bodyFontScale}mm`, fontWeight: 'bold', color: custom.primaryColor }}>المبلغ المطلوب</div>
                        <div style={{ fontSize: `${6 * custom.codFontScale}mm`, fontWeight: 900 }} dir="ltr">{order.cod} {currencySymbol}</div>
                    </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, padding: '0 2mm 2mm', display: 'flex', flexDirection: 'column', gap: '1.5mm' }}>
                    <div style={{
                        border: `1px solid ${custom.primaryColor}`, borderRadius: '2mm', padding: '2mm',
                        ...getOffset(custom.recipientOffsetX, custom.recipientOffsetY),
                        width: `${custom.recipientWidth}%`,
                        height: `${custom.recipientHeight}%`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: getVerticalAlign(custom.recipientVerticalAlign),
                        alignItems: getHorizontalAlign(custom.recipientTextAlign),
                    }}>
                        <div style={{ fontSize: `${2.2 * custom.bodyFontScale}mm`, fontWeight: 'bold', marginBottom: '0.5mm', textAlign: getTextAlign(custom.recipientTextAlign) }}>المستلم</div>
                        <div style={{ fontSize: `${3 * custom.recipientFontScale}mm`, fontWeight: 900, marginBottom: '0.5mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: getTextAlign(custom.recipientTextAlign) }}>{order.recipient}</div>
                        {custom.showPhone && (
                            <div style={{
                                fontSize: `${2.5 * custom.phoneFontScale}mm`,
                                fontFamily: 'monospace',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textAlign: getTextAlign(custom.recipientTextAlign),
                                ...getOffset(custom.phoneOffsetX, custom.phoneOffsetY),
                            }} dir="ltr">{order.phone}</div>
                        )}
                    </div>

                    {custom.showAddress && (
                        <div style={{
                            border: `1px solid ${custom.primaryColor}`, borderRadius: '2mm', padding: '2mm', flex: 1,
                            ...getOffset(custom.addressOffsetX, custom.addressOffsetY),
                            width: `${custom.addressWidth}%`,
                            height: `${custom.addressHeight}%`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: getVerticalAlign(custom.addressVerticalAlign),
                            alignItems: getHorizontalAlign(custom.addressTextAlign),
                        }}>
                            <div style={{ fontSize: `${2.2 * custom.bodyFontScale}mm`, fontWeight: 'bold', marginBottom: '0.5mm', textAlign: getTextAlign(custom.addressTextAlign) }}>العنوان</div>
                            <div style={{ fontSize: `${2.5 * custom.addressFontScale}mm`, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: getTextAlign(custom.addressTextAlign) }}>{order.address}</div>
                            <div style={{ marginTop: '1mm', display: 'flex', gap: '1mm', fontSize: `${2.2 * custom.cityFontScale}mm`, fontWeight: 'bold', textAlign: getTextAlign(custom.addressTextAlign) }}>
                                {custom.showCity && <div style={{
                                    border: `1px solid ${custom.primaryColor}`,
                                    padding: '0.5mm',
                                    flex: 1,
                                    textAlign: getTextAlign(custom.cityTextAlign),
                                    ...getOffset(custom.cityOffsetX, custom.cityOffsetY),
                                    width: `${custom.cityWidth}%`,
                                    height: `${custom.cityHeight}%`,
                                    display: 'flex',
                                    alignItems: getVerticalAlign(custom.cityVerticalAlign),
                                    justifyContent: getHorizontalAlign(custom.cityTextAlign),
                                    fontSize: `${2.2 * custom.cityFontScale}mm`,
                                }}>{order.city}</div>}
                                {custom.showRegion && <div style={{
                                    border: `1px solid ${custom.primaryColor}`,
                                    padding: '0.5mm',
                                    flex: 1,
                                    textAlign: getTextAlign(custom.regionTextAlign),
                                    ...getOffset(custom.regionOffsetX, custom.regionOffsetY),
                                    width: `${custom.regionWidth}%`,
                                    height: `${custom.regionHeight}%`,
                                    display: 'flex',
                                    alignItems: getVerticalAlign(custom.regionVerticalAlign),
                                    justifyContent: getHorizontalAlign(custom.regionTextAlign),
                                    fontSize: `${2.2 * custom.regionFontScale}mm`,
                                }}>{order.region}</div>}
                            </div>
                        </div>
                    )}

                    {custom.showMerchant && (
                        <div style={{
                            border: `1px solid ${custom.primaryColor}`, borderRadius: '1.5mm', padding: '1mm',
                            textAlign: getTextAlign(custom.merchantTextAlign),
                            ...getOffset(custom.merchantOffsetX, custom.merchantOffsetY),
                            width: `${custom.merchantWidth}%`,
                            height: `${custom.merchantHeight}%`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: getVerticalAlign(custom.merchantVerticalAlign),
                            alignItems: getHorizontalAlign(custom.merchantTextAlign),
                        }}>
                            <div style={{ fontSize: `${1.8 * custom.bodyFontScale}mm` }}>التاجر</div>
                            <span style={{ fontSize: `${2.2 * custom.merchantFontScale}mm`, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.merchant}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ========== تصميم 75×50 (متوسط) ==========
    const render75x50Portrait = (order: Order) => {
        return (
            <div key={order.id} className="thermal-label-opt" style={{
                width: `${widthPx}px`, height: `${heightPx}px`,
                ['--label-width-mm' as any]: `${widthMM}mm`,
                ['--label-height-mm' as any]: `${heightMM}mm`,
                border: `${custom.borderWidth}px solid ${custom.primaryColor}`, background: '#fff', fontFamily: 'Arial, sans-serif',
                display: 'flex', flexDirection: 'column', boxSizing: 'border-box', pageBreakAfter: 'always',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Barcode */}
                {custom.showBarcode && (
                    <div style={{
                        padding: '1.2mm', textAlign: 'center', borderBottom: `1px solid ${custom.primaryColor}`,
                        ...getOffset(custom.barcodeOffsetX, custom.barcodeOffsetY),
                    }}>
                        <div style={{
                            padding: '0.8mm',
                            display: 'inline-block',
                            width: `${custom.barcodeWidth}%`,
                            height: `${custom.barcodeHeight}%`,
                        }}>
                            <Barcode value={order.id} width={1.1} height={20} fontSize={8} margin={0} />
                        </div>
                    </div>
                )}

                {/* COD */}
                {custom.showCOD && (
                    <div style={{
                        border: `${custom.borderWidth}px solid ${custom.primaryColor}`, margin: '0.8mm', borderRadius: '1.5mm', padding: '1.2mm',
                        textAlign: getTextAlign(custom.codTextAlign),
                        ...getOffset(custom.codOffsetX, custom.codOffsetY),
                        width: `${custom.codWidth}%`,
                        height: `${custom.codHeight}%`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: getVerticalAlign(custom.codVerticalAlign),
                        alignItems: getHorizontalAlign(custom.codTextAlign),
                    }}>
                        <div style={{ fontSize: `${1.8 * custom.bodyFontScale}mm`, fontWeight: 'bold' }}>المبلغ</div>
                        <div style={{ fontSize: `${4.5 * custom.codFontScale}mm`, fontWeight: 900 }} dir="ltr">{order.cod} {currencySymbol}</div>
                    </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, padding: '0.8mm', display: 'flex', flexDirection: 'column', gap: '0.6mm' }}>
                    <div style={{
                        border: `1px solid ${custom.primaryColor}`, borderRadius: '1mm', padding: '0.8mm',
                        ...getOffset(custom.recipientOffsetX, custom.recipientOffsetY),
                        width: `${custom.recipientWidth}%`,
                        height: `${custom.recipientHeight}%`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: getVerticalAlign(custom.recipientVerticalAlign),
                        alignItems: getHorizontalAlign(custom.recipientTextAlign),
                    }}>
                        <div style={{ fontSize: `${2.2 * custom.recipientFontScale}mm`, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: getTextAlign(custom.recipientTextAlign) }}>{order.recipient}</div>
                        {custom.showPhone && (
                            <div style={{
                                fontSize: `${1.8 * custom.phoneFontScale}mm`,
                                fontFamily: 'monospace',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textAlign: getTextAlign(custom.recipientTextAlign),
                                ...getOffset(custom.phoneOffsetX, custom.phoneOffsetY),
                            }} dir="ltr">{order.phone}</div>
                        )}
                    </div>
                    {custom.showAddress && (
                        <div style={{
                            border: `1px solid ${custom.primaryColor}`, borderRadius: '1mm', padding: '0.8mm', flex: 1,
                            ...getOffset(custom.addressOffsetX, custom.addressOffsetY),
                            width: `${custom.addressWidth}%`,
                            height: `${custom.addressHeight}%`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: getVerticalAlign(custom.addressVerticalAlign),
                            alignItems: getHorizontalAlign(custom.addressTextAlign),
                        }}>
                            <div style={{ fontSize: `${1.8 * custom.addressFontScale}mm`, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: getTextAlign(custom.addressTextAlign) }}>{order.address}</div>
                            <div style={{ display: 'flex', gap: '0.5mm', fontSize: `${1.6 * custom.cityFontScale}mm`, fontWeight: 'bold', marginTop: '0.5mm', textAlign: getTextAlign(custom.addressTextAlign) }}>
                                {custom.showCity && <div style={{
                                    border: `1px solid ${custom.primaryColor}`,
                                    padding: '0.3mm',
                                    flex: 1,
                                    textAlign: getTextAlign(custom.cityTextAlign),
                                    ...getOffset(custom.cityOffsetX, custom.cityOffsetY),
                                    width: `${custom.cityWidth}%`,
                                    height: `${custom.cityHeight}%`,
                                    display: 'flex',
                                    alignItems: getVerticalAlign(custom.cityVerticalAlign),
                                    justifyContent: getHorizontalAlign(custom.cityTextAlign),
                                    fontSize: `${1.6 * custom.cityFontScale}mm`,
                                }}>{order.city}</div>}
                                {custom.showRegion && <div style={{
                                    border: `1px solid ${custom.primaryColor}`,
                                    padding: '0.3mm',
                                    flex: 1,
                                    textAlign: getTextAlign(custom.regionTextAlign),
                                    ...getOffset(custom.regionOffsetX, custom.regionOffsetY),
                                    width: `${custom.regionWidth}%`,
                                    height: `${custom.regionHeight}%`,
                                    display: 'flex',
                                    alignItems: getVerticalAlign(custom.regionVerticalAlign),
                                    justifyContent: getHorizontalAlign(custom.regionTextAlign),
                                    fontSize: `${1.6 * custom.regionFontScale}mm`,
                                }}>{order.region}</div>}
                            </div>
                        </div>
                    )}
                    {custom.showMerchant && (
                        <div style={{
                            fontSize: `${1.6 * custom.merchantFontScale}mm`,
                            textAlign: getTextAlign(custom.merchantTextAlign),
                            border: `1px solid ${custom.primaryColor}`,
                            borderRadius: '0.8mm',
                            padding: '0.5mm',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            ...getOffset(custom.merchantOffsetX, custom.merchantOffsetY),
                            width: `${custom.merchantWidth}%`,
                            height: `${custom.merchantHeight}%`,
                            display: 'flex',
                            alignItems: getVerticalAlign(custom.merchantVerticalAlign),
                            justifyContent: getHorizontalAlign(custom.merchantTextAlign),
                        }}>
                            {order.merchant}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const render75x50Landscape = (order: Order) => {
        return (
            <div key={order.id} className="thermal-label-opt" style={{
                width: `${widthPx}px`, height: `${heightPx}px`,
                ['--label-width-mm' as any]: `${widthMM}mm`,
                ['--label-height-mm' as any]: `${heightMM}mm`,
                border: `${custom.borderWidth}px solid ${custom.primaryColor}`, background: '#fff', fontFamily: 'Arial, sans-serif',
                display: 'flex', boxSizing: 'border-box', pageBreakAfter: 'always',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Left - Barcode & COD */}
                <div style={{ width: '35%', borderRight: `${custom.borderWidth}px solid ${custom.primaryColor}`, display: 'flex', flexDirection: 'column' }}>
                    {custom.showBarcode && (
                        <div style={{
                            padding: '0.8mm', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            ...getOffset(custom.barcodeOffsetX, custom.barcodeOffsetY),
                        }}>
                            <div style={{
                                padding: '0.5mm',
                                width: `${custom.barcodeWidth}%`,
                                height: `${custom.barcodeHeight}%`,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <Barcode value={order.id} width={0.9} height={22} fontSize={7} margin={0} />
                            </div>
                        </div>
                    )}
                    {custom.showCOD && (
                        <div style={{
                            padding: '1.2mm', textAlign: getTextAlign(custom.codTextAlign), borderTop: `${custom.borderWidth}px solid ${custom.primaryColor}`,
                            ...getOffset(custom.codOffsetX, custom.codOffsetY),
                            width: `${custom.codWidth}%`,
                            height: `${custom.codHeight}%`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: getVerticalAlign(custom.codVerticalAlign),
                            alignItems: getHorizontalAlign(custom.codTextAlign),
                        }}>
                            <div style={{ fontSize: `${4.5 * custom.codFontScale}mm`, fontWeight: 900 }} dir="ltr">{order.cod} {currencySymbol}</div>
                        </div>
                    )}
                </div>

                {/* Right - Info */}
                <div style={{ width: '65%', padding: '0.8mm', display: 'flex', flexDirection: 'column', gap: '0.6mm' }}>
                    <div style={{
                        border: `1px solid ${custom.primaryColor}`, borderRadius: '1mm', padding: '0.8mm',
                        ...getOffset(custom.recipientOffsetX, custom.recipientOffsetY),
                        width: `${custom.recipientWidth}%`,
                        height: `${custom.recipientHeight}%`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: getVerticalAlign(custom.recipientVerticalAlign),
                        alignItems: getHorizontalAlign(custom.recipientTextAlign),
                    }}>
                        <div style={{ fontSize: `${2.2 * custom.recipientFontScale}mm`, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: getTextAlign(custom.recipientTextAlign) }}>{order.recipient}</div>
                        {custom.showPhone && (
                            <div style={{
                                fontSize: `${1.8 * custom.phoneFontScale}mm`,
                                fontFamily: 'monospace',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textAlign: getTextAlign(custom.recipientTextAlign),
                                ...getOffset(custom.phoneOffsetX, custom.phoneOffsetY),
                            }} dir="ltr">{order.phone}</div>
                        )}
                    </div>
                    {custom.showAddress && (
                        <div style={{
                            border: `1px solid ${custom.primaryColor}`, borderRadius: '1mm', padding: '0.8mm', flex: 1,
                            ...getOffset(custom.addressOffsetX, custom.addressOffsetY),
                            width: `${custom.addressWidth}%`,
                            height: `${custom.addressHeight}%`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: getVerticalAlign(custom.addressVerticalAlign),
                            alignItems: getHorizontalAlign(custom.addressTextAlign),
                        }}>
                            <div style={{ fontSize: `${1.8 * custom.addressFontScale}mm`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: getTextAlign(custom.addressTextAlign) }}>{order.address}</div>
                            <div style={{ display: 'flex', gap: '0.5mm', marginTop: '0.5mm' }}>
                                {custom.showCity && <div style={{
                                    border: `1px solid ${custom.primaryColor}`,
                                    padding: '0.3mm',
                                    flex: 1,
                                    textAlign: getTextAlign(custom.cityTextAlign),
                                    ...getOffset(custom.cityOffsetX, custom.cityOffsetY),
                                    width: `${custom.cityWidth}%`,
                                    height: `${custom.cityHeight}%`,
                                    display: 'flex',
                                    alignItems: getVerticalAlign(custom.cityVerticalAlign),
                                    justifyContent: getHorizontalAlign(custom.cityTextAlign),
                                    fontSize: `${1.6 * custom.cityFontScale}mm`,
                                    fontWeight: 'bold',
                                }}>{order.city}</div>}
                                {custom.showRegion && <div style={{
                                    border: `1px solid ${custom.primaryColor}`,
                                    padding: '0.3mm',
                                    flex: 1,
                                    textAlign: getTextAlign(custom.regionTextAlign),
                                    ...getOffset(custom.regionOffsetX, custom.regionOffsetY),
                                    width: `${custom.regionWidth}%`,
                                    height: `${custom.regionHeight}%`,
                                    display: 'flex',
                                    alignItems: getVerticalAlign(custom.regionVerticalAlign),
                                    justifyContent: getHorizontalAlign(custom.regionTextAlign),
                                    fontSize: `${1.6 * custom.regionFontScale}mm`,
                                    fontWeight: 'bold',
                                }}>{order.region}</div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ========== تصميم 60×40 (صغير) ==========
    const render60x40Portrait = (order: Order) => {
        return (
            <div key={order.id} className="thermal-label-opt" style={{
                width: `${widthPx}px`, height: `${heightPx}px`,
                ['--label-width-mm' as any]: `${widthMM}mm`,
                ['--label-height-mm' as any]: `${heightMM}mm`,
                border: `${custom.borderWidth}px solid ${custom.primaryColor}`, background: '#fff', fontFamily: 'Arial, sans-serif',
                display: 'flex', flexDirection: 'column', boxSizing: 'border-box', pageBreakAfter: 'always',
                position: 'relative', overflow: 'hidden',
            }}>
                {custom.showBarcode && (
                    <div style={{
                        padding: '0.7mm', textAlign: 'center', borderBottom: `1px solid ${custom.primaryColor}`,
                        ...getOffset(custom.barcodeOffsetX, custom.barcodeOffsetY),
                    }}>
                        <div style={{
                            padding: '0.5mm',
                            display: 'inline-block',
                            width: `${custom.barcodeWidth}%`,
                            height: `${custom.barcodeHeight}%`,
                        }}>
                            <Barcode value={order.id} width={0.9} height={14} fontSize={7} margin={0} />
                        </div>
                    </div>
                )}
                {custom.showCOD && (
                    <div style={{
                        border: `1px solid ${custom.primaryColor}`, margin: '0.6mm', borderRadius: '1mm', padding: '0.8mm',
                        textAlign: getTextAlign(custom.codTextAlign),
                        ...getOffset(custom.codOffsetX, custom.codOffsetY),
                        width: `${custom.codWidth}%`,
                        height: `${custom.codHeight}%`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: getVerticalAlign(custom.codVerticalAlign),
                        alignItems: getHorizontalAlign(custom.codTextAlign),
                    }}>
                        <div style={{ fontSize: `${1.3 * custom.bodyFontScale}mm`, fontWeight: 'bold' }}>المبلغ</div>
                        <div style={{ fontSize: `${3.5 * custom.codFontScale}mm`, fontWeight: 900 }} dir="ltr">{order.cod} {currencySymbol}</div>
                    </div>
                )}
                <div style={{ flex: 1, padding: '0.6mm', display: 'flex', flexDirection: 'column', gap: '0.4mm' }}>
                    <div style={{
                        border: `1px solid ${custom.primaryColor}`, borderRadius: '0.8mm', padding: '0.4mm',
                        fontSize: `${1.8 * custom.recipientFontScale}mm`, fontWeight: 900,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        textAlign: getTextAlign(custom.recipientTextAlign),
                        ...getOffset(custom.recipientOffsetX, custom.recipientOffsetY),
                        width: `${custom.recipientWidth}%`,
                        height: `${custom.recipientHeight}%`,
                        display: 'flex',
                        alignItems: getVerticalAlign(custom.recipientVerticalAlign),
                        justifyContent: getHorizontalAlign(custom.recipientTextAlign),
                    }}>{order.recipient}</div>
                    {custom.showPhone && (
                        <div style={{
                            fontSize: `${1.5 * custom.phoneFontScale}mm`,
                            fontFamily: 'monospace',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: getTextAlign(custom.recipientTextAlign),
                            ...getOffset(custom.phoneOffsetX, custom.phoneOffsetY),
                        }} dir="ltr">{order.phone}</div>
                    )}
                    {(custom.showCity || custom.showRegion) && (
                        <div style={{ display: 'flex', gap: '0.2mm' }}>
                            {custom.showCity && <div style={{
                                border: `1px solid ${custom.primaryColor}`,
                                padding: '0.2mm',
                                flex: 1,
                                fontSize: `${1.3 * custom.cityFontScale}mm`,
                                fontWeight: 'bold',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textAlign: getTextAlign(custom.cityTextAlign),
                                ...getOffset(custom.cityOffsetX, custom.cityOffsetY),
                                width: `${custom.cityWidth}%`,
                                height: `${custom.cityHeight}%`,
                                display: 'flex',
                                alignItems: getVerticalAlign(custom.cityVerticalAlign),
                                justifyContent: getHorizontalAlign(custom.cityTextAlign),
                            }}>{order.city}</div>}
                            {custom.showRegion && <div style={{
                                border: `1px solid ${custom.primaryColor}`,
                                padding: '0.2mm',
                                flex: 1,
                                fontSize: `${1.3 * custom.regionFontScale}mm`,
                                fontWeight: 'bold',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textAlign: getTextAlign(custom.regionTextAlign),
                                ...getOffset(custom.regionOffsetX, custom.regionOffsetY),
                                width: `${custom.regionWidth}%`,
                                height: `${custom.regionHeight}%`,
                                display: 'flex',
                                alignItems: getVerticalAlign(custom.regionVerticalAlign),
                                justifyContent: getHorizontalAlign(custom.regionTextAlign),
                            }}>{order.region}</div>}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const render60x40Landscape = (order: Order) => {
        return (
            <div key={order.id} className="thermal-label-opt" style={{
                width: `${widthPx}px`, height: `${heightPx}px`,
                ['--label-width-mm' as any]: `${widthMM}mm`,
                ['--label-height-mm' as any]: `${heightMM}mm`,
                border: `${custom.borderWidth}px solid ${custom.primaryColor}`, background: '#fff', fontFamily: 'Arial, sans-serif',
                display: 'flex', boxSizing: 'border-box', pageBreakAfter: 'always',
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ width: '35%', borderRight: `${custom.borderWidth}px solid ${custom.primaryColor}`, display: 'flex', flexDirection: 'column' }}>
                    {custom.showBarcode && (
                        <div style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5mm',
                            ...getOffset(custom.barcodeOffsetX, custom.barcodeOffsetY),
                        }}>
                            <div style={{
                                padding: '0.3mm',
                                width: `${custom.barcodeWidth}%`,
                                height: `${custom.barcodeHeight}%`,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <Barcode value={order.id} width={0.7} height={16} fontSize={6} margin={0} />
                            </div>
                        </div>
                    )}
                    {custom.showCOD && (
                        <div style={{
                            padding: '0.8mm', textAlign: getTextAlign(custom.codTextAlign), borderTop: `${custom.borderWidth}px solid ${custom.primaryColor}`,
                            ...getOffset(custom.codOffsetX, custom.codOffsetY),
                            width: `${custom.codWidth}%`,
                            height: `${custom.codHeight}%`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: getVerticalAlign(custom.codVerticalAlign),
                            alignItems: getHorizontalAlign(custom.codTextAlign),
                        }}>
                            <div style={{ fontSize: `${3.5 * custom.codFontScale}mm`, fontWeight: 900 }} dir="ltr">{order.cod}</div>
                        </div>
                    )}
                </div>
                <div style={{ width: '65%', padding: '0.6mm', display: 'flex', flexDirection: 'column', gap: '0.4mm' }}>
                    <div style={{
                        fontSize: `${1.8 * custom.recipientFontScale}mm`,
                        fontWeight: 900,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textAlign: getTextAlign(custom.recipientTextAlign),
                        ...getOffset(custom.recipientOffsetX, custom.recipientOffsetY),
                        width: `${custom.recipientWidth}%`,
                        height: `${custom.recipientHeight}%`,
                        display: 'flex',
                        alignItems: getVerticalAlign(custom.recipientVerticalAlign),
                        justifyContent: getHorizontalAlign(custom.recipientTextAlign),
                    }}>{order.recipient}</div>
                    {custom.showPhone && (
                        <div style={{
                            fontSize: `${1.5 * custom.phoneFontScale}mm`,
                            fontFamily: 'monospace',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: getTextAlign(custom.recipientTextAlign),
                            ...getOffset(custom.phoneOffsetX, custom.phoneOffsetY),
                        }} dir="ltr">{order.phone}</div>
                    )}
                    <div style={{ display: 'flex', gap: '0.2mm' }}>
                        {custom.showCity && <div style={{
                            border: `1px solid ${custom.primaryColor}`,
                            padding: '0.2mm',
                            flex: 1,
                            fontSize: `${1.3 * custom.cityFontScale}mm`,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: getTextAlign(custom.cityTextAlign),
                            ...getOffset(custom.cityOffsetX, custom.cityOffsetY),
                            width: `${custom.cityWidth}%`,
                            height: `${custom.cityHeight}%`,
                            display: 'flex',
                            alignItems: getVerticalAlign(custom.cityVerticalAlign),
                            justifyContent: getHorizontalAlign(custom.cityTextAlign),
                        }}>{order.city}</div>}
                        {custom.showRegion && <div style={{
                            border: `1px solid ${custom.primaryColor}`,
                            padding: '0.2mm',
                            flex: 1,
                            fontSize: `${1.3 * custom.regionFontScale}mm`,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: getTextAlign(custom.regionTextAlign),
                            ...getOffset(custom.regionOffsetX, custom.regionOffsetY),
                            width: `${custom.regionWidth}%`,
                            height: `${custom.regionHeight}%`,
                            display: 'flex',
                            alignItems: getVerticalAlign(custom.regionVerticalAlign),
                            justifyContent: getHorizontalAlign(custom.regionTextAlign),
                        }}>{order.region}</div>}
                    </div>
                </div>
            </div>
        );
    };

    // ========== تصميم 50×30 (الأصغر) ==========
    const render50x30Portrait = (order: Order) => {
        return (
            <div key={order.id} className="thermal-label-opt" style={{
                width: `${widthPx}px`, height: `${heightPx}px`,
                ['--label-width-mm' as any]: `${widthMM}mm`,
                ['--label-height-mm' as any]: `${heightMM}mm`,
                border: `${custom.borderWidth}px solid ${custom.primaryColor}`, background: '#fff', fontFamily: 'Arial, sans-serif',
                display: 'flex', flexDirection: 'column', boxSizing: 'border-box', pageBreakAfter: 'always',
                position: 'relative', overflow: 'hidden',
            }}>
                {custom.showBarcode && (
                    <div style={{
                        padding: '0.4mm', textAlign: 'center', borderBottom: `1px solid ${custom.primaryColor}`,
                        ...getOffset(custom.barcodeOffsetX, custom.barcodeOffsetY),
                    }}>
                        <div style={{
                            padding: '0.3mm',
                            display: 'inline-block',
                            width: `${custom.barcodeWidth}%`,
                            height: `${custom.barcodeHeight}%`,
                        }}>
                            <Barcode value={order.id} width={0.65} height={9} fontSize={5} margin={0} />
                        </div>
                    </div>
                )}
                {custom.showCOD && (
                    <div style={{
                        border: `1px solid ${custom.primaryColor}`, margin: '0.4mm', borderRadius: '0.8mm', padding: '0.6mm',
                        textAlign: getTextAlign(custom.codTextAlign),
                        ...getOffset(custom.codOffsetX, custom.codOffsetY),
                        width: `${custom.codWidth}%`,
                        height: `${custom.codHeight}%`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: getVerticalAlign(custom.codVerticalAlign),
                        alignItems: getHorizontalAlign(custom.codTextAlign),
                    }}>
                        <div style={{ fontSize: `${3 * custom.codFontScale}mm`, fontWeight: 900 }} dir="ltr">{order.cod} {currencySymbol}</div>
                    </div>
                )}
                <div style={{ flex: 1, padding: '0.4mm', display: 'flex', flexDirection: 'column', gap: '0.3mm' }}>
                    <div style={{
                        fontSize: `${1.4 * custom.recipientFontScale}mm`,
                        fontWeight: 900,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textAlign: getTextAlign(custom.recipientTextAlign),
                        ...getOffset(custom.recipientOffsetX, custom.recipientOffsetY),
                        width: `${custom.recipientWidth}%`,
                        height: `${custom.recipientHeight}%`,
                        display: 'flex',
                        alignItems: getVerticalAlign(custom.recipientVerticalAlign),
                        justifyContent: getHorizontalAlign(custom.recipientTextAlign),
                    }}>
                        {order.recipient}
                    </div>
                </div>
            </div>
        );
    };

    const render50x30Landscape = (order: Order) => {
        return (
            <div key={order.id} className="thermal-label-opt" style={{
                width: `${widthPx}px`, height: `${heightPx}px`,
                ['--label-width-mm' as any]: `${widthMM}mm`,
                ['--label-height-mm' as any]: `${heightMM}mm`,
                border: `${custom.borderWidth}px solid ${custom.primaryColor}`, background: '#fff', fontFamily: 'Arial, sans-serif',
                display: 'flex', boxSizing: 'border-box', pageBreakAfter: 'always',
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ width: '40%', borderRight: `${custom.borderWidth}px solid ${custom.primaryColor}`, display: 'flex', flexDirection: 'column' }}>
                    {custom.showBarcode && (
                        <div style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.3mm',
                            ...getOffset(custom.barcodeOffsetX, custom.barcodeOffsetY),
                        }}>
                            <div style={{
                                padding: '0.2mm',
                                width: `${custom.barcodeWidth}%`,
                                height: `${custom.barcodeHeight}%`,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <Barcode value={order.id} width={0.5} height={12} fontSize={5} margin={0} />
                            </div>
                        </div>
                    )}
                    {custom.showCOD && (
                        <div style={{
                            padding: '0.5mm', textAlign: getTextAlign(custom.codTextAlign), borderTop: `1px solid ${custom.primaryColor}`,
                            ...getOffset(custom.codOffsetX, custom.codOffsetY),
                            width: `${custom.codWidth}%`,
                            height: `${custom.codHeight}%`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: getVerticalAlign(custom.codVerticalAlign),
                            alignItems: getHorizontalAlign(custom.codTextAlign),
                        }}>
                            <div style={{ fontSize: `${2.5 * custom.codFontScale}mm`, fontWeight: 900 }} dir="ltr">{order.cod}</div>
                        </div>
                    )}
                </div>
                <div style={{ width: '60%', padding: '0.4mm', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.3mm' }}>
                    <div style={{
                        fontSize: `${1.4 * custom.recipientFontScale}mm`,
                        fontWeight: 900,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textAlign: getTextAlign(custom.recipientTextAlign),
                        ...getOffset(custom.recipientOffsetX, custom.recipientOffsetY),
                        width: `${custom.recipientWidth}%`,
                        height: `${custom.recipientHeight}%`,
                        display: 'flex',
                        alignItems: getVerticalAlign(custom.recipientVerticalAlign),
                        justifyContent: getHorizontalAlign(custom.recipientTextAlign),
                    }}>{order.recipient}</div>
                </div>
            </div>
        );
    };

    // دالة اختيار التصميم المناسب
    const renderLabel = (order: Order) => {
        if (baseSize === '100x150') {
            return isLandscape ? render100x150Landscape(order) : render100x150Portrait(order);
        }
        if (baseSize === '100x100') {
            return render100x100(order);
        }
        if (baseSize === '75x50') {
            return isLandscape ? render75x50Landscape(order) : render75x50Portrait(order);
        }
        if (baseSize === '60x40') {
            return isLandscape ? render60x40Landscape(order) : render60x40Portrait(order);
        }
        if (baseSize === '50x30') {
            return isLandscape ? render50x30Landscape(order) : render50x30Portrait(order);
        }
        return null;
    };

    // عند إخفاء أدوات التحكم، نعرض المعاينة مباشرة
    if (hideControls) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '16px', backgroundColor: '#f5f5f5', minHeight: '100%' }}>
                {orders.map(renderLabel)}
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', minHeight: '600px', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
            {/* أدوات التحكم */}
            <div style={{ backgroundColor: '#fff', padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>حجم الملصق:</Label>
                    <select
                        value={baseSize}
                        onChange={(e) => setBaseSize(e.target.value as BaseSize)}
                        style={{
                            padding: '6px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: '#fff',
                            minWidth: '180px'
                        }}
                    >
                        {Object.entries(BASE_SIZES).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                        ))}
                    </select>
                </div>

                {sizeConfig.supportsLandscape && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>الاتجاه:</Label>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="orientation"
                                    value="portrait"
                                    checked={orientation === 'portrait'}
                                    onChange={(e) => setInternalOrientation(e.target.value as Orientation)}
                                    style={{ margin: 0 }}
                                />
                                <span style={{ fontSize: '14px' }}>عمودي</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="orientation"
                                    value="landscape"
                                    checked={orientation === 'landscape'}
                                    onChange={(e) => setInternalOrientation(e.target.value as Orientation)}
                                    style={{ margin: 0 }}
                                />
                                <span style={{ fontSize: '14px' }}>أفقي</span>
                            </label>
                        </div>
                    </div>
                )}

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
                <iframe
                    src={pdfUrl}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        flex: 1
                    }}
                />
            ) : (
                <div className="h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">جاري تحميل المعاينة...</div>
                </div>
            )}

            {/* البوالص مخفية */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>{orders.map(renderLabel)}</div>
        </div>
    );
});
ThermalLabelOptimized.displayName = 'ThermalLabelOptimized';
export default ThermalLabelOptimized;
