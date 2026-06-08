const jwt = require('jsonwebtoken');
require('dotenv').config();
const token = jwt.sign({ id: 1, roleId: 'admin', name: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
fetch('http://localhost:3001/api/orders', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
}).then(r => r.text().then(t => ({status: r.status, text: t})))
  .then(console.log)
  .catch(console.error);
