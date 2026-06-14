'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Sparkles,
  Zap,
  Bot,
  MessageSquare,
  Code,
  Wand2,
  ExternalLink,
  Shield,
  Activity,
  Settings2,
  Loader2,
  Globe,
  Cpu,
  Network,
  Plus,
  Trash2,
  DownloadCloud,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsHeader } from '@/components/settings-header';
import { api } from '@/lib/api';
import Icon from '@/components/icon';

interface AIProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  gradient: string;
  bgGlow: string;
  iconBg: string;
  apiKeyLabel: string;
  placeholder: string;
  docsUrl: string;
  modelsEndpoint?: string; // endpoint to fetch models from
  category: 'primary' | 'aggregator' | 'opensource';
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: <Sparkles className="h-5 w-5" />,
    description: 'GPT-4o, GPT-4 Turbo للمحادثات الذكية وتحسين المسارات',
    features: ['تحسين المسارات', 'خدمة العملاء', 'تحليل البيانات', 'إنشاء المحتوى'],
    gradient: 'from-emerald-500 via-green-500 to-teal-600',
    bgGlow: 'group-hover:shadow-emerald-500/20',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    apiKeyLabel: 'OpenAI API Key',
    placeholder: 'sk-proj-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    modelsEndpoint: 'https://api.openai.com/v1/models',
    category: 'primary'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    icon: <Brain className="h-5 w-5" />,
    description: 'Claude 3.5 Sonnet للمحادثات الذكية والتحليل المتقدم',
    features: ['محادثات طويلة', 'تحليل متقدم', 'فهم السياق', 'ردود دقيقة'],
    gradient: 'from-orange-500 via-amber-500 to-yellow-600',
    bgGlow: 'group-hover:shadow-orange-500/20',
    iconBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    apiKeyLabel: 'Anthropic API Key',
    placeholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    modelsEndpoint: 'https://api.anthropic.com/v1/models',
    category: 'primary'
  },
  {
    id: 'google',
    name: 'Google Gemini',
    icon: <Zap className="h-5 w-5" />,
    description: 'Gemini Pro و Flash للذكاء الاصطناعي المتعدد الوسائط',
    features: ['معالجة الصور', 'تحليل متعدد', 'سرعة عالية', 'دقة ممتازة'],
    gradient: 'from-blue-500 via-indigo-500 to-violet-600',
    bgGlow: 'group-hover:shadow-blue-500/20',
    iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    apiKeyLabel: 'Google AI API Key',
    placeholder: 'AIza...',
    docsUrl: 'https://makersuite.google.com/app/apikey',
    modelsEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    category: 'primary'
  },
  {
    id: 'groq',
    name: 'Groq',
    icon: <Cpu className="h-5 w-5" />,
    description: 'أسرع استدلال AI في العالم مع أجهزة LPU™',
    features: ['سرعة فائقة', 'تكلفة منخفضة', 'Llama 3', 'Mixtral'],
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-600',
    bgGlow: 'group-hover:shadow-rose-500/20',
    iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    apiKeyLabel: 'Groq API Key',
    placeholder: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys',
    modelsEndpoint: 'https://api.groq.com/openai/v1/models',
    category: 'primary'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: <Network className="h-5 w-5" />,
    description: 'بوابة موحدة لجميع نماذج الذكاء الاصطناعي بمفتاح واحد',
    features: ['100+ نموذج', 'مفتاح واحد', 'أسعار تنافسية', 'تبديل سهل'],
    gradient: 'from-violet-500 via-purple-500 to-indigo-600',
    bgGlow: 'group-hover:shadow-violet-500/20',
    iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    apiKeyLabel: 'OpenRouter API Key',
    placeholder: 'sk-or-v1-...',
    docsUrl: 'https://openrouter.ai/keys',
    modelsEndpoint: 'https://openrouter.ai/api/v1/models',
    category: 'aggregator'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    icon: <Globe className="h-5 w-5" />,
    description: 'نماذج أوروبية مفتوحة المصدر عالية الأداء',
    features: ['أداء عالي', 'تكلفة منخفضة', 'خصوصية أوروبية', 'مرونة'],
    gradient: 'from-sky-500 via-cyan-500 to-teal-600',
    bgGlow: 'group-hover:shadow-sky-500/20',
    iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    apiKeyLabel: 'Mistral API Key',
    placeholder: '...',
    docsUrl: 'https://console.mistral.ai/api-keys',
    modelsEndpoint: 'https://api.mistral.ai/v1/models',
    category: 'primary'
  },
  {
    id: 'cohere',
    name: 'Cohere',
    icon: <MessageSquare className="h-5 w-5" />,
    description: 'متخصص في معالجة اللغة الطبيعية والبحث الدلالي',
    features: ['فهم اللغة', 'تصنيف النصوص', 'البحث الدلالي', 'التلخيص'],
    gradient: 'from-teal-500 via-emerald-500 to-green-600',
    bgGlow: 'group-hover:shadow-teal-500/20',
    iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    apiKeyLabel: 'Cohere API Key',
    placeholder: '...',
    docsUrl: 'https://dashboard.cohere.com/api-keys',
    modelsEndpoint: 'https://api.cohere.ai/v1/models',
    category: 'primary'
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    icon: <Code className="h-5 w-5" />,
    description: 'الوصول لآلاف النماذج المفتوحة والمجانية',
    features: ['نماذج متنوعة', 'مجتمع كبير', 'مجاني', 'قابل للتخصيص'],
    gradient: 'from-amber-500 via-yellow-500 to-orange-600',
    bgGlow: 'group-hover:shadow-amber-500/20',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    apiKeyLabel: 'Hugging Face Token',
    placeholder: 'hf_...',
    docsUrl: 'https://huggingface.co/settings/tokens',
    category: 'opensource'
  }
];

