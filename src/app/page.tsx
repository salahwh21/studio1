
'use client';

import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';
import { LoginExperienceContext } from '@/context/LoginExperienceContext';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { InstagramIcon } from '@/components/icons/instagram-icon';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import { Skeleton } from '@/components/ui/skeleton';


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


export default function LoginPage() {
  const router = useRouter();
  const context = useContext(LoginExperienceContext);

  if (!context || !context.isHydrated) {
    return <LoginPageSkeleton />;
  }
  
  const { settings } = context;
  
  const socialLinksExist = settings.socialLinks.whatsapp || settings.socialLinks.instagram || settings.socialLinks.facebook;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-muted">
      <Card 
        className="z-20 w-full max-w-md rounded-2xl border-0 p-2 shadow-2xl bg-card"
      >
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            {settings.loginLogo ? (
                <Image src={settings.loginLogo} alt="Company Logo" width={150} height={50} style={{objectFit: 'contain'}} />
            ) : (
                <Logo />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">{settings.welcomeMessage}</CardTitle>
          <CardDescription>نظام إدارة التوصيل</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم أو البريد الإلكتروني</Label>
              <Input id="username" type="text" placeholder="اسم المستخدم أو البريد" defaultValue="admin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" placeholder="كلمة المرور" />
            </div>
            <Button onClick={() => router.push('/dashboard')} size="lg" className="w-full">
              تسجيل الدخول
            </Button>
          </div>
          
          <div className="my-4 flex items-center">
            <Separator className="flex-1" />
            <span className="mx-4 text-xs text-muted-foreground">أو</span>
            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => router.push('/dashboard/merchant')} variant="outline">
              دخول كتاجر
            </Button>
            <Button onClick={() => router.push('/dashboard/driver-app')} variant="outline">
              دخول كسائق
            </Button>
          </div>
           {settings.showForgotPassword && (
              <Button variant="link" size="sm" className="mx-auto mt-4 block">
                هل نسيت كلمة المرور؟
              </Button>
           )}
          
          {socialLinksExist && (
            <>
              <Separator className="my-4"/>
              <div className="flex justify-center gap-4">
                {settings.socialLinks.whatsapp && (
                  <a href={`https://wa.me/${settings.socialLinks.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"><WhatsappIcon className="h-10 w-10"/></Button>
                  </a>
                )}
                {settings.socialLinks.instagram && (
                  <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"><InstagramIcon className="h-6 w-6"/></Button>
                  </a>
                )}
                 {settings.socialLinks.facebook && (
                  <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"><FacebookIcon className="h-6 w-6"/></Button>
                  </a>
                )}
              </div>
            </>
          )}

        </CardContent>
      </Card>
    </main>
  );
}
