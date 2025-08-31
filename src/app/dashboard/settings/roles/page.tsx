
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
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


const RoleCard = ({ role, onEdit, onDelete }: { role: Role; onEdit: (role: Role) => void; onDelete: (role: Role) => void; }) => (
  <Card className="hover:border-primary hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col">
    <CardHeader>
      <div className="flex justify-between items-start">
        <Link href={`/dashboard/settings/roles/${role.id}`} className="space-y-2 flex-1">
          <CardTitle className="text-xl font-bold">{role.name}</CardTitle>
          <CardDescription className="mt-2">{role.description}</CardDescription>
        </Link>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
                <Icon name="Users" className="h-4 w-4"/>
                <span>{role.userCount}</span>
            </div>
            {role.id !== 'admin' && role.id !== 'driver' && role.id !== 'merchant' && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><Icon name="MoreVertical" className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onEdit(role)}>تعديل</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => onDelete(role)} className="text-destructive">حذف</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
      </div>
    </CardHeader>
    <CardContent className="flex-grow mt-auto">
       <Button asChild className="w-full">
        <Link href={`/dashboard/settings/roles/${role.id}`}>
          <Icon name="Settings" className="mr-2 h-4 w-4" />
          إدارة الصلاحيات
        </Link>
      </Button>
    </CardContent>
  </Card>
);

const RoleDialog = ({ open, onOpenChange, onSave, role }: { open: boolean, onOpenChange: (open: boolean) => void, onSave: (role: Omit<Role, 'id' | 'permissions' | 'userCount'>) => void, role: Role | null }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    // Use an effect to update local state when the dialog opens or the selected role changes.
    // Using `key` on the Dialog component itself is another way to force re-mount if this becomes complex.
    React.useEffect(() => {
        if(role) {
            setName(role.name);
            setDescription(role.description);
        } else {
            setName('');
            setDescription('');
        }
    }, [role, open]);

    const handleSave = () => {
        onSave({ name, description });
    }
    
    return (
         <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{role ? 'تعديل الدور' : 'إضافة دور جديد'}</DialogTitle>
                    <DialogDescription>
                        {role ? 'قم بتعديل اسم ووصف الدور.' : 'أدخل اسمًا ووصفًا للدور الجديد.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">اسم الدور</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">الوصف</Label>
                        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
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

export default function RolesListPage() {
  const { toast } = useToast();
  const { roles, addRole, updateRole, deleteRole } = useRolesStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const handleAddNew = () => {
      setSelectedRole(null);
      setDialogOpen(true);
  }
  
  const handleEdit = (role: Role) => {
      setSelectedRole(role);
      setDialogOpen(true);
  }

  const handleDelete = (role: Role) => {
      setRoleToDelete(role);
  }

  const confirmDelete = () => {
      if (roleToDelete) {
          deleteRole(roleToDelete.id);
          toast({ title: "تم الحذف", description: `تم حذف دور "${roleToDelete.name}" بنجاح.`});
          setRoleToDelete(null);
      }
  }
  
  const handleSave = (data: Omit<Role, 'id'| 'permissions' | 'userCount'>) => {
      if (selectedRole) {
          updateRole(selectedRole.id, data);
          toast({ title: "تم التعديل", description: `تم تعديل دور "${data.name}" بنجاح.`});
      } else {
          addRole({ ...data, permissions: [] });
          toast({ title: "تمت الإضافة", description: `تم إضافة دور "${data.name}" بنجاح.`});
      }
      setDialogOpen(false);
  }
 
  return (
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Icon name="Users" /> الأدوار والصلاحيات
              </CardTitle>
              <CardDescription className="mt-1">
                إدارة الأدوار الوظيفية وتحكم في صلاحيات الوصول لكل دور في النظام.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" asChild>
                  <Link href="/dashboard/settings">
                      <Icon name="ArrowLeft" className="h-4 w-4" />
                  </Link>
              </Button>
              <Button onClick={handleAddNew}>
                <Icon name="PlusCircle" className="mr-2 h-4 w-4" /> إضافة دور جديد
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {roles.map(role => (
                <RoleCard 
                    key={role.id} 
                    role={role}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ))}
        </div>
        
        <RoleDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSave={handleSave}
            role={selectedRole}
        />
        
        <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                    <AlertDialogDescription>
                        هل أنت متأكد من حذف دور "{roleToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
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
