
'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MoreHorizontal } from 'lucide-react';
import Icon from '@/components/icon';
import { useRolesStore, allPermissions } from '@/store/roles-store';
import type { Role } from '@/store/roles-store';


export default function RolesPermissionsPage() {
  const { roles, updateRolePermissions } = useRolesStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setTempPermissions(role.permissions);
    setIsDialogOpen(true);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setTempPermissions(prev => {
      if (permissionId === 'all') {
        return checked ? allPermissions.map(p => p.id) : [];
      }
      
      const newPermissions = checked
        ? [...prev, permissionId]
        : prev.filter(p => p !== permissionId);

      if (newPermissions.length === allPermissions.length) {
        return ['all'];
      }
      if (prev.includes('all') && !checked) {
        return allPermissions.filter(p => p.id !== permissionId).map(p => p.id);
      }
      
      return newPermissions.filter(p => p !== 'all');
    });
  };
  
  const handleSelectAll = (checked: boolean) => {
    setTempPermissions(checked ? ['all'] : []);
  }

  const handleSavePermissions = () => {
    if (selectedRole) {
      updateRolePermissions(selectedRole.id, tempPermissions);
    }
    setIsDialogOpen(false);
    setSelectedRole(null);
  };
  
  const isAllSelectedForRole = (role: Role | null) => {
    if (!role) return false;
    return role.permissions.includes('all') || role.permissions.length === allPermissions.length;
  }
  
  const isAllTempSelected = tempPermissions.includes('all') || tempPermissions.length === allPermissions.length;


  return (
    <>
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
              <Button>
                <Icon name="PlusCircle" className="mr-2 h-4 w-4" /> إضافة دور جديد
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الأدوار الحالية</CardTitle>
            <CardDescription>
              قائمة بجميع الأدوار الوظيفية المعرفة في النظام.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم الدور</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead className="text-center">عدد المستخدمين</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.description}
                    </TableCell>
                    <TableCell className="text-center">
                      {role.userCount}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={role.id === 'admin'}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">فتح القائمة</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleManagePermissions(role)}>
                            <Icon name="ListChecks" className="mr-2 h-4 w-4" />
                            إدارة الصلاحيات
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Icon name="Edit" className="mr-2 h-4 w-4" />
                            تعديل الدور
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Icon name="Trash2" className="mr-2 h-4 w-4" />
                            حذف الدور
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إدارة صلاحيات: {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              اختر الصفحات والقوائم التي يمكن لهذا الدور الوصول إليها.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
              <div className="flex items-center space-x-2 space-x-reverse border-b pb-4">
                <Checkbox
                  id="select-all"
                  checked={isAllTempSelected}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="font-bold">
                  تحديد الكل
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {allPermissions.map(permission => (
                <div key={permission.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={permission.id}
                    checked={isAllTempSelected || tempPermissions.includes(permission.id)}
                    onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                  />
                  <Label htmlFor={permission.id} className="font-normal">
                    {permission.label}
                  </Label>
                </div>
              ))}
              </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleSavePermissions}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
