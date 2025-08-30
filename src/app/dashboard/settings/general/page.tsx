
'use client';

import Link from 'next/link';
import type { LucideIcon } from "lucide-react";
import { Palette, Building, LogIn, LayoutGrid, Languages, List, ReceiptText, Package } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsLayout } from '@/components/settings-layout';

const generalSettingsItems: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  { href: '/dashboard/settings/company', icon: Building, title: 'هوية الشركة والشعارات', description: 'إدارة اسم الشركة والشعارات المستخدمة في النظام.' },
  { href: '/dashboard/settings/login-experience', icon: LogIn, title: 'تجربة تسجيل الدخول', description: 'تخصيص صفحة تسجيل الدخول للمستخدمين.' },
  { href: '/dashboard/settings/fonts-colors', icon: Palette, title: 'الألوان والخطوط', description: 'تغيير الألوان والخطوط لتناسب هويتك.' },
  { href: '#', icon: LayoutGrid, title: 'تخصيص الواجهة', description: 'تعديل شكل الواجهة والميزات المتاحة.' },
  { href: '#', icon: Languages, title: 'الإعدادات الإقليمية', description: 'إدارة اللغة، العملة، والمنطقة الزمنية للنظام.' },
  { href: '#', icon: List, title: 'إدارة القوائم', description: 'التحكم في القوائم المتاحة لكل دور وظيفي.' },
  { href: '#', icon: ReceiptText, title: 'إعدادات البوليصة', description: 'تخصيص محتوى وتصميم بوليصة الشحن.' },
  { href: '#', icon: Package, title: 'إعدادات الطلبات', description: 'التحكم في دورة حياة الطلبات والأرشفة.' },
];

const SettingsItemCard = ({ item }: { item: (typeof generalSettingsItems)[0] }) => (
    <Link href={item.href} className="block h-full">
        <Card className="h-full hover:border-primary hover:shadow-lg transition-all duration-300 ease-in-out bg-card">
            <CardHeader className="flex flex-row items-center gap-5 p-5">
                <div className="bg-primary/10 text-primary p-3 rounded-lg">
                    <item.icon className="h-6 w-6" />
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
    <SettingsLayout
      title="الإعدادات العامة"
      description="تحكم في الجوانب الأساسية والمظهر العام للنظام."
      backHref="/dashboard/settings"
    >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generalSettingsItems.map((item) => (
                <SettingsItemCard key={item.title} item={item} />
            ))}
        </div>
    </SettingsLayout>
  );
}

