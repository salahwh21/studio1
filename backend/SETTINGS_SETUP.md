# إعداد نظام الإعدادات (Settings System Setup)

## نظرة عامة
تم تحديث نظام الإعدادات ليخزن جميع البيانات في قاعدة البيانات بدلاً من localStorage فقط.

## الميزات الجديدة
✅ **تخزين دائم**: جميع الإعدادات تُحفظ في قاعدة البيانات PostgreSQL
✅ **مزامنة تلقائية**: التحديثات تُحفظ تلقائياً مع debounce (1 ثانية)
✅ **Fallback آمن**: في حالة فشل الاتصال بالـ API، يتم استخدام localStorage
✅ **Multi-tenancy جاهز**: دعم لعدة شركات في المستقبل

## خطوات التفعيل

### 1. تشغيل Migration
```bash
cd backend
psql -U your_username -d your_database -f migrations/004_create_settings_table.sql
```

أو إذا كنت تستخدم Docker:
```bash
docker exec -i your_postgres_container psql -U your_username -d your_database < migrations/004_create_settings_table.sql
```

### 2. إعادة تشغيل Backend
```bash
cd backend
npm restart
# أو
pm2 restart backend
```

### 3. التحقق من عمل النظام
افتح المتصفح وتحقق من:
1. افتح أي صفحة إعدادات (مثل `/dashboard/settings/general`)
2. غيّر أي إعداد
3. افتح Developer Console وتحقق من عدم وجود أخطاء
4. أعد تحميل الصفحة - يجب أن تبقى الإعدادات محفوظة

### 4. التحقق من قاعدة البيانات
```sql
-- عرض جميع الإعدادات
SELECT * FROM settings;

-- عرض إعدادات معينة
SELECT settings_data->'regional' FROM settings WHERE company_id = 1;

-- تحديث إعداد معين
UPDATE settings 
SET settings_data = jsonb_set(settings_data, '{regional,currency}', '"USD"')
WHERE company_id = 1;
```

## هيكل البيانات

### جدول Settings
```sql
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    company_id INTEGER DEFAULT 1,
    settings_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);
```

### محتوى settings_data (JSONB)
```json
{
  "notifications": { ... },
  "orders": { ... },
  "login": { ... },
  "regional": { ... },
  "ui": { ... },
  "policy": { ... },
  "menuVisibility": { ... },
  "aiAgent": { ... }
}
```

## API Endpoints

### GET /api/settings
الحصول على جميع الإعدادات
```javascript
const response = await fetch('/api/settings', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### PUT /api/settings
تحديث جميع الإعدادات
```javascript
await fetch('/api/settings', {
  method: 'PUT',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(settingsData)
});
```

### PATCH /api/settings/:section
تحديث قسم معين من الإعدادات
```javascript
await fetch('/api/settings/regional', {
  method: 'PATCH',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ currency: 'USD' })
});
```

### POST /api/settings/reset
إعادة تعيين الإعدادات للقيم الافتراضية
```javascript
await fetch('/api/settings/reset', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## استكشاف الأخطاء

### المشكلة: الإعدادات لا تُحفظ
**الحل:**
1. تحقق من أن Backend يعمل
2. تحقق من أن جدول settings موجود في قاعدة البيانات
3. تحقق من Console في المتصفح للأخطاء

### المشكلة: خطأ في الاتصال بقاعدة البيانات
**الحل:**
1. تحقق من متغيرات البيئة في `.env`
2. تحقق من أن PostgreSQL يعمل
3. تحقق من صلاحيات المستخدم

### المشكلة: الإعدادات تُحفظ في localStorage فقط
**الحل:**
- هذا سلوك طبيعي عند فشل الاتصال بالـ API
- تحقق من أن Backend يعمل على المنفذ الصحيح
- تحقق من CORS settings

## ملاحظات مهمة

⚠️ **Backup**: يتم حفظ نسخة احتياطية في localStorage دائماً
⚠️ **Debounce**: التحديثات تُحفظ بعد ثانية واحدة من آخر تغيير
⚠️ **Authentication**: جميع endpoints تتطلب token صالح
⚠️ **Company ID**: حالياً يستخدم company_id = 1 لجميع المستخدمين

## الخطوات القادمة (اختياري)

1. **Multi-tenancy**: إضافة دعم لعدة شركات
2. **Settings History**: حفظ تاريخ التغييرات
3. **Settings Validation**: التحقق من صحة البيانات قبل الحفظ
4. **Settings Export/Import**: تصدير واستيراد الإعدادات
5. **Settings Permissions**: صلاحيات مختلفة لكل قسم من الإعدادات
