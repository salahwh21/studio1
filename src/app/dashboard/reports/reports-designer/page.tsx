'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Save, Eye, Loader2,
  Type, Palette, Settings2, FileText, Image,
  BarChart3, Package, User, Phone, MapPin,
  Calendar, DollarSign, Hash, StickyNote, Building2, Check, X, Printer, Table,
  Pencil, Trash2, Maximize2, ExternalLink, ChevronLeft
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

interface ReportControls {
  documentType: 'report'
  size: 'a4-portrait' | 'a4-landscape' | 'a5-portrait' | 'a5-landscape'
  reportType: 'cash_from_driver' | 'cash_to_merchant' | 'returns_from_driver' | 'returns_to_merchant' | 'custom_export'
  fontFamily: 'Cairo' | 'Amiri' | 'Tajawal' | 'Noto Sans Arabic'
  fontSize: number
  colorScheme: 'bw' | 'color'
  primaryColor: string
  backgroundColor: string
  fields: {
    showLogo: boolean
    showDate: boolean
    showNotes: boolean
    showStats: boolean
    showTable: boolean
    showSummary: boolean
    showSignatures: boolean
  }
  margins: number
  padding: number
  borderRadius: number
}

const DEFAULT_CONTROLS: ReportControls = {
  documentType: 'report',
  size: 'a4-portrait',
  reportType: 'cash_from_driver',
  fontFamily: 'Cairo',
  fontSize: 12,
  colorScheme: 'color',
  primaryColor: '1e3a5f',
  backgroundColor: 'ffffff',
  fields: {
    showLogo: true,
    showDate: true,
    showNotes: true,
    showStats: true,
    showTable: true,
    showSummary: true,
    showSignatures: true,
  },
  margins: 10,
  padding: 10,
  borderRadius: 8,
}

const PAGE_SIZES = {
  'a4-portrait': { width: '210mm', height: '297mm', label: 'A4 عمودي', isThermal: false },
  'a4-landscape': { width: '297mm', height: '210mm', label: 'A4 أفقي', isThermal: false },
  'a5-portrait': { width: '148mm', height: '210mm', label: 'A5 عمودي', isThermal: false },
  'a5-landscape': { width: '210mm', height: '148mm', label: 'A5 أفقي', isThermal: false },
}

const REPORT_TYPES = [
  { value: 'cash_from_driver', label: 'استلام أموال من السائق' },
  { value: 'cash_to_merchant', label: 'تسليم أموال للتاجر' },
  { value: 'returns_from_driver', label: 'استلام مرتجعات من السائق' },
  { value: 'returns_to_merchant', label: 'تسليم مرتجعات للتاجر' },
  { value: 'custom_export', label: 'تصدير بيانات مخصصة' },
]

const AVAILABLE_SECTIONS = [
  { key: 'showLogo', label: 'شعار الشركة', icon: Building2 },
  { key: 'showDate', label: 'تاريخ التقرير', icon: Calendar },
  { key: 'showStats', label: 'بطاقات الإحصائيات', icon: BarChart3 },
  { key: 'showTable', label: 'جدول البيانات الرئيسي', icon: Table },
  { key: 'showSummary', label: 'الملخص المالي', icon: DollarSign },
  { key: 'showSignatures', label: 'قسم التوقيعات والختم', icon: Pencil },
  { key: 'showNotes', label: 'الملاحظات', icon: StickyNote },
]

const FONTS = [
  { value: 'Cairo', label: 'Cairo - كايرو' },
  { value: 'Amiri', label: 'Amiri - أميري' },
  { value: 'Tajawal', label: 'Tajawal - تجوال' },
  { value: 'Noto Sans Arabic', label: 'Noto Sans Arabic' },
]

