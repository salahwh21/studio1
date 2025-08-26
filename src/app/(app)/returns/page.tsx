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
          <TabsTrigger value="pending">قيد الانتظar</TabsTrigger>
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
                <DropdownMenuItem>العميل</DropdownMenuItem>
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
              تتبع وإدارة جميع طلبات إرجاع العملاء.
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
                {[...Array(8)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">#R00{i+1}</TableCell>
                    <TableCell>#321{i}</TableCell>
                    <TableCell>فاطمة الخان</TableCell>
                    <TableCell className="hidden md:table-cell">
                      2023-07-1{i + 1}
                    </TableCell>
                    <TableCell>
                       <Badge variant={i % 3 === 0 ? "default" : i % 3 === 1 ? "outline" : "destructive"}>
                        {i % 3 === 0 ? 'قيد الانتظار' : i % 3 === 1 ? 'موافق عليه' : 'مرفوض'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">منتج خاطئ</TableCell>
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
                          <DropdownMenuItem>الموافقة على الإرجاع</DropdownMenuItem>
                          <DropdownMenuItem>رفض الإرجاع</DropdownMenuItem>
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

    