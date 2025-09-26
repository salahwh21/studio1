
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { useReturnsStore, type MerchantSlip } from '@/store/returns-store';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';

export const MerchantPaymentsLog = () => {
    const { merchantSlips } = useReturnsStore();
    const { settings, formatCurrency } = useSettings();
    const { toast } = useToast();

    const handlePrint = (slip: MerchantSlip) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast({ variant: 'destructive', title: 'فشل الطباعة', description: 'يرجى السماح بفتح النوافذ المنبثقة.' });
            return;
        }

        const tableHeader = `
            <thead>
                <tr>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">#</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">رقم الطلب</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">المستلم</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">المبلغ المستحق</th>
                </tr>
            </thead>
        `;

        const tableRows = slip.orders.map((o, i) => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${i + 1}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${o.id}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${o.recipient}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(o.itemPrice)}</td>
            </tr>
        `).join('');

        const totalAmount = slip.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0);

        const tableFooter = `
            <tfoot>
                <tr>
                    <th colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">الإجمالي</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(totalAmount)}</th>
                </tr>
            </tfoot>
        `;
        
        const slipDate = new Date(slip.date).toLocaleDateString('ar-EG');
        const logoUrl = settings.login.reportsLogo || settings.login.headerLogo;

        const content = `
            <html>
                <head>
                    <title>كشف دفع لـ: ${slip.merchant}</title>
                    <style>
                        body { direction: rtl; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { padding: 8px; border: 1px solid #ddd; text-align: right; }
                        th { background-color: #f2f2f2; }
                        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                        .signatures { margin-top: 40px; display: flex; justify-content: space-between; }
                        .signature { border-top: 1px solid #000; padding-top: 5px; width: 200px; text-align: center; }
                        tfoot { background-color: #f9f9f9; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 50px;">` : `<h1>${settings.login.companyName || 'الشركة'}</h1>`}
                        <div>
                            <h2>كشف دفع للتاجر: ${slip.merchant}</h2>
                            <p>التاريخ: ${slipDate}</p>
                            <p>رقم الكشف: ${slip.id}</p>
                        </div>
                    </div>
                    <table>
                        ${tableHeader}
                        <tbody>${tableRows}</tbody>
                        ${tableFooter}
                    </table>
                    <div class="signatures">
                        <div class="signature">توقيع المستلم (التاجر)</div>
                        <div class="signature">توقيع الموظف المالي</div>
                    </div>
                </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>سجل دفعات التجار</CardTitle>
                        <CardDescription>
                            عرض وطباعة وتأكيد كشوفات الدفع التي تم إنشاؤها للتجار.
                        </CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm"><Icon name="FileDown" className="ml-2 h-4 w-4"/>تصدير PDF</Button>
                        <Button variant="outline" size="sm"><Icon name="FileSpreadsheet" className="ml-2 h-4 w-4"/>تصدير Excel</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center border-l">رقم الكشف</TableHead>
                            <TableHead className="text-center border-l">اسم التاجر</TableHead>
                            <TableHead className="text-center border-l">تاريخ الدفعة</TableHead>
                            <TableHead className="text-center border-l">المبلغ الإجمالي</TableHead>
                            <TableHead className="text-center border-l">الحالة</TableHead>
                            <TableHead className="text-center">إجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {merchantSlips.length === 0 ? (
                             <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">لم يتم إنشاء أي كشوفات دفع للتجار بعد.</TableCell>
                            </TableRow>
                        ) : (
                            merchantSlips.map(payment => (
                                <TableRow key={payment.id}>
                                    <TableCell className="text-center border-l font-mono">{payment.id}</TableCell>
                                    <TableCell className="text-center border-l">{payment.merchant}</TableCell>
                                    <TableCell className="text-center border-l">{new Date(payment.date).toLocaleDateString('ar-EG')}</TableCell>
                                    <TableCell className="text-center border-l font-bold">{formatCurrency(payment.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0))}</TableCell>
                                    <TableCell className="text-center border-l">
                                        <Badge className={payment.status === 'مدفوع' ? 'bg-green-100 text-green-800' : ''}>{payment.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="outline" size="sm" onClick={() => handlePrint(payment)}>
                                            <Icon name="Printer" className="ml-2 h-4 w-4" />
                                            طباعة الكشف
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
