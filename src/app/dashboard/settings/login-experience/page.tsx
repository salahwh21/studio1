'use client';

import { Upload, Facebook, Instagram, MessageSquare, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import Link from 'next/link';
import Icon from '@/components/icon';
import { Skeleton } from '@/components/ui/skeleton';

const SocialInput = ({ id, label, icon: IconComponent, placeholder, value, onChange }: { id: string; label: string; icon: React.ElementType; placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="flex items-center gap-2 text-sm">
      <IconComponent className="h-4 w-4 text-muted-foreground" />
      {label}
    </Label>
    <Input id={id} name={id} placeholder={placeholder} value={value} onChange={onChange} />
  </div>
);

const FileUploadButton = ({ id, label, fileSrc, onFileChange, onRemove }: { id: string, label: string, fileSrc: string | null, onFileChange: (id: string, file: File) => void, onRemove: (id: string) => void }) => (
    <div className="flex items-center justify-between rounded-lg border p-3">
        <div className='flex items-center gap-3'>
            <Label htmlFor={id} className="font-medium cursor-pointer">{label}</Label>
        </div>
        <div className="flex items-center gap-2">
            {fileSrc && (
                 <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => onRemove(id)}
                >
                    <X className="h-4 w-4 text-destructive" />
                </Button>
            )}
            <Button variant="outline" size="sm" asChild className="h-8">
                <Label htmlFor={id} className="cursor-pointer gap-2">
                <Upload className="h-4 w-4" />
                <span>{fileSrc ? 'تغيير' : 'رفع'}</span>
                <Input id={id} type="file" className="sr-only" onChange={(e) => {
                    if (e.target.files?.[0]) {
                        onFileChange(id, e.target.files[0]);
                    }
                }} />
                </Label>
            </Button>
        </div>
    </div>
);

export default function LoginExperiencePage() {
  const { toast } = useToast();
  const context = useSettings();

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
  }

  const handleSaveChanges = () => {
    // The context already saves to localStorage on change,
    // so this is just for user feedback.
    toast({
      title: 'تم الحفظ بنجاح!',
      description: 'تم تحديث إعدادات صفحة تسجيل الدخول.',
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">تجربة تسجيل الدخول</CardTitle>
            <CardDescription className="mt-1">تخصيص مظهر ووظائف صفحة تسجيل الدخول.</CardDescription>
          </div>
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/settings/general">
              <Icon name="ArrowLeft" className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <main>
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>الإعدادات الأساسية</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="welcomeMessage">رسالة الترحيب</Label>
                        <Input 
                            id="welcomeMessage" 
                            value={settings.login.welcomeMessage}
                            onChange={(e) => updateLoginSetting('welcomeMessage', e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <Label htmlFor="showForgotPassword" className="font-medium cursor-pointer">
                        إظهار رابط "نسيت كلمة المرور"
                        </Label>
                        <Switch
                        id="showForgotPassword"
                        checked={settings.login.showForgotPassword}
                        onCheckedChange={(checked) => updateLoginSetting('showForgotPassword', checked)}
                        />
                    </div>
                </CardContent>
            </Card>
        
            <Card>
                <CardHeader><CardTitle>التصميم المرئي</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FileUploadButton 
                        id="loginLogo" 
                        label="شعار صفحة الدخول" 
                        fileSrc={settings.login.loginLogo}
                        onFileChange={handleFileChange}
                        onRemove={handleRemoveFile}
                    />
                    <FileUploadButton 
                        id="loginBg" 
                        label="خلفية صفحة الدخول"
                        fileSrc={settings.login.loginBg}
                        onFileChange={handleFileChange}
                        onRemove={handleRemoveFile}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>روابط التواصل الاجتماعي</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SocialInput id="whatsapp" label="رقم واتساب" icon={MessageSquare} placeholder="962..." value={settings.login.socialLinks.whatsapp} onChange={(e) => updateSocialLink('whatsapp', e.target.value)} />
                    <SocialInput id="instagram" label="رابط انستغرام" icon={Instagram} placeholder="https://instagram.com/..." value={settings.login.socialLinks.instagram} onChange={(e) => updateSocialLink('instagram', e.target.value)} />
                    <SocialInput id="facebook" label="رابط فيسبوك" icon={Facebook} placeholder="https://facebook.com/..." value={settings.login.socialLinks.facebook} onChange={(e) => updateSocialLink('facebook', e.target.value)} />
                </CardContent>
            </Card>
        </div>

        <div className="flex justify-start pt-6 mt-6 border-t">
            <Button size="lg" onClick={handleSaveChanges}>
            <Save className="ml-2 h-4 w-4" />
            حفظ التغييرات
            </Button>
      </div>
      </main>
    </div>
  );
}
