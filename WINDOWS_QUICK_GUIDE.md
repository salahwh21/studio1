# دليل سريع للويندوز 🪟

## 📂 فتح الملفات للتعديل

### الطريقة 1: من File Explorer
1. افتح مجلد المشروع
2. اذهب لـ `backend\migrations\seed.js`
3. اضغط كليك يمين → Open with → VS Code (أو Notepad)

### الطريقة 2: من PowerShell
```powershell
# افتح PowerShell (Win + X → Windows PowerShell)
cd C:\11\studio1-1

# افتح في VS Code
code backend\migrations\seed.js
code src\store\user-store.ts

# أو افتح في Notepad
notepad backend\migrations\seed.js
```

## 🔧 تطبيق التعديلات

### خطوة 1: تعديل الملف
افتح `backend\migrations\seed.js` وعدل على البيانات

### خطوة 2: تشغيل Seed
```powershell
# افتح PowerShell في مجلد المشروع
cd backend
node migrations\seed.js
```

### خطوة 3: إعادة تشغيل Backend
```powershell
# إذا كان Backend شغال، أوقفه (Ctrl + C)
# ثم شغله من جديد
npm run dev
```

### خطوة 4: مسح Cache المتصفح
1. افتح المتصفح (Chrome/Edge)
2. اضغط `Ctrl + Shift + Delete`
3. اختر "Cached images and files"
4. اضغط "Clear data"
5. أعد تحميل الصفحة (`Ctrl + F5`)

## 📝 أمثلة سريعة

### مثال 1: إضافة سائق جديد

**1. افتح الملف:**
```powershell
code backend\migrations\seed.js
```

**2. ابحث عن `const users =` وأضف:**
```javascript
{
  id: 'driver-new',
  name: 'خالد السائق',
  email: '0795555555',
  roleId: 'driver',
  storeName: 'خالد السائق'
},
```

**3. احفظ الملف (Ctrl + S)**

**4. شغل Seed:**
```powershell
cd backend
node migrations\seed.js
```

**5. أعد تشغيل Backend:**
```powershell
npm run dev
```

### مثال 2: إضافة مدينة جديدة

**1. افتح الملف:**
```powershell
code backend\migrations\seed.js
```

**2. ابحث عن `const cities =` وأضف:**
```javascript
{ id: 'CITY_JRS', name: 'جرش' },
```

**3. ابحث عن `const regions =` وأضف:**
```javascript
{ id: 'REG_JRS_001', name: 'وسط جرش', cityId: 'CITY_JRS' },
```

**4. احفظ وشغل Seed:**
```powershell
cd backend
node migrations\seed.js
npm run dev
```

## 🎯 الملفات المهمة

### للتعديل على البيانات:
```
📁 المشروع
├── 📁 backend
│   └── 📁 migrations
│       └── 📄 seed.js          ← عدل هنا (البيانات الأساسية)
└── 📁 src
    └── 📁 store
        ├── 📄 user-store.ts    ← عدل هنا (المستخدمين المحليين)
        └── 📄 areas-store.ts   ← عدل هنا (المدن المحلية)
```

## 🚀 أوامر PowerShell المهمة

### التنقل بين المجلدات:
```powershell
cd backend              # الدخول لمجلد backend
cd ..                   # الرجوع للمجلد السابق
cd C:\11\studio1-1      # الذهاب لمجلد المشروع
dir                     # عرض محتويات المجلد
```

### تشغيل الأوامر:
```powershell
node migrations\seed.js     # تشغيل seed
npm run dev                 # تشغيل Backend
npm install                 # تثبيت Dependencies
```

### نسخ الملفات:
```powershell
copy seed.js seed.js.backup           # نسخ احتياطي
copy seed.js.backup seed.js           # استرجاع النسخة الاحتياطية
```

## 🔍 التحقق من التعديلات

### 1. تحقق من Backend:
```powershell
# شغل Backend
cd backend
npm run dev

# افتح المتصفح واذهب لـ:
# http://localhost:3001/api/users
```

### 2. تحقق من Frontend:
1. افتح المتصفح
2. اضغط F12
3. اذهب لـ Console
4. شوف الـ logs

## ⚠️ مشاكل شائعة وحلولها

### المشكلة 1: "node is not recognized"
**الحل:**
```powershell
# تأكد من تثبيت Node.js
node --version

# إذا لم يعمل، ثبت Node.js من:
# https://nodejs.org/
```

### المشكلة 2: "Cannot find module"
**الحل:**
```powershell
cd backend
npm install
```

### المشكلة 3: Backend لا يشتغل
**الحل:**
```powershell
# تأكد من ملف .env
cd backend
notepad .env

# تأكد من وجود:
# DATABASE_URL=your_database_url
# PORT=3001
```

### المشكلة 4: التعديلات لا تظهر
**الحل:**
1. امسح cache المتصفح (Ctrl + Shift + Delete)
2. أعد تحميل الصفحة (Ctrl + F5)
3. تأكد من تشغيل seed.js
4. أعد تشغيل Backend

## 📱 اختصارات لوحة المفاتيح

### في Windows:
- `Win + R` → فتح Run
- `Win + X` → قائمة سريعة (فيها PowerShell)
- `Ctrl + C` → إيقاف البرنامج في PowerShell
- `Ctrl + Shift + Delete` → مسح cache المتصفح

### في المتصفح:
- `F12` → فتح Developer Tools
- `Ctrl + F5` → إعادة تحميل بدون cache
- `Ctrl + Shift + R` → نفس الشيء

### في VS Code:
- `Ctrl + S` → حفظ
- `Ctrl + F` → بحث
- `Ctrl + H` → بحث واستبدال
- `Ctrl + /` → تعليق/إلغاء تعليق

## 🎓 نصائح

1. **دائماً اعمل نسخة احتياطية قبل التعديل**
   ```powershell
   copy seed.js seed.js.backup
   ```

2. **استخدم VS Code للتعديل** (أفضل من Notepad)
   ```powershell
   code backend\migrations\seed.js
   ```

3. **تأكد من حفظ الملف** (Ctrl + S) قبل تشغيل seed

4. **شوف الـ Console** في المتصفح لمعرفة الأخطاء

5. **اقرأ رسائل الخطأ** في PowerShell بعناية

## 📞 محتاج مساعدة؟

إذا واجهت أي مشكلة:
1. شوف رسالة الخطأ في PowerShell
2. شوف Console في المتصفح (F12)
3. تأكد من تشغيل Backend
4. تأكد من مسح cache المتصفح

**جاهز للتعديل؟ ابدأ الآن!** 🚀
