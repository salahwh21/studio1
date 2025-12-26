# 🔗 توحيد النظام مع قاعدة البيانات المركزية

## 📋 نظرة عامة

تم توحيد النظام ليستخدم قاعدة بيانات PostgreSQL مركزية مع Redis للتخزين المؤقت، مما يضمن:

- **أداء أفضل** مع التخزين المؤقت الذكي
- **موثوقية عالية** مع PostgreSQL
- **قابلية التوسع** مع Redis
- **API موحد** لجميع العمليات

## 🏗️ البنية الجديدة

```
src/
├── lib/
│   ├── db.ts                 # اتصال قاعدة البيانات المركزي
│   ├── database-service.ts   # خدمات قاعدة البيانات
│   └── database-setup.sql    # إعداد الجداول
├── app/api/
│   ├── pdf/route.ts         # API موحد للـ PDF
│   └── health/route.ts      # فحص صحة النظام
└── services/
    └── pdf-service.ts       # خدمة PDF محدثة
```

## 🚀 التشغيل السريع

### 1. تشغيل الخدمات المطلوبة

```bash
# PostgreSQL
sudo systemctl start postgresql
# أو
pg_ctl start

# Redis
sudo systemctl start redis
# أو
redis-server
```

### 2. تشغيل سكريبت التوحيد

```powershell
# Windows PowerShell
.\unify-system.ps1
```

```bash
# Linux/Mac
chmod +x unify-system.sh
./unify-system.sh
```

### 3. تشغيل النظام

```bash
npm run dev
```

## 🔧 الإعدادات

### متغيرات البيئة (.env.local)

```env
# قاعدة البيانات المركزية
POSTGRES_URL="postgresql://admin:delivery123@localhost:5432/delivery_app"
REDIS_URL="redis://localhost:6379"

# باقي الإعدادات...
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### إعداد قاعدة البيانات

```sql
-- إنشاء قاعدة البيانات
CREATE DATABASE delivery_app;
CREATE USER admin WITH PASSWORD 'delivery123';
GRANT ALL PRIVILEGES ON DATABASE delivery_app TO admin;

-- تشغيل سكريبت الإعداد
psql -h localhost -U admin -d delivery_app -f src/lib/database-setup.sql
```

## 📊 استخدام قاعدة البيانات

### في المكونات

```typescript
import { OrdersDatabase } from '@/lib/database-service';

// جلب جميع الطلبات
const orders = await OrdersDatabase.getAllOrders();

// إضافة طلب جديد
const newOrder = await OrdersDatabase.createOrder(orderData);

// تحديث طلب
const updatedOrder = await OrdersDatabase.updateOrder(id, updates);
```

### في API Routes

```typescript
import { DatabaseService } from '@/lib/db';

export async function GET() {
  const result = await DatabaseService.query(
    'SELECT * FROM orders WHERE status = $1',
    ['بالانتظار']
  );
  
  return NextResponse.json(result.rows);
}
```

## 🔍 مراقبة النظام

### فحص صحة النظام

```bash
curl http://localhost:5000/api/health
```

**استجابة صحية:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-25T10:00:00.000Z",
  "services": {
    "postgresql": "connected",
    "redis": "connected"
  }
}
```

### مراقبة الأداء

```typescript
// في المكونات
import { checkDatabaseHealth } from '@/lib/db';

const health = await checkDatabaseHealth();
console.log('Database Status:', health);
```

## 📈 التخزين المؤقت (Caching)

### استراتيجية التخزين المؤقت

- **الطلبات**: 5 دقائق للقائمة الكاملة، 10 دقائق للطلب الواحد
- **الإعدادات**: ساعة واحدة
- **البيانات الثابتة**: 24 ساعة

### إدارة التخزين المؤقت

```typescript
import { DatabaseService } from '@/lib/db';

// حفظ في التخزين المؤقت
await DatabaseService.setCache('key', data, 3600); // ساعة واحدة

// جلب من التخزين المؤقت
const cached = await DatabaseService.getCache('key');

// مسح نمط معين
await DatabaseService.clearCachePattern('orders:*');
```

