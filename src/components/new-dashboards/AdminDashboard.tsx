/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Order, Driver } from '../types';
import { LogOut, UserCheck, Users, Activity, Settings, ShieldAlert, CheckCircle, MapPin, Truck, HelpCircle, ArrowUpRight, DollarSign, ListOrdered, Navigation, Clock } from 'lucide-react';

interface AdminDashboardProps {
  username: string;
  orders: Order[];
  drivers: Driver[];
  onLogout: () => void;
  onAssignDriver: (orderId: string, driverId: string) => void;
}

export default function AdminDashboard({ username, orders, drivers, onLogout, onAssignDriver }: AdminDashboardProps) {
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [pricingMultipliers, setPricingMultipliers] = useState<{ [reg: string]: number }>({
    'عبدون': 3.5,
    'الصويفية': 4.0,
    'خلدا': 5.0,
    'الشميساني': 3.0,
    'الجبيهة': 4.5
  });

  const [logs, setLogs] = useState<string[]>([
    '09:44 ص | مدير النظام قام بمراجعة سجلات تتبع الطلبات اليومية',
    '09:30 ص | تم تسليم الشحنة ORD-2024-006 في الصويفية بنجاح من الكابتن أحمد',
    '09:12 ص | تاجر "محلات الهدى" أنشأ طلب الشحنة ORD-2024-008 بنجاح بقيمة 3.0 دينار',
    '08:45 ص | الكابتن طارق غير حالته في نظام الوميض الذكي لمتصل'
  ]);

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId || !selectedOrderId) {
      alert('الرجاء اختيار الشحنة والسائق بالكامل للتعيين');
      return;
    }
    const driver = drivers.find(d => d.id === selectedDriverId);
    if (!driver) return;

    onAssignDriver(selectedOrderId, selectedDriverId);
    
    // Add to simulated logs
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} ص`;
    const newLog = `${timeStr} | تم تعيين الشحنة ${selectedOrderId} للكابتن ${driver.name} بنجاح عبر لوحة الإدارة`;
    setLogs([newLog, ...logs]);
    
    // Reset selection inputs
    setSelectedOrderId('');
    setSelectedDriverId('');
  };

  const handleMultiplierChange = (reg: string, val: number) => {
    setPricingMultipliers({ ...pricingMultipliers, [reg]: val });
  };

  // Operations stats
  const activeDeliveries = orders.filter(o => o.status === 'delivering').length;
  const pendingAssignment = orders.filter(o => o.status === 'pending' || o.status === 'waiting' || !o.driverId).length;
  const completedDeliveries = orders.filter(o => o.status === 'delivered').length;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      
      {/* HEADER BAR */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">الوميض كنترول</h2>
              <span className="bg-red-500/15 text-red-400 text-[10px] uppercase font-black px-2 py-0.5 rounded border border-red-500/30">المشرف المسؤول</span>
            </div>
            <p className="text-xs text-slate-400">غرفة تحكم ومراقبة الأسطول اللوجستي في الأردن</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400">أهلاً بك أدمن</p>
            <p className="text-sm font-bold text-white">{username === 'admin' ? 'م. سليم الصيرفي' : username}</p>
          </div>

          <button 
            onClick={onLogout}
            className="flex items-center gap-2 bg-slate-800 hover:bg-red-950 border border-white/5 hover:border-red-800/30 text-slate-300 hover:text-red-300 px-4 py-2 rounded-xl transition-all cursor-pointer text-sm font-bold"
          >
            <span>خروج</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ADMIN CONTROL WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6 z-10">
        
        {/* TOP METRICS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between">
            <div className="text-right w-full">
              <span className="text-xs text-slate-400 block font-bold mb-1">الوميض النشط</span>
              <h4 className="text-2xl font-black text-cyan-400">{activeDeliveries} شحنات</h4>
              <p className="text-[10px] text-slate-400 mt-1">قيد النقل بالطريق حالياً</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between">
            <div className="text-right w-full">
              <span className="text-xs text-slate-400 block font-bold mb-1">معلق بالتخصيص</span>
              <h4 className="text-2xl font-black text-amber-400">{pendingAssignment} طلبات</h4>
              <p className="text-[10px] text-slate-400 mt-1">بانتظار سائق للتحرك</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between">
            <div className="text-right w-full">
              <span className="text-xs text-slate-400 block font-bold mb-1">الكباتن المتصلين</span>
              <h4 className="text-2xl font-black text-emerald-400">
                {drivers.filter(d => d.status === 'online').length} / {drivers.length} نشط
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">سائقون متصلون بالنظام</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between">
            <div className="text-right w-full">
              <span className="text-xs text-slate-400 block font-bold mb-1">الشحنات المكتملة</span>
              <h4 className="text-2xl font-black text-white">{completedDeliveries} تم تسليمها</h4>
              <p className="text-[10px] text-slate-400 mt-1">أغلقت بالكامل بنجاح</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

        </section>

        {/* FUTURISTIC ORDER ANALYTICS CHART SCENARIO */}
        <section className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-xl text-right relative overflow-hidden">
          <div className="neon-orb-1 -top-24 -left-24 opacity-60"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4 mb-4">
            <div>
              <h3 className="font-bold text-lg text-white">تحليل أحمال النقل اللوجستي الأسبوعي</h3>
              <p className="text-xs text-slate-400 mt-1">المراقبة الإحصائية للطلبات النشطة والمسكوبة في الأردن على مدار الـ 7 أيام الماضية</p>
            </div>
            <div className="flex gap-2 text-xs font-semibold">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#ff7a20]/10 border border-[#ff7a20]/30 rounded-lg text-[#ff7a20]">
                <span className="w-2 h-2 rounded-full bg-[#ff7a20]" />
                طلبات نشطة
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#38bdf8]/10 border border-[#38bdf8]/30 rounded-lg text-[#38bdf8]">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                مكتملة ومسلمة
              </span>
            </div>
          </div>

          <div className="relative z-10 pt-4 h-56 w-full bg-slate-950/40 rounded-2xl border border-white/5 p-4 flex flex-col justify-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 120" preserveAspectRatio="none">
              {/* Grids */}
              <line x1="0" y1="20" x2="700" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
              <line x1="0" y1="60" x2="700" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
              <line x1="0" y1="100" x2="700" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />

              {/* Glowing gradients under the paths */}
              <path d="M0,120 Q100,50 200,80 T400,20 T600,60 T700,40 L700,120 L0,120 Z" fill="url(#blueGrad)" opacity="0.15" />
              <path d="M0,120 Q100,90 200,100 T400,60 T600,100 T700,90 L700,120 L0,120 Z" fill="url(#orangeGrad)" opacity="0.1" />

              {/* Path 1: Completed Orders */}
              <path d="M0,120 Q100,50 200,80 T400,20 T600,60 T700,40" fill="none" stroke="#38bdf8" strokeWidth="3" className="logistic-path-secondary" style={{ animationDuration: '6s' }} />
              
              {/* Path 2: Active incoming orders */}
              <path d="M0,120 Q100,90 200,100 T400,60 T600,100 T700,90" fill="none" stroke="#ff7a20" strokeWidth="2.5" className="logistic-path" style={{ animationDuration: '8s' }} />

              {/* Highlight Nodes */}
              <circle cx="200" cy="80" r="5" fill="#38bdf8" filter="drop-shadow(0 0 4px #38bdf8)" />
              <circle cx="400" cy="20" r="6" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
              <circle cx="400" cy="60" r="5" fill="#ff7a20" filter="drop-shadow(0 0 4px #ff7a20)" />

              {/* Gradients definitions */}
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff7a20" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>

            {/* Labels under graph */}
            <div className="flex justify-between text-[11px] text-slate-400 font-bold font-sans mt-3 px-1">
              <span>السبت</span>
              <span>الأحد</span>
              <span>الاثنين</span>
              <span>الثلاثاء (اليوم)</span>
              <span>الأربعاء</span>
              <span>الخميس</span>
              <span>الجمعة</span>
            </div>
          </div>
        </section>

        {/* FLEET MASTER ASSIGNMENT FORM + PRICING COLUMN */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMN 1: INTERACTIVE ALLOCATION CONTROL ROOM */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* FLEET & COCKPIT CONTROLS: ASSIGN A DRIVER */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-xl text-right">
              <div className="flex items-center gap-2 pb-4 border-b border-white/5 mb-5 font-bold text-sm text-slate-300">
                <Navigation className="w-5 h-5 text-orange-500" />
                <span>غرفة توجيه الأسطول والتعيين الذكي للوميض</span>
              </div>

              <form onSubmit={handleAssignSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* SELECT SHIPMENT */}
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-300">اختر الشحنة المعلقة للتعيين</label>
                  <select 
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full text-right h-12 px-4 bg-slate-950 border border-white/10 rounded-xl focus:ring-1 focus:border-orange-500 focus:bg-slate-900 outline-none text-slate-100 text-sm font-medium cursor-pointer"
                  >
                    <option value="">-- اختر طلب معلق --</option>
                    {orders.filter(o => o.status === 'pending' || o.status === 'waiting' || !o.driverId).map(o => (
                      <option key={o.id} value={o.id} className="bg-slate-950">
                        {o.id} | زبون: {o.customerName} - {o.region} ({o.price} د.أ)
                      </option>
                    ))}
                  </select>
                </div>

                {/* SELECT DRIVER */}
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-300">اختر الكابتن لتكليفه بالمهمة</label>
                  <select 
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full text-right h-12 px-4 bg-slate-950 border border-white/10 rounded-xl focus:ring-1 focus:border-orange-500 focus:bg-slate-900 outline-none text-slate-100 text-sm font-medium cursor-pointer"
                  >
                    <option value="">-- اختر كابتن متصل --</option>
                    {drivers.filter(d => d.status === 'online').map(d => (
                      <option key={d.id} value={d.id} className="bg-slate-950">
                        {d.name} | الكفاءة: {d.rating} ★ (نشطين: {d.activeOrderCount})
                      </option>
                    ))}
                  </select>
                </div>

                {/* SUBMIT ASSIGN CONTROLLER */}
                <div className="flex items-end shadow-md">
                  <button 
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-orange-900/30"
                  >
                    <span>اعتماد تعيين الكابتن</span>
                    <Truck className="w-5 h-5" />
                  </button>
                </div>

              </form>
            </div>

            {/* DRIVERS LISTING STATUS PANEL */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-xl text-right">
              <h3 className="font-bold text-base text-white pb-3 border-b border-white/5 mb-4">كباتن الوميض النشطين وحالتهم</h3>
              
              <div className="space-y-4">
                {drivers.map((driver) => (
                  <div key={driver.id} className="p-4 bg-slate-950/50 hover:bg-slate-950 rounded-xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
                    <div className="flex items-center gap-3">
                      <img 
                        src={driver.avatar} 
                        alt={driver.name} 
                        className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-md shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{driver.name}</h4>
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            driver.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'
                          }`} />
                          <span className="text-[10px] text-slate-400 font-medium">{driver.status === 'online' ? 'متاح للطلب' : 'غير متصل'}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{driver.vehicleType}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">رقم الهاتف</span>
                        <span className="font-mono text-xs">{driver.phone}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">شحنات معلقة مع السائق</span>
                        <span className="font-bold text-cyan-400">{driver.activeOrderCount} شحنة حرة</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">التقييم العام</span>
                        <span className="font-bold text-yellow-500 flex items-center gap-1">★ {driver.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* COLUMN 2: OPERATIONS SYSTEM TELEMETRY LOGGER + PRICING MULTIPLIERS */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* PRICING MODIFIER CONTROL */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-xl text-right">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-4 font-bold text-sm text-slate-300">
                <Settings className="w-5 h-5 text-cyan-400" />
                <span>تعديل تسعيرة الوميض بالأردن</span>
              </div>

              <div className="space-y-3.5">
                {Object.keys(pricingMultipliers).map((reg) => (
                  <div key={reg} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-white/5">
                    <span className="text-sm font-bold text-slate-300">منطقة {reg}</span>
                    <div className="relative w-28 text-left">
                      <input 
                        value={pricingMultipliers[reg]} 
                        onChange={(e) => handleMultiplierChange(reg, parseFloat(e.target.value) || 0)}
                        type="number"
                        step="0.5"
                        min="1"
                        className="w-full text-center h-9 pr-2 pl-8 bg-slate-900 border border-white/5 focus:border-cyan-400 rounded-lg outline-none text-emerald-400 font-bold text-sm"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold font-sans">د.أ</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LIVE OPERATIONS TELEMETRY SYSTEM LOGGER */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-xl text-right flex-1 flex flex-col">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-4 font-bold text-sm text-slate-300">
                <Activity className="w-5 h-5 text-orange-500 shrink-0" />
                <span>سجلات نشاط العمليات الحية</span>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[290px] pr-1 flex-1 text-xs">
                {logs.map((log, i) => (
                  <div key={i} className="p-3 bg-slate-950 border-r-2 border-orange-500 rounded-l-lg text-slate-400 leading-relaxed font-semibold">
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}
