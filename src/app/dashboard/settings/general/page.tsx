
'use client';

import Link from 'next/link';
import type { LucideIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';

const generalSettingsItems: {
  href: string;
  iconName: any;
  title: string;
  description: string;
}[] = [
  { href: '/dashboard/settings/company/identity', iconName: 'Building', title: 'هوية الشركة والشعارات', description: 'إدارة اسم الشركة والشعارات المستخدمة في النظام.' },
  { href: '/dashboard/settings/login-experience', iconName: 'LogIn', title: 'تجربة تسجيل الدخول', description: 'تخصيص صفحة تسجيل الدخول للمستخدمين.' },
  { href: '/dashboard/settings/fonts-colors', iconName: 'Palette', title: 'الألوان والخطوط', description: 'تغيير الألوان والخطوط لتناسب هويتك.' },
  { href: '/dashboard/settings/ui-customization', iconName: 'Brush', title: 'تخصيص الواجهة', description: 'تعديل شكل الواجهة، كثافة العرض، ونمط الأيقونات.' },
  { href: '/dashboard/settings/regional', iconName: 'Languages', title: 'الإعدادات الإقليمية', description: 'إدارة اللغة، العملة، والمنطقة الزمنية للنظام.' },
  { href: '/dashboard/settings/orders', iconName: 'Package', title: 'إعدادات الطلبات', description: 'التحكم في دورة حياة الطلبات والأرشفة.' },
  { href: '/dashboard/settings/policy', iconName: 'ReceiptText', title: 'إعدادات البوليصة', description: 'تصميم وتخصيص شكل بوليصة الشحن.' },
];

const SettingsItemCard = ({ item }: { item: (typeof generalSettingsItems)[0] }) => (
    <Link href={item.href} className="block h-full">
        <Card className="h-full hover:border-primary hover:shadow-lg transition-all duration-300 ease-in-out bg-card">
            <CardHeader className="flex flex-row items-center gap-5 p-5">
                <div className="bg-primary/10 text-primary p-3 rounded-lg">
                    <Icon name={item.iconName} className="h-6 w-6" />
                </div>
                <div>
                    <CardTitle className="text-base mb-1">{item.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed">{item.description}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    </Link>
);

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">الإعدادات العامة</CardTitle>
            <CardDescription className="mt-1">تحكم في الجوانب الأساسية والمظهر العام للنظام.</CardDescription>
          </div>
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/settings">
              <Icon name="ArrowLeft" className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
      </Card>
      
      {/* Content */}
      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generalSettingsItems.map((item) => (
                <SettingsItemCard key={item.title} item={item} />
            ))}
        </div>
      </main>
    </div>
  );
}
