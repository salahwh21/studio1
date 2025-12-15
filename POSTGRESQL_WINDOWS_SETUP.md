# تثبيت PostgreSQL على Windows 🐘

## 📥 الخطوة 1: تحميل PostgreSQL

### 1. اذهب للموقع الرسمي:
```
https://www.postgresql.org/download/windows/
```

### 2. اضغط على "Download the installer"

### 3. اختر النسخة المناسبة:
- **Windows x86-64** (للأجهزة 64-bit)
- النسخة الموصى بها: **PostgreSQL 16.x**

### 4. حمل الملف (حجمه حوالي 300 MB)

## 🔧 الخطوة 2: تثبيت PostgreSQL

### 1. شغل الملف اللي حملته (postgresql-16.x-windows-x64.exe)

### 2. اضغط Next حتى تصل لـ "Select Components"
اختر:
- ✅ PostgreSQL Server
- ✅ pgAdmin 4 (واجهة رسومية)
- ✅ Command Line Tools
- ⬜ Stack Builder (اختياري)

### 3. اختر مجلد التثبيت (الافتراضي OK):
```
C:\Program Files\PostgreSQL\16
```

### 4. اختر مجلد البيانات (الافتراضي OK):
```
C:\Program Files\PostgreSQL\16\data
```

### 5. **مهم جداً!** اختر كلمة مرور للـ superuser (postgres):
```
كلمة المرور: postgres123
(أو أي كلمة مرور تحفظها!)
```
⚠️ **احفظ هذه الكلمة! راح تحتاجها!**

### 6. اختر Port (الافتراضي 5432 - اتركه كما هو)

### 7. اختر Locale (الافتراضي OK)

### 8. اضغط Next ثم Install

### 9. انتظر حتى ينتهي التثبيت (5-10 دقائق)

## ✅ الخطوة 3: التحقق من التثبيت

### 1. افتح pgAdmin 4:
```
Start Menu → PostgreSQL 16 → pgAdmin 4
```

### 2. أدخل كلمة المرور اللي اخترتها

### 3. إذا فتح pgAdmin بنجاح، يعني التثبيت تمام! ✅

## 🗄️ الخطوة 4: إنشاء قاعدة البيانات

### الطريقة 1: من pgAdmin (سهلة)

1. **افتح pgAdmin 4**

2. **في الشجرة على اليسار:**
   - Servers → PostgreSQL 16 → (كليك يمين)
   - أدخل كلمة المرور

3. **إنشاء قاعدة بيانات:**
   - Databases → (كليك يمين) → Create → Database
   - Database name: `delivery_system`
   - Owner: `postgres`
   - اضغط Save

### الطريقة 2: من Command Line

1. **افتح CMD أو PowerShell:**
```powershell
# اذهب لمجلد PostgreSQL
cd "C:\Program Files\PostgreSQL\16\bin"

# افتح psql
psql -U postgres

# أدخل كلمة المرور
# ثم اكتب:
CREATE DATABASE delivery_system;

# للخروج:
\q
```

## 🔗 الخطوة 5: إعداد ملف .env

### 1. افتح ملف .env في مجلد backend:
```powershell
code backend\.env
```

