/**
 * نظام موحد لتوليد كشوفات PDF
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
 * توليد HTML موحد للكشوفات مع دعم شعار الشركة
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

  // دعم شعار الشركة من الإعدادات
  const logoHTML = data.companyInfo?.logo 
    ? `<div class="logo-container">
        <img src="${data.companyInfo.logo}" alt="شعار الشركة" class="company-logo">
       </div>`
    : '';

  const companyNameHTML = data.companyInfo?.name 
    ? `<div class="company-name">${data.companyInfo.name}</div>`
    : '';

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <style>
            @page { 
                size: ${pageOrientation}; 
                margin: 15mm; 
            }
            * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
            }
            body { 
                font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
                font-size: 12px;
                direction: rtl;
                line-height: 1.4;
                color: #333;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #333;
                min-height: 80px;
            }
            .logo-container {
                flex-shrink: 0;
                margin-left: 20px;
            }
            .company-logo {
                height: 70px;
                max-width: 150px;
                object-fit: contain;
            }
            .header-info {
                text-align: center;
                flex: 1;
                padding: 0 20px;
            }
            .company-name {
                text-align: right;
                font-size: 14px;
                color: #666;
                font-weight: 600;
                margin-top: 10px;
            }
            .title { 
                font-size: 20px; 
                font-weight: bold; 
                margin-bottom: 8px;
                color: #1a1a1a;
            }
            .subtitle { 
                font-size: 14px; 
                color: #666;
                margin-bottom: 4px;
            }
            .date {
                font-size: 12px;
                color: #888;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                font-size: 11px;
                background: white;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 10px 8px;
                text-align: center;
                vertical-align: middle;
            }
            th {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                font-weight: bold;
                color: #495057;
                font-size: 12px;
            }
            tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            tr:hover {
                background-color: #e3f2fd;
            }
            .totals {
                background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%) !important;
                font-weight: bold;
                color: #155724;
            }
            .signatures {
                margin-top: 60px;
                display: flex;
                justify-content: space-between;
                gap: 40px;
            }
            .signature {
                flex: 1;
                text-align: center;
                padding-top: 50px;
                border-top: 2px solid #333;
                font-size: 13px;
                font-weight: 600;
                color: #495057;
            }
            .notes {
                margin-top: 30px;
                padding: 20px;
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                border-right: 4px solid #007bff;
            }
            .notes h3 {
                font-size: 14px;
                margin-bottom: 10px;
                color: #495057;
            }
            .notes p {
                font-size: 12px;
                line-height: 1.6;
                color: #6c757d;
            }
            @media print {
                body { print-color-adjust: exact; }
                .signatures { page-break-inside: avoid; }
                .notes { page-break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            ${logoHTML}
            <div class="header-info">
                <div class="title">${data.title}</div>
                ${data.subtitle ? `<div class="subtitle">${data.subtitle}</div>` : ''}
                <div class="date">${data.date}</div>
            </div>
            ${companyNameHTML}
        </div>
        
        <table>
            <thead>
                <tr>
                    ${data.headers.map(header => `<th>${header}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${tableRows}
                ${totalsRowHTML}
            </tbody>
        </table>
        
        ${notesHTML}
        ${signaturesHTML}
    </body>
    </html>
  `;
}

/**
 * قوالب جاهزة للكشوفات المختلفة مع دعم شعار الشركة
 */
