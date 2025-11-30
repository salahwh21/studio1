# 📊 خطة تطوير قسم المحاسبة والتقارير - شاملة

## 📋 نظرة عامة
تطوير شامل لقسم المحاسبة مع:
- لوحة تحكم متقدمة للسائق (Dashboard)
- تقارير شاملة للتاجر (Merchant Reports)
- إحصائيات وتحليلات متقدمة

---

## 🎯 المرحلة الأولى: الأساسيات (الحالية)

### 1️⃣ Backend APIs الجديدة

#### A. إحصائيات السائق (Driver Statistics)
```
GET /api/financials/driver-statistics/:driverName
├── Period: today | week | month | custom
├── Response:
│   ├── totalEarnings (إجمالي الأرباح)
│   ├── totalOrders (إجمالي الطلبات)
│   ├── successRate (نسبة النجاح)
│   ├── pendingBalance (الرصيد المعلق)
│   ├── dailyBreakdown (تفصيل يومي)
│   ├── hourlyStats (إحصائيات الساعات)
│   └── areaPerformance (أداء حسب المنطقة)

Calculation:
- Earnings = SUM(driver_fee + driver_additional_fare) where order.status = 'تم التوصيل'
- Success Rate = (delivered_orders / total_orders) * 100
- Pending Balance = SUM(cod) - SUM(driver_fee) where order.status != 'تم التوصيل'
```

#### B. مقارنة الفترات (Period Comparison)
```
GET /api/financials/comparison
├── Params: from_date, to_date, previous_period
├── Response:
│   ├── current (الفترة الحالية)
│   ├── previous (الفترة السابقة)
│   ├── growth (النسبة المئوية للنمو)
│   └── differences (الفروقات)

Example:
{
  "current": { "earnings": 450, "orders": 12 },
  "previous": { "earnings": 380, "orders": 10 },
  "growth": { "earnings": "+18%", "orders": "+20%" }
}
```

#### C. تفصيل الرسوم (Fee Breakdown)
```
GET /api/financials/fee-breakdown/:driverId
├── Response:
│   ├── deliveryFees (أجور التوصيل)
│   ├── additionalFares (الرسوم الإضافية)
│   ├── penalties (العقوبات/الخصومات)
│   ├── bonuses (المكافآت)
│   └── netTotal (الإجمالي الصافي)
```

#### D. إحصائيات التاجر (Merchant Statistics)
```
GET /api/financials/merchant-statistics/:merchantName
├── Response:
│   ├── totalOrders (إجمالي الطلبات)
│   ├── successRate (نسبة النجاح)
│   ├── totalRevenue (الإيرادات الإجمالية)
│   ├── returnRate (نسبة المرتجعات)
│   ├── averageDeliveryTime (متوسط وقت التسليم)
│   ├── areaBreakdown (تفصيل حسب المنطقة)
│   └── failureReasons (أسباب الفشل مع النسب)
```

---

### 2️⃣ Frontend Components الجديدة

#### A. DriverDashboard (لوحة تحكم السائق)
الموقع: `src/components/financials/driver-dashboard.tsx`

**المحتويات:**
```tsx
├── SummaryCards (3 بطاقات ملخص)
│   ├── اليوميات (Daily Earnings)
│   ├── الطلبات (Total Orders)
│   └── نسبة النجاح (Success Rate)
│
├── StatsSection
│   ├── رسم بياني (Chart - Line)
│   │   └── إظهار النمو الساعي/اليومي
│   │
│   └── جدول التفصيل
│       └── كل طلب مع الربح الفردي
│
├── FeeBreakdown
│   ├── Pie Chart (توزيع الرسوم)
│   └── Breakdown Table (تفاصيل)
│
└── ComparisonSection
    └── مقارنة مع الفترة السابقة
```

**Features:**
- ✅ اختيار الفترة (اليوم، هذا الأسبوع، هذا الشهر)
- ✅ رسوم بيانية Recharts
- ✅ فلاتر متقدمة

#### B. MerchantReports (تقارير التاجر)
الموقع: `src/components/financials/merchant-reports.tsx`

