
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
import { useRolesStore, allPermissionGroups } from '@/store/roles-store';
import type { Role } from '@/store/roles-store';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


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
  
  const handleGroupPermissionChange = (groupPermissions: {id: string, label: string}[], checked: boolean) => {
    const groupPermissionIds = groupPermissions.map(p => p.id);
    setTempPermissions(prev => {
        const otherPermissions = prev.filter(p => !groupPermissionIds.includes(p) && p !== 'all');
        if(checked) {
            return [...otherPermissions, ...groupPermissionIds];
        } else {
            return otherPermissions;
        }
    })
  }

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setTempPermissions(prev => {
      let newPermissions: string[];

      if (permissionId === 'all') {
        return checked ? ['all'] : [];
      }

      const isCurrentlyAll = prev.includes('all');
      
      const allPermissionIds = allPermissionGroups.flatMap(g => g.permissions).map(p => p.id);
      
      const currentPermissions = isCurrentlyAll ? allPermissionIds : prev;

      if (checked) {
        newPermissions = [...currentPermissions, permissionId];
      } else {
        newPermissions = currentPermissions.filter(p => p !== permissionId);
      }
      
      if (newPermissions.length === allPermissionIds.length) {
        return ['all'];
      }
      
      return newPermissions;
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
  
  const isAllTempSelected = tempPermissions.includes('all');


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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>إدارة صلاحيات: {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              اختر الصلاحيات التي يمكن لهذا الدور الوصول إليها.
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
                  تحديد كل الصلاحيات
                </Label>
              </div>
              <Accordion type="multiple" className="w-full max-h-80 overflow-y-auto pr-2">
                {allPermissionGroups.map(group => {
                  const groupPermissionIds = group.permissions.map(p => p.id);
                  const isAllGroupSelected = groupPermissionIds.every(id => tempPermissions.includes(id)) || isAllTempSelected;
                  const isIndeterminate = groupPermissionIds.some(id => tempPermissions.includes(id)) && !isAllGroupSelected;

                  return (
                     <AccordionItem value={group.id} key={group.id}>
                        <AccordionTrigger className="hover:no-underline">
                           <div className="flex items-center gap-2">
                            <Checkbox 
                                id={`group-${group.id}`} 
                                checked={isAllGroupSelected}
                                indeterminate={isIndeterminate}
                                onCheckedChange={(checked) => handleGroupPermissionChange(group.permissions, !!checked)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <Label htmlFor={`group-${group.id}`} className="font-semibold text-base">{group.label}</Label>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent className="pr-8 space-y-3 pt-2">
                             {group.permissions.map(permission => (
                                <div key={permission.id} className="flex items-center space-x-2 space-x-reverse">
                                  <Checkbox
                                    id={permission.id}
                                    checked={isAllTempSelected || tempPermissions.includes(permission.id)}
                                    onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                                  />
                                  <Label htmlFor={permission.id} className="font-normal text-muted-foreground">
                                    {permission.label}
                                  </Label>
                                </div>
                              ))}
                        </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
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
