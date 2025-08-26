
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
    { id: '#3210', customer: 'محمد جاسم', address: 'المنصور، شارع الأميرات', status: 'delivered', amount: 50000 },
    { id: '#3211', customer: 'سارة كريم', address: 'زيونة، شارع الربيعي', status: 'out_for_delivery', amount: 75000 },
    { id: '#3212', customer: 'أحمد خالد', address: 'الكرادة، ساحة الحرية', status: 'postponed', amount: 30000 },
    { id: '#3213', customer: 'فاطمة علي', address: 'الأعظمية، شارع عمر بن عبد العزيز', status: 'returned', amount: 15000 },
    { id: '#3214', customer: 'حسن محمود', address: 'الغزالية، شارع البدالة', status: 'out_for_delivery', amount: 90000 },
  ],
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'delivered': return <Badge variant="default">تم التوصيل</Badge>;
    case 'out_for_delivery': return <Badge variant="secondary" className="bg-blue-200 text-blue-800">قيد التوصيل</Badge>;
    case 'postponed': return <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">مؤجل</Badge>;
    case 'returned': return <Badge variant="destructive">مرتجع</Badge>;
    default: return <Badge variant="outline">غير معروف</Badge>;
  }
};


export default function DriverWebAppPage() {
  const statusCounts = driver.orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
                        <CardTitle className="text-sm font-medium">الشحنات المعينة</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{driver.assignedShipments}</div>
                        <p className="text-xs text-muted-foreground">شحنة لتوصيلها اليوم</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">المبلغ المطلوب تحصيله</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{driver.cashToCollect.toLocaleString('ar-IQ')} د.ع</div>
                        <p className="text-xs text-muted-foreground">من الطلبات قيد التوصيل</p>
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
          <Card>
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
                    <TableHead className="text-right">المبلغ</TableHead>
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
                      <TableCell className="text-right">{order.amount.toLocaleString('ar-IQ')} د.ع</TableCell>
                      <TableCell className="flex items-center justify-center gap-2">
                        <Button variant="outline" size="icon">
                            <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                            <MapPin className="h-4 w-4" />
                        </Button>
                         <Button variant="outline" size="icon">
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
                    <p className="text-muted-foreground">سيتم عرض الخريطة هنا</p>
                </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-4">
           <Card>
              <CardHeader>
                <CardTitle>الملف الشخصي</CardTitle>
                <CardDescription>إدارة معلوماتك الشخصية وكلمة المرور.</CardDescription>
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

    