
'use client';

import { useState } from 'react';
import {
  File,
  ListFilter,
  MoreHorizontal,
  Search,
  ChevronDown,
  Undo2,
  Printer,
  RefreshCw,
  Truck
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

const returnsData = [
  { id: '#R3213', orderId: '#3213', customer: 'فاطمة علي', merchant: 'تاجر ج', driver: 'يوسف إبراهيم', status: 'at_warehouse', date: '2023-08-14', reason: 'العميل رفض الاستلام' },
  { id: '#R3214', orderId: '#3214', customer: 'حسن محمود', merchant: 'تاجر ب', driver: 'محمد الخالد', status: 'pending_collection', date: '2023-08-13', reason: 'لم يتم الرد على الهاتف' },
  { id: '#R3209', orderId: '#3209', customer: 'علي حسين', merchant: 'تاجر أ', driver: 'علي الأحمد', status: 'delivered_to_merchant', date: '2023-08-12', reason: 'المنتج غير مطابق' },
  { id: '#R3208', orderId: '#3208', customer: 'مريم أحمد', merchant: 'تاجر د', driver: 'عائشة بكر', status: 'at_warehouse', date: '2023-08-15', reason: 'عنوان غير واضح' },
  { id: '#R3207', orderId: '#3207', customer: 'زينب عامر', merchant: 'تاجر ج', driver: 'فاطمة الزهراء', status: 'pending_collection', date: '2023-08-14', reason: 'طلب العميل الإلغاء' },
  { id: '#R3206', orderId: '#3206', customer: 'خالد وليد', merchant: 'تاجر د', driver: 'عائشة بكر', status: 'delivered_to_merchant', date: '2023-08-15', reason: 'العميل خارج التغطية' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending_collection': return <Badge variant="secondary" className="bg-orange-100 text-orange-800">بانتظار التحصيل</Badge>;
    case 'at_warehouse': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">في المستودع</Badge>;
    case 'pending_delivery': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">بانتظار التسليم</Badge>;
    case 'delivered_to_merchant': return <Badge variant="default" className="bg-green-100 text-green-800">تم التسليم للتاجر</Badge>;
    default: return <Badge variant="outline">غير معروف</Badge>;
  }
};

export default function ReturnsManagementPage() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

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
              <Button variant="outline" size="sm" className="gap-1"><RefreshCw className="h-4 w-4" /> تغيير الحالة</Button>
              <Button variant="outline" size="sm" className="gap-1"><Truck className="h-4 w-4" /> تسليم للتاجر</Button>
              <Button variant="outline" size="sm" className="gap-1"><Printer className="h-4 w-4" /> طباعة كشف</Button>
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
            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث برقم الطلب، العميل..." className="pr-8" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <ListFilter className="h-4 w-4" />
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
                <File className="h-4 w-4" />
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
                <TableHead className="text-center whitespace-nowrap">رقم المرتجع</TableHead>
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
                  <TableCell className="font-medium text-center whitespace-nowrap">{item.orderId}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">{item.customer}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">{item.merchant}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">{item.driver}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">{item.date}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">{getStatusBadge(item.status)}</TableCell>
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
