
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
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

const CSVLink = dynamic(() => import('react-csv').then(mod => mod.CSVLink), { ssr: false });

const UserDialog = ({
  open,
  onOpenChange,
  onSave,
  user,
  roles,
  isDriver,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: Omit<User, 'id' | 'password'>) => void;
  user: User | null;
  roles: Role[];
  isDriver?: boolean;
}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [roleId, setRoleId] = useState<Role['id'] | ''>('');

    React.useEffect(() => {
        if(user) {
            setName(user.name);
            setEmail(user.email);
            setRoleId(user.roleId);
        } else {
            setName('');
            setEmail('');
            setRoleId(isDriver ? 'driver' : '');
        }
    }, [user, open, isDriver]);

    const handleSave = () => {
        if (!name || !email || !roleId) return;
        onSave({ name, email, roleId, avatar: user?.avatar || '' });
    }
    
    return (
         <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{user ? `تعديل ${isDriver ? 'سائق' : 'موظف'}` : `إضافة ${isDriver ? 'سائق' : 'موظف'} جديد`}</DialogTitle>
                    <DialogDescription>
                        {user ? 'قم بتعديل بيانات المستخدم.' : 'أدخل بيانات المستخدم الجديد. سيتم تعيين كلمة مرور افتراضية له.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">اسم المستخدم</Label>
                        <Input id="name" placeholder="أدخل الاسم..." value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني / رقم الهاتف</Label>
                        <Input id="email" type="text" placeholder="أدخل البريد الإلكتروني أو رقم الهاتف..." value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                     {!isDriver && (
                        <div className="space-y-2">
                            <Label htmlFor="roleId">الدور</Label>
                            <Select value={roleId} onValueChange={(value) => setRoleId(value as Role['id'])}>
                                <SelectTrigger id="roleId">
                                    <SelectValue placeholder="اختر الدور..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.filter(r => r.id !== 'driver').map(role => (
                                        <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                     )}
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

const UserCard = ({ user, role, isSelected, onSelectionChange }: { user: User; role?: Role; isSelected: boolean; onSelectionChange: (id: string, checked: boolean) => void; }) => (
    <Card 
        className="hover:border-primary transition-colors duration-200 data-[state=checked]:border-primary data-[state=checked]:ring-2 data-[state=checked]:ring-primary" 
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
                    if(isSelected) {
                        e.preventDefault();
                        onSelectionChange(user.id, false);
                    }
                }}>
                    <Avatar className="h-12 w-12 border">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 text-right">
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {role && <Badge variant="secondary">{role.name}</Badge>}
                    </div>
                </Link>
            </div>
             
        </CardContent>
    </Card>
);

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