export default function ReportsDesigner() {
  const [controls, setControls] = useState<ReportControls>(DEFAULT_CONTROLS)
  const [previewHtml, setPreviewHtml] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
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

  const updateControl = useCallback((key: keyof ReportControls, value: any) => {
    setControls(prev => ({ ...prev, [key]: value }))
  }, [])

  const toggleField = useCallback((fieldKey: keyof ReportControls['fields'], value: boolean) => {
    setControls(prev => ({ ...prev, fields: { ...prev.fields, [fieldKey]: value } }))
  }, [])

  const generateReportHtml = useCallback((controls: ReportControls, pageSize: any, logo: string, company: string) => {
    const sampleData = [
      { id: 'ORD001', recipient: 'أحمد علي', city: 'عمّان', cod: 250, status: 'تم التسليم', address: 'دوار الداخلية', phone: '0795554433' },
      { id: 'ORD002', recipient: 'محمد حسن', city: 'الزرقاء', cod: 180, status: 'قيد التوصيل', address: 'شارع مكة', phone: '0784443322' },
      { id: 'ORD003', recipient: 'فاطمة يوسف', city: 'إربد', cod: 320, status: 'جديد', address: 'وسط البلد', phone: '0773332211' },
      { id: 'ORD004', recipient: 'سارة خالد', city: 'عمّان', cod: 150, status: 'تم التسليم', address: 'الجبيهة', phone: '0791112233' },
    ];

    const title = REPORT_TYPES.find(t => t.value === controls.reportType)?.label || 'تقرير بيانات';

    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: ${pageSize.width} ${pageSize.height}; margin: 10mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: '${controls.fontFamily}', sans-serif; font-size: ${controls.fontSize}px; background: white; padding: 5mm; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #${controls.primaryColor}; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #${controls.primaryColor}; font-size: 24px; }
    .stats { ${controls.fields.showStats ? 'display: grid;' : 'display: none;'} grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
    .stat-card { padding: 15px; background: #f8f9fa; border-radius: ${controls.borderRadius}px; text-align: center; border: 1px solid #eee; }
    .stat-card b { display: block; font-size: 20px; color: #${controls.primaryColor}; }
    .table { ${controls.fields.showTable ? 'display: table;' : 'display: none;'} width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .table th { background: #${controls.primaryColor}; color: white; padding: 12px; text-align: right; }
    .table td { padding: 10px; border-bottom: 1px solid #eee; }
    .footer { margin-top: auto; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 10px; color: #888; }
    .signatures { ${controls.fields.showSignatures ? 'display: grid;' : 'display: none;'} grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 50px; text-align: center; }
    .sig-box { border-top: 1px dashed #ccc; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${title}</h1>
      ${controls.fields.showDate ? `<p>تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}</p>` : ''}
    </div>
    ${controls.fields.showLogo ? (logo ? `<img src="${logo}" style="height: 60px;">` : `<h2>${company}</h2>`) : ''}
  </div>

  <div class="stats">
    <div class="stat-card"><b>${sampleData.length}</b><span>إجمالي القيود</span></div>
    <div class="stat-card"><b>${sampleData.reduce((s, o) => s + o.cod, 0)} د.أ</b><span>إجمالي المبالغ</span></div>
    <div class="stat-card"><b>2</b><span>مكتملة</span></div>
  </div>

  <table class="table">
    <thead>
      <tr><th>رقم الطلب</th><th>المستلم</th><th>المدينة</th><th>المبلغ</th><th>الحالة</th></tr>
    </thead>
    <tbody>
      ${sampleData.map(o => `<tr><td>${o.id}</td><td>${o.recipient}</td><td>${o.city}</td><td>${o.cod}</td><td>${o.status}</td></tr>`).join('')}
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-box">توقيع الموظف المسؤول</div>
    <div class="sig-box">الختم والمصادقة</div>
  </div>

  <div class="footer">نظام ${company} لإدارة التقارير الذكية</div>
</body>
</html>`
  }, []);

  useEffect(() => {
    const pageSize = PAGE_SIZES[controls.size as keyof typeof PAGE_SIZES];
    const html = generateReportHtml(controls, pageSize, companyLogo, companyName);
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
  }, [controls, companyLogo, companyName, generateReportHtml]);

  const loadSavedTemplates = async () => {
    try {
      const res = await fetch('/api/saved-templates?documentType=report');
      if (res.ok) {
        const data = await res.json();
        setSavedTemplates(data.templates || []);
      }
    } catch (e) { console.error(e); }
  }

  useEffect(() => { loadSavedTemplates(); }, []);

  const saveTemplate = async () => {
    if (!templateName.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/saved-templates', {
        method: selectedTemplateId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedTemplateId, name: templateName.trim(), settings: controls, documentType: 'report' })
      });
      if (res.ok) {
        toast({ title: "✅ تم الحفظ", description: "تم حفظ قالب التقرير بنجاح" });
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
          <span className="text-foreground font-medium">مصمم التقارير والجداول</span>
        </nav>

        {/* Modern Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 border border-white/10 p-8 lg:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
                  <BarChart3 className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight flex items-center gap-3">
                    مصمم التقارير والجداول
                    <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full animate-pulse">PRO</span>
                  </h1>
                  <p className="text-emerald-100/80 text-lg font-medium mt-2">حلل بياناتك بتقارير احترافية وماركة خاصة</p>
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
            <Tabs defaultValue="type" className="w-full">
              <TabsList className="w-full h-14 bg-white/50 backdrop-blur-sm border rounded-2xl p-1 gap-1">
                <TabsTrigger value="type" className="flex-1 rounded-xl gap-2 font-bold data-[state=active]:bg-white">نوع التقرير</TabsTrigger>
                <TabsTrigger value="style" className="flex-1 rounded-xl gap-2 font-bold data-[state=active]:bg-white">التنسيق</TabsTrigger>
                <TabsTrigger value="sections" className="flex-1 rounded-xl gap-2 font-bold data-[state=active]:bg-white">الأقسام</TabsTrigger>
              </TabsList>

              <TabsContent value="type" className="mt-6 space-y-6">
                <Card className="border-0 shadow-xl overflow-hidden">
                  <div className="h-1.5 w-full bg-emerald-500" />
                  <CardHeader><CardTitle className="text-lg font-bold">نموذج البيانات</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">نوع التقرير المطلوب</Label>
                      <Select value={controls.reportType} onValueChange={(v: any) => updateControl('reportType', v)}>
                        <SelectTrigger className="h-12 rounded-xl text-right"><SelectValue /></SelectTrigger>
                        <SelectContent>{REPORT_TYPES.map(rt => <SelectItem key={rt.value} value={rt.value} className="text-right">{rt.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">حجم الصفحة</Label>
                      <Select value={controls.size} onValueChange={(v: any) => updateControl('size', v)}>
                        <SelectTrigger className="h-11 rounded-xl text-right"><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(PAGE_SIZES).map(([id, s]) => <SelectItem key={id} value={id} className="text-right">{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="style" className="mt-6 space-y-6">
                <Card className="border-0 shadow-xl overflow-hidden">
                  <div className="h-1.5 w-full bg-teal-500" />
                  <CardHeader><CardTitle className="text-lg font-bold">سمات الماركة</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold">الخط</Label>
                        <Select value={controls.fontFamily} onValueChange={(v: any) => updateControl('fontFamily', v)}>
                          <SelectTrigger className="h-11 text-right"><SelectValue /></SelectTrigger>
                          <SelectContent>{FONTS.map(f => <SelectItem key={f.value} value={f.value} className="text-right">{f.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2"><Label className="text-sm font-bold">اللون المعتمد</Label><Input type="color" value={'#' + controls.primaryColor} onChange={(e) => updateControl('primaryColor', e.target.value.slice(1))} /></div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sections" className="mt-6 space-y-6">
                <Card className="border-0 shadow-xl overflow-hidden">
                  <div className="h-1.5 w-full bg-cyan-500" />
                  <CardHeader><CardTitle className="text-lg font-bold">محتويات التقرير</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 gap-3">
                    {AVAILABLE_SECTIONS.map(section => (
                      <div key={section.key} onClick={() => toggleField(section.key as any, !controls.fields[section.key as keyof typeof controls.fields])}
                        className={cn("flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all", controls.fields[section.key as keyof typeof controls.fields] ? "border-emerald-500 bg-emerald-50" : "border-gray-50 opacity-60")}>
                        <div className="flex items-center gap-3"><section.icon className="h-5 w-5 text-emerald-600" /><span className="font-bold text-sm text-gray-700">{section.label}</span></div>
                        {controls.fields[section.key as keyof typeof controls.fields] ? <Check className="h-5 w-5 text-emerald-600" /> : <X className="h-4 w-4 text-gray-400" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Saved Templates */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-1.5 w-full bg-emerald-600" />
              <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><FileText className="h-5 w-5" /> قوالب التقارير ({savedTemplates.length})</CardTitle></CardHeader>
              <CardContent className="max-h-[250px] overflow-y-auto space-y-2">
                {savedTemplates.map(t => (
                  <div key={t.id} onClick={() => { setControls(t.settings); setSelectedTemplateId(t.id); }} className="p-4 rounded-xl border-2 hover:border-emerald-500 cursor-pointer transition-all group">
                    <p className="font-bold text-gray-900 group-hover:text-emerald-700">{t.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{t.settings?.reportType}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => setShowSaveDialog(true)} className="h-16 rounded-2xl bg-emerald-600 font-bold shadow-lg shadow-emerald-500/20 text-lg"><Save className="h-6 w-6 ml-3" /> حفظ الإعدادات</Button>
              <Button variant="outline" onClick={() => previewPdfUrl && window.open(previewPdfUrl, '_blank')} disabled={!previewPdfUrl} className="h-16 rounded-2xl border-2 font-bold text-lg"><ExternalLink className="h-6 w-6 ml-3" /> معاينة PDF</Button>
            </div>
          </div>

          {/* Luxury Preview */}
          <div className="sticky top-8 space-y-6">
            <Card className="border-0 shadow-2xl bg-gray-900 rounded-[32px] overflow-hidden group">
              <div className="aspect-[1/1.4] relative bg-gray-800 flex items-center justify-center p-8">
                {isLoadingPreview && (
                  <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-[32px]">
                    <div className="h-16 w-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {previewPdfUrl ? <iframe src={`${previewPdfUrl}#toolbar=0`} className="w-full h-full rounded-2xl" /> : <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl rounded-3xl p-8 bg-white/95">
          <DialogTitle className="text-2xl font-black text-right mb-6">💾 حفظ قالب التقرير</DialogTitle>
          <div className="space-y-6">
            <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="اسم القالب (مثلاً: تقرير يومي)" className="h-14 rounded-2xl" />
            <Button onClick={saveTemplate} disabled={isSaving || !templateName.trim()} className="w-full h-16 rounded-2xl bg-emerald-600 text-lg font-black">حفظ وربط بالبيانات</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
