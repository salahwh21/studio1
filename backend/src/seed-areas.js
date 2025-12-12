const db = require('./config/database');

// All cities and regions data
const citiesData = require('../../src/store/areas-store.ts');

async function seedAreas() {
    console.log('🚀 Starting to seed cities and areas...');
    
    try {
        // First, let's manually define the data since we can't easily parse TypeScript
        const cities = [
            {
                id: "CITY_AMM",
                name: "عمان",
                regions: [] // Will be populated from areas-store
            },
            {
                id: "CITY_IRB",
                name: "إربد",
                regions: []
            },
            {
                id: "CITY_ZAR",
                name: "الزرقاء",
                regions: []
            },
            {
                id: "CITY_AQB",
                name: "العقبة",
                regions: []
            },
            {
                id: "CITY_SLT",
                name: "السلط",
                regions: []
            },
            {
                id: "CITY_MAD",
                name: "مادبا",
                regions: []
            },
            {
                id: "CITY_KRK",
                name: "الكرك",
                regions: []
            },
            {
                id: "CITY_TFL",
                name: "الطفيلة",
                regions: []
            },
            {
                id: "CITY_MAN",
                name: "معان",
                regions: []
            },
            {
                id: "CITY_AJL",
                name: "عجلون",
                regions: []
            },
            {
                id: "CITY_JRS",
                name: "جرش",
                regions: []
            },
            {
                id: "CITY_MFQ",
                name: "المفرق",
                regions: []
            }
        ];

        let citiesInserted = 0;
        let areasInserted = 0;

        for (const city of cities) {
            try {
                // Check if city exists
                const existingCity = await db.query('SELECT id FROM cities WHERE id = $1', [city.id]);
                
                if (existingCity.rows.length === 0) {
                    await db.query(
                        'INSERT INTO cities (id, name) VALUES ($1, $2)',
                        [city.id, city.name]
                    );
                    citiesInserted++;
                    console.log(`✅ Inserted city: ${city.name}`);
                }
            } catch (err) {
                console.error(`❌ Error inserting city ${city.name}:`, err.message);
            }
        }

        console.log(`\n✅ Seeding complete!`);
        console.log(`   - Cities inserted: ${citiesInserted}`);
        console.log(`   - Areas inserted: ${areasInserted}`);
        console.log(`\n⚠️  Note: Areas data needs to be extracted from areas-store.ts`);
        console.log(`   Please run the full seed script after extracting the data.`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        process.exit(0);
    }
}

seedAreas();
