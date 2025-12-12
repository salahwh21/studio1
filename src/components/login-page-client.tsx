
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { InstagramIcon } from '@/components/icons/instagram-icon';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/icon';
import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';


const LoginPageSkeleton = () => (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-muted">
         <Card className="z-20 w-full max-w-md rounded-2xl border-0 p-2 shadow-2xl bg-card">
             <CardHeader>
                <Skeleton className="h-10 w-32 mx-auto mb-4" />
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto mt-2" />
             </CardHeader>
             <CardContent className="flex flex-col gap-4">
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                 </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                 </div>
                 <Skeleton className="h-11 w-full" />
                 <div className="my-4 flex items-center">
                    <Separator className="flex-1" />
                    <span className="mx-4 text-xs text-muted-foreground">أو</span>
                    <Separator className="flex-1" />
                  </div>
                   <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
             </CardContent>
         </Card>
    </div>
);


export default function LoginPageClient() {
  const router = useRouter();
  const context = useSettings();
  const { login, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!context || !context.isHydrated) {
    return <LoginPageSkeleton />;
  }
  
  const { settings } = context;
  const loginSettings = settings.login;
  
  const socialLinksExist = loginSettings.socialLinks.whatsapp || loginSettings.socialLinks.instagram || loginSettings.socialLinks.facebook;

  const LoginLogo = () => {
    if (loginSettings.loginLogo) {
        return <Image src={loginSettings.loginLogo} alt={loginSettings.companyName || "Company Logo"} width={150} height={50} style={{objectFit: 'contain'}} />
    }
    return <Logo />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: "خطأ في البيانات",
        description: "الرجاء إدخال البريد الإلكتروني وكلمة المرور.",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login(email, password);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "فشل تسجيل الدخول",
        description: error.message || "الرجاء التحقق من البريد الإلكتروني وكلمة المرور.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-muted">
      {loginSettings.loginBg && (
        <Image
            src={loginSettings.loginBg}
            alt="Background"
            fill
            className="absolute inset-0 z-0 object-cover opacity-20"
        />
      )}
      <Card 
        className="z-20 w-full max-w-md rounded-2xl border-0 p-2 shadow-2xl bg-card"
      >
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <LoginLogo />
          </div>
          <CardTitle className="text-2xl font-bold">{loginSettings.welcomeMessage || 'مرحباً بعودتك'}</CardTitle>
          <CardDescription>نظام إدارة التوصيل</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">رقم الهاتف أو البريد الإلكتروني</Label>
              <Input 
                id="email" 
                type="text" 
                placeholder="admin@alwameed.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="كلمة المرور" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>
            <Button 
              type="submit" 
              size="lg" 
              className="w-full" 
              disabled={isSubmitting || authLoading}
            >
              {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>
          
          <div className="my-4 flex items-center">
            <Separator className="flex-1" />
            <span className="mx-4 text-xs text-muted-foreground">أو</span>
            <Separator className="flex-1" />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-center text-muted-foreground">
              تسجيل دخول سريع للتجار والسائقين
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEmail('merchant@alwameed.com');
                  setPassword('123');
                }}
              >
                <Icon name="Store" className="ml-2 h-4 w-4" />
                دخول كتاجر
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setEmail('driver@alwameed.com');
                  setPassword('123');
                }}
              >
                <Icon name="Truck" className="ml-2 h-4 w-4" />
                دخول كسائق
              </Button>
            </div>
          </div>
           {loginSettings.showForgotPassword && (
              <Button variant="link" size="sm" className="mx-auto mt-4 block">
                هل نسيت كلمة المرور؟
              </Button>
           )}
          
          {socialLinksExist && (
            <>
              <Separator className="my-4"/>
              <div className="flex justify-center gap-4">
                {loginSettings.socialLinks.whatsapp && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`https://wa.me/${loginSettings.socialLinks.whatsapp}`} target="_blank" rel="noopener noreferrer">
                      <WhatsappIcon className="h-6 w-6"/>
                    </a>
                  </Button>
                )}
                {loginSettings.socialLinks.instagram && (
                   <Button variant="ghost" size="icon" asChild>
                    <a href={loginSettings.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                      <InstagramIcon className="h-6 w-6"/>
                    </a>
                  </Button>
                )}
                 {loginSettings.socialLinks.facebook && (
                   <Button variant="ghost" size="icon" asChild>
                    <a href={loginSettings.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                      <FacebookIcon className="h-6 w-6"/>
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}

        </CardContent>
      </Card>
    </main>
  );
}
