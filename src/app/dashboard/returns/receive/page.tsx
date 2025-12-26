'use client';

import { useState, useMemo } from 'react';
import { 
  PackageX, 
  Users, 
  ArrowRight,
  CheckCircle2,
  Package,
  DollarSign,
  Printer,
  FileText,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

import { useOrdersStore, type Order } from '@/store/orders-store';
import { useUsersStore } from '@/store/user-store';
import { useReturnsStore } from '@/store/returns-store';
import { useStatusesStore } from '@/store/statuses-store';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

type Step = 'select-driver' | 'review-orders' | 'confirm';

export default function ReceiveReturnsPage() {
  const { toast } = useToast();
  const { orders, updateOrderField } = useOrdersStore();
  const { users } = useUsersStore();
  const { statuses } = useStatusesStore();
  const { addDriverReturnSlip } = useReturnsStore();
  const { settings, formatCurrency } = useSettings();
  
  const drivers = users.filter(u => u.roleId === 'driver');
  
  const [currentStep, setCurrentStep] = useState<Step>('select-driver');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Get returnable orders (not delivered)
  const returnableOrders = useMemo(() => {
    return orders.filter(o => 
      o.status !== 'تم التوصيل' && 
      o.status !== 'تم استلام المال في الفرع' &&
      o.status !== 'مكتمل' &&
      o.status !== 'مرجع للفرع' &&
      o.status !== 'مرجع للتاجر' &&
      o.driver
    );
  }, [orders]);

  // Group by driver
  const driverStats = useMemo(() => {
    const stats = new Map<string, { count: number; cod: number; orders: Order[] }>();
    
    returnableOrders.forEach(order => {
      if (!stats.has(order.driver)) {
        stats.set(order.driver, { count: 0, cod: 0, orders: [] });
      }
      const driverStat = stats.get(order.driver)!;
      driverStat.count++;
      driverStat.cod += order.cod;
      driverStat.orders.push(order);
    });
    
    return stats;
  }, [returnableOrders]);

  const selectedDriverOrders = useMemo(() => {
    return driverStats.get(selectedDriver)?.orders || [];
  }, [driverStats, selectedDriver]);

  const selectedOrdersData = useMemo(() => {
    return orders.filter(o => selectedOrders.includes(o.id));
  }, [orders, selectedOrders]);

  const totalSelectedCOD = useMemo(() => {
    return selectedOrdersData.reduce((sum, o) => sum + o.cod, 0);
  }, [selectedOrdersData]);

  const handleSelectDriver = (driverName: string) => {
    setSelectedDriver(driverName);
    setCurrentStep('review-orders');
    // Auto-select all orders
    const driverOrders = driverStats.get(driverName)?.orders || [];
    setSelectedOrders(driverOrders.map(o => o.id));
  };

  const handleToggleOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleConfirm = () => {
    if (selectedOrders.length === 0) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'الرجاء اختيار طلبات للاستلام'
      });
      return;
    }

    // Create return slip
    addDriverReturnSlip({
      driverName: selectedDriver,
      date: new Date().toISOString(),
      itemCount: selectedOrders.length,
      orders: selectedOrdersData
    });

    // Update order statuses
    selectedOrdersData.forEach(order => {
      updateOrderField(order.id, 'previousStatus', order.status);
      updateOrderField(order.id, 'status', 'مرجع للفرع');
    });

    toast({
      title: 'تم الاستلام بنجاح',
      description: `تم استلام ${selectedOrders.length} طلبات من ${selectedDriver}`
    });

    // Reset
    setCurrentStep('select-driver');
    setSelectedDriver('');
    setSelectedOrders([]);
  };

  const getStatusColor = (statusName: string) => {
    return statuses.find(s => s.name === statusName)?.color || '#808080';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PackageX className="h-8 w-8 text-primary" />
            استلام المرتجعات من السائقين
          </h1>
          <p className="text-muted-foreground mt-2">استلام الطلبات غير المسلمة من السائقين</p>
        </div>
        <Link href="/dashboard/returns">
          <Button variant="outline">
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة
          </Button>
        </Link>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full font-bold",
                currentStep === 'select-driver' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                1
              </div>
              <div>
                <p className="font-semibold">اختيار السائق</p>
                <p className="text-xs text-muted-foreground">حدد السائق المراد الاستلام منه</p>
              </div>
            </div>
            
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full font-bold",
                currentStep === 'review-orders' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                2
              </div>
              <div>
                <p className="font-semibold">مراجعة الطلبات</p>
                <p className="text-xs text-muted-foreground">تحديد الطلبات المستلمة</p>
              </div>
            </div>
            
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full font-bold",
                currentStep === 'confirm' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                3
              </div>
              <div>
                <p className="font-semibold">التأكيد</p>
                <p className="text-xs text-muted-foreground">مراجعة نهائية وطباعة</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Select Driver */}
      {currentStep === 'select-driver' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                اختر السائق
              </CardTitle>
              <CardDescription>
                اختر السائق الذي تريد استلام الطلبات منه
              </CardDescription>
            </CardHeader>
            <CardContent>
              {driverStats.size === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <PackageX className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">لا توجد طلبات للاستلام</p>
                  <p className="text-sm mt-2">جميع الطلبات تم توصيلها</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from(driverStats.entries()).map(([driverName, stats]) => {
                    const driver = drivers.find(d => d.name === driverName);
                    
                    return (
                      <Card 
                        key={driverName}
                        className="cursor-pointer hover:border-primary transition-all hover:shadow-md"
                        onClick={() => handleSelectDriver(driverName)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={driver?.avatar} alt={driverName} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                                {driverName.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-2">{driverName}</h3>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">الطلبات:</span>
                                  <Badge variant="secondary">{stats.count}</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">المبلغ:</span>
                                  <span className="font-bold">{formatCurrency(stats.cod)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button className="w-full mt-4" size="sm">
                            <ChevronRight className="h-4 w-4 ml-2" />
                            استلام
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Review Orders */}
      {currentStep === 'review-orders' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    طلبات السائق: {selectedDriver}
                  </CardTitle>
                  <CardDescription>
                    حدد الطلبات المراد استلامها ({selectedOrders.length} من {selectedDriverOrders.length})
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setCurrentStep('select-driver')}>
                  تغيير السائق
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedDriverOrders.map((order, index) => {
                  const isSelected = selectedOrders.includes(order.id);
                  
                  return (
                    <div
                      key={order.id}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all cursor-pointer",
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      )}
                      onClick={() => handleToggleOrder(order.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-lg">{order.recipient}</p>
                              <p className="text-sm text-muted-foreground">{order.phone}</p>
                            </div>
                            <Badge 
                              style={{ 
                                backgroundColor: getStatusColor(order.status),
                                color: 'white'
                              }}
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <Separator />
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">رقم الطلب:</span>
                              <p className="font-mono font-bold">#{order.id}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">المبلغ:</span>
                              <p className="font-bold">{formatCurrency(order.cod)}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">العنوان:</span>
                              <p className="text-sm">{order.address}</p>
                            </div>
                          </div>
                        </div>
                        <div className={cn(
                          "w-6 h-6 rounded border-2 flex items-center justify-center",
                          isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                        )}>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-6" />

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">الإجمالي المحدد</p>
                  <p className="text-2xl font-bold">{selectedOrders.length} طلبات</p>
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">إجمالي المبلغ</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalSelectedCOD)}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setCurrentStep('select-driver')}
                >
                  السابق
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => setCurrentStep('confirm')}
                  disabled={selectedOrders.length === 0}
                >
                  التالي: المراجعة النهائية
                  <ChevronRight className="h-4 w-4 mr-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Confirm */}
      {currentStep === 'confirm' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                مراجعة نهائية وتأكيد الاستلام
              </CardTitle>
              <CardDescription>
                تأكد من صحة البيانات قبل إتمام عملية الاستلام
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-r-4 border-r-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">السائق</p>
                        <p className="text-lg font-bold">{selectedDriver}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-r-4 border-r-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">عدد الطلبات</p>
                        <p className="text-lg font-bold">{selectedOrders.length}</p>
                      </div>
                      <Package className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-r-4 border-r-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">إجمالي المبلغ</p>
                        <p className="text-lg font-bold">{formatCurrency(totalSelectedCOD)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alert */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">ملاحظة مهمة</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    سيتم تحويل حالة جميع الطلبات إلى "مرجع للفرع" وإنشاء سند استلام. يمكنك بعد ذلك معالجة كل طلب حسب الحاجة (إعادة توصيل، إرجاع للتاجر، إلخ).
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setCurrentStep('review-orders')}
                >
                  السابق
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleConfirm}
                >
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                  تأكيد الاستلام وطباعة السند
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
