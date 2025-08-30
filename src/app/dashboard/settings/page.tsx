
'use client';

import Link from 'next/link';
import type { LucideIcon } from "lucide-react";
import { User, Users, MapPin, ListChecks, Bell, Store, DollarSign, Share2, MessageSquareQuote, LayoutGrid, ArrowLeft } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';


const settingsItems: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  { href: '/dashboard/settings/general', icon: LayoutGrid, title: 'الإعدادات العامة', description: 'التحكم في هوية الشركة، الألوان، والميزات الرئيسية.' },
  { href: '#', icon: User, title: 'إعدادات الحساب', description: 'إدارة ملفك الشخصي وتغيير كلمة المرور.' },
  { href: '#', icon: Users, title: 'المستخدمين', description: 'إدارة صلاحيات وأدوار السائقين والمدراء.' },
  { href: '#', icon: Store, title: 'التجار', description: 'إدارة حسابات التجار وتسعير التوصيل الخاص بهم.' },
  { href: '/dashboard/settings/areas', icon: MapPin, title: 'المناطق', description: 'تحديد المدن والمناطق لعمليات التوصيل.' },
  { href: '#', icon: DollarSign, title: 'قوائم الأسعار', description: 'إنشاء وتعديل قوائم أسعار التوصيل المختلفة.' },
  { href: '#', icon: ListChecks, title: 'حالات التوصيل', description: 'تخصيص مراحل وحالات دورة حياة الطلب.' },
  { href: '#', icon: Bell, title: 'الإشعارات', description: 'التحكم في قوالب الرسائل والإشعارات التلقائية.' },
  { href: '#', icon: Share2, title: 'التكاملات', description: 'ربط النظام مع خدمات وتطبيقات خارجية.' },
  { href: '#', icon: MessageSquareQuote, title: 'الدعم الفني', description: 'الحصول على مساعدة أو طلب ميزات جديدة.' },
];

const SettingsItemCard = ({ item }: { item: (typeof settingsItems)[0]}) => (
    <Link href={item.href} className="block h-full">
        <Card className="h-full hover:border-primary hover:shadow-lg transition-all duration-300 ease-in-out bg-card">
            <CardHeader className="flex flex-col items-center justify-center text-center gap-4 p-6">
                <div className="bg-primary/10 text-primary p-4 rounded-full">
                    <item.icon className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">{item.description}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    </Link>
);

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">مركز الإعدادات</CardTitle>
            <CardDescription className="mt-1">نقطة التحكم المركزية لجميع جوانب النظام.</CardDescription>
          </div>
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
      </Card>

      {/* Content */}
      <main>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {settingsItems.map((item) => (
                <SettingsItemCard key={item.title} item={item} />
            ))}
        </div>
      </main>
    </div>
  );
}
