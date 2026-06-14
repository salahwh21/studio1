/**
 * API لمعاينة القوالب مع الإعدادات المخصصة
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePdfWithPlaywright } from '@/services/pdf-playwright';

export async function POST(request: NextRequest) {
  try {
    const { template, content, format, designSettings } = await request.json();

    console.log('Template preview request:', { template, format: format?.name });

    if (!content || !template) {
      return NextResponse.json(
        { error: 'Missing template content' },
        { status: 400 }
      );
    }

    // تطبيق إعدادات التصميم على المحتوى
    let processedContent = content;
    
    if (designSettings) {
      processedContent = processedContent
        .replace(/\{\{COMPANY_NAME\}\}/g, designSettings.companyName || 'شركة الشحن السريع')
        .replace(/\{\{PRIMARY_COLOR\}\}/g, designSettings.primaryColor || '#1e3a5f')
        .replace(/\{\{SECONDARY_COLOR\}\}/g, designSettings.secondaryColor || '#2c5282')
        .replace(/\{\{FONT_FAMILY\}\}/g, designSettings.fontFamily || 'Cairo')
        .replace(/\{\{FONT_SIZE\}\}/g, designSettings.fontSize || '11px')
        .replace(/\{\{FOOTER_TEXT\}\}/g, designSettings.footerText || 'نظام إدارة الطلبات');
    }

    // إنشاء بيانات تجريبية للمعاينة
    const sampleData = generateSampleData(template);
    
    // تعبئة القالب بالبيانات التجريبية
    const filledContent = fillTemplateWithSampleData(processedContent, sampleData, template);

    // إعدادات PDF حسب التنسيق المختار
    const pdfConfig = getPdfConfig(format);
    
    // إنشاء PDF
    const pdfBuffer = await generatePdfWithPlaywright(filledContent, pdfConfig);

    console.log('Template preview generated successfully, size:', pdfBuffer.length);

    // إرجاع PDF للمعاينة
    const uint8Array = new Uint8Array(pdfBuffer);
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="template-preview.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
    });

  } catch (error) {
    console.error('Template preview error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to generate template preview', details: errorMessage }, { status: 500 });
  }
}


// إنشاء بيانات تجريبية للمعاينة
function generateSampleData(template: string) {
  if (template === 'policy') {
    return {
      orders: [
        { id: 'ORD0001', recipient: 'أحمد محمد علي', phone: '0501234567', address: 'شارع الملك فهد، الحي السكني', city: 'الرياض', cod: 250, status: 'جديد', date: new Date().toISOString() },
        { id: 'ORD0002', recipient: 'فاطمة أحمد السالم', phone: '0507654321', address: 'طريق الأمير محمد، حي النخيل', city: 'جدة', cod: 180, status: 'قيد المعالجة', date: new Date().toISOString() }
      ],
      companyName: 'شركة الشحن السريع',
      type: 'policy'
    };
  } else {
    return {
      orders: [
        { id: 'ORD0001', recipient: 'أحمد محمد علي', phone: '0501234567', city: 'الرياض', cod: 250, status: 'تم التسليم', date: new Date().toISOString() },
        { id: 'ORD0002', recipient: 'فاطمة أحمد السالم', phone: '0507654321', city: 'جدة', cod: 180, status: 'قيد المعالجة', date: new Date().toISOString() },
        { id: 'ORD0003', recipient: 'محمد عبدالله الحربي', phone: '0509876543', city: 'الدمام', cod: 320, status: 'جديد', date: new Date().toISOString() }
      ],
      fields: [
        { key: 'id', label: 'رقم الطلب' }, { key: 'recipient', label: 'المستلم' }, { key: 'phone', label: 'الهاتف' },
        { key: 'city', label: 'المدينة' }, { key: 'cod', label: 'المبلغ' }, { key: 'status', label: 'الحالة' }, { key: 'date', label: 'التاريخ' }
      ],
      purpose: 'all_data',
      type: 'report'
    };
  }
}

function fillTemplateWithSampleData(template: string, data: any, templateType: string): string {
  return templateType === 'policy' ? fillPolicyTemplate(template, data) : fillReportTemplate(template, data);
}

function fillPolicyTemplate(template: string, data: any): string {
  const { orders, companyName } = data;
  const policiesContent = orders.map((order: any) => `
    <div class="page">
      <div class="thermal-label">
        <div class="thermal-header">
          <div class="company-name">${companyName}</div>
          <div class="order-number">رقم الطلب: ${order.id}</div>
        </div>
        <div class="recipient-info">
          <div class="info-row"><span class="info-label">المستلم:</span><span class="info-value">${order.recipient}</span></div>
          <div class="info-row"><span class="info-label">الهاتف:</span><span class="info-value">${order.phone}</span></div>
          <div class="info-row"><span class="info-label">العنوان:</span><span class="info-value">${order.address}</span></div>
          <div class="info-row"><span class="info-label">المدينة:</span><span class="info-value">${order.city}</span></div>
        </div>
        <div class="cod-amount">المبلغ المستحق: ${order.cod} ريال</div>
        <div class="barcode-section"><svg class="barcode-target" data-value="${order.id}"></svg></div>
        <div class="footer-info">التاريخ: ${new Date().toLocaleDateString('ar-SA')}</div>
      </div>
    </div>
  `).join('');
  return template.replace('{{PAGE_SIZE}}', '100mm 150mm').replace('{{CONTENT}}', policiesContent);
}


function fillReportTemplate(template: string, data: any): string {
  const { orders, fields } = data;
  const reportTitle = 'معاينة قالب التقرير';
  const reportSubtitle = 'بيانات تجريبية للمعاينة';
  const reportMeta = `تاريخ المعاينة: ${new Date().toLocaleDateString('ar-SA')}`;
  const totalAmount = orders.reduce((sum: number, order: any) => sum + (order.cod || 0), 0);
  
  const statsContent = `
    <div class="stat-item"><span class="stat-value">${orders.length}</span><div class="stat-label">إجمالي الطلبات</div></div>
    <div class="stat-item"><span class="stat-value">${fields.length}</span><div class="stat-label">الحقول المصدرة</div></div>
    <div class="stat-item"><span class="stat-value">${totalAmount.toLocaleString('ar-SA')}</span><div class="stat-label">إجمالي المبالغ (ريال)</div></div>
  `;

  const tableHeaders = fields.map((field: any) => `<th>${field.label}</th>`).join('');
  const tableRows = orders.map((order: any, index: number) => {
    const rowData = fields.map((field: any) => {
      let value = order[field.key] ?? '';
      if (field.key === 'status') {
        const statusClass = value === 'تم التسليم' ? 'status-delivered' : value === 'قيد المعالجة' ? 'status-pending' : 'status-cancelled';
        return `<td><span class="status-badge ${statusClass}">${value}</span></td>`;
      }
      if (field.key === 'cod' && typeof value === 'number') return `<td><span class="amount">${value.toLocaleString('ar-SA')}</span></td>`;
      if (field.key === 'date' && value) return `<td>${new Date(value).toLocaleDateString('ar-SA')}</td>`;
      return `<td>${value}</td>`;
    });
    return `<tr><td class="row-number">${index + 1}</td>${rowData.join('')}</tr>`;
  }).join('');

  return template
    .replace(/\{\{REPORT_TITLE\}\}/g, reportTitle)
    .replace('{{REPORT_SUBTITLE}}', reportSubtitle)
    .replace('{{REPORT_META}}', reportMeta)
    .replace('{{GENERATION_DATE}}', new Date().toLocaleString('ar-SA'))
    .replace('{{STATS_CONTENT}}', statsContent)
    .replace('{{TABLE_HEADERS}}', tableHeaders)
    .replace('{{TABLE_ROWS}}', tableRows)
    .replace('{{FOOTER_TIMESTAMP}}', `معاينة القالب - ${new Date().toLocaleString('ar-SA')}`)
    .replace('{{FOOTER_TEXT}}', 'هذه معاينة للقالب مع بيانات تجريبية');
}

function getPdfConfig(format: any) {
  const config: any = { printBackground: format?.color !== false, preferCSSPageSize: true };
  if (format?.width && format?.height) {
    config.width = format.width;
    config.height = format.height;
  } else {
    config.format = format?.format || 'A4';
    if (format?.landscape) config.landscape = true;
  }
  return config;
}