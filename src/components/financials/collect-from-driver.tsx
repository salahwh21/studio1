
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


export const CollectFromDriver = () => {
    const { toast } = useToast();
    const { users } = useUsersStore();
    const { orders, updateOrderField } = useOrdersStore();
    const { formatCurrency } = useSettings();
    const { statuses } = useStatusesStore();
    
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
    }, [orders, selectedDriver, statusesForCollection, searchQuery]);
    
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
        const netPayable = totals.totalCOD - totals.totalDriverFare;
        toast({
            title: 'تم تأكيد الاستلام (محاكاة)',
            description: `تم تسجيل استلام مبلغ ${formatCurrency(netPayable)} من السائق ${selectedDriver.name}.`
        });
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

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="p-2">
                     <div className="flex items-center justify-center gap-4">
                        <div className="w-full max-w-xs">
                            <Select onValueChange={setSelectedDriverId} value={selectedDriverId || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر سائقًا..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {drivers.map(d => (
                                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
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
                        <Button variant="outline" size="sm"><Icon name="FileSpreadsheet" className="ml-2 h-4 w-4"/>تصدير Excel</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-auto">
                        <Table className="relative">
                            <TableHeader className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-900/50">
                                <TableRow>
                                    <TableHead className="w-12 text-center border-l whitespace-nowrap sticky right-0 z-30 bg-slate-100 dark:bg-slate-900/50"><Checkbox onCheckedChange={handleSelectAll} checked={ordersForCollection.length > 0 && selectedOrderIds.length === ordersForCollection.length} /></TableHead>
                                    <TableHead className="text-center border-l whitespace-nowrap min-w-[150px]">رقم الطلب</TableHead>
                                    <TableHead className="text-center border-l whitespace-nowrap min-w-[200px]">التاجر</TableHead>
                                    <TableHead className="text-center border-l whitespace-nowrap min-w-[150px]">الحالة</TableHead>
                                    <TableHead className="text-center border-l whitespace-nowrap min-w-[150px]">الزبون</TableHead>
                                    <TableHead className="text-center border-l whitespace-nowrap min-w-[150px]">الهاتف</TableHead>
                                    <TableHead className="text-center border-l whitespace-nowrap min-w-[150px]">المنطقة</TableHead>
                                    <TableHead className="w-[150px] text-center border-l whitespace-nowrap">قيمة التحصيل</TableHead>
                                    <TableHead className="w-[150px] text-center border-l whitespace-nowrap">أجرة السائق</TableHead>
                                    <TableHead className="text-center whitespace-nowrap min-w-[120px]">الصافي</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!selectedDriver ? (
                                    <TableRow><TableCell colSpan={10} className="h-24 text-center">الرجاء اختيار سائق لعرض الطلبات.</TableCell></TableRow>
                                ) : ordersForCollection.length === 0 ? (
                                    <TableRow><TableCell colSpan={10} className="h-24 text-center">لا توجد طلبات تطابق معايير البحث.</TableCell></TableRow>
                                ) : (
                                    ordersForCollection.map(order => {
                                        const netAmount = (order.cod || 0) - (order.driverFee || 0);
                                        return (
                                            <TableRow key={order.id} data-state={selectedOrderIds.includes(order.id) ? "selected" : ""}>
                                                <TableCell className="text-center border-l whitespace-nowrap sticky right-0 z-10 bg-card data-[state=selected]:bg-muted">
                                                    <Checkbox checked={selectedOrderIds.includes(order.id)} onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)} />
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
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="p-4 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
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
                        <div className="w-full sm:w-auto sm:mr-auto">
                            <Button onClick={handleConfirmCollection} disabled={selectedOrderIds.length === 0} className="w-full">
                                <Icon name="Check" className="ml-2 h-4 w-4" />
                                تأكيد استلام المبلغ ({selectedOrderIds.length})
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
};