export const SlipTemplates = {
  /**
   * كشف تحصيل من السائق
   */
  driverCollection: (driverName: string, orders: any[], formatCurrency: (amount: number) => string, formatDate: (date: Date | string) => string, settings?: any): SlipData => {
    const totalCOD = orders.reduce((sum, o) => sum + (o.cod || 0), 0);
    const totalDriverFee = orders.reduce((sum, o) => sum + (o.driverFee || 0), 0);
    const totalNet = totalCOD - totalDriverFee;

    return {
      title: `كشف تحصيل من السائق: ${driverName}`,
      subtitle: `عدد الطلبات: ${orders.length} طلب`,
      date: formatDate(new Date()),
      headers: ['رقم الطلب', 'العميل', 'الهاتف', 'المنطقة', 'قيمة التحصيل', 'أجرة السائق', 'الصافي'],
      rows: orders.map(order => [
        order.id,
        order.recipient,
        order.phone || '-',
        order.region || '-',
        formatCurrency(order.cod || 0),
        formatCurrency(order.driverFee || 0),
        formatCurrency((order.cod || 0) - (order.driverFee || 0))
      ]),
      totalsRow: ['الإجمالي', '', '', '', formatCurrency(totalCOD), formatCurrency(totalDriverFee), formatCurrency(totalNet)],
      signatures: ['توقيع المستلم (المحاسب)', 'توقيع السائق'],
      companyInfo: {
        name: settings?.login?.companyName || 'الشركة',
        logo: settings?.login?.reportsLogo || settings?.login?.headerLogo
      }
    };
  },

  /**
   * كشف دفع للتاجر
   */
  merchantPayment: (merchantName: string, orders: any[], adjustments: Record<string, number>, formatCurrency: (amount: number) => string, formatDate: (date: Date | string) => string, settings?: any): SlipData => {
    const totalCOD = orders.reduce((sum, o) => sum + (o.cod || 0), 0);
    const totalDeliveryFee = orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    const totalItemPrice = orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0);
    const totalAdjustments = orders.reduce((sum, o) => sum + (adjustments[o.id] || 0), 0);
    const totalNet = totalItemPrice + totalAdjustments;

    return {
      title: `كشف دفع للتاجر: ${merchantName}`,
      subtitle: `عدد الطلبات: ${orders.length} طلب`,
      date: formatDate(new Date()),
      headers: ['رقم الطلب', 'المستلم', 'تاريخ التوصيل', 'قيمة التحصيل', 'أجور التوصيل', 'المستحق للتاجر', 'تعديلات', 'الصافي المستحق'],
      rows: orders.map(order => {
        const adjustment = adjustments[order.id] || 0;
        const netAmount = (order.itemPrice || 0) + adjustment;
        return [
          order.id,
          order.recipient,
          formatDate(order.date),
          formatCurrency(order.cod || 0),
          formatCurrency(order.deliveryFee || 0),
          formatCurrency(order.itemPrice || 0),
          `${adjustment !== 0 ? (adjustment > 0 ? '+' : '') : ''}${formatCurrency(adjustment)}`,
          formatCurrency(netAmount)
        ];
      }),
      totalsRow: ['الإجمالي', '', '', formatCurrency(totalCOD), formatCurrency(totalDeliveryFee), formatCurrency(totalItemPrice), `${totalAdjustments !== 0 ? (totalAdjustments > 0 ? '+' : '') : ''}${formatCurrency(totalAdjustments)}`, formatCurrency(totalNet)],
      signatures: ['توقيع المستلم (التاجر)', 'توقيع الموظف المالي'],
      companyInfo: {
        name: settings?.login?.companyName || 'الشركة',
        logo: settings?.login?.reportsLogo || settings?.login?.headerLogo
      }
    };
  },

  /**
   * معلومات السائقين المالية
   */
  driversFinancial: (drivers: any[], formatCurrency: (amount: number) => string, formatDate: (date: Date | string) => string, settings?: any): SlipData => {
    const totals = drivers.reduce((acc, driver) => {
      acc.totalCOD += driver.totalCOD;
      acc.totalDriverFees += driver.totalDriverFees;
      acc.totalCollected += driver.collectedAmount;
      acc.totalOutstanding += driver.outstandingAmount;
      acc.totalNetPayable += driver.netPayable;
      return acc;
    }, {
      totalCOD: 0,
      totalDriverFees: 0,
      totalCollected: 0,
      totalOutstanding: 0,
      totalNetPayable: 0,
    });

    return {
      title: 'معلومات السائقين المالية',
      subtitle: `عدد السائقين: ${drivers.length}`,
      date: formatDate(new Date()),
      headers: ['اسم السائق', 'الحالة', 'إجمالي الطلبات', 'مكتملة', 'إجمالي التحصيل', 'أجور السائق', 'الصافي', 'مستلم', 'متبقي', 'كشوفات'],
      rows: drivers.map(driver => [
        driver.name,
        driver.status,
        driver.totalOrders.toString(),
        driver.deliveredOrders.toString(),
        formatCurrency(driver.totalCOD),
        formatCurrency(driver.totalDriverFees),
        formatCurrency(driver.netPayable),
        formatCurrency(driver.collectedAmount),
        formatCurrency(driver.outstandingAmount),
        driver.totalSlips.toString()
      ]),
      totalsRow: ['الإجمالي', '', '', '', formatCurrency(totals.totalCOD), formatCurrency(totals.totalDriverFees), formatCurrency(totals.totalNetPayable), formatCurrency(totals.totalCollected), formatCurrency(totals.totalOutstanding), '-'],
      companyInfo: {
        name: settings?.login?.companyName || 'الشركة',
        logo: settings?.login?.reportsLogo || settings?.login?.headerLogo
      }
    };
  },

  /**
   * قائمة الطلبات
   */
  ordersList: (orders: any[], formatCurrency: (amount: number) => string, formatDate: (date: Date | string) => string, settings?: any): SlipData => {
    const totalCOD = orders.reduce((sum, o) => sum + (o.cod || 0), 0);
    const totalDeliveryFee = orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

    return {
      title: 'قائمة الطلبات',
      subtitle: `عدد الطلبات: ${orders.length}`,
      date: formatDate(new Date()),
      headers: ['رقم الطلب', 'العميل', 'الهاتف', 'المنطقة', 'التاجر', 'السائق', 'الحالة', 'قيمة التحصيل', 'أجور التوصيل'],
      rows: orders.map(order => [
        order.id,
        order.recipient,
        order.phone || '-',
        order.region || '-',
        order.merchant || '-',
        order.driver || '-',
        order.status || '-',
        formatCurrency(order.cod || 0),
        formatCurrency(order.deliveryFee || 0)
      ]),
      totalsRow: ['الإجمالي', '', '', '', '', '', '', formatCurrency(totalCOD), formatCurrency(totalDeliveryFee)],
      companyInfo: {
        name: settings?.login?.companyName || 'الشركة',
        logo: settings?.login?.reportsLogo || settings?.login?.headerLogo
      }
    };
  },

  /**
   * كشف المرتجعات
   */
  returnsList: (returns: any[], formatCurrency: (amount: number) => string, formatDate: (date: Date | string) => string, settings?: any): SlipData => {
    const totalAmount = returns.reduce((sum, r) => sum + (r.amount || 0), 0);

    return {
      title: 'كشف المرتجعات',
      subtitle: `عدد المرتجعات: ${returns.length}`,
      date: formatDate(new Date()),
      headers: ['رقم الطلب', 'العميل', 'السبب', 'التاريخ', 'المبلغ', 'الحالة'],
      rows: returns.map(returnItem => [
        returnItem.orderId || returnItem.id,
        returnItem.customerName || returnItem.recipient,
        returnItem.reason || '-',
        formatDate(returnItem.date),
        formatCurrency(returnItem.amount || 0),
        returnItem.status || '-'
      ]),
      totalsRow: ['الإجمالي', '', '', '', formatCurrency(totalAmount), ''],
      companyInfo: {
        name: settings?.login?.companyName || 'الشركة',
        logo: settings?.login?.reportsLogo || settings?.login?.headerLogo
      }
    };
  }
};