require('dotenv').config();
const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: process.env.DB_HOST,         // Host do banco
  user: process.env.DB_USER,         // Usuário do MySQL
  password: process.env.DB_PASSWORD, // Senha do MySQL
  database: process.env.DB_NAME,     // Nome do banco de dados
  port: process.env.DB_PORT          // Porta do MySQL
});

module.exports = connection;
