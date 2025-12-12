
'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Brush, Component, SlidersHorizontal, Square, Circle, Paintbrush, TextSelect, Save, Feather, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Icon from '@/components/icon';
import { useSettings } from '@/contexts/SettingsContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SettingsHeader } from '@/components/settings-header';


// A placeholder for FontAwesome icon if it were to be used
const FaIcon = ({ className }: { className?: string }) => <FontAwesomeIcon icon={"star"} className={className} />;


export default function InterfaceCustomizationPage() {
  const { toast } = useToast();
  const context = useSettings();

  if (!context || !context.isHydrated) {
    return null; // Or a loading skeleton
  }

  const { settings, updateUiSetting, isHydrated } = context;
  const { density, borderRadius, iconStrokeWidth, iconLibrary } = settings.ui;

  const setDensity = (value: string) => updateUiSetting('density', value);
  const setBorderRadius = (value: string) => updateUiSetting('borderRadius', value);
  const setIconStrokeWidth = (value: number) => updateUiSetting('iconStrokeWidth', value);
  const setIconLibrary = (value: string) => updateUiSetting('iconLibrary', value);

  useEffect(() => {
    if (isHydrated) {
      document.body.dataset.density = density;
      document.documentElement.style.setProperty('--radius', `${borderRadius}rem`);
    }
  }, [isHydrated, density, borderRadius]);

  const handleSaveChanges = () => {
    toast({
      title: 'تم حفظ الإعدادات!',
      description: 'تم حفظ تفضيلات الواجهة بنجاح.',
    });
  };

  const getIconExample = (library: string) => {
    const props = { style: { strokeWidth: iconStrokeWidth }, className: 'h-6 w-6' };
    switch (library) {
      case 'feather': return <Icon name="Feather" {...props} />;
      case 'fontawesome': return <FaIcon {...props} />;
      case 'lucide':
      default:
        return <Icon name="Brush" {...props} />;
    }
  }

  if (!isHydrated) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="space-y-6">
      <SettingsHeader
        icon="Brush"
        title="تخصيص الواجهة"
        description="تحكم في مظهر وشكل الواجهة لتناسب تفضيلاتك"
        color="blue"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Icon name="SlidersHorizontal" /> كثافة العرض</CardTitle>
              <CardDescription>اختر بين عرض مريح أو مضغوط لعرض المزيد من البيانات.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={density} onValueChange={setDensity} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Label className="flex-1 cursor-pointer rounded-lg border p-4 text-center hover:bg-accent has-[div[data-state=checked]]:border-primary">
                  <RadioGroupItem value="comfortable" id="r1" className="sr-only" />
                  <span className="text-2xl mb-2 block">📄</span>
                  <span className="font-medium">مريح (Comfortable)</span>
                  <p className="text-xs text-muted-foreground mt-1">مساحات واسعة لقراءة أسهل.</p>
                </Label>
                <Label className="flex-1 cursor-pointer rounded-lg border p-4 text-center hover:bg-accent has-[div[data-state=checked]]:border-primary">
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
              <CardTitle className="flex items-center gap-2 text-lg"><Icon name="Paintbrush" /> نمط الأيقونات</CardTitle>
              <CardDescription>تحكم في مظهر الأيقونات في جميع أنحاء النظام.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>مكتبة الأيقونات</Label>
                <RadioGroup value={iconLibrary} onValueChange={setIconLibrary} className="grid grid-cols-3 gap-4 mt-2">
                  <Label className="flex flex-col items-center justify-center cursor-pointer rounded-lg border p-4 text-center hover:bg-accent has-[div[data-state=checked]]:border-primary">
                    <RadioGroupItem value="lucide" id="il1" className="sr-only" />
                    <Icon name="Brush" className="h-8 w-8 mb-2" />
                    <span className="font-medium text-sm">Lucide</span>
                  </Label>
                  <Label className="flex flex-col items-center justify-center cursor-pointer rounded-lg border p-4 text-center hover:bg-accent has-[div[data-state=checked]]:border-primary">
                    <RadioGroupItem value="feather" id="il2" className="sr-only" />
                    <Icon name="Feather" className="h-8 w-8 mb-2" />
                    <span className="font-medium text-sm">Feather</span>
                  </Label>
                  <Label className="flex flex-col items-center justify-center cursor-pointer rounded-lg border p-4 text-center hover:bg-accent has-[div[data-state=checked]]:border-primary">
                    <RadioGroupItem value="fontawesome" id="il3" className="sr-only" />
                    <FaIcon className="h-8 w-8 mb-2" />
                    <span className="font-medium text-sm">Font Awesome</span>
                  </Label>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="icon-stroke">سماكة خط الأيقونة: {iconStrokeWidth.toFixed(1)}px</Label>
                <div className="flex items-center gap-4 pt-2">
                  <Icon name="TextSelect" className="h-6 w-6 text-muted-foreground" style={{ strokeWidth: 1 }} />
                  <Slider
                    id="icon-stroke"
                    min={1}
                    max={3}
                    step={0.1}
                    value={[iconStrokeWidth]}
                    onValueChange={(value) => setIconStrokeWidth(value[0])}
                  />
                  <Icon name="TextSelect" className="h-6 w-6 text-muted-foreground" style={{ strokeWidth: 3 }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Icon name="Component" /> شكل المكونات</CardTitle>
              <CardDescription>غير شكل المكونات الرئيسية مثل البطاقات والأزرار.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>استدارة الحواف (Border Radius)</Label>
                <RadioGroup value={borderRadius} onValueChange={setBorderRadius} className="grid grid-cols-3 gap-4 mt-2">
                  <Label className="flex flex-col items-center justify-center cursor-pointer rounded-lg border p-4 text-center hover:bg-accent has-[div[data-state=checked]]:border-primary">
                    <RadioGroupItem value="0" id="br1" className="sr-only" />
                    <Icon name="Square" className="h-8 w-8 mb-2" />
                    <span className="font-medium text-sm">حاد</span>
                  </Label>
                  <Label className="flex flex-col items-center justify-center cursor-pointer rounded-lg border p-4 text-center hover:bg-accent has-[div[data-state=checked]]:border-primary">
                    <RadioGroupItem value="0.5" id="br2" className="sr-only" />
                    <div className="h-8 w-8 mb-2 rounded-md bg-muted-foreground/20"></div>
                    <span className="font-medium text-sm">عادي</span>
                  </Label>
                  <Label className="flex flex-col items-center justify-center cursor-pointer rounded-lg border p-4 text-center hover:bg-accent has-[div[data-state=checked]]:border-primary">
                    <RadioGroupItem value="1" id="br3" className="sr-only" />
                    <Icon name="Circle" className="h-8 w-8 mb-2" />
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
                data-density={density}
                style={{
                  '--radius': `${borderRadius}rem`,
                } as React.CSSProperties}
              >
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  {getIconExample(iconLibrary)}
                  <span>عنوان البطاقة</span>
                </h3>
                <p className="text-sm text-muted-foreground">هذا مثال لعرض النص داخل البطاقة مع الإعدادات المطبقة.</p>
                <div className="flex gap-2 mt-4">
                  <Button>زر أساسي</Button>
                  <Button variant="outline">زر ثانوي</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex justify-start pt-6 mt-6 border-t">
        <Button size="lg" onClick={handleSaveChanges}>
          <Icon name="Save" className="ml-2 h-4 w-4" /> حفظ التغييرات
        </Button>
      </div>
    </div>
  );
}
