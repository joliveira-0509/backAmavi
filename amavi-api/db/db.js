const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: '200.129.130.149',         // Host do banco
  user: 'amavi',                   // Usuário do MySQL
  password: '12345678',            // Senha do MySQL
  database: 'amavi_bd',            // Nome do banco de dados
  port: 20002                       // Porta padrão do MySQL
});

module.exports = connection;
