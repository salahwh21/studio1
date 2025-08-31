
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


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
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني / رقم الهاتف</Label>
                        <Input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                     {!isDriver && (
                        <div className="space-y-2">
                            <Label htmlFor="roleId">الدور</Label>
                            <Select value={roleId} onValueChange={(value) => setRoleId(value as Role['id'])}>
                                <SelectTrigger id="roleId">
                                    <SelectValue placeholder="اختر دورًا..." />
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

const UserCard = ({ user, role, onEdit, onDelete }: { user: User; role?: Role; onEdit: (user: User) => void; onDelete: (user: User) => void; }) => (
    <Card className="hover:border-primary transition-colors duration-200">
        <CardContent className="p-4 flex items-center gap-4">
            <Avatar className="h-14 w-14 border">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                 {role && <Badge variant="secondary">{role.name}</Badge>}
            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><Icon name="MoreVertical" className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onEdit(user)}><Icon name="Edit" className="ml-2"/>تعديل</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => onDelete(user)} className="text-destructive"><Icon name="Trash2" className="ml-2"/>حذف</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </CardContent>
    </Card>
);

const UserList = ({ users, roles, isDriverTab, onEdit, onDelete, onAdd }: { users: User[]; roles: Role[]; isDriverTab: boolean; onEdit: (user: User) => void; onDelete: (user: User) => void; onAdd: () => void; }) => {
    const [searchQuery, setSearchQuery] = useState('');
    
    const filteredUsers = useMemo(() => 
        users.filter(user => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        ), [users, searchQuery]
    );

    return (
        <div className="space-y-4">
             <div className="flex flex-col sm:flex-row gap-2 justify-between">
                <div className="flex gap-2">
                     <Button onClick={onAdd}><Icon name="UserPlus" className="ml-2" /> إضافة جديد</Button>
                     <Button variant="outline"><Icon name="FileUp" className="ml-2" /> استيراد</Button>
                     <Button variant="outline"><Icon name="FileDown" className="ml-2" /> تصدير</Button>
                </div>
                 <div className="relative flex-1 sm:max-w-xs">
                    <Icon name="Search" className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={`بحث عن ${isDriverTab ? 'سائق' : 'موظف'}...`} className="pr-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map(user => (
                    <UserCard key={user.id} user={user} role={roles.find(r => r.id === user.roleId)} onEdit={onEdit} onDelete={onDelete} />
                ))}
            </div>
            {filteredUsers.length === 0 && (
                 <div className="text-center py-10 text-muted-foreground">
                    <Icon name="Search" className="mx-auto h-10 w-10 mb-4" />
                    <p>لا توجد نتائج للبحث.</p>
                </div>
            )}
        </div>
    );
};


export default function UsersPage() {
  const { toast } = useToast();
  const { users, addUser, updateUser, deleteUser } = useUsersStore();
  const { roles } = useRolesStore();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('employees');

  const employees = useMemo(() => users.filter(u => u.roleId !== 'driver'), [users]);
  const drivers = useMemo(() => users.filter(u => u.roleId === 'driver'), [users]);

  const handleAddNew = () => {
      setSelectedUser(null);
      setDialogOpen(true);
  }
  
  const handleEdit = (user: User) => {
      setSelectedUser(user);
      setDialogOpen(true);
  }

  const handleDelete = (user: User) => {
      setUserToDelete(user);
  }

  const confirmDelete = () => {
      if (userToDelete) {
          deleteUser(userToDelete.id);
          toast({ title: "تم الحذف", description: `تم حذف المستخدم "${userToDelete.name}" بنجاح.`});
          setUserToDelete(null);
      }
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
 
  return (
      <div className="space-y-6">
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
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employees">الموظفين ({employees.length})</TabsTrigger>
                <TabsTrigger value="drivers">السائقين ({drivers.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="employees" className="mt-4">
                 <UserList
                    users={employees}
                    roles={roles}
                    isDriverTab={false}
                    onAdd={handleAddNew}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
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
                        هل أنت متأكد من حذف المستخدم "{userToDelete?.name}"؟
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

