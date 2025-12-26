'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/icon';
import { useToast } from '@/hooks/use-toast';
import { useOrdersStore } from '@/store/orders-store';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStatusesStore } from '@/store/statuses-store';
import { useSettings } from '@/contexts/SettingsContext';

export default function DriverScanPage() {
  const { toast } = useToast();
  const { settings, formatCurrency } = useSettings();
  const currencySymbol = settings.regional.currencySymbol;
  const { orders, updateOrderStatus } = useOrdersStore();
  const { statuses } = useStatusesStore();
  
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [foundOrder, setFoundOrder] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // محاكاة المسح الضوئي
  const handleStartScan = () => {
    setIsScanning(true);
    toast({
      title: 'جاري المسح...',
      description: 'وجه الكاميرا نحو الباركود',
    });
    
    // محاكاة - في التطبيق الحقيقي سيتم استخدام مكتبة قارئ الباركود
    setTimeout(() => {
      setIsScanning(false);
      toast({
        variant: 'destructive',
        title: 'الكاميرا غير متاحة',
        description: 'يرجى إدخال رقم الطلب يدوياً',
      });
    }, 2000);
  };

  const handleManualSearch = () => {
    if (!manualCode.trim()) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يرجى إدخال رقم الطلب',
      });
      return;
    }

    const order = orders.find(
      o => o.id === manualCode.trim() || 
           o.orderNumber === manualCode.trim() ||
           o.referenceNumber === manualCode.trim()
    );

    if (order) {
      setFoundOrder(order);
      setNewStatus(order.status);
      setIsDialogOpen(true);
      setManualCode('');
    } else {
      toast({
        variant: 'destructive',
        title: 'لم يتم العثور على الطلب',
        description: `لا يوجد طلب برقم "${manualCode}"`,
      });
    }
  };

  const handleUpdateStatus = () => {
    if (foundOrder && newStatus) {
      updateOrderStatus(foundOrder.id, newStatus);
      toast({
        title: 'تم التحديث',
        description: `تم تحديث حالة الطلب إلى "${newStatus}"`,
      });
      setIsDialogOpen(false);
      setFoundOrder(null);
    }
  };

  // حالات سريعة للتحديث
  const quickStatuses = [
    { status: 'تم التسليم', icon: 'CheckCircle', color: 'bg-green-500' },
    { status: 'مرتجع', icon: 'RotateCcw', color: 'bg-red-500' },
    { status: 'جاري التوصيل', icon: 'Truck', color: 'bg-blue-500' },
    { status: 'مؤجل', icon: 'Clock', color: 'bg-yellow-500' },
  ];

  const handleQuickStatus = (status: string) => {
    if (foundOrder) {
      updateOrderStatus(foundOrder.id, status);
      toast({
        title: 'تم التحديث',
        description: `تم تحديث حالة الطلب إلى "${status}"`,
      });
      setIsDialogOpen(false);
      setFoundOrder(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">مسح الباركود</h1>
        <p className="text-muted-foreground mt-1">امسح باركود الطلب لتحديث حالته</p>
      </div>

      {/* Scanner Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="aspect-square max-h-[300px] bg-black relative flex items-center justify-center">
            {isScanning ? (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                    {/* خط المسح المتحرك */}
                    <div className="absolute inset-x-0 h-0.5 bg-red-500 animate-pulse top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
                <p className="absolute bottom-4 text-white text-sm">جاري المسح...</p>
              </>
            ) : (
              <div className="text-center text-white/70">
                <Icon name="ScanBarcode" className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>اضغط على الزر أدناه لبدء المسح</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scan Button */}
      <Button 
        size="lg" 
        className="w-full h-14 text-lg gap-3"
        onClick={handleStartScan}
        disabled={isScanning}
      >
        <Icon name={isScanning ? "Loader2" : "Camera"} className={`h-6 w-6 ${isScanning ? 'animate-spin' : ''}`} />
        {isScanning ? 'جاري المسح...' : 'بدء المسح'}
      </Button>

      {/* Manual Entry */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Keyboard" className="h-5 w-5" />
            إدخال يدوي
          </CardTitle>
          <CardDescription>أدخل رقم الطلب يدوياً إذا لم يعمل المسح</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="رقم الطلب أو الباركود"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
              className="flex-1"
              dir="ltr"
            />
            <Button onClick={handleManualSearch}>
              <Icon name="Search" className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Scans */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="History" className="h-5 w-5" />
            آخر المسوحات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="ScanLine" className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>لا توجد مسوحات حديثة</p>
          </div>
        </CardContent>
      </Card>

      {/* Order Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
            <DialogDescription>
              تم العثور على الطلب - يمكنك تحديث حالته
            </DialogDescription>
          </DialogHeader>

          {foundOrder && (
            <div className="space-y-4">
              {/* Order Info */}
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">رقم الطلب</span>
                  <span className="font-mono text-sm">{foundOrder.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">المستلم</span>
                  <span className="font-medium">{foundOrder.recipient}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الهاتف</span>
                  <span dir="ltr">{foundOrder.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">العنوان</span>
                  <span className="text-left text-sm max-w-[200px] truncate">{foundOrder.address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">المبلغ</span>
                  <span className="font-bold text-primary">{foundOrder.cod} {currencySymbol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الحالة الحالية</span>
                  <Badge variant="outline">{foundOrder.status}</Badge>
                </div>
              </div>

              {/* Quick Status Buttons */}
              <div>
                <Label className="text-sm font-medium mb-2 block">تحديث سريع</Label>
                <div className="grid grid-cols-2 gap-2">
                  {quickStatuses.map((qs) => (
                    <Button
                      key={qs.status}
                      variant="outline"
                      className="h-12 gap-2"
                      onClick={() => handleQuickStatus(qs.status)}
                    >
                      <div className={`h-3 w-3 rounded-full ${qs.color}`} />
                      {qs.status}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Status */}
              <div>
                <Label className="text-sm font-medium mb-2 block">أو اختر حالة أخرى</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.filter(s => s.isActive).map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        <div className="flex items-center gap-2">
                          <Icon name={s.icon as any} style={{ color: s.color }} className="h-4 w-4" />
                          {s.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUpdateStatus}>
              <Icon name="Save" className="h-4 w-4 ml-2" />
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
