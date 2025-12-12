const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// قراءة البيانات من الملف
const fullCitiesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'full-cities-data.json'), 'utf8')
);

async function importFullCities() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 بدء استيراد القائمة الكاملة للمدن والمناطق...\n');
    await client.query('BEGIN');

    // حذف البيانات القديمة
    console.log('🗑️  حذف البيانات القديمة...');
    await client.query('DELETE FROM regions');
    await client.query('DELETE FROM cities');
    console.log('✅ تم حذف البيانات القديمة\n');

    let totalCities = 0;
    let totalRegions = 0;

    // استيراد كل مدينة ومناطقها
    for (const city of fullCitiesData) {
      // إضافة المدينة
      await client.query(
        `INSERT INTO cities (id, name) VALUES ($1, $2)`,
        [city.id, city.name]
      );
      totalCities++;

      // إضافة المناطق
      for (const region of city.regions) {
        await client.query(
          `INSERT INTO regions (id, name, city_id) VALUES ($1, $2, $3)`,
          [region.id, region.name, city.id]
        );
        totalRegions++;
      }

      console.log(`✅ ${city.name}: ${city.regions.length} منطقة`);
    }

    await client.query('COMMIT');
    
    console.log('\n🎉 تم استيراد جميع البيانات بنجاح!');
    console.log(`📊 المجموع: ${totalCities} مدينة، ${totalRegions} منطقة`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ خطأ في الاستيراد:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

importFullCities().catch(console.error);
