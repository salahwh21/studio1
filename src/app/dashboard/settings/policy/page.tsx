
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/icon';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';

const BarcodeIcon = () => (
  <svg viewBox="0 0 120 30" className="h-10 w-24">
    <rect x="0" y="0" width="2" height="30" fill="black" />
    <rect x="4" y="0" width="1" height="30" fill="black" />
    <rect x="7" y="0" width="3" height="30" fill="black" />
    <rect x="12" y="0" width="1" height="30" fill="black" />
    <rect x="15" y="0" width="2" height="30" fill="black" />
    <rect x="19" y="0" width="2" height="30" fill="black" />
    <rect x="23" y="0" width="1" height="30" fill="black" />
    <rect x="26" y="0" width="3" height="30" fill="black" />
    <rect x="31" y="0" width="1" height="30" fill="black" />
    <rect x="34" y="0" width="3" height="30" fill="black" />
    <rect x="39" y="0" width="2" height="30" fill="black" />
    <rect x="43" y="0" width="1" height="30" fill="black" />
    <rect x="46" y="0" width="1" height="30" fill="black" />
    <rect x="49" y="0" width="3" height="30" fill="black" />
    <rect x="54" y="0" width="2" height="30" fill="black" />
    <rect x="58" y="0" width="1" height="30" fill="black" />
    <rect x="61" y="0" width="3" height="30" fill="black" />
    <rect x="66" y="0" width="1" height="30" fill="black" />
    <rect x="69" y="0" width="2" height="30" fill="black" />
    <rect x="73" y="0" width="2" height="30" fill="black" />
    <rect x="77" y="0" width="1" height="30" fill="black" />
    <rect x="80" y="0" width="3" height="30" fill="black" />
    <rect x="85" y="0" width="1" height="30" fill="black" />
    <rect x="88" y="0" width="3" height="30" fill="black" />
    <rect x="93" y="0" width="2" height="30" fill="black" />
    <rect x="97" y="0" width="1" height="30" fill="black" />
    <rect x="100" y="0" width="1" height="30" fill="black" />
    <rect x="103" y="0" width="3" height="30" fill="black" />
    <rect x="108" y="0" width="2" height="30" fill="black" />
    <rect x="112" y="0" width="1" height="30" fill="black" />
    <rect x="115" y="0" width="3" height="30" fill="black" />
  </svg>
);

const paperSizeClasses = {
  a4: 'w-[210mm] h-[297mm] p-8',
  a5: 'w-[148mm] h-[210mm] p-6',
  label_4x6: 'w-[101.6mm] h-[152.4mm] p-4 text-sm',
  label_4x4: 'w-[101.6mm] h-[101.6mm] p-3 text-xs',
  label_4x2: 'w-[101.6mm] h-[50.8mm] p-2 text-[10px]',
  label_3x2: 'w-[76.2mm] h-[50.8mm] p-2 text-[9px] leading-tight',
  label_2x3: 'w-[50.8mm] h-[76.2mm] p-2 text-[9px] leading-tight',
};

const CustomFieldsSection = ({ fields, onUpdate, onAdd, onRemove }: { fields: {label: string, value: string}[], onUpdate: (index: number, field: 'label'|'value', value: string) => void, onAdd: () => void, onRemove: (index: number) => void }) => (
    <div className="space-y-2">
        {fields.map((field, index) => (
            <div key={index} className="flex items-center gap-2">
                <Input
                    placeholder="عنوان الحقل"
                    value={field.label}
                    onChange={(e) => onUpdate(index, 'label', e.target.value)}
                    className="h-9"
                />
                <Input
                    placeholder="قيمة افتراضية"
                    value={field.value}
                    onChange={(e) => onUpdate(index, 'value', e.target.value)}
                    className="h-9"
                />
                <Button variant="ghost" size="icon" onClick={() => onRemove(index)} className="h-9 w-9">
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        ))}
        {fields.length < 3 && (
            <Button variant="outline" size="sm" onClick={onAdd} className="w-full">
                <Icon name="PlusCircle" className="mr-2 h-4 w-4" /> إضافة حقل مخصص
            </Button>
        )}
    </div>
);

const renderCustomFields = (customFields: {label: string, value: string}[]) => (
    <div className="mt-2 space-y-1 text-xs">
        {customFields.filter(f => f.label).map((field, index) => (
            <div key={index} className="flex justify-between border-t border-dashed pt-1">
                <span className="font-bold">{field.label}:</span>
                <span>{field.value}</span>
            </div>
        ))}
    </div>
);

