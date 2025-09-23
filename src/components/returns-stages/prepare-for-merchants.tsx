'use client';
import { useState, useMemo, useCallback } from 'react';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useReturnsStore } from '@/store/returns-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';

export const PrepareForMerchants = () => {
    const { toast } = useToast();
    const { orders, updateOrderStatus } = useOrdersStore();
    const { addMerchantSlip } = useReturnsStore();

    const returnedToBranchOrders = useMemo(() => 
        orders.filter(o => o.status === 'مرجع للفرع'),
        [orders]
    );

    const merchants = useMemo(() => 
        Array.from(new Set(returnedToBranchOrders.map(o => o.merchant))),
        [returnedToBranchOrders]
    );

    const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

    const ordersForSelectedMerchant = useMemo(() =>
        selectedMerchant ? returnedToBranchOrders.filter(o => o.merchant === selectedMerchant) : [],
        [returnedToBranchOrders, selectedMerchant]
    );

    const handleSelectAll = (checked: boolean) => {
        setSelectedOrders(checked ? ordersForSelectedMerchant.map(o => o.id) : []);
    };
    
    const handleSelectRow = (id: string, checked: boolean) => {
        setSelectedOrders(prev => checked ? [...prev, id] : prev.filter(rowId => rowId !== id));
    };

    const handleCreateSlip = () => {
        if (!selectedMerchant || selectedOrders.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء اختيار تاجر وطلب واحد على الأقل.' });
            return;
        }

        const slipOrders = orders.filter(o => selectedOrders.includes(o.id));
        
        addMerchantSlip({
            merchant: selectedMerchant,
            date: new Date().toISOString(),
            items: slipOrders.length,
            status: 'جاهز للتسليم',
            orders: slipOrders,
        });

        slipOrders.forEach(order => {
            updateOrderStatus(order.id, 'مرجع للتاجر');
        });

        toast({
            title: 'تم إنشاء كشف الإرجاع',
            description: `تم إنشاء كشف للتاجر ${selectedMerchant} بـ ${slipOrders.length} شحنات.`,
        });

        setSelectedOrders([]);
        setSelectedMerchant(null);
    };

    const isAllSelected = ordersForSelectedMerchant.length > 0 && selectedOrders.length === ordersForSelectedMerchant.length;
    const merchantStats = useMemo(() => {
        return merchants.map(merchant => ({
            name: merchant,
            count: returnedToBranchOrders.filter(o => o.merchant === merchant).length
        }));
    }, [merchants, returnedToBranchOrders]);


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>تجهيز مرتجعات التجار</CardTitle>
                    <CardDescription>اختر تاجرًا لتجميع مرتجعاته وإنشاء كشف إرجاع.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     <div className="md:col-span-1 space-y-4">
                        <h3 className="font-semibold">التجار ذوي المرتجعات</h3>
                         <div className="space-y-2">
                            {merchantStats.map(stat => (
                                <button key={stat.name} onClick={() => setSelectedMerchant(stat.name)} className={`w-full text-right p-2 rounded-md transition-colors flex justify-between items-center ${selectedMerchant === stat.name ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                                    <span>{stat.name}</span>
                                    <Badge variant={selectedMerchant === stat.name ? 'secondary' : 'default'}>{stat.count}</Badge>
                                </button>
                            ))}
                        </div>
                     </div>
                     <div className="md:col-span-3">
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <CardTitle>شحنات {selectedMerchant || 'التاجر المحدد'}</CardTitle>
                                <Button onClick={handleCreateSlip} disabled={!selectedMerchant || selectedOrders.length === 0}>
                                    <Icon name="FilePlus" className="ml-2"/>
                                    إنشاء كشف إرجاع ({selectedOrders.length})
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12"><Checkbox onCheckedChange={handleSelectAll} checked={isAllSelected} /></TableHead>
                                            <TableHead>رقم الطلب</TableHead>
                                            <TableHead>المستلم الأصلي</TableHead>
                                            <TableHead>سبب الإرجاع</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {!selectedMerchant ? (
                                            <TableRow><TableCell colSpan={4} className="h-24 text-center">الرجاء اختيار تاجر من القائمة.</TableCell></TableRow>
                                        ) : ordersForSelectedMerchant.length === 0 ? (
                                             <TableRow><TableCell colSpan={4} className="h-24 text-center">لا توجد مرتجعات لهذا التاجر.</TableCell></TableRow>
                                        ) : (
                                            ordersForSelectedMerchant.map(order => (
                                                <TableRow key={order.id} data-state={selectedOrders.includes(order.id) && "selected"}>
                                                    <TableCell><Checkbox checked={selectedOrders.includes(order.id)} onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)} /></TableCell>
                                                    <TableCell>{order.id}</TableCell>
                                                    <TableCell>{order.recipient}</TableCell>
                                                    <TableCell><Badge variant="outline">{order.previousStatus}</Badge></TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                     </div>
                </CardContent>
            </Card>
        </div>
    );
}