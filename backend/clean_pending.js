const db = require('./src/config/database');

db.query(
  `UPDATE orders SET previous_driver = driver, driver = NULL WHERE status = 'بالانتظار' AND driver IS NOT NULL`
).then(r => {
  console.log(`Migrated ${r.rowCount} 'بالانتظار' orders`);
  process.exit(0);
}).catch(console.error);
