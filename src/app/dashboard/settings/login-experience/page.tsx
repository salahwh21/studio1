
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Facebook, Instagram, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const SocialInput = ({ id, label, icon: Icon, placeholder }: { id: string, label: string, icon: React.ElementType, placeholder: string }) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <Input id={id} placeholder={placeholder} className="pl-10" />
    </div>
  </div>
);

const FileUploadButton = ({ id, label }: { id: string, label: string }) => (
    <div className="flex items-center justify-between rounded-lg border p-4">
        <span className="text-sm font-medium">{label}</span>
        <Button variant="outline" size="sm" asChild>
            <Label htmlFor={id} className="cursor-pointer gap-2">
            <Upload className="h-4 w-4" />
            <span>رفع</span>
            <Input id={id} type="file" className="sr-only" />
            </Label>
        </Button>
    </div>
);


export default function LoginExperiencePage() {
  const { toast } = useToast();
  const [showForgotPassword, setShowForgotPassword] = useState(true);

  const handleSaveChanges = () => {
    toast({
      title: 'تم الحفظ بنجاح!',
      description: 'تم تحديث إعدادات تجربة تسجيل الدخول.',
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">تجربة تسجيل الدخول</h1>
          <p className="text-muted-foreground">
            تخصيص مظهر ووظائف صفحة تسجيل الدخول.
          </p>
        </div>
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/settings/general">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">رسالة الترحيب</Label>
            <Input id="welcomeMessage" defaultValue="أهلاً بعودتك!" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardColor">لون خلفية البطاقة</Label>
            <Input id="cardColor" type="color" defaultValue="#ffffff" className="h-12 p-1" />
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <FileUploadButton id="loginLogo" label="شعار مخصص لصفحة الدخول" />
            <FileUploadButton id="loginBg" label="صورة خلفية لصفحة الدخول" />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <Label htmlFor="showForgotPassword" className="font-medium">
              إظهار رابط "نسيت كلمة المرور"
            </Label>
            <Switch
              id="showForgotPassword"
              checked={showForgotPassword}
              onCheckedChange={setShowForgotPassword}
            />
          </div>

          <div>
             <h3 className="mb-4 text-lg font-medium">روابط التواصل الاجتماعي</h3>
             <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <SocialInput id="whatsapp" label="رقم واتساب" icon={MessageSquare} placeholder="9647..." />
                <SocialInput id="instagram" label="رابط انستغرام" icon={Instagram} placeholder="https://instagram.com/..." />
                <SocialInput id="facebook" label="رابط فيسبوك" icon={Facebook} placeholder="https://facebook.com/..." />
             </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-start">
        <Button size="lg" onClick={handleSaveChanges}>حفظ التغييرات</Button>
      </div>
    </div>
  );
}
