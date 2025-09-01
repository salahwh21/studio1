
'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
} from 'recharts';
import {
    MoreHorizontal,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import Icon from '@/components/icon';
import { useSettings } from '@/contexts/SettingsContext';


const summaryData = {
    totalParcels: 125,
    amountReadyForCollection: 3500,
    ordersByStatus: [
        { name: 'قيد التوصيل', value: 40, fill: 'hsl(var(--chart-1))' },
        { name: 'مكتملة', value: 75, fill: 'hsl(var(--chart-2))' },
        { name: 'مرتجعة', value: 10, fill: 'hsl(var(--chart-3))' },
    ]
};

const ordersData = [
  { id: '#M3210', customer: 'محمد جاسم', phone: '07701112233', status: 'delivered', fee: 5, date: '2023-08-15', notes: 'اتصل قبل الوصول' },
  { id: '#M3211', customer: 'سارة كريم', phone: '07802223344', status: 'in_delivery', fee: 5, date: '2023-08-15', notes: '' },
  { id: '#M3213', customer: 'فاطمة علي', phone: '07714445566', status: 'returned', fee: 8, date: '2023-08-14', notes: 'العميل رفض الاستلام'},
  { id: '#M3214', customer: 'حسن محمود', phone: '07815556677', status: 'delayed', fee: 6, date: '2023-08-13', notes: 'تأخير بسبب الازدحام' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'delivered': return <Badge variant="default" className="bg-green-100 text-green-800">تم التوصيل</Badge>;
    case 'in_delivery': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">قيد التوصيل</Badge>;
    case 'returned': return <Badge variant="destructive">مرتجع</Badge>;
    case 'delayed': return <Badge variant="destructive" className="bg-red-200 text-red-900">متأخر</Badge>;
    default: return <Badge variant="outline">غير معروف</Badge>;
  }
};

const chartConfig = {
  'قيد التوصيل': { label: 'قيد التوصيل', color: 'hsl(var(--chart-1))' },
  'مكتملة': { label: 'مكتملة', color: 'hsl(var(--chart-2))' },
  'مرتجعة': { label: 'مرتجعة', color: 'hsl(var(--chart-3))' },
};


const SummaryDashboard = () => {
    const { formatCurrency } = useSettings();
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الطرود</CardTitle>
                <Icon name="Package" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.totalParcels}</div>
                <p className="text-xs text-muted-foreground">في آخر 30 يومًا</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المبالغ الجاهزة للتحصيل</CardTitle>
                <Icon name="Wallet" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summaryData.amountReadyForCollection)}</div>
                <p className="text-xs text-muted-foreground">من الطلبات المكتملة</p>
              </CardContent>
            </Card>
            <Card className="col-span-1 md:col-span-2">
               <CardHeader>
                   <CardTitle className="text-base">حالات الطلبات</CardTitle>
               </CardHeader>
               <CardContent className="h-[100px]">
                     <ChartContainer config={chartConfig} className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Pie data={summaryData.ordersByStatus} dataKey="value" nameKey="name" innerRadius="30%" startAngle={180} endAngle={-180}>
                          </Pie>
                          <Legend content={({ payload }) => (
                                <ul className="flex flex-wrap gap-x-4 justify-center text-xs mt-2">
                                {payload?.map((entry, index) => (
                                    <li key={`item-${index}`} className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: entry.color}}></span>
                                    {entry.value} ({summaryData.ordersByStatus.find(d => d.name === entry.value)?.value})
                                    </li>
                                ))}
                                </ul>
                            )} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
               </CardContent>
            </Card>
        </div>
    );
}

