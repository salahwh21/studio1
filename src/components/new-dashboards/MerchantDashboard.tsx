/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Order } from '../types';
import { AMMAN_REGIONS } from '../mockData';
import { LogOut, Plus, Search, MapPin, DollarSign, ListFilter, AlertCircle, ShoppingBag, Send, Phone, Clipboard, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface MerchantDashboardProps {
  username: string;
  orders: Order[];
  onLogout: () => void;
  onCreateNewOrder: (custName: string, custPhone: string, region: string, price: number) => void;
  onCancelOrder: (orderId: string) => void;
}

export default function MerchantDashboard({ username, orders, onLogout, onCreateNewOrder, onCancelOrder }: MerchantDashboardProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [region, setRegion] = useState(AMMAN_REGIONS[0]);
  const [price, setPrice] = useState(3.0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'delivering' | 'delivered' | 'waiting'>('all');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Dynamic calculations
  const totalSpend = orders.reduce((sum, o) => sum + o.price, 0);
  const activeOrders = orders.filter(o => o.status !== 'delivered');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('الرجاء تعبئة اسم العميل ورقم الهاتف بالكامل');
      return;
    }
    onCreateNewOrder(customerName, customerPhone, region, price);
    
    setSuccessBanner(`تم تسجيل طلب التوصيل بنجاح للعميل ${customerName} في منطقة ${region}`);
    setCustomerName('');
    setCustomerPhone('');
    setPrice(3.0);
    
    // Clear banner after 4 seconds
    setTimeout(() => {
      setSuccessBanner(null);
    }, 4000);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.customerName.includes(searchTerm) ||
                          order.region.includes(searchTerm);
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      
      {/* HEADER BAR */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">الوميض تجار</h2>
              <span className="bg-orange-500/10 text-orange-500 text-[10px] uppercase font-black px-2 py-0.5 rounded border border-orange-500/20">منصة التاجر</span>
            </div>
            <p className="text-xs text-slate-400">إنشاء وتتبع شحنات ومصاريف متجرك في الأردن</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400">التاجر المسجل</p>
            <p className="text-sm font-bold text-white">{username === 'merchant' ? 'محلات الهدى التجارية' : username}</p>
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

      {/* WORKSPACE CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6 z-10">
        
        {/* TOP STATUS CARDS MAP LIST */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden text-right">
            <div className="absolute top-4 left-4 bg-orange-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-orange-400">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-400 font-bold mb-1">الطلبات المسجلة</p>
            <h3 className="text-3xl font-black text-white">{orders.length} <span className="text-sm font-medium">طلباً</span></h3>
            <p className="text-xs text-slate-400 mt-2">شاملة الطلبات السابقة والمعلقة لهذا اليوم</p>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden text-right">
            <div className="absolute top-4 left-4 bg-cyan-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-cyan-400">
              <Clipboard className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-400 font-bold mb-1">شحنات جاري توصيلها الآن</p>
            <h3 className="text-3xl font-black text-cyan-400">{activeOrders.length} <span className="text-sm font-medium">شحنة نشطة</span></h3>
            <p className="text-xs text-slate-400 mt-2">جاري تسليمها أو الاستعداد لاستلامها</p>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden text-right">
            <div className="absolute top-4 left-4 bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-400 font-bold mb-1">إجمالي تكلفة التوصيل المدفوعة</p>
            <h3 className="text-3xl font-black text-emerald-400">{totalSpend.toFixed(2)} <span className="text-sm font-medium">دينار</span></h3>
            <p className="text-xs text-slate-400 mt-2">إجمالي نفقات الشحن اللوجستي</p>
          </div>

        </section>

        {/* SUCCESS NOTIFICATION FLASH */}
        {successBanner && (
          <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-3 animate-fade-in text-semibold text-sm justify-start">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* MAIN SPLIT GRID: NEW FORM VS LIST TAB */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMN 1 (4 grids): CREATE DELIVERY ORDER FORM */}
          <div className="lg:col-span-4 bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-xl text-right">
            <div className="flex items-center gap-2 pb-4 border-b border-white/5 mb-5 uppercase text-slate-300 font-bold text-sm">
              <Plus className="w-5 h-5 text-orange-500" />
              <span>طلب توصيل شحنة جديد</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 label text-right">
                <label className="text-xs font-bold text-slate-300 block">اسم الزبون المستلم</label>
                <input 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-right h-12 px-4 bg-slate-950 border border-white/10 rounded-xl focus:ring-0 focus:border-orange-500 focus:bg-slate-900 transition-all outline-none text-slate-100 font-medium text-sm" 
                  placeholder="مثال: يوسف رامي الحلبي" 
                  type="text"
                  required
                />
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-300 block">رقم هاتف الزبون</label>
                <div className="relative">
                  <input 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-left h-12 pl-4 pr-12 bg-slate-950 border border-white/10 rounded-xl focus:ring-0 focus:border-orange-500 focus:bg-slate-900 transition-all outline-none text-slate-100 font-medium text-sm" 
                    placeholder="+962 7X XXX XXXX" 
                    type="tel"
                    required
                    dir="ltr"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Phone className="w-4 h-4" />
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-300 block">منطقة التوصيل (في الأردن)</label>
                <div className="relative">
                  <select 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full text-right h-12 px-4 bg-slate-950 border border-white/10 rounded-xl focus:ring-0 focus:border-orange-500 focus:bg-slate-900 transition-all outline-none text-slate-100 font-medium text-sm appearance-none cursor-pointer"
                  >
                    {AMMAN_REGIONS.map((reg) => (
                      <option key={reg} value={reg} className="bg-slate-950">{reg}</option>
                    ))}
                  </select>
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <MapPin className="w-4 h-4" />
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-300 block">أجرة شحن التوصيل المستحقة (دينار)</label>
                <div className="relative">
                  <input 
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-right h-12 pl-4 pr-12 bg-slate-950 border border-white/10 rounded-xl focus:ring-0 focus:border-orange-500 focus:bg-slate-900 transition-all outline-none text-slate-100 font-medium text-sm" 
                    type="number" 
                    step="0.5"
                    min="1"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <DollarSign className="w-4 h-4" />
                  </span>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full h-12 btn-primary-gradient text-white font-bold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] mt-6 cursor-pointer"
              >
                <span>إنشاء وتجميع طلب التوصيل</span>
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-8 p-3.5 bg-slate-950 rounded-xl border border-white/5 flex gap-3 text-right">
              <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400">
                <span className="text-white font-bold block mb-1">ملاحظة أسعار التوصيل:</span>
                تعتمد أسعار التوصيل الافتراضية داخل العاصمة عمان على الرمز اللوجستي للمنطقة. تبدأ من 3.0 دنانير ومسافة النطاق.
              </div>
            </div>
          </div>

          {/* COLUMN 2 (8 grids): ORDER TRACKING LIST TABLE */}
          <div className="lg:col-span-8 bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-xl text-right flex flex-col gap-6">
            
            {/* HUD / SEARCH CONTROLS */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <h3 className="font-bold text-lg text-white">جدول تتبع العمليات المبرمة</h3>
                <p className="text-xs text-slate-400 mt-1">عرض ومتابعة حالة الطرود والمستلمين حية</p>
              </div>

              {/* FILTER PILLS */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/5">
                <button 
                  onClick={() => setActiveFilter('all')} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeFilter === 'all' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >الكل</button>
                <button 
                  onClick={() => setActiveFilter('pending')} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeFilter === 'pending' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >انتظار</button>
                <button 
                  onClick={() => setActiveFilter('delivering')} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeFilter === 'delivering' ? 'bg-blue-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >في الطريق</button>
                <button 
                  onClick={() => setActiveFilter('delivered')} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeFilter === 'delivered' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >تم التوصيل</button>
              </div>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative">
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-right h-11 px-4 pr-11 bg-slate-950 border border-white/5 focus:border-white/20 rounded-xl outline-none text-slate-100 font-medium text-sm" 
                placeholder="بحث برقم الشحنة، منطقة التوصيل، أو اسم المستلم المستهدف..." 
                type="text"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Search className="w-4 h-4" />
              </span>
            </div>

            {/* TRACKING TABLE */}
            <div className="overflow-x-auto bg-slate-950/40 rounded-2xl border border-white/5">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-950 text-slate-400 text-xs text-semibold">
                  <tr>
                    <th className="px-5 py-3.5 text-right font-bold border-l border-white/5">رقم الشحنة</th>
                    <th className="px-5 py-3.5 text-right font-bold">المستلم</th>
                    <th className="px-5 py-3.5 text-right font-bold">المنطقة والمدينة</th>
                    <th className="px-5 py-3.5 text-center font-bold">الأجرة</th>
                    <th className="px-5 py-3.5 text-center font-bold">الحالة اللوجستية</th>
                    <th className="px-5 py-3.5 text-center font-bold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                        لا يوجد شحنات مطابقة للمعايير المحددة حالياً.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-5 py-4 font-black text-white text-sm border-l border-white/5">{order.id}</td>
                        <td className="px-5 py-4">
                          <p className="text-slate-100 font-semibold">{order.customerName}</p>
                          <p className="text-[11px] text-slate-500 text-left font-mono" dir="ltr">{order.customerPhone}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-300 font-semibold">{order.region}</td>
                        <td className="px-5 py-4 text-center font-semibold text-emerald-400">{order.price.toFixed(2)} دينار</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            order.status === 'delivering' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            order.status === 'waiting' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                          }`}>
                            {order.status === 'pending' ? 'بانتظار سائق' :
                             order.status === 'waiting' ? 'بالانتظار' :
                             order.status === 'delivering' ? 'تحت التوصيل' : 'تم التسليم'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {order.status === 'pending' || order.status === 'waiting' ? (
                            <button 
                              onClick={() => {
                                if (confirm(`هل ترغب فعلاً بطلب إلغاء الشحنة ${order.id}؟`)) {
                                  onCancelOrder(order.id);
                                }
                              }}
                              className="text-xs text-red-400 hover:text-red-300 font-bold underline transition-colors cursor-pointer"
                            >
                              إلغاء الطلب
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium">غير قابل للإلغاء</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}
