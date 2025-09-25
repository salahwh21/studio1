
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

export const PrepareMerchantPayments = () => {
    const { toast } = useToast();
    const { users } = useUsersStore();
    const { orders } = useOrdersStore();
    const { formatCurrency } = useSettings();
    
    const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

    const merchants = useMemo(() => users.filter(u => u.roleId === 'merchant'), [users]);
    const selectedMerchant = merchants.find(m => m.id === selectedMerchantId);

    const ordersForPayment = useMemo(() => {
        if (!selectedMerchant) return [];
        return orders.filter(o => 
            o.merchant === selectedMerchant.storeName && 
            o.status === 'تم التوصيل' // Or other statuses like 'MONEY_RECEIVED' in a real scenario
        );
    }, [orders, selectedMerchant]);
    
    const totalAmount = useMemo(() => {
        return ordersForPayment
            .filter(o => selectedOrderIds.includes(o.id))
            .reduce((sum, order) => sum + (order.itemPrice || 0), 0);
    }, [ordersForPayment, selectedOrderIds]);

    const handleCreatePaymentSlip = () => {
        if (!selectedMerchant || selectedOrderIds.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء اختيار تاجر وطلب واحد على الأقل.'});
            return;
        }
        toast({
            title: 'تم إنشاء كشف الدفع (محاكاة)',
            description: `تم إنشاء كشف دفع للتاجر ${selectedMerchant.name} بمبلغ ${formatCurrency(totalAmount)}.`
        });
        setSelectedOrderIds([]);
    }

    const handleSelectAll = (checked: boolean) => {
        setSelectedOrderIds(checked ? ordersForPayment.map(o => o.id) : []);
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
                 <div className="flex items-center gap-4">
                    <Select onValueChange={setSelectedMerchantId}>
                        <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="اختر تاجرًا..." />
                        </SelectTrigger>
                        <SelectContent>
                            {merchants.map(m => (
                                <SelectItem key={m.id} value={m.id}>{m.storeName || m.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleCreatePaymentSlip} disabled={selectedOrderIds.length === 0}>
                        <Icon name="FilePlus" className="ml-2 h-4 w-4" />
                        إنشاء كشف دفع ({selectedOrderIds.length})
                    </Button>
                    {totalAmount > 0 && <span className="font-bold text-lg text-green-600">الإجمالي: {formatCurrency(totalAmount)}</span>}
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                             <TableHead className="w-12 text-center border-l"><Checkbox onCheckedChange={handleSelectAll} checked={ordersForPayment.length > 0 && selectedOrderIds.length === ordersForPayment.length} /></TableHead>
                            <TableHead className="text-center border-l">رقم الطلب</TableHead>
                            <TableHead className="text-center border-l">المستلم</TableHead>
                            <TableHead className="text-center border-l">تاريخ التوصيل</TableHead>
                            <TableHead className="text-center">المبلغ المستحق للتاجر</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!selectedMerchant ? (
                            <TableRow><TableCell colSpan={5} className="h-24 text-center">الرجاء اختيار تاجر لعرض الطلبات.</TableCell></TableRow>
                        ) : ordersForPayment.length === 0 ? (
                             <TableRow><TableCell colSpan={5} className="h-24 text-center">لا توجد طلبات مكتملة لهذا التاجر.</TableCell></TableRow>
                        ) : (
                            ordersForPayment.map(order => (
                                <TableRow key={order.id} data-state={selectedOrderIds.includes(order.id) ? "selected" : ""}>
                                    <TableCell className="text-center border-l">
                                        <Checkbox checked={selectedOrderIds.includes(order.id)} onCheckedChange={(checked) => setSelectedOrderIds(p => checked ? [...p, order.id] : p.filter(id => id !== order.id))} />
                                    </TableCell>
                                    <TableCell className="text-center border-l font-mono">{order.id}</TableCell>
                                    <TableCell className="text-center border-l">{order.recipient}</TableCell>
                                    <TableCell className="text-center border-l">{order.date}</TableCell>
                                    <TableCell className="text-center font-bold">{formatCurrency(order.itemPrice)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
