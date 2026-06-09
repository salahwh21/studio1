'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Settings,
  LayoutGrid,
  User,
  Users,
  UserCog,
  MapPin,
  DollarSign,
  ListChecks,
  Undo2,
  Bell,
  Share2,
  Bot,
  Wand2,
  MessageSquareQuote,
  Palette,
  Globe,
  Package,
  Menu,
  Search,
  Building2,
  Shield,
  Truck,
  Zap,
  ChevronLeft,
  ArrowLeft,
  FileText
} from 'lucide-react';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { settingsDocs } from './settings-docs';
import { EmergencyBackupManager } from '@/components/emergency-backup-manager';

type SettingItem = {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
};

type SettingsSection = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  bgColor: string;
  iconBg: string;
  borderColor: string;
  items: SettingItem[];
};

const settingsSections: SettingsSection[] = [
  {
    id: 'company',
    title: 'إعدادات الشركة',
    description: 'معلومات الشركة والهوية والمظهر والإعدادات الإقليمية',
    icon: Building2,
    bgColor: 'bg-card',
    iconBg: 'bg-info/20 text-info',
    borderColor: 'border-border/40',
    items: [
      {
        href: '/dashboard/settings/company',
        icon: Building2,
        title: 'معلومات الشركة',
        description: 'الاسم والعنوان والبيانات القانونية'
      },
      {
        href: '/dashboard/settings/company/identity',
        icon: LayoutGrid,
        title: 'الهوية والشعارات',
        description: 'إدارة الشعارات وأيقونة المتصفح'
      },
      {
        href: '/dashboard/settings/company/appearance',
        icon: Palette,
        title: 'تخصيص المظهر',
        description: 'الألوان والخطوط والثيم'
      },
      {
        href: '/dashboard/settings/company/regional',
        icon: Globe,
        title: 'الإعدادات الإقليمية',
        description: 'اللغة والمنطقة الزمنية والعملة'
      },
    ]
  },
  {
    id: 'users',
    title: 'المستخدمين والصلاحيات',
    description: 'إدارة الفريق والأدوار والأمان',
    icon: Shield,
    bgColor: 'bg-card',
    iconBg: 'bg-primary/20 text-primary',
    borderColor: 'border-border/40',
    items: [
      {
        href: '/dashboard/settings/account',
        icon: User,
        title: 'حسابي',
        description: 'إدارة ملفك الشخصي وكلمة المرور'
      },
      {
        href: '/dashboard/settings/users',
        icon: UserCog,
        title: 'إدارة المستخدمين',
        description: 'إضافة وتعديل المستخدمين'
      },
      {
        href: '/dashboard/settings/roles',
        icon: Users,
        title: 'الأدوار والصلاحيات',
        description: 'إدارة صلاحيات المستخدمين'
      },
      {
        href: '/dashboard/settings/menu-visibility',
        icon: Menu,
        title: 'رؤية القوائم',
        description: 'التحكم في ظهور عناصر القائمة'
      },
      {
        href: '/dashboard/settings/login-experience',
        icon: Shield,
        title: 'تجربة تسجيل الدخول',
        description: 'تخصيص صفحة تسجيل الدخول'
      },
    ]
  },
  {
    id: 'delivery',
    title: 'إدارة التوصيل',
    description: 'المناطق والأسعار وحالات الطلبات',
    icon: Truck,
    bgColor: 'bg-card',
    iconBg: 'bg-success/20 text-success',
    borderColor: 'border-border/40',
    items: [
      {
        href: '/dashboard/settings/areas',
        icon: MapPin,
        title: 'المناطق والمدن',
        description: 'تحديد مناطق التوصيل'
      },
      {
        href: '/dashboard/settings/pricing',
        icon: DollarSign,
        title: 'قوائم الأسعار',
        description: 'إنشاء وتعديل قوائم الأسعار'
      },
      {
        href: '/dashboard/settings/statuses',
        icon: ListChecks,
        title: 'حالات الطلبات',
        description: 'تخصيص مراحل دورة حياة الطلب'
      },
      {
        href: '/dashboard/settings/orders',
        icon: Package,
        title: 'إعدادات الطلبات',
        description: 'تخصيص سلوك وخيارات الطلبات'
      },
      {
        href: '/dashboard/settings/returns',
        icon: Undo2,
        title: 'إدارة المرتجعات',
        description: 'أتمتة عمليات المرتجعات',
        badge: 'جديد'
      },
    ]
  },
  {
    id: 'reports',
    title: 'التقارير والطباعة',
    description: 'إدارة مركزية لجميع تصاميم PDF والتقارير',
    icon: FileText,
    bgColor: 'bg-card',
    iconBg: 'bg-destructive/20 text-destructive',
    borderColor: 'border-border/40',
    items: [
      {
        href: '/dashboard/reports',
        icon: LayoutGrid,
        title: 'مركز تصميم التقارير',
        description: 'إدارة وتخصيص بوالص الشحن والتقارير المالية والملفات الصادرة',
        badge: 'جديد'
      },
    ]
  },
  {
    id: 'integrations',
    title: 'التكاملات والإشعارات',
    description: 'ربط الخدمات الخارجية والتنبيهات',
    icon: Zap,
    bgColor: 'bg-card',
    iconBg: 'bg-warning/20 text-warning',
    borderColor: 'border-border/40',
    items: [
      {
        href: '/dashboard/settings/notifications',
        icon: Bell,
        title: 'الإشعارات',
        description: 'قوالب الرسائل والتنبيهات'
      },
      {
        href: '/dashboard/settings/integrations',
        icon: Share2,
        title: 'التكاملات',
        description: 'ربط مع Shopify وWooCommerce',
        badge: 'قريباً'
      },
    ]
  },
  {
    id: 'ai',
    title: 'الذكاء الاصطناعي',
    description: 'أدوات AI لتحسين الإنتاجية',
    icon: Bot,
    bgColor: 'bg-card',
    iconBg: 'bg-info/20 text-info',
    borderColor: 'border-border/40',
    items: [
      {
        href: '/dashboard/settings/ai-config',
        icon: Wand2,
        title: 'إعدادات AI',
        description: 'تكوين API Keys والموديلات',
        badge: 'قريباً'
      },
      {
        href: '/dashboard/settings/ai-agent',
        icon: Bot,
        title: 'وكيل خدمة العملاء',
        description: 'توليد ردود احترافية تلقائياً',
        badge: 'قريباً'
      },
    ]
  },
];