## 🔄 الترحيل من النظام القديم

### 1. نسخ البيانات الموجودة

```typescript
// مثال لترحيل البيانات من localStorage
const oldOrders = JSON.parse(localStorage.getItem('orders') || '[]');

for (const order of oldOrders) {
  await OrdersDatabase.createOrder(order);
}
```

### 2. تحديث المكونات

```typescript
// قبل التوحيد
const [orders, setOrders] = useState([]);
useEffect(() => {
  const saved = localStorage.getItem('orders');
  if (saved) setOrders(JSON.parse(saved));
}, []);

// بعد التوحيد
const [orders, setOrders] = useState([]);
useEffect(() => {
  OrdersDatabase.getAllOrders().then(setOrders);
}, []);
```

## 🛠️ استكشاف الأخطاء

### مشاكل شائعة

#### 1. فشل الاتصال بـ PostgreSQL

```bash
# تحقق من تشغيل الخدمة
sudo systemctl status postgresql

# تحقق من المنفذ
netstat -an | grep 5432

# اختبار الاتصال
psql -h localhost -U admin -d delivery_app -c "SELECT 1"
```

#### 2. فشل الاتصال بـ Redis

```bash
# تحقق من تشغيل الخدمة
sudo systemctl status redis

# اختبار الاتصال
redis-cli ping
```

#### 3. مشاكل الأذونات

```sql
-- منح الأذونات المطلوبة
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;
```

### سجلات الأخطاء

```typescript
// تفعيل السجلات المفصلة
process.env.DEBUG = 'true';

// مراقبة الاستعلامات
import { pool } from '@/lib/db';
pool.on('error', (err) => {
  console.error('Database error:', err);
});
```

## 📚 API المتاح

### الطلبات

- `GET /api/orders` - جلب جميع الطلبات
- `POST /api/orders` - إضافة طلب جديد
- `PUT /api/orders/:id` - تحديث طلب
- `DELETE /api/orders/:id` - حذف طلب
- `GET /api/orders/search?q=query` - البحث في الطلبات

### PDF

- `POST /api/pdf` - توليد PDF من HTML
- `GET /api/pdf` - فحص صحة خدمة PDF

### النظام

- `GET /api/health` - فحص صحة جميع الخدمات

## 🔒 الأمان

### حماية قاعدة البيانات

```sql
-- إنشاء مستخدم محدود الصلاحيات للتطبيق
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
```

### حماية Redis

```bash
# في redis.conf
requirepass your_redis_password
bind 127.0.0.1
```

### متغيرات البيئة الآمنة

```env
# استخدم كلمات مرور قوية في الإنتاج
POSTGRES_URL="postgresql://app_user:secure_password@localhost:5432/delivery_app"
REDIS_URL="redis://:redis_password@localhost:6379"
```

## 📊 الأداء والتحسين

### فهرسة قاعدة البيانات

```sql
-- فهارس محسنة للأداء
CREATE INDEX CONCURRENTLY idx_orders_status_date ON orders(status, date);
CREATE INDEX CONCURRENTLY idx_orders_merchant_date ON orders(merchant, date);
CREATE INDEX CONCURRENTLY idx_orders_search ON orders USING gin(to_tsvector('arabic', recipient || ' ' || address));
```

### تحسين Redis

```bash
# في redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## 🚀 النشر في الإنتاج

### Docker Compose

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: delivery_app
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: delivery123
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./src/lib/database-setup.sql:/docker-entrypoint-initdb.d/setup.sql
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes

  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      POSTGRES_URL: postgresql://admin:delivery123@postgres:5432/delivery_app
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

### متغيرات الإنتاج

```env
NODE_ENV=production
POSTGRES_URL=postgresql://user:password@db-host:5432/delivery_app
REDIS_URL=redis://redis-host:6379
```

## 📞 الدعم

### المطور
- **الاسم:** صلاح الوحيدي
- **البريد:** admin@alwameed.com

### الموارد
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**تم التحديث:** 25 ديسمبر 2025  
**الإصدار:** 1.0.0  
**الحالة:** مكتمل ✅