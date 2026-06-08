const db = require('./src/config/database');
db.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1', ['orders'])
  .then(r => { console.log(r.rows); process.exit(0); })
  .catch(console.error);
