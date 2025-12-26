
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
import { exportToExcel } from '@/lib/export-utils';
import { ExportSettingsDialog, type ExportSettings, type ExportField } from '@/components/export-settings-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { SlipTemplates } from '@/lib/unified-slip-templates-clean';
import { printSlip, exportSlipToPDF } from '@/lib/unified-print-export';

export const PrepareMerchantPayments = () => {
    const { toast } = useToast();
    const { users } = useUsersStore();
    const { orders } = useOrdersStore();
    const { settings, formatCurrency, formatDate } = useSettings();
    const { addMerchantPaymentSlip } = useFinancialsStore();

    const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [adjustments, setAdjustments] = useState<Record<string, number>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [excelSettingsOpen, setExcelSettingsOpen] = useState(false);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

    const merchants = useMemo(() => users.filter(u => u.roleId === 'merchant'), [users]);

    const merchantsWithCounts = useMemo(() => {
        return merchants.map(merchant => {
            const count = orders.filter(o =>
                o.merchant === merchant.storeName &&
                (o.status === 'تم التوصيل' || o.status === 'تم استلام المال في الفرع')
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
            (o.status === 'تم التوصيل' || o.status === 'تم استلام المال في الفرع') &&
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
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء اختيار تاجر وطلب واحد على الأقل.' });
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

    const handlePrintClick = async () => {
        const ordersToPrint = ordersForPayment.filter(o => selectedOrderIds.includes(o.id));
        if (ordersToPrint.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء تحديد طلب واحد على الأقل للطباعة.' });
            return;
        }

        try {
            const slipData = SlipTemplates.merchantPayment(
                selectedMerchant?.storeName || selectedMerchant?.name || 'تاجر',
                ordersToPrint,
                adjustments,
                formatCurrency,
                formatDate,
                {
                    name: settings.login?.companyName || 'الشركة',
                    logo: settings.login?.reportsLogo || settings.login?.headerLogo
                }
            );

            await printSlip(slipData, {
                orientation: 'portrait',
                showSignatures: true
            });

            toast({ title: 'تم إرسال للطباعة', description: 'تم إرسال الكشف للطباعة بنجاح.' });
        } catch (error) {
            console.error('Print error:', error);
            toast({ variant: 'destructive', title: 'فشل الطباعة', description: 'حدث خطأ أثناء الطباعة.' });
        }
    };

    const handleExportExcelClick = () => {
        const ordersToExport = ordersForPayment.filter(o => selectedOrderIds.includes(o.id));
        if (ordersToExport.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء تحديد طلب واحد على الأقل للتصدير.' });
            return;
        }
        setExcelSettingsOpen(true);
    };

    const handleExportExcel = async (excelSettings: ExportSettings) => {
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

            const fileName = `كشف_دفع_${selectedMerchant?.storeName || selectedMerchant?.name || 'تاجر'}_${new Date().toISOString().split('T')[0]}.xlsx`;
            await exportToExcel(data, fileName, 'كشف الدفع');

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

    const handleExportPDFClick = async () => {
        const ordersToExport = ordersForPayment.filter(o => selectedOrderIds.includes(o.id));
        if (ordersToExport.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء تحديد طلب واحد على الأقل للتصدير.' });
            return;
        }

        try {
            setIsGeneratingPreview(true);

            const slipData = SlipTemplates.merchantPayment(
                selectedMerchant?.storeName || selectedMerchant?.name || 'تاجر',
                ordersToExport,
                adjustments,
                formatCurrency,
                formatDate,
                {
                    name: settings.login?.companyName || 'الشركة',
                    logo: settings.login?.reportsLogo || settings.login?.headerLogo
                }
            );

            await exportSlipToPDF(slipData, {
                orientation: 'portrait',
                showSignatures: true,
                filename: `كشف_دفع_${selectedMerchant?.storeName || selectedMerchant?.name || 'تاجر'}_${new Date().toISOString().split('T')[0]}`
            });

            toast({
                title: 'تم التحميل بنجاح',
                description: `تم تحميل كشف الدفع لـ ${ordersToExport.length} طلب.`
            });
        } catch (error) {
            console.error('PDF export error:', error);
            toast({
                variant: 'destructive',
                title: 'خطأ في التصدير',
                description: 'حدث خطأ أثناء تصدير PDF'
            });
        } finally {
            setIsGeneratingPreview(false);
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
                                variant="ghost"
                                size="sm"
                                disabled={selectedOrderIds.length === 0}
                                className="h-7 text-xs disabled:opacity-40 text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-all hover:scale-105"
                                onClick={handlePrintClick}
                            >
                                <Icon name="Printer" className="h-4 w-4 ml-1" /> طباعة
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={selectedOrderIds.length === 0}
                                className="h-7 text-xs disabled:opacity-40 text-green-600 hover:bg-green-50 hover:text-green-700 transition-all hover:scale-105"
                                onClick={handleExportExcelClick}
                            >
                                <Icon name="FileSpreadsheet" className="h-4 w-4 ml-1" /> تصدير
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={selectedOrderIds.length === 0 || isGeneratingPreview}
                                className="h-7 text-xs disabled:opacity-40 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all hover:scale-105"
                                onClick={handleExportPDFClick}
                            >
                                <Icon name={isGeneratingPreview ? "Loader2" : "Download"} className={cn("h-4 w-4 ml-1", { "animate-spin": isGeneratingPreview })} /> PDF
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
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{ minWidth: '150px' }}>رقم الطلب</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{ minWidth: '150px' }}>المستلم</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{ minWidth: '150px' }}>تاريخ التوصيل</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{ minWidth: '150px' }}>قيمة التحصيل</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{ minWidth: '150px' }}>أجور التوصيل</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{ minWidth: '150px' }}>المستحق للتاجر</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{ minWidth: '120px' }}>تعديلات (+/-)</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{ minWidth: '120px' }}>الصافي المستحق</TableHead>
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
                        <Separator orientation='vertical' className="h-8" />
                        <div className="flex items-center gap-2">
                            <Icon name="Edit" className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <span className="font-semibold text-muted-foreground block text-xs">التعديلات</span>
                                <span className="font-bold text-lg">{formatCurrency(totals.totalAdjustments)}</span>
                            </div>
                        </div>
                        <Separator orientation='vertical' className="h-8" />
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
