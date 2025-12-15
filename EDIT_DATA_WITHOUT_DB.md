# تعديل البيانات بدون قاعدة بيانات 🎯

## ✅ النظام يشتغل بدون PostgreSQL!

البيانات محفوظة محلياً في ملفات الـ stores. عدل عليها مباشرة!

## 📁 الملفات المهمة للتعديل:

### 1. **المستخدمين** (سائقين، تجار، مدراء)
**الملف:** `src\store\user-store.ts`

**كيف تعدل:**
1. افتح الملف في VS Code:
   ```powershell
   code src\store\user-store.ts
   ```

2. ابحث عن `const initialUsers`

3. أضف مستخدم جديد:
   ```typescript
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
   ```

4. احفظ الملف (Ctrl + S)

5. امسح localStorage من المتصفح:
   - اضغط F12
   - Application → Storage → Clear site data
   - أعد تحميل الصفحة (Ctrl + F5)

### 2. **المدن والمناطق**
**الملف:** `src\store\areas-store.ts`

**كيف تعدل:**
1. افتح الملف:
   ```powershell
   code src\store\areas-store.ts
   ```

2. ابحث عن `const fallbackCities`

3. أضف مدينة جديدة:
   ```typescript
   {
     id: 'CITY_JRS',
     name: 'جرش',
     areas: [
       { id: 'REG_JRS_001', name: 'وسط جرش', cityId: 'CITY_JRS' },
       { id: 'REG_JRS_002', name: 'سوف', cityId: 'CITY_JRS' },
     ]
   },
   ```

4. احفظ وامسح localStorage

### 3. **الحالات**
**الملف:** `src\store\statuses-store.ts`

**كيف تعدل:**
1. افتح الملف:
   ```powershell
   code src\store\statuses-store.ts
   ```

2. ابحث عن `const initialStatuses`

3. أضف حالة جديدة:
   ```typescript
   {
     id: 'STS_NEW',
     code: 'NEW_STATUS',
     name: 'حالة جديدة',
     icon: 'Star',
     color: '#FF5722',
     isActive: true,
     reasonCodes: [],
     setByRoles: ['admin', 'driver'],
     visibleTo: { admin: true, driver: true, merchant: true },
     permissions: {},
     flow: {},
     triggers: {},
   },
   ```

4. احفظ وامسح localStorage

### 4. **الطلبات**
**الملف:** `src\store\orders-store.ts`

**كيف تعدل:**
1. افتح الملف:
   ```powershell
   code src\store\orders-store.ts
   ```

2. ابحث عن `const generateSampleOrders`

3. عدل على البيانات الأولية

4. احفظ وامسح localStorage

## 🎯 خطوات سريعة:

### مثال: إضافة سائق جديد

**1. افتح الملف:**
```powershell
code src\store\user-store.ts
```

**2. ابحث عن:** `const initialUsers: User[] = [`

**3. أضف قبل `];`:**
```typescript
{
  id: 'driver-khalid',
  name: 'خالد السائق',
  storeName: 'خالد السائق',
  email: '0795555555',
  roleId: 'driver',
  avatar: '',
  whatsapp: '0795555555',
  priceListId: '',
},
```

**4. احفظ:** `Ctrl + S`

**5. في المتصفح:**
- اضغط `F12`
- اذهب لـ `Application`
- اضغط `Clear site data`
- أعد تحميل الصفحة `Ctrl + F5`

**6. جرب تسجيل الدخول:**
- البريد: `0795555555`
- كلمة المرور: `123`

## 📍 مواقع الملفات:

```
📁 المشروع (C:\11\studio1-1)
└── 📁 src
    └── 📁 store
        ├── 📄 user-store.ts       ← المستخدمين (سائقين، تجار)
        ├── 📄 areas-store.ts      ← المدن والمناطق
        ├── 📄 statuses-store.ts   ← الحالات
        └── 📄 orders-store.ts     ← الطلبات
```

## ⚠️ ملاحظات مهمة:

### 1. **IDs يجب أن تكون فريدة**
```typescript
// ✅ صح
{ id: 'driver-1', name: 'ابو العبد' }
{ id: 'driver-2', name: 'محمد' }

// ❌ خطأ (نفس الـ ID)
{ id: 'driver-1', name: 'ابو العبد' }
{ id: 'driver-1', name: 'محمد' }
```

### 2. **الأدوار المتاحة**
```typescript
roleId: 'admin'      // مدير
roleId: 'driver'     // سائق
roleId: 'merchant'   // تاجر
```

### 3. **كلمة المرور الافتراضية**
جميع المستخدمين كلمة مرورهم: `123`

### 4. **بعد كل تعديل**
- احفظ الملف (Ctrl + S)
- امسح localStorage
- أعد تحميل الصفحة (Ctrl + F5)

## 🔍 كيف تتحقق من التعديلات؟

### 1. **في Console:**
```javascript
// افتح Console (F12)
// اكتب:
localStorage.clear()
location.reload()
```

### 2. **في Application:**
- اضغط F12
- اذهب لـ Application
- localStorage → شوف البيانات

## 🎓 نصائح:

1. **اعمل نسخة احتياطية قبل التعديل:**
   ```powershell
   copy src\store\user-store.ts src\store\user-store.ts.backup
   ```

2. **استخدم VS Code للتعديل** (أفضل من Notepad)

3. **تأكد من حفظ الملف** قبل إعادة التحميل

4. **امسح localStorage** بعد كل تعديل

5. **شوف Console** للتأكد من عدم وجود أخطاء

## 🚀 جاهز للتعديل؟

**لا تحتاج PostgreSQL!** فقط عدل على الملفات وامسح localStorage! 

## 📞 أمثلة إضافية:

### إضافة تاجر جديد:
```typescript
// في user-store.ts
{
  id: 'merchant-new',
  name: 'محمد التاجر',
  storeName: 'متجر محمد',
  email: 'merchant2@alwameed.com',
  roleId: 'merchant',
  avatar: '',
  whatsapp: '0791234567',
  priceListId: '',
},
```

### إضافة منطقة جديدة لعمان:
```typescript
// في areas-store.ts
// داخل CITY_AMM → areas
{ id: 'REG_AMM_017', name: 'الرابية', cityId: 'CITY_AMM' },
{ id: 'REG_AMM_018', name: 'الصويفية', cityId: 'CITY_AMM' },
```

**بسيط وسهل! ما تحتاج قاعدة بيانات!** 🎉
