export const getTableTemplate = () => `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>جدول المنتجات</title>
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
        
        .table-container {
            width: 100%;
            max-width: 100%;
        }
        
        .table-header {
            {{SHOW_LOGO}}
            text-align: center;
            margin-bottom: {{SPACING}}mm;
            background: {{HEADER_BG}};
            color: {{HEADER_TEXT}};
            padding: {{PADDING}}mm;
            border-radius: {{BORDER_RADIUS}}px;
            border: {{BORDER_WIDTH}}px solid #{{PRIMARY_COLOR}};
        }
        
        .table-title {
            font-size: {{TITLE_SIZE}}px;
            font-weight: bold;
            margin-bottom: {{SPACING}}mm;
        }
        
        .table-subtitle {
            font-size: {{SUBTITLE_SIZE}}px;
            opacity: 0.9;
            margin-bottom: {{SPACING}}mm;
        }
        
        .table-meta {
            font-size: {{LABEL_SIZE}}px;
            font-weight: 600;
        }
        
        .stats-bar {
            {{SHOW_STATS}}
            display: flex;
            justify-content: space-around;
            background: {{STATS_BG}};
            padding: {{PADDING}}mm;
            border-radius: {{BORDER_RADIUS}}px;
            margin-bottom: {{SPACING}}mm;
            border: {{BORDER_WIDTH}}px solid #e9ecef;
            gap: {{SPACING}}mm;
        }
        
        .stat-item {
            text-align: center;
            flex: 1;
            padding: {{PADDING}}mm;
            background: white;
            border-radius: {{BORDER_RADIUS}}px;
            border: 2px solid #{{PRIMARY_COLOR}}20;
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
        
        .main-table {
            {{SHOW_TABLE}}
            width: 100%;
            overflow: hidden;
            border-radius: {{BORDER_RADIUS}}px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: {{BORDER_WIDTH}}px solid #{{PRIMARY_COLOR}};
            margin-bottom: {{SPACING}}mm;
            background: white;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
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
        
        .data-table tfoot {
            display: table-footer-group;
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
            border-left: 1px solid rgba(255,255,255,0.2);
            white-space: nowrap;
        }
        
        .data-table thead th:last-child {
            border-left: none;
        }
        
        .data-table tbody tr:nth-child(even) {
            background: {{ROW_EVEN_BG}};
        }
        
        .data-table tbody tr:nth-child(odd) {
            background: white;
        }
        
        .data-table tbody tr:hover {
            background: {{ROW_HOVER_BG}};
        }
        
        .data-table tbody td {
            padding: {{PADDING}}mm;
            text-align: center;
            border-left: 1px solid #dee2e6;
            border-bottom: 1px solid #f1f3f4;
            vertical-align: middle;
        }
        
        .data-table tbody td:last-child {
            border-left: none;
        }
        
        .data-table tfoot tr {
            background: {{FOOTER_BG}};
            font-weight: bold;
            border-top: {{BORDER_WIDTH}}px solid #{{PRIMARY_COLOR}};
        }
        
        .data-table tfoot td {
            padding: {{PADDING}}mm;
            text-align: center;
            font-size: {{STAT_SIZE}}px;
            color: #{{PRIMARY_COLOR}};
        }
        
        .row-number {
            background: #e9ecef !important;
            font-weight: bold;
            color: #495057;
            width: 8%;
        }
        
        .product-name {
            text-align: right !important;
            font-weight: 600;
            max-width: 35%;
            word-wrap: break-word;
        }
        
        .category-tag {
            padding: 1mm 2mm;
            border-radius: 6mm;
            font-size: {{LABEL_SIZE}}px;
            font-weight: bold;
            background: #{{SECONDARY_COLOR}}20;
            color: #{{SECONDARY_COLOR}};
            white-space: nowrap;
        }
        
        .number-cell {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            color: #{{PRIMARY_COLOR}};
        }
        
        .total-cell {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            color: #28a745;
        }
        
        .summary-section {
            {{SHOW_SUMMARY}}
            margin-top: {{SPACING}}mm;
            padding: {{PADDING}}mm;
            background: #fff3cd;
            border: {{BORDER_WIDTH}}px solid #ffeaa7;
            border-radius: {{BORDER_RADIUS}}px;
            font-size: {{BODY_SIZE}}px;
        }
        
        .summary-title {
            font-weight: bold;
            margin-bottom: 2mm;
            color: #856404;
        }
        
        .table-footer {
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
            .table-container {
                width: 100% !important;
                max-width: none !important;
            }
            
            .stats-bar, .table-header {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="table-container">
        <div class="table-header">
            <h1 class="table-title">{{TABLE_TITLE}}</h1>
            <div class="table-subtitle">{{TABLE_SUBTITLE}}</div>
            <div class="table-meta">{{TABLE_META}}</div>
        </div>
        
        <div class="stats-bar">
            {{STATS_CONTENT}}
        </div>

        <div class="main-table">
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
                <tfoot>
                    {{TABLE_FOOTER}}
                </tfoot>
            </table>
        </div>

        <div class="summary-section">
            <div class="summary-title">📝 ملخص الجدول:</div>
            {{SUMMARY_CONTENT}}
        </div>

        <div class="table-footer">
            <div class="footer-timestamp">{{FOOTER_TIMESTAMP}}</div>
            <div>{{FOOTER_TEXT}}</div>
        </div>
    </div>
    
    <script>
        window.onload = function() {
            setTimeout(() => window.print(), 500);
        };
    </script>
</body>
</html>`

