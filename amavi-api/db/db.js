const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: 'icskko8k08w0ss88kws80s0o',   // ✅ Coloque aqui o host completo
  user: 'amavi',
  password: '12345678',
  database: 'amavi_bd',
  port: 3306
});

module.exports = connection;
