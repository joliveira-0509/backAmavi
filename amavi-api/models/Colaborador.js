const db = require('../db/db');

const ColaboradorModel = {
  async cadastrar(nome, cargo, email, telefone, foto_url, isAdmin = false, senha = null) {
    const sql = `
      INSERT INTO Colaborador (nome, cargo, email, telefone, foto_url, isAdmin, senha)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      nome,
      cargo,
      email,
      telefone,
      foto_url,
      isAdmin,
      senha,
    ]);
    return result.insertId;
  },

  async listarTodos() {
    const sql = `SELECT id, nome, cargo, email, telefone, isAdmin, criado_em FROM Colaborador`;
    const [rows] = await db.execute(sql);
    return rows;
  },

  async buscarPorId(id) {
    const sql = `SELECT id, nome, cargo, email, telefone, isAdmin, criado_em FROM Colaborador WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  },

  async buscarPorEmail(email) {
    const sql = `SELECT * FROM Colaborador WHERE email = ?`;
    const [rows] = await db.execute(sql, [email]);
    return rows[0] || null;
  },

  async atualizar(id, nome, cargo, email, telefone, foto_url) {
    const sql = `
      UPDATE Colaborador SET nome = ?, cargo = ?, email = ?, telefone = ?, foto_url = ?
      WHERE id = ?`;
    await db.execute(sql, [nome, cargo, email, telefone, foto_url, id]);
  },

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

  async deletar(id) {
    const sql = `DELETE FROM Colaborador WHERE id = ?`;
    await db.execute(sql, [id]);
  }
};

module.exports = ColaboradorModel;