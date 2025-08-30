
'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Facebook, Instagram, MessageSquare, X, LogIn, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { LoginExperienceContext } from '@/context/LoginExperienceContext';
import Image from 'next/image';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut"
    }
  })
};

const SocialInput = ({ id, label, icon: Icon, placeholder, value, onChange }: { id: string; label: string; icon: React.ElementType; placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </Label>
    <Input id={id} name={id} placeholder={placeholder} value={value} onChange={onChange} />
  </div>
);

const FileUploadButton = ({ id, label, fileSrc, onFileChange, onRemove }: { id: string, label: string, fileSrc: string | null, onFileChange: (id: string, file: File) => void, onRemove: (id: string) => void }) => (
    <div className="flex items-center justify-between rounded-lg border p-4">
        <div className='flex items-center gap-4'>
            {fileSrc ? (
                <div className="relative h-10 w-10">
                    <Image src={fileSrc} alt={`${label} preview`} layout="fill" objectFit="contain" className='rounded-md' />
                     <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -right-3 -top-3 z-10 h-5 w-5 rounded-full"
                        onClick={() => onRemove(id)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            ) : null}
            <span className="text-sm font-medium">{label}</span>
        </div>
        <Button variant="outline" size="sm" asChild>
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
);


export default function LoginExperiencePage() {
  const { toast } = useToast();
  const context = useContext(LoginExperienceContext);

  if (!context) {
    return <div>جاري تحميل إعدادات تجربة المستخدم...</div>;
  }
  
  const { settings, setSetting, setSocialLink } = context;

  const handleFileChange = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSetting(id, reader.result as string);
       toast({
        title: 'تم رفع الملف!',
        description: `تم تحديث ${id === 'loginLogo' ? 'الشعار' : 'صورة الخلفية'}.`,
      });
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveFile = (id: string) => {
      setSetting(id, null);
  }

  const handleSaveChanges = () => {
    // Since settings are saved on change via context, this is for user feedback.
    toast({
      title: 'تم الحفظ بنجاح!',
      description: 'يتم حفظ تغييراتك تلقائيًا.',
    });
  };

  return (
    <motion.div 
      className="mx-auto max-w-3xl space-y-8 p-4 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <LogIn className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">تجربة تسجيل الدخول</h1>
            <p className="text-muted-foreground">
              تخصيص مظهر ووظائف صفحة تسجيل الدخول.
            </p>
          </div>
        </div>
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/settings/general">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={0}>
        <Card>
            <CardHeader><CardTitle>الإعدادات الأساسية</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="welcomeMessage">رسالة الترحيب</Label>
                    <Input 
                        id="welcomeMessage" 
                        value={settings.welcomeMessage}
                        onChange={(e) => setSetting('welcomeMessage', e.target.value)}
                    />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="showForgotPassword" className="font-medium">
                    إظهار رابط "نسيت كلمة المرور"
                    </Label>
                    <Switch
                    id="showForgotPassword"
                    checked={settings.showForgotPassword}
                    onCheckedChange={(checked) => setSetting('showForgotPassword', checked)}
                    />
                </div>
            </CardContent>
        </Card>
      </motion.div>
      
       <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={1}>
        <Card>
            <CardHeader><CardTitle>التصميم المرئي</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="cardColor">لون خلفية البطاقة</Label>
                    <Input 
                    id="cardColor" 
                    type="color" 
                    value={settings.cardColor} 
                    onChange={(e) => setSetting('cardColor', e.target.value)}
                    className="h-12 p-1" 
                    />
                </div>
                 <FileUploadButton 
                    id="loginLogo" 
                    label="شعار مخصص لصفحة الدخول" 
                    fileSrc={settings.loginLogo}
                    onFileChange={handleFileChange}
                    onRemove={handleRemoveFile}
                />
                <FileUploadButton 
                    id="loginBg" 
                    label="صورة خلفية لصفحة الدخول"
                    fileSrc={settings.loginBg}
                    onFileChange={handleFileChange}
                    onRemove={handleRemoveFile}
                />
            </CardContent>
        </Card>
      </motion.div>

       <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={2}>
        <Card>
            <CardHeader><CardTitle>روابط التواصل الاجتماعي</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SocialInput id="whatsapp" label="رقم واتساب" icon={MessageSquare} placeholder="9647..." value={settings.socialLinks.whatsapp} onChange={(e) => setSocialLink('whatsapp', e.target.value)} />
                <SocialInput id="instagram" label="رابط انستغرام" icon={Instagram} placeholder="https://instagram.com/..." value={settings.socialLinks.instagram} onChange={(e) => setSocialLink('instagram', e.target.value)} />
                <SocialInput id="facebook" label="رابط فيسبوك" icon={Facebook} placeholder="https://facebook.com/..." value={settings.socialLinks.facebook} onChange={(e) => setSocialLink('facebook', e.target.value)} />
            </CardContent>
        </Card>
      </motion.div>

      <div className="flex justify-start">
        <Button size="lg" onClick={handleSaveChanges}>
          <Save className="ml-2 h-4 w-4" />
          حفظ التغييرات
        </Button>
      </div>
    </motion.div>
  );
}
