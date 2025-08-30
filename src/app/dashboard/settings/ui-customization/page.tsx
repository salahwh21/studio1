
'use client';

import { useState } from 'react';
import { ArrowLeft, Brush, Component, Droplets, SlidersHorizontal, Square, Circle, Paintbrush, TextSelect } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import Link from 'next/link';

export default function InterfaceCustomizationPage() {
  const [density, setDensity] = useState('comfortable');
  const [borderRadius, setBorderRadius] = useState('0.5');
  const [cardStyle, setCardStyle] = useState('shadow');
  const [iconStrokeWidth, setIconStrokeWidth] = useState(2);

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Brush /> تخصيص الواجهة
            </CardTitle>
            <CardDescription className="mt-1">
              تحكم في مظهر وشكل الواجهة لتناسب تفضيلاتك.
            </CardDescription>
          </div>
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/settings/general">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><SlidersHorizontal /> كثافة العرض</CardTitle>
              <CardDescription>اختر بين عرض مريح أو مضغوط لعرض المزيد من البيانات.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={density} onValueChange={setDensity} className="flex gap-4">
                <Label className="flex-1 cursor-pointer rounded-lg border p-4 text-center hover:bg-accent has-[&_div[data-state=checked]]:border-primary">
                  <RadioGroupItem value="comfortable" id="r1" className="sr-only" />
                  <span className="text-2xl mb-2 block">📄</span>
                  <span className="font-medium">مريح (Comfortable)</span>
                  <p className="text-xs text-muted-foreground mt-1">مساحات واسعة لقراءة أسهل.</p>
                </Label>
                <Label className="flex-1 cursor-pointer rounded-lg border p-4 text-center hover:bg-accent has-[&_div[data-state=checked]]:border-primary">
                  <RadioGroupItem value="compact" id="r2" className="sr-only" />
                   <span className="text-2xl mb-2 block">🗂️</span>
                  <span className="font-medium">مضغوط (Compact)</span>
                   <p className="text-xs text-muted-foreground mt-1">مسافات أقل لعرض بيانات أكثر.</p>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Paintbrush /> نمط الأيقونات</CardTitle>
              <CardDescription>تحكم في مظهر الأيقونات في جميع أنحاء النظام.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="icon-stroke">سماكة خط الأيقونة: {iconStrokeWidth.toFixed(1)}px</Label>
                    <div className="flex items-center gap-4 pt-2">
                        <TextSelect className="h-6 w-6 text-muted-foreground" style={{strokeWidth: 1}}/>
                        <Slider
                          id="icon-stroke"
                          min={1}
                          max={3}
                          step={0.1}
                          value={[iconStrokeWidth]}
                          onValueChange={(value) => setIconStrokeWidth(value[0])}
                        />
                        <TextSelect className="h-6 w-6 text-muted-foreground" style={{strokeWidth: 3}}/>
                    </div>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Component /> شكل المكونات</CardTitle>
               <CardDescription>غير شكل المكونات الرئيسية مثل البطاقات والأزرار.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div>
                <Label>استدارة الحواف (Border Radius)</Label>
                <RadioGroup value={borderRadius} onValueChange={setBorderRadius} className="grid grid-cols-3 gap-4 mt-2">
                   <Label className="flex flex-col items-center justify-center cursor-pointer rounded-lg border p-4 text-center hover:bg-accent has-[&_div[data-state=checked]]:border-primary">
                      <RadioGroupItem value="0" id="br1" className="sr-only" />
                      <Square className="h-8 w-8 mb-2"/>
                      <span className="font-medium text-sm">حاد</span>
                  </Label>
                   <Label className="flex flex-col items-center justify-center cursor-pointer rounded-lg border p-4 text-center hover:bg-accent has-[&_div[data-state=checked]]:border-primary">
                      <RadioGroupItem value="0.5" id="br2" className="sr-only" />
                      <div className="h-8 w-8 mb-2 rounded-md bg-muted-foreground/20"></div>
                      <span className="font-medium text-sm">عادي</span>
                  </Label>
                  <Label className="flex flex-col items-center justify-center cursor-pointer rounded-lg border p-4 text-center hover:bg-accent has-[&_div[data-state=checked]]:border-primary">
                      <RadioGroupItem value="1" id="br3" className="sr-only" />
                      <Circle className="h-8 w-8 mb-2"/>
                      <span className="font-medium text-sm">مستدير</span>
                  </Label>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 lg:sticky lg:top-24">
            <Card>
                <CardHeader>
                <CardTitle>معاينة</CardTitle>
                <CardDescription>شاهد كيف ستبدو تغييراتك.</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    <div 
                        className="rounded-lg border bg-card p-4 transition-all duration-300"
                        style={{
                            '--radius': `${borderRadius}rem`,
                            padding: density === 'compact' ? '0.75rem' : '1rem'
                        } as React.CSSProperties}
                    >
                         <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Brush style={{strokeWidth: iconStrokeWidth}}/>
                            <span>عنوان البطاقة</span>
                        </h3>
                        <p className="text-sm text-muted-foreground">هذا مثال لعرض النص داخل البطاقة مع الإعدادات المطبقة.</p>
                        <div className="flex gap-2 mt-4">
                             <Button style={{ borderRadius: `var(--radius)`, padding: density === 'compact' ? '0.25rem 0.75rem' : '0.5rem 1rem', height: 'auto' }}>زر أساسي</Button>
                             <Button variant="outline" style={{ borderRadius: `var(--radius)`, padding: density === 'compact' ? '0.25rem 0.75rem' : '0.5rem 1rem', height: 'auto' }}>زر ثانوي</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