const DefaultLayout = ({ settings }: { settings: any }) => (
    <>
        <header className="flex justify-between items-start border-b-2 border-black pb-2">
        <div className="text-right">
            {settings.showCompanyLogo && <div className="h-12"><Logo /></div>}
            {settings.showCompanyName && <h1 className="font-bold text-lg mt-1">شركة الوميض للتوصيل</h1>}
            {settings.showCompanyAddress && <p className="text-xs">عمان, الأردن - 0790123456</p>}
        </div>
        <div className="text-left">
            <h2 className="font-bold">بوليصة شحن</h2>
            <p className="text-xs font-mono">ORD-1719810001</p>
            <p className="text-xs">{new Date().toLocaleDateString('ar-JO')}</p>
        </div>
        </header>

        <main className="flex-grow my-4 grid grid-cols-2 gap-4">
        <div className="border border-black rounded p-2">
            <h3 className="font-bold border-b border-black mb-2">من (المرسل)</h3>
            <p>تاجر أ</p>
            <p>0780123456</p>
            <p>مخزن الصويفية</p>
        </div>
        <div className="border border-black rounded p-2">
            <h3 className="font-bold border-b border-black mb-2">إلى (المستلم)</h3>
            <p>محمد جاسم</p>
            <p>07701112233</p>
            <p>الصويفية, عمان, شارع الوكالات, بناية 15, الطابق 3</p>
        </div>
        </main>

        {settings.showItems && (
        <div className="mb-4">
            <table className="w-full text-xs border-collapse border border-black">
                <thead><tr className="bg-gray-200"><th className="border border-black p-1">المنتج</th><th className="border border-black p-1">الكمية</th><th className="border border-black p-1">السعر</th></tr></thead>
                <tbody><tr><td className="border border-black p-1">منتج 1</td><td className="border border-black p-1 text-center">2</td><td className="border border-black p-1 text-center">15.00</td></tr><tr><td className="border border-black p-1">منتج 2</td><td className="border border-black p-1 text-center">1</td><td className="border border-black p-1 text-center">20.50</td></tr></tbody>
            </table>
        </div>
        )}
        {renderCustomFields(settings.customFields)}

        <footer className="mt-auto pt-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    {settings.showRefNumber && <p className="text-xs">الرقم المرجعي: <span className="font-bold">REF-00101</span></p>}
                    {settings.showPrice && <div className="border-2 border-black rounded-lg p-2 mt-2 text-center"><p className="font-bold text-sm">المبلغ المطلوب</p><p className="font-bold text-xl">35.50 د.أ</p></div>}
                </div>
                {settings.showBarcode && <div className="flex flex-col items-center justify-center"><BarcodeIcon /><p className="text-xs font-mono tracking-widest mt-1">ORD-1719810001</p></div>}
            </div>
            {settings.footerNotes && <p className="text-xs text-center border-t-2 border-black pt-2">{settings.footerNotes}</p>}
        </footer>
    </>
);

const CompactLayout = ({ settings }: { settings: any }) => (
    <>
        <div className="grid grid-cols-2 gap-x-4 border-b-2 border-black pb-2">
            <div className="text-right space-y-1">
                {settings.showCompanyLogo && <div className="h-8"><Logo /></div>}
                {settings.showCompanyName && <h1 className="font-bold text-base">شركة الوميض للتوصيل</h1>}
            </div>
            <div className="text-left space-y-1">
                <div className="flex flex-col items-end">
                  {settings.showBarcode && <div className="flex flex-col items-center justify-center scale-75 origin-right"><BarcodeIcon /><p className="text-[8px] font-mono tracking-wider mt-1">ORD-1719810001</p></div>}
                </div>
            </div>
        </div>
        <main className="flex-grow my-2 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs"><div className='space-y-0.5'><p className='font-bold'>المرسل:</p><p>تاجر أ (0780123456)</p></div><div className='space-y-0.5'><p className='font-bold'>الرقم المرجعي:</p><p>REF-00101</p></div><div className='space-y-0.5'><p className='font-bold'>تاريخ الطلب:</p><p>{new Date().toLocaleDateString('ar-JO')}</p></div></div>
            <div className="border border-black rounded p-2 space-y-1 text-xs"><p className="font-bold">المستلم: محمد جاسم</p><p>الهاتف: 07701112233</p><p className="font-bold">العنوان: الصويفية, عمان, شارع الوكالات, بناية 15, الطابق 3</p></div>
        </main>
        {settings.showItems && (<div className="text-[10px] my-2"><p>المحتويات: منتج 1 (x2), منتج 2 (x1)</p></div>)}
        {renderCustomFields(settings.customFields)}
        <footer className="mt-auto pt-2 space-y-2 border-t-2 border-black">
            {settings.showPrice && <div className="text-center"><p className="font-bold text-sm">المبلغ المطلوب</p><p className="font-bold text-xl">35.50 د.أ</p></div>}
            {settings.footerNotes && <p className="text-[10px] text-center">{settings.footerNotes}</p>}
        </footer>
    </>
);

