const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: 'icskko8k08w0ss88kws80s0o', // Host do banco
  user: 'amavi',                   // Usuário do MySQL
  password: '12345678',            // Senha do MySQL
  database: 'amavi_bd',            // Nome do banco de dados
  port: 3306                       // Porta padrão do MySQL
});

module.exports = connection;
