
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

// Helper function to convert HSL string (from CSS) to HEX
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
};

const parseHslString = (hslStr: string): [number, number, number] => {
  const [h, s, l] = hslStr.match(/\d+/g)?.map(Number) || [0, 0, 0];
  return [h, s, l];
};


export default function FontsColorsPage() {
  const { toast } = useToast();
  // Default colors are from the initial CSS file
  const [primaryColor, setPrimaryColor] = useState(hslToHex(...parseHslString('197 71% 52%')));
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
    
    formData.append('primary', primaryColor);
    formData.append('fontFamily', fontFamily);
    formData.append('fontSize', baseFontSize.toString());
    
    // We pass empty strings for unused values to satisfy the action schema
    formData.append('background', ''); 
    formData.append('accent', '');

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
                  className="w-full pl-12"
                  dir="ltr"
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
                  <SelectItem value="PT_Sans">PT Sans</SelectItem>
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
          <Button size="lg" onClick={handleSaveChanges} disabled={isSaving}>
             {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </div>
    </div>
  );
}
