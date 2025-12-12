'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/icon';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function MerchantProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      toast({
        title: 'تم الحفظ بنجاح!',
        description: 'تم تحديث معلومات ملفك الشخصي',
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">الملف الشخصي</h1>
        <p className="text-muted-foreground mt-1">إدارة معلوماتك الشخصية وإعدادات حسابك</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">ت</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg">اسم التاجر</h3>
                <p className="text-sm text-muted-foreground">متجر الوميض</p>
              </div>
              <Button variant="outline" className="w-full">
                <Icon name="Upload" className="ml-2 h-4 w-4" />
                تغيير الصورة
              </Button>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">رقم التاجر</span>
                <span className="font-medium">M-1001</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">تاريخ الانضمام</span>
                <span className="font-medium">2024-01-01</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">الحالة</span>
                <span className="inline-flex items-center gap-1 text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-600" />
                  نشط
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input id="name" defaultValue="اسم التاجر" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeName">اسم المتجر</Label>
                  <Input id="storeName" defaultValue="متجر الوميض" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input id="phone" defaultValue="0791234567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" defaultValue="merchant@example.com" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات العمل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="businessType">نوع النشاط</Label>
                  <Input id="businessType" defaultValue="ملابس" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                  <Input id="taxNumber" defaultValue="123456789" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">عنوان المتجر</Label>
                <Input id="address" defaultValue="عمان - الجبيهة" />
              </div>
            </CardContent>
          </Card>

          {/* Bank Info */}
          <Card>
            <CardHeader>
              <CardTitle>المعلومات البنكية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bankName">اسم البنك</Label>
                  <Input id="bankName" placeholder="البنك الأهلي" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">رقم الحساب</Label>
                  <Input id="accountNumber" placeholder="1234567890" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">رقم IBAN</Label>
                <Input id="iban" placeholder="JO00XXXX0000000000000000000000" />
              </div>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle>تغيير كلمة المرور</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline">إلغاء</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Icon name="Loader2" className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Icon name="Save" className="ml-2 h-4 w-4" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
