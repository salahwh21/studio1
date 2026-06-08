const db = require('./src/config/database');

const terminalStatuses = [
  'مكتمل',
  'مكتمل إرجاع تاجر',
  'مرجع للتاجر مكتمل',
  'ملغي',
  'مرتجع',
  'مرجع للتاجر',
  'مرجع للفرع',
  'تم استلام المال في الفرع',
  'تم محاسبة التاجر',
  'مؤرشف'
];

db.query(
  `UPDATE orders SET previous_driver = driver, driver = NULL WHERE status = ANY($1) AND driver IS NOT NULL`,
  [terminalStatuses]
).then(r => {
  console.log(`Migrated ${r.rowCount} old orders`);
  process.exit(0);
}).catch(console.error);
