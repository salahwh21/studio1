import { DatabaseService } from './db';
import type { Order } from '@/store/orders-store';

/**
 * خدمات قاعدة البيانات للطلبات - مركزية
 */
export class OrdersDatabase {
  // جلب جميع الطلبات
  static async getAllOrders(): Promise<Order[]> {
    const cacheKey = 'orders:all';
    
    // محاولة جلب من Cache أولاً
    const cached = await DatabaseService.getCache(cacheKey);
    if (cached) {
      return cached;
    }

    // جلب من قاعدة البيانات
    const result = await DatabaseService.query(`
      SELECT 
        id,
        order_number as "orderNumber",
        recipient,
        phone,
        address,
        city,
        region,
        cod,
        merchant,
        date::text,
        notes,
        source,
        reference_number as "referenceNumber",
        whatsapp,
        status,
        previous_status as "previousStatus",
        driver,
        item_price as "itemPrice",
        delivery_fee as "deliveryFee",
        additional_cost as "additionalCost",
        driver_fee as "driverFee",
        driver_additional_fare as "driverAdditionalFare"
      FROM orders 
      ORDER BY created_at DESC
    `);

    const orders = result.rows;
    
    // حفظ في Cache لمدة 5 دقائق
    await DatabaseService.setCache(cacheKey, orders, 300);
    
    return orders;
  }

  // إضافة طلب جديد
  static async createOrder(order: Omit<Order, 'id' | 'orderNumber'>): Promise<Order> {
    const result = await DatabaseService.query(`
      INSERT INTO orders (
        recipient, phone, address, city, region, cod, merchant, 
        date, notes, source, reference_number, whatsapp, status, 
        previous_status, driver, item_price, delivery_fee, 
        additional_cost, driver_fee, driver_additional_fare
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING 
        id,
        order_number as "orderNumber",
        recipient, phone, address, city, region, cod, merchant,
        date::text, notes, source, reference_number as "referenceNumber",
        whatsapp, status, previous_status as "previousStatus", driver,
        item_price as "itemPrice", delivery_fee as "deliveryFee",
        additional_cost as "additionalCost", driver_fee as "driverFee",
        driver_additional_fare as "driverAdditionalFare"
    `, [
      order.recipient, order.phone, order.address, order.city, order.region,
      order.cod, order.merchant, order.date, order.notes, order.source,
      order.referenceNumber, order.whatsapp, order.status, order.previousStatus,
      order.driver, order.itemPrice, order.deliveryFee, order.additionalCost,
      order.driverFee, order.driverAdditionalFare
    ]);

    const newOrder = result.rows[0];
    
    // مسح Cache
    await DatabaseService.clearCachePattern('orders:*');
    
    return newOrder;
  }

  // تحديث طلب
  static async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'orderNumber')
      .map((key, index) => {
        const dbKey = key === 'orderNumber' ? 'order_number' :
                     key === 'referenceNumber' ? 'reference_number' :
                     key === 'previousStatus' ? 'previous_status' :
                     key === 'itemPrice' ? 'item_price' :
                     key === 'deliveryFee' ? 'delivery_fee' :
                     key === 'additionalCost' ? 'additional_cost' :
                     key === 'driverFee' ? 'driver_fee' :
                     key === 'driverAdditionalFare' ? 'driver_additional_fare' : key;
        return `${dbKey} = $${index + 2}`;
      })
      .join(', ');

    const values = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'orderNumber')
      .map(key => (updates as any)[key]);

    const result = await DatabaseService.query(`
      UPDATE orders 
      SET ${setClause}
      WHERE id = $1
      RETURNING 
        id,
        order_number as "orderNumber",
        recipient, phone, address, city, region, cod, merchant,
        date::text, notes, source, reference_number as "referenceNumber",
        whatsapp, status, previous_status as "previousStatus", driver,
        item_price as "itemPrice", delivery_fee as "deliveryFee",
        additional_cost as "additionalCost", driver_fee as "driverFee",
        driver_additional_fare as "driverAdditionalFare"
    `, [id, ...values]);

    // مسح Cache
    await DatabaseService.clearCachePattern('orders:*');
    
    return result.rows[0];
  }

  // حذف طلب
  static async deleteOrder(id: string): Promise<void> {
    await DatabaseService.query('DELETE FROM orders WHERE id = $1', [id]);
    
    // مسح Cache
    await DatabaseService.clearCachePattern('orders:*');
  }

  // جلب طلب واحد
  static async getOrderById(id: string): Promise<Order | null> {
    const cacheKey = `orders:${id}`;
    
    // محاولة جلب من Cache
    const cached = await DatabaseService.getCache(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await DatabaseService.query(`
      SELECT 
        id,
        order_number as "orderNumber",
        recipient, phone, address, city, region, cod, merchant,
        date::text, notes, source, reference_number as "referenceNumber",
        whatsapp, status, previous_status as "previousStatus", driver,
        item_price as "itemPrice", delivery_fee as "deliveryFee",
        additional_cost as "additionalCost", driver_fee as "driverFee",
        driver_additional_fare as "driverAdditionalFare"
      FROM orders 
      WHERE id = $1
    `, [id]);

    const order = result.rows[0] || null;
    
    if (order) {
      // حفظ في Cache لمدة 10 دقائق
      await DatabaseService.setCache(cacheKey, order, 600);
    }
    
    return order;
  }

  // البحث في الطلبات
  static async searchOrders(query: string): Promise<Order[]> {
    const result = await DatabaseService.query(`
      SELECT 
        id,
        order_number as "orderNumber",
        recipient, phone, address, city, region, cod, merchant,
        date::text, notes, source, reference_number as "referenceNumber",
        whatsapp, status, previous_status as "previousStatus", driver,
        item_price as "itemPrice", delivery_fee as "deliveryFee",
        additional_cost as "additionalCost", driver_fee as "driverFee",
        driver_additional_fare as "driverAdditionalFare"
      FROM orders 
      WHERE 
        recipient ILIKE $1 OR 
        phone ILIKE $1 OR 
        address ILIKE $1 OR 
        merchant ILIKE $1 OR
        reference_number ILIKE $1
      ORDER BY created_at DESC
    `, [`%${query}%`]);

    return result.rows;
  }
}

/**
 * خدمات قاعدة البيانات للإعدادات
 */
export class SettingsDatabase {
  // جلب إعداد
  static async getSetting(key: string): Promise<any> {
    const cacheKey = `settings:${key}`;
    
    // محاولة جلب من Cache
    const cached = await DatabaseService.getCache(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await DatabaseService.query(
      'SELECT value FROM settings WHERE key = $1',
      [key]
    );

    const value = result.rows[0]?.value || null;
    
    if (value) {
      // حفظ في Cache لمدة ساعة
      await DatabaseService.setCache(cacheKey, value, 3600);
    }
    
    return value;
  }

  // حفظ إعداد
  static async setSetting(key: string, value: any): Promise<void> {
    await DatabaseService.query(`
      INSERT INTO settings (key, value) 
      VALUES ($1, $2)
      ON CONFLICT (key) 
      DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
    `, [key, JSON.stringify(value)]);

    // تحديث Cache
    await DatabaseService.setCache(`settings:${key}`, value, 3600);
  }

  // حذف إعداد
  static async deleteSetting(key: string): Promise<void> {
    await DatabaseService.query('DELETE FROM settings WHERE key = $1', [key]);
    
    // مسح من Cache
    await DatabaseService.deleteCache(`settings:${key}`);
  }
}