
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { useUsersStore } from '@/store/user-store';
import { useRolesStore } from '@/store/roles-store';
import { useAreasStore, type City } from '@/store/areas-store';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SettingsHeader } from '@/components/settings-header';

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

const PricingPanel = ({ title, priceListId, onPriceListChange }: { title: string, priceListId: string | undefined, onPriceListChange: (id: string) => void }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
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
                <CardTitle>تعديلات أجرة السائق الخاصة</CardTitle>
                <CardDescription>إضافة أو خصم مبلغ على أجرة السائق لتاجر أو وجهة معينة.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>التاجر</TableHead>
                            <TableHead>الوجهة (المدينة)</TableHead>
                            <TableHead>قيمة التعديل (د.أ)</TableHead>
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
                    <Icon name="PlusCircle" className="mr-2 h-4 w-4" /> إضافة تعديل جديد
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
    const [email, setEmail] = useState('');
    const [userRoleId, setUserRoleId] = useState('');
    const [priceListId, setPriceListId] = useState<string | undefined>(undefined);
    const [isActive, setIsActive] = useState(true);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    const role = roles.find(r => r.id === user?.roleId);

    useEffect(() => {
        if (user) {
            setName(user.name);
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



    return (
        <div className="space-y-6">
            <SettingsHeader
                icon="UserCog"
                title={`تعديل المستخدم: ${name}`}
                description="تعديل بيانات وصلاحيات المستخدم"
                backHref="/dashboard/settings/users"
                breadcrumbs={[
                    { label: 'إدارة المستخدمين', href: '/dashboard/settings/users' }
                ]}
                color="purple"
            />

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

                    {role?.id === 'merchant' && <PricingPanel title="تسعير التوصيل للتاجر" priceListId={priceListId} onPriceListChange={setPriceListId} />}
                    {role?.id === 'driver' && <PricingPanel title="تسعير أجور السائق" priceListId={priceListId} onPriceListChange={setPriceListId} />}
                    {role?.id === 'driver' && <FareAdjustmentPanel />}

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Icon name="KeyRound" /> تغيير كلمة المرور</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
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



