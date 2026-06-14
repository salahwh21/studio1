/**
 * PDF Service - خدمة PDF بسيطة
 * دعم عربي كامل مع طباعة المتصفح
 * يستخدم القوالب المحفوظة من قاعدة البيانات
 */

/**
 * تحميل PDF من Blob
 */
export function downloadPdf(blob: Blob, filename: string): void {
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
 * فتح PDF في تبويب جديد
 */
export async function openPdfInNewTab(
  html: string,
  filename: string = 'document.pdf',
  options: { width?: number; height?: number } = {}
): Promise<void> {
  // فتح نافذة منبثقة فوراً
  const pdfWindow = window.open('', 'printWindow', 'width=900,height=700,scrollbars=yes,resizable=yes');
  if (!pdfWindow) {
    throw new Error('يرجى السماح بالنوافذ المنبثقة في المتصفح');
  }

  // عرض مؤشر تحميل
  pdfWindow.document.write(`
    <html><head><title>جاري التحميل...</title></head>
    <body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Tahoma;direction:rtl;">
      <div style="text-align:center;">
        <div style="width:40px;height:40px;border:4px solid #e5e5e5;border-top:4px solid #3b82f6;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto;"></div>
        <p style="margin-top:16px;color:#666;">جاري تجهيز البوليصة...</p>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </body></html>
  `);

  try {
    const response = await fetch('/api/pdf-playwright', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html,
        filename,
        width: options.width || 100,
        height: options.height || 150
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      pdfWindow.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } else {
      pdfWindow.document.body.innerHTML = `
        <div style="text-align:center;padding:40px;font-family:Tahoma;direction:rtl;">
          <h2 style="color:#dc2626;">⚠️ فشل في تجهيز الملف</h2>
          <button onclick="window.close()" style="margin-top:20px;padding:10px 20px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;">إغلاق</button>
        </div>
      `;
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    pdfWindow.document.body.innerHTML = `
      <div style="text-align:center;padding:40px;font-family:Tahoma;direction:rtl;">
        <h2 style="color:#dc2626;">⚠️ حدث خطأ</h2>
        <button onclick="window.close()" style="margin-top:20px;padding:10px 20px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;">إغلاق</button>
      </div>
    `;
  }
}

/**
 * دالة موحدة لإنشاء PDF - تُرجع Blob للتوافق مع الكود الموجود
 * تدعم صياغتين:
 * 1. generatePdf(html, { width, height, filename, margin }) - الصيغة القديمة
 * 2. generatePdf(html, filename, { width, height }) - الصيغة الجديدة
 */
export async function generatePdf(
  html: string,
  optionsOrFilename: string | { width?: string | number; height?: string | number; filename?: string; margin?: any } = {},
  extraOptions?: { width?: number; height?: number }
): Promise<Blob> {
  // تحديد الخيارات بناءً على نوع المعامل الثاني
  let filename: string;
  let width: number;
  let height: number;

  if (typeof optionsOrFilename === 'string') {
    // الصيغة الجديدة: generatePdf(html, filename, options)
    filename = optionsOrFilename;
    width = extraOptions?.width || 210;
    height = extraOptions?.height || 297;
  } else {
    // الصيغة القديمة: generatePdf(html, { width, height, filename })
    filename = optionsOrFilename.filename || 'document.pdf';
    // تحويل القيم من string إلى number إذا لزم الأمر
    const parseSize = (val: string | number | undefined, defaultVal: number): number => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const num = parseFloat(val.replace('mm', ''));
        return isNaN(num) ? defaultVal : num;
      }
      return defaultVal;
    };
    width = parseSize(optionsOrFilename.width, 210);
    height = parseSize(optionsOrFilename.height, 297);
  }

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
        width,
        height
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      return blob;
    }

    throw new Error('Playwright API failed');
  } catch (error) {
    console.warn('Playwright failed, using browser print fallback:', error);

    // العودة إلى طباعة المتصفح (الحل الأساسي)
    try {
      await generatePdfViaBrowserPrint(html, { filename, width, height });
      // إرجاع blob فارغ لأن الطباعة تمت
      return new Blob([], { type: 'application/pdf' });
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
        console.warn('Popup blocked, downloading as HTML');
        downloadAsHtml(html, options.filename || 'document.html');
        resolve();
        return;
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
 * تحميل HTML للطباعة
 */
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
 * إنشاء معاينة PDF - ترجع Data URL للعرض في iframe
 */
export async function generatePdfPreview(
  html: string,
  options: { width?: number; height?: number } = {}
): Promise<string> {
  try {
    const response = await fetch('/api/pdf-playwright', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html,
        width: options.width || 210,
        height: options.height || 297,
        filename: 'preview.pdf'
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }

    throw new Error('Failed to generate preview');
  } catch (error) {
    console.warn('PDF preview failed, using HTML preview:', error);
    // العودة لمعاينة HTML
    const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
    return URL.createObjectURL(blob);
  }
}

/**
 * إنشاء معاينة HTML للـ PDF
 */
export function createPdfPreview(html: string): string {
  const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
  return URL.createObjectURL(blob);
}