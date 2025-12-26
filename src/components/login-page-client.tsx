'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/logo';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { InstagramIcon } from '@/components/icons/instagram-icon';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
    Shield, 
    Store, 
    Truck, 
    Eye, 
    EyeOff, 
    LogIn, 
    Loader2,
    Phone,
    Lock,
    Sparkles,
    Package,
    MapPin,
    Clock,
    CheckCircle2,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';

export default function LoginPageClient() {
    const router = useRouter();
    const context = useSettings();
    const { login, isLoading: authLoading } = useAuth();
    const { toast } = useToast();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedQuickLogin, setSelectedQuickLogin] = useState<string | null>(null);
    const [currentFeature, setCurrentFeature] = useState(0);

    const defaultLoginSettings = {
        loginLogo: '',
        loginBg: '',
        welcomeMessage: 'مرحباً بعودتك',
        companyName: 'الوميض',
        showForgotPassword: false,
        socialLinks: { whatsapp: '', instagram: '', facebook: '' }
    };

    const isReady = context && context.isHydrated;
    const settings = isReady ? context.settings : { login: defaultLoginSettings };
    const loginSettings = settings.login || defaultLoginSettings;

    const socialLinksExist = loginSettings.socialLinks.whatsapp || loginSettings.socialLinks.instagram || loginSettings.socialLinks.facebook;

    // Features carousel
    const features = [
        { icon: Package, title: 'إدارة الطلبات', desc: 'تتبع وإدارة جميع الطلبات بسهولة', color: 'text-blue-500' },
        { icon: MapPin, title: 'تتبع مباشر', desc: 'تتبع السائقين والطلبات على الخريطة', color: 'text-green-500' },
        { icon: TrendingUp, title: 'تقارير متقدمة', desc: 'إحصائيات وتقارير شاملة للأداء', color: 'text-purple-500' },
        { icon: Users, title: 'إدارة الفريق', desc: 'إدارة السائقين والتجار بكفاءة', color: 'text-orange-500' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % features.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const LoginLogo = () => {
        if (loginSettings.loginLogo) {
            return (
                <img
                    src={loginSettings.loginLogo}
                    alt={loginSettings.companyName || "Company Logo"}
                    style={{
                        maxWidth: 160,
                        maxHeight: 60,
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain'
                    }}
                />
            );
        }
        return <Logo />;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast({
                variant: 'destructive',
                title: "خطأ في البيانات",
                description: "الرجاء إدخال البريد الإلكتروني وكلمة المرور.",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await login(email, password);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "فشل تسجيل الدخول",
                description: error.message || "الرجاء التحقق من البريد الإلكتروني وكلمة المرور.",
            });
        } finally {
            setIsSubmitting(false);
            setSelectedQuickLogin(null);
        }
    };

    const handleQuickLogin = async (type: 'admin' | 'merchant' | 'driver') => {
        const credentials = {
            admin: { email: 'admin@alwameed.com', password: '123' },
            merchant: { email: 'merchant@alwameed.com', password: '123' },
            driver: { email: 'driver@alwameed.com', password: '123' },
        };

        const cred = credentials[type];
        setEmail(cred.email);
        setPassword(cred.password);
        setSelectedQuickLogin(type);
        setIsSubmitting(true);

        try {
            await login(cred.email, cred.password);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "فشل تسجيل الدخول",
                description: error.message || "حدث خطأ",
            });
        } finally {
            setIsSubmitting(false);
            setSelectedQuickLogin(null);
        }
    };

    const FeatureIcon = features[currentFeature].icon;

    return (
        <main className="relative flex min-h-screen" dir="rtl">
            {/* Left Side - Features Panel (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
                    {/* Logo */}
                    <div className="mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                        <div className="text-white">
                            <LoginLogo />
                        </div>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-4xl font-bold mb-4 text-center">
                        نظام إدارة التوصيل المتكامل
                    </h1>
                    <p className="text-white/80 text-lg mb-12 text-center max-w-md">
                        حلول ذكية لإدارة عمليات التوصيل وتتبع الطلبات بكفاءة عالية
                    </p>

                    {/* Animated Feature Card */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-sm transition-all duration-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl bg-white/20 ${features[currentFeature].color}`}>
                                <FeatureIcon className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">{features[currentFeature].title}</h3>
                                <p className="text-white/70 text-sm">{features[currentFeature].desc}</p>
                            </div>
                        </div>
                        
                        {/* Feature indicators */}
                        <div className="flex justify-center gap-2 mt-4">
                            {features.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        idx === currentFeature ? 'w-8 bg-white' : 'w-2 bg-white/30'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6 mt-12 w-full max-w-md">
                        <div className="text-center">
                            <div className="text-3xl font-bold">+1000</div>
                            <div className="text-white/70 text-sm">طلب يومياً</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">+50</div>
                            <div className="text-white/70 text-sm">سائق نشط</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">98%</div>
                            <div className="text-white/70 text-sm">نسبة التوصيل</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/30">
                {/* Mobile decorative elements */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl lg:hidden" />
                <div className="absolute bottom-10 left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl lg:hidden" />

                <Card className="w-full max-w-md rounded-3xl border shadow-xl bg-card/95 backdrop-blur-sm overflow-hidden">
                    {/* Mobile Logo */}
                    <div className="lg:hidden bg-gradient-to-r from-primary/10 to-primary/5 p-6 text-center">
                        <div className="mb-3 flex justify-center">
                            <div className="p-3 bg-white dark:bg-card rounded-2xl shadow-lg">
                                <LoginLogo />
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-6 lg:p-8">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold mb-2">
                                {loginSettings.welcomeMessage || 'مرحباً بعودتك'}
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                سجل دخولك للوصول إلى لوحة التحكم
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Email/Phone Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                                    <Phone className="h-4 w-4 text-primary" />
                                    رقم الهاتف أو البريد الإلكتروني
                                </Label>
                                <Input
                                    id="email"
                                    type="text"
                                    placeholder="أدخل رقم الهاتف أو البريد"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    autoComplete="email"
                                    className="h-12 text-base rounded-xl border-muted-foreground/20 focus:border-primary"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                                    <Lock className="h-4 w-4 text-primary" />
                                    كلمة المرور
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="أدخل كلمة المرور"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        disabled={isSubmitting}
                                        autoComplete="current-password"
                                        className="h-12 pl-12 text-base rounded-xl border-muted-foreground/20 focus:border-primary"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isSubmitting}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Forgot Password */}
                            {loginSettings.showForgotPassword && (
                                <div className="flex justify-start">
                                    <Button variant="link" size="sm" className="p-0 h-auto text-primary text-sm">
                                        هل نسيت كلمة المرور؟
                                    </Button>
                                </div>
                            )}

                            {/* Login Button */}
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-12 text-base font-semibold rounded-xl gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                                disabled={isSubmitting || authLoading}
                            >
                                {isSubmitting && !selectedQuickLogin ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        جاري تسجيل الدخول...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="h-5 w-5" />
                                        تسجيل الدخول
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Quick Login Section */}
                        <div className="mt-8">
                            <div className="flex items-center gap-3 mb-4">
                                <Separator className="flex-1" />
                                <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full">
                                    <Zap className="h-3 w-3 text-amber-500" />
                                    <span className="text-xs text-muted-foreground font-medium">دخول سريع</span>
                                </div>
                                <Separator className="flex-1" />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <Button
                                    variant="outline"
                                    className="h-auto py-4 flex-col gap-2 rounded-xl hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/20 transition-all group"
                                    disabled={isSubmitting}
                                    onClick={() => handleQuickLogin('admin')}
                                >
                                    {selectedQuickLogin === 'admin' ? (
                                        <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                                    ) : (
                                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                                            <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        </div>
                                    )}
                                    <span className="text-xs font-semibold">مدير النظام</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="h-auto py-4 flex-col gap-2 rounded-xl hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/20 transition-all group"
                                    disabled={isSubmitting}
                                    onClick={() => handleQuickLogin('merchant')}
                                >
                                    {selectedQuickLogin === 'merchant' ? (
                                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                    ) : (
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                            <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    )}
                                    <span className="text-xs font-semibold">تاجر</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="h-auto py-4 flex-col gap-2 rounded-xl hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950/20 transition-all group"
                                    disabled={isSubmitting}
                                    onClick={() => handleQuickLogin('driver')}
                                >
                                    {selectedQuickLogin === 'driver' ? (
                                        <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                                    ) : (
                                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                                            <Truck className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                    )}
                                    <span className="text-xs font-semibold">سائق</span>
                                </Button>
                            </div>

                            <p className="text-[11px] text-center text-muted-foreground mt-3">
                                حسابات تجريبية للتعرف على إمكانيات النظام
                            </p>
                        </div>

                        {/* Social Links */}
                        {socialLinksExist && (
                            <>
                                <Separator className="my-6" />
                                <div className="flex justify-center gap-2">
                                    {loginSettings.socialLinks.whatsapp && (
                                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-green-50 dark:hover:bg-green-950/30" asChild>
                                            <a href={`https://wa.me/${loginSettings.socialLinks.whatsapp}`} target="_blank" rel="noopener noreferrer">
                                                <WhatsappIcon className="h-5 w-5 text-green-600" />
                                            </a>
                                        </Button>
                                    )}
                                    {loginSettings.socialLinks.instagram && (
                                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-pink-50 dark:hover:bg-pink-950/30" asChild>
                                            <a href={loginSettings.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                                                <InstagramIcon className="h-5 w-5 text-pink-600" />
                                            </a>
                                        </Button>
                                    )}
                                    {loginSettings.socialLinks.facebook && (
                                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-blue-50 dark:hover:bg-blue-950/30" asChild>
                                            <a href={loginSettings.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                                                <FacebookIcon className="h-5 w-5 text-blue-600" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>

                    {/* Footer */}
                    <div className="px-6 pb-6 text-center">
                        <p className="text-xs text-muted-foreground">
                            © {new Date().getFullYear()} {loginSettings.companyName || 'الوميض'} - جميع الحقوق محفوظة
                        </p>
                    </div>
                </Card>
            </div>
        </main>
    );
}
