
'use client';

import { useState, useMemo } from 'react';
import { CheckCircle, Info, Palette, XCircle, AlertTriangle, Loader2, Save, ArrowLeft, Type, Droplets, CreditCard, AlertCircle, BorderSplit } from 'lucide-react';
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
import Link from 'next/link';


const fonts = [
    { name: 'Tajawal', variable: 'var(--font-tajawal)'},
    { name: 'Inter', variable: 'var(--font-inter)'},
    { name: 'Cairo', variable: 'var(--font-cairo)'},
    { name: 'IBM Plex Sans Arabic', variable: 'var(--font-ibm-plex-sans-arabic)'},
];

export default function FontsColorsPage() {
  const { toast } = useToast();
  
  // Main Colors
  const [primaryColor, setPrimaryColor] = useState('#2563EB');
  const [backgroundColor, setBackgroundColor] = useState('#F0F9FF');
  const [accentColor, setAccentColor] = useState('#F97316'); 

  // Text Colors
  const [foregroundColor, setForegroundColor] = useState('#020817');
  const [primaryForegroundColor, setPrimaryForegroundColor] = useState('#FFFFFF');

  // Component Colors
  const [cardColor, setCardColor] = useState('#FFFFFF');
  const [cardForegroundColor, setCardForegroundColor] = useState('#020817');
  const [destructiveColor, setDestructiveColor] = useState('#EF4444');
  const [borderColor, setBorderColor] = useState('#E2E8F0');
  
  // Font settings
  const [fontFamily, setFontFamily] = useState('Tajawal');
  const [baseFontSize, setBaseFontSize] = useState(14);
  const [isSaving, setIsSaving] = useState(false);

  const previewStyle = useMemo(() => ({
    '--preview-primary': primaryColor,
    '--preview-primary-foreground': primaryForegroundColor,
    '--preview-background': backgroundColor,
    '--preview-foreground': foregroundColor,
    '--preview-accent': accentColor,
    '--preview-card': cardColor,
    '--preview-card-foreground': cardForegroundColor,
    '--preview-destructive': destructiveColor,
    '--preview-border': borderColor,
    '--preview-font-size': `${baseFontSize}px`,
    fontFamily: fonts.find(f => f.name === fontFamily)?.variable || 'sans-serif',
  } as React.CSSProperties), [
      primaryColor, primaryForegroundColor, backgroundColor, foregroundColor, accentColor, 
      cardColor, cardForegroundColor, destructiveColor, borderColor, 
      baseFontSize, fontFamily
  ]);
  

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const formData = new FormData();
    
    // Append all colors
    formData.append('primary', primaryColor);
    formData.append('background', backgroundColor);
    formData.append('accent', accentColor);
    formData.append('foreground', foregroundColor);
    formData.append('primaryForeground', primaryForegroundColor);
    formData.append('card', cardColor);
    formData.append('cardForeground', cardForegroundColor);
    formData.append('destructive', destructiveColor);
    formData.append('border', borderColor);

    // Append font settings
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
  
  const ColorInput = ({ id, label, value, onChange }: { id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className='relative'>
        <Input id={id} type="color" value={value} onChange={onChange} className="w-full h-10 p-1 cursor-pointer"/>
        <span className='absolute left-12 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono'>{value}</span>
      </div>
    </div>
  );


  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">الألوان والخطوط</CardTitle>
            <CardDescription className="mt-1">اختر اللون الأساسي والخط لتخصيص شكل النظام.</CardDescription>
          </div>
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/settings/general">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
      </Card>
      
      <main>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Droplets className="h-5 w-5"/> الألوان الرئيسية</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ColorInput id="primaryColor" label="الأساسي" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                    <ColorInput id="backgroundColor" label="الخلفية" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
                    <ColorInput id="accentColor" label="الثانوي" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5"/> ألوان النصوص</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ColorInput id="foregroundColor" label="النص الأساسي" value={foregroundColor} onChange={(e) => setForegroundColor(e.target.value)} />
                    <ColorInput id="primaryForegroundColor" label="النص على الأزرار" value={primaryForegroundColor} onChange={(e) => setPrimaryForegroundColor(e.target.value)} />
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5"/> ألوان المكونات</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ColorInput id="cardColor" label="خلفية البطاقة" value={cardColor} onChange={(e) => setCardColor(e.target.value)} />
                    <ColorInput id="cardForegroundColor" label="نص البطاقة" value={cardForegroundColor} onChange={(e) => setCardForegroundColor(e.target.value)} />
                    <ColorInput id="destructiveColor" label="لون الحذف/الخطأ" value={destructiveColor} onChange={(e) => setDestructiveColor(e.target.value)} />
                    <ColorInput id="borderColor" label="لون الحواف" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} />
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5"/> الخطوط والأحجام</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fontFamily">الخط</Label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger id="fontFamily">
                          <SelectValue placeholder="اختر خطًا" />
                        </SelectTrigger>
                        <SelectContent>
                          {fonts.map(font => (
                             <SelectItem key={font.name} value={font.name} style={{fontFamily: font.variable}}>{font.name}</SelectItem>
                          ))}
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

          <div className="lg:col-span-3 lg:sticky lg:top-24">
            <Card>
              <CardHeader>
                <CardTitle>معاينة حية</CardTitle>
              </CardHeader>
              <CardContent 
                style={previewStyle} 
                className="space-y-6 rounded-lg text-[var(--preview-font-size)] transition-all duration-300 p-6 border"
              >
                 <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--preview-background)'}}>
                    <h4 className="font-bold" style={{ color: 'var(--preview-primary)', fontSize: `${baseFontSize * 1.5}px` }}>هذا عنوان رئيسي H4</h4>
                    <p className="leading-relaxed mt-2" style={{ color: 'var(--preview-foreground)'}}>
                      هذا مثال للنص الأساسي. يمكنك <a href="#" style={{ color: 'var(--preview-primary)' }} className="underline">النقر على هذا الرابط</a> لتجربة الروابط.
                    </p>
                    
                    <Card className="shadow-lg mt-4" style={{ backgroundColor: 'var(--preview-card)', borderColor: 'var(--preview-border)'}}>
                        <CardHeader>
                            <CardTitle style={{fontSize: `${baseFontSize * 1.25}px`, color: 'var(--preview-card-foreground)'}}>مثال لبطاقة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p style={{color: 'var(--preview-card-foreground)'}}>هذا محتوى البطاقة.</p>
                            <div className="flex gap-2 mt-4">
                                <Button style={{ backgroundColor: 'var(--preview-primary)', color: 'var(--preview-primary-foreground)', fontSize: `${baseFontSize}px`, borderColor: 'transparent' }}>زر أساسي</Button>
                                <Button variant="outline" style={{ borderColor: 'var(--preview-primary)', color: 'var(--preview-primary)', fontSize: `${baseFontSize}px` }}>زر ثانوي</Button>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <div className="space-y-3 text-sm mt-4">
                        <Alert variant="destructive" className="border-l-4" style={{ backgroundColor: `${destructiveColor}1A`, borderColor: 'var(--preview-destructive)', color: 'var(--preview-destructive)' }}>
                            <XCircle className="h-5 w-5" style={{color: 'var(--preview-destructive)'}}/>
                            <AlertTitle>هذه رسالة خطأ.</AlertTitle>
                        </Alert>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex justify-start pt-6 mt-6 border-t">
          <Button size="lg" onClick={handleSaveChanges} disabled={isSaving}>
             {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </main>
    </div>
  );
}
