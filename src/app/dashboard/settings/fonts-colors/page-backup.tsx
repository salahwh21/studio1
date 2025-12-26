'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Loader2, Save, Type, Eye, Palette, Layout, Monitor, Smartphone, 
  Tablet, Sun, Moon, Sparkles, Download, Upload, RotateCcw, Check,
  ChevronRight, Layers, PaintBucket, Sliders, Grid3X3, Zap, Copy,
  SlidersHorizontal, Square, Circle, Hexagon, Triangle,
  Brush, Feather, Star, Settings
} from 'lucide-react';
import Icon from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { updateThemeAction } from '@/app/actions/update-theme';
import { useSettings } from '@/contexts/SettingsContext';
import { SettingsHeader } from '@/components/settings-header';
import { cn } from '@/lib/utils';

// Theme Presets
const themePresets = [
  {
    id: 'orange-light',
    name: 'البرتقالي الكلاسيكي',
    description: 'الثيم الافتراضي للنظام',
    preview: 'from-orange-500 to-amber-500',
    colors: {
      primary: '#F97316', background: '#FFFFFF', foreground: '#0F172A',
      secondary: '#F1F5F9', accent: '#FFF7ED', destructive: '#EF4444',
      border: '#E2E8F0', muted: '#64748B'
    }
  },
  {
    id: 'blue-professional',
    name: 'الأزرق الاحترافي',
    description: 'مظهر رسمي وعصري',
    preview: 'from-blue-600 to-indigo-600',
    colors: {
      primary: '#2563EB', background: '#FFFFFF', foreground: '#1E293B',
      secondary: '#EFF6FF', accent: '#DBEAFE', destructive: '#DC2626',
      border: '#CBD5E1', muted: '#64748B'
    }
  },
  {
    id: 'emerald-fresh',
    name: 'الأخضر المنعش',
    description: 'طبيعي ومريح للعين',
    preview: 'from-emerald-500 to-teal-500',
    colors: {
      primary: '#10B981', background: '#FFFFFF', foreground: '#134E4A',
      secondary: '#ECFDF5', accent: '#D1FAE5', destructive: '#EF4444',
      border: '#A7F3D0', muted: '#6B7280'
    }
  },
  {
    id: 'purple-creative',
    name: 'البنفسجي الإبداعي',
    description: 'جريء ومميز',
    preview: 'from-purple-600 to-pink-500',
    colors: {
      primary: '#9333EA', background: '#FFFFFF', foreground: '#1E1B4B',
      secondary: '#FAF5FF', accent: '#F3E8FF', destructive: '#E11D48',
      border: '#DDD6FE', muted: '#6B7280'
    }
  },
  {
    id: 'dark-elegant',
    name: 'الداكن الأنيق',
    description: 'مظهر ليلي مريح',
    preview: 'from-slate-800 to-slate-900',
    colors: {
      primary: '#F97316', background: '#0F172A', foreground: '#F8FAFC',
      secondary: '#1E293B', accent: '#334155', destructive: '#F87171',
      border: '#334155', muted: '#94A3B8'
    }
  },
  {
    id: 'rose-soft',
    name: 'الوردي الناعم',
    description: 'دافئ وودود',
    preview: 'from-rose-400 to-pink-500',
    colors: {
      primary: '#F43F5E', background: '#FFFBFC', foreground: '#1F2937',
      secondary: '#FFF1F2', accent: '#FFE4E6', destructive: '#DC2626',
      border: '#FECDD3', muted: '#6B7280'
    }
  }
];

const fonts = [
  { name: 'Tajawal', variable: 'var(--font-tajawal)', category: 'عربي' },
  { name: 'Cairo', variable: 'var(--font-cairo)', category: 'عربي' },
  { name: 'IBM Plex Sans Arabic', variable: 'var(--font-ibm-plex-sans-arabic)', category: 'عربي' },
  { name: 'Inter', variable: 'var(--font-inter)', category: 'إنجليزي' },
];

const borderRadiusOptions = [
  { value: '0', label: 'حاد', icon: Square },
  { value: '0.375', label: 'خفيف', icon: Hexagon },
  { value: '0.5', label: 'متوسط', icon: Square },
  { value: '0.75', label: 'مستدير', icon: Circle },
  { value: '1', label: 'دائري', icon: Circle },
];

