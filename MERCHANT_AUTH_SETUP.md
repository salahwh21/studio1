# إعداد المصادقة لبوابة التاجر

## التغييرات المنفذة

### 1. إنشاء مكون الحماية (Protected Route)
تم إنشاء مكون `ProtectedRoute` في `src/components/protected-route.tsx` لحماية الصفحات من الوصول غير المصرح به.

**المميزات:**
- التحقق من تسجيل الدخول تلقائياً
- إعادة التوجيه لصفحة تسجيل الدخول مع حفظ الصفحة المطلوبة
- دعم تحديد الأدوار المسموح بها (admin, merchant, driver)
- شاشة تحميل أثناء التحقق من المصادقة

### 2. تحديث layout التاجر
تم تحديث `src/app/merchant/layout.tsx` لإضافة:
- حماية جميع صفحات التاجر باستخدام `ProtectedRoute`
- السماح فقط للمستخدمين بدور `merchant`
- عرض معلومات المستخدم الحقيقية (الاسم، اسم المتجر)
- وظيفة تسجيل الخروج

### 3. تحسين AuthContext
تم تحديث `src/contexts/AuthContext.tsx` لإضافة:
- توجيه تلقائي حسب دور المستخدم بعد تسجيل الدخول
  - `admin` → `/dashboard`
  - `merchant` → `/merchant`
  - `driver` → `/dashboard/driver-app`
- دعم حساب تجريبي للتاجر:
  - البريد: `merchant@alwameed.com`
  - كلمة المرور: `123`

### 4. تحديث صفحة تسجيل الدخول
تم تحديث `src/components/login-page-client.tsx` لإضافة:
- زر "دخول كتاجر" يملأ بيانات التاجر التجريبي تلقائياً
- أيقونات توضيحية للأزرار

### 5. إزالة التكرار
تم حذف المجلد المكرر `src/app/dashboard/merchant/` وتحديث جميع الروابط للإشارة إلى `/merchant` بدلاً من `/dashboard/merchant`.

## كيفية الاستخدام

### تسجيل دخول التاجر
1. افتح صفحة تسجيل الدخول `/`
2. اضغط على زر "دخول كتاجر" (سيملأ البيانات تلقائياً)
3. اضغط "تسجيل الدخول"
4. سيتم توجيهك تلقائياً إلى `/merchant`

### الحسابات التجريبية
```
المدير:
- البريد: admin@alwameed.com
- كلمة المرور: 123
- التوجيه: /dashboard

التاجر:
- البريد: merchant@alwameed.com
- كلمة المرور: 123
- التوجيه: /merchant
```

### حماية صفحات جديدة
لحماية أي صفحة جديدة، استخدم مكون `ProtectedRoute`:

```tsx
import { ProtectedRoute } from '@/components/protected-route';

export default function MyPage() {
  return (
    <ProtectedRoute allowedRoles={['merchant']}>
      {/* محتوى الصفحة */}
    </ProtectedRoute>
  );
}
```

## الملفات المعدلة
- ✅ `src/components/protected-route.tsx` (جديد)
- ✅ `src/app/merchant/layout.tsx`
- ✅ `src/contexts/AuthContext.tsx`
- ✅ `src/components/login-page-client.tsx`
- ✅ `src/components/header.tsx`
- ✅ `src/app/dashboard/settings/menu-visibility/page.tsx`
- ❌ `src/app/dashboard/merchant/` (تم الحذف)

## ملاحظات
- جميع صفحات التاجر محمية الآن ولا يمكن الوصول إليها بدون تسجيل دخول
- المستخدمون غير المصرح لهم سيتم توجيههم تلقائياً
- يتم حفظ الصفحة المطلوبة وإعادة التوجيه إليها بعد تسجيل الدخول
