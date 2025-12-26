/**
 * PDF Service باستخدام Playwright - الحل الأمثل للعربية
 */

import { chromium } from 'playwright';

export interface PlaywrightPdfOptions {
  width?: number;  // بالملليمتر
  height?: number; // بالملليمتر
  filename?: string;
}

/**
 * إنشاء PDF من HTML باستخدام Playwright
 */
export async function generatePdfWithPlaywright(
  html: string,
  options: PlaywrightPdfOptions = {}
): Promise<Buffer> {
  let browser;

  try {
    console.log('Launching Playwright browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // تعيين المحتوى
    await page.setContent(html, {
      waitUntil: 'load',
      timeout: 30000
    });

    // ضمان تطبيق الـ styles الخاصة بالطباعة
    await page.emulateMedia({ media: 'print' });

    console.log('Generating PDF...');
    // إنشاء PDF
    const pdfBuffer = await page.pdf({
      width: options.width ? `${options.width}mm` : '210mm',
      height: options.height ? `${options.height}mm` : '297mm',
      printBackground: true,
      margin: {
        top: '5mm',
        right: '5mm',
        bottom: '5mm',
        left: '5mm'
      }
    });

    console.log('PDF generated successfully');
    return pdfBuffer;

  } catch (error) {
    console.error('Playwright PDF generation failed:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('Browser closed successfully');
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}

/**
 * إنشاء ملصق حراري بـ Playwright
 */
