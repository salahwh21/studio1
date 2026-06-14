'use client';

import { useMemo, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useDriverOrders } from '@/hooks/use-driver-orders';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DriverRecordsPage() {
  const { formatCurrency, formatDate } = useSettings();
  const { orders: myOrders, isLoading } = useDriverOrders();
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isReturnsOpen, setIsReturnsOpen] = useState(false);

  // طلبات السائق اليوم
  const todayOrders = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return myOrders.filter(o => o.date === today);
  }, [myOrders]);

  // التحصيلات - الطلبات المسلمة
  const collectionsData = useMemo(() => {
    const delivered = todayOrders.filter(o => o.status === 'تم التوصيل');
    const totalCOD = delivered.reduce((sum, o) => sum + (o.cod || 0), 0);
    const totalDeliveryFees = delivered.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    
    return {
      orders: delivered,
      count: delivered.length,
      totalCOD,
      totalDeliveryFees,
      netAmount: totalCOD - totalDeliveryFees,
    };
  }, [todayOrders]);

  // المرتجعات
  const returnsData = useMemo(() => {
    const returned = todayOrders.filter(o => o.status === 'مرتجع');
    
    return {
      orders: returned,
      count: returned.length,
      totalValue: returned.reduce((sum, o) => sum + (o.cod || 0), 0),
    };
  }, [todayOrders]);

  // تاريخ اليوم بالعربي
  const todayDate = formatDate(new Date(), { longFormat: true });

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">السجلات اليومية</h1>
        <p className="text-muted-foreground mt-1">{todayDate}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Collections Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-green-200 bg-green-50 dark:bg-green-950/30"
          onClick={() => setIsCollectionsOpen(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <Icon name="Wallet" className="h-6 w-6 text-green-600" />
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {collectionsData.count} طلب
              </Badge>
            </div>
            <h3 className="font-bold text-lg mb-1">التحصيلات</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(collectionsData.totalCOD)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              اضغط لعرض كشف التحصيل
            </p>
          </CardContent>
        </Card>

        {/* Returns Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-red-200 bg-red-50 dark:bg-red-950/30"
          onClick={() => setIsReturnsOpen(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                <Icon name="Undo2" className="h-6 w-6 text-red-600" />
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                {returnsData.count} طلب
              </Badge>
            </div>
            <h3 className="font-bold text-lg mb-1">المرتجعات</h3>
            <p className="text-2xl font-bold text-red-600">
              {returnsData.count}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              اضغط لعرض كشف المرتجعات
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Calculator" className="h-4 w-4" />
            ملخص اليوم
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">إجمالي التحصيل</span>
            <span className="font-bold">{formatCurrency(collectionsData.totalCOD)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">أجور التوصيل</span>
            <span className="font-bold text-green-600">+{formatCurrency(collectionsData.totalDeliveryFees)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">المستحق للشركة</span>
            <span className="font-bold text-primary">{formatCurrency(collectionsData.netAmount)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">عدد المرتجعات</span>
            <span className="font-bold text-red-600">{returnsData.count}</span>
          </div>
        </CardContent>
      </Card>

      {/* Collections Dialog */}
      <Dialog open={isCollectionsOpen} onOpenChange={setIsCollectionsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Wallet" className="h-5 w-5 text-green-600" />
              كشف التحصيل اليومي
            </DialogTitle>
            <DialogDescription>
              {todayDate} • {collectionsData.count} طلب تم توصيله
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[50vh]">
            {collectionsData.orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="PackageX" className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد تحصيلات لهذا اليوم</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">#</TableHead>
                    <TableHead className="text-right">رقم الطلب</TableHead>
                    <TableHead className="text-right">المستلم</TableHead>
                    <TableHead className="text-right">المنطقة</TableHead>
                    <TableHead className="text-right">التحصيل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collectionsData.orders.map((order, index) => (
                    <TableRow key={order.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{order.id.slice(-6)}</TableCell>
                      <TableCell>{order.recipient}</TableCell>
                      <TableCell>{order.region}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        {formatCurrency(order.cod || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>

          {collectionsData.orders.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>إجمالي التحصيل:</span>
                <span className="font-bold">{formatCurrency(collectionsData.totalCOD)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>أجور التوصيل ({collectionsData.count} طلب):</span>
                <span className="font-bold text-green-600">+{formatCurrency(collectionsData.totalDeliveryFees)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>المبلغ المستحق للشركة:</span>
                <span className="text-primary">{formatCurrency(collectionsData.netAmount)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Returns Dialog */}
      <Dialog open={isReturnsOpen} onOpenChange={setIsReturnsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Undo2" className="h-5 w-5 text-red-600" />
              كشف المرتجعات اليومي
            </DialogTitle>
            <DialogDescription>
              {todayDate} • {returnsData.count} طلب مرتجع
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[50vh]">
            {returnsData.orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="CheckCircle" className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
                <p>لا توجد مرتجعات لهذا اليوم 🎉</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">#</TableHead>
                    <TableHead className="text-right">رقم الطلب</TableHead>
                    <TableHead className="text-right">المستلم</TableHead>
                    <TableHead className="text-right">المنطقة</TableHead>
                    <TableHead className="text-right">المتجر</TableHead>
                    <TableHead className="text-right">الملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnsData.orders.map((order, index) => (
                    <TableRow key={order.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{order.id.slice(-6)}</TableCell>
                      <TableCell>{order.recipient}</TableCell>
                      <TableCell>{order.region}</TableCell>
                      <TableCell>{order.merchant}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                        {order.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>

          {returnsData.orders.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold">
                <span>إجمالي المرتجعات:</span>
                <span className="text-red-600">{returnsData.count} طلب</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
