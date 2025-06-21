const db = require('../db/db');

const DocumentacaoModel = {
  // Cadastrar nova documentação
  async cadastrar(id_usuario, inscricao, arquivo_url) {
    const sql = `INSERT INTO Documentacao (id_usuario, inscricao, arquivo_url) VALUES (?, ?, ?)`;
    const [result] = await db.execute(sql, [id_usuario, inscricao, arquivo_url]);
    return result.insertId;
  },

  // Buscar todas as documentações
  async listarTodas() {
    const sql = `SELECT id, id_usuario, inscricao FROM Documentacao`; // Exclui arquivo_url para performance
    const [rows] = await db.execute(sql);
    return rows;
  },

  // Buscar documentação por ID
  async buscarPorId(id) {
    const sql = `SELECT id, id_usuario, inscricao FROM Documentacao WHERE id = ?`; // Exclui arquivo_url
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  },

  // Buscar arquivo_url por ID
  async buscarDocumentoPorId(id) {
    const sql = `SELECT arquivo_url FROM Documentacao WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0]?.arquivo_url || null;
  },

  // Buscar documentação por ID do usuário
  async buscarPorUsuario(id_usuario) {
    const sql = `SELECT id, id_usuario, inscricao FROM Documentacao WHERE id_usuario = ?`; // Exclui arquivo_url
    const [rows] = await db.execute(sql, [id_usuario]);
    return rows;
  },

  // Atualizar documentação (completo)
  async atualizar(id, id_usuario, inscricao, arquivo_url) {
    const sql = `UPDATE Documentacao SET id_usuario = ?, inscricao = ?, arquivo_url = ? WHERE id = ?`;
    await db.execute(sql, [id_usuario, inscricao, arquivo_url, id]);
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