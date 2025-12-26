# تم إصلاح مشكلة formatCurrency ✅

## المشكلة
```
ReferenceError: formatCurrency is not defined
at eval (src\components\export-data-dialog.tsx:213:122)
```

## السبب
كان `formatCurrency` مستخدم في الكود لكن غير مستورد من `useSettings()`

## الحل
```typescript
// قبل الإصلاح
const { formatDate } = useSettings();

// بعد الإصلاح  
const { formatDate, formatCurrency } = useSettings();
```

## الملف المحدث
- `src/components/export-data-dialog.tsx`

## النتيجة
✅ تم إصلاح المشكلة
✅ تصدير البيانات يعمل الآن
✅ تنسيق العملة يظهر بشكل صحيح

## الاختبار
يمكنك الآن تصدير البيانات من جدول الطلبات بدون أخطاء.