/**
 * نظام موحد لتوليد كشوفات PDF بنفس تصميم كشف الطلبات البسيط والجميل
 * يوفر قوالب موحدة لجميع أنواع الكشوفات مع دعم شعار الشركة
 */

export interface SlipData {
  title: string;
  subtitle?: string;
  date: string;
  headers: string[];
  rows: string[][];
  totalsRow?: string[];
  companyInfo?: {
    name?: string;
    logo?: string;
  };
  signatures?: string[];
  notes?: string;
}

export interface SlipOptions {
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'A5';
  showSignatures?: boolean;
  showNotes?: boolean;
}

/**
 * توليد HTML موحد للكشوفات بنفس تصميم كشف الطلبات البسيط والجميل
 */
export function generateUnifiedSlipHTML(data: SlipData, options: SlipOptions = {}): string {
  const {
    orientation = 'portrait',
    pageSize = 'A4',
    showSignatures = true,
    showNotes = true
  } = options;

  const pageOrientation = orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait';
  
  const tableRows = data.rows.map(row => 
    `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
  ).join('');

  const totalsRowHTML = data.totalsRow 
    ? `<tr class="totals">${data.totalsRow.map(cell => `<td>${cell}</td>`).join('')}</tr>`
    : '';

  const signaturesHTML = showSignatures && data.signatures 
    ? `<div class="signatures">
        ${data.signatures.map(sig => `<div class="signature">${sig}</div>`).join('')}
       </div>`
    : '';

  const notesHTML = showNotes && data.notes 
    ? `<div class="notes">
        <h3>ملاحظات:</h3>
        <p>${data.notes}</p>
       </div>`
    : '';

  // دعم شعار الشركة من الإعدادات - نفس طريقة كشف الطلبات
  const logoHTML = data.companyInfo?.logo 
    ? `<img src="${data.companyInfo.logo}" alt="شعار الشركة" style="height: 60px; max-width: 150px; object-fit: contain;">`
    : `<div style="font-size: 24px; font-weight: bold;">${data.companyInfo?.name || 'الشركة'}</div>`;

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <title>${data.title}</title>
        <style>
            @page { size: ${pageOrientation}; margin: 10mm; }
            body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; padding: 20px; }
            h1 { text-align: center; color: #333; margin-bottom: 20px; font-size: 18px; }
            .subtitle { text-align: center; color: #666; margin-bottom: 10px; font-size: 14px; }
            .date { text-align: center; color: #888; margin-bottom: 20px; font-size: 12px; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #333; }
            .header-info { text-align: center; flex: 1; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 10px 8px; text-align: center; font-weight: bold; }
            td { padding: 8px; text-align: center; border-bottom: 1px solid #e0e0e0; }
            tr:nth-child(even) { background-color: #f8f9fa; }
            tr:nth-child(odd) { background-color: #ffffff; }
            tr:hover { background-color: #e3f2fd; }
            .totals { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%) !important; color: white !important; font-weight: bold; }
            .totals td { background: transparent !important; color: white !important; font-weight: bold; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature { width: 200px; text-align: center; padding-top: 40px; border-top: 1px solid #000; font-size: 12px; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            ${logoHTML}
            <div class="header-info">
                <h1>${data.title}</h1>
                ${data.subtitle ? `<div class="subtitle">${data.subtitle}</div>` : ''}
                <div class="date">${data.date}</div>
            </div>
        </div>
        <table>
            <thead>
                <tr>${data.headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
                ${tableRows}
                ${totalsRowHTML}
            </tbody>
        </table>
        ${signaturesHTML}
        ${notesHTML}
        <div class="footer">تم إنشاء هذا التقرير بتاريخ ${new Date().toLocaleString('ar-SA')}</div>
    </body>
    </html>
  `;
}

/**
 * قوالب جاهزة للكشوفات المختلفة مع نفس التصميم الموحد
 */
export const SlipTemplates = {
  /**
   * كشف تحصيل من السائق
   */
  driverCollection: (driverName: string, orders: any[], formatCurrency: (amount: number) => string, formatDate: (date: Date | string) => string, companyInfo?: any): SlipData => {
    const totalCOD = orders.reduce((sum, o) => sum + (o.cod || 0), 0);
    const totalDriverFee = orders.reduce((sum, o) => sum + (o.driverFee || 0), 0);
    const netAmount = totalCOD - totalDriverFee;

    return {
      title: `كشف تحصيل من السائق: ${driverName}`,
      subtitle: `عدد الطلبات: ${orders.length}`,
      date: formatDate(new Date()),
      headers: ['#', 'رقم الطلب', 'المستلم', 'الهاتف', 'قيمة التحصيل', 'أجرة السائق', 'الصافي'],
      rows: orders.map((order, index) => [
        (index + 1).toString(),
        order.id,
        order.recipient,
        order.phone,
        formatCurrency(order.cod || 0),
        formatCurrency(order.driverFee || 0),
        formatCurrency((order.cod || 0) - (order.driverFee || 0))
      ]),
      totalsRow: [
        'الإجمالي',
        '',
        '',
        '',
        formatCurrency(totalCOD),
        formatCurrency(totalDriverFee),
        formatCurrency(netAmount)
      ],
      companyInfo,
      signatures: ['توقيع السائق', 'توقيع الموظف المالي']
    };
  },

  /**
   * كشف دفع للتاجر
   */
  merchantPayment: (merchantName: string, orders: any[], adjustments: Record<string, number>, formatCurrency: (amount: number) => string, formatDate: (date: Date | string) => string, companyInfo?: any): SlipData => {
    const totalCOD = orders.reduce((sum, o) => sum + (o.cod || 0), 0);
    const totalDeliveryFee = orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    const totalItemPrice = orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0);
    const totalAdjustments = orders.reduce((sum, o) => sum + (adjustments[o.id] || 0), 0);
    const netAmount = totalItemPrice + totalAdjustments;

    return {
      title: `كشف دفع للتاجر: ${merchantName}`,
      subtitle: `عدد الطلبات: ${orders.length}`,
      date: formatDate(new Date()),
      headers: ['#', 'رقم الطلب', 'المستلم', 'قيمة التحصيل', 'أجور التوصيل', 'المستحق للتاجر', 'تعديلات', 'الصافي'],
      rows: orders.map((order, index) => [
        (index + 1).toString(),
        order.id,
        order.recipient,
        formatCurrency(order.cod || 0),
        formatCurrency(order.deliveryFee || 0),
        formatCurrency(order.itemPrice || 0),
        formatCurrency(adjustments[order.id] || 0),
        formatCurrency((order.itemPrice || 0) + (adjustments[order.id] || 0))
      ]),
      totalsRow: [
        'الإجمالي',
        '',
        '',
        formatCurrency(totalCOD),
        formatCurrency(totalDeliveryFee),
        formatCurrency(totalItemPrice),
        formatCurrency(totalAdjustments),
        formatCurrency(netAmount)
      ],
      companyInfo,
      signatures: ['توقيع التاجر', 'توقيع الموظف المالي']
    };
  },

  /**
   * معلومات السائقين المالية
   */
  driversFinancial: (drivers: any[], formatCurrency: (amount: number) => string, formatDate: (date: Date | string) => string, companyInfo?: any): SlipData => {
    const totals = drivers.reduce((acc, driver) => {
      acc.totalCOD += driver.totalCOD;
      acc.totalDriverFees += driver.totalDriverFees;
      acc.totalCollected += driver.collectedAmount;
      acc.totalOutstanding += driver.outstandingAmount;
      return acc;
    }, { totalCOD: 0, totalDriverFees: 0, totalCollected: 0, totalOutstanding: 0 });

    return {
      title: 'معلومات السائقين المالية',
      subtitle: `عدد السائقين: ${drivers.length}`,
      date: formatDate(new Date()),
      headers: ['اسم السائق', 'إجمالي الطلبات', 'إجمالي التحصيل', 'أجور السائق', 'المبلغ المستلم', 'المبلغ المتبقي', 'عدد الكشوفات'],
      rows: drivers.map(driver => [
        driver.name,
        driver.totalOrders.toString(),
        formatCurrency(driver.totalCOD),
        formatCurrency(driver.totalDriverFees),
        formatCurrency(driver.collectedAmount),
        formatCurrency(driver.outstandingAmount),
        driver.totalSlips.toString()
      ]),
      totalsRow: [
        'الإجمالي',
        '',
        formatCurrency(totals.totalCOD),
        formatCurrency(totals.totalDriverFees),
        formatCurrency(totals.totalCollected),
        formatCurrency(totals.totalOutstanding),
        ''
      ],
      companyInfo
    };
  },

  /**
   * قائمة الطلبات - نفس تصميم كشف الطلبات الأصلي
   */
  ordersList: (orders: any[], headers: string[], formatCurrency: (amount: number) => string, formatDate: (date: Date | string) => string, companyInfo?: any): SlipData => {
    return {
      title: `تصدير بيانات الطلبات - ${formatDate(new Date())}`,
      date: formatDate(new Date()),
      headers,
      rows: orders.map(order => 
        headers.map(header => {
          // تحويل العناوين إلى قيم من الطلب
          switch(header) {
            case 'رقم الطلب': return order.id;
            case 'المستلم': return order.recipient;
            case 'الهاتف': return order.phone;
            case 'العنوان': return order.address;
            case 'قيمة التحصيل': return formatCurrency(order.cod || 0);
            case 'أجرة السائق': return formatCurrency(order.driverFee || 0);
            case 'الحالة': return order.status;
            case 'التاجر': return order.merchant;
            case 'السائق': return order.driver;
            case 'التاريخ': return formatDate(order.date);
            default: return order[header] || '';
          }
        })
      ),
      companyInfo,
      notes: `عدد السجلات: ${orders.length}`
    };
  }
};