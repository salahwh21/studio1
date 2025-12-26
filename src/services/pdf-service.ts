/**
 * PDF Service - خدمة PDF بسيطة
 * دعم عربي كامل مع طباعة المتصفح
 */
import {
  createThermalLabelHtml as createThermalLabelHTMLOriginal,
  createStandardPolicyHtml as createStandardPolicyHTMLOriginal
} from './pdf-templates';

export const createThermalLabelHTML = createThermalLabelHTMLOriginal;
export const createStandardPolicyHTML = createStandardPolicyHTMLOriginal;

/**
 * فتح PDF في تبويب جديد
 */
export async function openPdfInNewTab(
  html: string,
  filename: string = 'document.pdf',
  options: { width?: number; height?: number } = {}
): Promise<void> {
  try {
    console.log('Attempting to generate PDF via Playwright API...');

    // محاولة استخدام Playwright أولاً
    const response = await fetch('/api/pdf-playwright', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        filename,
        width: options.width || 210,
        height: options.height || 297
      }),
    });

    if (response.ok) {
      console.log('PDF generated successfully via Playwright');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // فتح PDF في تبويب جديد
      const newTab = window.open(url, '_blank');
      if (!newTab) {
        throw new Error('تعذر فتح التبويب - يرجى السماح بالنوافذ المنبثقة');
      }

      // تنظيف URL بعد فترة
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 30000);

      return;
    } else {
      // محاولة قراءة تفاصيل الخطأ
      try {
        const errorData = await response.json();
        console.error('Playwright API error:', errorData);
        throw new Error(`Playwright API failed: ${errorData.details || errorData.error || 'Unknown error'}`);
      } catch (jsonError) {
        console.error('Failed to parse error response:', jsonError);
        throw new Error(`Playwright API failed with status: ${response.status}`);
      }
    }

  } catch (error) {
    console.warn('Playwright failed, using browser print fallback:', error);

    // العودة إلى طباعة المتصفح في تبويب جديد
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      throw new Error('تعذر فتح التبويب - يرجى السماح بالنوافذ المنبثقة');
    }

    const printStyles = `
      @page { 
        size: ${options.width || 210}mm ${options.height || 297}mm; 
        margin: 5mm; 
      }
      * { 
        margin: 0; 
        padding: 0; 
        box-sizing: border-box; 
      }
      body { 
        font-family: 'Segoe UI', 'Tahoma', 'Arial', sans-serif; 
        direction: rtl; 
        color: #000;
        background: white;
      }
      @media print { 
        body { margin: 0; } 
        .no-print { display: none !important; } 
      }
    `;

    const fullHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>${filename}</title>
    <style>${printStyles}</style>
</head>
<body>
    ${html}
    <div class="no-print" style="position: fixed; top: 10px; left: 10px; z-index: 1000; background: rgba(255,255,255,0.9); padding: 8px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <button onclick="window.print()" style="
          background: #2563eb; 
          color: white; 
          border: none; 
          padding: 8px 16px; 
          border-radius: 4px; 
          cursor: pointer;
          font-size: 14px;
          margin-left: 8px;
          font-family: Arial, sans-serif;
        ">🖨️ طباعة</button>
        <button onclick="window.close()" style="
          background: #dc2626; 
          color: white; 
          border: none; 
          padding: 8px 16px; 
          border-radius: 4px; 
          cursor: pointer;
          font-size: 14px;
          font-family: Arial, sans-serif;
        ">✕ إغلاق</button>
    </div>
