
'use client';

import { useState, useMemo } from 'react';
import { Palette, XCircle, Loader2, Save, ArrowLeft, Type, Droplets, CreditCard, AlertCircle, BorderSplit, Columns2, Brush, BarChart, Text, Component, Link as LinkIcon, Eye, Sun, Moon } from 'lucide-react';
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
  
  // States
  const [primary, setPrimary] = useState('#29ABE2');
  const [primaryForeground, setPrimaryForeground] = useState('#FFFFFF');
  const [background, setBackground] = useState('#F8FAFC');
  const [foreground, setForeground] = useState('#020817');
  const [mutedForeground, setMutedForeground] = useState('#64748B');
  const [accent, setAccent] = useState('#F2994A');
  const [card, setCard] = useState('#FFFFFF');
  const [cardForeground, setCardForeground] = useState('#020817');
  const [popover, setPopover] = useState('#FFFFFF');
  const [popoverForeground, setPopoverForeground] = useState('#020817');
  const [secondary, setSecondary] = useState('#F1F5F9');
  const [secondaryForeground, setSecondaryForeground] = useState('#0F172A');
  const [destructive, setDestructive] = useState('#EF4444');
  const [border, setBorder] = useState('#E2E8F0');
  const [input, setInput] = useState('#E2E8F0');
  const [ring, setRing] = useState('#38BDF8');
  const [chart1, setChart1] = useState('#3B82F6');
  const [chart2, setChart2] = useState('#10B981');
  const [chart3, setChart3] = useState('#F59E0B');
  const [chart4, setChart4] = useState('#8B5CF6');
  const [chart5, setChart5] = useState('#EC4899');
  
  // Sidebar states
  const [sidebarBackground, setSidebarBackground] = useState('#0F172A');
  const [sidebarForeground, setSidebarForeground] = useState('#E2E8F0');
  const [sidebarAccent, setSidebarAccent] = useState('#29ABE2');
  const [sidebarAccentForeground, setSidebarAccentForeground] = useState('#FFFFFF');
  const [sidebarBorder, setSidebarBorder] = useState('#1E293B');

  const [fontFamily, setFontFamily] = useState('Tajawal');
  const [baseFontSize, setBaseFontSize] = useState(14);
  const [isSaving, setIsSaving] = useState(false);

  const previewStyle = useMemo(() => ({
    '--preview-primary': primary,
    '--preview-primary-foreground': primaryForeground,
    '--preview-background': background,
    '--preview-foreground': foreground,
    '--preview-accent': accent,
    '--preview-card': card,
    '--preview-card-foreground': cardForeground,
    '--preview-destructive': destructive,
    '--preview-border': border,
    '--preview-font-size': `${baseFontSize}px`,
    fontFamily: fonts.find(f => f.name === fontFamily)?.variable || 'sans-serif',
  } as React.CSSProperties), [
      primary, primaryForeground, background, foreground, accent, 
      card, cardForeground, destructive, border, 
      baseFontSize, fontFamily
  ]);
  

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const formData = new FormData();
    
    // Append all colors
    formData.append('primary', primary);
    formData.append('primaryForeground', primaryForeground);
    formData.append('background', background);
    formData.append('foreground', foreground);
    formData.append('mutedForeground', mutedForeground);
    formData.append('accent', accent);
    formData.append('card', card);
    formData.append('cardForeground', cardForeground);
    formData.append('popover', popover);
    formData.append('popoverForeground', popoverForeground);
    formData.append('secondary', secondary);
    formData.append('secondaryForeground', secondaryForeground);
    formData.append('destructive', destructive);
    formData.append('border', border);
    formData.append('input', input);
    formData.append('ring', ring);
    formData.append('chart1', chart1);
    formData.append('chart2', chart2);
    formData.append('chart3', chart3);
    formData.append('chart4', chart4);
    formData.append('chart5', chart5);
    formData.append('sidebarBackground', sidebarBackground);
    formData.append('sidebarForeground', sidebarForeground);
    formData.append('sidebarAccent', sidebarAccent);
    formData.append('sidebarAccentForeground', sidebarAccentForeground);
    formData.append('sidebarBorder', sidebarBorder);
    
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
      <Label htmlFor={id} className='text-xs'>{label}</Label>
      <div className='relative'>
        <Input id={id} type="color" value={value} onChange={onChange} className="w-full h-10 p-1 cursor-pointer"/>
        <span className='absolute left-12 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono select-all'>{value}</span>
      </div>
    </div>
  );


  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2"><Brush /> تخصيص المظهر</CardTitle>
            <CardDescription className="mt-1">تحكم في كل تفاصيل ألوان وخطوط النظام لتناسب هويتك بشكل كامل.</CardDescription>
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
          <div className="lg:col-span-3 space-y-6">
              <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Droplets /> الهوية الرئيسية</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <ColorInput id="primary" label="الأساسي" value={primary} onChange={(e) => setPrimary(e.target.value)} />
                    <ColorInput id="primaryForeground" label="نص الأساسي" value={primaryForeground} onChange={(e) => setPrimaryForeground(e.target.value)} />
                    <ColorInput id="background" label="خلفية عامة" value={background} onChange={(e) => setBackground(e.target.value)} />
                    <ColorInput id="accent" label="التمييز (Accent)" value={accent} onChange={(e) => setAccent(e.target.value)} />
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Text /> ألوان النصوص</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <ColorInput id="foreground" label="النص الأساسي" value={foreground} onChange={(e) => setForeground(e.target.value)} />
                    <ColorInput id="mutedForeground" label="النص الخافت" value={mutedForeground} onChange={(e) => setMutedForeground(e.target.value)} />
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Component/> ألوان المكونات</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <ColorInput id="card" label="خلفية البطاقة" value={card} onChange={(e) => setCard(e.target.value)} />
                    <ColorInput id="cardForeground" label="نص البطاقة" value={cardForeground} onChange={(e) => setCardForeground(e.target.value)} />
                     <ColorInput id="popover" label="خلفية منبثقة" value={popover} onChange={(e) => setPopover(e.target.value)} />
                    <ColorInput id="popoverForeground" label="نص منبثق" value={popoverForeground} onChange={(e) => setPopoverForeground(e.target.value)} />
                    <ColorInput id="secondary" label="خلفية ثانوي" value={secondary} onChange={(e) => setSecondary(e.target.value)} />
                    <ColorInput id="secondaryForeground" label="نص ثانوي" value={secondaryForeground} onChange={(e) => setSecondaryForeground(e.target.value)} />
                    <ColorInput id="destructive" label="لون الحذف" value={destructive} onChange={(e) => setDestructive(e.target.value)} />
                    <ColorInput id="border" label="لون الحواف" value={border} onChange={(e) => setBorder(e.target.value)} />
                    <ColorInput id="input" label="لون حقول الإدخال" value={input} onChange={(e) => setInput(e.target.value)} />
                    <ColorInput id="ring" label="لون التركيز (Ring)" value={ring} onChange={(e) => setRing(e.target.value)} />
                  </CardContent>
              </Card>
              
              <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Columns2 /> الشريط الجانبي</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <ColorInput id="sidebarBackground" label="خلفية الشريط" value={sidebarBackground} onChange={(e) => setSidebarBackground(e.target.value)} />
                    <ColorInput id="sidebarForeground" label="نص الشريط" value={sidebarForeground} onChange={(e) => setSidebarForeground(e.target.value)} />
                    <ColorInput id="sidebarAccent" label="تمييز الشريط" value={sidebarAccent} onChange={(e) => setSidebarAccent(e.target.value)} />
                    <ColorInput id="sidebarAccentForeground" label="نص التمييز" value={sidebarAccentForeground} onChange={(e) => setSidebarAccentForeground(e.target.value)} />
                    <ColorInput id="sidebarBorder" label="حواف الشريط" value={sidebarBorder} onChange={(e) => setSidebarBorder(e.target.value)} />
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><BarChart/> ألوان المخططات</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <ColorInput id="chart1" label="لون 1" value={chart1} onChange={(e) => setChart1(e.target.value)} />
                    <ColorInput id="chart2" label="لون 2" value={chart2} onChange={(e) => setChart2(e.target.value)} />
                    <ColorInput id="chart3" label="لون 3" value={chart3} onChange={(e) => setChart3(e.target.value)} />
                    <ColorInput id="chart4" label="لون 4" value={chart4} onChange={(e) => setChart4(e.target.value)} />
                    <ColorInput id="chart5" label="لون 5" value={chart5} onChange={(e) => setChart5(e.target.value)} />
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Type /> الخطوط والأحجام</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'><Eye/> معاينة حية</CardTitle>
                <CardDescription>شاهد كيف ستبدو تغييراتك قبل الحفظ.</CardDescription>
              </CardHeader>
              <CardContent 
                style={previewStyle} 
                className="space-y-6 rounded-lg text-[var(--preview-font-size)] transition-all duration-300 p-4 border"
              >
                 <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--preview-background)'}}>
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
                        <Alert variant="destructive" className="border-l-4" style={{ backgroundColor: `${destructive}1A`, borderColor: 'var(--preview-destructive)', color: 'var(--preview-destructive)' }}>
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
            {isSaving ? 'جاري الحفظ...' : 'حفظ كل الإعدادات'}
          </Button>
        </div>
      </main>
    </div>
  );
}

