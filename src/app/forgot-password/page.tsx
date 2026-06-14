'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) { setError('أدخل بريدك الإلكتروني'); return; }
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'حدث خطأ'); return; }
            setDone(true);
        } catch {
            setError('تعذّر الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0c0c1a] flex items-center justify-center p-6" dir="rtl">
            <div className="w-full max-w-md">

                {done ? (
                    <div className="text-center space-y-4">
                        <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto" />
                        <h2 className="text-2xl font-bold text-white">تم الإرسال</h2>
                        <p className="text-white/60">إذا كان البريد مسجلاً ستصلك رسالة بها رابط إعادة التعيين خلال دقائق.</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="mt-4 flex items-center gap-2 mx-auto text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                        >
                            <ArrowRight className="h-4 w-4" />
                            العودة لتسجيل الدخول
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl font-black text-primary mb-1">نسيت كلمة المرور؟</h1>
                            <p className="text-white/55">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative group">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-white/40 shrink-0" />
                                    <input
                                        type="email"
                                        placeholder="البريد الإلكتروني"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        disabled={loading}
                                        autoComplete="email"
                                        className="flex-1 bg-transparent text-white text-lg py-3 outline-none border-0 leading-7 placeholder:text-white/30"
                                        style={{ caretColor: '#f97316' }}
                                    />
                                </div>
                                <div className="h-[2px] bg-white/25" />
                                <div className="h-[3px] rounded-full bg-gradient-to-r from-primary to-orange-300 w-0 group-focus-within:w-full transition-all duration-500" />
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-orange-500 text-white font-bold text-base rounded-2xl transition-all duration-200 shadow-lg shadow-primary/30 disabled:opacity-50"
                                style={{ height: '52px' }}
                            >
                                {loading ? <><Loader2 className="h-5 w-5 animate-spin" />جاري الإرسال...</> : 'إرسال رابط الاستعادة'}
                            </button>
                        </form>

                        <button
                            onClick={() => router.push('/login')}
                            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm font-medium transition-colors"
                        >
                            <ArrowRight className="h-4 w-4" />
                            العودة لتسجيل الدخول
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
