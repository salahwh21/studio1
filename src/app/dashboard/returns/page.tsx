
'use client';

import { useState, useMemo, useRef } from 'react';
import {
  MoreHorizontal,
  FileText,
  User,
  Truck,
  Archive,
  DollarSign,
  Printer,
  FileDown,
  Store,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/icon';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useStatusesStore } from '@/store/statuses-store';
import { useUsersStore } from '@/store/user-store';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

const getStatusBadge = (status: string, allStatuses: any[]) => {
  const statusInfo = allStatuses.find(s => s.name === status);
  if (statusInfo) {
      return (
          <Badge variant="secondary" style={{backgroundColor: `${statusInfo.color}20`, color: statusInfo.color}}>
              <Icon name={statusInfo.icon as any} className="h-3 w-3 ml-1" />
              {statusInfo.name}
          </Badge>
      );
  }
  return <Badge variant="outline">{status}</Badge>;
};

const ReturnsTable = ({ orders, statuses }: { orders: Order[], statuses: any[] }) => {
    return (
         <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>المرجع</TableHead>
                <TableHead>المستلم</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>المنطقة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الإرجاع</TableHead>
                <TableHead>سبب الإرجاع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.referenceNumber}</TableCell>
                  <TableCell>{order.recipient}</TableCell>
                  <TableCell>{order.phone}</TableCell>
                  <TableCell>{order.region}</TableCell>
                  <TableCell>{getStatusBadge(order.status, statuses)}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.notes || 'غير محدد'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
    );
};

