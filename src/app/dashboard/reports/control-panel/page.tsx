'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Save, Eye, Loader2,
  Type, Palette, Settings2, FileText, Image,
  BarChart3, Package, User, Phone, MapPin,
  Calendar, DollarSign, Hash, StickyNote, Building2, Check, X, Printer, Table,
  Pencil, Trash2, Maximize2, ExternalLink, ChevronUp, ChevronDown, GripVertical, ChevronLeft, StickyNote as NotesIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useSettings } from '@/contexts/SettingsContext'
import { cn } from '@/lib/utils'

interface PolicyControls {
  documentType: 'policy'
  size: 'thermal-100x150-portrait' | 'thermal-100x150-landscape' |
  'thermal-100x100' |
  'thermal-80x50-portrait' | 'thermal-80x50-landscape' |
  'thermal-75x50-portrait' | 'thermal-75x50-landscape' |
  'thermal-60x40-portrait' | 'thermal-60x40-landscape' |
  'thermal-50x30-portrait' | 'thermal-50x30-landscape' |
  'thermal-40x30-portrait' | 'thermal-40x30-landscape' |
  'a4-portrait' | 'a4-landscape' |
  'a5-portrait' | 'a5-landscape'
  fontFamily: 'Cairo' | 'Amiri' | 'Tajawal' | 'Noto Sans Arabic'
  fontSize: number
  colorScheme: 'bw' | 'color'
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  logoUrl: string
  logoSize: number
  fields: {
    showLogo: boolean
    showBarcode: boolean
    showRecipient: boolean
    showPhone: boolean
    showAddress: boolean
    showCity: boolean
    showCOD: boolean
    showMerchant: boolean
    showDate: boolean
    showNotes: boolean
  }
  fieldOrder: string[]
  margins: number
  padding: number
  borderWidth: number
  borderRadius: number
  itemSpacing: number
}

const DEFAULT_CONTROLS: PolicyControls = {
  documentType: 'policy',
  size: 'thermal-100x150-portrait',
  fontFamily: 'Cairo',
  fontSize: 12,
  colorScheme: 'color',
  primaryColor: '1e3a5f',
  secondaryColor: '2c5282',
  backgroundColor: 'ffffff',
  logoUrl: '',
  logoSize: 50,
  fields: {
    showLogo: true,
    showBarcode: true,
    showRecipient: true,
    showPhone: true,
    showAddress: true,
    showCity: true,
    showCOD: true,
    showMerchant: true,
    showDate: true,
    showNotes: true,
  },
  fieldOrder: ['recipient', 'phone', 'city', 'address', 'date', 'notes', 'merchant'],
  margins: 5,
  padding: 10,
  borderWidth: 2,
  borderRadius: 4,
  itemSpacing: 6,
}

const PAGE_SIZES = {
  'thermal-100x150-portrait': { width: '100mm', height: '150mm', label: '100×150 عمودي', isThermal: true },
  'thermal-100x150-landscape': { width: '150mm', height: '100mm', label: '100×150 أفقي', isThermal: true },
  'thermal-100x100': { width: '100mm', height: '100mm', label: '100×100 مربع', isThermal: true },
  'thermal-80x50-portrait': { width: '50mm', height: '80mm', label: '80×50 عمودي', isThermal: true },
  'thermal-80x50-landscape': { width: '80mm', height: '50mm', label: '80×50 أفقي', isThermal: true },
  'thermal-60x40-portrait': { width: '40mm', height: '60mm', label: '60×40 عمودي', isThermal: true },
  'thermal-60x40-landscape': { width: '60mm', height: '40mm', label: '60×40 أفقي', isThermal: true },
  'a4-portrait': { width: '210mm', height: '297mm', label: 'A4 عمودي', isThermal: false },
  'a4-landscape': { width: '297mm', height: '210mm', label: 'A4 أفقي', isThermal: false },
  'a5-portrait': { width: '148mm', height: '210mm', label: 'A5 عمودي', isThermal: false },
}

const FONTS = [
  { value: 'Cairo', label: 'Cairo - كايرو' },
  { value: 'Amiri', label: 'Amiri - أميري' },
  { value: 'Tajawal', label: 'Tajawal - تجوال' },
  { value: 'Noto Sans Arabic', label: 'Noto Sans Arabic' },
]

