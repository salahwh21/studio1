const db = require('./src/config/database'); 
let whereClause = 'WHERE 1=1'; 
let params = []; 
let paramIndex = 1; 
let safeSort = 'created_at'; 
let safeDir = 'DESC'; 
let limit=1000; 
let offset=0; 
db.query(`SELECT COUNT(*) as count FROM orders ${whereClause}`, [...params])
  .then(c => { 
    return db.query(`SELECT * FROM orders ${whereClause} ORDER BY ${safeSort} ${safeDir} LIMIT $${paramIndex++} OFFSET $${paramIndex}`, [...params, parseInt(limit), offset]); 
  })
  .then(res => { 
    console.log(res.rows.length); 
    process.exit(0); 
  })
  .catch(err => { 
    console.error(err); 
    process.exit(1); 
  });
