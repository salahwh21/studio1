
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { nanoid } from 'nanoid';
import Papa from 'papaparse';

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { useUsersStore, type User } from '@/store/user-store';
import { useRolesStore, type Role } from '@/store/roles-store';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAreasStore } from '@/store/areas-store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SettingsHeader } from '@/components/settings-header';
import { UserCog } from 'lucide-react';

const CSVLink = dynamic(() => import('react-csv').then(mod => mod.CSVLink), { ssr: false });

type FareAdjustmentRule = {
    id: string;
    merchantId: string;
    cityId: string;
    adjustment: string;
}

const FareAdjustmentPanelDialog = () => {
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
        <div className='space-y-4 pt-4 border-t'>
            <Label>تعديلات أجرة السائق الخاصة</Label>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="px-1">التاجر</TableHead>
                        <TableHead className="px-1">الوجهة</TableHead>
                        <TableHead className="px-1">التعديل</TableHead>
                        <TableHead className="px-1"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rules.map(rule => (
                        <TableRow key={rule.id}>
                            <TableCell className="px-1">
                                <Select value={rule.merchantId} onValueChange={(value) => handleRuleChange(rule.id, 'merchantId', value)}>
                                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="any">أي تاجر</SelectItem>
                                        {merchants.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell className="px-1">
                                <Select value={rule.cityId} onValueChange={(value) => handleRuleChange(rule.id, 'cityId', value)}>
                                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="any">أي مدينة</SelectItem>
                                        {cities.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell className="px-1">
                                <Input type="number" className="h-8" step="0.1" value={rule.adjustment} onChange={(e) => handleRuleChange(rule.id, 'adjustment', e.target.value)} />
                            </TableCell>
                            <TableCell className="px-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveRule(rule.id)}>
                                    <Icon name="Trash2" className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Button variant="outline" onClick={handleAddRule} className="w-full">
                <Icon name="PlusCircle" className="mr-2 h-4 w-4" /> إضافة تعديل
            </Button>
        </div>
    )
}

const PricingFields = () => (
    <div className='space-y-4 pt-4 border-t'>
        <Label>إعدادات تسعير التوصيل</Label>
        <RadioGroup defaultValue="price_list" className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="fixed" id="fixed-dialog" />
                    <Label htmlFor="fixed-dialog" className="font-bold">سعر ثابت</Label>
                </div>
                <Input type="number" placeholder="أدخل السعر الثابت..." className="mr-6" />
            </div>

            <div className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="price_list" id="price_list-dialog" />
                    <Label htmlFor="price_list-dialog" className="font-bold">قائمة أسعار</Label>
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
    </div>
)

const UserDialog = ({
    open,
    onOpenChange,
    onSave,
    user,
    roles,
    isDriver,
    isMerchant
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (user: Omit<User, 'id' | 'password'>) => void;
    user: User | null;
    roles: Role[];
    isDriver?: boolean;
    isMerchant?: boolean;
}) => {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [storeName, setStoreName] = useState('');
    const [email, setEmail] = useState('');
    const [roleId, setRoleId] = useState<Role['id'] | ''>('');

    React.useEffect(() => {
        if (user) {
            setName(user.name);
            setStoreName(user.storeName || '');
            setEmail(user.email);
            setRoleId(user.roleId);
        } else {
            setName('');
            setStoreName('');
            setEmail('');
            setRoleId(isDriver ? 'driver' : (isMerchant ? 'merchant' : ''));
        }
    }, [user, open, isDriver, isMerchant]);

    const handleSave = () => {
        if (!name || !email || !roleId) {
            toast({
                variant: 'destructive',
                title: "خطأ",
                description: "الرجاء ملء جميع الحقول المطلوبة."
            });
            return;
        }
        onSave({ name, storeName, email, roleId, avatar: user?.avatar || '' });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{user ? `تعديل ${isDriver ? 'سائق' : 'موظف'}` : `إضافة ${isDriver ? 'سائق' : (isMerchant ? 'تاجر' : 'موظف')} جديد`}</DialogTitle>
                    <DialogDescription>
                        {user ? 'قم بتعديل بيانات المستخدم.' : 'أدخل بيانات المستخدم الجديد. سيتم تعيين كلمة مرور افتراضية له.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">اسم التاجر/المستخدم</Label>
                        <Input id="name" placeholder="أدخل الاسم..." value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    {isMerchant && (
                        <div className="space-y-2">
                            <Label htmlFor="storeName">اسم المتجر</Label>
                            <Input id="storeName" placeholder="أدخل اسم المتجر..." value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني / رقم الهاتف</Label>
                        <Input id="email" type="text" placeholder="أدخل البريد الإلكتروني أو رقم الهاتف..." value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    {!isDriver && !isMerchant && (
                        <div className="space-y-2">
                            <Label htmlFor="roleId">الدور</Label>
                            <Select value={roleId} onValueChange={(value) => setRoleId(value as Role['id'])}>
                                <SelectTrigger id="roleId">
                                    <SelectValue placeholder="اختر الدور..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.filter(r => r.id !== 'driver' && r.id !== 'merchant').map(role => (
                                        <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {isMerchant && <PricingFields />}
                    {isDriver && <FareAdjustmentPanelDialog />}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">إلغاء</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>حفظ</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const UserCard = ({ user, role, isSelected, onSelectionChange }: { user: User; role?: Role; isSelected: boolean; onSelectionChange: (id: string, checked: boolean) => void; }) => {
    // Determine distinct color based on role group
    const roleColorClass = user.roleId === 'merchant' ? 'border-r-blue-500'
        : user.roleId === 'driver' ? 'border-r-emerald-500'
            : 'border-r-purple-500';

    return (
        <Card
            className={`hover:border-primary transition-all duration-200 border-r-4 ${roleColorClass} data-[state=checked]:border-primary data-[state=checked]:ring-2 data-[state=checked]:ring-primary`}
            data-state={isSelected ? 'checked' : 'unchecked'}
        >
            <CardContent className="p-3 flex justify-between items-center">
                <div className='flex items-center gap-3'>
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelectionChange(user.id, !!checked)}
                        className="h-5 w-5"
                        aria-label={`تحديد المستخدم ${user.name}`}
                    />
                    <Link href={`/dashboard/settings/users/${user.id}`} className="flex items-center gap-3 flex-1 text-right" onClick={(e) => {
                        if (isSelected) {
                            e.preventDefault();
                            onSelectionChange(user.id, false);
                        }
                    }}>
                        <Avatar className="h-12 w-12 border">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{(user.storeName || user.name).slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 text-right">
                            <h3 className="font-semibold">{user.storeName || user.name}</h3>
                            <p className="text-sm text-muted-foreground">{user.roleId === 'merchant' ? user.name : user.email}</p>
                            {role && <Badge variant="secondary" className="text-xs">{role.name}</Badge>}
                        </div>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};

const ChangeRoleDialog = ({ open, onOpenChange, onSave, roles, userCount }: { open: boolean, onOpenChange: (open: boolean) => void, onSave: (roleId: string) => void, roles: Role[], userCount: number }) => {
    const [selectedRole, setSelectedRole] = useState('');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>تغيير دور المستخدمين</DialogTitle>
                    <DialogDescription>
                        اختر الدور الجديد الذي سيتم تعيينه لـ {userCount} مستخدمين محددين.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger><SelectValue placeholder="اختر الدور الجديد..." /></SelectTrigger>
                        <SelectContent>
                            {roles.map(role => (
                                <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
                    <Button onClick={() => onSave(selectedRole)} disabled={!selectedRole}>تغيير الدور</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};

const UserList = ({ users, roles, isDriverTab, isMerchantTab, activeTab, onAdd, onEdit, onDelete, onBulkUpdateRole, onImport }: { users: User[]; roles: Role[]; isDriverTab: boolean; isMerchantTab: boolean; activeTab: string; onAdd: () => void; onEdit: (user: User) => void; onDelete: (users: User[]) => void; onBulkUpdateRole: (userIds: string[], roleId: string) => void; onImport: (data: any[]) => void; }) => {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User[] | null>(null);
    const importInputRef = React.useRef<HTMLInputElement>(null);

    const filteredUsers = useMemo(() =>
        users.filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.storeName && user.storeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        ), [users, searchQuery]
    );

    const handleSelectionChange = (id: string, checked: boolean) => {
        setSelectedUserIds(prev => checked ? [...prev, id] : prev.filter(userId => userId !== id));
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUserIds(filteredUsers.map(u => u.id));
        } else {
            setSelectedUserIds([]);
        }
    };

    const confirmDelete = () => {
        if (userToDelete) {
            onDelete(userToDelete);
            setSelectedUserIds([]);
            setUserToDelete(null);
        }
    }

    const handleConfirmChangeRole = (newRoleId: string) => {
        onBulkUpdateRole(selectedUserIds, newRoleId);
        setChangeRoleDialogOpen(false);
        setSelectedUserIds([]);
        toast({ title: "تم التحديث", description: "تم تغيير دور المستخدمين المحددين بنجاح." });
    }

    const selectedUser = users.find(u => u.id === selectedUserIds[0]);
    const isAllFilteredSelected = filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length;

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                onImport(results.data);
            },
            error: (error) => {
                toast({ variant: 'destructive', title: 'فشل الاستيراد', description: error.message });
            }
        });

        event.target.value = ''; // Reset input
    };


    return (
        <div className="space-y-4" dir="rtl">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2 h-10">
                        {selectedUserIds.length > 0 ? (
                            <div className='flex items-center gap-2 w-full animate-in fade-in zoom-in-95 duration-200'>
                                <span className='text-sm font-semibold text-muted-foreground'>{selectedUserIds.length} محدد</span>
                                <Separator orientation="vertical" className="h-6 mx-1" />
                                <Button variant="outline" size="sm" onClick={() => onEdit(selectedUser!)} disabled={selectedUserIds.length !== 1}>
                                    <Icon name="Edit" className="ml-2" /> تعديل
                                </Button>
                                {!isDriverTab && !isMerchantTab && <Button variant="outline" size="sm" onClick={() => setChangeRoleDialogOpen(true)}>
                                    <Icon name="UsersCog" className="ml-2" /> تغيير الدور
                                </Button>}
                                <Button variant="destructive" size="sm" onClick={() => setUserToDelete(users.filter(u => selectedUserIds.includes(u.id)))}>
                                    <Icon name="Trash2" className="ml-2" /> حذف المحدد
                                </Button>
                                <div className="mr-auto">
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedUserIds([])}>
                                        <Icon name="X" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between w-full animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex gap-2">
                                    <Button onClick={onAdd}>
                                        <Icon name="UserPlus" className="ml-2" /> إضافة جديد
                                    </Button>
                                    <Button variant="outline" onClick={() => importInputRef.current?.click()}>
                                        <Icon name="FileUp" className="ml-2" /> استيراد
                                    </Button>
                                    <input type="file" ref={importInputRef} className="hidden" accept=".csv" onChange={handleFileImport} />
                                    {CSVLink && (
                                        <CSVLink data={users} headers={[{ label: 'name', key: 'name' }, { label: 'email', key: 'email' }, { label: 'roleId', key: 'roleId' }]} filename={"users.csv"} className="inline-block">
                                            <Button variant="outline">
                                                <Icon name="FileDown" className="ml-2" /> تصدير
                                            </Button>
                                        </CSVLink>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-full sm:max-w-xs">
                                        <Icon name="Search" className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder={`بحث عن ${isDriverTab ? 'سائق' : (isMerchantTab ? 'تاجر' : 'موظف')}...`} className="pr-10 transition-all focus:w-64" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center gap-4 px-2">
                <Checkbox id={`select-all-${activeTab}`} checked={isAllFilteredSelected} onCheckedChange={handleSelectAll} />
                <Label htmlFor={`select-all-${activeTab}`}>تحديد كل الظاهر ({filteredUsers.length})</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map(user => (
                    <UserCard
                        key={user.id}
                        user={user}
                        role={roles.find(r => r.id === user.roleId)}
                        isSelected={selectedUserIds.includes(user.id)}
                        onSelectionChange={handleSelectionChange}
                    />
                ))}
            </div>
            {filteredUsers.length === 0 && (
                <div className="text-center py-10 text-muted-foreground col-span-full">
                    <Icon name="Search" className="mx-auto h-10 w-10 mb-4" />
                    <p>لا توجد نتائج للبحث.</p>
                </div>
            )}

            <ChangeRoleDialog
                open={changeRoleDialogOpen}
                onOpenChange={setChangeRoleDialogOpen}
                onSave={handleConfirmChangeRole}
                roles={roles.filter(r => r.id !== 'driver' && r.id !== 'merchant')}
                userCount={selectedUserIds.length}
            />

            <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من حذف {userToDelete?.length} مستخدمين؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default function UsersPage() {
    const { toast } = useToast();
    const { users, addUser, updateUser, deleteUser, updateUsersRole } = useUsersStore();
    const { roles } = useRolesStore();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState('merchants');

    const employees = useMemo(() => users.filter(u => u.roleId !== 'driver' && u.roleId !== 'merchant'), [users]);
    const drivers = useMemo(() => users.filter(u => u.roleId === 'driver'), [users]);
    const merchants = useMemo(() => users.filter(u => u.roleId === 'merchant'), [users]);

    const handleAddNew = () => {
        setSelectedUser(null);
        setDialogOpen(true);
    }

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setDialogOpen(true);
    }

    const handleSave = (data: Omit<User, 'id' | 'password'>) => {
        if (selectedUser) {
            updateUser(selectedUser.id, data);
            toast({ title: "تم التعديل", description: `تم تعديل المستخدم "${data.name}" بنجاح.` });
        } else {
            addUser(data);
            toast({ title: "تمت الإضافة", description: `تم إضافة المستخدم "${data.name}" بنجاح.` });
        }
        setDialogOpen(false);
    }

    const handleImport = async (data: any[]) => {
        let addedCount = 0;
        const validItems: any[] = [];
        
        // First, collect all valid items
        data.forEach(item => {
            if (item.name && item.email) {
                let roleId = item.roleId;
                if (activeTab === 'drivers') roleId = 'driver';
                if (activeTab === 'merchants') roleId = 'merchant';
                if (!roleId) return;

                validItems.push({
                    name: item.name,
                    storeName: item.storeName || item.name,
                    email: item.email,
                    roleId: roleId,
                    avatar: '',
                });
            }
        });

        // Then add them one by one with await
        for (const item of validItems) {
            try {
                await addUser(item);
                addedCount++;
            } catch (error) {
                console.error('Failed to add user:', item.name, error);
            }
        }

        if (addedCount > 0) {
            toast({ title: "تم الاستيراد", description: `تمت إضافة ${addedCount} مستخدمين بنجاح.` });
        } else {
            toast({ variant: 'destructive', title: 'فشل الاستيراد', description: 'تنسيق الملف غير صالح أو لم يتم العثور على بيانات صالحة. تأكد من وجود عمود `name` و `email`.' });
        }
    }

    return (
        <div className="space-y-6" dir="rtl">
            <SettingsHeader
                icon="UserCog"
                title="إدارة المستخدمين"
                description="إضافة وتعديل المستخدمين وتعيين أدوارهم وصلاحياتهم"
                color="purple"
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="merchants">التجار ({merchants.length})</TabsTrigger>
                    <TabsTrigger value="drivers">السائقين ({drivers.length})</TabsTrigger>
                    <TabsTrigger value="employees">الموظفين ({employees.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="employees" className="mt-4">
                    <UserList
                        users={employees}
                        roles={roles}
                        isDriverTab={false}
                        isMerchantTab={false}
                        activeTab={activeTab}
                        onAdd={handleAddNew}
                        onEdit={handleEdit}
                        onDelete={deleteUser}
                        onBulkUpdateRole={updateUsersRole}
                        onImport={handleImport}
                    />
                </TabsContent>
                <TabsContent value="drivers" className="mt-4">
                    <UserList
                        users={drivers}
                        roles={roles}
                        isDriverTab={true}
                        isMerchantTab={false}
                        activeTab={activeTab}
                        onAdd={handleAddNew}
                        onEdit={handleEdit}
                        onDelete={deleteUser}
                        onBulkUpdateRole={updateUsersRole}
                        onImport={handleImport}
                    />
                </TabsContent>
                <TabsContent value="merchants" className="mt-4">
                    <UserList
                        users={merchants}
                        roles={roles}
                        isDriverTab={false}
                        isMerchantTab={true}
                        activeTab={activeTab}
                        onAdd={handleAddNew}
                        onEdit={handleEdit}
                        onDelete={deleteUser}
                        onBulkUpdateRole={updateUsersRole}
                        onImport={handleImport}
                    />
                </TabsContent>
            </Tabs>

            <UserDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSave={handleSave}
                user={selectedUser}
                roles={roles}
                isDriver={activeTab === 'drivers'}
                isMerchant={activeTab === 'merchants'}
            />

        </div>
    );
}