// دالة لتعبئة Template
export function fillTableTemplate(
  controls: any,
  products: any[]
): string {
  let template = getTableTemplate()
  
  // حساب الإحصائيات
  const totalProducts = products.length
  const totalQuantity = products.reduce((sum, p) => sum + (p.quantity || 0), 0)
  const totalPrice = products.reduce((sum, p) => sum + (p.total || 0), 0)
  const avgPrice = totalProducts > 0 ? Math.round(totalPrice / totalProducts) : 0
  
  // تحديد حجم الصفحة
  const pageSize = controls.size.includes('a4') 
    ? (controls.size.includes('landscape') ? 'A4 landscape' : 'A4 portrait')
    : controls.size.includes('a5')
    ? (controls.size.includes('landscape') ? 'A5 landscape' : 'A5 portrait')
    : 'A4 portrait'
  
  // ألوان
  const headerBg = controls.colorScheme === 'color'
    ? `linear-gradient(135deg, #${controls.primaryColor}, #${controls.secondaryColor})`
    : '#333'
  
  const headerText = 'white'
  
  const statsBg = controls.colorScheme === 'color'
    ? `rgba(${parseInt(controls.primaryColor.slice(0,2), 16)}, ${parseInt(controls.primaryColor.slice(2,4), 16)}, ${parseInt(controls.primaryColor.slice(4,6), 16)}, 0.08)`
    : '#f8f9fa'
  
  const tableHeaderBg = controls.colorScheme === 'color'
    ? `linear-gradient(135deg, #${controls.primaryColor}, #${controls.secondaryColor})`
    : '#333'
  
  const rowEvenBg = controls.colorScheme === 'color'
    ? `rgba(${parseInt(controls.primaryColor.slice(0,2), 16)}, ${parseInt(controls.primaryColor.slice(2,4), 16)}, ${parseInt(controls.primaryColor.slice(4,6), 16)}, 0.05)`
    : '#f9f9f9'
  
  const rowHoverBg = controls.colorScheme === 'color'
    ? `rgba(${parseInt(controls.primaryColor.slice(0,2), 16)}, ${parseInt(controls.primaryColor.slice(2,4), 16)}, ${parseInt(controls.primaryColor.slice(4,6), 16)}, 0.1)`
    : '#f0f0f0'
  
  const footerBg = controls.colorScheme === 'color'
    ? `rgba(${parseInt(controls.secondaryColor.slice(0,2), 16)}, ${parseInt(controls.secondaryColor.slice(2,4), 16)}, ${parseInt(controls.secondaryColor.slice(4,6), 16)}, 0.15)`
    : '#e9ecef'
  
  // حساب أحجام الخطوط
  const titleSize = Math.min(controls.fontSize + 8, 22)
  const subtitleSize = Math.max(controls.fontSize, 11)
  const bodySize = Math.max(controls.fontSize - 1, 9)
  const labelSize = Math.max(controls.fontSize - 2, 8)
  const statSize = Math.min(controls.fontSize + 3, 17)
  
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
    '{{SHOW_SUMMARY}}': controls.fields.showSummary ? 'display: block;' : 'display: none;',
    '{{SHOW_DATE}}': controls.fields.showDate ? 'display: block;' : 'display: none;',
    '{{HEADER_BG}}': headerBg,
    '{{HEADER_TEXT}}': headerText,
    '{{STATS_BG}}': statsBg,
    '{{TABLE_HEADER_BG}}': tableHeaderBg,
    '{{ROW_EVEN_BG}}': rowEvenBg,
    '{{ROW_HOVER_BG}}': rowHoverBg,
    '{{FOOTER_BG}}': footerBg,
    '{{TABLE_TITLE}}': 'جدول المنتجات',
    '{{TABLE_SUBTITLE}}': `إجمالي ${totalProducts} منتج`,
    '{{TABLE_META}}': `تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}`,
    '{{FOOTER_TIMESTAMP}}': `تم الإنشاء في ${new Date().toLocaleString('ar-SA')}`,
    '{{FOOTER_TEXT}}': 'تم إنشاء هذا الجدول بواسطة نظام إدارة المخزون',
  }
  
  Object.entries(replacements).forEach(([key, value]) => {
    template = template.split(key).join(value.toString())
  })
  
  // إنشاء محتوى Stats
  const statsContent = `
    <div class="stat-item">
      <span class="stat-value">${totalProducts}</span>
      <div class="stat-label">عدد المنتجات</div>
    </div>
    <div class="stat-item">
      <span class="stat-value">${totalQuantity.toLocaleString()}</span>
      <div class="stat-label">الكمية الكلية</div>
    </div>
    <div class="stat-item">
      <span class="stat-value">${totalPrice.toLocaleString()}</span>
      <div class="stat-label">المبلغ الإجمالي (د.أ)</div>
    </div>
    <div class="stat-item">
      <span class="stat-value">${avgPrice.toLocaleString()}</span>
      <div class="stat-label">متوسط السعر (د.أ)</div>
    </div>
  `
  
  // إنشاء Table Headers
  const tableHeaders = `
    <th style="width: 35%;">اسم المنتج</th>
    <th style="width: 15%;">الفئة</th>
    <th style="width: 10%;">الكمية</th>
    <th style="width: 15%;">السعر (د.أ)</th>
    <th style="width: 15%;">الإجمالي (د.أ)</th>
  `
  
  // إنشاء Table Rows
  const tableRows = products.map((product, index) => {
    return `
      <tr>
        <td class="row-number">${index + 1}</td>
        <td class="product-name">${product.name || product.product || 'منتج غير محدد'}</td>
        <td>
          <span class="category-tag">${product.category || 'عام'}</span>
        </td>
        <td class="number-cell">${(product.quantity || 0).toLocaleString()}</td>
        <td class="number-cell">${(product.price || 0).toLocaleString()}</td>
        <td class="total-cell">${(product.total || 0).toLocaleString()}</td>
      </tr>
    `
  }).join('')
  
  // إنشاء Table Footer
  const tableFooter = `
    <tr>
      <td colspan="3" style="text-align: center; font-weight: bold;">الإجمالي الكلي</td>
      <td class="number-cell">${totalQuantity.toLocaleString()}</td>
      <td class="number-cell">-</td>
      <td class="total-cell" style="font-size: ${statSize}px;">${totalPrice.toLocaleString()}</td>
    </tr>
  `
  
  // إنشاء Summary
  const summaryContent = `
    إجمالي ${totalProducts} منتج بكمية ${totalQuantity.toLocaleString()} قطعة،
    بمبلغ كلي ${totalPrice.toLocaleString()} د.أ،
    بمتوسط سعر ${avgPrice.toLocaleString()} د.أ للمنتج الواحد.
  `
  
  template = template.replace('{{STATS_CONTENT}}', statsContent)
  template = template.replace('{{TABLE_HEADERS}}', tableHeaders)
  template = template.replace('{{TABLE_ROWS}}', tableRows)
  template = template.replace('{{TABLE_FOOTER}}', tableFooter)
  template = template.replace('{{SUMMARY_CONTENT}}', summaryContent)
  
  return template
}