// Flatten all items for search
const allItems = settingsSections.flatMap(section =>
  section.items.map(item => ({ ...item, sectionTitle: section.title, sectionColor: section.iconBg }))
);

export default function SettingsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = searchQuery
    ? allItems.filter(item =>
      item.title.includes(searchQuery) ||
      item.description.includes(searchQuery)
    )
    : [];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">مركز الإعدادات</h1>
            <p className="text-muted-foreground">
              نقطة التحكم المركزية لجميع جوانب النظام
            </p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في الإعدادات..."
                className="pr-10 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link href="/dashboard" className="hidden md:block">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                العودة
              </Button>
            </Link>
          </div>
        </div>

        {/* Emergency Backup Section - Added for data safety */}
        <EmergencyBackupManager />

        {/* Search Results */}
        {searchQuery && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              نتائج البحث ({filteredItems.length})
            </h2>
            {filteredItems.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Card className="h-full hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${item.sectionColor} text-white`}>
                            <item.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate">{item.title}</h3>
                              {item.badge && (
                                <Badge className="text-xs shrink-0 bg-emerald-500">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {item.description}
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              في: {item.sectionTitle}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border-2 border-dashed">
                <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">لا توجد نتائج لـ "{searchQuery}"</p>
              </Card>
            )}
          </div>
        )}

        {/* Settings Sections */}
        {!searchQuery && (
          <TooltipProvider>
            <div className="space-y-8">
              {settingsSections.map((section) => (
                <div
                  key={section.id}
                  className={`rounded-2xl border-2 ${section.borderColor} ${section.bgColor} p-6`}
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-2.5 rounded-xl ${section.iconBg}`}>
                      <section.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold">
                        {section.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {section.items.length} إعداد
                    </Badge>
                  </div>

                  {/* Section Items Grid */}
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {section.items.map((item) => (
                      <Tooltip key={item.href} delayDuration={200}>
                        <TooltipTrigger asChild>
                          <Link href={item.href}>
                            <Card className="h-full bg-background/80 backdrop-blur-sm hover:bg-background hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group border-2 hover:border-primary">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className={`p-2.5 rounded-lg bg-muted group-hover:${section.iconBg} transition-colors`}>
                                    <item.icon className={`h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                                        {item.title}
                                      </h3>
                                      {item.badge && (
                                        <Badge className="text-[10px] px-1.5 py-0 bg-success">
                                          {item.badge}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                      {item.description}
                                    </p>
                                  </div>
                                  <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-right">
                          {settingsDocs[item.href] || item.description}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TooltipProvider>
        )}

        {/* Help Card */}
        <Card className="overflow-hidden border-2 border-success/20">
          <div className="bg-gradient-to-r from-success/10 via-success/5 to-transparent p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-success shadow-lg">
                <MessageSquareQuote className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">هل تحتاج مساعدة؟</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  فريق الدعم الفني جاهز لمساعدتك على مدار الساعة
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button size="sm" className="gap-2 bg-success hover:bg-success/90">
                    <MessageSquareQuote className="h-4 w-4" />
                    تواصل مع الدعم
                  </Button>
                  <Button variant="outline" size="sm">
                    طلب ميزة جديدة
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
