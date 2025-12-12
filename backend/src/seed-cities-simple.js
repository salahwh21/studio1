const db = require('./config/database');

// Main Jordanian cities
const cities = [
    { id: "CITY_AMM", name: "عمان" },
    { id: "CITY_IRB", name: "إربد" },
    { id: "CITY_ZAR", name: "الزرقاء" },
    { id: "CITY_AQB", name: "العقبة" },
    { id: "CITY_SLT", name: "السلط" },
    { id: "CITY_MAD", name: "مادبا" },
    { id: "CITY_KRK", name: "الكرك" },
    { id: "CITY_TFL", name: "الطفيلة" },
    { id: "CITY_MAN", name: "معان" },
    { id: "CITY_AJL", name: "عجلون" },
    { id: "CITY_JRS", name: "جرش" },
    { id: "CITY_MFQ", name: "المفرق" }
];

async function seedCities() {
    console.log('🚀 Starting to seed cities...');
    
    try {
        let inserted = 0;
        let skipped = 0;

        for (const city of cities) {
            try {
                const existing = await db.query('SELECT id FROM cities WHERE id = $1', [city.id]);
                
                if (existing.rows.length === 0) {
                    await db.query(
                        'INSERT INTO cities (id, name) VALUES ($1, $2)',
                        [city.id, city.name]
                    );
                    inserted++;
                    console.log(`✅ Inserted: ${city.name}`);
                } else {
                    skipped++;
                }
            } catch (err) {
                console.error(`❌ Error inserting ${city.name}:`, err.message);
            }
        }

        console.log(`\n✅ Seeding complete!`);
        console.log(`   - Inserted: ${inserted} cities`);
        console.log(`   - Skipped: ${skipped} cities`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        process.exit(0);
    }
}

seedCities();
