
// HTML Templates mirroring ModernPolicyV2 and ThermalLabelOptimized designs with JsBarcode integration

interface PdfTemplateOptions {
    width?: number; // mm
    height?: number; // mm
}

// دالة مساعدة لتوليد السكريبت المشترك للباركود
const getBarcodeScript = () => `
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
<script>
    window.onload = function() {
        // البحث عن جميع العناصر التي تحمل كلاس barcode-target وتوليد الباركود لها
        const barcodes = document.querySelectorAll('.barcode-target');
        barcodes.forEach(function(svg) {
            const value = svg.getAttribute('data-value');
            if (value) {
                try {
                    JsBarcode(svg, value, {
                        format: "CODE128",
                        width: 2,
                        height: 40,
                        displayValue: false, // نخفي الرقم لأننا نظهره بشكل مخصص
                        margin: 0
                    });
                } catch (e) {
                    console.error('Barcode error:', e);
                }
            }
        });
    }
</script>
`;

// تعريف الواجهة لتجنب الأخطاء
interface ThermalCustomization {
    showBarcode?: boolean;
    showCOD?: boolean;
    showPhone?: boolean;
    showAddress?: boolean;
    showCity?: boolean;
    showRegion?: boolean;
    showMerchant?: boolean;
    showDate?: boolean;
    primaryColor?: string;
    orientation?: 'portrait' | 'landscape';
    codFontScale?: number;
    recipientFontScale?: number;
    phoneFontScale?: number;
    addressFontScale?: number;
    cityFontScale?: number;
    regionFontScale?: number;
    merchantFontScale?: number;
    dateFontScale?: number;
    orderIdFontScale?: number;
    bodyFontScale?: number;
    borderWidth?: number;
    elementSpacing?: number;
    contentPadding?: number;
    codPadding?: number;
    sectionSpacing?: number;
    // Offsets
    barcodeOffsetX?: number; barcodeOffsetY?: number;
    codOffsetX?: number; codOffsetY?: number;
    orderIdOffsetX?: number; orderIdOffsetY?: number;
    recipientOffsetX?: number; recipientOffsetY?: number;
    phoneOffsetX?: number; phoneOffsetY?: number;
    addressOffsetX?: number; addressOffsetY?: number;
    cityOffsetX?: number; cityOffsetY?: number;
    regionOffsetX?: number; regionOffsetY?: number;
    merchantOffsetX?: number; merchantOffsetY?: number;
    dateOffsetX?: number; dateOffsetY?: number;
    // Dimensions
    barcodeWidth?: number; barcodeHeight?: number;
    codWidth?: number; codHeight?: number;
    orderIdWidth?: number; orderIdHeight?: number;
    recipientWidth?: number; recipientHeight?: number;
    addressWidth?: number; addressHeight?: number;
    cityWidth?: number; cityHeight?: number;
    regionWidth?: number; regionHeight?: number;
    merchantWidth?: number; merchantHeight?: number;
    dateWidth?: number; dateHeight?: number;
    // Alignment
    codTextAlign?: string;
    recipientTextAlign?: string;
    addressTextAlign?: string;
    merchantTextAlign?: string;
    dateTextAlign?: string;
    orderIdTextAlign?: string;
    cityTextAlign?: string;
    regionTextAlign?: string;
    // Vertical Align
    codVerticalAlign?: string;
    recipientVerticalAlign?: string;
    addressVerticalAlign?: string;
    merchantVerticalAlign?: string;
    dateVerticalAlign?: string;
    orderIdVerticalAlign?: string;
    cityVerticalAlign?: string;
    regionVerticalAlign?: string;
}

