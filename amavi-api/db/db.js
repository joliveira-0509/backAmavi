const mysql = require('mysql2/promise'); // Certifique-se de usar mysql2/promise

const connection = mysql.createPool({ // Usar createPool para melhor gerenciamento de conexões
  host: 'icskko8k08w0ss88kws80s0o',
  user: 'amavi',
  password: '12345678',
  database: 'amavi_bd',
  port:3306
});

module.exports = connection;
