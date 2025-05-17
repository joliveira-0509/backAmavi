const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: 'icskko8k08w0ss88kws80s0o', // Seu host ou IP do banco
  user: 'seu_usuario',              // Coloque seu usuário do MySQL aqui
  password: 'sua_senha',            // Sua senha do MySQL
  database: 'seu_banco',            // Nome do seu banco de dados
  port: 3306                       // Porta padrão do MySQL
});

module.exports = connection;
