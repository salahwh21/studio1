/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Order, Driver } from '../types';
import { LogOut, CheckCircle, MapPin, Truck, Shield, Navigation, Smartphone, DollarSign, Activity, Star } from 'lucide-react';

interface DriverDashboardProps {
  username: string;
  orders: Order[];
  drivers: Driver[];
  onLogout: () => void;
  onUpdateOrderStatus: (orderId: string, nextStatus: 'pending' | 'delivering' | 'delivered' | 'waiting') => void;
}

export default function DriverDashboard({ username, orders, drivers, onLogout, onUpdateOrderStatus }: DriverDashboardProps) {
  const driver = drivers.find(d => d.id === 'drv-01') || drivers[0];
  const [isOnline, setIsOnline] = useState(driver.status === 'online');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [mapProgress, setMapProgress] = useState(0);

  // Filter orders assigned to this driver
  const assignedOrders = orders.filter(o => o.driverId === driver.id);

  useEffect(() => {
    if (assignedOrders.length > 0 && !selectedOrder) {
      setSelectedOrder(assignedOrders[0]);
    }
  }, [assignedOrders, selectedOrder]);

  // Map simulation timer - pulses the vehicle icon along an SVG path
  useEffect(() => {
    const interval = setInterval(() => {
      setMapProgress((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const handleStatusToggle = () => {
    setIsOnline(!isOnline);
  };

  const handleAction = (orderId: string, currentStatus: string) => {
    if (currentStatus === 'waiting' || currentStatus === 'pending') {
      onUpdateOrderStatus(orderId, 'delivering');
    } else if (currentStatus === 'delivering') {
      onUpdateOrderStatus(orderId, 'delivered');
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      
      {/* GLOWING AMBIENT BACKGROUND */}
      <div className="absolute inset-0 bg-radial-gradient from-blue-950/20 via-transparent to-transparent pointer-events-none z-0" />
      
      {/* HEADER BAR */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">الوميض كابتن</h2>
              <span className="bg-orange-500/10 text-orange-500 text-[10px] uppercase font-black px-2 py-0.5 rounded border border-orange-500/20">تطبيق السائق</span>
            </div>
            <p className="text-xs text-slate-400">بوابة كابتن التوصيل في الوقت الفعلي</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* ONLINE SWITCHER */}
          <div className="flex items-center gap-3 bg-slate-800/60 px-4 py-2 rounded-xl border border-white/5">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-sm font-bold text-slate-300">{isOnline ? 'متصل / متاح تلقائياً' : 'غير متصل'}</span>
            <button 
              onClick={handleStatusToggle}
              className={`w-10 h-6 rounded-full p-1 transition-all duration-300 ${isOnline ? 'bg-orange-500' : 'bg-slate-600'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300 ${isOnline ? 'transform -translate-x-4' : ''}`} />
            </button>
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

      {/* WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
        
        {/* RIGHT COLUMN: LIST OF WORK ORDERS & CAPTAIN METRICS */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* DRIVER PROFILE CARD */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center gap-4">
              <img 
                src={driver.avatar} 
                alt={driver.name} 
                className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 shadow-md"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-white">{driver.name}</h3>
                  <div className="bg-amber-500/15 text-amber-500 text-xs px-2 py-0.5 rounded flex items-center gap-1 font-bold border border-amber-500/25">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>{driver.rating}</span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs">{driver.vehicleType}</p>
                <p className="font-mono text-slate-400 text-xs text-left" dir="ltr">{driver.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/5 text-center">
              <div>
                <p className="text-slate-400 text-[10px] font-bold">أرباح اليوم</p>
                <p className="text-lg font-black text-orange-500 mt-1">28.00 <span className="text-xs">دينار</span></p>
              </div>
              <div className="border-x border-white/5">
                <p className="text-slate-400 text-[10px] font-bold">الشحنات المنجزة</p>
                <p className="text-lg font-black text-white mt-1">
                  {orders.filter(o => o.driverId === driver.id && o.status === 'delivered').length} / {assignedOrders.length}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold">المسافة المقدرة</p>
                <p className="text-lg font-black text-cyan-400 mt-1">42 <span className="text-xs">كم</span></p>
              </div>
            </div>
          </div>

          {/* ACTIVE ASSIGNED SHIPMENTS COCKPIT */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl flex-1 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="font-bold text-base text-white">الشحنات المسجلة اليوم</h3>
              <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full font-bold">
                {assignedOrders.length} شحنات
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 max-h-[380px] pr-1">
              {assignedOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-sm">لا يوجد شحنات موكلة إليك حالياً في هذا الوردية.</p>
                </div>
              ) : (
                assignedOrders.map((order) => (
                  <div 
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-right flex flex-col gap-3 ${
                      selectedOrder?.id === order.id 
                        ? 'bg-orange-500/10 border-orange-500 shadow-md' 
                        : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/70 hover:border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs text-slate-400 font-medium">رقم الشحنة:</span>
                        <h4 className="font-bold text-white text-sm">{order.id}</h4>
                      </div>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-black ${
                        order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        order.status === 'delivering' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {order.status === 'delivered' ? 'مكتمل' :
                         order.status === 'delivering' ? 'جاري التوصيل' : 'بانتظار الاستلام'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 font-bold">
                        <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>منطقة: {order.region}</span>
                      </div>
                      <div className="text-slate-400">
                        سعر الأجر: <span className="font-bold text-emerald-400">{order.price.toFixed(2)} دينار</span>
                      </div>
                    </div>

                    {order.status !== 'delivered' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(order.id, order.status);
                        }}
                        className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 mt-1 cursor-pointer ${
                          order.status === 'delivering' 
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-950/20' 
                            : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-950/20'
                        }`}
                      >
                        {order.status === 'delivering' ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>تأكيد التوصيل وتسليم العميل</span>
                          </>
                        ) : (
                          <>
                            <Navigation className="w-4 h-4 animate-bounce" />
                            <span>قبول الشحنة والتحرك للموقع</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* LEFT COLUMN: LIVE DYNAMIC ROUTE MAP & HARDWARE SIMULATOR */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* DRIVER ACTIVE ROUTE IN MAP (CLEAN DESIGN DUMP OF FLIGHT) */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl flex-1 flex flex-col relative min-h-[380px] overflow-hidden">
            
            <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-4 shrink-0">
              <div>
                <h3 className="font-bold text-base text-white">الخارطة التفاعلية للطريق اللوجستي</h3>
                <p className="text-xs text-slate-400 mt-0.5">مسار التوصيل المباشر في أمان عمان</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-cyan-500/10 text-cyan-400 text-xs px-2.5 py-1 rounded-full border border-cyan-500/20 flex items-center gap-1.5 font-bold">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  محاكاة المركبة حية
                </span>
              </div>
            </div>

            {/* DYNAMIC MAP RENDERED VIA SVG */}
            <div className="flex-1 bg-slate-950 rounded-xl relative border border-white/5 overflow-hidden flex items-center justify-center p-4">
              
              {/* Map grid decoration */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
              
              {/* Overlay simulation of the routes of Amman */}
              <svg className="w-full h-full max-h-[350px]" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                
                {/* Simulated Road network roads */}
                <g stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="none">
                  <path d="M50,150 L200,80 L400,120 L550,60 L750,140" />
                  <path d="M120,50 L200,80 L320,250 L480,210 L680,300" />
                  <path d="M100,320 L280,260 L400,120 L480,210 L600,100" />
                  <path d="M250,350 L320,250 L550,230 L710,120" stroke="rgba(255,255,255,0.03)" />
                </g>

                {/* Highly glowing primary logistic paths */}
                <path d="M200,80 Q320,250 480,210 T680,300" fill="none" stroke="#ff7a20" strokeWidth="3.5" strokeDasharray="8,6" className="logistic-path" />
                <path d="M100,320 Q280,260 400,120 T550,60" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4,4" className="logistic-path-secondary" />

                {/* Important Area Nodes */}
                <g>
                  {/* Central Hub */}
                  <circle cx="400" cy="120" r="12" fill="#ff7a20" fillOpacity="0.2" className="animate-pulse" />
                  <circle cx="400" cy="120" r="6" fill="#ff7a20" />
                  <text x="400" y="100" fill="#ff7a20" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-sans">مستودع عمان</text>

                  {/* Active delivery target */}
                  <circle cx="680" cy="300" r="16" fill="#38bdf8" fillOpacity="0.15" className="animate-pulse" />
                  <circle cx="680" cy="300" r="8" fill="#38bdf8" />
                  <text x="680" y="280" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-sans">موقع العميل: {selectedOrder?.region || 'شمال عمان'}</text>

                  {/* Vehicle simulated driver position along the curve */}
                  {/* We can compute coordinates based on progress */}
                  <g transform={`translate(${200 + (680 - 200) * (mapProgress / 100)}, ${80 + (300 - 80) * (mapProgress / 100) + Math.sin(mapProgress * 0.1) * 20})`}>
                    <circle r="18" fill="rgba(239, 68, 68, 0.2)" className="animate-ping" />
                    <circle r="10" fill="#ef4444" className="border-2 border-white shadow-lg" />
                    <circle r="4" fill="#ffffff" />
                    <path d="M-15,-20 L15,-20 L0,-32" fill="none" stroke="#ef4444" strokeWidth="2" />
                  </g>
                </g>
              </svg>

              {/* FLOATING CORNER HUD INFORMATION */}
              <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md rounded-xl p-3 border border-white/10 flex flex-col gap-1 shadow-lg text-right">
                <span className="text-[10px] text-slate-400">الشحنة المحددة للتوصيل الآن</span>
                <p className="font-bold text-sm text-white">{selectedOrder ? selectedOrder.id : 'لا يوجد حالياً'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded font-black">
                    {selectedOrder ? (
                      selectedOrder.status === 'delivered' ? 'مكتمل التوصيل' :
                      selectedOrder.status === 'delivering' ? 'في الطريق' : 'في الانتظار'
                    ) : ''}
                  </span>
                  <span className="text-xs text-slate-300">الوجهة: {selectedOrder?.region}</span>
                </div>
              </div>

              {/* TIMESTAMPS OVERFLOW */}
              <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md rounded-xl p-3 border border-white/10 text-left">
                <span className="text-[10px] text-slate-400">سرعة كابتن التتبع حية</span>
                <p className="text-lg font-black text-emerald-400">48 <span className="text-xs">كم/ساعة</span></p>
              </div>
            </div>

            {/* ACTION CENTER FOR SELECTED ORDER */}
            {selectedOrder ? (
              <div className="mt-5 p-4 bg-slate-800/40 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-right">
                  <p className="text-xs text-slate-400">العميل الحالي والمبلغ المستحق عند التسليم:</p>
                  <h4 className="font-bold text-white text-base">
                    {selectedOrder.customerName} ({selectedOrder.customerPhone})
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    السعر الكلي: <span className="font-bold text-emerald-400 text-sm">{selectedOrder.price.toFixed(2)} دينار أردني</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {selectedOrder.status !== 'delivered' ? (
                    <button 
                      onClick={() => handleAction(selectedOrder.id, selectedOrder.status)}
                      className={`px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
                        selectedOrder.status === 'delivering' 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-900/30' 
                          : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-900/30'
                      }`}
                    >
                      {selectedOrder.status === 'delivering' ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>تأكيد الإنجاز الفوري للطلب</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-5 h-5 animate-pulse" />
                          <span>تأكيد استلام والبدء بنظام الخارطة</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 px-5 py-3 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 shrink-0" />
                      <span>شحنة منجزة ومسجلة في النظام</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

          </div>

          {/* CAPTAIN GUIDELINES & COMPLIANCE SIGNALS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-white/5 p-4 rounded-xl flex items-center gap-3.5">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h4 className="text-sm font-bold text-white">إرشادات الالتزام والسلامة للوميض</h4>
                <p className="text-xs text-slate-400 mt-1">يلتزم كابتن الوميض بالسرعة المقررة على الطرق، ومطابقة الهوية والتأكد من رقم هاتف العميل قبل تسليم الشحنة.</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-white/5 p-4 rounded-xl flex items-center gap-3.5">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h4 className="text-sm font-bold text-white">الدعم اللوجستي الفوري</h4>
                <p className="text-xs text-slate-400 mt-1">هل تواجه مشكلة في العثور على موقع العميل؟ تواصل فوراً مع نظام الدعم أو اتصل هاتفياً من البوابة.</p>
              </div>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
