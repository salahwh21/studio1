
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Info, Palette, XCircle, AlertTriangle, Loader2, Save } from 'lucide-react';
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
import { motion } from 'framer-motion';

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

export default function FontsColorsPage() {
  const { toast } = useToast();
  
  const [primaryColor, setPrimaryColor] = useState('#29ABE2');
  const [backgroundColor, setBackgroundColor] = useState('#F0F9FF'); // Lighter blue
  const [accentColor, setAccentColor] = useState('#F2994A'); 

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
    <motion.div 
      className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Palette className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">الألوان والخطوط</h1>
              <p className="text-muted-foreground">
                  اختر اللون الأساسي والخط لتخصيص شكل النظام.
              </p>
            </div>
          </div>
          <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/settings/general">
                  <ArrowLeft className="h-5 w-5" />
              </Link>
          </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column for settings */}
        <div className="lg:col-span-1 space-y-8">
           <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={0}>
              <Card>
                <CardHeader>
                  <CardTitle>الألوان الرئيسية</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">الأساسي</Label>
                    <Input id="primaryColor" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full h-12 p-1 cursor-pointer"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">الخلفية</Label>
                    <Input id="backgroundColor" type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-full h-12 p-1 cursor-pointer"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accentColor">الثانوي</Label>
                    <Input id="accentColor" type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-full h-12 p-1 cursor-pointer"/>
                  </div>
                </CardContent>
              </Card>
          </motion.div>

          <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={1}>
              <Card>
                <CardHeader>
                  <CardTitle>الخطوط والأحجام</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">الخط</Label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                      <SelectTrigger id="fontFamily">
                        <SelectValue placeholder="اختر خطًا" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tajawal">Tajawal (العربية)</SelectItem>
                        <SelectItem value="Inter">Inter (English)</SelectItem>
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
          </motion.div>
        </div>

        {/* Right Column for preview */}
        <motion.div 
            className="lg:col-span-2"
            variants={cardVariants} 
            initial="hidden" 
            animate="visible"
            custom={2}
        >
          <Card>
            <CardHeader>
              <CardTitle>معاينة حية</CardTitle>
            </CardHeader>
            <CardContent 
              style={{ ...previewStyle, fontFamily: fontVarName }} 
              className="space-y-6 rounded-lg bg-[var(--preview-background)] text-[var(--preview-font-size)] text-gray-800 transition-all duration-300 p-6"
            >
              <h4 className="text-xl font-bold" style={{ color: 'var(--preview-primary)', fontSize: `${baseFontSize * 1.5}px` }}>هذا عنوان رئيسي H4</h4>
              <h6 className="text-lg" style={{ fontSize: `${baseFontSize * 1.1}px` }}>وهذا عنوان فرعي H6</h6>
              <p className="leading-relaxed">
                هذا مثال للنص الأساسي. يمكنك <a href="#" style={{ color: 'var(--preview-primary)' }} className="underline">النقر على هذا الرابط</a> لتجربة الروابط. يتم توليد جميع الألوان، بما في ذلك ألوان الحالات، تلقائيًا من اللون الأساسي الذي تختاره.
              </p>
              
               <Card className="shadow-lg bg-white">
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
              
              <div className="space-y-3">
                  <Alert variant="default" className="bg-green-100 border-l-4 border-green-500 text-green-800">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <AlertTitle>هذه رسالة نجاح.</AlertTitle>
                  </Alert>
                  <Alert variant="destructive" className="bg-red-100 border-l-4 border-red-500 text-red-800">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <AlertTitle>هذه رسالة خطأ.</AlertTitle>
                  </Alert>
                  <Alert variant="default" className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <AlertTitle>هذه رسالة تحذير.</AlertTitle>
                  </Alert>
                  <Alert variant="default" className="bg-blue-100 border-l-4 border-blue-500 text-blue-800">
                      <Info className="h-5 w-5 text-blue-500" />
                      <AlertTitle>هذه رسالة معلومات.</AlertTitle>
                  </Alert>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-start mt-6">
        <Button size="lg" onClick={handleSaveChanges} disabled={isSaving}>
           {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
          {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </motion.div>
  );
}
