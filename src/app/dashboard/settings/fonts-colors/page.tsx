
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Info, Palette, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
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

export default function FontsColorsPage() {
  const { toast } = useToast();
  
  const [primaryColor, setPrimaryColor] = useState('#ff9f00'); // Orange from image
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#ff9f00'); 

  const [fontFamily, setFontFamily] = useState('Tajawal');
  const [baseFontSize, setBaseFontSize] = useState(14);
  const [isSaving, setIsSaving] = useState(false);

  const previewStyle = useMemo(() => ({
    '--preview-primary': primaryColor,
    '--preview-background': backgroundColor,
    '--preview-accent': accentColor,
    '--preview-font-size': `${baseFontSize}px`,
  } as React.CSSProperties), [primaryColor, backgroundColor, accentColor, baseFontSize]);
  
  const fontVarName = `var(--font-${fontFamily.toLowerCase().replace(/ /g, '-')})`;


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
    <div className="mx-auto max-w-5xl space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column for settings */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. اختر اللون الأساسي</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">اللون الأساسي</Label>
                 <div className="relative">
                  <Input id="primaryColor" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full h-12 p-1 cursor-pointer"/>
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

        {/* Right Column for preview */}
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle>معاينة حية</CardTitle>
          </CardHeader>
          <CardContent 
            style={{ ...previewStyle, fontFamily: fontVarName }} 
            className="space-y-6 rounded-lg bg-[var(--preview-background)] text-[var(--preview-font-size)] text-gray-800 transition-colors duration-300"
          >
            <h4 className="text-xl font-bold" style={{ color: 'var(--preview-primary)', fontSize: `${baseFontSize * 1.5}px` }}>هذا عنوان رئيسي H4</h4>
            <h6 className="text-lg" style={{ fontSize: `${baseFontSize * 1.1}px` }}>وهذا عنوان فرعي H6</h6>
            <p className="leading-relaxed">
              هذا مثال للنص الأساسي. يمكنك <a href="#" style={{ color: 'var(--preview-primary)' }} className="underline">النقر على هذا الرابط</a> لتجربة الروابط. يتم توليد جميع الألوان، بما في ذلك ألوان الحالات، تلقائيًا من اللون الأساسي الذي تختاره.
            </p>
            
            <div className="space-y-3">
                <Alert variant="default" className="bg-green-600 border-green-700 text-white">
                    <CheckCircle className="h-5 w-5 text-white" />
                    <AlertTitle>هذه رسالة نجاح.</AlertTitle>
                </Alert>
                <Alert variant="destructive" className="bg-red-600 border-red-700 text-white">
                    <XCircle className="h-5 w-5 text-white" />
                    <AlertTitle>هذه رسالة خطأ.</AlertTitle>
                </Alert>
                <Alert variant="default" className="bg-yellow-500 border-yellow-600 text-white">
                    <AlertTriangle className="h-5 w-5 text-white" />
                    <AlertTitle>هذه رسالة تحذير.</AlertTitle>
                </Alert>
                 <Alert variant="default" className="bg-blue-500 border-blue-600 text-white">
                    <Info className="h-5 w-5 text-white" />
                    <AlertTitle>هذه رسالة معلومات.</AlertTitle>
                </Alert>
            </div>

             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>مثال لبطاقة</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>هذا محتوى البطاقة.</p>
                     <div className="flex gap-2 mt-4">
                        <Button style={{ backgroundColor: 'var(--preview-primary)', color: '#fff' }}>زر أساسي</Button>
                        <Button variant="outline" style={{ borderColor: 'var(--preview-primary)', color: 'var(--preview-primary)' }}>زر ثانوي</Button>
                    </div>
                </CardContent>
            </Card>

          </CardContent>
        </Card>
      </div>

      <div className="flex justify-start mt-6">
        <Button size="lg" onClick={handleSaveChanges} disabled={isSaving} style={{backgroundColor: primaryColor, color: '#fff'}}>
           {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </div>
  );
}