</body>
</html>`;

    printWindow.document.write(fullHtml);
    printWindow.document.close();
    printWindow.focus();

    console.log('Fallback HTML method used successfully');
  }
}

/**
 * دالة موحدة لإنشاء PDF - تستخدم طباعة المتصفح
 */
export async function generatePdf(
  html: string,
  filename: string = 'document.pdf',
  options: { width?: number; height?: number } = {}
): Promise<void> {
  try {
    // محاولة استخدام Playwright أولاً
    const response = await fetch('/api/pdf-playwright', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        filename,
        width: options.width || 210,
        height: options.height || 297
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
      return;
    }

    throw new Error('Playwright API failed');
  } catch (error) {
    console.warn('Playwright failed, using browser print:', error);

    // العودة إلى طباعة المتصفح (الحل الأساسي)
    try {
      return await generatePdfViaBrowserPrint(html, { filename, ...options });
    } catch (printError) {
      console.error('Browser print also failed:', printError);

      // الحل الأخير: تحميل كـ HTML مع رسالة للمستخدم
      const htmlFilename = filename.replace('.pdf', '.html');
      downloadAsHtml(html, htmlFilename);

      // إظهار رسالة للمستخدم
      if (typeof window !== 'undefined') {
        alert(`تم تحميل الملف كـ HTML: ${htmlFilename}\nيمكنك فتحه في المتصفح وطباعته كـ PDF من خلال Ctrl+P`);
      }

      throw new Error('فشل في الطباعة. تم تحميل الملف كـ HTML بدلاً من ذلك.');
    }
  }
}

/**
 * طباعة المتصفح - الحل الأساسي والموثوق
 */
export async function generatePdfViaBrowserPrint(
  html: string,
  options: { filename?: string; width?: number; height?: number } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // محاولة فتح نافذة جديدة
      let printWindow: Window | null = null;

      try {
        printWindow = window.open('', '_blank', 'width=800,height=600');
      } catch (error) {
        console.warn('Failed to open popup window:', error);
      }

      // إذا فشل فتح النافذة، استخدم الطباعة المباشرة
      if (!printWindow) {
        console.warn('Popup blocked, using direct print method');
        return handleDirectPrint(html, options, resolve, reject);
      }

      // إضافة CSS للطباعة
      const printStyles = `
        @page { 
          size: ${options.width || 210}mm ${options.height || 297}mm; 
          margin: 5mm; 
        }
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        body { 
          font-family: 'Segoe UI', 'Tahoma', 'Arial', sans-serif; 
          direction: rtl; 
          color: #000;
          background: white;
        }
        @media print { 
          body { margin: 0; } 
          .no-print { display: none !important; } 
        }
      `;

      const fullHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>${options.filename || 'document'}</title>
    <style>${printStyles}</style>
</head>
<body>
    ${html}
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
                setTimeout(() => {
                  window.close();
                  window.opener?.postMessage('print-complete', '*');
                }, 1000);
            }, 500);
        };
    </script>
</body>
</html>`;

      printWindow.document.write(fullHtml);
      printWindow.document.close();
      printWindow.focus();

      // الاستماع لإكمال الطباعة
      const handleMessage = (event: MessageEvent) => {
        if (event.data === 'print-complete') {
          window.removeEventListener('message', handleMessage);
          resolve();
        }
      };

      window.addEventListener('message', handleMessage);

      // إنهاء تلقائي بعد 10 ثوان
      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        if (!printWindow!.closed) {
          printWindow!.close();
        }
        resolve();
      }, 10000);

    } catch (error) {
      console.error('Print error:', error);
      reject(error);
    }
  });
}

/**
 * طباعة مباشرة عند فشل النافذة المنبثقة
 */
