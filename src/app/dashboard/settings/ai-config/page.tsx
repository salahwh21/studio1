'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Image as ImageIcon,
  Code,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsHeader } from '@/components/settings-header';

interface AIProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  color: string;
  apiKeyLabel: string;
  placeholder: string;
  docsUrl: string;
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: <Sparkles className="h-5 w-5" />,
    description: 'GPT-4, GPT-3.5 Turbo للمحادثات وتحسين المسارات',
    features: ['تحسين المسارات', 'خدمة العملاء', 'تحليل البيانات', 'إنشاء المحتوى'],
    color: 'from-green-500 to-emerald-600',
    apiKeyLabel: 'OpenAI API Key',
    placeholder: 'sk-proj-...',
    docsUrl: 'https://platform.openai.com/api-keys'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    icon: <Brain className="h-5 w-5" />,
    description: 'Claude 3 للمحادثات الذكية والتحليل المتقدم',
    features: ['محادثات طويلة', 'تحليل متقدم', 'فهم السياق', 'ردود دقيقة'],
    color: 'from-orange-500 to-red-600',
    apiKeyLabel: 'Anthropic API Key',
    placeholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys'
  },
  {
    id: 'google',
    name: 'Google Gemini',
    icon: <Zap className="h-5 w-5" />,
    description: 'Gemini Pro للذكاء الاصطناعي المتعدد الوسائط',
    features: ['معالجة الصور', 'تحليل متعدد', 'سرعة عالية', 'دقة ممتازة'],
    color: 'from-blue-500 to-indigo-600',
    apiKeyLabel: 'Google AI API Key',
    placeholder: 'AIza...',
    docsUrl: 'https://makersuite.google.com/app/apikey'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    icon: <Bot className="h-5 w-5" />,
    description: 'نماذج مفتوحة المصدر عالية الأداء',
    features: ['أداء عالي', 'تكلفة منخفضة', 'خصوصية', 'مرونة'],
    color: 'from-purple-500 to-pink-600',
    apiKeyLabel: 'Mistral API Key',
    placeholder: '...',
    docsUrl: 'https://console.mistral.ai/api-keys'
  },
  {
    id: 'cohere',
    name: 'Cohere',
    icon: <MessageSquare className="h-5 w-5" />,
    description: 'متخصص في معالجة اللغة الطبيعية',
    features: ['فهم اللغة', 'تصنيف النصوص', 'البحث الدلالي', 'التلخيص'],
    color: 'from-cyan-500 to-blue-600',
    apiKeyLabel: 'Cohere API Key',
    placeholder: '...',
    docsUrl: 'https://dashboard.cohere.com/api-keys'
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    icon: <Code className="h-5 w-5" />,
    description: 'الوصول لآلاف النماذج المفتوحة',
    features: ['نماذج متنوعة', 'مجتمع كبير', 'مجاني', 'قابل للتخصيص'],
    color: 'from-yellow-500 to-orange-600',
    apiKeyLabel: 'Hugging Face Token',
    placeholder: 'hf_...',
    docsUrl: 'https://huggingface.co/settings/tokens'
  }
];

interface AIConfig {
  [key: string]: {
    apiKey: string;
    enabled: boolean;
    lastTested?: string;
    status?: 'active' | 'error' | 'untested';
  };
}

