
'use client';

import Link from 'next/link';
import type { LucideIcon } from "lucide-react";
import { Settings, User, Users, MapPin, ListChecks, Bell, ArrowLeft, Store, DollarSign, Share2, MessageSquareQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const settingsItems: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    href: '/dashboard/settings/general',
    icon: Settings,
    title: 'الإعدادات العامة',
    description: 'التحكم في هوية الشركة، الألوان، والميزات الرئيسية.',
  },
   {
    href: '#',
    icon: User,
    title: 'إعدادات الحساب',
    description: 'إدارة ملفك الشخصي وتغيير كلمة المرور.',
  },
  {
    href: '#',
    icon: Users,
    title: 'المستخدمين',
    description: 'إدارة صلاحيات وأدوار السائقين والمدراء.',
  },
  {
      href: '#',
      icon: Store,
      title: 'التجار',
      description: 'إدارة حسابات التجار وتسعير التوصيل الخاص بهم.'
  },
  {
    href: '/dashboard/settings/areas', 
    icon: MapPin,
    title: 'المناطق',
    description: 'تحديد المدن والمناطق لعمليات التوصيل.',
  },
   {
    href: '#',
    icon: DollarSign,
    title: 'قوائم الأسعار',
    description: 'إنشاء وتعديل قوائم أسعار التوصيل المختلفة.',
  },
  {
    href: '#',
    icon: ListChecks,
    title: 'حالات التوصيل',
    description: 'تخصيص مراحل وحالات دورة حياة الطلب.',
  },
  {
    href: '#',
    icon: Bell,
    title: 'الإشعارات',
    description: 'التحكم في قوالب الرسائل والإشعارات التلقائية.',
  },
  {
      href: '#',
      icon: Share2,
      title: 'التكاملات',
      description: 'ربط النظام مع خدمات وتطبيقات خارجية.'
  },
   {
      href: '#',
      icon: MessageSquareQuestion,
      title: 'الدعم الفني',
      description: 'الحصول على مساعدة أو طلب ميزات جديدة.'
  },
];


const SettingsCard = ({ href, icon: Icon, title, description }: (typeof settingsItems)[0]) => (
    <Link href={href} className="block hover:bg-muted/50 rounded-lg transition-colors">
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    </Link>
)


export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl">مركز الإعدادات</CardTitle>
                    <CardDescription>
                        نقطة التحكم المركزية لجميع جوانب النظام. اختر أحد الأقسام أدناه للبدء.
                    </CardDescription>
                </div>
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="h-5 w-5"/>
                    </Link>
                </Button>
            </CardHeader>
        </Card>
      
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsItems.map((item) => (
                <SettingsCard key={item.title} {...item} />
            ))}
        </div>
    </div>
  );
}
