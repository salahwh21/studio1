import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">مركز التحكم</h1>
        <p className="text-muted-foreground">إدارة حسابك وإعدادات النظام.</p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>إعدادات الملف الشخصي</CardTitle>
          <CardDescription>تحديث معلوماتك الشخصية.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">الاسم الأول</Label>
              <Input id="firstName" defaultValue="مسؤول" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">الاسم الأخير</Label>
              <Input id="lastName" defaultValue="النظام" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" defaultValue="admin@alwameedh.com" />
          </div>
          <Button>تحديث الملف الشخصي</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات الإشعارات</CardTitle>
          <CardDescription>اختر كيف تريد أن يتم إعلامك.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="new-order-email" className="font-medium">الطلبات الجديدة</Label>
              <p className="text-sm text-muted-foreground">استلام بريد إلكتروني لكل طلب جديد.</p>
            </div>
            <Switch id="new-order-email" defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="return-request-email" className="font-medium">طلبات الإرجاع</Label>
              <p className="text-sm text-muted-foreground">الحصول على إشعار حول طلبات الإرجاع الجديدة.</p>
            </div>
            <Switch id="return-request-email" />
          </div>
           <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="daily-summary-email" className="font-medium">الملخص اليومي</Label>
              <p className="text-sm text-muted-foreground">استلام ملخص يومي للأنشطة.</p>
            </div>
            <Switch id="daily-summary-email" defaultChecked/>
          </div>
          <Button>حفظ التفضيلات</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>إعدادات النظام</CardTitle>
          <CardDescription>إدارة تكوينات النظام العامة.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">اللغة</Label>
            <Select defaultValue="ar">
                <SelectTrigger id="language">
                    <SelectValue placeholder="اختر اللغة" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <Label htmlFor="theme">المظهر</Label>
            <Select>
                <SelectTrigger id="theme">
                    <SelectValue placeholder="اختر المظهر" />
                </Trigger>
                <SelectContent>
                    <SelectItem value="light">فاتح</SelectItem>
                    <SelectItem value="dark">داكن</SelectItem>
                    <SelectItem value="system">النظام</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <Button>حفظ الإعدادات</Button>
        </CardContent>
      </Card>
    </div>
  );
}
