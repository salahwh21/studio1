/**
 * API لتصدير الطلبات إلى Excel
 * Export Orders to Excel API
 */

import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db';
import ExcelJS from 'exceljs';

export async function POST(req: NextRequest) {
    try {
        const { ids, filters } = await req.json();

        let query = `
      SELECT 
        order_number as "رقم الطلب",
        recipient as "المستلم",
        phone as "الهاتف",
        address as "العنوان",
        city as "المدينة",
        region as "المنطقة",
        cod as "المبلغ",
        status as "الحالة",
        driver as "السائق",
        merchant as "التاجر",
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as "التاريخ"
      FROM orders
      WHERE 1=1
    `;

        const params: any[] = [];
        let paramIndex = 1;

        // فلترة حسب IDs محددة
        if (ids && ids.length > 0) {
            query += ` AND id = ANY($${paramIndex}::uuid[])`;
            params.push(ids);
            paramIndex++;
        }

        // فلترة حسب الحالة
        if (filters?.status) {
            query += ` AND status = $${paramIndex}`;
            params.push(filters.status);
            paramIndex++;
        }

        // فلترة حسب التاريخ
        if (filters?.dateFrom) {
            query += ` AND created_at >= $${paramIndex}`;
            params.push(new Date(filters.dateFrom));
            paramIndex++;
        }

        if (filters?.dateTo) {
            query += ` AND created_at <= $${paramIndex}`;
            params.push(new Date(filters.dateTo));
            paramIndex++;
        }

        // فلترة حسب التاجر
        if (filters?.merchant) {
            query += ` AND merchant = $${paramIndex}`;
            params.push(filters.merchant);
            paramIndex++;
        }

        // فلترة حسب السائق
        if (filters?.driver) {
            query += ` AND driver = $${paramIndex}`;
            params.push(filters.driver);
            paramIndex++;
        }

        query += ` ORDER BY created_at DESC`;

        const result = await DatabaseService.query(query, params);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'لا توجد بيانات للتصدير' },
                { status: 400 }
            );
        }

        // إنشاء ملف Excel
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'نظام إدارة الطلبات';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet('الطلبات', {
            views: [{ rightToLeft: true }]
        });

        // إضافة الرؤوس
        const headers = Object.keys(result.rows[0]);
        worksheet.columns = headers.map(header => ({
            header: header,
            key: header,
            width: 20
        }));

        // تنسيق الرؤوس
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, size: 12 };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        // إضافة البيانات
        result.rows.forEach((row: any) => {
            worksheet.addRow(row);
        });

        // تنسيق جميع الخلايا
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { horizontal: 'right', vertical: 'middle' };
            });
        });

        // تحويل إلى buffer
        const buffer = await workbook.xlsx.writeBuffer();

        const filename = `orders_${new Date().toISOString().split('T')[0]}.xlsx`;

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });
    } catch (error: any) {
        console.error('Export error:', error);
        return NextResponse.json(
            { error: 'فشل التصدير', details: error.message },
            { status: 500 }
        );
    }
}

// GET للمعلومات
export async function GET() {
    return NextResponse.json({
        message: 'Export Orders API',
        methods: ['POST'],
        usage: {
            endpoint: '/api/export',
            method: 'POST',
            body: {
                ids: ['uuid1', 'uuid2'],
                filters: {
                    status: 'string (optional)',
                    dateFrom: 'ISO date string (optional)',
                    dateTo: 'ISO date string (optional)',
                    merchant: 'string (optional)',
                    driver: 'string (optional)'
                }
            }
        }
    });
}
