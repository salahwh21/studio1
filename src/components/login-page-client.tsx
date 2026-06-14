'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { InstagramIcon } from '@/components/icons/instagram-icon';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
    Shield, Store, Truck, Eye, EyeOff, LogIn, Loader2,
    Package, CheckCircle2, Globe,
} from 'lucide-react';

export default function LoginPageClient() {
    const router = useRouter();
    const context = useSettings();
    const { login, isLoading: authLoading } = useAuth();
    const { toast } = useToast();

    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedQuickLogin, setSelectedQuickLogin] = useState<string | null>(null);
    const [tick, setTick]           = useState(0);
    const [lang, setLang]           = useState<'ar' | 'en'>('ar');

    const translations = {
        ar: {
            welcome: 'أهلاً بك',
            subtitle: 'سجّل دخولك للوصول إلى لوحة التحكم',
            emailPlaceholder: 'البريد الإلكتروني أو رقم الهاتف',
            passPlaceholder: 'كلمة المرور',
            forgot: 'نسيت كلمة المرور؟',
            loginBtn: 'دخول',
            loggingIn: 'جاري الدخول...',
            quickLogin: 'دخول سريع',
            quickDesc: 'حسابات تجريبية للاستكشاف',
            admin: 'مدير النظام', merchant: 'تاجر', driver: 'سائق',
            systemTitle: 'نظام إدارة التوصيل الذكي',
            heroTitle1: 'نظام إدارة', heroTitle2: 'التوصيل الذكي',
            heroSub: 'منصة متكاملة للطلبات · السائقين · المحاسبة',
            daily: 'طلب يومياً', drivers: 'سائق نشط', rate: 'نسبة التوصيل',
            kpiTitle: 'الملخص اليومي', new: 'طلبات جديدة', delivering: 'قيد التوصيل',
            delivered: 'تم التوصيل', returned: 'مرتجعات',
            progress: 'نسبة الإنجاز اليوم',
            ordersTitle: 'جدول الطلبات', mapTitle: 'خريطة السائقين', live: 'مباشر',
            financeTitle: 'المحاسبة — إيرادات الأسبوع',
            financeGrowth: '↑ 12% عن الأسبوع الماضي',
            today: 'اليوم', week: 'الأسبوع',
            colOrder: 'الطلب', colName: 'المستلم', colStatus: 'الحالة',
            days: ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],
            copy: 'جميع الحقوق محفوظة',
            currency: 'د.أ',
            sDelivering: 'توصيل', sDelivered: 'تم التوصيل', sPending: 'انتظار', sReturned: 'مرتجع',
        },
        en: {
            welcome: 'Welcome',
            subtitle: 'Sign in to access your dashboard.',
            emailPlaceholder: 'Email or phone number',
            passPlaceholder: 'Password',
            forgot: 'Forgot password?',
            loginBtn: 'Sign In',
            loggingIn: 'Signing in...',
            quickLogin: 'Quick Login',
            quickDesc: 'Demo accounts for exploration',
            admin: 'Admin', merchant: 'Merchant', driver: 'Driver',
            systemTitle: 'Smart Delivery Management',
            heroTitle1: 'Smart', heroTitle2: 'Delivery Management',
            heroSub: 'All-in-one · orders · drivers · finance',
            daily: 'Daily Orders', drivers: 'Active Drivers', rate: 'Delivery Rate',
            kpiTitle: 'Daily Summary', new: 'New Orders', delivering: 'In Transit',
            delivered: 'Delivered', returned: 'Returned',
            progress: 'Completion Rate Today',
            ordersTitle: 'Orders Table', mapTitle: 'Driver Map', live: 'Live',
            financeTitle: 'Finance — Weekly Revenue',
            financeGrowth: '↑ 12% vs last week',
            today: 'Today', week: 'This Week',
            colOrder: 'Order', colName: 'Recipient', colStatus: 'Status',
            days: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
            copy: 'All rights reserved',
            currency: 'JD',
            sDelivering: 'Transit', sDelivered: 'Delivered', sPending: 'Pending', sReturned: 'Returned',
        },
    };

    const t = translations[lang];

    const defaultLoginSettings = {
        loginLogo: '', loginBg: '',
        welcomeMessage: 'أهلاً بك',
        companyName: 'الوميض',
        showForgotPassword: false,
        socialLinks: { whatsapp: '', instagram: '', facebook: '' },
    };

    const isReady = context && context.isHydrated;
    const settings = isReady ? context.settings : { login: defaultLoginSettings };
    const loginSettings = settings.login || defaultLoginSettings;
    const companyNameAr = loginSettings.companyName || 'الوميض';
    const companyName = lang === 'en' ? 'alwameed' : companyNameAr;
    const socialLinksExist = loginSettings.socialLinks?.whatsapp || loginSettings.socialLinks?.instagram || loginSettings.socialLinks?.facebook;

    useEffect(() => {
        const timer = setInterval(() => setTick(p => p + 1), 2000);
        return () => clearInterval(timer);
    }, []);

    const LoginLogo = ({ size = 30 }: { size?: number }) => {
        const src = loginSettings.loginLogo || '/images/logo.webp';
        return <img src={src} alt="logo" width={size} height={size} style={{ objectFit: 'contain' }} />;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء إدخال البريد وكلمة المرور.' });
            return;
        }
        setIsSubmitting(true);
        try { await login(email, password); }
        catch (error: any) {
            toast({ variant: 'destructive', title: 'فشل تسجيل الدخول', description: error.message || 'تحقق من البيانات.' });
        } finally { setIsSubmitting(false); setSelectedQuickLogin(null); }
    };

    const handleQuickLogin = async (type: 'admin' | 'merchant' | 'driver') => {
        const creds = {
            admin:    { email: 'admin@alwameed.com',    password: '123' },
            merchant: { email: 'merchant@alwameed.com', password: '123' },
            driver:   { email: 'driver@alwameed.com',   password: '123' },
        };
        const cred = creds[type];
        setEmail(cred.email); setPassword(cred.password); setSelectedQuickLogin(type); setIsSubmitting(true);
        try { await login(cred.email, cred.password); }
        catch (error: any) { toast({ variant: 'destructive', title: 'فشل', description: error.message || 'حدث خطأ' }); }
        finally { setIsSubmitting(false); setSelectedQuickLogin(null); }
    };

    const orderRows = [
        { id: 'ORD-1042', name: lang === 'ar' ? 'أحمد محمد'  : 'Ahmad Mohammed', status: t.sDelivering, sc: 'text-blue-400 bg-blue-500/15'    },
        { id: 'ORD-1041', name: lang === 'ar' ? 'سارة علي'   : 'Sara Ali',        status: t.sDelivered,  sc: 'text-green-400 bg-green-500/15'  },
        { id: 'ORD-1040', name: lang === 'ar' ? 'عمر حسن'    : 'Omar Hassan',     status: t.sPending,    sc: 'text-yellow-400 bg-yellow-500/15' },
        { id: 'ORD-1039', name: lang === 'ar' ? 'منى خالد'   : 'Mona Khalid',     status: t.sReturned,   sc: 'text-red-400 bg-red-500/15'       },
    ];

    const driverDots = [
        { l: '18%', top: '22%', c: 'bg-primary',   n: lang === 'ar' ? 'أحمد'  : 'Ahmad',    d: '0s'   },
        { l: '45%', top: '58%', c: 'bg-green-400', n: lang === 'ar' ? 'محمد'  : 'Mohammed', d: '0.5s' },
        { l: '70%', top: '28%', c: 'bg-blue-400',  n: lang === 'ar' ? 'خالد'  : 'Khaled',   d: '1s'   },
    ];

    return (
        <main className="flex min-h-screen" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

            {/* ══════════════════════════════════
                LEFT — Login Form (Dark)
            ══════════════════════════════════ */}
            <div className="w-full lg:w-[42%] relative flex flex-col bg-[#0c0c1a] overflow-hidden">

                {/* Glow top-right */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                {/* Glow bottom-left */}
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-700/15 rounded-full blur-3xl pointer-events-none" />

                {/* Subtle grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.04)_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none" />

                {/* Delivery van watermark — visible */}
                <div className="absolute bottom-0 end-0 w-72 pointer-events-none select-none" style={{ opacity: 0.12 }}>
                    <img src="/images/delivery-van.webp" alt="" className="w-full object-contain object-bottom" style={{ filter: 'brightness(10) saturate(0)' }} />
                </div>

                {/* ── Top bar: Lang toggle only ── */}
                <div className="flex items-center justify-end px-8 pt-7 relative z-10">
                    <button
                        onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 hover:bg-primary hover:text-white border border-white/20 hover:border-primary rounded-lg px-3 py-1.5 transition-all duration-200"
                    >
                        <Globe className="h-3.5 w-3.5" />
                        {lang === 'ar' ? 'English' : 'عربي'}
                    </button>
                </div>

                {/* ── Form ── */}
                <div className="flex-1 flex items-center justify-center px-8 py-4 relative z-10">
                    <div className="w-full max-w-[360px]">

                        {/* Company name + logo — huge gradient */}
                        <div className="mb-9">
                            <div className="flex items-center gap-3">
                                <LoginLogo size={110} />
                                <span className="text-[58px] font-black leading-none bg-gradient-to-b from-primary via-orange-400 to-orange-200 bg-clip-text text-transparent">
                                    {companyName}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 mb-1.5">
                                <span className="text-white/70 text-sm tracking-[0.15em] font-bold shrink-0 uppercase">
                                    {t.systemTitle}
                                </span>
                                <div className={`h-[2px] flex-1 ${lang === 'ar' ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-primary/80 to-transparent`} />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-0.5">{t.welcome}</h2>
                            <p className="text-white/70 text-base">{t.subtitle}</p>
                        </div>

                        {/* ── Inputs (underline style) ── */}
                        <form onSubmit={handleLogin} className="space-y-6">

                            {/* Email */}
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder={t.emailPlaceholder}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    autoComplete="email"
                                    className="w-full bg-transparent text-white text-lg py-3 outline-none border-0 leading-7"
                                    style={{ caretColor: '#f97316' }}
                                />
                                <style>{`.login-input::placeholder { color: rgba(255,255,255,0.35); }`}</style>
                                <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white/30" />
                                <div className="absolute bottom-0 start-0 h-[3px] rounded-full bg-gradient-to-r from-primary to-orange-300 w-0 group-focus-within:w-full transition-all duration-500" />
                            </div>

                            {/* Password */}
                            <div className="relative group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={t.passPlaceholder}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={isSubmitting}
                                    autoComplete="current-password"
                                    className="w-full bg-transparent text-white text-lg py-3 pe-10 outline-none border-0 leading-7"
                                    style={{ caretColor: '#f97316' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isSubmitting}
                                    className="absolute end-0 top-3 text-white/45 hover:text-white/80 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                                <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white/30" />
                                <div className="absolute bottom-0 start-0 h-[3px] rounded-full bg-gradient-to-r from-primary to-orange-300 w-0 group-focus-within:w-full transition-all duration-500" />
                            </div>

                            <div className="text-end">
                                <button
                                    type="button"
                                    onClick={() => router.push('/forgot-password')}
                                    className="text-sm text-white/50 hover:text-primary transition-colors"
                                >
                                    {t.forgot}
                                </button>
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || authLoading}
                                className="w-full flex items-center justify-center gap-2.5 bg-primary hover:bg-orange-500 text-white font-bold text-base rounded-2xl transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 mt-2"
                                style={{ height: '52px' }}
                            >
                                {isSubmitting && !selectedQuickLogin
                                    ? <><Loader2 className="h-5 w-5 animate-spin" />{t.loggingIn}</>
                                    : <><LogIn className="h-5 w-5" />{t.loginBtn}</>
                                }
                            </button>
                        </form>

                        {/* ── Quick login ── */}
                        <div className="mt-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-1 h-px bg-white/15" />
                                <span className="text-white/50 text-[11px] font-medium shrink-0">{t.quickLogin}</span>
                                <div className="flex-1 h-px bg-white/15" />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {([
                                    { type: 'admin'    as const, label: t.admin,    Icon: Shield, border: 'border-red-500/40',    bg: 'hover:bg-red-500/15',    ic: 'text-red-400',    sc: 'text-red-400'    },
                                    { type: 'merchant' as const, label: t.merchant, Icon: Store,  border: 'border-blue-500/40',   bg: 'hover:bg-blue-500/15',   ic: 'text-blue-400',   sc: 'text-blue-400'   },
                                    { type: 'driver'   as const, label: t.driver,   Icon: Truck,  border: 'border-green-500/40',  bg: 'hover:bg-green-500/15',  ic: 'text-green-400',  sc: 'text-green-400'  },
                                ] as const).map(({ type, label, Icon, border, bg, ic, sc }) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleQuickLogin(type)}
                                        disabled={isSubmitting}
                                        className={`border ${border} rounded-xl py-3 flex flex-col items-center gap-1.5 transition-all duration-200 disabled:opacity-40 ${bg}`}
                                    >
                                        {selectedQuickLogin === type
                                            ? <Loader2 className={`h-4 w-4 animate-spin ${sc}`} />
                                            : <Icon className={`h-4 w-4 ${ic}`} />
                                        }
                                        <span className="text-[11px] text-white/70 font-medium">{label}</span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-center text-white/35 mt-2">{t.quickDesc}</p>
                        </div>

                        {/* Social */}
                        {socialLinksExist && (
                            <div className="flex justify-center gap-2 mt-6">
                                {loginSettings.socialLinks?.whatsapp && (
                                    <a href={`https://wa.me/${loginSettings.socialLinks.whatsapp}`} target="_blank" rel="noopener noreferrer"
                                        className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center hover:border-green-400/60 hover:bg-green-500/15 transition-all">
                                        <WhatsappIcon className="h-4 w-4 text-green-400" />
                                    </a>
                                )}
                                {loginSettings.socialLinks?.instagram && (
                                    <a href={loginSettings.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                                        className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center hover:border-pink-400/60 hover:bg-pink-500/15 transition-all">
                                        <InstagramIcon className="h-4 w-4 text-pink-400" />
                                    </a>
                                )}
                                {loginSettings.socialLinks?.facebook && (
                                    <a href={loginSettings.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                                        className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center hover:border-blue-400/60 hover:bg-blue-500/15 transition-all">
                                        <FacebookIcon className="h-4 w-4 text-blue-400" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-center text-[11px] text-white/30 pb-6 relative z-10">
                    © {new Date().getFullYear()} {companyName} — {t.copy}
                </p>
            </div>

            {/* ══════════════════════════════════
                RIGHT — Product Mockup
            ══════════════════════════════════ */}
            <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex-col items-center justify-between p-12">

                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />

                {/* Hero */}
                <div className="relative z-10 text-center">
                    <h1 className="text-3xl font-extrabold text-white leading-tight mb-2">
                        {t.heroTitle1}{' '}
                        <span className="bg-gradient-to-l from-primary to-orange-300 bg-clip-text text-transparent">
                            {t.heroTitle2}
                        </span>
                    </h1>
                    <p className="text-white/60 text-sm">{t.heroSub}</p>
                </div>

                {/* Mockup stack */}
                <div className="relative z-10 w-full max-w-2xl flex flex-col gap-2 my-3">

                    {/* KPI */}
                    <div className="bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/5">
                            <div className="flex gap-1">
                                <div className="h-2 w-2 rounded-full bg-red-400/60" />
                                <div className="h-2 w-2 rounded-full bg-yellow-400/60" />
                                <div className="h-2 w-2 rounded-full bg-green-400/60" />
                            </div>
                            <span className="text-[11px] text-white/60 ms-1">{t.kpiTitle}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 p-3">
                            {[
                                { label: t.new,        value: '124', color: 'text-primary',   bg: 'bg-primary/10 border-primary/20'     },
                                { label: t.delivering, value: '38',  color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/20'   },
                                { label: t.delivered,  value: '892', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                                { label: t.returned,   value: '12',  color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/20'     },
                            ].map(({ label, value, color, bg }) => (
                                <div key={label} className={`rounded-xl border p-2 ${bg}`}>
                                    <div className={`text-lg font-extrabold ${color}`}>{value}</div>
                                    <div className="text-[9px] text-white/55 mt-0.5 leading-tight">{label}</div>
                                </div>
                            ))}
                        </div>
                        <div className="px-3 pb-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] text-white/50">{t.progress}</span>
                                <span className="text-[9px] text-green-400 font-bold">83%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden flex gap-px">
                                <div className="bg-primary/80 rounded-full"  style={{ width: '12%' }} />
                                <div className="bg-blue-400/80 rounded-full" style={{ width: '4%'  }} />
                                <div className="bg-green-400/80 rounded-full" style={{ width: '83%' }} />
                                <div className="bg-red-400/80 rounded-full flex-1" />
                            </div>
                        </div>
                    </div>

                    {/* Orders + Map */}
                    <div className="grid grid-cols-2 gap-3">

                        <div className="bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-white/5">
                                <div className="flex gap-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-400/60" />
                                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-400/60" />
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-400/60" />
                                </div>
                                <span className="text-[10px] text-white/60 ms-1">{t.ordersTitle}</span>
                            </div>
                            <div className="grid grid-cols-3 px-3 py-1.5 border-b border-white/10">
                                {[t.colOrder, t.colName, t.colStatus].map(h => (
                                    <div key={h} className="text-[9px] text-white/45 font-medium">{h}</div>
                                ))}
                            </div>
                            {orderRows.map((row, i) => (
                                <div key={i} className={`grid grid-cols-3 px-3 py-2 border-b border-white/5 ${i === tick % 4 ? 'bg-primary/8' : ''}`}>
                                    <div className="text-[9px] text-primary/90 font-mono">{row.id}</div>
                                    <div className="text-[9px] text-white/65 truncate">{row.name}</div>
                                    <div>
                                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${row.sc}`}>{row.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-white/5">
                                <div className="flex gap-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-400/60" />
                                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-400/60" />
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-400/60" />
                                </div>
                                <span className="text-[10px] text-white/60 ms-1">{t.mapTitle}</span>
                                <div className="ms-auto flex items-center gap-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-[9px] text-green-400">{t.live}</span>
                                </div>
                            </div>
                            <div className="relative flex-1 min-h-[140px] bg-[#0a1628]">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
                                <div className="absolute top-[45%] left-0 right-0 h-px bg-white/10" />
                                <div className="absolute top-0 bottom-0 left-[38%] w-px bg-white/10" />
                                <div className="absolute top-0 bottom-0 left-[68%] w-px bg-white/10" />
                                {driverDots.map(({ l, top, c, n, d }, i) => (
                                    <div key={i} className="absolute flex flex-col items-center gap-0.5" style={{ left: l, top }}>
                                        <div className="relative">
                                            <div className={`h-3.5 w-3.5 rounded-full ${c} animate-ping opacity-35 absolute inset-0`} style={{ animationDelay: d }} />
                                            <div className={`h-3.5 w-3.5 rounded-full ${c} relative z-10 shadow`} />
                                        </div>
                                        <span className="text-[8px] text-white/70 bg-black/50 px-1 rounded-sm">{n}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Finance */}
                    <div className="bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/5">
                            <div className="flex gap-1">
                                <div className="h-2 w-2 rounded-full bg-red-400/60" />
                                <div className="h-2 w-2 rounded-full bg-yellow-400/60" />
                                <div className="h-2 w-2 rounded-full bg-green-400/60" />
                            </div>
                            <span className="text-[11px] text-white/60 ms-1">{t.financeTitle}</span>
                            <div className="ms-auto">
                                <span className="text-[10px] text-green-400 font-bold bg-green-500/15 px-2 py-0.5 rounded-full">{t.financeGrowth}</span>
                            </div>
                        </div>
                        <div className="p-3 flex items-end gap-3">
                            <div className="flex items-end gap-1 h-12 flex-1">
                                {[30, 52, 38, 75, 58, 88, 70].map((h, i) => (
                                    <div key={i} className="flex-1 rounded-sm"
                                        style={{
                                            height: `${h}%`,
                                            background: i === 5
                                                ? 'linear-gradient(to top, rgba(249,115,22,0.9), rgba(249,115,22,0.5))'
                                                : 'linear-gradient(to top, rgba(249,115,22,0.4), rgba(249,115,22,0.15))',
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                                <div>
                                    <div className="text-[9px] text-white/50">{t.today}</div>
                                    <div className="text-sm font-extrabold text-white">2,450 <span className="text-[8px] text-white/40 font-normal">{t.currency}</span></div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-white/50">{t.week}</div>
                                    <div className="text-sm font-extrabold text-green-400">15,230 <span className="text-[8px] text-white/40 font-normal">{t.currency}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between px-4 pb-3">
                            {t.days.map((d: string, i: number) => (
                                <span key={i} className={`text-[9px] flex-1 text-center ${i === 5 ? 'text-primary font-bold' : 'text-white/40'}`}>
                                    {d.slice(0, 3)}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="relative z-10 grid grid-cols-3 gap-3 w-full max-w-2xl">
                    {[
                        { value: '+1000', label: t.daily,   Icon: Package      },
                        { value: '+50',   label: t.drivers, Icon: Truck        },
                        { value: '98%',   label: t.rate,    Icon: CheckCircle2 },
                    ].map(({ value, label, Icon }) => (
                        <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-2 text-center text-white">
                            <Icon className="h-3.5 w-3.5 text-primary mx-auto mb-1 opacity-80" />
                            <div className="text-base font-extrabold">{value}</div>
                            <div className="text-white/55 text-[10px]">{label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
