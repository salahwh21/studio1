
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUsersStore } from '@/store/user-store';
import { useRolesStore, allPermissionGroups } from '@/store/roles-store';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsHeader } from '@/components/settings-header';
import { 
  User, 
  Shield, 
  Settings, 
  Sun, 
  Moon, 
  KeyRound, 
  Mail, 
  Phone, 
  MessageCircle,
  Save,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';

// Mock current user data - in real app this would come from auth context
const mockCurrentUser = {
  id: 'current-admin',
  name: 'صلاح الوحيدي',
  email: '0790000000',
  roleId: 'admin',
  avatar: '',
  whatsapp: '962790000000',
  password: 'admin123'
};

export default function AccountSettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const { users, updateCurrentUser } = useUsersStore();
  const { roles } = useRolesStore();
  
  // Try to find current user from store, fallback to mock
  const currentUser = users.find(u => u.roleId === 'admin') || mockCurrentUser;
  const role = roles.find(r => r.id === currentUser.roleId);

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
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPhone(currentUser.email);
      setEmail(currentUser.email);
      setWhatsapp(currentUser.whatsapp || '');
      setAvatar(currentUser.avatar || null);
      setIsLoading(false);
    }
  }, [currentUser]);

  // Calculate permissions stats
  const totalPermissions = allPermissionGroups.flatMap(g => g.permissions).length;
  const hasAllPermissions = role?.permissions?.includes('all');
  const permissionCount = hasAllPermissions ? totalPermissions : (role?.permissions?.length || 0);
  const permissionPercentage = Math.round((permissionCount / totalPermissions) * 100);

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
      email,
      whatsapp,
      avatar: avatar || '',
    });
    toast({ title: "تم الحفظ", description: "تم تحديث معلومات ملفك الشخصي بنجاح." });
  };

  const handlePasswordSave = () => {
    if (!currentUser) return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ variant: 'destructive', title: "خطأ", description: "الرجاء ملء جميع حقول كلمة المرور." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: "خطأ", description: "كلمتا المرور الجديدتان غير متطابقتين." });
      return;
    }
    if (newPassword.length < 6) {
      toast({ variant: 'destructive', title: "خطأ", description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل." });
      return;
    }

    updateCurrentUser({ password: newPassword });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast({ title: "تم التغيير", description: "تم تحديث كلمة المرور بنجاح." });
  };

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <SettingsHeader
        icon="User"
        title="إعدادات الحساب"
        description="إدارة معلومات ملفك الشخصي، إعدادات الأمان، وتفضيلاتك"
        color="purple"
        backHref="/dashboard/settings"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-r-4 border-r-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الدور</p>
                <p className="text-lg font-bold mt-1">{role?.name || 'غير محدد'}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-950">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الصلاحيات</p>
                <p className="text-lg font-bold mt-1">{permissionCount}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-950">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">حالة الحساب</p>
                <p className="text-lg font-bold mt-1 text-green-600">نشط</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg dark:bg-green-950">
                <User className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المظهر</p>
                <p className="text-lg font-bold mt-1">{theme === 'dark' ? 'داكن' : 'فاتح'}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-950">
                {theme === 'dark' ? <Moon className="h-5 w-5 text-orange-600" /> : <Sun className="h-5 w-5 text-orange-600" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={avatar || ''} alt={name} />
                <AvatarFallback className="text-2xl">{name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{name}</CardTitle>
                <CardDescription>{role?.name || 'مستخدم'}</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Upload className="ml-2 h-4 w-4" />
                  تغيير الصورة
                  <input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} />
                </Label>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            
            {/* Permissions Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">مستوى الصلاحيات</span>
                <Badge variant={hasAllPermissions ? "default" : "secondary"}>
                  {hasAllPermissions ? 'كاملة' : `${permissionPercentage}%`}
                </Badge>
              </div>
              <Progress value={permissionPercentage} className="h-2" />
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link href={`/dashboard/settings/roles/${role?.id}`}>
                <Shield className="ml-2 h-4 w-4" />
                عرض الصلاحيات
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                معلومات الحساب
              </CardTitle>
              <CardDescription>قم بتحديث معلوماتك الشخصية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    الاسم
                  </Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    رقم الهاتف (للدخول)
                  </Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="079xxxxxxx" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    البريد الإلكتروني
                  </Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    رقم واتساب
                  </Label>
                  <Input id="whatsapp" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="962..." />
                </div>
              </div>
              <Button onClick={handleProfileSave} className="w-full md:w-auto">
                <Save className="ml-2 h-4 w-4" />
                حفظ التغييرات
              </Button>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                أمان الحساب
              </CardTitle>
              <CardDescription>تغيير كلمة المرور الخاصة بك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                  <div className="relative">
                    <Input id="current-password" type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    <Button variant="ghost" size="icon" className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowCurrentPassword(prev => !prev)}>
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Input id="new-password" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    <Button variant="ghost" size="icon" className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(prev => !prev)}>
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                  <div className="relative">
                    <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <Button variant="ghost" size="icon" className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(prev => !prev)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <Button onClick={handlePasswordSave} variant="outline">
                <KeyRound className="ml-2 h-4 w-4" />
                تغيير كلمة المرور
              </Button>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                التفضيلات
              </CardTitle>
              <CardDescription>تخصيص تجربة استخدامك للنظام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">المظهر:</span>
                <div className="flex gap-2">
                  <Button 
                    variant={theme === 'light' ? 'default' : 'outline'} 
                    onClick={() => setTheme('light')}
                    size="sm"
                  >
                    <Sun className="ml-2 h-4 w-4" />
                    فاتح
                  </Button>
                  <Button 
                    variant={theme === 'dark' ? 'default' : 'outline'} 
                    onClick={() => setTheme('dark')}
                    size="sm"
                  >
                    <Moon className="ml-2 h-4 w-4" />
                    داكن
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