export function createThermalLabelHtml(
    data: {
        companyName: string;
        orderNumber: string | number;
        recipient: string;
        phone: string;
        address: string;
        cod: number;
        barcode?: string;
        city?: string;
        region?: string;
        merchant?: string;
        date?: string;
    },
    options: PdfTemplateOptions & { customization?: ThermalCustomization } = {}
): string {
    const width = options.width || 100;
    const height = options.height || 150;
    const barcodeVal = data.barcode || data.orderNumber;

    // إعدادات التخصيص الافتراضية
    const c = options.customization || {};
    const isLandscape = width > height || c.orientation === 'landscape';
    const custom = {
        showBarcode: c.showBarcode ?? true,
        showCOD: c.showCOD ?? true,
        showPhone: c.showPhone ?? true,
        showAddress: c.showAddress ?? true,
        showCity: c.showCity ?? true,
        showRegion: c.showRegion ?? true,
        showMerchant: c.showMerchant ?? true,
        showDate: c.showDate ?? true,
        primaryColor: c.primaryColor ?? '#000000',
        codFontScale: c.codFontScale ?? 1,
        recipientFontScale: c.recipientFontScale ?? c.bodyFontScale ?? 1,
        phoneFontScale: c.phoneFontScale ?? c.bodyFontScale ?? 1,
        addressFontScale: c.addressFontScale ?? c.bodyFontScale ?? 1,
        cityFontScale: c.cityFontScale ?? c.bodyFontScale ?? 1,
        regionFontScale: c.regionFontScale ?? c.bodyFontScale ?? 1,
        merchantFontScale: c.merchantFontScale ?? c.bodyFontScale ?? 1,
        dateFontScale: c.dateFontScale ?? c.bodyFontScale ?? 1,
        bodyFontScale: c.bodyFontScale ?? 1,
        borderWidth: c.borderWidth ?? 2,
        elementSpacing: c.elementSpacing ?? 1.5,
        contentPadding: c.contentPadding ?? 2,
        codPadding: c.codPadding ?? 3,
        sectionSpacing: c.sectionSpacing ?? 2,
        // Offsets
        barcodeOffsetX: c.barcodeOffsetX ?? 0, barcodeOffsetY: c.barcodeOffsetY ?? 0,
        codOffsetX: c.codOffsetX ?? 0, codOffsetY: c.codOffsetY ?? 0,
        recipientOffsetX: c.recipientOffsetX ?? 0, recipientOffsetY: c.recipientOffsetY ?? 0,
        phoneOffsetX: c.phoneOffsetX ?? 0, phoneOffsetY: c.phoneOffsetY ?? 0,
        addressOffsetX: c.addressOffsetX ?? 0, addressOffsetY: c.addressOffsetY ?? 0,
        cityOffsetX: c.cityOffsetX ?? 0, cityOffsetY: c.cityOffsetY ?? 0,
        regionOffsetX: c.regionOffsetX ?? 0, regionOffsetY: c.regionOffsetY ?? 0,
        merchantOffsetX: c.merchantOffsetX ?? 0, merchantOffsetY: c.merchantOffsetY ?? 0,
        dateOffsetX: c.dateOffsetX ?? 0, dateOffsetY: c.dateOffsetY ?? 0,
        // Dimensions
        barcodeWidth: c.barcodeWidth ?? 100, barcodeHeight: c.barcodeHeight ?? 100,
        codWidth: c.codWidth ?? 100, codHeight: c.codHeight ?? 100,
        recipientWidth: c.recipientWidth ?? 100, recipientHeight: c.recipientHeight ?? 100,
        addressWidth: c.addressWidth ?? 100, addressHeight: c.addressHeight ?? 100,
        cityWidth: c.cityWidth ?? 100, cityHeight: c.cityHeight ?? 100,
        regionWidth: c.regionWidth ?? 100, regionHeight: c.regionHeight ?? 100,
        merchantWidth: c.merchantWidth ?? 100, merchantHeight: c.merchantHeight ?? 100,
        dateWidth: c.dateWidth ?? 100, dateHeight: c.dateHeight ?? 100,
        // Alignment
        codTextAlign: c.codTextAlign || 'center',
        recipientTextAlign: c.recipientTextAlign || 'center',
        addressTextAlign: c.addressTextAlign || 'center',
        merchantTextAlign: c.merchantTextAlign || 'center',
        dateTextAlign: c.dateTextAlign || 'center',
        cityTextAlign: c.cityTextAlign || 'center',
        regionTextAlign: c.regionTextAlign || 'center',
        // Vertical Align
        codVerticalAlign: c.codVerticalAlign || 'center',
        recipientVerticalAlign: c.recipientVerticalAlign || 'center',
        addressVerticalAlign: c.addressVerticalAlign || 'center',
        merchantVerticalAlign: c.merchantVerticalAlign || 'center',
        dateVerticalAlign: c.dateVerticalAlign || 'center',
        cityVerticalAlign: c.cityVerticalAlign || 'center',
        regionVerticalAlign: c.regionVerticalAlign || 'center',
    };

    const getOffset = (x: number, y: number) =>
        `margin-left: ${x !== 0 ? x + 'mm' : '0'}; margin-top: ${y !== 0 ? y + 'mm' : '0'};`;

    const getFlexAlign = (h: string, v: string) => {
        const hMap: any = { left: 'flex-start', center: 'center', right: 'flex-end' };
        const vMap: any = { top: 'flex-start', center: 'center', bottom: 'flex-end' };
        return `display: flex; flex-direction: column; justify-content: ${vMap[v] || 'center'}; align-items: ${hMap[h] || 'center'}; text-align: ${h};`;
    };

    // --- Template Parts ---

    const barcodeHtml = custom.showBarcode ? `
        <div style="
            border-bottom: ${isLandscape ? '0' : custom.borderWidth + 'px solid ' + custom.primaryColor};
            padding: ${custom.codPadding}mm;
            display: flex; justify-content: center; align-items: center;
            flex: ${isLandscape ? '1' : 'none'};
            ${getOffset(custom.barcodeOffsetX, custom.barcodeOffsetY)}
        ">
            <div style="width: ${custom.barcodeWidth}%; height: ${custom.barcodeHeight}%; display: flex; justify-content: center; align-items: center;">
                <svg class="barcode-target" data-value="${barcodeVal}"></svg>
            </div>
        </div>` : '';

    const codHtml = custom.showCOD ? `
        <div style="
            border: ${isLandscape ? 'none' : '3px solid ' + custom.primaryColor};
            border-top: ${isLandscape ? custom.borderWidth + 'px solid ' + custom.primaryColor : '3px solid ' + custom.primaryColor};
            padding: ${custom.codPadding}mm;
            margin: ${isLandscape ? '0' : custom.sectionSpacing + 'mm'};
            width: ${custom.codWidth}%;
            ${getOffset(custom.codOffsetX, custom.codOffsetY)}
            ${getFlexAlign(custom.codTextAlign, custom.codVerticalAlign)}
        ">
            <div style="font-size: ${3.5 * custom.bodyFontScale}mm; font-weight: bold; margin-bottom: 1mm;">المبلغ المطلوب</div>
            <div style="font-size: ${9 * custom.codFontScale}mm; font-weight: 900; line-height: 1.1; direction: ltr;">${data.cod}</div>
        </div>` : '';

    const recipientHtml = `
        <div style="
            border: 1px solid ${custom.primaryColor};
            padding: ${custom.elementSpacing}mm;
            margin-bottom: ${custom.elementSpacing}mm;
            width: ${custom.recipientWidth}%;
            ${getOffset(custom.recipientOffsetX, custom.recipientOffsetY)}
            ${getFlexAlign(custom.recipientTextAlign, custom.recipientVerticalAlign)}
        ">
            <div style="font-size: ${2.8 * custom.bodyFontScale}mm; font-weight: bold; margin-bottom: 0.8mm;">المستلم</div>
            <div style="font-size: ${3.8 * custom.recipientFontScale}mm; font-weight: 900; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width: 100%;">${data.recipient}</div>
            ${custom.showPhone ? `<div style="font-size: ${3.2 * custom.phoneFontScale}mm; font-family: monospace; margin-top: 0.8mm; direction: ltr; overflow: hidden; text-overflow: ellipsis; width: 100%;">${data.phone}</div>` : ''}
        </div>`;

    const addressHtml = custom.showAddress ? `
        <div style="
            border: 1px solid ${custom.primaryColor};
            padding: ${custom.elementSpacing}mm;
            margin-bottom: ${custom.elementSpacing}mm;
            width: ${custom.addressWidth}%;
            flex: 1;
            ${getOffset(custom.addressOffsetX, custom.addressOffsetY)}
            ${getFlexAlign(custom.addressTextAlign, custom.addressVerticalAlign)}
        ">
            <div style="font-size: ${2.8 * custom.bodyFontScale}mm; font-weight: bold; margin-bottom: 0.8mm;">العنوان</div>
            <div style="font-size: ${3.2 * custom.addressFontScale}mm; line-height: 1.3; margin-bottom: 0.5mm; overflow: hidden; text-overflow: ellipsis;">${data.address}</div>
            <div style="display: flex; gap: ${custom.elementSpacing}mm; width: 100%;">
                ${custom.showCity && data.city ? `<div style="border: 1px solid ${custom.primaryColor}; padding: 0.8mm; flex: 1; font-size: ${2.8 * custom.cityFontScale}mm; overflow: hidden; text-overflow: ellipsis;">${data.city}</div>` : ''}
                ${custom.showRegion && data.region ? `<div style="border: 1px solid ${custom.primaryColor}; padding: 0.8mm; flex: 1; font-size: ${2.8 * custom.regionFontScale}mm; overflow: hidden; text-overflow: ellipsis;">${data.region}</div>` : ''}
            </div>
        </div>` : '';

    const footerHtml = `
        <div style="display: grid; grid-template-columns: 1fr; gap: ${custom.elementSpacing}mm; margin-top: auto;">
            ${custom.showMerchant ? `
            <div style="
                border: 1px solid ${custom.primaryColor};
                padding: ${custom.elementSpacing}mm;
                width: ${custom.merchantWidth}%;
                ${getOffset(custom.merchantOffsetX, custom.merchantOffsetY)}
                ${getFlexAlign(custom.merchantTextAlign, custom.merchantVerticalAlign)}
            ">
                <div style="font-size: ${2 * custom.bodyFontScale}mm; font-weight: bold;">التاجر</div>
                <div style="font-size: ${2.5 * custom.merchantFontScale}mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${data.merchant || '-'}</div>
            </div>` : ''}
        </div>`;

    // --- Layout Logic ---
    let innerContent = '';

    if (isLandscape) {
        // Landscape Layout (Left: Barcode/COD, Right: Info)
        innerContent = `
        <div style="display: flex; width: 100%; height: 100%;">
            <!-- Left Panel -->
            <div style="width: 35%; border-left: ${custom.borderWidth}px solid ${custom.primaryColor}; display: flex; flex-direction: column;">
                ${barcodeHtml}
                ${codHtml}
            </div>
            <!-- Right Panel -->
            <div style="width: 65%; padding: ${custom.contentPadding}mm; display: flex; flex-direction: column;">
                ${recipientHtml}
                ${addressHtml}
                ${footerHtml}
            </div>
        </div>`;
    } else {
        // Portrait Layout (Stacked)
        innerContent = `
        ${barcodeHtml}
        ${codHtml}
        <div style="padding: ${custom.contentPadding}mm; flex: 1; display: flex; flex-direction: column;">
            ${recipientHtml}
            ${addressHtml}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: ${custom.elementSpacing}mm; margin-top: auto;">
                 ${custom.showMerchant ? `
                <div style="border: 1px solid ${custom.primaryColor}; padding: ${custom.elementSpacing}mm; width: ${custom.merchantWidth}%; ${getOffset(custom.merchantOffsetX, custom.merchantOffsetY)} ${getFlexAlign(custom.merchantTextAlign, custom.merchantVerticalAlign)}">
                    <div style="font-size: ${2.3 * custom.bodyFontScale}mm; font-weight: bold;">التاجر</div>
                    <div style="font-size: ${2.8 * custom.merchantFontScale}mm;">${data.merchant || '-'}</div>
                </div>` : ''}
                ${custom.showDate ? `
                <div style="border: 1px solid ${custom.primaryColor}; padding: ${custom.elementSpacing}mm; width: ${custom.dateWidth}%; ${getOffset(custom.dateOffsetX, custom.dateOffsetY)} ${getFlexAlign(custom.dateTextAlign, custom.dateVerticalAlign)}">
                    <div style="font-size: ${2.3 * custom.bodyFontScale}mm; font-weight: bold;">التاريخ</div>
                    <div style="font-size: ${2.8 * custom.dateFontScale}mm; direction: ltr;">${data.date || new Date().toISOString().split('T')[0]}</div>
                </div>` : ''}
            </div>
        </div>`;
    }

    // --- Main Layout ---
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>ملصق حراري</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        body { margin: 0; padding: 0; font-family: 'Cairo', sans-serif; background: white; width: ${width}mm; height: ${height}mm; overflow: hidden; }
        .container {
            width: ${width}mm; height: ${height}mm;
            border: ${custom.borderWidth}px solid ${custom.primaryColor};
            display: flex; flex-direction: column;
            box-sizing: border-box;
            background: #fff;
        }
        svg.barcode-target { width: 100%; height: 100%; max-height: 50px; }
    </style>
</head>
<body>
    <div class="container">
        ${innerContent}
    </div>
    ${getBarcodeScript()}
</body>
</html>`;
}

export function createStandardPolicyHtml(
    data: {
        companyName: string;
        orderNumber: string | number;
        recipient: string;
        phone: string;
        address: string;
        cod: number;
        barcode?: string;
        city?: string;
        region?: string;
        merchant?: string;
        date?: string;
        notes?: string;
    },
    options: PdfTemplateOptions = {}
): string {
    const width = options.width || 210;
    const height = options.height || 297;
    const barcodeVal = data.barcode || data.orderNumber;

    // تصميم حديث مستوحى من ModernPolicyV2
    const primaryColor = '#2563eb'; // blue-600
    const secondaryColor = '#10b981'; // emerald-500

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>بوليصة شحن</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        
        body {
            margin: 0;
            padding: 0;
            font-family: 'Cairo', sans-serif;
            width: ${width}mm;
            height: ${height}mm;
            background: white;
            box-sizing: border-box;
        }

        .page {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
            background: white;
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%);
            color: white;
            padding: 25px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .company-info h1 { margin: 0; font-size: 28px; font-weight: 900; }
        .company-info p { margin: 5px 0 0; font-size: 14px; opacity: 0.9; }

        .barcode-box {
            background: white;
            padding: 10px;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 200px;
        }

        /* Order Number Strip */
        .order-strip {
            background: #1e293b;
            color: white;
            padding: 15px;
            text-align: center;
            font-size: 24px;
            font-weight: 900;
            letter-spacing: 1px;
        }

        /* COD Box */
        .cod-box {
            background: linear-gradient(135deg, ${secondaryColor} 0%, ${secondaryColor}dd 100%);
            color: white;
            padding: 25px;
            margin: 25px 40px;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
        }
        
        .cod-label { font-size: 16px; font-weight: bold; margin-bottom: 8px; opacity: 0.95; }
        .cod-value { font-size: 48px; font-weight: 900; line-height: 1.1; }

        /* Content Area */
        .content {
            padding: 0 40px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            flex: 1;
        }

        .section {
            padding: 20px;
            border-radius: 12px;
            position: relative;
        }

        .section-merchant { background: #f3e8ff; border: 2px solid #a855f7; }
        .section-recipient { background: #dbeafe; border: 2px solid ${primaryColor}; }
        .section-address { background: #f8fafc; border: 2px solid #e2e8f0; }
        .section-notes { background: #fef3c7; border: 2px dashed #f59e0b; }

        .label { font-size: 13px; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { font-size: 20px; font-weight: 900; line-height: 1.4; }
        
        .merchant-label { color: #7c3aed; }
        .merchant-value { color: #581c87; }
        
        .recipient-label { color: #1d4ed8; }
        .recipient-value { color: #1e3a8a; }
        
        .phone { 
            font-family: monospace; 
            font-size: 18px; 
            color: #1e40af; 
            margin-top: 5px;
            direction: ltr;
            text-align: right;
            font-weight: bold;
        }

        .tags { display: flex; gap: 10px; margin-top: 12px; }
        .tag { padding: 6px 14px; border-radius: 6px; font-size: 14px; font-weight: bold; color: white; }
        .tag-city { background: ${primaryColor}; }
        .tag-region { background: #64748b; }

        /* Footer terms & Signatures */
        .footer-wrapper {
            margin-top: auto;
            background: #f8fafc;
            border-top: 2px solid #e2e8f0;
            padding: 30px 40px 40px;
        }

        .terms {
            font-size: 11px;
            color: #64748b;
            margin-bottom: 30px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .signatures {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        
        .sig-block { text-align: center; }
        .sig-line { width: 200px; border-bottom: 2px solid #94a3b8; height: 40px; margin-top: 10px; }
        .sig-label { font-size: 14px; font-weight: bold; color: #475569; }

        svg.barcode-target {
            max-width: 100%;
            height: 40px;
        }
    </style>
</head>
<body>
    <div class="page">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <h1>${data.companyName}</h1>
                <p>خدمات لوجستية متكاملة</p>
            </div>
            <div class="barcode-box">
                <svg class="barcode-target" data-value="${barcodeVal}"></svg>
                <div style="font-size: 12px; font-weight: bold;">${barcodeVal}</div>
            </div>
        </div>

        <div class="order-strip">
            <span style="opacity: 0.7; font-size: 16px;">رقم الطلب</span> #${data.orderNumber}
        </div>

        <div class="cod-box">
            <div class="cod-label">المبلغ المطلوب تحصيله (شامل التوصيل)</div>
            <div class="cod-value" dir="ltr">${data.cod}</div>
        </div>

        <div class="content">
            <!-- Merchant -->
            <div class="section section-merchant">
                <div class="label merchant-label">📦 المرسل (التاجر)</div>
                <div class="value merchant-value">${data.merchant || '-'}</div>
            </div>

            <!-- Recipient -->
            <div class="section section-recipient">
                <div class="label recipient-label">👤 المستلم</div>
                <div class="value recipient-value">${data.recipient}</div>
                <div class="phone" dir="ltr">${data.phone}</div>
            </div>

            <!-- Address -->
            <div class="section section-address">
                <div class="label">📍 عنوان التوصيل</div>
                <div class="value" style="font-size: 18px; font-weight: 600;">${data.address}</div>
                <div class="tags">
                    ${data.city ? `<div class="tag tag-city">${data.city}</div>` : ''}
                    ${data.region ? `<div class="tag tag-region">${data.region}</div>` : ''}
                </div>
            </div>

            <!-- Notes -->
            ${data.notes ? `
            <div class="section section-notes">
                <div class="label" style="color: #b45309;">📝 ملاحظات</div>
                <div class="value" style="font-size: 16px; font-weight: normal; color: #92400e;">${data.notes}</div>
            </div>
            ` : ''}
        </div>

        <!-- Footer -->
        <div class="footer-wrapper">
            <div class="terms">
                <strong>⚠️ شروط وأحكام الاستلام:</strong>
                <ul style="margin: 5px 20px 0 0; padding: 0;">
                    <li>تعتبر الشركة مجرد ناقل ولا تتحمل مسؤولية محتوى أو جودة البضاعة المشحونة.</li>
                    <li>يجب على المستلم التأكد من سلامة الطرد ظاهرياً قبل التوقيع بالاستلام.</li>
                    <li>التوقيع أدناه يعتبر إقراراً نهائياً باستلام البضاعة بحالة جيدة وبراءة ذمة الشركة.</li>
                </ul>
            </div>

            <div class="signatures">
                <div class="sig-block">
                    <div class="sig-label">توقيع المستلم</div>
                    <div class="sig-line"></div>
                </div>
                <div class="sig-block">
                    <div class="sig-label">ختم وتوقيع الشركة</div>
                    <div class="sig-line"></div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;">
                تمت الطباعة بتاريخ: ${data.date || new Date().toISOString().split('T')[0]}
            </div>
        </div>
    </div>
    ${getBarcodeScript()}
</body>
</html>`;
}
