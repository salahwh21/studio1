
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


export const CollectFromDriver = () => {
    const { toast } = useToast();
    const { users } = useUsersStore();
    const { orders, updateOrderField, bulkUpdateOrderStatus } = useOrdersStore();
    const { settings, formatCurrency } = useSettings();
    const { statuses } = useStatusesStore();
    const { addDriverPaymentSlip } = useFinancialsStore();
    
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [popoverStates, setPopoverStates] = useState<Record<string, boolean>>({});
    const [searchQuery, setSearchQuery] = useState('');


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
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء اختيار سائق وطلب واحد على الأقل.'});
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
    
    const handlePrint = () => {
        const ordersToPrint = ordersForCollection.filter(o => selectedOrderIds.includes(o.id));
        if (ordersToPrint.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء تحديد طلب واحد على الأقل للطباعة.' });
            return;
        }

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
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">قيمة التحصيل</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">أجرة السائق</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">الصافي</th>
                </tr>
            </thead>
        `;

        const tableRows = ordersToPrint.map((o, i) => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${i + 1}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${o.id}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${o.recipient}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(o.cod)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(o.driverFee)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency((o.cod || 0) - (o.driverFee || 0))}</td>
            </tr>
        `).join('');

        const totalCOD = ordersToPrint.reduce((sum, o) => sum + (o.cod || 0), 0);
        const totalDriverFare = ordersToPrint.reduce((sum, o) => sum + (o.driverFee || 0), 0);
        const totalNet = totalCOD - totalDriverFare;

        const tableFooter = `
            <tfoot>
                <tr>
                    <th colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">الإجمالي</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(totalCOD)}</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(totalDriverFare)}</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(totalNet)}</th>
                </tr>
            </tfoot>
        `;

        const slipDate = new Date().toLocaleDateString('ar-EG');
        const logoUrl = settings.login.reportsLogo || settings.login.headerLogo;

        const content = `
            <html>
                <head>
                    <title>كشف تحصيل من: ${selectedDriver?.name || 'سائق'}</title>
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
                            <h2>كشف تحصيل من السائق: ${selectedDriver?.name}</h2>
                            <p>التاريخ: ${slipDate}</p>
                        </div>
                    </div>
                    <table>
                        ${tableHeader}
                        <tbody>${tableRows}</tbody>
                        ${tableFooter}
                    </table>
                    <div class="signatures">
                        <div class="signature">توقيع المستلم (المحاسب)</div>
                        <div class="signature">توقيع السائق</div>
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
        <div className="space-y-4 h-full flex flex-col">
            <Card>
                <CardContent className="pt-6">
                     <div className="flex items-center justify-start gap-4">
                        <div className="w-full max-w-xs">
                            <Select onValueChange={setSelectedDriverId} value={selectedDriverId || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر سائقًا..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {driversWithCounts.map(d => (
                                        <SelectItem key={d.id} value={d.id}>
                                            {d.name} {d.collectibleOrdersCount > 0 && `(${d.collectibleOrdersCount})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="relative w-full max-w-xs">
                            <Icon name="Search" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="بحث بالرقم، العميل، الهاتف..." 
                                className="pr-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="mr-auto flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handlePrint} disabled={selectedOrderIds.length === 0}><Icon name="Printer" className="ml-2 h-4 w-4"/>طباعة المحدد</Button>
                            <Button variant="outline" size="sm"><Icon name="FileSpreadsheet" className="ml-2 h-4 w-4"/>تصدير Excel</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 border rounded-lg overflow-auto flex flex-col">
                    <Table>
                        <TableHeader className="sticky top-0 z-20">
                             <TableRow className="hover:bg-transparent">
                                <TableHead className="sticky right-0 z-30 p-2 text-center border-l w-20 bg-slate-800">
                                    <div className="flex items-center justify-center gap-2">
                                         <span className="text-sm font-bold text-white">#</span>
                                        <Checkbox 
                                            onCheckedChange={handleSelectAll} 
                                            checked={ordersForCollection.length > 0 && selectedOrderIds.length === ordersForCollection.length} 
                                            aria-label="Select all rows"
                                             className='border-white data-[state=checked]:bg-white data-[state=checked]:text-slate-800 data-[state=indeterminate]:bg-white data-[state=indeterminate]:text-slate-800' />
                                    </div>
                                </TableHead>
                                <TableHead className="p-2 text-center border-b border-l bg-slate-800 !text-white" style={{minWidth: '150px'}}>رقم الطلب</TableHead>
                                <TableHead className="p-2 text-center border-b border-l bg-slate-800 !text-white" style={{minWidth: '200px'}}>التاجر</TableHead>
                                <TableHead className="p-2 text-center border-b border-l bg-slate-800 !text-white" style={{minWidth: '150px'}}>الحالة</TableHead>
                                <TableHead className="p-2 text-center border-b border-l bg-slate-800 !text-white" style={{minWidth: '150px'}}>الزبون</TableHead>
                                <TableHead className="p-2 text-center border-b border-l bg-slate-800 !text-white" style={{minWidth: '150px'}}>الهاتف</TableHead>
                                <TableHead className="p-2 text-center border-b border-l bg-slate-800 !text-white" style={{minWidth: '150px'}}>المنطقة</TableHead>
                                <TableHead className="p-2 text-center border-b border-l bg-slate-800 !text-white" style={{minWidth: '150px'}}>قيمة التحصيل</TableHead>
                                <TableHead className="p-2 text-center border-b border-l bg-slate-800 !text-white" style={{minWidth: '150px'}}>أجرة السائق</TableHead>
                                <TableHead className="p-2 text-center border-b border-l bg-slate-800 !text-white" style={{minWidth: '120px'}}>الصافي</TableHead>
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
                <CardFooter className="flex-none flex items-center justify-between p-2 border-t">
                     <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <div>
                            <span className="font-semibold text-muted-foreground">إجمالي التحصيل المحدد: </span> 
                            <span className="font-bold text-lg">{formatCurrency(totals.totalCOD)}</span>
                        </div>
                        <Separator orientation='vertical' className="h-6"/>
                         <div>
                            <span className="font-semibold text-muted-foreground">إجمالي أجرة السائق: </span> 
                            <span className="font-bold text-lg">{formatCurrency(totals.totalDriverFare)}</span>
                        </div>
                         <Separator orientation='vertical' className="h-6"/>
                        <div className="text-primary font-bold text-lg">
                            <span className="font-semibold text-muted-foreground">الصافي للدفع: </span> 
                            <span className="font-bold text-xl">{formatCurrency(totals.totalCOD - totals.totalDriverFare)}</span>
                        </div>
                    </div>
                     <Button onClick={handleConfirmCollection} disabled={selectedOrderIds.length === 0} className="mr-auto">
                        <Icon name="Check" className="ml-2 h-4 w-4" />
                        تأكيد استلام المبلغ ({selectedOrderIds.length})
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};
