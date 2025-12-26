'use client';

import { 
  Upload, 
  Facebook, 
  Instagram, 
  MessageSquare, 
  X, 
  Save, 
  Eye,
  Palette,
  Link2,
  Settings2,
  Image,
  Type,
  ToggleRight,
  Smartphone,
  Monitor,
  ExternalLink,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsHeader } from '@/components/settings-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginExperiencePage() {
  const { toast } = useToast();
  const context = useSettings();
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  if (!context || !context.isHydrated) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const { settings, updateLoginSetting, updateSocialLink } = context;

  const handleFileChange = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      updateLoginSetting(id as any, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (id: string) => {
    updateLoginSetting(id as any, null);
  };

  const handleSaveChanges = () => {
    toast({
      title: 'تم الحفظ بنجاح!',
      description: 'تم تحديث إعدادات صفحة تسجيل الدخول.',
    });
  };

  // Stats cards data
  const statsCards = [
    { 
      icon: Type, 
      label: 'رسالة الترحيب', 
      value: settings.login.welcomeMessage || 'غير محدد',
      color: 'bg-blue-500/10 text-blue-600'
    },
    { 
      icon: Image, 
      label: 'الشعار', 
      value: settings.login.loginLogo ? 'مرفوع' : 'افتراضي',
      color: 'bg-purple-500/10 text-purple-600'
    },
    { 
      icon: Link2, 
      label: 'روابط التواصل', 
      value: [settings.login.socialLinks.whatsapp, settings.login.socialLinks.instagram, settings.login.socialLinks.facebook].filter(Boolean).length + ' روابط',
      color: 'bg-green-500/10 text-green-600'
    },
    { 
      icon: ToggleRight, 
      label: 'نسيت كلمة المرور', 
      value: settings.login.showForgotPassword ? 'مفعل' : 'معطل',
      color: 'bg-amber-500/10 text-amber-600'
    },
  ];

  return (
    <div className="space-y-6">
      <SettingsHeader
        icon="LogIn"
        title="تجربة تسجيل الدخول"
        description="تخصيص مظهر ووظائف صفحة تسجيل الدخول للمستخدمين"
        color="purple"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="border-r-4 border-r-primary/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-semibold text-sm truncate">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">التغييرات تُحفظ تلقائياً</span>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/login" target="_blank" className="gap-2">
            <Eye className="h-4 w-4" />
            معاينة صفحة الدخول
            <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6" dir="rtl">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="basic" className="gap-2 py-2.5">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">الإعدادات الأساسية</span>
            <span className="sm:hidden">أساسي</span>
          </TabsTrigger>
          <TabsTrigger value="design" className="gap-2 py-2.5">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">التصميم المرئي</span>
            <span className="sm:hidden">التصميم</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2 py-2.5">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">روابط التواصل</span>
            <span className="sm:hidden">التواصل</span>
          </TabsTrigger>
        </TabsList>

        {/* Basic Settings Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Type className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">النصوص والرسائل</CardTitle>
                  <CardDescription>تخصيص النصوص التي تظهر في صفحة تسجيل الدخول</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="welcomeMessage" className="text-sm font-medium">رسالة الترحيب</Label>
                <Input
                  id="welcomeMessage"
                  value={settings.login.welcomeMessage}
                  onChange={(e) => updateLoginSetting('welcomeMessage', e.target.value)}
                  placeholder="مرحباً بعودتك"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  هذه الرسالة تظهر في أعلى نموذج تسجيل الدخول
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="companyName" className="text-sm font-medium">اسم الشركة</Label>
                <Input
                  id="companyName"
                  value={settings.login.companyName || ''}
                  onChange={(e) => updateLoginSetting('companyName', e.target.value)}
                  placeholder="الوميض"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  يظهر في أسفل صفحة تسجيل الدخول (حقوق النشر)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <ToggleRight className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">خيارات إضافية</CardTitle>
                  <CardDescription>تفعيل أو تعطيل ميزات صفحة تسجيل الدخول</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <Label htmlFor="showForgotPassword" className="font-medium cursor-pointer">
                      إظهار رابط "نسيت كلمة المرور"
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      يسمح للمستخدمين باستعادة كلمة المرور
                    </p>
                  </div>
                </div>
                <Switch
                  id="showForgotPassword"
                  checked={settings.login.showForgotPassword}
                  onCheckedChange={(checked) => updateLoginSetting('showForgotPassword', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Image className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">الشعار والخلفية</CardTitle>
                  <CardDescription>رفع الشعار وصورة الخلفية لصفحة تسجيل الدخول</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">شعار صفحة الدخول</Label>
                <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed hover:border-primary/50 transition-colors">
                  {settings.login.loginLogo ? (
                    <div className="relative">
                      <img 
                        src={settings.login.loginLogo} 
                        alt="Logo" 
                        className="h-16 w-auto object-contain rounded-lg bg-muted p-2"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => handleRemoveFile('loginLogo')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                      <Image className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {settings.login.loginLogo ? 'تغيير الشعار' : 'رفع شعار'}
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG أو SVG (الحد الأقصى 2MB)</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Label htmlFor="loginLogo" className="cursor-pointer gap-2">
                      <Upload className="h-4 w-4" />
                      {settings.login.loginLogo ? 'تغيير' : 'رفع'}
                      <Input 
                        id="loginLogo" 
                        type="file" 
                        accept="image/*"
                        className="sr-only" 
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileChange('loginLogo', e.target.files[0]);
                          }
                        }} 
                      />
                    </Label>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Background Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">خلفية صفحة الدخول</Label>
                <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed hover:border-primary/50 transition-colors">
                  {settings.login.loginBg ? (
                    <div className="relative">
                      <img 
                        src={settings.login.loginBg} 
                        alt="Background" 
                        className="h-16 w-24 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => handleRemoveFile('loginBg')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="h-16 w-24 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Palette className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {settings.login.loginBg ? 'تغيير الخلفية' : 'رفع خلفية'}
                    </p>
                    <p className="text-xs text-muted-foreground">صورة عالية الجودة (يُفضل 1920x1080)</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Label htmlFor="loginBg" className="cursor-pointer gap-2">
                      <Upload className="h-4 w-4" />
                      {settings.login.loginBg ? 'تغيير' : 'رفع'}
                      <Input 
                        id="loginBg" 
                        type="file" 
                        accept="image/*"
                        className="sr-only" 
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileChange('loginBg', e.target.files[0]);
                          }
                        }} 
                      />
                    </Label>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Eye className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">معاينة سريعة</CardTitle>
                    <CardDescription>شاهد كيف ستظهر صفحة تسجيل الدخول</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                  <Button 
                    variant={previewMode === 'desktop' ? 'secondary' : 'ghost'} 
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={previewMode === 'mobile' ? 'secondary' : 'ghost'} 
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`mx-auto rounded-xl overflow-hidden border shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 ${
                previewMode === 'mobile' ? 'max-w-[280px]' : 'max-w-full'
              }`}>
                <div className="p-6 text-center" dir="rtl">
                  {/* Logo Preview */}
                  <div className="mb-4 flex justify-center">
                    {settings.login.loginLogo ? (
                      <img 
                        src={settings.login.loginLogo} 
                        alt="Logo" 
                        className="h-12 w-auto object-contain"
                      />
                    ) : (
                      <div className="h-12 w-24 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">الشعار</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Welcome Message Preview */}
                  <h3 className="font-bold text-lg mb-1">
                    {settings.login.welcomeMessage || 'مرحباً بعودتك'}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">نظام إدارة التوصيل</p>
                  
                  {/* Form Preview */}
                  <div className="space-y-2">
                    <div className="h-9 bg-background rounded-lg border" />
                    <div className="h-9 bg-background rounded-lg border" />
                    <div className="h-9 bg-primary rounded-lg" />
                  </div>
                  
                  {/* Footer Preview */}
                  <p className="text-[10px] text-muted-foreground mt-4">
                    © 2024 {settings.login.companyName || 'الوميض'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Links Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Link2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">روابط التواصل الاجتماعي</CardTitle>
                  <CardDescription>أضف روابط حساباتك على منصات التواصل الاجتماعي</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* WhatsApp */}
              <div className="space-y-3">
                <Label htmlFor="whatsapp" className="flex items-center gap-2 text-sm font-medium">
                  <div className="p-1.5 rounded-lg bg-green-500/10">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  رقم واتساب
                </Label>
                <Input 
                  id="whatsapp" 
                  placeholder="962791234567" 
                  value={settings.login.socialLinks.whatsapp} 
                  onChange={(e) => updateSocialLink('whatsapp', e.target.value)}
                  className="h-11"
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">
                  أدخل الرقم بالصيغة الدولية بدون علامة +
                </p>
              </div>

              <Separator />

              {/* Instagram */}
              <div className="space-y-3">
                <Label htmlFor="instagram" className="flex items-center gap-2 text-sm font-medium">
                  <div className="p-1.5 rounded-lg bg-pink-500/10">
                    <Instagram className="h-4 w-4 text-pink-600" />
                  </div>
                  رابط انستغرام
                </Label>
                <Input 
                  id="instagram" 
                  placeholder="https://instagram.com/yourpage" 
                  value={settings.login.socialLinks.instagram} 
                  onChange={(e) => updateSocialLink('instagram', e.target.value)}
                  className="h-11"
                  dir="ltr"
                />
              </div>

              <Separator />

              {/* Facebook */}
              <div className="space-y-3">
                <Label htmlFor="facebook" className="flex items-center gap-2 text-sm font-medium">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Facebook className="h-4 w-4 text-blue-600" />
                  </div>
                  رابط فيسبوك
                </Label>
                <Input 
                  id="facebook" 
                  placeholder="https://facebook.com/yourpage" 
                  value={settings.login.socialLinks.facebook} 
                  onChange={(e) => updateSocialLink('facebook', e.target.value)}
                  className="h-11"
                  dir="ltr"
                />
              </div>

              {/* Info Note */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">ملاحظة</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ستظهر أيقونات التواصل الاجتماعي في أسفل صفحة تسجيل الدخول فقط إذا تم إدخال الروابط
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-6 border-t">
        <p className="text-sm text-muted-foreground">
          آخر تحديث: الآن
        </p>
        <Button size="lg" onClick={handleSaveChanges} className="gap-2">
          <Save className="h-4 w-4" />
          حفظ التغييرات
        </Button>
      </div>
    </div>
  );
}
