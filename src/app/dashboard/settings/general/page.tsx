'use client';

import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Icon from '@/components/icon';
import { SettingsHeader } from '@/components/settings-header';
import { ChevronLeft } from 'lucide-react';

const generalSettingsItems: {
  href: string;
  iconName: any;
  title: string;
  description: string;
}[] = [
    { href: '/dashboard/settings/login-experience', iconName: 'LogIn', title: 'تجربة تسجيل الدخول', description: 'تخصيص صفحة تسجيل الدخول للمستخدمين' },
    { href: '/dashboard/settings/fonts-colors', iconName: 'Palette', title: 'الألوان والخطوط', description: 'تغيير الألوان والخطوط لتناسب هويتك' },
    { href: '/dashboard/settings/ui-customization', iconName: 'Brush', title: 'تخصيص الواجهة', description: 'تعديل شكل الواجهة وكثافة العرض' },
    { href: '/dashboard/settings/regional', iconName: 'Languages', title: 'الإعدادات الإقليمية', description: 'إدارة اللغة والعملة والمنطقة الزمنية' },
    { href: '/dashboard/settings/orders', iconName: 'Package', title: 'إعدادات الطلبات', description: 'التحكم في دورة حياة الطلبات' },
    { href: '/dashboard/settings/policy', iconName: 'ReceiptText', title: 'إعدادات البوليصة', description: 'تصميم وتخصيص شكل بوليصة الشحن' },
    { href: '/dashboard/settings/menu-visibility', iconName: 'List', title: 'إعدادات ظهور القائمة', description: 'التحكم في القوائم المعروضة' },
  ];

const SettingsItemCard = ({ item }: { item: (typeof generalSettingsItems)[0] }) => (
  <Link href={item.href} className="block h-full group">
    <Card className="h-full bg-white dark:bg-slate-900 border-2 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500/10 p-3 rounded-xl group-hover:bg-blue-500 transition-colors">
            <Icon name={item.iconName} className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1 group-hover:text-blue-600 transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </div>
          <ChevronLeft className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardContent>
    </Card>
  </Link>
);

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      <SettingsHeader
        icon="LayoutGrid"
        title="الإعدادات العامة"
        description="تحكم في الجوانب الأساسية والمظهر العام للنظام"
        color="blue"
      />

      {/* Section Container */}
      <div className="rounded-2xl border-2 border-blue-500/30 bg-blue-500/5 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generalSettingsItems.map((item) => (
            <SettingsItemCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