const DetailedLayout = ({ settings }: { settings: any }) => (
    <>
        <header className="grid grid-cols-3 gap-2 border-b-2 border-black pb-2 items-center">
            <div className="col-span-1">{settings.showCompanyLogo && <div className="h-10"><Logo /></div>}</div>
            <div className="col-span-2 text-left">
                <h2 className="font-bold text-lg">بوليصة شحن</h2>
                {settings.showBarcode && <div className="flex flex-col items-end"><div className="scale-75 origin-right"><BarcodeIcon /></div><p className="text-[9px] font-mono tracking-wider -mt-2">ORD-1719810001</p></div>}
            </div>
        </header>
        <main className="flex-grow my-2 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2"><p><span className="font-bold">تاريخ الطلب:</span> {new Date().toLocaleDateString('ar-JO')}</p>{settings.showRefNumber && <p><span className="font-bold">الرقم المرجعي:</span> REF-00101</p>}</div>
            <div className="grid grid-cols-2 gap-2">
                <div className="border border-black rounded p-1"><h3 className="font-bold border-b border-black mb-1">المرسل</h3><p>تاجر أ</p><p>0780123456</p></div>
                <div className="border border-black rounded p-1"><h3 className="font-bold border-b border-black mb-1">المستلم</h3><p>محمد جاسم</p><p>07701112233</p></div>
            </div>
            <div className="border border-black rounded p-1"><p><span className="font-bold">العنوان:</span> الصويفية, عمان, شارع الوكالات, بناية 15, الطابق 3</p></div>
            {settings.showItems && <div className="border border-black rounded p-1"><p><span className="font-bold">المحتويات:</span> منتج 1 (x2), منتج 2 (x1)</p></div>}
        </main>
        {renderCustomFields(settings.customFields)}
        <footer className="mt-auto pt-2 space-y-2 border-t-2 border-black">
            {settings.showPrice && <div className="border-2 border-black rounded-lg p-1 text-center"><p className="font-bold">المبلغ المطلوب</p><p className="font-bold text-lg">35.50 د.أ</p></div>}
            {settings.footerNotes && <p className="text-[9px] text-center pt-1">{settings.footerNotes}</p>}
        </footer>
    </>
);


