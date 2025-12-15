# دمج المدن والمناطق في صفحات التاجر

## ✅ التحديثات المنفذة

### 1. صفحة إضافة طلب للتاجر (`/merchant/add-order`)
تم تحديث الصفحة لاستخدام المدن والمناطق من قاعدة البيانات بدلاً من القيم الثابتة.

**التغييرات:**
- ✅ استخدام `useAreas()` hook لجلب المدن والمناطق
- ✅ عرض جميع المدن من قاعدة البيانات
- ✅ تحديث المناطق تلقائياً عند اختيار المدينة
- ✅ تعطيل حقل المنطقة حتى يتم اختيار المدينة
- ✅ عرض "جاري التحميل..." أثناء جلب البيانات

### 2. صفحة إضافة طلب في لوحة التحكم (`/dashboard/add-order`)
تم تحديث الصفحة لاستخدام `useAreas()` hook بدلاً من `useAreasStore()` مباشرة.

**التغييرات:**
- ✅ استخدام `useAreas()` hook للجلب التلقائي للبيانات
- ✅ إضافة `isLoading` state
- ✅ التوافق الكامل مع الكود الموجود

### 3. تحديث Areas Store للتوافق
تم إضافة `areas` كـ alias لـ `regions` للتوافق مع الكود القديم.

**التغييرات:**
```typescript
export interface City {
  id: string;
  name: string;
  regions?: Region[];
  areas?: Region[]; // Alias for backward compatibility
}
```

## كيفية العمل

### في صفحة التاجر:
```typescript
const { cities, getRegionsByCity, isLoading } = useAreas();
const [selectedCity, setSelectedCity] = useState('');

// عند اختيار المدينة
<Select value={selectedCity} onValueChange={setSelectedCity}>
  {cities.map(city => (
    <SelectItem key={city.id} value={city.name}>
      {city.name}
    </SelectItem>
  ))}
</Select>

// عرض المناطق حسب المدينة المختارة
<Select disabled={!selectedCity}>
  {getRegionsByCity(selectedCity).map(region => (
    <SelectItem key={region} value={region}>
      {region}
    </SelectItem>
  ))}
</Select>
```

## مصدر البيانات

### 1. من قاعدة البيانات (الأولوية)
عند توفر الـ backend، يتم جلب البيانات من:
- `GET /api/areas/all` - جميع المدن والمناطق

### 2. Fallback Data (احتياطي)
إذا كان الـ backend غير متاح، يتم استخدام بيانات افتراضية:

**المدن المتوفرة:**
- عمان (15 منطقة)
- إربد (4 مناطق)
- الزرقاء (4 مناطق)
- العقبة (1 منطقة)
- الكرك (1 منطقة)
- معان (1 منطقة)
- السلط (1 منطقة)
- مأدبا (1 منطقة)

## المزايا

✅ **مزامنة تلقائية** - البيانات تأتي من قاعدة البيانات
✅ **Caching ذكي** - البيانات تُحفظ لمدة 5 دقائق
✅ **Fallback data** - يعمل حتى بدون backend
✅ **UX محسّن** - تعطيل الحقول حتى يتم اختيار المدينة
✅ **Loading states** - عرض حالة التحميل للمستخدم
✅ **توافق كامل** - يعمل مع الكود القديم

## الملفات المعدلة

### صفحات التاجر:
- ✅ `src/app/merchant/add-order/page.tsx`

### صفحات لوحة التحكم:
- ✅ `src/app/dashboard/add-order/page.tsx`

### Store والـ Hooks:
- ✅ `src/store/areas-store.ts` - إضافة `areas` alias
- ✅ `src/hooks/use-areas.ts` - Hook للاستخدام السهل

## الاختبار

### اختبار صفحة التاجر:
1. سجل دخول كتاجر: `merchant@alwameed.com` / `123`
2. اذهب إلى `/merchant/add-order`
3. اختر مدينة من القائمة
4. تحقق من ظهور المناطق المتعلقة بالمدينة

### اختبار لوحة التحكم:
1. سجل دخول كمدير: `admin@alwameed.com` / `123`
2. اذهب إلى `/dashboard/add-order`
3. اختر منطقة من القائمة
4. تحقق من تحديث المدينة تلقائياً

## ملاحظات مهمة

⚠️ **البيانات تُحفظ في localStorage** - يمكن مسحها من Developer Tools
⚠️ **الـ Cache مدته 5 دقائق** - بعدها يتم جلب البيانات من جديد
⚠️ **Fallback data** - يتم استخدامها تلقائياً إذا فشل الـ API

## الخطوات التالية (اختياري)

1. ✅ إضافة validation للمناطق
2. ✅ إضافة بحث في المناطق
3. ✅ إضافة صفحة إدارة المناطق في الإعدادات
4. ✅ Sync script لنقل البيانات القديمة

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من Console للأخطاء
2. تأكد من أن الـ backend يعمل
3. امسح localStorage وأعد تحميل الصفحة
4. تحقق من أن البيانات موجودة في قاعدة البيانات