### 2. أضف أو عدل هذه الأسطر:
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/delivery_system

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret (اختياري)
JWT_SECRET=your-secret-key-here
```

⚠️ **مهم:** غير `postgres123` لكلمة المرور اللي اخترتها!

### 3. احفظ الملف (Ctrl + S)

## 🚀 الخطوة 6: تشغيل Migrations

### 1. افتح PowerShell في مجلد المشروع:
```powershell
cd C:\11\studio1-1\backend
```

### 2. ثبت Dependencies (إذا ما ثبتتها):
```powershell
npm install
```

### 3. شغل Migration (إنشاء الجداول):
```powershell
node migrations\run.js
```

يجب أن تشوف:
```
Running database migration...
Migration completed successfully!
```

### 4. شغل Seed (إضافة البيانات الأولية):
```powershell
node migrations\seed.js
```

يجب أن تشوف:
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

## 🎯 الخطوة 7: تشغيل Backend

```powershell
cd backend
npm run dev
```

يجب أن تشوف:
```
Server running on port 3001
Database connected successfully
```

## 🔍 الخطوة 8: التحقق من البيانات

### في pgAdmin:
1. افتح pgAdmin 4
2. Servers → PostgreSQL 16 → Databases → delivery_system
3. Schemas → public → Tables
4. يجب أن تشوف الجداول:
   - users
   - orders
   - cities
   - regions
   - statuses
   - roles

### في المتصفح:
افتح:
```
http://localhost:3001/api/users
http://localhost:3001/api/areas/all
```

## ⚠️ مشاكل شائعة وحلولها

### المشكلة 1: "password authentication failed"
**الحل:**
- تأكد من كلمة المرور في ملف .env
- تأكد من اسم المستخدم (postgres)

### المشكلة 2: "could not connect to server"
**الحل:**
```powershell
# تأكد من تشغيل PostgreSQL
# افتح Services (Win + R → services.msc)
# ابحث عن "postgresql-x64-16"
# تأكد أنه "Running"
# إذا لا، اضغط كليك يمين → Start
```

### المشكلة 3: "database does not exist"
**الحل:**
```powershell
# أنشئ قاعدة البيانات يدوياً
cd "C:\Program Files\PostgreSQL\16\bin"
psql -U postgres
CREATE DATABASE delivery_system;
\q
```

### المشكلة 4: "Port 5432 already in use"
**الحل:**
- غير الـ Port في ملف .env
- أو أوقف البرنامج اللي يستخدم Port 5432

## 🎓 أوامر مفيدة

### في psql:
```sql
-- عرض جميع قواعد البيانات
\l

-- الاتصال بقاعدة بيانات
\c delivery_system

-- عرض جميع الجداول
\dt

-- عرض بيانات جدول
SELECT * FROM users;

-- حذف جميع البيانات من جدول
TRUNCATE TABLE orders CASCADE;

-- حذف قاعدة البيانات (احذر!)
DROP DATABASE delivery_system;
```

### في PowerShell:
```powershell
# تشغيل PostgreSQL
net start postgresql-x64-16

# إيقاف PostgreSQL
net stop postgresql-x64-16

# التحقق من الحالة
sc query postgresql-x64-16
```

## 📊 بعد التثبيت

### الآن يمكنك:

1. ✅ **تشغيل Backend مع قاعدة بيانات حقيقية**
2. ✅ **إضافة/تعديل/حذف البيانات من pgAdmin**
3. ✅ **استخدام API endpoints**
4. ✅ **مزامنة البيانات بين Frontend و Backend**
5. ✅ **جاهز للنقل على سيرفر**

## 🚀 الخطوات التالية

### 1. تشغيل النظام كامل:

**Terminal 1 (Backend):**
```powershell
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```powershell
npm run dev
```

### 2. افتح المتصفح:
```
http://localhost:3000
```

### 3. سجل دخول:
```
المدير:
- البريد: admin@alwameed.com
- كلمة المرور: 123

التاجر:
- البريد: merchant@alwameed.com
- كلمة المرور: 123

السائق:
- البريد: driver@alwameed.com
- كلمة المرور: 123
```

## 📝 ملاحظات مهمة

1. **كلمة مرور postgres:** احفظها في مكان آمن!

2. **Backup:** اعمل backup دوري:
   ```powershell
   pg_dump -U postgres delivery_system > backup.sql
   ```

3. **Restore:** استرجاع من backup:
   ```powershell
   psql -U postgres delivery_system < backup.sql
   ```

4. **للإنتاج:** غير كلمة المرور والـ JWT_SECRET!

## 🎉 تمام!

الآن عندك:
- ✅ PostgreSQL مثبت
- ✅ قاعدة بيانات جاهزة
- ✅ Backend يشتغل
- ✅ جاهز للنقل على سيرفر

**محتاج مساعدة في أي خطوة؟ قلي!** 🚀
