'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import produce from 'immer';
import { useSettings, type PolicySettings } from '@/contexts/SettingsContext';
import { Skeleton } from '@/components/ui/skeleton';
import Barcode from 'react-barcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --------------------- قسم الحقول المخصصة ---------------------
interface CustomField {
  label: string;
  value: string;
}

const CustomFieldsSection = ({ fields, onChange, maxFields = 3 }: { fields: CustomField[], onChange: (fields: CustomField[]) => void, maxFields?: number }) => {
  const [error, setError] = useState('');

  const handleUpdate = (index: number, key: 'label'|'value', value: string) => {
    const newFields = produce(fields, draft => { draft[index][key] = value });
    onChange(newFields);
  };

  const handleAdd = () => {
    if (fields.length >= maxFields) {
      setError(`لا يمكن إضافة أكثر من ${maxFields} حقول`);
      return;
    }
    setError('');
    onChange([...fields, {label: '', value: ''}]);
  };

  const handleRemove = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    onChange(newFields);
    setError('');
  };

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={index} className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="عنوان الحقل"
            value={field.label}
            onChange={(e) => handleUpdate(index, 'label', e.target.value)}
            className="h-9 flex-1 min-w-[120px]"
            aria-label="عنوان الحقل"
          />
          <Input
            placeholder="قيمة افتراضية"
            value={field.value}
            onChange={(e) => handleUpdate(index, 'value', e.target.value)}
            className="h-9 flex-1 min-w-[120px]"
            aria-label="القيمة الافتراضية"
          />
          <Button variant="ghost" size="icon" onClick={() => handleRemove(index)} className="h-9 w-9">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {fields.length < maxFields && (
        <Button variant="outline" size="sm" onClick={handleAdd} className="w-full flex items-center justify-center">
          <Icon name="PlusCircle" className="mr-2 h-4 w-4" /> إضافة حقل مخصص
        </Button>
      )}
    </div>
  );
};

// --------------------- مكون معاينة البوليصة محسّن للملصقات ---------------------
interface PrintablePolicyProps {
  orders: any[];
  previewSettings: PolicySettings;
}

