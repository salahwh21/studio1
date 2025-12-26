
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { useUsersStore } from '@/store/user-store';
import { useRolesStore, allPermissionGroups } from '@/store/roles-store';
import { useAreasStore, type City } from '@/store/areas-store';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/icon';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SettingsHeader } from '@/components/settings-header';
import { 
    User, 
    Shield, 
    Package, 
    Clock, 
    Calendar, 
    Activity,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Truck,
    Store,
    Settings,
    History
} from 'lucide-react';

// This is now defined in the pricing page, but we'll keep a local copy for now
// In a real app, this would be a shared resource.
const mockPriceLists = [
    { id: 'pl_1', name: 'الأسعار الافتراضية' },
    { id: 'pl_brands_of_less', name: 'Brands of less' },
    { id: 'pl_soundrush', name: 'SoundRush' },
    { id: 'pl_stress_killer', name: 'Stress Killer' },
    { id: 'pl_brandlet_outlet', name: 'Brandlet Outlet -1' },
    { id: 'pl_nl_botique', name: 'N&L Botique' },
    { id: 'pl_d_boutique', name: 'D boutique -1' },
    { id: 'pl_macrame', name: 'Macrame -1' },
    { id: 'pl_jacks_nyc', name: 'Jacks NYC-1' },
    { id: 'pl_bader', name: 'بدر' },
    { id: 'pl_oud_aljadail', name: 'عود الجدايل' },
    { id: 'pl_luxury_baskets', name: 'Luxury Baskets - 1' },
    { id: 'pl_malek_mobile', name: 'مالك موبايل - 1' },
    { id: 'pl_oceansfounds', name: 'Oceansfounds -1' },
    { id: 'pl_rubber_ducky', name: 'Rubber Ducky' },
    { id: 'pl_travelers_cart', name: 'Travelers Cart' },
    { id: 'pl_liali', name: 'ليالي' },
    { id: 'pl_alsami_jadeed', name: 'السامي جديد' },
    { id: 'pl_alsami', name: 'السامي' },
    { id: 'pl_nitrous', name: 'Nitrous Delivery' },
    { id: 'pl_majd', name: 'ماجد' },
    { id: 'pl_abu_saif', name: 'ابو سيف' },
    { id: 'pl_2_5_3', name: 'أسعار 2.5-3' },
    { id: 'pl_1-5_2', name: 'أسعار 1.5-2' },
    { id: 'pl_1-5_3', name: 'أسعار 1.5-3' },
    { id: 'pl_2_5_3_5', name: 'أسعار 2.5-3.5' },
    { id: 'pl_3_3_5', name: 'أسعار 3-3.5' },
    { id: 'pl_2_5', name: 'أسعار 2.5' },
    { id: 'pl_2_2_5', name: 'أسعار 2-2.5' },
    { id: 'pl_2_3_5', name: 'أسعار 2-3.5' },
];

