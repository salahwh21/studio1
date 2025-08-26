
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ReturnsPage() {
  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
          <TabsTrigger value="approved">موافق عليه</TabsTrigger>
          <TabsTrigger value="completed" className="hidden sm:flex">مكتمل</TabsTrigger>
          <TabsTrigger value="rejected" className="hidden sm:flex">مرفوض</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  تصفية
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>تصفية حسب</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>التاريخ</DropdownMenuItem>
                <DropdownMenuItem>السائق</DropdownMenuItem>
                <DropdownMenuItem>التاجر</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
           <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              تصدير
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              مرتجع جديد
            </span>
          </Button>
        </div>
      </div>
      <TabsContent value="all">
        <Card>
          <CardHeader>
            <CardTitle>المرتجعات</CardTitle>
            <CardDescription>
              تتبع وإدارة جميع طلبات إرجاع العملاء من الاستلام وحتى التسليم للتاجر.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>معرف المرتجع</TableHead>
                  <TableHead>معرف الطلب</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead className="hidden md:table-cell">التاريخ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="hidden md:table-cell">السبب</TableHead>
                  <TableHead>
                    <span className="sr-only">إجراءات</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                    {id: 1, orderId: 3210, customer: 'فاطمة الخان', date: '2023-07-11', status: 'pending', reason: 'منتج خاطئ'},
                    {id: 2, orderId: 3211, customer: 'يوسف إبراهيم', date: '2023-07-12', status: 'approved', reason: 'تالف عند الوصول'},
                    {id: 3, orderId: 3212, customer: 'عائشة بكر', date: '2023-07-13', status: 'rejected', reason: 'تم فتح المنتج'},
                    {id: 4, orderId: 3213, customer: 'علي الأحمد', date: '2023-07-14', status: 'completed', reason: 'لم يعد مطلوباً'},
                    {id: 5, orderId: 3214, customer: 'محمد الخالد', date: '2023-07-15', status: 'pending', reason: 'مقاس غير صحيح'},
                    {id: 6, orderId: 3215, customer: 'نورة عبدالله', date: '2023-07-16', status: 'approved', reason: 'منتج خاطئ'},
                    {id: 7, orderId: 3216, customer: 'خالد الفيصل', date: '2023-07-17', status: 'completed', reason: 'تالف عند الوصول'},
                    {id: 8, orderId: 3217, customer: 'سارة تركي', date: '2023-07-18', status: 'rejected', reason: 'تأخير في التسليم'},
                ].map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">#R00{item.id}</TableCell>
                    <TableCell>#{item.orderId}</TableCell>
                    <TableCell>{item.customer}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.date}
                    </TableCell>
                    <TableCell>
                       <Badge variant={
                        item.status === 'pending' ? 'secondary' : 
                        item.status === 'approved' ? 'default' : 
                        item.status === 'completed' ? 'outline' :
                        'destructive'
                        }>
                        {
                        item.status === 'pending' ? 'قيد الانتظار' : 
                        item.status === 'approved' ? 'موافق عليه' :
                        item.status === 'completed' ? 'مكتمل' :
                        'مرفوض'
                        }
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{item.reason}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">فتح القائمة</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                          <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
                          {item.status === 'pending' && <DropdownMenuItem>الموافقة على الإرجاع</DropdownMenuItem>}
                          {item.status === 'pending' && <DropdownMenuItem>رفض الإرجاع</DropdownMenuItem>}
                          {item.status === 'approved' && <DropdownMenuItem>إنشاء كشف استلام</DropdownMenuItem>}
                          {item.status === 'completed' && <DropdownMenuItem>إنشاء كشف تسليم</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

    