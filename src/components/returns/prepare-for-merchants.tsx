'use client';
import { useState, useMemo } from 'react';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useReturnsStore, type MerchantSlip } from '@/store/returns-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export const PrepareForMerchants = () => {
    const { orders } = useOrdersStore();
    const { merchantSlips, addMerchantSlip } = useReturnsStore();
    const { toast } = useToast();
    const [selectedReturns, setSelectedReturns] = useState<string[]>([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    const returnsAtBranch = useMemo(() => {
        const slipOrderIds = new Set(merchantSlips.flatMap(s => s.orders.map(o => o.id)));
        return orders.filter(o => o.status === 'مرجع للفرع' && !slipOrderIds.has(o.id));
    }, [orders, merchantSlips]);

    const handleCreateSlip = () => {
        const selectedOrdersData = returnsAtBranch.filter(o => selectedReturns.includes(o.id));
        if (selectedOrdersData.length === 0) return;

        const firstMerchant = selectedOrdersData[0].merchant;
        if (selectedOrdersData.some(o => o.merchant !== firstMerchant)) {
            toast({
                variant: "destructive",
                title: "خطأ في التحديد",
                description: "يرجى تحديد طلبات لنفس التاجر فقط لإنشاء كشف واحد.",
            });
            return;
        }

        const newSlip: Omit<MerchantSlip, 'id'> = {
            merchant: firstMerchant,
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
            description: `تم إنشاء كشف إرجاع للتاجر ${firstMerchant} يحتوي على ${selectedOrdersData.length} طلبات. (محاكاة: تم إرسال إشعار للتاجر).`
        });
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedReturns(checked ? returnsAtBranch.map(r => r.id) : []);
    };
    
    const areAllSelected = returnsAtBranch.length > 0 && selectedReturns.length === returnsAtBranch.length;

    return (
        <>
        <Card>
            <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>طلبات الإرجاع للتجار</CardTitle>
                <Button disabled={selectedReturns.length === 0} onClick={() => setShowCreateDialog(true)}>
                <Icon name="PlusCircle" className="ml-2 h-4 w-4" />
                إنشاء كشف إرجاع ({selectedReturns.length})
                </Button>
            </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow>
                        <TableHead className="w-[50px]"><Checkbox checked={areAllSelected} onCheckedChange={handleSelectAll} /></TableHead>
                        <TableHead>رقم الطلب</TableHead>
                        <TableHead>التاجر</TableHead>
                        <TableHead>المستلم</TableHead>
                        <TableHead>تاريخ الطلب</TableHead>
                        <TableHead>الحالة</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                    {returnsAtBranch.map((item) => (
                        <TableRow key={item.id} data-state={selectedReturns.includes(item.id) && "selected"}>
                        <TableCell><Checkbox checked={selectedReturns.includes(item.id)} onCheckedChange={(checked) => setSelectedReturns(prev => checked ? [...prev, item.id] : prev.filter(id => id !== item.id))} /></TableCell>
                        <TableCell><Link href={`/dashboard/orders/${item.id}`} className="font-mono text-primary hover:underline">{item.id}</Link></TableCell>
                        <TableCell>{item.merchant}</TableCell>
                        <TableCell>{item.recipient}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell><Badge variant="secondary">{item.status}</Badge></TableCell>
                        </TableRow>
                    ))}
                    {returnsAtBranch.length === 0 && (
                         <TableRow><TableCell colSpan={6} className="h-24 text-center">لا توجد طلبات مرتجعة بالفرع حالياً.</TableCell></TableRow>
                    )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>إنشاء كشف إرجاع جديد</DialogTitle></DialogHeader>
            <div className="space-y-4"><p>سيتم إنشاء كشف يضم {selectedReturns.length} طلب/طلبات.</p><ul className="list-disc pr-6 text-sm">{returnsAtBranch.filter(r => selectedReturns.includes(r.id)).map(r => (<li key={r.id}><span className="font-mono">{r.id}</span> – {r.merchant}</li>))}</ul></div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>إلغاء</Button>
                <Button onClick={handleCreateSlip}>تأكيد وإنشاء</Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
};
