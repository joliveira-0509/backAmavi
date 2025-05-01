const mysql = require('mysql2/promise'); // Certifique-se de usar mysql2/promise

const connection = mysql.createPool({ // Usar createPool para melhor gerenciamento de conexões
  host: 'localhost',
  user: 'amavi',
  password: 'Mnb2711@',
  database: 'amavi_bd',
  port: 3306
});

module.exports = connection;
