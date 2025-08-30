
'use client';

import Link from 'next/link';
import type { LucideIcon } from "lucide-react";
import { Settings, User, Users, MapPin, ListChecks, Bell, ArrowLeft, Store, DollarSign, Share2, MessageSquareQuote, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';

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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut"
    }
  })
};

const SettingsItemCard = ({ item, index }: { item: (typeof settingsItems)[0], index: number }) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    custom={index}
    whileHover={{ scale: 1.03, y: -5, transition: { duration: 0.2 } }}
  >
    <Link href={item.href} className="block h-full">
        <Card className="h-full border-2 border-transparent hover:border-primary hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-col items-center justify-center text-center gap-4 p-6">
                <div className="bg-primary/10 text-primary p-4 rounded-full">
                    <item.icon className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">{item.description}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    </Link>
  </motion.div>
);

export default function SettingsPage() {
  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">مركز الإعدادات</h1>
              <p className="text-muted-foreground">
                  نقطة التحكم المركزية لجميع جوانب النظام.
              </p>
            </div>
        </div>
        <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5"/>
            </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {settingsItems.map((item, index) => (
              <SettingsItemCard key={item.title} item={item} index={index} />
          ))}
      </div>
    </motion.div>
  );
}

    