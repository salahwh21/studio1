
'use client';

import Link from 'next/link';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const logoSections = [
  { id: 'admin', label: 'شعار admin' },
  { id: 'merchant', label: 'شعار merchant' },
  { id: 'driver', label: 'شعار driver' },
  { id: 'invoice', label: 'شعار invoice' },
  { id: 'barcode', label: 'شعار barcode' },
  { id: 'favicon', label: 'شعار favicon' },
];

const LogoUploader = ({ id, label }: { id: string; label: string }) => (
  <>
    <div className="flex items-center justify-between gap-4 p-4">
      <Label htmlFor={id} className="text-base font-medium">
        {label}
      </Label>
      <Button variant="outline" size="icon" asChild>
        <Label htmlFor={id} className="cursor-pointer">
          <Upload className="h-5 w-5" />
          <Input id={id} type="file" className="sr-only" />
        </Label>
      </Button>
    </div>
    <Separator />
  </>
);

export default function CompanyIdentityPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">هوية الشركة والشعارات</CardTitle>
            <CardDescription>
              إدارة اسم الشركة والشعارات المستخدمة في مختلف أجزاء النظام.
            </CardDescription>
          </div>
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/settings/general">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-base">
              اسم الشركة
            </Label>
            <Input
              id="companyName"
              defaultValue="الوميض"
              placeholder="أدخل اسم شركتك"
            />
          </div>
          <Card className="overflow-hidden border">
            <div className="divide-y">
              {logoSections.map((section, index) => (
                <LogoUploader key={section.id} {...section} />
              ))}
            </div>
          </Card>
        </CardContent>
        <CardFooter>
          <Button size="lg">حفظ التغييرات</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
