
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Separator } from '@/components/ui/separator';


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
  if (!hslStr) return [0,0,0];
  const [h, s, l] = hslStr.match(/\d+/g)?.map(Number) || [0, 0, 0];
  return [h, s, l];
};


export default function FontsColorsPage() {
  const { toast } = useToast();
  
  // Default colors are from the initial CSS file
  const [primaryColor, setPrimaryColor] = useState('#29ABE2');
  const [backgroundColor, setBackgroundColor] = useState('#E5F5FB');
  const [accentColor, setAccentColor] = useState('#F2994A');

  const [fontFamily, setFontFamily] = useState('Tajawal');
  const [baseFontSize, setBaseFontSize] = useState(14);
  const [isSaving, setIsSaving] = useState(false);

  const previewStyle = useMemo(() => ({
    '--preview-primary': primaryColor,
    '--preview-background': backgroundColor,
    '--preview-accent': accentColor,
    '--preview-font-family': `${fontFamily.replace(/_/g, ' ')}, sans-serif`,
    '--preview-font-size': `${baseFontSize}px`,
  } as React.CSSProperties), [primaryColor, backgroundColor, accentColor, fontFamily, baseFontSize]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const formData = new FormData();
    
    formData.append('primary', primaryColor);
    formData.append('background', backgroundColor);
    formData.append('accent', accentColor);
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
    <div className="mx-auto max-w-4xl space-y-6">
       <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl flex items-center gap-2"><Palette /> الألوان والخطوط</CardTitle>
                    <CardDescription>
                        اختر الألوان الأساسية والخط لتخصيص شكل النظام بالكامل.
                    </CardDescription>
                </div>
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/settings/general">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
            </CardHeader>
        </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. اختر الألوان</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">اللون الأساسي (Primary)</Label>
                <div className="relative">
                  <Input id="primaryColor" type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full pl-12" dir="ltr"/>
                  <Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="absolute left-1 top-1/2 h-8 w-10 -translate-y-1/2 cursor-pointer p-1"/>
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="backgroundColor">لون الخلفية (Background)</Label>
                <div className="relative">
                  <Input id="backgroundColor" type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-full pl-12" dir="ltr"/>
                  <Input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="absolute left-1 top-1/2 h-8 w-10 -translate-y-1/2 cursor-pointer p-1"/>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accentColor">اللون المميز (Accent)</Label>
                <div className="relative">
                  <Input id="accentColor" type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-full pl-12" dir="ltr"/>
                  <Input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="absolute left-1 top-1/2 h-8 w-10 -translate-y-1/2 cursor-pointer p-1"/>
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
                    <SelectItem value="Cairo">Cairo</SelectItem>
                    <SelectItem value="Tajawal">Tajawal</SelectItem>
                    <SelectItem value="Almarai">Almarai</SelectItem>
                    <SelectItem value="Lalezar">Lalezar</SelectItem>
                    <SelectItem value="Markazi_Text">Markazi Text</SelectItem>
                    <SelectItem value="Changa">Changa</SelectItem>
                    <SelectItem value="Lemonada">Lemonada</SelectItem>
                    <SelectItem value="El_Messiri">El Messiri</SelectItem>
                    <SelectItem value="Scheherazade_New">Scheherazade New</SelectItem>
                    <SelectItem value="Mada">Mada</SelectItem>
                    <SelectItem value="Reem_Kufi">Reem Kufi</SelectItem>
                    <SelectItem value="IBM_Plex_Sans_Arabic">IBM Plex Sans Arabic</SelectItem>
                    <SelectItem value="Noto_Sans_Arabic">Noto Sans Arabic</SelectItem>
                    <SelectItem value="Noto_Kufi_Arabic">Noto Kufi Arabic</SelectItem>
                    <SelectItem value="Amiri">Amiri</SelectItem>
                    <SelectItem value="Lateef">Lateef</SelectItem>
                    <SelectItem value="Kufam">Kufam</SelectItem>
                    <SelectItem value="Harmattan">Harmattan</SelectItem>
                    <SelectItem value="Aref_Ruqaa">Aref Ruqaa</SelectItem>
                    <SelectItem value="Vazirmatn">Vazirmatn</SelectItem>
                    {/* Non-arabic */}
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="PT_Sans">PT Sans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseFontSize">حجم الخط الأساسي (px)</Label>
                <Input id="baseFontSize" type="number" value={baseFontSize} onChange={(e) => setBaseFontSize(Number(e.target.value))}/>
                <p className="text-xs text-muted-foreground">سيتم حساب باقي الأحجام تلقائيا.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle>معاينة حية</CardTitle>
          </CardHeader>
          <CardContent 
            style={previewStyle} 
            className="space-y-6 rounded-lg border bg-[var(--preview-background)] p-6 font-[var(--preview-font-family)] text-[var(--preview-font-size)] text-[var(--preview-foreground-color)] transition-colors duration-300"
          >
            <div 
              className="p-6 rounded-lg transition-colors duration-300" 
              style={{ backgroundColor: 'var(--preview-background)', color: 'var(--preview-foreground-color)' }}
            >
              <h4 className="text-xl font-bold" style={{ color: 'var(--preview-primary)', fontSize: `${baseFontSize * 1.5}px` }}>هذا عنوان رئيسي H4</h4>
              <p className="mt-2">
                هذا مثال للنص الأساسي. يمكنك <a href="#" style={{ color: 'var(--preview-primary)' }} className="underline">النقر على هذا الرابط</a> لتجربة الروابط. يتم توليد جميع الألوان، بما في ذلك ألوان الحالات، تلقائيًا من اللون الأساسي الذي تختاره.
              </p>

              <Separator className="my-4" style={{backgroundColor: 'var(--preview-primary)' , opacity: 0.2}}/>

              <div className="flex gap-4 items-center">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--preview-accent)'}}>
                    <p className="font-bold" style={{color: '#fff'}}>بطاقة مميزة</p>
                </div>
                 <div className="flex gap-2">
                    <Button style={{ backgroundColor: 'var(--preview-primary)', color: '#fff' }}>زر أساسي</Button>
                    <Button variant="outline" style={{ borderColor: 'var(--preview-primary)', color: 'var(--preview-primary)' }}>زر ثانوي</Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
                <Alert variant="default" className="bg-green-100 border-green-200 text-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle>هذه رسالة نجاح.</AlertTitle>
                </Alert>
                 <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>هذه رسالة خطأ.</AlertTitle>
                </Alert>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-start mt-6">
        <Button size="lg" onClick={handleSaveChanges} disabled={isSaving}>
           {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? 'جاري الحفظ...' : 'حفظ كل التغييرات'}
        </Button>
      </div>
    </div>
  );
}

    