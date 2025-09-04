
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useUsersStore } from '@/store/user-store';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountSettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const { users, updateCurrentUser } = useUsersStore();
  const currentUser = users.find(u => u.id === 'user-salahwh'); // Assuming admin is the current user

  // Local state for form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPhone(currentUser.email); // Assuming email field holds the phone number for login
      setEmail(currentUser.email); // You might want a separate email field in your user model later
      setWhatsapp(currentUser.whatsapp || '');
      setAvatar(currentUser.avatar || null);
    }
  }, [currentUser]);
  

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleProfileSave = () => {
    if (!currentUser) return;
    updateCurrentUser({
        name,
        email, // This would update the login phone/email
        whatsapp,
        avatar: avatar || '',
    });
    toast({ title: "تم الحفظ", description: "تم تحديث معلومات ملفك الشخصي بنجاح." });
  };
  
  const handlePasswordSave = () => {
     if (!currentUser) return;
    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ variant: 'destructive', title: "خطأ", description: "الرجاء ملء جميع حقول كلمة المرور." });
      return;
    }
    if (currentPassword !== currentUser.password) {
        toast({ variant: 'destructive', title: "خطأ", description: "كلمة المرور الحالية غير صحيحة." });
        return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: "خطأ", description: "كلمتا المرور الجديدتان غير متطابقتين." });
      return;
    }

    updateCurrentUser({ password: newPassword });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast({ title: "تم التغيير", description: "تم تحديث كلمة المرور بنجاح." });
  };

  if (!currentUser) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }


  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Icon name="User" /> إعدادات الحساب
            </CardTitle>
            <CardDescription className="mt-1">
              إدارة معلومات ملفك الشخصي، إعدادات الأمان، وتفضيلاتك.
            </CardDescription>
          </div>
           <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/settings">
              <Icon name="ArrowLeft" className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>الملف الشخصي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24 border-2 border-primary">
                    <AvatarImage src={avatar || ''} alt={name} />
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button asChild variant="outline">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <Icon name="Upload" className="mr-2 h-4 w-4" />
                        تغيير الصورة
                        <input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} />
                    </Label>
                </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف (للدخول)</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="079xxxxxxx" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني (للتقارير)</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="whatsapp">رقم واتساب (للمراسلات)</Label>
              <Input id="whatsapp" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="962..."/>
            </div>
            <Button onClick={handleProfileSave} className="w-full">
                <Icon name="Save" className="mr-2 h-4 w-4" />
                حفظ تغييرات الملف الشخصي
            </Button>
          </CardContent>
        </Card>

        {/* Security and Preferences Card */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>أمان الحساب</CardTitle>
                    <CardDescription>تغيير كلمة المرور الخاصة بك.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                        <div className="relative">
                            <Input id="current-password" type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}/>
                            <Button variant="ghost" size="icon" className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowCurrentPassword(prev => !prev)}>
                                <Icon name={showCurrentPassword ? 'EyeOff' : 'Eye'} className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                         <div className="relative">
                            <Input id="new-password" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            <Button variant="ghost" size="icon" className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(prev => !prev)}>
                                <Icon name={showNewPassword ? 'EyeOff' : 'Eye'} className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
                        <div className="relative">
                            <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            <Button variant="ghost" size="icon" className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(prev => !prev)}>
                                <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                     <Button onClick={handlePasswordSave}>
                        <Icon name="Save" className="mr-2 h-4 w-4" />
                        تغيير كلمة المرور
                    </Button>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>التفضيلات</CardTitle>
                    <CardDescription>تخصيص تجربة استخدامك للنظام.</CardDescription>
                </CardHeader>
                 <CardContent className="flex items-center gap-4">
                    <span className="text-sm font-medium">المظهر:</span>
                     <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>
                        <Icon name="Sun" className="mr-2 h-4 w-4" />
                        فاتح
                    </Button>
                     <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>
                        <Icon name="Moon" className="mr-2 h-4 w-4" />
                        داكن
                    </Button>
                 </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