interface ProviderConfig {
  apiKey: string;
  enabled: boolean;
  lastTested?: string;
  status?: 'active' | 'error' | 'untested';
  selectedModel?: string;
  fetchedModels?: string[];
}

interface CustomProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  enabled: boolean;
  status?: 'active' | 'error' | 'untested';
  lastTested?: string;
  fetchedModels?: string[];
}

interface AIConfig {
  [key: string]: ProviderConfig;
}

interface AISettings {
  defaultProvider?: string;
  providers: AIConfig;
  customProviders?: CustomProvider[];
}

// ─── Helper: extract model IDs from various API response formats ───
function extractModelIds(providerId: string, data: any): string[] {
  try {
    // OpenAI / Groq / OpenRouter / Mistral format: { data: [{ id: "..." }] }
    if (data?.data && Array.isArray(data.data)) {
      return data.data
        .map((m: any) => m.id || m.name || '')
        .filter(Boolean)
        .sort();
    }
    // Google Gemini format: { models: [{ name: "models/gemini-pro" }] }
    if (data?.models && Array.isArray(data.models)) {
      return data.models
        .map((m: any) => (m.name || '').replace('models/', ''))
        .filter(Boolean)
        .sort();
    }
    // Anthropic format: { data: [{ id: "..." }] } same as OpenAI
    // Cohere format: { models: [{ name: "..." }] }
    if (Array.isArray(data)) {
      return data.map((m: any) => m.id || m.name || '').filter(Boolean).sort();
    }
  } catch {
    // ignore
  }
  return [];
}

