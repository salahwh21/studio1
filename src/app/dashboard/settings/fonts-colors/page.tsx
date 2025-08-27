
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Info, Palette, Type, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { updateThemeAction } from '@/app/actions/update-theme';

// Helper function to convert HEX to HSL string
const hexToHsl = (hex: string): string => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};


export default function FontsColorsPage() {
  const { toast } = useToast();
  const [primaryColor, setPrimaryColor] = useState('#29ABE2');
  const [fontFamily, setFontFamily] = useState('Tajawal');
  const [baseFontSize, setBaseFontSize] = useState(14);
  const [isSaving, setIsSaving] = useState(false);

  const previewStyle = useMemo(() => ({
    '--preview-primary': primaryColor,
    '--preview-font-family': `${fontFamily}, sans-serif`,
    '--preview-font-size': `${baseFontSize}px`,
  } as React.CSSProperties), [primaryColor, fontFamily, baseFontSize]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const formData = new FormData();
    // Pass accent and background as null to not update them from this page
    formData.append('primary', hexToHsl(primaryColor));
    formData.append('accent', ''); 
    formData.append('background', '');
    formData.append('fontFamily', fontFamily);
    formData.append('fontSize', baseFontSize.toString());
    
    try {
      const result = await updateThemeAction(formData);

      if (result.success) {
        toast({
          title: 'تم الحفظ بنجاح!',
          description: 'تم تحديث الألوان والخطوط. قد تحتاج لإعادة تحميل الصفحة لرؤية التغييرات.',
        });
      } else {
        throw new Error(typeof result.error === 'string' ? result.error : 'An unknown error occurred');
      }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'فشل الحفظ',
            description: error.message || 'فشل تحديث ملفات الثيم.',
        });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
       <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl flex items-center gap-2"><Palette /> الألوان والخطوط</CardTitle>
                    <CardDescription>
                        اختر اللون الأساسي والخط لتخصيص شكل النظام.
                    </CardDescription>
                </div>
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/settings/general">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
            </CardHeader>
        </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. اختر اللون الأساسي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">اللون الأساسي</Label>
              <div className="relative">
                <Input
                  id="primaryColor"
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full pr-12"
                />
                <Input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="absolute left-1 top-1/2 h-8 w-10 -translate-y-1/2 cursor-pointer p-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. اختر الخط</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fontFamily">الخط</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger id="fontFamily">
                  <SelectValue placeholder="اختر خطًا" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Cairo">Cairo</SelectItem>
                  <SelectItem value="Tajawal">Tajawal</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="PT Sans">PT Sans</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseFontSize">حجم الخط الأساسي (px)</Label>
              <Input
                id="baseFontSize"
                type="number"
                value={baseFontSize}
                onChange={(e) => setBaseFontSize(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">سيتم حساب باقي الأحجام تلقائيا.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معاينة حية</CardTitle>
          </CardHeader>
          <CardContent style={previewStyle} className="space-y-6 font-[var(--preview-font-family)] text-[var(--preview-font-size)]">
            <div>
              <h4 className="text-xl font-bold" style={{ color: 'var(--preview-primary)', fontSize: `${baseFontSize * 1.5}px` }}>هذا عنوان رئيسي H4</h4>
              <h6 className="text-lg font-semibold" style={{ fontSize: `${baseFontSize * 1.25}px` }}>وهذا عنوان فرعي H6</h6>
              <p className="mt-2">
                هذا مثال للنص الأساسي. يمكنك <a href="#" style={{ color: 'var(--preview-primary)' }} className="underline">النقر على هذا الرابط</a> لتجربة الروابط. يتم توليد جميع الألوان، بما في ذلك ألوان الحالات، تلقائيًا من اللون الأساسي الذي تختاره.
              </p>
            </div>

            <Card className="p-4">
                <CardContent className="p-0">
                    <p className="mb-4">هذا محتوى البطاقة.</p>
                    <div className="flex gap-2">
                         <Button style={{ backgroundColor: 'var(--preview-primary)', color: '#fff' }}>زر أساسي</Button>
                         <Button variant="outline" style={{ borderColor: 'var(--preview-primary)', color: 'var(--preview-primary)' }}>زر ثانوي</Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-2">
                <Alert variant="default" className="bg-green-100 border-green-200 text-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle>هذه رسالة نجاح.</AlertTitle>
                </Alert>
                 <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>هذه رسالة خطأ.</AlertTitle>
                </Alert>
                 <Alert variant="default" className="bg-yellow-100 border-yellow-200 text-yellow-800">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle>هذه رسالة تحذير.</AlertTitle>
                </Alert>
                 <Alert variant="default" className="bg-blue-100 border-blue-200 text-blue-800">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle>هذه رسالة معلومات.</AlertTitle>
                </Alert>
            </div>

          </CardContent>
        </Card>

        <div className="flex justify-start">
          <Button size="lg" onClick={handleSaveChanges} disabled={isSaving} style={{ backgroundColor: 'var(--preview-primary)', color: '#fff' }}>
             {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </div>
    </div>
  );
}
