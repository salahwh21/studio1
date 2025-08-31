'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/icon';
import { useRolesStore, allPermissionGroups, type Role } from '@/store/roles-store';
import { useToast } from '@/hooks/use-toast';

function RoleCard({ role, onSave, onDelete }: { role: Role; onSave: (permissions: string[]) => void; onDelete: () => void; }) {
  const [permissions, setPermissions] = useState(role.permissions);
  const { toast } = useToast();

  const handleGroupPermissionChange = (groupPermissions: {id: string, label: string}[], checked: boolean) => {
    const groupPermissionIds = groupPermissions.map(p => p.id);
    setPermissions(prev => {
        const otherPermissions = prev.filter(p => !groupPermissionIds.includes(p) && p !== 'all');
        if(checked) {
            return [...otherPermissions, ...groupPermissionIds];
        } else {
            return otherPermissions;
        }
    })
  }

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setPermissions(prev => {
      let newPermissions: string[];
      if (permissionId === 'all') return checked ? ['all'] : [];
      const isCurrentlyAll = prev.includes('all');
      const allPermissionIds = allPermissionGroups.flatMap(g => g.permissions).map(p => p.id);
      const currentPermissions = isCurrentlyAll ? allPermissionIds : prev;

      if (checked) {
        newPermissions = [...currentPermissions, permissionId];
      } else {
        newPermissions = currentPermissions.filter(p => p !== permissionId);
      }
      
      if (newPermissions.length === allPermissionIds.length) return ['all'];
      
      return newPermissions;
    });
  };

  const handleSave = () => {
    onSave(permissions);
    toast({
        title: 'تم الحفظ!',
        description: `تم تحديث صلاحيات دور "${role.name}".`,
    })
  }
  
  const isAllSelected = permissions.includes('all');
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle>{role.name}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
            </div>
             <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={`select-all-${role.id}`}
                  checked={isAllSelected}
                  onCheckedChange={(checked) => setPermissions(checked ? ['all'] : [])}
                />
                <Label htmlFor={`select-all-${role.id}`} className="font-semibold">
                  صلاحيات كاملة
                </Label>
              </div>
        </div>
      </CardHeader>
      <CardContent>
         <Accordion type="multiple" defaultValue={allPermissionGroups.map(g => g.id)} className="w-full">
            {allPermissionGroups.map(group => {
                const groupPermissionIds = group.permissions.map(p => p.id);
                const isAllGroupSelected = groupPermissionIds.every(id => permissions.includes(id)) || isAllSelected;

                return (
                    <AccordionItem value={group.id} key={group.id}>
                        <div className="flex items-center gap-2">
                           <Checkbox 
                                id={`group-${group.id}-${role.id}`} 
                                checked={isAllGroupSelected}
                                onCheckedChange={(checked) => handleGroupPermissionChange(group.permissions, !!checked)}
                                onClick={(e) => e.stopPropagation()}
                            />
                             <AccordionTrigger className="flex-1 hover:no-underline py-3">
                                <Label htmlFor={`group-${group.id}-${role.id}`} className="font-semibold text-base cursor-pointer">{group.label}</Label>
                            </AccordionTrigger>
                        </div>
                        <AccordionContent className="pr-8 space-y-3 pt-2">
                            {group.permissions.map(permission => (
                            <div key={permission.id} className="flex items-center space-x-2 space-x-reverse">
                                <Checkbox
                                    id={`${permission.id}-${role.id}`}
                                    checked={isAllSelected || permissions.includes(permission.id)}
                                    onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                                />
                                <Label htmlFor={`${permission.id}-${role.id}`} className="font-normal text-muted-foreground">
                                {permission.label}
                                </Label>
                            </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                )
            })}
            </Accordion>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
          {role.id !== 'admin' && <Button variant="destructive" onClick={onDelete}>حذف الدور</Button>}
          <Button onClick={handleSave}>حفظ التغييرات</Button>
      </CardFooter>
    </Card>
  )
}


export default function RolesPermissionsPage() {
  const { roles, updateRolePermissions } = useRolesStore();
 
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
              <Button>
                <Icon name="PlusCircle" className="mr-2 h-4 w-4" /> إضافة دور جديد
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {roles.map(role => (
                <RoleCard 
                    key={role.id} 
                    role={role}
                    onSave={(permissions) => updateRolePermissions(role.id, permissions)}
                    onDelete={() => console.log('Delete role', role.id)}
                />
            ))}
        </div>
      </div>
  );
}