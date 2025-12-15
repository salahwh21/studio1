# تشغيل قاعدة البيانات - دليل سريع 🚀

## ✅ PostgreSQL مثبت عندك!

**الإعدادات الحالية:**
- Username: `postgres`
- Password: `Sbreen$1967`
- Database: `delivery_db`
- Port: `5432`

## 🎯 خطوات سريعة للتشغيل:

### 1️⃣ **تأكد من تشغيل PostgreSQL**

**افتح Services:**
```
اضغط Win + R
اكتب: services.msc
اضغط Enter
```

**ابحث عن:** `postgresql-x64-16` (أو postgresql)

**تأكد أنه:** `Running` (شغال)

**إذا مو شغال:**
- كليك يمين → Start

### 2️⃣ **تأكد من وجود قاعدة البيانات**

**افتح pgAdmin 4:**
```
Start Menu → PostgreSQL → pgAdmin 4
```

**أدخل كلمة المرور:** `Sbreen$1967`

**شوف إذا موجودة:**
- Servers → PostgreSQL → Databases → `delivery_db`

**إذا مو موجودة، أنشئها:**
- Databases → (كليك يمين) → Create → Database
- Name: `delivery_db`
- Owner: `postgres`
- Save

### 3️⃣ **شغل Migrations (إنشاء الجداول)**

**افتح PowerShell:**
```powershell
cd C:\11\studio1-1\backend
node migrations\run.js
```

**يجب أن تشوف:**
```
Running database migration...
Migration completed successfully!
```

### 4️⃣ **شغل Seed (إضافة البيانات الأساسية)**

```powershell
node migrations\seed.js
```

**يجب أن تشوف:**
```
Seeding database...
Roles seeded
Statuses seeded
Cities seeded
Regions seeded
Users seeded
Sample orders seeded
Database seeding completed successfully!
```

### 4️⃣ب **استيراد جميع البيانات الموجودة (111 مستخدم + جميع المدن)**

```powershell
node migrations\import-existing-data.js
```

**يجب أن تشوف:**
```
🚀 بدء استيراد البيانات الموجودة...
✅ تم استيراد 8 مدن
✅ تم استيراد 28 منطقة
✅ تم استيراد 111 مستخدم (5 موظف، 10 سائق، 96 تاجر)
🎉 تم استيراد جميع البيانات بنجاح!
```

### 5️⃣ **شغل Backend**

```powershell
npm run dev
```

**يجب أن تشوف:**
```
Server running on port 3001
Database connected successfully
```

### 6️⃣ **شغل Frontend (في terminal جديد)**

```powershell
cd C:\11\studio1-1
npm run dev
```

### 7️⃣ **افتح المتصفح**

```
http://localhost:3000
```

**سجل دخول:**
```
المدير:
- admin@alwameed.com / 123

التاجر:
- merchant@alwameed.com / 123

السائق:
- driver@alwameed.com / 123
```

## 🔍 التحقق من البيانات

### في pgAdmin:
1. افتح pgAdmin 4
2. Servers → PostgreSQL → Databases → delivery_db
3. Schemas → public → Tables
4. يجب أن تشوف:
   - ✅ users
   - ✅ orders
   - ✅ cities
   - ✅ regions
   - ✅ statuses
   - ✅ roles

### في المتصفح:
```
http://localhost:3001/api/users
http://localhost:3001/api/areas/all
```

## ⚠️ إذا واجهت مشاكل:

### المشكلة 1: "password authentication failed"
**الحل:**
```powershell
# تأكد من كلمة المرور في .env
code backend\.env

# يجب أن تكون:
DATABASE_URL=postgresql://postgres:Sbreen$1967@localhost:5432/delivery_db
```

### المشكلة 2: "database does not exist"
**الحل:**
```powershell
# أنشئ قاعدة البيانات
cd "C:\Program Files\PostgreSQL\16\bin"
psql -U postgres
# أدخل كلمة المرور: Sbreen$1967
CREATE DATABASE delivery_db;
\q
```

### المشكلة 3: "could not connect to server"
**الحل:**
```powershell
# شغل PostgreSQL
net start postgresql-x64-16
```

### المشكلة 4: "Port 3001 already in use"
**الحل:**
```powershell
# أوقف العملية القديمة
netstat -ano | findstr :3001
# اقتل العملية (PID من الأمر السابق)
taskkill /PID <رقم_العملية> /F
```

## 📝 تعديل البيانات

### الآن يمكنك التعديل من مكانين:

#### 1. **من pgAdmin** (سهل ومباشر):
- افتح pgAdmin 4
- اذهب للجدول (مثلاً: users)
- كليك يمين → View/Edit Data → All Rows
- عدل مباشرة!

#### 2. **من ملف seed.js** (للبيانات الأولية):
```powershell
code backend\migrations\seed.js
# عدل على البيانات
# ثم شغل:
node migrations\seed.js
```

## 🎯 الآن النظام شغال مع قاعدة بيانات حقيقية!

### المميزات:
- ✅ البيانات محفوظة بشكل دائم
- ✅ يمكن مشاركتها بين أجهزة متعددة
- ✅ جاهز للنقل على سيرفر
- ✅ يمكن عمل backup واسترجاع

## 🚀 الخطوات التالية:

### 1. **Backup دوري:**
```powershell
cd "C:\Program Files\PostgreSQL\16\bin"
pg_dump -U postgres delivery_db > C:\backup\delivery_db_backup.sql
```

### 2. **Restore من backup:**
```powershell
psql -U postgres delivery_db < C:\backup\delivery_db_backup.sql
```

### 3. **للإنتاج (Production):**
- غير كلمة المرور
- استخدم DATABASE_URL من السيرفر
- فعّل SSL

## 📞 محتاج مساعدة؟

إذا واجهت أي مشكلة:
1. شوف رسالة الخطأ في PowerShell
2. تأكد من تشغيل PostgreSQL (services.msc)
3. تأكد من كلمة المرور في .env
4. جرب إعادة تشغيل PostgreSQL

**جاهز؟ ابدأ بالخطوة 1!** 🎉
