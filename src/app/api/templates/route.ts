/**
 * API لإدارة قوالب PDF - قراءة وحفظ القوالب
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET - قراءة محتوى القالب
export async function GET(
  request: NextRequest
) {
  try {
    const templateName = request.nextUrl.searchParams.get('template');
    
    if (!templateName) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }
    
    // التحقق من صحة اسم القالب
    if (!['policy', 'report'].includes(templateName)) {
      return NextResponse.json(
        { error: 'Invalid template name' },
        { status: 400 }
      );
    }

    // قراءة القالب
    const templatePath = path.join(process.cwd(), 'public', 'print-templates', `${templateName}.html`);
    
    try {
      const content = await fs.readFile(templatePath, 'utf-8');
      
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        }
      });
    } catch (fileError) {
      console.error('Template file not found:', templatePath);
      return NextResponse.json(
        { error: 'Template file not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Template read error:', error);
    return NextResponse.json(
      { error: 'Failed to read template' },
      { status: 500 }
    );
  }
}

// PUT - حفظ محتوى القالب
export async function PUT(
  request: NextRequest
) {
  try {
    const templateName = request.nextUrl.searchParams.get('template');
    
    if (!templateName) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }
    
    // التحقق من صحة اسم القالب
    if (!['policy', 'report'].includes(templateName)) {
      return NextResponse.json(
        { error: 'Invalid template name' },
        { status: 400 }
      );
    }

    const { content } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid content' },
        { status: 400 }
      );
    }

    // حفظ القالب
    const templatePath = path.join(process.cwd(), 'public', 'print-templates', `${templateName}.html`);
    
    // إنشاء نسخة احتياطية أولاً
    const backupPath = path.join(process.cwd(), 'public', 'print-templates', `${templateName}.backup.html`);
    
    try {
      // قراءة المحتوى الحالي للنسخة الاحتياطية
      const currentContent = await fs.readFile(templatePath, 'utf-8');
      await fs.writeFile(backupPath, currentContent, 'utf-8');
    } catch (backupError) {
      console.warn('Could not create backup:', backupError);
    }

    // حفظ المحتوى الجديد
    await fs.writeFile(templatePath, content, 'utf-8');

    console.log(`Template ${templateName} saved successfully`);

    return NextResponse.json({
      success: true,
      message: 'Template saved successfully',
      templateName,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Template save error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - استعادة النسخة الاحتياطية
export async function DELETE(
  request: NextRequest
) {
  try {
    const templateName = request.nextUrl.searchParams.get('template');
    
    if (!templateName) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }
    
    if (!['policy', 'report'].includes(templateName)) {
      return NextResponse.json(
        { error: 'Invalid template name' },
        { status: 400 }
      );
    }

    const templatePath = path.join(process.cwd(), 'public', 'print-templates', `${templateName}.html`);
    const backupPath = path.join(process.cwd(), 'public', 'print-templates', `${templateName}.backup.html`);
    
    try {
      // قراءة النسخة الاحتياطية
      const backupContent = await fs.readFile(backupPath, 'utf-8');
      
      // استعادة النسخة الاحتياطية
      await fs.writeFile(templatePath, backupContent, 'utf-8');
      
      console.log(`Template ${templateName} restored from backup`);

      return NextResponse.json({
        success: true,
        message: 'Template restored from backup',
        templateName
      });
      
    } catch (restoreError) {
      return NextResponse.json(
        { error: 'Backup file not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Template restore error:', error);
    return NextResponse.json(
      { error: 'Failed to restore template' },
      { status: 500 }
    );
  }
}