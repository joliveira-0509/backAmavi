const db = require('../db/db');

const ColaboradorModel = {
  // Cadastrar novo colaborador
  async cadastrar(nome, cargo, email, telefone, foto_url) {
    const sql = `INSERT INTO Colaborador (nome, cargo, email, telefone, foto_url) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [nome, cargo, email, telefone, foto_url]);
    return result.insertId;
  },

  // Buscar todos os colaboradores
  async listarTodos() {
    const sql = `SELECT id, nome, cargo, email, telefone FROM Colaborador`; // Exclui foto_url para performance
    const [rows] = await db.execute(sql);
    return rows;
  },

  // Buscar colaborador por ID
  async buscarPorId(id) {
    const sql = `SELECT id, nome, cargo, email, telefone FROM Colaborador WHERE id = ?`; // Exclui foto_url
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  },

  // Buscar foto_url por ID
  async buscarFotoPorId(id) {
    const sql = `SELECT foto_url FROM Colaborador WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0]?.foto_url || null;
  },

  // Atualizar colaborador (completo)
  async atualizar(id, nome, cargo, email, telefone, foto_url) {
    const sql = `UPDATE Colaborador SET nome = ?, cargo = ?, email = ?, telefone = ?, foto_url = ? WHERE id = ?`;
    await db.execute(sql, [nome, cargo, email, telefone, foto_url, id]);
  },

  // Atualização parcial do colaborador
  async atualizarParcial(id, dados) {
    const campos = Object.keys(dados);
    const valores = Object.values(dados);

    if (campos.length === 0) {
      throw new Error('Nenhum campo para atualizar.');
    }

    const setString = campos.map(campo => `${campo} = ?`).join(', ');
    const sql = `UPDATE Colaborador SET ${setString} WHERE id = ?`;
    await db.execute(sql, [...valores, id]);
  },

  // Deletar colaborador
  async deletar(id) {
    const sql = `DELETE FROM Colaborador WHERE id = ?`;
    await db.execute(sql, [id]);
  }
};

module.exports = ColaboradorModel;