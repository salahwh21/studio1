
'use client';

import Link from 'next/link';
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Palette, Building, LogIn, LayoutGrid, Languages, List, ReceiptText, Package, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';

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

const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut"
    }
  })
};

const SettingsItemCard = ({ item, index }: { item: (typeof generalSettingsItems)[0], index: number }) => (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Link href={item.href} className="block hover:bg-muted/50 rounded-lg transition-colors">
          <Card className="h-full border-l-4 border-primary/20 hover:border-primary transition-colors duration-300">
              <CardHeader className="flex flex-row items-start gap-5">
                  <div className="text-primary pt-1">
                      <item.icon className="h-7 w-7" />
                  </div>
                  <div>
                      <CardTitle className="text-lg mb-1">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                  </div>
              </CardHeader>
          </Card>
      </Link>
    </motion.div>
);

export default function GeneralSettingsPage() {
  return (
    <motion.div 
      className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">الإعدادات العامة</h1>
                <p className="text-muted-foreground">
                    تحكم في الجوانب الأساسية والمظهر العام للنظام.
                </p>
              </div>
            </div>
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/settings">
                    <ArrowLeft className="h-5 w-5"/>
                </Link>
            </Button>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generalSettingsItems.map((item, index) => (
                <SettingsItemCard key={item.title} item={item} index={index} />
            ))}
        </div>
    </motion.div>
  );
}