const UserList = ({ users, roles, isDriverTab, onAdd, onEdit, onDelete, onBulkUpdateRole, onImport }: { users: User[]; roles: Role[]; isDriverTab: boolean; onAdd: () => void; onEdit: (user: User) => void; onDelete: (users: User[]) => void; onBulkUpdateRole: (userIds: string[], roleId: string) => void; onImport: (data: any[]) => void; }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
    const importInputRef = React.useRef<HTMLInputElement>(null);
    
    const filteredUsers = useMemo(() => 
        users.filter(user => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
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
        onDelete(users.filter(u => selectedUserIds.includes(u.id)));
        setSelectedUserIds([]);
    }
    
    const handleConfirmChangeRole = (newRoleId: string) => {
        onBulkUpdateRole(selectedUserIds, newRoleId);
        setChangeRoleDialogOpen(false);
        setSelectedUserIds([]);
    }

    const selectedUser = users.find(u => u.id === selectedUserIds[0]);
    const isAllFilteredSelected = filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length;

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            const headers = lines[0].split(',').map(h => h.trim());
            const data = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim());
                return headers.reduce((obj, header, index) => {
                    (obj as any)[header] = values[index];
                    return obj;
                }, {});
            });
            onImport(data);
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    };


    return (
        <div className="space-y-4" dir="rtl">
            <div className="flex items-center justify-between gap-2 h-12">
                {selectedUserIds.length > 0 ? (
                     <div className='flex items-center gap-2 w-full'>
                        <span className='text-sm font-semibold text-muted-foreground'>{selectedUserIds.length} محدد</span>
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        <Button variant="outline" size="sm" onClick={() => onEdit(selectedUser!)} disabled={selectedUserIds.length !== 1}>
                           <Icon name="Edit" className="ml-2" /> تعديل
                        </Button>
                        {!isDriverTab && <Button variant="outline" size="sm" onClick={() => setChangeRoleDialogOpen(true)}>
                           <Icon name="UsersCog" className="ml-2" /> تغيير الدور
                        </Button>}
                        <Button variant="destructive" size="sm" onClick={confirmDelete}>
                           <Icon name="Trash2" className="ml-2" /> حذف المحدد
                        </Button>
                        <div className="mr-auto">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedUserIds([])}>
                                <Icon name="X" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between w-full">
                         <div className="flex gap-2">
                             <Button onClick={onAdd}>
                                <Icon name="UserPlus" className="ml-2" /> إضافة جديد
                             </Button>
                              <Button variant="outline" onClick={() => importInputRef.current?.click()}>
                                <Icon name="FileUp" className="ml-2" /> استيراد
                            </Button>
                            <input type="file" ref={importInputRef} className="hidden" accept=".csv" onChange={handleFileImport} />
                             {CSVLink && (
                                <CSVLink data={users} headers={[{label: 'name', key: 'name'}, {label: 'email', key: 'email'}, {label: 'roleId', key: 'roleId'}]} filename={"users.csv"} className="inline-block">
                                    <Button variant="outline">
                                        <Icon name="FileDown" className="ml-2" /> تصدير
                                    </Button>
                                </CSVLink>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Checkbox id="select-all" checked={isAllFilteredSelected} onCheckedChange={handleSelectAll} />
                                <Label htmlFor="select-all">تحديد الكل</Label>
                            </div>
                            <div className="relative w-full sm:max-w-xs">
                                <Icon name="Search" className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder={`بحث عن ${isDriverTab ? 'سائق' : 'موظف'}...`} className="pr-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}
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
        </div>
    );
};

export default function UsersPage() {
  const { toast } = useToast();
  const { users, addUser, updateUser, deleteUser } = useUsersStore();
  const { roles } = useRolesStore();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User[] | null>(null);
  const [activeTab, setActiveTab] = useState('employees');

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

  const handleDelete = (usersToDelete: User[]) => {
      setUserToDelete(usersToDelete);
  }
  
  const confirmDelete = () => {
    if (userToDelete) {
        userToDelete.forEach(user => deleteUser(user.id));
        toast({ title: "تم الحذف", description: `تم حذف ${userToDelete.length} مستخدمين بنجاح.`});
        setUserToDelete(null);
    }
  }

  const handleBulkUpdateRole = (userIds: string[], roleId: string) => {
    userIds.forEach(id => {
        const user = users.find(u => u.id === id);
        if(user) {
            updateUser(id, { ...user, roleId });
        }
    });
    toast({ title: 'تم التحديث', description: `تم تغيير دور ${userIds.length} مستخدمين بنجاح.` });
  }

  const handleSave = (data: Omit<User, 'id' | 'password'>) => {
      if (selectedUser) {
          updateUser(selectedUser.id, data);
          toast({ title: "تم التعديل", description: `تم تعديل المستخدم "${data.name}" بنجاح.`});
      } else {
          addUser(data);
          toast({ title: "تمت الإضافة", description: `تم إضافة المستخدم "${data.name}" بنجاح.`});
      }
      setDialogOpen(false);
  }
  
  const handleImport = (data: any[]) => {
      let addedCount = 0;
      data.forEach(item => {
          if (item.name && item.email && item.roleId) {
              addUser({
                  name: item.name,
                  email: item.email,
                  roleId: item.roleId,
                  avatar: '',
              });
              addedCount++;
          }
      });
      if (addedCount > 0) {
        toast({ title: "تم الاستيراد", description: `تمت إضافة ${addedCount} مستخدمين بنجاح.` });
      } else {
        toast({ variant: 'destructive', title: 'فشل الاستيراد', description: 'لم يتم العثور على بيانات صالحة في الملف.' });
      }
  }
 
  return (
      <div className="space-y-6" dir="rtl">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Icon name="UserCog" /> إدارة المستخدمين
              </CardTitle>
              <CardDescription className="mt-1">
                إضافة وتعديل المستخدمين وتعيين أدوارهم وصلاحياتهم في النظام.
              </CardDescription>
            </div>
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/settings">
                    <Icon name="ArrowLeft" className="h-4 w-4" />
                </Link>
            </Button>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                    onAdd={handleAddNew}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onBulkUpdateRole={handleBulkUpdateRole}
                    onImport={handleImport}
                />
            </TabsContent>
            <TabsContent value="drivers" className="mt-4">
                 <UserList
                    users={drivers}
                    roles={roles}
                    isDriverTab={true}
                    onAdd={handleAddNew}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onBulkUpdateRole={handleBulkUpdateRole}
                    onImport={handleImport}
                />
            </TabsContent>
             <TabsContent value="merchants" className="mt-4">
                <UserList
                    users={merchants}
                    roles={roles}
                    isDriverTab={false}
                    onAdd={handleAddNew}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onBulkUpdateRole={handleBulkUpdateRole}
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
}