function handleDirectPrint(
  html: string,
  options: { filename?: string; width?: number; height?: number },
  resolve: () => void,
  reject: (error: Error) => void
) {
  try {
    // إنشاء عنصر iframe مخفي
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const printStyles = `
      @page { 
        size: ${options.width || 210}mm ${options.height || 297}mm; 
        margin: 5mm; 
      }
      * { 
        margin: 0; 
        padding: 0; 
        box-sizing: border-box; 
      }
      body { 
        font-family: 'Segoe UI', 'Tahoma', 'Arial', sans-serif; 
        direction: rtl; 
        color: #000;
        background: white;
      }
      @media print { 
        body { margin: 0; } 
        .no-print { display: none !important; } 
      }
    `;

    const fullHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>${options.filename || 'document'}</title>
    <style>${printStyles}</style>
</head>
<body>
    ${html}
</body>
</html>`;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.write(fullHtml);
      iframeDoc.close();

      // انتظار تحميل المحتوى ثم الطباعة
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          // إزالة iframe بعد الطباعة
          setTimeout(() => {
            document.body.removeChild(iframe);
            resolve();
          }, 1000);
        } catch (printError) {
          console.error('Direct print failed:', printError);
          document.body.removeChild(iframe);

          // الحل الأخير: تحميل كـ HTML
          downloadAsHtml(html, options.filename || 'document.html');
          resolve();
        }
      }, 500);
    } else {
      document.body.removeChild(iframe);
      reject(new Error('فشل في إنشاء iframe للطباعة'));
    }
  } catch (error) {
    console.error('Direct print setup failed:', error);

    // الحل الأخير: تحميل كـ HTML
    downloadAsHtml(html, options.filename || 'document.html');
    resolve();
  }
}

/**
 * طباعة مجمعة للملصقات - فتح كل PDF في تبويب منفصل
 */
export async function bulkPrintShippingLabels(
  orders: Array<{
    id: string;
    orderNumber: string | number;
    recipient: string;
    phone: string;
    address: string;
    city: string;
    region: string;
    cod: number;
    merchant: string;
    date: string;
    notes?: string;
  }>,
  options: {
    companyName: string;
    labelType: 'thermal' | 'standard';
    width?: number;
    height?: number;
  }
): Promise<void> {
  if (orders.length === 0) {
    throw new Error('لا توجد طلبات للطباعة');
  }

  const { companyName, labelType, width = 100, height = 150 } = options;

  try {
    // إظهار رسالة للمستخدم
    if (typeof window !== 'undefined') {
      const proceed = confirm(
        `سيتم فتح ${orders.length} تبويب جديد للطباعة.\n` +
        `تأكد من السماح بالنوافذ المنبثقة في المتصفح.\n\n` +
        `هل تريد المتابعة؟`
      );

      if (!proceed) {
        return;
      }
    }

    // إنشاء PDF لكل طلب وفتحه في تبويب منفصل
    const printPromises = orders.map(async (order, index) => {
      // تأخير بسيط لتجنب حجب النوافذ المنبثقة
      await new Promise(resolve => setTimeout(resolve, index * 200));

      const policyData = {
        companyName,
        orderNumber: order.orderNumber,
        recipient: order.recipient,
        phone: order.phone,
        address: order.address,
        city: order.city,
        region: order.region,
        cod: order.cod,
        merchant: order.merchant,
        date: order.date,
        notes: order.notes || '',
        barcode: order.id
      };

      let html: string;

      if (labelType === 'thermal') {
        html = createThermalLabelHTML(policyData, { width, height });
      } else {
        html = createStandardPolicyHTML(policyData, { width, height });
      }

      // محاولة إنشاء PDF عبر Playwright أولاً
      try {
        const response = await fetch('/api/pdf-playwright', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            html,
            filename: `label_${order.orderNumber}.pdf`,
            width,
            height
          }),
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);

          // فتح PDF في تبويب جديد
          const printWindow = window.open(url, '_blank');
          if (!printWindow) {
            console.warn(`فشل فتح تبويب للطلب ${order.orderNumber}`);
            // العودة إلى الطباعة المباشرة
            return generatePdfViaBrowserPrint(html, {
              filename: `label_${order.orderNumber}.pdf`,
              width,
              height
            });
          }

          // تنظيف URL بعد فترة
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 30000);

          return;
        }

        throw new Error('Playwright API failed');
      } catch (error) {
        console.warn(`Playwright failed for order ${order.orderNumber}, using browser print:`, error);

        // العودة إلى طباعة المتصفح
        return generatePdfViaBrowserPrint(html, {
          filename: `label_${order.orderNumber}.pdf`,
          width,
          height
        });
      }
    });

    // انتظار إكمال جميع العمليات
    await Promise.allSettled(printPromises);

    // رسالة نجاح
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        alert(`تم فتح ${orders.length} تبويب للطباعة.\nيمكنك الآن طباعة كل ملصق من تبويبه المخصص.`);
      }, 1000);
    }

  } catch (error) {
    console.error('Bulk print error:', error);
    throw new Error(`فشل في الطباعة المجمعة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
  }
}

/**
 * طباعة مجمعة سريعة - جميع الملصقات في نافذة واحدة
 */
export async function bulkPrintShippingLabelsInSingleWindow(
  orders: Array<{
    id: string;
    orderNumber: string | number;
    recipient: string;
    phone: string;
    address: string;
    city: string;
    region: string;
    cod: number;
    merchant: string;
    date: string;
    notes?: string;
  }>,
  options: {
    companyName: string;
    labelType: 'thermal' | 'standard';
    width?: number;
    height?: number;
  }
): Promise<void> {
  if (orders.length === 0) {
    throw new Error('لا توجد طلبات للطباعة');
  }

  const { companyName, labelType, width = 100, height = 150 } = options;

  try {
    // إنشاء HTML مجمع لجميع الملصقات
    const allLabelsHtml = orders.map(order => {
      const policyData = {
        companyName,
        orderNumber: order.orderNumber,
        recipient: order.recipient,
        phone: order.phone,
        address: order.address,
        city: order.city,
        region: order.region,
        cod: order.cod,
        merchant: order.merchant,
        date: order.date,
        notes: order.notes || '',
        barcode: order.id
      };

      if (labelType === 'thermal') {
        return createThermalLabelHTML(policyData, { width, height });
      } else {
        return createStandardPolicyHTML(policyData, { width, height });
      }
    }).join('<div style="page-break-after: always;"></div>');

    // إضافة CSS للطباعة المجمعة
    const combinedHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>ملصقات الشحن - ${orders.length} طلب</title>
    <style>
        @page { 
          size: ${width}mm ${height}mm; 
          margin: 2mm; 
        }
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        body { 
          font-family: 'Segoe UI', 'Tahoma', 'Arial', sans-serif; 
          direction: rtl; 
          color: #000;
          background: white;
        }
        @media print { 
          body { margin: 0; } 
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
        }
        .label-container {
          width: ${width}mm;
          height: ${height}mm;
          page-break-after: always;
          display: block;
        }
        .label-container:last-child {
          page-break-after: avoid;
        }
    </style>
</head>
<body>
    ${allLabelsHtml}
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 1000);
        };
    </script>
