
'use client';

import { useState, useMemo } from 'react';
import {
  MoreHorizontal,
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

const MerchantReturnsTable = ({ orders, statuses }: { orders: Order[], statuses: any[] }) => {
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows(orders.map(o => o.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedRows(prev => [...prev, id]);
        } else {
            setSelectedRows(prev => prev.filter(rowId => rowId !== id));
        }
    };

    const isAllSelected = selectedRows.length === orders.length && orders.length > 0;
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < orders.length;

    return (
         <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox onCheckedChange={(c) => handleSelectAll(!!c)} checked={isAllSelected || isIndeterminate} />
                </TableHead>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>المرجع</TableHead>
                <TableHead>المستلم</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>المنطقة</TableHead>
                <TableHead>المدينة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الإرجاع</TableHead>
                <TableHead>سبب الإرجاع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                   <TableCell>
                    <Checkbox onCheckedChange={(c) => handleSelectRow(order.id, !!c)} checked={selectedRows.includes(order.id)} />
                  </TableCell>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.referenceNumber}</TableCell>
                  <TableCell>{order.recipient}</TableCell>
                  <TableCell>{order.phone}</TableCell>
                  <TableCell>{order.region}</TableCell>
                  <TableCell>{order.city}</TableCell>
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

  const merchants = Object.keys(returnsByMerchant);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 p-4 md:p-6">
        <div>
            <CardTitle className="text-2xl">إدارة المرتجعات</CardTitle>
            <CardDescription>تتبع وإدارة جميع الشحنات المرتجعة بكفاءة.</CardDescription>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="relative w-full max-w-xs hidden md:block">
            <Icon name="Search" className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث برقم الطلب، العميل..." className="pr-8" />
          </div>
           <Button variant="outline" size="sm" className="gap-1">
                <Icon name="FileText" className="h-4 w-4" />
                <span className="hidden sm:inline">تصدير</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
          <Accordion type="multiple" className="w-full">
            {merchants.map(merchant => (
                <AccordionItem value={merchant} key={merchant}>
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                            <Icon name="Store" className="h-5 w-5 text-muted-foreground" />
                            <span className="font-semibold">{merchant}</span>
                            <Badge variant="secondary">{returnsByMerchant[merchant].length} مرتجعات</Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-muted/20">
                       <div className="p-4">
                         <MerchantReturnsTable orders={returnsByMerchant[merchant]} statuses={statuses} />
                       </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
         </Accordion>
         {merchants.length === 0 && (
            <div className="text-center p-10 text-muted-foreground">
                <Icon name="PackageCheck" className="mx-auto h-12 w-12 mb-4" />
                <p>لا توجد مرتجعات حالية في الفرع.</p>
            </div>
         )}
      </CardContent>
    </Card>
  );
}



