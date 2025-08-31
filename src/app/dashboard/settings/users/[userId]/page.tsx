
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { useUsersStore } from '@/store/user-store';
import { useRolesStore } from '@/store/roles-store';
import { useToast } from '@/hooks/use-toast';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/icon';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


function UserEditPageSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-12 w-1/2" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader className="items-center">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <Skeleton className="h-6 w-32 mt-4" />
                            <Skeleton className="h-4 w-24 mt-2" />
                        </CardHeader>
                        <CardContent>
                             <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <Skeleton className="h-4 w-20" />
                             <Skeleton className="h-10 w-full" />
                             <Skeleton className="h-4 w-20 mt-2" />
                             <Skeleton className="h-10 w-full" />
                             <Skeleton className="h-10 w-24 mt-4" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

const PricingPanel = () => (
    <Card>
        <CardHeader>
            <CardTitle>تسعير التوصيل</CardTitle>
            <CardDescription>اختر طريقة حساب سعر التوصيل لطلبات هذا التاجر.</CardDescription>
        </CardHeader>
        <CardContent>
            <RadioGroup defaultValue="price_list" className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="fixed" id="fixed" />
                        <Label htmlFor="fixed" className="font-bold">سعر ثابت</Label>
                    </div>
                    <Input type="number" placeholder="أدخل السعر الثابت..." className="mr-6" />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="price_list" id="price_list" />
                        <Label htmlFor="price_list" className="font-bold">قائمة أسعار</Label>
                    </div>
                    <div className="mr-6">
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر قائمة أسعار..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">الأسعار الافتراضية</SelectItem>
                                <SelectItem value="vip">أسعار VIP</SelectItem>
                                <SelectItem value="provinces">أسعار المحافظات</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </RadioGroup>
        </CardContent>
        <CardFooter>
            <Button>حفظ إعدادات التسعير</Button>
        </CardFooter>
    </Card>
);

export default function UserEditPage() {
    const router = useRouter();
    const params = useParams();
    const { userId } = params;
    const { toast } = useToast();
    
    const { users, updateUser } = useUsersStore();
    const { roles } = useRolesStore();
    
    const user = users.find(u => u.id === userId);
    const role = roles.find(r => r.id === user?.roleId);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [userRoleId, setUserRoleId] = useState('');
    const [isActive, setIsActive] = useState(true);
    
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setUserRoleId(user.roleId);
            setIsLoading(false);
        } else if (users.length > 0) { // Check if users have loaded
            toast({ variant: 'destructive', title: 'خطأ', description: 'المستخدم غير موجود.' });
            router.push('/dashboard/settings/users');
        }
    }, [user, users, router, toast]);

    const handleSaveChanges = () => {
        if (!user) return;
        updateUser(user.id, {
            name,
            email,
            roleId: userRoleId,
            avatar: user.avatar,
        });
        toast({ title: 'تم الحفظ بنجاح', description: `تم تحديث بيانات ${name}.` });
    }

    if (isLoading) {
        return <UserEditPageSkeleton />;
    }

    if (!user) {
        return null; // or a not-found component
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">تعديل المستخدم</h1>
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/settings/users"><Icon name="ArrowLeft" /></Link>
                </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="items-center text-center">
                             <Avatar className="h-24 w-24 border-2 border-primary">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="pt-2">
                               <CardTitle>{name}</CardTitle>
                               <CardDescription>{role?.name || 'بدون دور'}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <Label htmlFor="user-status" className="font-medium flex items-center gap-2">
                                     <Badge variant={isActive ? 'default' : 'destructive'} className={isActive ? "bg-green-500" : ""}>
                                        {isActive ? 'نشط' : 'غير نشط'}
                                     </Badge>
                                     <span>حالة الحساب</span>
                                </Label>
                                <Switch id="user-status" checked={isActive} onCheckedChange={setIsActive} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Right Column: Edit Forms */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Icon name="User" /> معلومات الحساب</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">الاسم</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">البريد الإلكتروني / رقم الهاتف</Label>
                                <Input id="email" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="role">الدور</Label>
                                 <Select value={userRoleId} onValueChange={setUserRoleId}>
                                    <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {role?.id === 'merchant' && <PricingPanel />}

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Icon name="KeyRound" /> تغيير كلمة المرور</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                                <div className="relative">
                                    <Input id="new-password" type={showNewPassword ? 'text' : 'password'} placeholder="••••••••" />
                                    <Button variant="ghost" size="icon" className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(prev => !prev)}>
                                        <Icon name={showNewPassword ? 'EyeOff' : 'Eye'} className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                                <div className="relative">
                                    <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" />
                                     <Button variant="ghost" size="icon" className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(prev => !prev)}>
                                        <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button onClick={handleSaveChanges}><Icon name="Save" className="mr-2" /> حفظ التغييرات</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
