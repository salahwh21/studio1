
'use client';

import Link from 'next/link';
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
import { MoreHorizontal } from 'lucide-react';
import Icon from '@/components/icon';

const roles = [
  {
    name: 'المدير العام',
    description: 'وصول كامل لجميع أجزاء النظام والإعدادات.',
    userCount: 1,
  },
  {
    name: 'مشرف',
    description: 'يمكنه إدارة الطلبات والسائقين والتقارير.',
    userCount: 3,
  },
  {
    name: 'خدمة العملاء',
    description: 'يمكنه إضافة الطلبات ومتابعتها والتواصل مع العملاء.',
    userCount: 5,
  },
  {
    name: 'سائق',
    description: 'يستخدم تطبيق السائق فقط لتحديث حالات الطلبات.',
    userCount: 15,
  },
  {
    name: 'تاجر',
    description: 'يستخدم لوحة التحكم الخاصة بالتاجر لإدارة طلباته.',
    userCount: 25,
  },
];

export default function RolesPermissionsPage() {
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
                <TableRow key={role.name}>
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
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">فتح القائمة</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
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
  );
}
