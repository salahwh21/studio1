# دليل النشر على السيرفر (Production Deployment)

## المتطلبات
- Ubuntu 20.04+ (أو أي Linux)
- Node.js 18+
- PostgreSQL (Stackhero - جاهز)
- Nginx
- دومين يشير للسيرفر

---

## 1. تجهيز السيرفر

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تنصيب Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# تنصيب PM2
sudo npm install -g pm2

# تنصيب Nginx + Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# تنصيب pg_dump (للـ backup)
sudo apt install -y postgresql-client
```

---

## 2. رفع المشروع

```bash
# Clone أو نقل الملفات للسيرفر
cd /var/www
git clone https://github.com/salahwh21/studio1.git studio1
cd studio1
```

---

## 3. إعداد Backend

```bash
cd /var/www/studio1/backend

# تنصيب المكتبات
npm install --production

# إنشاء ملف .env
cp .env.example .env
nano .env
```

**محتوى .env المطلوب:**
```env
PORT=5001
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
JWT_SECRET=your-strong-secret-here-change-this
FRONTEND_URL=https://yourdomain.com
DB_POOL_MAX=20
DB_POOL_MIN=2
```

```bash
# تشغيل الـ migrations
node migrations/run.js

# إنشاء مجلد الـ logs
mkdir -p logs

# تشغيل عبر PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 4. إعداد Frontend

```bash
cd /var/www/studio1

# تنصيب المكتبات
npm install

# إنشاء ملف .env
nano .env
```

**محتوى .env:**
```env
BACKEND_URL=http://127.0.0.1:5001
```

```bash
# بناء النسخة النهائية
npm run build

# تشغيل عبر PM2
pm2 start npm --name "studio1-frontend" -- start
pm2 save
```

---

## 5. إعداد HTTPS + Nginx

```bash
# نسخ ملف الـ config (غيّر yourdomain.com بالدومين الحقيقي)
sudo cp /var/www/studio1/backend/nginx.conf /etc/nginx/sites-available/studio1

# تعديل الدومين
sudo nano /etc/nginx/sites-available/studio1

# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/studio1 /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# فحص وتشغيل
sudo nginx -t
sudo systemctl reload nginx

# شهادة SSL مجانية (يطلب إيميل)
sudo certbot --nginx -d yourdomain.com
```

---

## 6. إعداد Backup مجدول

```bash
cd /var/www/studio1/backend
mkdir -p backups
chmod +x scripts/backup.sh

# جدولة يومية الساعة 3 فجراً
crontab -e
```

أضف هذا السطر:
```
0 3 * * * cd /var/www/studio1/backend && bash scripts/backup.sh >> logs/backup.log 2>&1
```

---

## 7. أوامر يومية مفيدة

```bash
# حالة التطبيق
pm2 status

# مراقبة مباشرة (CPU/RAM)
pm2 monit

# قراءة الـ logs
pm2 logs studio1-api
pm2 logs studio1-frontend

# إعادة تشغيل بعد تحديث
cd /var/www/studio1/backend && pm2 restart studio1-api
cd /var/www/studio1 && npm run build && pm2 restart studio1-frontend

# تحديث الكود من GitHub
cd /var/www/studio1
git pull
npm install && npm run build
cd backend && npm install && node migrations/run.js
pm2 restart all
```

---

## 8. فحص أن كل شيء شغال

```bash
# فحص PM2
pm2 status

# فحص Nginx
sudo systemctl status nginx

# فحص الـ API
curl https://yourdomain.com/api/health

# فحص SSL
curl -I https://yourdomain.com

# فحص الـ backup
ls -la /var/www/studio1/backend/backups/
```

---

## ملاحظات مهمة

- **غيّر `yourdomain.com`** بالدومين الحقيقي بكل مكان
- **غيّر `JWT_SECRET`** لقيمة عشوائية قوية (32+ حرف)
- **الشهادة تتجدد تلقائياً** عبر certbot timer
- **PM2 يعيد التشغيل تلقائياً** عند crash أو إعادة تشغيل السيرفر
- **Stackhero** يعمل backup للـ database تلقائياً — سكريبت الـ backup إضافي للأمان