const OrdersManagement = () => {
    const { formatCurrency } = useSettings();
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>إدارة الطلبات</CardTitle>
                        <CardDescription>
                            إضافة وتعديل ومتابعة جميع طلباتك.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="relative w-full max-w-sm">
                            <Icon name="Search" className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="بحث بالرقم، اسم العميل..." className="pr-8" />
                        </div>
                         <Button size="sm" className="h-9 gap-1">
                            <Icon name="PlusCircle" className="h-4 w-4" />
                            <span className="hidden sm:inline">إضافة طلب</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center whitespace-nowrap">رقم الطلب</TableHead>
                        <TableHead className="text-center whitespace-nowrap">العميل</TableHead>
                        <TableHead className="text-center whitespace-nowrap">الهاتف</TableHead>
                        <TableHead className="text-center whitespace-nowrap">الحالة</TableHead>
                        <TableHead className="text-center whitespace-nowrap">رسوم التوصيل</TableHead>
                        <TableHead className="text-center whitespace-nowrap">تاريخ الطلب</TableHead>
                        <TableHead className="text-center whitespace-nowrap">ملاحظات</TableHead>
                        <TableHead>
                          <span className="sr-only">إجراءات</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersData.map((order) => (
                        <TableRow key={order.id} className={order.status === 'delayed' ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                          <TableCell className="font-medium text-center whitespace-nowrap">{order.id}</TableCell>
                          <TableCell className="text-center whitespace-nowrap">{order.customer}</TableCell>
                          <TableCell className="text-center whitespace-nowrap">{order.phone}</TableCell>
                          <TableCell className="text-center whitespace-nowrap">{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-center whitespace-nowrap">{formatCurrency(order.fee)}</TableCell>
                          <TableCell className="text-center whitespace-nowrap">{order.date}</TableCell>
                          <TableCell className="text-center whitespace-nowrap">{order.notes}</TableCell>
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
                                  <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
                                  <DropdownMenuItem>تعديل</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                </Table>
            </CardContent>
             <CardFooter>
                <div className="text-xs text-muted-foreground">
                  عرض <strong>{ordersData.length}</strong> من <strong>{ordersData.length}</strong> طلبات
                </div>
            </CardFooter>
        </Card>
    );
};


const ProfilePanel = () => (
    <Card>
        <CardHeader>
            <CardTitle>الملف الشخصي</CardTitle>
            <CardDescription>إدارة معلوماتك التجارية وتفاصيل الاتصال.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="businessName">اسم الشركة</Label>
                <Input id="businessName" defaultValue="تاجر أ" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="contactName">اسم جهة الاتصال</Label>
                <Input id="contactName" defaultValue="أحمد التاجر" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input id="phone" defaultValue="07909876543" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Input id="address" defaultValue="عمان، الأردن" />
            </div>
            <Button>حفظ التغييرات</Button>
        </CardContent>
    </Card>
);

const SettingsPanel = () => (
    <Card>
        <CardHeader>
            <CardTitle>الإعدادات</CardTitle>
             <CardDescription>إدارة إعدادات حسابك.</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Settings content will go here */}
             <p className="text-muted-foreground">قيد الإنشاء...</p>
        </CardContent>
    </Card>
);


export default function MerchantPage() {
    const { formatCurrency } = useSettings();
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">مرحباً, تاجر أ</h1>
                    <p className="text-muted-foreground">هذه هي لوحة التحكم الخاصة بك.</p>
                </div>
            </div>
            
            {/* Desktop View */}
            <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    <SummaryDashboard/>
                </div>
                 <div className="lg:col-span-2">
                    <OrdersManagement/>
                </div>
                 <div className="lg:col-span-1 space-y-6">
                    <ProfilePanel/>
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
                 <Tabs defaultValue="dashboard" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="dashboard">الملخص</TabsTrigger>
                        <TabsTrigger value="orders">الطلبات</TabsTrigger>
                        <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
                    </TabsList>
                    <TabsContent value="dashboard" className="mt-4">
                        <SummaryDashboard/>
                    </TabsContent>
                    <TabsContent value="orders" className="mt-4">
                        <div className="space-y-4">
                            {ordersData.map(order => (
                                <Card key={order.id} className={`overflow-hidden ${order.status === 'delayed' ? "bg-red-50" : ""}`}>
                                    <CardHeader className="flex flex-row items-center justify-between p-4">
                                        <div>
                                            <CardTitle className="text-base">{order.id}</CardTitle>
                                            <CardDescription>{order.customer}</CardDescription>
                                        </div>
                                        <div className="text-left">
                                            {getStatusBadge(order.status)}
                                            <p className="font-semibold text-sm mt-1">{formatCurrency(order.fee)}</p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                                        <p>{order.phone}</p>
                                    </CardContent>
                                     <CardFooter className="p-2 justify-end">
                                        <Button variant="ghost" size="sm">التفاصيل</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                     <TabsContent value="profile" className="mt-4">
                        <ProfilePanel/>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
