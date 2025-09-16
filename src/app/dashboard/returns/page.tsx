
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FileText,
  Store,
  Search,
  ArrowLeft,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
import Icon from '@/components/icon';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useStatusesStore } from '@/store/statuses-store';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

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
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    
    const isAllSelected = orders.length > 0 && selectedRows.length === orders.length;
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < orders.length;

    const handleSelectAll = useCallback((checked: boolean) => {
        setSelectedRows(checked ? orders.map(order => order.id) : []);
    }, [orders]);
    
    const handleSelectionChange = useCallback((id: string, isSelected: boolean) => {
      setSelectedRows(prev => 
        isSelected ? [...prev, id] : prev.filter(rowId => rowId !== id)
      );
  }, []);

    return (
        <div className="overflow-x-auto">
            <div className="flex items-center gap-2 mb-4">
                <Button variant="default" size="sm" disabled={selectedRows.length === 0}>
                    إنشاء كشف مرتجع للتاجر
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center border-l">
                            <Checkbox
                                checked={isAllSelected}
                                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                ref={(input: HTMLButtonElement | null) => {
                                  if (input) input.indeterminate = isIndeterminate;
                                }}
                                aria-label="Select all rows"
                            />
                        </TableHead>
                        <TableHead>#</TableHead>
                        <TableHead>رقم الطلب</TableHead>
                        <TableHead>المصدر</TableHead>
                        <TableHead>المرجع</TableHead>
                        <TableHead>المستلم</TableHead>
                        <TableHead>الهاتف</TableHead>
                        <TableHead>العنوان</TableHead>
                        <TableHead>المنطقة</TableHead>
                        <TableHead>المدينة</TableHead>
                        <TableHead>التاجر</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الحالة السابقة</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>ملاحظات/سبب الإرجاع</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {orders.map((order, index) => (
                    <TableRow key={order.id} data-state={selectedRows.includes(order.id) && "selected"}>
                    <TableCell className="text-center border-l">
                        <Checkbox
                            checked={selectedRows.includes(order.id)}
                            onCheckedChange={(checked) => handleSelectionChange(order.id, !!checked)}
                        />
                    </TableCell>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium font-mono text-primary hover:underline">
                        <Link href={`/dashboard/orders/${order.id}`}>{order.id}</Link>
                    </TableCell>
                    <TableCell>{order.source}</TableCell>
                    <TableCell>{order.referenceNumber}</TableCell>
                    <TableCell>{order.recipient}</TableCell>
                    <TableCell>{order.phone}</TableCell>
                    <TableCell>{order.address}</TableCell>
                    <TableCell>{order.region}</TableCell>
                    <TableCell>{order.city}</TableCell>
                    <TableCell>{order.merchant}</TableCell>
                    <TableCell>{getStatusBadge(order.status, statuses)}</TableCell>
                    <TableCell>{order.previousStatus ? getStatusBadge(order.previousStatus, statuses) : '-'}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString('ar-JO')}</TableCell>
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
  
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
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
  
  const merchantsWithReturns = Object.keys(returnsByMerchant);

  useEffect(() => {
      if (merchantsWithReturns.length > 0 && !selectedMerchant) {
          setSelectedMerchant(merchantsWithReturns[0]);
      }
  }, [merchantsWithReturns, selectedMerchant]);
  
  const selectedOrders = useMemo(() => {
      const ordersForMerchant = selectedMerchant ? returnsByMerchant[selectedMerchant] || [] : [];
      if (!searchQuery) {
          return ordersForMerchant;
      }
      return ordersForMerchant.filter(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.referenceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [selectedMerchant, returnsByMerchant, searchQuery]);


  const renderSidebar = () => {
    return (
        <Card className="h-full">
            <CardHeader className="p-4">
                <CardTitle className="text-lg">قائمة التجار</CardTitle>
                <CardDescription>لديهم مرتجعات في الفرع</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                 <ScrollArea className="h-[calc(100vh-16rem)]">
                    {merchantsWithReturns.map(merchant => (
                        <button
                            key={merchant}
                            onClick={() => setSelectedMerchant(merchant)}
                            className={cn(
                                "w-full text-right flex justify-between items-center p-4 border-b hover:bg-muted/50 transition-colors",
                                selectedMerchant === merchant && "bg-primary/10 text-primary"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Store className="h-4 w-4" />
                                <span className="font-medium">{merchant}</span>
                            </div>
                            <Badge variant={selectedMerchant === merchant ? "default" : "secondary"}>
                                {returnsByMerchant[merchant]?.length || 0}
                            </Badge>
                        </button>
                    ))}
                    {merchantsWithReturns.length === 0 && <p className="p-4 text-center text-muted-foreground">لا توجد مرتجعات حالياً.</p>}
                 </ScrollArea>
            </CardContent>
        </Card>
    );
  };


  return (
    <div className="space-y-6">
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-4 p-4 md:p-6">
                <div>
                    <CardTitle className="text-2xl">إدارة المرتجعات</CardTitle>
                    <CardDescription>تتبع وإدارة جميع الشحنات المرتجعة للفرع.</CardDescription>
                </div>
                 <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
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
                                        مرتجعات التاجر: <span className="text-primary">{selectedMerchant}</span>
                                    </CardTitle>
                                     <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input 
                                                placeholder="بحث في طلبات التاجر..." 
                                                className="pr-10"
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <Button size="sm" variant="outline">
                                            <FileText className="ml-2 h-4 w-4" /> تصدير الكشف
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                             <CardContent>
                                <ReturnsTable 
                                    orders={selectedOrders} 
                                    statuses={statuses} 
                                />
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

