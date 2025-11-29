const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('Seeding database...');

    await client.query('BEGIN');

    const roles = [
      { id: 'admin', name: 'المدير العام', description: 'وصول كامل لجميع أجزاء النظام والإعدادات.', permissions: ['all'] },
      { id: 'supervisor', name: 'مشرف', description: 'يمكنه إدارة الطلبات والسائقين والتقارير.', permissions: ['dashboard:view', 'orders:view', 'orders:create', 'orders:edit'] },
      { id: 'customer_service', name: 'خدمة العملاء', description: 'يمكنه إضافة الطلبات ومتابعتها.', permissions: ['orders:view', 'orders:create'] },
      { id: 'driver', name: 'سائق', description: 'يستخدم تطبيق السائق لتحديث حالات الطلبات.', permissions: ['driver-app:use'] },
      { id: 'merchant', name: 'تاجر', description: 'يستخدم بوابة التجار لمتابعة الطلبات.', permissions: ['merchant-portal:use'] }
    ];

    for (const role of roles) {
      await client.query(
        `INSERT INTO roles (id, name, description, permissions, user_count)
         VALUES ($1, $2, $3, $4, 0)
         ON CONFLICT (id) DO UPDATE SET name = $2, description = $3, permissions = $4`,
        [role.id, role.name, role.description, role.permissions]
      );
    }
    console.log('Roles seeded');

    const statuses = [
      { id: 'STS_001', code: 'PENDING', name: 'بالانتظار', icon: 'Clock', color: '#607D8B', isActive: true },
      { id: 'STS_002', code: 'OUT_FOR_DELIVERY', name: 'جاري التوصيل', icon: 'Truck', color: '#1976D2', isActive: true },
      { id: 'STS_003', code: 'DELIVERED', name: 'تم التوصيل', icon: 'PackageCheck', color: '#2E7D32', isActive: true },
      { id: 'STS_004', code: 'POSTPONED', name: 'مؤجل', icon: 'CalendarClock', color: '#F9A825', isActive: true },
      { id: 'STS_005', code: 'RETURNED', name: 'مرتجع', icon: 'Undo2', color: '#8E24AA', isActive: true },
      { id: 'STS_006', code: 'CANCELLED', name: 'ملغي', icon: 'XCircle', color: '#D32F2F', isActive: true },
      { id: 'STS_007', code: 'MONEY_RECEIVED', name: 'تم استلام المال في الفرع', icon: 'HandCoins', color: '#004D40', isActive: true },
      { id: 'STS_008', code: 'COMPLETED', name: 'مكتمل', icon: 'CheckCheck', color: '#1B5E20', isActive: true },
      { id: 'STS_012', code: 'BRANCH_RETURNED', name: 'مرجع للفرع', icon: 'Building', color: '#7e22ce', isActive: true },
      { id: 'STS_013', code: 'MERCHANT_RETURNED', name: 'مرجع للتاجر', icon: 'Undo2', color: '#581c87', isActive: true }
    ];

    for (const status of statuses) {
      await client.query(
        `INSERT INTO statuses (id, code, name, icon, color, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET code = $2, name = $3, icon = $4, color = $5, is_active = $6`,
        [status.id, status.code, status.name, status.icon, status.color, status.isActive]
      );
    }
    console.log('Statuses seeded');

    const cities = [
      { id: 'CITY_AMM', name: 'عمان' },
      { id: 'CITY_IRB', name: 'إربد' },
      { id: 'CITY_ZRQ', name: 'الزرقاء' }
    ];

    for (const city of cities) {
      await client.query(
        `INSERT INTO cities (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
        [city.id, city.name]
      );
    }
    console.log('Cities seeded');

    const regions = [
      { id: 'REG_AMM_001', name: 'تلاع العلي', cityId: 'CITY_AMM' },
      { id: 'REG_AMM_002', name: 'عبدون', cityId: 'CITY_AMM' },
      { id: 'REG_AMM_003', name: 'الصويفية', cityId: 'CITY_AMM' },
      { id: 'REG_AMM_004', name: 'دابوق', cityId: 'CITY_AMM' },
      { id: 'REG_AMM_005', name: 'خلدا', cityId: 'CITY_AMM' },
      { id: 'REG_AMM_006', name: 'الجاردنز', cityId: 'CITY_AMM' },
      { id: 'REG_AMM_007', name: 'مرج الحمام', cityId: 'CITY_AMM' },
      { id: 'REG_AMM_008', name: 'الجبيهة', cityId: 'CITY_AMM' },
      { id: 'REG_IRB_001', name: 'الحي الشرقي', cityId: 'CITY_IRB' },
      { id: 'REG_IRB_002', name: 'شارع الجامعة', cityId: 'CITY_IRB' },
      { id: 'REG_ZRQ_001', name: 'جبل طارق', cityId: 'CITY_ZRQ' },
      { id: 'REG_ZRQ_002', name: 'الهاشمية', cityId: 'CITY_ZRQ' }
    ];

    for (const region of regions) {
      await client.query(
        `INSERT INTO regions (id, name, city_id) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
        [region.id, region.name, region.cityId]
      );
    }
    console.log('Regions seeded');

    const hashedPassword = await bcrypt.hash('123', 10);

    const users = [
      { id: 'user-admin', name: 'admin', email: 'admin@alwameed.com', roleId: 'admin', storeName: 'Admin' },
      { id: 'driver-1', name: 'ابو العبد', email: '0799754316', roleId: 'driver', storeName: 'ابو العبد' },
      { id: 'driver-2', name: 'محمد سويد', email: '0799780790', roleId: 'driver', storeName: 'محمد سويد' },
      { id: 'merchant-1', name: 'جنان صغيرة', email: '0786633891', roleId: 'merchant', storeName: 'جنان صغيرة' },
      { id: 'merchant-2', name: 'Brands of less', email: '0775343162', roleId: 'merchant', storeName: 'Brands of less' }
    ];

    for (const user of users) {
      await client.query(
        `INSERT INTO users (id, name, email, password, role_id, store_name)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [user.id, user.name, user.email, hashedPassword, user.roleId, user.storeName]
      );
      
      await client.query(
        `UPDATE roles SET user_count = user_count + 1 WHERE id = $1`,
        [user.roleId]
      );
    }
    console.log('Users seeded');

    const sampleOrders = [];
    const merchants = ['جنان صغيرة', 'Brands of less'];
    const drivers = ['ابو العبد', 'محمد سويد'];
    const orderStatuses = ['بالانتظار', 'جاري التوصيل', 'تم التوصيل', 'مؤجل'];

    for (let i = 1; i <= 20; i++) {
      sampleOrders.push({
        id: `ORD-${i}`,
        orderNumber: i,
        recipient: ['محمد جاسم', 'أحمد محمود', 'فاطمة علي', 'خالد وليد'][i % 4],
        phone: `079${1234567 + i}`,
        address: ['تلاع العلي', 'عبدون', 'الصويفية', 'خلدا'][i % 4],
        city: 'عمان',
        region: ['تلاع العلي', 'عبدون', 'الصويفية', 'خلدا'][i % 4],
        status: orderStatuses[i % 4],
        driver: drivers[i % 2],
        merchant: merchants[i % 2],
        cod: 35.50 + (i * 5),
        itemPrice: 34.00 + (i * 5),
        deliveryFee: 1.50,
        date: `2024-07-${String(1 + (i % 28)).padStart(2, '0')}`
      });
    }

    for (const order of sampleOrders) {
      await client.query(
        `INSERT INTO orders (id, order_number, recipient, phone, address, city, region, status, driver, merchant, cod, item_price, delivery_fee, date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO NOTHING`,
        [order.id, order.orderNumber, order.recipient, order.phone, order.address, order.city, order.region, order.status, order.driver, order.merchant, order.cod, order.itemPrice, order.deliveryFee, order.date]
      );
    }
    console.log('Sample orders seeded');

    await client.query('COMMIT');
    console.log('Database seeding completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
