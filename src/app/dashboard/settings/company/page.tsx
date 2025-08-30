
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Building, Save, Image as ImageIcon } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';

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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut"
    }
  })
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
  <div className="flex items-center justify-between gap-4 p-4">
    <div className="flex items-center gap-4">
      {logoSrc ? (
        <div className="relative h-12 w-12 rounded-md border p-1 bg-white">
          <Image src={logoSrc} alt={`${label} preview`} layout="fill" objectFit="contain" />
        </div>
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <Label htmlFor={id} className="font-medium">
        {label}
      </Label>
    </div>
    <div className="flex items-center gap-2">
        {logoSrc && (
             <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => onRemove(id)}
            >
              <X className="h-4 w-4 text-destructive" />
            </Button>
        )}
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
  </div>
);

export default function CompanyIdentityPage() {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('الوميض');
  const [logos, setLogos] = useState<LogosState>({ admin: '/placeholder.svg' });

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
    toast({
        title: 'تم الحفظ بنجاح!',
        description: 'تم تحديث هوية الشركة بنجاح.',
    });
  };

  return (
    <motion.div 
      className="space-y-8 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
          <div className='flex items-center gap-4'>
            <Building className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">هوية الشركة</h1>
              <p className="text-muted-foreground">
                  إدارة اسم الشركة والشعارات المستخدمة في النظام.
              </p>
            </div>
          </div>
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/settings/general">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
      </div>

      <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={0}>
        <Card>
          <CardHeader>
              <CardTitle>اسم الشركة</CardTitle>
              <CardDescription>الاسم الذي سيظهر في جميع أنحاء النظام.</CardDescription>
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
      </motion.div>
      
      <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={1}>
          <Card>
            <CardHeader>
                <CardTitle>الشعارات</CardTitle>
                <CardDescription>
                  ارفع الشعارات المختلفة التي ستظهر في أنحاء النظام.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
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
            </CardContent>
          </Card>
      </motion.div>
      
      <div className="flex justify-start pt-4 border-t">
         <Button size="lg" onClick={handleSaveChanges}>
            <Save className="ml-2 h-4 w-4" />
            حفظ كل التغييرات
         </Button>
      </div>
    </motion.div>
  );
}
