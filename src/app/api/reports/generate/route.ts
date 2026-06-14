/**
 * API مرن لإنشاء جميع أنواع التقارير PDF
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePdfWithPlaywright } from '@/services/pdf-playwright';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { type, format, filters, mode } = await request.json();

    console.log('Report generation request:', { type, format: format?.name, mode });

    // جلب البيانات حسب النوع والفلاتر
    const data = await fetchReportData(type, filters);
    
    // اختيار القالب المناسب وإنشاء HTML
    const html = await generateReportHtml(type, data, format);
    
    // إعدادات PDF حسب التنسيق المختار
    const pdfConfig = getPdfConfig(format);
    
    // إنشاء PDF
    const pdfBuffer = await generatePdfWithPlaywright(html, pdfConfig);

    console.log('Report generated successfully, size:', pdfBuffer.length);

    // تحديد اسم الملف
    const filename = generateFilename(type, filters);
    
    // تحديد وضع العرض
    const disposition = mode === 'download' ? 'attachment' : 'inline';

    // إرجاع PDF
    const uint8Array = new Uint8Array(pdfBuffer);
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

  } catch (error) {
    console.error('Report generation error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';

    return NextResponse.json(
      {
        error: 'Failed to generate report',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}

// جلب البيانات حسب نوع التقرير
async function fetchReportData(type: string, filters: any) {
  // هنا يمكن ربط قاعدة البيانات الفعلية
  // حالياً سنستخدم بيانات تجريبية
  
  const { dateRange, merchantId } = filters;
  
  switch (type) {
    case 'policy':
      return {
        orders: generateSampleOrders(5),
        companyName: 'شركة الشحن السريع',
        type: 'policy'
      };
      
    case 'orders-report':
      return {
        orders: generateSampleOrders(20),
        fields: getDefaultReportFields(),
        purpose: 'all_data',
        type: 'report'
      };
      
    case 'daily-report':
      return {
        orders: generateSampleOrders(15),
        fields: getDefaultReportFields(),
        purpose: 'all_data',
        type: 'report',
        title: 'التقرير اليومي',
        date: dateRange.from || new Date().toISOString().split('T')[0]
      };
      
    case 'merchant-report':
      return {
        orders: generateSampleOrders(10).map(order => ({
          ...order,
          merchantId: merchantId || 'MERCHANT_001'
        })),
        fields: getDefaultReportFields(),
        purpose: 'all_data',
        type: 'report',
        title: `تقرير التاجر ${merchantId || 'MERCHANT_001'}`,
        merchantId
      };
      
    default:
      throw new Error(`Unknown report type: ${type}`);
  }
}

// إنشاء HTML للتقرير
async function generateReportHtml(type: string, data: any, format: any) {
  let templateType: string;
  let templateData: any;
  
  if (type === 'policy') {
    // استخدام قالب البوالص
    templateType = 'policy';
    templateData = {
      orders: data.orders,
      companyName: data.companyName
    };
  } else {
    // استخدام قالب التقارير
    templateType = 'report';
    templateData = {
      orders: data.orders,
      fields: data.fields,
      purpose: data.purpose || 'all_data'
    };
  }
  
  // قراءة القالب
  const templatePath = path.join(process.cwd(), 'public', 'print-templates', `${templateType}.html`);
  let templateHtml = await fs.readFile(templatePath, 'utf-8');
  
  // تعبئة القالب
  if (templateType === 'policy') {
    templateHtml = fillPolicyTemplate(templateHtml, templateData, {
      width: format.width,
      height: format.height,
      orientation: format.landscape ? 'landscape' : 'portrait',
      size: format.format?.toLowerCase() || 'custom'
    });
  } else {
    templateHtml = fillReportTemplate(templateHtml, templateData, {
      format: format.format || 'A4',
      landscape: format.landscape || false
    });
  }
  
  return templateHtml;
}

// تحديد إعدادات PDF
function getPdfConfig(format: any) {
  const config: any = {
    printBackground: format.color !== false,
    preferCSSPageSize: true
  };
  
  if (format.width && format.height) {
    // أحجام مخصصة (حراري)
    config.width = format.width;
    config.height = format.height;
  } else {
    // أحجام قياسية
    config.format = format.format || 'A4';
    if (format.landscape) {
      config.landscape = true;
    }
  }
  
  return config;
}

// إنشاء اسم الملف
function generateFilename(type: string, filters: any) {
  const date = new Date().toISOString().slice(0, 10);
  const typeNames: Record<string, string> = {
    'policy': 'بوالص',
    'orders-report': 'تقرير_الطلبات',
    'daily-report': 'التقرير_اليومي',
    'merchant-report': 'تقرير_التاجر'
  };
  
  const typeName = typeNames[type] || type;
  let filename = `${typeName}_${date}.pdf`;
  
  if (filters.merchantId) {
    filename = `${typeName}_${filters.merchantId}_${date}.pdf`;
  }
  
  return filename;
}

// بيانات تجريبية للطلبات
function generateSampleOrders(count: number) {
  const orders = [];
  const cities = ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة', 'الطائف', 'أبها', 'تبوك'];
  const statuses = ['جديد', 'قيد المعالجة', 'تم التسليم', 'ملغي'];
  
  for (let i = 1; i <= count; i++) {
    orders.push({
      id: `ORD${String(i).padStart(4, '0')}`,
      orderNumber: `ORD${String(i).padStart(4, '0')}`,
      recipient: `العميل ${i}`,
      phone: `05${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      address: `العنوان ${i}, الحي السكني`,
      city: cities[Math.floor(Math.random() * cities.length)],
      region: 'المنطقة الوسطى',
      cod: Math.floor(Math.random() * 500) + 50,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: Math.random() > 0.7 ? `ملاحظة للطلب ${i}` : ''
    });
  }
  
  return orders;
}

// حقول التقرير الافتراضية
function getDefaultReportFields() {
  return [
    { key: 'id', label: 'رقم الطلب' },
    { key: 'recipient', label: 'المستلم' },
    { key: 'phone', label: 'الهاتف' },
    { key: 'city', label: 'المدينة' },
    { key: 'cod', label: 'المبلغ' },
    { key: 'status', label: 'الحالة' },
    { key: 'date', label: 'التاريخ' }
  ];
}

// تعبئة قالب البوالص (نفس الدالة الموجودة)
function fillPolicyTemplate(template: string, data: any, options: any): string {
  const { orders, companyName } = data;
  const { width, height, orientation } = options;

  let pageSize = `${width}mm ${height}mm`;
  if (orientation === 'landscape') {
    pageSize = `${height}mm ${width}mm`;
  }

  const policiesContent = orders.map((order: any) => {
    const isThermal = !['a4', 'a5'].includes(options.size);
    
    if (isThermal) {
      return `
        <div class="page">
          <div class="thermal-label">
            <div class="thermal-header">
              <div class="company-name">${companyName}</div>
              <div class="order-number">رقم الطلب: ${order.id}</div>
            </div>
            
            <div class="recipient-info">
              <div class="info-row">
                <span class="info-label">المستلم:</span>
                <span class="info-value">${order.recipient}</span>
              </div>
              <div class="info-row">
                <span class="info-label">الهاتف:</span>
                <span class="info-value">${order.phone}</span>
              </div>
              <div class="info-row">
                <span class="info-label">العنوان:</span>
                <span class="info-value">${order.address}</span>
              </div>
              <div class="info-row">
                <span class="info-label">المدينة:</span>
                <span class="info-value">${order.city}</span>
              </div>
            </div>
            
            <div class="cod-amount">
              المبلغ المستحق: ${order.cod} ريال
            </div>
            
            <div class="barcode-section">
              <svg class="barcode-target" data-value="${order.id}"></svg>
            </div>
            
            <div class="footer-info">
              التاريخ: ${new Date().toLocaleDateString('ar-SA')}
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="page">
          <div class="standard-policy">
            <div class="policy-header">
              <div class="policy-title">${companyName}</div>
              <div class="policy-subtitle">بوليصة شحن رقم: ${order.id}</div>
            </div>
            
            <div class="policy-body">
              <div class="policy-section">
                <div class="section-title">بيانات المرسل إليه</div>
                <div class="policy-info-row">
                  <span>الاسم:</span>
                  <span>${order.recipient}</span>
                </div>
                <div class="policy-info-row">
                  <span>الهاتف:</span>
                  <span>${order.phone}</span>
                </div>
                <div class="policy-info-row">
                  <span>العنوان:</span>
                  <span>${order.address}</span>
                </div>
                <div class="policy-info-row">
                  <span>المدينة:</span>
                  <span>${order.city}</span>
                </div>
              </div>
              
              <div class="policy-section">
                <div class="section-title">بيانات الشحنة</div>
                <div class="policy-info-row">
                  <span>رقم الطلب:</span>
                  <span>${order.id}</span>
                </div>
                <div class="policy-info-row">
                  <span>المبلغ المستحق:</span>
                  <span>${order.cod} ريال</span>
                </div>
                <div class="policy-info-row">
                  <span>التاريخ:</span>
                  <span>${new Date().toLocaleDateString('ar-SA')}</span>
                </div>
                <div class="policy-info-row">
                  <span>الحالة:</span>
                  <span>${order.status}</span>
                </div>
              </div>
            </div>
            
            <div class="policy-footer">
              <div class="barcode-section">
                <svg class="barcode-target" data-value="${order.id}"></svg>
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
    .replace('{{PAGE_SIZE}}', pageSize)
    .replace('{{CONTENT}}', policiesContent);
}

// تعبئة قالب التقارير (نفس الدالة الموجودة)
function fillReportTemplate(template: string, data: any, options: any): string {
  const { orders, fields, purpose } = data;
  
  const reportTitle = purpose === 'update_data' ? 'تقرير تحديث البيانات' : 'تقرير بيانات الطلبات';
  const reportSubtitle = purpose === 'update_data' ? 'حقول قابلة للتعديل فقط' : 'جميع البيانات المختارة';
  const reportMeta = `تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })} | وقت الإنشاء: ${new Date().toLocaleString('ar-SA')}`;

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

  const tableHeaders = fields.map((field: any) => `<th>${field.label}</th>`).join('');

  const tableRows = orders.map((order: any, index: number) => {
    const rowData = fields.map((field: any) => {
      let value = order[field.key] ?? '';
      
      if (field.key === 'status') {
        const statusClass = value === 'تم التسليم' ? 'status-delivered' : 
                          value === 'قيد المعالجة' ? 'status-pending' : 'status-cancelled';
        return `<td><span class="status-badge ${statusClass}">${value}</span></td>`;
      }
      
      if (field.key === 'cod' && typeof value === 'number') {
        return `<td><span class="amount">${value.toLocaleString('ar-SA')}</span></td>`;
      }
      
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
    message: 'Reports API is working',
    methods: ['POST'],
    supportedTypes: ['policy', 'orders-report', 'daily-report', 'merchant-report'],
    supportedFormats: ['A4', 'A5', 'thermal']
  });
}