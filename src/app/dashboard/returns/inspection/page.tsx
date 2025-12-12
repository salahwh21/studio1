'use client';

import React, { useState, useMemo } from 'react';
import { 
  ClipboardCheck, 
  Package,
  Search,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Eye,
  ArrowRight,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

import { useReturnsStore, type ReturnRecord, type Condition } from '@/store/returns-store';
import { useOrdersStore } from '@/store/orders-store';
import { cn } from '@/lib/utils';

export default function InspectionPage() {
  const { toast } = useToast();
  const { returns, updateReturnStatus, addInspection } = useReturnsStore();
  const { orders } = useOrdersStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReturn, setSelectedReturn] = useState<ReturnRecord | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  
  // Inspection form state
  const [condition, setCondition] = useState<Condition>('good');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  // Get returns waiting for inspection
  const pendingInspection = useMemo(() => {
    return returns.filter(r => 
      r.status === 'at_warehouse' || r.status === 'picked_up'
    );
  }, [returns]);

  // Filter returns
  const filteredReturns = useMemo(() => {
    if (!searchQuery) return pendingInspection;
    
    return pendingInspection.filter(r => 
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.original_order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.merchant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.order_data.recipient.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pendingInspection, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = pendingInspection.length;
    const urgent = pendingInspection.filter(r => {
      const hoursSinceArrival = (Date.now() - new Date(r.return_date).getTime()) / (1000 * 60 * 60);
      return hoursSinceArrival > 24;
    }).length;
    
    const totalValue = pendingInspection.reduce((sum, r) => sum + r.order_data.cod, 0);

    return { total, urgent, totalValue };
  }, [pendingInspection]);

  const handleStartInspection = (returnRecord: ReturnRecord) => {
    setSelectedReturn(returnRecord);
    setCondition('good');
    setNotes('');
    setPhotos([]);
    setIsInspecting(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Simulate photo upload (in real app, upload to server)
    const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const handleSubmitInspection = () => {
    if (!selectedReturn) return;

    const inspection = {
      inspected_at: new Date().toISOString(),
      inspector_id: 'INS-001', // In real app, get from auth
      inspector_name: 'أحمد محمود', // In real app, get from auth
      condition,
      photo_urls: photos,
      notes
    };

    addInspection(selectedReturn.id, inspection);

    toast({
      title: 'تم الفحص بنجاح',
      description: `تم فحص المرتجع ${selectedReturn.id} وتسجيل الحالة: ${getConditionLabel(condition)}`
    });

    setIsInspecting(false);
    setSelectedReturn(null);
  };

  const getConditionLabel = (cond: Condition) => {
    switch (cond) {
      case 'good': return 'سليم';
      case 'damaged': return 'تالف';
      case 'lost': return 'مفقود';
    }
  };

  const getConditionColor = (cond: Condition) => {
    switch (cond) {
      case 'good': return 'text-green-600 bg-green-100 dark:bg-green-950';
      case 'damaged': return 'text-orange-600 bg-orange-100 dark:bg-orange-950';
      case 'lost': return 'text-red-600 bg-red-100 dark:bg-red-950';
    }
  };

  const getConditionIcon = (cond: Condition) => {
    switch (cond) {
      case 'good': return CheckCircle2;
      case 'damaged': return AlertTriangle;
      case 'lost': return XCircle;
    }
  };

  const getUrgencyBadge = (returnDate: string) => {
    const hoursSinceArrival = (Date.now() - new Date(returnDate).getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceArrival > 48) {
      return <Badge variant="destructive" className="text-xs">عاجل جداً</Badge>;
    } else if (hoursSinceArrival > 24) {
      return <Badge variant="default" className="bg-orange-600 text-xs">عاجل</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">جديد</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            فحص وتقييم المرتجعات
          </h1>
          <p className="text-muted-foreground mt-2">فحص المرتجعات الواصلة للمستودع وتقييم حالتها</p>
        </div>
        <Link href="/dashboard/returns">
          <Button variant="outline">
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قائمة الانتظار</p>
                <p className="text-3xl font-bold mt-1" dir="ltr">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-950">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عاجل (+24 ساعة)</p>
                <p className="text-3xl font-bold mt-1" dir="ltr">{stats.urgent}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full dark:bg-orange-950">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي القيمة</p>
                <p className="text-2xl font-bold mt-1" dir="ltr">{stats.totalValue.toFixed(2)} <span className="text-sm">د.أ</span></p>
              </div>
              <div className="p-3 bg-green-100 rounded-full dark:bg-green-950">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="بحث برقم المرتجع، رقم الطلب، التاجر، أو المستلم..." 
              className="pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Inspection Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            قائمة انتظار الفحص
          </CardTitle>
          <CardDescription>
            المرتجعات الواصلة للمستودع والجاهزة للفحص
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReturns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">لا توجد مرتجعات للفحص</p>
              <p className="text-sm mt-2">جميع المرتجعات تم فحصها</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReturns.map((returnRecord) => {
                const hoursSinceArrival = Math.floor(
                  (Date.now() - new Date(returnRecord.return_date).getTime()) / (1000 * 60 * 60)
                );

                return (
                  <Card key={returnRecord.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg">#{returnRecord.id}</h3>
                                {getUrgencyBadge(returnRecord.return_date)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                الطلب الأصلي: #{returnRecord.original_order_id}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              منذ {hoursSinceArrival} ساعة
                            </Badge>
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">المستلم:</span>
                              <p className="font-bold">{returnRecord.order_data.recipient}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">التاجر:</span>
                              <p className="font-bold">{returnRecord.merchant_name}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">المبلغ:</span>
                              <p className="font-bold" dir="ltr">{returnRecord.order_data.cod.toFixed(2)} د.أ</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">السبب:</span>
                              <p className="font-bold">{returnRecord.return_reason}</p>
                            </div>
                          </div>

                          {/* Notes */}
                          {returnRecord.return_notes && (
                            <div className="p-2 bg-muted/50 rounded text-sm">
                              <span className="text-muted-foreground">ملاحظات: </span>
                              {returnRecord.return_notes}
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <Button 
                          onClick={() => handleStartInspection(returnRecord)}
                          className="flex-shrink-0"
                        >
                          <ClipboardCheck className="h-4 w-4 ml-2" />
                          بدء الفحص
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspection Dialog */}
      <Dialog open={isInspecting} onOpenChange={setIsInspecting}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              فحص المرتجع #{selectedReturn?.id}
            </DialogTitle>
            <DialogDescription>
              قم بفحص المنتج وتحديد حالته وإضافة الصور والملاحظات
            </DialogDescription>
          </DialogHeader>

          {selectedReturn && (
            <div className="space-y-6 py-4">
              {/* Return Info */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">المستلم:</span>
                    <p className="font-bold">{selectedReturn.order_data.recipient}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">التاجر:</span>
                    <p className="font-bold">{selectedReturn.merchant_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">المبلغ:</span>
                    <p className="font-bold" dir="ltr">{selectedReturn.order_data.cod.toFixed(2)} د.أ</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">السبب:</span>
                    <p className="font-bold">{selectedReturn.return_reason}</p>
                  </div>
                </div>
              </div>

              {/* Condition Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">حالة المنتج *</Label>
                <RadioGroup value={condition} onValueChange={(value) => setCondition(value as Condition)}>
                  <div className="grid gap-3">
                    {(['good', 'damaged', 'lost'] as Condition[]).map((cond) => {
                      const Icon = getConditionIcon(cond);
                      return (
                        <div
                          key={cond}
                          className={cn(
                            "flex items-center space-x-2 space-x-reverse p-4 rounded-lg border-2 cursor-pointer transition-all",
                            condition === cond ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          )}
                          onClick={() => setCondition(cond)}
                        >
                          <RadioGroupItem value={cond} id={cond} />
                          <Label htmlFor={cond} className="flex items-center gap-3 cursor-pointer flex-1">
                            <div className={cn("p-2 rounded-full", getConditionColor(cond))}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold">{getConditionLabel(cond)}</p>
                              <p className="text-xs text-muted-foreground">
                                {cond === 'good' && 'المنتج في حالة جيدة وقابل للإرجاع'}
                                {cond === 'damaged' && 'المنتج تالف أو به عيوب'}
                                {cond === 'lost' && 'المنتج مفقود أو غير موجود'}
                              </p>
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </div>

              {/* Photos */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">صور المنتج</Label>
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <Image src={photo} alt={`Photo ${index + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                  <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">إضافة صورة</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base font-semibold">ملاحظات الفحص</Label>
                <Textarea
                  id="notes"
                  placeholder="أضف أي ملاحظات حول حالة المنتج..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInspecting(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSubmitInspection}>
              <CheckCircle2 className="h-4 w-4 ml-2" />
              حفظ الفحص
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
