/**
 * API لإنشاء PDF باستخدام Playwright مع دعم القوالب
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePdfWithPlaywright } from '@/services/pdf-playwright';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    let html, filename, width, height, templateType, data, options;

    const contentType = request.headers.get('content-type') || '';

    // التحقق من نوع البيانات ودعم النوعين: JSON و FormData
    if (contentType.includes('application/json')) {
      const body = await request.json();

      // دعم القوالب المحفوظة من قاعدة البيانات
      if (body.templateId || body.templateType) {
        templateType = body.templateType;
        data = body.data;
        options = body.options || {};

        // إذا تم تمرير templateId، نحمّل إعدادات القالب من قاعدة البيانات
        if (body.templateId) {
          try {
            const savedTemplate = await loadSavedTemplate(body.templateId);
            if (savedTemplate?.settings) {
              // دمج إعدادات القالب المحفوظة مع الخيارات المُمررة
              options = { ...savedTemplate.settings, ...options };
              templateType = savedTemplate.settings.documentType || templateType;
            }
          } catch (err) {
            console.warn('Could not load saved template, using defaults:', err);
          }
        }

        // قراءة وتعبئة القالب مع الإعدادات
        html = await fillTemplate(templateType, data, options);
        filename = options.filename;

        // حساب الأبعاد مع مراعاة الاتجاه (أفقي/عمودي)
        const isLandscape = options.orientation === 'landscape';
        const format = options.format || 'A4';

        if (format === 'A4' || format?.toLowerCase() === 'a4') {
          width = isLandscape ? 297 : 210;
          height = isLandscape ? 210 : 297;
        } else if (format === 'A5' || format?.toLowerCase() === 'a5') {
          width = isLandscape ? 210 : 148;
          height = isLandscape ? 148 : 210;
        } else {
          width = options.width || (isLandscape ? 297 : 210);
          height = options.height || (isLandscape ? 210 : 297);
        }
      } else {
        // الطريقة القديمة (HTML مباشر)
        html = body.html;
        filename = body.filename;
        width = body.width;
        height = body.height;
      }
    } else {
      // حالة Form Submission (للتحميل المباشر)
      const formData = await request.formData();
      html = formData.get('html') as string;
      filename = formData.get('filename') as string;
      width = Number(formData.get('width'));
      height = Number(formData.get('height'));
    }

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content or template is required' },
        { status: 400 }
      );
    }

    console.log('PDF generation request:', { filename, width, height, templateType, dataSize: data ? Object.keys(data).length : 0 });

    // إنشاء PDF مع تحسينات الأداء
    const pdfBuffer = await generatePdfWithPlaywright(html, {
      width,
      height,
      filename
    });

    console.log('PDF generated successfully, size:', pdfBuffer.length);

    // تحديد وضع العرض: معاينة (inline) أم تحميل (attachment)
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode');
    const disposition = mode === 'download' ? 'attachment' : 'inline';

    console.log(`Serving PDF in ${disposition} mode`);

    // إرجاع PDF مع headers محسنة
    const uint8Array = new Uint8Array(pdfBuffer);
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="${filename || 'document.pdf'}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);

    // إرجاع تفاصيل الخطأ للتطوير
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';

    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}

// تحميل قالب محفوظ من قاعدة البيانات
async function loadSavedTemplate(templateId: string): Promise<any> {
  try {
    const { DatabaseService } = await import('@/lib/db');
    const result = await DatabaseService.query(
      `SELECT id, name, settings, html FROM templates WHERE id = $1`,
      [templateId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.warn('Database unavailable for loading template:', error);
    return null;
  }
}

// دالة تعبئة القوالب - تستخدم القوالب المحفوظة من قاعدة البيانات
async function fillTemplate(templateType: string, data: any, options: any): Promise<string> {
  try {
    // للتقارير والجداول: توليد HTML مباشرة من البيانات
    if (templateType === 'report') {
      return generateReportHtmlFromData(data, options, templateType);
    }

    // للبوالص: محاولة قراءة من ملف أو توليد مباشر
    if (templateType === 'policy') {
      try {
        const templatePath = path.join(process.cwd(), 'public', 'print-templates', 'policy.html');
        let templateHtml = await fs.readFile(templatePath, 'utf-8');
        return fillPolicyTemplate(templateHtml, data, options);
      } catch {
        // إذا لم يوجد الملف، نولد HTML مباشرة
        return generatePolicyHtmlFromData(data, options);
      }
    }

    throw new Error(`Unsupported template type: ${templateType}`);
  } catch (error) {
    console.error('Template filling error:', error);
    throw new Error(`Failed to fill template: ${templateType}`);
  }
}

// توليد HTML للتقارير من البيانات مباشرة
function generateReportHtmlFromData(data: any, options: any, templateType: string): string {
  const { orders = [], fields = [], purpose = 'all_data', companyName = '', companyLogo = '' } = data;
  const orientation = options.orientation || 'portrait';
  const pageWidth = orientation === 'portrait' ? '210mm' : '297mm';
  const pageHeight = orientation === 'portrait' ? '297mm' : '210mm';

  // عنوان التقرير
  const reportTitle = purpose === 'update_data' ? 'تقرير تحديث البيانات' :
    templateType === 'table' ? 'جدول البيانات' : 'تقرير بيانات الطلبات';

  // إحصائيات
  const totalAmount = orders.reduce((sum: number, order: any) => sum + (order.cod || 0), 0);

  // رؤوس الجدول
  const tableHeaders = fields.map((field: any) => `<th>${field.label}</th>`).join('');

  // صفوف الجدول
  const tableRows = orders.map((order: any, index: number) => {
    const rowData = fields.map((field: any) => {
      const value = order[field.key] ?? '';
      return `<td>${value}</td>`;
    }).join('');
    return `<tr><td>${index + 1}</td>${rowData}</tr>`;
  }).join('');

  // الشعار
  const logoHtml = companyLogo
    ? `<img src="${companyLogo}" alt="Logo" style="max-height: 50px; max-width: 120px;" />`
    : (companyName ? `<div style="font-weight: bold; color: #333;">${companyName}</div>` : '');

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: ${pageWidth} ${pageHeight}; margin: 15mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, Tahoma, sans-serif; background: white; padding: 10mm; direction: rtl; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #333; }
        .header h1 { font-size: 20px; }
        .header p { font-size: 12px; color: #666; }
        .logo { display: flex; align-items: center; }
        .stats { display: flex; gap: 20px; margin-bottom: 20px; }
        .stat-item { text-align: center; padding: 10px 20px; background: #f5f5f5; border-radius: 8px; }
        .stat-value { font-size: 18px; font-weight: bold; color: #333; }
        .stat-label { font-size: 11px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 8px; border: 1px solid #ddd; text-align: right; font-size: 11px; }
        th { background: #f3f4f6; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #888; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>${reportTitle}</h1>
          <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}${companyName ? ` | الشركة: ${companyName}` : ''}</p>
        </div>
        <div class="logo">${logoHtml}</div>
      </div>
      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">${orders.length}</div>
          <div class="stat-label">عدد السجلات</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${fields.length}</div>
          <div class="stat-label">الحقول</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${totalAmount.toLocaleString('ar-SA')}</div>
          <div class="stat-label">إجمالي المبالغ</div>
        </div>
      </div>
      <table>
        <thead>
          <tr><th>#</th>${tableHeaders}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <div class="footer">
        تم إنشاء هذا التقرير في ${new Date().toLocaleString('ar-SA')}
      </div>
    </body>
    </html>
  `;
}

// توليد HTML للبوالص من البيانات مباشرة
function generatePolicyHtmlFromData(data: any, options: any): string {
  const { orders = [], companyName = 'الشركة' } = data;
  const { width = 100, height = 150 } = options;

  const policiesContent = orders.map((order: any) => `
    <div class="policy">
      <div class="header">${companyName}</div>
      <div class="info">
        <div><strong>المستلم:</strong> ${order.recipient || ''}</div>
        <div><strong>الهاتف:</strong> ${order.phone || ''}</div>
        <div><strong>العنوان:</strong> ${order.address || ''}</div>
        <div><strong>المدينة:</strong> ${order.city || ''}</div>
        <div><strong>المبلغ:</strong> ${order.cod || 0}</div>
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: ${width}mm ${height}mm; margin: 2mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 10px; }
        .policy { border: 1px solid #000; padding: 5mm; margin-bottom: 5mm; }
        .header { font-weight: bold; text-align: center; margin-bottom: 5mm; }
        .info div { margin: 2mm 0; }
      </style>
    </head>
    <body>
      ${policiesContent}
    </body>
    </html>
  `;
}

function fillPolicyTemplate(template: string, data: any, options: any): string {
  const { orders, companyName } = data;
  const { width, height, orientation } = options;

  // تحديد حجم الصفحة مع الإعدادات المثلى
  let pageSize = `${width}mm ${height}mm`;
  if (orientation === 'landscape') {
    pageSize = `${height}mm ${width}mm`;
  }

  // إنشاء محتوى البوالص مع التحسينات
  const policiesContent = orders.map((order: any, index: number) => {
    const isThermal = !['a4', 'a5'].includes(options.size);

    if (isThermal) {
      // تحسين التصميم الحراري حسب الحجم
      let thermalClass = 'thermal-label';
      let fontSize = '10px';

      if (width <= 60 && height <= 40) {
        fontSize = '6px';
        thermalClass += ' size-60x40';
      } else if (width <= 75 && height <= 50) {
        fontSize = '8px';
        thermalClass += ' size-75x50';
      } else if (width <= 100 && height <= 100) {
        fontSize = '10px';
        thermalClass += ' size-100x100';
      } else if (width <= 100 && height <= 150) {
        fontSize = '10px';
        thermalClass += ' size-100x150';
      }

      return `
        <div class="page">
          <div class="${thermalClass}" style="font-size: ${fontSize};">
            <div class="thermal-header">
              <div class="company-name">${companyName}</div>
              <div class="order-number">رقم الطلب: ${order.id || order.orderNumber}</div>
            </div>
            
            <div class="recipient-info">
              <div class="info-row">
                <span class="info-label">المستلم:</span>
                <span class="info-value">${order.recipient || ''}</span>
              </div>
              <div class="info-row">
                <span class="info-label">الهاتف:</span>
                <span class="info-value">${order.phone || ''}</span>
              </div>
              <div class="info-row">
                <span class="info-label">العنوان:</span>
                <span class="info-value">${order.address || ''}</span>
              </div>
              <div class="info-row">
                <span class="info-label">المدينة:</span>
                <span class="info-value">${order.city || ''}</span>
              </div>
              ${order.region ? `
              <div class="info-row">
                <span class="info-label">المنطقة:</span>
                <span class="info-value">${order.region}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="cod-amount">
              المبلغ المستحق: ${order.cod || 0} دينار أردني
            </div>
            
            <div class="barcode-section">
              <svg class="barcode-target" data-value="${order.id || order.orderNumber}"></svg>
            </div>
            
            <div class="footer-info">
              التاريخ: ${new Date().toLocaleDateString('ar-SA')}
              ${order.notes ? ` | ملاحظات: ${order.notes}` : ''}
            </div>
          </div>
        </div>
      `;
    } else {
      // تحسين التصميم القياسي
      return `
        <div class="page">
          <div class="standard-policy">
            <div class="policy-header">
              <div class="policy-title">${companyName}</div>
              <div class="policy-subtitle">بوليصة شحن رقم: ${order.id || order.orderNumber}</div>
            </div>
            
            <div class="policy-body">
              <div class="policy-section">
                <div class="section-title">بيانات المرسل إليه</div>
                <div class="policy-info-row">
                  <span>الاسم:</span>
                  <span>${order.recipient || ''}</span>
                </div>
                <div class="policy-info-row">
                  <span>الهاتف:</span>
                  <span>${order.phone || ''}</span>
                </div>
                <div class="policy-info-row">
                  <span>العنوان:</span>
                  <span>${order.address || ''}</span>
                </div>
                <div class="policy-info-row">
                  <span>المدينة:</span>
                  <span>${order.city || ''}</span>
                </div>
              </div>
              
              <div class="policy-section">
                <div class="section-title">بيانات الشحنة</div>
                <div class="policy-info-row">
                  <span>رقم الطلب:</span>
                  <span>${order.id || order.orderNumber}</span>
                </div>
                <div class="policy-info-row">
                  <span>المبلغ المستحق:</span>
                  <span>${order.cod || 0} دينار أردني</span>
                </div>
                <div class="policy-info-row">
                  <span>التاريخ:</span>
                  <span>${new Date().toLocaleDateString('ar-SA')}</span>
                </div>
                <div class="policy-info-row">
                  <span>الحالة:</span>
                  <span>${order.status || 'جديد'}</span>
                </div>
              </div>
            </div>
            
            <div class="policy-footer">
              <div class="barcode-section">
                <svg class="barcode-target" data-value="${order.id || order.orderNumber}"></svg>
              </div>
              
              <div class="signature-section">
                <div class="signature-box">توقيع المرسل</div>
                <div class="signature-box">توقيع المستلم</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }).join('');

  return template
    .replace(/\/\* size will be replaced by template engine: \{\{PAGE_SIZE\}\} \*\/\s*size: [^;]+;/, `size: ${pageSize};`)
    .replace('{{PAGE_SIZE}}', pageSize)
    .replace('{{CONTENT}}', policiesContent);
}

function fillReportTemplate(template: string, data: any, options: any): string {
  const { orders, fields, purpose } = data;

  // عنوان التقرير
  const reportTitle = purpose === 'update_data' ? 'تقرير تحديث البيانات' : 'تقرير بيانات الطلبات';
  const reportSubtitle = purpose === 'update_data' ? 'حقول قابلة للتعديل فقط' : 'جميع البيانات المختارة';
  const reportMeta = `تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })} | وقت الإنشاء: ${new Date().toLocaleString('ar-SA')}`;

  // إحصائيات
  const totalAmount = orders.reduce((sum: number, order: any) => sum + (order.cod || 0), 0);
  const statsContent = `
    <div class="stat-item">
      <span class="stat-value">${orders.length}</span>
      <div class="stat-label">إجمالي الطلبات</div>
    </div>
    <div class="stat-item">
      <span class="stat-value">${fields.length}</span>
      <div class="stat-label">الحقول المصدرة</div>
    </div>
    <div class="stat-item">
      <span class="stat-value">${totalAmount.toLocaleString('ar-SA')}</span>
      <div class="stat-label">إجمالي المبالغ (ريال)</div>
    </div>
  `;

  // رؤوس الجدول
  const tableHeaders = fields.map((field: any) => `<th>${field.label}</th>`).join('');

  // صفوف الجدول
  const tableRows = orders.map((order: any, index: number) => {
    const rowData = fields.map((field: any) => {
      let value = order[field.key] ?? '';

      // تنسيق خاص للحالة
      if (field.key === 'status') {
        const statusClass = value === 'تم التسليم' ? 'status-delivered' :
          value === 'قيد المعالجة' ? 'status-pending' : 'status-cancelled';
        return `<td><span class="status-badge ${statusClass}">${value}</span></td>`;
      }

      // تنسيق خاص للمبالغ
      if (field.key === 'cod' && typeof value === 'number') {
        return `<td><span class="amount">${value.toLocaleString('ar-SA')}</span></td>`;
      }

      // تنسيق خاص للتاريخ
      if (field.key === 'date' && value) {
        const date = new Date(value);
        return `<td>${date.toLocaleDateString('ar-SA')}</td>`;
      }

      return `<td>${value}</td>`;
    });

    return `
      <tr>
        <td class="row-number">${index + 1}</td>
        ${rowData.join('')}
      </tr>
    `;
  }).join('');

  // معلومات التذييل
  const footerTimestamp = `تم إنشاء هذا التقرير في ${new Date().toLocaleString('ar-SA')}`;
  const footerText = 'نظام إدارة الطلبات - تقرير مُصدَّر';

  return template
    .replace(/{{REPORT_TITLE}}/g, reportTitle)
    .replace('{{REPORT_SUBTITLE}}', reportSubtitle)
    .replace('{{REPORT_META}}', reportMeta)
    .replace('{{GENERATION_DATE}}', new Date().toLocaleString('ar-SA'))
    .replace('{{STATS_CONTENT}}', statsContent)
    .replace('{{TABLE_HEADERS}}', tableHeaders)
    .replace('{{TABLE_ROWS}}', tableRows)
    .replace('{{FOOTER_TIMESTAMP}}', footerTimestamp)
    .replace('{{FOOTER_TEXT}}', footerText);
}

export async function GET() {
  return NextResponse.json({
    message: 'PDF Playwright API is working with template support',
    methods: ['POST'],
    usage: {
      endpoint: '/api/pdf-playwright',
      method: 'POST',
      body: {
        // الطريقة القديمة
        html: 'HTML content to convert',
        filename: 'optional filename',
        width: 'optional width in mm',
        height: 'optional height in mm',
        // الطريقة الجديدة مع القوالب
        templateType: 'policy or report',
        data: 'template data object',
        options: 'template options object'
      }
    }
  });
}