function UserEditPageSkeleton() {
    return (
        <div className="space-y-6" dir="rtl">
            <Skeleton className="h-12 w-1/2" />
            
            {/* Stats Cards Skeleton */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="border-r-4 border-r-muted">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded-lg" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs Skeleton */}
            <Skeleton className="h-10 w-full" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="items-center">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <Skeleton className="h-6 w-32 mt-4" />
                            <Skeleton className="h-4 w-24 mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-2 w-full" />
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
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

const PricingPanel = ({ title, priceListId, onPriceListChange }: { title: string, priceListId: string | undefined, onPriceListChange: (id: string) => void }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Icon name="DollarSign" className="h-5 w-5 text-primary" />
                {title}
            </CardTitle>
            <CardDescription>اختر طريقة حساب الأجور لطلبات هذا المستخدم.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <Label htmlFor="price_list" className="font-bold">قائمة أسعار</Label>
                <div className="mr-6">
                    <Select value={priceListId} onValueChange={onPriceListChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="اختر قائمة أسعار..." />
                        </SelectTrigger>
                        <SelectContent>
                            {mockPriceLists.map(pl => (
                                <SelectItem key={pl.id} value={pl.id}>{pl.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardContent>
    </Card>
);

type FareAdjustmentRule = {
    id: string;
    merchantId: string;
    cityId: string;
    adjustment: string;
}

const FareAdjustmentPanel = () => {
    const { users } = useUsersStore();
    const { cities } = useAreasStore();
    const { settings } = useSettings();
    const currencySymbol = settings.regional.currencySymbol;
    const [rules, setRules] = useState<FareAdjustmentRule[]>([]);

    const merchants = users.filter(u => u.roleId === 'merchant');

    const handleAddRule = () => {
        setRules(prev => [...prev, { id: `rule_${Date.now()}`, merchantId: 'any', cityId: 'any', adjustment: '0' }]);
    };

    const handleRuleChange = (id: string, field: keyof FareAdjustmentRule, value: any) => {
        setRules(prev => prev.map(rule => rule.id === id ? { ...rule, [field]: value } : rule));
    };

    const handleRemoveRule = (id: string) => {
        setRules(prev => prev.filter(rule => rule.id !== id));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon name="Calculator" className="h-5 w-5 text-primary" />
                    تعديلات أجرة السائق الخاصة
                </CardTitle>
                <CardDescription>إضافة أو خصم مبلغ على أجرة السائق لتاجر أو وجهة معينة.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>التاجر</TableHead>
                            <TableHead>الوجهة (المدينة)</TableHead>
                            <TableHead>قيمة التعديل ({currencySymbol})</TableHead>
                            <TableHead>إجراء</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rules.map(rule => (
                            <TableRow key={rule.id}>
                                <TableCell>
                                    <Select value={rule.merchantId} onValueChange={(value) => handleRuleChange(rule.id, 'merchantId', value)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">أي تاجر</SelectItem>
                                            {merchants.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Select value={rule.cityId} onValueChange={(value) => handleRuleChange(rule.id, 'cityId', value)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">أي مدينة</SelectItem>
                                            {cities.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Input type="number" step="0.1" value={rule.adjustment} onChange={(e) => handleRuleChange(rule.id, 'adjustment', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveRule(rule.id)}>
                                        <Icon name="Trash2" className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Button variant="outline" onClick={handleAddRule} className="mt-4 w-full">
                    <Icon name="PlusCircle" className="ml-2 h-4 w-4" /> إضافة تعديل جديد
                </Button>
            </CardContent>
        </Card>
    );
};

// Mock activity data for demonstration
const mockActivityLog = [
    { id: 1, action: 'تسجيل دخول', timestamp: '2025-12-20 10:30', status: 'success' },
    { id: 2, action: 'تعديل طلب #1234', timestamp: '2025-12-20 09:15', status: 'success' },
    { id: 3, action: 'محاولة حذف طلب', timestamp: '2025-12-19 16:45', status: 'failed' },
    { id: 4, action: 'إنشاء طلب جديد', timestamp: '2025-12-19 14:20', status: 'success' },
    { id: 5, action: 'تغيير كلمة المرور', timestamp: '2025-12-18 11:00', status: 'success' },
];

const ActivityLogPanel = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    سجل النشاط
                </CardTitle>
                <CardDescription>آخر الأنشطة والعمليات التي قام بها المستخدم</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {mockActivityLog.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                            <div className="flex items-center gap-3">
                                {activity.status === 'success' ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="font-medium">{activity.action}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{activity.timestamp}</span>
                        </div>
                    ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                    <Icon name="ChevronDown" className="ml-2 h-4 w-4" />
                    عرض المزيد
                </Button>
            </CardContent>
        </Card>
    );
};

// User Stats Component
const UserStatsCards = ({ user, role }: { user: any; role: any }) => {
    // Mock stats - in real app these would come from API
    const stats = {
        totalOrders: user.roleId === 'merchant' ? 156 : user.roleId === 'driver' ? 423 : 0,
        completedOrders: user.roleId === 'merchant' ? 142 : user.roleId === 'driver' ? 398 : 0,
        lastActive: '2025-12-20 10:30',
        joinDate: '2024-06-15',
    };

    const completionRate = stats.totalOrders > 0 
        ? Math.round((stats.completedOrders / stats.totalOrders) * 100) 
        : 0;

    const roleIcon = user.roleId === 'merchant' ? Store : user.roleId === 'driver' ? Truck : User;
    const RoleIcon = roleIcon;

    return (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Card className="border-r-4 border-r-blue-500">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                            <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-950">
                            <Package className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-r-4 border-r-green-500">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">نسبة الإنجاز</p>
                            <p className="text-2xl font-bold mt-1">{completionRate}%</p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg dark:bg-green-950">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-r-4 border-r-purple-500">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">آخر نشاط</p>
                            <p className="text-sm font-bold mt-1">{stats.lastActive}</p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-950">
                            <Activity className="h-5 w-5 text-purple-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-r-4 border-r-orange-500">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">تاريخ الانضمام</p>
                            <p className="text-sm font-bold mt-1">{stats.joinDate}</p>
                        </div>
                        <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-950">
                            <Calendar className="h-5 w-5 text-orange-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Permissions Summary Component
const PermissionsSummary = ({ role }: { role: any }) => {
    const totalPermissions = allPermissionGroups.flatMap(g => g.permissions).length;
    const hasAllPermissions = role?.permissions?.includes('all');
    const permissionCount = hasAllPermissions ? totalPermissions : (role?.permissions?.length || 0);
    const percentage = Math.round((permissionCount / totalPermissions) * 100);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    ملخص الصلاحيات
                </CardTitle>
                <CardDescription>صلاحيات المستخدم بناءً على دوره في النظام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">الدور الحالي</span>
                    <Badge variant="secondary" className="text-sm">
                        {role?.name || 'غير محدد'}
                    </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">الصلاحيات المفعلة</span>
                        <span className="font-medium">{permissionCount} / {totalPermissions}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                        {hasAllPermissions ? 'صلاحيات كاملة للنظام' : `${percentage}% من إجمالي الصلاحيات`}
                    </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                    <Link href={`/dashboard/settings/roles/${role?.id}`}>
                        <Settings className="ml-2 h-4 w-4" />
                        إدارة صلاحيات الدور
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
};


export default function UserEditPage() {
    const router = useRouter();
    const params = useParams();
    const { userId } = params;
    const { toast } = useToast();

    const { users, updateUser } = useUsersStore();
    const { roles } = useRolesStore();

    const user = users.find(u => u.id === userId);

    const [name, setName] = useState('');
    const [storeName, setStoreName] = useState('');
    const [email, setEmail] = useState('');
    const [userRoleId, setUserRoleId] = useState('');
    const [priceListId, setPriceListId] = useState<string | undefined>(undefined);
    const [isActive, setIsActive] = useState(true);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');

    const role = roles.find(r => r.id === user?.roleId);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setStoreName(user.storeName || '');
            setEmail(user.email);
            setUserRoleId(user.roleId);
            setPriceListId(user.priceListId);
            setIsLoading(false);
        } else if (users.length > 0) { // Check if users have loaded
            toast({ variant: 'destructive', title: 'خطأ', description: 'المستخدم غير موجود.' });
            router.push('/dashboard/settings/users');
        }
    }, [user, users, router, toast]);

    const handleSaveChanges = () => {
        if (!user) return;

        let passwordUpdate = {};
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                toast({ variant: 'destructive', title: 'خطأ', description: 'كلمتا المرور غير متطابقتين.' });
                return;
            }
            passwordUpdate = { password: newPassword };
        }

        updateUser(user.id, {
            name,
            storeName,
            email,
            roleId: userRoleId,
            avatar: user.avatar,
            priceListId: priceListId,
            ...passwordUpdate,
        });

        toast({ title: 'تم الحفظ بنجاح', description: `تم تحديث بيانات ${name}.` });
        setNewPassword('');
        setConfirmPassword('');
    }

    if (isLoading) {
        return <UserEditPageSkeleton />;
    }

    if (!user) {
        return null; // or a not-found component
    }

    const isMerchant = role?.id === 'merchant';
    const isDriver = role?.id === 'driver';

    return (
        <div className="space-y-6" dir="rtl">
            <SettingsHeader
                icon="UserCog"
                title={`تعديل المستخدم: ${user.storeName || name}`}
                description={`${role?.name || 'بدون دور'} - ${email}`}
                backHref="/dashboard/settings/users"
                breadcrumbs={[
                    { label: 'إدارة المستخدمين', href: '/dashboard/settings/users' }
                ]}
                color="purple"
            />

            {/* Stats Cards */}
            <UserStatsCards user={user} role={role} />

            {/* Main Content with Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info" className="gap-2">
                        <User className="h-4 w-4" />
                        المعلومات الأساسية
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                        <Settings className="h-4 w-4" />
                        الإعدادات
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="gap-2">
                        <History className="h-4 w-4" />
                        سجل النشاط
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        {/* Left Column: Profile Card */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <CardHeader className="items-center text-center">
                                    <Avatar className="h-24 w-24 border-2 border-primary">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="text-2xl">{(user.storeName || user.name).slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="pt-2">
                                        <CardTitle>{user.storeName || name}</CardTitle>
                                        <CardDescription>{role?.name || 'بدون دور'}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border p-3">
                                        <Label htmlFor="user-status" className="font-medium flex items-center gap-2">
                                            <Badge variant={isActive ? 'default' : 'destructive'} className={isActive ? "bg-green-500" : ""}>
                                                {isActive ? 'نشط' : 'غير نشط'}
                                            </Badge>
                                            <span>حالة الحساب</span>
                                        </Label>
                                        <Switch id="user-status" checked={isActive} onCheckedChange={setIsActive} />
                                    </div>
                                    <Button variant="outline" className="w-full" onClick={() => {
                                        navigator.clipboard.writeText(user.id);
                                        toast({ title: 'تم النسخ', description: 'تم نسخ معرف المستخدم' });
                                    }}>
                                        <Icon name="Copy" className="ml-2 h-4 w-4" />
                                        نسخ معرف المستخدم
                                    </Button>
                                </CardContent>
                            </Card>

                            <PermissionsSummary role={role} />
                        </div>

                        {/* Right Column: Edit Forms */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-primary" />
                                        معلومات الحساب
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">الاسم</Label>
                                            <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                                        </div>
                                        {isMerchant && (
                                            <div className="space-y-2">
                                                <Label htmlFor="storeName">اسم المتجر</Label>
                                                <Input id="storeName" value={storeName} onChange={e => setStoreName(e.target.value)} />
                                            </div>
                                        )}
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

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Icon name="KeyRound" className="h-5 w-5 text-primary" />
                                        تغيير كلمة المرور
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                                            <div className="relative">
                                                <Input id="new-password" type={showNewPassword ? 'text' : 'password'} placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                                <Button variant="ghost" size="icon" className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(prev => !prev)}>
                                                    <Icon name={showNewPassword ? 'EyeOff' : 'Eye'} className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                                            <div className="relative">
                                                <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                                <Button variant="ghost" size="icon" className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(prev => !prev)}>
                                                    <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                    <div className="space-y-6">
                        {isMerchant && <PricingPanel title="تسعير التوصيل للتاجر" priceListId={priceListId} onPriceListChange={setPriceListId} />}
                        {isDriver && <PricingPanel title="تسعير أجور السائق" priceListId={priceListId} onPriceListChange={setPriceListId} />}
                        {isDriver && <FareAdjustmentPanel />}
                        
                        {!isMerchant && !isDriver && (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">لا توجد إعدادات إضافية لهذا النوع من المستخدمين</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                    <ActivityLogPanel />
                </TabsContent>
            </Tabs>

            {/* Sticky Save Button */}
            <div className="sticky bottom-4 flex justify-end">
                <Button size="lg" onClick={handleSaveChanges} className="shadow-lg">
                    <Icon name="Save" className="ml-2 h-4 w-4" />
                    حفظ التغييرات
                </Button>
            </div>
        </div>
    );
}



