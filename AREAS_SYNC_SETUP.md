# مزامنة المناطق والمدن مع قاعدة البيانات

## المشكلة
كانت المناطق والمدن مخزنة في ملف ثابت `regions-data.ts` في الـ frontend، بينما قاعدة البيانات تحتوي على جداول `cities` و `regions` منفصلة. هذا يسبب عدم تزامن البيانات.

## الحل المنفذ

### 1. إنشاء Store للمناطق (`src/store/areas-store.ts`)
Store متكامل باستخدام Zustand يوفر:
- **جلب البيانات من الـ API** تلقائياً
- **Caching** للبيانات لمدة 5 دقائق
- **Fallback data** إذا كان الـ backend غير متاح
- **CRUD operations** كاملة (إضافة، حذف)
- **Helper functions** للبحث والفلترة

**المميزات:**
```typescript
- fetchAreas(): جلب البيانات من الـ API
- getCityByRegion(regionName): الحصول على المدينة من اسم المنطقة
- getRegionsByCity(cityName): الحصول على المناطق حسب المدينة
- getAllCities(): جميع المدن
- getAllRegions(): جميع المناطق
- addCity(name): إضافة مدينة جديدة
- addRegion(name, cityId): إضافة منطقة جديدة
- deleteCity(id): حذف مدينة
- deleteRegion(id): حذف منطقة
```

### 2. إنشاء Hook مخصص (`src/hooks/use-areas.ts`)
Hook سهل الاستخدام يجلب البيانات تلقائياً:

```typescript
import { useAreas } from '@/hooks/use-areas';

function MyComponent() {
  const { cities, regions, isLoading, getAllCities } = useAreas();
  
  if (isLoading) return <div>جاري التحميل...</div>;
  
  return (
    <select>
      {getAllCities().map(city => (
        <option key={city} value={city}>{city}</option>
      ))}
    </select>
  );
}
```

### 3. تحديث API Client (`src/lib/api.ts`)
إضافة endpoints للمناطق:
- `getAreas()`: جلب جميع المدن والمناطق
- `getCities()`: جلب المدن فقط
- `getRegionsByCity(cityId)`: جلب مناطق مدينة معينة
- `createCity(name)`: إضافة مدينة
- `createRegion(name, cityId)`: إضافة منطقة
- `deleteCity(id)`: حذف مدينة
- `deleteRegion(id)`: حذف منطقة

### 4. تحديث regions-data.ts للتوافق
الملف القديم الآن يعمل كـ wrapper للـ store الجديد للحفاظ على التوافق مع الكود القديم.

## كيفية الاستخدام

### الطريقة الموصى بها (Hook)
```typescript
import { useAreas } from '@/hooks/use-areas';

function OrderForm() {
  const { cities, getRegionsByCity, isLoading } = useAreas();
  const [selectedCity, setSelectedCity] = useState('');
  
  const regions = selectedCity ? getRegionsByCity(selectedCity) : [];
  
  return (
    <div>
      <select onChange={(e) => setSelectedCity(e.target.value)}>
        {cities.map(city => (
          <option key={city.id} value={city.name}>{city.name}</option>
        ))}
      </select>
      
      <select>
        {regions.map(region => (
          <option key={region} value={region}>{region}</option>
        ))}
      </select>
    </div>
  );
}
```

### استخدام Store مباشرة
```typescript
import { useAreasStore } from '@/store/areas-store';

function AreasManager() {
  const { cities, addCity, deleteCity } = useAreasStore();
  
  const handleAddCity = async () => {
    await addCity('مدينة جديدة');
  };
  
  return (
    <div>
      {cities.map(city => (
        <div key={city.id}>
          {city.name}
          <button onClick={() => deleteCity(city.id)}>حذف</button>
        </div>
      ))}
      <button onClick={handleAddCity}>إضافة مدينة</button>
    </div>
  );
}
```

### للتوافق مع الكود القديم
```typescript
// الكود القديم سيستمر في العمل
import { getAllCities, getRegionsByCity } from '@/lib/regions-data';

const cities = getAllCities();
const regions = getRegionsByCity('عمان');
```

## Backend API Endpoints

### الموجودة في `backend/src/routes/areas.js`:
- `GET /api/areas/cities` - جميع المدن
- `GET /api/areas/cities/:cityId/regions` - مناطق مدينة معينة
- `GET /api/areas/all` - جميع المدن مع مناطقها
- `POST /api/areas/cities` - إضافة مدينة (يتطلب مصادقة)
- `POST /api/areas/regions` - إضافة منطقة (يتطلب مصادقة)
- `DELETE /api/areas/cities/:id` - حذف مدينة (يتطلب مصادقة)
- `DELETE /api/areas/regions/:id` - حذف منطقة (يتطلب مصادقة)

## قاعدة البيانات

### جدول cities
```sql
CREATE TABLE cities (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);
```

### جدول regions
```sql
CREATE TABLE regions (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city_id VARCHAR(100) REFERENCES cities(id)
);
```

## البيانات الافتراضية (Fallback)
إذا كان الـ backend غير متاح، يستخدم النظام بيانات افتراضية تشمل:
- **عمان**: 15 منطقة (تلاع العلي، عبدون، الصويفية، إلخ)
- **إربد**: 4 مناطق
- **الزرقاء**: 4 مناطق
- **العقبة، الكرك، معان، السلط، مأدبا**: منطقة واحدة لكل مدينة

## المزايا

✅ **مزامنة تلقائية** مع قاعدة البيانات
✅ **Caching ذكي** لتقليل الطلبات
✅ **Fallback data** للعمل بدون backend
✅ **CRUD operations** كاملة
✅ **توافق كامل** مع الكود القديم
✅ **TypeScript** مع types كاملة
✅ **Performance** محسّن مع Zustand persist

## الملفات المضافة/المعدلة

### ملفات جديدة:
- ✅ `src/store/areas-store.ts` - Store للمناطق
- ✅ `src/hooks/use-areas.ts` - Hook مخصص
- ✅ `AREAS_SYNC_SETUP.md` - هذا الملف

### ملفات معدلة:
- ✅ `src/lib/api.ts` - إضافة endpoints للمناطق
- ✅ `src/lib/regions-data.ts` - تحويله لـ wrapper للتوافق

### Backend (موجود مسبقاً):
- ✅ `backend/src/routes/areas.js` - API endpoints
- ✅ `backend/migrations/run.js` - جداول cities و regions
- ✅ `backend/migrations/seed.js` - بيانات أولية

## الخطوات التالية (اختياري)

1. **إنشاء صفحة إدارة المناطق** في `/dashboard/settings/areas`
2. **تحديث forms** لاستخدام `useAreas()` بدلاً من الملف الثابت
3. **إضافة validation** للمناطق عند إضافة طلبات
4. **Sync script** لنقل البيانات من الملف القديم للـ database

## ملاحظات مهمة

⚠️ **الكود القديم سيستمر في العمل** - لا حاجة لتحديث كل شيء دفعة واحدة
⚠️ **البيانات تُحفظ في localStorage** - يمكن مسحها من Developer Tools إذا لزم الأمر
⚠️ **الـ Cache مدته 5 دقائق** - يمكن تغييرها في `CACHE_DURATION`