</body>
</html>`;

    // فتح نافذة واحدة مع جميع الملصقات
    return generatePdfViaBrowserPrint(combinedHtml, {
      filename: `bulk_labels_${orders.length}_orders.pdf`,
      width,
      height
    });

  } catch (error) {
    console.error('Bulk print single window error:', error);
    throw new Error(`فشل في الطباعة المجمعة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
  }
}
function showPrintInstructions(filename: string) {
  if (typeof window !== 'undefined') {
    const message = `
تعذر فتح نافذة الطباعة بسبب حاجب النوافذ المنبثقة.

للحصول على أفضل تجربة طباعة:
1. اسمح بالنوافذ المنبثقة لهذا الموقع
2. أو استخدم Ctrl+P لطباعة الصفحة الحالية
3. أو تم تحميل الملف كـ HTML: ${filename}

هل تريد المحاولة مرة أخرى؟
    `;

    if (confirm(message.trim())) {
      // إعادة المحاولة
      return true;
    }
  }
  return false;
}
function downloadAsHtml(html: string, filename: string) {
  try {
    const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('.pdf', '.html');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    console.log('تم تحميل الملف كـ HTML، يمكنك فتحه وطباعته من المتصفح');
  } catch (error) {
    console.error('HTML download failed:', error);
  }
}

/**
 * إنشاء معاينة HTML للـ PDF
 */
export function createPdfPreview(html: string): string {
  const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
  return URL.createObjectURL(blob);
}

/**
 * إنشاء معاينة PDF مدمجة في الموقع
 */
export async function createEmbeddedPdfPreview(
  html: string,
  options: { width?: number; height?: number } = {}
): Promise<string> {
  try {
    // محاولة إنشاء PDF عبر Playwright أولاً
    const response = await fetch('/api/pdf-playwright', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        filename: 'preview.pdf',
        width: options.width || 210,
        height: options.height || 297
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }

    throw new Error('Playwright API failed');
  } catch (error) {
    console.warn('PDF generation failed, using HTML preview:', error);

    // العودة إلى معاينة HTML
    return createPdfPreview(html);
  }
}

/**
 * إنشاء معاينة في modal/dialog
 */
