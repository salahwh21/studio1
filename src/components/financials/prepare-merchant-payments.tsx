
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
import { DateRangePicker } from '@/components/date-range-picker';

export const PrepareMerchantPayments = () => {
    const { toast } = useToast();
    const { users } = useUsersStore();
    const { orders } = useOrdersStore();
    const { formatCurrency } = useSettings();
    
    const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [adjustments, setAdjustments] = useState<Record<string, number>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({ from: undefined, to: undefined });

    const merchants = useMemo(() => users.filter(u => u.roleId === 'merchant'), [users]);
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
            (!dateRange.from || new Date(o.date) >= dateRange.from) &&
            (!dateRange.to || new Date(o.date) <= dateRange.to)
        );
    }, [orders, selectedMerchant, searchQuery, dateRange]);
    
    const totals = useMemo(() => {
        const selectedOrders = ordersForPayment.filter(o => selectedOrderIds.includes(o.id));
        
        return selectedOrders.reduce((acc, order) => {
            const adjustment = adjustments[order.id] || 0;
            const itemPrice = order.itemPrice || 0;
            const netAmount = itemPrice + adjustment;
            
            acc.totalItemPrice += itemPrice;
            acc.totalAdjustments += adjustment;
            acc.totalNet += netAmount;
            return acc;
        }, { totalItemPrice: 0, totalAdjustments: 0, totalNet: 0 });

    }, [ordersForPayment, selectedOrderIds, adjustments]);

    const handleCreatePaymentSlip = () => {
        if (!selectedMerchant || selectedOrderIds.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء اختيار تاجر وطلب واحد على الأقل.'});
            return;
        }
        toast({
            title: 'تم إنشاء كشف الدفع (محاكاة)',
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

    const isAllSelected = ordersForPayment.length > 0 && selectedOrderIds.length === ordersForPayment.length;

    return (
        <div className="space-y-4 h-full flex flex-col">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-full sm:w-auto sm:min-w-[250px]">
                            <Select onValueChange={setSelectedMerchantId} value={selectedMerchantId || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر تاجرًا..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {merchants.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.storeName || m.name}</SelectItem>
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
                        {/* <DateRangePicker onUpdate={(range) => setDateRange(range.range)} /> */}
                        <div className="flex items-center gap-2 sm:mr-auto">
                            <Button variant="outline" size="sm"><Icon name="FileDown" className="ml-2 h-4 w-4"/>تصدير PDF</Button>
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
                                            checked={isAllSelected}
                                            aria-label="Select all rows"
                                            className='border-white data-[state=checked]:bg-white data-[state=checked]:text-slate-800 data-[state=indeterminate]:bg-white data-[state=indeterminate]:text-slate-800' />
                                    </div>
                                </TableHead>
                                <TableHead className="p-2 text-center border-b border-l bg-slate-800 !text-white" style={{minWidth: '150px'}}>رقم الطلب</TableHead>
                                <TableHead className="p-2 text-center border-b border-l bg-slate-800 !text-white" style={{minWidth: '150px'}}>المستلم</TableHead>
                                <TableHead className="p-2 text-center border-b border-l bg-slate-800 !text-white" style={{minWidth: '150px'}}>تاريخ التوصيل</TableHead>
                                <TableHead className="p-2 text-center border-b border-l bg-slate-800 !text-white" style={{minWidth: '150px'}}>قيمة التحصيل</TableHead>
                                <TableHead className="p-2 text-center border-b border-l bg-slate-800 !text-white" style={{minWidth: '150px'}}>أجور التوصيل</TableHead>
                                <TableHead className="p-2 text-center border-b border-l bg-slate-800 !text-white" style={{minWidth: '150px'}}>المستحق للتاجر</TableHead>
                                <TableHead className="p-2 text-center border-b border-l bg-slate-800 !text-white" style={{minWidth: '120px'}}>تعديلات (+/-)</TableHead>
                                <TableHead className="p-2 text-center border-b border-l bg-slate-800 !text-white" style={{minWidth: '120px'}}>الصافي المستحق</TableHead>
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
                <CardFooter className="flex-none flex items-center justify-between p-2 border-t">
                     <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span><span className="font-semibold text-muted-foreground">المستحق:</span> {formatCurrency(totals.totalItemPrice)}</span>
                        <Separator orientation='vertical' className="h-4"/>
                        <span><span className="font-semibold text-muted-foreground">التعديلات:</span> {formatCurrency(totals.totalAdjustments)}</span>
                        <Separator orientation='vertical' className="h-4"/>
                        <span className="font-bold text-lg text-primary"><span className="font-semibold text-muted-foreground">الصافي للدفع:</span> {formatCurrency(totals.totalNet)}</span>
                    </div>
                    <Button onClick={handleCreatePaymentSlip} disabled={selectedOrderIds.length === 0} className="mr-auto">
                        <Icon name="FilePlus" className="ml-2 h-4 w-4" />
                        إنشاء كشف دفع ({selectedOrderIds.length})
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};
