# دليل قاعدة البيانات - كيف تعدل على البيانات 📊

## 📍 أين توجد ملفات قاعدة البيانات؟

### 1. **ملفات Backend** (الخادم)
```
backend/
├── migrations/          # ملفات إنشاء الجداول والبيانات الأولية
│   ├── run.js          # إنشاء جداول قاعدة البيانات
│   └── seed.js         # إضافة بيانات أولية (مستخدمين، طلبات، إلخ)
├── src/
│   ├── routes/         # API endpoints
│   └── config/         # إعدادات الاتصال بقاعدة البيانات
├── .env                # معلومات الاتصال بقاعدة البيانات
└── package.json        # Dependencies
```

### 2. **ملفات Frontend** (الواجهة)
```
src/store/              # البيانات المحلية (Fallback)
├── user-store.ts       # بيانات المستخدمين
├── orders-store.ts     # بيانات الطلبات
├── areas-store.ts      # بيانات المدن والمناطق
└── statuses-store.ts   # بيانات الحالات
```

## 🔧 كيف تعدل على البيانات؟

### الطريقة 1: تعديل البيانات الأولية (Seed Data)

#### أ. تعديل المستخدمين
**الملف:** `backend/migrations/seed.js`

```javascript
// ابحث عن هذا الجزء في الملف:
const users = [
  { 
    id: 'user-admin', 
    name: 'admin', 
    email: 'admin@alwameed.com', 
    roleId: 'admin', 
    storeName: 'Admin' 
  },
  { 
    id: 'driver-1', 
    name: 'ابو العبد', 
    email: '0799754316', 
    roleId: 'driver', 
    storeName: 'ابو العبد' 
  },
  // أضف مستخدمين جدد هنا
  {
    id: 'driver-2',
    name: 'محمد السائق',
    email: '0791234567',
    roleId: 'driver',
    storeName: 'محمد السائق'
  },
];
```

#### ب. تعديل المدن والمناطق
**الملف:** `backend/migrations/seed.js`

```javascript
// المدن
const cities = [
  { id: 'CITY_AMM', name: 'عمان' },
  { id: 'CITY_IRB', name: 'إربد' },
  { id: 'CITY_ZRQ', name: 'الزرقاء' },
  // أضف مدن جديدة
  { id: 'CITY_AJL', name: 'عجلون' },
];

// المناطق
const regions = [
  { id: 'REG_AMM_001', name: 'تلاع العلي', cityId: 'CITY_AMM' },
  { id: 'REG_AMM_002', name: 'عبدون', cityId: 'CITY_AMM' },
  // أضف مناطق جديدة
  { id: 'REG_AMM_009', name: 'الشميساني', cityId: 'CITY_AMM' },
];
```

#### ج. تعديل الحالات
**الملف:** `backend/migrations/seed.js`

```javascript
const statuses = [
  { 
    id: 'STS_001', 
    code: 'PENDING', 
    name: 'بالانتظار', 
    icon: 'Clock', 
    color: '#607D8B', 
    isActive: true 
  },
  // أضف حالات جديدة
  {
    id: 'STS_014',
    code: 'READY_FOR_PICKUP',
    name: 'جاهز للاستلام',
    icon: 'PackageCheck',
    color: '#00BCD4',
    isActive: true
  },
];
```

### الطريقة 2: تعديل البيانات المحلية (Frontend Fallback)

#### أ. تعديل المستخدمين المحليين
**الملف:** `src/store/user-store.ts`

```typescript
// ابحث عن initialUsers
const initialUsers: User[] = [
  {
    id: 'user-salahwh',
    name: 'salahwh',
    storeName: 'salahwh',
    email: 'admin@alwameed.com',
    roleId: 'admin',
    avatar: '',
    whatsapp: '',
    priceListId: '',
  },
  // أضف مستخدمين جدد
  {
    id: 'driver-3',
    name: 'أحمد السائق',
    storeName: 'أحمد السائق',
    email: '0798765432',
    roleId: 'driver',
    avatar: '',
    whatsapp: '0798765432',
    priceListId: '',
  },
];
```

#### ب. تعديل المناطق المحلية
**الملف:** `src/store/areas-store.ts`

```typescript
// ابحث عن fallbackCities
const fallbackCities: City[] = [
  {
    id: 'CITY_AMM',
    name: 'عمان',
    areas: [
      { id: 'REG_AMM_001', name: 'تلاع العلي', cityId: 'CITY_AMM' },
      // أضف مناطق جديدة
      { id: 'REG_AMM_016', name: 'الرابية', cityId: 'CITY_AMM' },
    ]
  },
  // أضف مدن جديدة
  {
    id: 'CITY_AJL',
    name: 'عجلون',
    areas: [
      { id: 'REG_AJL_001', name: 'وسط عجلون', cityId: 'CITY_AJL' },
    ]
  },
];
```

## 🚀 كيف تطبق التعديلات؟

### إذا عدلت على Backend (seed.js):

#### 1. **افتح PowerShell أو CMD**
```powershell
# اضغط Win + R
# اكتب: powershell
# أو: cmd
```

#### 2. **اذهب لمجلد Backend**
```powershell
cd backend
```

#### 3. **تشغيل Migration**
```powershell
node migrations\run.js
```

#### 4. **تشغيل Seed**
```powershell
node migrations\seed.js
```

#### 5. **إعادة تشغيل Backend**
```powershell
npm run dev
```

### إذا عدلت على Frontend (stores):

#### 1. **مسح Cache المتصفح**
- افتح Developer Tools (اضغط F12)
- اذهب لـ Application → Storage
- امسح localStorage
- أو اضغط: `Ctrl + Shift + Delete`

