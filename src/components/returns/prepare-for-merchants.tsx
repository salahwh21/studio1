import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PrintablePolicy } from '@/components/printable-policy';
import { type SavedTemplate, readyTemplates } from '@/contexts/SettingsContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export const PrepareForMerchants = () => {
    const { orders } = useOrdersStore();
    const { users } = useUsersStore();
    const { merchantSlips, addMerchantSlip } = useReturnsStore();
    const { toast } = useToast();
    const [selectedReturns, setSelectedReturns] = useState<string[]>([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);

    // Print Dialog State
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
    const [availableTemplates, setAvailableTemplates] = useState<SavedTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);
    const printablePolicyRef = useRef<{ handleExport: () => void; handleDirectPrint: (order: any, type: 'zpl' | 'escpos') => Promise<void> }>(null);


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

    // Load print templates
    useEffect(() => {
        try {
            const savedTemplatesJson = localStorage.getItem('policyTemplates');
            const userTemplates = savedTemplatesJson ? JSON.parse(savedTemplatesJson) : [];
            setAvailableTemplates([...readyTemplates, ...userTemplates]);
        } catch (e) {
            setAvailableTemplates(readyTemplates);
        }
    }, []);

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
    
    const handlePrintClick = () => {
        if (selectedReturns.length === 0) {
            toast({
                variant: "destructive",
                title: "لم يتم تحديد طلبات",
                description: "الرجاء تحديد طلب واحد على الأقل للطباعة."
            });
            return;
        }
        setSelectedTemplate(availableTemplates.length > 0 ? availableTemplates[0] : null);
        setIsPrintDialogOpen(true);
    };

    return (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" dir="rtl">
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
                                            "w-full p-3 rounded-lg flex items-center gap-3 text-right",
                                            selectedMerchant === name ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                        )}
                                    >
                                       <Avatar className="h-9 w-9">
                                            <AvatarImage src={user?.avatar} />
                                            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-sm flex-1">{name}</span>
                                        <Badge variant={selectedMerchant === name ? 'secondary' : 'default'} className="w-8 h-6 justify-center">{orderCount}</Badge>
                                    </button>
                                ))}
                                {merchantData.length === 0 && <p className="text-center text-muted-foreground p-4">لا يوجد مرتجعات.</p>}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
            
             <div className="lg:col-span-9 xl:col-span-10">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center flex-wrap gap-2">
                            <div>
                                <CardTitle>مرتجعات التاجر: {selectedMerchant || 'لم يتم الاختيار'}</CardTitle>
                                <CardDescription>حدد الطلبات المراد إضافتها لكشف الإرجاع.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" disabled={selectedReturns.length === 0}>
                                            <Icon name="Printer" className="ml-2 h-4 w-4" />
                                            إجراءات الطباعة
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onSelect={handlePrintClick}>
                                            <Icon name="ReceiptText" className="ml-2 h-4 w-4" />
                                            طباعة بوالص
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => toast({ title: "قيد التطوير" })}>
                                            <Icon name="FileDown" className="ml-2 h-4 w-4" />
                                            تصدير بيانات
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button disabled={selectedReturns.length === 0} onClick={() => setShowCreateDialog(true)}>
                                    <Icon name="PlusCircle" className="ml-2 h-4 w-4" />
                                    إنشاء كشف إرجاع ({selectedReturns.length})
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12 text-center whitespace-nowrap"><Checkbox checked={areAllSelected} onCheckedChange={handleSelectAll} /></TableHead>
                                    <TableHead className="border-l text-center whitespace-nowrap">رقم الطلب</TableHead>
                                    <TableHead className="border-l text-center whitespace-nowrap">المستلم</TableHead>
                                    <TableHead className="border-l text-center whitespace-nowrap">تاريخ الإرجاع</TableHead>
                                    <TableHead className="border-l text-center whitespace-nowrap">السائق الأصلي</TableHead>
                                    <TableHead className="border-l text-center whitespace-nowrap">سبب الإرجاع</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!selectedMerchant ? (
                                    <TableRow><TableCell colSpan={6} className="h-48 text-center text-muted-foreground">الرجاء اختيار تاجر لعرض مرتجعاته.</TableCell></TableRow>
                                ) : selectedMerchantOrders.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="h-48 text-center text-muted-foreground">لا توجد مرتجعات جاهزة لهذا التاجر.</TableCell></TableRow>
                                ) : (
                                    selectedMerchantOrders.map((item) => (
                                        <TableRow key={item.id} data-state={selectedReturns.includes(item.id) && "selected"}>
                                            <TableCell className="text-center whitespace-nowrap"><Checkbox checked={selectedReturns.includes(item.id)} onCheckedChange={(checked) => setSelectedReturns(prev => checked ? [...prev, item.id] : prev.filter(id => id !== item.id))} /></TableCell>
                                            <TableCell className="border-l text-center whitespace-nowrap"><Link href={`/dashboard/orders/${item.id}`} className="font-mono text-primary hover:underline">{item.id}</Link></TableCell>
                                            <TableCell className="border-l text-center whitespace-nowrap">{item.recipient}</TableCell>
                                            <TableCell className="border-l text-center whitespace-nowrap">{item.date}</TableCell>
                                            <TableCell className="border-l text-center whitespace-nowrap">{item.driver}</TableCell>
                                            <TableCell className="border-l text-center whitespace-nowrap"><Badge variant="outline">{item.previousStatus}</Badge></TableCell>
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
        <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
            <DialogTitle>طباعة البوالص</DialogTitle>
            <DialogDescription>اختر القالب وقم بمعاينة البوالص قبل الطباعة النهائية.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 min-h-0">
                <div className="md:col-span-1 flex flex-col gap-4">
                    <Card>
                        <CardHeader className='p-4'><CardTitle className='text-base'>1. اختر القالب</CardTitle></CardHeader>
                        <CardContent className='p-4'>
                            <RadioGroup
                                value={selectedTemplate?.id}
                                onValueChange={(id) => setSelectedTemplate(availableTemplates.find(t => t.id === id) || null)}
                            >
                                {availableTemplates.map(template => (
                                    <div key={template.id} className="flex items-center space-x-2 space-x-reverse">
                                        <RadioGroupItem value={template.id} id={`print-${template.id}`} />
                                        <Label htmlFor={`print-${template.id}`}>{template.name}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className='p-4'><CardTitle className='text-base'>2. إجراء الطباعة</CardTitle></CardHeader>
                        <CardContent className='p-4 flex flex-col gap-2'>
                             <Button onClick={() => printablePolicyRef.current?.handleExport()} className="w-full">
                                <Icon name="Save" className="ml-2 h-4 w-4 inline" /> طباعة PDF
                            </Button>
                            <Button variant="secondary" onClick={() => printablePolicyRef.current?.handleDirectPrint(orders.find(o => o.id === selectedReturns[0]), 'zpl')}>
                                <Icon name="Printer" className="ml-2 h-4 w-4 inline" /> طباعة ZPL (أول طلب)
                            </Button>
                             <Button variant="secondary" onClick={() => printablePolicyRef.current?.handleDirectPrint(orders.find(o => o.id === selectedReturns[0]), 'escpos')}>
                                <Icon name="Printer" className="ml-2 h-4 w-4 inline" /> طباعة ESC/POS (أول طلب)
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                 <div className="md:col-span-3 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    <ScrollArea className="h-full w-full">
                        <div className="p-4 flex items-center justify-center">
                            {selectedTemplate && (
                                <PrintablePolicy ref={printablePolicyRef} orders={orders.filter(o => selectedReturns.includes(o.id))} template={selectedTemplate} />
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </DialogContent>
    </Dialog>
    </>
  );
};
