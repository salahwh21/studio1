
'use client';

import { useMemo } from 'react';
import { useUsersStore } from '@/store/user-store';
import { useOrdersStore } from '@/store/orders-store';

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
import { Skeleton } from '@/components/ui/skeleton';


const getStatusBadge = (status: string) => {
  switch (status) {
    case 'تم التوصيل': return <Badge variant="default" className="bg-green-100 text-green-800">تم التوصيل</Badge>;
    case 'جاري التوصيل': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">قيد التوصيل</Badge>;
    case 'راجع': return <Badge variant="destructive">مرتجع</Badge>;
    case 'مؤجل': return <Badge variant="destructive" className="bg-yellow-200 text-yellow-900">مؤجل</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const chartConfig = {
  'جاري التوصيل': { label: 'جاري التوصيل', color: 'hsl(var(--chart-1))' },
  'تم التوصيل': { label: 'مكتملة', color: 'hsl(var(--chart-2))' },
  'راجع': { label: 'مرتجعة', color: 'hsl(var(--chart-3))' },
};


const SummaryDashboard = ({ merchantOrders, merchant }: { merchantOrders: any[], merchant: any }) => {
    const { formatCurrency } = useSettings();
    
    const summaryData = useMemo(() => {
        const totalParcels = merchantOrders.length;
        const amountReadyForCollection = merchantOrders
            .filter(o => o.status === 'تم التوصيل')
            .reduce((sum, o) => sum + o.itemPrice, 0);
        
        const ordersByStatus = merchantOrders.reduce((acc, order) => {
            const status = order.status;
            if (chartConfig[status as keyof typeof chartConfig]) {
                const key = chartConfig[status as keyof typeof chartConfig].label;
                acc[key] = (acc[key] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return {
            totalParcels,
            amountReadyForCollection,
            ordersByStatus: Object.entries(ordersByStatus).map(([name, value]) => ({ name, value }))
        };

    }, [merchantOrders]);

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
                                {payload?.map((entry, index) => {
                                    const dataItem = summaryData.ordersByStatus.find(d => d.name === entry.value);
                                    return (
                                        <li key={`item-${index}`} className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full" style={{backgroundColor: entry.color}}></span>
                                        {entry.value} ({dataItem?.value || 0})
                                        </li>
                                    )
                                })}
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

const OrdersManagement = ({ merchantOrders }: { merchantOrders: any[] }) => {
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
                      {merchantOrders.map((order) => (
                        <TableRow key={order.id} className={order.status === 'مؤجل' ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                          <TableCell className="font-medium text-center whitespace-nowrap">{order.id}</TableCell>
                          <TableCell className="text-center whitespace-nowrap">{order.recipient}</TableCell>
                          <TableCell className="text-center whitespace-nowrap">{order.phone}</TableCell>
                          <TableCell className="text-center whitespace-nowrap">{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-center whitespace-nowrap">{formatCurrency(order.deliveryFee)}</TableCell>
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
                  عرض <strong>{merchantOrders.length}</strong> من <strong>{merchantOrders.length}</strong> طلبات
                </div>
            </CardFooter>
        </Card>
    );
};


const ProfilePanel = ({ merchant }: { merchant: any }) => (
    <Card>
        <CardHeader>
            <CardTitle>الملف الشخصي</CardTitle>
            <CardDescription>إدارة معلوماتك التجارية وتفاصيل الاتصال.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="businessName">اسم الشركة</Label>
                <Input id="businessName" defaultValue={merchant.storeName} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="contactName">اسم جهة الاتصال</Label>
                <Input id="contactName" defaultValue={merchant.name} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input id="phone" defaultValue={merchant.email} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Input id="address" defaultValue="عمان، الأردن" />
            </div>
            <Button>حفظ التغييرات</Button>
        </CardContent>
    </Card>
);


export default function MerchantPage() {
    const { formatCurrency } = useSettings();
    const { users } = useUsersStore();
    const { orders } = useOrdersStore();

    const merchant = useMemo(() => users.find(u => u.roleId === 'merchant'), [users]);
    const merchantOrders = useMemo(() => merchant ? orders.filter(o => o.merchant === merchant.storeName) : [], [orders, merchant]);

     if (!merchant) {
        return (
            <Card>
                <CardHeader>
                <CardTitle>لا يوجد تاجر</CardTitle>
                <CardDescription>لم يتم العثور على أي مستخدم بدور "تاجر" للمحاكاة.</CardDescription>
                </CardHeader>
                <CardContent>
                <Skeleton className="w-full h-64" />
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">مرحباً, {merchant.storeName}</h1>
                    <p className="text-muted-foreground">هذه هي لوحة التحكم الخاصة بك.</p>
                </div>
            </div>
            
            {/* Desktop View */}
            <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    <SummaryDashboard merchantOrders={merchantOrders} merchant={merchant} />
                </div>
                 <div className="lg:col-span-2">
                    <OrdersManagement merchantOrders={merchantOrders} />
                </div>
                 <div className="lg:col-span-1 space-y-6">
                    <ProfilePanel merchant={merchant}/>
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
                        <SummaryDashboard merchantOrders={merchantOrders} merchant={merchant}/>
                    </TabsContent>
                    <TabsContent value="orders" className="mt-4">
                        <div className="space-y-4">
                            {merchantOrders.map(order => (
                                <Card key={order.id} className={`overflow-hidden ${order.status === 'مؤجل' ? "bg-yellow-50" : ""}`}>
                                    <CardHeader className="flex flex-row items-center justify-between p-4">
                                        <div>
                                            <CardTitle className="text-base">{order.id}</CardTitle>
                                            <CardDescription>{order.recipient}</CardDescription>
                                        </div>
                                        <div className="text-left">
                                            {getStatusBadge(order.status)}
                                            <p className="font-semibold text-sm mt-1">{formatCurrency(order.deliveryFee)}</p>
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
                        <ProfilePanel merchant={merchant}/>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
