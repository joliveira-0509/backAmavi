const mysql = require('mysql2/promise'); // Certifique-se de usar mysql2/promise

const connection = mysql.createPool({ // Usar createPool para melhor gerenciamento de conexões
  host: '200.129.130.149',
  user: 'amavi',
  password: '12345678',
  database: 'amavi_bd',
  port: 20002
});

module.exports = connection;