export function createModalPreview(
  html: string,
  options: {
    title?: string;
    width?: number;
    height?: number;
    onPrint?: () => void;
    onDownload?: () => void;
  } = {}
): HTMLElement {
  // إنشاء modal container
  const modal = document.createElement('div');
  modal.className = 'pdf-preview-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    direction: rtl;
  `;

  // إنشاء محتوى المعاينة
  const previewContainer = document.createElement('div');
  previewContainer.style.cssText = `
    background: white;
    border-radius: 8px;
    width: 90%;
    height: 90%;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  `;

  // شريط العنوان والأزرار
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8f9fa;
    border-radius: 8px 8px 0 0;
  `;

  const title = document.createElement('h3');
  title.textContent = options.title || 'معاينة البوليصة';
  title.style.cssText = `
    margin: 0;
    font-size: 18px;
    font-weight: bold;
    color: #1f2937;
  `;

  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 12px;
    align-items: center;
  `;

  // زر الطباعة
  const printButton = document.createElement('button');
  printButton.innerHTML = '🖨️ طباعة';
  printButton.style.cssText = `
    padding: 8px 16px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  printButton.onclick = () => {
    if (options.onPrint) options.onPrint();
    document.body.removeChild(modal);
  };

  // زر التحميل
  const downloadButton = document.createElement('button');
  downloadButton.innerHTML = '📥 تحميل';
  downloadButton.style.cssText = `
    padding: 8px 16px;
    background: #059669;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  downloadButton.onclick = () => {
    if (options.onDownload) options.onDownload();
  };

  // زر الإغلاق
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '✕';
  closeButton.style.cssText = `
    padding: 8px 12px;
    background: #dc2626;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
  `;
  closeButton.onclick = () => {
    document.body.removeChild(modal);
  };

  buttonContainer.appendChild(printButton);
  buttonContainer.appendChild(downloadButton);
  buttonContainer.appendChild(closeButton);

  header.appendChild(title);
  header.appendChild(buttonContainer);

  // منطقة المعاينة
  const previewArea = document.createElement('div');
  previewArea.style.cssText = `
    flex: 1;
    padding: 20px;
    overflow: auto;
    background: #f5f5f5;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  `;

  // إنشاء iframe للمعاينة
  const previewFrame = document.createElement('div');
  previewFrame.style.cssText = `
    background: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    width: ${options.width ? options.width * 3.7795 : 794}px;
    height: ${options.height ? options.height * 3.7795 : 1123}px;
    overflow: hidden;
    transform: scale(0.8);
    transform-origin: top center;
  `;

  // إضافة المحتوى
  const styledHtml = `
    <div style="
      width: 100%;
      height: 100%;
      font-family: 'Segoe UI', 'Tahoma', 'Arial', sans-serif;
      direction: rtl;
      text-align: right;
      background: white;
      overflow: hidden;
    ">
      ${html}
    </div>
  `;

  previewFrame.innerHTML = styledHtml;
  previewArea.appendChild(previewFrame);

  previewContainer.appendChild(header);
  previewContainer.appendChild(previewArea);
  modal.appendChild(previewContainer);

  // إغلاق عند النقر خارج المحتوى
  modal.onclick = (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  };

  // إضافة إلى الصفحة
  document.body.appendChild(modal);

  return modal;
}

/**
 * دالة سريعة لإنشاء ملصق حراري
 * تقبل الآن customization في options
 */
export async function generateThermalLabel(
  data: {
    companyName: string;
    orderNumber: string | number;
    recipient: string;
    phone: string;
    address: string;
    cod: number;
    barcode?: string;
  },
  options: { width?: number; height?: number; customization?: any } = {},
  filename: string = 'thermal-label.pdf'
): Promise<void> {
  const html = createThermalLabelHTML(data, options);
  return generatePdf(html, filename, options);
}

/**
 * دالة سريعة لإنشاء بوليصة عادية
 */
export async function generateStandardPolicy(
  data: {
    companyName: string;
    orderNumber: string | number;
    recipient: string;
    phone: string;
    address: string;
    city: string;
    region: string;
    cod: number;
    merchant: string;
    date: string;
    notes?: string;
    barcode?: string;
  },
  options: { width?: number; height?: number } = {},
  filename: string = 'policy.pdf'
): Promise<void> {
  const html = createStandardPolicyHTML(data, options);
  return generatePdf(html, filename, options);
}

/**
 * توليد PDF للجداول باستخدام Browser Print - إرجاع Blob
 */
export async function generatePdfViaBrowserPrintBlob(html: string, options: any = {}): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      reject(new Error('تعذر فتح نافذة الطباعة'));
      return;
    }

    const printStyles = `
      @page { size: A4 landscape; margin: 10mm; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; }
      table { width: 100%; border-collapse: collapse; font-size: 10px; }
      th { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 8px 6px; text-align: center; font-weight: bold; }
      td { padding: 6px; text-align: center; border-bottom: 1px solid #e0e0e0; }
      tr:nth-child(even) { background-color: #f8f9fa; }
      tr:nth-child(odd) { background-color: #ffffff; }
      @media print { body { margin: 0; } .no-print { display: none !important; } }
    `;

    const printHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>${options.filename || 'document'}</title>
    <style>${printStyles}</style>
</head>
<body>
    ${html}
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
                setTimeout(() => window.close(), 1000);
            }, 500);
        };
    </script>
</body>
</html>`;

    try {
      printWindow.document.write(printHtml);
      printWindow.document.close();
      printWindow.focus();

      // إرجاع blob فارغ للتوافق مع الواجهة
      resolve(new Blob([''], { type: 'application/pdf' }));
    } catch (error) {
      printWindow.close();
      reject(error);
    }
  });
}

/**
 * تحميل PDF - للتوافق مع الكود القديم
 */
export function downloadPdf(blob: Blob, filename: string = 'document.pdf') {
  if (blob.size === 0) {
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * الحصول على URL للمعاينة - للتوافق مع الكود القديم
 */
export function getPdfPreviewUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}