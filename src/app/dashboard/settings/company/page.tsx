
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const logoSections = [
  { id: 'admin', label: 'شعار لوحة التحكم' },
  { id: 'merchant', label: 'شعار لوحة التاجر' },
  { id: 'driver', label: 'شعار تطبيق السائق' },
  { id: 'invoice', label: 'شعار الفاتورة' },
  { id: 'barcode', label: 'شعار الباركود' },
  { id: 'favicon', label: 'أيقونة الموقع (Favicon)' },
];

type LogosState = {
  [key: string]: string | null;
};

const LogoUploader = ({ 
  id, 
  label,
  logoSrc,
  onFileChange,
  onRemove,
}: { 
  id: string; 
  label: string;
  logoSrc: string | null;
  onFileChange: (id: string, file: File) => void;
  onRemove: (id: string) => void;
}) => (
  <>
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-4">
        {logoSrc ? (
          <div className="relative h-12 w-12 rounded-md border p-1">
            <Image src={logoSrc} alt={`${label} preview`} layout="fill" objectFit="contain" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 z-10 h-5 w-5 rounded-full"
              onClick={() => onRemove(id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <Label htmlFor={id} className="text-base font-medium">
          {label}
        </Label>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Label htmlFor={id} className="cursor-pointer">
          <Upload className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">رفع</span>
          <Input 
            id={id} 
            type="file" 
            className="sr-only" 
            accept="image/png, image/jpeg, image/svg+xml, image/x-icon"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onFileChange(id, e.target.files[0]);
              }
            }}
          />
        </Label>
      </Button>
    </div>
    <Separator />
  </>
);

export default function CompanyIdentityPage() {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('الوميض');
  const [logos, setLogos] = useState<LogosState>({});

  const handleFileChange = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogos(prev => ({ ...prev, [id]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveLogo = (id: string) => {
    setLogos(prev => ({ ...prev, [id]: null }));
  };

  const handleSaveChanges = async () => {
    // In a real app, you would handle the upload and saving of the company name here.
    toast({
        title: 'تم الحفظ بنجاح!',
        description: 'تم تحديث هوية الشركة بنجاح.',
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
          <div className='flex-1'>
            <h1 className="text-2xl font-bold">هوية الشركة</h1>
            <p className="text-muted-foreground">
                إدارة اسم الشركة والشعارات المستخدمة في النظام.
            </p>
          </div>
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/settings/general">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        </div>

      <Card>
        <CardHeader>
            <CardTitle>اسم الشركة والشعارات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-base">
              اسم الشركة
            </Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="أدخل اسم شركتك"
            />
          </div>
          <Card className="overflow-hidden border">
            <div className="divide-y">
              {logoSections.map((section) => (
                <LogoUploader 
                  key={section.id} 
                  id={section.id}
                  label={section.label}
                  logoSrc={logos[section.id] || null}
                  onFileChange={handleFileChange}
                  onRemove={handleRemoveLogo}
                />
              ))}
            </div>
          </Card>
        </CardContent>
      </Card>
      
      <div className="flex justify-start">
         <Button size="lg" onClick={handleSaveChanges}>حفظ كل التغييرات</Button>
      </div>

    </div>
  );
}