export default function ReturnsManagementPage() {
  const { orders } = useOrdersStore();
  const { statuses } = useStatusesStore();
  const { users } = useUsersStore();
  
  const [activeTab, setActiveTab] = useState<'byDriver' | 'byMerchant'>('byDriver');
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetContent, setSheetContent] = useState<{ merchantName: string, orders: Order[] } | null>(null);

  const returnsByMerchant = useMemo(() => {
    return orders
      .filter(order => order.status === 'راجع')
      .reduce((acc, order) => {
        const merchantName = order.merchant;
        if (!acc[merchantName]) {
          acc[merchantName] = [];
        }
        acc[merchantName].push(order);
        return acc;
      }, {} as Record<string, Order[]>);
  }, [orders]);

  const returnsByDriver = useMemo(() => {
    const outForDeliveryOrders = orders.filter(o => o.status === 'جاري التوصيل' || o.status === 'مؤجل' || o.status === 'لا رد');
    return outForDeliveryOrders.reduce((acc, order) => {
        const driverName = order.driver;
        if (!acc[driverName]) {
            acc[driverName] = [];
        }
        acc[driverName].push(order);
        return acc;
    }, {} as Record<string, Order[]>);
  }, [orders]);
  
  const merchantsWithReturns = Object.keys(returnsByMerchant);
  const driversWithReturns = Object.keys(returnsByDriver);

  // Set initial selection
  useMemo(() => {
      if(activeTab === 'byMerchant' && merchantsWithReturns.length > 0 && !selectedMerchant) {
          setSelectedMerchant(merchantsWithReturns[0]);
      } else if (activeTab === 'byDriver' && driversWithReturns.length > 0 && !selectedDriver) {
          setSelectedDriver(driversWithReturns[0]);
      }
  }, [activeTab, merchantsWithReturns, selectedMerchant, driversWithReturns, selectedDriver]);

  const selectedOrders = useMemo(() => {
      if (activeTab === 'byMerchant' && selectedMerchant) {
          return returnsByMerchant[selectedMerchant] || [];
      }
      if (activeTab === 'byDriver' && selectedDriver) {
          return returnsByDriver[selectedDriver] || [];
      }
      return [];
  }, [activeTab, selectedMerchant, selectedDriver, returnsByMerchant, returnsByDriver]);

  const handleCreateSheet = () => {
    if (!selectedMerchant || !returnsByMerchant[selectedMerchant]) return;
    setSheetContent({
        merchantName: selectedMerchant,
        orders: returnsByMerchant[selectedMerchant]
    });
    setIsSheetOpen(true);
  };
  
  const totalCodReadyForMerchants = useMemo(() => {
      return Object.values(returnsByMerchant).flat().reduce((sum, order) => sum + order.cod, 0);
  }, [returnsByMerchant]);

  const totalOrdersWithDrivers = useMemo(() => {
      return Object.values(returnsByDriver).flat().length;
  }, [returnsByDriver]);


  const renderSidebar = () => {
    const isDriverTab = activeTab === 'byDriver';
    const items = isDriverTab ? driversWithReturns : merchantsWithReturns;
    const selectedItem = isDriverTab ? selectedDriver : selectedMerchant;
    const setSelectedItem = isDriverTab ? setSelectedDriver : setSelectedMerchant;
    const data = isDriverTab ? returnsByDriver : returnsByMerchant;
    const icon = isDriverTab ? <Truck className="h-4 w-4" /> : <Store className="h-4 w-4" />;
    
    return (
        <Card className="h-full">
            <CardHeader className="p-4">
                <CardTitle className="text-lg">
                    {isDriverTab ? 'قائمة السائقين' : 'قائمة التجار'}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                 <ScrollArea className="h-[calc(100vh-20rem)]">
                    {items.map(item => (
                        <button
                            key={item}
                            onClick={() => setSelectedItem(item)}
                            className={cn(
                                "w-full text-right flex justify-between items-center p-4 border-b hover:bg-muted/50 transition-colors",
                                selectedItem === item && "bg-muted"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {icon}
                                <span className="font-medium">{item}</span>
                            </div>
                            <Badge variant="secondary">{data[item]?.length || 0}</Badge>
                        </button>
                    ))}
                    {items.length === 0 && <p className="p-4 text-center text-muted-foreground">لا توجد بيانات.</p>}
                 </ScrollArea>
            </CardContent>
        </Card>
    );
  };


  return (
    <div className="space-y-6">
        <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>كشف تسليم مرتجعات للتاجر: {sheetContent?.merchantName}</DialogTitle>
                    <DialogDescription>
                        هذا الكشف يحتوي على {sheetContent?.orders.length} طلبات جاهزة للتسليم.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto border rounded-md my-4">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>رقم الطلب</TableHead>
                                <TableHead>المستلم</TableHead>
                                <TableHead>سبب الإرجاع</TableHead>
                                <TableHead>قيمة التحصيل</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sheetContent?.orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.id}</TableCell>
                                    <TableCell>{order.recipient}</TableCell>
                                    <TableCell>{order.notes || 'غير محدد'}</TableCell>
                                    <TableCell className="font-medium">{order.cod.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSheetOpen(false)}>إلغاء</Button>
                    <Button><Printer className="ml-2 h-4 w-4" /> تأكيد التسليم والطباعة</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">شحنات عالقة مع السائقين</CardTitle>
                    <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalOrdersWithDrivers}</div>
                    <p className="text-xs text-muted-foreground">شحنة لم يتم استلامها في الفرع بعد</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">مرتجعات جاهزة للتجار</CardTitle>
                    <Archive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Object.values(returnsByMerchant).flat().length}</div>
                    <p className="text-xs text-muted-foreground">شحنة في الفرع بانتظار تسليمها للتاجر</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">قيمة المرتجعات الجاهزة</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalCodReadyForMerchants.toFixed(2)} د.أ</div>
                     <p className="text-xs text-muted-foreground">إجمالي قيمة البضاعة المرتجعة للفرع</p>
                </CardContent>
            </Card>
        </div>


        <Card>
            <CardHeader className="flex-row items-center justify-between gap-4 p-4 md:p-6">
                <div>
                    <CardTitle className="text-2xl">إدارة المرتجعات</CardTitle>
                    <CardDescription>تتبع وإدارة جميع الشحنات المرتجعة بكفاءة.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-3">
                        {renderSidebar()}
                    </div>
                    <div className="md:col-span-9">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>
                                        {activeTab === 'byMerchant' ? `مرتجعات التاجر: ${selectedMerchant}` : `شحنات السائق: ${selectedDriver}`}
                                    </CardTitle>
                                     <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" onClick={handleCreateSheet} disabled={activeTab !== 'byMerchant' || !selectedMerchant}>
                                            <FileText className="ml-2 h-4 w-4" /> إنشاء كشف مرتجع للتاجر
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                             <CardContent className="p-0">
                                <ReturnsTable orders={selectedOrders} statuses={statuses} />
                            </CardContent>
                             <CardFooter className="p-2 border-t">
                                <span className="text-xs text-muted-foreground">
                                    إجمالي {selectedOrders.length} طلبات
                                </span>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

    