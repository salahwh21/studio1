
'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export const PrepareMerchantPayments = () => {
    const { toast } = useToast();
    const { users } = useUsersStore();
    const { orders } = useOrdersStore();
    const { formatCurrency } = useSettings();
    
    const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [adjustments, setAdjustments] = useState<Record<string, number>>({});

    const merchants = useMemo(() => users.filter(u => u.roleId === 'merchant'), [users]);
    const selectedMerchant = merchants.find(m => m.id === selectedMerchantId);

    const ordersForPayment = useMemo(() => {
        if (!selectedMerchant) return [];
        return orders.filter(o => 
            o.merchant === selectedMerchant.storeName && 
            o.status === 'تم التوصيل'
        );
    }, [orders, selectedMerchant]);
    
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
    
    const handleAdjustmentChange = (orderId: string, value: string) => {
        const numericValue = parseFloat(value) || 0;
        setAdjustments(prev => ({
            ...prev,
            [orderId]: numericValue,
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>تجهيز مستحقات التجار</CardTitle>
                 <CardDescription>
                    تجميع المبالغ المستحقة للتجار من الطلبات المكتملة وإنشاء كشوفات دفع.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className="w-full sm:w-auto sm:min-w-[300px]">
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
                    <Separator orientation='vertical' className="h-8 hidden sm:block"/>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span><span className="font-semibold text-muted-foreground">المستحق:</span> {formatCurrency(totals.totalItemPrice)}</span>
                        <span><span className="font-semibold text-muted-foreground">التعديلات:</span> {formatCurrency(totals.totalAdjustments)}</span>
                        <span className="font-bold text-lg text-primary"><span className="font-semibold text-muted-foreground">الصافي:</span> {formatCurrency(totals.totalNet)}</span>
                    </div>
                    <div className="w-full sm:w-auto sm:mr-auto">
                        <Button onClick={handleCreatePaymentSlip} disabled={selectedOrderIds.length === 0} className="w-full">
                            <Icon name="FilePlus" className="ml-2 h-4 w-4" />
                            إنشاء كشف دفع ({selectedOrderIds.length})
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                 <TableHead className="w-12 text-center border-l"><Checkbox onCheckedChange={handleSelectAll} checked={ordersForPayment.length > 0 && selectedOrderIds.length === ordersForPayment.length} /></TableHead>
                                <TableHead className="text-center border-l">رقم الطلب</TableHead>
                                <TableHead className="text-center border-l">المستلم</TableHead>
                                <TableHead className="text-center border-l">تاريخ التوصيل</TableHead>
                                <TableHead className="text-center border-l">قيمة التحصيل</TableHead>
                                <TableHead className="text-center border-l">أجور التوصيل</TableHead>
                                <TableHead className="text-center border-l">المستحق للتاجر</TableHead>
                                <TableHead className="w-[120px] text-center border-l">تعديلات (+/-)</TableHead>
                                <TableHead className="text-center">الصافي المستحق</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!selectedMerchant ? (
                                <TableRow><TableCell colSpan={9} className="h-24 text-center">الرجاء اختيار تاجر لعرض الطلبات.</TableCell></TableRow>
                            ) : ordersForPayment.length === 0 ? (
                                 <TableRow><TableCell colSpan={9} className="h-24 text-center">لا توجد طلبات مكتملة لهذا التاجر.</TableCell></TableRow>
                            ) : (
                                ordersForPayment.map(order => {
                                    const adjustment = adjustments[order.id] || 0;
                                    const netAmount = (order.itemPrice || 0) + adjustment;
                                    return (
                                        <TableRow key={order.id} data-state={selectedOrderIds.includes(order.id) ? "selected" : ""}>
                                            <TableCell className="text-center border-l">
                                                <Checkbox checked={selectedOrderIds.includes(order.id)} onCheckedChange={(checked) => setSelectedOrderIds(p => checked ? [...p, order.id] : p.filter(id => id !== order.id))} />
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
            </CardContent>
        </Card>
    );
};
