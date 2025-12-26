'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/icon';
import { useToast } from '@/hooks/use-toast';
import { useAreas } from '@/hooks/use-areas';
import { useSettings } from '@/contexts/SettingsContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function MerchantAddOrderPage() {
  const { toast } = useToast();
  const { cities, getRegionsByCity, isLoading: areasLoading } = useAreas();
  const { settings, formatCurrency } = useSettings();
  const currencySymbol = settings.regional.currencySymbol;
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const phone = formData.get('phone') as string;
    const phone2 = formData.get('phone2') as string;
    const cod = formData.get('cod') as string;
    
    // Input validation
    if (phone && !/^07\d{8}$/.test(phone)) {
      toast({
        variant: 'destructive',
        title: 'خطأ في رقم الهاتف',
        description: 'رقم الهاتف يجب أن يكون بصيغة 07XXXXXXXX',
      });
      setLoading(false);
      return;
    }
    
    if (phone2 && !/^07\d{8}$/.test(phone2)) {
      toast({
        variant: 'destructive',
        title: 'خطأ في رقم الهاتف البديل',
        description: 'رقم الهاتف البديل يجب أن يكون بصيغة 07XXXXXXXX',
      });
      setLoading(false);
      return;
    }
    
    if (cod && parseFloat(cod) <= 0) {
      toast({
        variant: 'destructive',
        title: 'خطأ في المبلغ',
        description: 'المبلغ المطلوب يجب أن يكون أكبر من صفر',
      });
      setLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'تم إنشاء الطلب بنجاح!',
        description: 'سيتم معالجة طلبك قريباً',
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">طلب جديد</h1>
        <p className="text-muted-foreground mt-1">أضف طلب توصيل جديد</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="User" className="h-5 w-5" />
                  معلومات العميل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">اسم العميل *</Label>
                    <Input id="customerName" placeholder="أدخل اسم العميل" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input id="phone" type="tel" placeholder="07XXXXXXXX" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone2">رقم هاتف بديل</Label>
                  <Input id="phone2" type="tel" placeholder="07XXXXXXXX" />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="MapPin" className="h-5 w-5" />
                  معلومات التوصيل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">المدينة *</Label>
                    <Select 
                      required 
                      value={selectedCity}
                      onValueChange={setSelectedCity}
                      disabled={areasLoading}
                    >
                      <SelectTrigger id="city">
                        <SelectValue placeholder={areasLoading ? "جاري التحميل..." : "اختر المدينة"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">المنطقة *</Label>
                    <Select required disabled={!selectedCity || areasLoading}>
                      <SelectTrigger id="area">
                        <SelectValue placeholder={!selectedCity ? "اختر المدينة أولاً" : "اختر المنطقة"} />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCity && getRegionsByCity(selectedCity).map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان التفصيلي *</Label>
                  <Textarea 
                    id="address" 
                    placeholder="أدخل العنوان بالتفصيل (الشارع، رقم البناية، معلم قريب...)"
                    rows={3}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Package" className="h-5 w-5" />
                  تفاصيل الطلب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="items">محتويات الطلب *</Label>
                  <Textarea 
                    id="items" 
                    placeholder="اكتب محتويات الطلب (مثال: 2 قميص، 1 بنطال...)"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cod">المبلغ المطلوب (COD) *</Label>
                    <Input 
                      id="cod" 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">الوزن (كجم)</Label>
                    <Input 
                      id="weight" 
                      type="number" 
                      step="0.1"
                      placeholder="0.0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات إضافية</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="أي ملاحظات خاصة بالطلب..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">قيمة الطلب (COD)</span>
                    <span className="font-medium">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">رسوم التوصيل</span>
                    <span className="font-medium">{formatCurrency(2.5)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>الإجمالي</span>
                    <span>{formatCurrency(2.5)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Clock" className="h-4 w-4" />
                    <span>وقت التوصيل المتوقع: 1-2 يوم</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Truck" className="h-4 w-4" />
                    <span>سيتم تعيين سائق تلقائياً</span>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Icon name="Loader2" className="ml-2 h-4 w-4 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Icon name="Check" className="ml-2 h-4 w-4" />
                      إنشاء الطلب
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon name="Info" className="h-4 w-4" />
                  نصائح مهمة
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• تأكد من صحة رقم هاتف العميل</p>
                <p>• اكتب العنوان بالتفصيل لتسهيل التوصيل</p>
                <p>• حدد قيمة COD بدقة</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
