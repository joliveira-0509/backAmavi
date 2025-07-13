const db = require('../db/db');

const AcessosModel = {
  // Insere um novo acesso com o IP fornecido
  async registrar(ip) {
    const sql = 'INSERT INTO Acessos (ip) VALUES (?)';
    await db.execute(sql, [ip]);
  }
};

module.exports = AcessosModel;