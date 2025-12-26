# 🚀 دليل نقل المشروع إلى VPS

## 📋 المتطلبات الأساسية

### مواصفات VPS الموصى بها
- **RAM:** 4GB كحد أدنى (8GB مفضل لـ Puppeteer)
- **CPU:** 2 cores كحد أدنى
- **Storage:** 40GB SSD
- **OS:** Ubuntu 22.04 LTS (موصى به)

### البرامج المطلوبة على VPS
- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+
- Nginx (reverse proxy)
- PM2 (process manager)
- Git
- Chromium (لـ Puppeteer)

---

## 🔧 الخطوة 1: إعداد VPS

### 1.1 الاتصال بالسيرفر
```bash
ssh root@YOUR_VPS_IP
```

### 1.2 تحديث النظام
```bash
apt update && apt upgrade -y
```

### 1.3 إنشاء مستخدم جديد (أفضل من root)
```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

---

## 📦 الخطوة 2: تثبيت البرامج المطلوبة

### 2.1 تثبيت Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # التحقق
npm -v
```

### 2.2 تثبيت PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# إنشاء قاعدة البيانات والمستخدم
sudo -u postgres psql << EOF
CREATE USER admin WITH PASSWORD 'YOUR_SECURE_PASSWORD';
CREATE DATABASE delivery_app OWNER admin;
GRANT ALL PRIVILEGES ON DATABASE delivery_app TO admin;
\q
EOF
```

### 2.3 تثبيت Redis
```bash
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# تأمين Redis
sudo nano /etc/redis/redis.conf
# أضف: requirepass YOUR_REDIS_PASSWORD
# غير: bind 127.0.0.1

sudo systemctl restart redis-server
```

### 2.4 تثبيت Chromium (لـ Puppeteer)
```bash
sudo apt install -y chromium-browser
# أو
sudo apt install -y google-chrome-stable

# تثبيت dependencies لـ Puppeteer
sudo apt install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils
```

### 2.5 تثبيت Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.6 تثبيت PM2
```bash
sudo npm install -g pm2
```

### 2.7 تثبيت Git
```bash
sudo apt install -y git
```

---

## 📂 الخطوة 3: نقل المشروع

### الطريقة 1: عبر Git (موصى بها)

#### على جهازك المحلي:
```bash
# إذا لم يكن لديك repo
git init
git add .
git commit -m "Initial commit for deployment"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

#### على VPS:
```bash
cd /var/www
sudo mkdir delivery-app
sudo chown deploy:deploy delivery-app
cd delivery-app
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
```

### الطريقة 2: عبر SCP (نقل مباشر)

#### على جهازك المحلي:
```bash
# ضغط المشروع (بدون node_modules و .next)
tar --exclude='node_modules' --exclude='.next' -czvf project.tar.gz .

# نقل للسيرفر
scp project.tar.gz deploy@YOUR_VPS_IP:/var/www/delivery-app/
```

#### على VPS:
```bash
cd /var/www/delivery-app
tar -xzvf project.tar.gz
rm project.tar.gz
```

### الطريقة 3: عبر SFTP (FileZilla)
1. افتح FileZilla
2. اتصل بـ `sftp://YOUR_VPS_IP`
3. انقل الملفات إلى `/var/www/delivery-app`

---

## ⚙️ الخطوة 4: إعداد المشروع على VPS

### 4.1 تثبيت Dependencies
```bash
cd /var/www/delivery-app
npm install
```

### 4.2 إنشاء ملف البيئة للإنتاج
```bash
nano .env.production
```

أضف المحتوى التالي:
```env
# Production Environment
NODE_ENV=production

# Database
POSTGRES_URL="postgresql://admin:YOUR_SECURE_PASSWORD@localhost:5432/delivery_app"
REDIS_URL="redis://:YOUR_REDIS_PASSWORD@localhost:6379"

# API URLs
NEXT_PUBLIC_API_URL=https://YOUR_DOMAIN.com/api
NEXT_PUBLIC_SOCKET_IO_URL=https://YOUR_DOMAIN.com

# Backend (إذا كان منفصل)
BACKEND_URL=http://localhost:3001

# AI Keys (اختياري)
NEXT_PUBLIC_GEMINI_API_KEY=YOUR_KEY

# Security
NEXTAUTH_SECRET=YOUR_RANDOM_SECRET_KEY
NEXTAUTH_URL=https://YOUR_DOMAIN.com
```

### 4.3 إعداد قاعدة البيانات
```bash
# تشغيل سكريبت إعداد الجداول
PGPASSWORD=YOUR_SECURE_PASSWORD psql -h localhost -U admin -d delivery_app -f src/lib/database-setup.sql
```

### 4.4 بناء المشروع للإنتاج
```bash
npm run build
```

---

## 🔄 الخطوة 5: إعداد PM2

