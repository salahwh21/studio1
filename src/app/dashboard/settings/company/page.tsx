'use client';

import { useState } from 'react';
import {
  Upload, X, Building, Smartphone, FileText, Barcode, Image as ImageIcon, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { SettingsLayout } from '@/components/settings-layout';

const logoSections = [
  { id: 'admin', label: 'شعار لوحة التحكم', icon: <Building className="h-6 w-6 text-blue-500"/> },
  { id: 'merchant', label: 'شعار لوحة التاجر', icon: <Smartphone className="h-6 w-6 text-green-500"/> },
  { id: 'driver', label: 'شعار تطبيق السائق', icon: <Smartphone className="h-6 w-6 text-purple-500"/> },
  { id: 'invoice', label: 'شعار الفاتورة', icon: <FileText className="h-6 w-6 text-yellow-500"/> },
  { id: 'barcode', label: 'شعار الباركود', icon: <Barcode className="h-6 w-6 text-orange-500"/> },
  { id: 'multi', label: 'شعار متعدد الاستخدامات', icon: <ImageIcon className="h-6 w-6 text-red-500"/> },
  { id: 'favicon', label: 'أيقونة الموقع (Favicon)', icon: <ImageIcon className="h-6 w-6 text-gray-500"/> },
];

type LogosState = {
  [key: string]: { src: string | null; bgColor?: string };
};

const LogoUploader = ({ id, label, icon, logoData, onFileChange, onRemove }: {
  id: string;
  label: string;
  icon: React.ReactNode;
  logoData: { src: string | null; bgColor?: string };
  onFileChange: (id: string, file: File) => void;
  onRemove: (id: string) => void;
}) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center gap-4">
      {icon}
      <CardTitle className="text-base">{label}</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col items-center gap-4 text-center">
      <div className="relative h-28 w-full rounded-md border p-2 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50" style={{ backgroundColor: logoData.bgColor }}>
        {logoData.src ? (
          <Image src={logoData.src} alt={label} fill style={{ objectFit: 'contain' }} className="rounded-md p-1"/>
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground"/>
        )}
      </div>
      <div className="flex w-full gap-2">
        {logoData.src && (
          <Button variant="destructive" size="sm" onClick={() => onRemove(id)} className="w-full">
            <X className="h-4 w-4"/>
          </Button>
        )}
        <Button variant="outline" size="sm" asChild className="w-full">
          <Label htmlFor={id} className="cursor-pointer flex items-center gap-1">
            <Upload className="h-4 w-4"/> {logoData.src ? 'تغيير' : 'رفع'}
            <Input
              id={id}
              type="file"
              className="sr-only"
              accept="image/png, image/jpeg, image/svg+xml, image/x-icon"
              onChange={(e) => { if(e.target.files?.[0]) onFileChange(id, e.target.files[0]); }}
            />
          </Label>
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default function CompanyIdentityPage() {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('الوميض');
  const [logos, setLogos] = useState<LogosState>({
    admin: { src: '/placeholder.svg' },
    merchant: { src: null },
    driver: { src: null },
    invoice: { src: null },
    barcode: { src: null },
    multi: { src: null, bgColor: '#ffffff' },
    favicon: { src: null },
  });

  const handleFileChange = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogos(prev => ({ ...prev, [id]: { ...prev[id], src: reader.result as string } }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = (id: string) => {
    setLogos(prev => ({ ...prev, [id]: { ...prev[id], src: null } }));
  };

  const handleSaveChanges = () => {
    toast({
      title: 'تم الحفظ بنجاح!',
      description: 'تم تحديث هوية الشركة والشعارات.',
    });
    // إضافة أي مناداة API لحفظ البيانات على السيرفر
  };

  return (
    <SettingsLayout
      title="هوية الشركة"
      description="إدارة اسم الشركة والشعارات المختلفة المستخدمة في النظام."
      backHref="/dashboard/settings/general"
    >
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>اسم الشركة</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="أدخل اسم شركتك"
            />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>شعارات النظام</CardTitle>
                <CardDescription>
                    قم برفع الشعارات لكل قسم من أقسام النظام. سيتم استخدام الشعار الافتراضي في حال لم يتم رفع شعار مخصص.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {logoSections.map((section) => (
                    <LogoUploader
                    key={section.id}
                    id={section.id}
                    label={section.label}
                    icon={section.icon}
                    logoData={logos[section.id]}
                    onFileChange={handleFileChange}
                    onRemove={handleRemoveLogo}
                    />
                ))}
            </CardContent>
        </Card>
        

        <div className="flex justify-start pt-6 mt-6 border-t">
          <Button size="lg" onClick={handleSaveChanges}>
            <Save className="ml-2 h-4 w-4" /> حفظ كل التغييرات
          </Button>
        </div>
      </div>
    </SettingsLayout>
  );
}
