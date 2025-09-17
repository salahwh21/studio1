
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useReturnsStore, type MerchantSlip } from '@/store/returns-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUsersStore } from '@/store/user-store';
import { ScrollArea } from '@/components/ui/scroll-area';

export const PrepareForMerchants = () => {
    const { orders } = useOrdersStore();
    const { users } = useUsersStore();
    const { merchantSlips, addMerchantSlip } = useReturnsStore();
    const { toast } = useToast();
    const [selectedReturns, setSelectedReturns] = useState<string[]>([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);

    const returnsByMerchant = useMemo(() => {
        const slipOrderIds = new Set(merchantSlips.flatMap(s => s.orders.map(o => o.id)));
        const availableReturns = orders.filter(o => o.status === 'مرجع للفرع' && !slipOrderIds.has(o.id));
        
        return availableReturns.reduce((acc, order) => {
            const merchantName = order.merchant || 'غير معين';
            if (!acc[merchantName]) {
                acc[merchantName] = [];
            }
            acc[merchantName].push(order);
            return acc;
        }, {} as Record<string, Order[]>);
    }, [orders, merchantSlips]);

     const merchantData = useMemo(() => {
        return Object.keys(returnsByMerchant).map(merchantName => ({
            name: merchantName,
            user: users.find(u => u.storeName === merchantName),
            orderCount: returnsByMerchant[merchantName].length
        }));
    }, [returnsByMerchant, users]);

    useEffect(() => {
        if(!selectedMerchant && merchantData.length > 0) {
            setSelectedMerchant(merchantData[0].name);
        }
    }, [merchantData, selectedMerchant]);

    const selectedMerchantOrders = useMemo(() => {
      if (!selectedMerchant) return [];
      return returnsByMerchant[selectedMerchant] || [];
    }, [returnsByMerchant, selectedMerchant]);


    const handleCreateSlip = () => {
        const selectedOrdersData = selectedMerchantOrders.filter(o => selectedReturns.includes(o.id));
        if (selectedOrdersData.length === 0) return;

        const newSlip: Omit<MerchantSlip, 'id'> = {
            merchant: selectedMerchant || 'غير معين',
            date: new Date().toISOString().slice(0, 10),
            items: selectedOrdersData.length,
            status: 'جاهز للتسليم',
            orders: selectedOrdersData,
        };
        
        addMerchantSlip(newSlip);
        setSelectedReturns([]);
        setShowCreateDialog(false);
        toast({
            title: "تم إنشاء الكشف بنجاح",
            description: `تم إنشاء كشف إرجاع للتاجر ${selectedMerchant} يحتوي على ${selectedOrdersData.length} طلبات.`
        });
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedReturns(checked ? selectedMerchantOrders.map(r => r.id) : []);
    };
    
    const areAllSelected = selectedMerchantOrders.length > 0 && selectedReturns.length === selectedMerchantOrders.length;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" dir="rtl">
            {/* Left Panel - Merchants List */}
            <div className="lg:col-span-3 xl:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>التجار</CardTitle>
                        <CardDescription>قائمة بالتجار الذين لديهم مرتجعات بالفرع.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2">
                        <ScrollArea className="h-[60vh]">
                            <div className="space-y-2">
                                {merchantData.map(({name, user, orderCount}) => (
                                    <button
                                        key={name}
                                        onClick={() => setSelectedMerchant(name)}
                                        className={cn(
                                            "w-full p-3 rounded-lg flex items-center gap-3 transition-colors",
                                            selectedMerchant === name ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                        )}
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user?.avatar} />
                                            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-sm flex-1 text-right">{name}</span>
                                        <Badge variant={selectedMerchant === name ? 'secondary' : 'default'}>{orderCount}</Badge>
                                    </button>
                                ))}
                                {merchantData.length === 0 && <p className="text-center text-muted-foreground p-4">لا يوجد مرتجعات.</p>}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
            
             {/* Right Panel - Orders Table */}
             <div className="lg:col-span-9 xl:col-span-10">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>مرتجعات التاجر: {selectedMerchant || 'لم يتم الاختيار'}</CardTitle>
                                <CardDescription>حدد الطلبات المراد إضافتها لكشف الإرجاع.</CardDescription>
                            </div>
                            <Button disabled={selectedReturns.length === 0} onClick={() => setShowCreateDialog(true)}>
                                <Icon name="PlusCircle" className="ml-2 h-4 w-4" />
                                إنشاء كشف إرجاع ({selectedReturns.length})
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"><Checkbox checked={areAllSelected} onCheckedChange={handleSelectAll} /></TableHead>
                                    <TableHead>رقم الطلب</TableHead>
                                    <TableHead>المستلم</TableHead>
                                    <TableHead>تاريخ الطلب الأصلي</TableHead>
                                    <TableHead>الحالة الأصلية</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!selectedMerchant ? (
                                    <TableRow><TableCell colSpan={5} className="h-48 text-center text-muted-foreground">الرجاء اختيار تاجر لعرض مرتجعاته.</TableCell></TableRow>
                                ) : selectedMerchantOrders.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="h-48 text-center text-muted-foreground">لا توجد مرتجعات جاهزة لهذا التاجر.</TableCell></TableRow>
                                ) : (
                                    selectedMerchantOrders.map((item) => (
                                        <TableRow key={item.id} data-state={selectedReturns.includes(item.id) && "selected"}>
                                            <TableCell><Checkbox checked={selectedReturns.includes(item.id)} onCheckedChange={(checked) => setSelectedReturns(prev => checked ? [...prev, item.id] : prev.filter(id => id !== item.id))} /></TableCell>
                                            <TableCell><Link href={`/dashboard/orders/${item.id}`} className="font-mono text-primary hover:underline">{item.id}</Link></TableCell>
                                            <TableCell>{item.recipient}</TableCell>
                                            <TableCell>{item.date}</TableCell>
                                            <TableCell><Badge variant="outline">{item.previousStatus}</Badge></TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
             </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>إنشاء كشف إرجاع جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>سيتم إنشاء كشف للتاجر **{selectedMerchant}** يضم **{selectedReturns.length}** طلب/طلبات.</p>
                        <ul className="list-disc pr-6 text-sm max-h-40 overflow-y-auto">
                            {selectedMerchantOrders.filter(r => selectedReturns.includes(r.id)).map(r => (<li key={r.id}><span className="font-mono">{r.id}</span></li>))}
                        </ul>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>إلغاء</Button>
                        <Button onClick={handleCreateSlip}>تأكيد وإنشاء</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
