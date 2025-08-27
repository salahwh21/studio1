
'use client';

import { useState } from 'react';
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Search,
  ChevronDown,
  Trash2,
  Printer,
  UserPlus,
  RefreshCw
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from '@/components/ui/separator';

const ordersData = [
  { id: '#3210', customer: 'محمد جاسم', phone: '07701112233', merchant: 'تاجر أ', driver: 'علي الأحمد', status: 'delivered', city: 'عمان', area: 'الصويفية', fee: 5, date: '2023-08-15', notes: 'اتصل قبل الوصول', priority: false, delayed: false },
  { id: '#3211', customer: 'سارة كريم', phone: '07802223344', merchant: 'تاجر ب', driver: 'فاطمة الزهراء', status: 'in_delivery', city: 'عمان', area: 'خلدا', fee: 5, date: '2023-08-15', notes: '', priority: true, delayed: false },
  { id: '#3212', customer: 'أحمد خالد', phone: '07903334455', merchant: 'تاجر أ', driver: 'علي الأحمد', status: 'pending', city: 'عمان', area: 'تلاع العلي', fee: 5, date: '2023-08-14', notes: 'أولوية عالية', priority: true, delayed: false },
  { id: '#3213', customer: 'فاطمة علي', phone: '07714445566', merchant: 'تاجر ج', driver: 'يوسف إبراهيم', status: 'returned', city: 'الزرقاء', area: 'حي معصوم', fee: 8, date: '2023-08-14', notes: 'العميل رفض الاستلام', priority: false, delayed: false },
  { id: '#3214', customer: 'حسن محمود', phone: '07815556677', merchant: 'تاجر ب', driver: 'محمد الخالد', status: 'delayed', city: 'عمان', area: 'الجبيهة', fee: 6, date: '2023-08-13', notes: 'تأخير بسبب الازدحام', priority: false, delayed: true },
  { id: '#3215', customer: 'نور الهدى', phone: '07916667788', merchant: 'تاجر أ', driver: 'علي الأحمد', status: 'delivered', city: 'إربد', area: 'الحي الشرقي', fee: 10, date: '2023-08-12', notes: '', priority: false, delayed: false },
  { id: '#3216', customer: 'خالد وليد', phone: '07727778899', merchant: 'تاجر د', driver: 'عائشة بكر', status: 'in_delivery', city: 'عمان', area: 'العبدلي', fee: 5, date: '2023-08-15', notes: '', priority: false, delayed: false },
  { id: '#3217', customer: 'زينب عامر', phone: '07828889900', merchant: 'تاجر ج', driver: 'فاطمة الزهراء', status: 'pending', city: 'العقبة', area: 'البلد القديمة', fee: 9, date: '2023-08-14', notes: 'توصيل في المساء', priority: false, delayed: false },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'delivered': return <Badge variant="default" className="bg-green-100 text-green-800">تم التوصيل</Badge>;
    case 'in_delivery': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">قيد التوصيل</Badge>;
    case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">قيد الانتظار</Badge>;
    case 'returned': return <Badge variant="destructive">مرتجع</Badge>;
    case 'delayed': return <Badge variant="destructive" className="bg-red-200 text-red-900">متأخر</Badge>;
    default: return <Badge variant="outline">غير معروف</Badge>;
  }
};