**المحتويات:**
```tsx
├── KPICards (4 بطاقات KPI)
│   ├── الطلبات الإجمالية
│   ├── نسبة النجاح
│   ├── الإيرادات المتوقعة
│   └── التصنيف/المستوى
│
├── PerformanceCharts
│   ├── Line Chart (نمو الطلبات)
│   ├── Bar Chart (أداء المناطق)
│   └── Pie Chart (أسباب الفشل)
│
├── DetailedStats
│   ├── جدول الطلبات بالمنطقة
│   ├── معدل النجاح لكل منطقة
│   └── متوسط وقت التسليم
│
└── ComparisonWidget
    └── مقارنة مع التجار الآخرين
```

**Features:**
- ✅ فلاتر حسب الفترة والمنطقة
- ✅ تصدير التقارير (Excel, PDF)
- ✅ رسوم بيانية متقدمة

---

## 🚀 المرحلة الثانية: Advanced (البيانات والتنبيهات)

### Features:
1. **Detailed Analytics**
   - Line charts مع multiple data points
   - Comparative analysis مع الفترات السابقة
   - Trend analysis

2. **Alerts & Notifications**
   - تنبيهات الرصيد المعلق
   - تنبيهات نسبة النجاح المنخفضة
   - تنبيهات الدفع المتأخر

3. **Advanced Filtering**
   - فلاتر حسب السائق/المنطقة/التاجر
   - فلاتر حسب حالة الطلب
   - فلاتر مخصصة

---

## 🎖️ المرحلة الثالثة: Professional (Export & Integration)

### Features:
1. **Export Reports**
   - PDF مع الشعار والتوقيعات
   - Excel مع الصيغ
   - Email integration

2. **Balance Tracking**
   - تتبع الرصيد المعلق
   - سجل المدفوعات الكاملة
   - استحقاقات مستقبلية

3. **Advanced Reporting**
   - Automated reports
   - Scheduled emails
   - Custom dashboards

---

## 📝 Implementation Order

### Week 1: Backend APIs
- [ ] Driver Statistics API
- [ ] Period Comparison API
- [ ] Fee Breakdown API
- [ ] Merchant Statistics API

### Week 2: Frontend Phase 1
- [ ] Driver Dashboard Component
- [ ] Merchant Reports Component
- [ ] Integrate APIs
- [ ] Add Recharts

### Week 3: Phase 2 & 3
- [ ] Advanced charts
- [ ] Alerts system
- [ ] Export features
- [ ] Balance tracking

---

## 💾 Database Schema Updates (if needed)

```sql
-- يمكن إضافة views للإحصائيات
CREATE VIEW driver_daily_stats AS
SELECT 
  driver,
  DATE(created_at) as date,
  COUNT(*) as order_count,
  SUM(driver_fee) as total_earnings,
  SUM(CASE WHEN status = 'تم التوصيل' THEN 1 ELSE 0 END) as delivered_count
FROM orders
GROUP BY driver, DATE(created_at);

-- إضافة جدول للتنبيهات
CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(255),
  type VARCHAR(50), -- pending_balance, low_success_rate, payment_due
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);
```

---

## 🎨 Design Considerations

1. **RTL Support**: جميع المكونات RTL-ready
2. **Responsiveness**: تعمل على الموبايل والديسكتوب
3. **Performance**: استخدام memoization و lazy loading
4. **Accessibility**: WCAG compliant

---

## 📦 Dependencies

```json
{
  "recharts": "^2.15.1", // already installed ✓
  "date-fns": "^3.6.0",  // already installed ✓
  "zustand": "^4.5.2",   // already installed ✓
  "zod": "^3.24.2"       // already installed ✓
}
```

---

## ✅ Checklist

### Phase 1
- [ ] Backend: Driver Stats API
- [ ] Backend: Merchant Stats API
- [ ] Frontend: Driver Dashboard
- [ ] Frontend: Merchant Reports
- [ ] Integration & Testing

### Phase 2
- [ ] Advanced Charts
- [ ] Alerts System
- [ ] Advanced Filtering

### Phase 3
- [ ] Export Features (PDF/Excel)
- [ ] Email Integration
- [ ] Balance Tracking
- [ ] Scheduled Reports

---

**Status**: Planning Complete ✅  
**Next Step**: Start Phase 1 Backend Implementation  
**Timeline**: 3 weeks (optimized)