// Color Picker Component
const ColorPicker = ({ 
  label, value, onChange, description 
}: { 
  label: string; value: string; onChange: (v: string) => void; description?: string 
}) => (
  <div className="group relative">
    <div className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent/50 transition-all cursor-pointer">
      <div 
        className="w-10 h-10 rounded-lg shadow-inner border-2 border-white ring-1 ring-black/10 transition-transform group-hover:scale-110"
        style={{ backgroundColor: value }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{label}</p>
        {description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
      </div>
      <Input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      />
      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{value.toUpperCase()}</code>
    </div>
  </div>
);

// Preview Device Frame
const DeviceFrame = ({ 
  type, children, active 
}: { 
  type: 'desktop' | 'tablet' | 'mobile'; children: React.ReactNode; active: boolean 
}) => {
  const sizes = {
    desktop: 'w-full aspect-video',
    tablet: 'w-[280px] aspect-[3/4]',
    mobile: 'w-[180px] aspect-[9/16]'
  };
  
  return (
    <div className={cn(
      "relative rounded-2xl border-4 border-slate-800 bg-slate-800 shadow-2xl transition-all duration-500",
      sizes[type],
      active ? "opacity-100 scale-100" : "opacity-50 scale-95"
    )}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-slate-700 rounded-b-full" />
      <div className="w-full h-full rounded-xl overflow-hidden bg-white">
        {children}
      </div>
    </div>
  );
};

export default function ThemeCustomizationPage() {
  const { toast } = useToast();
  const settingsContext = useSettings();
  
  const [activeTab, setActiveTab] = useState('presets');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLivePreview, setIsLivePreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Theme State
  const [selectedPreset, setSelectedPreset] = useState('orange-light');
  const [colors, setColors] = useState({
    primary: '#F97316',
    primaryForeground: '#FFFFFF',
    background: '#FFFFFF',
    foreground: '#0F172A',
    secondary: '#F1F5F9',
    secondaryForeground: '#1E293B',
    accent: '#FFF7ED',
    accentForeground: '#0F172A',
    muted: '#F1F5F9',
    mutedForeground: '#64748B',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    border: '#E2E8F0',
    input: '#E2E8F0',
    ring: '#F97316',
    card: '#FFFFFF',
    cardForeground: '#0F172A',
    popover: '#FFFFFF',
    popoverForeground: '#0F172A',
  });
  
  const [typography, setTypography] = useState({
    fontFamily: 'Tajawal',
    baseFontSize: 14,
    headingWeight: '700',
    bodyWeight: '400',
    lineHeight: 1.6,
  });
  
  const [layout, setLayout] = useState({
    borderRadius: '0.5',
    density: 'comfortable',
    sidebarWidth: 280,
    headerHeight: 64,
  });
  
  const [effects, setEffects] = useState({
    enableAnimations: true,
    enableShadows: true,
    enableBlur: true,
    shadowIntensity: 50,
  });

  // Icon settings
  const [iconSettings, setIconSettings] = useState({
    library: 'lucide',
    strokeWidth: 2,
    size: 'medium',
  });

  // Sidebar colors
  const [sidebarColors, setSidebarColors] = useState({
    background: '#FFFFFF',
    foreground: '#0F172A',
    accent: '#F97316',
    accentForeground: '#FFFFFF',
    border: '#E2E8F0',
  });

  // Chart colors
  const [chartColors, setChartColors] = useState({
    chart1: '#F97316',
    chart2: '#22C55E',
    chart3: '#3B82F6',
    chart4: '#EAB308',
    chart5: '#8B5CF6',
  });

  useEffect(() => {
    setIsMounted(true);
    // Load saved theme from localStorage
    const saved = localStorage.getItem('themeSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.colors) setColors(parsed.colors);
        if (parsed.typography) setTypography(parsed.typography);
        if (parsed.layout) setLayout(parsed.layout);
        if (parsed.effects) setEffects(parsed.effects);
        if (parsed.sidebarColors) setSidebarColors(parsed.sidebarColors);
        if (parsed.chartColors) setChartColors(parsed.chartColors);
        if (parsed.selectedPreset) setSelectedPreset(parsed.selectedPreset);
      } catch (e) {
        console.error('Failed to parse saved theme');
      }
    }
  }, []);

  // Apply preset
  const applyPreset = useCallback((presetId: string) => {
    const preset = themePresets.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setColors(prev => ({
        ...prev,
        primary: preset.colors.primary,
        background: preset.colors.background,
        foreground: preset.colors.foreground,
        secondary: preset.colors.secondary,
        accent: preset.colors.accent,
        destructive: preset.colors.destructive,
        border: preset.colors.border,
        mutedForeground: preset.colors.muted,
        ring: preset.colors.primary,
        card: preset.colors.background,
        cardForeground: preset.colors.foreground,
      }));
      setHasChanges(true);
      toast({ title: 'تم تطبيق القالب', description: preset.name });
    }
  }, [toast]);

  // Update color
  const updateColor = useCallback((key: string, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    applyPreset('orange-light');
    setTypography({
      fontFamily: 'Tajawal',
      baseFontSize: 14,
      headingWeight: '700',
      bodyWeight: '400',
      lineHeight: 1.6,
    });
    setLayout({
      borderRadius: '0.5',
      density: 'comfortable',
      sidebarWidth: 280,
      headerHeight: 64,
    });
    setEffects({
      enableAnimations: true,
      enableShadows: true,
      enableBlur: true,
      shadowIntensity: 50,
    });
    toast({ title: 'تم إعادة التعيين', description: 'تم استعادة الإعدادات الافتراضية' });
  }, [applyPreset, toast]);

  // Export theme
  const exportTheme = useCallback(() => {
    const theme = { colors, typography, layout, effects, sidebarColors, chartColors, selectedPreset };
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'تم التصدير', description: 'تم تحميل ملف الإعدادات' });
  }, [colors, typography, layout, effects, sidebarColors, chartColors, selectedPreset, toast]);

  // Import theme
  const importTheme = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const theme = JSON.parse(e.target?.result as string);
            if (theme.colors) setColors(theme.colors);
            if (theme.typography) setTypography(theme.typography);
            if (theme.layout) setLayout(theme.layout);
            if (theme.effects) setEffects(theme.effects);
            if (theme.sidebarColors) setSidebarColors(theme.sidebarColors);
            if (theme.chartColors) setChartColors(theme.chartColors);
            setHasChanges(true);
            toast({ title: 'تم الاستيراد', description: 'تم تحميل الإعدادات بنجاح' });
          } catch {
            toast({ variant: 'destructive', title: 'خطأ', description: 'ملف غير صالح' });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [toast]);

  // Save theme
  const saveTheme = useCallback(async () => {
    setIsSaving(true);
    try {
      const theme = { colors, typography, layout, effects, sidebarColors, chartColors, selectedPreset };
      localStorage.setItem('themeSettings', JSON.stringify(theme));
      
      // Apply to CSS variables
      const root = document.documentElement;
      Object.entries(colors).forEach(([key, value]) => {
        const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(`--${cssVar}`, value);
      });
      
      setHasChanges(false);
      toast({ title: 'تم الحفظ بنجاح!', description: 'تم تطبيق التغييرات على النظام' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل حفظ الإعدادات' });
    } finally {
      setIsSaving(false);
    }
  }, [colors, typography, layout, effects, sidebarColors, chartColors, selectedPreset, toast]);

  // Preview styles
  const previewStyles = useMemo(() => ({
    '--preview-primary': colors.primary,
    '--preview-bg': colors.background,
    '--preview-fg': colors.foreground,
    '--preview-secondary': colors.secondary,
    '--preview-border': colors.border,
    '--preview-radius': `${layout.borderRadius}rem`,
    fontFamily: fonts.find(f => f.name === typography.fontFamily)?.variable || 'sans-serif',
    fontSize: `${typography.baseFontSize}px`,
  } as React.CSSProperties), [colors, layout, typography]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto" />
            <Palette className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground">جاري تحميل محرر المظهر...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Standard Settings Header */}
      <SettingsHeader
        icon="Palette"
        title="تخصيص المظهر"
        description="صمم هوية نظامك البصرية - الألوان والخطوط والتخطيط"
        color="blue"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={importTheme} className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0">
              <Upload className="w-4 h-4" /> استيراد
            </Button>
            <Button variant="outline" size="sm" onClick={exportTheme} className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0">
              <Download className="w-4 h-4" /> تصدير
            </Button>
            <Button variant="outline" size="sm" onClick={resetToDefaults} className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0">
              <RotateCcw className="w-4 h-4" /> إعادة تعيين
            </Button>
            <Button 
              size="sm" 
              onClick={saveTheme} 
              disabled={isSaving || !hasChanges}
              className="gap-2 min-w-[120px] bg-white text-primary hover:bg-white/90"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        }
      />

      {/* Quick Stats Bar */}
      <div className="flex items-center gap-6 px-1">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary }} />
          <span className="text-muted-foreground">اللون الأساسي</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Type className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{typography.fontFamily}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Layout className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{layout.density === 'comfortable' ? 'مريح' : 'مضغوط'}</span>
        </div>
        {hasChanges && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            تغييرات غير محفوظة
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <div className="flex rounded-xl border overflow-hidden bg-white dark:bg-slate-900">
        {/* Settings Panel */}
        <div className="w-[420px] border-l min-h-[600px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b px-4 py-2 bg-slate-50 dark:bg-slate-800/50">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="presets" className="gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  قوالب
                </TabsTrigger>
                <TabsTrigger value="colors" className="gap-1.5 text-xs">
                  <PaintBucket className="w-3.5 h-3.5" />
                  ألوان
                </TabsTrigger>
                <TabsTrigger value="typography" className="gap-1.5 text-xs">
                  <Type className="w-3.5 h-3.5" />
                  خطوط
                </TabsTrigger>
                <TabsTrigger value="layout" className="gap-1.5 text-xs">
                  <Sliders className="w-3.5 h-3.5" />
                  تخطيط
                </TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="h-[calc(100vh-280px)]">
              {/* Presets Tab */}
              <TabsContent value="presets" className="p-4 space-y-4 mt-0">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    قوالب جاهزة
                  </h3>
                  <p className="text-sm text-muted-foreground">اختر قالباً جاهزاً للبدء السريع</p>
                </div>
                
                <div className="grid gap-3">
                  {themePresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      className={cn(
                        "relative group p-4 rounded-xl border-2 text-right transition-all hover:shadow-lg",
                        selectedPreset === preset.id 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-transparent bg-slate-50 hover:border-slate-200 dark:bg-slate-800"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl bg-gradient-to-br shadow-inner",
                          preset.preview
                        )} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{preset.name}</span>
                            {selectedPreset === preset.id && (
                              <Check className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{preset.description}</p>
                        </div>
                      </div>
                      {/* Color dots */}
                      <div className="flex gap-1 mt-3">
                        {Object.values(preset.colors).slice(0, 5).map((color, i) => (
                          <div 
                            key={i}
                            className="w-5 h-5 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </TabsContent>

              {/* Colors Tab */}
              <TabsContent value="colors" className="p-4 space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" />
                      الألوان الأساسية
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    <ColorPicker 
                      label="اللون الأساسي" 
                      value={colors.primary} 
                      onChange={(v) => updateColor('primary', v)}
                      description="لون الأزرار والروابط"
                    />
                    <ColorPicker 
                      label="لون الخلفية" 
                      value={colors.background} 
                      onChange={(v) => updateColor('background', v)}
                      description="خلفية الصفحات"
                    />
                    <ColorPicker 
                      label="لون النص" 
                      value={colors.foreground} 
                      onChange={(v) => updateColor('foreground', v)}
                      description="النصوص الأساسية"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">ألوان المكونات</h3>
                  <div className="space-y-2">
                    <ColorPicker 
                      label="الثانوي" 
                      value={colors.secondary} 
                      onChange={(v) => updateColor('secondary', v)}
                    />
                    <ColorPicker 
                      label="التمييز" 
                      value={colors.accent} 
                      onChange={(v) => updateColor('accent', v)}
                    />
                    <ColorPicker 
                      label="الحدود" 
                      value={colors.border} 
                      onChange={(v) => updateColor('border', v)}
                    />
                    <ColorPicker 
                      label="التحذير/الحذف" 
                      value={colors.destructive} 
                      onChange={(v) => updateColor('destructive', v)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">ألوان المخططات</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(chartColors).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div 
                          className="w-full aspect-square rounded-lg border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform relative overflow-hidden"
                          style={{ backgroundColor: value }}
                        >
                          <Input
                            type="color"
                            value={value}
                            onChange={(e) => setChartColors(prev => ({ ...prev, [key]: e.target.value }))}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 block">
                          {key.replace('chart', '')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Typography Tab */}
              <TabsContent value="typography" className="p-4 space-y-6 mt-0">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Type className="w-4 h-4 text-primary" />
                    الخط الأساسي
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>نوع الخط</Label>
                      <Select 
                        value={typography.fontFamily} 
                        onValueChange={(v) => setTypography(prev => ({ ...prev, fontFamily: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fonts.map(font => (
                            <SelectItem key={font.name} value={font.name}>
                              <div className="flex items-center justify-between w-full">
                                <span style={{ fontFamily: font.variable }}>{font.name}</span>
                                <Badge variant="outline" className="mr-2 text-[10px]">{font.category}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>حجم الخط الأساسي</Label>
                        <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{typography.baseFontSize}px</span>
                      </div>
                      <Slider
                        value={[typography.baseFontSize]}
                        onValueChange={([v]) => setTypography(prev => ({ ...prev, baseFontSize: v }))}
                        min={12}
                        max={18}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>صغير</span>
                        <span>كبير</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>ارتفاع السطر</Label>
                        <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{typography.lineHeight}</span>
                      </div>
                      <Slider
                        value={[typography.lineHeight * 10]}
                        onValueChange={([v]) => setTypography(prev => ({ ...prev, lineHeight: v / 10 }))}
                        min={12}
                        max={20}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">معاينة الخط</h3>
                  <div 
                    className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800 space-y-2"
                    style={{ 
                      fontFamily: fonts.find(f => f.name === typography.fontFamily)?.variable,
                      fontSize: `${typography.baseFontSize}px`,
                      lineHeight: typography.lineHeight
                    }}
                  >
                    <p className="font-bold text-lg">عنوان تجريبي للمعاينة</p>
                    <p className="text-muted-foreground">
                      هذا نص تجريبي لمعاينة شكل الخط المختار. يمكنك رؤية كيف سيظهر النص في النظام.
                    </p>
                    <p className="font-mono text-sm">1234567890</p>
                  </div>
                </div>
              </TabsContent>

              {/* Layout Tab */}
              <TabsContent value="layout" className="p-4 space-y-6 mt-0">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4 text-primary" />
                    استدارة الحواف
                  </h3>
                  
                  <RadioGroup 
                    value={layout.borderRadius} 
                    onValueChange={(v) => setLayout(prev => ({ ...prev, borderRadius: v }))}
                    className="grid grid-cols-5 gap-2"
                  >
                    {borderRadiusOptions.map((option) => (
                      <Label
                        key={option.value}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-accent",
                          layout.borderRadius === option.value ? "border-primary bg-primary/5" : "border-transparent bg-slate-50"
                        )}
                      >
                        <RadioGroupItem value={option.value} className="sr-only" />
                        <div 
                          className="w-8 h-8 bg-primary/20 border-2 border-primary/40"
                          style={{ borderRadius: `${parseFloat(option.value) * 8}px` }}
                        />
                        <span className="text-[10px] font-medium">{option.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    كثافة العرض
                  </h3>
                  
                  <RadioGroup 
                    value={layout.density} 
                    onValueChange={(v) => setLayout(prev => ({ ...prev, density: v }))}
                    className="grid grid-cols-2 gap-3"
                  >
                    <Label className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      layout.density === 'comfortable' ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
                    )}>
                      <RadioGroupItem value="comfortable" className="sr-only" />
                      <div className="space-y-2 w-full">
                        <div className="h-3 bg-slate-200 rounded w-full" />
                        <div className="h-3 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                      </div>
                      <span className="font-medium text-sm">مريح</span>
                      <span className="text-[10px] text-muted-foreground">مساحات واسعة</span>
                    </Label>
                    <Label className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      layout.density === 'compact' ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
                    )}>
                      <RadioGroupItem value="compact" className="sr-only" />
                      <div className="space-y-1 w-full">
                        <div className="h-2 bg-slate-200 rounded w-full" />
                        <div className="h-2 bg-slate-200 rounded w-full" />
                        <div className="h-2 bg-slate-200 rounded w-full" />
                        <div className="h-2 bg-slate-200 rounded w-3/4" />
                      </div>
                      <span className="font-medium text-sm">مضغوط</span>
                      <span className="text-[10px] text-muted-foreground">بيانات أكثر</span>
                    </Label>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    التأثيرات
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>الحركات والانتقالات</Label>
                        <p className="text-xs text-muted-foreground">تفعيل الأنيميشن</p>
                      </div>
                      <Switch 
                        checked={effects.enableAnimations}
                        onCheckedChange={(v) => setEffects(prev => ({ ...prev, enableAnimations: v }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>الظلال</Label>
                        <p className="text-xs text-muted-foreground">ظلال البطاقات</p>
                      </div>
                      <Switch 
                        checked={effects.enableShadows}
                        onCheckedChange={(v) => setEffects(prev => ({ ...prev, enableShadows: v }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>تأثير الضبابية</Label>
                        <p className="text-xs text-muted-foreground">Blur effect</p>
                      </div>
                      <Switch 
                        checked={effects.enableBlur}
                        onCheckedChange={(v) => setEffects(prev => ({ ...prev, enableBlur: v }))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Icon Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Brush className="w-4 h-4 text-primary" />
                    نمط الأيقونات
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>مكتبة الأيقونات</Label>
                      <RadioGroup 
                        value={iconSettings.library} 
                        onValueChange={(v) => setIconSettings(prev => ({ ...prev, library: v }))}
                        className="grid grid-cols-3 gap-2"
                      >
                        <Label className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all",
                          iconSettings.library === 'lucide' ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
                        )}>
                          <RadioGroupItem value="lucide" className="sr-only" />
                          <Brush className="w-6 h-6" style={{ strokeWidth: iconSettings.strokeWidth }} />
                          <span className="text-xs font-medium">Lucide</span>
                        </Label>
                        <Label className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all",
                          iconSettings.library === 'feather' ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
                        )}>
                          <RadioGroupItem value="feather" className="sr-only" />
                          <Feather className="w-6 h-6" style={{ strokeWidth: iconSettings.strokeWidth }} />
                          <span className="text-xs font-medium">Feather</span>
                        </Label>
                        <Label className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all",
                          iconSettings.library === 'outline' ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
                        )}>
                          <RadioGroupItem value="outline" className="sr-only" />
                          <Star className="w-6 h-6" style={{ strokeWidth: iconSettings.strokeWidth }} />
                          <span className="text-xs font-medium">Outline</span>
                        </Label>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>سماكة الخط</Label>
                        <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{iconSettings.strokeWidth}px</span>
                      </div>
                      <Slider
                        value={[iconSettings.strokeWidth * 10]}
                        onValueChange={([v]) => setIconSettings(prev => ({ ...prev, strokeWidth: v / 10 }))}
                        min={10}
                        max={30}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-center gap-4 pt-2">
                        <Settings className="w-6 h-6 text-muted-foreground" style={{ strokeWidth: 1 }} />
                        <Settings className="w-6 h-6 text-muted-foreground" style={{ strokeWidth: iconSettings.strokeWidth }} />
                        <Settings className="w-6 h-6 text-muted-foreground" style={{ strokeWidth: 3 }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>حجم الأيقونات</Label>
                      <RadioGroup 
                        value={iconSettings.size} 
                        onValueChange={(v) => setIconSettings(prev => ({ ...prev, size: v }))}
                        className="grid grid-cols-3 gap-2"
                      >
                        <Label className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all",
                          iconSettings.size === 'small' ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
                        )}>
                          <RadioGroupItem value="small" className="sr-only" />
                          <Settings className="w-4 h-4" />
                          <span className="text-xs">صغير</span>
                        </Label>
                        <Label className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all",
                          iconSettings.size === 'medium' ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
                        )}>
                          <RadioGroupItem value="medium" className="sr-only" />
                          <Settings className="w-5 h-5" />
                          <span className="text-xs">متوسط</span>
                        </Label>
                        <Label className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all",
                          iconSettings.size === 'large' ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
                        )}>
                          <RadioGroupItem value="large" className="sr-only" />
                          <Settings className="w-6 h-6" />
                          <span className="text-xs">كبير</span>
                        </Label>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 p-6 bg-slate-100/50 dark:bg-slate-800/50">
          {/* Preview Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewDevice('desktop')}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewDevice('tablet')}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewDevice('mobile')}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-muted-foreground" />
                <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                <Moon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <Switch checked={isLivePreview} onCheckedChange={setIsLivePreview} />
                <span className="text-sm text-muted-foreground">معاينة حية</span>
              </div>
            </div>
          </div>

          {/* Preview Frame */}
          <div className="flex items-center justify-center min-h-[500px]">
            <div 
              className={cn(
                "transition-all duration-500",
                previewDevice === 'desktop' ? 'w-full max-w-4xl' : '',
                previewDevice === 'tablet' ? 'w-[400px]' : '',
                previewDevice === 'mobile' ? 'w-[280px]' : ''
              )}
              style={previewStyles}
            >
              {/* Mock Dashboard Preview */}
              <div 
                className="rounded-2xl border shadow-2xl overflow-hidden"
                style={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  borderRadius: `${parseFloat(layout.borderRadius) * 16}px`
                }}
              >
                {/* Mock Header */}
                <div 
                  className="h-14 border-b flex items-center justify-between px-4"
                  style={{ borderColor: colors.border }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <div 
                      className="h-4 w-24 rounded"
                      style={{ backgroundColor: colors.secondary }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: colors.secondary }}
                    />
                  </div>
                </div>

                {/* Mock Content */}
                <div className="flex">
                  {/* Mock Sidebar */}
                  <div 
                    className="w-48 border-l p-3 space-y-2 hidden sm:block"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: sidebarColors.background 
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i}
                        className="h-9 rounded-lg flex items-center gap-2 px-3"
                        style={{ 
                          backgroundColor: i === 1 ? `${colors.primary}15` : 'transparent',
                          color: i === 1 ? colors.primary : colors.mutedForeground
                        }}
                      >
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: i === 1 ? colors.primary : colors.border }}
                        />
                        <div 
                          className="h-3 rounded flex-1"
                          style={{ backgroundColor: colors.border }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Mock Main Content */}
                  <div className="flex-1 p-4 space-y-4">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[colors.primary, chartColors.chart2, chartColors.chart3, chartColors.chart4].map((color, i) => (
                        <div 
                          key={i}
                          className="p-3 rounded-xl border"
                          style={{ 
                            borderColor: colors.border,
                            backgroundColor: colors.card,
                            borderRadius: `${parseFloat(layout.borderRadius) * 12}px`
                          }}
                        >
                          <div 
                            className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: color }}
                            />
                          </div>
                          <div 
                            className="h-5 w-12 rounded mb-1"
                            style={{ backgroundColor: colors.foreground }}
                          />
                          <div 
                            className="h-3 w-16 rounded"
                            style={{ backgroundColor: colors.border }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Mock Table */}
                    <div 
                      className="rounded-xl border overflow-hidden"
                      style={{ 
                        borderColor: colors.border,
                        borderRadius: `${parseFloat(layout.borderRadius) * 12}px`
                      }}
                    >
                      <div 
                        className="h-10 border-b flex items-center px-4 gap-4"
                        style={{ 
                          borderColor: colors.border,
                          backgroundColor: colors.secondary 
                        }}
                      >
                        {[1, 2, 3, 4].map((i) => (
                          <div 
                            key={i}
                            className="h-3 rounded flex-1"
                            style={{ backgroundColor: colors.border }}
                          />
                        ))}
                      </div>
                      {[1, 2, 3].map((row) => (
                        <div 
                          key={row}
                          className="h-12 border-b flex items-center px-4 gap-4"
                          style={{ borderColor: colors.border }}
                        >
                          {[1, 2, 3, 4].map((col) => (
                            <div 
                              key={col}
                              className="h-3 rounded flex-1"
                              style={{ backgroundColor: col === 1 ? colors.foreground : colors.border }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* Mock Buttons */}
                    <div className="flex gap-2">
                      <div 
                        className="h-9 px-4 rounded-lg flex items-center"
                        style={{ 
                          backgroundColor: colors.primary,
                          borderRadius: `${parseFloat(layout.borderRadius) * 8}px`
                        }}
                      >
                        <div className="h-3 w-16 rounded bg-white/80" />
                      </div>
                      <div 
                        className="h-9 px-4 rounded-lg flex items-center border"
                        style={{ 
                          borderColor: colors.border,
                          borderRadius: `${parseFloat(layout.borderRadius) * 8}px`
                        }}
                      >
                        <div 
                          className="h-3 w-16 rounded"
                          style={{ backgroundColor: colors.foreground }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
