'use client';

import { useState, useRef } from 'react';
import { Upload, Save, Eye, ImageIcon, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import Icon from '@/components/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsHeader } from '@/components/settings-header';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// تعريف الشعارات مع معلومات تفصيلية
const logoSections = [
  { 
    id: 'headerLogo', 
    label: 'شعار رأس الصفحة', 
    description: 'يظهر في الهيدر العلوي للوحة التحكم',
    iconName: 'LayoutDashboard' as const, 
    color: 'bg-indigo-500',
    displayWidth: 140, 
    displayHeight: 45,
    recommended: '280×90 px',
    formats: 'PNG, SVG'
  },
  { 
    id: 'loginLogo', 
    label: 'شعار صفحة الدخول', 
    description: 'يظهر في صفحة تسجيل الدخول',
    iconName: 'LogIn' as const, 
    color: 'bg-blue-500',
    displayWidth: 180, 
    displayHeight: 60,
    recommended: '360×120 px',
    formats: 'PNG, SVG'
  },
  { 
    id: 'reportsLogo', 
    label: 'شعار التقارير', 
    description: 'يظهر في الكشوفات والفواتير المطبوعة',
    iconName: 'FileText' as const, 
    color: 'bg-emerald-500',
    displayWidth: 160, 
    displayHeight: 50,
    recommended: '320×100 px',
    formats: 'PNG, SVG'
  },
  { 
    id: 'policyLogo', 
    label: 'شعار البوليصة', 
    description: 'يظهر في بوليصات الشحن',
    iconName: 'ReceiptText' as const, 
    color: 'bg-purple-500',
    displayWidth: 100, 
    displayHeight: 35,
    recommended: '200×70 px',
    formats: 'PNG, SVG'
  },
  { 
    id: 'favicon', 
    label: 'أيقونة المتصفح', 
    description: 'تظهر في تبويب المتصفح',
    iconName: 'Globe' as const, 
    color: 'bg-orange-500',
    displayWidth: 48, 
    displayHeight: 48,
    recommended: '48×48 px',
    formats: 'PNG, ICO'
  },
];

type LocalLogosState = {
  [key: string]: { src: string | null };
};

// مكون رفع الشعار المحسّن
const LogoUploader = ({ 
  section, 
  logoData, 
  onFileChange, 
  onRemove
}: {
  section: typeof logoSections[0];
  logoData: { src: string | null };
  onFileChange: (id: string, file: File) => void;
  onRemove: (id: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasLogo = !!logoData.src;

  return (
    <div 
      className={cn(
        "group relative rounded-xl border-2 transition-all duration-300 overflow-hidden",
        "bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800",
        hasLogo ? "border-slate-200 hover:border-primary/50" : "border-dashed border-slate-300 hover:border-primary"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-slate-50/50 dark:bg-slate-800/50">
        <div className={cn("p-2 rounded-lg text-white shadow-md", section.color)}>
          <Icon name={section.iconName} className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{section.label}</h4>
          <p className="text-xs text-muted-foreground truncate">{section.description}</p>
        </div>
        {hasLogo && (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Icon name="Check" className="h-3 w-3 ml-1" />
            مرفوع
          </Badge>
        )}
      </div>

      {/* Preview Area */}
      <div className="p-4">
        <div 
          className={cn(
            "relative rounded-lg flex items-center justify-center transition-all",
            "bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px]",
            "dark:bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)]",
            "border border-slate-200 dark:border-slate-700"
          )}
          style={{ 
            height: Math.max(section.displayHeight + 40, 80),
          }}
        >
          {hasLogo ? (
            <>
              <img 
                src={logoData.src!} 
                alt={section.label} 
                style={{ 
                  maxWidth: section.displayWidth,
                  maxHeight: section.displayHeight,
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain'
                }} 
                className="rounded"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => inputRef.current?.click()}
                  className="gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  تغيير
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => onRemove(section.id)}
                  className="gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  حذف
                </Button>
              </div>
            </>
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-4"
            >
              <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10 transition-colors">
                <Upload className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">اضغط لرفع الشعار</span>
            </button>
          )}
        </div>

        {/* Info Footer */}
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>الحجم الموصى: {section.recommended}</span>
          <span>{section.formats}</span>
        </div>
      </div>

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept="image/png, image/jpeg, image/svg+xml, image/webp, image/x-icon"
        onChange={(e) => { 
          if (e.target.files?.[0]) {
            onFileChange(section.id, e.target.files[0]);
          }
        }}
      />
    </div>
  );
};

export default function CompanyIdentityPage() {
  const { toast } = useToast();
  const context = useSettings();

  if (!context || !context.isHydrated) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const { settings, updateLoginSetting } = context;

  const [companyName, setCompanyName] = useState(settings.login.companyName || '');
  const [logos, setLogos] = useState<LocalLogosState>({
    loginLogo: { src: settings.login.loginLogo },
    headerLogo: { src: settings.login.headerLogo },
    reportsLogo: { src: settings.login.reportsLogo },
    policyLogo: { src: settings.login.policyLogo },
    favicon: { src: settings.login.favicon },
  });

  const handleFileChange = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogos(prev => ({ ...prev, [id]: { src: reader.result as string } }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = (id: string) => {
    setLogos(prev => ({ ...prev, [id]: { src: null } }));
  };

  const handleSaveChanges = () => {
    updateLoginSetting('companyName', companyName);
    updateLoginSetting('loginLogo', logos.loginLogo.src);
    updateLoginSetting('headerLogo', logos.headerLogo.src);
    updateLoginSetting('reportsLogo', logos.reportsLogo.src);
    updateLoginSetting('policyLogo', logos.policyLogo.src);
    updateLoginSetting('favicon', logos.favicon.src);

    toast({
      title: 'تم الحفظ بنجاح!',
      description: 'تم تحديث هوية الشركة والشعارات.',
    });
  };

  const uploadedCount = Object.values(logos).filter(l => l.src).length;

  return (
    <div className="space-y-6">
      <SettingsHeader
        icon="Fingerprint"
        title="هوية الشركة"
        description="إدارة اسم الشركة والشعارات المستخدمة في النظام"
        color="blue"
        backHref="/dashboard/settings/company"
        breadcrumbs={[
          { label: 'إعدادات الشركة', href: '/dashboard/settings/company' }
        ]}
      />

      {/* Stats Bar */}
      <Card className="bg-gradient-to-l from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Icon name="Image" className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="font-medium">حالة الشعارات</span>
                <p className="text-sm text-muted-foreground">
                  {uploadedCount} من {logoSections.length} شعارات مرفوعة
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {logoSections.map(section => (
                <div 
                  key={section.id}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    logos[section.id]?.src 
                      ? `${section.color} text-white shadow-md` 
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                  )}
                  title={section.label}
                >
                  <Icon name={section.iconName} className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Name */}
      <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="border-b bg-blue-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500 text-white shadow-lg">
              <Icon name="Building2" className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>اسم الشركة</CardTitle>
              <CardDescription>الاسم الذي سيظهر في جميع أنحاء النظام</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="max-w-md">
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="أدخل اسم شركتك"
              className="bg-white dark:bg-slate-800 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Logos Section */}
      <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="border-b bg-purple-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500 text-white shadow-lg">
              <Icon name="Images" className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>شعارات النظام</CardTitle>
              <CardDescription>
                ارفع شعارات مختلفة لكل قسم. يُفضل استخدام صور PNG أو SVG بخلفية شفافة.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {logoSections.map((section) => (
              <LogoUploader
                key={section.id}
                section={section}
                logoData={logos[section.id]}
                onFileChange={handleFileChange}
                onRemove={handleRemoveLogo}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="border-b bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-lg">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>معاينة حية</CardTitle>
              <CardDescription>شاهد كيف ستظهر الشعارات في أماكنها الفعلية</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="header" className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="header" className="gap-2">
                <Icon name="LayoutDashboard" className="h-4 w-4" />
                الهيدر
              </TabsTrigger>
              <TabsTrigger value="login" className="gap-2">
                <Icon name="LogIn" className="h-4 w-4" />
                صفحة الدخول
              </TabsTrigger>
              <TabsTrigger value="print" className="gap-2">
                <Icon name="Printer" className="h-4 w-4" />
                الطباعة
              </TabsTrigger>
            </TabsList>

            <TabsContent value="header">
              <div className="rounded-xl border bg-white dark:bg-slate-900 overflow-hidden" dir="rtl">
                <div className="h-14 border-b bg-slate-50 dark:bg-slate-800 flex items-center justify-between px-4">
                  {/* الشعار على اليمين */}
                  <div className="flex items-center gap-3">
                    {logos.headerLogo?.src ? (
                      <img 
                        src={logos.headerLogo.src} 
                        alt="Header Logo" 
                        style={{ maxWidth: 120, maxHeight: 40 }}
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ImageIcon className="h-5 w-5" />
                        <span className="text-sm">شعار الهيدر</span>
                      </div>
                    )}
                  </div>
                  {/* أيقونة المستخدم على اليسار */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
                <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                  محتوى لوحة التحكم
                </div>
              </div>
            </TabsContent>

            <TabsContent value="login">
              <div className="rounded-xl border bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 overflow-hidden" dir="rtl">
                <div className="p-8 flex flex-col items-center gap-4">
                  {logos.loginLogo?.src ? (
                    <img 
                      src={logos.loginLogo.src} 
                      alt="Login Logo" 
                      style={{ maxWidth: 180, maxHeight: 60 }}
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                      <ImageIcon className="h-6 w-6" />
                      <span>شعار صفحة الدخول</span>
                    </div>
                  )}
                  <div className="w-64 space-y-3">
                    <div className="h-10 rounded-lg bg-white dark:bg-slate-800 border" />
                    <div className="h-10 rounded-lg bg-white dark:bg-slate-800 border" />
                    <div className="h-10 rounded-lg bg-primary" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="print">
              <div className="rounded-xl border bg-white p-6 space-y-4" dir="rtl">
                <div className="flex items-start justify-between">
                  {/* الشعار على اليمين */}
                  {logos.reportsLogo?.src ? (
                    <img 
                      src={logos.reportsLogo.src} 
                      alt="Reports Logo" 
                      style={{ maxWidth: 120, maxHeight: 40 }}
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm border-2 border-dashed rounded p-2">
                      <ImageIcon className="h-4 w-4" />
                      <span>شعار التقارير</span>
                    </div>
                  )}
                  {/* معلومات الفاتورة على اليسار */}
                  <div className="text-left text-xs text-muted-foreground">
                    <div>{companyName || 'اسم الشركة'}</div>
                    <div>فاتورة رقم: #12345</div>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-start pt-4">
        <Button size="lg" onClick={handleSaveChanges} className="gap-2">
          <Save className="h-4 w-4" />
          حفظ التغييرات
        </Button>
      </div>
    </div>
  );
}
