
'use client';

import Link from 'next/link';
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Palette, Building, LogIn, LayoutGrid, Languages, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const generalSettingsItems: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    href: '#',
    icon: Building,
    title: 'هوية الشركة والشعارات',
    description: 'إدارة اسم الشركة والشعارات المستخدمة في النظام.',
  },
  {
    href: '#',
    icon: LogIn,
    title: 'تجربة تسجيل الدخول',
    description: 'تخصيص صفحة تسجيل الدخول للمستخدمين.',
  },
  {
    href: '#',
    icon: Palette,
    title: 'الألوان والخطوط',
    description: 'تغيير الألوان والخطوط لتناسب هويتك.',
  },
  {
    href: '#',
    icon: LayoutGrid,
    title: 'تخصيص الواجهة',
    description: 'تعديل شكل الواجهة والميزات المتاحة.',
  },
  {
    href: '#',
    icon: Languages,
    title: 'الإعدادات الإقليمية',
    description: 'إدارة اللغة، العملة، والمنطقة الزمنية للنظام.',
  },
  {
    href: '#',
    icon: List,
    title: 'إدارة القوائم',
    description: 'التحكم في قوائم التنقل والأقسام الظاهرة.',
  },
];

const SettingsItemCard = ({ href, icon: Icon, title, description }: (typeof generalSettingsItems)[0]) => (
    <Link href={href} className="block hover:bg-muted/50 rounded-lg transition-colors">
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-accent/10 p-3 rounded-full">
                    <Icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    </Link>
)

export default function GeneralSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl">الإعدادات العامة</CardTitle>
                    <CardDescription>
                        تحكم في الجوانب الأساسية والمظهر العام للنظام.
                    </CardDescription>
                </div>
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/settings">
                        <ArrowLeft className="h-5 w-5"/>
                    </Link>
                </Button>
            </CardHeader>
        </Card>
      
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {generalSettingsItems.map((item) => (
                <SettingsItemCard key={item.title} {...item} />
            ))}
        </div>
    </div>
  );
}