const PrintablePolicy: React.FC<PrintablePolicyProps> = ({ orders, previewSettings }) => {
  const {
    paperSize,
    layout,
    showCompanyLogo,
    showCompanyName,
    showCompanyAddress,
    showRefNumber,
    showItems,
    showPrice,
    showBarcode,
    customFields,
    footerNotes,
  } = previewSettings;

  const paperDimensions: Record<string, { width: number, height: number }> = {
    a4: { width: 794, height: 1123 },
    a5: { width: 559, height: 794 },
    label_4x6: { width: 300, height: 450 },
    label_4x4: { width: 300, height: 300 },
    label_3x2: { width: 180, height: 120 },
    label_2x3: { width: 120, height: 180 },
    label_4x2: { width: 300, height: 150 },
  };

  const { width, height } = paperDimensions[paperSize] || { width: 794, height: 1123 };

  const isSmallLabel = ['label_3x2','label_2x3','label_4x2'].includes(paperSize);

  const fontSize = isSmallLabel ? 'text-[8px]' : 'text-sm';
  const headerFontSize = isSmallLabel ? 'text-[10px] font-bold' : 'text-lg font-bold';
  const itemFontSize = isSmallLabel ? 'text-[8px]' : 'text-sm';
  const paddingSize = isSmallLabel ? 'p-1' : 'p-2';
  const imageSize = isSmallLabel ? 'w-8 h-8' : 'w-16 h-16';

  const renderHeader = () => (
    <div className="flex flex-col items-start mb-1 space-y-1">
      {showCompanyLogo && !isSmallLabel && <img src="/logo.png" alt="Logo" className={`${imageSize} object-contain`} />}
      {showCompanyName && <div className={headerFontSize}>{'اسم الشركة'}</div>}
      {showCompanyAddress && !isSmallLabel && <div className={`${fontSize}`}>{'عنوان الشركة الكامل'}</div>}
    </div>
  );

  const renderItems = () => {
    if (!showItems || orders.length === 0) return <div className={`${fontSize} italic`}>لا توجد منتجات للعرض</div>;
    return (
      <table className={`w-full border-collapse text-right ${itemFontSize}`} dir="rtl">
        <thead>
          <tr>
            <th className="border px-1">المنتج</th>
            <th className="border px-1">الكمية</th>
            {showPrice && <th className="border px-1">السعر</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((item, idx) => (
            <tr key={idx}>
              <td className="border px-1">{item.name}</td>
              <td className="border px-1">{item.quantity}</td>
              {showPrice && <td className="border px-1">{item.price}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderCustomFields = () => {
    if (!customFields || customFields.length === 0) return null;
    return (
      <div className="mt-1 space-y-1">
        {customFields.map((field, idx) => (
          <div key={idx} className={`${fontSize}`}>
            <strong>{field.label}:</strong> {field.value}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      id="policy-preview"
      className={`border bg-white flex flex-col ${paddingSize}`}
      style={{
        width: `${width}px`,
        minHeight: `${height}px`,
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.2',
        overflow: 'hidden',
      }}
    >
      {showRefNumber && <div className={`${fontSize} mb-1`}>الرقم المرجعي: 123456</div>}
      {renderHeader()}

      {layout === 'compact' && (
        <div className="flex flex-col space-y-1">
          {renderItems()}
          {showPrice && <div className={`${fontSize} mt-1 font-bold`}>الإجمالي: 500 ريال</div>}
        </div>
      )}

      {layout === 'detailed' && (
        <div className="flex flex-col space-y-1">
          {renderItems()}
          {showPrice && <div className={`${fontSize} mt-1 font-bold`}>الإجمالي: 500 ريال</div>}
          {!isSmallLabel && renderCustomFields()}
        </div>
      )}

      {layout === 'default' && (
        <div className="flex flex-col space-y-1">
          {renderItems()}
          {!isSmallLabel && renderCustomFields()}
          {showPrice && <div className={`${fontSize} mt-1 font-bold`}>الإجمالي: 500 ريال</div>}
        </div>
      )}

      {showBarcode && <div className="mt-1"><Barcode value="1234567890" width={1} height={isSmallLabel?20:30} /></div>}
      {footerNotes && !isSmallLabel && <div className={`${fontSize} mt-auto border-t pt-1`}>{footerNotes}</div>}
    </div>
  );
};

// --------------------- صفحة إعدادات البوليصة الكاملة مع زر PDF ---------------------
export default function PolicySettingsPage() {
  const { toast } = useToast();
  const context = useSettings();

  if (!context || !context.isHydrated) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const { settings, updatePolicySetting } = context;
  const policySettings = settings.policy;

  const handleSettingChange = <K extends keyof PolicySettings>(key: K, value: any) => {
    updatePolicySetting(key, value);
  };

  const handleSave = () => {
    toast({
      title: 'تم الحفظ بنجاح!',
      description: 'تم تحديث إعدادات بوليصة الشحن.',
    });
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('policy-preview');
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const { width, height } = element.getBoundingClientRect();
    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'pt',
      format: [width, height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save('policy.pdf');
  };

  const SwitchControl = ({ id, label, checked }: { id: keyof PolicySettings; label: string; checked: boolean; }) => (
    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
      <Label htmlFor={id}>{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={(val) => handleSettingChange(id, val)} />
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Icon name="ReceiptText" /> إعدادات البوليصة
            </CardTitle>
            <CardDescription>تخصيص شكل ومحتوى بوليصة الشحن التي يتم طباعتها.</CardDescription>
          </div>
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/settings/general"><Icon name="ArrowLeft" /></Link>
          </Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">

          {/* حجم الورق */}
          <Card>
            <CardHeader><CardTitle className="text-lg">حجم الورق</CardTitle></CardHeader>
            <CardContent>
              <RadioGroup value={policySettings.paperSize} onValueChange={(val) => handleSettingChange('paperSize', val)}>
                {['a4','a5','label_4x6','label_4x4','label_3x2','label_2x3','label_4x2'].map(size => (
                  <div key={size} className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value={size} id={size} />
                    <Label htmlFor={size}>{size.replace('_','x').toUpperCase()}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* تصميم البوليصة */}
          <Card>
            <CardHeader><CardTitle className="text-lg">تصميم البوليصة</CardTitle></CardHeader>
            <CardContent>
              <RadioGroup value={policySettings.layout} onValueChange={(val) => handleSettingChange('layout', val)}>
                {['default','compact','detailed'].map(layout => (
                  <div key={layout} className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value={layout} id={`layout-${layout}`} />
                    <Label htmlFor={`layout-${layout}`}>
                      {layout==='default' ? 'التصميم الافتراضي' : layout==='compact' ? 'التصميم المدمج (للملصقات)' : 'التصميم المفصّل'}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* محتوى البوليصة */}
          <Card>
            <CardHeader><CardTitle className="text-lg">محتوى البوليصة</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <SwitchControl id="showCompanyLogo" label="إظهار شعار الشركة" checked={policySettings.showCompanyLogo} />
              <SwitchControl id="showCompanyName" label="إظهار اسم الشركة" checked={policySettings.showCompanyName} />
              <SwitchControl id="showCompanyAddress" label="إظهار عنوان الشركة" checked={policySettings.showCompanyAddress} />
              <Separator />
              <SwitchControl id="showRefNumber" label="إظهار الرقم المرجعي" checked={policySettings.showRefNumber} />
              <SwitchControl id="showItems" label="إظهار تفاصيل المنتجات" checked={policySettings.showItems} />
              <SwitchControl id="showPrice" label="إظهار السعر الإجمالي" checked={policySettings.showPrice} />
              <SwitchControl id="showBarcode" label="إظهار الباركود" checked={policySettings.showBarcode} />
            </CardContent>
          </Card>

          {/* الحقول المخصصة */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الحقول المخصصة</CardTitle>
              <CardDescription>أضف معلومات إضافية للبوليصة.</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomFieldsSection 
                fields={policySettings.customFields}
                onChange={(newFields) => handleSettingChange('customFields', newFields)}
              />
            </CardContent>
          </Card>

          {/* ملاحظات التذييل */}
          <Card>
            <CardHeader><CardTitle className="text-lg">ملاحظات التذييل</CardTitle></CardHeader>
            <CardContent>
              <Textarea 
                value={policySettings.footerNotes} 
                onChange={(e) => handleSettingChange('footerNotes', e.target.value)} 
                placeholder="اكتب ملاحظاتك هنا..." 
                rows={4}
              />
            </CardContent>
          </Card>

        </div>

        {/* المعاينة الحية */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">معاينة حية</CardTitle></CardHeader>
            <CardContent className="bg-muted p-4 sm:p-8 flex flex-col items-center justify-center overflow-auto">
              <PrintablePolicy orders={[]} previewSettings={policySettings} />
              <Button onClick={handleExportPDF} className="mt-4 w-full sm:w-auto flex items-center justify-center">
                <Icon name="Printer" className="ml-2 h-4 w-4" /> تصدير PDF / طباعة
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* زر الحفظ */}
      <div className="flex justify-start pt-6 mt-6 border-t">
        <Button size="lg" onClick={handleSave}>
          <Icon name="Save" className="ml-2 h-4 w-4" /> حفظ التغييرات
        </Button>
      </div>
    </div>
  );
}