const AVAILABLE_FIELDS = [
  { key: 'showLogo', label: 'الشعار', icon: Building2 },
  { key: 'showBarcode', label: 'الباركود', icon: Hash },
  { key: 'showRecipient', label: 'اسم المستلم', icon: User },
  { key: 'showPhone', label: 'رقم الهاتف', icon: Phone },
  { key: 'showAddress', label: 'العنوان', icon: MapPin },
  { key: 'showCity', label: 'المدينة', icon: Building2 },
  { key: 'showCOD', label: 'المبلغ المطلوب', icon: DollarSign },
  { key: 'showMerchant', label: 'التاجر', icon: Package },
  { key: 'showDate', label: 'التاريخ', icon: Calendar },
  { key: 'showNotes', label: 'الملاحظات', icon: StickyNote },
]

export default function PolicyDesigner() {
  const [controls, setControls] = useState<PolicyControls>(DEFAULT_CONTROLS)
  const [previewHtml, setPreviewHtml] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedTemplates, setSavedTemplates] = useState<any[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  const { toast } = useToast()
  const { settings } = useSettings()

  const companyLogo = settings.login.reportsLogo || settings.login.headerLogo || ''
  const companyName = settings.login.companyName || 'شركة التوصيل'
  const companyPhone = settings.login.socialLinks?.whatsapp || ''

  const updateControl = useCallback((key: keyof PolicyControls, value: any) => {
    setControls(prev => {
      const newControls = { ...prev, [key]: value }
      if (key === 'size' && PAGE_SIZES[value as keyof typeof PAGE_SIZES]?.isThermal) {
        newControls.colorScheme = 'bw'
      }
      return newControls
    })
  }, [])

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...controls.fieldOrder]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]]
      updateControl('fieldOrder', newOrder)
    }
  }

  const toggleField = useCallback((fieldKey: keyof PolicyControls['fields'], value: boolean) => {
    setControls(prev => ({
      ...prev,
      fields: { ...prev.fields, [fieldKey]: value }
    }))
  }, [])

  const generatePolicyHtml = useCallback((controls: PolicyControls, pageSize: any, colorScheme: string, logo: string, company: string, phone: string, isForSave: boolean = false) => {
    const isThermal = pageSize.isThermal;
    const primaryColor = '#' + controls.primaryColor;

    // دالة مساعدة لاختيار القيمة بناءً على الغرض (حفظ أم معاينة)
    const val = (key: string, sample: string) => isForSave ? `{{${key}}}` : sample;

    const renderThermal = () => `
      <div class="policy-wrapper thermal">
        <div class="thermal-container">
          <div class="header-boxes">
            <div class="store-box">
              <span class="merchant-name-label">${val('merchant', 'متجر الإلكترونيات الذكية')}</span>
            </div>
            <div class="barcode-box">
              <svg class="barcode-target" data-value="${val('orderNumber', 'ORD-12345')}"></svg>
              <div class="barcode-text">${val('orderNumber', 'ORD-12345')}</div>
            </div>
          </div>
          
          <div class="fields-list">
            ${controls.fieldOrder.map(key => {
      if (key === 'recipient' && controls.fields.showRecipient) return `<div class="field-box"><span class="f-label">المستلم:</span><span class="f-value">${val('recipient', 'أحمد محمد العلي')}</span></div>`;
      if (key === 'phone' && controls.fields.showPhone) return `<div class="field-box"><span class="f-label">الهاتف:</span><span class="f-value" dir="ltr">${val('phone', '0790123456')}</span></div>`;
      if (key === 'city' && controls.fields.showCity) return `<div class="field-box"><span class="f-label">المدينة:</span><span class="f-value">${val('city', 'عمان')}</span></div>`;
      if (key === 'address' && controls.fields.showAddress) return `<div class="field-box"><span class="f-label">العنوان:</span><span class="f-value">${val('address', 'خلدا، شارع الملك فهد')}</span></div>`;
      if (key === 'date' && controls.fields.showDate) return `<div class="field-box"><span class="f-label">التاريخ:</span><span class="f-value">${val('date', new Date().toLocaleDateString('ar-SA'))}</span></div>`;
      if ((key === 'notes' || key === 'cod_notes') && controls.fields.showNotes) return `<div class="field-box notes-box"><span class="f-label">الملاحظات:</span><span class="f-value">${val('notes', 'يرجى الاتصال قبل الوصول والمنزل خلف المسجد')}</span></div>`;
      if (key === 'merchant' && controls.fields.showMerchant) return `<div class="field-box"><span class="f-label">التاجر:</span><span class="f-value">${val('merchant', 'متجر الإلكترونيات')}</span></div>`;
      return '';
    }).join('')}
          </div>
          
          ${controls.fields.showCOD ? `
            <div class="cod-banner-dark">
              <span>المطلوب: ${val('cod', '125.00')}</span>
              <span class="coin-icon">💰</span>
            </div>
          ` : ''}

          <div class="thermal-footer">
            <div class="footer-line"></div>
            <div class="footer-content">
              <span class="produced-by">بواسطة</span>
              <img src="${logo || ''}" class="mini-logo" />
              <strong class="company-name-footer">${company}</strong>
            </div>
          </div>
        </div>
      </div>
    `;

    const renderStandard = () => `
      <div class="policy-wrapper standard">
        <div class="standard-inner" style="padding: ${controls.margins}mm;">
          
          <!-- Header: Logo & Barcode -->
          <div class="standard-header">
            <div class="logo-section">
              ${controls.fields.showLogo && logo ? `<img src="${logo}" class="main-logo" />` : `<h1>${company}</h1>`}
              <div class="company-details">
                <div class="c-name">${company}</div>
                ${controls.fields.showPhone ? `<div class="c-phone">${phone}</div>` : ''}
              </div>
            </div>
            ${controls.fields.showBarcode ? `
            <div class="barcode-section">
               <svg class="barcode-target" data-value="${val('orderNumber', 'ORD-12345')}" style="height: 45px; width: 200px;"></svg>
               <div class="order-number-text">${val('orderNumber', 'ORD-12345')}</div>
            </div>
            ` : ''}
          </div>

          <!-- Horizontal Boxes: From & To -->
          <div class="info-boxes-row">
            
            <!-- Recipient (Right) -->
            ${controls.fields.showRecipient ? `
            <div class="info-box recipient-box">
              <div class="box-header">
                <span class="icon">👤</span>
                <span class="title">معلومات المستلم (To)</span>
              </div>
              <div class="box-content">
                <div class="name-large">${val('recipient', 'أحمد محمد العلي')}</div>
                ${controls.fields.showPhone ? `
                <div class="row-item">
                   <span class="label">الهاتف:</span>
                   <span class="value" dir="ltr">${val('phone', '0790123456')}</span>
                </div>` : ''}
                ${controls.fields.showAddress || controls.fields.showCity ? `
                <div class="row-item">
                   <span class="label">العنوان:</span>
                   <span class="value">
                     ${controls.fields.showCity ? `${val('city', 'عمان')} - ` : ''}
                     ${controls.fields.showAddress ? val('address', 'اشارة الجبيهة، مجمع رقم 5') : ''}
                   </span>
                </div>` : ''}
              </div>
            </div>
            ` : ''}

            <!-- Sender (Left) -->
            ${controls.fields.showMerchant ? `
            <div class="info-box sender-box">
              <div class="box-header">
                <span class="icon">🏢</span>
                <span class="title">معلومات المرسل (From)</span>
              </div>
              <div class="box-content">
                <div class="name-large">${val('merchant', 'متجر الإلكترونيات')}</div>
                <div class="row-item">
                   <span class="label">مركز الشحن:</span>
                   <span class="value">المستودع الرئيسي</span>
                </div>
                ${controls.fields.showDate ? `
                <div class="row-item">
                   <span class="label">تاريخ الطلب:</span>
                   <span class="value">${val('date', new Date().toLocaleDateString('ar-SA'))}</span>
                </div>` : ''}
              </div>
            </div>
            ` : ''}

          </div>

          <!-- Content Table -->
          <div class="content-area">
             <div class="section-title">📦 تفاصيل الشحنة</div>
             <table class="items-table">
               <thead>
                 <tr>
                   <th>#</th>
                   <th>المنتج / الوصف</th>
                   <th>الكمية</th>
                   <th>الوزن (تقديري)</th>
                 </tr>
               </thead>
               <tbody>
                 <tr>
                   <td>1</td>
                   <td>شحنة عامة (General Parcel)</td>
                   <td>1</td>
                   <td>0.5 Kg</td>
                 </tr>
               </tbody>
             </table>
          </div>

          <!-- Footer: Notes & Totals -->
          <div class="footer-area">
             ${controls.fields.showNotes ? `
             <div class="notes-part">
                <div class="section-title small">📝 ملاحظات التوصيل</div>
                <div class="notes-text-box">
                   ${val('notes', 'يرجى التواصل مع العميل قبل الوصول بنصف ساعة. المنزل يقع خلف المسجد الكبير.')}
                </div>
             </div>
             ` : ''}

             ${controls.fields.showCOD ? `
             <div class="totals-part">
                <div class="total-row">
                   <span>طريقة الدفع:</span>
                   <strong>الدفع عند الاستلام</strong>
                </div>
                <div class="total-row final">
                   <span>المبلغ المطلوب (COD):</span>
                   <strong class="price-tag" style="color: ${primaryColor}">${val('cod', '125.00')} د.أ</strong>
                </div>
             </div>
             ` : ''}
          </div>

          <div class="auth-signatures">
             <div class="sig-block">
               <span>توقيع المستلم</span>
             </div>
             <div class="sig-block">
               <span>ختم الشركة</span>
             </div>
          </div>

          <div class="standard-footer-strip">
            <p>تم إصدار هذه البوليصة إلكترونياً | حقوق الطبع محفوظة &copy; ${new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    `;

    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Amiri:wght@400;700&family=Tajawal:wght@400;700;900&family=Noto+Sans+Arabic:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @page { size: ${pageSize.width} ${pageSize.height}; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { 
      font-family: '${controls.fontFamily}', sans-serif; 
      background: white; 
      color: #000; 
      width: ${pageSize.width}; 
      height: ${pageSize.height}; 
      overflow: hidden; 
      padding: ${controls.margins}mm; 
    }
    
    .thermal-container { 
      height: 100%; 
      border: 2px solid #000; 
      padding: ${controls.padding}px; 
      display: flex; 
      flex-direction: column; 
      border-radius: ${controls.borderRadius}px;
      gap: ${controls.itemSpacing}px;
    }

    .header-boxes { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: ${controls.itemSpacing}px; 
      margin-bottom: ${controls.itemSpacing / 2}px; 
      padding-bottom: ${controls.itemSpacing}px;
      border-bottom: 2px solid #000;
    }

    .store-box, .barcode-box {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: ${controls.borderRadius}px;
      padding: ${controls.padding / 2}px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .merchant-name-label { font-weight: 900; font-size: ${controls.fontSize + 2}px; color: #111827; margin-bottom: 2px; }
    .store-phone { font-weight: bold; font-size: ${controls.fontSize}px; color: #4b5563; }
    
    .barcode-target { height: 40px; width: 100%; }
    .barcode-text { font-family: monospace; font-size: 12px; font-weight: bold; }

    .fields-list { 
      display: flex; 
      flex-direction: column; 
      gap: ${controls.itemSpacing}px; 
      flex: 1;
    }

    .field-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: ${controls.borderRadius}px;
      padding: ${controls.padding / 1.5}px ${controls.padding}px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: ${controls.fontSize}px;
    }

    .f-label { font-weight: 600; color: #4b5563; }
    .f-value { font-weight: bold; color: #111827; }

    .notes-box {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      background: #fef9c3;
      border: 1.5px dashed #ca8a04;
    }
    .notes-box .f-value { text-align: right; width: 100%; font-size: 0.9em; }

    .cod-banner-dark {
      background: #374151;
      color: #fff;
      padding: ${controls.padding}px;
      border-radius: ${controls.borderRadius}px;
      text-align: center;
      font-weight: 900;
      font-size: ${controls.fontSize * 1.5}px;
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .thermal-footer {
      margin-top: ${controls.itemSpacing}px;
      padding-top: ${controls.itemSpacing}px;
    }

    .footer-line { border-top: 1px dashed #ccc; margin-bottom: 8px; }
    .footer-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      color: #6b7280;
      font-size: 11px;
    }
    .mini-logo { height: 16px; width: auto; }
    .company-name-footer { color: #111827; font-weight: 900; }

    /* Standard Styles (Horizontal/Wide) */
    .standard { width: 100%; height: 100%; font-size: ${controls.fontSize}px; color: #333; }
    .standard-inner { height: 100%; display: flex; flex-direction: column; }
    
    /* Header */
    .standard-header { 
        display: flex; 
        justify-content: space-between; 
        align-items: flex-start;
        padding-bottom: 20px;
        margin-bottom: 25px;
        border-bottom: 3px solid ${primaryColor};
    }
    .logo-section { display: flex; flex-direction: column; align-items: flex-start; }
    .main-logo { height: 75px; object-fit: contain; margin-bottom: 5px; }
    .company-details .c-name { font-weight: 800; font-size: 16px; color: ${primaryColor}; }
    .company-details .c-phone { font-size: 12px; color: #555; }
    .company-details .c-web { font-size: 12px; color: #3b82f6; }
    .barcode-section { text-align: left; }
    .order-number-text { font-family: monospace; font-weight: bold; font-size: 14px; text-align: center; margin-top: 2px; }

    /* Horizontal Boxes */
    .info-boxes-row { display: flex; gap: 20px; margin-bottom: 30px; }
    .info-box { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; background: #f8fafc; overflow: hidden; }
    .box-header { 
        background: #f1f5f9; 
        padding: 10px 15px; 
        border-bottom: 1px solid #e2e8f0; 
        display: flex; 
        align-items: center; 
        gap: 8px; 
        font-weight: bold; 
        color: ${primaryColor};
    }
    .box-content { padding: 15px; }
    .name-large { font-size: 18px; font-weight: 800; margin-bottom: 10px; color: #000; }
    .row-item { margin-bottom: 5px; font-size: 13px; display: flex; gap: 5px; }
    .row-item .label { color: #64748b; font-weight: 600; min-width: 60px; }
    .row-item .value { font-weight: 700; color: #334155; }

    /* Items Table */
    .content-area { margin-bottom: 30px; }
    .section-title { font-weight: 800; color: ${primaryColor}; margin-bottom: 10px; font-size: 14px; border-right: 4px solid ${primaryColor}; padding-right: 10px; }
    .items-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .items-table th { background: ${primaryColor}; color: white; padding: 10px; text-align: center; font-weight: 600; }
    .items-table td { border-bottom: 1px solid #e2e8f0; padding: 10px; text-align: center; color: #1e293b; }

    /* Footer Areas */
    .footer-area { display: flex; gap: 25px; align-items: flex-start; margin-bottom: 25px; }
    .notes-part { flex: 1; }
    .notes-text-box { background: #fffbeb; border: 1px dashed #eab308; padding: 10px; border-radius: 6px; font-size: 12px; color: #854d0e; min-height: 50px; }
    
    .totals-part { width: 280px; border: 2px solid #e2e8f0; border-radius: 12px; padding: 15px; background: #fff; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #64748b; }
    .total-row.final { margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0; color: #000; font-size: 15px; align-items: center; }
    .price-tag { font-size: 20px; font-weight: 900; }

    .auth-signatures { display: flex; justify-content: space-between; margin-top: auto; padding: 0 40px; }
    .sig-block { text-align: center; border-top: 1px solid #cbd5e1; padding-top: 10px; width: 150px; color: #94a3b8; font-size: 12px; }

    .standard-footer-strip { margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 10px; text-align: center; color: #cbd5e1; font-size: 10px; }
  </style>
</head>
<body>
  ${isThermal ? renderThermal() : renderStandard()}
  <script>
    window.onload = function() {
      const barcodes = document.querySelectorAll('.barcode-target[data-value]');
      barcodes.forEach(function(svg) {
        const value = svg.getAttribute('data-value');
        if (value && typeof JsBarcode !== 'undefined') {
          JsBarcode(svg, value, { format: 'CODE128', width: 2, height: 40, displayValue: false, margin: 0 });
        }
      });
    }
  </script>
</body>
</html>`
  }, []);

  useEffect(() => {
    const pageSize = PAGE_SIZES[controls.size as keyof typeof PAGE_SIZES];
    // المعاينة تستخدم بيانات واقعية بدلاً من المتغيرات
    const html = generatePolicyHtml(controls, pageSize, controls.colorScheme, companyLogo, companyName, companyPhone, false);
    setPreviewHtml(html);

    const timer = setTimeout(async () => {
      setIsLoadingPreview(true);
      try {
        const response = await fetch('/api/pdf-playwright', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html, width: parseFloat(pageSize.width), height: parseFloat(pageSize.height) })
        });
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPreviewPdfUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
        }
      } finally { setIsLoadingPreview(false); }
    }, 500);
    return () => clearTimeout(timer);
  }, [controls, companyLogo, companyName, companyPhone, generatePolicyHtml]);

  const loadSavedTemplates = async () => {
    try {
      const res = await fetch('/api/saved-templates?documentType=policy');
      if (res.ok) {
        const data = await res.json();
        setSavedTemplates(data.templates || []);
      }
    } catch (e) { console.error(e); }
  }

  useEffect(() => { loadSavedTemplates(); }, []);

  const deleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('هل أنت متأكد من حذف هذا القالب؟')) return;
    try {
      const res = await fetch(`/api/saved-templates?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: "🗑️ تم الحذف", description: "تم حذف القالب بنجاح" });
        loadSavedTemplates();
        if (selectedTemplateId === id) setSelectedTemplateId(null);
      }
    } catch (e) { console.error(e); }
  }

  const saveTemplate = async () => {
    if (!templateName.trim()) return;
    setIsSaving(true);
    try {
      // عند كبس "حفظ"، نقوم بتوليد HTML يحتوي على المتغيرات {{variable}} فعلياً ليتم تخزينها
      const pageSize = PAGE_SIZES[controls.size as keyof typeof PAGE_SIZES];
      const finalHtmlWithVars = generatePolicyHtml(controls, pageSize, controls.colorScheme, companyLogo, companyName, companyPhone, true);

      const res = await fetch('/api/saved-templates', {
        method: selectedTemplateId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTemplateId,
          name: templateName.trim(),
          settings: controls,
          html: finalHtmlWithVars,
          documentType: 'policy'
        })
      });
      if (res.ok) {
        toast({ title: "✅ تم الحفظ", description: "تم حفظ القالب بنجاح" });
        loadSavedTemplates();
        setShowSaveDialog(false);
      }
    } finally { setIsSaving(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8" dir="rtl">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/dashboard" className="hover:text-primary transition-colors">لوحة التحكم</Link>
          <ChevronLeft className="h-4 w-4" />
          <Link href="/dashboard/settings" className="hover:text-primary transition-colors">الإعدادات</Link>
          <ChevronLeft className="h-4 w-4" />
          <Link href="/dashboard/reports" className="hover:text-primary transition-colors">مركز التقارير</Link>
          <ChevronLeft className="h-4 w-4" />
          <span className="text-foreground font-medium">مصمم بوالص الشحن</span>
        </nav>

        {/* Modern Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 border border-white/10 p-8 lg:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
                  <Package className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight flex items-center gap-3">
                    مصمم بوالص الشحن
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full animate-pulse">PRO</span>
                  </h1>
                  <p className="text-blue-100/80 text-lg font-medium mt-2">خصص بوالص شحن شركتك بأعلى المعايير العالمية</p>
                </div>
              </div>
            </div>
            <Link href="/dashboard/reports">
              <Button variant="secondary" className="h-14 px-8 rounded-2xl gap-3 bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md transition-all">
                <ArrowRight className="h-5 w-5" />
                <span className="font-bold">الرجوع للمركز</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-[450px,1fr] gap-8 items-start">
          {/* Dashboard-style Sidebar */}
          <div className="space-y-6">
            <Tabs defaultValue={controls.size.startsWith('thermal') ? 'thermal' : 'standard'} className="w-full" onValueChange={(v) => {
              if (v === 'thermal') {
                updateControl('size', 'thermal-100x150-portrait');
                updateControl('colorScheme', 'bw');
              } else {
                updateControl('size', 'a4-portrait');
                updateControl('colorScheme', 'color');
              }
            }}>
              <TabsList className="w-full h-14 bg-white/50 backdrop-blur-sm border rounded-2xl p-1 gap-1 mb-6">
                <TabsTrigger value="thermal" className="flex-1 rounded-xl gap-2 font-bold data-[state=active]:bg-black data-[state=active]:text-white">
                  <Printer className="h-4 w-4" /> حراري (B/W)
                </TabsTrigger>
                <TabsTrigger value="standard" className="flex-1 rounded-xl gap-2 font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  <FileText className="h-4 w-4" /> قياسي (A4/A5)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="thermal" className="space-y-6">
                <Card className="border-0 shadow-xl shadow-indigo-500/5 overflow-hidden">
                  <div className="h-1.5 w-full bg-black" />
                  <CardHeader><CardTitle className="text-lg font-bold">إعدادات الورق الحراري</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">حجم الملصق</Label>
                      <Select value={controls.size} onValueChange={(v: any) => updateControl('size', v)}>
                        <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(PAGE_SIZES).filter(([_, s]) => s.isThermal).map(([id, size]) => (
                            <SelectItem key={id} value={id} className="text-right">{size.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="standard" className="space-y-6">
                <Card className="border-0 shadow-xl shadow-indigo-500/5 overflow-hidden">
                  <div className="h-1.5 w-full bg-indigo-500" />
                  <CardHeader><CardTitle className="text-lg font-bold">إعدادات الورق القياسي</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">حجم الورقة</Label>
                      <Select value={controls.size} onValueChange={(v: any) => updateControl('size', v)}>
                        <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(PAGE_SIZES).filter(([_, s]) => !s.isThermal).map(([id, size]) => (
                            <SelectItem key={id} value={id} className="text-right">{size.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="mt-8 space-y-6">
                <Tabs defaultValue="style" className="w-full">
                  <TabsList className="w-full h-12 bg-gray-100/50 rounded-xl p-1">
                    <TabsTrigger value="style" className="flex-1 rounded-lg gap-2 font-bold text-xs"><Palette className="h-3.5 w-3.5" /> الاستايل</TabsTrigger>
                    <TabsTrigger value="content" className="flex-1 rounded-lg gap-2 font-bold text-xs"><Settings2 className="h-3.5 w-3.5" /> المحتوى</TabsTrigger>
                    <TabsTrigger value="layout" className="flex-1 rounded-lg gap-2 font-bold text-xs"><Maximize2 className="h-3.5 w-3.5" /> الهوامش</TabsTrigger>
                  </TabsList>

                  <TabsContent value="style" className="mt-4 space-y-4">
                    <Card className="border-0 shadow-lg shadow-gray-500/5 overflow-hidden">
                      <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-700">الخط العربي</Label>
                            <Select value={controls.fontFamily} onValueChange={(v: any) => updateControl('fontFamily', v)}>
                              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                              <SelectContent>{FONTS.map(f => <SelectItem key={f.value} value={f.value} className="text-right">{f.label}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-700">حجم الخط</Label>
                            <Slider value={[controls.fontSize]} onValueChange={([v]) => updateControl('fontSize', v)} min={8} max={24} />
                          </div>
                        </div>
                        {!controls.size.startsWith('thermal') && (
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                              <Label className="text-sm font-bold text-gray-700">اللون الأساسي</Label>
                              <Input type="color" value={'#' + controls.primaryColor} onChange={(e) => updateControl('primaryColor', e.target.value.slice(1))} className="h-11 cursor-pointer" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-bold text-gray-700">نمط الألوان</Label>
                              <Select value={controls.colorScheme} onValueChange={(v: any) => updateControl('colorScheme', v)}>
                                <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="color" className="text-right">ألوان</SelectItem>
                                  <SelectItem value="bw" className="text-right">أبيض وأسود</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="content" className="mt-4 space-y-4">
                    <Card className="border-0 shadow-lg shadow-gray-500/5 overflow-hidden">
                      <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          {AVAILABLE_FIELDS.map(field => (
                            <div key={field.key} onClick={() => toggleField(field.key as any, !controls.fields[field.key as keyof typeof controls.fields])}
                              className={cn("flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all", controls.fields[field.key as keyof typeof controls.fields] ? "border-blue-500 bg-blue-50" : "border-gray-50 opacity-60")}>
                              <field.icon className="h-4 w-4" />
                              <span className="font-bold text-[10px]">{field.label}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-4 space-y-2">
                          <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ترتيب العناصر</Label>
                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                            {controls.fieldOrder.map((key, i) => (
                              <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="font-bold text-xs text-gray-600">{AVAILABLE_FIELDS.find(f => f.key === `show${key.charAt(0).toUpperCase() + key.slice(1)}` || f.key === key)?.label || key}</span>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveField(i, 'up')} disabled={i === 0}><ChevronUp className="h-3 w-3" /></Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveField(i, 'down')} disabled={i === controls.fieldOrder.length - 1}><ChevronDown className="h-3 w-3" /></Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="layout" className="mt-4 space-y-4">
                    <Card className="border-0 shadow-lg shadow-gray-500/5 overflow-hidden">
                      <CardContent className="pt-6 space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center"><Label className="text-xs font-bold">الهوامش (mm)</Label><span className="text-xs font-bold text-blue-600">{controls.margins}mm</span></div>
                          <Slider value={[controls.margins]} onValueChange={([v]) => updateControl('margins', v)} max={20} step={1} />
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center"><Label className="text-xs font-bold">المسافات الداخلية (px)</Label><span className="text-xs font-bold text-blue-600">{controls.padding}px</span></div>
                          <Slider value={[controls.padding]} onValueChange={([v]) => updateControl('padding', v)} max={40} step={1} />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </Tabs>

            {/* Saved Templates */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-1.5 w-full bg-blue-600" />
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" /> القوالب المحفوظة ({savedTemplates.length})
                  </CardTitle>
                  {selectedTemplateId && (
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedTemplateId(null);
                      setTemplateName('');
                      setControls(DEFAULT_CONTROLS);
                    }} className="h-8 rounded-lg text-[10px] font-black border-blue-200 text-blue-600 hover:bg-blue-50">
                      تصميم جديد +
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar">
                {savedTemplates.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Package className="h-10 w-10 mx-auto opacity-10 mb-2" />
                    <p className="text-xs font-bold">لا يوجد قوالب محفوظة حالياً</p>
                  </div>
                )}
                {savedTemplates.map(t => (
                  <div key={t.id} onClick={() => {
                    setControls(t.settings);
                    setSelectedTemplateId(t.id);
                    setTemplateName(t.name);
                  }} className={cn(
                    "relative group p-4 rounded-xl border-2 transition-all cursor-pointer",
                    selectedTemplateId === t.id ? "border-blue-600 bg-blue-50 shadow-md" : "border-gray-50 hover:border-blue-200"
                  )}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={cn("font-bold transition-all", selectedTemplateId === t.id ? "text-blue-900" : "text-gray-900")}>{t.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{PAGE_SIZES[t.settings?.size as keyof typeof PAGE_SIZES]?.label || t.settings?.size}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" onClick={(e) => deleteTemplate(t.id, e)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => setShowSaveDialog(true)} className={cn(
                "h-14 rounded-2xl font-bold shadow-lg transition-all",
                selectedTemplateId ? "bg-indigo-600 shadow-indigo-500/20" : "bg-blue-600 shadow-blue-500/20"
              )}>
                <Save className="h-5 w-5 ml-2" />
                {selectedTemplateId ? 'تحديث القالب الحالي' : 'حفظ كقالب جديد'}
              </Button>
              <Button variant="outline" onClick={() => window.open(previewPdfUrl!, '_blank')} className="h-14 rounded-2xl border-2 font-bold hover:bg-gray-50"><ExternalLink className="h-5 w-5 ml-2" /> معاينة PDF</Button>
            </div>
          </div>

          {/* Luxury Preview */}
          <div className="sticky top-8 space-y-6">
            <Card className="border-0 shadow-2xl bg-gray-900 rounded-[32px] overflow-hidden group">
              <div className="aspect-[1/1.4] relative bg-gray-800 flex items-center justify-center p-8">
                {isLoadingPreview && (
                  <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-[32px]">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-white font-bold animate-pulse">جاري تحديث المعاينة الفخمة...</p>
                    </div>
                  </div>
                )}
                {previewPdfUrl ? (
                  <iframe src={`${previewPdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} className="w-full h-full rounded-2xl shadow-2xl border-0" />
                ) : (
                  <div className="text-gray-500 flex flex-col items-center gap-4">
                    <Eye className="h-16 w-16 opacity-20" />
                    <p className="font-bold">جاري تحميل المعاينة...</p>
                  </div>
                )}
              </div>
            </Card>
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-500 text-white rounded-2xl"><StickyNote className="h-6 w-6" /></div>
              <p className="text-amber-900 text-sm font-bold leading-relaxed">تأكد من ضبط "Margins: None" عند الطباعة من المتصفح للحصول على أفضل النتائج.</p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl rounded-3xl p-8 bg-white/95 backdrop-blur-xl">
          <DialogTitle className="text-2xl font-black text-right mb-6">
            {selectedTemplateId ? '📝 تعديل القالب' : '💾 حفظ قالب جديد'}
          </DialogTitle>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700">اسم القالب</Label>
              <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="مثال: بوليصة حرارية 100ملم" className="h-14 rounded-2xl text-lg font-bold" />
            </div>
            <Button onClick={saveTemplate} disabled={isSaving || !templateName.trim()} className={cn(
              "w-full h-16 rounded-2xl text-lg font-black transition-all",
              selectedTemplateId ? "bg-indigo-600 hover:bg-indigo-700" : "bg-blue-600 hover:bg-blue-700"
            )}>
              {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : (selectedTemplateId ? 'تحديث التغييرات' : 'تأكيد وحفظ القالب')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  )
}
