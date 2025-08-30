
'use client';

import { useContext, useMemo } from 'react';
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
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { InstagramIcon } from '@/components/icons/instagram-icon';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import { Skeleton } from '@/components/ui/skeleton';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
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
    <Label htmlFor={id} className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground" />
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
  const context = useContext(LoginExperienceContext);

  if (!context) {
    return <div>جاري تحميل إعدادات تجربة المستخدم...</div>;
  }
  
  const { settings, setSetting, setSocialLink, isHydrated } = context;

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
    toast({
      title: 'تم الحفظ بنجاح!',
      description: 'يتم حفظ تغييراتك تلقائيًا عند كل تعديل.',
    });
  };
  
  const previewStyle = useMemo(() => ({
    background: settings.loginBg ? `url(${settings.loginBg})` : 'hsl(var(--muted))',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } as React.CSSProperties), [settings.loginBg]);
  
  const socialLinksExist = settings.socialLinks.whatsapp || settings.socialLinks.instagram || settings.socialLinks.facebook;

  return (
    <motion.div 
      className="space-y-8"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Settings Column */}
        <div className="lg:col-span-2 space-y-8">
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
                        <Label htmlFor="showForgotPassword" className="font-medium cursor-pointer">
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
                    <FileUploadButton 
                        id="loginLogo" 
                        label="شعار صفحة الدخول" 
                        fileSrc={settings.loginLogo}
                        onFileChange={handleFileChange}
                        onRemove={handleRemoveFile}
                    />
                    <FileUploadButton 
                        id="loginBg" 
                        label="خلفية صفحة الدخول"
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
                    <SocialInput id="whatsapp" label="رقم واتساب" icon={MessageSquare} placeholder="962..." value={settings.socialLinks.whatsapp} onChange={(e) => setSocialLink('whatsapp', e.target.value)} />
                    <SocialInput id="instagram" label="رابط انستغرام" icon={Instagram} placeholder="https://instagram.com/..." value={settings.socialLinks.instagram} onChange={(e) => setSocialLink('instagram', e.target.value)} />
                    <SocialInput id="facebook" label="رابط فيسبوك" icon={Facebook} placeholder="https://facebook.com/..." value={settings.socialLinks.facebook} onChange={(e) => setSocialLink('facebook', e.target.value)} />
                </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-1 lg:sticky lg:top-24">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={3}>
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>معاينة حية</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div style={previewStyle} className="flex min-h-[550px] items-center justify-center p-4 transition-all duration-300">
                           <Card className="z-10 w-full max-w-sm bg-background/80 backdrop-blur-sm">
                               <CardHeader className="text-center">
                                   <div className="mx-auto mb-4 h-12 flex items-center justify-center">
                                       {settings.loginLogo ? (
                                           <Image src={settings.loginLogo} alt="Logo Preview" width={150} height={50} style={{objectFit: 'contain'}} />
                                       ) : (
                                           <Logo />
                                       )}
                                   </div>
                                   <CardTitle className="text-xl font-bold">{settings.welcomeMessage}</CardTitle>
                               </CardHeader>
                               <CardContent>
                                   <div className="space-y-3">
                                       <div className="space-y-1">
                                           <Label className="text-xs">اسم المستخدم</Label>
                                           <Input defaultValue="admin" disabled />
                                       </div>
                                        <div className="space-y-1">
                                           <Label className="text-xs">كلمة المرور</Label>
                                           <Input type="password" defaultValue="password" disabled />
                                       </div>
                                       <Button className="w-full">تسجيل الدخول</Button>
                                   </div>
                                   {settings.showForgotPassword && (
                                       <Button variant="link" size="sm" className="mx-auto mt-2 block h-auto p-0 text-xs">هل نسيت كلمة المرور؟</Button>
                                   )}
                                   {socialLinksExist && (
                                       <>
                                       <Separator className="my-3"/>
                                       <div className="flex justify-center gap-2">
                                           {settings.socialLinks.whatsapp && <Button variant="ghost" size="icon" className="h-8 w-8"><WhatsappIcon/></Button>}
                                           {settings.socialLinks.instagram && <Button variant="ghost" size="icon" className="h-8 w-8"><InstagramIcon/></Button>}
                                           {settings.socialLinks.facebook && <Button variant="ghost" size="icon" className="h-8 w-8"><FacebookIcon/></Button>}
                                       </div>
                                       </>
                                   )}
                               </CardContent>
                           </Card>
                       </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
      </div>

      <div className="flex justify-start pt-4 border-t">
        <Button size="lg" onClick={handleSaveChanges}>
          <Save className="ml-2 h-4 w-4" />
          حفظ التغييرات
        </Button>
      </div>
    </motion.div>
  );
}

    