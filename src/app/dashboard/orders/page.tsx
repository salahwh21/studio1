
'use client';

import { useState } from 'react';
import {
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Search,
  ChevronDown,
  Trash2,
  Printer,
  UserPlus,
  RefreshCw,
  XCircle,
  ArrowDownUp,
  FileDown,
  CheckCircle2,
  Phone,
  Clock,
  Undo2,
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
  CardFooter
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';

const ordersData = [
  { id: '#3210', source: 'Shopify', recipient: 'محمد جاسم', phone: '07701112233', city: 'عمان', area: 'الصويفية', status: 'delivered', driver: 'علي الأحمد', merchant: 'تاجر أ', amount: 50.00, deliveryFee: 5.00, merchantFee: 2.00, date: '2024-07-01' },
  { id: '#3211', source: 'Manual', recipient: 'سارة كريم', phone: '07802223344', city: 'عمان', area: 'خلدا', status: 'in_delivery', driver: 'فاطمة الزهراء', merchant: 'تاجر ب', amount: 75.00, deliveryFee: 5.00, merchantFee: 3.00, date: '2024-07-01' },
  { id: '#3212', source: 'API', recipient: 'أحمد خالد', phone: '07903334455', city: 'عمان', area: 'تلاع العلي', status: 'pending', driver: 'علي الأحمد', merchant: 'تاجر أ', amount: 30.00, deliveryFee: 5.00, merchantFee: 1.50, date: '2024-07-01' },
  { id: '#3213', source: 'Manual', recipient: 'فاطمة علي', phone: '07714445566', city: 'الزرقاء', area: 'حي معصوم', status: 'returned', driver: 'يوسف إبراهيم', merchant: 'تاجر ج', amount: 15.00, deliveryFee: 8.00, merchantFee: 0.00, date: '2024-06-30' },
  { id: '#3214', source: 'Shopify', recipient: 'حسن محمود', phone: '07815556677', city: 'عمان', area: 'الجبيهة', status: 'postponed', driver: 'محمد الخالد', merchant: 'تاجر ب', amount: 90.00, deliveryFee: 6.00, merchantFee: 4.50, date: '2024-06-30' },
  { id: '#3215', source: 'WooCommerce', recipient: 'نور الهدى', phone: '07916667788', city: 'إربد', area: 'الحي الشرقي', status: 'delivered', driver: 'علي الأحمد', merchant: 'تاجر أ', amount: 120.00, deliveryFee: 10.00, merchantFee: 6.00, date: '2024-06-29' },
  { id: '#3216', source: 'Manual', recipient: 'خالد وليد', phone: '07727778899', city: 'عمان', area: 'العبدلي', status: 'in_delivery', driver: 'عائشة بكر', merchant: 'تاجر د', amount: 45.00, deliveryFee: 5.00, merchantFee: 2.25, date: '2024-07-01' },
];

const getStatusBadge = (status: string) => {
  const commonClasses = "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium w-fit";
  switch (status) {
    case 'delivered': return <Badge className={`${commonClasses} bg-green-100 text-green-800 border border-green-300`}><CheckCircle2 className="h-3 w-3"/>تم التسليم</Badge>;
    case 'in_delivery': return <Badge className={`${commonClasses} bg-blue-100 text-blue-800 border border-blue-300`}><Truck className="h-3 w-3"/>جاري التوصيل</Badge>;
    case 'pending': return <Badge className={`${commonClasses} bg-gray-100 text-gray-800 border border-gray-300`}><Clock className="h-3 w-3"/>لم يتم التعيين</Badge>;
    case 'returned': return <Badge className={`${commonClasses} bg-red-100 text-red-800 border border-red-300`}><Undo2 className="h-3 w-3"/>راجع</Badge>;
    case 'postponed': return <Badge className={`${commonClasses} bg-yellow-100 text-yellow-800 border border-yellow-300`}><Clock className="h-3 w-3"/>مؤجل</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const getSourceBadge = (source: string) => {
    return <Badge variant="secondary" className="font-normal">{source}</Badge>
}

const FiltersPanel = () => {
    const filterGroups = [
        { name: "الحالة", options: ["الكل", "لم يتم التعيين", "جاري التوصيل", "تم التسليم", "مؤجل", "راجع"] },
        { name: "التاجر", options: ["تاجر أ", "تاجر ب", "تاجر ج", "تاجر د"] },
        { name: "السائق", options: ["علي الأحمد", "فاطمة الزهراء", "محمد الخالد", "يوسف إبراهيم", "عائشة بكر"] },
        { name: "المدينة", options: ["عمان", "الزرقاء", "إربد", "العقبة"] },
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
             <CardHeader className="p-4 border-b">
                 <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon"><RefreshCw className="h-4 w-4"/></Button>
                        <Button variant="outline" size="icon"><Printer className="h-4 w-4"/></Button>
                        <Button variant="outline" size="icon"><FileDown className="h-4 w-4"/></Button>
                        <Button variant="outline" size="icon"><ArrowDownUp className="h-4 w-4"/></Button>
                        <Button variant="destructive" className="bg-orange-500 hover:bg-orange-600 text-white"><XCircle className="h-4 w-4 ml-2"/>مسح الفلاتر</Button>
                    </div>
                     <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1">
                            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="بحث شامل..." className="pr-8 sm:w-64" />
                        </div>
                        <Button size="sm" className="h-9 gap-1">
                            <PlusCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">إضافة طلب</span>
                        </Button>
                    </div>
                 </div>
                 {selectedRows.length > 0 && (
                     <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{selectedRows.length} محدد</span>
                        <Separator orientation="vertical" className="h-6 mx-2"/>
                        <Button variant="secondary" size="sm" className="gap-1"><UserPlus className="h-4 w-4"/> تعيين سائق</Button>
                        <Button variant="secondary" size="sm" className="gap-1"><RefreshCw className="h-4 w-4"/> تغيير الحالة</Button>
                        <Button variant="destructive" size="sm" className="gap-1"><Trash2 className="h-4 w-4"/> حذف</Button>
                     </div>
                 )}
             </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-orange-500/10">
                    <TableRow>
                      <TableHead className="w-12 text-center">
                        <Checkbox onCheckedChange={handleSelectAll} checked={isAllSelected || isIndeterminate} aria-label="Select all rows" />
                      </TableHead>
                      <TableHead>رقم الوصل</TableHead>
                      <TableHead>المصدر</TableHead>
                      <TableHead>اسم المستلم</TableHead>
                      <TableHead>رقم الهاتف</TableHead>
                      <TableHead>المحافظة</TableHead>
                      <TableHead>العنوان</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>السائق</TableHead>
                      <TableHead>التاجر</TableHead>
                      <TableHead>مبلغ الوصل</TableHead>
                      <TableHead>أجور التوصيل</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead className="text-center">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersData.map((order) => (
                      <TableRow 
                        key={order.id} 
                        data-state={selectedRows.includes(order.id) && "selected"}
                      >
                         <TableCell className="text-center">
                           <Checkbox onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)} checked={selectedRows.includes(order.id)} aria-label={`Select row ${order.id}`} />
                        </TableCell>
                        <TableCell className="font-medium text-blue-600 cursor-pointer hover:underline">{order.id}</TableCell>
                        <TableCell>{getSourceBadge(order.source)}</TableCell>
                        <TableCell>{order.recipient}</TableCell>
                        <TableCell>
                            <a href={`tel:${order.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                                <Phone className="h-3 w-3"/>
                                {order.phone}
                            </a>
                        </TableCell>
                        <TableCell>{order.city}</TableCell>
                        <TableCell>{order.area}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{order.driver || 'غير معين'}</TableCell>
                        <TableCell>{order.merchant}</TableCell>
                        <TableCell>{order.amount.toLocaleString('ar-JO')} د.أ</TableCell>
                        <TableCell>{order.deliveryFee.toLocaleString('ar-JO')} د.أ</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell className="text-center">
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
                               <DropdownMenuItem>طباعة</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">حذف</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="p-4 border-t">
                 <div className="text-xs text-muted-foreground">
                    عرض <strong>{ordersData.length}</strong> من <strong>{ordersData.length}</strong> طلبات
                </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

