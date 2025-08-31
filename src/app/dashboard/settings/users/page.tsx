'use client';

import { useState } from 'react';
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
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const UserDialog = ({ open, onOpenChange, onSave, user, roles }: { open: boolean, onOpenChange: (open: boolean) => void, onSave: (user: Omit<User, 'id'>) => void, user: User | null, roles: Role[] }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [roleId, setRoleId] = useState<Role['id'] | ''>('');

    useState(() => {
        if(user) {
            setName(user.name);
            setEmail(user.email);
            setRoleId(user.roleId);
        } else {
            setName('');
            setEmail('');
            setRoleId('');
        }
    }, [user, open]);

    const handleSave = () => {
        if (!name || !email || !roleId) return;
        onSave({ name, email, roleId, avatar: user?.avatar || '' });
    }
    
    return (
         <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{user ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</DialogTitle>
                    <DialogDescription>
                        {user ? 'قم بتعديل بيانات المستخدم.' : 'أدخل بيانات المستخدم الجديد.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">اسم المستخدم</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="roleId">الدور</Label>
                        <Select value={roleId} onValueChange={(value) => setRoleId(value as Role['id'])}>
                            <SelectTrigger id="roleId">
                                <SelectValue placeholder="اختر دورًا..." />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map(role => (
                                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
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

export default function UsersPage() {
  const { toast } = useToast();
  const { users, addUser, updateUser, deleteUser } = useUsersStore();
  const { roles } = useRolesStore();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

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
  
  const handleSave = (data: Omit<User, 'id'>) => {
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
            <div className="flex gap-2">
              <Button variant="outline" size="icon" asChild>
                  <Link href="/dashboard/settings">
                      <Icon name="ArrowLeft" className="h-4 w-4" />
                  </Link>
              </Button>
              <Button onClick={handleAddNew}>
                <Icon name="PlusCircle" className="mr-2 h-4 w-4" /> إضافة مستخدم جديد
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>المستخدم</TableHead>
                            <TableHead>الدور</TableHead>
                            <TableHead><span className="sr-only">إجراءات</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                             <TableRow key={user.id}>
                                <TableCell className="font-medium flex items-center gap-3">
                                    <Icon name="User" className="h-8 w-8 p-1.5 bg-muted rounded-full" />
                                    <div>
                                        <p>{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{roles.find(r => r.id === user.roleId)?.name || user.roleId}</Badge>
                                </TableCell>
                                <TableCell className="text-left">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon"><Icon name="MoreVertical" className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => handleEdit(user)}>تعديل</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={() => handleDelete(user)} className="text-destructive">حذف</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        
        <UserDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSave={handleSave}
            user={selectedUser}
            roles={roles}
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
