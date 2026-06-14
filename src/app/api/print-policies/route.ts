/**
 * API لطباعة البوالص - يستخدم القوالب المحفوظة
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { controls, orders, companyName, templateHtml } = await req.json();

    // حساب الأبعاد
    let width = 100, height = 150;
    if (controls?.size) {
      if (controls.size === 'a4') {
        width = 210;
        height = 297;
      } else if (controls.size === 'a5') {
        width = 148;
        height = 210;
      } else if (controls.size.includes('x')) {
        const parts = controls.size.replace('thermal-', '').split('x');
        width = parseInt(parts[0]) || 100;
        height = parseInt(parts[1]) || 150;
      }
    }

    // إذا لم يكن هناك قالب HTML، أرجع رسالة خطأ
    if (!templateHtml) {
      return NextResponse.json(
        { error: 'يرجى اختيار قالب محفوظ أولاً' },
        { status: 400 }
      );
    }

    // إنشاء HTML لكل طلب باستخدام القالب المحفوظ
    const allPoliciesHtml = orders.map((order: any) => {
      let html = templateHtml
        .replace(/ORD-12345/g, order.orderNumber || order.id)
        .replace(/أحمد العلي|أحمد محمد العلي/g, order.recipientName || order.recipient || '')
        .replace(/0501234567/g, order.recipientPhone || order.phone || '')
        .replace(/شارع الملك فهد 25|شارع الملك فهد، بناء 25/g, order.recipientAddress || order.address || '')
        .replace(/عمان - خلدا|عمان، خلدا/g, order.recipientCity || order.city || '')
        .replace(/خلدا/g, order.region || '')
        .replace(/250\.00 د\.أ|250/g, String(order.codAmount || order.cod || 0))
        .replace(/متجر الإلكترونيات|متجر الإلكترونيات الذكية/g, order.merchant?.name || order.merchant || '')
        .replace(/يرجى التواصل قبل التوصيل/g, order.notes || '');
      return html;
    });

    // دمج جميع البوالص في HTML واحد
    const combinedHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>طباعة البوالص</title>
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
    <style>
        @page { size: ${width}mm ${height}mm; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, Tahoma, sans-serif; direction: rtl; }
        .page-break { page-break-after: always; }
        .page-break:last-child { page-break-after: auto; }
    </style>
</head>
<body>
    ${allPoliciesHtml.map((html: string) => `<div class="page-break">${html}</div>`).join('')}
    
    <script>
        window.onload = function() {
            document.querySelectorAll('.barcode-target, svg[data-value]').forEach(function(svg) {
                var value = svg.getAttribute('data-value');
                if (value && window.JsBarcode) {
                    try { 
                        JsBarcode(svg, value, { 
                            format: "CODE128", 
                            width: 1.5, 
                            height: 40, 
                            displayValue: true,
                            fontSize: 10,
                            margin: 2
                        }); 
                    } catch(e) {
                        console.error('Barcode error:', e);
                    }
                }
            });
            
            // طباعة تلقائية بعد ثانية
            setTimeout(() => window.print(), 1000);
        };
    </script>
</body>
</html>`;

    return new NextResponse(combinedHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error: any) {
    console.error('Print error:', error);
    return NextResponse.json(
      { error: 'فشل إنشاء صفحة الطباعة', details: error.message },
      { status: 500 }
    );
  }
}