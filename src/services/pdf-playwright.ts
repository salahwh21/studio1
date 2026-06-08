/**
 * PDF Service باستخدام Playwright - الحل الأمثل للعربية
 * مع Browser Pool للسرعة القصوى
 */

import { chromium, Browser, BrowserContext } from 'playwright';

export interface PlaywrightPdfOptions {
  width?: number;  // بالملليمتر
  height?: number; // بالملليمتر
  filename?: string;
}

// Browser Pool - يبقي المتصفح مفتوحاً للاستخدام المتكرر
let browserInstance: Browser | null = null;
let lastUsed: number = 0;
let browserLock: Promise<void> | null = null;
let cleanupTimeout: NodeJS.Timeout | null = null;
const BROWSER_TIMEOUT = 5 * 60 * 1000; // 5 دقائق

async function getBrowser(): Promise<Browser> {
  // انتظار أي عملية تشغيل سابقة
  if (browserLock) {
    await browserLock;
  }

  // إذا المتصفح موجود ومفتوح، نستخدمه
  if (browserInstance && browserInstance.isConnected()) {
    lastUsed = Date.now();
    scheduleCleanup();
    return browserInstance;
  }

  // فتح متصفح جديد مع lock
  let resolveLock: () => void;
  browserLock = new Promise(resolve => { resolveLock = resolve; });

  try {
    // تنظيف المتصفح القديم إذا كان موجوداً لكن غير متصل
    if (browserInstance) {
      try {
        await browserInstance.close();
      } catch { /* ignore */ }
      browserInstance = null;
    }

    console.log('🚀 Launching new Playwright browser...');
    browserInstance = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-default-apps',
        '--disable-extensions',
      ]
    });

    lastUsed = Date.now();
    scheduleCleanup();

    return browserInstance;
  } finally {
    browserLock = null;
    resolveLock!();
  }
}

function scheduleCleanup() {
  // إلغاء أي جدولة سابقة
  if (cleanupTimeout) {
    clearTimeout(cleanupTimeout);
  }

  // جدولة إغلاق تلقائي
  cleanupTimeout = setTimeout(async () => {
    if (browserInstance && Date.now() - lastUsed >= BROWSER_TIMEOUT) {
      console.log('⏰ Closing idle browser...');
      try {
        await browserInstance.close();
      } catch { /* ignore */ }
      browserInstance = null;
    }
  }, BROWSER_TIMEOUT + 1000);
}

/**
 * إنشاء PDF من HTML باستخدام Playwright - سريع جداً مع Browser Pool
 */
export async function generatePdfWithPlaywright(
  html: string,
  options: PlaywrightPdfOptions = {}
): Promise<Buffer> {
  let context: BrowserContext | null = null;
  let retries = 2;

  while (retries > 0) {
    try {
      const browser = await getBrowser();

      // التحقق من أن المتصفح لا يزال متصلاً
      if (!browser.isConnected()) {
        // إعادة تعيين المتصفح ومحاولة مرة أخرى
        browserInstance = null;
        retries--;
        continue;
      }

      // إنشاء context جديد (سريع جداً)
      context = await browser.newContext();
      const page = await context.newPage();

      // تعيين viewport
      await page.setViewportSize({ width: 1200, height: 800 });

      // تعيين المحتوى - استخدام load لانتظار الموارد الخارجية
      await page.setContent(html, {
        waitUntil: 'load',
        timeout: 15000
      });

      // انتظار إضافي لتنفيذ JavaScript (مهم للباركود)
      await page.waitForTimeout(500);

      // محاولة انتظار الباركود إذا كان موجوداً
      try {
        await page.waitForSelector('svg.barcode-target', { timeout: 2000 });
      } catch {
        // لا يوجد باركود، متابعة
      }

      // ضمان تطبيق الـ styles الخاصة بالطباعة
      await page.emulateMedia({ media: 'print' });

      // تحديد الإعدادات المثلى حسب الحجم
      let pdfOptions: any = {
        printBackground: true,
        preferCSSPageSize: true,
        timeout: 15000
      };

      // إعدادات مخصصة حسب الحجم
      if (options.width && options.height) {
        pdfOptions.width = `${options.width}mm`;
        pdfOptions.height = `${options.height}mm`;

        if (options.width <= 100 && options.height <= 150) {
          pdfOptions.margin = { top: '2mm', right: '2mm', bottom: '2mm', left: '2mm' };
        } else {
          pdfOptions.margin = { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' };
        }
      } else {
        pdfOptions.format = 'A4';
        pdfOptions.margin = { top: '15mm', right: '10mm', bottom: '15mm', left: '10mm' };
      }

      // إنشاء PDF
      const pdfBuffer = await page.pdf(pdfOptions);

      console.log('✅ PDF generated successfully');
      return pdfBuffer;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // إذا كان الخطأ بسبب إغلاق المتصفح، أعد المحاولة
      if (errorMessage.includes('closed') || errorMessage.includes('disconnected')) {
        console.warn('⚠️ Browser was closed, retrying...');
        browserInstance = null;
        retries--;

        if (retries > 0) {
          continue;
        }
      }

      console.error('❌ Playwright PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${errorMessage}`);
    } finally {
      // إغلاق الـ context فقط (المتصفح يبقى مفتوحاً)
      if (context) {
        try {
          await context.close();
        } catch { /* ignore */ }
      }
    }
  }

  throw new Error('PDF generation failed after retries');
}