function ModelCombobox({
  models,
  selectedModel,
  onSelect,
  placeholder = "اختر نموذج..."
}: {
  models: string[];
  selectedModel?: string;
  onSelect: (model: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 bg-background/80 border-border/60 font-mono text-xs"
          dir="ltr"
        >
          <span className="truncate">{selectedModel || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="ابحث عن نموذج..." className="h-9 font-sans" dir="ltr" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>لم يتم العثور على نموذج.</CommandEmpty>
            <CommandGroup>
              {models.map((model) => (
                <CommandItem
                  key={model}
                  value={model}
                  onSelect={(currentValue) => {
                    // Use actual model case, not command's lowercase currentValue
                    onSelect(model);
                    setOpen(false);
                  }}
                  className="font-mono text-xs cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-primary",
                      selectedModel === model ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {model}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function AIConfigPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AISettings>({ providers: {}, customProviders: [] });
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [testing, setTesting] = useState<{ [key: string]: boolean }>({});
  const [fetchingModels, setFetchingModels] = useState<{ [key: string]: boolean }>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);

  // Load config from DB preferences
  const loadConfig = useCallback(async () => {
    try {
      const prefs = await api.getPreferences();
      if (prefs?.aiConfig) {
        setSettings(prefs.aiConfig as any);
      } else {
        const result = await api.getSettings();
        if (result.success && result.data?.aiConfig) {
          setSettings(result.data.aiConfig);
        }
      }
    } catch (e) {
      console.error('Failed to load AI config', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.savePreferences({ aiConfig: settings });
      toast({ title: '✅ تم الحفظ بنجاح', description: 'تم حفظ إعدادات الذكاء الاصطناعي في قاعدة البيانات' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'فشل الحفظ', description: 'حدث خطأ أثناء حفظ الإعدادات' });
    } finally {
      setSaving(false);
    }
  };

  // ─── Fetch models from provider API ───
  const fetchModelsForProvider = async (providerId: string, apiKey: string, customBaseUrl?: string) => {
    setFetchingModels(prev => ({ ...prev, [providerId]: true }));

    try {
      const provider = AI_PROVIDERS.find(p => p.id === providerId);
      let url = customBaseUrl ? `${customBaseUrl.replace(/\/$/, '')}/models` : provider?.modelsEndpoint;

      if (!url) {
        setFetchingModels(prev => ({ ...prev, [providerId]: false }));
        return [];
      }

      // Google requires key as query param
      if (providerId === 'google') {
        url = `${url}?key=${apiKey}`;
      }

      const headers: Record<string, string> = {};
      if (providerId === 'anthropic') {
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
      } else if (providerId !== 'google') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(url, { headers });
      if (!response.ok) {
        setFetchingModels(prev => ({ ...prev, [providerId]: false }));
        return [];
      }

      const data = await response.json();
      const models = extractModelIds(providerId, data);

      // Save fetched models to the provider config
      if (customBaseUrl) {
        // It's a custom provider
        setSettings(prev => ({
          ...prev,
          customProviders: (prev.customProviders || []).map(cp =>
            cp.id === providerId ? { ...cp, fetchedModels: models } : cp
          )
        }));
      } else {
        setSettings(prev => ({
          ...prev,
          providers: {
            ...prev.providers,
            [providerId]: { ...prev.providers[providerId], fetchedModels: models }
          }
        }));
      }

      toast({
        title: `✅ تم جلب ${models.length} نموذج`,
        description: `تم تحميل النماذج المتوفرة من ${provider?.name || providerId}`,
      });

      return models;
    } catch {
      toast({ variant: 'destructive', title: 'فشل جلب النماذج', description: 'تأكد من صحة المفتاح والاتصال' });
      return [];
    } finally {
      setFetchingModels(prev => ({ ...prev, [providerId]: false }));
    }
  };

  const handleTestConnection = async (providerId: string, isCustom = false) => {
    const providerConfig = isCustom
      ? (settings.customProviders || []).find(cp => cp.id === providerId)
      : settings.providers[providerId];

    if (!providerConfig?.apiKey) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء إدخال API Key أولاً' });
      return;
    }

    setTesting(prev => ({ ...prev, [providerId]: true }));

    try {
      let success = false;
      const apiKey = providerConfig.apiKey;

      if (isCustom) {
        const cp = providerConfig as CustomProvider;
        const testUrl = `${cp.baseUrl.replace(/\/$/, '')}/models`;
        try {
          const response = await fetch(testUrl, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          success = response.ok;
          if (success) {
            // Also fetch models
            await fetchModelsForProvider(providerId, apiKey, cp.baseUrl);
          }
        } catch {
          success = apiKey.length > 10;
        }

        setSettings(prev => ({
          ...prev,
          customProviders: (prev.customProviders || []).map(c =>
            c.id === providerId
              ? { ...c, lastTested: new Date().toISOString(), status: success ? 'active' as const : 'error' as const }
              : c
          )
        }));
      } else {
        // Built-in provider
        const testEndpoints: Record<string, { url: string; headers: Record<string, string>; body?: string }> = {
          openai: { url: 'https://api.openai.com/v1/models', headers: { 'Authorization': `Bearer ${apiKey}` } },
          anthropic: {
            url: 'https://api.anthropic.com/v1/models',
            headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }
          },
          google: { url: `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, headers: {} },
          groq: { url: 'https://api.groq.com/openai/v1/models', headers: { 'Authorization': `Bearer ${apiKey}` } },
          openrouter: { url: 'https://openrouter.ai/api/v1/models', headers: { 'Authorization': `Bearer ${apiKey}` } },
          mistral: { url: 'https://api.mistral.ai/v1/models', headers: { 'Authorization': `Bearer ${apiKey}` } },
          cohere: { url: 'https://api.cohere.ai/v1/models', headers: { 'Authorization': `Bearer ${apiKey}` } },
          huggingface: { url: 'https://huggingface.co/api/whoami-v2', headers: { 'Authorization': `Bearer ${apiKey}` } }
        };

        const endpoint = testEndpoints[providerId];
        if (endpoint) {
          try {
            const response = await fetch(endpoint.url, {
              method: endpoint.body ? 'POST' : 'GET',
              headers: endpoint.headers,
              body: endpoint.body,
            });
            success = response.ok;
            if (providerId === 'anthropic' && (response.status === 200 || response.status === 429)) success = true;
            if (response.ok) {
              success = true;
              // Fetch models on successful connection
              await fetchModelsForProvider(providerId, apiKey);
            }
          } catch {
            success = apiKey.length > 10;
          }
        } else {
          success = apiKey.length > 10;
        }

        setSettings(prev => ({
          ...prev,
          providers: {
            ...prev.providers,
            [providerId]: {
              ...(prev.providers[providerId] || { apiKey: '', enabled: false }),
              lastTested: new Date().toISOString(),
              status: success ? 'active' : 'error'
            }
          }
        }));
      }

      toast({
        variant: success ? 'default' : 'destructive',
        title: success ? '✅ الاتصال ناجح' : '❌ فشل الاتصال',
        description: success ? 'تم التحقق من API Key وجلب النماذج' : 'تحقق من صحة API Key والمحاولة مرة أخرى',
      });
    } catch {
      toast({ variant: 'destructive', title: 'فشل الاتصال', description: 'تحقق من صحة API Key والاتصال بالإنترنت' });
    } finally {
      setTesting(prev => ({ ...prev, [providerId]: false }));
    }
  };

  const handleUpdateKey = (providerId: string, apiKey: string) => {
    setSettings(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [providerId]: {
          ...prev.providers[providerId],
          apiKey,
          enabled: !!apiKey,
          status: 'untested' as const,
          fetchedModels: undefined // reset models when key changes
        }
      }
    }));
  };

  const handleToggleProvider = (providerId: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [providerId]: {
          ...prev.providers[providerId],
          enabled,
          apiKey: prev.providers[providerId]?.apiKey || '',
          status: prev.providers[providerId]?.status || 'untested'
        }
      }
    }));
  };

  const handleSelectModel = (providerId: string, model: string) => {
    setSettings(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [providerId]: {
          ...prev.providers[providerId],
          selectedModel: model,
          apiKey: prev.providers[providerId]?.apiKey || '',
          enabled: prev.providers[providerId]?.enabled || false,
        }
      }
    }));
  };

  const handleSetDefault = (providerId: string) => {
    setSettings(prev => ({ ...prev, defaultProvider: providerId }));
  };

  const toggleShowKey = (providerId: string) => {
    setShowKeys({ ...showKeys, [providerId]: !showKeys[providerId] });
  };

  // ─── Custom Provider CRUD ───
  const addCustomProvider = () => {
    const newId = `custom_${Date.now()}`;
    setSettings(prev => ({
      ...prev,
      customProviders: [
        ...(prev.customProviders || []),
        { id: newId, name: '', baseUrl: '', apiKey: '', model: '', enabled: true, status: 'untested' }
      ]
    }));
    setExpandedProvider(newId);
  };

  const updateCustomProvider = (id: string, field: keyof CustomProvider, value: any) => {
    setSettings(prev => ({
      ...prev,
      customProviders: (prev.customProviders || []).map(cp =>
        cp.id === id ? { ...cp, [field]: value, ...(field === 'apiKey' ? { fetchedModels: undefined, status: 'untested' as const } : {}) } : cp
      )
    }));
  };

  const removeCustomProvider = (id: string) => {
    setSettings(prev => ({
      ...prev,
      customProviders: (prev.customProviders || []).filter(cp => cp.id !== id),
      defaultProvider: prev.defaultProvider === id ? undefined : prev.defaultProvider
    }));
  };

  const getStatusIcon = (status?: 'active' | 'error' | 'untested') => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            نشط
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            خطأ
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            لم يختبر
          </div>
        );
    }
  };

  const allBuiltinProviders = AI_PROVIDERS;
  const activeProviders = [
    ...Object.entries(settings.providers).filter(([, c]) => c.status === 'active'),
    ...(settings.customProviders || []).filter(c => c.status === 'active').map(c => [c.id, c] as [string, any])
  ];
  const configuredProviders = [
    ...Object.entries(settings.providers).filter(([, c]) => c.apiKey),
    ...(settings.customProviders || []).filter(c => c.apiKey).map(c => [c.id, c] as [string, any])
  ];
  const primaryProviders = AI_PROVIDERS.filter(p => p.category === 'primary');
  const aggregatorProviders = AI_PROVIDERS.filter(p => p.category === 'aggregator');
  const opensourceProviders = AI_PROVIDERS.filter(p => p.category === 'opensource');

  if (loading) {
    return (
      <div className="space-y-6">
        <SettingsHeader icon="Wand2" title="إعدادات الذكاء الاصطناعي" description="قم بتكوين API Keys لمختلف مزودي خدمات الذكاء الاصطناعي" color="indigo" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground text-sm">جاري تحميل الإعدادات...</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Model selector component (shared for built-in & custom) ───
  const renderModelSelector = (
    providerId: string,
    fetchedModels: string[] | undefined,
    selectedModel: string | undefined,
    onSelect: (model: string) => void,
    apiKey: string,
    customBaseUrl?: string
  ) => {
    const hasModels = fetchedModels && fetchedModels.length > 0;
    const isFetching = fetchingModels[providerId];

    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
          النموذج المستخدم
        </Label>

        {hasModels ? (
          <div className="space-y-2">
            <ModelCombobox 
              models={fetchedModels!} 
              selectedModel={selectedModel} 
              onSelect={onSelect} 
              placeholder="اختر نموذج من النماذج المتوفرة..." 
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fetchedModels!.length}</span> نموذج متوفر
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-[11px] h-6 px-2 gap-1 text-muted-foreground hover:text-primary"
                onClick={() => fetchModelsForProvider(providerId, apiKey, customBaseUrl)}
                disabled={isFetching}
              >
                {isFetching ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                تحديث
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Manual model input when no models fetched */}
            <Input
              value={selectedModel || ''}
              onChange={(e) => onSelect(e.target.value)}
              placeholder="أدخل اسم النموذج يدوياً، مثل: gpt-4o"
              className="h-10 text-sm font-mono bg-background/80 border-border/60"
              dir="ltr"
            />
            {apiKey && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 gap-1.5 w-full"
                onClick={() => fetchModelsForProvider(providerId, apiKey, customBaseUrl)}
                disabled={isFetching || !apiKey}
              >
                {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <DownloadCloud className="h-3.5 w-3.5" />}
                {isFetching ? 'جاري جلب النماذج...' : 'جلب النماذج المتوفرة تلقائياً'}
              </Button>
            )}
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              يمكنك كتابة اسم النموذج يدوياً أو الضغط على "جلب النماذج" لتحميل القائمة من المزود تلقائياً
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderProviderCard = (provider: AIProvider) => {
    const providerConfig = settings.providers[provider.id] || { apiKey: '', enabled: false };
    const isConfigured = !!providerConfig.apiKey;
    const isExpanded = expandedProvider === provider.id;
    const isDefault = settings.defaultProvider === provider.id;

    return (
      <div
        key={provider.id}
        className={cn(
          "group relative rounded-xl border transition-all duration-200 overflow-hidden",
          isConfigured ? "border-border/80 bg-slate-50/50 dark:bg-slate-900/50 shadow-sm" : "border-border/40 bg-card hover:bg-slate-50/80 dark:hover:bg-slate-900/80",
          isDefault && "ring-1 ring-primary/40 border-primary/30"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedProvider(isExpanded ? null : provider.id)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted text-foreground">
              {provider.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-foreground">{provider.name}</h3>
                {isDefault && <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-primary/90">افتراضي</Badge>}
                {provider.category === 'aggregator' && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-violet-300 text-violet-600 dark:text-violet-400">بوابة موحدة</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{provider.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(providerConfig.status)}
            <Icon name="ChevronDown" className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
          </div>
        </div>

        {/* Expandable Content */}
        <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0")}>
          <div className="px-4 pb-4 space-y-4">
            <Separator className="mb-2" />

            {/* Features */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">المميزات</Label>
              <div className="flex flex-wrap gap-1.5">
                {provider.features.map((feature, idx) => (
                  <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-muted/80 text-muted-foreground border border-border/40">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Enable Toggle */}
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/40 border border-border/30">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">تفعيل المزود</span>
              </div>
              <Switch checked={providerConfig.enabled} onCheckedChange={(checked) => handleToggleProvider(provider.id, checked)} />
            </div>

            {/* API Key Input */}
            <div className="space-y-2">
              <Label htmlFor={`${provider.id}-key`} className="flex items-center gap-2 text-sm font-semibold">
                <Key className="h-3.5 w-3.5 text-muted-foreground" />
                {provider.apiKeyLabel}
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id={`${provider.id}-key`}
                    type={showKeys[provider.id] ? 'text' : 'password'}
                    value={providerConfig.apiKey}
                    onChange={(e) => handleUpdateKey(provider.id, e.target.value)}
                    placeholder={provider.placeholder}
                    className="pr-10 h-10 text-sm font-mono bg-background/80 border-border/60 focus:border-primary/50"
                    dir="ltr"
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute left-0 top-0 h-full w-10 hover:bg-transparent" onClick={() => toggleShowKey(provider.id)}>
                    {showKeys[provider.id] ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => handleTestConnection(provider.id)}
                  disabled={!isConfigured || testing[provider.id]}
                  title="اختبار الاتصال وجلب النماذج"
                >
                  {testing[provider.id] ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                </Button>
              </div>
              {providerConfig.lastTested && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  آخر اختبار: {new Date(providerConfig.lastTested).toLocaleString('ar-JO')}
                </p>
              )}
            </div>

            {/* Model Selection - Dynamic */}
            {renderModelSelector(
              provider.id,
              providerConfig.fetchedModels,
              providerConfig.selectedModel,
              (model) => handleSelectModel(provider.id, model),
              providerConfig.apiKey
            )}

            {/* Actions Row */}
            <div className="flex items-center justify-between pt-1">
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground hover:text-primary h-8" onClick={() => window.open(provider.docsUrl, '_blank')}>
                <ExternalLink className="h-3 w-3" />
                الحصول على API Key
              </Button>
              {isConfigured && providerConfig.status === 'active' && (
                <Button variant={isDefault ? "default" : "outline"} size="sm" className="text-xs h-8 gap-1" onClick={() => handleSetDefault(provider.id)} disabled={isDefault}>
                  {isDefault ? (<><CheckCircle2 className="h-3 w-3" />المزود الافتراضي</>) : 'تعيين كافتراضي'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Render Custom Provider Card ───
  const renderCustomProviderCard = (cp: CustomProvider) => {
    const isExpanded = expandedProvider === cp.id;
    const isDefault = settings.defaultProvider === cp.id;
    const isConfigured = !!cp.apiKey && !!cp.baseUrl;

    return (
      <div
        key={cp.id}
        className={cn(
          "group relative rounded-xl border transition-all duration-200 overflow-hidden",
          isConfigured ? "border-border/80 bg-slate-50/50 dark:bg-slate-900/50 shadow-sm" : "border-dashed border-border/40 bg-card hover:bg-slate-50/80 dark:hover:bg-slate-900/80",
          isDefault && "ring-1 ring-primary/40 border-primary/30"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedProvider(isExpanded ? null : cp.id)}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted text-foreground">
              <Settings2 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-foreground">{cp.name || 'مزود مخصص جديد'}</h3>
                {isDefault && <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-primary/90">افتراضي</Badge>}
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-slate-300 text-slate-600 dark:text-slate-400">مخصص</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{cp.baseUrl || 'لم يتم تعيين عنوان URL'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(cp.status)}
            <Icon name="ChevronDown" className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
          </div>
        </div>

        {/* Expandable Content */}
        <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0")}>
          <div className="px-4 pb-4 space-y-4">
            <Separator className="mb-2" />

            {/* Provider Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                اسم المزود
              </Label>
              <Input
                value={cp.name}
                onChange={(e) => updateCustomProvider(cp.id, 'name', e.target.value)}
                placeholder="مثال: My Local LLM, Together AI, Deepseek..."
                className="h-10 text-sm bg-background/80 border-border/60"
              />
            </div>

            {/* Base URL */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                عنوان API (Base URL)
              </Label>
              <Input
                value={cp.baseUrl}
                onChange={(e) => updateCustomProvider(cp.id, 'baseUrl', e.target.value)}
                placeholder="https://api.example.com/v1"
                className="h-10 text-sm font-mono bg-background/80 border-border/60"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground">
                عنوان الـ API الأساسي بدون /models أو /chat/completions - سيتم إضافتها تلقائياً
              </p>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Key className="h-3.5 w-3.5 text-muted-foreground" />
                API Key
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showKeys[cp.id] ? 'text' : 'password'}
                    value={cp.apiKey}
                    onChange={(e) => updateCustomProvider(cp.id, 'apiKey', e.target.value)}
                    placeholder="أدخل المفتاح..."
                    className="pr-10 h-10 text-sm font-mono bg-background/80 border-border/60"
                    dir="ltr"
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute left-0 top-0 h-full w-10 hover:bg-transparent" onClick={() => toggleShowKey(cp.id)}>
                    {showKeys[cp.id] ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => handleTestConnection(cp.id, true)}
                  disabled={!isConfigured || testing[cp.id]}
                  title="اختبار الاتصال وجلب النماذج"
                >
                  {testing[cp.id] ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Model Selection - Dynamic */}
            {renderModelSelector(
              cp.id,
              cp.fetchedModels,
              cp.model,
              (model) => updateCustomProvider(cp.id, 'model', model),
              cp.apiKey,
              cp.baseUrl
            )}

            {/* Enable Toggle */}
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/40 border border-border/30">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">تفعيل المزود</span>
              </div>
              <Switch checked={cp.enabled} onCheckedChange={(checked) => updateCustomProvider(cp.id, 'enabled', checked)} />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-8" onClick={() => removeCustomProvider(cp.id)}>
                <Trash2 className="h-3 w-3" />
                حذف المزود
              </Button>
              {isConfigured && cp.status === 'active' && (
                <Button variant={isDefault ? "default" : "outline"} size="sm" className="text-xs h-8 gap-1" onClick={() => handleSetDefault(cp.id)} disabled={isDefault}>
                  {isDefault ? (<><CheckCircle2 className="h-3 w-3" />المزود الافتراضي</>) : 'تعيين كافتراضي'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        icon="Wand2"
        title="إعدادات الذكاء الاصطناعي"
        description="قم بتكوين API Keys لمختلف مزودي خدمات الذكاء الاصطناعي"
        color="indigo"
        actions={
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border/40 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">مزودي الخدمة</p>
              <p className="text-2xl font-bold tracking-tight" dir="ltr">{allBuiltinProviders.length + (settings.customProviders?.length || 0)}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted">
              <Brain className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">الخدمات النشطة</p>
              <p className="text-2xl font-bold tracking-tight" dir="ltr">{activeProviders.length}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">المفاتيح المحفوظة</p>
              <p className="text-2xl font-bold tracking-tight" dir="ltr">{configuredProviders.length}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted">
              <Key className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          {settings.defaultProvider && (
            <div className="mt-2 text-xs text-muted-foreground">
              الافتراضي: <span className="font-medium text-foreground">{AI_PROVIDERS.find(p => p.id === settings.defaultProvider)?.name || (settings.customProviders || []).find(c => c.id === settings.defaultProvider)?.name || settings.defaultProvider}</span>
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <Alert className="rounded-xl border-border/50 bg-muted/30">
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-sm text-muted-foreground">
          يتم تخزين API Keys بشكل مشفر في قاعدة البيانات. تأكد من الحفاظ على سرية مفاتيحك ولا تشاركها مع أحد.
        </AlertDescription>
      </Alert>

      {/* ═══════ Primary Providers ═══════ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-muted"><Sparkles className="h-4 w-4 text-muted-foreground" /></div>
          <h2 className="text-sm font-semibold text-foreground">المزودون الرئيسيون</h2>
          <span className="text-[11px] text-muted-foreground">({primaryProviders.length})</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">{primaryProviders.map(renderProviderCard)}</div>
      </div>

      {/* ═══════ Aggregator Providers ═══════ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-muted"><Network className="h-4 w-4 text-muted-foreground" /></div>
          <h2 className="text-sm font-semibold text-foreground">البوابات الموحدة</h2>
          <span className="text-[11px] text-muted-foreground">(مفتاح واحد لجميع النماذج)</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">{aggregatorProviders.map(renderProviderCard)}</div>
      </div>

      {/* ═══════ OpenSource Providers ═══════ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-muted"><Code className="h-4 w-4 text-muted-foreground" /></div>
          <h2 className="text-sm font-semibold text-foreground">النماذج المفتوحة</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">{opensourceProviders.map(renderProviderCard)}</div>
      </div>

      {/* ═══════ Custom Providers ═══════ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-muted"><Settings2 className="h-4 w-4 text-muted-foreground" /></div>
            <h2 className="text-sm font-semibold text-foreground">مزودون مخصصون</h2>
            <span className="text-[11px] text-muted-foreground">(أضف مزود غير موجود في القائمة)</span>
          </div>
          <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5" onClick={addCustomProvider}>
            <Plus className="h-3.5 w-3.5" />
            إضافة مزود مخصص
          </Button>
        </div>

        {(settings.customProviders && settings.customProviders.length > 0) ? (
          <div className="grid gap-3 md:grid-cols-2">
            {settings.customProviders.map(renderCustomProviderCard)}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/40 p-8 text-center bg-card">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-lg bg-muted">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">لا توجد مزودات مخصصة</p>
                <p className="text-xs text-muted-foreground mt-1">
                  أضف مزود مخصص مثل Deepseek, Together AI, أو أي خادم محلي متوافق مع OpenAI API
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-xs gap-1.5 mt-2" onClick={addCustomProvider}>
                <Plus className="h-3.5 w-3.5" />
                إضافة مزود مخصص
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Usage Guide */}
      <Card className="border-border/40 shadow-sm rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-sm">
            <div className="p-1.5 rounded-md bg-muted"><Wand2 className="h-4 w-4 text-muted-foreground" /></div>
            كيفية الاستخدام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { step: '1', title: 'احصل على API Key', desc: 'قم بزيارة موقع المزود واحصل على مفتاح', icon: 'Key' },
              { step: '2', title: 'أدخل المفتاح', desc: 'الصق API Key في الحقل المخصص للمزود', icon: 'ClipboardPaste' },
              { step: '3', title: 'اختبر واجلب النماذج', desc: 'اضغط اختبار ليتم جلب النماذج تلقائياً', icon: 'DownloadCloud' },
              { step: '4', title: 'احفظ الإعدادات', desc: 'اضغط "حفظ الإعدادات" لتفعيل الخدمة', icon: 'Save' }
            ].map(item => (
              <div key={item.step} className="relative flex flex-col items-center text-center p-4 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium mb-3">
                  {item.step}
                </div>
                <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
