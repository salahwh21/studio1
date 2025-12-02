
'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrdersStore } from '@/store/orders-store';
import { useUsersStore } from '@/store/user-store';
import { useSettings } from '@/contexts/SettingsContext';
import Icon from '@/components/icon';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker } from '@/components/date-range-picker';
import type { DateRange } from 'react-day-picker';
import { useFinancialsStore } from '@/store/financials-store';
import * as XLSX from 'xlsx';
import { exportToPDF, type PDFExportOptions } from '@/lib/pdf-export-utils';
import { ExportSettingsDialog, type ExportSettings, type ExportField } from '@/components/export-settings-dialog';

export const PrepareMerchantPayments = () => {
    const { toast } = useToast();
    const { users } = useUsersStore();
    const { orders } = useOrdersStore();
    const { settings, formatCurrency } = useSettings();
    const { addMerchantPaymentSlip } = useFinancialsStore();
    
    const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [adjustments, setAdjustments] = useState<Record<string, number>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [exportSettingsOpen, setExportSettingsOpen] = useState(false);
    const [printSettingsOpen, setPrintSettingsOpen] = useState(false);
    const [excelSettingsOpen, setExcelSettingsOpen] = useState(false);
    const [exportSettings, setExportSettings] = useState<ExportSettings | null>(null);

    const merchants = useMemo(() => users.filter(u => u.roleId === 'merchant'), [users]);
    
    const merchantsWithCounts = useMemo(() => {
        return merchants.map(merchant => {
            const count = orders.filter(o => 
                o.merchant === merchant.storeName && 
                o.status === 'تم التوصيل'
            ).length;
            return { ...merchant, payableOrdersCount: count };
        });
    }, [merchants, orders]);

    const selectedMerchant = merchants.find(m => m.id === selectedMerchantId);

    const ordersForPayment = useMemo(() => {
        if (!selectedMerchant) return [];

        const lowercasedQuery = searchQuery.toLowerCase();

        return orders.filter(o => 
            o.merchant === selectedMerchant.storeName && 
            o.status === 'تم التوصيل' &&
            (searchQuery === '' || 
             o.id.toLowerCase().includes(lowercasedQuery) ||
             o.recipient.toLowerCase().includes(lowercasedQuery)
            ) &&
            (!dateRange?.from || new Date(o.date) >= dateRange.from) &&
            (!dateRange?.to || new Date(o.date) <= dateRange.to)
        );
    }, [orders, selectedMerchant, searchQuery, dateRange]);
    
    const totals = useMemo(() => {
        const selectedOrders = ordersForPayment.filter(o => selectedOrderIds.includes(o.id));
        
        return selectedOrders.reduce((acc, order) => {
            const adjustment = adjustments[order.id] || 0;
            const itemPrice = order.itemPrice || 0;
            const netAmount = itemPrice + adjustment;
            
            acc.cod += order.cod || 0;
            acc.deliveryFee += order.deliveryFee || 0;
            acc.totalItemPrice += itemPrice;
            acc.totalAdjustments += adjustment;
            acc.totalNet += netAmount;
            return acc;
        }, { cod: 0, deliveryFee: 0, totalItemPrice: 0, totalAdjustments: 0, totalNet: 0 });

    }, [ordersForPayment, selectedOrderIds, adjustments]);

    const handleCreatePaymentSlip = () => {
        if (!selectedMerchant || selectedOrderIds.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء اختيار تاجر وطلب واحد على الأقل.'});
            return;
        }

        const ordersToProcess = ordersForPayment.filter(o => selectedOrderIds.includes(o.id));
        
        addMerchantPaymentSlip({
            merchantName: selectedMerchant.storeName || selectedMerchant.name,
            date: new Date().toISOString(),
            itemCount: ordersToProcess.length,
            status: 'جاهز للتسليم',
            orders: ordersToProcess
        });

        toast({
            title: 'تم إنشاء كشف الدفع',
            description: `تم إنشاء كشف دفع للتاجر ${selectedMerchant.name} بالمبلغ الصافي ${formatCurrency(totals.totalNet)}.`
        });
        setSelectedOrderIds([]);
        setAdjustments({});
    }

    const handleSelectAll = (checked: boolean) => {
        setSelectedOrderIds(checked ? ordersForPayment.map(o => o.id) : []);
    };
    
    const handleSelectRow = (orderId: string, isChecked: boolean) => {
        setSelectedOrderIds(prev => 
            isChecked ? [...prev, orderId] : prev.filter(id => id !== orderId)
        );
    };

    const handleAdjustmentChange = (orderId: string, value: string) => {
        const numericValue = parseFloat(value) || 0;
        setAdjustments(prev => ({
            ...prev,
            [orderId]: numericValue,
        }));
    };
    
    const handlePrintClick = () => {
        const ordersToPrint = ordersForPayment.filter(o => selectedOrderIds.includes(o.id));
        if (ordersToPrint.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء تحديد طلب واحد على الأقل للطباعة.' });
            return;
        }
        setPrintSettingsOpen(true);
    };

    const handlePrint = (printSettings: ExportSettings) => {
        const ordersToPrint = ordersForPayment.filter(o => selectedOrderIds.includes(o.id));
        if (ordersToPrint.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء تحديد طلب واحد على الأقل للطباعة.' });
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast({ variant: 'destructive', title: 'فشل الطباعة', description: 'يرجى السماح بفتح النوافذ المنبثقة.' });
            return;
        }

        // Build headers based on selected fields
        const headers: string[] = [];
        if (printSettings.fields.index) headers.push('#');
        if (printSettings.fields.orderId) headers.push('رقم الطلب');
        if (printSettings.fields.recipient) headers.push('المستلم');
        if (printSettings.fields.date) headers.push('تاريخ التوصيل');
        if (printSettings.fields.cod) headers.push('قيمة التحصيل');
        if (printSettings.fields.deliveryFee) headers.push('أجور التوصيل');
        if (printSettings.fields.itemPrice) headers.push('المستحق للتاجر');
        if (printSettings.fields.adjustments) headers.push('تعديلات');
        if (printSettings.fields.netAmount) headers.push('الصافي المستحق');

        const tableHeader = `<thead><tr>${headers.map(h => `<th style="padding: 8px; border: 1px solid #d1d5db; text-align: center; background: #f9fafb; font-weight: bold; font-size: 12px;">${h}</th>`).join('')}</tr></thead>`;
        
        const tableRows = ordersToPrint.map((o, i) => {
            const adjustment = adjustments[o.id] || 0;
            const netAmount = (o.itemPrice || 0) + adjustment;
            const cells: string[] = [];
            if (printSettings.fields.index) cells.push(`${i + 1}`);
            if (printSettings.fields.orderId) cells.push(o.id);
            if (printSettings.fields.recipient) cells.push(o.recipient);
            if (printSettings.fields.date) cells.push(o.date);
            if (printSettings.fields.cod) cells.push(formatCurrency(o.cod));
            if (printSettings.fields.deliveryFee) cells.push(formatCurrency(o.deliveryFee));
            if (printSettings.fields.itemPrice) cells.push(formatCurrency(o.itemPrice));
            if (printSettings.fields.adjustments) cells.push(formatCurrency(adjustment));
            if (printSettings.fields.netAmount) cells.push(formatCurrency(netAmount));
            return `<tr>${cells.map(cell => `<td style="padding: 6px; border: 1px solid #d1d5db; text-align: right; font-size: 12px;">${cell}</td>`).join('')}</tr>`;
        }).join('');

        const totalCOD = ordersToPrint.reduce((sum, o) => sum + (o.cod || 0), 0);
        const totalDeliveryFee = ordersToPrint.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
        const totalItemPrice = ordersToPrint.reduce((sum, o) => sum + (o.itemPrice || 0), 0);
        const totalAdjustments = ordersToPrint.reduce((sum, o) => sum + (adjustments[o.id] || 0), 0);
        const totalNet = totalItemPrice + totalAdjustments;

        const footerCells: string[] = [];
        let colspan = 0;
        if (printSettings.fields.index) { footerCells.push(''); colspan++; }
        if (printSettings.fields.orderId) { footerCells.push('الإجمالي'); colspan++; }
        if (printSettings.fields.recipient) { footerCells.push(''); colspan++; }
        if (printSettings.fields.date) { footerCells.push(''); colspan++; }
        if (printSettings.fields.cod) footerCells.push(formatCurrency(totalCOD));
        if (printSettings.fields.deliveryFee) footerCells.push(formatCurrency(totalDeliveryFee));
        if (printSettings.fields.itemPrice) footerCells.push(formatCurrency(totalItemPrice));
        if (printSettings.fields.adjustments) footerCells.push(formatCurrency(totalAdjustments));
        if (printSettings.fields.netAmount) footerCells.push(formatCurrency(totalNet));

        const tableFooter = `<tfoot><tr>${footerCells.map((cell, idx) => `<${idx === 1 ? 'th' : 'td'} colspan="${idx === 1 ? colspan : 1}" style="padding: 8px; border: 1px solid #d1d5db; text-align: right; font-weight: bold; font-size: 12px; background: #f9fafb;">${cell}</${idx === 1 ? 'th' : 'td'}>`).join('')}</tr></tfoot>`;
        
        const slipDate = new Date().toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const logoUrl = settings.login.reportsLogo || settings.login.headerLogo;

        const content = `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>كشف دفع لـ: ${selectedMerchant?.name || 'تاجر'}</title>
                <style>
                    @media print {
                        @page { size: A4; margin: 1.5cm; }
                    }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        direction: rtl; 
                        font-family: 'Segoe UI', 'Tahoma', 'Arial Unicode MS', 'Arial', sans-serif; 
                        padding: 20px;
                        color: #000000;
                    }
                    .header { 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: flex-start; 
                        margin-bottom: 20px; 
                        padding-bottom: 10px; 
                        border-bottom: 1px solid #d1d5db; 
                    }
                    .header img { height: 50px; max-width: 150px; object-fit: contain; }
                    .header-info h2 { font-size: 18px; font-weight: bold; margin-bottom: 6px; color: #000000; }
                    .header-info p { font-size: 12px; color: #6b7280; margin: 2px 0; }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 15px 0; 
                        font-size: 12px;
                    }
                    th, td { 
                        padding: 8px 6px; 
                        border: 1px solid #d1d5db; 
                        text-align: right; 
                    }
                    th { 
                        background-color: #f9fafb; 
                        font-weight: bold; 
                        font-size: 12px;
                        color: #000000;
                    }
                    td { 
                        font-size: 12px;
                        color: #000000;
                    }
                    tbody tr { background-color: #ffffff; }
                    tfoot { 
                        background-color: #f9fafb; 
                        font-weight: bold; 
                    }
                    tfoot th, tfoot td { 
                        background-color: #f9fafb;
                        font-size: 12px;
                    }
                    .signatures { 
                        margin-top: 50px; 
                        display: flex; 
                        justify-content: space-between; 
                        padding-top: 20px;
                        border-top: 1px solid #d1d5db;
                    }
                    .signature { 
                        border-top: 1px solid #000000; 
                        padding-top: 50px; 
                        width: 250px; 
                        text-align: center; 
                        font-size: 13px;
                        font-weight: 500;
                        color: #000000;
                    }
                    ${printSettings.showNotes && printSettings.notes ? `
                    .notes {
                        margin-top: 25px;
                        padding: 15px;
                        background: #f9fafb;
                        border: 1px solid #d1d5db;
                        border-radius: 4px;
                    }
                    .notes h3 {
                        font-size: 15px;
                        font-weight: bold;
                        margin-bottom: 10px;
                        color: #000000;
                    }
                    .notes p {
                        font-size: 13px;
                        line-height: 1.6;
                        color: #374151;
                    }
                    ` : ''}
                </style>
            </head>
            <body>
                <div class="header">
                    ${logoUrl ? `<img src="${logoUrl}" alt="Logo" />` : `<div style="font-size: 24px; font-weight: bold; color: #000000;">${settings.login.companyName || 'الشركة'}</div>`}
                    <div class="header-info">
                        <h2>كشف دفع للتاجر: ${selectedMerchant?.storeName || selectedMerchant?.name || 'تاجر'}</h2>
                        <p>التاريخ: ${slipDate}</p>
                        <p>عدد الطلبات: ${ordersToPrint.length} طلب</p>
                    </div>
                </div>
                <table>
                    ${tableHeader}
                    <tbody>${tableRows}</tbody>
                    ${tableFooter}
                </table>
                ${printSettings.showNotes && printSettings.notes ? `
                <div class="notes">
                    <h3>ملاحظات:</h3>
                    <p>${printSettings.notes}</p>
                </div>
                ` : ''}
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

    const handleExportExcelClick = () => {
        const ordersToExport = ordersForPayment.filter(o => selectedOrderIds.includes(o.id));
        if (ordersToExport.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء تحديد طلب واحد على الأقل للتصدير.' });
            return;
        }
        setExcelSettingsOpen(true);
    };

    const handleExportExcel = (excelSettings: ExportSettings) => {
        const ordersToExport = ordersForPayment.filter(o => selectedOrderIds.includes(o.id));
        if (ordersToExport.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء تحديد طلب واحد على الأقل للتصدير.' });
            return;
        }

        try {
            const data = ordersToExport.map((order, index) => {
                const adjustment = adjustments[order.id] || 0;
                const netAmount = (order.itemPrice || 0) + adjustment;
                const row: Record<string, any> = {};
                if (excelSettings.fields.index) row['#'] = index + 1;
                if (excelSettings.fields.orderId) row['رقم الطلب'] = order.id;
                if (excelSettings.fields.recipient) row['المستلم'] = order.recipient;
                if (excelSettings.fields.date) row['تاريخ التوصيل'] = order.date;
                if (excelSettings.fields.cod) row['قيمة التحصيل'] = order.cod || 0;
                if (excelSettings.fields.deliveryFee) row['أجور التوصيل'] = order.deliveryFee || 0;
                if (excelSettings.fields.itemPrice) row['المستحق للتاجر'] = order.itemPrice || 0;
                if (excelSettings.fields.adjustments) row['تعديلات'] = adjustment;
                if (excelSettings.fields.netAmount) row['الصافي المستحق'] = netAmount;
                return row;
            });

            const totalCOD = ordersToExport.reduce((sum, o) => sum + (o.cod || 0), 0);
            const totalDeliveryFee = ordersToExport.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
            const totalItemPrice = ordersToExport.reduce((sum, o) => sum + (o.itemPrice || 0), 0);
            const totalAdjustments = ordersToExport.reduce((sum, o) => sum + (adjustments[o.id] || 0), 0);
            const totalNet = totalItemPrice + totalAdjustments;

            const totalRow: Record<string, any> = {};
            if (excelSettings.fields.index) totalRow['#'] = '';
            if (excelSettings.fields.orderId) totalRow['رقم الطلب'] = 'الإجمالي';
            if (excelSettings.fields.recipient) totalRow['المستلم'] = '';
            if (excelSettings.fields.date) totalRow['تاريخ التوصيل'] = '';
            if (excelSettings.fields.cod) totalRow['قيمة التحصيل'] = totalCOD;
            if (excelSettings.fields.deliveryFee) totalRow['أجور التوصيل'] = totalDeliveryFee;
            if (excelSettings.fields.itemPrice) totalRow['المستحق للتاجر'] = totalItemPrice;
            if (excelSettings.fields.adjustments) totalRow['تعديلات'] = totalAdjustments;
            if (excelSettings.fields.netAmount) totalRow['الصافي المستحق'] = totalNet;
            data.push(totalRow);

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'كشف الدفع');

            const fileName = `كشف_دفع_${selectedMerchant?.storeName || selectedMerchant?.name || 'تاجر'}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);

            toast({
                title: 'تم التصدير بنجاح',
                description: `تم تصدير ${ordersToExport.length} طلب إلى ملف Excel.`
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'خطأ في التصدير',
                description: 'حدث خطأ أثناء تصدير البيانات.'
            });
        }
    };

    const exportFields: ExportField[] = [
        { id: 'index', label: 'الرقم التسلسلي', defaultChecked: true },
        { id: 'orderId', label: 'رقم الطلب', defaultChecked: true },
        { id: 'recipient', label: 'المستلم', defaultChecked: true },
        { id: 'date', label: 'تاريخ التوصيل', defaultChecked: false },
        { id: 'cod', label: 'قيمة التحصيل', defaultChecked: true },
        { id: 'deliveryFee', label: 'أجور التوصيل', defaultChecked: true },
        { id: 'itemPrice', label: 'المستحق للتاجر', defaultChecked: true },
        { id: 'adjustments', label: 'تعديلات', defaultChecked: true },
        { id: 'netAmount', label: 'الصافي المستحق', defaultChecked: true },
    ];

    const handleExportPDFClick = () => {
        const ordersToExport = ordersForPayment.filter(o => selectedOrderIds.includes(o.id));
        if (ordersToExport.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء تحديد طلب واحد على الأقل للتصدير.' });
            return;
        }
        setExportSettingsOpen(true);
    };

    const handleExportPDF = async (exportSettings: ExportSettings) => {
        const ordersToExport = ordersForPayment.filter(o => selectedOrderIds.includes(o.id));
        if (ordersToExport.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء تحديد طلب واحد على الأقل للتصدير.' });
            return;
        }

        try {
            const totalCOD = ordersToExport.reduce((sum, o) => sum + (o.cod || 0), 0);
            const totalDeliveryFee = ordersToExport.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
            const totalItemPrice = ordersToExport.reduce((sum, o) => sum + (o.itemPrice || 0), 0);
            const totalAdjustments = ordersToExport.reduce((sum, o) => sum + (adjustments[o.id] || 0), 0);
            const totalNet = totalItemPrice + totalAdjustments;

            const slipDate = new Date().toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const logoUrl = settings.login.reportsLogo || settings.login.headerLogo;

            // Build headers based on selected fields
            const headers: string[] = [];
            if (exportSettings.fields.index) headers.push('#');
            if (exportSettings.fields.orderId) headers.push('رقم الطلب');
            if (exportSettings.fields.recipient) headers.push('المستلم');
            if (exportSettings.fields.date) headers.push('تاريخ التوصيل');
            if (exportSettings.fields.cod) headers.push('قيمة التحصيل');
            if (exportSettings.fields.deliveryFee) headers.push('أجور التوصيل');
            if (exportSettings.fields.itemPrice) headers.push('المستحق للتاجر');
            if (exportSettings.fields.adjustments) headers.push('تعديلات');
            if (exportSettings.fields.netAmount) headers.push('الصافي المستحق');

            // Build rows based on selected fields
            const rows: string[][] = ordersToExport.map((order, index) => {
                const adjustment = adjustments[order.id] || 0;
                const netAmount = (order.itemPrice || 0) + adjustment;
                const row: string[] = [];
                if (exportSettings.fields.index) row.push((index + 1).toString());
                if (exportSettings.fields.orderId) row.push(order.id);
                if (exportSettings.fields.recipient) row.push(order.recipient);
                if (exportSettings.fields.date) row.push(order.date);
                if (exportSettings.fields.cod) row.push(formatCurrency(order.cod || 0));
                if (exportSettings.fields.deliveryFee) row.push(formatCurrency(order.deliveryFee || 0));
                if (exportSettings.fields.itemPrice) row.push(formatCurrency(order.itemPrice || 0));
                if (exportSettings.fields.adjustments) row.push(`${adjustment !== 0 ? (adjustment > 0 ? '+' : '') : ''}${formatCurrency(adjustment)}`);
                if (exportSettings.fields.netAmount) row.push(formatCurrency(netAmount));
                return row;
            });

            // Build footer row
            const footerRow: string[] = [];
            let footerColspan = 0;
            if (exportSettings.fields.index) { footerRow.push(''); footerColspan++; }
            if (exportSettings.fields.orderId) { footerRow.push(''); footerColspan++; }
            if (exportSettings.fields.recipient) { footerRow.push('الإجمالي'); footerColspan++; }
            if (exportSettings.fields.date) { footerRow.push(''); footerColspan++; }
            if (exportSettings.fields.cod) footerRow.push(formatCurrency(totalCOD));
            if (exportSettings.fields.deliveryFee) footerRow.push(formatCurrency(totalDeliveryFee));
            if (exportSettings.fields.itemPrice) footerRow.push(formatCurrency(totalItemPrice));
            if (exportSettings.fields.adjustments) footerRow.push(`${totalAdjustments !== 0 ? (totalAdjustments > 0 ? '+' : '') : ''}${formatCurrency(totalAdjustments)}`);
            if (exportSettings.fields.netAmount) footerRow.push(formatCurrency(totalNet));

            const pdfOptions: PDFExportOptions = {
                title: `كشف دفع للتاجر: ${selectedMerchant?.storeName || selectedMerchant?.name || 'تاجر'}`,
                subtitle: `عدد الطلبات: ${ordersToExport.length} طلب`,
                logoUrl,
                companyName: settings.login.companyName || 'الشركة',
                date: slipDate,
                tableHeaders: headers,
                tableRows: rows,
                footerRow,
                showSignatures: true,
                signatureLabels: ['توقيع المستلم (التاجر)', 'توقيع الموظف المالي'],
                notes: exportSettings.notes,
                showNotes: exportSettings.showNotes || false,
                orientation: exportSettings.orientation || 'portrait'
            };

            const fileName = `كشف_دفع_${selectedMerchant?.storeName || selectedMerchant?.name || 'تاجر'}_${new Date().toISOString().split('T')[0]}.pdf`;
            await exportToPDF(pdfOptions, fileName);

            toast({
                title: 'تم التصدير بنجاح',
                description: `تم تصدير ${ordersToExport.length} طلب إلى ملف PDF.`
            });
        } catch (error) {
            console.error('PDF export error:', error);
            toast({
                variant: 'destructive',
                title: 'خطأ في التصدير',
                description: 'حدث خطأ أثناء تصدير البيانات.'
            });
        }
    };

    const isAllSelected = ordersForPayment.length > 0 && selectedOrderIds.length === ordersForPayment.length;

    return (
        <div className="space-y-4 h-full flex flex-col">
            <Card className="border-2 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Icon name="CreditCard" className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle>تجهيز دفعات التجار</CardTitle>
                    </div>
                    <CardDescription>
                        اختيار التاجر ومراجعة الطلبات المكتملة وإنشاء كشف دفع للتاجر
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-full sm:w-auto sm:min-w-[250px]">
                            <Select onValueChange={setSelectedMerchantId} value={selectedMerchantId || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر تاجرًا..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {merchantsWithCounts.map(m => (
                                        <SelectItem key={m.id} value={m.id}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>{m.storeName || m.name}</span>
                                                {m.payableOrdersCount > 0 && (
                                                    <span className="mr-2 inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                                                        {m.payableOrdersCount}
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative w-full sm:w-auto sm:min-w-[250px]">
                            <Icon name="Search" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="بحث بالرقم، المستلم..." 
                                className="pr-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <DateRangePicker 
                            onUpdate={({ range }) => setDateRange(range)} 
                            className="[&>button]:w-[200px]"
                        />
                        <div className="flex items-center gap-2 sm:mr-auto flex-wrap">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handlePrintClick} 
                                disabled={selectedOrderIds.length === 0}
                                className="gap-2"
                            >
                                <Icon name="Printer" className="h-4 w-4"/>
                                <span className="hidden sm:inline">طباعة المحدد</span>
                                <span className="sm:hidden">طباعة</span>
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleExportExcelClick}
                                disabled={selectedOrderIds.length === 0}
                                className="gap-2"
                            >
                                <Icon name="FileSpreadsheet" className="h-4 w-4"/>
                                <span className="hidden sm:inline">تصدير Excel</span>
                                <span className="sm:hidden">Excel</span>
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleExportPDFClick}
                                disabled={selectedOrderIds.length === 0}
                                className="gap-2"
                            >
                                <Icon name="FileText" className="h-4 w-4"/>
                                <span className="hidden sm:inline">تصدير PDF</span>
                                <span className="sm:hidden">PDF</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="flex flex-col flex-1 min-h-0 border-2 shadow-sm">
                <CardHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">الطلبات المكتملة</CardTitle>
                            <CardDescription className="mt-1">
                                {selectedMerchant 
                                    ? `طلبات التاجر ${selectedMerchant.storeName || selectedMerchant.name} - ${ordersForPayment.length} طلب`
                                    : 'اختر تاجرًا لعرض الطلبات'
                                }
                            </CardDescription>
                        </div>
                        {selectedMerchant && ordersForPayment.length > 0 && (
                            <Badge variant="secondary" className="text-sm px-3 py-1">
                                {selectedOrderIds.length} / {ordersForPayment.length} محدد
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <div className="flex-1 border rounded-lg overflow-auto flex flex-col">
                    <Table>
                        <TableHeader className="sticky top-0 z-20">
                            <TableRow className="hover:bg-transparent bg-muted/50">
                                <TableHead className="sticky right-0 z-30 p-3 text-center border-l w-20 bg-muted">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm font-bold">#</span>
                                        <Checkbox 
                                            onCheckedChange={handleSelectAll} 
                                            checked={isAllSelected}
                                            aria-label="Select all rows"
                                        />
                                    </div>
                                </TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{minWidth: '150px'}}>رقم الطلب</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{minWidth: '150px'}}>المستلم</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{minWidth: '150px'}}>تاريخ التوصيل</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{minWidth: '150px'}}>قيمة التحصيل</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{minWidth: '150px'}}>أجور التوصيل</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{minWidth: '150px'}}>المستحق للتاجر</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{minWidth: '120px'}}>تعديلات (+/-)</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{minWidth: '120px'}}>الصافي المستحق</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {!selectedMerchant ? (
                                <TableRow><TableCell colSpan={9} className="h-24 text-center">الرجاء اختيار تاجر لعرض الطلبات.</TableCell></TableRow>
                            ) : ordersForPayment.length === 0 ? (
                                <TableRow><TableCell colSpan={9} className="h-24 text-center">لا توجد طلبات مكتملة لهذا التاجر.</TableCell></TableRow>
                            ) : (
                                ordersForPayment.map((order, index) => {
                                    const adjustment = adjustments[order.id] || 0;
                                    const netAmount = (order.itemPrice || 0) + adjustment;
                                    return (
                                        <TableRow key={order.id} data-state={selectedOrderIds.includes(order.id) ? "selected" : ""}>
                                            <TableCell className="sticky right-0 z-10 p-2 text-center border-l bg-card data-[state=selected]:bg-muted">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-xs font-mono">{index + 1}</span>
                                                    <Checkbox checked={selectedOrderIds.includes(order.id)} onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)} />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center border-l font-mono">{order.id}</TableCell>
                                            <TableCell className="text-center border-l">{order.recipient}</TableCell>
                                            <TableCell className="text-center border-l">{order.date}</TableCell>
                                            <TableCell className="text-center border-l">{formatCurrency(order.cod)}</TableCell>
                                            <TableCell className="text-center border-l">{formatCurrency(order.deliveryFee)}</TableCell>
                                            <TableCell className="text-center border-l font-semibold">{formatCurrency(order.itemPrice)}</TableCell>
                                            <TableCell className="text-center border-l">
                                                <Input 
                                                    type="number" 
                                                    className="h-8 text-center" 
                                                    value={adjustment}
                                                    onChange={(e) => handleAdjustmentChange(order.id, e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-primary">{formatCurrency(netAmount)}</TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
                <CardFooter className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-t bg-muted/30">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Icon name="Banknote" className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <span className="font-semibold text-muted-foreground block text-xs">الإجمالي المستحق</span>
                                <span className="font-bold text-lg">{formatCurrency(totals.totalItemPrice)}</span>
                            </div>
                        </div>
                        <Separator orientation='vertical' className="h-8"/>
                        <div className="flex items-center gap-2">
                            <Icon name="Edit" className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <span className="font-semibold text-muted-foreground block text-xs">التعديلات</span>
                                <span className="font-bold text-lg">{formatCurrency(totals.totalAdjustments)}</span>
                            </div>
                        </div>
                        <Separator orientation='vertical' className="h-8"/>
                        <div className="flex items-center gap-2">
                            <Icon name="TrendingUp" className="h-4 w-4 text-primary" />
                            <div>
                                <span className="font-semibold text-muted-foreground block text-xs">الصافي للدفع</span>
                                <span className="font-bold text-xl text-primary">{formatCurrency(totals.totalNet)}</span>
                            </div>
                        </div>
                    </div>
                    <Button 
                        onClick={handleCreatePaymentSlip} 
                        disabled={selectedOrderIds.length === 0} 
                        size="lg"
                        className="gap-2 w-full sm:w-auto"
                    >
                        <Icon name="FilePlus" className="h-5 w-5" />
                        <span>إنشاء كشف دفع</span>
                        {selectedOrderIds.length > 0 && (
                            <Badge variant="secondary" className="mr-2">
                                {selectedOrderIds.length}
                            </Badge>
                        )}
                    </Button>
                </CardFooter>
            </Card>
            <ExportSettingsDialog
                open={exportSettingsOpen}
                onOpenChange={setExportSettingsOpen}
                fields={exportFields}
                onConfirm={handleExportPDF}
                title="إعدادات تصدير PDF"
                description="اختر الحقول التي تريد تضمينها في ملف PDF"
            />
            <ExportSettingsDialog
                open={printSettingsOpen}
                onOpenChange={setPrintSettingsOpen}
                fields={exportFields}
                onConfirm={handlePrint}
                title="إعدادات الطباعة"
                description="اختر الحقول التي تريد تضمينها في الطباعة"
            />
            <ExportSettingsDialog
                open={excelSettingsOpen}
                onOpenChange={setExcelSettingsOpen}
                fields={exportFields}
                onConfirm={handleExportExcel}
                title="إعدادات تصدير Excel"
                description="اختر الحقول التي تريد تضمينها في ملف Excel"
            />
        </div>
    );
};