#### 2. **إعادة تحميل الصفحة**
```
Ctrl + Shift + R
أو
Ctrl + F5
```

## 📝 أمثلة عملية

### مثال 1: إضافة سائق جديد

**في Backend** (`backend/migrations/seed.js`):
```javascript
const users = [
  // ... المستخدمين الموجودين
  {
    id: 'driver-new',
    name: 'خالد السائق',
    email: '0795555555',
    roleId: 'driver',
    storeName: 'خالد السائق'
  },
];
```

**في Frontend** (`src/store/user-store.ts`):
```typescript
const initialUsers: User[] = [
  // ... المستخدمين الموجودين
  {
    id: 'driver-new',
    name: 'خالد السائق',
    storeName: 'خالد السائق',
    email: '0795555555',
    roleId: 'driver',
    avatar: '',
    whatsapp: '0795555555',
    priceListId: '',
  },
];
```

### مثال 2: إضافة مدينة جديدة

**في Backend** (`backend/migrations/seed.js`):
```javascript
const cities = [
  // ... المدن الموجودة
  { id: 'CITY_JRS', name: 'جرش' },
];

const regions = [
  // ... المناطق الموجودة
  { id: 'REG_JRS_001', name: 'وسط جرش', cityId: 'CITY_JRS' },
  { id: 'REG_JRS_002', name: 'سوف', cityId: 'CITY_JRS' },
];
```

**في Frontend** (`src/store/areas-store.ts`):
```typescript
const fallbackCities: City[] = [
  // ... المدن الموجودة
  {
    id: 'CITY_JRS',
    name: 'جرش',
    areas: [
      { id: 'REG_JRS_001', name: 'وسط جرش', cityId: 'CITY_JRS' },
      { id: 'REG_JRS_002', name: 'سوف', cityId: 'CITY_JRS' },
    ]
  },
];
```

### مثال 3: إضافة حالة جديدة

**في Backend** (`backend/migrations/seed.js`):
```javascript
const statuses = [
  // ... الحالات الموجودة
  {
    id: 'STS_015',
    code: 'OUT_OF_AREA',
    name: 'خارج منطقة التغطية',
    icon: 'MapPinOff',
    color: '#9E9E9E',
    isActive: true
  },
];
```

## 🔍 كيف تتحقق من التعديلات؟

### 1. **في Backend**
```powershell
# تشغيل Backend
cd backend
npm run dev

# اختبار API (في PowerShell جديد)
# استخدم المتصفح أو Postman
# افتح: http://localhost:3001/api/users
# أو: http://localhost:3001/api/areas/all
```

### 2. **في Frontend**
- افتح المتصفح (Chrome أو Edge)
- اضغط F12 لفتح Developer Tools
- Console → شوف الـ logs
- Application → localStorage → شوف البيانات المحفوظة

## ⚠️ ملاحظات مهمة

### 1. **التزامن بين Backend و Frontend**
- عدل على الاثنين معاً للتأكد من التطابق
- Backend = المصدر الرئيسي
- Frontend = Fallback عند عدم توفر Backend

### 2. **IDs يجب أن تكون فريدة**
```javascript
// ✅ صح
{ id: 'driver-1', name: 'ابو العبد' }
{ id: 'driver-2', name: 'محمد' }

// ❌ خطأ (نفس الـ ID)
{ id: 'driver-1', name: 'ابو العبد' }
{ id: 'driver-1', name: 'محمد' }
```

### 3. **الأدوار المتاحة**
```javascript
roleId: 'admin'      // مدير
roleId: 'driver'     // سائق
roleId: 'merchant'   // تاجر
roleId: 'supervisor' // مشرف
roleId: 'customer_service' // خدمة عملاء
```

### 4. **كلمة المرور الافتراضية**
جميع المستخدمين في seed.js لهم نفس كلمة المرور: `123`

## 🛠️ أدوات مساعدة (Windows)

### 1. **إعادة تعيين قاعدة البيانات**
```powershell
# افتح PowerShell في مجلد المشروع
cd backend
node migrations\run.js
node migrations\seed.js
```

### 2. **نسخ احتياطي**
```powershell
# قبل أي تعديل، انسخ الملفات
copy backend\migrations\seed.js backend\migrations\seed.js.backup
copy src\store\user-store.ts src\store\user-store.ts.backup
```

### 3. **فتح الملفات للتعديل**
```powershell
# افتح في VS Code
code backend\migrations\seed.js
code src\store\user-store.ts

# أو افتح في Notepad
notepad backend\migrations\seed.js
```

## 📚 ملفات مهمة للتعديل

### Backend
- ✅ `backend/migrations/seed.js` - البيانات الأولية
- ✅ `backend/migrations/run.js` - بنية الجداول
- ✅ `backend/.env` - معلومات الاتصال بقاعدة البيانات

### Frontend
- ✅ `src/store/user-store.ts` - المستخدمين
- ✅ `src/store/orders-store.ts` - الطلبات
- ✅ `src/store/areas-store.ts` - المدن والمناطق
- ✅ `src/store/statuses-store.ts` - الحالات

## 🎯 الخلاصة

1. **للتعديل السريع**: عدل على Frontend stores
2. **للتعديل الدائم**: عدل على Backend seed.js
3. **للأفضل**: عدل على الاثنين معاً
4. **بعد التعديل**: أعد تشغيل Backend وامسح cache المتصفح

**محتاج مساعدة؟** اسأل عن أي تعديل محدد! 🚀
