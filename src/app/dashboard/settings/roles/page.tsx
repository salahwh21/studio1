'use client';

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
import { useRolesStore } from '@/store/roles-store';

const RoleCard = ({ role }: { role: ReturnType<typeof useRolesStore>['roles'][0] }) => (
  <Card className="hover:border-primary hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col">
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-xl font-bold">{role.name}</CardTitle>
          <CardDescription className="mt-2">{role.description}</CardDescription>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
            <Icon name="Users" className="h-4 w-4"/>
            <span>{role.userCount}</span>
        </div>
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      {/* Could add a summary of permissions here in the future */}
    </CardContent>
    <CardContent>
       <Button asChild className="w-full">
        <Link href={`/dashboard/settings/roles/${role.id}`}>
          <Icon name="Edit" className="mr-2 h-4 w-4" />
          إدارة الصلاحيات
        </Link>
      </Button>
    </CardContent>
  </Card>
);

export default function RolesListPage() {
  const { roles } = useRolesStore();
 
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {roles.map(role => (
                <RoleCard 
                    key={role.id} 
                    role={role}
                />
            ))}
        </div>
      </div>
  );
}
