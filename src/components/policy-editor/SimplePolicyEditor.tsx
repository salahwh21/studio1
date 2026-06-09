'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/icon';
import {
  openPdfInNewTab,
  generatePdf
} from '@/services/pdf-service';
import {
  createStandardPolicyHtml,
  createThermalLabelHtml,
} from '@/services/pdf-templates';
import Barcode from 'react-barcode';

// القياسات الحقيقية المستخدمة
const PAPER_SIZES = {
  '100x150': { width: 100, height: 150, label: '100×150 مم' },
  '100x100': { width: 100, height: 100, label: '100×100 مم' },
  '75x50': { width: 75, height: 50, label: '75×50 مم' },
  '60x40': { width: 60, height: 40, label: '60×40 مم' },
  '50x30': { width: 50, height: 30, label: '50×30 مم' }
};

// أنواع البوالص
const POLICY_TYPES = {
  standard: 'بوليصة عادية',
  colored: 'بوليصة ملونة',
  thermal: 'ملصق حراري'
};

interface SimplePolicyEditorProps {
  onClose?: () => void;
}

export const SimplePolicyEditor: React.FC<SimplePolicyEditorProps> = ({ onClose }) => {
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  // إعدادات البوليصة
  const [settings, setSettings] = useState({
    policyType: 'thermal' as keyof typeof POLICY_TYPES,
    paperSize: '100x150' as keyof typeof PAPER_SIZES,
    companyName: 'شركة التوصيل السريع',
    showBarcode: true,
    showCOD: true,
    showPhone: true,
    showAddress: true,
    showNotes: false,
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af'
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showEmbeddedPreview, setShowEmbeddedPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // بيانات العينة
  const sampleOrder = {
    id: '12345',
    orderNumber: 12345,
    recipient: 'أحمد محمد علي',
    phone: '0501234567',
    address: 'شارع الملك فهد، حي النزهة، مبنى رقم 123',
    city: 'الرياض',
    region: 'منطقة الرياض',
    cod: 150,
    merchant: 'متجر الإلكترونيات الحديثة',
    date: new Date().toLocaleDateString('ar-SA'),
    notes: 'يرجى التسليم في المساء'
  };

  const currentSize = PAPER_SIZES[settings.paperSize];
  const mmToPx = (mm: number) => mm * 3.7795;

  // تنظيف الموارد عند إغلاق المكون
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // تحديث المعاينة تلقائياً عند تغيير الإعدادات
  useEffect(() => {
    if (showEmbeddedPreview) {
      const timer = setTimeout(() => {
        handlePreviewPDF();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [settings.policyType, settings.paperSize, settings.companyName, settings.primaryColor, settings.secondaryColor, settings.showBarcode, settings.showCOD, settings.showPhone, settings.showAddress, settings.showNotes]);

  // إنشاء HTML للبوليصة
  const createPolicyHTML = () => {
    const policyData = {
      companyName: settings.companyName,
      orderNumber: sampleOrder.orderNumber,
      recipient: sampleOrder.recipient,
      phone: sampleOrder.phone,
      address: sampleOrder.address,
      city: sampleOrder.city,
      region: sampleOrder.region,
      cod: sampleOrder.cod,
      merchant: sampleOrder.merchant,
      date: sampleOrder.date,
      notes: settings.showNotes ? sampleOrder.notes : '',
      barcode: sampleOrder.id
    };

    switch (settings.policyType) {
      case 'thermal':
        return createThermalLabelHtml(policyData, {
          width: currentSize.width,
          height: currentSize.height
        });
      case 'colored':
      case 'standard':
      default:
        // Use the restored standard policy
        return createStandardPolicyHtml(policyData, {
          width: currentSize.width,
          height: currentSize.height
        });
    }
  };

  // معاينة PDF مدمجة
  const handlePreviewPDF = async () => {
    setIsPreviewing(true);
    try {
      const html = createPolicyHTML();

      // محاولة إنشاء PDF عبر Playwright للمعاينة
      try {
        const response = await fetch('/api/pdf-playwright', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            html,
            filename: 'preview.pdf',
            width: currentSize.width,
            height: currentSize.height
          }),
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);

          // تنظيف URL السابق
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }

          setPreviewUrl(url);
          setShowEmbeddedPreview(true);
          toast({ title: 'تم إنشاء المعاينة', description: 'يمكنك الآن رؤية البوليصة كـ PDF' });
        } else {
          throw new Error('فشل في إنشاء PDF');
        }
      } catch (error) {
        console.warn('PDF generation failed, using HTML preview:', error);

        // العودة إلى معاينة HTML
        const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
        const url = URL.createObjectURL(blob);

        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(url);
        setShowEmbeddedPreview(true);
        toast({ title: 'معاينة HTML', description: 'يتم عرض المعاينة كـ HTML' });
      }
    } catch (error: any) {
      console.error('Preview error:', error);
      toast({ variant: 'destructive', title: 'فشل المعاينة', description: error.message });
    } finally {
      setIsPreviewing(false);
    }
  };

  // تصدير PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const html = createPolicyHTML();
      const filename = `policy_${settings.policyType}_${settings.paperSize}.pdf`;

      const blob = await generatePdf(html, {
        width: currentSize.width,
        height: currentSize.height,
        filename
      });

      const { downloadPdf } = await import('@/services/pdf-service');
      downloadPdf(blob, filename);

      toast({ title: 'تم التصدير', description: 'تم تصدير البوليصة بنجاح' });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({ variant: 'destructive', title: 'فشل التصدير', description: error.message });
    } finally {
      setIsExporting(false);
    }
  };

  // عرض PDF في تبويب جديد
  const handleOpenPDFInNewTab = async () => {
    try {
      const html = createPolicyHTML();
      const filename = `policy_${settings.policyType}_${settings.paperSize}.pdf`;

      await openPdfInNewTab(html, filename, {
        width: currentSize.width,
        height: currentSize.height
      });

      toast({
        title: 'تم فتح PDF',
        description: 'تم فتح البوليصة في تبويب جديد'
      });
    } catch (error: any) {
      console.error('Open PDF error:', error);
      toast({
        variant: 'destructive',
        title: 'فشل فتح PDF',
        description: error.message
      });
    }
  };

  // طباعة مباشرة
  const handlePrint = async () => {
    try {
      const html = createPolicyHTML();
      await generatePdf(html, `policy_${settings.policyType}_${settings.paperSize}.pdf`);
      toast({ title: 'تم الإرسال للطباعة', description: 'تم إرسال البوليصة للطابعة' });
    } catch (error: any) {
      console.error('Print error:', error);
      toast({ variant: 'destructive', title: 'فشل الطباعة', description: error.message });
    }
  };

  // رندر البوليصة حسب النوع
  const renderPolicy = () => {
    const containerStyle: React.CSSProperties = {
      width: `${mmToPx(currentSize.width)}px`,
      height: `${mmToPx(currentSize.height)}px`,
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      fontSize: settings.policyType === 'thermal' ? '10px' : '12px',
      fontFamily: 'Arial, sans-serif',
      direction: 'rtl',
      textAlign: 'right'
    };

    return (
      <div style={containerStyle}>
        {settings.policyType === 'thermal' ? (
          // ملصق حراري
          <div style={{ padding: '8px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: settings.primaryColor }}>
                {settings.companyName}
              </div>
              <div style={{ fontSize: '10px', marginTop: '4px' }}>
                طلب رقم: {sampleOrder.orderNumber}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>
                {sampleOrder.recipient}
              </div>
              {settings.showPhone && (
                <div style={{ fontSize: '8px', marginBottom: '2px' }}>
                  📱 {sampleOrder.phone}
                </div>
              )}
              {settings.showAddress && (
                <div style={{ fontSize: '8px', marginBottom: '4px' }}>
                  📍 {sampleOrder.address}
                </div>
              )}
            </div>

            {settings.showCOD && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '6px',
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: 'bold',
                marginBottom: '8px',
                borderRadius: '4px'
              }}>
                {sampleOrder.cod} ريال
              </div>
            )}

            {settings.showBarcode && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '8px', fontFamily: 'monospace' }}>
                  ||||| {sampleOrder.id} |||||
                </div>
              </div>
            )}
          </div>
        ) : (
          // بوليصة عادية
          <div style={{ padding: '16px', height: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #e5e7eb' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: settings.primaryColor }}>
                {settings.companyName}
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                بوليصة شحن
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                رقم الطلب: {sampleOrder.orderNumber}
              </div>
              <div style={{ fontSize: '10px' }}>
                التاريخ: {sampleOrder.date}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: settings.primaryColor }}>
                معلومات المستلم
              </div>
              <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
                <div><strong>الاسم:</strong> {sampleOrder.recipient}</div>
                {settings.showPhone && <div><strong>الهاتف:</strong> {sampleOrder.phone}</div>}
                {settings.showAddress && <div><strong>العنوان:</strong> {sampleOrder.address}</div>}
                <div><strong>المدينة:</strong> {sampleOrder.city} - {sampleOrder.region}</div>
              </div>
            </div>

            {settings.showCOD && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '2px solid #fecaca',
                padding: '12px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '16px',
                borderRadius: '6px'
              }}>
                المبلغ المستحق: {sampleOrder.cod} ريال
              </div>
            )}

            {settings.showNotes && sampleOrder.notes && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: settings.primaryColor }}>
                  ملاحظات
                </div>
                <div style={{ fontSize: '10px', backgroundColor: '#f8f9fa', padding: '8px', borderRadius: '4px' }}>
                  {sampleOrder.notes}
                </div>
              </div>
            )}

            {settings.showBarcode && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <div style={{ fontSize: '10px', fontFamily: 'monospace' }}>
                  ||||| {sampleOrder.id} |||||
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* لوحة الإعدادات */}
      <div className="w-80 bg-white border-r p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* مزايا النظام الجديد */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-800 flex items-center gap-2">
                <Icon name="Zap" className="h-4 w-4" />
                النظام الجديد المحسّن
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-xs text-green-700 space-y-1">
                <li>✅ طباعة المتصفح الموثوقة</li>
                <li>✅ دعم عربي كامل</li>
                <li>✅ أحجام دقيقة</li>
                <li>✅ معاينة فورية</li>
                <li>✅ تصدير محسّن</li>
              </ul>
            </CardContent>
          </Card>

          {/* نوع البوليصة */}
          <div className="space-y-2">
            <Label>نوع البوليصة</Label>
            <Select
              value={settings.policyType}
              onValueChange={(value: keyof typeof POLICY_TYPES) =>
                setSettings(prev => ({ ...prev, policyType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(POLICY_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* حجم الورق */}
          <div className="space-y-2">
            <Label>حجم الورق</Label>
            <Select
              value={settings.paperSize}
              onValueChange={(value: keyof typeof PAPER_SIZES) =>
                setSettings(prev => ({ ...prev, paperSize: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAPER_SIZES).map(([key, size]) => (
                  <SelectItem key={key} value={key}>{size.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* اسم الشركة */}
          <div className="space-y-2">
            <Label>اسم الشركة</Label>
            <Input
              value={settings.companyName}
              onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
              placeholder="اسم الشركة"
            />
          </div>

          {/* الألوان */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اللون الأساسي</Label>
              <Input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>اللون الثانوي</Label>
              <Input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
              />
            </div>
          </div>

          {/* خيارات العرض */}
          <div className="space-y-3">
            <Label>خيارات العرض</Label>
            <div className="space-y-2">
              {[
                { key: 'showBarcode', label: 'إظهار الباركود' },
                { key: 'showCOD', label: 'إظهار المبلغ المستحق' },
                { key: 'showPhone', label: 'إظهار رقم الهاتف' },
                { key: 'showAddress', label: 'إظهار العنوان' },
                { key: 'showNotes', label: 'إظهار الملاحظات' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id={key}
                    checked={settings[key as keyof typeof settings] as boolean}
                    onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={key} className="text-sm">{label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* أزرار العمليات */}
          <div className="space-y-3 pt-4 border-t">
            <Button
              onClick={handlePreviewPDF}
              disabled={isPreviewing}
              variant="outline"
              className="w-full"
            >
              <Icon name={isPreviewing ? "Loader2" : "Eye"} className={`ml-2 h-4 w-4 ${isPreviewing ? "animate-spin" : ""}`} />
              {isPreviewing ? "جاري المعاينة..." : "معاينة مدمجة"}
            </Button>

            {showEmbeddedPreview && (
              <Button
                onClick={() => {
                  setShowEmbeddedPreview(false);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }
                }}
                variant="outline"
                className="w-full"
              >
                <Icon name="X" className="ml-2 h-4 w-4" />
                إغلاق المعاينة
              </Button>
            )}

            <Button
              onClick={handleOpenPDFInNewTab}
              variant="outline"
              className="w-full bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100 text-purple-700 hover:text-purple-800"
            >
              <Icon name="ExternalLink" className="ml-2 h-4 w-4" />
              عرض PDF في تبويب جديد
            </Button>

            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="w-full"
            >
              <Icon name={isExporting ? "Loader2" : "Download"} className={`ml-2 h-4 w-4 ${isExporting ? "animate-spin" : ""}`} />
              {isExporting ? "جاري التصدير..." : "تصدير PDF"}
            </Button>

            <Button
              onClick={handlePrint}
              variant="secondary"
              className="w-full"
            >
              <Icon name="Printer" className="ml-2 h-4 w-4" />
              طباعة
            </Button>
          </div>
        </div>
      </div>

      {/* منطقة المعاينة */}
      <div className="flex-1 bg-gray-50 p-8 overflow-auto">
        {showEmbeddedPreview && previewUrl ? (
          // معاينة مدمجة للـ PDF/HTML
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">معاينة البوليصة</h3>
              <div className="flex gap-2">
                <Button
                  onClick={handleOpenPDFInNewTab}
                  size="sm"
                  variant="outline"
                  className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100 text-purple-700 hover:text-purple-800"
                >
                  <Icon name="ExternalLink" className="ml-2 h-4 w-4" />
                  فتح في تبويب جديد
                </Button>
                <Button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Icon name={isExporting ? "Loader2" : "Download"} className={`ml-2 h-4 w-4 ${isExporting ? "animate-spin" : ""}`} />
                  {isExporting ? "جاري التصدير..." : "تحميل"}
                </Button>
                <Button
                  onClick={handlePrint}
                  size="sm"
                  variant="outline"
                >
                  <Icon name="Printer" className="ml-2 h-4 w-4" />
                  طباعة
                </Button>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="معاينة البوليصة"
                style={{ minHeight: '600px' }}
              />
            </div>
          </div>
        ) : (
          // المعاينة التفاعلية العادية
          <div className="flex items-center justify-center min-h-full">
            <div className="text-center">
              <div ref={previewRef} className="mb-6">
                {renderPolicy()}
              </div>
              <div className="text-sm text-gray-600 bg-white p-4 rounded-lg shadow-sm max-w-md">
                <p className="mb-2">💡 <strong>نصيحة:</strong></p>
                <p>اضغط على "معاينة مدمجة" لرؤية البوليصة كما ستظهر في PDF الفعلي</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};