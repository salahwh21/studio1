export const getReportTemplate = () => `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير البيانات</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        @page {
            size: {{PAGE_SIZE}};
            margin: {{MARGIN}}mm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        body {
            font-family: '{{FONT_FAMILY}}', 'Cairo', sans-serif;
            direction: rtl;
            background: white;
            color: #000;
            font-size: {{FONT_SIZE}}px;
            line-height: 1.4;
        }
        
        .report-container {
            width: 100%;
            max-width: 100%;
        }
        
        .report-header {
            {{SHOW_LOGO}}
            text-align: center;
            margin-bottom: {{SPACING}}mm;
            border-bottom: {{BORDER_WIDTH}}px solid #{{PRIMARY_COLOR}};
            padding-bottom: {{PADDING}}mm;
        }
        
        .report-title {
            font-size: {{TITLE_SIZE}}px;
            font-weight: bold;
            color: #{{PRIMARY_COLOR}};
            margin-bottom: {{SPACING}}mm;
        }
        
        .report-subtitle {
            font-size: {{SUBTITLE_SIZE}}px;
            color: #666;
            margin-bottom: {{SPACING}}mm;
        }
        
        .report-meta {
            font-size: {{LABEL_SIZE}}px;
            color: #{{PRIMARY_COLOR}};
            font-weight: bold;
        }
        
        .stats-bar {
            {{SHOW_STATS}}
            display: flex;
            justify-content: space-between;
            background: {{STATS_BG}};
            padding: {{PADDING}}mm;
            border-radius: {{BORDER_RADIUS}}px;
            margin-bottom: {{SPACING}}mm;
            border: {{BORDER_WIDTH}}px solid #dee2e6;
            gap: {{SPACING}}mm;
        }
        
        .stat-item {
            text-align: center;
            flex: 1;
            padding: {{PADDING}}mm;
            background: white;
            border-radius: {{BORDER_RADIUS}}px;
            border: 1px solid #e9ecef;
        }
        
        .stat-value {
            font-size: {{STAT_SIZE}}px;
            font-weight: bold;
            color: #{{PRIMARY_COLOR}};
            display: block;
            margin-bottom: 2mm;
        }
        
        .stat-label {
            font-size: {{LABEL_SIZE}}px;
            color: #6c757d;
        }
        
        .table-container {
            {{SHOW_TABLE}}
            width: 100%;
            overflow: hidden;
            border-radius: {{BORDER_RADIUS}}px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.1);
            border: {{BORDER_WIDTH}}px solid #dee2e6;
            margin-bottom: {{SPACING}}mm;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            font-size: {{BODY_SIZE}}px;
            page-break-inside: auto;
        }
        
        .data-table thead {
            display: table-header-group;
        }
        
        .data-table tbody tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }
        
        .data-table thead tr {
            background: {{TABLE_HEADER_BG}};
            color: white;
        }
        
        .data-table thead th {
            padding: {{PADDING}}mm;
            text-align: center;
            font-weight: bold;
            font-size: {{BODY_SIZE}}px;
            border-right: 1px solid rgba(255,255,255,0.2);
        }
        
        .data-table thead th:last-child {
            border-right: none;
        }
        
        .data-table tbody tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .data-table tbody tr:nth-child(odd) {
            background: white;
        }
        
        .data-table tbody td {
            padding: {{PADDING}}mm;
            text-align: center;
            border-right: 1px solid #dee2e6;
            border-bottom: 1px solid #f1f3f4;
            vertical-align: middle;
            word-wrap: break-word;
        }
        
        .data-table tbody td:last-child {
            border-right: none;
        }
        
        .row-number {
            background: #e9ecef !important;
            font-weight: bold;
            color: #495057;
            width: 12mm;
        }
        
        .status-badge {
            padding: 1mm 2mm;
            border-radius: 6mm;
            font-size: {{LABEL_SIZE}}px;
            font-weight: bold;
            white-space: nowrap;
        }
        
        .status-delivered {
            background: #d4edda;
            color: #155724;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-new {
            background: #cce5ff;
            color: #004085;
        }
        
        .status-cancelled {
            background: #f8d7da;
            color: #721c24;
        }
        
        .amount {
            font-weight: bold;
            color: #28a745;
            white-space: nowrap;
            font-family: 'Courier New', monospace;
        }
        
        .report-footer {
            {{SHOW_DATE}}
            margin-top: {{SPACING}}mm;
            padding-top: {{PADDING}}mm;
            border-top: {{BORDER_WIDTH}}px solid #e9ecef;
            text-align: center;
            color: #6c757d;
            font-size: {{LABEL_SIZE}}px;
        }
        
        .footer-timestamp {
            font-weight: bold;
            color: #495057;
            margin-bottom: 2mm;
        }
        
        @media print {
            .report-container {
                width: 100% !important;
                max-width: none !important;
            }
            
            .stats-bar, .report-header {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="report-header">
            <h1 class="report-title">{{REPORT_TITLE}}</h1>
            <div class="report-subtitle">{{REPORT_SUBTITLE}}</div>
            <div class="report-meta">{{REPORT_META}}</div>
        </div>
        
        <div class="stats-bar">
            {{STATS_CONTENT}}
        </div>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="row-number">#</th>
                        {{TABLE_HEADERS}}
                    </tr>
                </thead>
                <tbody>
                    {{TABLE_ROWS}}
                </tbody>
            </table>
        </div>

        <div class="report-footer">
            <div class="footer-timestamp">{{FOOTER_TIMESTAMP}}</div>
            <div>{{FOOTER_TEXT}}</div>
        </div>
    </div>
    
    <script>
        // طباعة تلقائية
        window.onload = function() {
            setTimeout(() => window.print(), 500);
        };
    </script>
</body>
</html>`