export default function PolicySettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    paperSize: 'a4',
    layout: 'default',
    showCompanyLogo: true,
    showCompanyName: true,
    showCompanyAddress: false,
    showRefNumber: true,
    showItems: false,
    showPrice: true,
    showBarcode: true,
    footerNotes: 'شكرًا لثقتكم بنا. يرجى التأكد من الشحنة قبل استلامها.',
    customFields: [] as {label: string, value: string}[],
  });

  type SettingsKey = keyof typeof settings;

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('policySettings');
      if (savedSettings) {
        setSettings(prev => ({...prev, ...JSON.parse(savedSettings)}));
      }
    } catch (error) {
      console.error('Failed to load policy settings:', error);
    }
  }, []);

  const handleSettingChange = (key: SettingsKey, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };
  
  const handleCustomFieldUpdate = (index: number, field: 'label'|'value', value: string) => {
      const newFields = [...settings.customFields];
      newFields[index][field] = value;
      handleSettingChange('customFields', newFields);
  };

  const addCustomField = () => {
      if (settings.customFields.length < 3) {
          handleSettingChange('customFields', [...settings.customFields, {label: '', value: ''}]);
      }
  };

  const removeCustomField = (index: number) => {
      const newFields = settings.customFields.filter((_, i) => i !== index);
      handleSettingChange('customFields', newFields);
  };


  const handleSave = () => {
    try {
      localStorage.setItem('policySettings', JSON.stringify(settings));
      toast({
        title: 'تم الحفظ بنجاح!',
        description: 'تم تحديث إعدادات بوليصة الشحن.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'فشل الحفظ',
        description: 'لم نتمكن من حفظ الإعدادات.',
      });
    }
  };

  const SwitchControl = ({ id, label, checked }: { id: SettingsKey; label: string; checked: boolean; }) => (
    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
      <Label htmlFor={id}>{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={(val) => handleSettingChange(id, val)} />
    </div>
  );
  
  const renderLayout = () => {
      switch(settings.layout) {
          case 'compact': return <CompactLayout settings={settings} />;
          case 'detailed': return <DetailedLayout settings={settings} />;
          case 'default': default: return <DefaultLayout settings={settings} />;
      }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2"><Icon name="ReceiptText" /> إعدادات البوليصة</CardTitle>
            <CardDescription>تخصيص شكل ومحتوى بوليصة الشحن التي يتم طباعتها.</CardDescription>
          </div>
          <Button variant="outline" size="icon" asChild><Link href="/dashboard/settings/general"><Icon name="ArrowLeft" /></Link></Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">
          <Card><CardHeader><CardTitle className="text-lg">حجم الورق</CardTitle></CardHeader><CardContent>
              <RadioGroup value={settings.paperSize} onValueChange={(val) => handleSettingChange('paperSize', val)}>
                <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="a4" id="a4" /><Label htmlFor="a4">A4</Label></div>
                <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="a5" id="a5" /><Label htmlFor="a5">A5</Label></div>
                <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="label_4x6" id="label_4x6" /><Label htmlFor="label_4x6">ملصق حراري (4x6 inch)</Label></div>
                <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="label_4x4" id="label_4x4" /><Label htmlFor="label_4x4">ملصق حراري (4x4 inch)</Label></div>
                <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="label_3x2" id="label_3x2" /><Label htmlFor="label_3x2">ملصق حراري (3x2 inch)</Label></div>
                <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="label_2x3" id="label_2x3" /><Label htmlFor="label_2x3">ملصق حراري (2x3 inch)</Label></div>
                <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="label_4x2" id="label_4x2" /><Label htmlFor="label_4x2">ملصق حراري (4x2 inch)</Label></div>
              </RadioGroup>
          </CardContent></Card>
          
           <Card><CardHeader><CardTitle className="text-lg">تصميم البوليصة</CardTitle></CardHeader><CardContent>
              <RadioGroup value={settings.layout} onValueChange={(val) => handleSettingChange('layout', val)}>
                <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="default" id="layout-default" /><Label htmlFor="layout-default">التصميم الافتراضي</Label></div>
                <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="compact" id="layout-compact" /><Label htmlFor="layout-compact">التصميم المدمج (للملصقات)</Label></div>
                <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="detailed" id="layout-detailed" /><Label htmlFor="layout-detailed">التصميم المفصّل</Label></div>
              </RadioGroup>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-lg">محتوى البوليصة</CardTitle></CardHeader><CardContent className="space-y-3">
              <SwitchControl id="showCompanyLogo" label="إظهار شعار الشركة" checked={settings.showCompanyLogo} />
              <SwitchControl id="showCompanyName" label="إظهار اسم الشركة" checked={settings.showCompanyName} />
              <SwitchControl id="showCompanyAddress" label="إظهار عنوان الشركة" checked={settings.showCompanyAddress} />
              <Separator />
              <SwitchControl id="showRefNumber" label="إظهار الرقم المرجعي" checked={settings.showRefNumber} />
              <SwitchControl id="showItems" label="إظهار تفاصيل المنتجات" checked={settings.showItems} />
              <SwitchControl id="showPrice" label="إظهار السعر الإجمالي" checked={settings.showPrice} />
              <SwitchControl id="showBarcode" label="إظهار الباركود" checked={settings.showBarcode} />
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-lg">الحقول المخصصة</CardTitle><CardDescription>أضف معلومات إضافية للبوليصة.</CardDescription></CardHeader><CardContent>
                <CustomFieldsSection 
                    fields={settings.customFields}
                    onUpdate={handleCustomFieldUpdate}
                    onAdd={addCustomField}
                    onRemove={removeCustomField}
                />
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-lg">ملاحظات التذييل</CardTitle></CardHeader><CardContent>
              <Textarea value={settings.footerNotes} onChange={(e) => handleSettingChange('footerNotes', e.target.value)} placeholder="اكتب ملاحظاتك هنا..." rows={4}/>
          </CardContent></Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">معاينة حية</CardTitle></CardHeader>
            <CardContent className="bg-muted p-4 sm:p-8 flex items-center justify-center overflow-auto">
              <div className={cn("bg-white text-black shadow-lg mx-auto font-sans flex-shrink-0", paperSizeClasses[settings.paperSize as keyof typeof paperSizeClasses])}>
                <div className="flex flex-col h-full">{renderLayout()}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex justify-start pt-6 mt-6 border-t">
        <Button size="lg" onClick={handleSave}><Icon name="Save" className="ml-2 h-4 w-4" /> حفظ التغييرات</Button>
      </div>
    </div>
  );
}

