
'use client';

import { useState, useEffect, useContext } from 'react';
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
import { useSettings } from '@/contexts/SettingsContext';
import { PrintablePolicy } from '@/components/printable-policy';

const paperSizeClasses = {
  a4: 'w-[210mm] h-[297mm] p-8',
  a5: 'w-[148mm] h-[210mm] p-6',
  label_4x6: 'w-[101.6mm] h-[152.4mm] p-4 text-sm',
  label_4x4: 'w-[101.6mm] h-[101.6mm] p-3 text-[10px] leading-tight',
  label_4x2: 'w-[101.6mm] h-[50.8mm] p-2 text-[9px] leading-tight',
  label_3x2: 'w-[76.2mm] h-[50.8mm] p-2 text-[8px] leading-tight',
  label_2x3: 'w-[50.8mm] h-[76.2mm] p-2 text-[8px] leading-tight',
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


export default function PolicySettingsPage() {
  const { toast } = useToast();
  const context = useSettings();
  
  if (!context) {
      return <div>Loading...</div>; // Or a skeleton loader
  }
  
  const { settings, updatePolicySetting, setPolicySettings } = context;
  const policySettings = settings.policy;

  const handleSettingChange = <K extends keyof typeof policySettings>(key: K, value: any) => {
    updatePolicySetting(key, value);
  };
  
  const handleCustomFieldUpdate = (index: number, field: 'label'|'value', value: string) => {
      const newFields = [...policySettings.customFields];
      newFields[index][field] = value;
      handleSettingChange('customFields', newFields);
  };

  const addCustomField = () => {
      if (policySettings.customFields.length < 3) {
          handleSettingChange('customFields', [...policySettings.customFields, {label: '', value: ''}]);
      }
  };

  const removeCustomField = (index: number) => {
      const newFields = policySettings.customFields.filter((_, i) => i !== index);
      handleSettingChange('customFields', newFields);
  };


  const handleSave = () => {
    toast({
      title: 'تم الحفظ بنجاح!',
      description: 'تم تحديث إعدادات بوليصة الشحن.',
    });
  };

  const SwitchControl = ({ id, label, checked }: { id: keyof typeof policySettings; label: string; checked: boolean; }) => (
    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
      <Label htmlFor={id}>{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={(val) => handleSettingChange(id, val)} />
    </div>
  );
  
  const renderLayout = () => {
      return <PrintablePolicy orders={[]} previewSettings={policySettings} />
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
              <RadioGroup value={policySettings.paperSize} onValueChange={(val) => handleSettingChange('paperSize', val)}>
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
              <RadioGroup value={policySettings.layout} onValueChange={(val) => handleSettingChange('layout', val)}>
                <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="default" id="layout-default" /><Label htmlFor="layout-default">التصميم الافتراضي</Label></div>
                <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="compact" id="layout-compact" /><Label htmlFor="layout-compact">التصميم المدمج (للملصقات)</Label></div>
                <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="detailed" id="layout-detailed" /><Label htmlFor="layout-detailed">التصميم المفصّل</Label></div>
              </RadioGroup>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-lg">محتوى البوليصة</CardTitle></CardHeader><CardContent className="space-y-3">
              <SwitchControl id="showCompanyLogo" label="إظهار شعار الشركة" checked={policySettings.showCompanyLogo} />
              <SwitchControl id="showCompanyName" label="إظهار اسم الشركة" checked={policySettings.showCompanyName} />
              <SwitchControl id="showCompanyAddress" label="إظهار عنوان الشركة" checked={policySettings.showCompanyAddress} />
              <Separator />
              <SwitchControl id="showRefNumber" label="إظهار الرقم المرجعي" checked={policySettings.showRefNumber} />
              <SwitchControl id="showItems" label="إظهار تفاصيل المنتجات" checked={policySettings.showItems} />
              <SwitchControl id="showPrice" label="إظهار السعر الإجمالي" checked={policySettings.showPrice} />
              <SwitchControl id="showBarcode" label="إظهار الباركود" checked={policySettings.showBarcode} />
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-lg">الحقول المخصصة</CardTitle><CardDescription>أضف معلومات إضافية للبوليصة.</CardDescription></CardHeader><CardContent>
                <CustomFieldsSection 
                    fields={policySettings.customFields}
                    onUpdate={handleCustomFieldUpdate}
                    onAdd={addCustomField}
                    onRemove={removeCustomField}
                />
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-lg">ملاحظات التذييل</CardTitle></CardHeader><CardContent>
              <Textarea value={policySettings.footerNotes} onChange={(e) => handleSettingChange('footerNotes', e.target.value)} placeholder="اكتب ملاحظاتك هنا..." rows={4}/>
          </CardContent></Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">معاينة حية</CardTitle></CardHeader>
            <CardContent className="bg-muted p-4 sm:p-8 flex items-center justify-center overflow-auto">
              {renderLayout()}
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
