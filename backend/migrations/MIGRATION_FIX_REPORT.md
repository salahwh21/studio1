# تقرير إصلاح نظام Migrations | Migration System Fix Report

## التاريخ: 2025-12-11

## ما تم إنجازه

### 1. ملفات جديدة تم إنشاؤها

| الملف | الحجم | الوصف |
|-------|-------|-------|
| `001_initial_schema.sql` | 9.5 KB | Schema كامل موحد لجميع الجداول |
| `002_seed_data.sql` | 7.7 KB | البيانات الأولية (الأدوار، الحالات، المدن، المناطق) |
| `003_create_admin_user.sql` | 0.8 KB | إنشاء المستخدم الإداري |
| `README.md` | 3.5 KB | دليل استخدام نظام الـ Migrations |

### 2. ملفات تم تحديثها

| الملف | التغيير |
|-------|---------|
| `run.js` | إعادة كتابة كاملة مع نظام تتبع الإصدارات |
| `package.json` | إضافة أوامر `migrate:status` و `migrate:reset` |

### 3. الجداول المُعرّفة في الـ Schema

```
✅ roles              - أدوار المستخدمين (5 أدوار افتراضية)
✅ users              - المستخدمين
✅ statuses           - حالات الطلبات (13 حالة)
✅ cities             - المدن (10 مدن أردنية)
✅ regions            - المناطق (22 منطقة)
✅ orders             - الطلبات
✅ drivers            - تتبع السائقين GPS
✅ order_tracking     - سجل GPS للطلبات
✅ driver_payment_slips
✅ merchant_payment_slips
✅ driver_return_slips
✅ merchant_return_slips
✅ settings           - إعدادات النظام JSONB
✅ schema_migrations  - تتبع الـ Migrations (جديد!)
```

### 4. الفهارس (Indexes) المُضافة

- `idx_orders_status` - تسريع فلترة الحالات
- `idx_orders_date` - تسريع الفرز بالتاريخ
- `idx_orders_driver` - تسريع فلترة السائقين
- `idx_orders_merchant` - تسريع فلترة التجار
- `idx_orders_phone` - تسريع البحث بالهاتف
- `idx_orders_status_date` - فهرس مركب للاستعلامات المتكررة

### 5. الأوامر الجديدة

```bash
# تشغيل الـ Migrations
cd backend
npm run migrate

# التحقق من الحالة
npm run migrate:status

# إعادة تعيين (للتطوير فقط!)
npm run migrate:reset
```

## الخطوات التالية

### قبل النقل لـ VPS:

1. **غيّر كلمة مرور المدير**: 
   ```bash
   node -e "require('bcryptjs').hash('YOUR_SECURE_PASSWORD', 10).then(console.log)"
   ```
   ثم استبدل الـ hash في `003_create_admin_user.sql`

2. **أنشئ ملف `.env.production`** في مجلد `backend/`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/delivery_db
   NODE_ENV=production
   JWT_SECRET=your-very-long-secret-key
   FRONTEND_URL=https://yourdomain.com
   ```

3. **على الـ VPS الجديد**:
   ```bash
   # إنشاء قاعدة البيانات
   createdb delivery_db
   
   # تشغيل الـ Migrations
   cd backend
   npm install
   npm run migrate
   ```

## ملاحظات

- الملفات `004` و `005` موجودة مسبقاً ومُضافة للنظام الجديد
- ملف `seed.js` لا زال متاحاً لإضافة بيانات تجريبية
- نظام التتبع يمنع تطبيق نفس الـ Migration مرتين
