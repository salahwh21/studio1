'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MapPin, Truck, Wallet, PackageCheck, Clock, Undo2, MoreVertical } from "lucide-react";

const driver = {
  name: "علي الأحمد",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  assignedShipments: 25,
  cashToCollect: 1250000,
  orders: [
    { id: '#3210', customer: 'محمد جاسم', phone: '07701234567', address: 'المنصور، شارع الأميرات', status: 'delivered', amount: 50000, notes: 'اتصل قبل الوصول' },
    { id: '#3211', customer: 'سارة كريم', phone: '07801234567', address: 'زيونة، شارع الربيعي', status: 'out_for_delivery', amount: 75000, notes: '' },
    { id: '#3212', customer: 'أحمد خالد', phone: '07901234567', address: 'الكرادة، ساحة الحرية', status: 'postponed', amount: 30000, notes: '' },
    { id: '#3213', customer: 'فاطمة علي', phone: '07711234567', address: 'الأعظمية، شارع عمر بن عبد العزيز', status: 'returned', amount: 15000, notes: 'العميل رفض الاستلام' },
    { id: '#3214', customer: 'حسن محمود', phone: '07811234567', address: 'الغزالية، شارع البدالة', status: 'out_for_delivery', amount: 90000, notes: '' },
  ],
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'delivered': return <Badge variant="default" className="bg-green-100 text-green-800">تم التوصيل</Badge>;
    case 'out_for_delivery': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">قيد التوصيل</Badge>;
    case 'postponed': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">مؤجل</Badge>;
    case 'returned': return <Badge variant="destructive">مرتجع</Badge>;
    default: return <Badge variant="outline">غير معروف</Badge>;
  }
};


export default function DriverWebAppPage() {
  const statusCounts = driver.orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const outForDeliveryAmount = driver.orders
    .filter(order => order.status === 'out_for_delivery')
    .reduce((sum, order) => sum + order.amount, 0);

  return (
    <div className="flex flex-col gap-6">
       <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-4 bg-card p-4">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src={driver.avatar} alt={driver.name} />
            <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">مرحباً, {driver.name}!</CardTitle>
            <CardDescription>هذه هي لوحة التحكم الخاصة بمهامك اليومية.</CardDescription>
          </div>
        </CardHeader>
      </Card>
    
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="orders">طلباتي</TabsTrigger>
          <TabsTrigger value="map">الخريطة</TabsTrigger>
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الشحنات اليوم</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{driver.orders.length}</div>
                        <p className="text-xs text-muted-foreground">شحنة معينة لك اليوم</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">المبلغ المطلوب تحصيله</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{outForDeliveryAmount.toLocaleString('ar-IQ')} د.ع</div>
                        <p className="text-xs text-muted-foreground">من الطلبات قيد التوصيل</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">شحنات مكتملة</CardTitle>
                        <PackageCheck className="h-4 w-4 text-muted-foreground text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts.delivered || 0}</div>
                        <p className="text-xs text-muted-foreground">تم توصيلها بنجاح</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">شحنات مرتجعة</CardTitle>
                        <Undo2 className="h-4 w-4 text-muted-foreground text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts.returned || 0}</div>
                         <p className="text-xs text-muted-foreground">تم إرجاعها للمخزن</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>ملخص حالات الطلبات</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="rounded-lg border p-4">
                        <PackageCheck className="mx-auto h-8 w-8 text-green-500 mb-2"/>
                        <p className="text-2xl font-bold">{statusCounts.delivered || 0}</p>
                        <p className="text-sm text-muted-foreground">مكتمل</p>
                    </div>
                     <div className="rounded-lg border p-4">
                        <Clock className="mx-auto h-8 w-8 text-yellow-500 mb-2"/>
                        <p className="text-2xl font-bold">{statusCounts.postponed || 0}</p>
                        <p className="text-sm text-muted-foreground">مؤجل</p>
                    </div>
                     <div className="rounded-lg border p-4">
                        <Undo2 className="mx-auto h-8 w-8 text-red-500 mb-2"/>
                        <p className="text-2xl font-bold">{statusCounts.returned || 0}</p>
                        <p className="text-sm text-muted-foreground">مرتجع</p>
                    </div>
                     <div className="rounded-lg border p-4">
                        <Truck className="mx-auto h-8 w-8 text-blue-500 mb-2"/>
                        <p className="text-2xl font-bold">{statusCounts.out_for_delivery || 0}</p>
                        <p className="text-sm text-muted-foreground">قيد التوصيل</p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          {/* Mobile View */}
          <div className="space-y-4 md:hidden">
            {driver.orders.map(order => (
                <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-start gap-4 p-4">
                        <div className="flex-1 space-y-1">
                            <CardTitle className="text-base">{order.customer}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <Phone className="h-3 w-3" /> {order.phone}
                            </CardDescription>
                            <CardDescription className="flex items-center gap-2">
                               <MapPin className="h-3 w-3" /> {order.address}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(order.status)}
                            <span className="font-bold">{order.amount.toLocaleString('ar-IQ')} د.ع</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                         <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm">تحديث الحالة</Button>
                            <Button variant="default" size="sm">التفاصيل</Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
          </div>
          {/* Desktop View */}
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>قائمة طلباتي</CardTitle>
              <CardDescription>جميع الطلبات الموكلة إليك اليوم.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>ملاحظات</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.address}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.amount.toLocaleString('ar-IQ')} د.ع</TableCell>
                       <TableCell>{order.notes || '-'}</TableCell>
                      <TableCell className="flex items-center justify-center gap-2">
                        <Button variant="outline" size="icon" title="اتصال بالعميل">
                            <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" title="عرض على الخريطة">
                            <MapPin className="h-4 w-4" />
                        </Button>
                         <Button variant="outline" size="icon" title="تحديث الحالة">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="mt-4">
           <Card>
             <CardHeader>
               <CardTitle>خريطة المسار اليومي</CardTitle>
                <CardDescription>المسار المقترح لتوصيل طلبات اليوم بكفاءة.</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">سيتم عرض الخريطة التفاعلية هنا</p>
                </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-4">
           <Card>
              <CardHeader>
                <CardTitle>الملف الشخصي</CardTitle>
                <CardDescription>إدارة معلوماتك الشخصية ومعلومات مركبتك.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">الاسم</Label>
                    <Input id="name" defaultValue={driver.name} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input id="phone" defaultValue="07701234567" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="vehicle">معلومات المركبة</Label>
                    <Input id="vehicle" defaultValue="Toyota Corolla - 12345 Baghdad" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور الجديدة</Label>
                    <Input id="password" type="password" />
                </div>
                <Button>تحديث الملف الشخصي</Button>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
