/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, History, Star, MapPin, Bolt } from 'lucide-react';
import { Order, Role } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (role: Role, username: string) => void;
  recentOrders: Order[];
}

export default function LoginScreen({ onLoginSuccess, recentOrders }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<Role>('merchant'); // default active is merchant 'تاجر' as highlighted in orange border in screenshot
  const [email, setEmail] = useState('example@alwameed.com');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [countdown, setCountdown] = useState(12);
  const [isPathHovered, setIsPathHovered] = useState(false);

  // Update credentials based on selected role for direct playability!
  useEffect(() => {
    if (selectedRole === 'driver') {
      setEmail('driver@alwameed.com');
      setPassword('123');
    } else if (selectedRole === 'merchant') {
      setEmail('merchant@alwameed.com');
      setPassword('123');
    } else {
      setEmail('admin@alwameed.com');
      setPassword('123');
    }
  }, [selectedRole]);

  // Live countdown ticker to simulate live delivery movement
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 12));
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(selectedRole, email.split('@')[0]);
  };

  return (
    <div dir="rtl" className="flex min-h-screen w-full relative amman-map-bg text-slate-800 font-sans">
      
      {/* REVOLUTIONARY GLOWING NEON ORBS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="neon-orb-1 top-10 right-10"></div>
        <div className="neon-orb-2 bottom-20 left-20"></div>
        <div className="neon-orb-1 bottom-10 right-1/3 opacity-70"></div>
      </div>

      {/* BACKGROUND DECORATIVE NETWORKS */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-40 animate-pulse duration-[8000ms]" preserveAspectRatio="none" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
          {/* Simulated complex road networks of Amman */}
          <g fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2">
            <path d="M-100,200 Q300,250 400,400 T800,600 L1300,550" />
            <path d="M200,-50 Q250,300 400,400 T600,850" />
            <path d="M800,-50 Q750,200 600,400 T300,850" />
            {/* Minor roads */}
            <path d="M100,300 L250,350 L350,280 L400,400" strokeWidth="1" />
            <path d="M500,500 L650,450 L750,550 L800,600" strokeWidth="1" />
            <path d="M300,600 L450,650 L550,550 L600,400" strokeWidth="1" />
          </g>
          {/* Glowing Logistics Paths */}
          <path className="logistic-path" d="M200,200 Q400,400 800,300" fill="none" />
          <path className="logistic-path" d="M150,700 Q500,600 750,800" fill="none" />
          <path className="logistic-path-secondary" d="M800,100 Q600,400 300,750" fill="none" />
          {/* Nodes */}
          <circle cx="200" cy="200" fill="#38bdf8" filter="drop-shadow(0 0 4px #38bdf8)" opacity="0.8" r="6" />
          <circle cx="800" cy="300" fill="#ff7a20" filter="drop-shadow(0 0 6px #ff7a20)" opacity="0.9" r="8" />
          <circle cx="400" cy="400" fill="#ffffff" opacity="0.5" r="10" />
          <circle cx="750" cy="800" fill="#38bdf8" opacity="0.8" r="6" />
          <circle cx="300" cy="750" fill="#ff7a20" opacity="0.9" r="8" />
        </svg>
        {/* Soft elegant gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-white/95 md:to-white/90"></div>
      </div>

      {/* LEFT PORTION: LANDING & LIVE TRACKING INSIGHTS (Only visible on medium and larger screens) */}
      <section className="hidden md:flex flex-1 relative items-center justify-center z-10 py-10 px-8">
        
        {/* TOP BRAND HEADER IN LEFT PORTION - AS SHOWN IN SCREENSHOT */}
        <div className="absolute top-8 right-8 z-30 transition-transform hover:scale-105">
          <div className="flex items-center gap-3 backdrop-blur-md bg-white/80 border border-white/90 px-6 py-3 rounded-2xl shadow-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-inner text-white">
              <Bolt className="w-6 h-6 fill-white" />
            </div>
            <span className="text-slate-800 font-bold text-2xl tracking-tight">الوميض</span>
          </div>
        </div>

        {/* CONTAINER INSIDER FADE */}
        <div className="relative px-6 text-center w-full max-w-4xl flex flex-col items-center gap-6 entrance-fade">
          
          {/* Real-time Status Badge */}
          <div className="mb-2 inline-flex items-center justify-center px-6 py-2.5 bg-white/90 backdrop-blur-md rounded-full text-orange-600 font-bold shadow-2xl border border-white/80 text-sm gap-3">
            <div className="active-dot-wrapper">
              <span className="active-dot"></span>
            </div>
            نظام يعمل بكفاءة 99.9% في الوقت الفعلي في الأردن
          </div>

          <div className="space-y-4 text-white drop-shadow-md">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-white tracking-tight">
              نظام إدارة التوصيل المتكامل
            </h2>
            <p className="text-lg lg:text-xl text-slate-200 mb-6 max-w-xl mx-auto font-medium">
              حلول ذكية لإدارة عمليات التوصيل وتتبع الطلبات بكفاءة عالية في المملكة الأردنية الهاشمية.
            </p>
          </div>

          <div className="w-full flex flex-col xl:flex-row gap-6 items-stretch justify-center mt-4">
            
            {/* ITEM 1: Live Tracking Card (Exact matching design clone) */}
            <div className="glass-panel rounded-3xl p-6 text-right w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col justify-between border-white/90">
              <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-[#ff7a20] to-[#f59e0b]"></div>
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg text-slate-800 font-bold">تتبع مباشر</h4>
                      <p className="text-[12px] text-slate-500 font-medium">رقم الطلب: #WM-JORDAN-2024</p>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-100/90 backdrop-blur-sm border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    في الطريق
                  </div>
                </div>

                {/* RECEIVING / MOVEMENT TIMELINE STEPS */}
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 mt-2 border border-white/50">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-4 h-4 rounded-full bg-slate-400 border-2 border-white shadow-sm z-10"></div>
                      <div className="progress-line-container my-1">
                        <div className="progress-line-fill !h-[60%]"></div>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-white border-4 border-orange-500 shadow-md z-10 progress-point relative flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping absolute"></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-5 pt-0.5 text-right">
                      <div>
                        <p className="text-sm font-bold text-slate-700">مستودع عمان المركزي</p>
                        <p className="text-xs text-slate-500 mt-0.5">تم الاستلام - 08:30 صباحاً</p>
                      </div>
                      <div>
                        <p className="text-sm font-black text-orange-600">الموقع الحالي: حي الشميساني</p>
                        <p className="text-xs text-orange-800 mt-0.5 font-bold">جاري التوجه إلى العميل</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DRIVER ROW */}
              <div className="mt-4 pt-4 border-t border-slate-200/60 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img 
                    alt="Driver" 
                    className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-md" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1IhU6KxnSLrQJP6UCM2LPSQf3GIHnMTwXRyshNiZYR0iG6bD5MrCCt2o2J-mXdB2M_FBEwwxifzpWYfPLXLnuGGxDTxLPcARsTDbbsNT33YRIRinrEfn4lYhPE-bCYDuite0tSKTWQ_dLaupK3Kwo3kbSmtlVVPDvg0F4iMxruQHpxNc5bml5bRk2W86MhUV9vrf5kFGuHzcYTEw6Frv-A_cwNQ7RRqhmzwKV7OE4ANIuNo5RE4gdZfh932_MxMNcSqhOo0L52h69" 
                  />
                  <div>
                    <p className="text-sm text-slate-800 font-bold">سائق: أحمد م.</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span>4.9</span>
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-medium">الوقت المتوقع</p>
                  <p className="text-lg font-bold text-slate-800">{countdown} <span className="text-sm">دقيقة</span></p>
                </div>
              </div>
            </div>

            {/* ITEM 2: Recent Shipments (Matching table design) */}
            <div className="glass-panel rounded-3xl p-0 overflow-hidden text-right w-full max-w-md shadow-2xl flex flex-col border-white/90">
              <div className="bg-white/60 backdrop-blur-md p-4 flex justify-between items-center border-b border-white/50">
                <h4 className="font-bold text-slate-800 text-base">أحدث الشحنات</h4>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <History className="w-5 h-5" />
                </div>
              </div>
              
              <div className="flex-1 overflow-x-auto bg-white/40">
                <table className="w-full text-sm">
                  <thead className="text-slate-500 text-[11px] uppercase bg-white/60">
                    <tr>
                      <th className="px-4 py-3 text-right font-bold">رقم الطلب</th>
                      <th className="px-4 py-3 text-right font-bold">الموقع</th>
                      <th className="px-4 py-3 text-right font-bold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/40">
                    {recentOrders.slice(0, 3).map((order) => (
                      <tr key={order.id} className="hover:bg-white/60 transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-slate-700">{order.id}</td>
                        <td className="px-4 py-3.5 text-slate-600 font-medium">{order.region}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                            order.status === 'delivering' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            'bg-amber-100 text-amber-700 border-amber-200'
                          }`}>
                            {order.status === 'delivering' ? 'جاري التوصيل' :
                             order.status === 'delivered' ? 'تم التوصيل' : 
                             'بالانتظار'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* LOWER STATS BAR */}
          <div className="mt-8 grid grid-cols-3 gap-6 w-full max-w-2xl border-t border-white/20 pt-6 text-white text-center">
            <div className="flex flex-col items-center">
              <span className="font-bold text-3xl lg:text-4xl drop-shadow-md">15K+</span>
              <span className="text-slate-200 text-xs font-semibold mt-1">شحنة يومية بالأردن</span>
            </div>
            <div className="flex flex-col items-center border-x border-white/20">
              <span className="font-bold text-3xl lg:text-4xl drop-shadow-md">800+</span>
              <span className="text-slate-200 text-xs font-semibold mt-1">تاجر محلي</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-3xl lg:text-4xl drop-shadow-md">98%</span>
              <span className="text-slate-200 text-xs font-semibold mt-1">رضا العملاء</span>
            </div>
          </div>
        </div>
      </section>

      {/* PORTION 2: LOGIN FORM AREA (RTL Right side) */}
      <section className="w-full md:w-[480px] lg:w-[540px] flex flex-col items-center justify-center relative z-20 px-6 py-12 bg-white/95 backdrop-blur-md md:bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.1)] overflow-y-auto">
        
        {/* MOBILE BRAND HEADER (Hidden on desktop) */}
        <div className="md:hidden absolute top-6 right-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
            <Bolt className="w-5 h-5 fill-white" />
          </div>
          <span className="text-slate-800 font-bold text-xl">الوميض</span>
        </div>

        <div className="w-full max-w-[400px] space-y-8 entrance-fade">
          
          {/* Form Welcome Header */}
          <div className="text-right">
            <h1 className="text-3xl lg:text-[40px] font-bold text-slate-900 leading-tight mb-2">مرحباً بك</h1>
            <p className="text-slate-500 text-base">الرجاء اختيار نوع الحساب لتسجيل الدخول</p>
          </div>

          {/* Role Select Cards (Direct clones of 3D illustrations cards) */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* Driver Role Card (سائق) */}
            <button 
              type="button"
              onClick={() => setSelectedRole('driver')}
              className={`role-card group flex flex-col items-center gap-2 p-3 bg-white border-2 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                selectedRole === 'driver' 
                ? 'border-orange-500 bg-orange-50/20 shadow-[0_8px_20px_rgba(255,122,32,0.15)]' 
                : 'border-slate-100 hover:border-orange-200'
              }`}
            >
              {selectedRole === 'driver' && <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>}
              <div className="w-20 h-20 flex items-center justify-center rounded-xl icon-zoom bg-slate-50 group-hover:bg-orange-50/30 transition-colors">
                <img 
                  alt="Driver" 
                  className="w-[110%] h-[110%] object-contain mix-blend-multiply" 
                  src="https://lh3.googleusercontent.com/aida/AP1WRLutU13zoMyzrsmksNFtlcmzYdRYBl8lZT3lWRtJSfsRQmfSxz05q8j2FTw9TZUKWs9d0t6OcPwROKb1nlyZA1dGKDCHsIFIjzVm9BfXpOCvOYinhVDOJXZbrD0COUZgDFZU3a40g5ck7VoUKzHd786T9mMTR_ZERdmD_uP-7ODsV4-ANqZzo9ta38Y7uxC1d9oCZ8PejVOIIsYwcgpyGYfhWv2LtOpjvia_dDIYu_a7bHkSdnat1nAA0wwJ"
                />
              </div>
              <span className={`text-xs lg:text-sm font-bold transition-colors ${selectedRole === 'driver' ? 'text-orange-600' : 'text-slate-500'}`}>سائق</span>
            </button>

            {/* Merchant Role Card (تاجر) */}
            <button 
              type="button"
              onClick={() => setSelectedRole('merchant')}
              className={`role-card group flex flex-col items-center gap-2 p-3 bg-white border-2 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                selectedRole === 'merchant' 
                ? 'border-orange-500 bg-orange-50/20 shadow-[0_8px_20px_rgba(255,122,32,0.15)]' 
                : 'border-slate-100 hover:border-orange-200'
              }`}
            >
              {selectedRole === 'merchant' && <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>}
              <div className="w-20 h-20 flex items-center justify-center rounded-xl icon-zoom bg-slate-50 group-hover:bg-orange-50/30 transition-colors">
                <img 
                  alt="Merchant" 
                  className="w-[115%] h-[115%] object-contain mix-blend-multiply" 
                  src="https://lh3.googleusercontent.com/aida/AP1WRLuynd3RGRB5JKnCA49hrqlt2yYLcslissvPRg-UtOuSs33eN6xJWoY907or3iDwI6_WspjIXxgKYbiELBoUarBvUfC2T-Zfb5lY38YYFsWwQ7OtX7iZJHo32hDIqXNEJjRDwgbiB4caS89-k6S2mHh01JKKElGF-ZYtv6PdhwSS1g9vaVeKYh68egneV1S5daHOKrLWA9n4kFO0fpmpGAbMEzkEJcv1C-LrvZNwId5q6LWcinujAvrFF1bd"
                />
              </div>
              <span className={`text-xs lg:text-sm font-bold transition-colors ${selectedRole === 'merchant' ? 'text-orange-600' : 'text-slate-500'}`}>تاجر</span>
            </button>

            {/* Admin Role Card (مدير النظام) */}
            <button 
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`role-card group flex flex-col items-center gap-2 p-3 bg-white border-2 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                selectedRole === 'admin' 
                ? 'border-orange-500 bg-orange-50/20 shadow-[0_8px_20px_rgba(255,122,32,0.15)]' 
                : 'border-slate-100 hover:border-orange-200'
              }`}
            >
              {selectedRole === 'admin' && <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>}
              <div className="w-20 h-20 flex items-center justify-center rounded-xl icon-zoom bg-slate-50 group-hover:bg-orange-50/30 transition-colors">
                <img 
                  alt="Admin" 
                  className="w-[115%] h-[115%] object-contain mix-blend-multiply" 
                  src="https://lh3.googleusercontent.com/aida/AP1WRLuM8Mc5Tfe8rWX-C9D7YQbIb_l5NvzgixShmKejVt_XSQaa8MnDakfMkX5MqyOCVhLpSFTzJVHU477TELH8YSjawCRWvnukJCEvvPR-OUaS87Wf9nLVy-zmwu12Q0qs-s6ibClgkecdq8BLAQOQsy8V7WPcF0w0BEAh842JnJg2Txx0vDLRuzbZPQOu_DW9DnbBGHb94NaA7p3Cx_Ql6dyN2aZrMXv56TtnVfiRNAUjUpEhMyMT-xHg-IYl"
                />
              </div>
              <span className={`text-xs lg:text-sm font-bold transition-colors ${selectedRole === 'admin' ? 'text-orange-600' : 'text-slate-500'}`}>مدير النظام</span>
            </button>

          </div>

          {/* Form with RTL Layout */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-1.5 text-right">
              <label className="text-sm font-bold text-slate-700 block">البريد الإلكتروني أو اسم المستخدم</label>
              <div className="relative group">
                <input 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pr-12 pl-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-orange-500 focus:bg-white transition-all outline-none text-slate-800 font-medium text-left" 
                  placeholder="example@alwameed.com" 
                  type="email"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-right">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700 block">كلمة المرور</label>
                <a className="text-orange-500 text-xs font-bold hover:text-orange-700 transition-colors" href="#forgot" onClick={(e) => { e.preventDefault(); alert('تمت محاكاة استعادة كلمة المرور: تحقق من بريدك الإلكتروني قريباً!'); }}>نسيت كلمة المرور؟</a>
              </div>
              <div className="relative group">
                <input 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pr-12 pl-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-orange-500 focus:bg-white transition-all outline-none text-slate-800 font-medium text-left" 
                  placeholder="••••••••" 
                  type="password"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </span>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center gap-3 pt-1 text-right">
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500 focus:ring-offset-0 cursor-pointer transition-colors" 
                    id="remember" 
                    type="checkbox" 
                  />
                </div>
                <div className="ml-3 text-sm mr-2 select-none">
                  <label className="font-medium text-slate-600 cursor-pointer" htmlFor="remember">تذكرني على هذا الجهاز</label>
                </div>
              </div>
            </div>

            {/* Submit Action Button */}
            <button 
              type="submit" 
              className="w-full h-14 btn-primary-gradient text-white font-bold text-lg rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] mt-2 cursor-pointer"
            >
              <span>تسجيل الدخول</span>
              <LogIn className="w-5 h-5" />
            </button>
          </form>

          {/* Join Link */}
          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-medium text-sm">
              ليس لديك حساب؟ 
              <a 
                className="text-orange-500 font-bold hover:text-orange-700 transition-colors pr-1 cursor-pointer" 
                onClick={(e) => { e.preventDefault(); alert('يمكن للتجار والسائقين الانضمام من خلال التسجيل عبر ممثلي مبيعات وعمليات الوميض في مكاتبنا الرئيسية في عمان.'); }}
              >
                انضم إلينا الآن
              </a>
            </p>
          </div>
        </div>

        {/* Footer info and copyrights */}
        <div className="mt-auto pt-8 text-center w-full">
          <p className="text-[12px] text-slate-400 font-medium">© 2026 Al-Wameed Logistics. جميع الحقوق محفوظة.</p>
        </div>
      </section>
      
    </div>
  );
}
