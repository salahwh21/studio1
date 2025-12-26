
'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useUsersStore } from '@/store/user-store';
import { useSettings } from '@/contexts/SettingsContext';
import Icon from '@/components/icon';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useStatusesStore } from '@/store/statuses-store';
import { useFinancialsStore } from '@/store/financials-store';
import { exportToExcel } from '@/lib/export-utils';
import { ExportSettingsDialog, type ExportSettings, type ExportField } from '@/components/export-settings-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SlipTemplates } from '@/lib/unified-slip-templates-clean';
import { printSlip, exportSlipToPDF } from '@/lib/unified-print-export';


export const CollectFromDriver = () => {
    const { toast } = useToast();
    const { users } = useUsersStore();
    const { orders, updateOrderField, bulkUpdateOrderStatus } = useOrdersStore();
    const { settings, formatCurrency, formatDate } = useSettings();
    const { statuses } = useStatusesStore();
    const { addDriverPaymentSlip } = useFinancialsStore();

    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [popoverStates, setPopoverStates] = useState<Record<string, boolean>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [excelSettingsOpen, setExcelSettingsOpen] = useState(false);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);


    const drivers = useMemo(() => users.filter(u => u.roleId === 'driver'), [users]);
    const merchants = useMemo(() => users.filter(u => u.roleId === 'merchant'), [users]);
    const selectedDriver = drivers.find(m => m.id === selectedDriverId);

    const statusesForCollection = [
        'تم التوصيل', 'تبديل', 'رفض ودفع أجور', 'رفض ولم يدفع أجور', 'وصول وعدم رد'
    ];

    const driversWithCounts = useMemo(() => {
        return drivers.map(driver => {
            const count = orders.filter(o =>
                o.driver === driver.name &&
                statusesForCollection.includes(o.status)
            ).length;
            return { ...driver, collectibleOrdersCount: count };
        });
    }, [drivers, orders]);

    const ordersForCollection = useMemo(() => {
        if (!selectedDriver) return [];

        const lowercasedQuery = searchQuery.toLowerCase();

        return orders.filter(o =>
            o.driver === selectedDriver.name &&
            statusesForCollection.includes(o.status) &&
            (searchQuery === '' ||
                o.id.toLowerCase().includes(lowercasedQuery) ||
                o.recipient.toLowerCase().includes(lowercasedQuery) ||
                o.phone.toLowerCase().includes(lowercasedQuery)
            )
        );
    }, [orders, selectedDriver, searchQuery]);

    const totals = useMemo(() => {
        const selectedOrders = ordersForCollection.filter(o => selectedOrderIds.includes(o.id));

        return selectedOrders.reduce((acc, order) => {
            acc.totalCOD += order.cod || 0;
            acc.totalDriverFare += order.driverFee || 0;
            return acc;
        }, { totalCOD: 0, totalDriverFare: 0, netPayable: 0 });

    }, [ordersForCollection, selectedOrderIds]);

    const handleConfirmCollection = () => {
        if (!selectedDriver || selectedOrderIds.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء اختيار سائق وطلب واحد على الأقل.' });
            return;
        }

        const ordersToProcess = orders.filter(o => selectedOrderIds.includes(o.id));

        // 1. Create a new financial slip
        addDriverPaymentSlip({
            driverName: selectedDriver.name,
            date: new Date().toISOString(),
            itemCount: ordersToProcess.length,
            orders: ordersToProcess,
        });

        // 2. Update status for selected orders
        bulkUpdateOrderStatus(selectedOrderIds, 'تم استلام المال في الفرع');

        // 3. Display success toast
        const netPayable = totals.totalCOD - totals.totalDriverFare;
        toast({
            title: 'تم تأكيد الاستلام وإنشاء كشف',
            description: `تم تسجيل استلام مبلغ ${formatCurrency(netPayable)} من السائق ${selectedDriver.name} وإضافته للسجل.`
        });

        // 4. Clear selection
        setSelectedOrderIds([]);
    }

    const handleSelectAll = (checked: boolean) => {
        setSelectedOrderIds(checked ? ordersForCollection.map(o => o.id) : []);
    };

    const handleSelectRow = (orderId: string, isChecked: boolean) => {
        setSelectedOrderIds(prev =>
            isChecked ? [...prev, orderId] : prev.filter(id => id !== orderId)
        );
    };

    const handleFieldChange = (orderId: string, field: keyof Order, value: any) => {
        const numericValue = parseFloat(value) || 0;
        updateOrderField(orderId, field, numericValue);
    };

    const togglePopover = (id: string) => {
        setPopoverStates(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getStatusBadge = (statusName: string) => {
        const status = statuses.find(s => s.name === statusName);
        if (!status) return <Badge variant="outline">{statusName}</Badge>;
        return <Badge style={{ backgroundColor: `${status.color}20`, color: status.color }}>{statusName}</Badge>;
    }

    const handlePrintClick = async () => {
        const ordersToPrint = ordersForCollection.filter(o => selectedOrderIds.includes(o.id));
        if (ordersToPrint.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء تحديد طلب واحد على الأقل للطباعة.' });
            return;
        }

        try {
            const slipData = SlipTemplates.driverCollection(
                selectedDriver?.name || 'سائق',
                ordersToPrint,
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
        const ordersToExport = ordersForCollection.filter(o => selectedOrderIds.includes(o.id));
        if (ordersToExport.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء تحديد طلب واحد على الأقل للتصدير.' });
            return;
        }
        setExcelSettingsOpen(true);
    };

    const handleExportExcel = async (excelSettings: ExportSettings) => {
        const ordersToExport = ordersForCollection.filter(o => selectedOrderIds.includes(o.id));
        if (ordersToExport.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء تحديد طلب واحد على الأقل للتصدير.' });
            return;
        }

        try {
            // إعداد البيانات
            const data = ordersToExport.map((order, index) => {
                const row: Record<string, any> = {};
                if (excelSettings.fields.index) row['#'] = index + 1;
                if (excelSettings.fields.orderId) row['رقم الطلب'] = order.id;
                if (excelSettings.fields.recipient) row['المستلم'] = order.recipient;
                if (excelSettings.fields.merchant) row['التاجر'] = order.merchant;
                if (excelSettings.fields.status) row['الحالة'] = order.status;
                if (excelSettings.fields.phone) row['الهاتف'] = order.phone;
                if (excelSettings.fields.region) row['المنطقة'] = order.region;
                if (excelSettings.fields.cod) row['قيمة التحصيل'] = order.cod || 0;
                if (excelSettings.fields.driverFee) row['أجرة السائق'] = order.driverFee || 0;
                if (excelSettings.fields.netAmount) row['الصافي'] = (order.cod || 0) - (order.driverFee || 0);
                return row;
            });

            // إضافة صف الإجمالي
            const totalCOD = ordersToExport.reduce((sum, o) => sum + (o.cod || 0), 0);
            const totalDriverFare = ordersToExport.reduce((sum, o) => sum + (o.driverFee || 0), 0);
            const totalNet = totalCOD - totalDriverFare;

            const totalRow: Record<string, any> = {};
            if (excelSettings.fields.index) totalRow['#'] = '';
            if (excelSettings.fields.orderId) totalRow['رقم الطلب'] = '';
            if (excelSettings.fields.recipient) totalRow['المستلم'] = '';
            if (excelSettings.fields.merchant) totalRow['التاجر'] = '';
            if (excelSettings.fields.status) totalRow['الحالة'] = '';
            if (excelSettings.fields.phone) totalRow['الهاتف'] = '';
            if (excelSettings.fields.region) totalRow['المنطقة'] = 'الإجمالي';
            if (excelSettings.fields.cod) totalRow['قيمة التحصيل'] = totalCOD;
            if (excelSettings.fields.driverFee) totalRow['أجرة السائق'] = totalDriverFare;
            if (excelSettings.fields.netAmount) totalRow['الصافي'] = totalNet;
            data.push(totalRow);

            // حفظ الملف
            const fileName = `كشف_تحصيل_${selectedDriver?.name || 'سائق'}_${new Date().toISOString().split('T')[0]}.xlsx`;
            await exportToExcel(data, fileName, 'كشف التحصيل');

            toast({
                title: 'تم التصدير بنجاح',
                description: `تم تصدير ${ordersToExport.length} طلب إلى ملف Excel.`
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'خطأ في التصدير',
                description: 'حدث خطأ أثناء تصدير البيانات. يرجى المحاولة مرة أخرى.'
            });
        }
    };

    const exportFields: ExportField[] = [
        { id: 'index', label: 'الرقم التسلسلي', defaultChecked: true },
        { id: 'orderId', label: 'رقم الطلب', defaultChecked: true },
        { id: 'recipient', label: 'المستلم', defaultChecked: true },
        { id: 'merchant', label: 'التاجر', defaultChecked: false },
        { id: 'status', label: 'الحالة', defaultChecked: false },
        { id: 'phone', label: 'الهاتف', defaultChecked: false },
        { id: 'region', label: 'المنطقة', defaultChecked: false },
        { id: 'cod', label: 'قيمة التحصيل', defaultChecked: true },
        { id: 'driverFee', label: 'أجرة السائق', defaultChecked: true },
        { id: 'netAmount', label: 'الصافي', defaultChecked: true },
    ];

    const handleExportPDFClick = async () => {
        const ordersToExport = ordersForCollection.filter(o => selectedOrderIds.includes(o.id));
        if (ordersToExport.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء تحديد طلب واحد على الأقل للتصدير.' });
            return;
        }

        try {
            setIsGeneratingPreview(true);

            const slipData = SlipTemplates.driverCollection(
                selectedDriver?.name || 'سائق',
                ordersToExport,
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
                filename: `كشف_تحصيل_${selectedDriver?.name || 'سائق'}_${new Date().toISOString().split('T')[0]}`
            });

            toast({
                title: 'تم التحميل بنجاح',
                description: `تم تحميل كشف التحصيل لـ ${ordersToExport.length} طلب.`
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


    return (
        <div className="space-y-4 h-full flex flex-col">
            <Card className="border-2 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Icon name="Wallet" className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle>تحصيل المبالغ من السائقين</CardTitle>
                    </div>
                    <CardDescription>
                        اختيار السائق ومراجعة الطلبات المكتملة وتأكيد استلام المبالغ وإنشاء كشف
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-full sm:w-auto sm:min-w-[250px]">
                            <Select onValueChange={setSelectedDriverId} value={selectedDriverId || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر سائقًا..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {driversWithCounts.map(d => (
                                        <SelectItem key={d.id} value={d.id}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>{d.name}</span>
                                                {d.collectibleOrdersCount > 0 && (
                                                    <Badge variant="secondary" className="mr-2">
                                                        {d.collectibleOrdersCount}
                                                    </Badge>
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
                                placeholder="بحث بالرقم، العميل، الهاتف..."
                                className="pr-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
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
                                {selectedDriver
                                    ? `طلبات السائق ${selectedDriver.name} - ${ordersForCollection.length} طلب`
                                    : 'اختر سائقًا لعرض الطلبات'
                                }
                            </CardDescription>
                        </div>
                        {selectedDriver && ordersForCollection.length > 0 && (
                            <Badge variant="secondary" className="text-sm px-3 py-1">
                                {selectedOrderIds.length} / {ordersForCollection.length} محدد
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
                                            checked={ordersForCollection.length > 0 && selectedOrderIds.length === ordersForCollection.length}
                                            aria-label="Select all rows"
                                        />
                                    </div>
                                </TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{ minWidth: '150px' }}>رقم الطلب</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{ minWidth: '200px' }}>التاجر</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{ minWidth: '150px' }}>الحالة</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{ minWidth: '150px' }}>الزبون</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{ minWidth: '150px' }}>الهاتف</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{ minWidth: '150px' }}>المنطقة</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{ minWidth: '150px' }}>قيمة التحصيل</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{ minWidth: '150px' }}>أجرة السائق</TableHead>
                                <TableHead className="p-3 text-center border-l bg-muted font-semibold" style={{ minWidth: '120px' }}>الصافي</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!selectedDriver ? (
                                <TableRow><TableCell colSpan={10} className="h-24 text-center">الرجاء اختيار سائق لعرض الطلبات.</TableCell></TableRow>
                            ) : ordersForCollection.length === 0 ? (
                                <TableRow><TableCell colSpan={10} className="h-24 text-center">لا توجد طلبات تطابق معايير البحث.</TableCell></TableRow>
                            ) : (
                                ordersForCollection.map((order, index) => {
                                    const netAmount = (order.cod || 0) - (order.driverFee || 0);
                                    return (
                                        <TableRow key={order.id} data-state={selectedOrderIds.includes(order.id) ? "selected" : ""}>
                                            <TableCell className="sticky right-0 z-10 p-2 text-center border-l bg-card data-[state=selected]:bg-muted">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-xs font-mono">{index + 1}</span>
                                                    <Checkbox checked={selectedOrderIds.includes(order.id)} onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)} />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center border-l font-mono whitespace-nowrap">{order.id}</TableCell>
                                            <TableCell className="text-center border-l whitespace-nowrap">
                                                <Popover open={popoverStates[`merchant-${order.id}`]} onOpenChange={() => togglePopover(`merchant-${order.id}`)}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full h-8 justify-between bg-background hover:bg-muted font-normal">
                                                            {order.merchant}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[200px] p-0">
                                                        <Command>
                                                            <CommandInput placeholder="بحث..." />
                                                            <CommandList>
                                                                <CommandEmpty>لم يوجد.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {merchants.map(m => (
                                                                        <CommandItem
                                                                            key={m.id}
                                                                            value={m.storeName || m.name}
                                                                            onSelect={() => {
                                                                                updateOrderField(order.id, 'merchant', m.storeName || m.name);
                                                                                togglePopover(`merchant-${order.id}`);
                                                                            }}
                                                                        >
                                                                            <Check className={cn("mr-2 h-4 w-4", order.merchant === (m.storeName || m.name) ? "opacity-100" : "opacity-0")} />
                                                                            {m.storeName || m.name}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </TableCell>
                                            <TableCell className="text-center border-l whitespace-nowrap">{getStatusBadge(order.status)}</TableCell>
                                            <TableCell className="text-center border-l whitespace-nowrap">{order.recipient}</TableCell>
                                            <TableCell className="text-center border-l whitespace-nowrap">{order.phone}</TableCell>
                                            <TableCell className="text-center border-l whitespace-nowrap">{order.region}</TableCell>
                                            <TableCell className="text-center border-l whitespace-nowrap">
                                                <Input
                                                    type="number"
                                                    defaultValue={order.cod}
                                                    onBlur={(e) => handleFieldChange(order.id, 'cod', e.target.value)}
                                                    className="h-8 text-center"
                                                />
                                            </TableCell>
                                            <TableCell className="text-center border-l whitespace-nowrap">
                                                <Input
                                                    type="number"
                                                    defaultValue={order.driverFee}
                                                    onBlur={(e) => handleFieldChange(order.id, 'driverFee', e.target.value)}
                                                    className="h-8 text-center"
                                                />
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-primary whitespace-nowrap">{formatCurrency(netAmount)}</TableCell>
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
                                <span className="font-semibold text-muted-foreground block text-xs">إجمالي التحصيل</span>
                                <span className="font-bold text-lg">{formatCurrency(totals.totalCOD)}</span>
                            </div>
                        </div>
                        <Separator orientation='vertical' className="h-8" />
                        <div className="flex items-center gap-2">
                            <Icon name="Wallet" className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <span className="font-semibold text-muted-foreground block text-xs">أجرة السائق</span>
                                <span className="font-bold text-lg">{formatCurrency(totals.totalDriverFare)}</span>
                            </div>
                        </div>
                        <Separator orientation='vertical' className="h-8" />
                        <div className="flex items-center gap-2">
                            <Icon name="TrendingUp" className="h-4 w-4 text-primary" />
                            <div>
                                <span className="font-semibold text-muted-foreground block text-xs">الصافي للدفع</span>
                                <span className="font-bold text-xl text-primary">{formatCurrency(totals.totalCOD - totals.totalDriverFare)}</span>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={handleConfirmCollection}
                        disabled={selectedOrderIds.length === 0}
                        size="lg"
                        className="gap-2 w-full sm:w-auto"
                    >
                        <Icon name="Check" className="h-5 w-5" />
                        <span>تأكيد استلام المبلغ</span>
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
