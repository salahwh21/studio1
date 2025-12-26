/**
 * API لإنشاء PDF باستخدام Playwright
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePdfWithPlaywright } from '@/services/pdf-playwright';

export async function POST(request: NextRequest) {
  try {
    let html, filename, width, height;

    const contentType = request.headers.get('content-type') || '';

    // التحقق من نوع البيانات ودعم النوعين: JSON و FormData
    if (contentType.includes('application/json')) {
      const body = await request.json();
      html = body.html;
      filename = body.filename;
      width = body.width;
      height = body.height;
    } else {
      // حالة Form Submission (للتحميل المباشر)
      const formData = await request.formData();
      html = formData.get('html') as string;
      filename = formData.get('filename') as string;
      width = Number(formData.get('width'));
      height = Number(formData.get('height'));
    }

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    console.log('PDF generation request:', { filename, width, height });

    // إنشاء PDF
    const pdfBuffer = await generatePdfWithPlaywright(html, {
      width,
      height,
      filename
    });

    console.log('PDF generated successfully, size:', pdfBuffer.length);

    // تحديد وضع العرض: معاينة (inline) أم تحميل (attachment)
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode');
    const disposition = mode === 'download' ? 'attachment' : 'inline';

    console.log(`Serving PDF in ${disposition} mode`);

    // إرجاع PDF
    const uint8Array = new Uint8Array(pdfBuffer);
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="${filename || 'document.pdf'}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);

    // إرجاع تفاصيل الخطأ للتطوير
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';

    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'PDF Playwright API is working',
    methods: ['POST'],
    usage: {
      endpoint: '/api/pdf-playwright',
      method: 'POST',
      body: {
        html: 'HTML content to convert',
        filename: 'optional filename',
        width: 'optional width in mm',
        height: 'optional height in mm'
      }
    }
  });
}