### 5.1 إنشاء ملف ecosystem
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'delivery-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/delivery-app',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/delivery-frontend-error.log',
      out_file: '/var/log/pm2/delivery-frontend-out.log',
      log_file: '/var/log/pm2/delivery-frontend.log',
      time: true
    },
    {
      name: 'delivery-backend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/delivery-app/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      max_memory_restart: '500M',
      error_file: '/var/log/pm2/delivery-backend-error.log',
      out_file: '/var/log/pm2/delivery-backend-out.log',
      time: true
    }
  ]
};
```

### 5.2 إنشاء مجلد السجلات
```bash
sudo mkdir -p /var/log/pm2
sudo chown deploy:deploy /var/log/pm2
```

### 5.3 تشغيل التطبيق
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

---

## 🌐 الخطوة 6: إعداد Nginx

### 6.1 إنشاء ملف التكوين
```bash
sudo nano /etc/nginx/sites-available/delivery-app
```

```nginx
# Upstream للـ Frontend
upstream frontend {
    server 127.0.0.1:5000;
    keepalive 64;
}

# Upstream للـ Backend
upstream backend {
    server 127.0.0.1:3001;
    keepalive 64;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;

    # SSL certificates (سيتم إنشاؤها لاحقاً)
    ssl_certificate /etc/letsencrypt/live/YOUR_DOMAIN.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/YOUR_DOMAIN.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        
        # For file uploads
        client_max_body_size 50M;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://frontend;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Error pages
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

### 6.2 تفعيل الموقع
```bash
sudo ln -s /etc/nginx/sites-available/delivery-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 الخطوة 7: إعداد SSL (HTTPS)

### 7.1 تثبيت Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 الحصول على شهادة SSL
```bash
sudo certbot --nginx -d YOUR_DOMAIN.com -d www.YOUR_DOMAIN.com
```

### 7.3 التجديد التلقائي
```bash
sudo certbot renew --dry-run
# إضافة cron job للتجديد التلقائي
sudo crontab -e
# أضف: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔥 الخطوة 8: إعداد Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 📊 الخطوة 9: المراقبة والصيانة

### 9.1 مراقبة PM2
```bash
pm2 status
pm2 logs
pm2 monit
```

### 9.2 مراقبة النظام
```bash
htop
df -h
free -m
```

### 9.3 سجلات Nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 9.4 سجلات PostgreSQL
```bash
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

---

## 🔄 الخطوة 10: التحديثات المستقبلية

### سكريبت التحديث
```bash
nano /var/www/delivery-app/deploy.sh
```

```bash
#!/bin/bash
set -e

echo "🚀 بدء التحديث..."

cd /var/www/delivery-app

# سحب التحديثات
echo "📥 سحب التحديثات من Git..."
git pull origin main

# تثبيت dependencies جديدة
echo "📦 تثبيت Dependencies..."
npm install

# بناء المشروع
echo "🔨 بناء المشروع..."
npm run build

# إعادة تشغيل PM2
echo "🔄 إعادة تشغيل التطبيق..."
pm2 reload all

echo "✅ تم التحديث بنجاح!"
```

```bash
chmod +x /var/www/delivery-app/deploy.sh
```

### للتحديث:
```bash
./deploy.sh
```

---

## 🐳 بديل: Docker Deployment

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: delivery-postgres
    environment:
      POSTGRES_DB: delivery_app
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./src/lib/database-setup.sql:/docker-entrypoint-initdb.d/setup.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: delivery-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: delivery-frontend
    environment:
      - NODE_ENV=production
      - POSTGRES_URL=postgresql://admin:${DB_PASSWORD}@postgres:5432/delivery_app
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
    ports:
      - "5000:5000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: delivery-backend
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://admin:${DB_PASSWORD}@postgres:5432/delivery_app
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: delivery-nginx
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### تشغيل Docker
```bash
docker-compose up -d
```

---

## ✅ قائمة التحقق النهائية

### قبل النشر
- [ ] تغيير كلمات المرور الافتراضية
- [ ] إعداد متغيرات البيئة
- [ ] اختبار الاتصال بقاعدة البيانات
- [ ] اختبار Redis
- [ ] بناء المشروع بنجاح

### بعد النشر
- [ ] التحقق من عمل الموقع
- [ ] التحقق من SSL
- [ ] اختبار API endpoints
- [ ] اختبار توليد PDF
- [ ] إعداد النسخ الاحتياطي
- [ ] إعداد المراقبة

### الأمان
- [ ] تفعيل Firewall
- [ ] تعطيل root SSH
- [ ] إعداد fail2ban
- [ ] تحديث النظام بانتظام

---

## 📞 الدعم

### مشاكل شائعة

#### 1. خطأ في الاتصال بقاعدة البيانات
```bash
# تحقق من تشغيل PostgreSQL
sudo systemctl status postgresql

# تحقق من الاتصال
psql -h localhost -U admin -d delivery_app -c "SELECT 1"
```

#### 2. خطأ في Puppeteer
```bash
# تحقق من Chromium
which chromium-browser

# تثبيت dependencies
sudo apt install -y chromium-browser
```

#### 3. خطأ 502 Bad Gateway
```bash
# تحقق من PM2
pm2 status
pm2 logs

# تحقق من Nginx
sudo nginx -t
sudo systemctl status nginx
```

---

## 🎯 الخلاصة

بعد اتباع هذه الخطوات، سيكون لديك:

✅ VPS مُعد بالكامل
✅ PostgreSQL + Redis يعملان
✅ المشروع منشور ويعمل
✅ SSL/HTTPS مُفعّل
✅ Nginx كـ reverse proxy
✅ PM2 لإدارة العمليات
✅ نظام تحديث سهل

**جاهز للإنتاج!** 🚀

---

**تاريخ الإنشاء:** 25 ديسمبر 2025
**المطور:** صلاح الوحيدي