// دالة لتعبئة Template
export function fillReportTemplate(
  controls: any,
  orders: any[]
): string {
  let template = getReportTemplate()
  
  // حساب الإحصائيات
  const totalOrders = orders.length
  const totalAmount = orders.reduce((sum, o) => sum + (o.codAmount || 0), 0)
  const deliveredCount = orders.filter(o => o.status === 'delivered').length
  const pendingCount = orders.filter(o => o.status === 'pending').length
  
  // تحديد حجم الصفحة
  const pageSize = controls.size.includes('a4') 
    ? (controls.size.includes('landscape') ? 'A4 landscape' : 'A4 portrait')
    : controls.size.includes('a5')
    ? (controls.size.includes('landscape') ? 'A5 landscape' : 'A5 portrait')
    : 'A4 portrait'
  
  // خلفية Stats
  const statsBg = controls.colorScheme === 'color'
    ? `linear-gradient(135deg, rgba(${parseInt(controls.primaryColor.slice(0,2), 16)}, ${parseInt(controls.primaryColor.slice(2,4), 16)}, ${parseInt(controls.primaryColor.slice(4,6), 16)}, 0.1), rgba(${parseInt(controls.secondaryColor.slice(0,2), 16)}, ${parseInt(controls.secondaryColor.slice(2,4), 16)}, ${parseInt(controls.secondaryColor.slice(4,6), 16)}, 0.05))`
    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
  
  // خلفية Table Header
  const tableHeaderBg = controls.colorScheme === 'color'
    ? `linear-gradient(135deg, #${controls.primaryColor}, #${controls.secondaryColor})`
    : '#333'
  
  // حساب أحجام الخطوط
  const titleSize = Math.min(controls.fontSize + 8, 24)
  const subtitleSize = Math.max(controls.fontSize, 12)
  const bodySize = Math.max(controls.fontSize - 1, 9)
  const labelSize = Math.max(controls.fontSize - 2, 8)
  const statSize = Math.min(controls.fontSize + 4, 18)
  
  // استبدال المتغيرات
  const replacements = {
    '{{PAGE_SIZE}}': pageSize,
    '{{FONT_FAMILY}}': controls.fontFamily,
    '{{FONT_SIZE}}': controls.fontSize.toString(),
    '{{PRIMARY_COLOR}}': controls.primaryColor,
    '{{SECONDARY_COLOR}}': controls.secondaryColor,
    '{{MARGIN}}': controls.margins.toString(),
    '{{PADDING}}': (controls.padding / 3).toString(),
    '{{SPACING}}': (controls.itemSpacing / 3).toString(),
    '{{BORDER_WIDTH}}': controls.borderWidth.toString(),
    '{{BORDER_RADIUS}}': controls.borderRadius.toString(),
    '{{TITLE_SIZE}}': titleSize.toString(),
    '{{SUBTITLE_SIZE}}': subtitleSize.toString(),
    '{{BODY_SIZE}}': bodySize.toString(),
    '{{LABEL_SIZE}}': labelSize.toString(),
    '{{STAT_SIZE}}': statSize.toString(),
    '{{SHOW_LOGO}}': controls.fields.showLogo ? 'display: block;' : 'display: none;',
    '{{SHOW_STATS}}': controls.fields.showStats ? 'display: flex;' : 'display: none;',
    '{{SHOW_TABLE}}': controls.fields.showTable ? 'display: block;' : 'display: none;',
    '{{SHOW_DATE}}': controls.fields.showDate ? 'display: block;' : 'display: none;',
    '{{STATS_BG}}': statsBg,
    '{{TABLE_HEADER_BG}}': tableHeaderBg,
    '{{REPORT_TITLE}}': 'تقرير الطلبات',
    '{{REPORT_SUBTITLE}}': `إجمالي ${totalOrders} طلب`,
    '{{REPORT_META}}': `الفترة: ${new Date().toLocaleDateString('ar-SA')}`,
    '{{FOOTER_TIMESTAMP}}': `تم الإنشاء في ${new Date().toLocaleString('ar-SA')}`,
    '{{FOOTER_TEXT}}': 'تم إنشاء هذا التقرير بواسطة نظام إدارة التوصيل',
  }
  
  Object.entries(replacements).forEach(([key, value]) => {
    template = template.split(key).join(value)
  })
  
  // إنشاء محتوى Stats
  const statsContent = `
    <div class="stat-item">
      <span class="stat-value">${totalOrders}</span>
      <div class="stat-label">إجمالي الطلبات</div>
    </div>
    <div class="stat-item">
      <span class="stat-value">${totalAmount.toLocaleString()}</span>
      <div class="stat-label">المبلغ الكلي (د.أ)</div>
    </div>
    <div class="stat-item">
      <span class="stat-value">${deliveredCount}</span>
      <div class="stat-label">تم التسليم</div>
    </div>
    <div class="stat-item">
      <span class="stat-value">${pendingCount}</span>
      <div class="stat-label">قيد التوصيل</div>
    </div>
  `
  
  // إنشاء Table Headers
  const tableHeaders = `
    <th>رقم الطلب</th>
    <th>المستلم</th>
    <th>المدينة</th>
    <th>المبلغ</th>
    <th>الحالة</th>
    <th>التاريخ</th>
  `
  
  // إنشاء Table Rows
  const tableRows = orders.map((order, index) => {
    const statusClass = 
      order.status === 'delivered' ? 'delivered' :
      order.status === 'pending' ? 'pending' :
      order.status === 'new' ? 'new' : 'cancelled'
    
    const statusText = 
      order.status === 'delivered' ? 'تم التسليم' :
      order.status === 'pending' ? 'قيد التوصيل' :
      order.status === 'new' ? 'جديد' : 'ملغي'
    
    return `
      <tr>
        <td class="row-number">${index + 1}</td>
        <td style="font-family: monospace; font-weight: bold;">${order.orderNumber || order.id}</td>
        <td style="text-align: right; font-weight: 600;">${order.recipientName || 'غير محدد'}</td>
        <td>${order.recipientCity || 'غير محدد'}</td>
        <td class="amount">${(order.codAmount || 0).toLocaleString()}</td>
        <td>
          <span class="status-badge status-${statusClass}">${statusText}</span>
        </td>
        <td style="font-size: ${labelSize - 1}px;">${new Date(order.createdAt || Date.now()).toLocaleDateString('ar-SA')}</td>
      </tr>
    `
  }).join('')
  
  template = template.replace('{{STATS_CONTENT}}', statsContent)
  template = template.replace('{{TABLE_HEADERS}}', tableHeaders)
  template = template.replace('{{TABLE_ROWS}}', tableRows)
  
  return template
}