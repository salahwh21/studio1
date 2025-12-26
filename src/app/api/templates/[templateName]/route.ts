import { NextRequest, NextResponse } from 'next/server';

// قراءة ملف البوليصة الفعلي
export async function GET(
  request: NextRequest,
  { params }: { params: { templateName: string } }
) {
  try {
    const { templateName } = params;
    
    return NextResponse.json({
      success: false,
      error: 'خدمة القوالب غير متاحة',
      message: 'تم إزالة template-parser. استخدم المحرر البسيط بدلاً من ذلك.',
      templateName
    }, { status: 410 });
  } catch (error) {
    console.error('خطأ في قراءة القالب:', error);
    return NextResponse.json({ 
      error: 'فشل في قراءة القالب', 
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// حفظ التغييرات في ملف البوليصة الفعلي
export async function POST(
  request: NextRequest,
  { params }: { params: { templateName: string } }
) {
  try {
    const { templateName } = params;
    
    return NextResponse.json({
      success: false,
      error: 'خدمة القوالب غير متاحة',
      message: 'تم إزالة template-parser. استخدم المحرر البسيط بدلاً من ذلك.',
      templateName
    }, { status: 410 });
  } catch (error) {
    console.error('خطأ في حفظ القالب:', error);
    return NextResponse.json({ 
      error: 'فشل في حفظ القالب', 
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// استعادة النسخة الاحتياطية
export async function DELETE(
  request: NextRequest,
  { params }: { params: { templateName: string } }
) {
  try {
    const { templateName } = params;
    
    return NextResponse.json({
      success: false,
      error: 'خدمة القوالب غير متاحة',
      message: 'تم إزالة template-parser. استخدم المحرر البسيط بدلاً من ذلك.',
      templateName
    }, { status: 410 });
  } catch (error) {
    console.error('خطأ في استعادة النسخة الاحتياطية:', error);
    return NextResponse.json({ 
      error: 'فشل في استعادة النسخة الاحتياطية',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}