export default function AIConfigPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<AIConfig>({});
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [testing, setTesting] = useState<{ [key: string]: boolean }>({});
  const [saving, setSaving] = useState(false);

  // Load config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse AI config', e);
      }
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem('ai_config', JSON.stringify(config));
      toast({
        title: 'تم الحفظ بنجاح',
        description: 'تم حفظ إعدادات الذكاء الاصطناعي',
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'فشل الحفظ',
        description: 'حدث خطأ أثناء حفظ الإعدادات',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (providerId: string) => {
    const providerConfig = config[providerId];
    if (!providerConfig?.apiKey) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'الرجاء إدخال API Key أولاً',
      });
      return;
    }

    setTesting({ ...testing, [providerId]: true });

    // Simulate API test (replace with actual API call)
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo

      setConfig({
        ...config,
        [providerId]: {
          ...providerConfig,
          lastTested: new Date().toISOString(),
          status: success ? 'active' : 'error'
        }
      });

      setTesting({ ...testing, [providerId]: false });

      toast({
        variant: success ? 'default' : 'destructive',
        title: success ? 'الاتصال ناجح' : 'فشل الاتصال',
        description: success
          ? 'تم التحقق من API Key بنجاح'
          : 'تحقق من صحة API Key والمحاولة مرة أخرى',
      });
    }, 2000);
  };

  const handleUpdateKey = (providerId: string, apiKey: string) => {
    setConfig({
      ...config,
      [providerId]: {
        ...config[providerId],
        apiKey,
        enabled: !!apiKey,
        status: 'untested'
      }
    });
  };

  const toggleShowKey = (providerId: string) => {
    setShowKeys({ ...showKeys, [providerId]: !showKeys[providerId] });
  };

  const getStatusBadge = (status?: 'active' | 'error' | 'untested') => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 ml-1" />نشط</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 ml-1" />خطأ</Badge>;
      default:
        return <Badge variant="outline">لم يتم الاختبار</Badge>;
    }
  };

  const activeCount = Object.values(config).filter(c => c.status === 'active').length;

  return (
    <div className="space-y-6">
      <SettingsHeader
        icon="Wand2"
        title="إعدادات الذكاء الاصطناعي"
        description="قم بتكوين API Keys لمختلف مزودي خدمات الذكاء الاصطناعي"
        color="indigo"
      />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 ml-2" />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مزودي الخدمة</p>
                <p className="text-3xl font-bold" dir="ltr">{AI_PROVIDERS.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الخدمات النشطة</p>
                <p className="text-3xl font-bold" dir="ltr">{activeCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المفاتيح المحفوظة</p>
                <p className="text-3xl font-bold" dir="ltr">{Object.keys(config).length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Key className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <Brain className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <strong>ملاحظة:</strong> يتم تخزين API Keys محلياً في متصفحك فقط ولا يتم إرسالها لأي خادم.
          تأكد من الحفاظ على سرية مفاتيحك ولا تشاركها مع أحد.
        </AlertDescription>
      </Alert>

      {/* Providers Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {AI_PROVIDERS.map((provider) => {
          const providerConfig = config[provider.id] || { apiKey: '', enabled: false };
          const isConfigured = !!providerConfig.apiKey;

          return (
            <Card key={provider.id} className="overflow-hidden">
              <CardHeader className={cn("bg-gradient-to-r text-white", provider.color)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      {provider.icon}
                    </div>
                    <div>
                      <CardTitle className="text-white">{provider.name}</CardTitle>
                      <CardDescription className="text-white/80 text-sm">
                        {provider.description}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(providerConfig.status)}
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Features */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">المميزات</Label>
                  <div className="flex flex-wrap gap-2">
                    {provider.features.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* API Key Input */}
                <div className="space-y-2">
                  <Label htmlFor={`${provider.id}-key`} className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
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
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute left-0 top-0 h-full"
                        onClick={() => toggleShowKey(provider.id)}
                      >
                        {showKeys[provider.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleTestConnection(provider.id)}
                      disabled={!isConfigured || testing[provider.id]}
                    >
                      {testing[provider.id] ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {providerConfig.lastTested && (
                    <p className="text-xs text-muted-foreground">
                      آخر اختبار: {new Date(providerConfig.lastTested).toLocaleString('ar-JO')}
                    </p>
                  )}
                </div>

                {/* Docs Link */}
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto"
                  onClick={() => window.open(provider.docsUrl, '_blank')}
                >
                  كيفية الحصول على API Key ←
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            كيفية الاستخدام
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">1</span>
                احصل على API Key
              </h4>
              <p className="text-sm text-muted-foreground pr-8">
                قم بزيارة موقع المزود واحصل على API Key من لوحة التحكم الخاصة بهم
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">2</span>
                أدخل المفتاح
              </h4>
              <p className="text-sm text-muted-foreground pr-8">
                الصق API Key في الحقل المخصص للمزود الذي تريد استخدامه
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">3</span>
                اختبر الاتصال
              </h4>
              <p className="text-sm text-muted-foreground pr-8">
                اضغط على زر الاختبار للتأكد من صحة المفتاح وعمل الاتصال
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">4</span>
                احفظ الإعدادات
              </h4>
              <p className="text-sm text-muted-foreground pr-8">
                اضغط على زر "حفظ الإعدادات" لتفعيل الخدمة في نظامك
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
