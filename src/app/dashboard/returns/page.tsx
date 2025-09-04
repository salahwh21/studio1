
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

export default function ReturnsManagementPage() {
  const { orders } = useOrdersStore();
  const { statuses } = useStatusesStore();
  
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const returnsData = useMemo(() => {
    return orders
      .filter(order => order.status === 'راجع' || order.status.includes('مرتجع'))
      .map(order => ({
        ...order,
        reason: 'سبب المرتجع', // Placeholder, you might want to add this to your Order model
      }));
  }, [orders]);


  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRows(returnsData.map(r => r.id));
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

  const isAllSelected = selectedRows.length === returnsData.length && returnsData.length > 0;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < returnsData.length;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 p-4 md:p-6">
        <div className="flex items-center gap-4">
          {selectedRows.length > 0 ? (
            <>
              <span className="text-sm text-muted-foreground">{selectedRows.length} محدد</span>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Button variant="outline" size="sm" className="gap-1"><Icon name="RefreshCw" className="h-4 w-4" /> تغيير الحالة</Button>
              <Button variant="outline" size="sm" className="gap-1"><Icon name="Truck" className="h-4 w-4" /> تسليم للتاجر</Button>
              <Button variant="outline" size="sm" className="gap-1"><Icon name="Printer" className="h-4 w-4" /> طباعة كشف</Button>
            </>
          ) : (
             <div>
                <CardTitle className="text-2xl">إدارة المرتجعات</CardTitle>
                <CardDescription>تتبع وإدارة جميع الشحنات المرتجعة بكفاءة.</CardDescription>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="relative w-full max-w-xs hidden md:block">
            <Icon name="Search" className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث برقم الطلب، العميل..." className="pr-8" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Icon name="ListFilter" className="h-4 w-4" />
                <span className="hidden sm:inline">تصفية</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>التصفية حسب الحالة</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>الكل</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>بانتظار التحصيل</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>في المستودع</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>بانتظار التسليم</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>تم التسليم للتاجر</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
           <Button variant="outline" size="sm" className="gap-1">
                <Icon name="FileText" className="h-4 w-4" />
                <span className="hidden sm:inline">تصدير</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead padding="checkbox">
                  <Checkbox onCheckedChange={handleSelectAll} checked={isAllSelected || isIndeterminate} aria-label="Select all rows" />
                </TableHead>
                <TableHead className="text-center whitespace-nowrap">رقم الطلب</TableHead>
                <TableHead className="text-center whitespace-nowrap">العميل</TableHead>
                <TableHead className="text-center whitespace-nowrap">التاجر</TableHead>
                <TableHead className="text-center whitespace-nowrap">السائق</TableHead>
                <TableHead className="text-center whitespace-nowrap">تاريخ الإرجاع</TableHead>
                <TableHead className="text-center whitespace-nowrap">الحالة</TableHead>
                <TableHead className="text-center whitespace-nowrap">سبب الإرجاع</TableHead>
                <TableHead><span className="sr-only">إجراءات</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returnsData.length > 0 ? returnsData.map((item) => (
                <TableRow key={item.id} data-state={selectedRows.includes(item.id) && "selected"}>
                  <TableCell padding="checkbox">
                    <Checkbox onCheckedChange={(checked) => handleSelectRow(item.id, !!checked)} checked={selectedRows.includes(item.id)} aria-label={`Select row ${item.id}`} />
                  </TableCell>
                  <TableCell className="font-medium text-center whitespace-nowrap">{item.id}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">{item.recipient}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">{item.merchant}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">{item.driver}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">{item.date}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">{getStatusBadge(item.status, statuses)}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">{item.reason}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">فتح القائمة</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                        <DropdownMenuItem>عرض تفاصيل الطلب</DropdownMenuItem>
                        <DropdownMenuItem>تحديث الحالة</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">حذف المرتجع</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      لا توجد مرتجعات لعرضها.
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
