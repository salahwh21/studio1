'use client';

import { useState, useEffect } from 'react';
import { Mail, Save, TestTube2, CheckCircle2, XCircle, Loader2, Eye, EyeOff, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { SettingsHeader } from '@/components/settings-header';

const fetchApi = async (path: string, options?: RequestInit) => {
    const res = await fetch(`/api${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
};

type Provider = 'resend' | 'gmail' | 'custom';

const PROVIDERS: { id: Provider; name: string; host: string; port: number; secure: boolean; description: string; badge?: string }[] = [
    {
        id: 'resend',
        name: 'Resend',
        host: 'smtp.resend.com',
        port: 587,
        secure: false,
        description: '3000 رسالة/شهر مجاناً — الأسهل والأسرع',
        badge: 'مُوصى به',
    },
    {
        id: 'gmail',
        name: 'Gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        description: 'استخدم App Password من إعدادات Google',
    },
    {
        id: 'custom',
        name: 'مخصص',
        host: '',
        port: 587,
        secure: false,
        description: 'أي خادم SMTP آخر',
    },
];

export default function EmailSettingsPage() {
    const { toast } = useToast();
    const [provider, setProvider] = useState<Provider>('resend');
    const [host, setHost]         = useState('smtp.resend.com');
    const [port, setPort]         = useState('587');
    const [secure, setSecure]     = useState('false');
    const [user, setUser]         = useState('');
    const [pass, setPass]         = useState('');
    const [showPass, setShowPass] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [saving, setSaving]     = useState(false);
    const [testing, setTesting]   = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
    const [testMsg, setTestMsg]   = useState('');

    // Load saved config on mount
    useEffect(() => {
        fetchApi('/settings/email-config').then((data: any) => {
            if (data?.host) {
                setHost(data.host);
                setPort(String(data.port || 587));
                setSecure(String(data.secure || false));
                setUser(data.user || '');
                // password never returned from server
                // detect provider
                if (data.host?.includes('resend')) setProvider('resend');
                else if (data.host?.includes('gmail')) setProvider('gmail');
                else setProvider('custom');
            }
        }).catch(() => {});
    }, []);

    const handleProviderChange = (p: Provider) => {
        setProvider(p);
        const found = PROVIDERS.find(x => x.id === p);
        if (found && p !== 'custom') {
            setHost(found.host);
            setPort(String(found.port));
            setSecure(String(found.secure));
            // reset user hint
            if (p === 'resend') setUser('resend');
            else setUser('');
        }
    };

    const handleSave = async () => {
        if (!host || !user || !pass) {
            toast({ variant: 'destructive', title: 'بيانات ناقصة', description: 'املأ جميع الحقول المطلوبة' });
            return;
        }
        setSaving(true);
        try {
            await fetchApi('/settings/email-config', {
                method: 'PUT',
                body: JSON.stringify({ host, port: parseInt(port), secure: secure === 'true', user, pass }),
            });
            toast({ title: '✅ تم الحفظ', description: 'تم حفظ إعدادات البريد بنجاح' });
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'خطأ', description: e.message || 'فشل الحفظ' });
        } finally {
            setSaving(false); }
    };

    const handleTest = async () => {
        if (!testEmail) {
            toast({ variant: 'destructive', title: 'أدخل بريداً للاختبار' });
            return;
        }
        if (!pass) {
            toast({ variant: 'destructive', title: 'أدخل كلمة المرور/المفتاح أولاً' });
            return;
        }
        setTesting(true); setTestResult(null);
        try {
            await fetchApi('/settings/email-config/test', {
                method: 'POST',
                body: JSON.stringify({ host, port: parseInt(port), secure: secure === 'true', user, pass, to: testEmail }),
            });
            setTestResult('success'); setTestMsg('تم إرسال رسالة الاختبار بنجاح');
        } catch (e: any) {
            setTestResult('error'); setTestMsg(e.message || 'فشل الإرسال — تحقق من البيانات');
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="space-y-6">
            <SettingsHeader
                icon="Mail"
                title="إعدادات البريد الإلكتروني"
                description="اضبط خادم SMTP لإرسال رسائل إعادة تعيين كلمة المرور"
                color="amber"
                backHref="/dashboard/settings"
                breadcrumbs={[{ label: 'الإعدادات', href: '/dashboard/settings' }]}
            />

            {/* Row 1: Provider + SMTP side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Provider cards */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary" />
                            مزود البريد
                        </CardTitle>
                        <CardDescription>اختر المزود الذي ستستخدمه</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {PROVIDERS.map(p => (
                            <button
                                key={p.id}
                                onClick={() => handleProviderChange(p.id)}
                                className={`relative rounded-xl border-2 p-3 text-right transition-all ${
                                    provider === p.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/40'
                                }`}
                            >
                                {p.badge && (
                                    <Badge className="absolute top-2 left-2 text-[9px] bg-green-500 px-1.5 py-0">{p.badge}</Badge>
                                )}
                                <div className="font-bold text-sm mb-1">{p.name}</div>
                                <div className="text-[11px] text-muted-foreground leading-snug">{p.description}</div>
                            </button>
                        ))}
                    </CardContent>
                </Card>

                {/* SMTP Config */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">إعدادات SMTP</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {provider === 'resend' && (
                            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-sm">
                                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                <div className="text-blue-700 dark:text-blue-300">
                                    سجّل على <strong>resend.com</strong> → انشئ API Key → ضعه في حقل "كلمة المرور / API Key" أدناه. حقل "اسم المستخدم" يبقى <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">resend</code>
                                </div>
                            </div>
                        )}

                        {provider === 'gmail' && (
                            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-sm">
                                <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <div className="text-amber-700 dark:text-amber-300">
                                    افتح <strong>myaccount.google.com</strong> → Security → 2-Step Verification → App Passwords → أنشئ App Password واستخدمه هنا (ليس كلمة مرور Gmail العادية)
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <Label>خادم SMTP (Host)</Label>
                                <Input
                                    value={host}
                                    onChange={e => setHost(e.target.value)}
                                    placeholder="smtp.example.com"
                                    disabled={provider !== 'custom'}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>المنفذ (Port)</Label>
                                <Input
                                    value={port}
                                    onChange={e => setPort(e.target.value)}
                                    placeholder="587"
                                    disabled={provider !== 'custom'}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>نوع الاتصال</Label>
                                <Select value={secure} onValueChange={setSecure} disabled={provider !== 'custom'}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="false">STARTTLS (Port 587)</SelectItem>
                                        <SelectItem value="true">SSL/TLS (Port 465)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>اسم المستخدم</Label>
                                <Input
                                    value={user}
                                    onChange={e => setUser(e.target.value)}
                                    placeholder={provider === 'resend' ? 'resend' : 'your@email.com'}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>{provider === 'resend' ? 'API Key' : 'كلمة المرور / App Password'}</Label>
                                <div className="relative">
                                    <Input
                                        type={showPass ? 'text' : 'password'}
                                        value={pass}
                                        onChange={e => setPass(e.target.value)}
                                        placeholder={provider === 'resend' ? 're_xxxxxxxxxxxx' : '••••••••••••'}
                                        className="pe-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleSave} disabled={saving} className="gap-2">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                حفظ الإعدادات
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Row 2: Test — full width */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <TestTube2 className="h-4 w-4 text-primary" />
                        اختبار الإرسال
                    </CardTitle>
                    <CardDescription>أرسل رسالة تجريبية للتأكد من صحة الإعدادات</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-3">
                        <Input
                            type="email"
                            placeholder="أدخل بريدك للاختبار"
                            value={testEmail}
                            onChange={e => setTestEmail(e.target.value)}
                            className="flex-1"
                        />
                        <Button onClick={handleTest} disabled={testing} variant="outline" className="gap-2 shrink-0">
                            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube2 className="h-4 w-4" />}
                            إرسال اختبار
                        </Button>
                    </div>
                    {testResult && (
                        <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                            testResult === 'success'
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                        }`}>
                            {testResult === 'success'
                                ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                                : <XCircle className="h-4 w-4 shrink-0" />
                            }
                            {testMsg}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
