
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/icon';
import { useRolesStore, allPermissionGroups, type Role } from '@/store/roles-store';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { roles, updateRolePermissions } = useRolesStore();
  
  const roleId = params.roleId as string;

  const [role, setRole] = useState<Role | null | undefined>(undefined);
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);

  useEffect(() => {
    const foundRole = roles.find(r => r.id === roleId);
    setRole(foundRole);
    if (foundRole) {
      setTempPermissions(foundRole.permissions);
    }
  }, [roleId, roles]);

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
    if (role) {
      updateRolePermissions(role.id, tempPermissions);
      toast({
        title: 'تم الحفظ بنجاح!',
        description: `تم تحديث صلاحيات دور "${role.name}".`,
      })
      router.push('/dashboard/settings/roles');
    }
  };
  
  const isAllTempSelected = tempPermissions.includes('all');

  if (role === undefined) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  if (role === null) {
    return (
        <div className="text-center py-10">
            <p className="text-lg text-destructive">لم يتم العثور على الدور المطلوب.</p>
            <Button asChild variant="link"><Link href="/dashboard/settings/roles">العودة إلى قائمة الأدوار</Link></Button>
        </div>
    )
  }


  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Icon name="Edit" /> تعديل صلاحيات: {role.name}
            </CardTitle>
            <CardDescription className="mt-1">
              اختر الصلاحيات والصفحات التي يمكن لهذا الدور الوصول إليها.
            </CardDescription>
          </div>
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/settings/roles">
              <Icon name="ArrowLeft" className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
      </Card>
    
      <Card>
        <CardHeader>
            <div className="flex items-center space-x-2 space-x-reverse border-b pb-4">
                <Checkbox
                  id="select-all"
                  checked={isAllTempSelected}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="font-bold text-lg">
                  تحديد كل الصلاحيات
                </Label>
              </div>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" defaultValue={allPermissionGroups.map(g => g.id)} className="w-full">
            {allPermissionGroups.map(group => {
                const groupPermissionIds = group.permissions.map(p => p.id);
                const isAllGroupSelected = groupPermissionIds.every(id => tempPermissions.includes(id)) || isAllTempSelected;
                const isIndeterminate = groupPermissionIds.some(id => tempPermissions.includes(id)) && !isAllGroupSelected;

                return (
                    <AccordionItem value={group.id} key={group.id}>
                        <div className="flex items-center gap-2">
                            <Checkbox 
                                id={`group-${group.id}`} 
                                checked={isAllGroupSelected}
                                onCheckedChange={(checked) => handleGroupPermissionChange(group.permissions, !!checked)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <AccordionTrigger className="flex-1 hover:no-underline py-3">
                                <Label htmlFor={`group-${group.id}`} className="font-semibold text-base cursor-pointer">{group.label}</Label>
                            </AccordionTrigger>
                        </div>
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
        </CardContent>
      </Card>

      <div className="flex justify-start pt-6 mt-6 border-t">
          <Button size="lg" onClick={handleSavePermissions}>
            <Icon name="Save" className="ml-2 h-4 w-4" /> حفظ التغييرات
          </Button>
      </div>
    </div>
  );
}
