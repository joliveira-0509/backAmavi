const db = require('../db/db');

const DocumentacaoModel = {
  // Cadastrar nova documentação
  async cadastrar(id_usuario, inscricao, documento_blob) {
    const sql = `INSERT INTO Documentacao (id_usuario, inscricao, documento_blob) VALUES (?, ?, ?)`;
    const [result] = await db.execute(sql, [id_usuario, inscricao, documento_blob]);
    return result.insertId;
  },

  // Buscar todas as documentações
  async listarTodas() {
    const sql = `SELECT id, id_usuario, inscricao FROM Documentacao`; // Exclui documento_blob para performance
    const [rows] = await db.execute(sql);
    return rows;
  },

  // Buscar documentação por ID
  async buscarPorId(id) {
    const sql = `SELECT id, id_usuario, inscricao FROM Documentacao WHERE id = ?`; // Exclui documento_blob
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  },

  // Buscar documento_blob por ID
  async buscarDocumentoPorId(id) {
    const sql = `SELECT documento_blob FROM Documentacao WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0]?.documento_blob || null;
  },

  // Buscar documentação por ID do usuário
  async buscarPorUsuario(id_usuario) {
    const sql = `SELECT id, id_usuario, inscricao FROM Documentacao WHERE id_usuario = ?`; // Exclui documento_blob
    const [rows] = await db.execute(sql, [id_usuario]);
    return rows;
  },

  // Atualizar documentação (completo)
  async atualizar(id, id_usuario, inscricao, documento_blob) {
    const sql = `UPDATE Documentacao SET id_usuario = ?, inscricao = ?, documento_blob = ? WHERE id = ?`;
    await db.execute(sql, [id_usuario, inscricao, documento_blob, id]);
  },

  // Atualização parcial da documentação
  async atualizarParcial(id, dados) {
    const campos = Object.keys(dados);
    const valores = Object.values(dados);

    if (campos.length === 0) {
      throw new Error('Nenhum campo para atualizar.');
    }

    const setString = campos.map(campo => `${campo} = ?`).join(', ');
    const sql = `UPDATE Documentacao SET ${setString} WHERE id = ?`;
    await db.execute(sql, [...valores, id]);
  },

  // Deletar documentação
  async deletar(id) {
    const sql = `DELETE FROM Documentacao WHERE id = ?`;
    await db.execute(sql, [id]);
  }
};

module.exports = DocumentacaoModel;