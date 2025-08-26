'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <Image
        src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop"
        alt="Background"
        fill
        className="z-0 object-cover"
        data-ai-hint="hotel reception"
      />
      <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm" />
      
      <Card className="z-20 w-full max-w-md rounded-2xl border-0 bg-card/80 p-2 shadow-2xl backdrop-blur-lg">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">مرحباً بك في الوميض</CardTitle>
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
           <Button variant="link" size="sm" className="mx-auto mt-4 block">
              هل نسيت كلمة المرور؟
            </Button>
        </CardContent>
      </Card>
    </main>
  );
}
