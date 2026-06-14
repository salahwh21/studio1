'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';

    const [password, setPassword]     = useState('');
    const [confirm, setConfirm]       = useState('');
    const [showPass, setShowPass]     = useState(false);
    const [loading, setLoading]       = useState(false);
    const [verifying, setVerifying]   = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [done, setDone]             = useState(false);
    const [error, setError]           = useState('');

    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        if (!token) { setVerifying(false); return; }
        fetch(`${API}/api/auth/verify-reset-token?token=${token}`)
            .then(r => r.json())
            .then(d => { setTokenValid(d.valid); setVerifying(false); })
            .catch(() => setVerifying(false));
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
        if (password !== confirm)  { setError('كلمتا المرور غير متطابقتين'); return; }
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'حدث خطأ'); return; }
            setDone(true);
            setTimeout(() => router.push('/login'), 3000);
        } catch {
            setError('تعذّر الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="text-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
                <p className="text-white/50">جاري التحقق من الرابط...</p>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="text-center space-y-4">
                <XCircle className="h-16 w-16 text-red-400 mx-auto" />
                <h2 className="text-2xl font-bold text-white">الرابط غير صالح</h2>
                <p className="text-white/55">هذا الرابط منتهي الصلاحية أو تم استخدامه مسبقاً.</p>
                <button onClick={() => router.push('/forgot-password')}
                    className="mt-2 px-6 py-2.5 bg-primary hover:bg-orange-500 text-white font-bold rounded-xl transition-all text-sm">
                    طلب رابط جديد
                </button>
            </div>
        );
    }

    if (done) {
        return (
            <div className="text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto" />
                <h2 className="text-2xl font-bold text-white">تم تغيير كلمة المرور</h2>
                <p className="text-white/55">سيتم توجيهك لصفحة الدخول خلال ثوانٍ...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-primary mb-1">تعيين كلمة مرور جديدة</h1>
                <p className="text-white/55">أدخل كلمة المرور الجديدة مرتين للتأكيد.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password */}
                <div className="relative group">
                    <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="كلمة المرور الجديدة"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={loading}
                        className="w-full bg-transparent text-white text-lg py-3 pe-10 outline-none border-0 leading-7 placeholder:text-white/30"
                        style={{ caretColor: '#f97316' }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute end-0 top-3 text-white/40 hover:text-white/70 transition-colors">
                        {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    <div className="h-[2px] bg-white/25" />
                    <div className="h-[3px] rounded-full bg-gradient-to-r from-primary to-orange-300 w-0 group-focus-within:w-full transition-all duration-500" />
                </div>

                {/* Confirm */}
                <div className="relative group">
                    <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="تأكيد كلمة المرور"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        disabled={loading}
                        className="w-full bg-transparent text-white text-lg py-3 outline-none border-0 leading-7 placeholder:text-white/30"
                        style={{ caretColor: '#f97316' }}
                    />
                    <div className="h-[2px] bg-white/25" />
                    <div className="h-[3px] rounded-full bg-gradient-to-r from-primary to-orange-300 w-0 group-focus-within:w-full transition-all duration-500" />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-orange-500 text-white font-bold text-base rounded-2xl transition-all duration-200 shadow-lg shadow-primary/30 disabled:opacity-50"
                    style={{ height: '52px' }}>
                    {loading ? <><Loader2 className="h-5 w-5 animate-spin" />جاري الحفظ...</> : 'حفظ كلمة المرور'}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen bg-[#0c0c1a] flex items-center justify-center p-6" dir="rtl">
            <div className="w-full max-w-md">
                <Suspense fallback={<Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </main>
    );
}
