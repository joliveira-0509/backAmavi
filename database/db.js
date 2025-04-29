import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0
});

pool.getConnection()
  .then(() => console.log('✅ Conexão com o banco de dados estabelecida com sucesso!'))
  .catch((err) => console.error('❌ Erro ao conectar com o banco de dados:', err));

export default pool;
