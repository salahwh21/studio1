/**
 * API لإدارة القوالب المحفوظة
 * يستخدم قاعدة البيانات إذا توفرت، وإلا يعمل كـ passthrough
 */

import { NextRequest, NextResponse } from 'next/server';

// تخزين مؤقت في الذاكرة (للتطوير فقط)
let memoryStore: any[] = [];

// GET - جلب جميع القوالب المحفوظة (مع إمكانية التصفية حسب نوع المستند)
export async function GET(req: NextRequest) {
    try {
        // الحصول على نوع المستند من query params للتصفية
        const documentType = req.nextUrl.searchParams.get('documentType');

        // محاولة استخدام قاعدة البيانات
        const { DatabaseService } = await import('@/lib/db');

        let query = `
            SELECT 
                id,
                name,
                settings,
                html,
                created_at as "createdAt",
                updated_at as "updatedAt"
            FROM templates
        `;

        const params: any[] = [];

        // إضافة فلتر نوع المستند إذا تم تحديده
        if (documentType) {
            query += ` WHERE settings->>'documentType' = $1`;
            params.push(documentType);
        }

        query += ` ORDER BY created_at DESC`;

        const result = await DatabaseService.query(query, params);

        return NextResponse.json({ templates: result.rows });
    } catch (error: any) {
        console.warn('Database unavailable, using memory store:', error.message);

        // الحصول على نوع المستند للتصفية
        const documentType = req.nextUrl.searchParams.get('documentType');

        // تصفية القوالب من الذاكرة حسب نوع المستند
        let filteredTemplates = memoryStore;
        if (documentType) {
            filteredTemplates = memoryStore.filter(t =>
                t.settings?.documentType === documentType ||
                t.controls?.documentType === documentType
            );
        }

        return NextResponse.json({ templates: filteredTemplates });
    }
}

// POST - حفظ قالب جديد
export async function POST(req: NextRequest) {
    try {
        const { name, settings, html, userId } = await req.json();

        if (!name) {
            return NextResponse.json(
                { error: 'Missing required field: name' },
                { status: 400 }
            );
        }

        const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        try {
            // محاولة استخدام قاعدة البيانات
            const { DatabaseService } = await import('@/lib/db');
            const { nanoid } = await import('nanoid');

            const dbId = nanoid();

            await DatabaseService.query(`
                INSERT INTO templates (id, user_id, name, settings, html)
                VALUES ($1, $2, $3, $4, $5)
            `, [dbId, userId || null, name, JSON.stringify(settings || {}), html || '']);

            return NextResponse.json({
                success: true,
                template: { id: dbId, name, createdAt: now }
            });
        } catch (dbError: any) {
            console.warn('Database unavailable, using memory store:', dbError.message);

            // حفظ في الذاكرة
            const template = {
                id,
                name,
                settings: settings || {},
                html: html || '',
                createdAt: now
            };
            memoryStore.push(template);

            return NextResponse.json({
                success: true,
                template
            });
        }
    } catch (error: any) {
        console.error('Templates POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - تحديث قالب موجود
export async function PUT(req: NextRequest) {
    try {
        const { id, name, settings, html } = await req.json();

        if (!id) {
            return NextResponse.json(
                { error: 'Template ID required' },
                { status: 400 }
            );
        }

        try {
            // محاولة استخدام قاعدة البيانات
            const { DatabaseService } = await import('@/lib/db');

            const updates: string[] = [];
            const params: any[] = [];
            let paramIndex = 1;

            if (name) {
                updates.push(`name = $${paramIndex}`);
                params.push(name);
                paramIndex++;
            }

            if (settings) {
                updates.push(`settings = $${paramIndex}`);
                params.push(JSON.stringify(settings));
                paramIndex++;
            }

            if (html) {
                updates.push(`html = $${paramIndex}`);
                params.push(html);
                paramIndex++;
            }

            if (updates.length > 0) {
                params.push(id);
                await DatabaseService.query(`
                    UPDATE templates 
                    SET ${updates.join(', ')}, updated_at = NOW()
                    WHERE id = $${paramIndex}
                `, params);
            }

            return NextResponse.json({ success: true });
        } catch (dbError: any) {
            console.warn('Database unavailable, using memory store:', dbError.message);

            // تحديث في الذاكرة
            const index = memoryStore.findIndex(t => t.id === id);
            if (index !== -1) {
                if (name) memoryStore[index].name = name;
                if (settings) memoryStore[index].settings = settings;
                if (html) memoryStore[index].html = html;
            }

            return NextResponse.json({ success: true });
        }
    } catch (error: any) {
        console.error('Templates PUT error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - حذف قالب
export async function DELETE(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Template ID required' },
                { status: 400 }
            );
        }

        try {
            // محاولة استخدام قاعدة البيانات
            const { DatabaseService } = await import('@/lib/db');

            await DatabaseService.query(`DELETE FROM templates WHERE id = $1`, [id]);

            return NextResponse.json({ success: true });
        } catch (dbError: any) {
            console.warn('Database unavailable, using memory store:', dbError.message);

            // حذف من الذاكرة
            memoryStore = memoryStore.filter(t => t.id !== id);

            return NextResponse.json({ success: true });
        }
    } catch (error: any) {
        console.error('Templates DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