const FiltersPanel = () => {
    const filterGroups = [
        { name: "الحالة", options: ["الكل", "قيد الانتظار", "قيد التوصيل", "تم التوصيل", "مرتجع", "متأخر"] },
        { name: "التاجر", options: ["تاجر أ", "تاجر ب", "تاجر ج", "تاجر د"] },
        { name: "السائق", options: ["علي الأحمد", "فاطمة الزهراء", "محمد الخالد", "يوسف إبراهيم", "عائشة بكر"] },
        { name: "المدينة", options: ["عمان", "الزرقاء", "إربد", "العقبة"] },
        { name: "المنطقة", options: ["الصويفية", "خلدا", "تلاع العلي", "حي معصوم", "الجبيهة", "الحي الشرقي", "العبدلي", "البلد القديمة"] }
    ];

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><ListFilter className="h-5 w-5"/> تصفية الطلبات</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <Accordion type="multiple" defaultValue={["الحالة", "المدينة"]} className="w-full">
                    {filterGroups.map(group => (
                        <AccordionItem value={group.name} key={group.name}>
                            <AccordionTrigger>{group.name}</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2 mt-2">
                                    {group.options.map(option => (
                                         <div key={option} className="flex items-center space-x-2 space-x-reverse">
                                            <Checkbox id={`${group.name}-${option}`} />
                                            <label htmlFor={`${group.name}-${option}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {option}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
};

export default function OrdersPage() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRows(ordersData.map(order => order.id));
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

  const isAllSelected = selectedRows.length === ordersData.length && ordersData.length > 0;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < ordersData.length;


  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <div className="hidden lg:block lg:col-span-1">
        <FiltersPanel />
      </div>
      <div className="col-span-1 lg:col-span-4">
        <div className="flex flex-col gap-4">
          
          {/* Mobile Filters */}
          <div className="lg:hidden">
              <Accordion type="single" collapsible>
                  <AccordionItem value="filters">
                      <AccordionTrigger>
                          <div className='flex items-center gap-2'>
                            <ListFilter className="h-4 w-4" /> عرض الفلاتر
                          </div>
                      </AccordionTrigger>
                      <AccordionContent>
                          <FiltersPanel />
                      </AccordionContent>
                  </AccordionItem>
              </Accordion>
          </div>
          
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-4 p-4">
               <div className="flex items-center gap-2">
                  {selectedRows.length > 0 ? (
                    <>
                       <span className="text-sm text-muted-foreground">{selectedRows.length} محدد</span>
                       <Separator orientation="vertical" className="h-6 mx-2"/>
                        <Button variant="outline" size="sm" className="gap-1"><UserPlus className="h-4 w-4"/> تعيين سائق</Button>
                        <Button variant="outline" size="sm" className="gap-1"><RefreshCw className="h-4 w-4"/> تغيير الحالة</Button>
                        <Button variant="outline" size="sm" className="gap-1"><Printer className="h-4 w-4"/> طباعة</Button>
                        <Button variant="destructive" size="sm" className="gap-1"><Trash2 className="h-4 w-4"/> حذف</Button>
                    </>
                  ) : (
                     <CardTitle className="text-xl">الطلبات</CardTitle>
                  )}
               </div>

                <div className="flex items-center gap-2 ml-auto">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="بحث بالرقم، اسم العميل..." className="pr-8" />
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button variant="outline" className="gap-1">
                                تجميع حسب <ChevronDown className="h-4 w-4" />
                           </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem>الحالة</DropdownMenuItem>
                           <DropdownMenuItem>السائق</DropdownMenuItem>
                           <DropdownMenuItem>التاجر</DropdownMenuItem>
                           <DropdownMenuItem>المدينة</DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                    <Button size="sm" className="h-9 gap-1">
                        <PlusCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">إضافة طلب</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
               {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead padding="checkbox">
                        <Checkbox onCheckedChange={handleSelectAll} checked={isAllSelected || isIndeterminate} aria-label="Select all rows" />
                      </TableHead>
                      <TableHead>رقم الطلب</TableHead>
                      <TableHead>العميل</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>التاجر</TableHead>
                      <TableHead>السائق</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>المدينة</TableHead>
                      <TableHead>المنطقة</TableHead>
                      <TableHead>رسوم التوصيل</TableHead>
                      <TableHead>تاريخ الطلب</TableHead>
                      <TableHead>ملاحظات</TableHead>
                      <TableHead><span className="sr-only">إجراءات</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersData.map((order) => (
                      <TableRow 
                        key={order.id} 
                        data-state={selectedRows.includes(order.id) && "selected"}
                        className={
                            order.delayed ? "bg-red-50 dark:bg-red-900/20" : 
                            order.priority ? "border-l-4 border-orange-400 dark:border-orange-600" : ""
                        }
                      >
                         <TableCell padding="checkbox">
                           <Checkbox onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)} checked={selectedRows.includes(order.id)} aria-label={`Select row ${order.id}`} />
                        </TableCell>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.phone}</TableCell>
                        <TableCell>{order.merchant}</TableCell>
                        <TableCell>{order.driver}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{order.city}</TableCell>
                        <TableCell>{order.area}</TableCell>
                        <TableCell>{order.fee.toLocaleString('ar-JO')} د.أ</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.notes}</TableCell>
                        <TableCell>
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
                              <DropdownMenuItem>تعديل</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">حذف</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

               {/* Mobile Card View */}
               <div className="md:hidden space-y-4 p-4">
                  {ordersData.map(order => (
                      <Card key={order.id} className={`overflow-hidden ${order.delayed ? "bg-red-50" : ""} ${order.priority ? "border-orange-400 border-l-4" : ""}`}>
                          <CardHeader className="flex flex-row items-center justify-between p-4">
                              <div>
                                 <CardTitle className="text-base">{order.id}</CardTitle>
                                 <CardDescription>{order.customer}</CardDescription>
                              </div>
                              <div className="text-left">
                                  {getStatusBadge(order.status)}
                                  <p className="font-semibold text-sm mt-1">{order.fee.toLocaleString('ar-JO')} د.أ</p>
                              </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                              <p>{order.phone}</p>
                              <p>{order.city}، {order.area}</p>
                          </CardContent>
                      </Card>
                  ))}
               </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
